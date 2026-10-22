import { useState } from 'react';
import { Check, ChevronRight, Crown, Gift, Sparkles, X } from 'lucide-react';

type MembershipCenterModalProps = {
  onClose: () => void;
};

type MembershipPlan = {
  name: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  period: string;
  points: string;
  pointsNote: string;
  color: 'neutral' | 'blue' | 'orange';
  tag?: string;
  features: string[];
};

const plans: MembershipPlan[] = [
  {
    name: '基础会员',
    subtitle: '适合初次探索 AI 创作',
    price: '393',
    originalPrice: '659',
    period: '每年',
    points: '725 积分每月',
    pointsNote: '换算约 1 = 22 分',
    color: 'neutral',
    features: ['Seedance 2.0 VIP', '标准生成通道', '生成作品去除品牌水印'],
  },
  {
    name: '标准会员',
    subtitle: '适合高频创作与持续产出',
    price: '1099',
    originalPrice: '1889',
    period: '每年',
    points: '2210 积分每月',
    pointsNote: '换算约 1 = 24 分',
    color: 'neutral',
    features: ['Seedance 2.0 VIP', '标准生成通道', '生成作品去除品牌水印'],
  },
  {
    name: '高级会员',
    subtitle: '适合大批量稳定产出与交付',
    price: '5199',
    originalPrice: '10398',
    period: '每年',
    points: '12320 积分每月',
    pointsNote: '换算约 1 = 28 分',
    color: 'blue',
    tag: '限时5折',
    features: ['Seedance 2.0 VIP', '图片 4.0', '快速生成通道', '生成作品去除品牌水印'],
  },
  {
    name: '超级会员',
    subtitle: '为极限产出而生',
    price: '19656',
    originalPrice: '43680',
    period: '每年',
    points: '54600 积分每月',
    pointsNote: '换算约 1 = 33 分',
    color: 'orange',
    tag: '加赠2个月会员',
    features: ['Seedance 2.0 VIP', '图片 4.0', '快速生成通道', '生成作品去除品牌水印', 'API 服务购买'],
  },
];

const cycles = [
  { label: '连续包年', note: '限时4.5折' },
  { label: '连续包月', note: '4.8折' },
  { label: '连续包季', note: '限时4.3折' },
  { label: '单月购买', note: '' },
];

function CountdownBox({ value, label }: { value: string; label: string }) {
  return <div className="flex h-[66px] w-[70px] flex-col items-center justify-center rounded-[16px] bg-white/75 text-[#1c283a] shadow-[0_10px_24px_rgba(40,93,185,.08)] backdrop-blur-sm"><strong className="text-[25px] font-semibold leading-7 tracking-[-.04em]">{value}</strong><span className="mt-0.5 text-[10px] text-[#6f7c90]">{label}</span></div>;
}

