import { useEffect, useMemo, useState } from 'react';
import { Bell, Camera, ChevronDown, Headphones, MoreHorizontal, Search, Settings2, UserRound, X } from 'lucide-react';
import cktAiEcomLogo from '../assets/ckt-ai-ecom-logo.svg';
import { MEMBERSHIP_UPGRADE_PACKAGE_ID, readMembershipPackageDetails, type PackageDetailRow } from './MembershipPackagePage';

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
  };
};

type UpgradeAudience = 'personal' | 'enterprise';

const AUDIENCE_OPTIONS: Array<{ key: UpgradeAudience; label: string; helper: string }> = [
  { key: 'personal', label: '个人使用', helper: '1人使用' },
  { key: 'enterprise', label: '企业使用', helper: '2-20人使用' },
];

const AUDIENCE_LEVELS: Record<UpgradeAudience, Array<{ level: number; name: string; shortName: string }>> = {
  personal: [
    { level: 240, name: '基础版（个人）', shortName: '基础版' },
    { level: 241, name: '专业版（个人）', shortName: '专业版' },
  ],
  enterprise: [
    { level: 310, name: '基础版（企业）', shortName: '基础版' },
    { level: 311, name: '专业版（企业）', shortName: '专业版' },
    { level: 220, name: '旗舰版（企业）', shortName: '旗舰版' },
  ],
};

const LEVEL_PRESENTATION: Record<number, { subtitle: string; accent: 'neutral' | 'blue' | 'orange' }> = {
  240: { subtitle: '100万模板在线编辑，快速出图', accent: 'neutral' },
  241: { subtitle: '100万模板+AI全能创作', accent: 'blue' },
  310: { subtitle: '100万模板+团队协作与共享+商用授权', accent: 'neutral' },
  311: { subtitle: '100万模板+AI全能创作+团队协作与共享', accent: 'blue' },
  220: { subtitle: '适合大型企业，灵活的算力配额，支持20人以上席位灵活配置', accent: 'orange' },
};

const formatMoney = (value: number) => value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

function getMonthlyPrice(row: PackageDetailRow) {
  const months = row.duration >= 365 ? Math.max(1, Math.round(row.duration / 365) * 12) : row.duration === 90 ? 3 : row.duration === 30 ? 1 : Math.max(1, Math.round(row.duration / 30));
  return (row.currentPrice / months).toFixed(2).replace(/\.00$/, '');
}

