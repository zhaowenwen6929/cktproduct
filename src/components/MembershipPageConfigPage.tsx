import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Save, Trash2 } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';

type PlatformKey = 'web' | 'mobile';
type ModuleKey = 'plans' | 'overview' | 'details' | 'model-consumption' | 'commercial-license' | 'faq';
type JsonModuleKey = Exclude<ModuleKey, 'plans'>;

type PlanItem = {
  id: string;
  name: string;
  guideText: string;
  duration: string;
};

type PlanGroup = {
  id: string;
  name: string;
  guideText: string;
  memberLevel: string;
  items: PlanItem[];
};

type PlatformConfig = {
  plans: PlanGroup[];
  json: Record<JsonModuleKey, string>;
};

type ConfigState = Record<PlatformKey, PlatformConfig>;

const MODULES: Array<{ key: ModuleKey; label: string; description: string }> = [
  { key: 'plans', label: '套餐', description: '配置会员套餐分组、会员等级和套餐周期' },
  { key: 'overview', label: '权益概览', description: '配置会员页上方的权益概览卡片' },
  { key: 'details', label: '权益明细', description: '配置权益明细及权益说明' },
  { key: 'model-consumption', label: '模型消耗', description: '配置模型消耗、额度和计费说明' },
  { key: 'commercial-license', label: '商用授权', description: '配置商用授权范围和说明' },
  { key: 'faq', label: '常见问题', description: '配置会员页常见问题及答案' },
];

const MEMBER_LEVELS = ['基础版（个人）', '高级版（个人）', '高级版（团队）', '企业版'];

const createDefaultConfig = (platform: PlatformKey): PlatformConfig => ({
  plans: [
    {
      id: `${platform}-recommended`,
      name: '推荐套餐',
      guideText: '适合大多数用户的会员方案',
      memberLevel: '高级版（个人）',
      items: [
        { id: `${platform}-recommended-month`, name: '月度会员', guideText: '灵活订阅，随时可用', duration: '30天' },
        { id: `${platform}-recommended-year`, name: '年度会员', guideText: '年度订阅，更优惠', duration: '365天' },
      ],
    },
    {
      id: `${platform}-team`,
      name: '团队套餐',
      guideText: '面向团队协作和企业使用',
      memberLevel: '高级版（团队）',
      items: [
        { id: `${platform}-team-year`, name: '团队年度会员', guideText: '多人协作，统一管理', duration: '365天' },
      ],
    },
  ],
  json: {
    overview: JSON.stringify({
      title: '会员权益概览',
      subtitle: '升级会员，解锁更多创作能力',
      items: [
        { title: '海量模板', description: '解锁更多优质模板资源' },
        { title: 'AI 创作', description: '享受更多 AI 生成权益' },
      ],
    }, null, 2),
    details: JSON.stringify({
      sections: [
        { title: '模板权益', items: ['全量模板', '高级模板', '商用模板'] },
        { title: '创作权益', items: ['高清导出', '去除水印', '团队协作'] },
      ],
    }, null, 2),
    'model-consumption': JSON.stringify({
      title: 'AI 模型消耗',
      description: '不同会员等级对应不同的 AI 生成额度',
      models: [{ name: 'AI 图片生成', unit: '次', quota: 100 }],
    }, null, 2),
    'commercial-license': JSON.stringify({
      title: '商用授权',
      description: '会员生成内容可用于商业场景',
      enabled: true,
      scopes: ['商品宣传', '营销推广', '社交媒体'],
    }, null, 2),
    faq: JSON.stringify({
      title: '常见问题',
      items: [
        { question: '会员权益什么时候生效？', answer: '购买成功后立即生效。' },
        { question: '会员到期后还能使用已生成内容吗？', answer: '已生成内容不受影响。' },
      ],
    }, null, 2),
  },
});

const createDefaultState = (): ConfigState => ({ web: createDefaultConfig('web'), mobile: createDefaultConfig('mobile') });
const STORAGE_KEY = 'admin-membership-page-config';

