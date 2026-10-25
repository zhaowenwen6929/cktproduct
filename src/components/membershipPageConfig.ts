import { getWebMembershipCycleOptions } from './MembershipPackagePage';

export type PlatformKey = 'web' | 'mobile';

export type MembershipCycleConfig = {
  key: string;
  name: string;
  guideText: string;
  guideTextColor?: string;
  duration: string;
  highlighted?: boolean;
};

export type MembershipPlanDisplayConfig = {
  planKey: string;
  /** 对应会员套餐管理 Web端-新版中的所属会员名称。 */
  memberType?: string;
  /** 对应会员套餐管理中的会员等级数字，运行时按此字段关联套餐数据。 */
  memberLevel: number;
  name: string;
  subtitle: string;
  color: 'neutral' | 'blue' | 'orange';
  tag?: string;
  features: string[];
  benefitSections?: MembershipBenefitSection[];
};

export type MembershipMemberLevelBadgeConfig = {
  enabled: boolean;
  text: string;
  backgroundColor: string;
  textColor: string;
};

export type MembershipMemberLevelDisplayConfig = {
  level: number;
  memberName: string;
  banner: MembershipMemberLevelBadgeConfig;
  tag: MembershipMemberLevelBadgeConfig;
};

const LIFETIME_MEMBER_DAYS = 99 * 365;

export function getDefaultMembershipPlanMemberType(tabKey: 'personal' | 'enterprise', planKey: string) {
  const memberTypes = tabKey === 'personal'
    ? { basic: '基础版（个人）', advanced: '专业版（个人）', professional: '专业版（个人）' }
    : { basic: '基础版（企业）', advanced: '专业版（企业）', professional: '专业版（企业）', flagship: '旗舰版（企业）' };
  return memberTypes[planKey as keyof typeof memberTypes];
}

export function getDefaultMembershipPlanMemberLevel(tabKey: 'personal' | 'enterprise', planKey: string) {
  const memberLevels = tabKey === 'personal'
    ? { basic: 240, professional: 241 }
    : { basic: 310, professional: 311, flagship: 220 };
  return memberLevels[planKey as keyof typeof memberLevels];
}

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

export type MembershipVipLevelConfig = {
  /** 管理后台 Web 新版套餐对应的真实会员等级数字。 */
  level: number;
  /** 管理后台套餐列表中的真实会员名称。 */
  memberName: string;
  /** 会员购买页展示的会员等级名称。 */
  displayName: string;
};

export type MembershipTabConfig = {
  key: 'personal' | 'enterprise';
  name: string;
  memberLevel: { level: string };
  viplevel: MembershipVipLevelConfig[];
  options: MembershipCycleConfig[];
};

export type MembershipPlansConfig = {
  tabs: MembershipTabConfig[];
  /** 按 Web 新版套餐的会员等级配置卡片顶部促销横条和右上角标签。 */
  memberLevelDisplay: Record<string, MembershipMemberLevelDisplayConfig>;
};

export type MembershipOverviewConfig = {
  title: string;
  subtitle: string;
  /** 会员弹框顶部套餐卡片及对应会员等级权益。 */
  planCards: {
    personal: MembershipPlanDisplayConfig[];
    enterprise: MembershipPlanDisplayConfig[];
  };
  items: Array<{ title: string; description: string }>;
};

export type MembershipDetailsColumn = {
  key: string;
  label: string;
  tag?: string;
};

export type MembershipDetailsSection = {
  title: string;
  rows: Array<{ label: string; values: string[] }>;
};

export type MembershipComparisonConfig = {
  columns: MembershipDetailsColumn[];
  sections: MembershipDetailsSection[];
};

export type MembershipDetailsConfig = {
  title: string;
  personal?: MembershipComparisonConfig;
  enterprise?: MembershipComparisonConfig;
  sections?: Array<{ title: string; items: string[] }>;
};

export type MembershipModelConsumptionConfig = {
  title: string;
  description: string;
  columns?: Array<{ label: string; subLabel: string }>;
  groups?: Array<{
    key: string;
    title: string;
    rows: Array<{
      name: string;
      cost: string;
      unit: string;
      badge?: string;
      quotas: Array<string | number>;
    }>;
  }>;
  models?: Array<{ name: string; unit: string; quota: string | number }>;
};

export type MembershipCommercialLicenseConfig = {
  title: string;
  description: string;
  enabled: boolean;
  scopes: string[];
  scopeSections?: Array<{
    title: string;
    enabled: boolean;
    items: Array<{ title: string; description: string }>;
  }>;
  testimonials?: Array<{
    name: string;
    role: string;
    tags: string[];
    quote: string;
    avatar?: string;
  }>;
  logos?: string[];
  serviceCta?: {
    title: string;
    buttonLabel: string;
    qrTitle: string;
    qrDescription: string;
  };
};

export type MembershipFaqConfig = {
  title: string;
  items: Array<{ question: string; answer: string; openByDefault?: boolean }>;
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
      benefitItem('50 积分/月'),
      benefitItem('访问所有 AI 模型'),
      benefitItem('加购积分享折扣', false),
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
      benefitItem('300~5000 积分/席位/月'),
      benefitItem('访问所有 AI 模型'),
      benefitItem('加购积分享折扣'),
      benefitItem('AI 作品高清下载（可设置多倍数尺寸）'),
      benefitItem('团队共享积分'),
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
      benefitItem('300~5000 积分/月'),
      benefitItem('访问所有 AI 模型'),
      benefitItem('加购积分享折扣'),
      benefitItem('AI 作品高清下载（可设置多倍数尺寸）'),
      benefitItem('团队共享积分'),
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
    memberType: '基础版（个人）',
    memberLevel: 240,
    name: '基础版',
    subtitle: '适合初次探索 AI 创作',
    color: 'neutral',
    features: ['Seedance 2.0 VIP', '标准生成通道', '生成作品去除品牌水印'],
    benefitSections: personalBasicBenefits,
  },
  {
    planKey: 'professional',
    memberType: '专业版（个人）',
    memberLevel: 241,
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
      benefitItem('300~5000 积分/席位/月'),
      benefitItem('访问所有 AI 模型'),
      benefitItem('加购积分享折扣'),
      benefitItem('AI 作品高清下载（可设置多倍数尺寸）'),
      benefitItem('团队共享积分'),
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
    items: [benefitItem('拥有 AI 创作会员（团队版）所有权益'), benefitItem('积分额度灵活定制')],
  },
];

