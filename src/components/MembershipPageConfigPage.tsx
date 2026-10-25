import { useEffect, useState } from 'react';
import { ChevronRight, Plus, Save, X } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { getMembershipPageConfigDefaults, MEMBERSHIP_PAGE_CONFIG_STORAGE_KEY } from './membershipPageConfig';

type PlatformKey = 'web' | 'mobile';
type ModuleKey = 'plans' | 'overview' | 'details' | 'model-consumption' | 'commercial-license' | 'faq';
type JsonModuleKey = ModuleKey;

type PlatformConfig = {
  json: Record<JsonModuleKey, string>;
};

type ConfigState = Record<PlatformKey, PlatformConfig>;

const MODULES: Array<{ key: ModuleKey; label: string; description: string }> = [
  { key: 'plans', label: '套餐显示结构', description: '配置个人、企业、会员等级及套餐时长；价格和积分来自新版套餐数据' },
  { key: 'overview', label: '权益概览', description: '配置个人、企业各会员等级的套餐卡片、权益和卡片文案' },
  { key: 'details', label: '权益明细', description: '配置会员弹框中按会员类型展示的详细权益对比' },
  { key: 'model-consumption', label: '模型消耗', description: '配置会员弹框中的模型消耗、额度和计费说明' },
  { key: 'commercial-license', label: '商用授权', description: '配置会员弹框中的商用授权范围和说明' },
  { key: 'faq', label: '常见问题', description: '配置会员弹框中的常见问题及答案' },
];

const createDefaultConfig = (platform: PlatformKey): PlatformConfig => {
  const defaultConfig = getMembershipPageConfigDefaults(platform);
  return {
    json: {
      plans: JSON.stringify(defaultConfig.plans, null, 2),
      overview: JSON.stringify(defaultConfig.overview, null, 2),
      details: JSON.stringify(defaultConfig.details, null, 2),
      'model-consumption': JSON.stringify(defaultConfig.modelConsumption, null, 2),
      'commercial-license': JSON.stringify(defaultConfig.commercialLicense, null, 2),
      faq: JSON.stringify(defaultConfig.faq, null, 2),
    },
  };
};

const createDefaultState = (): ConfigState => ({ web: createDefaultConfig('web'), mobile: createDefaultConfig('mobile') });
const STORAGE_KEY = MEMBERSHIP_PAGE_CONFIG_STORAGE_KEY;

type MembershipPageVersion = {
  id: string;
  name: string;
  status: '使用中' | '草稿';
  updatedAt: string;
  description: string;
};

const MEMBERSHIP_PAGE_VERSIONS: MembershipPageVersion[] = [
  {
    id: 'membership-page-2026-10',
    name: '2026年10月版本会员页',
    status: '使用中',
    updatedAt: '2026-10-24 10:00:00',
    description: '会员页改版，支持个人使用和企业使用，并配置套餐、权益、模型消耗、商用授权和常见问题。',
  },
];

const VERSION_STORAGE_KEY = 'admin-membership-page-versions';

const readStoredVersions = (): MembershipPageVersion[] => {
  if (typeof window === 'undefined') return MEMBERSHIP_PAGE_VERSIONS;
  try {
    const stored = window.localStorage.getItem(VERSION_STORAGE_KEY);
    if (!stored) return MEMBERSHIP_PAGE_VERSIONS;
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return MEMBERSHIP_PAGE_VERSIONS;
    const versions = parsed.filter((item): item is MembershipPageVersion => Boolean(item && typeof item === 'object' && typeof (item as MembershipPageVersion).id === 'string' && typeof (item as MembershipPageVersion).name === 'string' && ((item as MembershipPageVersion).status === '使用中' || (item as MembershipPageVersion).status === '草稿')));
    return versions.length > 0 ? versions : MEMBERSHIP_PAGE_VERSIONS;
  } catch {
    return MEMBERSHIP_PAGE_VERSIONS;
  }
};

