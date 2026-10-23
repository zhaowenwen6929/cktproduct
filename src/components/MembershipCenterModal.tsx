import { useEffect, useState } from 'react';
import { Check, ChevronRight, Crown, Gift, Sparkles, X } from 'lucide-react';
import { REAL_MEMBERSHIP_PLAN_DATA, type MembershipPlanData } from './membershipPlanData';
import { readMembershipPageConfig, type MembershipCommercialLicenseConfig, type MembershipComparisonConfig, type MembershipModelConsumptionConfig, type MembershipPageContent, type MembershipPlanDisplayConfig } from './membershipPageConfig';

type MembershipCenterModalProps = {
  onClose: () => void;
};

type MembershipPlan = MembershipPlanDisplayConfig & MembershipPlanData;

function hydratePlan(plan: MembershipPlanDisplayConfig): MembershipPlan {
  const data = REAL_MEMBERSHIP_PLAN_DATA[plan.planKey] ?? REAL_MEMBERSHIP_PLAN_DATA.basic;
  return { ...data, ...plan };
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

function ModelConsumptionTable({ config }: { config: MembershipModelConsumptionConfig }) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const columns = config.columns ?? [];
  const groups = config.groups ?? [];
  const columnCount = Math.max(columns.length, 1);
  const gridStyle = { gridTemplateColumns: `minmax(260px,1.45fr) repeat(${columnCount}, minmax(96px,1fr))` };

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
        const visibleRows = expanded ? group.rows : group.rows.slice(0, 5);
        return <section key={group.key}>
          <div className="flex items-center gap-3 border-t border-[#edf0f4] bg-white px-4 py-3"><span className="h-4 w-1 rounded-full bg-[#202938]" /><h3 className="text-[14px] font-semibold text-[#202938]">{group.title}</h3></div>
          {visibleRows.map((row, rowIndex) => <div key={`${row.name}-${rowIndex}`} className="grid items-center border-t border-[#edf0f4] px-4 py-3.5" style={gridStyle}>
            <div className="flex min-w-0 items-center gap-3 pl-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#dce1e8] text-[11px] text-[#7e8998]">✣</span><div className="min-w-0"><div className="truncate text-[12px] font-medium text-[#273144]">{row.name}</div><div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[#8994a3]"><span>{row.cost}</span>{row.badge ? <span className="rounded-[3px] bg-[#eaf1ff] px-1 py-0.5 text-[9px] text-[#266dff]">{row.badge} ⓘ</span> : null}</div></div></div>
            {columns.map((column, columnIndex) => <div key={`${column.label}-${columnIndex}`} className="text-center text-[13px] font-medium text-[#273144]">{row.quotas[columnIndex] ?? '—'} <span className="text-[11px] font-normal text-[#5e6979]">{row.unit}</span></div>)}
          </div>)}
          <div className="border-t border-[#edf0f4] px-4 py-3"><button type="button" onClick={() => setExpandedGroups((current) => ({ ...current, [group.key]: !expanded }))} className="flex items-center gap-1 text-[12px] font-medium text-[#7b8797] transition hover:text-[#168ff2]">{expanded ? '收起' : '查看更多'}<span className="text-[14px] leading-none">{expanded ? '⌃' : '⌄'}</span></button></div>
        </section>;
      })}
    </div>
  </div>;
}