const enterprisePlans: MembershipPlanDisplayConfig[] = [
  ...personalPlans.map((plan) => ({
    ...plan,
    memberType: plan.planKey === 'basic' ? '基础版（企业）' : '专业版（企业）',
    memberLevel: plan.planKey === 'basic' ? 310 : 311,
    benefitSections: enterpriseCommonBenefits,
  })),
  {
    planKey: 'flagship',
    memberType: '旗舰版（企业）',
    memberLevel: 220,
    name: '旗舰版',
    subtitle: '为极限产出而生',
    color: 'orange',
    tag: '加赠2个月会员',
    features: ['Seedance 2.0 VIP', '图片 4.0', '快速生成通道', '生成作品去除品牌水印', 'API 服务购买'],
    benefitSections: enterpriseFlagshipBenefits,
  },
];

const createMemberLevelBadge = (text = '', backgroundColor = '#168ff2', textColor = '#ffffff', enabled = false): MembershipMemberLevelBadgeConfig => ({ enabled, text, backgroundColor, textColor });

const DEFAULT_MEMBER_LEVEL_DISPLAY: Record<string, MembershipMemberLevelDisplayConfig> = {
  '240': { level: 240, memberName: '基础版（个人）', banner: createMemberLevelBadge(), tag: createMemberLevelBadge() },
  '241': {
    level: 241,
    memberName: '专业版（个人）',
    banner: createMemberLevelBadge('Seedance 2.5 720P限时低至 ¥0.43/秒', '#168ff2', '#ffffff', true),
    tag: createMemberLevelBadge('限时5折', '#168ff2', '#ffffff', true),
  },
  '310': { level: 310, memberName: '基础版（企业）', banner: createMemberLevelBadge(), tag: createMemberLevelBadge() },
  '311': {
    level: 311,
    memberName: '专业版（企业）',
    banner: createMemberLevelBadge('Seedance 2.5 720P限时低至 ¥0.43/秒', '#168ff2', '#ffffff', true),
    tag: createMemberLevelBadge('限时5折', '#168ff2', '#ffffff', true),
  },
  '220': {
    level: 220,
    memberName: '旗舰版（企业）',
    banner: createMemberLevelBadge('Seedance 2.5 720P限时低至 ¥0.19/秒', '#ff7910', '#ffffff', true),
    tag: createMemberLevelBadge('加赠2个月会员', '#ff7910', '#ffffff', true),
  },
};

