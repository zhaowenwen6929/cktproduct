import { useEffect, useLayoutEffect, useRef, useState, type Ref } from 'react';
import { Check, ChevronDown, Image as ImageIcon, QrCode, Sparkles, Ticket, Video, X } from 'lucide-react';
import { REAL_MEMBERSHIP_PLAN_DATA, type MembershipPlanData } from './membershipPlanData';
import { readMembershipPageConfig, type MembershipBenefitItem, type MembershipCommercialLicenseConfig, type MembershipComparisonConfig, type MembershipCycleConfig, type MembershipModelConsumptionConfig, type MembershipPageContent, type MembershipPlanDisplayConfig } from './membershipPageConfig';
import { readWebMembershipPackageDetails, type PackageDetailRow } from './MembershipPackagePage';

type MembershipCenterModalProps = {
  onClose: () => void;
  currentMember?: {
    memberLevel?: number | null;
    memberName?: string;
    validUntil?: string | null;
    remainingPoints?: number | string | null;
    teamMemberCount?: number | null;
    purchasedSeats?: number | null;
  };
};

type MembershipPurchaseAction = {
  kind: 'open' | 'renew' | 'upgrade' | 'downgrade';
  buttonText: string;
  helperText?: string;
};

const MEMBER_LEVEL_RANK_GROUPS: number[][] = [
  [4],
  [1, 125],
  [199, 4, 211, 230, 240],
  [241],
  [105, 9, 130, 200, 212, 231],
  [232],
  [233],
  [210],
  [201],
  [7, 8],
  [2, 5, 6, 100, 110, 115, 135, 202, 203, 205, 300, 310],
  [301, 311],
  [302, 312],
  [204],
  [3, 120, 220],
];

const MEMBER_LEVEL_RANK = new Map<number, number>(MEMBER_LEVEL_RANK_GROUPS.flatMap((levels, rank) => levels.map((level) => [level, rank])));

const MEMBER_NAME_BY_LEVEL: Record<number, string> = {
  240: '基础版（个人）',
  241: '专业版（个人）',
  310: '基础版（企业）',
  311: '专业版（企业）',
  220: '旗舰版（企业）',
};

type MembershipPreviewIdentity = {
  key: 'free' | 'personal-basic' | 'enterprise-professional';
  label: string;
  memberLevel: number | null;
  memberName: string;
  validUntil: string;
  remainingPoints: number;
  teamMemberCount: number;
  purchasedSeats: number | null;
  membershipType: 'personal' | 'enterprise';
};

const MEMBERSHIP_PREVIEW_IDENTITIES: MembershipPreviewIdentity[] = [
  { key: 'free', label: '免费版', memberLevel: null, memberName: '免费版', validUntil: '长期有效', remainingPoints: 66, teamMemberCount: 3, purchasedSeats: null, membershipType: 'personal' },
  { key: 'personal-basic', label: '基础版（个人）', memberLevel: 240, memberName: '基础版（个人）', validUntil: '2027-10-25', remainingPoints: 200, teamMemberCount: 1, purchasedSeats: null, membershipType: 'personal' },
  { key: 'enterprise-professional', label: '专业版（企业）3人', memberLevel: 311, memberName: '专业版（企业）', validUntil: '2027-10-25', remainingPoints: 1200, teamMemberCount: 3, purchasedSeats: 3, membershipType: 'enterprise' },
];

function getMemberLevelRank(level?: number | null) {
  return level == null ? -1 : MEMBER_LEVEL_RANK.get(level) ?? 0;
}

function getMembershipPurchaseAction(currentMemberLevel: number | null | undefined, targetMemberLevel: number | undefined, currentMemberName?: string): MembershipPurchaseAction {
  if (currentMemberLevel == null) return { kind: 'open', buttonText: '立即开通' };

  const currentRank = getMemberLevelRank(currentMemberLevel);
  const targetRank = getMemberLevelRank(targetMemberLevel);
  if (currentRank === targetRank) return { kind: 'renew', buttonText: '立即续费' };
  if (currentRank < targetRank) return { kind: 'upgrade', buttonText: '立即升级' };

  const memberName = currentMemberName || MEMBER_NAME_BY_LEVEL[currentMemberLevel] || '当前会员';
  return { kind: 'downgrade', buttonText: `请购买${memberName}及以上会员`, helperText: '无法降级购买低版本会员' };
}

type MembershipPlan = MembershipPlanDisplayConfig & MembershipPlanData;

type RetentionPurchaseModalProps = {
  cycleOptions: MembershipCycleConfig[];
  selectedCycle: number;
  activeCycleKey: string;
  plans: MembershipPlan[];
  selectedPlanIndex: number;
  onCycleChange: (index: number) => void;
  onPlanChange: (index: number) => void;
  onContinue: () => void;
  onClose: () => void;
};

type MembershipType = 'personal' | 'enterprise';
type WebPackageDetail = PackageDetailRow;

type MembershipCouponModalProps = {
  coupons: MembershipCoupon[];
  onClose: () => void;
};

type EnterprisePurchaseContactModalProps = {
  config: NonNullable<MembershipCommercialLicenseConfig['enterprisePurchaseContact']>;
  onClose: () => void;
};

type MembershipPaymentSelection = {
  plan: MembershipPlan;
  cycleKey: string;
  cycleName: string;
  tierIndex: number;
  enterprise: boolean;
  seats: number;
};

type MembershipPaymentModalProps = {
  selection: MembershipPaymentSelection;
  coupons: MembershipCoupon[];
  onClose: () => void;
};

type MembershipPointsPackage = {
  id: string;
  points: number;
  price: number;
  originalPrice: number;
  outputText: string;
  tag?: string;
};

type MembershipPointsPurchaseModalProps = {
  onClose: () => void;
};

export type MembershipCoupon = {
  id?: string;
  amount: number;
  available?: boolean;
  expiresAt?: string;
  memberLevel?: number;
  durationDays?: number;
  packageType?: string;
};

export const MEMBERSHIP_AVAILABLE_COUPON_STORAGE_KEY = 'membership-available-coupon';
const DEMO_MEMBERSHIP_COUPON: MembershipCoupon = {
  id: 'demo-basic-yearly-coupon',
  amount: 20,
  available: true,
  memberLevel: 240,
  durationDays: 365,
  packageType: '普通套餐',
};

const DEMO_ENTERPRISE_PROFESSIONAL_COUPON: MembershipCoupon = {
  id: 'demo-enterprise-professional-coupon',
  amount: 30,
  available: true,
  memberLevel: 311,
  durationDays: 90,
  packageType: '普通套餐',
};

const DEMO_MEMBERSHIP_COUPONS = [DEMO_MEMBERSHIP_COUPON, DEMO_ENTERPRISE_PROFESSIONAL_COUPON];

function normalizeMembershipCoupon(item: unknown): MembershipCoupon | null {
  if (!item || typeof item !== 'object') return null;

  const record = item as Record<string, unknown>;
  const amount = Number(record.amount ?? record.discountAmount ?? record.couponAmount ?? record.value);
  if (!Number.isFinite(amount) || amount <= 0 || record.available === false) return null;
  if (typeof record.status === 'string' && ['已使用', '已失效', '已过期', '不可用'].includes(record.status)) return null;
  if (typeof record.expiresAt === 'string' && Number.isFinite(Date.parse(record.expiresAt)) && Date.parse(record.expiresAt) <= Date.now()) return null;

  return {
    id: typeof record.id === 'string' ? record.id : undefined,
    amount: Math.round(amount * 100) / 100,
    available: true,
    expiresAt: typeof record.expiresAt === 'string' ? record.expiresAt : undefined,
    memberLevel: typeof record.memberLevel === 'number' ? record.memberLevel : undefined,
    durationDays: typeof record.durationDays === 'number' ? record.durationDays : undefined,
    packageType: typeof record.packageType === 'string' ? record.packageType : undefined,
  };
}

function readAvailableMembershipCoupons(): MembershipCoupon[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedValue = window.localStorage.getItem(MEMBERSHIP_AVAILABLE_COUPON_STORAGE_KEY);
    if (storedValue == null) return DEMO_MEMBERSHIP_COUPONS;
    const stored = JSON.parse(storedValue) as unknown;
    const candidates = Array.isArray(stored) ? stored : [stored];
    return candidates.map(normalizeMembershipCoupon).filter((coupon): coupon is MembershipCoupon => coupon != null);
  } catch {
    return [];
  }
}

function MembershipCouponModal({ coupons, onClose }: MembershipCouponModalProps) {
  const [activeTab, setActiveTab] = useState<'coupon' | 'code'>('coupon');
  const [couponCode, setCouponCode] = useState('');
  const [codeMessage, setCodeMessage] = useState('');

  const submitCouponCode = () => {
    if (!couponCode.trim()) {
      setCodeMessage('请输入优惠码');
      return;
    }
    setCodeMessage('优惠码已提交，请以实际校验结果为准');
  };

  return <div className="fixed inset-0 z-[130] flex items-start justify-center bg-[#344054]/55 p-5 pt-5 backdrop-blur-[4px] sm:p-8">
    <div className="relative mt-0 h-[min(62vh,600px)] w-full max-w-[720px] overflow-visible rounded-[12px] bg-white shadow-[0_20px_70px_rgba(15,23,42,.28)]">
      <button type="button" onClick={onClose} aria-label="关闭优惠券弹框" className="absolute right-[-48px] top-0 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#5d6a80] shadow-[0_6px_18px_rgba(15,23,42,.08)] transition hover:text-[#263247] max-sm:right-2 max-sm:top-2 max-sm:h-10 max-sm:w-10"><X className="h-6 w-6 max-sm:h-5 max-sm:w-5" strokeWidth={1.7} /></button>
      <header className="flex h-[68px] items-end border-b border-[#edf0f4] px-6 sm:px-10">
        <div className="flex h-full items-end gap-12">
          <button type="button" onClick={() => { setActiveTab('coupon'); setCodeMessage(''); }} className={`relative h-[54px] px-1 text-[20px] leading-[54px] transition ${activeTab === 'coupon' ? 'font-semibold text-[#111827]' : 'text-[#737373]'}`}><span>优惠券</span>{activeTab === 'coupon' ? <span className="absolute inset-x-[-6px] bottom-0 h-1 rounded-full bg-[#1677ff] shadow-[0_2px_10px_rgba(22,119,255,.3)]" /> : null}</button>
          <button type="button" onClick={() => { setActiveTab('code'); setCodeMessage(''); }} className={`relative h-[54px] px-1 text-[20px] leading-[54px] transition ${activeTab === 'code' ? 'font-semibold text-[#111827]' : 'text-[#737373]'}`}><span>优惠码</span>{activeTab === 'code' ? <span className="absolute inset-x-[-6px] bottom-0 h-1 rounded-full bg-[#1677ff] shadow-[0_2px_10px_rgba(22,119,255,.3)]" /> : null}</button>
        </div>
      </header>
      {activeTab === 'coupon' ? <div className="flex h-[calc(100%-68px)] items-center justify-center px-5">
        {coupons.length ? <div className="w-full max-w-[420px] space-y-3">{coupons.map((coupon) => <div key={coupon.id ?? `${coupon.amount}-${coupon.memberLevel ?? 'all'}`} className="rounded-[10px] border border-[#e6ebf2] bg-[#f8fafc] px-6 py-5 shadow-[0_5px_18px_rgba(38,53,79,.05)]"><div className="flex items-center justify-between"><div><div className="text-[17px] font-semibold text-[#253147]">优惠券</div><div className="mt-1.5 text-[11px] text-[#8792a3]">可用于符合条件的会员套餐</div></div><div className="text-right"><div className="text-[22px] font-semibold text-[#f04444]">¥{formatMoney(coupon.amount)}</div><div className="text-[10px] text-[#9aa5b5]">优惠金额</div></div></div></div>)}</div> : <div className="flex flex-col items-center pb-8 text-center"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#fafafa] text-[#e1e4e8]"><div className="relative flex h-16 w-16 items-center justify-center rounded-[8px] bg-[#eeeeee]/80"><Ticket className="h-9 w-9 rotate-[-8deg]" strokeWidth={1.5} /><span className="absolute bottom-1 text-[12px] font-medium">¥88</span></div></div><p className="mt-4 text-[16px] text-[#666]">你暂时无可用优惠券</p></div>}
      </div> : <div className="px-6 pt-12 sm:px-10"><div className="flex max-w-[540px] items-center gap-3"><label htmlFor="membership-coupon-code" className="shrink-0 text-[16px] text-[#333]">输入优惠码:</label><input id="membership-coupon-code" value={couponCode} onChange={(event) => { setCouponCode(event.currentTarget.value); setCodeMessage(''); }} placeholder="输入优惠码" className="h-[52px] w-[230px] rounded-[6px] border border-[#d9d9d9] px-4 text-[16px] text-[#333] outline-none transition focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10 placeholder:text-[#999]" /></div><div className="mt-10 flex items-center gap-8 pl-[152px]"><button type="button" onClick={submitCouponCode} className="h-[54px] w-[140px] rounded-[6px] bg-[#1677ff] text-[17px] font-semibold text-white shadow-[0_6px_16px_rgba(22,119,255,.2)] transition hover:bg-[#086be9]">确定</button><button type="button" onClick={onClose} className="h-[54px] w-[140px] rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] text-[17px] font-semibold text-[#666] transition hover:bg-[#f2f4f7]">取消</button></div>{codeMessage ? <p className={`mt-3 pl-[152px] text-[12px] ${codeMessage === '请输入优惠码' ? 'text-[#f04444]' : 'text-[#7a8798]'}`}>{codeMessage}</p> : null}</div>}
    </div>
  </div>;
}

function EnterprisePurchaseContactModal({ config, onClose }: EnterprisePurchaseContactModalProps) {
  return <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#253149]/60 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label={config.title}>
    <div className="relative w-full max-w-[420px] overflow-hidden rounded-[18px] bg-[#f4f7ff] px-7 pb-7 pt-8 shadow-[0_24px_80px_rgba(15,23,42,.3)]">
      <button type="button" onClick={onClose} aria-label="关闭多人采购优惠弹框" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#66728a] transition hover:bg-white hover:text-[#202938]"><X className="h-4 w-4" /></button>
      <h2 className="text-center text-[22px] font-medium text-[#273143]">{config.title}</h2>
      <div className="mx-auto mt-5 w-fit rounded-[12px] border border-[#e5eaf2] bg-white p-4 shadow-[0_5px_18px_rgba(38,53,79,.06)]">
        {config.imageUrl ? <img src={config.imageUrl} alt="多人采购优惠二维码" className="h-[180px] w-[180px] rounded-[4px] object-cover" /> : <div className="flex h-[180px] w-[180px] items-center justify-center rounded-[4px] bg-[#f5f7fb] text-[#273143]"><QrCode className="h-[145px] w-[145px]" strokeWidth={1.35} /></div>}
        <div className="mt-3 text-center text-[12px] text-[#8190aa]"><span>{config.qrLabel}</span><span className="ml-2 text-[#ff4d5f]">{config.qrActionLabel}</span></div>
      </div>
      <ul className="mx-auto mt-6 max-w-[320px] space-y-4">
        {config.benefits.map((benefit) => <li key={benefit} className="flex items-start gap-3 text-[14px] leading-5 text-[#29364d]"><span className="mt-1 text-[#f39a5a]">✓</span><span>{benefit}</span></li>)}
      </ul>
    </div>
  </div>;
}

function PaymentQrCode() {
  const size = 29;
  const cells = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    const inFinder = (startRow: number, startColumn: number) => row >= startRow && row < startRow + 7 && column >= startColumn && column < startColumn + 7;
    const finderCell = (startRow: number, startColumn: number) => {
      const localRow = row - startRow;
      const localColumn = column - startColumn;
      return localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6 || (localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4);
    };
    if (inFinder(0, 0)) return finderCell(0, 0);
    if (inFinder(0, size - 7)) return finderCell(0, size - 7);
    if (inFinder(size - 7, 0)) return finderCell(size - 7, 0);
    if ((row >= 8 && row <= 20 && column === 6) || (column >= 8 && column <= 20 && row === 6)) return (row + column) % 2 === 0;
    return ((row * 17 + column * 31 + row * column * 7) % 11) < 5;
  });

  return <div className="grid h-[180px] w-[180px] grid-cols-[repeat(29,minmax(0,1fr))] gap-0 rounded-[10px] bg-white p-2 shadow-[0_8px_22px_rgba(20,32,52,.12)]" aria-label="支付二维码">
    {cells.map((filled, index) => <span key={index} className={filled ? 'bg-[#111]' : 'bg-white'} />)}
  </div>;
}