const persistVersions = (versions: MembershipPageVersion[]) => {
  try {
    window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions));
  } catch {
    // Keep the prototype usable when browser storage is unavailable.
  }
};

const migratePlansJson = (value: unknown, fallback: string, syncToPackageData = false) => {
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
      const isEnterprise = tab.key === 'enterprise' || tab.key === 'team' || tab.name === '团队订阅';
      const rawOptions = Array.isArray(tab.options) ? tab.options as Array<Record<string, unknown>> : null;
      const fallbackOptions = Array.isArray(fallbackTab.options) ? fallbackTab.options as Array<Record<string, unknown>> : [];
      const isLegacyOptions = rawOptions != null && (
        (isPersonal && rawOptions.length <= 4 && rawOptions.some((option) => option.key === 'single'))
        || (isEnterprise && rawOptions.length <= 3 && rawOptions.some((option) => option.key === 'team-quarterly'))
      );
      const rawVipLevel = Array.isArray(tab.viplevel)
        ? tab.viplevel
        : Array.isArray(tab.memberLevels) ? tab.memberLevels : null;
      const fallbackVipLevels = Array.isArray(fallbackTab.viplevel) ? fallbackTab.viplevel as Array<Record<string, unknown>> : [];
      const viplevel = rawVipLevel
        ? rawVipLevel.map((item, vipIndex) => {
          const raw = item && typeof item === 'object' ? item as Record<string, unknown> : {};
          const fallbackVipLevel = fallbackVipLevels[vipIndex] ?? {};
          return {
            level: typeof raw.level === 'number' ? raw.level : Number(raw.level ?? fallbackVipLevel.level),
            memberName: typeof raw.memberName === 'string'
              ? raw.memberName
              : typeof raw.memberType === 'string' ? raw.memberType : fallbackVipLevel.memberName,
            displayName: typeof raw.displayName === 'string' && raw.displayName.trim()
              ? raw.displayName
              : fallbackVipLevel.displayName,
          };
        })
        : fallbackVipLevels;
      const options = syncToPackageData
        ? fallbackOptions.map((packageOption) => {
          const configuredOption = rawOptions?.find((option) => option.key === packageOption.key
            || (option.name === packageOption.name && option.duration === packageOption.duration));
          return {
            ...packageOption,
            guideText: typeof configuredOption?.guideText === 'string' ? configuredOption.guideText : packageOption.guideText,
            guideTextColor: typeof configuredOption?.guideTextColor === 'string' && configuredOption.guideTextColor.trim()
              ? configuredOption.guideTextColor
              : packageOption.guideTextColor,
          };
        })
        : isLegacyOptions ? fallbackOptions : rawOptions ?? fallbackOptions;
      return {
        key: isPersonal ? 'personal' : isEnterprise ? 'enterprise' : fallbackTab.key,
        name: isPersonal ? '个人使用' : isEnterprise ? '企业使用' : typeof tab.name === 'string' ? tab.name : fallbackTab.name,
        memberLevel: tab.memberLevel ?? fallbackTab.memberLevel ?? { level: isPersonal || index === 0 ? 'personal' : 'enterprise' },
        viplevel,
        options,
      };
    });
    return JSON.stringify({ ...fallbackConfig, ...parsed, tabs }, null, 2);
  } catch {
    return value;
  }
};

