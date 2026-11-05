export const OPEN_PLATFORM_SOURCE_URL = 'https://chuangkit.yuque.com/qltowx/openapi3.0/ln9rmy';

export type AdminCapabilityStatus = '草稿' | '内测中' | '已开放' | '已有接口' | 'SDK 支持' | '维护中' | '已废弃' | '已下线' | '规划中';
export type AdminCapabilitySource = 'existing_open_platform' | 'product_planning' | 'internal';
export type AdminChannelId = 'api' | 'sdk' | 'cli' | 'mcp' | 'agent-skills';
export type AdminBillingMode = '免费' | '按调用次数' | '按任务计费' | '按积分计费' | '企业套餐额度' | '需申请';

export type AdminChannelConfig = {
  enabled: boolean;
  status: AdminCapabilityStatus;
  docsUrl: string;
  version: string;
  note: string;
};

export type AdminCapability = {
  id: string;
  capabilityCode: string;
  name: string;
  category: string;
  description: string;
  publicName: string;
  publicDescription: string;
  source: AdminCapabilitySource;
  status: AdminCapabilityStatus;
  version: string;
  order: number;
  docsUrl: string;
  exampleUrl: string;
  publicVisible: boolean;
  allowAi: boolean;
  requireConfirmation: boolean;
  channels: Record<AdminChannelId, AdminChannelConfig>;
  billing: {
    mode: AdminBillingMode;
    unit: string;
    unitPrice: string;
    priceVisible: boolean;
    freeQuota: string;
    enterprisePrice: string;
    refundOnFailure: boolean;
    retryCharge: boolean;
    effectiveAt: string;
  };
  stats: { calls: number; points: number; successRate: number };
  updatedAt: string;
};

export type AdminSdkModule = {
  id: string;
  name: string;
  description: string;
  languages: string[];
  packageName: string;
  currentVersion: string;
  minVersion: string;
  installCommand: string;
  docsUrl: string;
  exampleUrl: string;
  publicOpen: boolean;
  source: AdminCapabilitySource;
};

export type AdminApp = {
  appId: string;
  name: string;
  developer: string;
  organization: string;
  status: '运行中' | '已停用' | '待审核';
  authorizedUsers: number;
  calls: number;
  successRate: number;
  points: number;
  lastCall: string;
  createdAt: string;
  integrations: AdminChannelId[];
  scopes: string[];
  quotas?: { apiRequests: number; aiPoints: number };
};

export type AdminTask = {
  taskId: string;
  appName: string;
  capability: string;
  channel: AdminChannelId;
  status: '已创建' | '排队中' | '运行中' | '已成功' | '已失败' | '已取消' | '已过期';
  createdAt: string;
  startedAt: string;
  completedAt: string;
  duration: string;
  points: number;
  failureReason: string;
  retries: number;
};

export type AdminAuditLog = {
  id: string;
  operator: string;
  module: string;
  action: string;
  objectName: string;
  before: string;
  after: string;
  createdAt: string;
  ip: string;
  requestId: string;
};

export type AdminTrendPoint = { date: string; value: number };
export type AdminOverview = {
  stats: {
    capabilityTotal: number;
    openedCapabilities: number;
    planningCapabilities: number;
    betaCapabilities: number;
    appsTotal: number;
    activeApps: number;
    totalCalls: number;
    todayCalls: number;
    totalPoints: number;
    todayPoints: number;
    failedTasks: number;
  };
  callTrend: AdminTrendPoint[];
  pointsTrend: AdminTrendPoint[];
  statusDistribution: { label: string; value: number; color: string }[];
  channelDistribution: { label: string; value: number; color: string }[];
  capabilityRanks: { name: string; category: string; calls: number; successRate: number }[];
  appRanks: { name: string; organization: string; calls: number; points: number }[];
};

export type DeveloperPlatformAdminStore = {
  capabilities: AdminCapability[];
  sdkModules: AdminSdkModule[];
  apps: AdminApp[];
  tasks: AdminTask[];
  auditLogs: AdminAuditLog[];
};

export type DeveloperAppEnvironment = '开发环境' | '生产环境';

