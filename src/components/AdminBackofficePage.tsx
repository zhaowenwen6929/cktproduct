import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Code2,
  Database,
  FileText,
  Grid2X2,
  KeyRound,
  LayoutDashboard,
  Menu,
  Pencil,
  PlayCircle,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import { RequirementDocumentDrawer, type RequirementSpec } from './RequirementDocumentPage';
import { MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS, MEMBERSHIP_WEB_CANVAS_ENTRY_REQUIREMENT_META, MEMBERSHIP_WEB_CANVAS_ENTRY_REQUIREMENT_SECTIONS, MEMBERSHIP_WEB_ENTRY_REQUIREMENT_META, MEMBERSHIP_WEB_ENTRY_REQUIREMENT_SECTIONS, MEMBERSHIP_WEB_PAYMENT_REQUIREMENT_META, MEMBERSHIP_WEB_PAYMENT_REQUIREMENT_SECTIONS, type MembershipRequirementSection } from './MembershipRequirementFloatingButton';

type SkillOption = {
  label: string;
  value: string;
  promptValue?: string;
};

type SkillField = {
  key: string;
  type: string;
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
  options?: SkillOption[];
  maxCount?: number;
  upload?: {
    mode?: string;
    sources?: string[];
    mediaRole?: string;
    showRemove?: boolean;
    acceptMediaTypes?: string[];
  };
  props?: {
    placeholder?: string;
    maxLength?: number;
  };
  promptBinding?: {
    label?: string;
    emptyValue?: string;
    source?: string;
  };
};

type SkillConfig = {
  skillCode: string;
  name?: string;
  description?: string;
  preview?: {
    visible?: boolean;
    slides?: unknown[];
    autoplay?: boolean;
    loop?: boolean;
    intervalMs?: number;
  };
  optionSets?: Record<string, unknown>;
  fields?: SkillField[];
  linkageRules?: unknown[];
  promptTemplate?: {
    separator?: string;
    template?: string;
  };
  actions?: {
    fillPrompt?: { enabled?: boolean; text?: string };
    generate?: { enabled?: boolean; text?: string; target?: string };
  };
};

type RecentAiEcommerceQuery = {
  functionCode: string;
  scene: string;
};

const RECENT_AI_ECOMMERCE_QUERIES_KEY = 'admin-ai-ecommerce-recent-queries';
const MONI_AGENT_SKILL_CONFIG_ENDPOINT = '/api/moni-agent-skill-config';
const AI_ECOMMERCE_QUERY_EXAMPLE = {
  functionCode: 'ags-aplus-detail',
  scene: '',
};

const DEFAULT_SKILL_CONFIG: SkillConfig = {
  skillCode: 'ags-live-visual-material',
  name: '直播视觉物料',
  description: '根据直播平台、主题和物料类型，生成直播间背景、直播预告、直播贴片或直播截图。',
  preview: {
    visible: false,
    slides: [],
    autoplay: true,
    loop: true,
    intervalMs: 2600,
  },
  optionSets: {},
  fields: [
    {
      key: 'materialType',
      type: 'radio',
      label: '物料类型',
      description: '选择需要生成的直播视觉物料类型',
      required: true,
      options: [
        { label: '直播间背景', value: 'live-background', promptValue: 'live-background' },
        { label: '直播预告', value: 'live-preview', promptValue: 'live-preview' },
        { label: '直播贴片', value: 'live-sticker', promptValue: 'live-sticker' },
        { label: '直播截图', value: 'live-screenshot', promptValue: 'live-screenshot' },
      ],
      promptBinding: { label: '物料类型', emptyValue: '未选择' },
    },
    {
      key: 'platform',
      type: 'input',
      label: '直播平台',
      description: '不填写时按通用直播场景处理',
      required: false,
      props: { maxLength: 100, placeholder: '如抖音、快手、小红书、视频号等，不填按通用直播处理' },
      promptBinding: { label: '直播平台', emptyValue: '通用直播' },
    },
    {
      key: 'canvas',
      type: 'ratio',
      label: '画布比例',
      description: '未指定时默认按竖屏直播处理',
      required: false,
      defaultValue: '9:16',
      options: [
        { label: '9:16竖屏', value: '9:16', promptValue: '9:16竖屏' },
        { label: '16:9横屏', value: '16:9', promptValue: '16:9横屏' },
        { label: '1:1方形', value: '1:1', promptValue: '1:1方形' },
        { label: '4:5竖版', value: '4:5', promptValue: '4:5竖版' },
      ],
      promptBinding: { label: '画布比例', emptyValue: '9:16竖屏' },
    },
    {
      key: 'content',
      type: 'textarea',
      label: '直播主题、商品或内容',
      description: '填写直播主题、商品或内容对象、品牌名称等核心信息',
      required: true,
      props: { maxLength: 1000, placeholder: '如直播主题、商品名称、品牌名称、课程主题或活动内容等' },
      promptBinding: { label: '直播主题、商品或内容', emptyValue: '未填写' },
    },
    {
      key: 'referenceAssets',
      type: 'media-upload',
      label: '参考素材',
      description: '可上传主播、商品、品牌或直播场景参考图',
      required: false,
      maxCount: 10,
      upload: { mode: 'multiple', sources: ['local', 'library'], mediaRole: 'reference', showRemove: true, acceptMediaTypes: ['image'] },
      promptBinding: { label: '参考素材', source: 'assetSummary', emptyValue: '未上传参考素材' },
    },
    {
      key: 'otherRequirements',
      type: 'textarea',
      label: '其他要求',
      description: '可填写视觉风格、投放位置、透明背景、需要保留的直播 UI 等要求',
      required: false,
      props: { maxLength: 1000, placeholder: '如视觉风格、颜色、主播或商品留位、透明背景、直播UI、价格或互动入口等' },
      promptBinding: { label: '其他要求', emptyValue: '按目标物料类型自动判断' },
    },
  ],
  linkageRules: [],
  promptTemplate: {
    separator: '\n',
    template: '请根据以下信息生成直播视觉物料：\n场景：live-stream\n目标子场景：{{materialType.promptValue}}\n直播平台：{{platform.promptValue}}\n画布比例：{{canvas.promptValue}}\n直播主题、商品或内容（required_content）：{{content.promptValue}}\n参考素材：{{referenceAssets.assetSummary}}\n视觉风格、投放位置与限制（visual_style、placement、negative_constraints）：{{otherRequirements.promptValue}}',
  },
  actions: {
    fillPrompt: { enabled: true, text: '带入输入框' },
    generate: { enabled: true, text: '开始生成', target: 'infinite-canvas' },
  },
};

type NavItem = string | {
  label: string;
  expanded?: boolean;
  children?: NavItem[];
};

type NavGroup = {
  label: string;
  icon: typeof Users;
  expanded?: boolean;
  children?: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  { label: '企业账号管理（2.0）', icon: Users },
  { label: '灵感社区', icon: Sparkles, expanded: false, children: ['灵感专题', '提示词库', '灵感作品管理', '活动管理', '玩法专题', '玩法管理', 'AI电商配置'] },
  { label: '系统管理', icon: Settings2 },
  {
    label: '内容运营管理',
    icon: FileText,
    expanded: false,
    children: [
      '模板数据统计',
      {
        label: '内容运营基础设施',
        expanded: true,
        children: ['模板搜索结果排序', '模板管理', '模板搜索结果排序(新版)', '模板解决方案', '套装管理', '营销日历'],
      },
      {
        label: '搜索管理',
        expanded: true,
        children: [
          '向量搜索黑名单',
          '关键词多路召回干预',
          '实体词典',
          '搜索引导管理',
        ],
      },
    ],
  },
  { label: '设计师工具箱', icon: SlidersHorizontal },
  {
    label: '创客贴版权资源库',
    icon: ShieldCheck,
    expanded: false,
    children: [
      '版权资源库',
      '授权信息黑白名单',
      '授权信息管理与查询',
      '授权记录查询与管理',
      '维权信息校验',
      '版权结算',
    ],
  },
  { label: '创客贴模板库管理', icon: LayoutDashboard },
  { label: '内容库分发管理', icon: Database },
  { label: '数据增长', icon: PlayCircle },
  { label: '定制设计', icon: Pencil },
  { label: '模板数据统计', icon: Clipboard },
  { label: 'SEO管理', icon: Search },
  { label: '印刷管理', icon: FileText },
  { label: 'AI创作管理', icon: Sparkles },
  { label: '功能管理', icon: Settings2 },
  { label: '智能设计管理', icon: Code2 },
  {
    label: '会员中心',
    icon: Users,
    expanded: false,
    children: [
      '开通会员',
      '会员退款',
      '销售线索',
      '企业版数据-功能停用不…',
      '企业团队列表',
      '团队销售线索',
      'IOS丢失订单找回处理',
      '会员套餐管理',
      '会员页面配置',
    ],
  },
  {
    label: '用户中心',
    icon: Users,
    expanded: false,
    children: [
      '账户注销',
      '注销记录',
      '用户分群',
      'AB测试管理',
    ],
  },
  {
    label: '会员激活码',
    icon: KeyRound,
    expanded: false,
    children: ['活动列表', '渠道商', '定制页面配置', '兑换码查询'],
  },
  {
    label: '授权管理',
    icon: Users,
    expanded: false,
    children: [
      '用户授权信息查看',
      '授权类型管理',
      '授权范围设置',
      '版权方管理',
    ],
  },
];

const prettyJson = (config: SkillConfig) => JSON.stringify(config, null, 2);

type RequirementNavItem = {
  id: string;
  title: string;
  navLabels?: string[];
  projectName?: string;
  level: 'main' | 'sub';
  requirementKey: string;
  parentId?: string;
  requirement: string;
  summary: string;
  details: string[];
  addedAt: string;
  releasedAt?: string;
  status: '待开发' | '已上线';
  path: string;
};

const MEMBERSHIP_REQUIREMENT_DESCRIPTION_ITEMS = [
  '①新增 5 个会员等级：基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312。',
  '②会员积分支持按套餐配置和发放。',
  '③会员购买弹框升级为全屏大弹框，增加权益展示及 AI 模型消耗。',
  '④各端支持新会员等级的显示及权益响应。',
];
const MEMBERSHIP_REQUIREMENT_DESCRIPTION = MEMBERSHIP_REQUIREMENT_DESCRIPTION_ITEMS.join('\n');
const MEMBERSHIP_REQUIREMENT_BACKGROUND = '会员后台、会员购买弹框和补差价升级页需要共同承载新版个人/企业会员等级，但原有入口无法完整表达套餐积分、企业席位、权益和 AI 模型消耗，导致后台配置与前台展示口径容易分散。';
const MEMBERSHIP_REQUIREMENT_GOAL = '建立统一的 V2610 会员等级、套餐、积分、权益、支付和升级展示口径，保证设计页外入口、会员购买弹框、补差价升级页及各端页面均能按同一套新等级和映射规则展示并响应。';

