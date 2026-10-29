import express from 'express';
import { chromium, type Browser, type Page } from 'playwright-core';

type RunnerMode = 'api' | 'browser';

type BrowserStep =
  | { action: 'goto'; url: string }
  | { action: 'click'; selector: string }
  | { action: 'fill'; selector: string; value: string }
  | { action: 'press'; selector: string; key: string }
  | { action: 'waitForSelector'; selector: string; state?: 'attached' | 'visible' | 'hidden'; timeoutMs?: number }
  | { action: 'waitForText'; text: string; timeoutMs?: number }
  | { action: 'screenshot'; name?: string };

type RunnerCase = {
  id: string;
  name: string;
  mode?: RunnerMode;
  input?: string;
  expected?: string;
  api?: {
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    expectedStatus?: number;
    expectedText?: string;
  };
  browser?: {
    steps?: BrowserStep[];
    allowedHosts?: string[];
    finalUrlContains?: string;
    textContains?: string;
    ignoreHTTPSErrors?: boolean;
  };
};

type RunnerConfig = {
  endpoint?: string;
  method?: string;
  auth?: 'none' | 'bearer' | 'api-key';
  token?: string;
  timeout?: number;
  allowedHosts?: string[];
  headless?: boolean;
  ignoreHTTPSErrors?: boolean;
};

type RunnerResult = {
  id: string;
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  actual: string;
  trace: string[];
  finishedAt: string;
  screenshot?: string;
};

const port = Number(process.env.EVAL_RUNNER_PORT ?? 4174);
const defaultAllowedHosts = (process.env.EVAL_ALLOWED_HOSTS ?? 'localhost,127.0.0.1,example.com')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const app = express();
app.use(express.json({ limit: '8mb' }));
app.use((request, response, next) => {
  const origin = process.env.EVAL_CORS_ORIGIN ?? '*';
  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Headers', 'content-type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

const now = () => new Date().toISOString();

function normalizeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, '');
}

function isAllowedUrl(rawUrl: string, allowedHosts: string[]) {
  const url = new URL(rawUrl);
  if (!['http:', 'https:'].includes(url.protocol)) return false;
  const host = normalizeHost(url.hostname);
  return allowedHosts.some((allowed) => {
    const normalized = normalizeHost(allowed);
    return host === normalized || host.endsWith(`.${normalized}`);
  });
}

function resolveExecutablePath() {
  const configured = process.env.BROWSER_EXECUTABLE_PATH;
  if (configured) return configured;
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  if (process.platform === 'win32') {
    return `${process.env['PROGRAMFILES'] ?? 'C:\\Program Files'}\\Google\\Chrome\\Application\\chrome.exe`;
  }
  return '/usr/bin/google-chrome';
}

function getApiHeaders(config: RunnerConfig, testCase: RunnerCase) {
  const headers = { ...(testCase.api?.headers ?? {}) };
  if (!headers['content-type'] && testCase.api?.body !== undefined) headers['content-type'] = 'application/json';
  if (config.auth === 'bearer' && config.token) headers.authorization = `Bearer ${config.token}`;
  if (config.auth === 'api-key' && config.token) headers['x-api-key'] = config.token;
  return headers;
}

async function runApiCase(testCase: RunnerCase, config: RunnerConfig): Promise<RunnerResult> {
  const startedAt = Date.now();
  const endpoint = testCase.api?.endpoint || config.endpoint;
  if (!endpoint) throw new Error('接口用例缺少 endpoint');
  const url = new URL(endpoint);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('接口地址只支持 HTTP/HTTPS');

  const method = (testCase.api?.method || config.method || 'POST').toUpperCase();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, Number(config.timeout ?? 30) * 1000));
  const trace = ['请求已准备', `${method} ${url.origin}${url.pathname}`];

  try {
    const response = await fetch(url, {
      method,
      headers: getApiHeaders(config, testCase),
      body: method === 'GET' || method === 'HEAD' || testCase.api?.body === undefined ? undefined : JSON.stringify(testCase.api.body),
      signal: controller.signal,
    });
    const bodyText = await response.text();
    const expectedStatus = testCase.api?.expectedStatus ?? 200;
    const statusPassed = response.status === expectedStatus;
    const textPassed = !testCase.api?.expectedText || bodyText.includes(testCase.api.expectedText);
    trace.push(`HTTP ${response.status}`, statusPassed ? '状态码断言通过' : `状态码断言失败：期望 ${expectedStatus}`);
    if (testCase.api?.expectedText) trace.push(textPassed ? '响应文本断言通过' : '响应文本断言失败');
    const passed = statusPassed && textPassed;
    return {
      id: testCase.id,
      name: testCase.name,
      status: passed ? 'passed' : 'failed',
      duration: Date.now() - startedAt,
      actual: `接口返回 HTTP ${response.status}${textPassed ? '' : '，响应文本未匹配预期'}`,
      trace,
      finishedAt: now(),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function executeBrowserStep(page: Page, step: BrowserStep, allowedHosts: string[], defaultTimeout: number, screenshots: string[]) {
  if (step.action === 'goto') {
    if (!isAllowedUrl(step.url, allowedHosts)) throw new Error(`浏览器地址未在白名单中：${step.url}`);
    await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: defaultTimeout });
    return `打开页面：${step.url}`;
  }
  if (step.action === 'click') {
    await page.locator(step.selector).first().click({ timeout: defaultTimeout });
    return `点击元素：${step.selector}`;
  }
  if (step.action === 'fill') {
    await page.locator(step.selector).first().fill(step.value, { timeout: defaultTimeout });
    return `填写元素：${step.selector}`;
  }
  if (step.action === 'press') {
    await page.locator(step.selector).first().press(step.key, { timeout: defaultTimeout });
    return `按键操作：${step.selector} → ${step.key}`;
  }
  if (step.action === 'waitForSelector') {
    await page.locator(step.selector).first().waitFor({ state: step.state ?? 'visible', timeout: step.timeoutMs ?? defaultTimeout });
    return `元素断言通过：${step.selector}`;
  }
  if (step.action === 'waitForText') {
    await page.getByText(step.text, { exact: false }).first().waitFor({ state: 'visible', timeout: step.timeoutMs ?? defaultTimeout });
    return `文本断言通过：${step.text}`;
  }
  const buffer = await page.screenshot({ type: 'png', fullPage: true });
  screenshots.push(`data:image/png;base64,${buffer.toString('base64')}`);
  return `已截图${step.name ? `：${step.name}` : ''}`;
}

