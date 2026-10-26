import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Bell, Camera, ChevronDown, Headphones, MoreHorizontal, Search, Settings2, UserRound } from 'lucide-react';
import cktAiEcomLogo from '../assets/ckt-ai-ecom-logo.svg';
import { getMembershipPurchaseAction } from './MembershipCenterModal';
import { getEnterpriseSeatUnitPrice, getWebMembershipCycleOptions, MEMBERSHIP_UPGRADE_PACKAGE_ID, readMembershipPackageDetails, type PackageDetailRow } from './MembershipPackagePage';
import { MEMBERSHIP_REQUIREMENT_DRAWER_WIDTH, MEMBERSHIP_UPGRADE_REQUIREMENT_META, MEMBERSHIP_UPGRADE_REQUIREMENT_SECTIONS, MembershipRequirementFloatingButton } from './MembershipRequirementFloatingButton';

type MembershipUpgradePageProps = {
  onBack: () => void;
  currentMember?: {
    memberLevel?: number | null;
    memberName?: string;
    validUntil?: string | null;
    remainingPoints?: number | string | null;
    teamMemberCount?: number | null;
    purchasedSeats?: number | null;
    remainingDays?: number | null;
    membershipType?: UpgradeAudience;
  };
};

type UpgradeAudience = 'personal' | 'enterprise';
type UpgradeDisplayMode = 'member' | 'time';

const AUDIENCE_OPTIONS: Array<{ key: UpgradeAudience; label: string; helper: string }> = [
  { key: 'personal', label: '个人使用', helper: '1人使用' },
  { key: 'enterprise', label: '企业使用', helper: '2-20人使用' },
];

type UpgradePreviewIdentity = {
  key: 'free-1' | 'free-5' | 'personal-basic-1' | 'personal-basic-3' | 'enterprise-professional-3';
  label: string;
  memberLevel: number | null;
  memberName: string;
  validUntil: string;
  remainingPoints: number;
  teamMemberCount: number;
  purchasedSeats: number | null;
  membershipType: UpgradeAudience;
};

const UPGRADE_PREVIEW_IDENTITIES: UpgradePreviewIdentity[] = [
  { key: 'free-1', label: '免费版 1人', memberLevel: null, memberName: '免费版', validUntil: '长期有效', remainingPoints: 66, teamMemberCount: 1, purchasedSeats: null, membershipType: 'personal' },
  { key: 'free-5', label: '免费版 5人', memberLevel: null, memberName: '免费版', validUntil: '长期有效', remainingPoints: 66, teamMemberCount: 5, purchasedSeats: null, membershipType: 'enterprise' },
  { key: 'personal-basic-1', label: '基础版（个人）1人', memberLevel: 240, memberName: '基础版（个人）', validUntil: '2027-10-25', remainingPoints: 200, teamMemberCount: 1, purchasedSeats: null, membershipType: 'personal' },
  { key: 'personal-basic-3', label: '基础版（个人）3人', memberLevel: 240, memberName: '基础版（个人）', validUntil: '2027-10-25', remainingPoints: 200, teamMemberCount: 3, purchasedSeats: null, membershipType: 'personal' },
  { key: 'enterprise-professional-3', label: '专业版（企业）3人', memberLevel: 311, memberName: '专业版（企业）', validUntil: '2027-10-25', remainingPoints: 1200, teamMemberCount: 3, purchasedSeats: 3, membershipType: 'enterprise' },
];

function resolveUpgradePreviewIdentity(member?: MembershipUpgradePageProps['currentMember']) {
  const memberLevel = member?.memberLevel ?? null;
  const memberCount = Math.max(1, member?.purchasedSeats ?? member?.teamMemberCount ?? 1);
  if (memberLevel === 240) return UPGRADE_PREVIEW_IDENTITIES.find((identity) => identity.key === (memberCount >= 3 ? 'personal-basic-3' : 'personal-basic-1')) ?? UPGRADE_PREVIEW_IDENTITIES[0];
  if (memberLevel === 311) return UPGRADE_PREVIEW_IDENTITIES.find((identity) => identity.key === 'enterprise-professional-3') ?? UPGRADE_PREVIEW_IDENTITIES[0];
  return UPGRADE_PREVIEW_IDENTITIES.find((identity) => identity.key === (memberCount >= 5 ? 'free-5' : 'free-1')) ?? UPGRADE_PREVIEW_IDENTITIES[0];
}

const AUDIENCE_LEVELS: Record<UpgradeAudience, Array<{ level: number; name: string; shortName: string }>> = {
  personal: [
    { level: 240, name: '基础版（个人）', shortName: '基础版' },
    { level: 241, name: '专业版（个人）', shortName: '专业版' },
  ],
  enterprise: [
    { level: 310, name: '基础版（企业）', shortName: '基础版' },
    { level: 311, name: '专业版（企业）', shortName: '专业版' },
    { level: 312, name: '旗舰版（企业）', shortName: '旗舰版' },
  ],
};

const LEVEL_PRESENTATION: Record<number, { subtitle: string; accent: 'neutral' | 'blue' | 'orange' }> = {
  240: { subtitle: '100万模板在线编辑，快速出图', accent: 'neutral' },
  241: { subtitle: 'AI创作设计、视频，创意笔下生花', accent: 'blue' },
  310: { subtitle: '100万模板+团队协作与共享+商用授权', accent: 'neutral' },
  311: { subtitle: '100万模板+AI全能创作+团队协作与共享', accent: 'blue' },
  312: { subtitle: '适合大型企业，灵活的算力配额，支持20人以上席位灵活配置', accent: 'orange' },
};

const formatMoney = (value: number) => value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MAX_ENTERPRISE_SEATS = 20;

function getRemainingDays(validUntil?: string | null) {
  if (!validUntil || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) return 0;
  const expiry = new Date(`${validUntil}T23:59:59`).getTime();
  return Math.max(0, Math.ceil((expiry - Date.now()) / 86400000));
}

function UpgradeQrCode() {
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

  return <div className="grid h-[204px] w-[204px] grid-cols-[repeat(29,minmax(0,1fr))] gap-0 rounded-[4px] bg-white p-2 shadow-[0_2px_8px_rgba(35,55,95,.14)]" aria-label="支付二维码">
    {cells.map((filled, index) => <span key={index} className={filled ? 'bg-[#111]' : 'bg-white'} />)}
  </div>;
}