export const DEFAULT_MEMBERSHIP_PAGE_CONFIG: MembershipPageContent = {
  plans: {
    tabs: [
      {
        key: 'personal',
        name: '个人使用',
        memberLevel: { level: 'personal' },
        viplevel: [
          { level: 240, memberName: '基础版（个人）', displayName: '基础版' },
          { level: 241, memberName: '专业版（个人）', displayName: '专业版' },
        ],
        options: [
          { key: 'yearly', name: '连续包年', guideText: '限时4.5折', guideTextColor: '#8993a2', duration: '365天', highlighted: true },
          { key: 'yearly-one-time', name: '1年', guideText: '', guideTextColor: '#8993a2', duration: '365天' },
          { key: 'monthly', name: '连续包月', guideText: '4.8折', guideTextColor: '#8993a2', duration: '30天' },
          { key: 'monthly-one-time', name: '月度', guideText: '', guideTextColor: '#8993a2', duration: '30天' },
          { key: 'quarterly', name: '连续包季', guideText: '限时4.3折', guideTextColor: '#8993a2', duration: '90天' },
          { key: 'quarterly-one-time', name: '季度', guideText: '', guideTextColor: '#8993a2', duration: '90天' },
          { key: 'two-year', name: '2年', guideText: '', guideTextColor: '#8993a2', duration: '730天' },
          { key: 'bonus-year', name: '2年送1年', guideText: '', guideTextColor: '#8993a2', duration: '1095天' },
          { key: 'lifetime', name: '终身', guideText: '', guideTextColor: '#8993a2', duration: `${LIFETIME_MEMBER_DAYS}天` },
        ],
      },
      {
        key: 'enterprise',
        name: '企业使用',
        memberLevel: { level: 'enterprise' },
        viplevel: [
          { level: 310, memberName: '基础版（企业）', displayName: '基础版' },
          { level: 311, memberName: '专业版（企业）', displayName: '专业版' },
          { level: 220, memberName: '旗舰版（企业）', displayName: '旗舰版' },
        ],
        options: [
          { key: 'team-three-year', name: '3年', guideText: '', guideTextColor: '#8993a2', duration: '1095天', highlighted: true },
          { key: 'team-yearly', name: '1年', guideText: '', guideTextColor: '#8993a2', duration: '365天' },
          { key: 'team-two-year', name: '2年', guideText: '', guideTextColor: '#8993a2', duration: '730天' },
          { key: 'team-monthly', name: '连续包月', guideText: '', guideTextColor: '#8993a2', duration: '30天' },
          { key: 'team-monthly-one-time', name: '月度', guideText: '', guideTextColor: '#8993a2', duration: '30天' },
          { key: 'team-quarterly-subscription', name: '连续包季', guideText: '', guideTextColor: '#8993a2', duration: '90天' },
          { key: 'team-quarterly', name: '季度', guideText: '', guideTextColor: '#8993a2', duration: '90天' },
        ],
      },
    ],
    memberLevelDisplay: DEFAULT_MEMBER_LEVEL_DISPLAY,
  },
  overview: {
    title: '哪个计划更适合你',
    subtitle: '根据你的创作频率和团队规模，选择合适的会员权益',
    planCards: {
      personal: personalPlans,
      enterprise: enterprisePlans,
    },
    items: [
      { title: '个人创作', description: '适合日常设计、AI 图片和视频创作。' },
      { title: '高频产出', description: '适合营销活动、商品内容和持续交付。' },
      { title: '企业协作', description: '适合团队成员共享权益和统一管理。' },
    ],
  },
  details: {
    title: '权益对比',
    personal: {
      columns: [
        { key: 'basic', label: '基础版' },
        { key: 'advanced', label: '高级版' },
        { key: 'professional', label: '专业版', tag: 'New' },
      ],
      sections: [
        {
          title: '基础信息',
          rows: [
            { label: '价格', values: ['¥33/月起', '¥92/月起', '¥434/月起'] },
            { label: '可购席位数', values: ['个人使用\n1个', '个人使用\n1个', '个人使用\n1个'] },
            { label: '授权类型', values: ['个人商用授权\n1个', '—', '个人商用授权\n1个'] },
            { label: '授权范围', values: ['线上线下用途适用（不含“户外、敏感行业及转授权”拓展授权）', '—', '线上线下用途适用（不含“户外、敏感行业及转授权”拓展授权）'] },
          ],
        },
        {
          title: '模板设计权益',
          rows: [
            { label: '公益免费设计模板', values: ['✓', '✓', '✓'] },
            { label: '正版可商用的精美平面模板', values: ['✓', '—', '✓'] },
            { label: '正版可商用·PPT模板（限时加赠）', values: ['✓', '—', '✓'] },
            { label: '正版可商用·H5模板（限时加赠）', values: ['✓', '—', '✓'] },
            { label: '正版可商用·创意视频模板（限时加赠）', values: ['✓', '—', '✓'] },
            { label: '正版可商用·素材/字体/音乐等（限时加赠）', values: ['✓', '—', '✓'] },
            { label: '模板作品高清无水印下载', values: ['✓', '仅公益免费模板', '✓'] },
            { label: '模板作品 PSD 导出（限时加赠，仅电脑端可使用）', values: ['—', '—', '10 次/月'] },
          ],
        },
        {
          title: 'AI 创作权益',
          rows: [
            { label: 'AI 创作积分额度', values: ['50 积分/月', '300~5000 积分/月', '300~5000 积分/月'] },
            { label: '访问所有 AI 模型', values: ['✓', '✓', '✓'] },
            { label: '加购积分享折扣', values: ['—', '✓', '✓'] },
            { label: 'AI 作品高清下载（可设置多倍数尺寸）', values: ['—', '✓', '✓'] },
            { label: '团队共享积分', values: ['—', '✓', '✓'] },
            { label: '模型限时优惠', values: ['—', '✓', '✓'] },
          ],
        },
        {
          title: '精选素材组合包',
          rows: [
            { label: '官方自营素材下载次数', values: ['—', '—', '每月 100 次，共赠送 3 个月'] },
            { label: '第三方合作素材下载次数', values: ['—', '—', '每月 20 次，共赠送 3 个月'] },
          ],
        },
        {
          title: '通用权益',
          rows: [
            { label: '存储空间', values: ['50 GB', '500 GB', '500 GB'] },
            { label: '团队资产共享与复用', values: ['—', '✓', '✓'] },
          ],
        },
      ],
    },
    enterprise: {
      columns: [
        { key: 'basic', label: '基础版' },
        { key: 'advanced', label: '高级版' },
        { key: 'professional', label: '专业版' },
        { key: 'flagship', label: '旗舰版', tag: 'New' },
      ],
      sections: [
        {
          title: '基础信息',
          rows: [
            { label: '价格', values: ['¥33/月/席位起', '¥92/月/席位起', '¥434/月/席位起', '¥1,638/月/席位起'] },
            { label: '可购席位数', values: ['支持增加席位', '支持增加席位', '支持增加席位', '支持增加席位'] },
            { label: '授权类型', values: ['企业商用授权', '企业商用授权', '企业商用授权', '企业商用授权'] },
            { label: '授权范围', values: ['线上线下用途适用', '线上线下用途适用', '线上线下用途适用', '线上线下用途适用，支持全球范围拓展'] },
          ],
        },
        {
          title: '企业版专属权益',
          rows: [
            { label: '中小企业或大型企业商用授权', values: ['✓', '✓', '✓', '✓'] },
            { label: '支持线上线下授权', values: ['✓', '✓', '✓', '✓'] },
            { label: '支持海外/全球范围授权', values: ['可选购', '可选购', '可选购', '✓'] },
            { label: '支持敏感行业定制', values: ['可选购', '可选购', '可选购', '✓'] },
            { label: '内容审批管理，保障合规安全', values: ['—', '—', '—', '✓'] },
            { label: '人员离职无缝交接，内容资产完整保留', values: ['—', '—', '—', '✓'] },
            { label: '自定义企业品牌界面/导航栏/内容推送等', values: ['—', '—', '—', '✓'] },
            { label: '支持私有化部署与内容定制', values: ['—', '—', '—', '✓'] },
          ],
        },
        {
          title: 'AI 创作权益',
          rows: [
            { label: 'AI 创作积分额度', values: ['300~5000 积分/席位/月', '300~5000 积分/席位/月', '300~5000 积分/席位/月', '积分额度灵活定制'] },
            { label: '访问所有 AI 模型', values: ['✓', '✓', '✓', '✓'] },
            { label: '加购积分享折扣', values: ['✓', '✓', '✓', '✓'] },
            { label: 'AI 作品高清下载', values: ['✓', '✓', '✓', '✓'] },
            { label: '团队共享积分', values: ['✓', '✓', '✓', '✓'] },
          ],
        },
        {
          title: '素材下载权益',
          rows: [
            { label: '官方自营素材下载', values: ['✓', '✓', '✓', '按需定制'] },
            { label: '第三方合作素材下载', values: ['✓', '✓', '✓', '按需定制'] },
          ],
        },
        {
          title: '通用权益',
          rows: [
            { label: '存储空间', values: ['10 TB/团队', '10 TB/团队', '10 TB/团队', '10 TB/团队'] },
            { label: '无限团队空间数量', values: ['—', '—', '—', '✓'] },
            { label: '无限企业资源库数量', values: ['—', '—', '—', '✓'] },
            { label: '支持企业微信、自有系统、NAS 接入', values: ['—', '—', '—', '✓'] },
          ],
        },
      ],
    },
  },
  modelConsumption: {
    title: 'AI 模型消耗',
    description: 'AI 创作会员 / AI 大会员积分额度档位对应的模型生成数量',
    columns: [
      { label: '300', subLabel: '积分/月' },
      { label: '500', subLabel: '积分/月' },
      { label: '1,000', subLabel: '积分/月' },
      { label: '2,000', subLabel: '积分/月' },
      { label: '3,000', subLabel: '积分/月' },
    ],
    groups: [
      {
        key: 'image',
        title: '图片模型',
        rows: [
          { name: '智能图像 2K', cost: '3积分/次', unit: '张图片', quotas: [100, 166, 333, 666, '1,000'] },
          { name: '智能图像 4K', cost: '4积分/次', unit: '张图片', quotas: [75, 125, 250, 500, 750] },
          { name: '全能图像 2.1 1K', cost: '2积分/次', unit: '张图片', quotas: [150, 250, 500, '1,000', '1,500'] },
          { name: '全能图像 2.1 2K', cost: '3积分/次', unit: '张图片', quotas: [100, 166, 333, 666, '1,000'] },
          { name: '全能图像 2.1 4K', cost: '7积分/次', unit: '张图片', quotas: [42, 71, 142, 285, 428] },
          { name: '灵动图像 2.5 Fast 2K', cost: '8积分/次', unit: '张图片', quotas: [37, 62, 125, 250, 375] },
        ],
      },
      {
        key: 'video',
        title: '视频模型',
        rows: [
          { name: 'Seedance 2.0 Fast 480P', cost: '8积分/次', unit: '个视频', badge: '最高限时 6 折', quotas: [37, 62, 125, 250, 375] },
          { name: 'Seedance 2.0 Fast 720P', cost: '12积分/次', unit: '个视频', badge: '最高限时 6 折', quotas: [25, 41, 83, 166, 250] },
          { name: '万相 3.0 480P', cost: '6~135积分/次', unit: '个视频', badge: '最高限时 6 折', quotas: [50, 83, 166, 333, 500] },
          { name: '万相 3.0 720P', cost: '10~225积分/次', unit: '个视频', badge: '最高限时 6 折', quotas: [30, 50, 100, 200, 300] },
          { name: '万相 3.0 1080P', cost: '18~405积分/次', unit: '个视频', badge: '最高限时 6 折', quotas: [16, 27, 55, 111, 166] },
          { name: 'Seedance 2.5 720P', cost: '18积分/次', unit: '个视频', badge: '限时福利', quotas: [16, 27, 55, 111, 166] },
        ],
      },
    ],
  },
  commercialLicense: {
    title: '商用授权范围说明',
    description: '创客贴会员权益覆盖常见线上、线下商用场景，同时明确不可使用的场景范围。',
    enabled: true,
    scopes: ['商品宣传', '营销推广', '社交媒体'],
    scopeSections: [
      {
        title: '线上用途',
        enabled: true,
        items: [
          { title: '新媒体配图', description: '微信公众号、小程序、新浪微博、今日头条、百度问答、知乎问答、抖音、快手等新媒体平台配图' },
          { title: '网站及应用程序', description: '网页设计、APP设计、皮肤/主题、H5、微信/微博配图、电邮（非广告性质）等' },
          { title: '电商用途', description: '淘宝、京东、天猫、有赞、拼多多、美团、饿了么、小红书、微商域、在线教育等第三方电商平台' },
          { title: '推广及线上媒介广告', description: '网站、网站站外推广（百度推广、淘宝直通车等）、通过线上媒体渠道投放的平面及视频广告' },
          { title: '网络视频用途', description: '网络视频等媒体播放平台，如抖音、优酷、YouTube、微信视频号等' },
        ],
      },
      {
        title: '线下用途',
        enabled: true,
        items: [
          { title: '线下印刷用途（60 万份内）', description: '书籍、杂志、广告海报、宣传册、折页、门店陈设、门店商业显示屏投放等；铭牌、手机壳、贺卡、明信片、日历、杯子、T恤、抱枕、箱包等非转售印刷品' },
          { title: '图书出版（60 万份内）', description: '报纸配图、杂志封面及配图、图书封面及配图' },
          { title: '商业提案（非转售）', description: '网络设计、VI设计、项目营销策划等提案' },
          { title: '办公用途', description: '行政公文、工作汇报、市场及行业报告、企业VI、宣传册、宣传语、标准字、楼书、企业内部设计用途（商标、LOGO除外）' },
          { title: '户外广告（大牌广告除外）', description: '对外发布的户外广告（宣传册、海报、报纸杂志广告、楼宇、车身、灯箱、围挡、橱窗、公共场所陈列等）' },
        ],
      },
      {
        title: '禁用项',
        enabled: false,
        items: [
          { title: '户外广告牌', description: '制作户外广告牌' },
          { title: '网络转售', description: '软件程序、课件、教学视频、APP皮肤/主题、设计模板、H5模板、PPT模板、屏幕保护程序等' },
          { title: '包装设计用途', description: '用于市场流通的食品、日用品、电器等各类实物产品的包装' },
          { title: '商标注册', description: '商标、LOGO' },
          { title: 'AI数据训练', description: '用于训练AI类人工智能模型' },
          { title: '敏感行业用途', description: '用于制作药物、保健品和烟草行业；用于成人娱乐、约会婚恋等敏感类广告宣传' },
        ],
      },
    ],
    testimonials: [
      { name: '陈*', role: '电商卖家', tags: ['抠图神器', '操作简单', '电商小助手'], quote: '最开始使用是同行推荐的，以前拍产品照背景总是乱糟糟的，创客贴的智能抠图真的吹爆，操作也简单，一点就能抠干净。' },
      { name: '高**', role: '视觉负责人', tags: ['多人协同', '实时评论', '素材共享'], quote: '多人协同编辑功能挺好的，团队分三个城市，做张海报微信发几十条语音去调整。现在创客贴协作，设计师做完我直接在线图上批评，运营改文案实时同步，太方便。' },
      { name: '林**', role: '独立设计师', tags: ['AI灵感加持', '生态丰富', '灵活高效'], quote: '作为设计师，最头疼的是客户修改和灵感枯竭。创客贴的 AI 创作和丰富模板，让我从找素材到交付都更高效。' },
    ],
    logos: ['iQIYI 爱奇艺', '广发银行 CGB', '途虎养车', '汇联易', 'vanke', '平安银行', 'Mercedes-Benz', 'SF 顺丰', '吉利汽车', 'Tencent 腾讯', '斗鱼', '中国移动', '美团', '13 出行', '高顿教育'],
    serviceCta: {
      title: '为团队/企业提供专属服务和解决方案',
      buttonLabel: '申请试用',
      qrTitle: '扫码添加\n专属顾问',
      qrDescription: '企业专属服务',
    },
  },
  faq: {
    title: '常见问题',
    items: [
      {
        question: '01.单人版各版本、团队版各版本之间的区别是什么？',
        openByDefault: true,
        answer: '单人版：适合个人使用，均包含商用授权、海量可商用模板素材、高清无水印下载等基础权益，按需选择以下版本：\n\n基础版（单人）：同原通用版（个人）权益，适用于使用设计模板、同时用 AI 提效的用户，授权主体为个人商用授权，赠送 600 积分/月 AI 生成算力，60GB 云空间满足日常存储需求。\n\n高级版（单人）：适用于 AI 生成辅助设计的高级 AI Agent 使用用户，提供全面的主体商业授权，包括个人、企业或组织，赠送 1500 积分/月 AI 生成算力，100GB 云空间让素材管理更从容。\n\n专业版（单人）：适合追求创意与高效的深度 AI Agent 使用用户，提供全面的主体商业授权，包括个人、企业或组织，赠送 3800 积分/月 AI 生成算力，200GB 云空间承载更多创作灵感。\n\n团队版：适合 2-20 人团队使用，均包含企业授权、批量设计、内容标签化管理、实时协作批注等团队专属功能，按需选择以下版本：\n\n高级版（团队）：适用于 AI 生成辅助设计的高级 AI Agent 使用团队，每席位每月赠送 1500 积分 AI 生成算力，600GB 团队云空间。\n\n专业版（团队）：适合追求创意与高效、需要更高 AI 产能的团队，每席位每月赠送 3800 积分 AI 生成算力，800GB 团队云空间。\n\n至尊版（团队）：适合对 AI 算力和存储空间有极致追求的团队，每席位每月赠送 8000 积分 AI 生成算力，1TB 团队云空间。\n\n20 人以上的团队，欢迎联系专属顾问 >',
      },
      {
        question: '02.我是企业员工，我自己使用可以购买基础版吗？',
        openByDefault: true,
        answer: '如果使用者是企业中的员工，购买的是基础版（单人）（此版本为个人商用授权），作为企业宣传用途，那是不合规的，超出了授权的使用范围。虽然直接使用人是员工，但本质上是以企业身份宣传使用，所以要根据企业类型选择高级版、专业版或至尊版的企业商用授权，以避免版权风险。\n\n若未能正确使用创客贴会员版本或未经创客贴授权使用创客贴平台模板、元素、字体，视为侵权。侵权方应依据侵权行为严重程度给予赔偿（单个模板/元素赔偿额为 5000-10000 元，单款字体赔偿额为 10000-30000 元），并承担全部法律责任以及不利后果。',
      },
      { question: '03.生图积分有效期是多久？', answer: '会员套餐赠送的生图积分在对应会员有效期内按月发放，当月积分优先使用当月额度，未使用完的积分不顺延。具体以会员中心和账户实际展示为准。' },
      { question: '04.如何获取积分？', answer: '购买会员套餐后，系统会按照套餐权益发放对应积分；同时可以通过活动、任务或积分购买等方式获得积分，实际可用方式以页面展示为准。' },
      { question: '05.积分扣减有疑问怎么办？', answer: '可以先在生成记录中查看对应任务的模型、规格和积分消耗明细。如果确认扣减异常，请保留任务信息并联系在线客服或专属顾问核查。' },
      { question: '06.可以充值获得积分吗？', answer: '支持通过积分购买入口充值获得积分。不同模型和规格的消耗标准可能不同，提交前请确认购买数量、有效期和使用规则。' },
      { question: '07.如何申请发票？需要多长时间？', answer: '购买成功后可在订单或会员中心提交发票申请，填写发票抬头及税务信息即可。审核和开具时间以订单页面提示为准，通常需要 1-7 个工作日。' },
      { question: '08.低版本套餐费升级为高版本套餐，如何折算？', answer: '升级时会结合原套餐剩余有效期、已支付金额和目标套餐价格折算应补差价，具体金额以升级页面实时计算结果为准。' },
      { question: '09.购买VIP后是否可以退货退款？', answer: '会员和积分属于虚拟服务，购买前请确认版本、时长和授权范围。已经使用或已生效的虚拟权益通常不支持无理由退款，特殊情况请联系在线客服处理。' },
      { question: '10.是否支持多人同时使用？', answer: '个人版仅限购买账号本人使用，不支持多人共享；企业版支持按席位购买和管理，具体并发使用规则以对应企业套餐说明为准。' },
      { question: '11.积分可以转赠给其他账号吗？', answer: '当前积分仅限购买账号或对应团队使用，不能直接转赠或提现。团队积分按照企业套餐规则由团队管理员统一管理。' },
      { question: '12.包装模板/包装盒型模块下设计的包装能否商用？', answer: '包装设计用途不在常规商用授权范围内，不能直接用于市场流通的食品、日用品、电器等实物产品包装。如有包装商用需求，请先联系专属顾问确认适用授权。' },
    ],
  },
};