const REQUIREMENT_NAV_ITEMS: RequirementNavItem[] = ([
  { id: 'developer-platform', title: '创客贴开放平台·开发者中心', projectName: '创客贴开放平台·开发者中心', level: 'main', requirementKey: 'DP-2610', requirement: '建设承载应用注册、凭证管理、OAuth 授权、REST API、CLI、MCP 接入、调用管理和组织权限的开发者中心，帮助开发者在 10 分钟内完成第一次安全调用。', summary: '面向个人开发者、企业技术团队和 AI Agent，提供从创建应用到 API/MCP 调用的完整接入闭环。', details: ['提供开发者平台首页与控制台总览，突出创建应用、获取凭证和开始调用三个核心动作。', '应用支持基本信息、集成方式、OAuth 回调、域名白名单、Webhook、环境和组织授权配置。', '凭证按开发/生产环境管理 Client ID、Client Secret、Access Key、Secret Key、Access Token 和 Refresh Token；Secret 只显示一次，重新生成必须二次确认。', 'REST API、CLI、MCP 共用应用、OAuth、Scope 和调用日志模型；MCP 提供 Server URL、客户端配置、连接测试和组织授权提示。', '按能力域配置 Scope，危险权限明确标识 AI 额度、设计修改、删除资源、发布设计和企业品牌资产影响。', '测试台支持模板、素材、设计、AI 商品图、导出和异步任务示例，并展示 JSON、任务 ID、请求耗时、错误码和额度消耗。', '调用量、额度、调用日志和团队权限支持按应用/组织/工具查看，组织管理员可处理待授权应用和额度设置。', '新增开放平台能力清单，集中整理 38 个 HTTP 接口、10 类 SDK、前端回调/事件、关键返回字段和签名规则；每条明细保留原始文档来源地址，便于开发者查阅与对照。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-home', title: '开发者平台首页', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '提供中文优先的开放平台首页，让未登录用户理解产品价值并进入控制台。', summary: '展示 REST API、CLI、MCP 三种接入方式，以及快速开始、文档和开发者资源入口。', details: ['展示产品价值、三种接入方式、快速开始、API/MCP 文档、GitHub、SDK 和示例入口。', '提供创建应用、进入控制台、查看快速开始三个首屏动作，并预留中文/英文切换入口。', '首页以“10 分钟完成第一次调用”为设计目标，明确创建应用、获取凭证、连接工具、测试调用四步。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-console', title: '开发者控制台总览', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '建设 B 端开发者控制台总览，聚合组织、应用、调用量、额度和最近活动。', summary: '通过左侧导航、组织切换和数据卡片，让开发者快速找到下一步接入动作。', details: ['左侧导航包含总览、我的应用、API 文档、MCP 接入、CLI 工具、API/MCP 测试台、调用量与额度、调用日志、团队与权限和开发者设置。', '顶部提供组织切换、生产/开发环境提示、通知、帮助和个人账号入口。', '主内容展示今日调用、活跃应用、额度消耗、成功率、快速开始进度、应用列表和最近活动。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-apps', title: '应用列表', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '提供应用列表和应用生命周期管理能力。', summary: '支持应用搜索、筛选、排序、查看、编辑、停用和删除，并覆盖空应用列表状态。', details: ['列表展示应用名称、图标、应用类型、所属组织、接入方式、状态、最近调用和创建时间。', '支持搜索、状态筛选、创建时间排序、查看应用详情、停用和删除二次确认。', '空状态引导创建第一个应用；已停用应用保留历史调用和凭证状态提示。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-create-app', title: '创建应用向导', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '以 4 步向导完成应用注册、接入方式、授权配置和创建确认。', summary: '降低首次接入门槛，创建成功后直接引导用户查看 Client ID 和 Secret。', details: ['第一步填写应用名称、Logo、描述、应用类型、所属组织和应用用途。', '第二步选择 REST API、CLI、MCP、SDK，并展示适用用户、能力范围、所需凭证、OAuth 和企业审核要求。', '第三步配置 OAuth 回调、域名白名单、Webhook、开发/生产地址、PKCE 和组织级授权。', '第四步确认应用信息、集成方式、默认权限和安全提示；成功后显示创建成功状态并进入应用概览。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-app-overview', title: '应用概览', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '提供单个应用的概览和快速操作入口。', summary: '集中展示应用状态、凭证、授权用户、调用量、额度和最近调用。', details: ['展示应用名称、状态、Client ID、当前环境、应用类型和所属组织。', '展示已授权用户数、今日调用量、本月额度消耗、平均响应时间和最近调用记录。', '提供查看凭证、配置权限、配置 OAuth、测试 API、查看 MCP 配置和查看文档等快速操作。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-credentials', title: '应用凭证', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '提供按环境隔离的凭证查看、复制、过期、撤销和轮换能力。', summary: '安全管理 Client ID、Client Secret、Access Key、Secret Key、Access Token 和 Refresh Token。', details: ['开发环境和生产环境分别展示 Client ID、Client Secret、Access Key、Secret Key、Access Token 和 Refresh Token。', 'Secret 默认隐藏且只在生成时显示一次；支持复制、备注、设置过期时间、重新生成和撤销。', '重新生成和撤销必须二次确认，说明旧凭证失效影响；页面明确提示 Secret 不能放在前端、GitHub 或公开代码仓库。', '记录凭证最后使用时间、有效/过期状态和对应环境。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-integrations', title: '集成方式', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '在同一应用下提供 REST API、CLI、MCP 三种集成方式的配置与文档入口。', summary: '统一展示 Base URL、命令、MCP Server URL、鉴权方式、示例和连接测试。', details: ['REST API Tab 展示 API Base URL、鉴权方式、请求/返回示例、错误码、限流规则和复制代码。', 'CLI Tab 展示安装、登录、初始化、查看工具、调用任务、查询任务、JSON 输出和 macOS/Windows/Linux 说明。', 'MCP Tab 展示 Server URL、OAuth 入口、客户端配置、支持工具、权限说明、测试连接和 Claude/Cursor/Codex/ChatGPT 指引。', 'MCP 连接状态需覆盖连接成功、连接失败、授权中和授权失败，并关联当前应用权限和调用日志。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-oauth', title: 'OAuth 与回调地址', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '提供 OAuth 回调地址、域名白名单、PKCE 和组织级授权配置。', summary: '让开发者能区分开发/生产环境配置，并让企业管理员明确授权范围。', details: ['支持开发环境、生产环境、本地调试地址，并展示已验证、待验证和失效状态。', '支持新增、编辑、删除回调地址，生产环境必须 HTTPS，localhost 仅允许开发环境。', '支持启用 PKCE 和组织级授权；授权流程展示发起授权、用户确认、回跳换 Token 和开始调用。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-scopes', title: '权限 Scope', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '按能力域配置应用权限，并在授权前解释数据范围、确认要求和费用影响。', summary: '覆盖账号组织、模板、素材、设计、AI、品牌资产、评论协作和资源管理权限。', details: ['按账号与组织、模板读取、素材读取/上传、设计读取/创建/编辑/导出、AI 图片生成、AI 商品图、品牌资产、评论协作、删除和移动资源分组。', '每个权限展示名称、描述、读/写/删除等级、是否需要用户确认、是否需要企业管理员授权和可能产生的积分/费用。', '危险权限使用醒目标识，重点提示 AI 额度、修改现有设计、删除素材、发布设计和访问企业品牌资产。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-tester', title: 'API / MCP 测试台', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '提供可在线执行的 API/MCP 调试工具，帮助开发者完成第一次调用。', summary: '通过工具列表、参数表单和结果区完成模板搜索、设计创建、AI 生成、导出和任务查询。', details: ['左侧支持工具分类、工具搜索、工具名称和权限标签；中间支持参数表单、JSON 编辑器、文件上传、图片预览和异步开关。', '右侧展示请求结果、返回 JSON、请求耗时、任务 ID、结果预览、错误信息和复制代码。', '提供搜索模板、获取模板详情、搜索素材、创建设计草稿、AI 商品图生成、导出 PNG、查询异步任务示例。', '覆盖 API 调用成功、失败、异步处理中、异步成功、异步失败、额度不足、超出限流和无权限状态。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-usage', title: '调用量与额度', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '提供调用趋势、成功率、响应时间、额度和限流状态的可观测视图。', summary: '帮助开发者判断应用是否健康、额度是否充足以及哪类工具需要优化。', details: ['展示今日调用量、近 7 日趋势、API/MCP/CLI 调用次数、AI 积分消耗、失败率、平均响应时间和剩余额度。', '支持按应用、组织、工具维度筛选，并提供额度使用进度和 80%/100% 预警规则。', '调用量和额度页面覆盖加载中、空数据、额度不足和超出限流状态。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-logs', title: '调用日志', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '记录 API、MCP、CLI 调用明细，支持定位请求与错误。', summary: '从请求摘要到响应摘要完整追踪调用方式、工具、状态、耗时和额度消耗。', details: ['字段包含时间、应用、用户、组织、调用方式、工具名称、请求 ID、任务 ID、状态、响应耗时、额度消耗和错误码。', '支持按时间、工具、状态筛选，查看请求摘要、响应摘要和错误详情，复制请求 ID和导出日志。', '日志详情与应用、组织、任务、额度数据关联，应用停用后保留历史记录。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-team', title: '团队与权限', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '支持团队成员、角色、组织授权和审计日志管理。', summary: '满足企业管理员对应用成员、数据范围、额度和最近操作的管理需要。', details: ['角色至少包括所有者、管理员、开发者、只读成员和财务/额度管理员，并展示每个角色的能力边界。', '支持邀请成员、修改角色、移除成员、查看成员最近操作、配置组织授权和查看审计日志。', '待授权应用展示 Scope、数据范围和积分影响；管理员可同意授权、设置额度或拒绝。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-docs', title: '快速开始文档', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '提供 API、CLI、MCP 三种接入方式的快速开始与错误处理文档。', summary: '用可复制的代码、命令和步骤帮助开发者完成第一次安全调用。', details: ['文档覆盖创建应用、获取凭证、选择权限、OAuth 授权、第一次调用和错误处理。', '支持按 REST API、CLI、MCP 切换示例，代码块提供复制反馈，文档入口与测试台互相跳转。', '关键页面补充安全设计、可观测性、限流、异步任务和继续打开设计结果的说明。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'developer-platform-capabilities', title: '开放平台能力清单', projectName: '创客贴开放平台·开发者中心', level: 'sub', requirementKey: 'DP-2610', parentId: 'developer-platform', requirement: '在开发者中心增加开放平台能力清单页，将已有 HTTP 接口、SDK、前端回调与签名规则按统一格式整理，便于开发者查看、搜索和对照。', summary: '集中查看 38 个 HTTP 接口、10 类 SDK 及回调/规则明细，每条内容保留原始语雀来源地址。', details: ['在开发者中心“接入能力”分组新增“开放平台能力”入口，页面提供 HTTP 接口、SDK、回调与规则三个视图，并展示统一生产环境域名。', 'HTTP 接口表完整列出 38 个接口的分类、请求方法、接口地址、必填参数、可选参数/枚举、返回或用途；支持按接口、参数和能力搜索。', 'SDK 表完整列出 10 类 SDK/接入方式的版本要求、初始化必传参数、具体调用/方法和主要能力，并补充模板编辑器、图片编辑器、我的空间等参数参考。', '回调与规则视图整理 Web 编辑器回调、Web 插图、移动端 postMessage、图片回调、无限画布事件、关键返回字段和 SDK 通用签名规则。', '每个接口、SDK、回调、参数参考和规则区块均展示“原始来源”链接；当前粘贴资料只提供统一文档地址 https://chuangkit.yuque.com/qltowx/openapi3.0/ln9rmy，不自行虚构更细分地址。', '资料中仅有功能描述但未展开完整 URL、请求参数和响应字段的图像处理 API、AI 画匠、AI 抠图、AI 智能设计、PicDoc、场景中心，保留范围说明并明确待补充状态。'], addedAt: '2026-10-28', status: '待开发', path: '/developer-platform' },
  { id: 'agent-evaluation-platform', title: 'Agent / Skill 自动化评测平台', projectName: '自动化验证平台', level: 'main', requirementKey: 'AE-2610', requirement: '建立面向 Agent 和 Skill 的离线批量评测工作台，统一管理测试用例、执行接口、Mock 运行、完整轨迹和结果验收。', summary: '通过批量用例、规则评分和执行轨迹，验证 Agent/Skill 的路由、参数、异常兜底和任务完成情况。', details: ['测试用例以业务任务为单位，支持 Agent 路由、Skill 参数、组合任务、冲突识别和异常兜底场景。', '支持 JSON、JSONL、CSV 用例导入，统一记录目标、输入、期望结果、优先级和标签。', '支持 Mock Runner 批量执行，预留真实 Agent 接口配置，并展示进度、耗时、通过率和失败样本。', '失败样本可查看期望结果、实际结果、路由信息、工具调用和断言校验等执行轨迹。'], addedAt: '2026-10-28', status: '待开发', path: '/admin-backoffice/requirements/agent-eval' },
  { id: 'agent-evaluation-workbench', title: 'Agent / Skill 评测工作台', projectName: '自动化验证平台', level: 'sub', requirementKey: 'AE-2610', parentId: 'agent-evaluation-platform', requirement: '实现自动化验证平台的 MVP 评测工作台。', summary: '提供用例管理、接口配置、执行控制、运行日志和结果详情，支持一轮完整的 Mock 回归验证。', details: ['用例集支持载入示例、导入 JSON/JSONL/CSV，并展示类型、目标、优先级、输入和标签。', '接口配置支持配置名称、请求方法、接口地址、认证方式、超时和 Token；默认开启 Mock Runner。', '执行控制支持全量 Agent + Skill 用例、并发数、进度条、开始执行和暂停操作。', '执行结果支持通过率、平均耗时、失败数量和单条用例详情；详情展示期望结果、实际结果和执行轨迹。', '运行日志记录开始、单条用例完成、暂停和整批完成状态，便于定位失败原因。'], addedAt: '2026-10-28', status: '待开发', path: '/agent-eval' },
  { id: 'membership-redesign', title: '2026年10月会员改版', level: 'main', requirementKey: 'V2610', requirement: MEMBERSHIP_REQUIREMENT_DESCRIPTION, summary: '新增 5 个会员等级，统一套餐积分、全屏购买弹框、权益/AI 模型消耗及各端会员等级响应。', details: [...MEMBERSHIP_REQUIREMENT_DESCRIPTION_ITEMS, '统一会员总排序、同等级续费叠加、低等级升级、高等级禁止降级、企业席位上下限和不可购买提示；具体字段来源、固定字典、计算规则和验收标准以 V2610 主需求说明为准。'], addedAt: '2026-10-24', status: '待开发', path: '/admin-backoffice/requirements/membership' },
  { id: 'membership-packages', title: '【V2后台】会员套餐管理新增会员等级及积分量', navLabels: ['会员套餐管理'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '会员套餐管理支持新增会员等级、level 和积分发放配置。', summary: '新增会员等级、level、积分量、发放单位和发放周期，并支持历史套餐按等级回显且不可修改。', details: ['会员类型列表新增基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312，并显示对应 level。', '新增套餐积分量为必填项，填写非负整数，默认每人、按月，可切换团队和一次性。', '历史会员等级积分量非必填，按等级积分量自动回显且不可修改；终身套餐按36135天识别并一次性发放。', '购买套餐时按购买套餐对应的积分量立即发放，上一笔对应的未使用积分量失效；未配置时回退到会员等级积分量和规则。'], addedAt: '2026-10-24', status: '待开发', path: '/admin-backoffice/membership-packages' },
  { id: 'membership-open', title: '【V2后台】开通会员新增新会员等级', navLabels: ['开通会员'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '开通会员页支持会员类型、新增等级 level，以及成员人数下的积分量、发放单位和发放周期。', summary: '新增会员类型和 level，并在成员人数下配置积分量、发放单位和发放周期。', details: ['会员类型列表包含完整会员类型，并展示对应 level。', '新增基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312。', '会员类型显示名称在前，level 数字在后。', '成员人数下新增积分量，支持非负整数、发放单位、发放周期和对应发放规则。'], addedAt: '2026-10-24', status: '待开发', path: '/admin-backoffice/membership-open' },
  { id: 'user-segments-member-level', title: '【V2后台】用户分群新增新会员等级', navLabels: ['用户分群'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '用户分群中的会员等级筛选支持新增会员等级及 level。', summary: 'CSV 导入分群、规则分群和定制分群条件支持新增会员等级及 level 筛选。', details: ['会员等级筛选新增基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312。', '新增等级在会员类型选项中以名称在前、level 数字在后的格式展示。', '是会员、是会员按等级、不是会员和不是会员按等级均支持新会员等级筛选。'], addedAt: '2026-10-25', status: '待开发', path: '/admin-backoffice/user-segments' },
  { id: 'authorization-scope-member-level', title: '【V2后台】授权范围设置新增新会员等级', navLabels: ['授权范围设置'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '授权范围设置的会员类型筛选支持新增会员等级及 level，并为每个新增会员配置完整授权范围。', summary: '新增会员等级及 level，并为每个新增会员配置完整授权范围。', details: ['新增基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312。', '每个新增会员均配置线上推广用途、线下印刷用途和禁用三类授权范围；每条范围支持启用/停用及是否在会员协议显示。'], addedAt: '2026-10-25', status: '待开发', path: '/admin-backoffice/authorization-scope' },
  { id: 'user-authorization-member-level', title: '【V2后台】用户授权信息管理新增新会员等级', navLabels: ['授权信息管理与查询'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '用户授权信息管理的权益等级/类型筛选支持新增会员等级及 level。', summary: '权益等级/类型筛选支持新增会员等级及 level。', details: ['新增基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312。'], addedAt: '2026-10-25', status: '待开发', path: '/admin-backoffice/user-authorization-management' },
  { id: 'membership-activation-member-level', title: '【V2后台】会员激活码新增新会员等级', navLabels: ['活动列表'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '会员激活码活动的激活码类型支持新增会员等级及 level。', summary: '活动列表中的激活码类型支持新增会员等级及 level。', details: ['新增基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312。'], addedAt: '2026-10-25', status: '待开发', path: '/admin-backoffice/membership-activation' },
  { id: 'membership-page-config', title: '【V2后台】会员页面配置套餐与权益', navLabels: ['会员页面配置'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '配置网页版和移动端会员页面的套餐、权益和说明内容。', summary: '会员页配置拆分个人使用和企业使用，并支持各模块 JSON 配置。', details: ['支持网页版和移动端两个端配置，默认进入网页版。', '支持套餐、权益概览、权益明细、模型消耗、商用授权和常见问题模块。', '会员套餐价格和积分沿用真实套餐数据。'], addedAt: '2026-10-24', status: '待开发', path: '/admin-backoffice/membership-page-config' },
  { id: 'membership-web-payment', title: '【Web】会员支付弹框/挽留弹框/补差价升级页新增会员', projectName: '创客贴前台', level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '会员支付弹框、挽留弹框和补差价升级页新增并响应 V2610 会员等级，分别明确延期升级、直接扫码支付和补差价支付边界。', summary: '聚焦会员支付弹框、挽留弹框和补差价升级页的新增会员展示、套餐匹配、支付和购买限制。', details: ['会员支付弹框展示基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312，并按历史等级映射处理套餐和权益。', '会员支付弹框按全屏模块展示套餐、权益、AI 模型消耗、积分、席位和支付信息；切换会员类型、时长、积分档位或席位后同步更新金额和二维码。', '挽留弹框按补差价升级中的会员默认规则选择会员和套餐，确认购买后直接展示二维码，不再显示“立即开通”按钮。', '补差价升级页使用 /membership-upgrade，套餐显示区域响应新增会员，下面已有支付区域继续负责补差价支付。'], addedAt: '2026-10-28', status: '待开发', path: '/agent-skills-home' },
  { id: 'membership-web-entry-pages', title: '【Web】设计页外各会员入口处理新增会员', projectName: '创客贴前台', level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '处理设计页外顶部导航、会员购买和补差价升级等会员入口与新增会员的关系，统一复用目标页面的会员服务能力。', summary: '设计页外各会员入口统一触发会员支付弹框或补差价升级页，不重复维护新会员套餐和支付规则。', details: ['首页顶部导航“会员中心”入口展示 V2610 标识，点击后打开统一会员支付弹框，入口文案、位置和打开行为保持一致。', '设计页外会员购买入口复用统一会员支付弹框，入口只传递当前会员身份和打开场景，不重复拼装套餐、积分和席位规则。', '常见问题中的补差价升级入口进入 /membership-upgrade，独立页面承接补差价支付，入口不直接创建订单。', '入口触发后使用新会员名称和 level，标识和说明不遮挡顶部导航、用户信息、会员中心按钮或跳转控件。'], addedAt: '2026-10-28', status: '待开发', path: '/agent-skills-home' },
  { id: 'membership-web-canvas-entries', title: '【Web】设计页/无限画布内各会员入口处理新会员', projectName: '创客贴前台', level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '处理设计页和无限画布内各会员入口对新会员等级的展示、会员支付弹框调起和权益响应。', summary: '设计页与无限画布内的会员入口统一响应新会员等级、权益和购买状态。', details: ['设计页内会员模板、会员权益和升级提示等入口展示新会员名称、level 和对应权益，不再出现旧等级名称或旧购买路径。', '点击设计页内的会员开通、升级或权益入口时统一调起会员支付弹框，入口只传递当前会员身份和场景，不重复拼装套餐与支付内容。', '无限画布内会员入口使用同一套新会员等级和会员状态判断；需要补差价升级时进入 /membership-upgrade。', '设计页和无限画布入口的 V2610 标识不遮挡编辑、生成、模板和会员操作控件，编辑与生成流程本身不在本子需求中改造。'], addedAt: '2026-10-28', status: '待开发', path: '/design-app' },
  { id: 'guided-search', title: '搜索引导管理', level: 'main', requirementKey: 'SG-2610', requirement: '维护引导词节点、节点关系，并查询实际映射配置。', summary: '支持引导词、关系和映射结果的查询与维护。', details: ['支持节点、关系和映射三个管理视图。', '可按关键词、层级、关系类型和状态筛选数据。', '支持导入、编辑、启停和删除操作。'], addedAt: '2026-10-22', status: '待开发', path: '/admin-backoffice/guided-search' },
  { id: 'ai-ecommerce', title: 'AI电商配置', level: 'main', requirementKey: 'AIE-2610', requirement: '按 function_code 和 scene 查询、编辑 AI 电商配置。', summary: '面向 AI 电商技能配置的查询、编辑和缓存管理。', details: ['支持按功能标识和场景查询配置。', '支持 JSON 草稿编辑、格式校验和保存。', '支持清理对应功能缓存，并保留最近查询记录。'], addedAt: '2026-10-22', status: '待开发', path: '/admin-backoffice/ai-ecommerce' },
] as RequirementNavItem[])
  .sort((left, right) => right.addedAt.localeCompare(left.addedAt));

export type RequirementProjectStats = {
  total: number;
  launched: number;
  notLaunched: number;
};

export type RequirementOverviewStats = {
  projectCount: number;
  requirementCount: number;
  launchedCount: number;
  notLaunchedCount: number;
};

export function getRequirementProjectStats(): Record<string, RequirementProjectStats> {
  return REQUIREMENT_NAV_ITEMS.reduce<Record<string, RequirementProjectStats>>((stats, item) => {
    const projectName = item.projectName ?? '创客贴管理后台';
    const current = stats[projectName] ?? { total: 0, launched: 0, notLaunched: 0 };
    current.total += 1;
    if (item.status === '已上线') {
      current.launched += 1;
    } else {
      current.notLaunched += 1;
    }
    stats[projectName] = current;
    return stats;
  }, {});
}

export function getRequirementOverviewStats(): RequirementOverviewStats {
  const projectStats = getRequirementProjectStats();
  const totals = Object.values(projectStats).reduce((result, current) => ({
    requirementCount: result.requirementCount + current.total,
    launchedCount: result.launchedCount + current.launched,
    notLaunchedCount: result.notLaunchedCount + current.notLaunched,
  }), { requirementCount: 0, launchedCount: 0, notLaunchedCount: 0 });

  return {
    projectCount: new Set(REQUIREMENT_NAV_ITEMS.map((item) => item.projectName ?? '创客贴管理后台')).size,
    ...totals,
  };
}

const REQUIREMENT_CHILD_ORDER: Record<string, string[]> = {
  'developer-platform': [
    'developer-platform-home',
    'developer-platform-console',
    'developer-platform-apps',
    'developer-platform-create-app',
    'developer-platform-app-overview',
    'developer-platform-credentials',
    'developer-platform-integrations',
    'developer-platform-oauth',
    'developer-platform-scopes',
    'developer-platform-tester',
    'developer-platform-usage',
    'developer-platform-logs',
    'developer-platform-team',
    'developer-platform-capabilities',
    'developer-platform-docs',
  ],
  'membership-redesign': [
    'membership-packages',
    'membership-open',
    'membership-page-config',
    'membership-web-payment',
    'membership-web-entry-pages',
    'membership-web-canvas-entries',
    'user-segments-member-level',
    'authorization-scope-member-level',
    'user-authorization-member-level',
    'membership-activation-member-level',
  ],
};

function getRequirementChildren(parentId: string): RequirementNavItem[] {
  const children = REQUIREMENT_NAV_ITEMS.filter((item) => item.parentId === parentId);
  const preferredOrder = REQUIREMENT_CHILD_ORDER[parentId];
  if (!preferredOrder) return children;

  return children.sort((left, right) => preferredOrder.indexOf(left.id) - preferredOrder.indexOf(right.id));
}

function navItemContainsLabel(item: NavItem, label: string): boolean {
  if (typeof item === 'string') return item === label;
  return item.label === label || Boolean(item.children?.some((child) => navItemContainsLabel(child, label)));
}

function getActiveNavGroupLabel(label: string): string | undefined {
  return NAV_GROUPS.find((group) => group.children?.some((item) => navItemContainsLabel(item, label)))?.label;
}

function requirementMatchesNavItem(requirement: RequirementNavItem, item: NavItem): boolean {
  return navItemContainsLabel(item, requirement.title) || Boolean(requirement.navLabels?.some((label) => navItemContainsLabel(item, label)));
}

function getRequirementKeysForNavItems(items: NavItem[] | undefined): string[] {
  if (!items) return [];
  return [...new Set(REQUIREMENT_NAV_ITEMS
    .filter((requirement) => requirement.status !== '已上线' && items.some((item) => requirementMatchesNavItem(requirement, item)))
    .map((requirement) => requirement.requirementKey))];
}

function getRequirementsForNavItem(item: NavItem): RequirementNavItem[] {
  return REQUIREMENT_NAV_ITEMS.filter((requirement) => requirementMatchesNavItem(requirement, item));
}

function getRequirementDisplayPath(item: RequirementNavItem): string {
  const projectName = item.projectName ?? '创客贴管理后台';
  const navLabel = item.navLabels?.[0];
  if (navLabel) {
    const group = NAV_GROUPS.find((candidate) => candidate.children?.some((child) => navItemContainsLabel(child, navLabel)));
    return [projectName, group?.label, navLabel].filter(Boolean).join(' > ');
  }
  if (item.id === 'guided-search') return `${projectName} > 内容运营管理 > 搜索管理 > 搜索引导管理`;
  if (item.id === 'ai-ecommerce') return `${projectName} > 灵感社区 > 玩法管理 > AI电商配置`;
  if (item.id === 'membership-redesign') return `${projectName} > 会员中心 > 会员改版`;
  if (item.id === 'membership-web-payment') return `${projectName} > 会员中心 > 会员支付弹框/挽留弹框/补差价升级页`;
  if (item.id === 'membership-web-entry-pages') return `${projectName} > 设计页外 > 会员入口`;
  if (item.id === 'membership-web-canvas-entries') return `${projectName} > 设计页/无限画布 > 会员入口`;
  if (item.id === 'agent-evaluation-platform') return `${projectName} > 评测平台 > Agent / Skill 自动化评测平台`;
  if (item.id === 'agent-evaluation-workbench') return `${projectName} > 评测工作台`;
  const developerPlatformPaths: Record<string, string> = {
    'developer-platform': `${projectName} > 开发者中心`,
    'developer-platform-home': `${projectName} > 开发者平台首页`,
    'developer-platform-console': `${projectName} > 开发者中心 > 控制台总览`,
    'developer-platform-apps': `${projectName} > 开发者中心 > 我的应用`,
    'developer-platform-create-app': `${projectName} > 开发者中心 > 我的应用 > 创建应用`,
    'developer-platform-app-overview': `${projectName} > 开发者中心 > 我的应用 > 应用概览`,
    'developer-platform-credentials': `${projectName} > 开发者中心 > 应用凭证`,
    'developer-platform-integrations': `${projectName} > 开发者中心 > 集成方式`,
    'developer-platform-oauth': `${projectName} > 开发者中心 > OAuth 与回调地址`,
    'developer-platform-scopes': `${projectName} > 开发者中心 > 权限 Scope`,
    'developer-platform-tester': `${projectName} > 开发者中心 > API / MCP 测试台`,
    'developer-platform-usage': `${projectName} > 开发者中心 > 调用量与额度`,
    'developer-platform-logs': `${projectName} > 开发者中心 > 调用日志`,
    'developer-platform-team': `${projectName} > 开发者中心 > 团队与权限`,
    'developer-platform-capabilities': `${projectName} > 开发者中心 > 开放平台能力`,
    'developer-platform-docs': `${projectName} > 开发者中心 > 快速开始文档`,
  };
  if (developerPlatformPaths[item.id]) return developerPlatformPaths[item.id];
  return `${projectName} > 需求中心`;
}

function isSkillConfig(value: unknown): value is SkillConfig {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SkillConfig>;
  return typeof candidate.skillCode === 'string';
}

function normalizeRemoteSkillConfig(value: unknown, fallbackSkillCode: string): SkillConfig | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  return {
    ...candidate,
    skillCode: typeof candidate.skillCode === 'string' ? candidate.skillCode : fallbackSkillCode,
  } as SkillConfig;
}

type MoniSkillConfigResponse = {
  body?: {
    code?: number;
    msg?: string;
    data?: {
      skill_code?: string;
      scene?: string;
      config?: unknown;
      update_time?: string;
    };
  };
};

type ConfigQueryStatus = 'idle' | 'loading' | 'success' | 'empty' | 'not-found' | 'error';

type AdminSidebarProps = {
  onBackToDirectory: () => void;
  activeItem?: string;
  onNavigate?: (item: string) => void;
  onNavigateToRequirement?: (path: string) => void;
  onNavigateToRequirementList?: () => void;
};

function RequirementDot({ label = '有待开发需求' }: { label?: string }) {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5a5f] shadow-[0_0_6px_rgba(255,90,95,.75)]" aria-label={label} />;
}

function RequirementKeyBadge({ requirement }: { requirement: RequirementNavItem }) {
  const isReleased = requirement.status === '已上线';
  return <span title={`${requirement.title} · ${requirement.status}`} className={`shrink-0 rounded-[4px] px-1.5 py-0.5 text-[8px] font-semibold leading-none shadow-[0_0_6px_rgba(255,90,95,.25)] ${isReleased ? 'bg-[#45b889] text-white shadow-[0_0_6px_rgba(69,184,137,.3)]' : 'bg-[#ff6b62] text-white'}`}>{requirement.requirementKey}</span>;
}

export function AdminSidebar({ onBackToDirectory, activeItem: activeItemProp = 'AI电商配置', onNavigate, onNavigateToRequirement, onNavigateToRequirementList }: AdminSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const activeGroupLabel = getActiveNavGroupLabel(activeItemProp);
    return {
      灵感社区: activeGroupLabel === '灵感社区',
      内容运营管理: activeGroupLabel === '内容运营管理',
      会员中心: activeGroupLabel === '会员中心',
      用户中心: activeGroupLabel === '用户中心',
    };
  });
  const [activeItem, setActiveItem] = useState('AI电商配置');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveItem(activeItemProp);
    const activeGroupLabel = getActiveNavGroupLabel(activeItemProp);
    if (activeGroupLabel) {
      setExpandedGroups((current) => ({ ...current, [activeGroupLabel]: true }));
    }
  }, [activeItemProp]);

  const renderNavItems = (items: NavItem[], level = 0): ReactNode => items.map((item, index) => {
    const label = typeof item === 'string' ? item : item.label;
    const children = typeof item === 'string' ? undefined : item.children;
    const hasChildren = Boolean(children?.length);
    const defaultExpanded = typeof item === 'string' ? false : item.expanded ?? true;
    const isExpanded = hasChildren && (expandedItems[label] ?? defaultExpanded);
    const linkedRequirements = hasChildren ? [] : getRequirementsForNavItem(item);
    const primaryRequirement = linkedRequirements.find((requirement) => requirement.status !== '已上线');

    return (
      <div key={`${label}-${level}-${index}`}>
        <button type="button" title={label} onClick={() => {
          if (hasChildren) {
            setExpandedItems((current) => ({ ...current, [label]: !isExpanded }));
          } else {
            setActiveItem(label);
            if (label === '开通会员' && typeof window !== 'undefined') {
              window.history.pushState({}, '', '/admin-backoffice/membership-open');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
            if (label === '用户分群' && typeof window !== 'undefined') {
              window.history.pushState({}, '', '/admin-backoffice/user-segments');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
            if (label === '授权范围设置' && typeof window !== 'undefined') {
              window.history.pushState({}, '', '/admin-backoffice/authorization-scope');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
            if (label === '用户授权信息查看' && typeof window !== 'undefined') {
              window.history.pushState({}, '', '/admin-backoffice/user-authorization');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
            if (label === '授权信息管理与查询' && typeof window !== 'undefined') {
              window.history.pushState({}, '', '/admin-backoffice/user-authorization-management');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
            if (label === '活动列表' && typeof window !== 'undefined') {
              window.history.pushState({}, '', '/admin-backoffice/membership-activation');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
            onNavigate?.(label);
          }
        }} style={{ paddingLeft: `${43 + level * 20}px` }} className={`mx-2 flex h-[34px] w-[calc(100%-16px)] items-center justify-between rounded-[5px] pr-3 text-left text-[10px] transition ${label === activeItem ? 'bg-[#128cf1] font-medium text-white shadow-[0_3px_10px_rgba(18,140,241,.2)]' : 'text-[#8ea2b6] hover:bg-white/[.06] hover:text-white'}`}>
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate">{label}</span>
            {primaryRequirement ? <RequirementKeyBadge requirement={primaryRequirement} /> : null}
          </span>
          {hasChildren ? <ChevronDown className={`h-3 w-3 shrink-0 opacity-80 transition-transform ${isExpanded ? '' : '-rotate-90'}`} /> : null}
        </button>
        {hasChildren && isExpanded ? <div className="bg-[#031525]/55 py-1">{renderNavItems(children ?? [], level + 1)}</div> : null}
      </div>
    );
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[228px] flex-col bg-[#061b2d] text-white">
      <div className="flex h-[62px] items-center gap-3 border-b border-white/[.08] px-5">
        <button type="button" onClick={onBackToDirectory} className="flex items-center gap-3" title="返回需求目录">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#1493f4] shadow-[0_4px_10px_rgba(20,147,244,.3)]"><Sparkles className="h-[18px] w-[18px] text-white" /></span>
          <span className="text-[16px] font-semibold tracking-[-.04em]">创客贴管理后台</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <section className="mx-3 mb-3 border-b border-white/[.12] pb-3">
          <button type="button" onClick={() => { if (onNavigateToRequirementList) { onNavigateToRequirementList(); return; } if (typeof window !== 'undefined') { window.history.pushState({}, '', '/admin-backoffice/requirements'); window.dispatchEvent(new PopStateEvent('popstate')); } }} className={`flex w-full items-center justify-between rounded-[7px] border border-[#f1d36a] px-3 py-2.5 text-left text-[12px] font-semibold text-[#8a5a00] shadow-[0_3px_10px_rgba(242,193,55,.14)] transition ${activeItem === '需求列表' ? 'bg-[#ffe89a]' : 'bg-[#fff2b8] hover:bg-[#ffef9e]'}`}>
            <span className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f6c744] text-[10px] text-white">!</span><span>需求列表</span><span className="rounded-full bg-[#f6d768] px-1.5 py-0.5 text-[10px] font-medium text-[#795000]">{REQUIREMENT_NAV_ITEMS.length}</span></span>
            <ChevronRight className="h-3.5 w-3.5 text-[#9b6d00]" />
          </button>
        </section>
        {NAV_GROUPS.map((group) => {
          const Icon = group.icon;
          const hasChildren = Boolean(group.children?.length);
          const isExpanded = expandedGroups[group.label] ?? Boolean(group.expanded);
          const requirementKeys = getRequirementKeysForNavItems(group.children);
          return (
            <div key={group.label}>
              <button type="button" title={group.label} onClick={() => hasChildren && setExpandedGroups((current) => ({ ...current, [group.label]: !isExpanded }))} className="flex h-[38px] w-full items-center justify-between px-5 text-left text-[11px] font-medium tracking-[.01em] text-[#a8bacb] transition hover:bg-white/[.06] hover:text-white">
                <span className="flex min-w-0 items-center gap-2.5"><Icon className="h-[14px] w-[14px] shrink-0 opacity-80" /><span className="truncate">{group.label}</span>{requirementKeys.length > 0 ? <RequirementDot /> : null}</span>
                {hasChildren ? <ChevronDown className={`h-3 w-3 opacity-80 transition-transform ${isExpanded ? '' : '-rotate-90'}`} /> : null}
              </button>
              {hasChildren && isExpanded ? (
                <div className="bg-[#031525]/80 py-1.5">{renderNavItems(group.children ?? [])}</div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/[.08] px-5 py-4 text-[11px] text-[#8097ab]">需求目录 · 原型预览</div>
    </aside>
  );
}

type RequirementListPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
  onNavigateToRequirement?: (path: string) => void;
  onNavigateToRequirementList?: () => void;
};

function getMembershipRequirementDetailLabel(content: string, sectionTitle: string, index: number) {
  const separatorIndex = content.search(/[：:]/);
  if (separatorIndex > 1 && separatorIndex <= 22) return content.slice(0, separatorIndex);
  return `${sectionTitle}需求点 ${String(index + 1).padStart(2, '0')}`;
}

function getMembershipRequirementDetailContent(content: string, sectionTitle: string, index: number) {
  const label = getMembershipRequirementDetailLabel(content, sectionTitle, index);
  const prefix = `${label}：`;
  return content.startsWith(prefix) ? content.slice(prefix.length).trim() : content;
}

function buildMembershipRequirementSpec(item: RequirementNavItem, sections: MembershipRequirementSection[], meta: { background: string; goal: string; path: string; acceptance: string[]; verificationNotes: string[] }): RequirementSpec {
  const getTargetPath = (content: string) => {
    if ((item.id === 'membership-web-payment' || item.id === 'membership-web-entry-pages') && /补差价|升级页|membership-upgrade/.test(content)) return '/membership-upgrade';
    if (item.id === 'membership-web-canvas-entries' && /设计页|无限画布|\/canvas|\/design-app/.test(content)) return '/design-app';
    return meta.path.includes('/membership-upgrade') ? '/membership-upgrade' : '/agent-skills-home';
  };
  return {
    title: item.title,
    requirementKey: item.requirementKey,
    status: item.status,
    eyebrow: 'MEMBERSHIP EXPERIENCE · PAGE REQUIREMENT',
    summary: item.summary,
    background: meta.background,
    goal: meta.goal,
    sections: [
      {
        title: '需求描述',
        description: '本页面需要实现的核心改动和业务边界。',
        items: [{ label: '核心需求', content: item.requirement }],
      },
      ...sections.map((section) => ({
        title: section.title,
        description: '按模块拆分可定位、可开发、可验收的具体需求点。',
        items: section.items.map((content, index) => ({
          label: getMembershipRequirementDetailLabel(content, section.title, index),
          content: getMembershipRequirementDetailContent(content, section.title, index),
          path: getTargetPath(content),
        })),
      })),
      {
        title: '所在路径',
        description: '需求入口和真实页面路由。',
        items: [{ label: '所在路径', content: meta.path, path: getTargetPath(meta.path) }],
      },
    ],
    acceptance: meta.acceptance,
    verificationNotes: meta.verificationNotes,
  };
}

function buildRequirementSpec(item: RequirementNavItem): RequirementSpec {
  if (item.id === 'membership-web-payment') {
    return buildMembershipRequirementSpec(item, MEMBERSHIP_WEB_PAYMENT_REQUIREMENT_SECTIONS, MEMBERSHIP_WEB_PAYMENT_REQUIREMENT_META);
  }
  if (item.id === 'membership-web-entry-pages') {
    return buildMembershipRequirementSpec(item, MEMBERSHIP_WEB_ENTRY_REQUIREMENT_SECTIONS, MEMBERSHIP_WEB_ENTRY_REQUIREMENT_META);
  }
  if (item.id === 'membership-web-canvas-entries') {
    return buildMembershipRequirementSpec(item, MEMBERSHIP_WEB_CANVAS_ENTRY_REQUIREMENT_SECTIONS, MEMBERSHIP_WEB_CANVAS_ENTRY_REQUIREMENT_META);
  }
  const childRequirements = item.level === 'main' ? getRequirementChildren(item.id) : [];
  const detailedRequirementGroups = childRequirements.map((child) => ({
    title: child.title,
    items: child.details.map((detail, index) => ({ label: `需求点 ${index + 1}`, content: detail, path: child.path })),
  }));
  const detailedRequirements = childRequirements.length > 0
    ? []
    : item.details.map((detail, index) => ({ label: `需求点 ${index + 1}`, content: detail, path: item.path }));
  const membershipLevelSection = item.id === 'membership-redesign'
    ? {
      title: '新增会员等级',
      description: '本模块位于需求背景与需求目标之后，统一列出新会员等级、历史等级映射、类型和授权范围。',
      table: MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS[0].table,
      items: MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS[0].items.map((content, index) => ({ label: `等级规则 ${index + 1}`, content })),
    }
    : null;
  const membershipLevelOrderingSection = item.id === 'membership-redesign'
    ? {
      title: MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS[1].title,
      description: '会员等级按照统一的总排序和固定页面顺序展示，并据此判断续费、升级和降级。',
      items: MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS[1].items.map((content, index) => ({
        label: `等级排序 ${index + 1}`,
        content,
        highlightTerms: MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS[1].highlightTerms,
      })),
    }
    : null;
  const membershipDescriptionItems = item.id === 'membership-redesign'
    ? MEMBERSHIP_REQUIREMENT_DESCRIPTION_ITEMS.map((content, index) => ({ label: `改动重点 ${index + 1}`, content }))
    : [{ label: '需求描述', content: item.requirement }];

  return {
    title: item.title,
    requirementKey: item.requirementKey,
    status: item.status,
    eyebrow: item.level === 'main' ? 'MAIN REQUIREMENT' : `${item.navLabels?.[0] ?? '页面需求'} · PAGE REQUIREMENT`,
    summary: item.summary,
    background: item.id === 'membership-redesign' ? MEMBERSHIP_REQUIREMENT_BACKGROUND : item.requirement,
    goal: item.id === 'membership-redesign' ? MEMBERSHIP_REQUIREMENT_GOAL : `在${item.navLabels?.[0] ?? '对应页面'}内完成需求改动，并保持页面入口、数据展示和交互规则一致。`,
    sections: [
      ...(membershipLevelSection ? [membershipLevelSection] : []),
      ...(membershipLevelOrderingSection ? [membershipLevelOrderingSection] : []),
      {
        title: '需求描述',
        description: item.id === 'membership-redesign' ? '本次会员改版涉及的主要改动汇总。' : '本页面需要实现的核心改动。',
        items: membershipDescriptionItems,
      },
      {
        title: '具体需求',
        description: childRequirements.length > 0 ? '按子需求归类展示具体需求点。' : '列表之外的实现细节和验收关注点。',
        items: detailedRequirements,
        groups: detailedRequirementGroups.length > 0 ? detailedRequirementGroups : undefined,
      },
      {
        title: '所在路径',
        description: '',
        items: [{ label: '所在路径', content: getRequirementDisplayPath(item), path: item.path }],
      },
    ],
    acceptance: [
      `所在路径：${getRequirementDisplayPath(item)}`,
      ...item.details,
    ],
  };
}

function RequirementCard({ item, index, nested = false, onNavigate, onOpenDetails, childCount = 0, isChildrenExpanded = false, onToggleChildren, childrenPanelId }: { item: RequirementNavItem; index: number; nested?: boolean; onNavigate?: (path: string) => void; onOpenDetails?: (item: RequirementNavItem) => void; childCount?: number; isChildrenExpanded?: boolean; onToggleChildren?: () => void; childrenPanelId?: string }) {
  const hasPage = item.path !== '/admin-backoffice/requirements';
  const canToggleChildren = !nested && childCount > 0;
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (canToggleChildren && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onToggleChildren?.();
    }
  };

  return <article
    onClick={canToggleChildren ? onToggleChildren : undefined}
    onKeyDown={canToggleChildren ? handleCardKeyDown : undefined}
    tabIndex={canToggleChildren ? 0 : undefined}
    aria-expanded={canToggleChildren ? isChildrenExpanded : undefined}
    aria-controls={canToggleChildren ? childrenPanelId : undefined}
    className={`${nested ? 'rounded-[8px] border border-[#e5eaf1] bg-[#fbfcfe] p-4 transition hover:border-[#b9d7f7] hover:shadow-[0_5px_16px_rgba(52,111,171,.08)]' : 'rounded-[8px] border border-[#dce5f0] bg-white p-4 transition hover:border-[#b9d7f7] hover:shadow-[0_5px_16px_rgba(52,111,171,.08)]'} ${canToggleChildren ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#278fee]/25' : ''}`}
  >
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className={nested ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef4fb] text-[11px] font-semibold text-[#6c86a5]' : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff2b8] text-[12px] font-semibold text-[#a16b00]'}>{index + 1}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[15px] font-semibold text-[#27344a]">{item.title}</h2><span className="rounded-[4px] bg-[#eaf3ff] px-2 py-0.5 text-[10px] font-semibold text-[#3979b7]">{item.requirementKey}</span><span className="rounded-[4px] bg-[#fff7dc] px-2 py-0.5 text-[10px] font-medium text-[#a36d08]">{item.status}</span></div><p className="mt-2 text-[12px] leading-5 text-[#4d5b70]"><span className="font-medium text-[#69778a]">需求概述：</span>{item.summary}</p><p className="mt-1 text-[11px] leading-5 text-[#8b96a7]"><span className="font-medium text-[#69778a]">所在路径：</span>{getRequirementDisplayPath(item)}</p></div></div><div className={`${nested ? 'ml-9' : 'ml-10'} flex shrink-0 flex-wrap items-center justify-end gap-1.5`}><button type="button" onClick={(event) => { event.stopPropagation(); onOpenDetails?.(item); }} className="inline-flex h-6 items-center gap-0.5 rounded-[4px] border border-[#cfe0f8] bg-white px-2 text-[10px] font-medium text-[#3979b7] transition hover:border-[#8eb8ed] hover:bg-[#f5f9ff]"><FileText className="h-2.5 w-2.5" />需求说明</button>{hasPage ? <button type="button" onClick={(event) => { event.stopPropagation(); onNavigate?.(item.path); }} className="inline-flex h-6 items-center gap-0.5 rounded-[4px] bg-[#278fee] px-2.5 py-1 text-[10px] font-medium text-white shadow-[0_2px_6px_rgba(39,143,238,.14)] transition hover:bg-[#167fdc]">进入页面<ChevronRight className="h-2.5 w-2.5" /></button> : null}</div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3 pl-10 text-[11px] text-[#9aa5b5]"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><span>新增时间：{item.addedAt}</span>{item.status === '已上线' && item.releasedAt ? <span>上线时间：{item.releasedAt}</span> : null}</div>{canToggleChildren ? <button type="button" aria-label={isChildrenExpanded ? `收起 ${childCount} 个子需求` : `展开 ${childCount} 个子需求`} onClick={(event) => { event.stopPropagation(); onToggleChildren?.(); }} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#278fee] transition hover:text-[#167fdc]">{isChildrenExpanded ? '收起子需求' : `展开 ${childCount} 个子需求`}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${isChildrenExpanded ? '' : '-rotate-90'}`} /></button> : null}</div>
  </article>;
}

export function RequirementListBoard({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const mainRequirements = REQUIREMENT_NAV_ITEMS.filter((item) => item.level === 'main');
  const childRequirementCount = REQUIREMENT_NAV_ITEMS.filter((item) => item.level === 'sub').length;
  const [expandedMainRequirements, setExpandedMainRequirements] = useState<Record<string, boolean>>({});
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementNavItem | null>(null);
  const [shouldPushRequirementDrawer, setShouldPushRequirementDrawer] = useState(false);

  useEffect(() => {
    const updateDrawerLayout = () => {
      if (!selectedRequirement || typeof window === 'undefined') {
        setShouldPushRequirementDrawer(false);
        return;
      }

      const viewportWidth = window.innerWidth;
      const shellInset = Math.min(128, Math.max(24, viewportWidth * 0.06));
      const shellWidth = Math.min(viewportWidth - shellInset, 1820);
      const drawerWidth = Math.min(520, Math.max(360, viewportWidth * 0.34));
      setShouldPushRequirementDrawer(shellWidth + drawerWidth + 24 > viewportWidth);
    };

    updateDrawerLayout();
    window.addEventListener('resize', updateDrawerLayout);
    return () => window.removeEventListener('resize', updateDrawerLayout);
  }, [selectedRequirement]);

  const drawerMode = selectedRequirement ? (shouldPushRequirementDrawer ? 'push' : 'side') : 'closed';

  return <div data-drawer-mode={drawerMode} className={`prototype-requirement-board relative min-w-0 ${selectedRequirement ? 'prototype-requirement-board--drawer-open' : ''}`}>
    <section className="overflow-hidden rounded-[4px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8edf3] px-5 py-4"><div><h1 className="text-[18px] font-semibold text-[#283244]">需求列表</h1><p className="mt-1 text-[12px] text-[#98a2b2]">按主需求新增时间倒序展示，子需求归属在对应主需求下。</p></div><span className="rounded-[5px] bg-[#fff4c8] px-3 py-1.5 text-[12px] font-medium text-[#986a00]">{mainRequirements.length} 个主需求 · {childRequirementCount} 个子需求</span></header>
      <div className="space-y-3 p-5">
        {mainRequirements.map((item, index) => {
          const children = getRequirementChildren(item.id);
          const isExpanded = Boolean(expandedMainRequirements[item.id]);
          return <div key={item.id}><RequirementCard item={item} index={index} childCount={children.length} isChildrenExpanded={isExpanded} childrenPanelId={`${item.id}-children`} onToggleChildren={() => setExpandedMainRequirements((current) => ({ ...current, [item.id]: !current[item.id] }))} onNavigate={onNavigate} onOpenDetails={setSelectedRequirement} />{children.length > 0 && isExpanded ? <div id={`${item.id}-children`} className="ml-5 mt-2 space-y-2 border-l-2 border-[#f2d46d] pl-4">{children.map((child, childIndex) => <RequirementCard key={child.id} item={child} index={childIndex} nested onNavigate={onNavigate} onOpenDetails={setSelectedRequirement} />)}</div> : null}</div>;
        })}
      </div>
    </section>
    {selectedRequirement ? <RequirementDocumentDrawer spec={buildRequirementSpec(selectedRequirement)} onClose={() => setSelectedRequirement(null)} onNavigate={onNavigate} /> : null}
  </div>;
}

export function RequirementListPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig, onNavigateToRequirement, onNavigateToRequirementList }: RequirementListPageProps) {
  const mainRequirements = REQUIREMENT_NAV_ITEMS.filter((item) => item.level === 'main');
  const childRequirementCount = REQUIREMENT_NAV_ITEMS.filter((item) => item.level === 'sub').length;
  const [expandedMainRequirements, setExpandedMainRequirements] = useState<Record<string, boolean>>({});
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementNavItem | null>(null);
  const requirementDrawerWidth = 'min(520px, max(320px, calc(100vw - 244px)))';

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#263247]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="需求列表" onNavigateToRequirement={onNavigateToRequirement} onNavigateToRequirementList={onNavigateToRequirementList} onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员套餐管理') onNavigateToMembershipPackages?.(); if (item === '会员页面配置') onNavigateToMembershipPageConfig?.(); }} />
      <TopHeader rightOffset={selectedRequirement ? requirementDrawerWidth : undefined} />
      <main style={selectedRequirement ? { marginRight: requirementDrawerWidth } : undefined} className="ml-[228px] min-h-screen pt-[62px] transition-[margin-right] duration-200">
        <div className="px-6 py-5">
          <div className="mb-4 flex items-center gap-2 text-[12px] text-[#98a2b2]"><span>需求中心</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4d5b70]">需求列表</span></div>
          <section className="overflow-hidden rounded-[4px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <header className="flex items-center justify-between border-b border-[#e8edf3] px-5 py-4"><div><h1 className="text-[18px] font-semibold text-[#283244]">需求列表</h1><p className="mt-1 text-[12px] text-[#98a2b2]">按主需求新增时间倒序展示，子需求归属在对应主需求下。</p></div><span className="rounded-[5px] bg-[#fff4c8] px-3 py-1.5 text-[12px] font-medium text-[#986a00]">{mainRequirements.length} 个主需求 · {childRequirementCount} 个子需求</span></header>
            <div className="space-y-3 p-5">
              {mainRequirements.map((item, index) => {
                const children = getRequirementChildren(item.id);
                const isExpanded = Boolean(expandedMainRequirements[item.id]);
                return <div key={item.id}><RequirementCard item={item} index={index} childCount={children.length} isChildrenExpanded={isExpanded} childrenPanelId={`${item.id}-children`} onToggleChildren={() => setExpandedMainRequirements((current) => ({ ...current, [item.id]: !current[item.id] }))} onNavigate={onNavigateToRequirement} onOpenDetails={setSelectedRequirement} />{children.length > 0 && isExpanded ? <div id={`${item.id}-children`} className="ml-5 mt-2 space-y-2 border-l-2 border-[#f2d46d] pl-4">{children.map((child, childIndex) => <RequirementCard key={child.id} item={child} index={childIndex} nested onNavigate={onNavigateToRequirement} onOpenDetails={setSelectedRequirement} />)}</div> : null}</div>;
              })}
            </div>
          </section>
        </div>
      </main>
      {selectedRequirement ? <RequirementDocumentDrawer spec={buildRequirementSpec(selectedRequirement)} onClose={() => setSelectedRequirement(null)} onNavigate={onNavigateToRequirement} /> : null}
    </div>
  );
}

export function TopHeader({ rightOffset }: { rightOffset?: string } = {}) {
  return (
    <header style={rightOffset ? { right: rightOffset } : undefined} className="fixed left-[228px] right-0 top-0 z-20 flex h-[62px] items-center justify-between border-b border-[#e6e9ef] bg-white px-5 shadow-[0_1px_4px_rgba(41,53,77,.03)] transition-[right] duration-200">
      <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#657084] hover:bg-[#f3f5f8]" aria-label="收起菜单"><Menu className="h-5 w-5" /></button>
      <div className="absolute left-1/2 -translate-x-1/2 text-[12px] text-[#7b8493]">Admin账号跟自己使用，请勿泄露！ <span className="ml-1 text-[#9ca4b0]">By·李辰晨</span></div>
      <div className="flex items-center gap-5 text-[#737d8e]">
        <Search className="h-[17px] w-[17px]" />
        <span className="relative"><Bell className="h-[17px] w-[17px]" /><i className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-[#ff5555]" /></span>
        <Grid2X2 className="h-[17px] w-[17px]" />
        <div className="flex items-center gap-2 text-[12px] text-[#5d6677]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f2f4] text-[#9ba2af]"><Users className="h-4 w-4" /></span>赵文文</div>
      </div>
    </header>
  );
}

function JsonCodeView({ config }: { config: SkillConfig }) {
  const lines = prettyJson(config).split('\n');
  return (
    <pre className="m-0 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-[1.72] text-[#cbd5e1]">
      {lines.map((line, index) => <div key={`${index}-${line}`}><span className="mr-4 inline-block w-5 select-none text-right text-[#65748b]">{index + 1}</span><span className={line.includes('skillCode') || line.includes('name') ? 'text-[#9fe2be]' : line.includes('true') || line.includes('false') || line.match(/:\s*\d/) ? 'text-[#a6c8ff]' : 'text-[#d1d7e5]'}>{line}</span></div>)}
    </pre>
  );
}

export function AdminBackofficePage({ onBackToDirectory, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig, onNavigateToRequirement }: { onBackToDirectory: () => void; onNavigateToGuidedSearch?: () => void; onNavigateToMembershipPackages?: () => void; onNavigateToMembershipPageConfig?: () => void; onNavigateToRequirement?: (path: string) => void }) {
  const [config, setConfig] = useState<SkillConfig>(DEFAULT_SKILL_CONFIG);
  const [functionCode, setFunctionCode] = useState('');
  const [scene, setScene] = useState('');
  const [queriedFunctionCode, setQueriedFunctionCode] = useState('');
  const [queriedScene, setQueriedScene] = useState('');
  const [hasQueried, setHasQueried] = useState(false);
  const [queryStatus, setQueryStatus] = useState<ConfigQueryStatus>('idle');
  const [queryError, setQueryError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [recentQueries, setRecentQueries] = useState<RecentAiEcommerceQuery[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(RECENT_AI_ECOMMERCE_QUERIES_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is RecentAiEcommerceQuery => (
        Boolean(item) && typeof item === 'object' &&
        typeof (item as RecentAiEcommerceQuery).functionCode === 'string' &&
        typeof (item as RecentAiEcommerceQuery).scene === 'string'
      )).slice(0, 5);
    } catch {
      return [];
    }
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cacheConfirmOpen, setCacheConfirmOpen] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [draftText, setDraftText] = useState(() => prettyJson(DEFAULT_SKILL_CONFIG));
  const [draftConfig, setDraftConfig] = useState<SkillConfig>(DEFAULT_SKILL_CONFIG);
  const [jsonError, setJsonError] = useState('');
  const [saved, setSaved] = useState(false);
  const [requirementDrawerOpen, setRequirementDrawerOpen] = useState(false);

  const isFound = hasQueried && queryStatus === 'success';
  const canClearCache = functionCode.trim().length > 0;

  const rememberQuery = (nextQuery: RecentAiEcommerceQuery) => {
    setRecentQueries((previous) => {
      const next = [
        nextQuery,
        ...previous.filter((item) => item.functionCode !== nextQuery.functionCode || item.scene !== nextQuery.scene),
      ].slice(0, 5);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(RECENT_AI_ECOMMERCE_QUERIES_KEY, JSON.stringify(next));
        }
      } catch {
        // Keep the recent query list working for browsers that block storage.
      }
      return next;
    });
  };

  const runQuery = async (functionCodeInput = functionCode, sceneInput = scene) => {
    const nextFunctionCode = functionCodeInput.trim();
    const nextScene = sceneInput.trim();
    setQueriedFunctionCode(nextFunctionCode);
    setQueriedScene(nextScene);
    setHasQueried(true);
    if (nextFunctionCode) {
      rememberQuery({ functionCode: nextFunctionCode, scene: nextScene });
    }
    setHistoryOpen(false);
    setCacheCleared(false);
    setSaved(false);
    setQueryError('');
    setLastUpdated('');

    if (!nextFunctionCode) {
      setQueryStatus('empty');
      return;
    }

    setQueryStatus('loading');
    try {
      const query = new URLSearchParams({ skill_code: nextFunctionCode });
      if (nextScene) query.set('scene', nextScene);
      const response = await fetch(`${MONI_AGENT_SKILL_CONFIG_ENDPOINT}?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`moni 查询失败（HTTP ${response.status}）`);
      }

      const payload = await response.json() as MoniSkillConfigResponse;
      const data = payload.body?.data;
      const remoteConfig = normalizeRemoteSkillConfig(data?.config, data?.skill_code || nextFunctionCode);
      if (payload.body?.code !== 200 || !remoteConfig) {
        setQueryStatus('not-found');
        setQueryError(payload.body?.msg || 'moni 中没有找到对应的预置配置');
        return;
      }

      setConfig(remoteConfig);
      setQueriedScene(typeof data?.scene === 'string' ? data.scene : nextScene);
      setLastUpdated(data?.update_time || '');
      setQueryStatus('success');
    } catch (error) {
      setQueryStatus('error');
      setQueryError(error instanceof Error ? error.message : 'moni 配置查询失败，请稍后重试');
    }
  };

  const resetQuery = () => {
    setFunctionCode('');
    setScene('');
    setQueriedFunctionCode('');
    setQueriedScene('');
    setHasQueried(false);
    setQueryStatus('idle');
    setQueryError('');
    setLastUpdated('');
    setHistoryOpen(false);
    setCacheCleared(false);
    setSaved(false);
  };

  const applyRecentQuery = (query: RecentAiEcommerceQuery) => {
    setFunctionCode(query.functionCode);
    setScene(query.scene);
    void runQuery(query.functionCode, query.scene);
  };

  const openCacheConfirm = () => {
    if (!canClearCache) return;
    setCacheCleared(false);
    setCacheConfirmOpen(true);
  };

  const clearCache = () => {
    setCacheConfirmOpen(false);
    setCacheCleared(true);
  };

  const openEditor = () => {
    setDraftText(prettyJson(config));
    setDraftConfig(config);
    setJsonError('');
    setIsEditing(true);
  };

  const updateDraft = (value: string) => {
    setDraftText(value);
    try {
      const parsed: unknown = JSON.parse(value);
      if (!isSkillConfig(parsed)) {
        setJsonError('JSON 已解析，但缺少 skillCode、name 或 fields 字段。');
        return;
      }
      setDraftConfig(parsed);
      setJsonError('');
    } catch (error) {
      setJsonError(error instanceof Error ? `JSON 格式错误：${error.message}` : 'JSON 格式错误，请检查括号和逗号。');
    }
  };

  const confirmSave = () => {
    if (jsonError) return;
    setConfirmOpen(true);
  };

  const saveConfig = () => {
    setConfig(draftConfig);
    setFunctionCode(draftConfig.skillCode);
    setQueriedFunctionCode(draftConfig.skillCode);
    setConfirmOpen(false);
    setIsEditing(false);
    setSaved(true);
  };

  const requirementDrawerWidth = 'min(520px, max(320px, calc(100vw - 244px)))';

  return (
    <div style={requirementDrawerOpen ? { marginRight: requirementDrawerWidth } : undefined} className="min-h-screen bg-[#f4f6f9] font-sans text-[#1f2838] transition-[margin-right] duration-200">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="AI电商配置" onNavigateToRequirement={onNavigateToRequirement} onNavigate={(item) => { if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员套餐管理') onNavigateToMembershipPackages?.(); if (item === '会员页面配置') onNavigateToMembershipPageConfig?.(); }} />
      <TopHeader rightOffset={requirementDrawerOpen ? requirementDrawerWidth : undefined} />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <div className="mb-4 flex items-center gap-2 text-[12px] text-[#9aa3b1]"><span>灵感社区</span><ChevronRight className="h-3.5 w-3.5" /><span>玩法管理</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4f5b6f]">AI电商配置</span></div>

          <section className="mb-4 rounded-[3px] bg-white p-5 shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <div className="mb-4 flex items-start justify-between gap-4"><div><h1 className="text-[18px] font-semibold text-[#283244]">AI电商配置</h1><p className="mt-1 text-[12px] text-[#a1a9b5]">按功能标识（function_code）和场景（scene）查询并管理 AI 电商配置</p></div><button type="button" onClick={() => setRequirementDrawerOpen(true)} className="inline-flex h-9 shrink-0 items-center rounded-[5px] border border-[#ff8b83] bg-[#fff0ee] px-4 text-[12px] font-semibold text-[#e84b43] shadow-[0_3px_10px_rgba(232,75,67,.12)] transition hover:border-[#f05b53] hover:bg-[#ffe2df] hover:text-[#d9362e]">需求说明</button></div>
            <div className="relative flex flex-wrap items-center gap-3">
              <label className="flex h-10 w-[360px] items-center rounded-[3px] border border-[#dfe3ea] bg-white px-3 focus-within:border-[#328ff0]"><span className="mr-3 whitespace-nowrap text-[12px] text-[#7d8797]">功能标识（function_code）</span><input value={functionCode} onFocus={() => setHistoryOpen(true)} onChange={(event) => setFunctionCode(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') void runQuery(); }} placeholder="请输入功能标识" className="min-w-0 flex-1 text-[12px] text-[#354052] outline-none placeholder:text-[#b6bdc8]" /></label>
              <label className="flex h-10 w-[280px] items-center rounded-[3px] border border-[#dfe3ea] bg-white px-3 focus-within:border-[#328ff0]"><span className="mr-3 whitespace-nowrap text-[12px] text-[#7d8797]">场景（scene）</span><input value={scene} onFocus={() => setHistoryOpen(true)} onChange={(event) => setScene(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') void runQuery(); }} placeholder="可留空（默认场景）" className="min-w-0 flex-1 text-[12px] text-[#354052] outline-none placeholder:text-[#b6bdc8]" /></label>
              {historyOpen && recentQueries.length > 0 ? <div className="absolute left-0 top-[46px] z-30 w-[640px] overflow-hidden rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_12px_28px_rgba(31,46,73,.16)]"><div className="border-b border-[#edf0f4] px-3 py-2 text-[11px] text-[#8b96a7]">最近查询</div>{recentQueries.map((query) => <button key={`${query.functionCode}-${query.scene}`} type="button" onClick={() => applyRecentQuery(query)} className="flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left transition hover:bg-[#f5f9ff]"><span className="min-w-0 truncate text-[12px] text-[#354052]">{query.functionCode}</span><span className="shrink-0 rounded-[4px] bg-[#f1f4fa] px-2 py-1 text-[11px] text-[#68768b]">{query.scene || '默认场景'}</span></button>)}</div> : null}
              <button type="button" onClick={() => void runQuery()} disabled={queryStatus === 'loading'} className="h-10 rounded-[3px] bg-[#278fee] px-6 text-[12px] text-white shadow-[0_4px_10px_rgba(39,143,238,.16)] hover:bg-[#167fdc] disabled:cursor-wait disabled:bg-[#8dbff0]"><Search className="mr-1.5 inline-block h-3.5 w-3.5" />{queryStatus === 'loading' ? '查询中' : '查询'}</button>
              <button type="button" onClick={openCacheConfirm} disabled={!canClearCache} className="h-10 rounded-[3px] border border-[#f0b44d] bg-[#fffaf0] px-5 text-[12px] text-[#c4821e] hover:bg-[#fff3d8] disabled:cursor-not-allowed disabled:border-[#e5e8ed] disabled:bg-[#f7f8fa] disabled:text-[#b9c0ca]">清理缓存</button>
              <button type="button" onClick={resetQuery} className="h-10 rounded-[3px] border border-[#dfe3ea] bg-white px-5 text-[12px] text-[#697487] hover:border-[#b9c2d0]">重置</button>
              {cacheCleared ? <span className="text-[11px] text-[#35a16b]">已提交清理：{functionCode.trim()}</span> : null}
            </div>
          </section>

          {!isFound ? (
            <section className="flex min-h-[440px] items-center justify-center rounded-[3px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="max-w-[500px] px-6 text-center">{queryStatus === 'loading' ? <><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6ff] text-[#4d9ae8]"><Search className="h-6 w-6 animate-pulse" /></div><h2 className="text-[15px] font-medium text-[#4d596c]">正在从 moni 查询配置</h2><p className="mt-2 text-[12px] leading-5 text-[#a1a9b5]">正在查询 function_code = {queriedFunctionCode}，请稍候。</p></> : queryStatus === 'idle' || !hasQueried ? <><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f3f7] text-[#9da7b5]"><Search className="h-6 w-6" /></div><h2 className="text-[15px] font-medium text-[#4d596c]">请输入查询条件</h2><p className="mt-2 text-[12px] leading-5 text-[#a1a9b5]">输入功能标识（function_code），场景（scene）可选，然后点击查询。</p><div className="mt-5 rounded-[8px] border border-[#e6edf6] bg-[#f8fbff] px-4 py-3 text-left"><div className="text-[11px] font-medium text-[#8a96a8]">首次使用示例</div><button type="button" onClick={() => { setFunctionCode(AI_ECOMMERCE_QUERY_EXAMPLE.functionCode); setScene(AI_ECOMMERCE_QUERY_EXAMPLE.scene); setHistoryOpen(false); }} className="mt-2 flex w-full items-center justify-between gap-3 rounded-[6px] border border-[#d9e7fa] bg-white px-3 py-2 text-left transition hover:border-[#8ebcf0] hover:bg-[#f4f9ff]"><span className="min-w-0"><span className="block truncate text-[12px] font-medium text-[#315b91]">{AI_ECOMMERCE_QUERY_EXAMPLE.functionCode}</span><span className="mt-1 block text-[11px] text-[#8b96a7]">scene 可留空，填入后点击“查询”</span></span><span className="shrink-0 text-[11px] font-medium text-[#278fee]">使用示例</span></button></div></> : queryStatus === 'empty' || !queriedFunctionCode ? <><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99a35]"><AlertTriangle className="h-6 w-6" /></div><h2 className="text-[15px] font-medium text-[#4d596c]">请填写功能标识</h2><p className="mt-2 text-[12px] leading-5 text-[#a1a9b5]">功能标识（function_code）不能为空，场景（scene）可以留空。</p></> : queryStatus === 'error' ? <><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1f0] text-[#e36b63]"><AlertTriangle className="h-6 w-6" /></div><h2 className="text-[15px] font-medium text-[#4d596c]">moni 配置查询失败</h2><p className="mt-2 text-[12px] leading-5 text-[#a1a9b5]">{queryError || '请检查网络或稍后重试。'}</p></> : <><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1f0] text-[#e36b63]"><AlertTriangle className="h-6 w-6" /></div><h2 className="text-[15px] font-medium text-[#4d596c]">未找到对应的 AI 电商配置</h2><p className="mt-2 text-[12px] leading-5 text-[#a1a9b5]">当前查询：function_code = {queriedFunctionCode}，scene = {queriedScene || '（空）'}</p><p className="mt-1 text-[12px] leading-5 text-[#a1a9b5]">{queryError || 'moni 中没有返回对应的预置 JSON，请检查功能标识是否正确。'}</p></>}</div></section>
          ) : (
            <section className="rounded-[3px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
              <div className="flex items-center justify-between border-b border-[#edf0f4] px-5 py-4">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#263143]">{config.name || 'AI电商配置'}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#eef5ff] px-2.5 py-1 text-[#5f6f88]"><span className="font-medium text-[#7890b4]">function_code</span><span className="font-semibold text-[#315b91]">{queriedFunctionCode}</span></span>
                    <span className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#f2f0ff] px-2.5 py-1 text-[#665f9b]"><span className="font-medium text-[#8a82c4]">scene</span><span className="font-semibold text-[#51479a]">{queriedScene || '（空）'}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2"><span className="rounded-full bg-[#f1f4fa] px-2 py-1 text-[10px] text-[#6f7d91]">moni</span><span className="text-[11px] text-[#a3aab6]">{saved ? '刚刚已保存' : isEditing ? '编辑中：修改后保存' : lastUpdated ? `最后更新：${lastUpdated}` : '已从 moni 查询'}</span></div>
                  {isEditing ? <button type="button" onClick={() => { setIsEditing(false); setJsonError(''); }} className="h-9 rounded-[3px] border border-[#dfe3ea] bg-white px-4 text-[12px] text-[#687386] hover:bg-[#f7f8fa]">取消</button> : null}
                  <button type="button" onClick={isEditing ? confirmSave : openEditor} disabled={isEditing && Boolean(jsonError)} className="h-9 rounded-[3px] bg-[#278fee] px-5 text-[12px] text-white hover:bg-[#167fdc] disabled:cursor-not-allowed disabled:bg-[#b9c8d8]">{isEditing ? <Check className="mr-1.5 inline-block h-3.5 w-3.5" /> : <Pencil className="mr-1.5 inline-block h-3.5 w-3.5" />}{isEditing ? '保存' : '修改'}</button>
                </div>
              </div>
              <div className="p-5">
                <div className={`min-w-0 rounded-[18px] bg-[#172336] p-4 shadow-[0_12px_28px_rgba(22,34,54,.12)] ${isEditing ? 'ring-2 ring-[#278fee]/30' : ''}`}><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-[12px] font-medium text-white"><span className={`h-2 w-2 rounded-full ${isEditing ? 'bg-[#73baff]' : 'bg-[#60d59b]'}`} />配置 JSON {isEditing ? <span className="rounded-full bg-[#278fee]/20 px-2 py-0.5 text-[10px] font-normal text-[#9fd1ff]">编辑中</span> : null}</div><button type="button" onClick={() => navigator.clipboard?.writeText(isEditing ? draftText : prettyJson(config))} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-[#9babbe] hover:bg-white/[.08] hover:text-white"><Clipboard className="h-3 w-3" />复制</button></div><div className="h-[calc(100vh-300px)] min-h-[420px] max-h-[760px] overflow-auto rounded-[12px] bg-[#101b2c] p-4">{isEditing ? <textarea value={draftText} onChange={(event) => updateDraft(event.currentTarget.value)} spellCheck={false} className="h-full min-h-[360px] w-full resize-none bg-transparent font-mono text-[11px] leading-[1.72] text-[#d6deeb] outline-none" /> : <JsonCodeView config={config} />}</div>{isEditing ? (jsonError ? <div className="mt-3 flex gap-2 rounded-[8px] bg-[#44272d] px-3 py-2 text-[11px] leading-5 text-[#ffb4b9]"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{jsonError}</div> : <div className="mt-3 flex items-center gap-2 text-[10px] text-[#86a0ba]"><Check className="h-3.5 w-3.5 text-[#62d49c]" />JSON 格式正确 · {draftText.length} 个字符</div>) : null}</div>
              </div>
            </section>
          )}
        </div>
      </main>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 p-5">
          <div className="w-[390px] rounded-[12px] bg-white p-6 shadow-[0_18px_50px_rgba(18,34,62,.22)]"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff4df] text-[#e9a63e]"><AlertTriangle className="h-5 w-5" /></div><div><h3 className="text-[16px] font-semibold text-[#293344]">确认保存配置？</h3><p className="mt-2 text-[12px] leading-5 text-[#8590a1]">保存后将更新「{draftConfig.name}」的 JSON 配置，前台表单会按新配置展示。</p></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setConfirmOpen(false)} className="h-9 rounded-[4px] border border-[#dfe3ea] px-5 text-[12px] text-[#6c7789]">返回修改</button><button type="button" onClick={saveConfig} className="h-9 rounded-[4px] bg-[#278fee] px-5 text-[12px] text-white">确认保存</button></div></div>
        </div>
      ) : null}

      {cacheConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 p-5">
          <div className="w-[420px] rounded-[12px] bg-white p-6 shadow-[0_18px_50px_rgba(18,34,62,.22)]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff4df] text-[#e9a63e]"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#293344]">确认清理缓存？</h3>
                <p className="mt-2 text-[12px] leading-5 text-[#657084]">缓存清理后更新的配置将会立即生效，是否继续操作？</p>
                <p className="mt-2 text-[11px] text-[#a1a9b5]">功能标识：{functionCode.trim()}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCacheConfirmOpen(false)} className="h-9 rounded-[4px] border border-[#dfe3ea] px-5 text-[12px] text-[#6c7789]">取消</button>
              <button type="button" onClick={clearCache} className="h-9 rounded-[4px] bg-[#278fee] px-5 text-[12px] text-white">继续清理</button>
            </div>
          </div>
        </div>
      ) : null}

      {requirementDrawerOpen ? <RequirementDocumentDrawer kind="ai-ecommerce" onClose={() => setRequirementDrawerOpen(false)} /> : null}
    </div>
  );
}