function PaymentMethodMark({ type }: { type: 'wechat' | 'alipay' }) {
  return <span className={`inline-flex h-6 w-6 items-center justify-center rounded-[5px] text-[13px] font-bold text-white ${type === 'wechat' ? 'bg-[#1dbb66]' : 'bg-[#1677ff]'}`}>{type === 'wechat' ? '✓' : '支'}</span>;
}

function getMonthlyPrice(row: PackageDetailRow, price = row.currentPrice) {
  const months = row.duration >= 365 ? Math.max(1, Math.round(row.duration / 365) * 12) : row.duration === 90 ? 3 : row.duration === 30 ? 1 : Math.max(1, Math.round(row.duration / 30));
  return (price / months).toFixed(2).replace(/\.00$/, '');
}

function getPointPrice(row: PackageDetailRow, price: number) {
  if (!row.points || row.points <= 0) return '-';
  const priceBasis = row.pointsCycle === '一次性' ? price : Number(getMonthlyPrice(row, price));
  return Number.isFinite(priceBasis) ? String(Number((priceBasis / row.points).toFixed(4))) : '-';
}

function calculateEnterpriseTotalPrice(basePrice: number, seatUnitPrice: number, seatCount: number) {
  return basePrice + Math.max(0, seatCount - 1) * seatUnitPrice;
}

function getUpgradePackageSeatUnitPrice(row: PackageDetailRow, memberLevel?: number) {
  return row.seatUnitPrice ?? getEnterpriseSeatUnitPrice(memberLevel ?? row.memberLevel, row.member) ?? 0;
}

function getUpgradePackagePrice(row: PackageDetailRow, seatCount: number, memberLevel?: number) {
  return calculateEnterpriseTotalPrice(row.currentPrice, getUpgradePackageSeatUnitPrice(row, memberLevel), seatCount);
}

type PackageTimeGroup = {
  key: string;
  displayName: string;
  duration: number;
  sort: number;
  rows: PackageDetailRow[];
};

function groupPackagesByTime(rows: PackageDetailRow[]): PackageTimeGroup[] {
  const groups = new Map<string, PackageTimeGroup>();
  rows.forEach((row, index) => {
    const key = `${row.displayName}-${row.duration}`;
    const existing = groups.get(key);
    if (existing) {
      existing.rows.push(row);
      return;
    }
    groups.set(key, {
      key,
      displayName: row.displayName,
      duration: row.duration,
      sort: row.sort ?? index,
      rows: [row],
    });
  });

  return [...groups.values()]
    .sort((left, right) => left.sort - right.sort)
    .map((group) => {
      const uniqueRows = new Map<string, PackageDetailRow>();
      group.rows.forEach((row) => {
        const key = row.points == null ? `row-${row.id}` : `points-${row.points}`;
        if (!uniqueRows.has(key)) uniqueRows.set(key, row);
      });
      return {
        ...group,
        rows: [...uniqueRows.values()].sort((left, right) => (left.points ?? Number.MAX_SAFE_INTEGER) - (right.points ?? Number.MAX_SAFE_INTEGER) || left.sort - right.sort),
      };
    });
}