/**
 * 读取会员页配置默认值。网页版的时长结构以会员套餐管理中的 Web 新版实际套餐为准，
 * 这样新增、隐藏套餐后，会员页配置和会员弹框会使用同一组时长数据。
 */
export function getMembershipPageConfigDefaults(platform: PlatformKey = 'web'): MembershipPageContent {
  const fallback = clone(DEFAULT_MEMBERSHIP_PAGE_CONFIG);
  if (platform !== 'web') return fallback;
  const optionsByType = {
    personal: getWebMembershipCycleOptions('personal'),
    enterprise: getWebMembershipCycleOptions('enterprise'),
  };
  fallback.plans.tabs = fallback.plans.tabs.map((tab) => ({
    ...tab,
    options: optionsByType[tab.key],
  }));
  return fallback;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const parseJson = <T,>(value: unknown, fallback: T): T => {
  if (typeof value !== 'string') return clone(fallback);
  try {
    return JSON.parse(value) as T;
  } catch {
    return clone(fallback);
  }
};

const normalizeModelConsumption = (value: unknown, fallback: MembershipModelConsumptionConfig): MembershipModelConsumptionConfig => {
  if (!value || typeof value !== 'object') return clone(fallback);
  const raw = value as Partial<MembershipModelConsumptionConfig>;
  if (!Array.isArray(raw.groups)) {
    return {
      ...clone(fallback),
      title: typeof raw.title === 'string' ? raw.title : fallback.title,
      description: typeof raw.description === 'string' ? raw.description : fallback.description,
    };
  }
  return {
    ...clone(fallback),
    ...raw,
    columns: Array.isArray(raw.columns) ? raw.columns : fallback.columns,
    groups: raw.groups,
  };
};

const isComparisonConfig = (value: unknown): value is MembershipComparisonConfig => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MembershipComparisonConfig>;
  return Array.isArray(candidate.columns) && Array.isArray(candidate.sections);
};

