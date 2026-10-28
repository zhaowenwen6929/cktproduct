import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleStop,
  CloudUpload,
  FileJson,
  FileText,
  Play,
  RefreshCw,
  Settings2,
  ShieldCheck,
  TerminalSquare,
  XCircle,
  Zap,
} from 'lucide-react';

type EvalKind = 'Agent' | 'Skill';
type ExecutionMode = 'api' | 'browser';
type ResultStatus = 'passed' | 'failed';
type ActiveTab = 'cases' | 'endpoint' | 'results';

type EvalCase = {
  id: string;
  kind: EvalKind;
  mode: ExecutionMode;
  target: string;
  name: string;
  input: string;
  expected: string;
  priority: string;
  tags: string[];
  api?: {
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    expectedStatus?: number;
    expectedText?: string;
  };
  browser?: {
    steps?: Array<Record<string, unknown>>;
    allowedHosts?: string[];
    finalUrlContains?: string;
    textContains?: string;
  };
};

type EvalResult = EvalCase & {
  status: ResultStatus;
  duration: number;
  actual: string;
  trace: string[];
  finishedAt: string;
  screenshot?: string;
};

type RunLog = {
  id: string;
  level: 'info' | 'success' | 'warning';
  time: string;
  text: string;
};

type EndpointConfig = {
  name: string;
  endpoint: string;
  method: 'POST' | 'GET';
  auth: 'none' | 'bearer' | 'api-key';
  token: string;
  timeout: number;
  concurrency: number;
  mockMode: boolean;
  runnerEndpoint: string;
  allowedHosts: string;
  headless: boolean;
};

const SAMPLE_CASES: EvalCase[] = [
  {
    id: 'agent-001',
    kind: 'Agent',
    mode: 'api',
    target: '电商设计 Agent',
    name: '商品套图任务路由',
    input: '我上传了一张保温杯商品图，请生成一套适合电商平台的主图和卖点图。',
    expected: '正确识别电商设计 Agent，并拆解为商品套图任务。',
    priority: 'P0',
    tags: ['路由', '主流程'],
    api: { expectedStatus: 200 },
  },
  {
    id: 'skill-001',
    kind: 'Skill',
    mode: 'api',
    target: 'listing-images',
    name: '商品套图 Skill 参数解析',
    input: '生成 5 张商品套图，主色为蓝色，画布尺寸 800x800。',
    expected: '解析数量、颜色和尺寸，并生成结构化参数。',
    priority: 'P0',
    tags: ['参数', '结构化输出'],
    api: { expectedStatus: 200 },
  },
  {
    id: 'skill-002',
    kind: 'Skill',
    mode: 'api',
    target: 'poster-multi-size',
    name: '海报多尺寸拓展',
    input: '把这张促销海报适配为小红书、公众号和朋友圈三个尺寸。',
    expected: '命中多尺寸拓展 Skill，输出三个目标尺寸。',
    priority: 'P1',
    tags: ['组合任务', '尺寸'],
    api: { expectedStatus: 200 },
  },
  {
    id: 'agent-002',
    kind: 'Agent',
    mode: 'api',
    target: '自媒体营销 Agent',
    name: '相邻 Agent 冲突识别',
    input: '基于这款护肤品写一篇小红书种草笔记，并配一张封面图。',
    expected: '优先进入自媒体营销 Agent，不误路由到单纯海报生成。',
    priority: 'P1',
    tags: ['路由', '冲突'],
    api: { expectedStatus: 200 },
  },
  {
    id: 'skill-003',
    kind: 'Skill',
    mode: 'api',
    target: 'content-removal',
    name: '缺少参考图时的兜底',
    input: '帮我去掉图片里的路人，但当前没有上传图片。',
    expected: '识别缺少必要输入，返回补充上传提示，不直接执行。',
    priority: 'P0',
    tags: ['异常', '兜底'],
    api: { expectedStatus: 200 },
  },
  {
    id: 'browser-001',
    kind: 'Agent',
    mode: 'browser',
    target: '浏览器结果校验',
    name: '打开页面并验证结果',
    input: '打开目标页面，确认结果文案和页面状态正确。',
    expected: '页面打开成功，包含评测工作台文案，并保存最终截图。',
    priority: 'P0',
    tags: ['浏览器', 'DOM断言', '截图'],
    browser: {
      steps: [
        { action: 'goto', url: 'http://localhost:3000/agent-eval' },
        { action: 'waitForText', text: 'Agent / Skill 自动化测试' },
        { action: 'screenshot', name: 'agent-eval-result' },
      ],
      allowedHosts: ['localhost'],
      textContains: '用例总数',
    },
  },
];