export type DeveloperAppConfig = {
  appId: string;
  selectedEnvironment: DeveloperAppEnvironment;
  environments: Record<DeveloperAppEnvironment, {
    clientId: string;
    clientSecret: string;
    accessKey: string;
    callbackUrls: string[];
    webhookUrl: string;
    domainWhitelist: string[];
    pkce: boolean;
    organizationAuthorization: boolean;
    secretRotatedAt: string;
  }>;
  integrations: AdminChannelId[];
  scopes: string[];
  updatedAt: string;
};

export const ADMIN_DEVELOPER_PLATFORM_ENDPOINTS = {
  overview: '/admin/developer-platform/overview',
  capabilities: '/admin/developer-platform/capabilities',
  apps: '/admin/developer-platform/apps',
  billing: '/admin/developer-platform/billing/records',
  trend: '/admin/developer-platform/usage/trend',
  rank: '/admin/developer-platform/usage/rank',
  details: '/admin/developer-platform/usage/details',
  tasks: '/admin/developer-platform/tasks',
  auditLogs: '/admin/developer-platform/audit-logs',
} as const;

export const PUBLIC_DEVELOPER_PLATFORM_ENDPOINTS = {
  overview: '/open-platform/developer-platform/overview',
  capabilities: '/open-platform/developer-platform/capabilities',
  detail: '/open-platform/developer-platform/capabilities/{capability_code}',
  sdk: '/open-platform/developer-platform/sdk',
  cli: '/open-platform/developer-platform/cli',
  mcp: '/open-platform/developer-platform/mcp',
} as const;

const channel = (enabled: boolean, status: AdminCapabilityStatus, note: string, version = 'v1') : AdminChannelConfig => ({
  enabled,
  status,
  docsUrl: OPEN_PLATFORM_SOURCE_URL,
  version,
  note,
});

const defaultChannels = (status: AdminCapabilityStatus, options?: Partial<Record<AdminChannelId, AdminChannelConfig>>): Record<AdminChannelId, AdminChannelConfig> => ({
  api: options?.api ?? channel(status === '已开放' || status === '内测中', status, 'REST API 公共能力底座'),
  sdk: options?.sdk ?? channel(status === '已开放' || status === '内测中', status, '通过 Product SDK 能力集合接入'),
  cli: options?.cli ?? channel(false, '规划中', '官方 CLI 尚在规划'),
  mcp: options?.mcp ?? channel(false, '规划中', 'MCP 工具目录尚在规划'),
  'agent-skills': options?.['agent-skills'] ?? channel(false, '规划中', 'Agent Skills 尚在规划'),
});

const billing = (mode: AdminBillingMode, unit = '次', unitPrice = '—', extra?: Partial<AdminCapability['billing']>): AdminCapability['billing'] => ({
  mode,
  unit,
  unitPrice,
  priceVisible: mode !== '需申请',
  freeQuota: mode === '免费' ? '不限' : '按组织套餐配置',
  enterprisePrice: '按企业合同',
  refundOnFailure: true,
  retryCharge: false,
  effectiveAt: '2026-11-01 00:00',
  ...extra,
});

const existingCapability = (item: { code: string; name: string; category: string; description: string }, index: number): AdminCapability => ({
  id: `cap-${item.code}`,
  capabilityCode: item.code,
  name: item.name,
  category: item.category,
  description: item.description,
  publicName: item.name,
  publicDescription: item.description,
  source: 'existing_open_platform',
  status: '已开放',
  version: 'v1',
  order: index + 1,
  docsUrl: OPEN_PLATFORM_SOURCE_URL,
  exampleUrl: OPEN_PLATFORM_SOURCE_URL,
  publicVisible: true,
  allowAi: item.category === 'AI' || item.category === '图片编辑',
  requireConfirmation: item.category === '企业' || item.category === '品牌',
  channels: defaultChannels('已开放', {
    api: channel(true, '已有接口', '已有开放平台 HTTP 接口'),
    sdk: channel(item.category !== '企业', 'SDK 支持', item.category !== '企业' ? '已有 SDK 能力或产品集成' : '企业接入需申请'),
  }),
  billing: billing(item.category === 'AI' ? '按积分计费' : item.category === '企业' ? '需申请' : '按调用次数', item.category === 'AI' ? '积分' : '次', item.category === 'AI' ? '按模型配置' : '按套餐配置'),
  stats: { calls: 8600 - index * 418, points: item.category === 'AI' ? 18200 - index * 760 : 0, successRate: 99.7 - index * 0.08 },
  updatedAt: '2026-11-03 10:20',
});