const normalizeDetails = (value: unknown, fallback: MembershipDetailsConfig): MembershipDetailsConfig => {
  if (!value || typeof value !== 'object') return clone(fallback);
  const raw = value as Partial<MembershipDetailsConfig>;
  return {
    ...clone(fallback),
    title: typeof raw.title === 'string' ? raw.title : fallback.title,
    personal: isComparisonConfig(raw.personal) ? raw.personal : fallback.personal,
    enterprise: isComparisonConfig(raw.enterprise) ? raw.enterprise : fallback.enterprise,
  };
};

const normalizeCommercialLicense = (value: unknown, fallback: MembershipCommercialLicenseConfig): MembershipCommercialLicenseConfig => {
  if (!value || typeof value !== 'object') return clone(fallback);
  const raw = value as Partial<MembershipCommercialLicenseConfig>;
  return {
    ...clone(fallback),
    title: typeof raw.title === 'string' ? raw.title : fallback.title,
    description: typeof raw.description === 'string' ? raw.description : fallback.description,
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : fallback.enabled,
    scopes: Array.isArray(raw.scopes) ? raw.scopes : fallback.scopes,
    scopeSections: Array.isArray(raw.scopeSections) ? raw.scopeSections : fallback.scopeSections,
    testimonials: Array.isArray(raw.testimonials) ? raw.testimonials : fallback.testimonials,
    logos: Array.isArray(raw.logos) ? raw.logos : fallback.logos,
    serviceCta: raw.serviceCta && typeof raw.serviceCta === 'object' ? raw.serviceCta : fallback.serviceCta,
  };
};

