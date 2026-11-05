import { MEMBERSHIP_LEVEL_OPTIONS } from './membershipLevelCatalog';

export type PointsPackageType = 'standard' | 'custom';
export type PointsPackageEligibility = 'all' | 'free' | 'members' | 'specified';
export type PointsPackageStatus = '显示' | '隐藏';

export type MembershipPointsPackageItem = {
  id: string;
  groupId: string;
  name: string;
  displayName: string;
  packageType: PointsPackageType;
  points?: number;
  unitPrice?: number;
  price?: number;
  originalPrice?: number;
  outputText: string;
  validityDays: number;
  tag?: string;
  displayArea: 'normal' | 'member';
  eligibility: PointsPackageEligibility;
  memberLevels: number[];
  sort: number;
  status: PointsPackageStatus;
};

export type MembershipPointsPackageGroup = {
  id: string;
  name: string;
  description: string;
  packageCode: string;
  creator: string;
  createdAt: string;
  status: '使用中' | '停止使用';
};

export type MembershipPointsPackageConfig = {
  groups: MembershipPointsPackageGroup[];
  packages: MembershipPointsPackageItem[];
};

export const MEMBERSHIP_POINTS_PACKAGE_STORAGE_KEY = 'admin-membership-points-package-config';
export const DEFAULT_POINTS_PACKAGE_GROUP_ID = 'points-group-2026-10';

const levels = (names: string[]) => names
  .map((name) => MEMBERSHIP_LEVEL_OPTIONS.find((item) => item.name === name)?.level)
  .filter((level): level is number => level != null);

const defaultGroup: MembershipPointsPackageGroup = {
  id: DEFAULT_POINTS_PACKAGE_GROUP_ID,
  name: '2026年10月积分套餐',
  description: '会员支付弹框积分购买套餐，支持普通套餐、会员专享套餐和自定义积分量。',
  packageCode: 'points-2026-10',
  creator: '赵文文',
  createdAt: '2026-10-30 10:00:00',
  status: '使用中',
};

const createPackage = (item: Omit<MembershipPointsPackageItem, 'groupId'>): MembershipPointsPackageItem => ({
  ...item,
  groupId: DEFAULT_POINTS_PACKAGE_GROUP_ID,
});

const defaultPackages: MembershipPointsPackageItem[] = [
  createPackage({ id: 'points-1500', name: '1500积分普通套餐', displayName: '1500积分', packageType: 'standard', points: 1500, price: 100, originalPrice: 200, outputText: '约生150~375张图', validityDays: 365, displayArea: 'normal', eligibility: 'all', memberLevels: [], sort: 1, status: '显示' }),
  createPackage({ id: 'points-3000', name: '3000积分普通套餐', displayName: '3000积分', packageType: 'standard', points: 3000, price: 199, originalPrice: 420, outputText: '约生300~750张图', validityDays: 365, tag: '限时特惠', displayArea: 'normal', eligibility: 'all', memberLevels: [], sort: 2, status: '显示' }),
  createPackage({ id: 'points-900', name: '900积分普通套餐', displayName: '900积分', packageType: 'standard', points: 900, price: 60, originalPrice: 100, outputText: '约生90~225张图', validityDays: 365, tag: '入门首选', displayArea: 'normal', eligibility: 'all', memberLevels: [], sort: 3, status: '显示' }),
  createPackage({ id: 'points-7500', name: '7500积分普通套餐', displayName: '7500积分', packageType: 'standard', points: 7500, price: 495, originalPrice: 1100, outputText: '约生750~1875张图', validityDays: 365, displayArea: 'normal', eligibility: 'all', memberLevels: [], sort: 4, status: '显示' }),
  createPackage({ id: 'points-custom-normal', name: '自定义积分量普通套餐', displayName: '自定义充值', packageType: 'custom', unitPrice: 0.066, outputText: '按单个积分价格计算', validityDays: 365, displayArea: 'normal', eligibility: 'all', memberLevels: [], sort: 5, status: '显示' }),
  createPackage({ id: 'member-points-1500', name: '1500积分会员套餐', displayName: '1500积分', packageType: 'standard', points: 1500, price: 65, originalPrice: 100, outputText: '约生150~375张图', validityDays: 365, tag: '65折', displayArea: 'member', eligibility: 'members', memberLevels: [], sort: 1, status: '显示' }),
  createPackage({ id: 'member-points-3000', name: '3000积分会员套餐', displayName: '3000积分', packageType: 'standard', points: 3000, price: 129, originalPrice: 199, outputText: '约生300~750张图', validityDays: 365, tag: '65折', displayArea: 'member', eligibility: 'members', memberLevels: [], sort: 2, status: '显示' }),
  createPackage({ id: 'member-points-900', name: '900积分会员套餐', displayName: '900积分', packageType: 'standard', points: 900, price: 39, originalPrice: 60, outputText: '约生90~225张图', validityDays: 365, tag: '65折', displayArea: 'member', eligibility: 'members', memberLevels: [], sort: 3, status: '显示' }),
  createPackage({ id: 'member-points-7500', name: '7500积分会员套餐', displayName: '7500积分', packageType: 'standard', points: 7500, price: 322, originalPrice: 495, outputText: '约生750~1875张图', validityDays: 365, tag: '65折', displayArea: 'member', eligibility: 'members', memberLevels: [], sort: 4, status: '显示' }),
  createPackage({ id: 'member-points-custom', name: '自定义积分量会员套餐', displayName: '自定义充值', packageType: 'custom', unitPrice: 0.043, outputText: '会员按单个积分价格计算', validityDays: 365, displayArea: 'member', eligibility: 'members', memberLevels: [], sort: 5, status: '显示' }),
  createPackage({ id: 'points-free-welcome', name: '免费用户专享积分包', displayName: '免费用户积分包', packageType: 'standard', points: 300, price: 30, originalPrice: 60, outputText: '约生30~75张图', validityDays: 30, tag: '免费用户专享', displayArea: 'normal', eligibility: 'free', memberLevels: [], sort: 6, status: '隐藏' }),
  createPackage({ id: 'points-specified-example', name: '指定会员等级积分包', displayName: '专业版专享', packageType: 'standard', points: 5000, price: 199, originalPrice: 399, outputText: '约生500~1250张图', validityDays: 365, tag: '指定等级', displayArea: 'member', eligibility: 'specified', memberLevels: levels(['专业版（个人）', '专业版（企业）']), sort: 7, status: '隐藏' }),
];