const planningCapability = (code: string, name: string, category: string, description: string, index: number): AdminCapability => ({
  id: `plan-${code}`,
  capabilityCode: code,
  name,
  category,
  description,
  publicName: name,
  publicDescription: description,
  source: 'product_planning',
  status: '规划中',
  version: '规划中',
  order: 20 + index,
  docsUrl: OPEN_PLATFORM_SOURCE_URL,
  exampleUrl: '',
  publicVisible: false,
  allowAi: category === 'AI',
  requireConfirmation: category === '企业',
  channels: defaultChannels('规划中', {
    api: channel(false, '规划中', '统一能力目录规划中'),
    sdk: channel(false, '规划中', 'Product SDK 模块规划中'),
  }),
  billing: billing(category === 'AI' ? '按积分计费' : '需申请', category === 'AI' ? '积分' : '—', '待配置', { priceVisible: false }),
  stats: { calls: 0, points: 0, successRate: 0 },
  updatedAt: '2026-11-03 09:30',
});

export const developerPlatformAdminCapabilitiesFallback: AdminCapability[] = [
  existingCapability({ code: 'template.search', name: '模板搜索', category: '模板', description: '按场景、行业、标签和关键词检索官方模板。' }, 0),
  existingCapability({ code: 'template.design', name: '模板设计', category: '设计', description: '打开模板编辑器并创建可继续编辑的设计。' }, 1),
  existingCapability({ code: 'design.create', name: '设计创建', category: '设计', description: '创建设计草稿、复制设计并查询设计详情。' }, 2),
  existingCapability({ code: 'design.export', name: '设计导出', category: '导出', description: '导出 PNG、PDF、PPT、MP4、PSD 等设计结果。' }, 3),
  existingCapability({ code: 'image.edit', name: '图片编辑', category: '图片编辑', description: '提供裁剪、滤镜、文字、水印和抠图能力。' }, 4),
  existingCapability({ code: 'ai.creation', name: 'AI 创作', category: 'AI', description: '接入 AI 生图、改图、商品图和异步任务能力。' }, 5),
  existingCapability({ code: 'material.library', name: '素材与资源管理', category: '素材', description: '查询官方素材、收藏素材并管理设计资源。' }, 6),
  existingCapability({ code: 'file.parse', name: '文件解析', category: '任务', description: '上传并解析 PSD 等文件，返回异步任务结果。' }, 7),
  existingCapability({ code: 'enterprise.access', name: '企业接入', category: '企业', description: '提供团队、组织授权和企业资源库接入能力。' }, 8),
  existingCapability({ code: 'brand.asset', name: '品牌资产', category: '品牌', description: '读取企业品牌模板、字体、颜色和资产权限。' }, 9),
  planningCapability('ai.capability', '统一 AI Capability', 'AI', '统一发现 AI 能力、参数和消耗预估。', 0),
  planningCapability('task.center', '统一任务中心', '任务', '统一管理 AI、导出、解析和批量任务。', 1),
  planningCapability('product.sdk', '统一 Product SDK', '设计', '将账号、模板、设计、AI、DAM 和企业能力组合为 SDK 家族。', 2),
  planningCapability('official.cli', '官方 CLI', '企业', '通过命令行完成登录、调用、任务恢复和 JSON 输出。', 3),
  planningCapability('official.mcp', '官方 MCP', '企业', '为 AI Agent 提供动态 Tool 发现与 OAuth 授权。', 4),
  planningCapability('batch.design', '批量设计 API', '设计', '支持批量模板生产、字段替换和结果导出。', 5),
  planningCapability('structured.edit', '结构化设计操作', '设计', '按元素、文本、图片和页面操作设计结构。', 6),
  planningCapability('brand.check', '品牌与合规检查', '品牌', '在生成、编辑和发布前检查品牌与合规规则。', 7),
];