const normalizeFaq = (value: unknown, fallback: MembershipFaqConfig): MembershipFaqConfig => {
  if (!value || typeof value !== 'object') return clone(fallback);
  const raw = value as Partial<MembershipFaqConfig>;
  return {
    ...clone(fallback),
    title: typeof raw.title === 'string' ? raw.title : fallback.title,
    items: Array.isArray(raw.items) && raw.items.length >= 10 ? raw.items : fallback.items,
  };
};

const normalizePlanCardList = (
  value: unknown,
  fallback: MembershipPlanDisplayConfig[],
  membershipType: 'personal' | 'enterprise',
) => {
  const rawPlans = Array.isArray(value) ? value : fallback;
  return rawPlans.map((plan, index) => {
    const fallbackPlan = fallback[index] ?? fallback[0];
    if (!fallbackPlan || !plan || typeof plan !== 'object') return fallbackPlan;
    const rawPlan = plan as Partial<MembershipPlanDisplayConfig>;
    return {
      ...clone(fallbackPlan),
      planKey: typeof rawPlan.planKey === 'string' ? rawPlan.planKey : fallbackPlan.planKey,
      memberType: typeof rawPlan.memberType === 'string'
        ? rawPlan.memberType
        : getDefaultMembershipPlanMemberType(membershipType, String(rawPlan.planKey ?? fallbackPlan.planKey)) ?? fallbackPlan.memberType,
      memberLevel: typeof rawPlan.memberLevel === 'number'
        ? rawPlan.memberLevel
        : getDefaultMembershipPlanMemberLevel(membershipType, String(rawPlan.planKey ?? fallbackPlan.planKey)) ?? fallbackPlan.memberLevel,
      name: typeof rawPlan.name === 'string' ? rawPlan.name : fallbackPlan.name,
      subtitle: typeof rawPlan.subtitle === 'string' ? rawPlan.subtitle : fallbackPlan.subtitle,
      color: rawPlan.color === 'blue' || rawPlan.color === 'orange' || rawPlan.color === 'neutral' ? rawPlan.color : fallbackPlan.color,
      tag: typeof rawPlan.tag === 'string' ? rawPlan.tag : fallbackPlan.tag,
      features: Array.isArray(rawPlan.features) ? rawPlan.features : fallbackPlan.features,
      benefitSections: Array.isArray(rawPlan.benefitSections) ? rawPlan.benefitSections : fallbackPlan.benefitSections,
    };
  }).filter((plan): plan is MembershipPlanDisplayConfig => Boolean(plan));
};