const migrateOverviewJson = (value: unknown, fallback: string, legacyPlansValue?: unknown) => {
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const fallbackConfig = JSON.parse(fallback) as Record<string, unknown>;
    const hasPlanCards = parsed.planCards && typeof parsed.planCards === 'object';
    let planCards = hasPlanCards ? parsed.planCards : fallbackConfig.planCards;

    if (!hasPlanCards && typeof legacyPlansValue === 'string') {
      try {
        const legacyPlans = JSON.parse(legacyPlansValue) as { tabs?: Array<Record<string, unknown>> };
        const findLegacyPlans = (key: string) => legacyPlans.tabs?.find((tab) => tab.key === key)?.plans;
        const personal = findLegacyPlans('personal');
        const enterprise = findLegacyPlans('enterprise');
        if (Array.isArray(personal) || Array.isArray(enterprise)) {
          planCards = {
            personal: Array.isArray(personal) ? personal : (fallbackConfig.planCards as Record<string, unknown>).personal,
            enterprise: Array.isArray(enterprise) ? enterprise : (fallbackConfig.planCards as Record<string, unknown>).enterprise,
          };
        }
      } catch {
        // Keep the default plan cards when the legacy plan config cannot be read.
      }
    }

    return JSON.stringify({
      ...fallbackConfig,
      ...parsed,
      title: typeof parsed.title === 'string' ? parsed.title : fallbackConfig.title,
      subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : fallbackConfig.subtitle,
      items: Array.isArray(parsed.items) ? parsed.items : fallbackConfig.items,
      planCards,
    }, null, 2);
  } catch {
    return value;
  }
};

const migrateModelConsumptionJson = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (Array.isArray(parsed.groups)) return value;
    const fallbackConfig = JSON.parse(fallback) as Record<string, unknown>;
    return JSON.stringify({
      ...fallbackConfig,
      title: typeof parsed.title === 'string' ? parsed.title : fallbackConfig.title,
      description: typeof parsed.description === 'string' ? parsed.description : fallbackConfig.description,
    }, null, 2);
  } catch {
    return value;
  }
};

const migrateDetailsJson = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const hasComparisonConfig = (candidate: unknown) => {
      if (!candidate || typeof candidate !== 'object') return false;
      const config = candidate as Record<string, unknown>;
      return Array.isArray(config.columns) && Array.isArray(config.sections);
    };
    if (hasComparisonConfig(parsed.personal) && hasComparisonConfig(parsed.enterprise)) return value;
    const fallbackConfig = JSON.parse(fallback) as Record<string, unknown>;
    return JSON.stringify({
      ...fallbackConfig,
      title: typeof parsed.title === 'string' ? parsed.title : fallbackConfig.title,
    }, null, 2);
  } catch {
    return value;
  }
};

const migrateCommercialLicenseJson = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (Array.isArray(parsed.scopeSections) && Array.isArray(parsed.testimonials) && Array.isArray(parsed.logos) && parsed.serviceCta) return value;
    const fallbackConfig = JSON.parse(fallback) as Record<string, unknown>;
    return JSON.stringify({
      ...fallbackConfig,
      title: typeof parsed.title === 'string' ? parsed.title : fallbackConfig.title,
      description: typeof parsed.description === 'string' ? parsed.description : fallbackConfig.description,
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : fallbackConfig.enabled,
      scopes: Array.isArray(parsed.scopes) ? parsed.scopes : fallbackConfig.scopes,
    }, null, 2);
  } catch {
    return value;
  }
};

const migrateFaqJson = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (Array.isArray(parsed.items) && parsed.items.length >= 10) return value;
    const fallbackConfig = JSON.parse(fallback) as Record<string, unknown>;
    return JSON.stringify({
      ...fallbackConfig,
      title: typeof parsed.title === 'string' ? parsed.title : fallbackConfig.title,
    }, null, 2);
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
    const mergePlatform = (storedConfig: PlatformConfig | undefined, defaultConfig: PlatformConfig, platform: PlatformKey) => storedConfig
      ? { ...defaultConfig, ...storedConfig, json: { ...defaultConfig.json, ...storedConfig.json, plans: migratePlansJson(storedConfig.json?.plans, defaultConfig.json.plans, platform === 'web'), overview: migrateOverviewJson(storedConfig.json?.overview, defaultConfig.json.overview, storedConfig.json?.plans), details: migrateDetailsJson(storedConfig.json?.details, defaultConfig.json.details), 'model-consumption': migrateModelConsumptionJson(storedConfig.json?.['model-consumption'], defaultConfig.json['model-consumption']), 'commercial-license': migrateCommercialLicenseJson(storedConfig.json?.['commercial-license'], defaultConfig.json['commercial-license']), faq: migrateFaqJson(storedConfig.json?.faq, defaultConfig.json.faq) } }
      : defaultConfig;
    return {
      web: mergePlatform(parsed.web, defaults.web, 'web'),
      mobile: mergePlatform(parsed.mobile, defaults.mobile, 'mobile'),
    };
  } catch {
    return createDefaultState();
  }
};

