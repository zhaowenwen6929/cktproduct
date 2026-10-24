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
import { RequirementDocumentDrawer } from './RequirementDocumentPage';

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
  { label: '创客贴版权资源库', icon: ShieldCheck },
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
];

const prettyJson = (config: SkillConfig) => JSON.stringify(config, null, 2);

type RequirementNavItem = {
  id: string;
  title: string;
  navLabels?: string[];
  level: 'main' | 'sub';
  requirementKey: string;
  parentId?: string;
  requirement: string;
  summary: string;
  details: string[];
  addedAt: string;
  status: '待开发' | '已上线';
  path: string;
};

const REQUIREMENT_NAV_ITEMS: RequirementNavItem[] = ([
  { id: 'membership-redesign', title: '2026年10月会员改版', level: 'main', requirementKey: 'V2610', requirement: '完善会员套餐、会员页面和积分配置能力。', summary: '会员中心后台和前台会员页同步改版。', details: ['会员套餐管理、开通会员和会员页面配置作为本次改版的子需求。', '统一补充积分、权益、展示配置和企业使用场景。'], addedAt: '2026-10-24', status: '待开发', path: '/admin-backoffice/requirements/membership' },
  { id: 'membership-packages', title: '会员套餐新增积分量', navLabels: ['会员套餐管理'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '新增套餐积分量、发放单位和发放周期配置。', summary: '会员套餐支持补充积分发放规则，历史套餐保持兼容。', details: ['积分量为必填项，已创建套餐展示积分量且不可修改。', '支持按每人或团队发放，周期支持按月或一次性。', '历史套餐未填写积分量时，按照所属会员等级的积分量发放。'], addedAt: '2026-10-24', status: '待开发', path: '/admin-backoffice/membership-packages' },
  { id: 'membership-open', title: '开通会员新增会员类型', navLabels: ['开通会员'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '开通会员页同步会员套餐管理中的会员类型和新增等级 level。', summary: '开通会员与会员套餐管理共用会员类型数据，新增会员等级名称和 level 保持一致。', details: ['复用会员套餐管理中的完整会员类型列表。', '新增基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）220。', '会员类型显示名称在前，level 数字在后。'], addedAt: '2026-10-24', status: '待开发', path: '/admin-backoffice/membership-open' },
  { id: 'membership-page-config', title: '会员页面配置套餐与权益', navLabels: ['会员页面配置'], level: 'sub', requirementKey: 'V2610', parentId: 'membership-redesign', requirement: '配置网页版和移动端会员页面的套餐、权益和说明内容。', summary: '会员页配置拆分个人使用和企业使用，并支持各模块 JSON 配置。', details: ['支持网页版和移动端两个端配置，默认进入网页版。', '支持套餐、权益概览、权益明细、模型消耗、商用授权和常见问题模块。', '会员套餐价格和积分沿用真实套餐数据。'], addedAt: '2026-10-24', status: '待开发', path: '/admin-backoffice/membership-page-config' },
  { id: 'guided-search', title: '搜索引导管理', level: 'main', requirementKey: 'SG-2610', requirement: '维护引导词节点、节点关系，并查询实际映射配置。', summary: '支持引导词、关系和映射结果的查询与维护。', details: ['支持节点、关系和映射三个管理视图。', '可按关键词、层级、关系类型和状态筛选数据。', '支持导入、编辑、启停和删除操作。'], addedAt: '2026-10-22', status: '待开发', path: '/admin-backoffice/guided-search' },
  { id: 'ai-ecommerce', title: 'AI电商配置', level: 'main', requirementKey: 'AIE-2610', requirement: '按 function_code 和 scene 查询、编辑 AI 电商配置。', summary: '面向 AI 电商技能配置的查询、编辑和缓存管理。', details: ['支持按功能标识和场景查询配置。', '支持 JSON 草稿编辑、格式校验和保存。', '支持清理对应功能缓存，并保留最近查询记录。'], addedAt: '2026-10-22', status: '待开发', path: '/admin-backoffice/ai-ecommerce' },
] as RequirementNavItem[]).sort((left, right) => right.addedAt.localeCompare(left.addedAt));

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
            onNavigate?.(label);
          }
        }} style={{ paddingLeft: `${43 + level * 20}px` }} className={`mx-2 flex h-[34px] w-[calc(100%-16px)] items-center justify-between rounded-[5px] pr-3 text-left text-[10px] transition ${label === activeItem ? 'bg-[#128cf1] font-medium text-white shadow-[0_3px_10px_rgba(18,140,241,.2)]' : 'text-[#8ea2b6] hover:bg-white/[.06] hover:text-white'}`}>
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate">{label}</span>
            {linkedRequirements.map((requirement) => <RequirementKeyBadge key={requirement.id} requirement={requirement} />)}
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