const readStoredState = (): ConfigState => {
  if (typeof window === 'undefined') return createDefaultState();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultState();
    const parsed = JSON.parse(stored) as Partial<ConfigState>;
    const defaults = createDefaultState();
    return {
      web: parsed.web ? { ...defaults.web, ...parsed.web, json: { ...defaults.web.json, ...parsed.web.json } } : defaults.web,
      mobile: parsed.mobile ? { ...defaults.mobile, ...parsed.mobile, json: { ...defaults.mobile.json, ...parsed.mobile.json } } : defaults.mobile,
    };
  } catch {
    return createDefaultState();
  }
};

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function MembershipPageConfigPage({
  onBackToDirectory,
  onNavigateToSkillConfig,
  onNavigateToGuidedSearch,
  onNavigateToMembershipPackages,
}: {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
}) {
  const [platform, setPlatform] = useState<PlatformKey>('web');
  const [activeModule, setActiveModule] = useState<ModuleKey>('plans');
  const [configs, setConfigs] = useState<ConfigState>(readStoredState);
  const [jsonErrors, setJsonErrors] = useState<Partial<Record<JsonModuleKey, string>>>({});
  const [saved, setSaved] = useState(false);

  const currentConfig = configs[platform];
  const activeModuleMeta = MODULES.find((module) => module.key === activeModule) ?? MODULES[0];

  useEffect(() => {
    setSaved(false);
  }, [platform, activeModule]);

  const updatePlatformConfig = (updater: (config: PlatformConfig) => PlatformConfig) => {
    setConfigs((current) => ({ ...current, [platform]: updater(current[platform]) }));
    setSaved(false);
  };

  const updatePlanGroup = (groupId: string, updater: (group: PlanGroup) => PlanGroup) => {
    updatePlatformConfig((config) => ({
      ...config,
      plans: config.plans.map((group) => group.id === groupId ? updater(group) : group),
    }));
  };

  const updatePlanItem = (groupId: string, itemId: string, updater: (item: PlanItem) => PlanItem) => {
    updatePlanGroup(groupId, (group) => ({
      ...group,
      items: group.items.map((item) => item.id === itemId ? updater(item) : item),
    }));
  };

  const updateJson = (key: JsonModuleKey, value: string) => {
    updatePlatformConfig((config) => ({ ...config, json: { ...config.json, [key]: value } }));
    setJsonErrors((current) => ({ ...current, [key]: undefined }));
  };

  const save = () => {
    const errors: Partial<Record<JsonModuleKey, string>> = {};
    (Object.keys(currentConfig.json) as JsonModuleKey[]).forEach((key) => {
      try {
        JSON.parse(currentConfig.json[key]);
      } catch {
        errors[key] = 'JSON 格式不正确，请检查引号、括号和逗号。';
      }
    });
    if (Object.keys(errors).length > 0) {
      setJsonErrors(errors);
      setActiveModule((Object.keys(errors)[0] as JsonModuleKey) || 'overview');
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    } catch {
      // Keep the prototype usable when browser storage is unavailable.
    }
    setJsonErrors({});
    setSaved(true);
  };

  const renderPlanEditor = () => (
    <div className="space-y-4">
      <div className="rounded-[8px] border border-[#e8edf4] bg-[#f8fafc] px-4 py-3 text-[12px] leading-5 text-[#778398]">
        套餐配置支持两级结构：一级配置套餐分组和关联会员等级，二级配置具体套餐名称、引导文案与时长。
      </div>
      {currentConfig.plans.map((group, groupIndex) => (
        <section key={group.id} className="rounded-[8px] border border-[#e3e8f0] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf0f4] bg-[#fafbfd] px-4 py-3">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#27344a]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e9f3ff] text-[11px] text-[#278fee]">{groupIndex + 1}</span>一级套餐配置</div>
            <button type="button" onClick={() => updatePlatformConfig((config) => ({ ...config, plans: config.plans.filter((item) => item.id !== group.id) }))} className="inline-flex items-center gap-1 text-[12px] text-[#e65a5a] hover:text-[#c93d3d]"><Trash2 className="h-3.5 w-3.5" />删除一级</button>
          </div>
          <div className="grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1fr_1.4fr_1fr]">
            <label className="block text-[12px] text-[#69758a]"><span className="mb-1.5 block">名字</span><input value={group.name} onChange={(event) => updatePlanGroup(group.id, (item) => ({ ...item, name: event.currentTarget.value }))} className="h-9 w-full rounded-[4px] border border-[#dce3ed] px-3 text-[13px] text-[#27344a] outline-none focus:border-[#278fee]" /></label>
            <label className="block text-[12px] text-[#69758a]"><span className="mb-1.5 block">引导文案</span><input value={group.guideText} onChange={(event) => updatePlanGroup(group.id, (item) => ({ ...item, guideText: event.currentTarget.value }))} className="h-9 w-full rounded-[4px] border border-[#dce3ed] px-3 text-[13px] text-[#27344a] outline-none focus:border-[#278fee]" /></label>
            <label className="block text-[12px] text-[#69758a]"><span className="mb-1.5 block">关联会员等级</span><select value={group.memberLevel} onChange={(event) => updatePlanGroup(group.id, (item) => ({ ...item, memberLevel: event.currentTarget.value }))} className="h-9 w-full rounded-[4px] border border-[#dce3ed] bg-white px-3 text-[13px] text-[#27344a] outline-none focus:border-[#278fee]">{MEMBER_LEVELS.map((level) => <option key={level}>{level}</option>)}</select></label>
          </div>
          <div className="mx-4 mb-4 rounded-[6px] border border-[#edf0f4] bg-[#fbfcfe] p-3">
            <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-1.5 text-[12px] font-medium text-[#53627a]"><ChevronDown className="h-3.5 w-3.5 text-[#8da1ba]" />二级套餐配置</div><button type="button" onClick={() => updatePlanGroup(group.id, (item) => ({ ...item, items: [...item.items, { id: newId('item'), name: '', guideText: '', duration: '' }] }))} className="inline-flex items-center gap-1 rounded-[4px] border border-[#bcdcff] bg-white px-2.5 py-1.5 text-[12px] text-[#278fee] hover:bg-[#eef7ff]"><Plus className="h-3.5 w-3.5" />新增二级套餐</button></div>
            <div className="space-y-2">
              {group.items.map((item, itemIndex) => <div key={item.id} className="grid grid-cols-1 items-end gap-3 rounded-[5px] border border-[#edf0f4] bg-white p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_150px_auto]"><label className="block text-[11px] text-[#8994a6]"><span className="mb-1 block">名称 {itemIndex + 1}</span><input value={item.name} onChange={(event) => updatePlanItem(group.id, item.id, (current) => ({ ...current, name: event.currentTarget.value }))} placeholder="如年度会员" className="h-8 w-full rounded-[4px] border border-[#dce3ed] px-2.5 text-[12px] text-[#27344a] outline-none focus:border-[#278fee]" /></label><label className="block text-[11px] text-[#8994a6]"><span className="mb-1 block">引导文案</span><input value={item.guideText} onChange={(event) => updatePlanItem(group.id, item.id, (current) => ({ ...current, guideText: event.currentTarget.value }))} placeholder="如年度订阅，更优惠" className="h-8 w-full rounded-[4px] border border-[#dce3ed] px-2.5 text-[12px] text-[#27344a] outline-none focus:border-[#278fee]" /></label><label className="block text-[11px] text-[#8994a6]"><span className="mb-1 block">时长</span><input value={item.duration} onChange={(event) => updatePlanItem(group.id, item.id, (current) => ({ ...current, duration: event.currentTarget.value }))} placeholder="如 365天" className="h-8 w-full rounded-[4px] border border-[#dce3ed] px-2.5 text-[12px] text-[#27344a] outline-none focus:border-[#278fee]" /></label><button type="button" onClick={() => updatePlanGroup(group.id, (current) => ({ ...current, items: current.items.filter((child) => child.id !== item.id) }))} className="mb-1 inline-flex h-8 items-center justify-center rounded-[4px] px-2 text-[#a1adbd] hover:bg-[#fff2f1] hover:text-[#e65a5a]" title="删除二级套餐"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
              {group.items.length === 0 ? <div className="py-5 text-center text-[12px] text-[#a5afbd]">暂无二级套餐，请点击右上角新增</div> : null}
            </div>
          </div>
        </section>
      ))}
      <button type="button" onClick={() => updatePlatformConfig((config) => ({ ...config, plans: [...config.plans, { id: newId('group'), name: '', guideText: '', memberLevel: MEMBER_LEVELS[0], items: [] }] }))} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-dashed border-[#b9d8f7] bg-[#f7fbff] px-4 text-[12px] text-[#278fee] hover:bg-[#eef7ff]"><Plus className="h-4 w-4" />新增一级套餐</button>
    </div>
  );

  const renderJsonEditor = (key: JsonModuleKey) => {
    const error = jsonErrors[key];
    return <div className="rounded-[8px] border border-[#e3e8f0] bg-white p-4"><div className="mb-3 flex items-center justify-between"><div><h3 className="text-[14px] font-semibold text-[#27344a]">{activeModuleMeta.label} JSON</h3><p className="mt-1 text-[12px] text-[#9aa5b5]">请使用合法 JSON 配置当前模块，保存前会自动校验格式。</p></div><span className="rounded-full bg-[#f1f5fb] px-2.5 py-1 text-[11px] text-[#7a879a]">{platform === 'web' ? '网页版' : '移动端'}</span></div><textarea value={currentConfig.json[key]} onChange={(event) => updateJson(key, event.currentTarget.value)} spellCheck={false} className={`min-h-[480px] w-full resize-y rounded-[6px] border bg-[#101b2d] px-4 py-4 font-mono text-[12px] leading-6 text-[#dbe7f7] outline-none placeholder:text-[#74839a] ${error ? 'border-[#ff6e6e]' : 'border-[#22334d] focus:border-[#4c9fff]'}`} />{error ? <p className="mt-2 text-[12px] text-[#e04b4b]">{error}</p> : <p className="mt-2 text-[11px] text-[#a5afbd]">支持直接粘贴完整 JSON；当前配置仅保存在本地原型中。</p>}</div>;
  };

  return <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#263247]"><AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员页面配置" onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员套餐管理') onNavigateToMembershipPackages?.(); }} /><TopHeader /><main className="ml-[228px] min-h-screen pt-[62px]"><div className="px-6 py-5"><div className="mb-4 flex items-center gap-2 text-[12px] text-[#98a2b2]"><span>会员中心</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4d5b70]">会员页面配置</span></div><section className="rounded-[4px] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[18px] font-semibold text-[#283244]">会员页面配置</h1><p className="mt-1 text-[12px] text-[#9aa5b5]">配置不同端会员页面的套餐、权益和说明内容。</p></div><div className="rounded-[5px] bg-[#f3f7fc] px-3 py-2 text-[12px] text-[#6e7d93]">当前端：<span className="font-medium text-[#278fee]">{platform === 'web' ? '网页版' : '移动端'}</span></div></div><div className="mt-5 flex border-b border-[#e8edf3]"><button type="button" onClick={() => setPlatform('web')} className={`relative px-5 py-3 text-[13px] ${platform === 'web' ? 'font-semibold text-[#278fee]' : 'text-[#7d899a] hover:text-[#278fee]'}`}>网页版{platform === 'web' ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#278fee]" /> : null}</button><button type="button" onClick={() => setPlatform('mobile')} className={`relative px-5 py-3 text-[13px] ${platform === 'mobile' ? 'font-semibold text-[#278fee]' : 'text-[#7d899a] hover:text-[#278fee]'}`}>移动端{platform === 'mobile' ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#278fee]" /> : null}</button></div></section><section className="mt-4 rounded-[4px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="border-b border-[#e8edf3] px-5 pt-2"><div className="flex flex-wrap gap-1">{MODULES.map((module) => <button type="button" key={module.key} onClick={() => setActiveModule(module.key)} className={`relative rounded-t-[5px] px-4 py-3 text-[13px] transition ${activeModule === module.key ? 'bg-[#eef6ff] font-medium text-[#278fee]' : 'text-[#69768a] hover:bg-[#f7f9fc] hover:text-[#278fee]'}`}>{module.label}{activeModule === module.key ? <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[#278fee]" /> : null}</button>)}</div></div><div className="min-h-[590px] px-5 py-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-[15px] font-semibold text-[#27344a]">{activeModuleMeta.label}</h2><p className="mt-1 text-[12px] text-[#98a2b2]">{activeModuleMeta.description}</p></div><span className="rounded-[4px] border border-[#e2e8f0] px-2.5 py-1 text-[11px] text-[#8a96a8]">{platform === 'web' ? '网页版配置' : '移动端配置'}</span></div>{activeModule === 'plans' ? renderPlanEditor() : renderJsonEditor(activeModule as JsonModuleKey)}</div><div className="flex items-center justify-end gap-3 border-t border-[#edf0f4] px-5 py-4"><span className={`mr-auto text-[12px] ${saved ? 'text-[#2a9a66]' : 'text-[#9ba5b4]'}`}>{saved ? '已保存当前配置' : '修改后请点击保存'}</span><button type="button" onClick={save} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[#278fee] px-5 text-[13px] text-white shadow-[0_4px_10px_rgba(39,143,238,.18)] hover:bg-[#167fdc]"><Save className="h-4 w-4" />保存</button></div></section></div></main></div>;
}