function MembershipPageVersionList({
  onBackToDirectory,
  onNavigateToSkillConfig,
  onNavigateToGuidedSearch,
  onNavigateToMembershipPackages,
  onNavigateToRequirement,
  onOpenVersion,
  versions,
  onToggleVersionStatus,
  onCreateVersion,
}: {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToRequirement?: (path: string) => void;
  onOpenVersion: (version: MembershipPageVersion) => void;
  versions: MembershipPageVersion[];
  onToggleVersionStatus: (id: string) => void;
  onCreateVersion: (version: MembershipPageVersion) => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionDescription, setVersionDescription] = useState('');

  const submitVersion = () => {
    const name = versionName.trim();
    if (!name) return;
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    onCreateVersion({
      id: `membership-page-${Date.now()}`,
      name,
      status: '草稿',
      updatedAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      description: versionDescription.trim() || '会员页面版本配置。',
    });
    setVersionName('');
    setVersionDescription('');
    setCreateOpen(false);
  };

  return <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#263247]"><AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员页面配置" onNavigateToRequirement={onNavigateToRequirement} onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员套餐管理') onNavigateToMembershipPackages?.(); }} /><TopHeader /><main className="ml-[228px] min-h-screen pt-[62px]"><div className="px-6 py-5"><div className="mb-4 flex items-center gap-2 text-[12px] text-[#98a2b2]"><span>会员中心</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4d5b70]">会员页面配置</span></div><section className="overflow-hidden rounded-[4px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8edf3] px-5 py-5"><div><h1 className="text-[18px] font-semibold text-[#283244]">会员页面配置</h1><p className="mt-1 text-[12px] text-[#98a2b2]">请选择页面版本，进入后配置该版本的会员页面内容。</p></div><div className="flex items-center gap-3"><span className="rounded-[5px] bg-[#f3f7fc] px-3 py-2 text-[12px] text-[#6e7d93]">共 {versions.length} 个版本</span><button type="button" onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[#278fee] px-4 text-[12px] font-medium text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]"><Plus className="h-4 w-4" />新增页面版本</button></div></header><div className="p-5"><div className="mb-3 text-[14px] font-semibold text-[#27344a]">页面版本</div><div className="overflow-hidden rounded-[6px] border border-[#e2e8f0]"><div className="grid grid-cols-[1.4fr_1fr_1.5fr_1.2fr_120px] items-center gap-4 bg-[#fafbfd] px-5 py-3 text-[12px] text-[#7d899a]"><span>版本名称</span><span>状态</span><span>版本说明</span><span>最近更新时间</span><span className="text-right">操作</span></div>{versions.map((version) => <div key={version.id} className="grid grid-cols-[1.4fr_1fr_1.5fr_1.2fr_120px] items-center gap-4 border-t border-[#edf0f4] px-5 py-5 text-[12px] text-[#536176] transition hover:bg-[#fbfdff]"><div><div className="text-[14px] font-medium text-[#27344a]">{version.name}</div><div className="mt-1 text-[11px] text-[#9aa5b5]">版本标识：{version.id}</div></div><button type="button" onClick={() => onToggleVersionStatus(version.id)} className={`flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${version.status === '使用中' ? 'bg-[#eaf7ef] text-[#2b9160]' : 'bg-[#f1f3f6] text-[#7c8797]'}`} aria-label={`切换${version.name}状态`}><span className={`relative h-3.5 w-6 rounded-full transition ${version.status === '使用中' ? 'bg-[#56bb80]' : 'bg-[#b8c0cb]'}`}><span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow-sm transition ${version.status === '使用中' ? 'left-[11px]' : 'left-0.5'}`} /></span>{version.status}</button><span className="leading-5 text-[#7c899b]">{version.description}</span><span className="text-[#7c899b]">{version.updatedAt}</span><div className="text-right"><button type="button" onClick={() => onOpenVersion(version)} className="inline-flex h-8 items-center gap-1 rounded-[4px] bg-[#278fee] px-3.5 text-[12px] font-medium text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]">进入配置<ChevronRight className="h-3.5 w-3.5" /></button></div></div>)}</div></div></section></div></main>{createOpen ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f1d2f]/35 p-5"><div className="w-full max-w-[540px] rounded-[5px] bg-white shadow-[0_16px_50px_rgba(20,35,57,.22)]"><div className="flex h-14 items-center justify-between border-b border-[#edf0f4] px-5"><h2 className="text-[16px] font-medium text-[#252d3b]">新增页面版本</h2><button type="button" onClick={() => setCreateOpen(false)} className="text-[#a0a8b4] hover:text-[#4d5869]" aria-label="关闭"><X className="h-5 w-5" /></button></div><div className="space-y-5 px-5 py-5"><label className="block text-[12px] text-[#657084]"><span className="mb-2 block"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>版本名称</span><input autoFocus value={versionName} onChange={(event) => setVersionName(event.currentTarget.value)} placeholder="请输入页面版本名称" className="h-9 w-full rounded-[3px] border border-[#dfe3ea] px-3 text-[12px] text-[#303b4d] outline-none focus:border-[#278fee] placeholder:text-[#c8c8c8]" /></label><label className="block text-[12px] text-[#657084]"><span className="mb-2 block">版本说明</span><textarea value={versionDescription} onChange={(event) => setVersionDescription(event.currentTarget.value)} placeholder="请输入版本说明" className="min-h-[90px] w-full resize-none rounded-[3px] border border-[#dfe3ea] px-3 py-2 text-[12px] leading-5 text-[#303b4d] outline-none focus:border-[#278fee] placeholder:text-[#c8c8c8]" /></label></div><div className="flex justify-end gap-3 border-t border-[#edf0f4] px-5 py-4"><button type="button" onClick={() => setCreateOpen(false)} className="h-9 rounded-[3px] border border-[#dfe3ea] px-5 text-[12px] text-[#667285]">取消</button><button type="button" onClick={submitVersion} disabled={!versionName.trim()} className="h-9 rounded-[3px] bg-[#278fee] px-5 text-[12px] text-white transition hover:bg-[#167fdc] disabled:cursor-not-allowed disabled:opacity-50">生成</button></div></div></div> : null}</div>;
}

