export type EvalProject = {
  id: string;
  name: string;
  key: string;
  description: string;
  owner: string;
  updatedAt: string;
};

export type EvalRequirement = {
  id: string;
  projectId: string;
  name: string;
  key: string;
  description: string;
  target: string;
  status: '待测试' | '测试中' | '已完成';
  updatedAt: string;
  caseIds: string[];
  modes: Array<'接口' | '浏览器'>;
  pagePath?: string;
  version?: string;
  scope?: string;
  environment?: string;
  preconditions?: string;
  testData?: string;
};

export const DEFAULT_EVAL_PROJECTS: EvalProject[] = [
  {
    id: 'agent-skill',
    name: 'Agent / Skill 自动化验证',
    key: 'TP-2610',
    description: '验证 Agent 路由、Skill 参数、组合任务和页面结果，覆盖接口与浏览器两类执行方式。',
    owner: 'AI 产品组',
    updatedAt: '2026-10-29',
  },
  {
    id: 'open-platform-api',
    name: '开放平台 API 验证',
    key: 'TP-2611',
    description: '面向开放平台应用、凭证、OAuth 和 API 调用链路的接口回归验证。',
    owner: '开放平台组',
    updatedAt: '2026-10-28',
  },
];

export const DEFAULT_EVAL_REQUIREMENTS: EvalRequirement[] = [
  {
    id: 'mixed-regression',
    projectId: 'agent-skill',
    name: 'Agent / Skill 混合回归',
    key: 'TR-2610-01',
    description: '用一组混合用例验证 Agent / Skill 的路由、参数异常、接口状态和页面结果。',
    target: 'Agent / Skill 全链路',
    status: '测试中',
    updatedAt: '2026-10-29',
    caseIds: ['agent-001', 'skill-001', 'skill-002', 'agent-002', 'skill-003', 'browser-001'],
    modes: ['接口', '浏览器'],
    pagePath: 'Agent / Skill 评测工作台',
    version: 'V2610',
    scope: 'Agent 路由、Skill 参数和页面结果',
    environment: '本地评测环境',
    preconditions: '已启动本地 Runner，浏览器域名已加入白名单。',
    testData: '使用示例 Agent / Skill 输入和本地评测页面。',
  },
  {
    id: 'agent-routing',
    projectId: 'agent-skill',
    name: 'Agent 路由回归',
    key: 'TR-2610-02',
    description: '聚焦相邻 Agent 冲突、组合任务和主流程路由判断。',
    target: 'Agent 路由',
    status: '待测试',
    updatedAt: '2026-10-28',
    caseIds: ['agent-001', 'agent-002'],
    modes: ['接口'],
    pagePath: 'Agent / Skill 评测工作台 > Agent 路由',
    version: 'V2610',
  },
  {
    id: 'skill-params',
    projectId: 'agent-skill',
    name: 'Skill 参数与异常兜底',
    key: 'TR-2610-03',
    description: '验证 Skill 参数结构化输出，以及缺少必要输入时的阻断和提示。',
    target: 'Skill 参数',
    status: '待测试',
    updatedAt: '2026-10-28',
    caseIds: ['skill-001', 'skill-002', 'skill-003'],
    modes: ['接口'],
    pagePath: 'Agent / Skill 评测工作台 > Skill 参数',
    version: 'V2610',
  },
  {
    id: 'browser-result',
    projectId: 'agent-skill',
    name: '浏览器结果验证',
    key: 'TR-2610-04',
    description: '通过真实浏览器打开页面，执行文本断言并保存结果截图。',
    target: '页面结果',
    status: '待测试',
    updatedAt: '2026-10-28',
    caseIds: ['browser-001'],
    modes: ['浏览器'],
    pagePath: 'Agent / Skill 评测工作台 > 浏览器结果',
    version: 'V2610',
    environment: '本地评测环境',
  },
  {
    id: 'oauth-api',
    projectId: 'open-platform-api',
    name: 'OAuth 授权链路回归',
    key: 'TR-2611-01',
    description: '验证授权地址、回调参数和 Access Token 换取接口。',
    target: 'OAuth API',
    status: '待测试',
    updatedAt: '2026-10-27',
    caseIds: [],
    modes: ['接口'],
    pagePath: '创客贴开放平台 > OAuth 授权',
    version: 'V2610',
  },
];

const PROJECT_STORAGE_KEY = 'agent-eval-projects';
const REQUIREMENT_STORAGE_KEY = 'agent-eval-requirements';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the prototype usable when localStorage is unavailable.
  }
}

export function readEvalProjects() {
  return readStorage<EvalProject[]>(PROJECT_STORAGE_KEY, DEFAULT_EVAL_PROJECTS);
}

export function saveEvalProjects(projects: EvalProject[]) {
  writeStorage(PROJECT_STORAGE_KEY, projects);
}

export function readEvalRequirements() {
  return readStorage<EvalRequirement[]>(REQUIREMENT_STORAGE_KEY, DEFAULT_EVAL_REQUIREMENTS);
}

export function saveEvalRequirements(requirements: EvalRequirement[]) {
  writeStorage(REQUIREMENT_STORAGE_KEY, requirements);
}

export function updateEvalRequirement(requirementId: string, patch: Partial<EvalRequirement>) {
  const nextRequirements = readEvalRequirements().map((requirement) => requirement.id === requirementId ? { ...requirement, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : requirement);
  saveEvalRequirements(nextRequirements);
  return nextRequirements.find((requirement) => requirement.id === requirementId);
}

export function getEvalProject(projectId: string) {
  return readEvalProjects().find((project) => project.id === projectId);
}

export function getEvalRequirement(projectId: string, requirementId: string) {
  return readEvalRequirements().find((requirement) => requirement.projectId === projectId && requirement.id === requirementId);
}