function PlanCard({ plan, selected }: { plan: MembershipPlan; selected: boolean }) {
  const isBlue = plan.color === 'blue';
  const isOrange = plan.color === 'orange';
  const shell = selected
    ? isOrange
      ? 'border-[#ff7b12] bg-[#fffaf4] shadow-[0_18px_40px_rgba(255,123,18,.15)]'
      : 'border-[#168ff2] bg-[#f7fbff] shadow-[0_18px_40px_rgba(22,143,242,.14)]'
    : 'border-[#e8ebf0] bg-white shadow-[0_12px_28px_rgba(41,57,83,.06)]';
  const accent = isOrange ? '#ff7910' : '#168ff2';

  return <article className={`relative flex min-h-[560px] flex-col overflow-hidden rounded-[18px] border ${shell}`}>
    {selected ? <div className={`h-9 shrink-0 px-4 text-center text-[11px] font-medium leading-9 text-white ${isOrange ? 'bg-[#ff7910]' : 'bg-[#168ff2]'}`}>Seedance 2.5 720P限时低至 ¥0.19/秒</div> : null}
    <div className="px-5 pb-4 pt-5">
      <div className="flex items-start justify-between gap-2"><div><h3 className="text-[16px] font-semibold text-[#202938]">{plan.name}</h3><p className="mt-1 text-[11px] text-[#8590a0]">{plan.subtitle}</p></div>{plan.tag ? <span className={`rounded-[5px] px-1.5 py-1 text-[9px] font-medium text-white ${isOrange ? 'bg-[#ff7910]' : 'bg-[#168ff2]'}`}>{plan.tag}</span> : null}</div>
      <div className="mt-4 flex items-end gap-1 text-[#212a3a]"><span className="mb-1 text-[12px]">¥</span><strong className="text-[33px] font-semibold leading-none tracking-[-.05em]">{plan.price}</strong><span className="mb-1 text-[10px] text-[#7f8999]">{plan.period}</span>{plan.originalPrice ? <del className="mb-1 ml-1 text-[10px] text-[#aeb5bf]">¥{plan.originalPrice}</del> : null}</div>
      <p className="mt-2 text-[10px] leading-4 text-[#929aa7]">首年{plan.price} · 次年续费金额按当前价格计算 · 包年可随时取消</p>
    </div>
    <div className={`mx-4 rounded-[12px] px-4 py-3 ${selected ? isOrange ? 'bg-[#fff0dc]' : 'bg-[#eaf4ff]' : 'bg-[#f7f8fa]'}`}><div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: selected ? accent : '#3e4858' }}><Sparkles className="h-3.5 w-3.5" />{plan.points}</div><p className="mt-1 text-[10px] text-[#8e98a7]">{plan.pointsNote}</p></div>
    <div className="px-4 pt-4"><button type="button" className={`h-9 w-full rounded-full text-[12px] font-medium transition ${selected ? isOrange ? 'bg-[#ff7910] text-white hover:bg-[#ed6904]' : 'bg-[#168ff2] text-white hover:bg-[#087edc]' : 'border border-[#dfe3e9] bg-white text-[#404955] hover:border-[#168ff2] hover:text-[#168ff2]'}`}>{selected ? `¥${plan.price} 首年${isOrange ? '4.5' : '5'}折` : `¥${plan.price} 首年${plan.name === '标准会员' ? '5.8' : '6'}折`}</button><p className="mt-2 text-center text-[10px] text-[#9aa2ae]">折算 ¥{isBlue ? '434' : isOrange ? '1,638' : plan.name === '标准会员' ? '92' : '33'}/月 · 较单月优惠</p></div>
    <div className="mt-5 flex-1 border-t border-[#eef0f3] px-5 pb-5 pt-5"><div className="mb-4 text-[12px] font-semibold text-[#394355]">专享权益</div><ul className="space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-[11px] text-[#6e7887]"><Check className="h-3.5 w-3.5 shrink-0" style={{ color: selected ? accent : '#8c96a5' }} />{feature}<span className="ml-auto rounded-[4px] bg-[#f1f3f6] px-1.5 py-0.5 text-[9px] text-[#929baa]">专属通道</span></li>)}</ul></div>
  </article>;
}

