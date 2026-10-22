import { useEffect, useState } from 'react';
import { ChevronRight, Save } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { DEFAULT_MEMBERSHIP_PAGE_CONFIG, MEMBERSHIP_PAGE_CONFIG_STORAGE_KEY } from './membershipPageConfig';

type PlatformKey = 'web' | 'mobile';
type ModuleKey = 'plans' | 'overview' | 'details' | 'model-consumption' | 'commercial-license' | 'faq';
type JsonModuleKey = ModuleKey;

type PlatformConfig = {
  json: Record<JsonModuleKey, string>;
};

type ConfigState = Record<PlatformKey, PlatformConfig>;

const MODULES: Array<{ key: ModuleKey; label: string; description: string }> = [
  { key: 'plans', label: '套餐', description: '配置套餐展示顺序、会员等级、周期和页面文案；价格与积分沿用真实套餐数据' },
  { key: 'overview', label: '权益概览', description: '配置会员页上方的权益概览卡片' },
  { key: 'details', label: '权益明细', description: '配置权益明细及权益说明' },
  { key: 'model-consumption', label: '模型消耗', description: '配置模型消耗、额度和计费说明' },
  { key: 'commercial-license', label: '商用授权', description: '配置商用授权范围和说明' },
  { key: 'faq', label: '常见问题', description: '配置会员页常见问题及答案' },
];

const createDefaultConfig = (): PlatformConfig => ({
  json: {
    plans: JSON.stringify(DEFAULT_MEMBERSHIP_PAGE_CONFIG.plans, null, 2),
    overview: JSON.stringify(DEFAULT_MEMBERSHIP_PAGE_CONFIG.overview, null, 2),
    details: JSON.stringify(DEFAULT_MEMBERSHIP_PAGE_CONFIG.details, null, 2),
    'model-consumption': JSON.stringify(DEFAULT_MEMBERSHIP_PAGE_CONFIG.modelConsumption, null, 2),
    'commercial-license': JSON.stringify(DEFAULT_MEMBERSHIP_PAGE_CONFIG.commercialLicense, null, 2),
    faq: JSON.stringify(DEFAULT_MEMBERSHIP_PAGE_CONFIG.faq, null, 2),
  },
});

const createDefaultState = (): ConfigState => ({ web: createDefaultConfig(), mobile: createDefaultConfig() });
const STORAGE_KEY = MEMBERSHIP_PAGE_CONFIG_STORAGE_KEY;

const migratePlansJson = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value) as { tabs?: Array<Record<string, unknown>> };
    const fallbackConfig = JSON.parse(fallback) as { tabs: Array<Record<string, unknown>> };
    if (!Array.isArray(parsed.tabs)) return value;
    const tabs = fallbackConfig.tabs.map((fallbackTab, index) => {
      const tab = parsed.tabs?.find((item) => item.key === fallbackTab.key)
        ?? parsed.tabs?.[index]
        ?? {};
      const isPersonal = tab.key === 'personal' || tab.name === '个人订阅';
      const isEnterprise = tab.key === 'team' || tab.name === '团队订阅';
      return {
        ...fallbackTab,
        ...tab,
        ...(isPersonal ? { key: 'personal', name: '个人使用' } : {}),
        ...(isEnterprise ? { key: 'enterprise', name: '企业使用' } : {}),
        memberLevel: tab.memberLevel ?? fallbackTab.memberLevel ?? { level: isPersonal || index === 0 ? 'personal' : 'enterprise' },
        options: Array.isArray(tab.options) ? tab.options : fallbackTab.options,
        plans: (Array.isArray(tab.plans) ? tab.plans : fallbackTab.plans).map((plan, planIndex) => {
          const fallbackPlan = (fallbackTab.plans as Array<Record<string, unknown>>)[planIndex] ?? (fallbackTab.plans as Array<Record<string, unknown>>)[0] ?? {};
          const rawPlan = plan as Record<string, unknown>;
          return {
            ...fallbackPlan,
            planKey: rawPlan.planKey ?? fallbackPlan.planKey,
            name: rawPlan.name ?? fallbackPlan.name,
            subtitle: rawPlan.subtitle ?? fallbackPlan.subtitle,
            color: rawPlan.color ?? fallbackPlan.color,
            tag: rawPlan.tag ?? fallbackPlan.tag,
            features: Array.isArray(rawPlan.features) ? rawPlan.features : fallbackPlan.features,
          };
        }),
      };
    });
    return JSON.stringify({ ...parsed, tabs }, null, 2);
  } catch {
    return value;
  }
};