const normalizeOverview = (value: unknown, fallback: MembershipOverviewConfig): MembershipOverviewConfig => {
  if (!value || typeof value !== 'object') return clone(fallback);
  const raw = value as Partial<MembershipOverviewConfig>;
  const rawPlanCards = raw.planCards && typeof raw.planCards === 'object'
    ? raw.planCards as Partial<MembershipOverviewConfig['planCards']>
    : {};
  return {
    ...clone(fallback),
    title: typeof raw.title === 'string' ? raw.title : fallback.title,
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : fallback.subtitle,
    items: Array.isArray(raw.items) ? raw.items : fallback.items,
    planCards: {
      personal: normalizePlanCardList(rawPlanCards.personal, fallback.planCards.personal, 'personal'),
      enterprise: normalizePlanCardList(rawPlanCards.enterprise, fallback.planCards.enterprise, 'enterprise'),
    },
  };
};

const normalizeMemberLevelBadge = (value: unknown, fallback: MembershipMemberLevelBadgeConfig): MembershipMemberLevelBadgeConfig => {
  if (!value || typeof value !== 'object') return clone(fallback);
  const raw = value as Partial<MembershipMemberLevelBadgeConfig>;
  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : fallback.enabled,
    text: typeof raw.text === 'string' ? raw.text : fallback.text,
    backgroundColor: typeof raw.backgroundColor === 'string' ? raw.backgroundColor : fallback.backgroundColor,
    textColor: typeof raw.textColor === 'string' ? raw.textColor : fallback.textColor,
  };
};

const MEMBER_LEVEL_BY_NAME: Record<string, number> = {
  '基础版（个人）': 240,
  '专业版（个人）': 241,
  '基础版（企业）': 310,
  '专业版（企业）': 311,
  '旗舰版（企业）': 220,
};

const MEMBER_NAME_BY_LEVEL: Record<string, string> = Object.fromEntries(
  Object.entries(MEMBER_LEVEL_BY_NAME).map(([memberName, level]) => [String(level), memberName]),
);

const normalizeMemberLevelDisplay = (value: unknown, fallback: Record<string, MembershipMemberLevelDisplayConfig>): Record<string, MembershipMemberLevelDisplayConfig> => {
  const rawValue = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const raw = Object.fromEntries(Object.entries(rawValue).map(([key, display]) => [String(MEMBER_LEVEL_BY_NAME[key] ?? key), display]));
  const keys = new Set([...Object.keys(fallback), ...Object.keys(raw)]);
  return Object.fromEntries([...keys].map((memberType) => {
    const fallbackDisplay = fallback[memberType] ?? {
      level: Number(memberType),
      memberName: MEMBER_NAME_BY_LEVEL[memberType] ?? '',
      banner: createMemberLevelBadge(),
      tag: createMemberLevelBadge(),
    };
    const rawDisplay = raw[memberType] && typeof raw[memberType] === 'object' ? raw[memberType] as Partial<MembershipMemberLevelDisplayConfig> : {};
    return [memberType, {
      level: typeof rawDisplay.level === 'number' && Number.isFinite(rawDisplay.level) ? rawDisplay.level : fallbackDisplay.level,
      memberName: typeof rawDisplay.memberName === 'string' && rawDisplay.memberName.trim() ? rawDisplay.memberName : fallbackDisplay.memberName,
      banner: normalizeMemberLevelBadge(rawDisplay.banner, fallbackDisplay.banner),
      tag: normalizeMemberLevelBadge(rawDisplay.tag, fallbackDisplay.tag),
    }];
  })) as Record<string, MembershipMemberLevelDisplayConfig>;
};