function getPaymentPointsText(cycleData: ReturnType<typeof getCyclePlanData>, tierIndex: number) {
  const tier = cycleData.tierOptions?.[tierIndex] ?? cycleData.tierOptions?.[0];
  const points = tier?.points ?? cycleData.points;
  const normalized = points.replace(/\s*积分每月|\s*积分\/月|\s*积分/g, '').trim();
  return cycleData.pointsNote?.includes('一次性') ? `${normalized}积分` : `${normalized}积分/月`;
}

function PaymentMethodMark({ type }: { type: 'wechat' | 'alipay' }) {
  return <span className={`inline-flex h-5 w-5 items-center justify-center rounded-[4px] text-[12px] font-bold text-white ${type === 'wechat' ? 'bg-[#08bd68]' : 'bg-[#1677ff]'}`}>{type === 'wechat' ? '✓' : '支'}</span>;
}

function MembershipPaymentModal({ selection, coupons, onClose }: MembershipPaymentModalProps) {
  const cycleData = getCyclePlanData(selection.plan, selection.cycleKey);
  const activeTier = cycleData.tierOptions?.[selection.tierIndex] ?? cycleData.tierOptions?.[0];
  const displayPrice = activeTier?.price ?? cycleData.price;
  const durationDays = activeTier?.durationDays ?? cycleData.durationDays;
  const packageType = activeTier?.packageType ?? cycleData.packageType;
  const expiryDate = formatExpiryDate(durationDays);
  const coupon = getApplicableMembershipCoupon(displayPrice, coupons, { memberLevel: selection.plan.memberLevel, durationDays, packageType });
  const couponDiscount = getCouponDiscount(displayPrice, coupon, { memberLevel: selection.plan.memberLevel, durationDays, packageType });
  const unitPrice = Number(displayPrice.replace(/,/g, '')) || 0;
  const seatCount = selection.enterprise ? Math.max(1, selection.seats) : 1;
  const discountedUnitPrice = couponDiscount > 0 ? Math.max(0, unitPrice - couponDiscount) : unitPrice;
  const totalPrice = discountedUnitPrice * seatCount;
  const paymentTitle = selection.plan.memberType ?? `${selection.enterprise ? '企业版' : '个人版'}·${selection.plan.name}会员`;
  const paymentPoints = getPaymentPointsText(cycleData, selection.tierIndex);
  const couponExpiry = coupon?.expiresAt ? new Date(coupon.expiresAt).toLocaleTimeString('zh-CN', { hour12: false }) : '23:12:51';

  return <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#101827]/65 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label="会员支付">
    <div className="relative flex max-h-[calc(100vh-48px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_24px_70px_rgba(15,23,42,.32)]">
      <button type="button" onClick={onClose} aria-label="关闭支付弹框" className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center text-[#a0a9b6] transition hover:text-[#273143]"><X className="h-5 w-5" strokeWidth={1.7} /></button>
      <div className="overflow-y-auto px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-7">
        <h2 className="text-center text-[24px] font-semibold tracking-[-.04em] text-[#20242c]">{paymentTitle}</h2>
        <p className="mt-2.5 text-center text-[14px] text-[#8791a1]">{selection.cycleName}–{paymentPoints}</p>
        {couponDiscount > 0 ? <div className="mx-auto mt-5 flex w-full max-w-[360px] items-center gap-3 rounded-[11px] bg-[#fff3f0] px-4 py-3 text-[#ff493d]">
          <Ticket className="h-6 w-6 shrink-0 fill-[#ff6a5e] text-white" strokeWidth={1.4} />
          <div className="min-w-0 flex-1 text-[14px] font-semibold leading-5"><div>优惠券立减 {formatMoney(couponDiscount)}元</div><div>{couponExpiry} 后到期</div></div>
          <ChevronDown className="h-5 w-5 shrink-0 text-[#252a33]" />
        </div> : null}

        {expiryDate ? <p className="mt-5 text-center text-[14px] text-[#8791a1]">购买后有效期至：{expiryDate}</p> : null}
        <div className="mt-4 flex justify-center"><PaymentQrCode /></div>
        <div className="mt-4 text-center text-[22px] font-semibold text-[#20242c]">扫码支付 <span className="text-[#ff493d]">¥{totalPrice.toFixed(2)}</span></div>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-[#9aa3af]"><span>使用</span><PaymentMethodMark type="wechat" /><span>微信</span><span>/</span><PaymentMethodMark type="alipay" /><span>支付宝</span><span>扫码支付</span></div>
        <div className="mt-3 flex justify-center text-[13px] text-[#818b9a]"><button type="button" className="transition hover:text-[#168ff2]">对公转账</button></div>
      </div>
      <div className="border-t border-[#edf0f4] bg-[#f7f8fa] px-4 py-3.5 text-center text-[12px] leading-5 text-[#9aa3af] sm:px-6">支付即视为您同意 <button type="button" className="text-[#4f5968]">《服务协议》</button> 与 <button type="button" className="text-[#4f5968]">《授权许可》</button>，支付后可在订单中心开具发票</div>
    </div>
  </div>;
}

const MEMBERSHIP_POINTS_PACKAGES: MembershipPointsPackage[] = [
  { id: 'points-1500', points: 1500, price: 100, originalPrice: 200, outputText: '约生150~375张图' },
  { id: 'points-3000', points: 3000, price: 199, originalPrice: 420, outputText: '约生300~750张图', tag: '限时特惠' },
  { id: 'points-900', points: 900, price: 60, originalPrice: 100, outputText: '约生90~225张图', tag: '入门首选' },
  { id: 'points-7500', points: 7500, price: 495, originalPrice: 1100, outputText: '约生750~1875张图' },
];

function MembershipPointsPurchaseModal({ onClose }: MembershipPointsPurchaseModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPackage = MEMBERSHIP_POINTS_PACKAGES[selectedIndex] ?? MEMBERSHIP_POINTS_PACKAGES[0];
  const expiryDate = formatExpiryDate(365);

  return <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#101827]/65 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label="购买积分">
    <div className="relative flex h-[min(760px,calc(100vh-32px))] w-[min(1080px,calc(100vw-32px))] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_80px_rgba(15,23,42,.32)]">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#edf0f4] bg-[linear-gradient(110deg,#f1f1ff,#ffffff)] px-6 sm:px-10">
        <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6961f4] text-white">✦</span><div><h2 className="text-[20px] font-semibold text-[#202938]">购买积分</h2><p className="mt-0.5 text-[11px] text-[#8791a1]">适用于所有生成式 AI 功能</p></div></div>
        <button type="button" onClick={onClose} aria-label="关闭积分购买弹框" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#6d7890] shadow-[0_2px_10px_rgba(38,53,79,.1)] transition hover:text-[#202938]"><X className="h-5 w-5" /></button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5 sm:flex-row sm:p-8">
        <aside className="w-full shrink-0 rounded-[16px] bg-[#f2f4ff] p-5 text-[#53617a] sm:w-[230px]">
          <div className="text-[18px] font-semibold text-[#273143]">AI积分</div>
          <p className="mt-2 text-[13px] leading-6">适用于所有生成式AI功能</p>
          <div className="my-5 h-px bg-[#e1e5f1]" />
          <div className="space-y-5 text-[13px] leading-6"><div><h3 className="font-semibold text-[#273143]">AI 智能体创作</h3><p className="mt-1">AI Agent无限画布、AI生图片、生设计、生视频、生实物、AI 3D等</p></div><div><h3 className="font-semibold text-[#273143]">AI绘画</h3><p className="mt-1">AI生绘本、生背景图、生素材、生字体等</p></div><div><h3 className="font-semibold text-[#273143]">AI图片处理</h3><p className="mt-1">主体抓取、智能消除、智能改图、图片变清晰、图片翻译等</p></div><div><h3 className="font-semibold text-[#273143]">AI LOGO</h3><p className="mt-1">智能生成LOGO</p></div></div>
        </aside>
        <main className="min-w-0 flex-1">
          <h2 className="text-[22px] font-semibold text-[#202938]">选择积分套餐</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {MEMBERSHIP_POINTS_PACKAGES.map((item, index) => <button type="button" key={item.id} onClick={() => setSelectedIndex(index)} className={`relative flex min-h-[220px] flex-col overflow-hidden rounded-[14px] border text-left transition ${selectedIndex === index ? 'border-[#6961f4] bg-[#f7f6ff] shadow-[0_8px_20px_rgba(105,97,244,.12)]' : 'border-[#e6eaf2] bg-white hover:border-[#b8b9ef]'}`}>
              {item.tag ? <span className="absolute right-0 top-0 rounded-bl-[10px] bg-[#ff5b62] px-3 py-2 text-[11px] font-medium text-white">{item.tag}</span> : null}
              <span className="mt-14 px-4 text-center text-[18px] font-semibold text-[#202938]">{item.points.toLocaleString('en-US')}积分/年</span>
              <span className="mt-5 px-4 text-center text-[28px] font-semibold tracking-[-.04em] text-[#202938]">¥{item.price}</span>
              <del className="mt-2 px-4 text-center text-[12px] text-[#a1a9b5]">原价 ¥{item.originalPrice}</del>
              <span className={`mt-auto px-3 py-3 text-center text-[12px] ${selectedIndex === index ? 'bg-[#6961f4] text-white' : 'bg-[#f0f2f7] text-[#5e6879]'}`}>{item.outputText}</span>
            </button>)}
          </div>
          <div className="mt-8 flex flex-col items-center border-t border-[#edf0f4] pt-7 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
            <PaymentQrCode />
            <div className="min-w-[210px] text-center sm:text-left"><div className="text-[28px] font-semibold tracking-[-.04em] text-[#ff493d]">¥{selectedPackage.price}</div><div className="mt-2 text-[14px] text-[#8791a1]">购买后有效期至：{expiryDate}</div><div className="mt-5 flex items-center justify-center gap-1.5 text-[13px] text-[#9aa3af] sm:justify-start"><PaymentMethodMark type="alipay" /><span>支付宝</span><span>/</span><PaymentMethodMark type="wechat" /><span>微信</span><span>扫码完成支付</span></div><p className="mt-3 text-[11px] leading-5 text-[#9aa3af]">支付即代表您已同意《创客贴积分购买协议》，支付后可联系客服开具发票。</p></div>
          </div>
        </main>
      </div>
    </div>
  </div>;
}

const DEFAULT_MEMBER_TYPE_BY_PLAN: Record<MembershipType, Record<string, string>> = {
  personal: {
    basic: '基础版（个人）',
    advanced: '专业版（个人）',
    professional: '专业版（个人）',
  },
  enterprise: {
    basic: '基础版（企业）',
    advanced: '专业版（企业）',
    professional: '专业版（企业）',
    flagship: '旗舰版（企业）',
  },
};

const DEFAULT_MEMBER_LEVEL_BY_PLAN: Record<MembershipType, Record<string, number>> = {
  personal: {
    basic: 240,
    advanced: 241,
    professional: 241,
  },
  enterprise: {
    basic: 310,
    advanced: 311,
    professional: 311,
    flagship: 220,
  },
};

function resolveMemberType(plan: MembershipPlanDisplayConfig, membershipType: MembershipType) {
  return plan.memberType ?? DEFAULT_MEMBER_TYPE_BY_PLAN[membershipType][plan.planKey] ?? plan.memberType ?? '';
}

function resolveMemberLevel(plan: MembershipPlanDisplayConfig, membershipType: MembershipType) {
  return plan.memberLevel ?? DEFAULT_MEMBER_LEVEL_BY_PLAN[membershipType][plan.planKey];
}

function normalizeCycleKey(cycleKey: string) {
  const key = cycleKey.replace(/^team-/, '');
  return key === 'two-year' ? 'yearly' : key;
}

function getCyclePlanData(plan: MembershipPlan, cycleKey: string): MembershipPlanData {
  return plan.cyclePricing?.[cycleKey] ?? plan.cyclePricing?.[normalizeCycleKey(cycleKey)] ?? plan;
}

function getPackageMonths(duration: number) {
  if (duration >= 365) return Math.max(1, Math.round(duration / 365) * 12);
  if (duration === 90) return 3;
  if (duration === 30) return 1;
  return Math.max(1, Math.round(duration / 30));
}

function formatPackageMonthlyPrice(price: number, duration: number) {
  const months = getPackageMonths(duration);
  return months ? String(Number((price / months).toFixed(2))) : '-';
}

function formatPackagePointPrice(monthlyPrice: string, pointsText: string) {
  const monthlyPriceValue = Number(monthlyPrice.replace(/,/g, ''));
  const pointValues = pointsText.replace(/,/g, '').match(/\d+(?:\.\d+)?/g) ?? [];
  if (!Number.isFinite(monthlyPriceValue) || pointValues.length !== 1) return '-';

  const points = Number(pointValues[0]);
  if (!Number.isFinite(points) || points <= 0) return '-';
  return String(Number((monthlyPriceValue / points).toFixed(4)));
}

function formatPackageDiscount(discount: number) {
  const value = discount > 10 ? discount / 10 : discount;
  return String(Number(value.toFixed(1)));
}

function parseRenewalPrice(contractPrice: string) {
  const normalizedPrice = contractPrice.trim();
  const explicitRenewal = normalizedPrice.match(/(?:续费|签约价?)\s*[¥￥]?\s*([\d,.]+)/);
  if (explicitRenewal?.[1]) return explicitRenewal[1].replace(/,/g, '');
  const legacyContract = normalizedPrice.match(/^\s*[\d,.]+\s*[-~～]\s*([\d,.]+)\s*$/);
  if (legacyContract?.[1]) return legacyContract[1].replace(/,/g, '');
  const directPrice = normalizedPrice.match(/^\s*[¥￥]?\s*([\d,.]+)\s*(?:元)?\s*$/);
  return directPrice?.[1]?.replace(/,/g, '');
}

function formatExpiryDate(durationDays?: number) {
  if (!durationDays || durationDays <= 0) return null;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationDays);
  return `${expiryDate.getFullYear()}-${expiryDate.getMonth() + 1}-${expiryDate.getDate()}`;
}

function getRenewalPeriod(period: string) {
  if (period.includes('月')) return '每月';
  if (period.includes('季')) return '每季度';
  if (period.includes('年')) return '每年';
  return period;
}

function getPackageDescriptions(row: WebPackageDetail) {
  const saleDescriptionParts = (row.saleDescription ?? '').split('^').map((part) => part.trim());
  return {
    saleDescription: row.saleDescription?.trim() ?? '',
    priceDescription: saleDescriptionParts[1] ?? '',
    pointsDescription: saleDescriptionParts[2] || (row.pointsDescription?.trim() ?? ''),
  };
}

function getPackagePromotion(saleDescription?: string) {
  const saleDescriptionParts = (saleDescription ?? '').split('^').map((part) => part.trim());
  const isLegacyDescriptionOrder = saleDescriptionParts.length >= 3
    && /生成|图片|视频|积分/.test(saleDescriptionParts[1] ?? '')
    && /首充|续费|一次性购买|有效期|可随时取消/.test(saleDescriptionParts.slice(2).join('^'));
  const isLegacySaleDescription = isLegacyDescriptionOrder || /首充|续费|一次性购买|有效期|后续按/.test(saleDescriptionParts[1] ?? '');
  if (isLegacySaleDescription) return { tagText: '', bannerText: '', color: '' };
  return {
    tagText: saleDescriptionParts[0] ?? '',
    bannerText: saleDescriptionParts[1] ?? '',
    color: saleDescriptionParts[3] ?? '',
  };
}

function getCyclePackageRows(memberLevel: number | undefined, cycle: MembershipCycleConfig, packageDetails: WebPackageDetail[]) {
  const duration = Number.parseInt(cycle.duration, 10);
  const rows = packageDetails.filter((row) => row.status === '显示' && row.memberLevel === memberLevel && row.duration === duration && row.points != null);
  const wantsSubscription = cycle.name.includes('连续');
  const preferredRows = rows.filter((row) => wantsSubscription ? row.packageType === '订阅套餐' : row.packageType !== '订阅套餐');
  const sourceRows = preferredRows.length ? preferredRows : rows;
  const uniqueRows = new Map<number, WebPackageDetail>();
  sourceRows.forEach((row) => {
    if (row.points != null && !uniqueRows.has(row.points)) uniqueRows.set(row.points, row);
  });
  return [...uniqueRows.values()].sort((left, right) => (left.points ?? 0) - (right.points ?? 0));
}

function createWebPackagePlanData(memberLevel: number | undefined, planKey: string, cycleOptions: MembershipCycleConfig[], packageDetails: WebPackageDetail[]): MembershipPlanData {
  const fallback = REAL_MEMBERSHIP_PLAN_DATA[planKey] ?? REAL_MEMBERSHIP_PLAN_DATA.basic;
  const cyclePricing = Object.fromEntries(cycleOptions.map((cycle) => {
    const rows = getCyclePackageRows(memberLevel, cycle, packageDetails);
    const fallbackCycle = fallback.cyclePricing?.[normalizeCycleKey(cycle.key)] ?? fallback;
    if (!rows.length) return [cycle.key, { ...fallbackCycle, period: cycle.name }];

    const tierOptions = rows.map((row) => {
      const descriptions = getPackageDescriptions(row);
      return {
      quotaLabel: row.points == null ? '-' : row.points.toLocaleString('en-US'),
      price: String(row.currentPrice),
      originalPrice: String(row.originalPrice),
      points: row.points == null ? '-' : row.points.toLocaleString('en-US'),
      pointsNote: `${row.pointsUnit ?? '每人'} · ${row.pointsCycle === '一次性' ? '一次性发放' : '按月发放'}`,
      pointsDescription: descriptions.pointsDescription,
      priceDescription: descriptions.priceDescription,
      saleDescription: descriptions.saleDescription,
      monthlyPrice: formatPackageMonthlyPrice(row.currentPrice, row.duration),
      renewalPrice: parseRenewalPrice(row.contractPrice),
      durationDays: row.duration,
      packageType: row.packageType,
      };
    });
    const firstRow = rows[0];
    const firstDescriptions = getPackageDescriptions(firstRow);
    return [cycle.key, {
      price: String(firstRow.currentPrice),
      originalPrice: String(firstRow.originalPrice),
      period: cycle.name,
      points: `${firstRow.points?.toLocaleString('en-US') ?? '-'} ${firstRow.pointsCycle === '一次性' ? '积分一次性' : '积分每月'}`,
      pointsNote: `${firstRow.pointsUnit ?? '每人'} · ${firstRow.pointsCycle === '一次性' ? '一次性发放' : '按月发放'}`,
      pointsDescription: firstDescriptions.pointsDescription,
      priceDescription: firstDescriptions.priceDescription,
      saleDescription: firstDescriptions.saleDescription,
      monthlyPrice: formatPackageMonthlyPrice(firstRow.currentPrice, firstRow.duration),
      discount: formatPackageDiscount(firstRow.discount),
      renewalPrice: parseRenewalPrice(firstRow.contractPrice),
      durationDays: firstRow.duration,
      packageType: firstRow.packageType,
      tierOptions: tierOptions.length > 1 ? tierOptions : undefined,
    }];
  }));
  const firstCycle = cycleOptions[0] ? cyclePricing[cycleOptions[0].key] : undefined;
  return { ...fallback, ...(firstCycle ?? {}), cyclePricing };
}

function hydratePlan(plan: MembershipPlanDisplayConfig, membershipType: MembershipType, cycleOptions: MembershipCycleConfig[], packageDetails: WebPackageDetail[]): MembershipPlan {
  const memberType = resolveMemberType(plan, membershipType);
  const memberLevel = resolveMemberLevel(plan, membershipType);
  const data = createWebPackagePlanData(memberLevel, plan.planKey, cycleOptions, packageDetails);
  return { ...data, ...plan, memberType, memberLevel };
}

const promotionDurationMs = (((4 * 24 + 1) * 60 + 51) * 60 + 59) * 1000;

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

function CountdownBox({ value, label }: { value: string; label: string }) {
  return <div className="flex h-[66px] w-[70px] flex-col items-center justify-center rounded-[16px] bg-white/75 text-[#1c283a] shadow-[0_10px_24px_rgba(40,93,185,.08)] backdrop-blur-sm"><strong className="text-[25px] font-semibold leading-7 tracking-[-.04em]">{value}</strong><span className="mt-0.5 text-[10px] text-[#6f7c90]">{label}</span></div>;
}

function multiplyMoney(value: string, quantity: number) {
  const amount = Number(value.replace(/,/g, '')) || 0;
  return (amount * quantity).toLocaleString('en-US');
}

function formatMoney(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function getCouponDiscount(price: string, coupon?: MembershipCoupon | null, packageInfo?: { memberLevel?: number; durationDays?: number; packageType?: string }) {
  const amount = Number(price.replace(/,/g, '')) || 0;
  if (coupon?.memberLevel != null && coupon.memberLevel !== packageInfo?.memberLevel) return 0;
  if (coupon?.durationDays != null && coupon.durationDays !== packageInfo?.durationDays) return 0;
  if (coupon?.packageType != null && coupon.packageType !== packageInfo?.packageType) return 0;
  return coupon ? Math.min(Math.max(coupon.amount, 0), amount) : 0;
}

function getApplicableMembershipCoupon(price: string, coupons: MembershipCoupon[], packageInfo?: { memberLevel?: number; durationDays?: number; packageType?: string }) {
  return coupons.find((coupon) => getCouponDiscount(price, coupon, packageInfo) > 0) ?? null;
}

function AnimatedDiscountedPrice({ price, couponDiscount }: { price: string; couponDiscount: number }) {
  const salePrice = Number(price.replace(/,/g, '')) || 0;
  const discountedPrice = Math.max(0, salePrice - couponDiscount);
  const [displayPrice, setDisplayPrice] = useState(salePrice);

  useEffect(() => {
    if (salePrice === discountedPrice) {
      setDisplayPrice(salePrice);
      return undefined;
    }

    let frame = 0;
    const startedAt = performance.now();
    const duration = 560;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = 1 - ((1 - progress) ** 3);
      setDisplayPrice(salePrice - ((salePrice - discountedPrice) * easedProgress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [discountedPrice, salePrice]);

  return <strong className="text-[33px] font-semibold leading-none tracking-[-.05em]">{formatMoney(displayPrice)}</strong>;
}

function RetentionPurchaseModal({ cycleOptions, selectedCycle, activeCycleKey, plans, selectedPlanIndex, onCycleChange, onPlanChange, onContinue, onClose }: RetentionPurchaseModalProps) {
  const selectedPlan = plans[selectedPlanIndex] ?? plans[0];
  if (!selectedPlan) return null;

  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#162033]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="挽留购买"><div className="relative w-[min(820px,calc(100vw-32px))] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_80px_rgba(15,23,42,.28)]"><div className="flex h-[62px] items-center justify-between border-b border-[#edf0f4] px-6"><div><h2 className="text-[17px] font-semibold text-[#202938]">先别急着离开</h2><p className="mt-1 text-[11px] text-[#8c96a6]">选择适合你的会员方案，立即解锁更多权益</p></div><button type="button" onClick={onClose} aria-label="关闭挽留购买弹框" className="flex h-8 w-8 items-center justify-center rounded-full text-[#9aa4b2] transition hover:bg-[#f3f5f8] hover:text-[#273144]"><X className="h-4 w-4" /></button></div><div className="px-6 py-6"><div className="rounded-[16px] bg-[#f6f8fb] p-4"><div className="text-center text-[12px] font-semibold text-[#273144]">选择套餐时长</div><div className="mt-4 grid grid-cols-2 gap-2 rounded-[12px] bg-[#e9edf3] p-1 sm:grid-cols-4">{cycleOptions.map((cycle, index) => <button type="button" key={cycle.key} onClick={() => onCycleChange(index)} className={`min-w-0 rounded-[9px] px-2 py-2.5 text-[11px] transition ${selectedCycle === index ? 'bg-white font-semibold text-[#168ff2] shadow-[0_2px_7px_rgba(38,60,92,.1)]' : 'text-[#687487] hover:text-[#168ff2]'}`}>{cycle.name}{cycle.guideText ? <span className="ml-1 text-[10px]" style={{ color: cycle.guideTextColor ?? '#8993a2' }}>{cycle.guideText}</span> : null}</button>)}</div><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{plans.map((plan, index) => { const planCycleData = plan.cyclePricing?.[activeCycleKey] ?? plan; return <button type="button" key={`${plan.planKey}-${index}`} onClick={() => onPlanChange(index)} className={`min-w-0 rounded-[12px] border px-3.5 py-4 text-left transition ${selectedPlanIndex === index ? 'border-[#168ff2] bg-[#edf6ff] shadow-[0_3px_10px_rgba(22,143,242,.1)]' : 'border-[#e4e9f0] bg-white hover:border-[#a9c9ee]'}`}><span className={`block truncate text-[13px] font-semibold ${selectedPlanIndex === index ? 'text-[#168ff2]' : 'text-[#273144]'}`}>{plan.name}</span><span className="mt-1 block truncate text-[10px] text-[#8d98a8]">{plan.subtitle}</span><span className="mt-3 flex items-end gap-1 text-[#202938]"><span className="mb-1 text-[11px]">¥</span><strong className="text-[25px] leading-none tracking-[-.04em]">{planCycleData.price}</strong><span className="mb-0.5 text-[10px] text-[#8994a4]">/{planCycleData.period.replace('每', '')}</span></span><span className="mt-2 block text-[10px] text-[#7f8b9d]">{planCycleData.originalPrice ? <del className="mr-1">¥{planCycleData.originalPrice}</del> : null}{planCycleData.discount}折 · {planCycleData.points}</span></button>; })}</div></div></div><div className="flex items-center justify-end gap-3 border-t border-[#edf0f4] px-6 py-4"><button type="button" onClick={onContinue} className="h-9 rounded-[6px] border border-[#dce3ed] px-5 text-[12px] text-[#697587] transition hover:border-[#b7c5d7] hover:text-[#273144]">继续浏览</button><button type="button" onClick={onClose} className="h-9 rounded-[6px] bg-[#168ff2] px-6 text-[12px] font-medium text-white shadow-[0_5px_12px_rgba(22,143,242,.18)] transition hover:bg-[#087edc]">立即开通{selectedPlan.name ? ` ${selectedPlan.name}` : ''}</button></div></div></div>;
}

function StickyCycleDropdown({ options, selectedIndex, onChange }: { options: MembershipCycleConfig[]; selectedIndex: number; onChange: (index: number) => void }) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setMenuPosition({ top: rect.bottom + 5, left: rect.left });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  if (!selectedOption) return null;

  return <div ref={dropdownRef} className="relative mt-1.5">
    <button ref={triggerRef} type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex h-7 w-full items-center justify-between gap-2 rounded-[7px] border border-[#e4e9f0] bg-white px-2.5 text-[10px] text-[#4e5a6c] shadow-[0_1px_4px_rgba(38,53,79,.05)] transition hover:border-[#b7c5d7] hover:text-[#168ff2]">
      <span className="min-w-0 truncate">{selectedOption.name}{selectedOption.guideText ? <span className="ml-1" style={{ color: selectedOption.guideTextColor ?? '#8993a2' }}>{selectedOption.guideText}</span> : null}</span>
      <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#7e8999] transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open ? <div role="listbox" style={{ top: menuPosition.top, left: menuPosition.left }} className="fixed z-[120] max-h-[min(360px,calc(100vh-16px))] w-[210px] overflow-y-auto rounded-[12px] border border-[#e4e9f0] bg-white p-1.5 shadow-[0_10px_24px_rgba(31,50,81,.16)]">
      {options.map((option, index) => <button type="button" role="option" aria-selected={selectedIndex === index} key={option.key} onClick={() => { onChange(index); setOpen(false); }} className={`flex w-full items-center gap-1.5 rounded-[8px] px-2.5 py-2 text-left text-[11px] transition ${selectedIndex === index ? 'bg-[#f1f3f6] font-semibold text-[#253043]' : 'text-[#536075] hover:bg-[#f7f8fa] hover:text-[#168ff2]'}`}><span>{option.name}</span>{option.guideText ? <span style={{ color: option.guideTextColor ?? '#8993a2' }}>{option.guideText}</span> : null}</button>)}
    </div> : null}
  </div>;
}

function getLowestPackagePrice(memberLevel: number | undefined, packageDetails: WebPackageDetail[]) {
  if (memberLevel == null) return null;
  const rows = packageDetails
    .filter((row) => row.status === '显示' && row.memberLevel === memberLevel)
    .filter((row) => Number.isFinite(Number(row.currentPrice)) && Number(row.currentPrice) >= 0);
  return rows.sort((left, right) => Number(left.currentPrice) - Number(right.currentPrice))[0] ?? null;
}

function StickyPurchaseBar({ plans, details, packageDetails, membershipType, currentMemberLevel, currentMemberName, onMembershipTypeChange, onPurchase }: { plans: MembershipPlan[]; details?: MembershipComparisonConfig; packageDetails: WebPackageDetail[]; membershipType: 'personal' | 'enterprise'; currentMemberLevel?: number | null; currentMemberName?: string; onMembershipTypeChange: (type: 'personal' | 'enterprise') => void; onPurchase: (plan: MembershipPlan) => void }) {
  return <div className="sticky top-[48px] z-[9] border-b border-[#e4e9f0] bg-white/95 px-5 py-2 shadow-[0_8px_18px_rgba(38,53,79,.1)] backdrop-blur-md"><div className="mx-auto max-w-[1240px] overflow-x-auto"><div className="flex min-w-[700px] items-end gap-3"><div className="w-[176px] shrink-0 pb-0.5"><div className="flex rounded-full bg-[#eef1f5] p-0.5"><button type="button" onClick={() => onMembershipTypeChange('personal')} className={`flex-1 whitespace-nowrap rounded-full px-1.5 py-1 text-[10px] leading-4 transition ${membershipType === 'personal' ? 'bg-white font-semibold text-[#273144] shadow-[0_1px_4px_rgba(38,53,79,.1)]' : 'text-[#8792a2] hover:text-[#273144]'}`}>个人使用</button><button type="button" onClick={() => onMembershipTypeChange('enterprise')} className={`flex-1 whitespace-nowrap rounded-full px-1.5 py-1 text-[10px] leading-4 transition ${membershipType === 'enterprise' ? 'bg-white font-semibold text-[#273144] shadow-[0_1px_4px_rgba(38,53,79,.1)]' : 'text-[#8792a2] hover:text-[#273144]'}`}>企业使用</button></div></div><div className="grid min-w-0 flex-1 gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(plans.length, 1)}, minmax(128px, 1fr))` }}>{plans.map((plan) => { const detailColumn = details?.columns.find((column) => column.key === plan.planKey); const stickyTag = plan.planKey === 'flagship' ? undefined : detailColumn?.tag; const lowestPackage = getLowestPackagePrice(plan.memberLevel, packageDetails); const monthlyPrice = lowestPackage ? formatPackageMonthlyPrice(Number(lowestPackage.currentPrice), lowestPackage.duration) : null; const purchaseAction = getMembershipPurchaseAction(currentMemberLevel, plan.memberLevel, currentMemberName); const isDowngrade = purchaseAction.kind === 'downgrade'; return <div key={plan.planKey} className="min-w-0 text-center"><div className="truncate text-[12px] font-semibold leading-4 text-[#202938]">{detailColumn?.label ?? plan.name}{stickyTag ? <span className="ml-1 text-[9px] font-normal text-[#168ff2]">{stickyTag}</span> : null}</div><div className="mt-0.5 text-[11px] leading-4 text-[#4e5a6c]">{monthlyPrice == null || monthlyPrice === '-' ? '暂无价格' : `¥${monthlyPrice}/月起`}</div><button type="button" disabled={isDowngrade} onClick={isDowngrade ? undefined : () => onPurchase(plan)} title={isDowngrade ? purchaseAction.helperText : undefined} className={`mt-1.5 h-7 w-full max-w-[108px] rounded-[5px] px-2 text-[10px] font-medium transition ${isDowngrade ? 'cursor-not-allowed bg-[#eef1f5] text-[#9aa3af]' : 'bg-[#168ff2] text-white hover:bg-[#087edc]'}`}>{purchaseAction.buttonText}</button>{isDowngrade ? <div className="mt-1 text-[9px] leading-3 text-[#f04444]">{purchaseAction.helperText}</div> : null}</div>; })}</div></div></div></div>;
}

function CycleOptionSelector({ options, selectedIndex, onChange, couponCycleKeys = new Set<string>(), className }: { options: MembershipCycleConfig[]; selectedIndex: number; onChange: (index: number) => void; couponCycleKeys?: Set<string>; className?: string }) {
  const selectorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(options.length);
  const [selectorWidth, setSelectorWidth] = useState<number>();
  const optionSignature = options.map((option) => `${option.key}:${option.name}:${option.guideText}`).join('|');
  const primaryOptions = options.slice(0, visibleCount);
  const extraOptions = options.slice(visibleCount);
  const selectedExtraOption = selectedIndex >= visibleCount ? options[selectedIndex] : undefined;

  useLayoutEffect(() => {
    setExpanded(false);
    setVisibleCount(options.length);
  }, [optionSignature]);

  useLayoutEffect(() => {
    const selector = selectorRef.current;
    const measure = measureRef.current;
    if (!selector || !measure) return undefined;

    const updateVisibleCount = () => {
      const optionWidths = Array.from(measure.querySelectorAll<HTMLElement>('[data-cycle-measure]')).map((element) => element.offsetWidth);
      const moreWidth = Math.max(...Array.from(measure.querySelectorAll<HTMLElement>('[data-more-measure]')).map((element) => element.offsetWidth), 0);
      const gap = 4;
      const allOptionsWidth = optionWidths.reduce((sum, width) => sum + width, 0) + Math.max(optionWidths.length - 1, 0) * gap;
      const parentWidth = selector.parentElement?.clientWidth ?? 0;
      const maxWidth = parentWidth > 32 ? Math.min(960, parentWidth - 32) : 960;
      const nextSelectorWidth = Math.min(allOptionsWidth + 8, maxWidth);
      const availableWidth = Math.max(nextSelectorWidth - 8, 0);

      setSelectorWidth((current) => current === nextSelectorWidth ? current : nextSelectorWidth);

      if (allOptionsWidth <= availableWidth) {
        setVisibleCount((current) => current === options.length ? current : options.length);
        return;
      }

      let fittedCount = 0;
      let fittedWidth = 0;
      for (const optionWidth of optionWidths) {
        const nextWidth = fittedWidth + optionWidth + (fittedCount ? gap : 0);
        const widthWithMore = nextWidth + gap + moreWidth;
        if (widthWithMore > availableWidth) break;
        fittedWidth = nextWidth;
        fittedCount += 1;
      }

      const nextVisibleCount = Math.max(fittedCount, 1);
      setVisibleCount((current) => current === nextVisibleCount ? current : nextVisibleCount);
    };

    updateVisibleCount();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(updateVisibleCount);
    observer.observe(selector.parentElement ?? selector);
    return () => observer.disconnect();
  }, [optionSignature, options.length]);

  useEffect(() => {
    if (!expanded) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded]);

  const renderCycleLabel = (cycle: MembershipCycleConfig) => <>
    <span>{cycle.name}</span>
    {cycle.guideText ? <span style={{ color: cycle.name === '连续包年' ? '#ff4d4f' : cycle.guideTextColor ?? '#8993a2' }}>{cycle.guideText}</span> : null}
    {couponCycleKeys.has(cycle.key) ? <span className="rounded-[3px] bg-[#fff0f0] px-1 py-0.5 text-[9px] font-medium leading-3 text-[#f04444]">券</span> : null}
  </>;

  const selectCycle = (index: number) => {
    onChange(index);
    setExpanded(false);
  };

  return <div ref={selectorRef} style={selectorWidth ? { width: `${selectorWidth}px` } : undefined} className={`${className ?? 'relative mx-auto mt-4 w-fit max-w-[min(960px,calc(100%-32px))]'} text-[11px] text-[#4e5868]`}>
    <div ref={barRef} className="flex w-full items-center gap-1 rounded-full bg-[#eef0f4] p-1 shadow-inner">
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden">
        {primaryOptions.map((cycle, index) => <button type="button" key={cycle.key} onClick={() => selectCycle(index)} className={`flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-3 py-2.5 transition ${selectedIndex === index ? 'bg-white font-semibold text-[#253043] shadow-[0_1px_4px_rgba(31,50,81,.08)]' : 'hover:text-[#168ff2]'}`}>{renderCycleLabel(cycle)}</button>)}
      </div>
      {extraOptions.length ? <div className="relative shrink-0">
        <button type="button" aria-haspopup="listbox" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)} className="flex min-h-[36px] min-w-[92px] max-w-[280px] items-center justify-center gap-1 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-[12px] font-semibold text-[#252a31] shadow-[0_2px_8px_rgba(31,50,81,.12)] transition hover:text-[#168ff2]">
          <span>{selectedExtraOption ? '更多–' : '更多'}</span>
          {selectedExtraOption ? renderCycleLabel(selectedExtraOption) : null}
          <ChevronDown className={`ml-1 h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded ? <div role="listbox" className="absolute right-0 top-[calc(100%+8px)] z-40 w-[250px] overflow-hidden rounded-[20px] border border-[#e6e8ec] bg-white p-2 shadow-[0_12px_32px_rgba(31,50,81,.16)]">
          {extraOptions.map((cycle, index) => {
            const optionIndex = primaryOptions.length + index;
            const isSelected = selectedIndex === optionIndex;
            return <button type="button" role="option" aria-selected={isSelected} key={cycle.key} onClick={() => selectCycle(optionIndex)} className={`flex w-full items-center gap-2 rounded-[16px] px-4 py-3 text-left text-[14px] transition ${isSelected ? 'bg-[#f1f2f4] font-semibold text-[#252a31]' : 'text-[#252a31] hover:bg-[#f6f7f9]'}`}>{renderCycleLabel(cycle)}</button>;
          })}
        </div> : null}
      </div> : null}
    </div>
    <div ref={measureRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 -z-10 flex w-max gap-1 whitespace-nowrap opacity-0">
      {options.map((cycle) => <span data-cycle-measure="true" key={cycle.key} className="flex items-center gap-1 rounded-full px-3 py-2.5 text-[11px]">{renderCycleLabel(cycle)}</span>)}
      <span data-more-measure="default" className="flex min-h-[36px] min-w-[92px] items-center justify-center gap-1 rounded-full px-5 py-2.5 text-[12px] font-semibold">更多<ChevronDown className="ml-1 h-4 w-4 shrink-0" /></span>
      {options.map((cycle) => <span data-more-measure={cycle.key} key={`more-${cycle.key}`} className="flex min-h-[36px] min-w-[92px] items-center justify-center gap-1 rounded-full px-5 py-2.5 text-[12px] font-semibold">更多–{renderCycleLabel(cycle)}<ChevronDown className="ml-1 h-4 w-4 shrink-0" /></span>)}
    </div>
  </div>;
}

function FaqCard({ item, index }: { item: MembershipPageContent['faq']['items'][number]; index: number }) {
  return <details open={item.openByDefault ?? index < 2} className="group w-full overflow-hidden rounded-[16px] border border-[#e6ebf1] bg-white shadow-[0_2px_8px_rgba(31,50,81,.02)]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-[14px] font-semibold leading-5 text-[#202938] marker:hidden [&::-webkit-details-marker]:hidden"><span>{item.question}</span><ChevronDown className="h-5 w-5 shrink-0 text-[#aeb8c7] transition-transform group-open:rotate-180" /></summary><div className="border-t border-[#edf0f4] bg-[#f1f4fa] px-5 py-5 text-[12px] leading-6 text-[#66738a] whitespace-pre-line">{item.answer}</div></details>;
}

function ModelConsumptionTable({ config }: { config: MembershipModelConsumptionConfig }) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const columns = config.columns ?? [];
  const groups = config.groups ?? [];
  const columnCount = Math.max(columns.length, 1);
  const gridStyle = { gridTemplateColumns: `minmax(260px,1.45fr) repeat(${columnCount}, minmax(96px,1fr))` };
  const formatQuota = (quota: string | number) => typeof quota === 'number' ? quota.toLocaleString('en-US') : quota;

  if (!groups.length) {
    return <div className="mt-4 divide-y divide-[#edf0f4] overflow-hidden rounded-[12px] border border-[#edf0f4]">{(config.models ?? []).map((model, index) => <div key={`${model.name}-${index}`} className="flex items-center justify-between px-4 py-3 text-[12px]"><span className="text-[#4b5667]">{model.name}</span><span className="font-medium text-[#273144]">{model.quota} {model.unit}</span></div>)}</div>;
  }

  return <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#edf0f4] bg-white">
    <div className="min-w-[820px]">
      <div className="grid items-center gap-0 bg-[#f5f7fa] px-4 py-4" style={gridStyle}>
        <div className="text-[12px] font-semibold leading-5 text-[#202938]">AI 创作会员 / AI大会员<br /><span className="font-normal text-[#4d596a]">积分额度档位</span></div>
        {columns.map((column) => <div key={`${column.label}-${column.subLabel}`} className="text-center"><div className="text-[16px] font-semibold leading-5 text-[#202938]">{column.label} <span className="text-[10px] font-normal text-[#7e8998]">{column.subLabel}</span></div><div className="mt-1 text-[10px] text-[#7e8998]">最多生成数量 ⓘ</div></div>)}
      </div>
      {groups.map((group) => {
        const expanded = Boolean(expandedGroups[group.key]);
        const previewRowCount = 3;
        const visibleRows = expanded ? group.rows : group.rows.slice(0, previewRowCount);
        return <section key={group.key}>
          <div className="flex items-center gap-3 border-t border-[#edf0f4] bg-white px-4 py-3"><span className="h-4 w-1 rounded-full bg-[#202938]" /><h3 className="text-[14px] font-semibold text-[#202938]">{group.title}</h3></div>
          {visibleRows.map((row, rowIndex) => <div key={`${row.name}-${rowIndex}`} className="grid items-center border-t border-[#edf0f4] px-4 py-3.5" style={gridStyle}>
            <div className="flex min-w-0 items-center gap-3 pl-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#dce1e8] text-[11px] text-[#7e8998]">✣</span><div className="min-w-0"><div className="truncate text-[12px] font-medium text-[#273144]">{row.name}</div>{row.cost || row.badge ? <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[#8994a3]"><span>{row.cost}</span>{row.badge ? <span className="rounded-[3px] bg-[#eaf1ff] px-1 py-0.5 text-[9px] text-[#266dff]">{row.badge} ⓘ</span> : null}</div> : null}</div></div>
            {columns.map((column, columnIndex) => <div key={`${column.label}-${columnIndex}`} className="text-center text-[13px] font-medium text-[#273144]">{formatQuota(row.quotas[columnIndex] ?? '—')} <span className="text-[11px] font-normal text-[#5e6979]">{row.unit}</span></div>)}
          </div>)}
          {group.rows.length > previewRowCount ? <div className="border-t border-[#edf0f4] px-4 py-3"><button type="button" onClick={() => setExpandedGroups((current) => ({ ...current, [group.key]: !expanded }))} className="flex items-center gap-1 text-[12px] font-medium text-[#7b8797] transition hover:text-[#168ff2]">{expanded ? '收起' : '查看更多'}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button></div> : null}
        </section>;
      })}
    </div>
  </div>;
}

function DetailsComparisonTable({ config }: { config: MembershipComparisonConfig }) {
  const columns = config.columns;
  const gridStyle = { gridTemplateColumns: `minmax(250px,1.35fr) repeat(${Math.max(columns.length, 1)}, minmax(150px,1fr))` };
  const [expanded, setExpanded] = useState(false);
  const detailedRowCount = config.sections.filter((section) => section.title !== '基础信息').reduce((total, section) => total + section.rows.length, 0);
  const previewRowCount = Math.max(1, Math.ceil(detailedRowCount / 3));
  let previewRowsUsed = 0;

  const renderValue = (value: string, columnIndex: number) => {
    if (value === '✓') return <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#8993a0] text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>;
    if (value === '—') return <span className="text-[#9ca5b1]">—</span>;
    return <span className={`block whitespace-pre-line leading-5 ${columnIndex === columns.length - 1 ? 'text-[#3e4959]' : 'text-[#4c5767]'}`}>{value}</span>;
  };

  return <div className="mt-5 overflow-x-auto rounded-[15px] border border-[#e7ebf0] bg-white">
    <div className="min-w-[820px]">
      <div className="grid items-center border-b border-[#e7ebf0] bg-[#fbfcfd]" style={gridStyle}>
        <div className="px-5 py-4 text-[12px] font-semibold text-[#273143]">会员版本</div>
        {columns.map((column, columnIndex) => <div key={column.key} className={`px-3 py-4 text-center text-[13px] font-semibold text-[#273143] ${columnIndex === columns.length - 1 ? 'bg-[#fafafa]' : ''}`}><span>{column.label}</span>{column.tag && column.key !== 'flagship' ? <span className="ml-1 rounded-[4px] bg-[#ff554c] px-1 py-0.5 text-[9px] font-medium text-white">{column.tag}</span> : null}</div>)}
      </div>
      {config.sections.map((section, sectionIndex) => {
        const isSummary = section.title === '基础信息';
        const rows = isSummary || expanded ? section.rows : section.rows.slice(0, Math.max(previewRowCount - previewRowsUsed, 0));
        if (!isSummary) previewRowsUsed += rows.length;
        if (!rows.length) return null;
        return <section key={`${section.title}-${sectionIndex}`}>
          {!isSummary ? <div className="flex items-center gap-3 border-b border-[#e7ebf0] bg-white px-5 py-4"><span className="h-4 w-1 rounded-full bg-[#202938]" /><h3 className="text-[13px] font-semibold text-[#273143]">{section.title}</h3></div> : null}
          {rows.map((row, rowIndex) => <div key={`${row.label}-${rowIndex}`} className="grid items-center border-b border-[#edf0f4] last:border-b-0" style={gridStyle}>
            <div className="px-5 py-4 text-[11px] leading-5 text-[#414c5c]">{row.label}</div>
            {columns.map((column, columnIndex) => <div key={`${column.key}-${columnIndex}`} className={`min-h-[52px] px-3 py-4 text-center text-[11px] ${columnIndex === columns.length - 1 ? 'bg-[#fafafa]' : ''}`}>{renderValue(row.values[columnIndex] ?? '—', columnIndex)}</div>)}
          </div>)}
        </section>;
      })}
      {detailedRowCount > previewRowCount ? <div className="border-t border-[#e7ebf0] px-5 py-4"><button type="button" onClick={() => setExpanded((current) => !current)} className="mx-auto flex items-center gap-1 text-[12px] font-medium text-[#7b8797] transition hover:text-[#168ff2]">{expanded ? '收起权益' : '查看全部权益'}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button></div> : null}
    </div>
  </div>;
}

function CommercialLicenseOverview({ config }: { config: MembershipCommercialLicenseConfig }) {
  const scopeSections = config.scopeSections ?? [];
  const testimonials = config.testimonials ?? [];
  const logos = config.logos ?? [];

  return <>
    <section className="mx-auto mt-4 max-w-[1120px] rounded-[18px] bg-[#f7f8fa] px-6 py-8">
      <h2 className="text-center text-[24px] font-semibold tracking-[-.03em] text-[#202a3d]">{config.title}</h2>
      <p className="mx-auto mt-2 max-w-[720px] text-center text-[12px] leading-5 text-[#8792a3]">{config.description}</p>
      {scopeSections.length ? <div className="mt-7 grid grid-cols-1 overflow-hidden rounded-[16px] border border-[#e7ebf0] bg-white lg:grid-cols-3">
        {scopeSections.map((section, sectionIndex) => <div key={`${section.title}-${sectionIndex}`} className={`px-5 py-6 ${section.enabled ? 'bg-white' : 'bg-[#f3f6fc]'}`}>
          <h3 className="text-[16px] font-semibold text-[#273143]">{section.title}</h3>
          <ul className="mt-5 space-y-5">
            {section.items.map((item, itemIndex) => <li key={`${item.title}-${itemIndex}`}>
              <div className="flex items-start gap-2"><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${section.enabled ? 'bg-[#168ff2] text-white' : 'bg-[#c8cdd5] text-white'}`}>{section.enabled ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}</span><span className="text-[12px] font-medium text-[#344052]">{item.title}</span></div>
              <p className="ml-6 mt-2 text-[11px] leading-5 text-[#7e8999]">{item.description}</p>
            </li>)}
          </ul>
        </div>)}
      </div> : <div className="mt-6 flex flex-wrap justify-center gap-2">{config.scopes.map((scope) => <span key={scope} className="rounded-full bg-white px-3 py-1.5 text-[11px] text-[#687588] shadow-sm">{scope}</span>)}</div>}
    </section>
    {testimonials.length ? <section className="mx-auto mt-14 max-w-[1120px] px-1">
      <h2 className="text-center text-[26px] font-semibold tracking-[-.04em] text-[#202a3d]">这些企业和用户都在选择创客贴</h2>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {testimonials.map((testimonial, index) => <article key={`${testimonial.name}-${index}`} className="rounded-[16px] border border-[#edf0f4] bg-white p-5 shadow-[0_8px_22px_rgba(37,52,77,.04)]">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d7e7ff,#f4c9b5)] text-[13px] font-semibold text-white">{testimonial.avatar ?? testimonial.name.slice(0, 1)}</span><div><div className="text-[12px] font-semibold text-[#273143]">{testimonial.name} <span className="font-normal text-[#8994a3]">/ {testimonial.role}</span></div><div className="mt-1 flex flex-wrap gap-1">{testimonial.tags.map((tag) => <span key={tag} className="rounded-[3px] bg-[#edf3ff] px-1.5 py-0.5 text-[9px] text-[#6e7f9d]">{tag}</span>)}</div></div></div>
          <p className="mt-4 text-[11px] leading-5 text-[#7d899c]">“{testimonial.quote}”</p>
        </article>)}
      </div>
      {logos.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {logos.map((logo) => <div key={logo} className="flex h-12 items-center justify-center rounded-[10px] border border-[#f0f2f5] bg-white px-2 text-center text-[11px] font-semibold text-[#8b95a4] shadow-[0_5px_14px_rgba(37,52,77,.04)]">{logo}</div>)}
      </div> : null}
    </section> : null}
    {config.serviceCta ? <section className="mx-auto mt-14 flex max-w-[1120px] items-center justify-between gap-6 overflow-hidden rounded-[18px] bg-[#202940] px-8 py-7 text-white shadow-[0_16px_36px_rgba(32,41,64,.15)]"><div><h2 className="text-[18px] font-semibold">{config.serviceCta.title}</h2><button type="button" className="mt-5 rounded-[7px] bg-white px-6 py-2.5 text-[12px] font-medium text-[#263247] transition hover:bg-[#eef3fb]">{config.serviceCta.buttonLabel}</button></div><div className="flex items-center gap-3"><div className="flex h-[92px] w-[92px] items-center justify-center rounded-[10px] border-4 border-white bg-[#f5f7fb] text-[42px] text-[#202940]">▦</div><div className="rounded-[8px] bg-[#168ff2] px-4 py-3 text-[12px] font-medium leading-5">{config.serviceCta.qrTitle.split('\n').map((line) => <div key={line}>{line}</div>)}<span className="mt-1 block text-[10px] font-normal text-white/70">{config.serviceCta.qrDescription}</span></div></div></section> : null}
  </>;
}

function BenefitQrCode({ qrCode, compact = false }: { qrCode: NonNullable<MembershipPlan['benefitSections']>[number]['qrCode']; compact?: boolean }) {
  if (!qrCode) return null;

  const qrFrameStyle = {
    backgroundColor: qrCode.backgroundColor ?? '#f5f7fb',
    borderColor: qrCode.borderColor ?? '#e2e8f0',
  };

  return <div className={`flex shrink-0 ${compact ? 'items-center gap-1.5' : 'flex-col items-center gap-1'}`} aria-label={qrCode.label ?? '二维码'}>
    {qrCode.imageUrl ? <img src={qrCode.imageUrl} alt={qrCode.label ?? '二维码'} className={`${compact ? 'h-10 w-10 rounded-[5px]' : 'h-14 w-14 rounded-[6px]'} border object-cover`} style={qrFrameStyle} /> : <div className={`flex items-center justify-center rounded-[6px] border ${compact ? 'h-10 w-10' : 'h-14 w-14'}`} style={qrFrameStyle}><QrCode className={compact ? 'h-7 w-7 text-[#273143]' : 'h-10 w-10 text-[#273143]'} strokeWidth={1.6} /></div>}
    {compact ? <div className="flex flex-col items-start leading-4">{qrCode.label ? <span className="whitespace-nowrap text-[9px] font-medium text-[#5d6878]">{qrCode.label}</span> : null}{qrCode.description ? <span className="whitespace-nowrap text-[8px] text-[#9aa3af]">{qrCode.description}</span> : null}</div> : <>{qrCode.label ? <span className="whitespace-nowrap text-[9px] font-medium text-[#5d6878]">{qrCode.label}</span> : null}{qrCode.description ? <span className="whitespace-nowrap text-[8px] text-[#9aa3af]">{qrCode.description}</span> : null}</>}
  </div>;
}

function BenefitModelIcon({ type, className = '' }: { type: 'image' | 'video'; className?: string }) {
  const Icon = type === 'video' ? Video : ImageIcon;
  const tone = type === 'video' ? 'bg-[#fff1e8] text-[#f17b3a]' : 'bg-[#eaf4ff] text-[#168ff2]';
  return <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] ${tone} ${className}`} aria-hidden="true"><Icon className="h-3 w-3" strokeWidth={1.8} /></span>;
}

function getBenefitItemIcon(item: MembershipBenefitItem): 'image' | 'video' | undefined {
  if (item.icon) return item.icon;
  if (/智能Image|Seedream/i.test(item.label)) return 'image';
  if (/Seedance/i.test(item.label)) return 'video';
  return undefined;
}

function PlanCard({ plan, selected, cycleKey, cycleName, tierIndex = 0, onTierChange, enterprise = false, seats = 1, minimumSeats = 1, onSeatChange, onContactAdvisor, onPurchase, onPurchaseBlocked, purchaseButtonRef, coupons = [], currentMemberLevel, currentMemberName }: { plan: MembershipPlan; selected: boolean; cycleKey: string; cycleName: string; tierIndex?: number; onTierChange?: (index: number) => void; enterprise?: boolean; seats?: number; minimumSeats?: number; onSeatChange?: (delta: number) => void; onContactAdvisor?: () => void; onPurchase?: () => void; onPurchaseBlocked?: (message: string) => void; purchaseButtonRef?: Ref<HTMLButtonElement>; coupons?: MembershipCoupon[]; currentMemberLevel?: number | null; currentMemberName?: string }) {
  const isBlue = plan.color === 'blue';
  const isOrange = plan.color === 'orange';
  const cycleData = getCyclePlanData(plan, cycleKey);
  const activeTier = cycleData.tierOptions?.[tierIndex] ?? cycleData.tierOptions?.[0];
  const promotion = getPackagePromotion(activeTier?.saleDescription ?? cycleData.saleDescription);
  const promotionColor = promotion.color || (isOrange ? '#ff7910' : '#168ff2');
  const promoBanner = promotion.bannerText ? { text: promotion.bannerText, color: promotionColor } : null;
  const promoTag = promotion.tagText ? { text: promotion.tagText, color: promotionColor } : null;
  const isFeatured = isBlue || isOrange || Boolean(promoBanner);
  const displayPrice = activeTier?.price ?? cycleData.price;
  const displayOriginalPrice = activeTier?.originalPrice ?? cycleData.originalPrice;
  const pointsAreOneTime = activeTier ? activeTier.pointsNote.includes('一次性') : cycleData.points.trim().endsWith('积分一次性');
  const displayPoints = activeTier ? `${activeTier.points} ${pointsAreOneTime ? '积分一次性' : '积分每月'}` : cycleData.points;
  const displayPointsNote = activeTier?.pointsNote ?? cycleData.pointsNote;
  const pointsUnit = displayPointsNote.split('·')[0]?.trim() ?? '每人';
  const displayPointsDescription = activeTier?.pointsDescription || cycleData.pointsDescription;
  const displayMonthlyPrice = activeTier?.monthlyPrice ?? cycleData.monthlyPrice;
  const pointPrice = formatPackagePointPrice(pointsAreOneTime ? displayPrice : displayMonthlyPrice, activeTier?.points ?? displayPoints);
  const monthlyPriceLabel = displayMonthlyPrice === '-' ? '月价暂无' : `¥${displayMonthlyPrice}${enterprise ? '/席位' : ''}/月`;
  const pointPriceLabel = pointPrice === '-' ? '积分价暂无' : `¥${pointPrice}/积分`;
  const renewalPrice = activeTier?.renewalPrice ?? cycleData.renewalPrice;
  const renewalPriceText = renewalPrice ? `${renewalPrice}元` : '当前套餐价格';
  const durationDays = activeTier?.durationDays ?? cycleData.durationDays;
  const packageType = activeTier?.packageType ?? cycleData.packageType;
  const expiryDate = formatExpiryDate(durationDays);
  const isContractPlan = (packageType === '订阅套餐' || packageType === '低价试用且订阅套餐') && Boolean(expiryDate);
  const seatCount = enterprise && isContractPlan ? 1 : Math.max(minimumSeats, seats);
  const isLargeEnterprisePurchase = enterprise && seatCount > 20;
  const purchaseAction = getMembershipPurchaseAction(currentMemberLevel, plan.memberLevel, currentMemberName);
  const isDowngradePurchase = purchaseAction.kind === 'downgrade';
  const isEnterpriseContractSeatBlocked = enterprise && isContractPlan && minimumSeats > 1;
  const isPurchaseDisabled = isDowngradePurchase || isEnterpriseContractSeatBlocked;
  const purchaseBlockedMessage = isEnterpriseContractSeatBlocked
    ? '当前席位数高于可购买的席位数无法购买，请选择企业使用的非签约套餐'
    : purchaseAction.helperText ?? '当前套餐暂不可购买';
  const coupon = getApplicableMembershipCoupon(displayPrice, coupons, { memberLevel: plan.memberLevel, durationDays, packageType });
  const couponDiscount = getCouponDiscount(displayPrice, coupon, { memberLevel: plan.memberLevel, durationDays, packageType });
  const discountedDisplayPrice = Math.max(0, (Number(displayPrice.replace(/,/g, '')) || 0) - couponDiscount);
  const totalPrice = multiplyMoney(displayPrice, seatCount);
  const discountedTotalPrice = formatMoney(discountedDisplayPrice * seatCount);
  const totalMonthlyPrice = multiplyMoney(displayMonthlyPrice, seats);
  const enterprisePointsUnit = pointsAreOneTime
    ? (pointsUnit === '团队' ? '积分/团队/一次性' : '积分/席/一次性')
    : (pointsUnit === '团队' ? '积分/团队/月' : '积分/席/月');
  const pointsDisplayLabel = enterprise
    ? displayPoints.replace(pointsAreOneTime ? '积分一次性' : '积分每月', enterprisePointsUnit)
    : displayPoints;
  const tierProgress = cycleData.tierOptions ? (tierIndex / (cycleData.tierOptions.length - 1)) * 100 : 0;
  const shell = isOrange
    ? `border-[#ff7b12] bg-[#fffaf4] ${selected ? 'shadow-[0_18px_40px_rgba(255,123,18,.18)]' : 'shadow-[0_12px_28px_rgba(255,123,18,.1)]'}`
    : isBlue
      ? `border-[#168ff2] bg-[#f7fbff] ${selected ? 'shadow-[0_18px_40px_rgba(22,143,242,.18)]' : 'shadow-[0_12px_28px_rgba(22,143,242,.1)]'}`
      : 'border-[#e8ebf0] bg-white shadow-[0_12px_28px_rgba(41,57,83,.06)]';
  const accent = isOrange ? '#ff7910' : '#168ff2';
  const emphasized = selected || isFeatured;
  const benefitSections = (plan.benefitSections ?? [{ title: '专享权益', items: plan.features.map((feature) => ({ label: feature, enabled: true, badge: '专属通道' })) }]).map((section) => (
    plan.planKey === 'flagship' && section.title === '专享权益' && !section.qrCode
      ? { ...section, qrCode: { label: '扫码咨询', description: '专属顾问' } }
      : section
  ));
  const purchaseInfoStyle = plan.purchaseInfoStyle ?? {};
  const purchaseInfoHasContainerStyle = Boolean(purchaseInfoStyle.backgroundColor || purchaseInfoStyle.borderColor);
  const purchaseInfoInlineStyle = {
    color: purchaseInfoStyle.textColor ?? '#9aa2ae',
    backgroundColor: purchaseInfoStyle.backgroundColor,
    borderColor: purchaseInfoStyle.borderColor,
  };

  return <article className={`relative flex ${isFeatured ? 'min-h-[678px] -mt-7' : 'min-h-[650px]'} flex-col overflow-hidden rounded-[18px] border ${shell}`}>
    {promoBanner ? <div className="h-7 shrink-0 px-4 text-center text-[10px] font-medium leading-7" style={{ backgroundColor: promoBanner.color, color: '#ffffff' }}>{promoBanner.text}</div> : null}
    <div className="px-5 pb-4 pt-5">
      <div className="flex items-start justify-between gap-2"><div className="min-w-0 flex-1"><h3 className="text-[16px] font-semibold text-[#202938]">{plan.name}</h3><p className="mt-1 h-8 overflow-hidden text-[11px] leading-4 text-[#8590a0] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{plan.subtitle}</p></div>{promoTag ? <span className="shrink-0 rounded-[5px] px-1.5 py-1 text-[9px] font-medium" style={{ backgroundColor: promoTag.color, color: '#ffffff' }}>{promoTag.text}</span> : null}</div>
      <div className="mt-4 flex items-end gap-1 text-[#212a3a]"><span className="mb-1 text-[12px]">¥</span><AnimatedDiscountedPrice price={displayPrice} couponDiscount={couponDiscount} />{enterprise ? <span className="mb-1 text-[11px] text-[#7f8999]">/席位/{cycleData.period}</span> : <span className="mb-1 text-[10px] text-[#7f8999]">{cycleData.period}</span>}{couponDiscount > 0 ? <span className="mb-1 ml-1 rounded-[4px] bg-[#fff0f0] px-1.5 py-0.5 text-[9px] font-medium text-[#f04444]">已优惠{formatMoney(couponDiscount)}元</span> : null}{displayOriginalPrice ? <del className="mb-1 ml-1 text-[10px] text-[#aeb5bf]">¥{displayOriginalPrice}</del> : null}</div>
      <p className="mt-2 text-[10px] leading-4 text-[#929aa7]">{monthlyPriceLabel}<span className="mx-1 text-[#c1c7d0]">·</span>{pointPriceLabel}</p>
    {enterprise ? <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[#566274]"><div className="flex items-center overflow-hidden rounded-[9px] border border-[#eef0f3] bg-white"><button type="button" aria-label="减少席位" disabled={isContractPlan || seatCount <= minimumSeats} title={isContractPlan ? '签约套餐仅支持1个席位' : seatCount <= minimumSeats ? `最少需要${minimumSeats}个席位` : undefined} onClick={() => onSeatChange?.(-1)} className="flex h-8 w-8 items-center justify-center text-[16px] text-[#aab2bd] disabled:cursor-not-allowed disabled:opacity-40 hover:text-[#168ff2]">−</button><span className="min-w-[54px] text-center font-medium text-[#374255]">{seatCount} 席位</span><button type="button" aria-label="增加席位" disabled={isContractPlan} title={isContractPlan ? '签约套餐仅支持1个席位' : undefined} onClick={() => onSeatChange?.(1)} className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[16px] text-[#566274] shadow-[0_1px_5px_rgba(34,48,70,.06)] disabled:cursor-not-allowed disabled:opacity-40 hover:text-[#168ff2]">＋</button></div><span className="whitespace-nowrap text-[#6d7888]">合计 <b className="text-[13px] text-[#293548]">{couponDiscount > 0 ? discountedTotalPrice : totalPrice}元</b></span></div> : null}
    </div>
    {cycleData.tierOptions ? <div className="mx-5 mt-1 h-[64px] px-0"><div className="mb-1.5 flex items-center justify-between text-[10px] text-[#586474]">{cycleData.tierOptions.map((tier, index) => <button type="button" key={tier.quotaLabel} onClick={() => onTierChange?.(index)} className={`cursor-pointer ${index === tierIndex ? 'font-semibold text-[#202938]' : 'hover:text-[#168ff2]'}`}>{tier.quotaLabel}</button>)}</div><div className="relative h-5"><div className="absolute left-0 right-0 top-2 h-[4px] rounded-full bg-[#4b4f55]" /><span className="pointer-events-none absolute top-0 h-4 w-4 -translate-x-1/2 rounded-full border border-[#6f747b] bg-white shadow-[0_1px_3px_rgba(31,41,55,.16)]" style={{ left: `${tierProgress}%` }} /><input type="range" min={0} max={cycleData.tierOptions.length - 1} step={1} value={tierIndex} onChange={(event) => onTierChange?.(Number(event.currentTarget.value))} aria-label="高级会员积分档位" className="absolute inset-0 h-5 w-full cursor-pointer opacity-0" /></div></div> : <div className="mx-5 mt-1 h-[64px]" aria-hidden="true" />}
    <div className={`mx-4 rounded-[12px] px-4 py-3 ${emphasized ? isOrange ? 'bg-[#fff0dc]' : isBlue ? 'bg-[#eaf4ff]' : 'bg-[#eef1f5]' : 'bg-[#f7f8fa]'}`}><div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: emphasized ? accent : '#3e4858' }}><Sparkles className="h-3.5 w-3.5" />{pointsDisplayLabel}</div><p className="mt-1 text-[10px] text-[#8e98a7]">{displayPointsDescription || displayPointsNote}</p></div>
    <div className="px-4 pt-4"><button ref={purchaseButtonRef} type="button" aria-disabled={isPurchaseDisabled} title={isEnterpriseContractSeatBlocked ? '请选择企业使用的非签约套餐' : isDowngradePurchase ? purchaseAction.helperText : undefined} onClick={isPurchaseDisabled ? () => onPurchaseBlocked?.(purchaseBlockedMessage) : isLargeEnterprisePurchase ? onContactAdvisor : onPurchase} className={`h-9 w-full rounded-full text-[12px] font-medium transition ${isPurchaseDisabled ? 'cursor-not-allowed bg-[#eef1f5] text-[#9aa3af] shadow-none' : emphasized ? isOrange ? 'bg-[#ff7910] text-white hover:bg-[#ed6904]' : 'bg-[#168ff2] text-white hover:bg-[#087edc]' : 'bg-[#202938] text-white shadow-[0_5px_12px_rgba(32,41,56,.16)] hover:bg-[#111827]'}`}>{isDowngradePurchase ? purchaseAction.buttonText : isEnterpriseContractSeatBlocked ? '请选择企业使用的非签约套餐' : isLargeEnterprisePurchase ? '联系专属顾问' : purchaseAction.buttonText}</button>{isDowngradePurchase ? <p className="mt-2 text-center text-[10px] leading-4 text-[#f04444]">{purchaseAction.helperText}</p> : isEnterpriseContractSeatBlocked ? <p className="mt-2 text-center text-[10px] leading-4 text-[#f04444]">当前席位数高于可购买的席位数无法购买</p> : isLargeEnterprisePurchase ? <p className="mt-2 text-center text-[10px] leading-4 text-[#f04444]">大规模企业采购，联系专属客服获取优惠</p> : isContractPlan ? <div className={`mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] leading-4 ${purchaseInfoHasContainerStyle ? 'rounded-[5px] border px-2 py-1' : ''}`} style={purchaseInfoInlineStyle}><span style={{ color: purchaseInfoStyle.secondaryColor ?? purchaseInfoStyle.textColor ?? '#90a0b7' }}>到期后将按照{getRenewalPeriod(cycleData.period)}<strong className="font-semibold text-[#202938]">{renewalPriceText}</strong>自动续费，可随时取消</span><span aria-label="续费说明" title="续费说明" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#edf0f4] text-[10px] font-semibold text-[#8793a5]">?</span></div> : expiryDate ? <div className={`mt-2 text-center text-[10px] leading-4 ${purchaseInfoHasContainerStyle ? 'rounded-[5px] border px-2 py-1' : ''}`} style={purchaseInfoInlineStyle}><span style={{ color: purchaseInfoStyle.dateColor ?? purchaseInfoStyle.textColor ?? '#9aa2ae' }}>购买后有效期至：{expiryDate}</span></div> : <p className={`mt-2 text-center text-[10px] ${purchaseInfoHasContainerStyle ? 'rounded-[5px] border px-2 py-1' : ''}`} style={purchaseInfoInlineStyle}>一次性购买</p>}</div>
    <div className="mt-5 flex-1 border-t border-[#eef0f3] px-5 pb-5 pt-5">
      {benefitSections.map((section, sectionIndex) => {
        const sectionStyle = section.highlightStyle;
        const highlightedSection = Boolean(sectionStyle && sectionStyle.enabled !== false);
        const isPersonalProfessionalExclusiveSection = plan.memberType === '专业版（个人）' && section.title === '专享权益';
        const isFlagshipExclusiveSection = plan.planKey === 'flagship' && section.title === '专享权益';
        const isBorderlessExclusiveSection = isPersonalProfessionalExclusiveSection || isFlagshipExclusiveSection;
        const hasModelItems = section.items.some((item) => Boolean(getBenefitItemIcon(item)));
        const sectionContainerStyle = highlightedSection ? {
          backgroundColor: isPersonalProfessionalExclusiveSection ? '#eaf4ff' : sectionStyle?.backgroundColor,
          borderColor: isBorderlessExclusiveSection ? undefined : sectionStyle?.borderColor,
        } : undefined;
        const sectionTitleStyle = highlightedSection ? { color: sectionStyle?.titleColor } : undefined;
        const sectionClassName = `${sectionIndex > 0 ? 'mt-5' : ''} ${highlightedSection ? `rounded-[14px] ${isBorderlessExclusiveSection ? '' : 'border'} py-3 ${hasModelItems ? 'pl-0 pr-3' : 'px-3'}` : ''}`;
        return <section key={`${section.title}-${sectionIndex}`} className={sectionClassName} style={sectionContainerStyle}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-semibold text-[#273143]" style={sectionTitleStyle}>{section.title}</h4>
              <div className="flex items-center gap-2">
                {section.badge ? <span className="rounded-[4px] bg-[#f1f3f6] px-1.5 py-0.5 text-[9px] text-[#929baa]">{section.badge}</span> : null}
                {section.actionLabel ? <button type="button" className={`text-[11px] font-medium ${isOrange ? 'text-[#ff6f2a]' : 'text-[#168ff2]'}`}>{section.actionLabel}</button> : null}
              </div>
            </div>
          </div>
          {section.qrCode ? <BenefitQrCode qrCode={section.qrCode} compact /> : null}
        </div>
        <ul className="mt-3 space-y-2.5">
          {section.items.map((item, itemIndex) => {
            const enabled = item.enabled !== false;
            const itemTextStyle = enabled && highlightedSection ? { color: sectionStyle?.textColor } : undefined;
            const itemIconStyle = enabled ? { color: highlightedSection ? sectionStyle?.iconColor : isFeatured || selected ? accent : '#697789' } : undefined;
            const itemBadgeStyle = highlightedSection ? { backgroundColor: sectionStyle?.badgeBackgroundColor, color: sectionStyle?.badgeTextColor } : undefined;
            const modelIcon = getBenefitItemIcon(item);
            const isModelItem = Boolean(modelIcon);
            return <li key={`${item.label}-${itemIndex}`} className={`flex items-start gap-2 text-[11px] leading-4 ${isModelItem ? 'py-1.5 pr-2' : ''} ${enabled ? 'text-[#5d6878]' : 'text-[#a6afbc]'}`} style={itemTextStyle}>
              {modelIcon ? <BenefitModelIcon type={modelIcon} /> : enabled ? <Check className="mt-[2px] h-3.5 w-3.5 shrink-0" style={itemIconStyle} /> : <X className="mt-[2px] h-3.5 w-3.5 shrink-0 text-[#b9c0ca]" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start gap-1.5">
                  <span>{item.label}</span>
                  {item.badge ? <span className="rounded-[4px] px-1 py-0.5 text-[9px] leading-3" style={itemBadgeStyle ?? { backgroundColor: '#f1f3f6', color: '#929baa' }}>{item.badge}</span> : null}
                </div>
                {item.detail ? <div className="mt-0.5 text-[10px] leading-4 text-[#ff6f4a]">{item.detail}</div> : null}
              </div>
            </li>;
          })}
        </ul>
        {section.highlight ? <div className={`mt-3 rounded-[14px] border p-3 ${section.highlight.tone === 'orange' ? 'border-[#ff6f3d] bg-[#fff2ec]' : 'border-[#2c73ff] bg-[#edf5ff]'}`}>
          <div className={`text-[12px] font-semibold ${section.highlight.tone === 'orange' ? 'text-[#ff6f3d]' : 'text-[#145cff]'}`}>{section.highlight.title}</div>
          <ul className="mt-2 space-y-2">
            {section.highlight.items.map((item, itemIndex) => <li key={`${item.label}-${itemIndex}`} className="flex items-center gap-2 text-[11px] text-[#5d6878]">
              <span className="shrink-0 text-[#9aa3af]">▥</span><span className="min-w-0 flex-1 truncate">{item.label}</span>{item.badge ? <span className={`shrink-0 rounded-[4px] px-1 py-0.5 text-[9px] ${section.highlight?.tone === 'orange' ? 'bg-[#ffe0d5] text-[#ff6f3d]' : 'bg-[#dceaff] text-[#145cff]'}`}>{item.badge}</span> : null}
            </li>)}
          </ul>
        </div> : null}
      </section>;
      })}
    </div>
  </article>;
}

export function MembershipCenterModal({ onClose, currentMember }: MembershipCenterModalProps) {
  const initialIdentity = MEMBERSHIP_PREVIEW_IDENTITIES.find((identity) => identity.memberLevel === (currentMember?.memberLevel ?? null)) ?? MEMBERSHIP_PREVIEW_IDENTITIES[0];
  const [selectedIdentityKey, setSelectedIdentityKey] = useState<MembershipPreviewIdentity['key']>(initialIdentity.key);
  const [identityMenuOpen, setIdentityMenuOpen] = useState(false);
  const identityMenuRef = useRef<HTMLDivElement>(null);
  const selectedIdentity = MEMBERSHIP_PREVIEW_IDENTITIES.find((identity) => identity.key === selectedIdentityKey) ?? MEMBERSHIP_PREVIEW_IDENTITIES[0];
  const currentMemberLevel = selectedIdentity.memberLevel;
  const currentMemberName = currentMember?.memberLevel === currentMemberLevel ? currentMember.memberName ?? selectedIdentity.memberName : selectedIdentity.memberName;
  const currentMemberValidUntil = currentMember?.memberLevel === currentMemberLevel ? currentMember.validUntil ?? selectedIdentity.validUntil : selectedIdentity.validUntil;
  const currentMemberRemainingPoints = currentMember?.memberLevel === currentMemberLevel ? currentMember.remainingPoints ?? selectedIdentity.remainingPoints : selectedIdentity.remainingPoints;
  const currentTeamMemberCount = currentMember?.memberLevel === currentMemberLevel ? currentMember.teamMemberCount ?? selectedIdentity.teamMemberCount : selectedIdentity.teamMemberCount;
  const currentPurchasedSeats = currentMember?.memberLevel === currentMemberLevel ? currentMember.purchasedSeats ?? selectedIdentity.purchasedSeats : selectedIdentity.purchasedSeats;
  const [membershipType, setMembershipType] = useState<'personal' | 'enterprise'>(initialIdentity.membershipType);
  const [activeCycle, setActiveCycle] = useState(0);
  const [tierSelections, setTierSelections] = useState<Record<string, number>>({});
  const [enterpriseSeats, setEnterpriseSeats] = useState<Record<string, number>>({});
  const [pageConfig, setPageConfig] = useState<MembershipPageContent>(() => readMembershipPageConfig('web'));
  const [packageDetails, setPackageDetails] = useState<PackageDetailRow[]>(() => readWebMembershipPackageDetails());
  const [promotionDeadline] = useState(() => Date.now() + promotionDurationMs);
  const [remainingMs, setRemainingMs] = useState(promotionDurationMs);
  const [retentionOpen, setRetentionOpen] = useState(false);
  const [retentionPlanIndex, setRetentionPlanIndex] = useState(0);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [pointsPurchaseOpen, setPointsPurchaseOpen] = useState(false);
  const [paymentSelection, setPaymentSelection] = useState<MembershipPaymentSelection | null>(null);
  const [enterprisePurchaseContactOpen, setEnterprisePurchaseContactOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<MembershipCoupon[]>(() => readAvailableMembershipCoupons());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const packageSectionRef = useRef<HTMLElement>(null);
  const purchaseButtonRef = useRef<HTMLButtonElement>(null);
  const [showStickyPurchase, setShowStickyPurchase] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef<number | null>(null);
  const enterpriseMinimumSeats = currentMemberLevel == null ? Math.max(1, currentTeamMemberCount) : Math.max(1, currentPurchasedSeats ?? 1);
  const changeMembershipType = (type: 'personal' | 'enterprise') => {
    setMembershipType(type);
    setActiveCycle(0);
    setEnterpriseSeats({});
  };
  const getEnterpriseSeatCount = (planKey: string) => Math.max(enterpriseMinimumSeats, enterpriseSeats[planKey] ?? enterpriseMinimumSeats);
  const updateEnterpriseSeats = (planKey: string, delta: number) => {
    setEnterpriseSeats((current) => ({ ...current, [planKey]: Math.max(enterpriseMinimumSeats, (current[planKey] ?? enterpriseMinimumSeats) + delta) }));
  };
  const selectIdentity = (identity: MembershipPreviewIdentity) => {
    setSelectedIdentityKey(identity.key);
    changeMembershipType(identity.membershipType);
    setIdentityMenuOpen(false);
  };
  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 2400);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!identityMenuOpen) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!identityMenuRef.current?.contains(event.target as Node)) setIdentityMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [identityMenuOpen]);

  useEffect(() => {
    const updateCountdown = () => setRemainingMs(Math.max(0, promotionDeadline - Date.now()));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [promotionDeadline]);

  useEffect(() => {
    const reloadPageConfig = () => {
      setPageConfig(readMembershipPageConfig('web'));
      setPackageDetails(readWebMembershipPackageDetails());
    };
    window.addEventListener('storage', reloadPageConfig);
    window.addEventListener('membership-page-config-updated', reloadPageConfig);
    window.addEventListener('membership-package-details-updated', reloadPageConfig);

    return () => {
      window.removeEventListener('storage', reloadPageConfig);
      window.removeEventListener('membership-page-config-updated', reloadPageConfig);
      window.removeEventListener('membership-package-details-updated', reloadPageConfig);
    };
  }, []);

  useEffect(() => {
    const reloadCoupon = () => setAvailableCoupons(readAvailableMembershipCoupons());
    window.addEventListener('storage', reloadCoupon);
    window.addEventListener('membership-coupon-updated', reloadCoupon);

    return () => {
      window.removeEventListener('storage', reloadCoupon);
      window.removeEventListener('membership-coupon-updated', reloadCoupon);
    };
  }, []);

  const countdown = formatCountdown(remainingMs);
  const personalTab = pageConfig.plans.tabs.find((tab) => tab.key === 'personal');
  const enterpriseTab = pageConfig.plans.tabs.find((tab) => tab.key === 'enterprise');
  const activeTab = pageConfig.plans.tabs.find((tab) => tab.key === membershipType) ?? pageConfig.plans.tabs[0];
  const cycleOptions = activeTab?.options ?? [];
  const activeVipLevels = new Map(activeTab?.viplevel?.map((vipLevel) => [vipLevel.level, vipLevel]) ?? []);
  const activeMemberLevels = new Set(activeVipLevels.keys());
  const selectedCycle = Math.min(activeCycle, Math.max(cycleOptions.length - 1, 0));
  const selectedCycleConfig = cycleOptions[selectedCycle];
  const visiblePlans = cycleOptions.length === 0 ? [] : (pageConfig.overview.planCards?.[membershipType] ?? [])
    .map((plan) => {
      const memberLevel = resolveMemberLevel(plan, membershipType);
      const vipLevel = memberLevel == null ? undefined : activeVipLevels.get(memberLevel);
      const displayPlan = vipLevel
        ? { ...plan, name: vipLevel.displayName, subtitle: vipLevel.subtitle, memberType: vipLevel.memberName, memberLevel: vipLevel.level }
        : plan;
      return hydratePlan(displayPlan, membershipType, cycleOptions, packageDetails);
    })
    .filter((plan) => activeMemberLevels.size === 0 || activeMemberLevels.has(plan.memberLevel))
    .filter((plan) => !selectedCycleConfig || getCyclePackageRows(plan.memberLevel, selectedCycleConfig, packageDetails).length > 0)
    .filter((plan, index, plans) => plans.findIndex((item) => item.memberLevel === plan.memberLevel) === index);
  const activeCycleKey = cycleOptions[selectedCycle]?.key ?? 'yearly';
  const couponCycleKeys = new Set(cycleOptions.filter((cycle) => visiblePlans.some((plan) => {
    const cycleData = getCyclePlanData(plan, cycle.key);
    const activeTier = cycleData.tierOptions?.[0];
    const price = activeTier?.price ?? cycleData.price;
    const durationDays = activeTier?.durationDays ?? cycleData.durationDays;
    const packageType = activeTier?.packageType ?? cycleData.packageType;
    return getApplicableMembershipCoupon(price, availableCoupons, { memberLevel: plan.memberLevel, durationDays, packageType }) != null;
  })).map((cycle) => cycle.key));
  const activeDetails = pageConfig.details[membershipType];
  const openPayment = (plan: MembershipPlan, cycleKey: string, cycleName: string, tierIndex: number, enterprise: boolean, seats: number) => {
    setPaymentSelection({ plan, cycleKey, cycleName, tierIndex, enterprise, seats });
  };
  const requestClose = () => {
    const preferredIndex = membershipType === 'enterprise' ? 3 : 2;
    setRetentionPlanIndex(Math.min(preferredIndex, Math.max(visiblePlans.length - 1, 0)));
    setRetentionOpen(true);
  };

  useEffect(() => {
    const root = scrollContainerRef.current;
    const target = purchaseButtonRef.current;
    if (!root || !target) {
      setShowStickyPurchase(false);
      return undefined;
    }

    const updateStickyVisibility = () => {
      const rootRect = root.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const purchaseButtonHidden = targetRect.bottom <= rootRect.top + 48 && targetRect.top < rootRect.top;
      setShowStickyPurchase(root.scrollTop > 0 && purchaseButtonHidden);
    };
    updateStickyVisibility();
    root.addEventListener('scroll', updateStickyVisibility, { passive: true });
    window.addEventListener('resize', updateStickyVisibility);
    return () => {
      root.removeEventListener('scroll', updateStickyVisibility);
      window.removeEventListener('resize', updateStickyVisibility);
    };
  }, [activeCycleKey, membershipType, visiblePlans.length]);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f2937]/35 p-0 text-[#202938]" role="dialog" aria-modal="true" aria-label="会员中心">
    <div className="relative h-[100vh] max-h-[100vh] w-[90vw] overflow-hidden rounded-[22px] bg-white shadow-[0_24px_80px_rgba(15,23,42,.24)]">
      <div ref={scrollContainerRef} className="h-full overflow-x-hidden overflow-y-auto overscroll-x-none bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_58%,#f7f9fc_100%)]">
      <header className="sticky top-0 z-10 relative border-b border-[#edf0f4] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[48px] max-w-[1240px] items-center justify-between px-5 pr-16">
          <div className="flex min-w-0 items-center gap-3 text-[12px] text-[#657084]"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#efc7b4,#91a9c1)] text-[10px] text-white">营</span><span className="font-medium text-[#364052]">营萱</span>{currentMemberLevel == null ? <><span className="min-w-0 truncate">{currentMemberName}</span><span className="max-w-[220px] shrink-0 truncate">升级会员畅享模板AI创作权益</span></> : <span className="min-w-0 truncate">{currentMemberName}·有效期至{currentMemberValidUntil}</span>}<span className="shrink-0 text-[#d2d6dd]">|</span><span className="shrink-0 whitespace-nowrap">剩余积分：<b className="font-medium text-[#414b5b]">{currentMemberRemainingPoints}</b></span></div>
          <div className="flex shrink-0 items-center gap-3 text-[12px] text-[#657084]"><div ref={identityMenuRef} className="relative"><button type="button" aria-haspopup="listbox" aria-expanded={identityMenuOpen} onClick={() => setIdentityMenuOpen((current) => !current)} className="flex items-center gap-1 whitespace-nowrap rounded-full border border-[#dfe5ee] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#4e5a6c] shadow-[0_2px_7px_rgba(31,50,81,.06)] transition hover:border-[#a9c3e6] hover:text-[#168ff2]">身份：{selectedIdentity.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${identityMenuOpen ? 'rotate-180' : ''}`} /></button>{identityMenuOpen ? <div role="listbox" className="absolute right-0 top-[calc(100%+8px)] z-[30] w-[190px] rounded-[12px] border border-[#e4e9f0] bg-white p-1.5 shadow-[0_10px_24px_rgba(31,50,81,.16)]">{MEMBERSHIP_PREVIEW_IDENTITIES.map((identity) => <button type="button" role="option" aria-selected={identity.key === selectedIdentityKey} key={identity.key} onClick={() => selectIdentity(identity)} className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-[11px] transition ${identity.key === selectedIdentityKey ? 'bg-[#edf6ff] font-semibold text-[#168ff2]' : 'text-[#536075] hover:bg-[#f7f8fa] hover:text-[#168ff2]'}`}><span>{identity.label}</span>{identity.key === selectedIdentityKey ? <span className="text-[10px]">当前</span> : null}</button>)}</div> : null}</div><button type="button" onClick={() => setCouponModalOpen(true)} className="whitespace-nowrap hover:text-[#168ff2]">优惠券/码</button><button type="button" onClick={() => setEnterprisePurchaseContactOpen(true)} className="whitespace-nowrap hover:text-[#168ff2]">咨询客服</button></div>
        </div>
        <button type="button" onClick={requestClose} aria-label="关闭会员中心" className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e9ef] bg-white text-[#7e8999] shadow-[0_4px_14px_rgba(38,53,79,.08)] transition hover:border-[#bdc7d7] hover:text-[#263247]"><X className="h-4 w-4" /></button>
      </header>
      {showStickyPurchase ? <StickyPurchaseBar plans={visiblePlans} details={activeDetails} packageDetails={packageDetails} membershipType={membershipType} currentMemberLevel={currentMemberLevel} currentMemberName={currentMemberName} onMembershipTypeChange={changeMembershipType} onPurchase={() => { scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} /> : null}
      <main className="mx-auto max-w-[1240px] px-5 pb-20 pt-0">
        <section className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(112deg,#1588ee_0%,#1b94f7_48%,#ffd57d_100%)] px-6 py-5 shadow-[0_14px_34px_rgba(39,143,238,.17)]"><div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" /><div className="pointer-events-none absolute right-[17%] top-0 h-32 w-32 rounded-full bg-[#fff3d0]/40 blur-2xl" /><div className="relative flex min-h-[82px] items-center justify-between gap-6"><div><div className="mb-3 flex items-center gap-2"><span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#293548]">✦ Seedance 2.5</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-[#293548]">四重福利</span></div><p className="text-[17px] font-semibold text-white">🎟 ¥0.19超低单秒价备战双11</p><p className="mt-1 text-[15px] font-medium text-[#ffe74d]">最高额外加赠2个月会员、4万+积分</p></div><div className="hidden items-center gap-1.5 sm:flex"><CountdownBox value={countdown.days} label="天" /><CountdownBox value={countdown.hours} label="小时" /><CountdownBox value={countdown.minutes} label="分钟" /><CountdownBox value={countdown.seconds} label="秒" /></div></div></section>
        <section className="pt-6"><div className="flex items-center justify-center gap-10 text-[17px] font-semibold"><button type="button" onClick={() => changeMembershipType('personal')} className={`relative pb-3 ${membershipType === 'personal' ? 'text-[#202938]' : 'text-[#9aa1ac]'}`}>{personalTab?.name ?? '个人使用'}{membershipType === 'personal' ? <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#202938]" /> : null}</button><button type="button" onClick={() => changeMembershipType('enterprise')} className={`relative pb-3 ${membershipType === 'enterprise' ? 'text-[#202938]' : 'text-[#9aa1ac]'}`}>{enterpriseTab?.name ?? '企业使用'}{membershipType === 'enterprise' ? <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#202938]" /> : null}</button></div><div className="relative flex flex-wrap items-center justify-center gap-3"><CycleOptionSelector options={cycleOptions} selectedIndex={selectedCycle} onChange={setActiveCycle} couponCycleKeys={couponCycleKeys} className="relative mx-0 mt-4 w-fit max-w-[min(960px,calc(100%-32px))]" /><button type="button" onClick={() => setPointsPurchaseOpen(true)} className="mt-4 shrink-0 whitespace-nowrap rounded-full border border-[#dfe4ec] bg-white px-4 py-2.5 text-[10px] font-medium text-[#4e5a6c] shadow-[0_2px_8px_rgba(31,50,81,.08)] transition hover:border-[#aabff0] hover:text-[#168ff2] md:absolute md:right-0 md:top-0">购买积分</button></div></section>
        <section ref={packageSectionRef} className={`mt-[68px] ${visiblePlans.length === 1 ? 'flex justify-center' : ''}`} style={visiblePlans.length === 1 ? { display: 'flex', justifyContent: 'center' } : undefined}><div className={`grid w-full grid-cols-1 gap-4 sm:grid-cols-2 ${visiblePlans.length === 1 ? 'max-w-[720px] xl:grid-cols-1' : visiblePlans.length === 2 ? 'mx-auto max-w-[1120px] xl:grid-cols-2' : visiblePlans.length <= 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`} style={visiblePlans.length === 1 ? { width: '100%', maxWidth: '720px', margin: '0 auto', gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>{visiblePlans.map((plan, index) => { const tierKey = `${membershipType}:${plan.memberType ?? plan.planKey}:${activeCycleKey}`; const cycleData = getCyclePlanData(plan, activeCycleKey); const hasTiers = Boolean(cycleData.tierOptions?.length); return <PlanCard key={`${plan.memberType ?? plan.planKey}-${index}`} plan={plan} cycleKey={activeCycleKey} selected={plan.color === 'blue' || plan.color === 'orange'} cycleName={selectedCycleConfig?.name ?? cycleData.period} tierIndex={tierSelections[tierKey] ?? 0} onTierChange={hasTiers ? (value) => setTierSelections((current) => ({ ...current, [tierKey]: value })) : undefined} enterprise={membershipType === 'enterprise'} minimumSeats={enterpriseMinimumSeats} seats={getEnterpriseSeatCount(plan.planKey)} onSeatChange={membershipType === 'enterprise' ? (delta) => updateEnterpriseSeats(plan.planKey, delta) : undefined} onContactAdvisor={() => setEnterprisePurchaseContactOpen(true)} onPurchase={() => openPayment(plan, activeCycleKey, selectedCycleConfig?.name ?? cycleData.period, tierSelections[tierKey] ?? 0, membershipType === 'enterprise', getEnterpriseSeatCount(plan.planKey))} onPurchaseBlocked={showToast} purchaseButtonRef={index === 0 ? purchaseButtonRef : undefined} coupons={availableCoupons} currentMemberLevel={currentMemberLevel} currentMemberName={currentMemberName} />; })}</div></section>
        <section className="mx-auto mt-12 max-w-[1120px] rounded-[18px] bg-[#f7f8fa] px-6 py-8"><h2 className="text-center text-[24px] font-semibold tracking-[-.03em] text-[#202a3d]">{pageConfig.details.title}</h2>{activeDetails ? <DetailsComparisonTable config={activeDetails} /> : <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">{(pageConfig.details.sections ?? []).map((section, index) => <div key={`${section.title}-${index}`} className="rounded-[12px] bg-white p-4"><h3 className="text-[13px] font-semibold text-[#394355]">{section.title}</h3><ul className="mt-3 space-y-2">{section.items.map((item) => <li key={item} className="flex items-center gap-2 text-[11px] text-[#6e7887]"><Check className="h-3.5 w-3.5 text-[#168ff2]" />{item}</li>)}</ul></div>)}</div>}</section>
        <section className="mx-auto mt-4 max-w-[1120px] rounded-[18px] bg-[#f7f8fa] px-6 py-8"><h2 className="text-center text-[24px] font-semibold tracking-[-.03em] text-[#202a3d]">{pageConfig.modelConsumption.title}</h2><p className="mx-auto mt-2 max-w-[720px] text-center text-[12px] leading-5 text-[#8792a3]">{pageConfig.modelConsumption.description}</p><ModelConsumptionTable config={pageConfig.modelConsumption} /></section>
        <CommercialLicenseOverview config={pageConfig.commercialLicense} />
        <section className="mx-auto mt-16 max-w-[1120px] rounded-[18px] bg-[#f7f8fa] p-6 sm:p-8"><h2 className="text-center text-[24px] font-semibold tracking-tight text-[#202938]">{pageConfig.faq.title}</h2><div className="mt-7 flex flex-col gap-5 lg:hidden">{pageConfig.faq.items.map((item, index) => <FaqCard key={`${item.question}-${index}`} item={item} index={index} />)}</div><div className="mt-7 hidden grid-cols-2 gap-5 lg:grid"><div className="flex min-w-0 flex-col gap-5">{pageConfig.faq.items.filter((_, index) => index % 2 === 0).map((item, index) => <FaqCard key={item.question} item={item} index={index * 2} />)}</div><div className="flex min-w-0 flex-col gap-5">{pageConfig.faq.items.filter((_, index) => index % 2 === 1).map((item, index) => <FaqCard key={item.question} item={item} index={index * 2 + 1} />)}</div></div></section>
      </main>
      </div>
      {toastMessage ? <div role="status" className="pointer-events-none fixed bottom-8 left-1/2 z-[220] -translate-x-1/2 rounded-[8px] bg-[#263449] px-4 py-3 text-[12px] text-white shadow-[0_12px_30px_rgba(22,34,54,.22)]">{toastMessage}</div> : null}
      {retentionOpen ? <RetentionPurchaseModal cycleOptions={cycleOptions} selectedCycle={selectedCycle} activeCycleKey={activeCycleKey} plans={visiblePlans} selectedPlanIndex={retentionPlanIndex} onCycleChange={(index) => { setActiveCycle(index); setRetentionPlanIndex(0); }} onPlanChange={setRetentionPlanIndex} onContinue={() => setRetentionOpen(false)} onClose={onClose} /> : null}
      {paymentSelection ? <MembershipPaymentModal selection={paymentSelection} coupons={availableCoupons} onClose={() => setPaymentSelection(null)} /> : null}
      {pointsPurchaseOpen ? <MembershipPointsPurchaseModal onClose={() => setPointsPurchaseOpen(false)} /> : null}
      {couponModalOpen ? <MembershipCouponModal coupons={availableCoupons} onClose={() => setCouponModalOpen(false)} /> : null}
      {enterprisePurchaseContactOpen ? <EnterprisePurchaseContactModal config={pageConfig.commercialLicense.enterprisePurchaseContact} onClose={() => setEnterprisePurchaseContactOpen(false)} /> : null}
    </div>
  </div>;
}