export const developerPlatformAdminSdkModulesFallback: AdminSdkModule[] = [
  { id: 'sdk-foundation', name: 'Foundation SDK', description: '应用初始化、错误模型、请求签名与环境管理。', languages: ['JavaScript', 'TypeScript'], packageName: '@chuangkit/sdk', currentVersion: '1.0.0', minVersion: '—', installCommand: 'npm install @chuangkit/sdk', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: false, source: 'product_planning' },
  { id: 'sdk-account', name: '账号与授权 SDK', description: 'OAuth、组织授权、Scope 与用户身份。', languages: ['JavaScript', 'Server'], packageName: '@chuangkit/auth', currentVersion: '0.6.0-beta', minVersion: '0.6.0', installCommand: 'npm install @chuangkit/auth', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: true, source: 'existing_open_platform' },
  { id: 'sdk-template', name: '模板与素材 SDK', description: '模板中心、官方素材、收藏与资源选择器。', languages: ['JavaScript', '移动端'], packageName: '@chuangkit/template', currentVersion: '2.1.4', minVersion: '1.3.8', installCommand: 'npm install @chuangkit/template', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: true, source: 'existing_open_platform' },
  { id: 'sdk-design', name: '设计与导出 SDK', description: '模板编辑器、图片编辑器、设计保存与导出。', languages: ['JavaScript', 'WebView'], packageName: '@chuangkit/design', currentVersion: '2.1.4', minVersion: '1.0.0', installCommand: 'npm install @chuangkit/design', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: true, source: 'existing_open_platform' },
  { id: 'sdk-ai', name: 'AI 能力 SDK', description: 'AI 生图、改图、抠图和任务结果事件。', languages: ['JavaScript', 'Server'], packageName: '@chuangkit/ai', currentVersion: '0.8.0-beta', minVersion: '0.8.0', installCommand: 'npm install @chuangkit/ai', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: false, source: 'product_planning' },
  { id: 'sdk-task', name: '任务与 Webhook SDK', description: '异步任务查询、重试、回调和失败恢复。', languages: ['Server', 'CLI'], packageName: '@chuangkit/task', currentVersion: '0.4.0-beta', minVersion: '0.4.0', installCommand: 'npm install @chuangkit/task', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: false, source: 'product_planning' },
  { id: 'sdk-dam', name: 'DAM SDK', description: '企业资源库、文件夹、标签和资源权限。', languages: ['JavaScript', 'Server'], packageName: '@chuangkit/dam', currentVersion: '0.3.0-beta', minVersion: '0.3.0', installCommand: 'npm install @chuangkit/dam', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: false, source: 'product_planning' },
  { id: 'sdk-brand', name: 'Brand SDK', description: '品牌资产、品牌规则与合规检查。', languages: ['JavaScript', 'Server'], packageName: '@chuangkit/brand', currentVersion: '0.2.0-beta', minVersion: '0.2.0', installCommand: 'npm install @chuangkit/brand', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: false, source: 'product_planning' },
  { id: 'sdk-component', name: '组件与嵌入 SDK', description: '将模板、编辑器和资源能力嵌入业务页面。', languages: ['JavaScript'], packageName: '@chuangkit/components', currentVersion: '0.5.0-beta', minVersion: '0.5.0', installCommand: 'npm install @chuangkit/components', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: false, source: 'product_planning' },
  { id: 'sdk-editor', name: 'Editor SDK', description: 'Product SDK 家族中的编辑器能力模块。', languages: ['Web', '移动端'], packageName: '@chuangkit/editor', currentVersion: '2.1.4', minVersion: '1.0.0', installCommand: 'npm install @chuangkit/editor', docsUrl: OPEN_PLATFORM_SOURCE_URL, exampleUrl: OPEN_PLATFORM_SOURCE_URL, publicOpen: true, source: 'existing_open_platform' },
];