const readStoredState = (): ConfigState => {
  if (typeof window === 'undefined') return createDefaultState();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultState();
    const parsed = JSON.parse(stored) as Partial<ConfigState>;
    const defaults = createDefaultState();
    const mergePlatform = (storedConfig: PlatformConfig | undefined, defaultConfig: PlatformConfig) => storedConfig
      ? { ...defaultConfig, ...storedConfig, json: { ...defaultConfig.json, ...storedConfig.json, plans: migratePlansJson(storedConfig.json?.plans, defaultConfig.json.plans) } }
      : defaultConfig;
    return {
      web: mergePlatform(parsed.web, defaults.web),
      mobile: mergePlatform(parsed.mobile, defaults.mobile),
    };
  } catch {
    return createDefaultState();
  }
};

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

  const updateJson = (key: ModuleKey, value: string) => {
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
      window.dispatchEvent(new Event('membership-page-config-updated'));
    } catch {
      // Keep the prototype usable when browser storage is unavailable.
    }
    setJsonErrors({});
    setSaved(true);
  };

  const renderJsonEditor = (key: ModuleKey) => {
    const error = jsonErrors[key];
    return <div className="rounded-[8px] border border-[#e3e8f0] bg-white p-4"><div className="mb-3 flex items-center justify-between"><div><h3 className="text-[14px] font-semibold text-[#27344a]">{activeModuleMeta.label} JSON</h3><p className="mt-1 text-[12px] text-[#9aa5b5]">请使用合法 JSON 配置当前模块，保存前会自动校验格式。</p>{key === 'plans' ? <p className="mt-1 text-[11px] text-[#c1842d]">价格、原价、积分、积分档位和折扣不由此处维护，会员页会沿用真实套餐数据。</p> : null}</div><span className="rounded-full bg-[#f1f5fb] px-2.5 py-1 text-[11px] text-[#7a879a]">{platform === 'web' ? '网页版' : '移动端'}</span></div><textarea value={currentConfig.json[key]} onChange={(event) => updateJson(key, event.currentTarget.value)} spellCheck={false} className={`min-h-[480px] w-full resize-y rounded-[6px] border bg-[#101b2d] px-4 py-4 font-mono text-[12px] leading-6 text-[#dbe7f7] outline-none placeholder:text-[#74839a] ${error ? 'border-[#ff6e6e]' : 'border-[#22334d] focus:border-[#4c9fff]'}`} />{error ? <p className="mt-2 text-[12px] text-[#e04b4b]">{error}</p> : <p className="mt-2 text-[11px] text-[#a5afbd]">支持直接粘贴完整 JSON；当前配置仅保存在本地原型中。</p>}</div>;
  };

  return <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#263247]"><AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员页面配置" onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员套餐管理') onNavigateToMembershipPackages?.(); }} /><TopHeader /><main className="ml-[228px] min-h-screen pt-[62px]"><div className="px-6 py-5"><div className="mb-4 flex items-center gap-2 text-[12px] text-[#98a2b2]"><span>会员中心</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4d5b70]">会员页面配置</span></div><section className="rounded-[4px] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[18px] font-semibold text-[#283244]">会员页面配置</h1><p className="mt-1 text-[12px] text-[#9aa5b5]">配置不同端会员页面的套餐、权益和说明内容。</p></div><div className="rounded-[5px] bg-[#f3f7fc] px-3 py-2 text-[12px] text-[#6e7d93]">当前端：<span className="font-medium text-[#278fee]">{platform === 'web' ? '网页版' : '移动端'}</span></div></div><div className="mt-5 flex border-b border-[#e8edf3]"><button type="button" onClick={() => setPlatform('web')} className={`relative px-5 py-3 text-[13px] ${platform === 'web' ? 'font-semibold text-[#278fee]' : 'text-[#7d899a] hover:text-[#278fee]'}`}>网页版{platform === 'web' ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#278fee]" /> : null}</button><button type="button" onClick={() => setPlatform('mobile')} className={`relative px-5 py-3 text-[13px] ${platform === 'mobile' ? 'font-semibold text-[#278fee]' : 'text-[#7d899a] hover:text-[#278fee]'}`}>移动端{platform === 'mobile' ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#278fee]" /> : null}</button></div></section><section className="mt-4 rounded-[4px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="border-b border-[#e8edf3] px-5 pt-2"><div className="flex flex-wrap gap-1">{MODULES.map((module) => <button type="button" key={module.key} onClick={() => setActiveModule(module.key)} className={`relative rounded-t-[5px] px-4 py-3 text-[13px] transition ${activeModule === module.key ? 'bg-[#eef6ff] font-medium text-[#278fee]' : 'text-[#69768a] hover:bg-[#f7f9fc] hover:text-[#278fee]'}`}>{module.label}{activeModule === module.key ? <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[#278fee]" /> : null}</button>)}</div></div><div className="min-h-[590px] px-5 py-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-[15px] font-semibold text-[#27344a]">{activeModuleMeta.label}</h2><p className="mt-1 text-[12px] text-[#98a2b2]">{activeModuleMeta.description}</p></div><span className="rounded-[4px] border border-[#e2e8f0] px-2.5 py-1 text-[11px] text-[#8a96a8]">{platform === 'web' ? '网页版配置' : '移动端配置'}</span></div>{renderJsonEditor(activeModule)}</div><div className="flex items-center justify-end gap-3 border-t border-[#edf0f4] px-5 py-4"><span className={`mr-auto text-[12px] ${saved ? 'text-[#2a9a66]' : 'text-[#9ba5b4]'}`}>{saved ? '已保存当前配置' : '修改后请点击保存'}</span><button type="button" onClick={save} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[#278fee] px-5 text-[13px] text-white shadow-[0_4px_10px_rgba(39,143,238,.18)] hover:bg-[#167fdc]"><Save className="h-4 w-4" />保存</button></div></section></div></main></div>;
}
