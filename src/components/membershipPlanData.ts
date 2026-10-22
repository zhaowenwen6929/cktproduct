export type MembershipTierData = {
  quotaLabel: string;
  price: string;
  originalPrice: string;
  points: string;
  pointsNote: string;
  monthlyPrice: string;
};

export type MembershipPlanData = {
  price: string;
  originalPrice: string;
  period: string;
  points: string;
  pointsNote: string;
  monthlyPrice: string;
  discount: string;
  tierOptions?: MembershipTierData[];
};

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
  },
  advanced: {
    price: '1099',
    originalPrice: '1889',
    period: '每年',
    points: '2210 积分每月',
    pointsNote: '换算约 1 = 24 分',
    monthlyPrice: '92',
    discount: '5.8',
  },
  professional: {
    price: '5199',
    originalPrice: '10398',
    period: '每年',
    points: '12320 积分每月',
    pointsNote: '换算约 1 = 28 分',
    monthlyPrice: '434',
    discount: '5',
    tierOptions: [
      { quotaLabel: '6.2K', price: '2599', originalPrice: '5199', points: '6160', pointsNote: '换算约 1 = 28 分', monthlyPrice: '217' },
      { quotaLabel: '12.3K', price: '5199', originalPrice: '10398', points: '12320', pointsNote: '换算约 1 = 28 分', monthlyPrice: '434' },
      { quotaLabel: '18.5K', price: '7799', originalPrice: '15598', points: '18500', pointsNote: '换算约 1 = 28 分', monthlyPrice: '650' },
      { quotaLabel: '27.7K', price: '10999', originalPrice: '21998', points: '27700', pointsNote: '换算约 1 = 28 分', monthlyPrice: '917' },
    ],
  },
  flagship: {
    price: '19656',
    originalPrice: '43680',
    period: '每年',
    points: '54600 积分每月',
    pointsNote: '换算约 1 = 33 分',
    monthlyPrice: '1,638',
    discount: '4.5',
  },
};