function UpgradePlanCard({ level, rows, selectedPackageId, active, onActivate, onSelectPackage }: { level: { level: number; name: string; shortName: string }; rows: PackageDetailRow[]; selectedPackageId?: number; active: boolean; onActivate: () => void; onSelectPackage: (id: number) => void }) {
  const selectedPackage = rows.find((row) => row.id === selectedPackageId) ?? rows[0];
  const presentation = LEVEL_PRESENTATION[level.level] ?? LEVEL_PRESENTATION[240];
  const accent = presentation.accent === 'orange' ? '#ff7910' : '#168ff2';
  const shell = presentation.accent === 'orange'
    ? 'border-[#ff7910] bg-[#fffaf4]'
    : presentation.accent === 'blue'
      ? 'border-[#168ff2] bg-[#f7fbff]'
      : active ? 'border-[#168ff2] bg-white' : 'border-[#e5e9f0] bg-white';

  return <article onClick={onActivate} className={`relative flex min-h-[520px] cursor-pointer flex-col overflow-hidden rounded-[18px] border shadow-[0_12px_28px_rgba(41,57,83,.07)] transition ${shell} ${active ? 'shadow-[0_18px_40px_rgba(22,143,242,.15)]' : ''}`}>
    {presentation.accent !== 'neutral' ? <div className="h-7 shrink-0 text-center text-[10px] font-medium leading-7 text-white" style={{ backgroundColor: accent }}>{presentation.accent === 'orange' ? 'Seedance 2.5 720P限时低至 ¥0.19/秒' : 'Seedance 2.5 720P限时低至 ¥0.43/秒'}</div> : null}
    <div className="px-5 pb-4 pt-5">
      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="text-[18px] font-semibold text-[#202938]">{level.shortName}</h3><p className="mt-1 min-h-8 text-[12px] leading-4 text-[#8590a0]">{presentation.subtitle}</p></div>{presentation.accent !== 'neutral' ? <span className="shrink-0 rounded-[5px] px-2 py-1 text-[9px] font-medium text-white" style={{ backgroundColor: accent }}>{presentation.accent === 'orange' ? '企业专属' : '限时5折'}</span> : null}</div>
      {selectedPackage ? <><div className="mt-5 flex items-end gap-1 text-[#212a3a]"><span className="mb-1 text-[12px]">¥</span><strong className="text-[36px] font-semibold tracking-[-.05em]">{selectedPackage.currentPrice}</strong><span className="mb-1 text-[12px] text-[#7f8999]">/{selectedPackage.displayName}</span><del className="mb-1 ml-1 text-[11px] text-[#aeb5bf]">¥{selectedPackage.originalPrice}</del></div><p className="mt-2 text-[11px] text-[#929aa7]">¥{getMonthlyPrice(selectedPackage)}/月 · {selectedPackage.points ?? '-'}积分{selectedPackage.pointsCycle === '一次性' ? '一次性' : '每月'}</p></> : null}
    </div>
    <div className="mx-4 rounded-[12px] px-4 py-3" style={{ backgroundColor: presentation.accent === 'orange' ? '#fff0dc' : presentation.accent === 'blue' ? '#eaf4ff' : '#f4f6f9' }}><div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: presentation.accent === 'neutral' ? '#3e4858' : accent }}>✦ {selectedPackage?.points ?? '-'} 积分{selectedPackage?.pointsCycle === '一次性' ? '一次性' : '每月'}</div><p className="mt-1 text-[10px] text-[#8e98a7]">{selectedPackage?.pointsDescription || '按套餐配置发放积分'}</p></div>
    <div className="px-4 pt-4"><p className="mb-2 text-[11px] font-medium text-[#566274]">选择套餐时长</p><div className="flex flex-wrap gap-2">{rows.map((row) => <button type="button" key={row.id} onClick={(event) => { event.stopPropagation(); onSelectPackage(row.id); }} className={`rounded-[8px] border px-3 py-1.5 text-[11px] transition ${row.id === selectedPackage?.id ? 'border-[#168ff2] bg-[#eaf4ff] font-semibold text-[#168ff2]' : 'border-[#e7ebf0] bg-white text-[#667386] hover:border-[#a9c9f4]'}`}>{row.displayName}</button>)}</div></div>
    <div className="mt-auto px-4 pb-5 pt-5"><button type="button" onClick={(event) => { event.stopPropagation(); onActivate(); }} className={`h-10 w-full rounded-full text-[13px] font-medium text-white transition ${presentation.accent === 'orange' ? 'bg-[#ff7910] hover:bg-[#ed6904]' : presentation.accent === 'blue' ? 'bg-[#168ff2] hover:bg-[#087edc]' : 'bg-[#202938] hover:bg-[#111827]'}`}>立即升级</button><p className="mt-2 text-center text-[10px] text-[#9aa2ae]">补差价升级，升级后立即生效</p></div>
  </article>;
}