function RequirementCard({ item, index, nested = false, onNavigate, childCount = 0, isChildrenExpanded = false, onToggleChildren }: { item: RequirementNavItem; index: number; nested?: boolean; onNavigate?: (path: string) => void; childCount?: number; isChildrenExpanded?: boolean; onToggleChildren?: () => void }) {
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
    className={`${nested ? 'rounded-[8px] border border-[#e5eaf1] bg-[#fbfcfe] p-4 transition hover:border-[#b9d7f7] hover:shadow-[0_5px_16px_rgba(52,111,171,.08)]' : 'rounded-[8px] border border-[#dce5f0] bg-white p-4 transition hover:border-[#b9d7f7] hover:shadow-[0_5px_16px_rgba(52,111,171,.08)]'} ${canToggleChildren ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#278fee]/25' : ''}`}
  >
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className={nested ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef4fb] text-[11px] font-semibold text-[#6c86a5]' : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff2b8] text-[12px] font-semibold text-[#a16b00]'}>{index + 1}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[15px] font-semibold text-[#27344a]">{item.title}</h2><span className="rounded-[4px] bg-[#eaf3ff] px-2 py-0.5 text-[10px] font-semibold text-[#3979b7]">{item.requirementKey}</span><span className="rounded-[4px] bg-[#fff7dc] px-2 py-0.5 text-[10px] font-medium text-[#a36d08]">{item.status}</span>{nested ? <span className="rounded-[4px] bg-[#eef5ff] px-2 py-0.5 text-[10px] font-medium text-[#5c82b1]">子需求</span> : <span className="rounded-[4px] bg-[#f1f4f8] px-2 py-0.5 text-[10px] font-medium text-[#6d7b8d]">主需求</span>}</div><p className="mt-2 text-[12px] leading-5 text-[#4d5b70]"><span className="font-medium text-[#7c899b]">需求：</span>{item.requirement}</p><p className="mt-1 text-[12px] leading-5 text-[#8b96a7]"><span className="font-medium text-[#a2adbb]">概述：</span>{item.summary}</p></div></div><div className="flex shrink-0 items-center gap-3"><span className="text-[11px] text-[#9aa5b5]">新增于 {item.addedAt}</span>{hasPage ? <button type="button" onClick={(event) => { event.stopPropagation(); onNavigate?.(item.path); }} className="inline-flex h-8 items-center gap-1 rounded-[4px] bg-[#278fee] px-3.5 text-[12px] font-medium text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]">进入页面<ChevronRight className="h-3.5 w-3.5" /></button> : null}{canToggleChildren ? <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#f6f8fb] px-2.5 py-1.5 text-[11px] text-[#65758b]">{isChildrenExpanded ? '已展开子需求' : `展开 ${childCount} 个子需求`}<ChevronDown className={`h-3 w-3 transition-transform ${isChildrenExpanded ? '' : '-rotate-90'}`} /></span> : null}</div></div>
    <div className="mt-4 border-t border-[#edf0f4] pt-3"><div className="mb-2 text-[12px] font-medium text-[#526075]">需求明细</div><ul className="grid gap-1.5 md:grid-cols-3">{item.details.map((detail) => <li key={detail} className="flex items-start gap-2 text-[11px] leading-5 text-[#7e8a9c]"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#278fee]" />{detail}</li>)}</ul></div>
  </article>;
}

export function RequirementListPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig, onNavigateToRequirement, onNavigateToRequirementList }: RequirementListPageProps) {
  const mainRequirements = REQUIREMENT_NAV_ITEMS.filter((item) => item.level === 'main');
  const childRequirementCount = REQUIREMENT_NAV_ITEMS.filter((item) => item.level === 'sub').length;
  const [expandedMainRequirements, setExpandedMainRequirements] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#263247]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="需求列表" onNavigateToRequirement={onNavigateToRequirement} onNavigateToRequirementList={onNavigateToRequirementList} onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员套餐管理') onNavigateToMembershipPackages?.(); if (item === '会员页面配置') onNavigateToMembershipPageConfig?.(); }} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <div className="mb-4 flex items-center gap-2 text-[12px] text-[#98a2b2]"><span>需求中心</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4d5b70]">需求列表</span></div>
          <section className="overflow-hidden rounded-[4px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <header className="flex items-center justify-between border-b border-[#e8edf3] px-5 py-4"><div><h1 className="text-[18px] font-semibold text-[#283244]">需求列表</h1><p className="mt-1 text-[12px] text-[#98a2b2]">按主需求新增时间倒序展示，子需求归属在对应主需求下。</p></div><span className="rounded-[5px] bg-[#fff4c8] px-3 py-1.5 text-[12px] font-medium text-[#986a00]">{mainRequirements.length} 个主需求 · {childRequirementCount} 个子需求</span></header>
            <div className="space-y-3 p-5">
              {mainRequirements.map((item, index) => {
                const children = REQUIREMENT_NAV_ITEMS.filter((child) => child.parentId === item.id);
                const isExpanded = Boolean(expandedMainRequirements[item.id]);
                return <div key={item.id}><RequirementCard item={item} index={index} childCount={children.length} isChildrenExpanded={isExpanded} onToggleChildren={() => setExpandedMainRequirements((current) => ({ ...current, [item.id]: !current[item.id] }))} onNavigate={onNavigateToRequirement} />{children.length > 0 && isExpanded ? <div className="ml-5 mt-2 space-y-2 border-l-2 border-[#f2d46d] pl-4">{children.map((child, childIndex) => <RequirementCard key={child.id} item={child} index={childIndex} nested onNavigate={onNavigateToRequirement} />)}</div> : null}</div>;
              })}
            </div>
          </section>
        </div>
      </main>
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

