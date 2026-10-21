import { useEffect, useMemo, useState } from 'react';
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
  ImagePlus,
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
  X,
} from 'lucide-react';

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
  name: string;
  description: string;
  preview?: {
    visible?: boolean;
    slides?: unknown[];
    autoplay?: boolean;
    loop?: boolean;
    intervalMs?: number;
  };
  optionSets?: Record<string, unknown>;
  fields: SkillField[];
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

const NAV_GROUPS = [
  { label: '企业账号管理（2.0）', icon: Users },
  { label: '灵感社区', icon: Sparkles, expanded: true, children: ['灵感专题', '提示词库', '灵感作品管理', '活动管理', '玩法专题', '玩法管理', 'Skill配置'] },
  { label: '系统管理', icon: Settings2 },
  { label: '内容运营管理', icon: FileText },
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
  { label: '会员中心', icon: Users },
];

const prettyJson = (config: SkillConfig) => JSON.stringify(config, null, 2);

function isSkillConfig(value: unknown): value is SkillConfig {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SkillConfig>;
  return typeof candidate.skillCode === 'string' && typeof candidate.name === 'string' && Array.isArray(candidate.fields);
}

function getInitialPreviewValue(field: SkillField): string | string[] {
  if (field.type === 'media-upload') return [];
  if (field.defaultValue) return field.defaultValue;
  return field.options?.[0]?.value ?? '';
}

