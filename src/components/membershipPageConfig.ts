export type PlatformKey = 'web' | 'mobile';

export type MembershipCycleConfig = {
  key: string;
  name: string;
  guideText: string;
  duration: string;
  highlighted?: boolean;
};

export type MembershipPlanDisplayConfig = {
  planKey: string;
  name: string;
  subtitle: string;
  color: 'neutral' | 'blue' | 'orange';
  tag?: string;
  features: string[];
  benefitSections?: MembershipBenefitSection[];
};

export type MembershipBenefitItem = {
  label: string;
  enabled?: boolean;
  badge?: string;
  detail?: string;
};

export type MembershipBenefitSection = {
  title: string;
  badge?: string;
  actionLabel?: string;
  items: MembershipBenefitItem[];
  highlight?: {
    title: string;
    items: Array<{ label: string; badge?: string }>;
    tone: 'blue' | 'orange';
  };
};

export type MembershipTabConfig = {
  key: 'personal' | 'enterprise';
  name: string;
  memberLevel: { level: string };
  options: MembershipCycleConfig[];
  plans: MembershipPlanDisplayConfig[];
};

export type MembershipPlansConfig = {
  tabs: MembershipTabConfig[];
};

export type MembershipOverviewConfig = {
  title: string;
  subtitle: string;
  items: Array<{ title: string; description: string }>;
};

export type MembershipDetailsConfig = {
  title: string;
  sections: Array<{ title: string; items: string[] }>;
};

export type MembershipModelConsumptionConfig = {
  title: string;
  description: string;
  models: Array<{ name: string; unit: string; quota: string | number }>;
};

export type MembershipCommercialLicenseConfig = {
  title: string;
  description: string;
  enabled: boolean;
  scopes: string[];
};

export type MembershipFaqConfig = {
  title: string;
  items: Array<{ question: string; answer: string }>;
};

export type MembershipPageContent = {
  plans: MembershipPlansConfig;
  overview: MembershipOverviewConfig;
  details: MembershipDetailsConfig;
  modelConsumption: MembershipModelConsumptionConfig;
  commercialLicense: MembershipCommercialLicenseConfig;
  faq: MembershipFaqConfig;
};

export const MEMBERSHIP_PAGE_CONFIG_STORAGE_KEY = 'admin-membership-page-config';

const benefitItem = (label: string, enabled = true, badge?: string, detail?: string): MembershipBenefitItem => ({
  label,
  enabled,
  badge,
  detail,
});

const modelHighlight = (tone: 'blue' | 'orange'): NonNullable<MembershipBenefitSection['highlight']> => ({
  title: '🎉 备战双11·专属福利',
  tone,
  items: [
    { label: 'Seedance 2.5', badge: '最高限时 6 折' },
    { label: 'Seedance 2.0 Fast', badge: '最高限时 6 折' },
    { label: '万相 3.0', badge: '最高限时 6 折' },
    { label: '灵动图像 2.5 Fast（2K·中质量）', badge: '最高限免5次 / 每日' },
    { label: '全能图像 2.1（2K）', badge: '最高限免5次 / 每日' },
  ],
});

const personalBasicBenefits: MembershipBenefitSection[] = [
  {
    title: '模板创作权益',
    items: [
      benefitItem('个人商用授权'),
      benefitItem('模板作品高清无水印下载'),
      benefitItem('模板作品 PSD 导出', false),
      benefitItem('海量海报、PPT、视频、H5 等 VIP 模板', true, '持续更新'),
      benefitItem('高级工具功能：尺寸延展、PSD 转模板等'),
      benefitItem('随时随地在线编辑'),
    ],
  },
  {
    title: 'AI 创作权益',
    items: [
      benefitItem('50 豆/月'),
      benefitItem('访问所有 AI 模型'),
      benefitItem('加购豆享折扣', false),
      benefitItem('AI 作品高清下载（可设置多倍数尺寸）', false),
      benefitItem('模型限时优惠', false),
    ],
  },
  {
    title: '精选素材组合包',
    items: [
      benefitItem('无官方自营素材下载次数', false),
      benefitItem('无第三方合作素材下载次数', false),
    ],
  },
  {
    title: '通用权益',
    items: [benefitItem('50 GB 存储空间')],
  },
];