export function MembershipPageConfigPage(props: {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToRequirement?: (path: string) => void;
}) {
  const [selectedVersion, setSelectedVersion] = useState<MembershipPageVersion | null>(null);
  const [versions, setVersions] = useState<MembershipPageVersion[]>(readStoredVersions);

  const updateVersions = (updater: (current: MembershipPageVersion[]) => MembershipPageVersion[]) => {
    setVersions((current) => {
      const next = updater(current);
      persistVersions(next);
      return next;
    });
  };

  if (!selectedVersion) return <MembershipPageVersionList {...props} versions={versions} onOpenVersion={setSelectedVersion} onCreateVersion={(version) => updateVersions((current) => [...current, version])} onToggleVersionStatus={(id) => updateVersions((current) => current.map((version) => version.id === id ? { ...version, status: version.status === '使用中' ? '草稿' : '使用中' } : version))} />;

  return <MembershipPageConfigEditor {...props} version={selectedVersion} onBackToVersions={() => setSelectedVersion(null)} />;
}

function MembershipPageConfigEditor({
  onBackToDirectory,
  onNavigateToSkillConfig,
  onNavigateToGuidedSearch,
  onNavigateToMembershipPackages,
  onNavigateToRequirement,
  version,
  onBackToVersions,
}: {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToRequirement?: (path: string) => void;
  version: MembershipPageVersion;
  onBackToVersions: () => void;
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

  return <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#263247]"><AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员页面配置" onNavigateToRequirement={onNavigateToRequirement} onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员套餐管理') onNavigateToMembershipPackages?.(); }} /><TopHeader /><main className="ml-[228px] min-h-screen pt-[62px]"><div className="px-6 py-5"><div className="mb-4 flex items-center gap-2 text-[12px] text-[#98a2b2]"><span>会员中心</span><ChevronRight className="h-3.5 w-3.5" /><button type="button" onClick={onBackToVersions} className="text-[#4d5b70] hover:text-[#278fee]">会员页面配置</button><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4d5b70]">{version.name}</span></div><section className="rounded-[4px] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[18px] font-semibold text-[#283244]">{version.name}</h1><p className="mt-1 text-[12px] text-[#9aa5b5]">配置不同端会员页面的套餐、权益和说明内容。</p></div><div className="flex items-center gap-3"><span className="rounded-[5px] bg-[#eaf7ef] px-3 py-2 text-[12px] font-medium text-[#2b9160]">{version.status}</span><div className="rounded-[5px] bg-[#f3f7fc] px-3 py-2 text-[12px] text-[#6e7d93]">当前端：<span className="font-medium text-[#278fee]">{platform === 'web' ? '网页版' : '移动端'}</span></div></div></div><div className="mt-5 flex border-b border-[#e8edf3]"><button type="button" onClick={() => setPlatform('web')} className={`relative px-5 py-3 text-[13px] ${platform === 'web' ? 'font-semibold text-[#278fee]' : 'text-[#7d899a] hover:text-[#278fee]'}`}>网页版{platform === 'web' ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#278fee]" /> : null}</button><button type="button" onClick={() => setPlatform('mobile')} className={`relative px-5 py-3 text-[13px] ${platform === 'mobile' ? 'font-semibold text-[#278fee]' : 'text-[#7d899a] hover:text-[#278fee]'}`}>移动端{platform === 'mobile' ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#278fee]" /> : null}</button></div></section><section className="mt-4 rounded-[4px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="border-b border-[#e8edf3] px-5 pt-2"><div className="flex flex-wrap gap-1">{MODULES.map((module) => <button type="button" key={module.key} onClick={() => setActiveModule(module.key)} className={`relative rounded-t-[5px] px-4 py-3 text-[13px] transition ${activeModule === module.key ? 'bg-[#eef6ff] font-medium text-[#278fee]' : 'text-[#69768a] hover:bg-[#f7f9fc] hover:text-[#278fee]'}`}>{module.label}{activeModule === module.key ? <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[#278fee]" /> : null}</button>)}</div></div><div className="min-h-[590px] px-5 py-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-[15px] font-semibold text-[#27344a]">{activeModuleMeta.label}</h2><p className="mt-1 text-[12px] text-[#98a2b2]">{activeModuleMeta.description}</p></div><span className="rounded-[4px] border border-[#e2e8f0] px-2.5 py-1 text-[11px] text-[#8a96a8]">{platform === 'web' ? '网页版配置' : '移动端配置'}</span></div>{renderJsonEditor(activeModule)}</div><div className="flex items-center justify-end gap-3 border-t border-[#edf0f4] px-5 py-4"><span className={`mr-auto text-[12px] ${saved ? 'text-[#2a9a66]' : 'text-[#9ba5b4]'}`}>{saved ? '已保存当前配置' : '修改后请点击保存'}</span><button type="button" onClick={save} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[#278fee] px-5 text-[13px] text-white shadow-[0_4px_10px_rgba(39,143,238,.18)] hover:bg-[#167fdc]"><Save className="h-4 w-4" />保存</button></div></section></div></main></div>;
}