function DetailsComparisonTable({ config }: { config: MembershipComparisonConfig }) {
  const columns = config.columns;
  const gridStyle = { gridTemplateColumns: `minmax(250px,1.35fr) repeat(${Math.max(columns.length, 1)}, minmax(150px,1fr))` };

  const renderValue = (value: string, columnIndex: number) => {
    if (value === '✓') return <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#8993a0] text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>;
    if (value === '—') return <span className="text-[#9ca5b1]">—</span>;
    return <span className={`block whitespace-pre-line leading-5 ${columnIndex === columns.length - 1 ? 'text-[#3e4959]' : 'text-[#4c5767]'}`}>{value}</span>;
  };

  return <div className="mt-5 overflow-x-auto rounded-[15px] border border-[#e7ebf0] bg-white">
    <div className="min-w-[820px]">
      <div className="grid items-center border-b border-[#e7ebf0] bg-[#fbfcfd]" style={gridStyle}>
        <div className="px-5 py-4 text-[12px] font-semibold text-[#273143]">会员版本</div>
        {columns.map((column, columnIndex) => <div key={column.key} className={`px-3 py-4 text-center text-[13px] font-semibold text-[#273143] ${columnIndex === columns.length - 1 ? 'bg-[#fafafa]' : ''}`}><span>{column.label}</span>{column.tag ? <span className="ml-1 rounded-[4px] bg-[#ff554c] px-1 py-0.5 text-[9px] font-medium text-white">{column.tag}</span> : null}</div>)}
      </div>
      {config.sections.map((section, sectionIndex) => <section key={`${section.title}-${sectionIndex}`}>
        {section.title !== '基础信息' ? <div className="flex items-center gap-3 border-b border-[#e7ebf0] bg-white px-5 py-4"><span className="h-4 w-1 rounded-full bg-[#202938]" /><h3 className="text-[13px] font-semibold text-[#273143]">{section.title}</h3></div> : null}
        {section.rows.map((row, rowIndex) => <div key={`${row.label}-${rowIndex}`} className="grid items-center border-b border-[#edf0f4] last:border-b-0" style={gridStyle}>
          <div className="px-5 py-4 text-[11px] leading-5 text-[#414c5c]">{row.label}</div>
          {columns.map((column, columnIndex) => <div key={`${column.key}-${columnIndex}`} className={`min-h-[52px] px-3 py-4 text-center text-[11px] ${columnIndex === columns.length - 1 ? 'bg-[#fafafa]' : ''}`}>{renderValue(row.values[columnIndex] ?? '—', columnIndex)}</div>)}
        </div>)}
      </section>)}
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

function PlanCard({ plan, selected, cycleKey, tierIndex = 0, onTierChange, enterprise = false, seats = 1, onSeatChange }: { plan: MembershipPlan; selected: boolean; cycleKey: string; tierIndex?: number; onTierChange?: (index: number) => void; enterprise?: boolean; seats?: number; onSeatChange?: (delta: number) => void }) {
  const isBlue = plan.color === 'blue';
  const isOrange = plan.color === 'orange';
  const isFeatured = isBlue || isOrange;
  const cycleData = plan.cyclePricing?.[cycleKey] ?? plan;
  const activeTier = cycleData.tierOptions?.[tierIndex] ?? cycleData.tierOptions?.[0];
  const displayPrice = activeTier?.price ?? cycleData.price;
  const displayOriginalPrice = activeTier?.originalPrice ?? cycleData.originalPrice;
  const displayPoints = activeTier ? `${activeTier.points} 积分每月` : cycleData.points;
  const displayPointsNote = activeTier?.pointsNote ?? cycleData.pointsNote;
  const displayMonthlyPrice = activeTier?.monthlyPrice ?? cycleData.monthlyPrice;
  const totalPrice = multiplyMoney(displayPrice, seats);
  const totalMonthlyPrice = multiplyMoney(displayMonthlyPrice, seats);
  const tierProgress = cycleData.tierOptions ? (tierIndex / (cycleData.tierOptions.length - 1)) * 100 : 0;
  const shell = isOrange
    ? `border-[#ff7b12] bg-[#fffaf4] ${selected ? 'shadow-[0_18px_40px_rgba(255,123,18,.18)]' : 'shadow-[0_12px_28px_rgba(255,123,18,.1)]'}`
    : isBlue
      ? `border-[#168ff2] bg-[#f7fbff] ${selected ? 'shadow-[0_18px_40px_rgba(22,143,242,.18)]' : 'shadow-[0_12px_28px_rgba(22,143,242,.1)]'}`
      : 'border-[#e8ebf0] bg-white shadow-[0_12px_28px_rgba(41,57,83,.06)]';
  const accent = isOrange ? '#ff7910' : '#168ff2';
  const emphasized = selected || isFeatured;
  const benefitSections = plan.benefitSections ?? [{ title: '专享权益', items: plan.features.map((feature) => ({ label: feature, enabled: true, badge: '专属通道' })) }];

  return <article className={`relative flex ${isFeatured ? 'min-h-[678px] -mt-7' : 'min-h-[650px]'} flex-col overflow-hidden rounded-[18px] border ${shell}`}>
    {isFeatured ? <div className={`h-7 shrink-0 px-4 text-center text-[10px] font-medium leading-7 text-white ${isOrange ? 'bg-[#ff7910]' : 'bg-[#168ff2]'}`}>Seedance 2.5 720P限时低至 {isOrange ? '¥0.19' : '¥0.43'}/秒</div> : null}
    <div className="px-5 pb-4 pt-5">
      <div className="flex items-start justify-between gap-2"><div><h3 className="text-[16px] font-semibold text-[#202938]">{plan.name}</h3><p className="mt-1 text-[11px] text-[#8590a0]">{plan.subtitle}</p></div>{plan.tag ? <span className={`rounded-[5px] px-1.5 py-1 text-[9px] font-medium text-white ${isOrange ? 'bg-[#ff7910]' : 'bg-[#168ff2]'}`}>{plan.tag}</span> : null}</div>
      <div className="mt-4 flex items-end gap-1 text-[#212a3a]"><span className="mb-1 text-[12px]">¥</span><strong className="text-[33px] font-semibold leading-none tracking-[-.05em]">{displayPrice}</strong>{enterprise ? <span className="mb-1 text-[11px] text-[#7f8999]">/席位/{cycleData.period}</span> : <span className="mb-1 text-[10px] text-[#7f8999]">{cycleData.period}</span>}{displayOriginalPrice ? <del className="mb-1 ml-1 text-[10px] text-[#aeb5bf]">¥{displayOriginalPrice}</del> : null}</div>
      <p className="mt-2 text-[10px] leading-4 text-[#929aa7]">{enterprise ? `¥${displayMonthlyPrice}/月/席位 · 单席位价格按当前套餐数据计算` : `首年${displayPrice} · 次年续费金额按当前价格计算 · 包年可随时取消`}</p>
      {enterprise ? <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[#566274]"><div className="flex items-center overflow-hidden rounded-[9px] border border-[#eef0f3] bg-white"><button type="button" aria-label="减少席位" disabled={seats <= 1} onClick={() => onSeatChange?.(-1)} className="flex h-8 w-8 items-center justify-center text-[16px] text-[#aab2bd] disabled:cursor-not-allowed disabled:opacity-40 hover:text-[#168ff2]">−</button><span className="min-w-[54px] text-center font-medium text-[#374255]">{seats} 席位</span><button type="button" aria-label="增加席位" onClick={() => onSeatChange?.(1)} className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[16px] text-[#566274] shadow-[0_1px_5px_rgba(34,48,70,.06)] hover:text-[#168ff2]">＋</button></div><span className="whitespace-nowrap text-[#6d7888]">合计 <b className="text-[13px] text-[#293548]">{totalPrice}元</b></span></div> : null}
    </div>
    {cycleData.tierOptions ? <div className="mx-5 mt-1 h-[64px] px-0"><div className="mb-1.5 flex items-center justify-between text-[10px] text-[#586474]">{cycleData.tierOptions.map((tier, index) => <button type="button" key={tier.quotaLabel} onClick={() => onTierChange?.(index)} className={`cursor-pointer ${index === tierIndex ? 'font-semibold text-[#202938]' : 'hover:text-[#168ff2]'}`}>{tier.quotaLabel}</button>)}</div><div className="relative h-5"><div className="absolute left-0 right-0 top-2 h-[4px] rounded-full bg-[#4b4f55]" /><span className="pointer-events-none absolute top-0 h-4 w-4 -translate-x-1/2 rounded-full border border-[#6f747b] bg-white shadow-[0_1px_3px_rgba(31,41,55,.16)]" style={{ left: `${tierProgress}%` }} /><input type="range" min={0} max={cycleData.tierOptions.length - 1} step={1} value={tierIndex} onChange={(event) => onTierChange?.(Number(event.currentTarget.value))} aria-label="高级会员积分档位" className="absolute inset-0 h-5 w-full cursor-pointer opacity-0" /></div></div> : <div className="mx-5 mt-1 h-[64px]" aria-hidden="true" />}
    <div className={`mx-4 rounded-[12px] px-4 py-3 ${emphasized ? isOrange ? 'bg-[#fff0dc]' : isBlue ? 'bg-[#eaf4ff]' : 'bg-[#eef1f5]' : 'bg-[#f7f8fa]'}`}><div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: emphasized ? accent : '#3e4858' }}><Sparkles className="h-3.5 w-3.5" />{enterprise ? `${displayPoints.replace('积分每月', '积分/席/月')}` : displayPoints}</div><p className="mt-1 text-[10px] text-[#8e98a7]">{displayPointsNote}</p></div>
    <div className="px-4 pt-4"><button type="button" className={`h-9 w-full rounded-full text-[12px] font-medium transition ${emphasized ? isOrange ? 'bg-[#ff7910] text-white hover:bg-[#ed6904]' : 'bg-[#168ff2] text-white hover:bg-[#087edc]' : 'bg-[#202938] text-white shadow-[0_5px_12px_rgba(32,41,56,.16)] hover:bg-[#111827]'}`}>立即开通</button><p className="mt-2 text-center text-[10px] text-[#9aa2ae]">折算 ¥{enterprise ? totalMonthlyPrice : displayMonthlyPrice}/月{enterprise ? ' · 多席位按人数计算' : ` · 首年${cycleData.discount}折`}</p></div>
    <div className="mt-5 flex-1 border-t border-[#eef0f3] px-5 pb-5 pt-5">
      {benefitSections.map((section, sectionIndex) => <section key={`${section.title}-${sectionIndex}`} className={sectionIndex > 0 ? 'mt-5' : ''}>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[12px] font-semibold text-[#273143]">{section.title}</h4>
          <div className="flex items-center gap-2">
            {section.badge ? <span className="rounded-[4px] bg-[#f1f3f6] px-1.5 py-0.5 text-[9px] text-[#929baa]">{section.badge}</span> : null}
            {section.actionLabel ? <button type="button" className={`text-[11px] font-medium ${isOrange ? 'text-[#ff6f2a]' : 'text-[#168ff2]'}`}>{section.actionLabel}</button> : null}
          </div>
        </div>
        <ul className="mt-3 space-y-2.5">
          {section.items.map((item, itemIndex) => {
            const enabled = item.enabled !== false;
            return <li key={`${item.label}-${itemIndex}`} className={`flex items-start gap-2 text-[11px] leading-4 ${enabled ? 'text-[#5d6878]' : 'text-[#a6afbc]'}`}>
              {enabled ? <Check className="mt-[2px] h-3.5 w-3.5 shrink-0" style={{ color: isFeatured || selected ? accent : '#697789' }} /> : <X className="mt-[2px] h-3.5 w-3.5 shrink-0 text-[#b9c0ca]" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start gap-1.5">
                  <span>{item.label}</span>
                  {item.badge ? <span className="rounded-[4px] bg-[#f1f3f6] px-1 py-0.5 text-[9px] leading-3 text-[#929baa]">{item.badge}</span> : null}
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
      </section>)}
    </div>
  </article>;
}

export function MembershipCenterModal({ onClose }: MembershipCenterModalProps) {
  const [membershipType, setMembershipType] = useState<'personal' | 'enterprise'>('personal');
  const [activeCycle, setActiveCycle] = useState(0);
  const [advancedTier, setAdvancedTier] = useState(1);
  const [enterpriseSeats, setEnterpriseSeats] = useState<Record<string, number>>({});
  const [pageConfig, setPageConfig] = useState<MembershipPageContent>(() => readMembershipPageConfig('web'));
  const [promotionDeadline] = useState(() => Date.now() + promotionDurationMs);
  const [remainingMs, setRemainingMs] = useState(promotionDurationMs);

  useEffect(() => {
    const updateCountdown = () => setRemainingMs(Math.max(0, promotionDeadline - Date.now()));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [promotionDeadline]);

  useEffect(() => {
    const reloadPageConfig = () => setPageConfig(readMembershipPageConfig('web'));
    window.addEventListener('storage', reloadPageConfig);
    window.addEventListener('membership-page-config-updated', reloadPageConfig);

    return () => {
      window.removeEventListener('storage', reloadPageConfig);
      window.removeEventListener('membership-page-config-updated', reloadPageConfig);
    };
  }, []);

  const countdown = formatCountdown(remainingMs);
  const personalTab = pageConfig.plans.tabs.find((tab) => tab.key === 'personal');
  const enterpriseTab = pageConfig.plans.tabs.find((tab) => tab.key === 'enterprise');
  const activeTab = pageConfig.plans.tabs.find((tab) => tab.key === membershipType) ?? pageConfig.plans.tabs[0];
  const visiblePlans = activeTab?.plans.map(hydratePlan) ?? [];
  const cycleOptions = activeTab?.options ?? [];
  const selectedCycle = Math.min(activeCycle, Math.max(cycleOptions.length - 1, 0));
  const activeCycleKey = cycleOptions[selectedCycle]?.key?.replace(/^team-/, '') ?? 'yearly';
  const activeDetails = pageConfig.details[membershipType];

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f2937]/35 p-4 text-[#202938] sm:p-8" role="dialog" aria-modal="true" aria-label="会员中心">
    <div className="relative h-[90vh] w-[90vw] overflow-hidden rounded-[22px] bg-white shadow-[0_24px_80px_rgba(15,23,42,.24)]">
      <div className="h-full overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_58%,#f7f9fc_100%)]">
      <header className="sticky top-0 z-10 border-b border-[#edf0f4] bg-white/95 backdrop-blur-md"><div className="mx-auto flex h-[48px] max-w-[1240px] items-center justify-between px-5"><div className="flex items-center gap-3 text-[12px] text-[#657084]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#efc7b4,#91a9c1)] text-[10px] text-white">营</span><span className="font-medium text-[#364052]">营萱</span><span>免费版</span><span className="text-[#d2d6dd]">|</span><span>积分 <b className="font-medium text-[#414b5b]">✦ 66</b></span><ChevronRight className="h-3.5 w-3.5" /></div><div className="flex items-center gap-6 text-[12px] text-[#657084]"><button type="button" className="hover:text-[#168ff2]">购买积分</button><button type="button" className="hover:text-[#168ff2]">会员兑换</button></div></div></header>
      <button type="button" onClick={onClose} aria-label="关闭会员中心" className="absolute right-3 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e9ef] bg-white text-[#7e8999] shadow-[0_4px_14px_rgba(38,53,79,.08)] transition hover:border-[#bdc7d7] hover:text-[#263247]"><X className="h-4 w-4" /></button>
      <main className="mx-auto max-w-[1240px] px-5 pb-20 pt-0">
        <section className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(112deg,#1588ee_0%,#1b94f7_48%,#ffd57d_100%)] px-6 py-5 shadow-[0_14px_34px_rgba(39,143,238,.17)]"><div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" /><div className="pointer-events-none absolute right-[17%] top-0 h-32 w-32 rounded-full bg-[#fff3d0]/40 blur-2xl" /><div className="relative flex min-h-[82px] items-center justify-between gap-6"><div><div className="mb-3 flex items-center gap-2"><span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#293548]">✦ Seedance 2.5</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-[#293548]">四重福利</span></div><p className="text-[17px] font-semibold text-white">🎟 ¥0.19超低单秒价备战双11</p><p className="mt-1 text-[15px] font-medium text-[#ffe74d]">最高额外加赠2个月会员、4万+积分</p></div><div className="hidden items-center gap-1.5 sm:flex"><CountdownBox value={countdown.days} label="天" /><CountdownBox value={countdown.hours} label="小时" /><CountdownBox value={countdown.minutes} label="分钟" /><CountdownBox value={countdown.seconds} label="秒" /></div></div></section>
        <section className="pt-6"><div className="flex items-center justify-center gap-10 text-[17px] font-semibold"><button type="button" onClick={() => { setMembershipType('personal'); setActiveCycle(0); }} className={`relative pb-3 ${membershipType === 'personal' ? 'text-[#202938]' : 'text-[#9aa1ac]'}`}>{personalTab?.name ?? '个人使用'}{membershipType === 'personal' ? <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#202938]" /> : null}</button><button type="button" onClick={() => { setMembershipType('enterprise'); setActiveCycle(0); }} className={`relative pb-3 ${membershipType === 'enterprise' ? 'text-[#202938]' : 'text-[#9aa1ac]'}`}>{enterpriseTab?.name ?? '企业使用'}{membershipType === 'enterprise' ? <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#202938]" /> : null}</button></div><div className="mx-auto mt-4 flex max-w-[560px] items-center justify-between rounded-full bg-[#eef0f4] p-1 text-[11px] text-[#4e5868] shadow-inner">{cycleOptions.map((cycle, index) => <button type="button" key={cycle.key} onClick={() => setActiveCycle(index)} className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2 py-2.5 transition ${selectedCycle === index ? 'bg-[#e4e7eb] font-semibold text-[#253043]' : 'hover:text-[#168ff2]'}`}>{cycle.name}{cycle.guideText ? <span className={selectedCycle === index ? 'text-[#168ff2]' : 'text-[#8993a2]'}>{cycle.guideText}</span> : null}</button>)}</div></section>
        <section className={`mt-[68px] grid grid-cols-1 gap-4 sm:grid-cols-2 ${visiblePlans.length <= 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>{visiblePlans.map((plan, index) => <PlanCard key={`${plan.name}-${index}`} plan={plan} cycleKey={activeCycleKey} selected={(membershipType === 'personal' && index === 2) || (membershipType === 'enterprise' && index === 3)} tierIndex={plan.color === 'blue' ? advancedTier : 0} onTierChange={plan.color === 'blue' ? setAdvancedTier : undefined} enterprise={membershipType === 'enterprise'} seats={enterpriseSeats[plan.planKey] ?? 1} onSeatChange={membershipType === 'enterprise' ? (delta) => setEnterpriseSeats((current) => ({ ...current, [plan.planKey]: Math.max(1, (current[plan.planKey] ?? 1) + delta) })) : undefined} />)}</section>
        <section className="mt-16 text-center"><h2 className="text-[20px] font-semibold text-[#273144]">{pageConfig.overview.title}</h2><p className="mt-2 text-[12px] text-[#9aa4b2]">{pageConfig.overview.subtitle}</p><div className="mx-auto mt-7 grid max-w-[780px] grid-cols-1 gap-3 text-left md:grid-cols-3">{pageConfig.overview.items.map((item, index) => { const Icon = [Gift, Crown, Sparkles][index % 3]; return <div key={`${item.title}-${index}`} className="rounded-[14px] border border-[#e9edf3] bg-white p-4"><Icon className={`h-5 w-5 ${index % 3 === 0 ? 'text-[#168ff2]' : index % 3 === 1 ? 'text-[#ff9b2f]' : 'text-[#7a6cf0]'}`} /><h3 className="mt-3 text-[13px] font-semibold">{item.title}</h3><p className="mt-1 text-[11px] leading-5 text-[#8a94a4]">{item.description}</p></div>; })}</div></section>
        <section className="mx-auto mt-12 max-w-[1120px] rounded-[16px] border border-[#e9edf3] bg-[#f7f8fa] p-6"><h2 className="text-[18px] font-semibold text-[#273144]">{pageConfig.details.title}</h2>{activeDetails ? <DetailsComparisonTable config={activeDetails} /> : <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">{(pageConfig.details.sections ?? []).map((section, index) => <div key={`${section.title}-${index}`} className="rounded-[12px] bg-white p-4"><h3 className="text-[13px] font-semibold text-[#394355]">{section.title}</h3><ul className="mt-3 space-y-2">{section.items.map((item) => <li key={item} className="flex items-center gap-2 text-[11px] text-[#6e7887]"><Check className="h-3.5 w-3.5 text-[#168ff2]" />{item}</li>)}</ul></div>)}</div>}</section>
        <section className="mx-auto mt-4 max-w-[1120px] rounded-[16px] border border-[#e9edf3] bg-[#f7f8fa] p-6"><h2 className="text-[18px] font-semibold text-[#273144]">{pageConfig.modelConsumption.title}</h2><p className="mt-2 text-[12px] text-[#8a94a4]">{pageConfig.modelConsumption.description}</p><ModelConsumptionTable config={pageConfig.modelConsumption} /></section>
        <CommercialLicenseOverview config={pageConfig.commercialLicense} />
        <section className="mx-auto mt-4 max-w-[980px] rounded-[16px] border border-[#e9edf3] bg-white p-6"><h2 className="text-[18px] font-semibold text-[#273144]">{pageConfig.faq.title}</h2><div className="mt-4 divide-y divide-[#edf0f4]">{pageConfig.faq.items.map((item, index) => <details key={`${item.question}-${index}`} className="py-3"><summary className="cursor-pointer text-[13px] font-medium text-[#394355]">{item.question}</summary><p className="mt-2 text-[12px] leading-5 text-[#8a94a4]">{item.answer}</p></details>)}</div></section>
      </main>
      </div>
    </div>
  </div>;
}