const DEFAULT_CONFIG: EndpointConfig = {
  name: '创客贴 Agent 回归接口',
  endpoint: 'https://api.example.com/v1/agent/execute',
  method: 'POST',
  auth: 'bearer',
  token: '',
  timeout: 30,
  concurrency: 2,
  mockMode: true,
  runnerEndpoint: 'http://localhost:4174',
  allowedHosts: 'localhost,127.0.0.1,example.com',
  headless: true,
};

const formatTime = (value: string) => new Date(value).toLocaleTimeString('zh-CN', { hour12: false });

const parseCsv = (text: string): Array<Record<string, string>> => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const split = (line: string) => line.split(',').map((item) => item.trim().replace(/^"|"$/g, ''));
  const headers = split(lines[0]);
  return lines.slice(1).map((line) => {
    const values = split(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index] ?? '';
      return row;
    }, {});
  });
};

const normalizeCases = (rows: Array<Record<string, unknown>>): EvalCase[] => rows
  .map((row, index) => {
    const kindValue = String(row.kind ?? row.type ?? 'Skill').toLowerCase();
    const modeValue = String(row.mode ?? row.execution_mode ?? row.executionMode ?? 'api').toLowerCase();
    const rawTags = row.tags ?? row.tag ?? '';
    const tags = Array.isArray(rawTags)
      ? rawTags.map(String)
      : String(rawTags).split(/[,，|]/).map((item) => item.trim()).filter(Boolean);
    const parseObject = (value: unknown) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) return value;
      if (typeof value !== 'string' || !value.trim()) return undefined;
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    };

    return {
      id: String(row.id ?? row.case_id ?? `imported-${String(index + 1).padStart(3, '0')}`),
      kind: (kindValue.includes('agent') ? 'Agent' : 'Skill') as EvalKind,
      mode: (modeValue.includes('browser') || modeValue.includes('浏览器') ? 'browser' : 'api') as ExecutionMode,
      target: String(row.target ?? row.agent ?? row.skill ?? '自定义目标'),
      name: String(row.name ?? row.title ?? row.case_name ?? `导入用例 ${index + 1}`),
      input: String(row.input ?? row.prompt ?? row.user_input ?? ''),
      expected: String(row.expected ?? row.expected_output ?? row.acceptance ?? '结果满足验收标准'),
      priority: String(row.priority ?? 'P1'),
      tags,
      api: parseObject(row.api) as EvalCase['api'],
      browser: parseObject(row.browser) as EvalCase['browser'],
    };
  })
  .filter((item) => item.input.trim());