export function MembershipUpgradePage({ onBack, currentMember }: MembershipUpgradePageProps) {
  const [audience, setAudience] = useState<UpgradeAudience>('personal');
  const [activeLevel, setActiveLevel] = useState(240);
  const [selectedPackageIds, setSelectedPackageIds] = useState<Record<number, number>>({});
  const packageDetails = useMemo(() => readMembershipPackageDetails(MEMBERSHIP_UPGRADE_PACKAGE_ID), []);
  const levels = AUDIENCE_LEVELS[audience];
  const rowsByLevel = useMemo(() => Object.fromEntries(levels.map((level) => [level.level, packageDetails.filter((row) => row.status === '显示' && row.memberLevel === level.level)])), [levels, packageDetails]);
  const activeRows = rowsByLevel[activeLevel] ?? [];
  const selectedPackage = activeRows.find((row) => row.id === selectedPackageIds[activeLevel]) ?? activeRows[0];
  const currentMemberName = currentMember?.memberName ?? '免费用户';
  const currentMemberValidUntil = currentMember?.validUntil ?? '---';
  const currentMemberRemainingDays = currentMember?.remainingDays ?? getRemainingDays(currentMember?.validUntil);

  useEffect(() => {
    const firstLevel = AUDIENCE_LEVELS[audience][0]?.level;
    if (firstLevel != null) setActiveLevel(firstLevel);
  }, [audience]);

  useEffect(() => {
    setSelectedPackageIds((current) => {
      const next = { ...current };
      levels.forEach((level) => {
        const rows = rowsByLevel[level.level] ?? [];
        if (rows.length && !rows.some((row) => row.id === next[level.level])) next[level.level] = rows[0].id;
      });
      return next;
    });
  }, [levels, rowsByLevel]);

  const selectPackage = (level: number, packageId: number) => {
    setActiveLevel(level);
    setSelectedPackageIds((current) => ({ ...current, [level]: packageId }));
  };

  return <div className="min-h-screen bg-[#f3f5fc] font-sans text-[#263247]">
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
        <h1 className="text-center text-[22px] font-semibold text-[#293449]">用户套餐信息</h1>
        <div className="mt-5 flex flex-col items-center"><span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#d9e7f0,#b67e5d)] text-[25px]">🐱</span><span className="mt-2 text-[14px] font-semibold text-[#303b4d]">zww</span></div>
        <div className="mx-auto mt-8 max-w-[1120px] overflow-hidden rounded-[7px] border border-[#e6eaf1] text-center">
          <div className="grid grid-cols-3 bg-[#f5f7fc] text-[15px] font-semibold text-[#334057]"><span className="border-r border-[#e5e9f0] px-4 py-4">当前套餐</span><span className="border-r border-[#e5e9f0] px-4 py-4">当前套餐到期时间</span><span className="px-4 py-4">当前套餐剩余有效时间</span></div>
          <div className="grid grid-cols-3 text-[15px] text-[#303b4d]"><span className="border-r border-t border-[#e5e9f0] px-4 py-4">{currentMemberName}</span><span className="border-r border-t border-[#e5e9f0] px-4 py-4">{currentMemberValidUntil}</span><span className="border-t border-[#e5e9f0] px-4 py-4">{currentMemberRemainingDays}天</span></div>
        </div>
      </section>

      <section className="mt-5 rounded-[22px] bg-white px-12 py-9 shadow-[0_8px_24px_rgba(70,92,132,.05)]">
        <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[18px] bg-[#f5f5f7]">
          <div className="grid grid-cols-2 overflow-hidden rounded-[18px] bg-[#f3f3f5]">
            {AUDIENCE_OPTIONS.map((option, index) => <button type="button" key={option.key} onClick={() => setAudience(option.key)} className={`relative h-[74px] text-[17px] font-semibold ${audience === option.key ? 'bg-[linear-gradient(104deg,#1765ff_0%,#398df1_100%)] text-white shadow-[8px_0_14px_rgba(28,111,244,.15)]' : 'text-[#927d6e]'}`}>{option.label}<span className="ml-1 text-[14px] font-normal opacity-80">（{option.helper}）</span>{audience === option.key && index === 0 ? <span className="absolute -right-5 top-0 h-full w-10 skew-x-[12deg] bg-[#398df1]" /> : null}</button>)}
          </div>
          <div className="px-8 pb-8 pt-5">
            <p className="mt-2 text-[13px] text-[#8490a2]">{audience === 'personal' ? '个人使用请选择基础版或专业版，适合1人使用' : '企业使用请选择基础版、专业版或旗舰版，按团队规模选择对应会员等级'}</p>

            <div className={`mt-7 grid grid-cols-1 gap-4 ${levels.length === 2 ? 'xl:grid-cols-[repeat(2,minmax(0,1fr))_390px]' : 'xl:grid-cols-[repeat(3,minmax(0,1fr))_390px]'}`}>
              {levels.map((level) => <UpgradePlanCard key={level.level} level={level} rows={rowsByLevel[level.level] ?? []} selectedPackageId={selectedPackageIds[level.level]} active={activeLevel === level.level} onActivate={() => setActiveLevel(level.level)} onSelectPackage={(packageId) => selectPackage(level.level, packageId)} />)}
              <aside className="flex min-h-[250px] items-center gap-6 rounded-[12px] bg-[#fbfcff] px-5 py-5 shadow-[0_2px_8px_rgba(31,64,120,.06)]">
                <UpgradeQrCode />
                <div className="min-w-0 text-left"><p className="text-[14px] font-semibold text-[#516077]">购买应付金额：<strong className="text-[29px] font-semibold tracking-[-.04em] text-[#ff3f4a]">¥{selectedPackage ? formatMoney(selectedPackage.currentPrice) : '0.00'}</strong></p><p className="mt-4 text-[12px] text-[#738198]">{audience === 'enterprise' ? '共2个成员席位，还可邀请18人' : '共1个成员席位，还可邀请0人'}</p><p className="mt-3 text-[12px] leading-5 text-[#8190a5]">支付即代表你同意 <a href="#service-agreement" className="text-[#3987f5]">《创客贴VIP服务协议》</a></p><div className="mt-4 flex items-center gap-2 text-[12px] text-[#8b97a9]"><PaymentMethodMark type="alipay" /><PaymentMethodMark type="wechat" /><span>使用支付宝/微信扫码付款</span></div></div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>

    <button type="button" className="fixed bottom-7 right-8 flex h-[86px] w-[86px] flex-col items-center justify-center gap-1 rounded-[13px] bg-white text-[13px] font-medium text-[#354057] shadow-[0_12px_30px_rgba(71,92,130,.14)]"><Headphones className="h-6 w-6 text-[#63728a]" />联系客服</button>
    <button type="button" onClick={onBack} aria-label="关闭补差价升级页" className="fixed right-5 top-[92px] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#8e99aa] shadow-[0_5px_14px_rgba(40,55,79,.12)] transition hover:text-[#263247]"><X className="h-5 w-5" /></button>
  </div>;
}