const personalAdvancedBenefits: MembershipBenefitSection[] = [
  {
    title: '模板创作权益',
    items: [
      benefitItem('无个人商用授权', false),
      benefitItem('无高清无水印下载权限', false),
      benefitItem('模板作品 PSD 导出', false),
      benefitItem('海量海报、PPT、视频、H5 等 VIP 模板', false, '持续更新'),
      benefitItem('高级工具功能：尺寸延展、PSD 转模板等', false),
      benefitItem('随时随地在线编辑'),
    ],
  },
  {
    title: 'AI 创作权益',
    items: [
      benefitItem('300~5000 豆/席位/月'),
      benefitItem('访问所有 AI 模型'),
      benefitItem('加购豆享折扣'),
      benefitItem('AI 作品高清下载（可设置多倍数尺寸）'),
      benefitItem('团队共享豆'),
      benefitItem('模型限时优惠'),
    ],
  },
  {
    title: '精选素材组合包',
    items: [
      benefitItem('无官方自营素材下载次数', false),
      benefitItem('无第三方合作素材下载次数', false),
    ],
  },
  {
    title: '通用权益',
    items: [benefitItem('存储空间 500 GB'), benefitItem('团队内容共享与复用')],
    highlight: modelHighlight('blue'),
  },
];

const personalProfessionalBenefits: MembershipBenefitSection[] = [
  {
    title: '模板创作权益',
    items: [
      benefitItem('个人商用授权'),
      benefitItem('模板作品高清无水印下载'),
      benefitItem('模板作品 PSD 导出 10次/月', true, '限时加赠'),
      benefitItem('海量海报、PPT、视频、H5 等 VIP 模板', true, '持续更新'),
      benefitItem('高级工具功能：尺寸延展、PSD 转模板等'),
      benefitItem('随时随地在线编辑'),
    ],
  },
  {
    title: 'AI 创作权益',
    items: [
      benefitItem('300~5000 豆/月'),
      benefitItem('访问所有 AI 模型'),
      benefitItem('加购豆享折扣'),
      benefitItem('AI 作品高清下载（可设置多倍数尺寸）'),
      benefitItem('团队共享豆'),
      benefitItem('模型限时优惠'),
    ],
  },
  {
    title: '精选素材组合包',
    badge: '限时赠送',
    actionLabel: '单独购买  ›',
    items: [
      benefitItem('限时加送官方自营素材下载', true, undefined, '每月 100 次，共赠送 3 个月'),
      benefitItem('限时加送第三方合作下载次数', true, undefined, '每月 20 次，共赠送 3 个月'),
    ],
  },
  {
    title: '通用权益',
    items: [benefitItem('存储空间 500 GB'), benefitItem('团队资产共享与复用')],
    highlight: modelHighlight('orange'),
  },
];

const personalPlans: MembershipPlanDisplayConfig[] = [
  {
    planKey: 'basic',
    name: '基础版',
    subtitle: '适合初次探索 AI 创作',
    color: 'neutral',
    features: ['Seedance 2.0 VIP', '标准生成通道', '生成作品去除品牌水印'],
    benefitSections: personalBasicBenefits,
  },
  {
    planKey: 'advanced',
    name: '高级版',
    subtitle: '适合高频创作与持续产出',
    color: 'neutral',
    features: ['Seedance 2.0 VIP', '标准生成通道', '生成作品去除品牌水印'],
    benefitSections: personalAdvancedBenefits,
  },
  {
    planKey: 'professional',
    name: '专业版',
    subtitle: '适合大批量稳定产出与交付',
    color: 'blue',
    tag: '限时5折',
    features: ['Seedance 2.0 VIP', '图片 4.0', '快速生成通道', '生成作品去除品牌水印'],
    benefitSections: personalProfessionalBenefits,
  },
];