function SkillPreview({ config }: { config: SkillConfig }) {
  const initialValues = useMemo(() => Object.fromEntries(config.fields.map((field) => [field.key, getInitialPreviewValue(field)])), [config]);
  const [values, setValues] = useState<Record<string, string | string[]>>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const updateValue = (key: string, value: string | string[]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="mx-auto h-[560px] w-full max-w-[620px] overflow-hidden rounded-[22px] border border-[#e4e7f1] bg-white shadow-[0_18px_42px_rgba(50,65,105,0.12)]">
      <div className="flex h-[64px] items-center justify-between border-b border-[#edf0f6] px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#202838]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eff2ff] text-[#665de8]"><Sparkles className="h-3.5 w-3.5" /></span>
            {config.name || 'Skill 预览'}
          </div>
          <p className="mt-0.5 text-[10px] text-[#9aa3b5]">根据当前 JSON 配置实时生成表单</p>
        </div>
        <span className="rounded-full bg-[#f0f2ff] px-2.5 py-1 text-[10px] font-medium text-[#6c62d7]">实时预览</span>
      </div>

      <div className="grid h-[496px] grid-cols-[42%_58%] bg-[#f3f3ff]">
        <div className="relative overflow-hidden border-r border-white/70 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.94),transparent_26%),linear-gradient(145deg,#f0eeff_0%,#e9e7ff_52%,#dfe2ff_100%)] p-4">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#9b99e7_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative flex h-full min-h-[360px] flex-col justify-center gap-3">
            <div className="mx-auto w-[84%] rotate-[-5deg] rounded-[14px] border-[6px] border-white/90 bg-[linear-gradient(145deg,#d5e8ff,#ecf6ff_42%,#8b8fe8)] p-1.5 shadow-[0_14px_26px_rgba(75,83,160,.2)]">
              <div className="aspect-[1.1/1] rounded-[8px] bg-[linear-gradient(145deg,#f3f8ff_0%,#bed8f6_44%,#7772c9_45%,#f4d4c9_78%,#faf5e8_100%)] p-2.5">
                <div className="flex h-full flex-col justify-between rounded-[6px] border border-white/70 bg-white/20 p-2">
                  <span className="text-[8px] font-semibold tracking-[.18em] text-[#54618c]">LIVE VISUAL</span>
                  <span className="text-[17px] font-bold leading-[1.05] text-white drop-shadow-[0_2px_4px_rgba(24,31,77,.25)]">直播<br />视觉物料</span>
                  <span className="h-1.5 w-16 rounded-full bg-white/80" />
                </div>
              </div>
            </div>
            <div className="mx-auto w-[56%] rotate-[6deg] rounded-[12px] border-[5px] border-white/90 bg-[linear-gradient(135deg,#f7e4cf,#becaf5)] p-1.5 opacity-90 shadow-lg">
              <div className="aspect-[1.45/1] rounded-[7px] bg-[linear-gradient(145deg,#fedfba,#ee9a84_50%,#8d91dc)]" />
            </div>
            <div className="flex justify-center gap-1.5 pt-1"><span className="h-1.5 w-5 rounded-full bg-[#615ee1]" /><span className="h-1.5 w-1.5 rounded-full bg-white/80" /><span className="h-1.5 w-1.5 rounded-full bg-white/80" /></div>
          </div>
        </div>

        <div className="overflow-y-auto bg-white px-4 py-4 [scrollbar-width:thin]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[#242938]">{config.name || '未命名 Skill'}</h3>
              <p className="mt-1 text-[10px] leading-4 text-[#8e96a7]">{config.description || '暂无描述'}</p>
            </div>
            <button type="button" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f7f8fb] text-[#8991a3]" aria-label="关闭预览"><X className="h-3.5 w-3.5" /></button>
          </div>

          {config.fields.map((field) => {
            const value = values[field.key] ?? '';
            return (
              <div key={field.key} className="mb-3.5">
                <label className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-[#49536a]">{field.label}{field.required ? <span className="text-[#ff6060]">*</span> : null}</label>
                {field.type === 'radio' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(field.options ?? []).map((option) => (
                      <button key={option.value} type="button" onClick={() => updateValue(field.key, option.value)} className={`rounded-[7px] border px-2.5 py-1.5 text-[10px] transition ${value === option.value ? 'border-[#817cf0] bg-[#efefff] font-medium text-[#5c57cd]' : 'border-[#eef0f6] bg-[#f8f9fb] text-[#697388] hover:border-[#cbc9fa]'}`}>{option.label}</button>
                    ))}
                  </div>
                ) : null}
                {field.type === 'ratio' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(field.options ?? []).map((option) => (
                      <button key={option.value} type="button" onClick={() => updateValue(field.key, option.value)} className={`rounded-[7px] px-2.5 py-1.5 text-[10px] ${value === option.value ? 'bg-[#dedcff] font-medium text-[#5b56c5]' : 'bg-[#f3f4f8] text-[#667086]'}`}>{option.label}</button>
                    ))}
                  </div>
                ) : null}
                {field.type === 'input' ? <input value={typeof value === 'string' ? value : ''} onChange={(event) => updateValue(field.key, event.currentTarget.value)} placeholder={field.props?.placeholder} maxLength={field.props?.maxLength} className="h-9 w-full rounded-[8px] bg-[#f6f7fa] px-2.5 text-[10px] text-[#3b4456] outline-none ring-1 ring-transparent placeholder:text-[#b0b6c3] focus:ring-[#bbb8fa]" /> : null}
                {field.type === 'textarea' ? <textarea value={typeof value === 'string' ? value : ''} onChange={(event) => updateValue(field.key, event.currentTarget.value)} placeholder={field.props?.placeholder} maxLength={field.props?.maxLength} rows={3} className="w-full resize-none rounded-[8px] bg-[#f6f7fa] px-2.5 py-2 text-[10px] leading-4 text-[#3b4456] outline-none ring-1 ring-transparent placeholder:text-[#b0b6c3] focus:ring-[#bbb8fa]" /> : null}
                {field.type === 'media-upload' ? (
                  <button type="button" className="flex h-[64px] w-full flex-col items-center justify-center gap-0.5 rounded-[8px] border border-dashed border-[#d8dced] bg-[#f8f9fc] text-[#9ba3b5] hover:border-[#a8a4ef] hover:bg-[#f4f3ff]">
                    <ImagePlus className="h-4 w-4 text-[#8990a6]" /><span className="text-[10px]">点击或拖拽上传</span><span className="text-[9px]">最多 {field.maxCount ?? 10} 张，支持 JPG / PNG / WEBP</span>
                  </button>
                ) : null}
                {field.description ? <p className="mt-1 text-[9px] leading-3.5 text-[#a1a8b6]">{field.description}</p> : null}
              </div>
            );
          })}

          <div className="mt-4 flex gap-2 border-t border-[#f0f1f5] pt-3">
            {config.actions?.fillPrompt?.enabled !== false ? <button type="button" className="flex-1 rounded-[8px] bg-[#f1f3f8] py-2 text-[10px] font-medium text-[#788196]">{config.actions?.fillPrompt?.text || '带入输入框'}</button> : null}
            {config.actions?.generate?.enabled !== false ? <button type="button" className="flex-[1.5] rounded-[8px] bg-[#615ce6] py-2 text-[10px] font-medium text-white shadow-[0_7px_14px_rgba(97,92,230,.2)]">{config.actions?.generate?.text || '开始生成'}</button> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSidebar({ onBackToDirectory }: { onBackToDirectory: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState('Skill配置');

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[228px] flex-col bg-[#061b2d] text-white">
      <div className="flex h-[62px] items-center gap-3 border-b border-white/[.08] px-5">
        <button type="button" onClick={onBackToDirectory} className="flex items-center gap-3" title="返回需求目录">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#1493f4] shadow-[0_4px_10px_rgba(20,147,244,.3)]"><Sparkles className="h-[18px] w-[18px] text-white" /></span>
          <span className="text-[16px] font-semibold tracking-[-.04em]">创客贴管理后台</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_GROUPS.map((group) => {
          const Icon = group.icon;
          const isPlay = group.label === '灵感社区';
          const isActive = group.label === '玩法管理';
          return (
            <div key={group.label}>
              <button type="button" onClick={() => isPlay && setExpanded((value) => !value)} className={`flex h-[42px] w-full items-center justify-between px-5 text-left text-[13px] transition ${isActive ? 'bg-[#128cf1] text-white' : 'text-[#a8bacb] hover:bg-white/[.06] hover:text-white'}`}>
                <span className="flex min-w-0 items-center gap-3"><Icon className="h-[15px] w-[15px] shrink-0 opacity-85" /><span className="truncate">{group.label}</span></span>
                {(group.expanded || isPlay) ? <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? '' : '-rotate-90'}`} /> : null}
              </button>
              {isPlay && expanded ? (
                <div className="bg-[#031525] py-1">
                  {group.children?.map((child) => (
                    <button type="button" key={child} onClick={() => setActiveItem(child)} className={`flex h-[39px] w-full items-center pl-[43px] text-left text-[12px] transition ${child === activeItem ? 'bg-[#128cf1] font-medium text-white' : 'text-[#8ea2b6] hover:bg-white/[.06] hover:text-white'}`}>
                      {child === 'Skill配置' ? <Code2 className="mr-2 h-3.5 w-3.5" /> : null}<span className="truncate">{child}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/[.08] px-5 py-4 text-[11px] text-[#8097ab]">需求目录 · 原型预览</div>
    </aside>
  );
}

function TopHeader() {
  return (
    <header className="fixed left-[228px] right-0 top-0 z-20 flex h-[62px] items-center justify-between border-b border-[#e6e9ef] bg-white px-5 shadow-[0_1px_4px_rgba(41,53,77,.03)]">
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

export function AdminBackofficePage({ onBackToDirectory }: { onBackToDirectory: () => void }) {
  const [config, setConfig] = useState<SkillConfig>(DEFAULT_SKILL_CONFIG);
  const [searchValue, setSearchValue] = useState(DEFAULT_SKILL_CONFIG.skillCode);
  const [queriedCode, setQueriedCode] = useState(DEFAULT_SKILL_CONFIG.skillCode);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draftText, setDraftText] = useState(() => prettyJson(DEFAULT_SKILL_CONFIG));
  const [draftConfig, setDraftConfig] = useState<SkillConfig>(DEFAULT_SKILL_CONFIG);
  const [jsonError, setJsonError] = useState('');
  const [saved, setSaved] = useState(false);

  const isFound = queriedCode.trim() === config.skillCode;

  const runQuery = () => {
    setQueriedCode(searchValue.trim());
    setSaved(false);
  };

  const resetQuery = () => {
    setSearchValue(config.skillCode);
    setQueriedCode(config.skillCode);
    setSaved(false);
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
    setSearchValue(draftConfig.skillCode);
    setQueriedCode(draftConfig.skillCode);
    setConfirmOpen(false);
    setIsEditing(false);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#1f2838]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <div className="mb-4 flex items-center gap-2 text-[12px] text-[#9aa3b1]"><span>灵感社区</span><ChevronRight className="h-3.5 w-3.5" /><span>玩法管理</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4f5b6f]">Skill配置</span></div>

          <section className="mb-4 rounded-[3px] bg-white p-5 shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <div className="mb-4 flex items-center justify-between"><div><h1 className="text-[18px] font-semibold text-[#283244]">Skill配置</h1><p className="mt-1 text-[12px] text-[#a1a9b5]">按 Skill 标识查询并管理前台动态表单与提示词配置</p></div><span className="rounded-full bg-[#edf8f2] px-3 py-1 text-[11px] text-[#35a16b]">配置中心</span></div>
            <div className="flex items-center gap-3">
              <label className="flex h-10 w-[360px] items-center rounded-[3px] border border-[#dfe3ea] bg-white px-3 focus-within:border-[#328ff0]"><span className="mr-3 whitespace-nowrap text-[12px] text-[#7d8797]">Skill标识</span><input value={searchValue} onChange={(event) => setSearchValue(event.currentTarget.value)} onKeyDown={(event) => event.key === 'Enter' && runQuery()} placeholder="请输入 Skill 标识" className="min-w-0 flex-1 text-[12px] text-[#354052] outline-none placeholder:text-[#b6bdc8]" /></label>
              <button type="button" onClick={runQuery} className="h-10 rounded-[3px] bg-[#278fee] px-6 text-[12px] text-white shadow-[0_4px_10px_rgba(39,143,238,.16)] hover:bg-[#167fdc]"><Search className="mr-1.5 inline-block h-3.5 w-3.5" />查询</button>
              <button type="button" onClick={resetQuery} className="h-10 rounded-[3px] border border-[#dfe3ea] bg-white px-5 text-[12px] text-[#697487] hover:border-[#b9c2d0]">重置</button>
            </div>
          </section>

          {!isFound ? (
            <section className="flex min-h-[440px] items-center justify-center rounded-[3px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f3f7] text-[#9da7b5]"><Search className="h-6 w-6" /></div><h2 className="text-[15px] font-medium text-[#4d596c]">未找到对应的 Skill 配置</h2><p className="mt-2 text-[12px] text-[#a1a9b5]">请检查 Skill 标识是否正确，或点击重置查看示例配置</p></div></section>
          ) : (
            <section className="rounded-[3px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
              <div className="flex items-center justify-between border-b border-[#edf0f4] px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#eef2ff] text-[#615ce6]"><Code2 className="h-[18px] w-[18px]" /></div><div><div className="flex items-center gap-2"><h2 className="text-[15px] font-semibold text-[#263143]">{config.name}</h2><span className="rounded-full bg-[#e9f8ef] px-2 py-0.5 text-[10px] text-[#37a36d]">已启用</span></div><p className="mt-1 text-[11px] text-[#9aa3b1]">{config.skillCode} · 共 {config.fields.length} 个配置字段</p></div></div><div className="flex items-center gap-3"><span className="text-[11px] text-[#a3aab6]">{saved ? '刚刚已保存' : isEditing ? '编辑中：修改后实时预览' : '最后更新：2026-10-21 14:28'}</span>{isEditing ? <button type="button" onClick={() => { setIsEditing(false); setJsonError(''); }} className="h-9 rounded-[3px] border border-[#dfe3ea] bg-white px-4 text-[12px] text-[#687386] hover:bg-[#f7f8fa]">取消</button> : null}<button type="button" onClick={isEditing ? confirmSave : openEditor} disabled={isEditing && Boolean(jsonError)} className="h-9 rounded-[3px] bg-[#278fee] px-5 text-[12px] text-white hover:bg-[#167fdc] disabled:cursor-not-allowed disabled:bg-[#b9c8d8]">{isEditing ? <Check className="mr-1.5 inline-block h-3.5 w-3.5" /> : <Pencil className="mr-1.5 inline-block h-3.5 w-3.5" />}{isEditing ? '保存' : '修改'}</button></div></div>
              <div className="grid grid-cols-[minmax(360px,42%)_minmax(540px,58%)] gap-5 p-5">
                <div className={`min-w-0 rounded-[18px] bg-[#172336] p-4 shadow-[0_12px_28px_rgba(22,34,54,.12)] ${isEditing ? 'ring-2 ring-[#278fee]/30' : ''}`}><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-[12px] font-medium text-white"><span className={`h-2 w-2 rounded-full ${isEditing ? 'bg-[#73baff]' : 'bg-[#60d59b]'}`} />配置 JSON {isEditing ? <span className="rounded-full bg-[#278fee]/20 px-2 py-0.5 text-[10px] font-normal text-[#9fd1ff]">编辑中</span> : null}</div><button type="button" onClick={() => navigator.clipboard?.writeText(isEditing ? draftText : prettyJson(config))} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-[#9babbe] hover:bg-white/[.08] hover:text-white"><Clipboard className="h-3 w-3" />复制</button></div><div className="max-h-[630px] min-h-[620px] overflow-auto rounded-[12px] bg-[#101b2c] p-4">{isEditing ? <textarea value={draftText} onChange={(event) => updateDraft(event.currentTarget.value)} spellCheck={false} className="min-h-[588px] w-full resize-none bg-transparent font-mono text-[11px] leading-[1.72] text-[#d6deeb] outline-none" /> : <JsonCodeView config={config} />}</div>{isEditing ? (jsonError ? <div className="mt-3 flex gap-2 rounded-[8px] bg-[#44272d] px-3 py-2 text-[11px] leading-5 text-[#ffb4b9]"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{jsonError}</div> : <div className="mt-3 flex items-center gap-2 text-[10px] text-[#86a0ba]"><Check className="h-3.5 w-3.5 text-[#62d49c]" />JSON 格式正确 · {draftText.length} 个字符</div>) : null}</div>
                <div className="min-w-0"><SkillPreview config={isEditing ? draftConfig : config} /></div>
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
    </div>
  );
}