async function runBrowserCase(testCase: RunnerCase, config: RunnerConfig, browser: Browser): Promise<RunnerResult> {
  const startedAt = Date.now();
  const timeout = Math.max(1000, Number(config.timeout ?? 30) * 1000);
  const allowedHosts = [...new Set([...(config.allowedHosts ?? defaultAllowedHosts), ...(testCase.browser?.allowedHosts ?? [])])];
  const steps = testCase.browser?.steps ?? [];
  if (!steps.length) throw new Error('浏览器用例缺少 steps');

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: Boolean(config.ignoreHTTPSErrors || testCase.browser?.ignoreHTTPSErrors) });
  const page = await context.newPage();
  const trace: string[] = ['浏览器会话已启动'];
  const screenshots: string[] = [];
  try {
    for (const step of steps) trace.push(await executeBrowserStep(page, step, allowedHosts, timeout, screenshots));
    if (testCase.browser?.finalUrlContains) {
      const currentUrl = page.url();
      const passed = currentUrl.includes(testCase.browser.finalUrlContains);
      trace.push(passed ? `URL 断言通过：${testCase.browser.finalUrlContains}` : `URL 断言失败：${currentUrl}`);
      if (!passed) throw new Error(`当前 URL 不包含 ${testCase.browser.finalUrlContains}`);
    }
    if (testCase.browser?.textContains) {
      const bodyText = await page.locator('body').innerText();
      const passed = bodyText.includes(testCase.browser.textContains);
      trace.push(passed ? `页面文本断言通过：${testCase.browser.textContains}` : '页面文本断言失败');
      if (!passed) throw new Error(`页面文本不包含 ${testCase.browser.textContains}`);
    }
    if (!screenshots.length) {
      const buffer = await page.screenshot({ type: 'png', fullPage: true });
      screenshots.push(`data:image/png;base64,${buffer.toString('base64')}`);
      trace.push('已保存最终页面截图');
    }
    return { id: testCase.id, name: testCase.name, status: 'passed', duration: Date.now() - startedAt, actual: `浏览器操作完成，最终地址：${page.url()}`, trace, finishedAt: now(), screenshot: screenshots.at(-1) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    trace.push(`执行失败：${message}`);
    if (!screenshots.length) {
      const buffer = await page.screenshot({ type: 'png', fullPage: true }).catch(() => undefined);
      if (buffer) screenshots.push(`data:image/png;base64,${buffer.toString('base64')}`);
    }
    return { id: testCase.id, name: testCase.name, status: 'failed', duration: Date.now() - startedAt, actual: message, trace, finishedAt: now(), screenshot: screenshots.at(-1) };
  } finally {
    await context.close();
  }
}

app.get('/api/eval/health', (_request, response) => {
  response.json({ ok: true, service: 'eval-runner', modes: ['api', 'browser'], allowedHosts: defaultAllowedHosts, executablePath: resolveExecutablePath() });
});

app.post('/api/eval/run', async (request, response) => {
  const { cases, config } = request.body as { cases?: RunnerCase[]; config?: RunnerConfig };
  if (!Array.isArray(cases) || cases.length === 0) {
    response.status(400).json({ message: '至少需要一条测试用例' });
    return;
  }

  const runnerConfig = config ?? {};
  const browserCases = cases.filter((item) => (item.mode ?? 'api') === 'browser');
  let browser: Browser | undefined;
  try {
    if (browserCases.length > 0) {
      browser = await chromium.launch({ headless: runnerConfig.headless ?? process.env.EVAL_HEADLESS !== '0', executablePath: resolveExecutablePath() });
    }
    const results: RunnerResult[] = [];
    for (const testCase of cases) {
      try {
        results.push((testCase.mode ?? 'api') === 'browser' ? await runBrowserCase(testCase, runnerConfig, browser!) : await runApiCase(testCase, runnerConfig));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ id: testCase.id, name: testCase.name, status: 'failed', duration: 0, actual: message, trace: [`执行失败：${message}`], finishedAt: now() });
      }
    }
    response.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    response.status(500).json({ message: `Runner 启动失败：${message}`, executablePath: resolveExecutablePath() });
  } finally {
    await browser?.close();
  }
});

app.listen(port, () => {
  console.log(`[eval-runner] listening on http://localhost:${port}`);
  console.log(`[eval-runner] allowed hosts: ${defaultAllowedHosts.join(', ')}`);
});