export function MembershipCenterModal({ onClose }: MembershipCenterModalProps) {
  const [membershipType, setMembershipType] = useState<'personal' | 'enterprise'>('personal');
  const [activeCycle, setActiveCycle] = useState(0);

  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-white text-[#202938]" role="dialog" aria-modal="true" aria-label="会员中心">
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_58%,#f7f9fc_100%)]">
      <header className="sticky top-0 z-10 border-b border-[#edf0f4] bg-white/95 backdrop-blur-md"><div className="mx-auto flex h-[56px] max-w-[1110px] items-center justify-between px-5"><div className="flex items-center gap-3 text-[12px] text-[#657084]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#efc7b4,#91a9c1)] text-[10px] text-white">营</span><span className="font-medium text-[#364052]">营萱</span><span>免费版</span><span className="text-[#d2d6dd]">|</span><span>积分 <b className="font-medium text-[#414b5b]">✦ 66</b></span><ChevronRight className="h-3.5 w-3.5" /></div><div className="flex items-center gap-6 text-[12px] text-[#657084]"><button type="button" className="hover:text-[#168ff2]">购买积分</button><button type="button" className="hover:text-[#168ff2]">会员兑换</button></div></div></header>
      <button type="button" onClick={onClose} aria-label="关闭会员中心" className="fixed right-5 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e9ef] bg-white text-[#7e8999] shadow-[0_4px_14px_rgba(38,53,79,.08)] transition hover:border-[#bdc7d7] hover:text-[#263247]"><X className="h-4 w-4" /></button>
      <main className="mx-auto max-w-[1110px] px-5 pb-20 pt-6">
        <section className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(112deg,#1588ee_0%,#1b94f7_48%,#ffd57d_100%)] px-6 py-5 shadow-[0_14px_34px_rgba(39,143,238,.17)]"><div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" /><div className="pointer-events-none absolute right-[17%] top-0 h-32 w-32 rounded-full bg-[#fff3d0]/40 blur-2xl" /><div className="relative flex min-h-[82px] items-center justify-between gap-6"><div><div className="mb-3 flex items-center gap-2"><span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#293548]">✦ Seedance 2.5</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-[#293548]">四重福利</span></div><p className="text-[17px] font-semibold text-white">🎟 ¥0.19超低单秒价备战双11</p><p className="mt-1 text-[15px] font-medium text-[#ffe74d]">最高额外加赠2个月会员、4万+积分</p></div><div className="hidden items-center gap-1.5 sm:flex"><CountdownBox value="04" label="天" /><CountdownBox value="01" label="小时" /><CountdownBox value="51" label="分钟" /><CountdownBox value="59" label="秒" /></div></div></section>
        <section className="pt-7"><div className="flex items-center justify-center gap-10 text-[17px] font-semibold"><button type="button" onClick={() => setMembershipType('personal')} className={`relative pb-3 ${membershipType === 'personal' ? 'text-[#202938]' : 'text-[#9aa1ac]'}`}>个人使用{membershipType === 'personal' ? <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#202938]" /> : null}</button><button type="button" onClick={() => setMembershipType('enterprise')} className={`relative pb-3 ${membershipType === 'enterprise' ? 'text-[#202938]' : 'text-[#9aa1ac]'}`}>企业使用{membershipType === 'enterprise' ? <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#202938]" /> : null}</button></div><div className="mx-auto mt-5 flex max-w-[560px] items-center justify-between rounded-full bg-[#eef0f4] p-1 text-[11px] text-[#4e5868] shadow-inner">{cycles.map((cycle, index) => <button type="button" key={cycle.label} onClick={() => setActiveCycle(index)} className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2 py-2.5 transition ${activeCycle === index ? 'bg-white font-semibold text-[#253043] shadow-[0_3px_8px_rgba(42,53,74,.12)]' : 'hover:text-[#168ff2]'}`}>{cycle.label}{cycle.note ? <span className={activeCycle === index ? 'text-[#168ff2]' : 'text-[#8993a2]'}>{cycle.note}</span> : null}</button>)}</div></section>
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{plans.map((plan, index) => <PlanCard key={plan.name} plan={plan} selected={(membershipType === 'personal' && index === 2) || (membershipType === 'enterprise' && index === 3)} />)}</section>
        <section className="mt-16 text-center"><h2 className="text-[20px] font-semibold text-[#273144]">哪个计划更适合你</h2><p className="mt-2 text-[12px] text-[#9aa4b2]">根据你的创作频率和团队规模，选择合适的会员权益</p><div className="mx-auto mt-7 grid max-w-[780px] grid-cols-1 gap-3 text-left md:grid-cols-3"><div className="rounded-[14px] border border-[#e9edf3] bg-white p-4"><Gift className="h-5 w-5 text-[#168ff2]" /><h3 className="mt-3 text-[13px] font-semibold">个人创作</h3><p className="mt-1 text-[11px] leading-5 text-[#8a94a4]">适合日常设计、AI 图片和视频创作。</p></div><div className="rounded-[14px] border border-[#e9edf3] bg-white p-4"><Crown className="h-5 w-5 text-[#ff9b2f]" /><h3 className="mt-3 text-[13px] font-semibold">高频产出</h3><p className="mt-1 text-[11px] leading-5 text-[#8a94a4]">适合营销活动、商品内容和持续交付。</p></div><div className="rounded-[14px] border border-[#e9edf3] bg-white p-4"><Sparkles className="h-5 w-5 text-[#7a6cf0]" /><h3 className="mt-3 text-[13px] font-semibold">企业协作</h3><p className="mt-1 text-[11px] leading-5 text-[#8a94a4]">适合团队成员共享权益和统一管理。</p></div></div></section>
      </main>
    </div>
  </div>;
}