function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'slate' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-violet-50 text-violet-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}
function StatCard({ label, value, suffix, color }: { label: string; value: string | number; suffix?: string; color: string }) {
  return <div className="rounded-xl border border-[#e6ebf2] bg-white p-4 shadow-[0_4px_16px_rgba(38,58,88,.04)]">
    <div className="text-[12px] text-[#8490a3]">{label}</div>
    <div className="mt-2 flex items-baseline gap-1"><span className="text-[26px] font-semibold tracking-[-.04em]" style={{ color }}>{value}</span>{suffix ? <span className="text-[12px] text-[#98a3b4]">{suffix}</span> : null}</div>
  </div>;
}
export function AgentEvaluationPage({ onBack }: { onBack: () => void }) {
  const [cases, setCases] = useState<EvalCase[]>(SAMPLE_CASES);
  const [config, setConfig] = useState<EndpointConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<ActiveTab>('cases');
  const [isRunning, setIsRunning] = useState(false);
  const [runIndex, setRunIndex] = useState(0);
  const [results, setResults] = useState<EvalResult[]>([]);
  const [logs, setLogs] = useState<RunLog[]>([{ id: 'boot', level: 'info', time: formatTime(new Date().toISOString()), text: '评测工作台已就绪，当前使用 Mock Runner。' }]);
  const [selectedResult, setSelectedResult] = useState<EvalResult | null>(null);
  const [notice, setNotice] = useState('');
  const [runnerStatus, setRunnerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const runnerAbortRef = useRef<AbortController | null>(null);

  const passedCount = results.filter((item) => item.status === 'passed').length;
  const failedCount = results.filter((item) => item.status === 'failed').length;
  const averageDuration = results.length ? Math.round(results.reduce((sum, item) => sum + item.duration, 0) / results.length) : 0;
  const progress = cases.length ? Math.round((results.length / cases.length) * 100) : 0;

  const summary = useMemo(() => [
    { label: '用例总数', value: cases.length, suffix: '条', color: '#0773fc' },
    { label: '已执行', value: results.length, suffix: '条', color: '#7b61ff' },
    { label: '通过率', value: results.length ? `${Math.round((passedCount / results.length) * 100)}%` : '--', suffix: '', color: '#07af4c' },
    { label: '平均耗时', value: averageDuration || '--', suffix: averageDuration ? 'ms' : '', color: '#f59e0b' },
  ], [averageDuration, cases.length, passedCount, results.length]);

  useEffect(() => {
    let cancelled = false;
    setRunnerStatus('checking');
    fetch(`${config.runnerEndpoint.replace(/\/$/, '')}/api/eval/health`)
      .then((response) => {
        if (!response.ok) throw new Error('runner offline');
        return response.json();
      })
      .then(() => { if (!cancelled) setRunnerStatus('online'); })
      .catch(() => { if (!cancelled) setRunnerStatus('offline'); });
    return () => { cancelled = true; };
  }, [config.runnerEndpoint]);

  useEffect(() => {
    if (!isRunning || !config.mockMode) return;
    if (runIndex >= cases.length) {
      setIsRunning(false);
      setLogs((current) => [...current, { id: `complete-${Date.now()}`, level: 'success', time: formatTime(new Date().toISOString()), text: `执行完成：${passedCount} 条通过，${failedCount} 条失败。` }]);
      return;
    }

    const currentCase = cases[runIndex];
    const timer = window.setTimeout(() => {
      const shouldFail = currentCase.id === 'skill-003';
      const duration = 420 + runIndex * 85;
      const result: EvalResult = {
        ...currentCase,
        status: shouldFail ? 'failed' : 'passed',
        duration,
        actual: shouldFail ? '未检测到必要参考图，已阻止执行并返回补充输入提示。' : `已命中 ${currentCase.target}，完成 Mock 执行并返回结构化结果。`,
        trace: shouldFail ? ['请求已接收', '输入校验：缺少参考图', '阻断执行：等待用户补充输入'] : [currentCase.mode === 'browser' ? '浏览器会话已启动' : '请求已接收', `路由：${currentCase.target}`, currentCase.mode === 'browser' ? '页面断言：评测工作台' : '工具调用：execute', '断言校验通过'],
        finishedAt: new Date().toISOString(),
      };
      setResults((current) => [...current, result]);
      setLogs((current) => [...current, { id: `case-${currentCase.id}-${Date.now()}`, level: shouldFail ? 'warning' : 'success', time: formatTime(new Date().toISOString()), text: `${currentCase.id} ${shouldFail ? '未通过' : '通过'} · ${duration}ms` }]);
      setRunIndex((current) => current + 1);
    }, 620);

    return () => window.clearTimeout(timer);
  }, [cases, config.mockMode, failedCount, isRunning, passedCount, runIndex]);

  const updateConfig = <K extends keyof EndpointConfig>(key: K, value: EndpointConfig[K]) => setConfig((current) => ({ ...current, [key]: value }));

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const loadSampleCases = () => {
    setCases(SAMPLE_CASES);
    setResults([]);
    setRunIndex(0);
    setSelectedResult(null);
    setActiveTab('cases');
    showNotice('已载入 6 条示例用例，包含接口和浏览器用例');
  };

  const importFile = async (file: File) => {
    try {
      const text = await file.text();
      let rows: Array<Record<string, unknown>> = [];
      if (file.name.toLowerCase().endsWith('.csv')) {
        rows = parseCsv(text);
      } else if (file.name.toLowerCase().endsWith('.jsonl')) {
        rows = text.split(/\r?\n/).filter((line) => line.trim()).map((line) => JSON.parse(line));
      } else {
        const parsed: unknown = JSON.parse(text);
        const rawRows = Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' && Array.isArray((parsed as { cases?: unknown[] }).cases) ? (parsed as { cases: unknown[] }).cases : [parsed];
        rows = rawRows.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
      }
      const imported = normalizeCases(rows);
      if (!imported.length) {
        showNotice('没有识别到有效用例，请检查是否包含 input 或 prompt 字段');
        return;
      }
      setCases(imported);
      setResults([]);
      setRunIndex(0);
      setSelectedResult(null);
      setActiveTab('cases');
      showNotice(`已导入 ${imported.length} 条用例`);
    } catch {
      showNotice('用例导入失败，请使用 JSON、JSONL 或 CSV 格式');
    }
  };

  const runWithLocalRunner = async () => {
    const controller = new AbortController();
    runnerAbortRef.current = controller;
    try {
      const response = await fetch(`${config.runnerEndpoint.replace(/\/$/, '')}/api/eval/run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cases,
          config: {
            endpoint: config.endpoint,
            method: config.method,
            auth: config.auth,
            token: config.token,
            timeout: config.timeout,
            allowedHosts: config.allowedHosts.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean),
            headless: config.headless,
          },
        }),
        signal: controller.signal,
      });
      const payload = await response.json() as { message?: string; results?: Array<Partial<EvalResult> & { id: string }> };
      if (!response.ok) throw new Error(payload.message || 'Runner 执行失败');
      const nextResults = (payload.results ?? []).map((result) => ({
        ...cases.find((item) => item.id === result.id),
        ...result,
      })) as EvalResult[];
      setResults(nextResults);
      setRunIndex(nextResults.length);
      setLogs((current) => [
        ...current,
        ...nextResults.map((result) => ({ id: `real-${result.id}-${result.finishedAt}`, level: result.status === 'passed' ? 'success' as const : 'warning' as const, time: formatTime(result.finishedAt), text: `${result.id} ${result.status === 'passed' ? '通过' : '未通过'} · ${result.duration}ms · ${result.mode === 'browser' ? '浏览器' : '接口'}` })),
        { id: `real-complete-${Date.now()}`, level: 'success' as const, time: formatTime(new Date().toISOString()), text: `真实 Runner 完成：${nextResults.filter((item) => item.status === 'passed').length} 条通过，${nextResults.filter((item) => item.status === 'failed').length} 条失败。` },
      ]);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      const message = error instanceof Error ? error.message : String(error);
      showNotice(message);
      setLogs((current) => [...current, { id: `real-error-${Date.now()}`, level: 'warning', time: formatTime(new Date().toISOString()), text: `真实 Runner 失败：${message}` }]);
    } finally {
      runnerAbortRef.current = null;
      setIsRunning(false);
    }
  };

  const startRun = () => {
    if (!cases.length) {
      showNotice('请先导入至少一条用例');
      setActiveTab('cases');
      return;
    }
    if (!config.mockMode && !config.runnerEndpoint.trim()) {
      showNotice('请先填写本地 Runner 地址');
      setActiveTab('endpoint');
      return;
    }
    if (cases.some((item) => item.mode === 'api') && !config.endpoint.trim()) {
      showNotice('请先填写接口地址');
      setActiveTab('endpoint');
      return;
    }
    setResults([]);
    setRunIndex(0);
    setSelectedResult(null);
    setIsRunning(true);
    setActiveTab('results');
    setLogs([{ id: `start-${Date.now()}`, level: 'info', time: formatTime(new Date().toISOString()), text: `开始执行 ${cases.length} 条用例 · ${config.mockMode ? 'Mock Runner' : '本地 HTTP + Browser Runner'}` }]);
    if (!config.mockMode) {
      void runWithLocalRunner();
    }
  };

  const stopRun = () => {
    runnerAbortRef.current?.abort();
    setIsRunning(false);
    setLogs((current) => [...current, { id: `stop-${Date.now()}`, level: 'warning', time: formatTime(new Date().toISOString()), text: `已暂停执行，当前完成 ${results.length}/${cases.length} 条。` }]);
  };

  return <div className="min-h-screen bg-[#f3f6fb] text-[#1c2738]">
    <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-4"><button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-[#6c7890] transition hover:text-[#0773fc]"><ArrowLeft className="h-4 w-4" />返回项目入口</button><span className="h-5 w-px bg-[#e6eaf0]" /><div className="flex items-center gap-2 text-[14px] font-semibold"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eaf3ff] text-[#0773fc]"><Activity className="h-4 w-4" /></span>自动化验证平台</div></div>
        <div className="flex items-center gap-3 text-[12px] text-[#8190a4]"><ShieldCheck className="h-4 w-4 text-[#07af4c]" />离线评测环境 <span className="rounded-full bg-[#effaf4] px-2.5 py-1 text-[#27885a]">MVP</span></div>
      </div>
    </header>

    <main className="mx-auto max-w-[1440px] space-y-4 px-5 py-5 lg:px-8 lg:py-7">
      <section className="overflow-hidden rounded-2xl border border-[#e1e9f5] bg-white shadow-[0_12px_32px_rgba(37,72,112,.06)]">
        <div className="flex flex-wrap items-start justify-between gap-5 bg-[linear-gradient(120deg,#f4f8ff,#fbf7ff)] px-6 py-6 lg:px-8">
          <div><div className="mb-3 flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0773fc,#7b61ff)] text-white"><Zap className="h-5 w-5" /></span><Badge>MVP 评测工作台</Badge></div><h1 className="text-[25px] font-semibold tracking-[-.04em] text-[#172235]">Agent / Skill 自动化测试</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#68758b]">同一批用例可以混合执行接口请求和浏览器操作，并查看路由、耗时、页面截图、完整轨迹和验收结果。</p></div>
          <div className="flex items-center gap-2"><Badge tone={config.mockMode ? 'blue' : runnerStatus === 'online' ? 'green' : 'amber'}>{config.mockMode ? 'Mock Runner' : runnerStatus === 'online' ? '真实 Runner 在线' : runnerStatus === 'checking' ? 'Runner 检查中' : '真实 Runner 离线'}</Badge><button type="button" onClick={loadSampleCases} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d8e0eb] bg-white px-3 text-[12px] font-medium text-[#526177] transition hover:border-[#a9c8ef] hover:text-[#0773fc]"><RefreshCw className="h-3.5 w-3.5" />载入示例</button></div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{summary.map((item) => <StatCard key={item.label} {...item} />)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.65fr)]">
        <section className="overflow-hidden rounded-xl border border-[#e1e7ef] bg-white shadow-[0_6px_20px_rgba(38,58,88,.04)]">
          <div className="flex items-center gap-1 border-b border-[#e9edf3] px-4 pt-3"><button type="button" onClick={() => setActiveTab('cases')} className={`inline-flex items-center gap-1.5 border-b-2 px-4 pb-3 text-[13px] font-medium ${activeTab === 'cases' ? 'border-[#0773fc] text-[#0773fc]' : 'border-transparent text-[#7f8b9f]'}`}><FileText className="h-3.5 w-3.5" />用例集</button><button type="button" onClick={() => setActiveTab('endpoint')} className={`inline-flex items-center gap-1.5 border-b-2 px-4 pb-3 text-[13px] font-medium ${activeTab === 'endpoint' ? 'border-[#0773fc] text-[#0773fc]' : 'border-transparent text-[#7f8b9f]'}`}><Settings2 className="h-3.5 w-3.5" />接口配置</button><button type="button" onClick={() => setActiveTab('results')} className={`inline-flex items-center gap-1.5 border-b-2 px-4 pb-3 text-[13px] font-medium ${activeTab === 'results' ? 'border-[#0773fc] text-[#0773fc]' : 'border-transparent text-[#7f8b9f]'}`}><CheckCircle2 className="h-3.5 w-3.5" />执行结果{results.length ? <span className="rounded-full bg-[#eaf3ff] px-1.5 text-[10px]">{results.length}</span> : null}</button></div>
          {activeTab === 'cases' ? <div className="p-4"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[14px] font-semibold">测试用例管理</h2><p className="mt-1 text-[11px] text-[#8591a4]">支持 JSON、JSONL、CSV；接口用例走 HTTP，浏览器用例按 steps 执行点击、输入、断言和截图。</p></div><div className="flex items-center gap-2"><input ref={fileInputRef} type="file" accept=".json,.jsonl,.csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); event.target.value = ''; }} /><button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#cfe0f8] bg-white px-3 text-[11px] font-medium text-[#3979b7] hover:bg-[#f5f9ff]"><CloudUpload className="h-3.5 w-3.5" />导入用例</button><button type="button" onClick={loadSampleCases} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-[#3979b7] hover:bg-[#f5f9ff]"><RefreshCw className="h-3.5 w-3.5" />使用示例</button></div></div><div className="overflow-x-auto rounded-lg border border-[#e8edf3]"><table className="min-w-full text-left text-[12px]"><thead className="bg-[#f8fafc] text-[#8490a3]"><tr><th className="px-3 py-3 font-medium">用例</th><th className="px-3 py-3 font-medium">类型</th><th className="px-3 py-3 font-medium">执行方式</th><th className="px-3 py-3 font-medium">目标</th><th className="px-3 py-3 font-medium">优先级</th><th className="min-w-[280px] px-3 py-3 font-medium">输入</th></tr></thead><tbody>{cases.map((item) => <tr key={item.id} className="border-t border-[#edf0f4] align-top hover:bg-[#fbfdff]"><td className="px-3 py-3"><div className="max-w-[220px] truncate font-medium text-[#344158]">{item.name}</div><div className="mt-1 text-[10px] text-[#9aa5b5]">{item.id}</div></td><td className="px-3 py-3"><Badge tone={item.kind === 'Agent' ? 'blue' : 'purple'}>{item.kind}</Badge></td><td className="px-3 py-3"><Badge tone={item.mode === 'browser' ? 'amber' : 'green'}>{item.mode === 'browser' ? '浏览器' : '接口'}</Badge></td><td className="max-w-[160px] truncate px-3 py-3 text-[#5d6a7f]">{item.target}</td><td className="px-3 py-3"><Badge tone={item.priority === 'P0' ? 'red' : item.priority === 'P1' ? 'amber' : 'slate'}>{item.priority}</Badge></td><td className="max-w-[380px] px-3 py-3 text-[#5d6a7f]">{item.input}<div className="mt-1 flex flex-wrap gap-1">{item.tags.map((tag) => <span key={tag} className="text-[10px] text-[#9aa5b5]">#{tag}</span>)}</div></td></tr>)}</tbody></table></div></div> : null}
          {activeTab === 'endpoint' ? <div className="space-y-4 p-5"><div className="rounded-lg border border-[#cfe0ff] bg-[#f5f9ff] p-3 text-[12px] text-[#697a93]"><div className="font-semibold text-[#0773fc]">混合执行适配层</div><div className="mt-1 leading-5">接口用例由本地 Runner 发起 HTTP 请求；浏览器用例由 Playwright 打开页面、点击、输入、断言并回传截图。默认仍是 Mock Runner。</div></div><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><label className="text-[12px] font-medium text-[#536178]">配置名称<input value={config.name} onChange={(event) => updateConfig('name', event.target.value)} className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="text-[12px] font-medium text-[#536178]">请求方法<select value={config.method} onChange={(event) => updateConfig('method', event.target.value as EndpointConfig['method'])} className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] bg-white px-3 text-[12px] outline-none focus:border-[#77aef0]"><option value="POST">POST</option><option value="GET">GET</option></select></label><label className="text-[12px] font-medium text-[#536178] md:col-span-2">接口地址<input value={config.endpoint} onChange={(event) => updateConfig('endpoint', event.target.value)} placeholder="https://your-api.example.com/v1/agent/execute" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="text-[12px] font-medium text-[#536178]">认证方式<select value={config.auth} onChange={(event) => updateConfig('auth', event.target.value as EndpointConfig['auth'])} className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] bg-white px-3 text-[12px] outline-none focus:border-[#77aef0]"><option value="none">无认证</option><option value="bearer">Bearer Token</option><option value="api-key">API Key</option></select></label><label className="text-[12px] font-medium text-[#536178]">超时（秒）<input type="number" min={1} max={300} value={config.timeout} onChange={(event) => updateConfig('timeout', Number(event.target.value) || 30)} className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="text-[12px] font-medium text-[#536178] md:col-span-2">Token / API Key<input type="password" value={config.token} onChange={(event) => updateConfig('token', event.target.value)} placeholder="仅在本地 Runner 中使用，不会写入结果报告" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="text-[12px] font-medium text-[#536178] md:col-span-2">本地 Runner 地址<input value={config.runnerEndpoint} onChange={(event) => updateConfig('runnerEndpoint', event.target.value)} placeholder="http://localhost:4174" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /><span className={`mt-1 block text-[10px] ${runnerStatus === 'online' ? 'text-emerald-600' : runnerStatus === 'checking' ? 'text-amber-600' : 'text-slate-400'}`}>{runnerStatus === 'online' ? 'Runner 在线：支持 API + Browser 两种执行模式' : runnerStatus === 'checking' ? '正在检查 Runner 状态…' : 'Runner 离线：可继续使用 Mock，真实执行前请运行 npm run eval-runner'}</span></label><label className="text-[12px] font-medium text-[#536178] md:col-span-2">浏览器允许访问的域名<input value={config.allowedHosts} onChange={(event) => updateConfig('allowedHosts', event.target.value)} placeholder="localhost,127.0.0.1,example.com" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /><span className="mt-1 block text-[10px] text-[#98a4b5]">多个域名用逗号分隔；浏览器用例只能打开白名单域名。</span></label></div></div> : null}
          {activeTab === 'results' ? <div className="p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-[14px] font-semibold">执行结果</h2><p className="mt-1 text-[11px] text-[#8591a4]">规则评分优先，失败样本可展开查看完整轨迹。</p></div>{results.length ? <Badge tone={failedCount ? 'amber' : 'green'}>{failedCount ? `${failedCount} 条待复核` : '全部通过'}</Badge> : null}</div>{results.length === 0 ? <div className="flex min-h-[270px] flex-col items-center justify-center rounded-lg border border-dashed border-[#d9e1eb] bg-[#fbfcfe] text-center"><FileJson className="h-8 w-8 text-[#b5c1d1]" /><div className="mt-3 text-[13px] font-medium text-[#637188]">还没有执行结果</div><div className="mt-1 text-[11px] text-[#9aa5b5]">在右侧点击“开始执行”，运行当前用例集</div></div> : <div className="overflow-x-auto rounded-lg border border-[#e8edf3]"><table className="min-w-full text-left text-[12px]"><thead className="bg-[#f8fafc] text-[#8490a3]"><tr><th className="px-3 py-3 font-medium">用例</th><th className="px-3 py-3 font-medium">执行方式</th><th className="px-3 py-3 font-medium">结果</th><th className="px-3 py-3 font-medium">耗时</th><th className="min-w-[280px] px-3 py-3 font-medium">执行信息</th><th className="px-3 py-3 font-medium">操作</th></tr></thead><tbody>{results.map((item) => <tr key={`${item.id}-${item.finishedAt}`} className="border-t border-[#edf0f4] align-top hover:bg-[#fbfdff]"><td className="px-3 py-3"><div className="font-medium text-[#344158]">{item.name}</div><div className="mt-1 text-[10px] text-[#9aa5b5]">{item.id}</div></td><td className="px-3 py-3"><Badge tone={item.mode === 'browser' ? 'amber' : 'green'}>{item.mode === 'browser' ? '浏览器' : '接口'}</Badge></td><td className="px-3 py-3">{item.status === 'passed' ? <Badge tone="green"><CheckCircle2 className="mr-1 h-3 w-3" />通过</Badge> : <Badge tone="red"><XCircle className="mr-1 h-3 w-3" />失败</Badge>}</td><td className="px-3 py-3 text-[#66758b]">{item.duration}ms</td><td className="max-w-[420px] px-3 py-3 text-[#66758b]">{item.actual}</td><td className="px-3 py-3"><button type="button" onClick={() => setSelectedResult(item)} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3979b7] hover:text-[#0773fc]">详情<ChevronRight className="h-3 w-3" /></button></td></tr>)}</tbody></table></div>}</div> : null}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-[#e1e7ef] bg-white p-4 shadow-[0_6px_20px_rgba(38,58,88,.04)]"><div className="mb-4 flex items-start justify-between"><div><h2 className="text-[14px] font-semibold">执行控制</h2><p className="mt-1 text-[11px] text-[#8591a4]">选择运行参数后开始批量执行</p></div><span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${isRunning ? 'text-[#0773fc]' : results.length ? 'text-[#07af4c]' : 'text-[#8a96a8]'}`}><span className={`h-2 w-2 rounded-full ${isRunning ? 'animate-pulse bg-[#0773fc]' : results.length ? 'bg-[#07af4c]' : 'bg-[#b8c1ce]'}`} />{isRunning ? '执行中' : results.length ? '已完成' : '待执行'}</span></div><div className="space-y-4"><div className="rounded-lg bg-[#f7f9fc] p-3"><div className="mb-2 flex items-center justify-between text-[12px] text-[#617087]"><span>执行进度</span><span className="font-medium text-[#344158]">{results.length}/{cases.length}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#e5eaf2]"><div className={`h-full rounded-full transition-all ${failedCount ? 'bg-[#f59e0b]' : 'bg-[#0773fc]'}`} style={{ width: `${progress}%` }} /></div></div><div className="grid grid-cols-2 gap-3"><label className="text-[12px] font-medium text-[#536178]">测试范围<select className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] bg-white px-2 text-[11px] outline-none"><option>Agent + Skill 全部</option><option>仅 Agent</option><option>仅 Skill</option></select></label><label className="text-[12px] font-medium text-[#536178]">并发数<input type="number" min={1} max={10} value={config.concurrency} onChange={(event) => updateConfig('concurrency', Number(event.target.value) || 1)} className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] bg-white px-2 text-[11px] outline-none" /></label></div><div className="flex items-center justify-between rounded-lg border border-[#e8edf3] px-3 py-2.5"><div><div className="text-[12px] font-medium text-[#536178]">{config.mockMode ? 'Mock Runner' : '真实 Runner'}</div><div className="mt-0.5 text-[10px] text-[#98a4b5]">{config.mockMode ? '用模拟响应演示执行链路' : runnerStatus === 'online' ? 'HTTP + Playwright 浏览器执行' : 'Runner 未连接'}</div></div><button type="button" role="switch" aria-checked={config.mockMode} onClick={() => updateConfig('mockMode', !config.mockMode)} className={`relative h-5 w-9 rounded-full transition ${config.mockMode ? 'bg-[#0773fc]' : 'bg-[#07af4c]'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${config.mockMode ? 'left-[18px]' : 'left-0.5'}`} /></button></div><div className="flex gap-2"><button type="button" disabled={isRunning} onClick={startRun} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0773fc] text-[12px] font-medium text-white shadow-[0_4px_10px_rgba(7,115,252,.2)] transition hover:bg-[#0667e2] disabled:cursor-not-allowed disabled:opacity-50"><Play className="h-3.5 w-3.5 fill-current" />开始执行</button><button type="button" disabled={!isRunning} onClick={stopRun} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#dce3ed] px-3 text-[12px] font-medium text-[#69778d] transition hover:border-[#f0b6a9] hover:text-[#d66854] disabled:cursor-not-allowed disabled:opacity-40"><CircleStop className="h-3.5 w-3.5" />暂停</button></div></div></section>
          <section className="rounded-xl border border-[#e1e7ef] bg-[#18243a] p-4 text-white shadow-[0_6px_20px_rgba(38,58,88,.08)]"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-[13px] font-medium"><TerminalSquare className="h-4 w-4 text-[#91bdfb]" />运行日志</div><span className="text-[10px] text-[#8493ad]">{logs.length} 条</span></div><div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">{logs.map((log) => <div key={log.id} className="flex gap-2 text-[11px] leading-5"><span className="shrink-0 text-[#72819c]">{log.time}</span><span className={log.level === 'success' ? 'text-[#8be0b2]' : log.level === 'warning' ? 'text-[#f8c67a]' : 'text-[#bfd0eb]'}>{log.text}</span></div>)}</div></section>
        </aside>
      </div>
    </main>

    {notice ? <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-lg bg-[#18243a] px-4 py-2.5 text-[12px] text-white shadow-xl">{notice}</div> : null}
    {selectedResult ? <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#18243a]/35 p-5" onClick={() => setSelectedResult(null)}><div className="w-full max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between border-b border-[#e8edf3] px-5 py-4"><div><div className="flex items-center gap-2"><h2 className="text-[16px] font-semibold text-[#27344a]">{selectedResult.name}</h2>{selectedResult.status === 'passed' ? <Badge tone="green">通过</Badge> : <Badge tone="red">失败</Badge>}</div><p className="mt-1 text-[11px] text-[#98a4b5]">{selectedResult.id} · {selectedResult.mode === 'browser' ? '浏览器' : '接口'} · {selectedResult.duration}ms · {selectedResult.finishedAt}</p></div><button type="button" onClick={() => setSelectedResult(null)} className="flex h-7 w-7 items-center justify-center rounded-md text-[#8a96a8] hover:bg-[#f3f6fa]"><XCircle className="h-4 w-4" /></button></div><div className="max-h-[78vh] space-y-4 overflow-y-auto p-5"><div><div className="text-[11px] font-semibold text-[#68768b]">期望结果</div><p className="mt-1 text-[12px] leading-5 text-[#4d5b70]">{selectedResult.expected}</p></div><div><div className="text-[11px] font-semibold text-[#68768b]">实际结果</div><p className="mt-1 text-[12px] leading-5 text-[#4d5b70]">{selectedResult.actual}</p></div><div><div className="mb-2 text-[11px] font-semibold text-[#68768b]">执行轨迹</div><div className="space-y-2 rounded-lg bg-[#f7f9fc] p-3">{selectedResult.trace.map((step, index) => <div key={`${step}-${index}`} className="flex items-start gap-2 text-[11px] text-[#5e6c80]"><span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-[9px] font-semibold text-[#3979b7]">{index + 1}</span>{step}</div>)}</div></div>{selectedResult.screenshot ? <div><div className="mb-2 text-[11px] font-semibold text-[#68768b]">页面截图</div><img src={selectedResult.screenshot} alt="浏览器执行截图" className="max-h-[360px] w-full rounded-lg border border-[#e5eaf1] object-contain" /></div> : null}</div></div></div> : null}
  </div>;
}