export const developerPlatformAdminAppsFallback: AdminApp[] = [
  { appId: 'app_7N4K2P', name: '营销物料自动化', developer: '赵文文', organization: '创客贴 · 品牌增长组', status: '运行中', authorizedUsers: 18, calls: 28400, successRate: 99.6, points: 3260, lastCall: '2 分钟前', createdAt: '2026-08-12', integrations: ['api', 'sdk'], scopes: ['template.read', 'design.create', 'design.export'], quotas: { apiRequests: 100000, aiPoints: 5000 } },
  { appId: 'app_2B8Q4P', name: '内容团队素材助手', developer: '李辰晨', organization: '创客贴 · 内容团队', status: '运行中', authorizedUsers: 9, calls: 8900, successRate: 98.9, points: 1780, lastCall: '1 小时前', createdAt: '2026-09-03', integrations: ['api', 'mcp'], scopes: ['material.read', 'brand.read'], quotas: { apiRequests: 60000, aiPoints: 3000 } },
  { appId: 'app_5P1X9C', name: '海外落地页生成器', developer: '王可', organization: '外部开发者', status: '已停用', authorizedUsers: 3, calls: 2100, successRate: 96.8, points: 640, lastCall: '2026-10-11', createdAt: '2026-07-25', integrations: ['api'], scopes: ['template.read', 'design.export'], quotas: { apiRequests: 20000, aiPoints: 1000 } },
  { appId: 'app_8M3D1A', name: '品牌合规 Agent', developer: '企业服务组', organization: '创客贴企业服务', status: '待审核', authorizedUsers: 0, calls: 0, successRate: 0, points: 0, lastCall: '—', createdAt: '2026-10-29', integrations: ['mcp', 'agent-skills'], scopes: ['brand.read', 'brand.check'], quotas: { apiRequests: 30000, aiPoints: 2000 } },
];

export const developerPlatformAdminTasksFallback: AdminTask[] = [
  { taskId: 'task_20261103_0012', appName: '营销物料自动化', capability: 'AI 创作', channel: 'api', status: '运行中', createdAt: '10:22:11', startedAt: '10:22:12', completedAt: '—', duration: '8s', points: 12, failureReason: '—', retries: 0 },
  { taskId: 'task_20261103_0011', appName: '内容团队素材助手', capability: '模板搜索', channel: 'mcp', status: '已成功', createdAt: '10:18:42', startedAt: '10:18:42', completedAt: '10:18:45', duration: '3s', points: 0, failureReason: '—', retries: 0 },
  { taskId: 'task_20261103_0010', appName: '营销物料自动化', capability: '设计导出', channel: 'sdk', status: '已失败', createdAt: '09:55:08', startedAt: '09:55:09', completedAt: '09:55:32', duration: '23s', points: 0, failureReason: '素材下载超时', retries: 2 },
  { taskId: 'task_20261103_0009', appName: '海外落地页生成器', capability: '文件解析', channel: 'api', status: '已取消', createdAt: '09:43:18', startedAt: '—', completedAt: '—', duration: '—', points: 0, failureReason: '应用已停用', retries: 0 },
  { taskId: 'task_20261103_0008', appName: '品牌合规 Agent', capability: '品牌资产', channel: 'agent-skills', status: '排队中', createdAt: '09:37:20', startedAt: '—', completedAt: '—', duration: '—', points: 0, failureReason: '—', retries: 0 },
];

export const developerPlatformAdminAuditLogsFallback: AdminAuditLog[] = [
  { id: 'log_001', operator: '赵文文', module: '能力中心', action: '编辑能力', objectName: 'AI 创作', before: 'allowAI=false', after: 'allowAI=true', createdAt: '2026-11-03 10:11:24', ip: '10.24.18.6', requestId: 'req_9f2d8c' },
  { id: 'log_002', operator: '李辰晨', module: '应用管理', action: '调整权限', objectName: '内容团队素材助手', before: 'material.read', after: 'material.read, brand.read', createdAt: '2026-11-03 09:42:10', ip: '10.24.18.8', requestId: 'req_9f2d10' },
  { id: 'log_003', operator: '赵文文', module: '能力中心', action: '发布能力', objectName: '模板搜索', before: '内测中', after: '已开放', createdAt: '2026-11-02 18:20:03', ip: '10.24.18.6', requestId: 'req_8ab112' },
  { id: 'log_004', operator: '系统', module: '计费与额度', action: '更新计费规则', objectName: 'AI 创作', before: '按调用次数', after: '按积分计费', createdAt: '2026-11-01 15:08:46', ip: '10.24.0.4', requestId: 'req_7c2e90' },
];

const STORE_KEY = 'admin-developer-platform-mvp-store';
const APP_CONFIG_KEY = 'developer-platform-console-app-configs';

const cloneStore = (store: DeveloperPlatformAdminStore): DeveloperPlatformAdminStore => JSON.parse(JSON.stringify(store)) as DeveloperPlatformAdminStore;