const normalizeCycleOptions = (value: unknown, fallback: MembershipCycleConfig[]): MembershipCycleConfig[] => {
  const rawOptions = Array.isArray(value) ? value : fallback;
  return rawOptions.map((option, index) => {
    const fallbackOption = fallback.find((item) => item.key === (option as { key?: unknown })?.key) ?? fallback[index] ?? fallback[0];
    if (!fallbackOption || !option || typeof option !== 'object') return fallbackOption;
    const rawOption = option as Partial<MembershipCycleConfig>;
    return {
      ...clone(fallbackOption),
      key: typeof rawOption.key === 'string' ? rawOption.key : fallbackOption.key,
      name: typeof rawOption.name === 'string' ? rawOption.name : fallbackOption.name,
      guideText: typeof rawOption.guideText === 'string' ? rawOption.guideText : fallbackOption.guideText,
      guideTextColor: typeof rawOption.guideTextColor === 'string' && rawOption.guideTextColor.trim()
        ? rawOption.guideTextColor
        : fallbackOption.guideTextColor ?? '#8993a2',
      duration: typeof rawOption.duration === 'string' ? rawOption.duration : fallbackOption.duration,
      highlighted: typeof rawOption.highlighted === 'boolean' ? rawOption.highlighted : fallbackOption.highlighted,
    };
  }).filter((option): option is MembershipCycleConfig => Boolean(option));
};

const normalizeVipLevels = (value: unknown, fallback: MembershipVipLevelConfig[]): MembershipVipLevelConfig[] => {
  if (!Array.isArray(value)) return clone(fallback);
  const levels = value
    .filter((item): item is { displayName?: unknown; memberName?: unknown; memberType?: unknown; level?: unknown } => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      displayName: typeof item.displayName === 'string' ? item.displayName : '',
      memberName: typeof item.memberName === 'string'
        ? item.memberName
        : typeof item.memberType === 'string' ? item.memberType : '',
      level: typeof item.level === 'number' ? item.level : Number(item.level),
    }))
    .map((item, index) => ({
      level: item.level,
      memberName: item.memberName || fallback[index]?.memberName || '',
      displayName: item.displayName || fallback[index]?.displayName || item.memberName || '',
    }))
    .filter((item) => item.memberName && item.displayName && Number.isFinite(item.level));
  return levels.length ? levels : clone(fallback);
};

const normalizePlans = (value: unknown, fallback: MembershipPlansConfig, syncToPackageData = false): MembershipPlansConfig => {
  const rawTabs = (value as { tabs?: unknown } | null)?.tabs;
  if (!Array.isArray(rawTabs)) return clone(fallback);

  return {
    tabs: fallback.tabs.map((fallbackTab) => {
      const rawTab = rawTabs.find((item) => (item as { key?: string })?.key === fallbackTab.key) as (Partial<MembershipTabConfig> & { memberLevels?: unknown }) | undefined;
      if (!rawTab) return clone(fallbackTab);
      const rawOptions = Array.isArray(rawTab.options) ? rawTab.options : null;
      const isLegacyOptions = rawOptions != null && (
        (fallbackTab.key === 'personal' && rawOptions.length <= 4 && rawOptions.some((option) => (option as { key?: string })?.key === 'single'))
        || (fallbackTab.key === 'enterprise' && rawOptions.length <= 3 && rawOptions.some((option) => (option as { key?: string })?.key === 'team-quarterly'))
      );
      const options = syncToPackageData
        ? fallbackTab.options.map((packageOption) => {
          const configuredOption = rawOptions?.find((option) => {
            const candidate = option as { key?: unknown; name?: unknown; duration?: unknown };
            return candidate.key === packageOption.key
              || (candidate.name === packageOption.name && candidate.duration === packageOption.duration);
          }) as Partial<MembershipCycleConfig> | undefined;
          return {
            ...packageOption,
            guideText: typeof configuredOption?.guideText === 'string' ? configuredOption.guideText : packageOption.guideText,
            guideTextColor: typeof configuredOption?.guideTextColor === 'string' && configuredOption.guideTextColor.trim()
              ? configuredOption.guideTextColor
              : packageOption.guideTextColor,
          };
        })
        : isLegacyOptions ? clone(fallbackTab.options) : rawOptions ?? fallbackTab.options;
      const rawTabKey = (rawTab as { key?: string }).key;
      const isPersonal = rawTabKey === 'personal' || rawTab.name === '个人订阅';
      const isEnterprise = rawTabKey === 'enterprise' || rawTabKey === 'team' || rawTab.name === '团队订阅';
      return {
        key: fallbackTab.key,
        name: isPersonal ? '个人使用' : isEnterprise ? '企业使用' : typeof rawTab.name === 'string' ? rawTab.name : fallbackTab.name,
        memberLevel: { ...fallbackTab.memberLevel, ...(rawTab.memberLevel ?? {}) },
        viplevel: normalizeVipLevels(rawTab.viplevel ?? rawTab.memberLevels, fallbackTab.viplevel),
        options: normalizeCycleOptions(options, fallbackTab.options),
      };
    }),
    memberLevelDisplay: normalizeMemberLevelDisplay((value as { memberLevelDisplay?: unknown })?.memberLevelDisplay, fallback.memberLevelDisplay),
  };
};

export function readMembershipPageConfig(platform: PlatformKey = 'web'): MembershipPageContent {
  const fallback = getMembershipPageConfigDefaults(platform);
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = JSON.parse(window.localStorage.getItem(MEMBERSHIP_PAGE_CONFIG_STORAGE_KEY) ?? '{}') as { [key in PlatformKey]?: { json?: Record<string, unknown> } };
    const json = stored[platform]?.json ?? {};
    return {
      plans: normalizePlans(parseJson(json.plans, fallback.plans), fallback.plans, platform === 'web'),
      overview: normalizeOverview(parseJson(json.overview, fallback.overview), fallback.overview),
      details: normalizeDetails(parseJson(json.details, fallback.details), fallback.details),
      modelConsumption: normalizeModelConsumption(parseJson(json['model-consumption'], fallback.modelConsumption), fallback.modelConsumption),
      commercialLicense: normalizeCommercialLicense(parseJson(json['commercial-license'], fallback.commercialLicense), fallback.commercialLicense),
      faq: normalizeFaq(parseJson(json.faq, fallback.faq), fallback.faq),
    };
  } catch {
    return fallback;
  }
}
