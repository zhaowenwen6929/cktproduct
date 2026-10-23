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
      details: normalizeDetails(parseJson(json.details, fallback.details), fallback.details),
      modelConsumption: normalizeModelConsumption(parseJson(json['model-consumption'], fallback.modelConsumption), fallback.modelConsumption),
      commercialLicense: parseJson(json['commercial-license'], fallback.commercialLicense),
      faq: parseJson(json.faq, fallback.faq),
    };
  } catch {
    return fallback;
  }
}