export const developerPlatformAdminStoreFallback: DeveloperPlatformAdminStore = {
  capabilities: developerPlatformAdminCapabilitiesFallback,
  sdkModules: developerPlatformAdminSdkModulesFallback,
  apps: developerPlatformAdminAppsFallback,
  tasks: developerPlatformAdminTasksFallback,
  auditLogs: developerPlatformAdminAuditLogsFallback,
};

export function getDeveloperPlatformAdminStore(): DeveloperPlatformAdminStore {
  if (typeof window === 'undefined') return cloneStore(developerPlatformAdminStoreFallback);
  try {
    const stored = window.localStorage.getItem(STORE_KEY);
    if (!stored) return cloneStore(developerPlatformAdminStoreFallback);
    const parsed = JSON.parse(stored) as Partial<DeveloperPlatformAdminStore>;
    return {
      capabilities: parsed.capabilities ?? cloneStore(developerPlatformAdminStoreFallback).capabilities,
      sdkModules: parsed.sdkModules ?? cloneStore(developerPlatformAdminStoreFallback).sdkModules,
      apps: parsed.apps ?? cloneStore(developerPlatformAdminStoreFallback).apps,
      tasks: parsed.tasks ?? cloneStore(developerPlatformAdminStoreFallback).tasks,
      auditLogs: parsed.auditLogs ?? cloneStore(developerPlatformAdminStoreFallback).auditLogs,
    };
  } catch {
    return cloneStore(developerPlatformAdminStoreFallback);
  }
}

export function saveDeveloperPlatformAdminStore(store: DeveloperPlatformAdminStore) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Keep the admin MVP usable when localStorage is disabled.
  }
}

const createEnvironmentConfig = (appId: string, environment: DeveloperAppEnvironment): DeveloperAppConfig['environments'][DeveloperAppEnvironment] => {
  const suffix = appId.replace(/^app_/, '').toLowerCase();
  const prefix = environment === '生产环境' ? 'prod' : 'dev';
  return {
    clientId: `ckt_${prefix}_${appId.replace(/^app_/, '')}`,
    clientSecret: `ckts_${prefix}_${suffix}4e2c7b8d`,
    accessKey: `ckak_${prefix}_${suffix}3bb72c9e`,
    callbackUrls: ['https://example.com/oauth/callback'],
    webhookUrl: '',
    domainWhitelist: ['example.com'],
    pkce: true,
    organizationAuthorization: true,
    secretRotatedAt: '2026-11-01 10:20',
  };
};

export function getDeveloperAppConfig(app: AdminApp | string): DeveloperAppConfig {
  const store = getDeveloperPlatformAdminStore();
  const appRecord = typeof app === 'string' ? store.apps.find((item) => item.appId === app) : app;
  const appId = appRecord?.appId ?? String(app);
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(APP_CONFIG_KEY);
      const configs = stored ? JSON.parse(stored) as Record<string, DeveloperAppConfig> : {};
      if (configs[appId]) return configs[appId];
    } catch {
      // Fall through to the deterministic prototype configuration.
    }
  }
  const config: DeveloperAppConfig = {
    appId,
    selectedEnvironment: '生产环境',
    environments: {
      开发环境: createEnvironmentConfig(appId, '开发环境'),
      生产环境: createEnvironmentConfig(appId, '生产环境'),
    },
    integrations: appRecord?.integrations ?? ['api'],
    scopes: appRecord?.scopes ?? ['template.read'],
    updatedAt: appRecord?.createdAt ?? '2026-11-01',
  };
  return config;
}

export function saveDeveloperAppConfig(config: DeveloperAppConfig) {
  if (typeof window === 'undefined') return;
  try {
    const stored = window.localStorage.getItem(APP_CONFIG_KEY);
    const configs = stored ? JSON.parse(stored) as Record<string, DeveloperAppConfig> : {};
    configs[config.appId] = config;
    window.localStorage.setItem(APP_CONFIG_KEY, JSON.stringify(configs));
  } catch {
    // Keep the prototype usable when localStorage is disabled.
  }
}