export const DEFAULT_MEMBERSHIP_POINTS_PACKAGE_CONFIG: MembershipPointsPackageConfig = {
  groups: [defaultGroup],
  packages: defaultPackages,
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const normalizePackage = (item: unknown, groupId: string, index: number): MembershipPointsPackageItem | null => {
  if (!item || typeof item !== 'object') return null;
  const raw = item as Partial<MembershipPointsPackageItem>;
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  const packageType = raw.packageType === 'custom' ? 'custom' : 'standard';
  const eligibility = raw.eligibility === 'free' || raw.eligibility === 'members' || raw.eligibility === 'specified' ? raw.eligibility : 'all';
  return {
    id: raw.id,
    groupId: typeof raw.groupId === 'string' ? raw.groupId : groupId,
    name: raw.name,
    displayName: typeof raw.displayName === 'string' ? raw.displayName : raw.name,
    packageType,
    points: Number.isFinite(Number(raw.points)) && Number(raw.points) > 0 ? Number(raw.points) : undefined,
    unitPrice: Number.isFinite(Number(raw.unitPrice)) && Number(raw.unitPrice) > 0 ? Number(raw.unitPrice) : undefined,
    price: Number.isFinite(Number(raw.price)) && Number(raw.price) >= 0 ? Number(raw.price) : undefined,
    originalPrice: Number.isFinite(Number(raw.originalPrice)) && Number(raw.originalPrice) >= 0 ? Number(raw.originalPrice) : undefined,
    outputText: typeof raw.outputText === 'string' ? raw.outputText : '',
    validityDays: Number.isFinite(Number(raw.validityDays)) && Number(raw.validityDays) > 0 ? Number(raw.validityDays) : 365,
    tag: typeof raw.tag === 'string' ? raw.tag : undefined,
    displayArea: raw.displayArea === 'member' ? 'member' : 'normal',
    eligibility,
    memberLevels: Array.isArray(raw.memberLevels) ? raw.memberLevels.map(Number).filter(Number.isFinite) : [],
    sort: Number.isFinite(Number(raw.sort)) ? Number(raw.sort) : index + 1,
    status: raw.status === '隐藏' ? '隐藏' : '显示',
  };
};

export function readMembershipPointsPackageConfig(): MembershipPointsPackageConfig {
  if (typeof window === 'undefined') return clone(DEFAULT_MEMBERSHIP_POINTS_PACKAGE_CONFIG);
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MEMBERSHIP_POINTS_PACKAGE_STORAGE_KEY) ?? 'null') as Partial<MembershipPointsPackageConfig> | null;
    if (!parsed || !Array.isArray(parsed.groups) || !Array.isArray(parsed.packages)) return clone(DEFAULT_MEMBERSHIP_POINTS_PACKAGE_CONFIG);
    const groups = parsed.groups.filter((item): item is MembershipPointsPackageGroup => Boolean(item && typeof item === 'object' && typeof (item as MembershipPointsPackageGroup).id === 'string' && typeof (item as MembershipPointsPackageGroup).name === 'string')).map((group): MembershipPointsPackageGroup => ({
      ...defaultGroup,
      ...group,
      status: group.status === '停止使用' ? '停止使用' : '使用中',
    }));
    if (!groups.length) return clone(DEFAULT_MEMBERSHIP_POINTS_PACKAGE_CONFIG);
    const validGroupIds = new Set(groups.map((group) => group.id));
    const packages = parsed.packages.map((item, index) => normalizePackage(item, groups[0].id, index)).filter((item): item is MembershipPointsPackageItem => Boolean(item && validGroupIds.has(item.groupId)));
    return { groups, packages };
  } catch {
    return clone(DEFAULT_MEMBERSHIP_POINTS_PACKAGE_CONFIG);
  }
}

export function persistMembershipPointsPackageConfig(config: MembershipPointsPackageConfig) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MEMBERSHIP_POINTS_PACKAGE_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('membership-points-package-config-updated'));
  } catch {
    // Keep the prototype usable when browser storage is unavailable.
  }
}

export function getMembershipPointsPackages(groupId: string, config = readMembershipPointsPackageConfig()) {
  const group = config.groups.find((item) => item.id === groupId);
  if (!group || group.status !== '使用中') return [];
  return config.packages
    .filter((item) => item.groupId === groupId && item.status === '显示')
    .sort((left, right) => left.sort - right.sort);
}

export function canPurchaseMembershipPointsPackage(item: MembershipPointsPackageItem, memberLevel?: number | null) {
  if (item.eligibility === 'all') return true;
  if (item.eligibility === 'free') return memberLevel == null;
  if (item.eligibility === 'members') return memberLevel != null;
  return memberLevel != null && item.memberLevels.includes(memberLevel);
}

export function getPointsPackagePrice(item: MembershipPointsPackageItem, points?: number) {
  if (item.packageType === 'custom') return Number(((points ?? 0) * (item.unitPrice ?? 0)).toFixed(2));
  return item.price ?? 0;
}