const enterpriseCommonBenefits: MembershipBenefitSection[] = [
  {
    title: '模板创作权益',
    items: [
      benefitItem('中小企业或大型企业商用授权'),
      benefitItem('支持线上线下授权'),
      benefitItem('支持海外/全球范围授权', true, '可选购'),
      benefitItem('支持敏感行业定制', true, '可选购'),
      benefitItem('支持更多扩展用途定制'),
    ],
  },
  {
    title: 'AI 创作权益',
    items: [
      benefitItem('300~5000 豆/席位/月'),
      benefitItem('访问所有 AI 模型'),
      benefitItem('加购豆享折扣'),
      benefitItem('AI 作品高清下载（可设置多倍数尺寸）'),
      benefitItem('团队共享豆'),
      benefitItem('模型限时优惠'),
    ],
  },
  {
    title: '精选素材组合包',
    items: [benefitItem('官方自营素材下载'), benefitItem('第三方合作素材下载')],
  },
  {
    title: '通用权益',
    items: [
      benefitItem('存储空间 10 TB/团队'),
      benefitItem('无限团队空间数量'),
      benefitItem('无限企业资源库数量'),
      benefitItem('内容审批管理，保障合规安全'),
      benefitItem('人员离职无缝交接，内容资产完整保留'),
      benefitItem('自定义企业品牌界面/导航栏/内容推送等'),
      benefitItem('支持私有化部署与内容定制'),
      benefitItem('支持企业微信、自有系统、NAS 接入'),
    ],
  },
];

const enterpriseFlagshipBenefits: MembershipBenefitSection[] = [
  {
    title: '商用授权主体及范围',
    items: [
      benefitItem('中小企业或大型企业商用授权'),
      benefitItem('支持线上线下授权'),
      benefitItem('支持海外/全球范围授权', true, '可选购'),
      benefitItem('支持敏感行业定制', true, '可选购'),
      benefitItem('支持更多扩展用途定制'),
    ],
  },
  {
    title: '企业版专属权益',
    items: [
      benefitItem('存储空间 10 TB/团队'),
      benefitItem('无限团队空间数量'),
      benefitItem('无限企业资源库数量'),
      benefitItem('内容审批管理，保障合规安全'),
      benefitItem('人员离职无缝交接，内容资产完整保留'),
      benefitItem('自定义企业品牌界面/导航栏/内容推送等'),
      benefitItem('支持私有化部署与内容定制'),
      benefitItem('支持企业微信、自有系统、NAS 接入'),
    ],
  },
  {
    title: '模板创作权益',
    items: [
      benefitItem('拥有「团队版」所有权益'),
      benefitItem('模板作品 PSD 导出 30~80次/团队/月', true, '限时加赠'),
      benefitItem('敏感词检测，营销更安全'),
      benefitItem('提供专业培训与定期数据报告'),
    ],
  },
  {
    title: '素材下载权益',
    items: [
      benefitItem('海量版权图片、免版权素材、PSD 源文件可下载，自由创作'),
      benefitItem('官方/第三方合作素材下载次数：按需定制'),
    ],
  },
  {
    title: 'AI 创作权益',
    items: [benefitItem('拥有 AI 创作会员（团队版）所有权益'), benefitItem('豆额度灵活定制')],
  },
];

const enterprisePlans: MembershipPlanDisplayConfig[] = [
  ...personalPlans.map((plan) => ({
    ...plan,
    benefitSections: plan.planKey === 'flagship' ? enterpriseFlagshipBenefits : enterpriseCommonBenefits,
  })),
  {
    planKey: 'flagship',
    name: '旗舰版',
    subtitle: '为极限产出而生',
    color: 'orange',
    tag: '加赠2个月会员',
    features: ['Seedance 2.0 VIP', '图片 4.0', '快速生成通道', '生成作品去除品牌水印', 'API 服务购买'],
    benefitSections: enterpriseFlagshipBenefits,
  },
];