export function createDeveloperPlatformAdminApp(input: Omit<AdminApp, 'appId' | 'calls' | 'successRate' | 'points' | 'lastCall' | 'createdAt'> & Partial<Pick<AdminApp, 'calls' | 'successRate' | 'points' | 'lastCall' | 'createdAt'>>): AdminApp {
  const current = getDeveloperPlatformAdminStore();
  const appId = `app_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const nextApp: AdminApp = {
    ...input,
    appId,
    calls: input.calls ?? 0,
    successRate: input.successRate ?? 0,
    points: input.points ?? 0,
    lastCall: input.lastCall ?? '暂无调用',
    createdAt: input.createdAt ?? new Date().toISOString().slice(0, 10),
    quotas: input.quotas ?? { apiRequests: 50000, aiPoints: 2000 },
  };
  saveDeveloperPlatformAdminStore({ ...current, apps: [nextApp, ...current.apps], auditLogs: [createAdminAuditLog('应用管理', '创建应用', nextApp.name, '—', `${nextApp.appId} / ${nextApp.status}`), ...current.auditLogs] });
  return nextApp;
}

export function getDeveloperPlatformAdminOverview(store: DeveloperPlatformAdminStore): AdminOverview {
  const capabilities = store.capabilities;
  const apps = store.apps;
  const tasks = store.tasks;
  const calls = capabilities.reduce((sum, item) => sum + item.stats.calls, 0);
  const points = capabilities.reduce((sum, item) => sum + item.stats.points, 0);
  const opened = capabilities.filter((item) => item.status === '已开放').length;
  const beta = capabilities.filter((item) => item.status === '内测中').length;
  const planning = capabilities.filter((item) => item.status === '规划中').length;
  const failureCount = tasks.filter((item) => item.status === '已失败').length;
  const dates = ['10/28', '10/29', '10/30', '10/31', '11/01', '11/02', '11/03'];
  const callFactors = [0.66, 0.78, 0.73, 0.86, 0.91, 0.96, 1];
  const pointFactors = [0.48, 0.55, 0.63, 0.58, 0.74, 0.82, 1];
  const statusColor: Record<string, string> = { 已开放: '#36b37e', 内测中: '#f5a623', 规划中: '#9aa8ba', 草稿: '#b6c2d0', 维护中: '#5b8def', 已废弃: '#8b93a1', 已下线: '#667085' };
  const channels: { id: AdminChannelId; label: string; color: string }[] = [
    { id: 'api', label: 'Open API', color: '#377dff' },
    { id: 'sdk', label: 'Product SDK', color: '#7b61ff' },
    { id: 'cli', label: 'CLI', color: '#27a99d' },
    { id: 'mcp', label: 'MCP', color: '#ef7c50' },
    { id: 'agent-skills', label: 'Agent Skills', color: '#c58a32' },
  ];
  return {
    stats: {
      capabilityTotal: capabilities.length,
      openedCapabilities: opened,
      planningCapabilities: planning,
      betaCapabilities: beta,
      appsTotal: apps.length,
      activeApps: apps.filter((item) => item.status === '运行中').length,
      totalCalls: calls,
      todayCalls: Math.round(calls * 0.08),
      totalPoints: points,
      todayPoints: Math.round(points * 0.07),
      failedTasks: failureCount,
    },
    callTrend: dates.map((date, index) => ({ date, value: Math.round(calls * 0.055 * callFactors[index]) })),
    pointsTrend: dates.map((date, index) => ({ date, value: Math.round(points * 0.055 * pointFactors[index]) })),
    statusDistribution: [...new Set(capabilities.map((item) => item.status))].map((label) => ({ label, value: capabilities.filter((item) => item.status === label).length, color: statusColor[label] ?? '#98a2b3' })),
    channelDistribution: channels.map((item) => ({ label: item.label, value: capabilities.filter((capability) => capability.channels[item.id].enabled).length, color: item.color })),
    capabilityRanks: [...capabilities].sort((a, b) => b.stats.calls - a.stats.calls).slice(0, 10).map((item) => ({ name: item.name, category: item.category, calls: item.stats.calls, successRate: item.stats.successRate })),
    appRanks: [...apps].sort((a, b) => b.calls - a.calls).slice(0, 10).map((item) => ({ name: item.name, organization: item.organization, calls: item.calls, points: item.points })),
  };
}

export function createAdminAuditLog(module: string, action: string, objectName: string, before: string, after: string): AdminAuditLog {
  return {
    id: `log_${Date.now()}`,
    operator: '赵文文',
    module,
    action,
    objectName,
    before,
    after,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    ip: '10.24.18.6',
    requestId: `req_${Math.random().toString(16).slice(2, 8)}`,
  };
}
