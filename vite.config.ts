import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {execFileSync} from 'node:child_process';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const GROWING_IO_DAILY_REPORT_URL = 'https://www.growingio.com/projects/QRe7ENoq/product-analytics/eventAnalysis/woVqG5YP';

const DAILY_REPORT_FIELD_MAP = {
  actualPaidCount: 'I 订单支付(Z)_次',
  actualPaymentAmountFen: 'J 订单支付(Z)_订单实际支付金额_求和',
  backendPaidCount: 'K 订单支付(Z)_次',
  backendPaymentAmountFen: 'L 订单支付(Z)_订单实际支付金额_求和',
  canvasPaidCount: 'M 订单支付(Z)_次',
  canvasPaymentAmountFen: 'N 订单支付(Z)_订单实际支付金额_求和',
  ecommercePaidCount: 'O 订单支付(Z)_次',
  ecommercePaymentAmountFen: 'P 订单支付(Z)_订单实际支付金额_求和',
  mainDesignDownloadCount: 'H 下载完成_次',
  canvasDownloadCount: 'B 下载完成_次',
  ecommerceDownloadCount: 'Q 下载弹窗内下载按钮_次',
} as const;

const createJsonResponse = (res: {statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void}, statusCode: number, payload: unknown) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

const readRequestBody = async (req: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const runChromeScript = (script: string) =>
  execFileSync('osascript', ['-e', script], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 8,
  }).trim();

const escapeAppleScriptString = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const fetchDailyReportRowFromChrome = (date: string) => {
  const browserScript = `
    const normalize = (value) => (value || '').replace(/\\s+/g, ' ').trim();
    const parseNumericCell = (value) => {
      const normalized = normalize(value).replace(/,/g, '');
      const matched = normalized.match(/-?\\d+(?:\\.\\d+)?/);
      return matched ? Number(matched[0]) : 0;
    };
    const tables = Array.from(document.querySelectorAll('table'));
    const targetTable = tables.find((table) => table.innerText.includes('Q 下载弹窗内下载按钮_次')) || tables[0];
    if (!targetTable) {
      return JSON.stringify({ error: 'GIO 页面未找到数据表格' });
    }
    const headers = Array.from(targetTable.querySelectorAll('thead th')).map((cell) => normalize(cell.textContent));
    const rows = Array.from(targetTable.querySelectorAll('tbody tr')).map((row) =>
      Array.from(row.querySelectorAll('td')).map((cell) => normalize(cell.textContent))
    );
    const targetRow = rows.find((row) => row[0] === ${JSON.stringify(date)});
    if (!targetRow) {
      return JSON.stringify({
        error: 'GIO 表格中未找到目标日期',
        availableDates: rows.slice(0, 10).map((row) => row[0]).filter(Boolean),
      });
    }
    const rowRecord = Object.fromEntries(headers.map((header, index) => [header, targetRow[index] ?? '']));
    return JSON.stringify({
      date: ${JSON.stringify(date)},
      rowRecord,
      title: document.title,
      fetchedAt: new Date().toISOString(),
    });
  `;

  const appleScript = `
    set targetUrl to "${escapeAppleScriptString(GROWING_IO_DAILY_REPORT_URL)}"
    set browserScript to "${escapeAppleScriptString(browserScript)}"
    tell application "Google Chrome"
      repeat with theWindow in windows
        repeat with theTab in tabs of theWindow
          if (URL of theTab) contains targetUrl then
            set active tab index of theWindow to (index of theTab)
            set thePayload to execute theTab javascript browserScript
            return thePayload
          end if
        end repeat
      end repeat
    end tell
    error "未在 Google Chrome 中找到已打开的 GrowingIO 日报页面"
  `;

  const payload = JSON.parse(runChromeScript(appleScript)) as {
    error?: string;
    rowRecord?: Record<string, string>;
    fetchedAt?: string;
  };
  if (payload.error || !payload.rowRecord) {
    throw new Error(payload.error ?? 'GIO 返回数据为空');
  }

  const getFieldValue = (fieldName: string) => payload.rowRecord?.[fieldName] ?? '0';
  const toInteger = (fieldName: string) => {
    const raw = getFieldValue(fieldName).replace(/,/g, '');
    const matched = raw.match(/-?\\d+(?:\\.\\d+)?/);
    return matched ? Math.round(Number(matched[0])) : 0;
  };

  return {
    row: {
      date,
      actualPaidCount: toInteger(DAILY_REPORT_FIELD_MAP.actualPaidCount),
      actualPaymentAmountFen: toInteger(DAILY_REPORT_FIELD_MAP.actualPaymentAmountFen),
      backendPaidCount: toInteger(DAILY_REPORT_FIELD_MAP.backendPaidCount),
      backendPaymentAmountFen: toInteger(DAILY_REPORT_FIELD_MAP.backendPaymentAmountFen),
      canvasPaidCount: toInteger(DAILY_REPORT_FIELD_MAP.canvasPaidCount),
      canvasPaymentAmountFen: toInteger(DAILY_REPORT_FIELD_MAP.canvasPaymentAmountFen),
      ecommercePaidCount: toInteger(DAILY_REPORT_FIELD_MAP.ecommercePaidCount),
      ecommercePaymentAmountFen: toInteger(DAILY_REPORT_FIELD_MAP.ecommercePaymentAmountFen),
      mainDesignDownloadCount: toInteger(DAILY_REPORT_FIELD_MAP.mainDesignDownloadCount),
      canvasDownloadCount: toInteger(DAILY_REPORT_FIELD_MAP.canvasDownloadCount),
      ecommerceDownloadCount: toInteger(DAILY_REPORT_FIELD_MAP.ecommerceDownloadCount),
    },
    fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
  };
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'daily-report-sync-api',
        configureServer(server) {
          server.middlewares.use('/api/daily-report-sync', async (req, res) => {
            if (req.method !== 'POST') {
              createJsonResponse(res, 405, {error: 'Method Not Allowed'});
              return;
            }

            try {
              const body = (await readRequestBody(req)) as {date?: string};
              if (!body.date) {
                createJsonResponse(res, 400, {error: '缺少 date 参数'});
                return;
              }

              const payload = fetchDailyReportRowFromChrome(body.date);
              createJsonResponse(res, 200, payload);
            } catch (error) {
              createJsonResponse(res, 500, {
                error: error instanceof Error ? error.message : '抓取 GIO 数据失败',
              });
            }
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.SKIP_GENERATION': JSON.stringify(env.SKIP_GENERATION),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
