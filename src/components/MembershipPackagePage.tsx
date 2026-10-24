import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { ChevronDown, ChevronRight, Eye, Pencil, Plus, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';

type PackageRow = {
  id: number;
  name: string;
  description: string;
  packageCode: string;
  creator: string;
  createdAt: string;
  status: '使用中' | '停止使用';
};

type PackageDetailRow = {
  id: number;
  name: string;
  displayName: string;
  duration: number;
  originalPrice: number;
  discount: number;
  currentPrice: number;
  contractPrice: string;
  packageType: string;
  member: string;
  sort: number;
  trialDays: number;
  segment: string;
  displayTime: string;
  status: '显示' | '隐藏';
  points?: number;
  pointsUnit?: '每人' | '团队';
  pointsCycle?: '按月' | '一次性';
};

const initialPackages: PackageRow[] = [
  { id: 38, name: '360浏览器插件免费套餐', description: '360浏览器', packageCode: '121', creator: '孙羽茜', createdAt: '2026-08-25 14:11:21', status: '使用中' },
  { id: 37, name: '360浏览器插件套餐', description: '360浏览器', packageCode: '120', creator: '孙羽茜', createdAt: '2026-08-18 18:18:53', status: '使用中' },
  { id: 36, name: '电商65折直冲接口套餐组', description: '电商65折直冲接口套餐组', packageCode: '36', creator: '冯明亮', createdAt: '2026-07-29 10:20:20', status: '使用中' },
  { id: 35, name: '测试套餐组', description: '测试套餐组', packageCode: '30', creator: '范文东', createdAt: '2026-03-18 10:38:50', status: '停止使用' },
  { id: 34, name: 'ios电商套餐', description: '一次换留使用', packageCode: '117', creator: '王心泽', createdAt: '2025-08-14 10:35:58', status: '使用中' },
  { id: 33, name: '安卓端电商套餐', description: '安卓一次换留', packageCode: '116', creator: '王心泽', createdAt: '2025-08-11 16:18:09', status: '使用中' },
  { id: 32, name: 'web端电商套餐', description: '一次换留弹窗套餐', packageCode: '115', creator: '王心泽', createdAt: '2025-08-11 14:58:41', status: '使用中' },
  { id: 31, name: 'test_moni_iOS套餐', description: '仅限测试使用', packageCode: '113', creator: '肖凌', createdAt: '2025-08-04 15:31:29', status: '使用中' },
  { id: 30, name: 'test_moni套餐', description: '仅限测试使用', packageCode: '112', creator: '肖凌', createdAt: '2025-07-30 10:23:54', status: '使用中' },
  { id: 29, name: 'test_换留套餐', description: '仅限测试使用', packageCode: '8', creator: '肖凌', createdAt: '2025-07-30 10:20:59', status: '使用中' },
  { id: 28, name: '普通套餐V2(弃用)', description: '普通套餐V2(弃用)', packageCode: '6', creator: '肖凌', createdAt: '2025-07-30 10:20:41', status: '停止使用' },
  { id: 27, name: '测试套餐-换留套餐', description: '仅限测试使用', packageCode: '999', creator: '肖凌', createdAt: '2025-07-30 10:09:22', status: '停止使用' },
  { id: 26, name: '测试套餐', description: '仅限测试使用', packageCode: '888', creator: '肖凌', createdAt: '2025-07-30 10:08:42', status: '停止使用' },
  { id: 25, name: '闪格设计（5折直冲）', description: '全5折直冲套餐组', packageCode: '111', creator: '冯明亮', createdAt: '2025-07-25 09:55:52', status: '使用中' },
  { id: 24, name: '致远互联', description: '致远互联', packageCode: '24', creator: '冯明亮', createdAt: '2025-05-27 15:54:05', status: '使用中' },
  { id: 23, name: '360套餐', description: '360软件管家', packageCode: '110', creator: '姜宁', createdAt: '2024-12-24 17:00:38', status: '使用中' },
  { id: 22, name: '【蓝色兄弟】限次连包直冲', description: '【蓝色兄弟】限次连包直冲', packageCode: '107', creator: '冯明亮', createdAt: '2024-11-27 11:28:35', status: '使用中' },
  { id: 21, name: '限次测试套餐', description: '限次测试套餐', packageCode: '106', creator: '冯明亮', createdAt: '2024-11-13 17:30:18', status: '停止使用' },
  { id: 20, name: '15万挡直冲接口-直冲套餐', description: '多乐星', packageCode: '105', creator: '冯明亮', createdAt: '2024-11-13 10:40:22', status: '使用中' },
  { id: 19, name: 'web包季优惠套餐', description: '首季59元，后续79元', packageCode: '104', creator: '董烈振', createdAt: '2024-10-12 16:27:35', status: '停止使用' },
  { id: 18, name: '4折直冲接口套餐组', description: '4折直冲接口套餐', packageCode: '103', creator: '冯明亮', createdAt: '2024-09-14 13:56:54', status: '使用中' },
  { id: 17, name: '5000挡直冲接口-直冲套餐', description: '渠道：沐风科技、唯爱、唐软', packageCode: '102', creator: '冯明亮', createdAt: '2024-08-15 11:12:53', status: '使用中' },
  { id: 16, name: '巨厂奥直冲套餐', description: '电商渠道巨厂奥直冲套餐', packageCode: '101', creator: '冯明亮', createdAt: '2024-08-15 10:04:11', status: '使用中' },
  { id: 15, name: '蓝色兄弟直冲套餐', description: '蓝色兄弟直冲套餐', packageCode: '100', creator: '冯明亮', createdAt: '2024-06-12 11:26:39', status: '停止使用' },
  { id: 14, name: '联想套餐', description: '联想套餐', packageCode: '99', creator: '范文东', createdAt: '2024-04-25 19:32:24', status: '使用中' },
  { id: 13, name: 'M老套餐', description: 'M老套餐', packageCode: '84', creator: '范文东', createdAt: '2024-03-27 17:01:36', status: '使用中' },
  { id: 12, name: 'AB测试-标准版(个人)保留终身会员', description: '实验组', packageCode: '97', creator: '范文东', createdAt: '2024-01-17 19:11:12', status: '使用中' },
  { id: 11, name: '抖音渠道套餐', description: '抖音售卖', packageCode: '96', creator: '姜宁', createdAt: '2024-01-02 18:29:57', status: '使用中' },
  { id: 10, name: '渠道合作派送会员活动页面套餐', description: '用于市场渠道合作派发用户授权', packageCode: '66', creator: '陈艳婷', createdAt: '2023-11-23 09:52:10', status: '使用中' },
  { id: 9, name: 'Web端-新版-补差价页面', description: '新版正式套餐', packageCode: '94', creator: '姜宁', createdAt: '2023-10-12 11:37:07', status: '使用中' },
  { id: 8, name: 'Web端-新版', description: '新版正式套餐', packageCode: '93', creator: '姜宁', createdAt: '2023-10-08 15:01:27', status: '使用中' },
  { id: 7, name: '安卓端-新版', description: '新版正式套餐', packageCode: '92', creator: '姜宁', createdAt: '2023-10-08 15:01:03', status: '使用中' },
  { id: 6, name: 'iOS端-新版', description: '新版正式套餐', packageCode: '91', creator: '姜宁', createdAt: '2023-10-08 15:00:33', status: '使用中' },
  { id: 5, name: 'Web端-V14', description: '正式套餐配置', packageCode: '86', creator: '姜宁', createdAt: '2023-10-08 14:28:08', status: '使用中' },
  { id: 4, name: 'iOS端-V9', description: '正式套餐配置', packageCode: '87', creator: '姜宁', createdAt: '2023-10-08 14:27:37', status: '使用中' },
  { id: 3, name: '安卓端-V7', description: '正式套餐配置', packageCode: '88', creator: '姜宁', createdAt: '2023-10-08 14:27:03', status: '使用中' },
  { id: 2, name: '后台专用套餐', description: '后台专用套餐', packageCode: '67', creator: '范文东', createdAt: '2023-10-08 14:21:40', status: '使用中' },
  { id: 1, name: '激活码专享套餐', description: '激活码专享套餐', packageCode: '56', creator: '范文东', createdAt: '2023-10-08 09:55:30', status: '使用中' },
];

const CONFIGURED_PACKAGE_IDS = new Set([1, 2, 6, 7, 8, 9]);

export type MemberTypeOption = { name: string; level?: number };

export const MEMBER_TYPE_OPTIONS: MemberTypeOption[] = [
  { name: '个人版VIP' },
  { name: '标准版(个人)' },
  { name: '标准版(企业)' },
  { name: '标准版(大企业)' },
  { name: '个人高级版' },
  { name: '企业高级版' },
  { name: '高级版' },
  { name: '协作版' },
  { name: '旗舰版' },
  { name: '高级版(大企业)' },
  { name: '通用版(个人)' },
  { name: '通用版(企业)' },
  { name: '高级版(团队)' },
  { name: '专业版(团队)' },
  { name: '至尊版(团队)' },
  { name: '基础版(单人)' },
  { name: '高级版(单人)' },
  { name: '专业版(单人)' },
  { name: '至尊版(单人)' },
  { name: '基础版（个人）', level: 240 },
  { name: '专业版（个人）', level: 241 },
  { name: '基础版（企业）', level: 310 },
  { name: '专业版（企业）', level: 311 },
  { name: '旗舰版（企业）', level: 220 },
];

type MemberPointsConfig = Pick<PackageDetailRow, 'points' | 'pointsUnit' | 'pointsCycle'> & { display?: string };

const LIFETIME_MEMBER_TYPES = new Set(['个人版VIP', '标准版(个人)', '通用版(个人)', '基础版(单人)']);
export const LIFETIME_MEMBER_DAYS = 99 * 365;

const MEMBER_LEVEL_POINTS: Record<string, MemberPointsConfig> = {
  '个人版VIP': { points: 600, pointsUnit: '每人', pointsCycle: '按月' },
  '标准版(个人)': { points: 600, pointsUnit: '每人', pointsCycle: '按月' },
  '标准版(企业)': { points: 1500, pointsUnit: '每人', pointsCycle: '按月' },
  '标准版(大企业)': { points: 1500, pointsUnit: '每人', pointsCycle: '按月' },
  '个人高级版': { points: 1500, pointsUnit: '团队', pointsCycle: '按月' },
  '企业高级版': { points: 1500, pointsUnit: '团队', pointsCycle: '按月' },
  '高级版': { points: 1500, pointsUnit: '团队', pointsCycle: '按月' },
  '协作版': { points: 1500, pointsUnit: '团队', pointsCycle: '按月' },
  '旗舰版': { points: 880, pointsUnit: '团队', pointsCycle: '按月' },
  '高级版(大企业)': { points: 1500, pointsUnit: '团队', pointsCycle: '按月' },
  '通用版(个人)': { points: 600, pointsUnit: '每人', pointsCycle: '按月' },
  '通用版(企业)': { points: 1500, pointsUnit: '每人', pointsCycle: '按月' },
  '高级版(团队)': { points: 1500, pointsUnit: '团队', pointsCycle: '按月' },
  '专业版(团队)': { points: 3800, pointsUnit: '团队', pointsCycle: '按月' },
  '至尊版(团队)': { points: 8000, pointsUnit: '团队', pointsCycle: '按月' },
  '基础版(单人)': { points: 600, pointsUnit: '每人', pointsCycle: '按月' },
  '高级版(单人)': { points: 1500, pointsUnit: '每人', pointsCycle: '按月' },
  '专业版(单人)': { points: 3800, pointsUnit: '每人', pointsCycle: '按月' },
  '至尊版(单人)': { points: 8000, pointsUnit: '每人', pointsCycle: '按月' },
  '基础版（个人）': { display: '按套餐' },
  '专业版（个人）': { display: '按套餐' },
  '基础版（企业）': { display: '按套餐' },
  '专业版（企业）': { display: '按套餐' },
  '旗舰版（企业）': { display: '按套餐' },
};

export function getMemberPointsConfig(member: string) {
  return MEMBER_LEVEL_POINTS[member];
}

export function isHistoricalMemberType(member: string) {
  return Boolean(member) && MEMBER_TYPE_OPTIONS.some((option) => option.name === member && option.level == null);
}

export function getDefaultMemberDurationDays(member: string) {
  return LIFETIME_MEMBER_TYPES.has(member) ? String(LIFETIME_MEMBER_DAYS) : '';
}

export function isLifetimeDuration(duration: string | number) {
  return Number(duration) === LIFETIME_MEMBER_DAYS;
}

export function getMemberPointsConfigForDuration(member: string, duration: string | number) {
  const config = getMemberPointsConfig(member);
  return config && isLifetimeDuration(duration) ? { ...config, pointsCycle: '一次性' as const } : config;
}

const initialPackageDetails: PackageDetailRow[] = [
  { id: 3480, name: 'web-高级版（团队）-3年（加送1年）', displayName: '3年+1年', duration: 1460, originalPrice: 1578, discount: 100, currentPrice: 1578, contractPrice: '-', packageType: '普通套餐', member: '高级版(团队)', sort: 0, trialDays: 0, segment: '/', displayTime: '/', status: '显示', points: undefined },
  { id: 3479, name: 'web-高级版（团队）-2年会员（加6个月）', displayName: '2年+6个月', duration: 910, originalPrice: 1138, discount: 100, currentPrice: 1138, contractPrice: '-', packageType: '普通套餐', member: '高级版(团队)', sort: 1, trialDays: 0, segment: '/', displayTime: '/', status: '显示', points: undefined },
  { id: 3438, name: 'web-高级版（单人）-连续包季（199）', displayName: '连续包季', duration: 90, originalPrice: 239, discount: 83, currentPrice: 199, contractPrice: '1-199', packageType: '订阅套餐', member: '高级版(单人)', sort: 0, trialDays: 0, segment: '/', displayTime: '/', status: '显示', points: undefined },
  { id: 3392, name: 'web-基础版（单人）-连续包年（139）', displayName: '连续包年', duration: 365, originalPrice: 159, discount: 94, currentPrice: 149, contractPrice: '1-139', packageType: '订阅套餐', member: '基础版(单人)', sort: 3, trialDays: 0, segment: '109', displayTime: '/', status: '隐藏', points: undefined },
  { id: 3391, name: 'web-基础版（单人）-连续包年（139）', displayName: '连续包年', duration: 365, originalPrice: 159, discount: 94, currentPrice: 149, contractPrice: '1-139', packageType: '订阅套餐', member: '基础版(单人)', sort: 3, trialDays: 0, segment: '110', displayTime: '/', status: '隐藏', points: undefined },
  { id: 3388, name: 'web-基础版（单人）-连续包年（139）', displayName: '连续包年', duration: 365, originalPrice: 159, discount: 87, currentPrice: 139, contractPrice: '1-139', packageType: '订阅套餐', member: '基础版(单人)', sort: 3, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏', points: undefined },
  { id: 3385, name: 'web-基础版（单人）-连续包年（139）', displayName: '连续包年', duration: 365, originalPrice: 159, discount: 94, currentPrice: 149, contractPrice: '1-139', packageType: '订阅套餐', member: '基础版(单人)', sort: 3, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏', points: undefined },
  { id: 3383, name: 'web-高级版（团队）-2年会员', displayName: '2年', duration: 730, originalPrice: 1138, discount: 100, currentPrice: 1138, contractPrice: '-', packageType: '普通套餐', member: '高级版(团队)', sort: 1, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏', points: undefined },
  { id: 3382, name: 'web-高级版（团队）-3年会员', displayName: '3年', duration: 1095, originalPrice: 1578, discount: 100, currentPrice: 1578, contractPrice: '-', packageType: '普通套餐', member: '高级版(团队)', sort: 0, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏', points: undefined },
  { id: 3381, name: 'web-高级版（团队）-2年会员', displayName: '2年', duration: 730, originalPrice: 1138, discount: 100, currentPrice: 1138, contractPrice: '-', packageType: '普通套餐', member: '高级版(团队)', sort: 1, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏', points: undefined },
];

export function formatPointsDisplay(points?: number, pointsUnit?: '每人' | '团队', pointsCycle?: '按月' | '一次性') {
  return points == null ? '按会员等级发' : `${points}/${pointsUnit ?? '每人'}/${pointsCycle ?? '按月'}`;
}

export function getPackagePointsDisplay(member: string, duration?: string | number) {
  const packageDetail = initialPackageDetails.find((row) => row.member === member);
  const configuredPoints = packageDetail?.points == null ? getMemberPointsConfigForDuration(member, duration ?? packageDetail?.duration ?? '') : packageDetail;
  if (packageDetail?.points == null && configuredPoints?.display) return configuredPoints.display;
  return formatPointsDisplay(configuredPoints?.points, configuredPoints?.pointsUnit, configuredPoints?.pointsCycle);
}

const blankPackageDetail: PackageDetailRow = {
  id: 0,
  name: '',
  displayName: '',
  duration: 0,
  originalPrice: 0,
  discount: 0,
  currentPrice: 0,
  contractPrice: '',
  packageType: '普通套餐',
  member: '',
  sort: 0,
  trialDays: 0,
  segment: '/',
  displayTime: '/',
  status: '显示',
  points: 0,
  pointsUnit: '每人',
  pointsCycle: '按月',
};

type DetailEditValues = {
  id: number;
  name: string;
  displayName: string;
  saleDescription: string;
  member: string;
  packageType: string;
  duration: string;
  originalPrice: string;
  discount: string;
  currentPrice: string;
  dailyPrice: string;
  yearlyPrice: string;
  maxMembers: string;
  productId: string;
  downloadCount: string;
  sort: string;
  segment: string;
  validDays: string;
  remark: string;
  points: string;
  pointsUnit: string;
  pointsCycle: string;
};

export type RequirementSection = { title: string; items: string[]; highlight?: boolean };

export const POINTS_REQUIREMENT_NAME = '会员套餐新增积分量';
export const POINTS_REQUIREMENT_KEY = 'V2610';
export const POINTS_REQUIREMENT_STATUS: '待开发' | '已上线' = '待开发';
export const POINTS_HISTORY_HELPER_TEXT = '历史会员按会员等级回显积分量，不支持修改';
export const POINTS_OPENING_HELPER_TEXT = '对应用户/团队的积分量将按照开通时的「积分量」设置进行发放，每次开通将立即按生效套餐发放，上一笔对应的未使用积分量失效';
export const POINTS_PURCHASE_HELPER_TEXT = '对应用户/团队的积分量将按照购买套餐对应的「积分量」设置进行发放，每次购买将立即按生效套餐发放，上一笔对应的未使用积分量失效';
export const POINTS_REQUIREMENT_SECTIONS: RequirementSection[] = [
  { title: '功能说明', items: ['积分量用于配置套餐独立发放的积分额度。'] },
  { title: '表单配置', items: ['新增会员等级：积分量为必填项，填写非负整数。', '历史会员等级：积分量非必填，按等级积分量自动回显且不可修改。', '发放单位：默认每人，可选团队。', '发放周期：默认按月，可选一次性。'] },
  { title: '历史套餐', items: ['历史套餐按所属会员等级自动回显积分量，创建历史等级套餐时不可编辑。', '终身会员按套餐时长99年识别，即按天字段填写36135天。'] },
  { title: '列表展示规则', items: ['积分量为空：显示“按会员等级发”。', '已配置具体值：显示“具体值/单位/周期”，例如“600/每人/按月”。'] },
  { title: '积分发放规则', highlight: true, items: ['购买套餐时，对应用户/团队的积分量按照购买套餐对应的「积分量」设置进行发放。', '每次购买将立即按生效套餐发放，上一笔对应的未使用积分量失效。', '优先查询用户当前生效套餐对应的积分量，按照当前生效套餐配置的积分量和规则发放。', '套餐未配置积分量时，按照套餐对应会员等级的积分量和规则发放。'] },
  { title: '影响入口', items: ['会员套餐管理列表、套餐详情、新增套餐、编辑套餐，以及开通会员页成员人数下的积分量字段。'] },
];
export const POINTS_REQUIREMENT = POINTS_REQUIREMENT_SECTIONS.flatMap((section) => section.items).join(' ');
export const MEMBER_TYPE_REQUIREMENT_NAME = '会员套餐管理新增新会员等级';
export const OPEN_MEMBER_TYPE_REQUIREMENT_NAME = '开通会员新增新会员等级';
export const MEMBER_TYPE_REQUIREMENT_SECTIONS: RequirementSection[] = [
  { title: '功能说明', items: ['会员类型列表新增 5 个会员等级及对应 level。'] },
  { title: '新增会员', items: ['基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）220。'] },
  { title: '列表展示规则', items: ['会员类型显示名称在前，level 数字在后。'] },
];
export const MEMBER_TYPE_REQUIREMENT = MEMBER_TYPE_REQUIREMENT_SECTIONS.flatMap((section) => section.items).join(' ');

function RequirementEntryDot() {
  return POINTS_REQUIREMENT_STATUS === '已上线' ? null : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5a5f] shadow-[0_0_6px_rgba(255,90,95,.75)]" aria-label="有待开发需求" />;
}

export function RequirementHint({ text, requirementKey = POINTS_REQUIREMENT_KEY, status = POINTS_REQUIREMENT_STATUS, requirementName = POINTS_REQUIREMENT_NAME, sections = POINTS_REQUIREMENT_SECTIONS }: { text: string; requirementKey?: string; status?: string; requirementName?: string; sections?: RequirementSection[] }) {
  const [tipPosition, setTipPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const tooltipWidth = 360;
  const markerClass = status === '已上线' ? 'bg-[#52b788] shadow-[0_0_6px_rgba(82,183,136,.45)]' : 'bg-[#ff725c] shadow-[0_2px_6px_rgba(255,114,92,.3)]';
  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };
  const getTipPosition = (rect: DOMRect, contentWidth: number, contentHeight: number) => {
    const gap = 10;
    const viewportPadding = 12;
    const availableWidth = Math.max(220, window.innerWidth - viewportPadding * 2);
    const width = Math.min(contentWidth, availableWidth);
    const height = Math.min(contentHeight, window.innerHeight - viewportPadding * 2);
    const rightSpace = window.innerWidth - rect.right;
    const leftSpace = rect.left;
    const showRight = rightSpace >= width + gap || rightSpace >= leftSpace;
    const rawLeft = showRight ? rect.right + gap : rect.left - width - gap;
    const left = Math.max(viewportPadding, Math.min(rawLeft, window.innerWidth - width - viewportPadding));
    const rawTop = rect.top + rect.height / 2 - height / 2;
    const top = Math.max(viewportPadding, Math.min(rawTop, window.innerHeight - height - viewportPadding));
    return { top, left };
  };
  const updateTipPosition = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    setTipPosition(getTipPosition(rect, tooltipWidth, Math.min(520, Math.max(180, window.innerHeight - 24))));
  };
  const handleMouseEnter = (event: MouseEvent<HTMLSpanElement>) => {
    clearHideTimer();
    anchorRef.current = event.currentTarget;
    updateTipPosition(event.currentTarget);
  };
  const scheduleHide = () => {
    clearHideTimer();
    if (!isPinned) hideTimerRef.current = window.setTimeout(() => setTipPosition(null), 160);
  };

  useEffect(() => () => clearHideTimer(), []);
  useEffect(() => {
    if (!tipPosition) return undefined;
    const reposition = () => {
      if (anchorRef.current) updateTipPosition(anchorRef.current);
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [tipPosition]);
  useLayoutEffect(() => {
    if (!tipPosition || !anchorRef.current || !tooltipRef.current) return;
    const nextPosition = getTipPosition(anchorRef.current.getBoundingClientRect(), tooltipRef.current.getBoundingClientRect().width, tooltipRef.current.getBoundingClientRect().height);
    if (Math.abs(nextPosition.top - tipPosition.top) > 1 || Math.abs(nextPosition.left - tipPosition.left) > 1) setTipPosition(nextPosition);
  }, [tipPosition]);

  return (
    <span className="inline-flex shrink-0 align-middle" onMouseEnter={handleMouseEnter} onMouseLeave={scheduleHide} aria-label={`需求标识：${requirementKey}，${text}`}>
      <span role="button" tabIndex={0} aria-expanded={Boolean(tipPosition)} onClick={(event) => { event.stopPropagation(); clearHideTimer(); if (isPinned) { setIsPinned(false); setTipPosition(null); } else { setIsPinned(true); handleMouseEnter(event); } }} className={`cursor-help rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-[.02em] text-white ${markerClass}`}>{requirementKey}</span>
      {tipPosition && typeof document !== 'undefined' ? createPortal(
        <span ref={tooltipRef} role="tooltip" onMouseEnter={clearHideTimer} onMouseLeave={scheduleHide} style={{ top: tipPosition.top, left: tipPosition.left, width: tooltipWidth, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 24px)' }} className="pointer-events-auto fixed z-[9999] overflow-y-auto rounded-[9px] border border-[#f1d36a] bg-[#fff2b8] px-4 py-3 text-left text-[12px] font-normal leading-5 text-[#5d4a1c] shadow-[0_10px_24px_rgba(145,108,26,.24)]">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="font-semibold text-[#765d1c]">{requirementName}</span><span className="text-[#8a6a22]">{requirementKey} · {status}</span></span>
          <span className="mt-2 block border-t border-[#efd77e] pt-2"><span className="mt-2 block space-y-2 whitespace-normal break-words leading-5">{sections.map((section) => <span key={section.title} className={section.highlight ? 'block rounded-[4px] border-l-2 border-[#e05252] bg-[#fff0ed] px-2 py-1.5 text-[#c43f3f]' : 'block'}><span className={section.highlight ? 'block font-semibold text-[#c43f3f]' : 'block font-semibold text-[#765d1c]'}>{section.title}</span><span className="block">{section.items.map((item) => <span key={item} className={section.highlight ? "block pl-3 text-[#c43f3f] before:mr-1 before:content-['·']" : "block pl-3 before:mr-1 before:content-['·']"}>{item}</span>)}</span></span>)}</span></span>
        </span>,
        document.body,
      ) : null}
    </span>
  );
}

export function MemberTypeDropdown({ value, onChange, disabled = false, className = 'w-[240px]', requirementName = MEMBER_TYPE_REQUIREMENT_NAME }: { value: string; onChange: (value: string) => void; disabled?: boolean; className?: string; requirementName?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = MEMBER_TYPE_OPTIONS.find((member) => member.name === value);
  const existingOptions = MEMBER_TYPE_OPTIONS.filter((member) => !member.level);
  const newOptions = MEMBER_TYPE_OPTIONS.filter((member) => member.level);
  const formatLabel = (member: MemberTypeOption) => member.level ? member.name + ' ' + member.level : member.name;
  const choose = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };
  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsidePointer = (event: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className} shrink-0`}>
      <button type="button" disabled={disabled} onClick={() => { if (!disabled) setOpen((current) => !current); }} aria-haspopup="listbox" aria-expanded={open} className="flex h-[33px] w-full items-center justify-between rounded-[2px] border border-[#d9d9d9] bg-white px-3 text-left text-[12px] text-[#b6bbc1] outline-none focus:border-[#278fee] disabled:cursor-not-allowed disabled:bg-[#f5f5f5]">
        <span className={selected ? 'text-[#333]' : ''}>{selected ? formatLabel(selected) : '请选择会员类型'}</span>
        <ChevronDown className="h-4 w-4 text-[#aeb5bd]" />
      </button>
      {open ? <div role="listbox" className="absolute left-0 top-full z-[100] mt-1 max-h-[430px] w-full overflow-y-auto rounded-[4px] border border-[#e1e4e8] bg-white p-1 shadow-[0_8px_20px_rgba(31,45,61,.18)]">
        <button type="button" onClick={() => choose('')} className={!value ? 'block w-full rounded-[2px] bg-[#f4f6f9] px-3 py-2 text-left text-[12px] text-[#333]' : 'block w-full rounded-[2px] px-3 py-2 text-left text-[12px] text-[#596579] hover:bg-[#f7f9fc]'}>请选择会员类型</button>
        {existingOptions.map((member) => <button type="button" role="option" aria-selected={member.name === value} key={member.name} onClick={() => choose(member.name)} className={member.name === value ? 'block w-full rounded-[2px] bg-[#f4f6f9] px-3 py-2 text-left text-[12px] text-[#333]' : 'block w-full rounded-[2px] px-3 py-2 text-left text-[12px] text-[#596579] hover:bg-[#f7f9fc]'}>{formatLabel(member)}</button>)}
        <div className="relative mt-3 rounded-[5px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-1 pb-1 pt-3">
          <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2"><RequirementHint text={MEMBER_TYPE_REQUIREMENT} requirementName={requirementName} sections={MEMBER_TYPE_REQUIREMENT_SECTIONS} /></div>
          {newOptions.map((member) => <button type="button" role="option" aria-selected={member.name === value} key={member.name} onClick={() => choose(member.name)} className={member.name === value ? 'block w-full rounded-[2px] bg-[#ffe6e1] px-3 py-2 text-left text-[12px] text-[#333]' : 'block w-full rounded-[2px] px-3 py-2 text-left text-[12px] text-[#596579] hover:bg-[#fff0ed]'}>{formatLabel(member)}</button>)}
        </div>
      </div> : null}
    </div>
  );
}

function PackageModal({ mode, row, onClose, onSave }: { mode: 'detail' | 'edit' | 'create'; row: PackageRow; onClose: () => void; onSave: (row: PackageRow) => void }) {
  const [form, setForm] = useState(row);
  const isDetail = mode === 'detail';
  const update = (key: keyof PackageRow, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f1d2f]/35 p-5">
      <div className="w-[560px] rounded-[4px] bg-white shadow-[0_16px_50px_rgba(20,35,57,.22)]">
        <div className="flex h-[58px] items-center justify-between border-b border-[#edf0f4] px-6"><h2 className="text-[16px] font-medium text-[#252d3b]">{mode === 'create' ? '新增套餐组' : mode === 'edit' ? '编辑套餐组' : '套餐详情'}</h2><button type="button" onClick={onClose} className="text-[#a0a8b4] hover:text-[#4d5869]" aria-label="关闭"><X className="h-5 w-5" /></button></div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 px-6 py-6">
          <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>名称</span><input disabled={isDetail} value={form.name} onChange={(event) => update('name', event.currentTarget.value)} className="h-9 rounded-[3px] border border-[#dfe3ea] px-3 text-[12px] text-[#303b4d] outline-none focus:border-[#278fee] disabled:bg-[#f7f8fa]" /></label>
          <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>套餐标识</span><input disabled={isDetail} value={form.packageCode} onChange={(event) => update('packageCode', event.currentTarget.value)} className="h-9 rounded-[3px] border border-[#dfe3ea] px-3 text-[12px] text-[#303b4d] outline-none focus:border-[#278fee] disabled:bg-[#f7f8fa]" /></label>
          <label className="col-span-2 flex flex-col gap-2 text-[12px] text-[#657084]"><span>描述</span><textarea disabled={isDetail} value={form.description} onChange={(event) => update('description', event.currentTarget.value)} className="min-h-[82px] resize-none rounded-[3px] border border-[#dfe3ea] px-3 py-2 text-[12px] leading-5 text-[#303b4d] outline-none focus:border-[#278fee] disabled:bg-[#f7f8fa]" /></label>
          <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>创建人</span><input disabled value={form.creator} className="h-9 rounded-[3px] border border-[#dfe3ea] bg-[#f7f8fa] px-3 text-[12px] text-[#697487]" /></label>
          <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>状态</span><select disabled={isDetail} value={form.status} onChange={(event) => update('status', event.currentTarget.value)} className="h-9 rounded-[3px] border border-[#dfe3ea] bg-white px-3 text-[12px] text-[#303b4d] outline-none focus:border-[#278fee] disabled:bg-[#f7f8fa]"><option value="使用中">使用中</option><option value="停止使用">停止使用</option></select></label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#edf0f4] px-6 py-4">{isDetail ? <button type="button" onClick={onClose} className="h-9 rounded-[3px] border border-[#dfe3ea] px-5 text-[12px] text-[#667285]">关闭</button> : <><button type="button" onClick={onClose} className="h-9 rounded-[3px] border border-[#dfe3ea] px-5 text-[12px] text-[#667285]">取消</button><button type="button" onClick={() => onSave({ ...form, id: mode === 'create' ? Date.now() : form.id, createdAt: mode === 'create' ? '2026-10-22 10:00:00' : form.createdAt })} className="h-9 rounded-[3px] bg-[#278fee] px-5 text-[12px] text-white hover:bg-[#167fdc]">保存</button></>}</div>
      </div>
    </div>
  );
}

function DetailEditModal({ row, mode = 'edit', onClose, onSave }: { row: PackageDetailRow; mode?: 'edit' | 'create'; onClose: () => void; onSave: (values: DetailEditValues) => void }) {
  const isCreate = mode === 'create';
  const [pointsError, setPointsError] = useState('');
  const initialDuration = isCreate ? getDefaultMemberDurationDays(row.member) : String(row.duration);
  const memberPoints = row.points == null ? getMemberPointsConfigForDuration(row.member, initialDuration) : isLifetimeDuration(row.duration) ? { ...row, pointsCycle: '一次性' as const } : row;
  const [form, setForm] = useState<DetailEditValues>({
    id: row.id,
    name: row.name,
    displayName: row.displayName,
    saleDescription: isCreate ? '' : '限时加赠1年~低至￥0.54元/人',
    member: row.member,
    packageType: row.packageType,
    duration: initialDuration,
    originalPrice: isCreate ? '' : String(row.originalPrice),
    discount: isCreate ? '' : String(row.discount),
    currentPrice: isCreate ? '' : String(row.currentPrice),
    dailyPrice: isCreate ? '' : '0.54',
    yearlyPrice: isCreate ? '' : '789',
    maxMembers: isCreate ? '' : '2',
    productId: '',
    downloadCount: isCreate ? '' : '-1',
    points: isCreate ? '' : memberPoints?.points == null ? '' : String(memberPoints.points),
    pointsUnit: memberPoints?.pointsUnit ?? '每人',
    pointsCycle: memberPoints?.pointsCycle ?? '按月',
    sort: String(row.sort),
    segment: isCreate ? '0' : row.segment === '/' ? '0' : row.segment,
    validDays: '',
    remark: '',
  });
  const update = (key: keyof DetailEditValues, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const handleMemberChange = (member: string) => {
    const memberDuration = getDefaultMemberDurationDays(member);
    const isHistorical = isHistoricalMemberType(member);
    setForm((current) => ({
      ...current,
      member,
      duration: isHistorical ? memberDuration || (isLifetimeDuration(current.duration) ? '' : current.duration) : '',
      points: isHistorical && getMemberPointsConfigForDuration(member, memberDuration)?.points != null ? String(getMemberPointsConfigForDuration(member, memberDuration)?.points) : '',
      pointsUnit: getMemberPointsConfigForDuration(member, memberDuration)?.pointsUnit ?? '每人',
      pointsCycle: getMemberPointsConfigForDuration(member, memberDuration)?.pointsCycle ?? '按月',
    }));
  };
  const handleDurationChange = (duration: string) => {
    setForm((current) => ({ ...current, duration, pointsCycle: isLifetimeDuration(duration) ? '一次性' : current.pointsCycle }));
  };
  const historicalMemberSelected = isHistoricalMemberType(form.member);
  const submit = () => {
    if (isCreate && !isHistoricalMemberType(form.member) && !form.points.trim()) {
      setPointsError('请输入积分量');
      return;
    }
    setPointsError('');
    onSave(form);
  };
  const inputClass = 'h-8 w-full rounded-[1px] border border-[#d7d7d7] bg-white px-3 text-[13px] text-[#333] outline-none focus:border-[#278fee] disabled:bg-[#f5f5f5] disabled:text-[#bcbcbc]';
  const disabledClass = `${inputClass} cursor-not-allowed`;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/45 p-[9px]">
      <div className="mx-auto flex min-h-[calc(100vh-18px)] w-full max-w-[1020px] flex-col bg-white shadow-[0_8px_28px_rgba(0,0,0,.28)]">
        <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-[#e8e8e8] px-6"><h2 className="flex items-center gap-2 text-[16px] font-medium text-[#222]"><span>{isCreate ? '新增套餐' : '编辑套餐'}</span><RequirementHint text={POINTS_REQUIREMENT} requirementName={POINTS_REQUIREMENT_NAME} sections={POINTS_REQUIREMENT_SECTIONS} /></h2><button type="button" onClick={onClose} className="text-[22px] leading-none text-[#999] hover:text-[#333]" aria-label="关闭">×</button></div>
        <div className="flex-1 overflow-y-auto px-6 py-6"><div className="mx-auto w-full max-w-[720px]">
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>名称：</span><input value={form.name} onChange={(event) => update('name', event.currentTarget.value)} placeholder={isCreate ? '请输入名称' : undefined} className={`${inputClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>显示名称：</span><input disabled={!isCreate} value={form.displayName} onChange={(event) => update('displayName', event.currentTarget.value)} placeholder={isCreate ? '请输入显示名称' : undefined} className={`${isCreate ? inputClass : disabledClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>售卖描述：</span><input value={form.saleDescription} onChange={(event) => update('saleDescription', event.currentTarget.value)} placeholder={isCreate ? '请输入售卖描述' : undefined} className={`${inputClass} placeholder:text-[#c8c8c8]`} /></label>
          <div className="relative mb-6"><div className="absolute -right-[54px] -top-2 z-10"><RequirementHint text={MEMBER_TYPE_REQUIREMENT} requirementName={MEMBER_TYPE_REQUIREMENT_NAME} sections={MEMBER_TYPE_REQUIREMENT_SECTIONS} /></div><div className="rounded-[8px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-3 py-3"><label className="grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>所属会员：</span><MemberTypeDropdown value={form.member} onChange={handleMemberChange} disabled={!isCreate} className="w-full" /></label></div></div>
          <div className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐类型：</span><div className={`flex items-center gap-5 text-[13px] ${isCreate ? 'text-[#333]' : 'text-[#c1c1c1]'}`}><label className="flex items-center gap-2"><input type="radio" checked={form.packageType === '普通套餐'} onChange={() => update('packageType', '普通套餐')} disabled={!isCreate} />普通套餐</label><label className="flex items-center gap-2"><input type="radio" checked={form.packageType === '订阅套餐'} onChange={() => update('packageType', '订阅套餐')} disabled={!isCreate} />订阅套餐</label><label className="flex items-center gap-2"><input type="radio" checked={form.packageType === '低价试用且订阅套餐'} onChange={() => update('packageType', '低价试用且订阅套餐')} disabled={!isCreate} />低价试用且订阅套餐</label><span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#c7c7c7] text-[10px] font-bold text-white">?</span></div></div>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐时长(天)：</span><input disabled={!isCreate} value={form.duration} onChange={(event) => handleDurationChange(event.currentTarget.value)} placeholder={isCreate ? '请输入套餐时长(天)' : undefined} className={`${isCreate ? inputClass : disabledClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐价格原价（元）：</span><input disabled={!isCreate} value={form.originalPrice} onChange={(event) => update('originalPrice', event.currentTarget.value)} placeholder={isCreate ? '请输入套餐价格原价（元）' : undefined} className={`${isCreate ? inputClass : disabledClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐折扣率：</span><input value={form.discount} onChange={(event) => update('discount', event.currentTarget.value)} placeholder={isCreate ? '只能输入1-100的正整数' : undefined} className={`${inputClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐现价（元）：</span><input disabled={!isCreate} value={form.currentPrice} onChange={(event) => update('currentPrice', event.currentTarget.value)} placeholder={isCreate ? '请输入套餐现价（元）' : undefined} className={`${isCreate ? inputClass : disabledClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>日费用/成员（元）：</span><input disabled={!isCreate} value={form.dailyPrice} onChange={(event) => update('dailyPrice', event.currentTarget.value)} placeholder={isCreate ? '请输入日费用/成员（元）' : undefined} className={`${isCreate ? inputClass : disabledClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>年费用/成员（元）：</span><input disabled={!isCreate} value={form.yearlyPrice} onChange={(event) => update('yearlyPrice', event.currentTarget.value)} placeholder={isCreate ? '请输入年费用/成员（元）' : undefined} className={`${isCreate ? inputClass : disabledClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>最大成员数量：</span><input disabled={!isCreate} value={form.maxMembers} onChange={(event) => update('maxMembers', event.currentTarget.value)} placeholder={isCreate ? '请输入最大成员数量' : undefined} className={`${isCreate ? inputClass : disabledClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right">内购产品ID：</span><input value={form.productId} onChange={(event) => update('productId', event.currentTarget.value)} placeholder="请输入内购产品ID" className={`${inputClass} placeholder:text-[#c8c8c8]`} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>商用下载次数：</span><input disabled={!isCreate} value={form.downloadCount} onChange={(event) => update('downloadCount', event.currentTarget.value)} placeholder={isCreate ? '请输入商用下载次数' : undefined} className={`${isCreate ? inputClass : disabledClass} placeholder:text-[#c8c8c8]`} /></label>
          <div className="relative mb-6"><div className="absolute -right-[54px] -top-2 z-10"><RequirementHint text={POINTS_REQUIREMENT} requirementName={POINTS_REQUIREMENT_NAME} sections={POINTS_REQUIREMENT_SECTIONS} /></div><div className="rounded-[8px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-3 pb-2 pt-3"><label className="grid grid-cols-[150px_1fr] items-start gap-2 text-[13px] text-[#333]"><span className="flex items-center justify-end gap-1 pt-2 text-right">{!historicalMemberSelected ? <b className="mr-1 font-normal text-[#ff4d4f]">*</b> : null}积分量：</span><div><div className="flex items-center gap-2"><input type="number" min="0" step="1" required={isCreate && !historicalMemberSelected} disabled={!isCreate || historicalMemberSelected} value={form.points} onChange={(event) => { setPointsError(''); update('points', event.currentTarget.value.replace(/\D/g, '')); }} placeholder={isCreate && !historicalMemberSelected ? '请输入积分量' : undefined} className={`${isCreate && !historicalMemberSelected ? inputClass : disabledClass} min-w-0 flex-1 placeholder:text-[#c8c8c8]`} style={{ flex: '1 1 0%', width: 'auto' }} /><select aria-label="发放单位" disabled={!isCreate || historicalMemberSelected} value={form.pointsUnit} onChange={(event) => update('pointsUnit', event.currentTarget.value)} className={`${isCreate && !historicalMemberSelected ? inputClass : disabledClass} flex-none bg-white`} style={{ flex: '0 0 96px', width: '96px' }}><option value="每人">每人</option><option value="团队">团队</option></select><select aria-label="周期" disabled={!isCreate || historicalMemberSelected || isLifetimeDuration(form.duration)} value={form.pointsCycle} onChange={(event) => update('pointsCycle', event.currentTarget.value)} className={`${isCreate && !historicalMemberSelected && !isLifetimeDuration(form.duration) ? inputClass : disabledClass} flex-none bg-white`} style={{ flex: '0 0 96px', width: '96px' }}><option value="按月">按月</option><option value="一次性">一次性</option></select></div>{pointsError ? <p className="mt-1 text-[12px] text-[#ff4d4f]">{pointsError}</p> : null}<p className="mt-1 text-[12px] leading-5 text-[#8a94a3]">{historicalMemberSelected ? POINTS_HISTORY_HELPER_TEXT : POINTS_PURCHASE_HELPER_TEXT}</p></div></label></div></div>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right"><b className="mr-1 font-normal text-[#ff4d4f]">*</b>排序：</span><input value={form.sort} onChange={(event) => update('sort', event.currentTarget.value)} className={inputClass} /></label>
          <label className="mb-6 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right">指定分群：</span><select value={form.segment} onChange={(event) => update('segment', event.currentTarget.value)} className={inputClass}><option value="0">0</option><option value="109">109</option><option value="110">110</option></select></label>
          <label className="mb-1 grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right">有效期：</span><input value={form.validDays} onChange={(event) => update('validDays', event.currentTarget.value)} className="h-8 w-[90px] rounded-[1px] border border-[#d7d7d7] px-3 text-[13px] outline-none focus:border-[#278fee]" /></label>
          <div className="mb-2 ml-[158px] text-[13px] leading-6 text-[#555]">用户注册后的小时数，可输入1~9999的整数</div><div className="mb-1 ml-[158px] text-[13px] leading-5 text-[#ff4d4f]">仅在套餐显示状态下，有效期才会生效，剩余时间小于48小时前端显示倒计时</div>
          <label className="grid grid-cols-[150px_1fr] items-center gap-2 text-[13px] text-[#333]"><span className="text-right">备注：</span><input value={form.remark} onChange={(event) => update('remark', event.currentTarget.value)} placeholder="添加备注" className={`${inputClass} placeholder:text-[#c8c8c8]`} /></label>
        </div></div>
        <div className="flex h-[54px] shrink-0 items-center justify-end gap-2 border-t border-[#e8e8e8] px-4"><button type="button" onClick={onClose} className="h-8 rounded-[2px] border border-[#d8d8d8] bg-white px-4 text-[13px] text-[#555] hover:border-[#278fee] hover:text-[#278fee]">取消</button><button type="button" onClick={submit} className="h-8 rounded-[2px] bg-[#278fee] px-5 text-[13px] text-white hover:bg-[#167fdc]">生成</button></div>
      </div>
    </div>
  );
}

function MembershipPackageDetailPage({ packageName, onBack, onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPageConfig, onNavigateToRequirement }: { packageName: string; onBack: () => void; onBackToDirectory: () => void; onNavigateToSkillConfig?: () => void; onNavigateToGuidedSearch?: () => void; onNavigateToMembershipPageConfig?: () => void; onNavigateToRequirement?: (path: string) => void }) {
  const [details, setDetails] = useState(initialPackageDetails);
  const [nameQuery, setNameQuery] = useState('');
  const [memberType, setMemberType] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [submittedMemberType, setSubmittedMemberType] = useState('');
  const [detailEditor, setDetailEditor] = useState<{ mode: 'edit' | 'create'; row: PackageDetailRow } | null>(null);
  const filteredDetails = useMemo(() => details.filter((row) => (!submittedName.trim() || row.name.includes(submittedName.trim())) && (!submittedMemberType || row.member === submittedMemberType)), [details, submittedMemberType, submittedName]);

  const toggleDisplay = (id: number) => setDetails((current) => current.map((row) => row.id === id ? { ...row, status: row.status === '显示' ? '隐藏' : '显示' } : row));
  const saveDetail = (values: DetailEditValues) => {
    setDetails((current) => {
      if (values.id === 0) {
        const nextId = Math.max(...current.map((row) => row.id), 0) + 1;
        return [{ id: nextId, name: values.name || '新套餐', displayName: values.displayName || '-', duration: Number(values.duration) || 0, originalPrice: Number(values.originalPrice) || 0, discount: Number(values.discount) || 0, currentPrice: Number(values.currentPrice) || 0, contractPrice: '-', packageType: values.packageType || '普通套餐', member: values.member || '未选择', sort: Number(values.sort) || 0, trialDays: 0, segment: values.segment || '/', displayTime: '/', status: '显示', points: isHistoricalMemberType(values.member) ? undefined : Number(values.points) || 0, pointsUnit: values.pointsUnit === '团队' ? '团队' : '每人', pointsCycle: values.pointsCycle === '一次性' ? '一次性' : '按月' }, ...current];
      }
      return current.map((row) => row.id === values.id ? { ...row, name: values.name, discount: Number(values.discount) || row.discount, sort: Number(values.sort) || 0, segment: values.segment || '/' } : row);
    });
    setDetailEditor(null);
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员套餐管理" onNavigateToRequirement={onNavigateToRequirement} onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员页面配置') onNavigateToMembershipPageConfig?.(); }} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-[25px] pt-[25px]"><div className="flex items-center gap-2 text-[13px] text-[#8b9199]"><button type="button" onClick={onBack} className="hover:text-[#278fee]">会员套餐管理</button><RequirementEntryDot /><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#2d2d2d]">{packageName}</span></div>
          <section className="mt-[25px] min-h-[calc(100vh-130px)] bg-white px-[25px] pb-8">
            <div className="flex items-center justify-end gap-5 border-b border-[#f0f0f0] py-4"><button type="button" className="h-[33px] rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]">推荐套餐配置</button><input value={nameQuery} onChange={(event) => setNameQuery(event.currentTarget.value)} placeholder="名称" className="h-[33px] w-[240px] rounded-[2px] border border-[#d9d9d9] px-3 text-[12px] outline-none focus:border-[#278fee]" /><div className="flex items-center gap-1"><MemberTypeDropdown value={memberType} onChange={setMemberType} /><RequirementEntryDot /></div><button type="button" onClick={() => { setSubmittedName(nameQuery); setSubmittedMemberType(memberType); }} className="h-[33px] rounded-[2px] bg-[#278fee] px-5 text-[12px] text-white hover:bg-[#167fdc]">查询</button><button type="button" onClick={() => setDetailEditor({ mode: 'create', row: blankPackageDetail })} className="inline-flex h-[33px] items-center gap-2 rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]"><span>＋ 新增套餐</span><RequirementEntryDot /></button><button type="button" onClick={() => setDetails((current) => [...current])} className="h-[33px] rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]">刷新缓存</button></div>
          <div className="mt-[23px] overflow-x-auto pt-5"><table className="w-full min-w-[1420px] table-fixed border-collapse text-center text-[13px]"><colgroup><col className="w-[5%]" /><col className="w-[13%]" /><col className="w-[8%]" /><col className="w-[6%]" /><col className="w-[6%]" /><col className="w-[7%]" /><col className="w-[6%]" /><col className="w-[7%]" /><col className="w-[7%]" /><col className="w-[8%]" /><col className="w-[5%]" /><col className="w-[6%]" /><col className="w-[10%]" /><col className="w-[6%]" /><col className="w-[6%]" /><col className="w-[5%]" /><col className="w-[11%]" /></colgroup><thead className="h-[76px] bg-[#fafafa] text-[#222]"><tr>{['ID', '名称', '显示名称', '时长\n(天)', '原价', '套餐折\n扣率', '现价', '签约价\n格', '套餐\n类型', '所属会员', '排\n序', '试用\n天数', '积分量', '显示分\n群', '显示\n时间', '状\n态', '操作'].map((label) => <th key={label} className={`relative whitespace-pre-line px-2 font-normal leading-5 ${label === '积分量' ? 'border-x border-t border-dashed border-[#ff665b] bg-[#fff7f5]' : ''}`}>{label === '积分量' ? <><div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"><RequirementHint text={POINTS_REQUIREMENT} /></div><span>积分量</span></> : label}</th>)}</tr></thead><tbody>{filteredDetails.map((row, rowIndex) => <tr key={row.id} className="h-[97px] border-b border-[#ededed] text-[#3b3b3b] hover:bg-[#fcfdff]"><td className="px-2">{row.id}</td><td className="px-2 leading-5">{row.name}</td><td className="px-2 leading-5">{row.displayName}</td><td className="px-2">{row.duration}</td><td className="px-2">{row.originalPrice}</td><td className="px-2">{row.discount}</td><td className="px-2">{row.currentPrice}</td><td className="px-2">{row.contractPrice}</td><td className="px-2 leading-5">{row.packageType}</td><td className="px-2 leading-5">{row.member}</td><td className="px-2">{row.sort}</td><td className="px-2">{row.trialDays}</td><td className={`border-x border-dashed border-[#ff665b] bg-[#fff7f5] px-2 whitespace-nowrap ${rowIndex === filteredDetails.length - 1 ? 'border-b' : ''}`}>{row.points == null ? getPackagePointsDisplay(row.member, row.duration) : formatPointsDisplay(row.points, row.pointsUnit, isLifetimeDuration(row.duration) ? '一次性' : row.pointsCycle)}</td><td className="px-2">{row.segment}</td><td className="px-2">{row.displayTime}</td><td className="px-2 leading-5">{row.status}</td><td className="px-2"><div className="flex flex-wrap items-center justify-center gap-2"><button type="button" onClick={() => setDetailEditor({ mode: 'edit', row })} className="h-[33px] rounded-[2px] border border-[#d8dce1] bg-white px-4 text-[12px] text-[#333] hover:border-[#278fee] hover:text-[#278fee]">编辑</button><button type="button" onClick={() => toggleDisplay(row.id)} className={`h-[33px] rounded-[2px] px-4 text-[12px] text-white ${row.status === '显示' ? 'bg-[#ff4b55] hover:bg-[#ed3b45]' : 'bg-[#278fee] hover:bg-[#167fdc]'}`}>{row.status === '显示' ? '隐藏' : '显示'}</button><button type="button" className="h-[33px] rounded-[2px] bg-[#ff4b55] px-4 text-[12px] text-white hover:bg-[#ed3b45]">关闭</button></div></td></tr>)}</tbody></table>{filteredDetails.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无匹配的套餐</div> : null}</div>
          </section>
        </div>
      </main>
      {detailEditor ? <DetailEditModal mode={detailEditor.mode} row={detailEditor.row} onClose={() => setDetailEditor(null)} onSave={saveDetail} /> : null}
    </div>
  );
}

export function MembershipPackagePage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPageConfig, onNavigateToRequirement }: { onBackToDirectory: () => void; onNavigateToSkillConfig?: () => void; onNavigateToGuidedSearch?: () => void; onNavigateToMembershipPageConfig?: () => void; onNavigateToRequirement?: (path: string) => void }) {
  const [packages, setPackages] = useState(initialPackages);
  const [nameQuery, setNameQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [modal, setModal] = useState<{ mode: 'detail' | 'edit' | 'create'; row: PackageRow } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageRow | null>(null);
  const [notice, setNotice] = useState('');
  const filteredPackages = useMemo(() => packages.filter((row) => !submittedQuery.trim() || row.name.includes(submittedQuery.trim())), [packages, submittedQuery]);

  const savePackage = (row: PackageRow) => {
    setPackages((current) => row.id && current.some((item) => item.id === row.id) ? current.map((item) => item.id === row.id ? row : item) : [row, ...current]);
    setModal(null);
  };

  const openPackageDetail = (row: PackageRow) => {
    if (CONFIGURED_PACKAGE_IDS.has(row.id)) {
      setSelectedPackage(row);
      return;
    }
    setNotice('暂未配置数据');
    window.setTimeout(() => setNotice(''), 1800);
  };

  if (selectedPackage) {
    return <MembershipPackageDetailPage packageName={selectedPackage.id === 32 ? 'web端-新成' : selectedPackage.name} onBack={() => setSelectedPackage(null)} onBackToDirectory={onBackToDirectory} onNavigateToSkillConfig={onNavigateToSkillConfig} onNavigateToGuidedSearch={onNavigateToGuidedSearch} onNavigateToMembershipPageConfig={onNavigateToMembershipPageConfig} onNavigateToRequirement={onNavigateToRequirement} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员套餐管理" onNavigateToRequirement={onNavigateToRequirement} onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员页面配置') onNavigateToMembershipPageConfig?.(); }} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <section className="mx-[27px] mt-[27px] min-h-[calc(100vh-89px)] bg-white">
          <header className="flex h-[65px] items-center justify-between border-b border-[#ededed] px-[25px]"><h1 className="text-[16px] font-medium text-[#252525]">会员套餐管理</h1><button type="button" onClick={() => setModal({ mode: 'create', row: { id: 0, name: '', description: '', packageCode: '', creator: '赵文文', createdAt: '', status: '使用中' } })} className="inline-flex h-[33px] items-center gap-1.5 rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]"><Plus className="h-4 w-4" />新增套餐组</button></header>
          <div className="px-[25px] pb-8 pt-6">
            <form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(nameQuery); }} className="flex items-center"><input value={nameQuery} onChange={(event) => setNameQuery(event.currentTarget.value)} placeholder="名称" className="h-[32px] w-[335px] rounded-l-[2px] border border-[#d9d9d9] px-3 text-[12px] text-[#333] outline-none focus:border-[#278fee]" /><button type="submit" className="inline-flex h-[32px] w-[65px] items-center justify-center gap-1 rounded-r-[2px] bg-[#278fee] text-[12px] text-white hover:bg-[#167fdc]"><Search className="h-3.5 w-3.5" />搜索</button></form>
            <div className="mt-[30px] overflow-x-auto"><table className="w-full min-w-[1180px] table-fixed border-collapse text-left text-[13px]"><colgroup><col className="w-[7%]" /><col className="w-[18%]" /><col className="w-[18%]" /><col className="w-[12%]" /><col className="w-[11%]" /><col className="w-[16%]" /><col className="w-[10%]" /><col className="w-[18%]" /></colgroup><thead className="h-[54px] bg-[#fafafa] text-[#222]"><tr>{['ID', '名称', '描述', '套餐标识', '创建人', '创建时间', '状态', '操作'].map((label) => <th key={label} className="px-6 font-normal">{label}</th>)}</tr></thead><tbody>{filteredPackages.map((row) => <tr key={row.id} className={`h-[65px] border-b border-[#ededed] text-[#3b3b3b] ${CONFIGURED_PACKAGE_IDS.has(row.id) ? 'bg-[#effaf3] hover:bg-[#e5f6eb]' : 'hover:bg-[#fcfdff]'}`}><td className="px-6">{row.id}</td><td className="px-6">{row.name}</td><td className="px-6">{row.description}</td><td className="px-6">{row.packageCode}</td><td className="px-6">{row.creator}</td><td className="px-6 whitespace-nowrap">{row.createdAt}</td><td className="px-6">{row.status}</td><td className="px-6"><div className="flex items-center gap-3 whitespace-nowrap"><button type="button" onClick={() => openPackageDetail(row)} className="inline-flex h-[33px] items-center gap-1.5 rounded-[2px] border border-[#d9dfe6] bg-white px-4 text-[12px] text-[#444] hover:border-[#278fee] hover:text-[#278fee]"><Eye className="h-3.5 w-3.5" /><span>套餐详情</span><RequirementEntryDot /></button><button type="button" onClick={() => setModal({ mode: 'edit', row })} className="inline-flex h-[33px] items-center gap-1 rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]"><Pencil className="h-3.5 w-3.5" />编辑套餐组</button></div></td></tr>)}</tbody></table>{filteredPackages.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无匹配的套餐组</div> : null}</div>
          </div>
        </section>
      </main>
      {notice ? <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center"><div className="rounded-[5px] border border-[#e2e6ec] bg-white px-6 py-3 text-[13px] text-[#4f5968] shadow-[0_8px_24px_rgba(38,52,74,.16)]">{notice}</div></div> : null}
      {modal ? <PackageModal mode={modal.mode} row={modal.row} onClose={() => setModal(null)} onSave={savePackage} /> : null}
    </div>
  );
}