export const DEFAULT_MEMBERSHIP_PAGE_CONFIG: MembershipPageContent = {
  plans: {
    tabs: [
      {
        key: 'personal',
        name: '个人使用',
        memberLevel: { level: 'personal' },
        options: [
          { key: 'yearly', name: '连续包年', guideText: '限时4.5折', duration: '365天', highlighted: true },
          { key: 'monthly', name: '连续包月', guideText: '4.8折', duration: '30天' },
          { key: 'quarterly', name: '连续包季', guideText: '限时4.3折', duration: '90天' },
          { key: 'single', name: '单月购买', guideText: '', duration: '30天' },
        ],
        plans: personalPlans,
      },
      {
        key: 'enterprise',
        name: '企业使用',
        memberLevel: { level: 'enterprise' },
        options: [
          { key: 'team-yearly', name: '团队包年', guideText: '多人协作更优惠', duration: '365天', highlighted: true },
          { key: 'team-monthly', name: '团队包月', guideText: '灵活开通', duration: '30天' },
        ],
        plans: enterprisePlans,
      },
    ],
  },
  overview: {
    title: '哪个计划更适合你',
    subtitle: '根据你的创作频率和团队规模，选择合适的会员权益',
    items: [
      { title: '个人创作', description: '适合日常设计、AI 图片和视频创作。' },
      { title: '高频产出', description: '适合营销活动、商品内容和持续交付。' },
      { title: '企业协作', description: '适合团队成员共享权益和统一管理。' },
    ],
  },
  details: {
    title: '权益明细',
    sections: [
      { title: '模板权益', items: ['全量模板', '高级模板', '商用模板'] },
      { title: '创作权益', items: ['高清导出', '去除水印', '团队协作'] },
    ],
  },
  modelConsumption: {
    title: 'AI 模型消耗',
    description: '不同会员等级对应不同的 AI 生成额度',
    models: [{ name: 'AI 图片生成', unit: '次', quota: 100 }],
  },
  commercialLicense: {
    title: '商用授权',
    description: '会员生成内容可用于商业场景',
    enabled: true,
    scopes: ['商品宣传', '营销推广', '社交媒体'],
  },
  faq: {
    title: '常见问题',
    items: [
      { question: '会员权益什么时候生效？', answer: '购买成功后立即生效。' },
      { question: '会员到期后还能使用已生成内容吗？', answer: '已生成内容不受影响。' },
    ],
  },
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const parseJson = <T,>(value: unknown, fallback: T): T => {
  if (typeof value !== 'string') return clone(fallback);
  try {
    return JSON.parse(value) as T;
  } catch {
    return clone(fallback);
  }
};

const normalizePlans = (value: unknown): MembershipPlansConfig => {
  const fallback = DEFAULT_MEMBERSHIP_PAGE_CONFIG.plans;
  const rawTabs = (value as { tabs?: unknown } | null)?.tabs;
  if (!Array.isArray(rawTabs)) return clone(fallback);

  return {
    tabs: fallback.tabs.map((fallbackTab) => {
      const rawTab = rawTabs.find((item) => (item as { key?: string })?.key === fallbackTab.key) as Partial<MembershipTabConfig> | undefined;
      if (!rawTab) return clone(fallbackTab);
      const rawPlans = Array.isArray(rawTab.plans) ? rawTab.plans : fallbackTab.plans;
      return {
        ...fallbackTab,
        ...rawTab,
        memberLevel: { ...fallbackTab.memberLevel, ...(rawTab.memberLevel ?? {}) },
        options: Array.isArray(rawTab.options) ? rawTab.options : fallbackTab.options,
        plans: rawPlans.map((plan, index) => {
          const fallbackPlan = fallbackTab.plans[index] ?? fallbackTab.plans[0];
          const rawPlan = plan as Partial<MembershipPlanDisplayConfig>;
          return {
            ...fallbackPlan,
            planKey: rawPlan.planKey ?? fallbackPlan.planKey,
            name: rawPlan.name ?? fallbackPlan.name,
            subtitle: rawPlan.subtitle ?? fallbackPlan.subtitle,
            color: rawPlan.color ?? fallbackPlan.color,
            tag: rawPlan.tag ?? fallbackPlan.tag,
            features: Array.isArray(rawPlan.features) ? rawPlan.features : fallbackPlan.features,
            benefitSections: Array.isArray(rawPlan.benefitSections) ? rawPlan.benefitSections : fallbackPlan.benefitSections,
          };
        }),
      };
    }),
  };
};

export function readMembershipPageConfig(platform: PlatformKey = 'web'): MembershipPageContent {
  const fallback = clone(DEFAULT_MEMBERSHIP_PAGE_CONFIG);
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = JSON.parse(window.localStorage.getItem(MEMBERSHIP_PAGE_CONFIG_STORAGE_KEY) ?? '{}') as { [key in PlatformKey]?: { json?: Record<string, unknown> } };
    const json = stored[platform]?.json ?? {};
    return {
      plans: normalizePlans(parseJson(json.plans, fallback.plans)),
      overview: parseJson(json.overview, fallback.overview),
      details: parseJson(json.details, fallback.details),
      modelConsumption: parseJson(json['model-consumption'], fallback.modelConsumption),
      commercialLicense: parseJson(json['commercial-license'], fallback.commercialLicense),
      faq: parseJson(json.faq, fallback.faq),
    };
  } catch {
    return fallback;
  }
}
