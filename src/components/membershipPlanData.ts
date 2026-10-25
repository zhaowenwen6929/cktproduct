export type MembershipTierData = {
  quotaLabel: string;
  price: string;
  originalPrice: string;
  points: string;
  pointsNote: string;
  pointsDescription?: string;
  priceDescription?: string;
  saleDescription?: string;
  monthlyPrice: string;
  renewalPrice?: string;
  durationDays?: number;
  packageType?: string;
};

export type MembershipCyclePlanData = {
  price: string;
  originalPrice: string;
  period: string;
  points: string;
  pointsNote: string;
  pointsDescription?: string;
  priceDescription?: string;
  saleDescription?: string;
  monthlyPrice: string;
  discount: string;
  renewalPrice?: string;
  durationDays?: number;
  packageType?: string;
  tierOptions?: MembershipTierData[];
};

export type MembershipPlanData = MembershipCyclePlanData & {
  cyclePricing?: Record<string, MembershipCyclePlanData>;
};

const professionalTierOptions: MembershipTierData[] = [
  { quotaLabel: '6.2K', price: '2599', originalPrice: '5199', points: '6160', pointsNote: '换算约 1 = 28 分', monthlyPrice: '217' },
  { quotaLabel: '12.3K', price: '5199', originalPrice: '10398', points: '12320', pointsNote: '换算约 1 = 28 分', monthlyPrice: '434' },
  { quotaLabel: '18.5K', price: '7799', originalPrice: '15598', points: '18500', pointsNote: '换算约 1 = 28 分', monthlyPrice: '650' },
  { quotaLabel: '27.7K', price: '10999', originalPrice: '21998', points: '27700', pointsNote: '换算约 1 = 28 分', monthlyPrice: '917' },
];

/**
 * 真实套餐数据源。价格、积分和档位由会员套餐数据维护，不属于会员页面展示配置。
 */
export const REAL_MEMBERSHIP_PLAN_DATA: Record<string, MembershipPlanData> = {
  basic: {
    price: '393',
    originalPrice: '659',
    period: '每年',
    points: '725 积分每月',
    pointsNote: '换算约 1 = 22 分',
    monthlyPrice: '33',
    discount: '6',
    cyclePricing: {
      yearly: { price: '393', originalPrice: '659', period: '每年', points: '725 积分每月', pointsNote: '换算约 1 = 22 分', monthlyPrice: '33', discount: '6' },
      monthly: { price: '59', originalPrice: '99', period: '每月', points: '725 积分每月', pointsNote: '换算约 1 = 12 分', monthlyPrice: '59', discount: '6' },
      quarterly: { price: '159', originalPrice: '239', period: '每季', points: '725 积分每月', pointsNote: '换算约 1 = 18 分', monthlyPrice: '53', discount: '6.7' },
      single: { price: '69', originalPrice: '69', period: '单月', points: '725 积分每月', pointsNote: '换算约 1 = 10 分', monthlyPrice: '69', discount: '10' },
    },
  },
  advanced: {
    price: '1099',
    originalPrice: '1889',
    period: '每年',
    points: '2210 积分每月',
    pointsNote: '换算约 1 = 24 分',
    monthlyPrice: '92',
    discount: '5.8',
    cyclePricing: {
      yearly: { price: '1099', originalPrice: '1889', period: '每年', points: '2210 积分每月', pointsNote: '换算约 1 = 24 分', monthlyPrice: '92', discount: '5.8' },
      monthly: { price: '159', originalPrice: '269', period: '每月', points: '2210 积分每月', pointsNote: '换算约 1 = 14 分', monthlyPrice: '159', discount: '5.9' },
      quarterly: { price: '449', originalPrice: '699', period: '每季', points: '2210 积分每月', pointsNote: '换算约 1 = 20 分', monthlyPrice: '150', discount: '6.4' },
      single: { price: '199', originalPrice: '199', period: '单月', points: '2210 积分每月', pointsNote: '换算约 1 = 11 分', monthlyPrice: '199', discount: '10' },
    },
  },
  professional: {
    price: '5199',
    originalPrice: '10398',
    period: '每年',
    points: '12320 积分每月',
    pointsNote: '换算约 1 = 28 分',
    monthlyPrice: '434',
    discount: '5',
    tierOptions: professionalTierOptions,
    cyclePricing: {
      yearly: { price: '5199', originalPrice: '10398', period: '每年', points: '12320 积分每月', pointsNote: '换算约 1 = 28 分', monthlyPrice: '434', discount: '5', tierOptions: professionalTierOptions },
      monthly: { price: '699', originalPrice: '1299', period: '每月', points: '12320 积分每月', pointsNote: '换算约 1 = 18 分', monthlyPrice: '699', discount: '5.4', tierOptions: professionalTierOptions.map((tier) => ({ ...tier, price: String(Math.round(Number(tier.price) / 7)), originalPrice: String(Math.round(Number(tier.originalPrice) / 7)), monthlyPrice: String(Math.round(Number(tier.price) / 7)) })) },
      quarterly: { price: '1999', originalPrice: '3499', period: '每季', points: '12320 积分每月', pointsNote: '换算约 1 = 24 分', monthlyPrice: '666', discount: '5.7', tierOptions: professionalTierOptions.map((tier) => ({ ...tier, price: String(Math.round(Number(tier.price) / 2.6)), originalPrice: String(Math.round(Number(tier.originalPrice) / 2.6)), monthlyPrice: String(Math.round(Number(tier.price) / 7.8)) })) },
      single: { price: '899', originalPrice: '899', period: '单月', points: '12320 积分每月', pointsNote: '换算约 1 = 14 分', monthlyPrice: '899', discount: '10', tierOptions: professionalTierOptions.map((tier) => ({ ...tier, price: String(Math.round(Number(tier.price) / 4)), originalPrice: String(Math.round(Number(tier.originalPrice) / 4)), monthlyPrice: String(Math.round(Number(tier.price) / 4)) })) },
    },
  },
  flagship: {
    price: '19656',
    originalPrice: '43680',
    period: '每年',
    points: '54600 积分每月',
    pointsNote: '换算约 1 = 33 分',
    monthlyPrice: '1,638',
    discount: '4.5',
    cyclePricing: {
      yearly: { price: '19656', originalPrice: '43680', period: '每年', points: '54600 积分每月', pointsNote: '换算约 1 = 33 分', monthlyPrice: '1,638', discount: '4.5' },
      monthly: { price: '2999', originalPrice: '4999', period: '每月', points: '54600 积分每月', pointsNote: '换算约 1 = 19 分', monthlyPrice: '2,999', discount: '6' },
      quarterly: { price: '8999', originalPrice: '14999', period: '每季', points: '54600 积分每月', pointsNote: '换算约 1 = 25 分', monthlyPrice: '2,999', discount: '6' },
      single: { price: '3999', originalPrice: '3999', period: '单月', points: '54600 积分每月', pointsNote: '换算约 1 = 14 分', monthlyPrice: '3,999', discount: '10' },
    },
  },
};