function UpgradeCycleSelector({ options, selectedKey, onChange }: { options: Array<{ key: string; name: string; guideText?: string; guideTextColor?: string }>; selectedKey?: string; onChange: (key: string) => void }) {
  const selectorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(options.length);
  const [expanded, setExpanded] = useState(false);
  const selectedIndex = options.findIndex((option) => option.key === selectedKey);
  const selectedExtraOption = selectedIndex >= visibleCount ? options[selectedIndex] : undefined;
  const visibleOptions = options.slice(0, visibleCount);
  const extraOptions = options.slice(visibleCount);

  useLayoutEffect(() => {
    const selector = selectorRef.current;
    const bar = barRef.current;
    const measure = measureRef.current;
    if (!selector || !bar || !measure) return undefined;

    const updateVisibleCount = () => {
      const availableWidth = bar.clientWidth - 8;
      const optionWidths = Array.from(measure.querySelectorAll<HTMLElement>('[data-cycle-measure]')).map((element) => element.offsetWidth);
      const moreWidth = Math.max(...Array.from(measure.querySelectorAll<HTMLElement>('[data-more-measure]')).map((element) => element.offsetWidth), 76);
      const gap = 4;
      let width = 0;
      let count = 0;
      optionWidths.forEach((optionWidth, index) => {
        const nextWidth = width + optionWidth + (count ? gap : 0);
        const hasMoreOptions = index < optionWidths.length - 1;
        const requiredWidth = nextWidth + (hasMoreOptions ? gap + moreWidth : 0);
        if (requiredWidth <= availableWidth || count === 0) {
          width = nextWidth;
          count += 1;
        }
      });
      setVisibleCount(Math.max(1, Math.min(count || 1, options.length)));
    };

    updateVisibleCount();
    const observer = new ResizeObserver(updateVisibleCount);
    observer.observe(selector.parentElement ?? selector);
    return () => observer.disconnect();
  }, [options, selectedKey]);

  useEffect(() => {
    setExpanded(false);
  }, [options]);

  const selectOption = (key: string) => {
    onChange(key);
    setExpanded(false);
  };

  return <div ref={selectorRef} className="relative min-w-0 flex-1">
    <div ref={barRef} className="flex min-w-0 items-center gap-1 overflow-visible rounded-full bg-[#eef0f4] p-1">
      <div className="flex min-w-0 flex-1 items-center justify-start gap-1 overflow-hidden">
        {visibleOptions.map((option) => <button type="button" key={option.key} onClick={() => selectOption(option.key)} className={`flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] transition ${selectedKey === option.key ? 'bg-white font-semibold text-[#253043] shadow-[0_1px_4px_rgba(31,50,81,.08)]' : 'text-[#687487] hover:text-[#168ff2]'}`}>
          <span>{option.name}</span>
          {option.guideText ? <span style={{ color: option.guideTextColor ?? '#8993a2' }}>{option.guideText}</span> : null}
        </button>)}
      </div>
      {extraOptions.length ? <div className="relative shrink-0">
        <button type="button" aria-haspopup="listbox" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)} className="flex min-h-[36px] min-w-[76px] max-w-[220px] items-center justify-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-2.5 text-[11px] font-semibold text-[#252a31] shadow-[0_2px_8px_rgba(31,50,81,.12)] transition hover:text-[#168ff2]">
          <span className="min-w-0 truncate">{selectedExtraOption ? '更多–' : '更多'}</span>
          {selectedExtraOption ? <span className="min-w-0 truncate">{selectedExtraOption.name}</span> : null}
          <ChevronDown className={`ml-1 h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded ? <div role="listbox" className="absolute right-0 top-[calc(100%+8px)] z-30 w-[220px] overflow-hidden rounded-[16px] border border-[#e6e8ec] bg-white p-2 shadow-[0_12px_32px_rgba(31,50,81,.16)]">
          {extraOptions.map((option) => <button type="button" role="option" aria-selected={selectedKey === option.key} key={option.key} onClick={() => selectOption(option.key)} className={`flex w-full items-center justify-between rounded-[9px] px-3 py-2 text-left text-[11px] transition ${selectedKey === option.key ? 'bg-[#edf6ff] font-semibold text-[#168ff2]' : 'text-[#536075] hover:bg-[#f7f8fa] hover:text-[#168ff2]'}`}><span>{option.name}{option.guideText ? <span className="ml-1" style={{ color: option.guideTextColor ?? '#8993a2' }}>{option.guideText}</span> : null}</span>{selectedKey === option.key ? <span className="text-[10px]">当前</span> : null}</button>)}
        </div> : null}
      </div> : null}
    </div>
    <div ref={measureRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 -z-10 flex w-max gap-1 whitespace-nowrap opacity-0">
      {options.map((option) => <span data-cycle-measure="true" key={option.key} className="flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-[11px]">{option.name}{option.guideText ? <span>{option.guideText}</span> : null}</span>)}
      <span data-more-measure="default" className="flex min-h-[36px] min-w-[76px] items-center justify-center gap-1 rounded-full px-3 py-2.5 text-[11px] font-semibold">更多<ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0" /></span>
      {options.map((option) => <span data-more-measure={option.key} key={`more-${option.key}`} className="flex min-h-[36px] min-w-[76px] items-center justify-center gap-1 rounded-full px-3 py-2.5 text-[11px] font-semibold">更多–{option.name}<ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0" /></span>)}
    </div>
  </div>;
}

function UpgradeTimeCard({ level, group, selectedPackageId, selected, onSelectGroup, onSelectTier, cardTitle, enterprise = false, seats = 1, minimumSeats = 1, onSeatChange, onSeatInput }: { level: { level: number; name: string; shortName: string }; group: PackageTimeGroup; selectedPackageId?: number; selected: boolean; onSelectGroup: () => void; onSelectTier: (index: number) => void; cardTitle?: string; enterprise?: boolean; seats?: number; minimumSeats?: number; onSeatChange?: (delta: number) => void; onSeatInput?: (value: number) => void }) {
  const selectedPackage = group.rows.find((row) => row.id === selectedPackageId) ?? group.rows[0];
  const presentation = LEVEL_PRESENTATION[level.level] ?? LEVEL_PRESENTATION[240];
  const accent = presentation.accent === 'orange' ? '#ff7910' : '#168ff2';
  const shell = selected ? 'border-[#168ff2]' : 'border-[#e5e9f0]';
  const cardBackground = presentation.accent === 'orange' ? 'bg-[#fffaf4]' : presentation.accent === 'blue' ? 'bg-[#f7fbff]' : 'bg-white';
  const tierRows = group.rows;
  const selectedTierIndex = selectedPackage ? tierRows.findIndex((row) => row.id === selectedPackage.id) : 0;
  const tierProgress = tierRows.length > 1 ? (Math.max(selectedTierIndex, 0) / (tierRows.length - 1)) * 100 : 0;
  const isContractPlan = Boolean(selectedPackage && (selectedPackage.packageType === '订阅套餐' || selectedPackage.packageType === '低价试用且订阅套餐' || selectedPackage.displayName.startsWith('连续')));
  const seatCount = enterprise
    ? isContractPlan
      ? 1
      : Math.min(MAX_ENTERPRISE_SEATS, Math.max(minimumSeats, seats))
    : 1;
  const currentPrice = selectedPackage ? getUpgradePackagePrice(selectedPackage, enterprise ? seatCount : 1, level.level) : 0;
  const originalPrice = selectedPackage ? calculateEnterpriseTotalPrice(selectedPackage.originalPrice, getUpgradePackageSeatUnitPrice(selectedPackage, level.level), enterprise ? seatCount : 1) : 0;
  const pointPrice = selectedPackage ? getPointPrice(selectedPackage, currentPrice) : '-';

  return <article onClick={onSelectGroup} className={`relative flex min-h-[340px] w-[320px] min-w-[320px] shrink-0 snap-start cursor-pointer flex-col overflow-hidden rounded-[18px] border pb-6 shadow-[0_12px_28px_rgba(41,57,83,.07)] transition ${shell} ${cardBackground} ${selected ? 'shadow-[0_18px_40px_rgba(22,143,242,.18)]' : ''}`}>
    <div className="px-5 pb-4 pt-5">
      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="text-[18px] font-semibold text-[#202938]">{cardTitle ?? group.displayName}</h3><p className="mt-1 min-h-8 text-[12px] leading-4 text-[#8590a0]">{presentation.subtitle}</p></div>{presentation.accent !== 'neutral' ? <span className="shrink-0 rounded-[5px] px-2 py-1 text-[9px] font-medium text-white" style={{ backgroundColor: accent }}>{presentation.accent === 'orange' ? '企业专属' : '限时5折'}</span> : null}</div>
      {selectedPackage ? <><div className="mt-5 flex items-end gap-1 text-[#212a3a]"><span className="mb-1 text-[12px]">¥</span><strong className="text-[36px] font-semibold tracking-[-.05em]">{formatMoney(currentPrice).replace(/\.00$/, '')}</strong><span className="mb-1 text-[12px] text-[#7f8999]">/{selectedPackage.displayName}</span><del className="mb-1 ml-1 text-[11px] text-[#aeb5bf]">¥{formatMoney(originalPrice).replace(/\.00$/, '')}</del></div><p className="mt-2 text-[11px] text-[#929aa7]">¥{getMonthlyPrice(selectedPackage, currentPrice)}/月 · {pointPrice === '-' ? '积分价暂无' : `¥${pointPrice}/积分`}</p>{enterprise ? <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[#566274]"><div className="flex items-center overflow-hidden rounded-[9px] border border-[#eef0f3] bg-white"><button type="button" aria-label="减少席位" disabled={isContractPlan || seatCount <= minimumSeats} title={isContractPlan ? '签约套餐仅支持1个席位' : seatCount <= minimumSeats ? `最少需要${minimumSeats}个席位` : undefined} onClick={(event) => { event.stopPropagation(); onSeatChange?.(-1); }} className="flex h-8 w-8 items-center justify-center text-[16px] text-[#aab2bd] disabled:cursor-not-allowed disabled:opacity-40 hover:text-[#168ff2]">−</button><input type="number" inputMode="numeric" min={minimumSeats} max={MAX_ENTERPRISE_SEATS} step={1} value={seatCount} disabled={isContractPlan} aria-label="企业席位数" onClick={(event) => event.stopPropagation()} onChange={(event) => { event.stopPropagation(); if (event.currentTarget.value !== '') onSeatInput?.(Number(event.currentTarget.value)); }} onBlur={(event) => { event.stopPropagation(); if (event.currentTarget.value === '') onSeatInput?.(minimumSeats); }} className="h-8 w-[62px] appearance-none bg-transparent text-center font-medium text-[#374255] outline-none disabled:cursor-not-allowed disabled:opacity-50" /><span className="text-[11px] text-[#374255]">席位</span><button type="button" aria-label="增加席位" disabled={isContractPlan || seatCount >= MAX_ENTERPRISE_SEATS} title={isContractPlan ? '签约套餐仅支持1个席位' : seatCount >= MAX_ENTERPRISE_SEATS ? `最多支持${MAX_ENTERPRISE_SEATS}个席位` : undefined} onClick={(event) => { event.stopPropagation(); onSeatChange?.(1); }} className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[16px] text-[#566274] shadow-[0_1px_5px_rgba(34,48,70,.06)] disabled:cursor-not-allowed disabled:opacity-40 hover:text-[#168ff2]">＋</button></div><span className="whitespace-nowrap text-[#6d7888]">合计 <b className="text-[13px] text-[#293548]">{formatMoney(currentPrice)}元</b></span></div> : null}</> : null}
    </div>
    <div className="mx-4 mt-3 h-[41px]">
      {tierRows.length > 1 ? <><div className="mb-1.5 flex items-center justify-between text-[10px] text-[#586474]">{tierRows.map((row) => <button type="button" key={row.id} onClick={(event) => { event.stopPropagation(); onSelectTier(tierRows.findIndex((item) => item.id === row.id)); }} className={`cursor-pointer ${row.id === selectedPackage?.id ? 'font-semibold text-[#202938]' : 'hover:text-[#168ff2]'}`}>{row.points?.toLocaleString('en-US')}</button>)}</div><div className="relative h-5"><div className="absolute left-0 right-0 top-2 h-[4px] rounded-full bg-[#4b4f55]" /><span className="pointer-events-none absolute top-0 h-4 w-4 -translate-x-1/2 rounded-full border border-[#6f747b] bg-white shadow-[0_1px_3px_rgba(31,41,55,.16)]" style={{ left: `${tierProgress}%` }} /><input type="range" min={0} max={tierRows.length - 1} step={1} value={Math.max(selectedTierIndex, 0)} onChange={(event) => { event.stopPropagation(); onSelectTier(Number(event.currentTarget.value)); }} aria-label="套餐积分档位" className="absolute inset-0 h-5 w-full cursor-pointer opacity-0" /></div></> : null}
    </div>
    <div className="mx-4 mt-4 rounded-[12px] px-4 py-3" style={{ backgroundColor: presentation.accent === 'orange' ? '#fff0dc' : presentation.accent === 'blue' ? '#eaf4ff' : '#f4f6f9' }}><div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: presentation.accent === 'neutral' ? '#3e4858' : accent }}>✦ {selectedPackage?.points ?? '-'} 积分{selectedPackage?.pointsCycle === '一次性' ? '一次性' : '每月'}</div><p className="mt-1 text-[10px] text-[#8e98a7]">{selectedPackage?.pointsDescription || '按套餐配置发放积分'}</p></div>
  </article>;
}

export function MembershipUpgradePage({ onBack, currentMember }: MembershipUpgradePageProps) {
  const initialPreviewIdentity = resolveUpgradePreviewIdentity(currentMember);
  const [audience, setAudience] = useState<UpgradeAudience>(currentMember?.membershipType ?? initialPreviewIdentity.membershipType);
  const [displayMode, setDisplayMode] = useState<UpgradeDisplayMode>('time');
  const [previewIdentityKey, setPreviewIdentityKey] = useState<UpgradePreviewIdentity['key']>(initialPreviewIdentity.key);
  const [identityMenuOpen, setIdentityMenuOpen] = useState(false);
  const identityMenuRef = useRef<HTMLDivElement>(null);
  const [activeLevel, setActiveLevel] = useState(240);
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Record<number, string>>({});
  const [selectedTierIndexes, setSelectedTierIndexes] = useState<Record<string, number>>({});
  const [selectedTimeKeys, setSelectedTimeKeys] = useState<Partial<Record<UpgradeAudience, string>>>({});
  const [enterpriseSeats, setEnterpriseSeats] = useState<Record<number, number>>({});
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef<number | null>(null);
  const [requirementDrawerOpen, setRequirementDrawerOpen] = useState(false);
  const packageDetails = useMemo(() => readMembershipPackageDetails(MEMBERSHIP_UPGRADE_PACKAGE_ID), []);
  const levels = AUDIENCE_LEVELS[audience];
  const rowsByLevel = useMemo(() => Object.fromEntries(levels.map((level) => [level.level, packageDetails.filter((row) => row.status === '显示' && row.memberLevel === level.level)])), [levels, packageDetails]);
  const groupsByLevel = useMemo(() => Object.fromEntries(levels.map((level) => [level.level, groupPackagesByTime(rowsByLevel[level.level] ?? [])])), [levels, rowsByLevel]);
  const timeOptions = useMemo(() => getWebMembershipCycleOptions(audience, packageDetails), [audience, packageDetails]);
  const selectedTimeKey = selectedTimeKeys[audience] ?? timeOptions[0]?.key;
  const selectedTimeOption = timeOptions.find((option) => option.key === selectedTimeKey) ?? timeOptions[0];
  const selectedTimeDuration = selectedTimeOption ? Number.parseInt(selectedTimeOption.duration, 10) : undefined;
  const timeGroupsByLevel: Record<number, PackageTimeGroup | undefined> = useMemo(() => Object.fromEntries(levels.map((level) => [level.level, (groupsByLevel[level.level] ?? []).find((group) => group.displayName === selectedTimeOption?.name && group.duration === selectedTimeDuration)])), [groupsByLevel, levels, selectedTimeOption?.key]);
  const timePlans = useMemo(() => levels.map((level) => ({ level, group: timeGroupsByLevel[level.level] })).filter((item): item is { level: (typeof levels)[number]; group: PackageTimeGroup } => Boolean(item.group)), [levels, timeGroupsByLevel]);
  const activeGroups = groupsByLevel[activeLevel] ?? [];
  const activeGroup = activeGroups.find((group) => group.key === selectedGroupKeys[activeLevel]) ?? activeGroups[0];
  const getTierSelectionKey = (level: number, groupKey: string) => `${level}:${groupKey}`;
  const activeTierIndex = activeGroup ? Math.min(selectedTierIndexes[getTierSelectionKey(activeLevel, activeGroup.key)] ?? 0, Math.max(activeGroup.rows.length - 1, 0)) : 0;
  const selectedPackage = activeGroup?.rows[activeTierIndex] ?? activeGroup?.rows[0];
  const activeLevelConfig = levels.find((level) => level.level === activeLevel) ?? levels[0];
  const previewIdentity = UPGRADE_PREVIEW_IDENTITIES.find((identity) => identity.key === previewIdentityKey) ?? UPGRADE_PREVIEW_IDENTITIES[0];
  const currentPreviewIdentity = resolveUpgradePreviewIdentity(currentMember);
  const isCurrentMemberIdentity = currentPreviewIdentity.key === previewIdentity.key;
  const currentMemberLevel = isCurrentMemberIdentity ? currentMember?.memberLevel ?? previewIdentity.memberLevel : previewIdentity.memberLevel;
  const currentMemberName = isCurrentMemberIdentity ? currentMember?.memberName ?? previewIdentity.memberName : previewIdentity.memberName;
  const currentMemberValidUntil = isCurrentMemberIdentity ? currentMember?.validUntil ?? previewIdentity.validUntil : previewIdentity.validUntil;
  const currentMemberRemainingPoints = isCurrentMemberIdentity ? currentMember?.remainingPoints ?? previewIdentity.remainingPoints : previewIdentity.remainingPoints;
  const currentMemberRemainingDays = isCurrentMemberIdentity ? currentMember?.remainingDays ?? getRemainingDays(currentMember?.validUntil) : getRemainingDays(previewIdentity.validUntil);
  const enterpriseMinimumSeats = Math.min(MAX_ENTERPRISE_SEATS, Math.max(1, isCurrentMemberIdentity ? currentMember?.purchasedSeats ?? currentMember?.teamMemberCount ?? previewIdentity.teamMemberCount : previewIdentity.purchasedSeats ?? previewIdentity.teamMemberCount));
  const getEnterpriseSeatCount = (level: number) => Math.min(MAX_ENTERPRISE_SEATS, Math.max(enterpriseMinimumSeats, enterpriseSeats[level] ?? enterpriseMinimumSeats));

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 2200);
  };

  useEffect(() => {
    const firstLevel = AUDIENCE_LEVELS[audience][0]?.level;
    if (firstLevel != null) setActiveLevel(firstLevel);
  }, [audience]);

  useEffect(() => {
    const nextIdentity = resolveUpgradePreviewIdentity(currentMember);
    setPreviewIdentityKey(nextIdentity.key);
    setAudience(currentMember?.membershipType ?? nextIdentity.membershipType);
  }, [currentMember?.memberLevel, currentMember?.membershipType]);

  useEffect(() => () => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
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
    if (!timeOptions.length) return;
    setSelectedTimeKeys((current) => {
      const currentKey = current[audience];
      return currentKey && timeOptions.some((option) => option.key === currentKey) ? current : { ...current, [audience]: timeOptions[0].key };
    });
  }, [audience, timeOptions]);

  useEffect(() => {
    setSelectedGroupKeys((current) => {
      const next = { ...current };
      levels.forEach((level) => {
        const groups = groupsByLevel[level.level] ?? [];
        if (groups.length && !groups.some((group) => group.key === next[level.level])) next[level.level] = groups[0].key;
      });
      return next;
    });
  }, [levels, groupsByLevel]);

  useEffect(() => {
    if (displayMode !== 'time' || !selectedTimeOption) return;
    setSelectedGroupKeys((current) => {
      const next = { ...current };
      let changed = false;
      timePlans.forEach(({ level, group }) => {
        if (next[level.level] !== group.key) {
          next[level.level] = group.key;
          changed = true;
        }
      });
      return changed ? next : current;
    });
    if (!timePlans.some(({ level }) => level.level === activeLevel) && timePlans[0]) setActiveLevel(timePlans[0].level.level);
  }, [activeLevel, displayMode, selectedTimeOption?.key, timePlans]);

  const selectLevel = (level: number) => {
    setActiveLevel(level);
    const firstGroup = groupsByLevel[level]?.[0];
    if (firstGroup) {
      setSelectedGroupKeys((current) => ({ ...current, [level]: firstGroup.key }));
      setSelectedTierIndexes((current) => ({ ...current, [getTierSelectionKey(level, firstGroup.key)]: 0 }));
    }
  };

  const selectGroup = (groupKey: string) => {
    setSelectedGroupKeys((current) => ({ ...current, [activeLevel]: groupKey }));
    const selectionKey = getTierSelectionKey(activeLevel, groupKey);
    setSelectedTierIndexes((current) => ({ ...current, [selectionKey]: current[selectionKey] ?? 0 }));
  };

  const selectTime = (timeKey: string) => {
    setSelectedTimeKeys((current) => ({ ...current, [audience]: timeKey }));
  };

  const selectTimeLevel = (level: number) => {
    setActiveLevel(level);
    const group = timeGroupsByLevel[level];
    if (!group) return;
    setSelectedGroupKeys((current) => ({ ...current, [level]: group.key }));
    const selectionKey = getTierSelectionKey(level, group.key);
    setSelectedTierIndexes((current) => ({ ...current, [selectionKey]: current[selectionKey] ?? 0 }));
  };

  const selectPreviewIdentity = (identity: UpgradePreviewIdentity) => {
    setPreviewIdentityKey(identity.key);
    setAudience(identity.membershipType);
    setIdentityMenuOpen(false);
  };

  const selectTier = (level: number, groupKey: string, index: number) => {
    setActiveLevel(level);
    setSelectedGroupKeys((current) => ({ ...current, [level]: groupKey }));
    const sourceGroup = displayMode === 'time'
      ? timePlans.find(({ level: planLevel }) => planLevel.level === level)?.group
      : groupsByLevel[level]?.find((group) => group.key === groupKey);
    const sourcePackage = sourceGroup?.rows[Math.min(index, Math.max(sourceGroup.rows.length - 1, 0))];
    setSelectedTierIndexes((current) => {
      const next = { ...current, [getTierSelectionKey(level, groupKey)]: index };
      if (displayMode !== 'time' || !sourcePackage || sourcePackage.points == null) return next;

      timePlans.forEach(({ level: planLevel, group }) => {
        const matchingIndex = group.rows.findIndex((row) => row.points === sourcePackage.points);
        if (matchingIndex >= 0) {
          next[getTierSelectionKey(planLevel.level, group.key)] = matchingIndex;
          return;
        }

        const fallbackIndex = group.rows.reduce((bestIndex, row, rowIndex) => {
          if (row.points == null || row.points > sourcePackage.points) return bestIndex;
          if (bestIndex < 0 || row.points > (group.rows[bestIndex].points ?? -Infinity)) return rowIndex;
          return bestIndex;
        }, -1);
        next[getTierSelectionKey(planLevel.level, group.key)] = fallbackIndex >= 0 ? fallbackIndex : 0;
      });
      return next;
    });
  };

  const updateEnterpriseSeats = (level: number, delta: number) => {
    setActiveLevel(level);
    setEnterpriseSeats((current) => {
      const currentSeats = current[level] ?? enterpriseMinimumSeats;
      const requestedSeats = currentSeats + delta;
      const nextSeats = Math.min(MAX_ENTERPRISE_SEATS, Math.max(enterpriseMinimumSeats, requestedSeats));
      return nextSeats === currentSeats ? current : { ...current, [level]: nextSeats };
    });
  };

  const updateEnterpriseSeatInput = (level: number, value: number) => {
    setActiveLevel(level);
    const requestedSeats = Number.isFinite(value) ? Math.trunc(value) : enterpriseMinimumSeats;
    if (requestedSeats > MAX_ENTERPRISE_SEATS) showToast('最大购买席位数为20人，已自动调整为20人');
    const nextSeats = Math.min(MAX_ENTERPRISE_SEATS, Math.max(enterpriseMinimumSeats, requestedSeats));
    setEnterpriseSeats((current) => (current[level] === nextSeats ? current : { ...current, [level]: nextSeats }));
  };

  const getSelectedPackageId = (group: PackageTimeGroup, level = activeLevel) => group.rows[Math.min(selectedTierIndexes[getTierSelectionKey(level, group.key)] ?? 0, Math.max(group.rows.length - 1, 0))]?.id;
  const selectedPackageIsContract = Boolean(selectedPackage && (selectedPackage.packageType === '订阅套餐' || selectedPackage.packageType === '低价试用且订阅套餐' || selectedPackage.displayName.startsWith('连续')));
  const selectedEnterpriseSeats = audience === 'enterprise' ? (selectedPackageIsContract ? 1 : getEnterpriseSeatCount(activeLevel)) : 1;
  const selectedPackagePrice = selectedPackage ? getUpgradePackagePrice(selectedPackage, selectedEnterpriseSeats, activeLevel) : 0;
  const purchaseAction = getMembershipPurchaseAction(currentMemberLevel, activeLevel, currentMemberName);
  const isEnterpriseContractSeatBlocked = audience === 'enterprise' && selectedPackageIsContract && enterpriseMinimumSeats > 1;
  const canPurchaseSelectedPackage = Boolean(selectedPackage) && purchaseAction.kind !== 'downgrade' && !isEnterpriseContractSeatBlocked;
  const selectedPackageBlockedReason = !selectedPackage
    ? '当前套餐暂无可购买配置'
    : isEnterpriseContractSeatBlocked
      ? '当前席位数高于可购买的席位数无法购买，请选择企业使用的非签约套餐'
      : purchaseAction.helperText ?? '当前套餐暂不可购买';

  return <div style={requirementDrawerOpen ? { marginRight: MEMBERSHIP_REQUIREMENT_DRAWER_WIDTH } : undefined} className="min-h-screen bg-[#f3f5fc] font-sans text-[#263247] transition-[margin-right] duration-200">
    <header className="flex h-[76px] items-center border-t-[3px] border-[#171717] border-b border-[#e7eaf0] bg-white px-8 shadow-[0_1px_3px_rgba(38,50,71,.04)]">
      <div className="flex min-w-0 items-center gap-5">
        <button type="button" onClick={onBack} className="flex shrink-0 items-center" aria-label="返回会员中心"><img src={cktAiEcomLogo} alt="创客贴" className="h-[40px] w-auto" /></button>
        <span className="h-7 w-px bg-[#e6e9ef]" />
        <button type="button" className="flex h-10 items-center gap-2 rounded-[11px] border border-[#edf0f5] px-4 text-[15px] font-semibold text-[#344057]"><span>团队版</span><ChevronDown className="h-4 w-4 text-[#69758a]" /></button>
        <nav className="hidden items-center gap-8 text-[15px] text-[#4c5870] xl:flex"><button type="button">首页</button><button type="button">AI工具箱</button><button type="button">定制设计</button><button type="button">印刷店</button><button type="button">下载APP</button><MoreHorizontal className="h-5 w-5" /></nav>
      </div>
      <div className="ml-auto flex items-center gap-4 text-[#4e5b70]">
        <div className="hidden h-[46px] w-[300px] items-center gap-3 rounded-full border-2 border-[#adccff] px-4 text-[14px] text-[#a0acc0] xl:flex"><Search className="h-5 w-5" /><span className="flex-1">搜索你想要的模板</span><Camera className="h-5 w-5" /></div>
        <button type="button" className="hidden h-10 items-center gap-2 rounded-[12px] bg-[#ffead9] px-4 text-[15px] font-semibold text-[#805638] lg:flex"><span className="rounded-[4px] bg-[#8d5c34] px-1.5 py-0.5 text-[10px] text-[#ffe6b9]">VIP</span>开通会员</button>
        <button type="button" className="hidden h-10 items-center gap-2 rounded-[12px] bg-[#e6f1ff] px-4 text-[15px] font-semibold text-[#2377ed] lg:flex">▣ 企业服务</button>
        <Settings2 className="hidden h-5 w-5 sm:block" />
        <span className="relative"><Bell className="h-5 w-5" /><i className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff4f49] px-1 text-[9px] not-italic text-white">4</i></span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#efd5b7,#8ca6bb)] text-white"><UserRound className="h-5 w-5" /></span>
      </div>
    </header>

    <main className="mx-auto max-w-[1360px] px-6 py-5">
      <section className="rounded-[22px] bg-white px-12 py-8 shadow-[0_8px_24px_rgba(70,92,132,.05)]">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <h1 className="text-center text-[22px] font-semibold text-[#293449]">用户套餐信息</h1>
        </div>
        <div className="mt-5 flex flex-col items-center"><span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#d9e7f0,#b67e5d)] text-[25px]">🐱</span><span className="mt-2 text-[14px] font-semibold text-[#303b4d]">zww</span></div>
        <div className="mx-auto mt-8 max-w-[1120px] overflow-hidden rounded-[7px] border border-[#e6eaf1] text-center">
          <div className="grid grid-cols-3 bg-[#f5f7fc] text-[15px] font-semibold text-[#334057]"><span className="border-r border-[#e5e9f0] px-4 py-4">当前套餐</span><span className="border-r border-[#e5e9f0] px-4 py-4">当前套餐到期时间</span><span className="px-4 py-4">当前套餐剩余有效时间</span></div>
          <div className="grid grid-cols-3 text-[15px] text-[#303b4d]"><span className="border-r border-t border-[#e5e9f0] px-4 py-4">{currentMemberName}</span><span className="border-r border-t border-[#e5e9f0] px-4 py-4">{currentMemberValidUntil}</span><span className="border-t border-[#e5e9f0] px-4 py-4">{currentMemberRemainingDays}天</span></div>
        </div>
      </section>

      <section className="mt-5 rounded-[22px] bg-white px-12 py-9 shadow-[0_8px_24px_rgba(70,92,132,.05)]">
        <div className="mx-auto max-w-[1120px]">
          <div className="relative pt-10">
          <span className="pointer-events-none absolute right-3 top-4 z-30 rounded-[5px] bg-[#ff665b] px-2.5 py-1 text-[10px] font-semibold text-white shadow-[0_3px_8px_rgba(255,102,91,.2)]">V2610 · 套餐显示区域</span>
          <div className="overflow-hidden rounded-[18px] bg-[#f5f5f7]">
          <div className="relative px-3 pb-3 pt-3">
          <div className="pointer-events-none absolute inset-1 z-20 rounded-[22px] border-2 border-dashed border-[#ff665b]" aria-hidden="true" />
          <div className="grid grid-cols-2 overflow-hidden rounded-[18px] bg-[#f3f3f5]">
            {AUDIENCE_OPTIONS.map((option, index) => <button type="button" key={option.key} onClick={() => setAudience(option.key)} className={`relative h-[74px] text-[17px] font-semibold ${audience === option.key ? 'bg-[linear-gradient(104deg,#1765ff_0%,#398df1_100%)] text-white shadow-[8px_0_14px_rgba(28,111,244,.15)]' : 'text-[#927d6e]'}`}>{option.label}{audience === option.key && index === 0 ? <span className="absolute -right-5 top-0 h-full w-10 skew-x-[12deg] bg-[#398df1]" /> : null}</button>)}
          </div>
          <div className="px-8 pb-8 pt-5">
            <div className="mt-5 min-w-0">
              {displayMode === 'member' ? <div className={`gap-2 rounded-[12px] bg-[#eef1f5] p-1 ${levels.length === 2 ? 'mx-auto flex w-full max-w-[620px]' : 'grid grid-cols-3'}`}>
                {levels.map((level) => <button type="button" key={level.level} onClick={() => selectLevel(level.level)} className={`rounded-[9px] px-4 py-3 text-[14px] font-semibold transition ${levels.length === 2 ? 'flex-1' : ''} ${activeLevel === level.level ? 'bg-white text-[#168ff2] shadow-[0_2px_8px_rgba(31,64,120,.1)]' : 'text-[#667386] hover:text-[#168ff2]'}`}>{level.shortName}</button>)}
              </div> : <UpgradeCycleSelector options={timeOptions} selectedKey={selectedTimeKey} onChange={selectTime} />}
            </div>

            {activeLevelConfig ? <div className="mt-5">
              <div className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {displayMode === 'member' ? activeGroups.map((group) => <UpgradeTimeCard key={group.key} level={activeLevelConfig} group={group} selectedPackageId={getSelectedPackageId(group, activeLevelConfig.level)} selected={group.key === activeGroup?.key} onSelectGroup={() => selectGroup(group.key)} onSelectTier={(index) => selectTier(activeLevelConfig.level, group.key, index)} enterprise={audience === 'enterprise'} seats={getEnterpriseSeatCount(activeLevelConfig.level)} minimumSeats={enterpriseMinimumSeats} onSeatChange={(delta) => updateEnterpriseSeats(activeLevelConfig.level, delta)} onSeatInput={(value) => updateEnterpriseSeatInput(activeLevelConfig.level, value)} />) : timePlans.map(({ level, group }) => <UpgradeTimeCard key={`${level.level}-${group.key}`} level={level} group={group} cardTitle={level.shortName} selectedPackageId={getSelectedPackageId(group, level.level)} selected={level.level === activeLevel} onSelectGroup={() => selectTimeLevel(level.level)} onSelectTier={(index) => selectTier(level.level, group.key, index)} enterprise={audience === 'enterprise'} seats={getEnterpriseSeatCount(level.level)} minimumSeats={enterpriseMinimumSeats} onSeatChange={(delta) => updateEnterpriseSeats(level.level, delta)} onSeatInput={(value) => updateEnterpriseSeatInput(level.level, value)} />)}
              </div>
            </div> : null}
          </div>
          </div>
          {activeLevelConfig ? <div className="px-8 pb-8">
            <aside className="flex min-h-[250px] w-full items-center justify-start gap-6 rounded-[12px] bg-[#fbfcff] px-5 py-5 shadow-[0_2px_8px_rgba(31,64,120,.06)]">
              {canPurchaseSelectedPackage ? <><UpgradeQrCode /><div className="min-w-0 text-left"><p className="text-[14px] font-semibold text-[#516077]">购买应付金额：<strong className="text-[29px] font-semibold tracking-[-.04em] text-[#ff3f4a]">¥{selectedPackage ? formatMoney(selectedPackagePrice) : '0.00'}</strong></p><p className="mt-4 text-[12px] text-[#738198]">{audience === 'enterprise' ? `共${selectedEnterpriseSeats}个成员席位，还可邀请${Math.max(0, MAX_ENTERPRISE_SEATS - selectedEnterpriseSeats)}人` : '共1个成员席位，还可邀请0人'}</p><p className="mt-3 text-[12px] leading-5 text-[#8190a5]">支付即代表你同意 <a href="#service-agreement" className="text-[#3987f5]">《创客贴VIP服务协议》</a></p><div className="mt-4 flex items-center gap-2 text-[12px] text-[#8b97a9]"><PaymentMethodMark type="alipay" /><PaymentMethodMark type="wechat" /><span>使用支付宝/微信扫码付款</span></div></div></> : <div className="flex min-h-[204px] min-w-0 flex-1 items-center justify-center rounded-[10px] bg-[#fff3f3] px-6 text-center"><div><p className="text-[16px] font-semibold text-[#f04444]">当前套餐暂不可购买</p><p className="mt-3 text-[13px] leading-5 text-[#f04444]">{selectedPackageBlockedReason}</p></div></div>}
            </aside>
          </div> : null}
        </div>
        </div>
        </div>
      </section>
    </main>

    {toastMessage ? <div role="status" className="pointer-events-none fixed bottom-8 left-1/2 z-[220] -translate-x-1/2 rounded-[8px] bg-[#263449] px-4 py-3 text-[12px] text-white shadow-[0_12px_30px_rgba(22,34,54,.22)]">{toastMessage}</div> : null}

    <div style={requirementDrawerOpen ? { right: MEMBERSHIP_REQUIREMENT_DRAWER_WIDTH + 112 } : undefined} className="fixed bottom-7 right-[112px] z-30 flex items-center gap-2 transition-[right] duration-200">
      <div ref={identityMenuRef} className="relative">
        <div className="flex items-center overflow-hidden rounded-[13px] border border-[#f0c44f] bg-[#fff8df] p-1 text-[12px] font-medium text-[#8b6a20] shadow-[0_12px_30px_rgba(140,105,32,.16)]" aria-label="身份切换">
        <button type="button" aria-haspopup="listbox" aria-expanded={identityMenuOpen} aria-label={`当前身份：${previewIdentity.label}，会员等级：${currentMemberLevel ?? '免费'}，剩余积分：${currentMemberRemainingPoints}`} onClick={() => setIdentityMenuOpen((current) => !current)} className="flex items-center gap-1 rounded-[9px] px-3 py-2 font-semibold text-[#604700] transition hover:bg-[#fff0b9]"><span>身份：{previewIdentity.label}</span><ChevronDown className={`h-3.5 w-3.5 transition-transform ${identityMenuOpen ? 'rotate-180' : ''}`} /></button>
        </div>
        {identityMenuOpen ? <div role="listbox" className="absolute bottom-[calc(100%+8px)] right-0 w-[220px] overflow-hidden rounded-[14px] border border-[#f0c44f] bg-[#fffdf2] p-2 text-left shadow-[0_12px_32px_rgba(140,105,32,.2)]">
        {UPGRADE_PREVIEW_IDENTITIES.map((identity) => <button type="button" role="option" aria-selected={previewIdentityKey === identity.key} key={identity.key} onClick={() => selectPreviewIdentity(identity)} className={`flex w-full items-center justify-between rounded-[9px] px-3 py-2 text-[12px] transition ${previewIdentityKey === identity.key ? 'bg-[#ffd85f] font-semibold text-[#604700]' : 'text-[#6f5a25] hover:bg-[#fff0b9] hover:text-[#604700]'}`}><span>{identity.label}</span>{previewIdentityKey === identity.key ? <span className="text-[10px]">当前</span> : null}</button>)}
        </div> : null}
      </div>
      <div className="flex items-center overflow-hidden rounded-[13px] border border-[#f0c44f] bg-[#fff8df] p-1 text-[12px] font-medium text-[#8b6a20] shadow-[0_12px_30px_rgba(140,105,32,.16)]" aria-label="套餐展示方式">
      <button type="button" onClick={() => setDisplayMode('time')} className={`rounded-[9px] px-3 py-2 transition ${displayMode === 'time' ? 'bg-[#ffd85f] font-semibold text-[#604700] shadow-[0_2px_6px_rgba(185,132,20,.2)]' : 'hover:bg-[#fff0b9] hover:text-[#604700]'}`}>按时间</button>
      <button type="button" onClick={() => setDisplayMode('member')} className={`rounded-[9px] px-3 py-2 transition ${displayMode === 'member' ? 'bg-[#ffd85f] font-semibold text-[#604700] shadow-[0_2px_6px_rgba(185,132,20,.2)]' : 'hover:bg-[#fff0b9] hover:text-[#604700]'}`}>按会员</button>
      </div>
    </div>
    <MembershipRequirementFloatingButton title="会员补差价升级页" subtitle="补差价升级页面的等级、套餐、席位、支付和购买限制说明" sections={MEMBERSHIP_UPGRADE_REQUIREMENT_SECTIONS} meta={MEMBERSHIP_UPGRADE_REQUIREMENT_META} className="bottom-[112px] right-8" open={requirementDrawerOpen} onOpenChange={setRequirementDrawerOpen} />
    <button type="button" style={requirementDrawerOpen ? { right: MEMBERSHIP_REQUIREMENT_DRAWER_WIDTH + 8 } : undefined} className="fixed bottom-7 right-8 flex h-[86px] w-[86px] flex-col items-center justify-center gap-1 rounded-[13px] bg-white text-[13px] font-medium text-[#354057] shadow-[0_12px_30px_rgba(71,92,130,.14)] transition-[right] duration-200"><Headphones className="h-6 w-6 text-[#63728a]" />联系客服</button>
  </div>;
}
