import { useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Check,
  ChevronRight,
  CircleAlert,
  CloudCog,
  Code2,
  Database,
  ExternalLink,
  Filter,
  Layers3,
  LayoutDashboard,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ServerCog,
  Settings2,
  ShieldCheck,
  TerminalSquare,
  Users,
  X,
} from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import {
  createAdminAuditLog,
  getDeveloperPlatformAdminOverview,
  getDeveloperPlatformAdminStore,
  saveDeveloperPlatformAdminStore,
  type AdminApp,
  type AdminCapability,
  type AdminCapabilitySource,
  type AdminCapabilityStatus,
  type AdminChannelId,
  type AdminSdkModule,
  type AdminTask,
  type DeveloperPlatformAdminStore,
} from '../services/developerPlatformAdminService';

export type DeveloperPlatformAdminPageKey = 'overview' | 'capabilities' | 'apps' | 'billing' | 'statistics' | 'tasks' | 'logs';

type DeveloperPlatformAdminPageProps = {
  activePage: DeveloperPlatformAdminPageKey;
  onBackToDirectory: () => void;
};

const pageLabels: Record<DeveloperPlatformAdminPageKey, string> = {
  overview: '平台概览',
  capabilities: '能力中心',
  apps: '应用管理',
  billing: '计费与额度',
  statistics: '数据统计',
  tasks: '任务监控',
  logs: '操作日志',
};

const channelLabels: Record<AdminChannelId, string> = {
  api: 'Open API',
  sdk: 'Product SDK',
  cli: 'CLI',
  mcp: 'MCP',
  'agent-skills': 'Agent Skills',
};

const statusStyles: Record<AdminCapabilityStatus, string> = {
  草稿: 'bg-[#f2f4f7] text-[#667085]',
  内测中: 'bg-[#fff3dc] text-[#b76a00]',
  已开放: 'bg-[#e6f7ee] text-[#18875d]',
  已有接口: 'bg-[#edf5ff] text-[#377dff]',
  'SDK 支持': 'bg-[#f1efff] text-[#6d5be7]',
  维护中: 'bg-[#e9f2ff] text-[#377dff]',
  已废弃: 'bg-[#f3f0f7] text-[#776482]',
  已下线: 'bg-[#eef0f3] text-[#667085]',
  规划中: 'bg-[#f0eefc] text-[#6b5bd2]',
};

const taskStyles: Record<AdminTask['status'], string> = {
  已创建: 'bg-[#f2f4f7] text-[#667085]',
  排队中: 'bg-[#fff3dc] text-[#b76a00]',
  运行中: 'bg-[#e9f2ff] text-[#377dff]',
  已成功: 'bg-[#e6f7ee] text-[#18875d]',
  已失败: 'bg-[#fff0ee] text-[#dd5147]',
  已取消: 'bg-[#f2f4f7] text-[#667085]',
  已过期: 'bg-[#f3f0f7] text-[#776482]',
};

const sourceLabels: Record<AdminCapabilitySource, string> = {
  existing_open_platform: '已有开放平台',
  product_planning: '产品规划',
  internal: '内部能力',
};

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: AdminCapabilityStatus }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${statusStyles[status]}`}>{status}</span>;
}

function PageTitle({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <div className="mb-1 text-[10px] font-semibold tracking-[.16em] text-[#8b97a9]">{eyebrow}</div> : null}
        <h1 className="text-[22px] font-semibold tracking-[-.03em] text-[#283244]">{title}</h1>
        <p className="mt-1 text-[12px] leading-5 text-[#8b97a9]">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

function Button({ children, variant = 'default', onClick, type = 'button', disabled = false }: { children: ReactNode; variant?: 'default' | 'primary' | 'danger' | 'ghost'; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  const classes = {
    default: 'border-[#dce3eb] bg-white text-[#475467] hover:border-[#b7c3d2] hover:bg-[#f8fafc]',
    primary: 'border-[#188cf2] bg-[#188cf2] text-white shadow-[0_4px_10px_rgba(24,140,242,.16)] hover:bg-[#0e7fdf]',
    danger: 'border-[#f0b5ae] bg-white text-[#d94f45] hover:bg-[#fff6f4]',
    ghost: 'border-transparent bg-transparent text-[#667085] hover:bg-[#f5f7fa]',
  }[variant];
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[6px] border px-3 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${classes}`}>{children}</button>;
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[8px] border border-[#e4e9f0] bg-white shadow-[0_2px_10px_rgba(37,53,80,.035)] ${className}`}>{children}</section>;
}

function PanelHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex items-center justify-between gap-4 border-b border-[#edf0f4] px-5 py-4"><div><h2 className="text-[14px] font-semibold text-[#283244]">{title}</h2>{description ? <p className="mt-1 text-[11px] text-[#98a2b2]">{description}</p> : null}</div>{actions}</header>;
}

function StatCard({ icon, label, value, hint, tone = 'blue' }: { icon: ReactNode; label: string; value: string | number; hint?: string; tone?: 'blue' | 'green' | 'orange' | 'purple' }) {
  const tones = { blue: 'bg-[#edf5ff] text-[#377dff]', green: 'bg-[#e9f8f1] text-[#2ca674]', orange: 'bg-[#fff4e5] text-[#db8a2b]', purple: 'bg-[#f1efff] text-[#6d5be7]' };
  return <div className="rounded-[8px] border border-[#e4e9f0] bg-white p-4 shadow-[0_2px_10px_rgba(37,53,80,.035)]"><div className="flex items-start justify-between"><span className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${tones[tone]}`}>{icon}</span>{hint ? <span className="text-[10px] text-[#2ca674]">{hint}</span> : null}</div><div className="mt-3 text-[11px] text-[#8b97a9]">{label}</div><div className="mt-1 text-[22px] font-semibold tracking-[-.04em] text-[#283244]">{value}</div></div>;
}

function TrendChart({ data, color = '#377dff', unit = '' }: { data: { date: string; value: number }[]; color?: string; unit?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <div className="flex h-[188px] items-end gap-3 px-3 pb-2 pt-5">{data.map((item) => <div key={item.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative flex h-full w-full items-end justify-center"><div title={`${item.value}${unit}`} className="w-full max-w-[26px] rounded-t-[5px] transition hover:opacity-80" style={{ height: `${Math.max(6, Math.round((item.value / max) * 100))}%`, background: color }} /></div><span className="text-[10px] text-[#98a2b2]">{item.date}</span></div>)}</div>;
}

function LegendRows({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = Math.max(items.reduce((sum, item) => sum + item.value, 0), 1);
  return <div className="space-y-3">{items.map((item) => <div key={item.label} className="flex items-center justify-between gap-3 text-[11px]"><span className="flex items-center gap-2 text-[#667085]"><i className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.label}</span><span className="font-medium text-[#344054]">{item.value} <span className="ml-1 text-[#98a2b2]">{Math.round((item.value / total) * 100)}%</span></span></div>)}</div>;
}

function EmptyTable({ message }: { message: string }) {
  return <div className="flex min-h-[160px] items-center justify-center text-[12px] text-[#98a2b2]">{message}</div>;
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block"><span className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-[#667085]"><span>{label}</span>{hint ? <span className="font-normal text-[#98a2b2]">{hint}</span> : null}</span>{children}</label>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-8 w-full rounded-[6px] border border-[#dce3eb] bg-white px-2.5 text-[12px] text-[#344054] outline-none transition placeholder:text-[#b7c0cc] focus:border-[#6caaf5] focus:ring-2 focus:ring-[#e7f2ff]" />;
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded-[6px] border border-[#dce3eb] bg-white px-2.5 text-[12px] text-[#344054] outline-none focus:border-[#6caaf5]">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
}

function Drawer({ title, children, onClose, widthClass = 'w-[520px]' }: { title: string; children: ReactNode; onClose: () => void; widthClass?: string }) {
  return <div className="fixed inset-0 z-40"><button type="button" className="absolute inset-0 bg-[#182230]/20" aria-label="关闭详情" onClick={onClose} /><aside className={`absolute bottom-0 right-0 top-0 flex ${widthClass} flex-col overflow-hidden border-l border-[#e4e9f0] bg-white shadow-[-8px_0_28px_rgba(37,53,80,.12)]`}><header className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#edf0f4] px-5"><h2 className="text-[16px] font-semibold text-[#283244]">{title}</h2><button type="button" onClick={onClose} className="rounded p-1 text-[#98a2b2] hover:bg-[#f5f7fa]"><X className="h-4 w-4" /></button></header><div className="flex-1 overflow-y-auto p-5">{children}</div></aside></div>;
}

function OverviewPage({ store }: { store: DeveloperPlatformAdminStore }) {
  const overview = useMemo(() => getDeveloperPlatformAdminOverview(store), [store]);
  return <>
    <PageTitle eyebrow="DEVELOPER PLATFORM · ADMIN" title="平台概览" description="配置公开能力的发布状态，并观察开发者平台的应用、调用、任务和额度运行情况。" actions={<><Button><RefreshCcw className="h-3.5 w-3.5" />刷新数据</Button><Button variant="primary"><Plus className="h-3.5 w-3.5" />新增能力</Button></>} />
    <div className="grid grid-cols-4 gap-3">
      <StatCard icon={<Layers3 className="h-4 w-4" />} label="能力总数" value={overview.stats.capabilityTotal} hint={`${overview.stats.openedCapabilities} 个已开放`} />
      <StatCard icon={<CloudCog className="h-4 w-4" />} label="活跃应用" value={`${overview.stats.activeApps} / ${overview.stats.appsTotal}`} hint="运行中" tone="green" />
      <StatCard icon={<Activity className="h-4 w-4" />} label="累计调用量" value={overview.stats.totalCalls.toLocaleString()} hint={`今日 ${overview.stats.todayCalls.toLocaleString()}`} tone="purple" />
      <StatCard icon={<BarChart3 className="h-4 w-4" />} label="累计积分消耗" value={overview.stats.totalPoints.toLocaleString()} hint={`今日 ${overview.stats.todayPoints.toLocaleString()}`} tone="orange" />
    </div>
    <div className="mt-3 grid grid-cols-[1.35fr_1fr] gap-3">
      <Panel><PanelHeader title="近 7 日调用趋势" description="所有已发布能力的调用量，来自 usage/trend 服务。" actions={<span className="rounded-full bg-[#eaf3ff] px-2 py-1 text-[10px] text-[#377dff]">累计 {overview.stats.totalCalls.toLocaleString()}</span>} /><TrendChart data={overview.callTrend} color="#377dff" unit=" 次" /></Panel>
      <Panel><PanelHeader title="近 7 日积分趋势" description="AI、任务和企业套餐额度的消耗汇总。" /><TrendChart data={overview.pointsTrend} color="#8b6cf6" unit=" 积分" /></Panel>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-3">
      <Panel className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-[14px] font-semibold text-[#283244]">能力状态分布</h2><span className="text-[11px] text-[#98a2b2]">{overview.stats.capabilityTotal} 项</span></div><LegendRows items={overview.statusDistribution} /></Panel>
      <Panel className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-[14px] font-semibold text-[#283244]">接入方式分布</h2><span className="text-[11px] text-[#98a2b2]">按能力配置</span></div><LegendRows items={overview.channelDistribution} /></Panel>
      <Panel className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-[14px] font-semibold text-[#283244]">任务运行提醒</h2><span className="text-[11px] text-[#98a2b2]">今日</span></div><div className="space-y-3"><div className="flex items-center justify-between rounded-[6px] bg-[#fff7f5] px-3 py-2.5"><span className="flex items-center gap-2 text-[11px] text-[#9b554d]"><CircleAlert className="h-3.5 w-3.5" />失败任务</span><strong className="text-[15px] text-[#d94f45]">{overview.stats.failedTasks}</strong></div><div className="flex items-center justify-between rounded-[6px] bg-[#f4f8ff] px-3 py-2.5"><span className="flex items-center gap-2 text-[11px] text-[#59759e]"><ServerCog className="h-3.5 w-3.5" />内测能力</span><strong className="text-[15px] text-[#377dff]">{overview.stats.betaCapabilities}</strong></div><div className="flex items-center justify-between rounded-[6px] bg-[#faf9ff] px-3 py-2.5"><span className="flex items-center gap-2 text-[11px] text-[#6f65a6]"><Settings2 className="h-3.5 w-3.5" />规划能力</span><strong className="text-[15px] text-[#6b5bd2]">{overview.stats.planningCapabilities}</strong></div></div></Panel>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3">
      <Panel><PanelHeader title="能力调用排行 Top 10" description="用于识别高频能力与服务稳定性。" /><RankTable rows={overview.capabilityRanks.map((item) => ({ name: item.name, secondary: item.category, primary: `${item.calls.toLocaleString()} 次`, trailing: `${item.successRate.toFixed(1)}%` }))} /></Panel>
      <Panel><PanelHeader title="应用调用排行 Top 10" description="用于识别活跃应用与额度消耗。" /><RankTable rows={overview.appRanks.map((item) => ({ name: item.name, secondary: item.organization, primary: `${item.calls.toLocaleString()} 次`, trailing: `${item.points.toLocaleString()} 积分` }))} /></Panel>
    </div>
  </>;
}

function RankTable({ rows }: { rows: { name: string; secondary: string; primary: string; trailing: string }[] }) {
  if (!rows.length) return <EmptyTable message="暂无排行数据" />;
  return <div className="divide-y divide-[#edf0f4]">{rows.map((row, index) => <div key={`${row.name}-${index}`} className="flex items-center gap-3 px-5 py-2.5"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${index < 3 ? 'bg-[#fff1c7] text-[#aa7717]' : 'bg-[#f2f4f7] text-[#98a2b2]'}`}>{index + 1}</span><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-medium text-[#344054]">{row.name}</div><div className="mt-0.5 truncate text-[10px] text-[#98a2b2]">{row.secondary}</div></div><span className="text-[11px] text-[#667085]">{row.primary}</span><span className="w-[68px] text-right text-[11px] text-[#377dff]">{row.trailing}</span></div>)}</div>;
}

function CapabilityPage({ store, onChange }: { store: DeveloperPlatformAdminStore; onChange: (store: DeveloperPlatformAdminStore) => void }) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('全部分类');
  const [status, setStatus] = useState('全部状态');
  const [channel, setChannel] = useState('全部接入方式');
  const [source, setSource] = useState('全部来源');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const filtered = useMemo(() => store.capabilities.filter((item) => {
    const text = `${item.name} ${item.capabilityCode} ${item.description}`.toLowerCase();
    return (!keyword || text.includes(keyword.toLowerCase())) && (category === '全部分类' || item.category === category) && (status === '全部状态' || item.status === status) && (source === '全部来源' || sourceLabels[item.source] === source) && (channel === '全部接入方式' || item.channels[(Object.keys(channelLabels).find((key) => channelLabels[key as AdminChannelId] === channel) ?? 'api') as AdminChannelId].enabled);
  }), [store.capabilities, keyword, category, status, channel, source]);
  const selected = store.capabilities.find((item) => item.id === selectedId);
  const categories = ['全部分类', ...Array.from(new Set(store.capabilities.map((item) => item.category)))];
  const statuses = ['全部状态', '草稿', '内测中', '已开放', '维护中', '已废弃', '已下线', '规划中'];
  const sources = ['全部来源', ...Object.values(sourceLabels)];
  const handleCapabilitySave = (nextCapability: AdminCapability, isNew = false) => {
    const next = { ...store, capabilities: isNew ? [nextCapability, ...store.capabilities] : store.capabilities.map((item) => item.id === nextCapability.id ? nextCapability : item) };
    onChange({ ...next, auditLogs: [createAdminAuditLog('能力中心', isNew ? '新增能力' : '编辑能力', nextCapability.name, isNew ? '—' : '已保存配置', `${nextCapability.status} / ${nextCapability.version}`), ...store.auditLogs] });
    setSelectedId(nextCapability.id);
    setIsCreating(false);
  };
  const handleStatusChange = (capability: AdminCapability, nextStatus: AdminCapabilityStatus) => {
    const action = nextStatus === '已开放' ? '发布能力' : nextStatus === '已下线' ? '下线能力' : '更新状态';
    if (!window.confirm(`确认将「${capability.name}」${action}吗？该操作会写入操作日志。`)) return;
    handleCapabilitySave({ ...capability, status: nextStatus, publicVisible: nextStatus === '已开放' }, false);
  };
  const handleSyncExisting = () => {
    const nextCapabilities = store.capabilities.map((item) => item.source === 'existing_open_platform' ? { ...item, docsUrl: item.docsUrl || 'https://chuangkit.yuque.com/qltowx/openapi3.0/ln9rmy', updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : item);
    onChange({ ...store, capabilities: nextCapabilities, auditLogs: [createAdminAuditLog('能力中心', '同步已有能力', '开放平台能力目录', '本地配置', '已同步'), ...store.auditLogs] });
  };
  return <>
    <PageTitle eyebrow="CONFIGURATION" title="能力中心" description="管理公开能力、接入方式、状态、权限和计费配置；发布后才会进入开发者中心公开数据。" actions={<><Button onClick={handleSyncExisting}><RefreshCcw className="h-3.5 w-3.5" />同步已有能力</Button><Button variant="primary" onClick={() => setIsCreating(true)}><Plus className="h-3.5 w-3.5" />新增能力</Button></>} />
    <Panel><div className="grid grid-cols-[1.4fr_repeat(4,1fr)_auto] gap-2 border-b border-[#edf0f4] p-4"><div className="relative"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#98a2b2]" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索能力名称 / Code / 描述" className="h-8 w-full rounded-[6px] border border-[#dce3eb] pl-8 pr-2 text-[12px] outline-none focus:border-[#6caaf5]" /></div><SelectInput value={category} onChange={setCategory} options={categories} /><SelectInput value={status} onChange={setStatus} options={statuses} /><SelectInput value={channel} onChange={setChannel} options={['全部接入方式', ...Object.values(channelLabels)]} /><SelectInput value={source} onChange={setSource} options={sources} /><Button variant="ghost"><Filter className="h-3.5 w-3.5" />更多筛选</Button></div><div className="flex items-center justify-between border-b border-[#edf0f4] px-5 py-3 text-[11px] text-[#98a2b2]"><span>共 {filtered.length} 项能力 · 已开放 {store.capabilities.filter((item) => item.status === '已开放').length} · 规划中 {store.capabilities.filter((item) => item.status === '规划中').length}</span><span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-[#37a977]" />公开数据仅同步已发布能力</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1050px] border-collapse text-left"><thead><tr className="border-b border-[#edf0f4] bg-[#fbfcfd] text-[10px] text-[#98a2b2]"><th className="px-5 py-3 font-medium">能力名称 / Code</th><th className="px-3 py-3 font-medium">分类</th><th className="px-3 py-3 font-medium">来源</th><th className="px-3 py-3 font-medium">接入方式</th><th className="px-3 py-3 font-medium">状态</th><th className="px-3 py-3 font-medium">AI 调用</th><th className="px-3 py-3 font-medium">计费方式</th><th className="px-3 py-3 font-medium">调用量</th><th className="px-5 py-3 text-right font-medium">操作</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[#f0f2f5] text-[11px] hover:bg-[#fbfdff]"><td className="px-5 py-3"><button type="button" onClick={() => setSelectedId(item.id)} className="text-left"><div className="font-medium text-[#344054] hover:text-[#188cf2]">{item.name}</div><div className="mt-1 font-mono text-[10px] text-[#98a2b2]">{item.capabilityCode}</div></button></td><td className="px-3 py-3 text-[#667085]">{item.category}</td><td className="px-3 py-3 text-[#667085]">{sourceLabels[item.source]}</td><td className="px-3 py-3"><div className="flex max-w-[180px] flex-wrap gap-1">{(Object.keys(channelLabels) as AdminChannelId[]).filter((id) => item.channels[id].enabled).map((id) => <span key={id} className="rounded bg-[#f2f6fb] px-1.5 py-1 text-[10px] text-[#52708d]">{channelLabels[id]}</span>)}</div></td><td className="px-3 py-3"><StatusBadge status={item.status} /></td><td className="px-3 py-3">{item.allowAi ? <span className="text-[#18875d]">允许</span> : <span className="text-[#98a2b2]">不允许</span>}</td><td className="px-3 py-3 text-[#667085]">{item.billing.mode}</td><td className="px-3 py-3 text-[#667085]">{item.stats.calls.toLocaleString()}</td><td className="px-5 py-3 text-right"><button type="button" onClick={() => setSelectedId(item.id)} className="rounded p-1.5 text-[#98a2b2] hover:bg-[#eef5ff] hover:text-[#377dff]"><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</tbody></table>{filtered.length === 0 ? <EmptyTable message="没有匹配的能力" /> : null}</div></Panel>
    <div className="mt-3"><SdkFamilyPanel modules={store.sdkModules} /></div>
    {selected ? <CapabilityDrawer capability={selected} onClose={() => setSelectedId(null)} onSave={(next) => handleCapabilitySave(next)} onStatusChange={handleStatusChange} /> : null}
    {isCreating ? <CapabilityCreateDrawer onClose={() => setIsCreating(false)} onCreate={(next) => handleCapabilitySave(next, true)} /> : null}
  </>;
}

function SdkFamilyPanel({ modules }: { modules: AdminSdkModule[] }) {
  return <Panel><PanelHeader title="Product SDK 模块集合" description="Product SDK 是完整的产品能力集合，Editor SDK 仅是其中一个模块。" actions={<span className="rounded-full bg-[#f1efff] px-2 py-1 text-[10px] text-[#6b5bd2]">{modules.length} 个模块</span>} /><div className="grid grid-cols-3 gap-3 p-4">{modules.map((module) => <div key={module.id} className="rounded-[7px] border border-[#edf0f4] p-3"><div className="flex items-start justify-between gap-2"><div className="text-[12px] font-medium text-[#344054]">{module.name}</div><span className={`rounded-full px-1.5 py-0.5 text-[9px] ${module.publicOpen ? 'bg-[#e6f7ee] text-[#18875d]' : 'bg-[#f0eefc] text-[#6b5bd2]'}`}>{module.publicOpen ? '已开放' : '规划中'}</span></div><p className="mt-1.5 min-h-[32px] text-[10px] leading-4 text-[#98a2b2]">{module.description}</p><div className="mt-2 flex items-center justify-between text-[10px] text-[#667085]"><span>{module.packageName}</span><span>{module.currentVersion}</span></div></div>)}</div></Panel>;
}

function capabilityDraft(capability?: AdminCapability): AdminCapability {
  return capability ?? {
    id: `cap-${Date.now()}`,
    capabilityCode: 'new.capability',
    name: '未命名能力',
    category: '设计',
    description: '',
    publicName: '未命名能力',
    publicDescription: '',
    source: 'internal',
    status: '草稿',
    version: 'v1',
    order: 99,
    docsUrl: '',
    exampleUrl: '',
    publicVisible: false,
    allowAi: false,
    requireConfirmation: false,
    channels: { api: { enabled: true, status: '草稿', docsUrl: '', version: 'v1', note: '' }, sdk: { enabled: false, status: '规划中', docsUrl: '', version: '—', note: '' }, cli: { enabled: false, status: '规划中', docsUrl: '', version: '—', note: '' }, mcp: { enabled: false, status: '规划中', docsUrl: '', version: '—', note: '' }, 'agent-skills': { enabled: false, status: '规划中', docsUrl: '', version: '—', note: '' } },
    billing: { mode: '免费', unit: '次', unitPrice: '0', priceVisible: true, freeQuota: '不限', enterprisePrice: '—', refundOnFailure: true, retryCharge: false, effectiveAt: new Date().toISOString().slice(0, 16).replace('T', ' ') },
    stats: { calls: 0, points: 0, successRate: 0 },
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
}

function CapabilityDrawer({ capability, onClose, onSave, onStatusChange }: { capability: AdminCapability; onClose: () => void; onSave: (capability: AdminCapability) => void; onStatusChange: (capability: AdminCapability, status: AdminCapabilityStatus) => void }) {
  const [draft, setDraft] = useState(() => capabilityDraft(capability));
  const update = <K extends keyof AdminCapability>(key: K, value: AdminCapability[K]) => setDraft((current) => ({ ...current, [key]: value }));
  return <Drawer title="编辑能力配置" onClose={onClose}><div className="space-y-5"><div className="rounded-[7px] bg-[#f7f9fc] p-3"><div className="flex items-center justify-between"><span className="font-mono text-[11px] text-[#667085]">{draft.capabilityCode}</span><StatusBadge status={draft.status} /></div><p className="mt-2 text-[11px] leading-5 text-[#667085]">公开首页只读取已发布摘要；完整配置、计费和权限仅在登录后的控制台中展示。</p></div><div className="grid grid-cols-2 gap-3"><Field label="能力名称"><TextInput value={draft.name} onChange={(value) => update('name', value)} /></Field><Field label="能力 Code"><TextInput value={draft.capabilityCode} onChange={(value) => update('capabilityCode', value)} /></Field><Field label="分类"><SelectInput value={draft.category} onChange={(value) => update('category', value)} options={['模板', '素材', '设计', '图片编辑', 'AI', '视频', 'POD', 'DAM', '品牌', '企业', '导出', '任务', '协作', '评论']} /></Field><Field label="来源"><SelectInput value={sourceLabels[draft.source]} onChange={(value) => update('source', Object.entries(sourceLabels).find(([, label]) => label === value)?.[0] as AdminCapabilitySource)} options={Object.values(sourceLabels)} /></Field><Field label="当前版本"><TextInput value={draft.version} onChange={(value) => update('version', value)} /></Field><Field label="展示顺序"><TextInput value={String(draft.order)} onChange={(value) => update('order', Number(value) || 0)} /></Field></div><Field label="能力说明"><textarea value={draft.description} onChange={(event) => update('description', event.target.value)} rows={3} className="w-full resize-none rounded-[6px] border border-[#dce3eb] p-2.5 text-[12px] outline-none focus:border-[#6caaf5]" /></Field><div className="grid grid-cols-2 gap-3"><Field label="公开名称"><TextInput value={draft.publicName} onChange={(value) => update('publicName', value)} /></Field><Field label="文档地址"><TextInput value={draft.docsUrl} onChange={(value) => update('docsUrl', value)} placeholder="https://..." /></Field></div><Field label="公开描述"><textarea value={draft.publicDescription} onChange={(event) => update('publicDescription', event.target.value)} rows={2} className="w-full resize-none rounded-[6px] border border-[#dce3eb] p-2.5 text-[12px] outline-none focus:border-[#6caaf5]" /></Field><div className="grid grid-cols-2 gap-3"><label className="flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.publicVisible} onChange={(event) => update('publicVisible', event.target.checked)} />同步到公开首页</label><label className="flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.allowAi} onChange={(event) => update('allowAi', event.target.checked)} />允许 AI 调用</label><label className="flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.requireConfirmation} onChange={(event) => update('requireConfirmation', event.target.checked)} />调用前需确认</label></div><div><div className="mb-2 text-[11px] font-medium text-[#667085]">接入方式配置</div><div className="space-y-2">{(Object.keys(channelLabels) as AdminChannelId[]).map((id) => <div key={id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[6px] border border-[#edf0f4] p-2.5"><input type="checkbox" checked={draft.channels[id].enabled} onChange={(event) => setDraft((current) => ({ ...current, channels: { ...current.channels, [id]: { ...current.channels[id], enabled: event.target.checked } } }))} /><span className="text-[11px] text-[#344054]">{channelLabels[id]}</span><span className="text-[10px] text-[#98a2b2]">{draft.channels[id].status}</span></div>)}</div></div><div className="rounded-[7px] border border-[#f0e5cf] bg-[#fffaf0] p-3 text-[11px] leading-5 text-[#8b6b2c]">发布、废弃和下线需要二次确认；已发布能力不支持物理删除，所有变更会记录操作日志。</div><div className="flex items-center justify-between border-t border-[#edf0f4] pt-4"><div className="flex gap-2">{draft.status !== '已开放' ? <Button variant="primary" onClick={() => onStatusChange(draft, '已开放')}>发布</Button> : <Button variant="danger" onClick={() => onStatusChange(draft, '已下线')}>下线</Button>}{draft.status !== '已废弃' ? <Button variant="ghost" onClick={() => onStatusChange(draft, '已废弃')}>废弃</Button> : null}</div><div className="flex gap-2"><Button onClick={onClose}>取消</Button><Button variant="primary" onClick={() => onSave({ ...draft, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })}><Check className="h-3.5 w-3.5" />保存配置</Button></div></div></div></Drawer>;
}

type CreateCapabilitySection = 'basic' | 'public' | 'access' | 'billing' | 'review';

function CapabilityCreateDrawer({ onClose, onCreate }: { onClose: () => void; onCreate: (capability: AdminCapability) => void }) {
  const [draft, setDraft] = useState(() => capabilityDraft());
  const [section, setSection] = useState<CreateCapabilitySection>('basic');
  const [error, setError] = useState('');
  const sections: { id: CreateCapabilitySection; label: string; description: string }[] = [
    { id: 'basic', label: '基础信息', description: '定义能力身份与归属' },
    { id: 'public', label: '公开展示', description: '配置首页和控制台摘要' },
    { id: 'access', label: '接入方式', description: '配置 API、SDK、CLI 和 MCP' },
    { id: 'billing', label: '权限与计费', description: '配置调用权限和消耗规则' },
    { id: 'review', label: '发布检查', description: '确认配置完整后保存草稿' },
  ];
  const categories = ['模板', '素材', '设计', '图片编辑', 'AI', '视频', 'POD', 'DAM', '品牌', '企业', '导出', '任务', '协作', '评论'];
  const channelStatuses: AdminCapabilityStatus[] = ['草稿', '内测中', '已开放', '维护中', '规划中'];
  const update = <K extends keyof AdminCapability>(key: K, value: AdminCapability[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateChannel = (id: AdminChannelId, values: Partial<AdminCapability['channels'][AdminChannelId]>) => setDraft((current) => ({ ...current, channels: { ...current.channels, [id]: { ...current.channels[id], ...values } } }));
  const enabledChannels = (Object.keys(channelLabels) as AdminChannelId[]).filter((id) => draft.channels[id].enabled);
  const isBasicComplete = Boolean(draft.name.trim() && draft.capabilityCode.trim() && draft.description.trim());
  const isPublicComplete = Boolean(draft.publicName.trim() && draft.publicDescription.trim());
  const isAccessComplete = enabledChannels.length > 0;
  const isBillingComplete = Boolean(draft.billing.mode && draft.billing.unit);
  const canSave = isBasicComplete && isAccessComplete && isBillingComplete;
  const saveDraft = () => {
    if (!canSave) {
      setError('请补充能力名称、Code、能力说明，至少选择一种接入方式，并填写计费单位。');
      setSection('review');
      return;
    }
    onCreate({
      ...draft,
      publicName: draft.publicName || draft.name,
      publicDescription: draft.publicDescription || draft.description,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
  };
  const goNext = () => {
    const index = sections.findIndex((item) => item.id === section);
    if (section === 'basic' && !isBasicComplete) {
      setError('请先填写能力名称、能力 Code 和能力说明。');
      return;
    }
    if (section === 'access' && !isAccessComplete) {
      setError('请至少选择一种可用的接入方式。');
      return;
    }
    setError('');
    if (index < sections.length - 1) setSection(sections[index + 1].id);
  };
  const goPrevious = () => {
    const index = sections.findIndex((item) => item.id === section);
    setError('');
    if (index > 0) setSection(sections[index - 1].id);
  };

  return <Drawer title="新增能力" widthClass="w-[680px]" onClose={onClose}>
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-[8px] border border-[#dbeafe] bg-[#f6faff] p-3.5">
        <div className="flex gap-3"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7f2ff] text-[#377dff]"><Layers3 className="h-3.5 w-3.5" /></div><div><div className="text-[12px] font-medium text-[#344054]">创建一项可被统一发布的开放能力</div><p className="mt-1 text-[11px] leading-5 text-[#667085]">新增能力会先保存为草稿。配置完成后，可在详情页发布到开发者中心；未发布内容不会进入公开首页。</p></div></div>
        <span className="shrink-0 rounded-full bg-[#eef0f3] px-2 py-1 text-[10px] text-[#667085]">草稿 · 未发布</span>
      </div>

      <div className="grid grid-cols-5 gap-1 rounded-[8px] bg-[#f7f9fc] p-1">
        {sections.map((item, index) => <button key={item.id} type="button" onClick={() => { setError(''); setSection(item.id); }} className={`rounded-[6px] px-2 py-2 text-left transition ${section === item.id ? 'bg-white shadow-[0_1px_4px_rgba(37,53,80,.08)]' : 'hover:bg-white/70'}`}><div className={`text-[11px] font-medium ${section === item.id ? 'text-[#188cf2]' : 'text-[#667085]'}`}>{index + 1}. {item.label}</div><div className="mt-0.5 truncate text-[9px] text-[#98a2b2]">{item.description}</div></button>)}
      </div>

      {section === 'basic' ? <div className="space-y-4">
        <div><h3 className="text-[14px] font-semibold text-[#283244]">基础信息</h3><p className="mt-1 text-[11px] text-[#98a2b2]">先建立能力的唯一身份，后续 API、SDK 和 Agent 都通过这个 Code 关联。</p></div>
        <div className="grid grid-cols-2 gap-3"><Field label="能力名称" hint="必填"><TextInput value={draft.name} onChange={(value) => update('name', value)} placeholder="例如：模板搜索" /></Field><Field label="能力 Code" hint="必填"><TextInput value={draft.capabilityCode} onChange={(value) => update('capabilityCode', value)} placeholder="例如：template.search" /></Field><Field label="能力分类"><SelectInput value={draft.category} onChange={(value) => update('category', value)} options={categories} /></Field><Field label="能力来源"><SelectInput value={sourceLabels[draft.source]} onChange={(value) => update('source', Object.entries(sourceLabels).find(([, label]) => label === value)?.[0] as AdminCapabilitySource)} options={Object.values(sourceLabels)} /></Field><Field label="初始版本"><TextInput value={draft.version} onChange={(value) => update('version', value)} placeholder="v1" /></Field><Field label="展示顺序" hint="数字越小越靠前"><TextInput value={String(draft.order)} onChange={(value) => update('order', Number(value) || 0)} /></Field></div>
        <Field label="能力说明" hint="必填"><textarea value={draft.description} onChange={(event) => update('description', event.target.value)} rows={4} placeholder="说明这项能力解决什么问题，面向哪些开发者场景。" className="w-full resize-none rounded-[6px] border border-[#dce3eb] p-2.5 text-[12px] leading-5 outline-none focus:border-[#6caaf5]" /></Field>
        <div className="flex items-center gap-2 rounded-[7px] bg-[#fbfcfd] px-3 py-2.5 text-[10px] text-[#98a2b2]"><Code2 className="h-3.5 w-3.5 text-[#377dff]" />建议使用 domain.action 格式，例如 template.search、design.export、ai.remove。</div>
      </div> : null}

      {section === 'public' ? <div className="space-y-4">
        <div><h3 className="text-[14px] font-semibold text-[#283244]">公开展示</h3><p className="mt-1 text-[11px] text-[#98a2b2]">首页仅展示简短摘要；完整字段、权限和计费规则会留在登录后的能力中心。</p></div>
        <Field label="公开名称"><TextInput value={draft.publicName} onChange={(value) => update('publicName', value)} placeholder={draft.name || '默认使用能力名称'} /></Field>
        <Field label="公开描述"><textarea value={draft.publicDescription} onChange={(event) => update('publicDescription', event.target.value)} rows={4} placeholder="用于开发者平台首页能力摘要，建议控制在 50 字以内。" className="w-full resize-none rounded-[6px] border border-[#dce3eb] p-2.5 text-[12px] leading-5 outline-none focus:border-[#6caaf5]" /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="文档地址"><TextInput value={draft.docsUrl} onChange={(value) => update('docsUrl', value)} placeholder="https://..." /></Field><Field label="示例地址"><TextInput value={draft.exampleUrl} onChange={(value) => update('exampleUrl', value)} placeholder="https://..." /></Field></div>
        <label className="flex items-start gap-2 rounded-[7px] border border-[#edf0f4] p-3 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.publicVisible} onChange={(event) => update('publicVisible', event.target.checked)} className="mt-0.5" /><span><span className="font-medium text-[#344054]">允许同步到公开首页</span><span className="mt-1 block text-[10px] leading-4 text-[#98a2b2]">仅当能力状态为“已开放”且发布后才会实际展示，勾选本身不会绕过发布审核。</span></span></label>
        <div className={`rounded-[7px] p-3 text-[11px] leading-5 ${isPublicComplete ? 'bg-[#f0fbf6] text-[#287a5a]' : 'bg-[#fffaf0] text-[#8b6b2c]'}`}>{isPublicComplete ? '公开摘要已填写，发布后可同步到开发者中心。' : '建议补充公开名称和公开描述，方便首页与能力总览使用。'}</div>
      </div> : null}

      {section === 'access' ? <div className="space-y-4">
        <div><h3 className="text-[14px] font-semibold text-[#283244]">接入方式</h3><p className="mt-1 text-[11px] text-[#98a2b2]">同一项能力可以被多个入口复用。至少配置一种接入方式，才允许保存。</p></div>
        <div className="space-y-3">{(Object.keys(channelLabels) as AdminChannelId[]).map((id) => { const channel = draft.channels[id]; return <div key={id} className={`rounded-[8px] border p-3.5 transition ${channel.enabled ? 'border-[#cfe3fb] bg-[#fbfdff]' : 'border-[#edf0f4] bg-white'}`}><div className="flex items-start gap-3"><input type="checkbox" checked={channel.enabled} onChange={(event) => updateChannel(id, { enabled: event.target.checked })} className="mt-1" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className="text-[12px] font-medium text-[#344054]">{channelLabels[id]}</span><span className={`rounded-full px-2 py-1 text-[10px] ${channel.enabled ? 'bg-[#eaf3ff] text-[#377dff]' : 'bg-[#f2f4f7] text-[#98a2b2]'}`}>{channel.enabled ? '已配置' : '未启用'}</span></div><p className="mt-1 text-[10px] text-[#98a2b2]">{id === 'api' ? '公共 HTTP 能力底座，承载服务端和企业系统接入。' : id === 'sdk' ? 'Product SDK 家族中的产品能力模块。' : id === 'cli' ? '面向脚本、批处理和本地自动化。' : id === 'mcp' ? '面向 Agent 的工具调用和自然语言工作流。' : '面向 Agent Skills 的能力编排与复用。'}</p>{channel.enabled ? <div className="mt-3 grid grid-cols-2 gap-2.5"><Field label="渠道状态"><SelectInput value={channel.status} onChange={(value) => updateChannel(id, { status: value as AdminCapabilityStatus })} options={channelStatuses} /></Field><Field label="版本"><TextInput value={channel.version} onChange={(value) => updateChannel(id, { version: value })} placeholder="v1" /></Field><Field label="渠道文档"><TextInput value={channel.docsUrl} onChange={(value) => updateChannel(id, { docsUrl: value })} placeholder="https://..." /></Field><Field label="补充说明"><TextInput value={channel.note} onChange={(value) => updateChannel(id, { note: value })} placeholder="例如：需申请企业权限" /></Field></div> : null}</div></div></div>; })}</div>
      </div> : null}

      {section === 'billing' ? <div className="space-y-4">
        <div><h3 className="text-[14px] font-semibold text-[#283244]">权限与计费</h3><p className="mt-1 text-[11px] text-[#98a2b2]">配置能力是否允许 AI 调用、是否需要二次确认，以及开发者控制台中的计费口径。</p></div>
        <div className="grid grid-cols-2 gap-3"><Field label="计费模式"><SelectInput value={draft.billing.mode} onChange={(value) => update('billing', { ...draft.billing, mode: value as AdminCapability['billing']['mode'] })} options={['免费', '按调用次数', '按任务计费', '按积分计费', '企业套餐额度', '需申请']} /></Field><Field label="计费单位" hint="必填"><TextInput value={draft.billing.unit} onChange={(value) => update('billing', { ...draft.billing, unit: value })} placeholder="次 / 任务 / 积分" /></Field><Field label="单价"><TextInput value={draft.billing.unitPrice} onChange={(value) => update('billing', { ...draft.billing, unitPrice: value })} placeholder="例如：10 积分 / 次" /></Field><Field label="免费额度"><TextInput value={draft.billing.freeQuota} onChange={(value) => update('billing', { ...draft.billing, freeQuota: value })} placeholder="不限 / 100 次" /></Field><Field label="企业价格"><TextInput value={draft.billing.enterprisePrice} onChange={(value) => update('billing', { ...draft.billing, enterprisePrice: value })} placeholder="按企业合同" /></Field><Field label="生效时间"><TextInput value={draft.billing.effectiveAt} onChange={(value) => update('billing', { ...draft.billing, effectiveAt: value })} placeholder="YYYY-MM-DD HH:mm" /></Field></div>
        <div className="space-y-2 rounded-[8px] border border-[#edf0f4] p-3.5"><div className="mb-2 text-[11px] font-medium text-[#344054]">调用策略</div><label className="flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.allowAi} onChange={(event) => update('allowAi', event.target.checked)} />允许 AI / Agent 调用</label><label className="mt-2 flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.requireConfirmation} onChange={(event) => update('requireConfirmation', event.target.checked)} />调用前需要用户确认</label><label className="mt-2 flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.billing.priceVisible} onChange={(event) => update('billing', { ...draft.billing, priceVisible: event.target.checked })} />在登录后的能力中心展示价格</label><label className="mt-2 flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.billing.refundOnFailure} onChange={(event) => update('billing', { ...draft.billing, refundOnFailure: event.target.checked })} />任务失败退还消耗</label><label className="mt-2 flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={draft.billing.retryCharge} onChange={(event) => update('billing', { ...draft.billing, retryCharge: event.target.checked })} />重试再次计费</label></div>
      </div> : null}

      {section === 'review' ? <div className="space-y-4">
        <div><h3 className="text-[14px] font-semibold text-[#283244]">发布检查</h3><p className="mt-1 text-[11px] text-[#98a2b2]">保存后仍是草稿，不会立即出现在公开首页；发布动作需要在能力详情中二次确认。</p></div>
        <div className="space-y-2">{[{ label: '基础信息', value: isBasicComplete, detail: isBasicComplete ? `${draft.name} · ${draft.capabilityCode}` : '缺少名称、Code 或能力说明' }, { label: '公开展示', value: isPublicComplete, detail: isPublicComplete ? '已填写公开名称和摘要' : '建议补充公开摘要' }, { label: '接入方式', value: isAccessComplete, detail: isAccessComplete ? enabledChannels.map((id) => channelLabels[id]).join('、') : '至少选择一种接入方式' }, { label: '权限与计费', value: isBillingComplete, detail: isBillingComplete ? `${draft.billing.mode} · ${draft.billing.unit}` : '缺少计费模式或计费单位' }].map((item) => <div key={item.label} className="flex items-center gap-3 rounded-[7px] border border-[#edf0f4] p-3"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${item.value ? 'bg-[#e6f7ee] text-[#18875d]' : 'bg-[#fff3dc] text-[#b76a00]'}`}>{item.value ? <Check className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}</span><div><div className="text-[11px] font-medium text-[#344054]">{item.label}</div><div className="mt-0.5 text-[10px] text-[#98a2b2]">{item.detail}</div></div></div>)}</div>
        <div className="rounded-[8px] border border-[#dbeafe] bg-[#f6faff] p-3.5"><div className="flex items-center gap-2 text-[11px] font-medium text-[#377dff]"><ShieldCheck className="h-3.5 w-3.5" />保存后的数据流向</div><div className="mt-2 flex items-center gap-2 text-[10px] text-[#667085]"><span className="rounded bg-white px-2 py-1">能力草稿</span><ChevronRight className="h-3 w-3 text-[#98a2b2]" /><span className="rounded bg-white px-2 py-1">能力详情审核</span><ChevronRight className="h-3 w-3 text-[#98a2b2]" /><span className="rounded bg-white px-2 py-1">发布到开发者中心</span></div></div>
        {error ? <div className="rounded-[7px] bg-[#fff0ee] p-3 text-[11px] leading-5 text-[#d94f45]">{error}</div> : null}
      </div> : null}

      {error && section !== 'review' ? <div className="rounded-[7px] bg-[#fff0ee] p-3 text-[11px] leading-5 text-[#d94f45]">{error}</div> : null}
      <div className="flex items-center justify-between border-t border-[#edf0f4] pt-4"><Button onClick={goPrevious} disabled={section === 'basic'}>上一步</Button><div className="flex gap-2"><Button onClick={onClose}>取消</Button>{section !== 'review' ? <Button variant="primary" onClick={goNext}>下一步<ChevronRight className="h-3.5 w-3.5" /></Button> : <Button variant="primary" onClick={saveDraft} disabled={!canSave}><Check className="h-3.5 w-3.5" />保存草稿</Button>}</div></div>
    </div>
  </Drawer>;
}

function AppsPage({ store }: { store: DeveloperPlatformAdminStore }) {
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<AdminApp | null>(null);
  const apps = store.apps.filter((app) => `${app.name} ${app.appId} ${app.organization}`.toLowerCase().includes(keyword.toLowerCase()));
  return <><PageTitle eyebrow="APPLICATIONS" title="应用管理" description="查看开发者应用、授权用户、接入方式、调用量和积分消耗；停用应用后保留历史数据。" actions={<Button variant="primary"><Plus className="h-3.5 w-3.5" />创建应用</Button>} /><Panel><div className="flex items-center justify-between border-b border-[#edf0f4] p-4"><div className="relative w-[320px]"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#98a2b2]" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索应用名称 / App ID / 组织" className="h-8 w-full rounded-[6px] border border-[#dce3eb] pl-8 pr-2 text-[12px] outline-none focus:border-[#6caaf5]" /></div><span className="text-[11px] text-[#98a2b2]">共 {apps.length} 个应用</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1000px] border-collapse text-left"><thead><tr className="border-b border-[#edf0f4] bg-[#fbfcfd] text-[10px] text-[#98a2b2]"><th className="px-5 py-3 font-medium">应用 / App ID</th><th className="px-3 py-3 font-medium">开发者 / 组织</th><th className="px-3 py-3 font-medium">接入方式</th><th className="px-3 py-3 font-medium">状态</th><th className="px-3 py-3 font-medium">授权用户</th><th className="px-3 py-3 font-medium">调用量</th><th className="px-3 py-3 font-medium">成功率</th><th className="px-3 py-3 font-medium">积分</th><th className="px-5 py-3 text-right font-medium">操作</th></tr></thead><tbody>{apps.map((app) => <tr key={app.appId} className="border-b border-[#f0f2f5] text-[11px] hover:bg-[#fbfdff]"><td className="px-5 py-3"><button type="button" onClick={() => setSelected(app)} className="text-left"><div className="font-medium text-[#344054] hover:text-[#188cf2]">{app.name}</div><div className="mt-1 font-mono text-[10px] text-[#98a2b2]">{app.appId}</div></button></td><td className="px-3 py-3"><div className="text-[#667085]">{app.developer}</div><div className="mt-1 text-[10px] text-[#98a2b2]">{app.organization}</div></td><td className="px-3 py-3"><div className="flex flex-wrap gap-1">{app.integrations.map((id) => <span key={id} className="rounded bg-[#f2f6fb] px-1.5 py-1 text-[10px] text-[#52708d]">{channelLabels[id]}</span>)}</div></td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] ${app.status === '运行中' ? 'bg-[#e6f7ee] text-[#18875d]' : app.status === '待审核' ? 'bg-[#fff3dc] text-[#b76a00]' : 'bg-[#f2f4f7] text-[#667085]'}`}>{app.status}</span></td><td className="px-3 py-3 text-[#667085]">{app.authorizedUsers}</td><td className="px-3 py-3 text-[#667085]">{app.calls.toLocaleString()}</td><td className="px-3 py-3 text-[#18875d]">{app.successRate ? `${app.successRate.toFixed(1)}%` : '—'}</td><td className="px-3 py-3 text-[#667085]">{app.points.toLocaleString()}</td><td className="px-5 py-3 text-right"><button type="button" onClick={() => setSelected(app)} className="text-[#377dff] hover:underline">查看详情</button></td></tr>)}</tbody></table>{apps.length === 0 ? <EmptyTable message="没有匹配的应用" /> : null}</div></Panel>{selected ? <AppDrawer app={selected} onClose={() => setSelected(null)} /> : null}</>;
}

function AppDrawer({ app, onClose }: { app: AdminApp; onClose: () => void }) {
  return <Drawer title="应用详情" onClose={onClose}><div className="space-y-5"><div className="flex items-start justify-between"><div><h3 className="text-[16px] font-semibold text-[#283244]">{app.name}</h3><p className="mt-1 font-mono text-[10px] text-[#98a2b2]">{app.appId}</p></div><span className={`rounded-full px-2 py-1 text-[10px] ${app.status === '运行中' ? 'bg-[#e6f7ee] text-[#18875d]' : 'bg-[#f2f4f7] text-[#667085]'}`}>{app.status}</span></div><div className="grid grid-cols-2 gap-3">{[['授权用户', app.authorizedUsers], ['累计调用', app.calls.toLocaleString()], ['成功率', app.successRate ? `${app.successRate.toFixed(1)}%` : '—'], ['积分消耗', app.points.toLocaleString()]].map(([label, value]) => <div key={String(label)} className="rounded-[7px] bg-[#f7f9fc] p-3"><div className="text-[10px] text-[#98a2b2]">{label}</div><div className="mt-1 text-[16px] font-semibold text-[#344054]">{value}</div></div>)}</div><div><div className="mb-2 text-[11px] font-medium text-[#667085]">应用信息</div><div className="divide-y divide-[#edf0f4] rounded-[7px] border border-[#edf0f4] px-3">{[['开发者', app.developer], ['所属组织', app.organization], ['最近调用', app.lastCall], ['创建时间', app.createdAt]].map(([label, value]) => <div key={String(label)} className="flex items-center justify-between py-2.5 text-[11px]"><span className="text-[#98a2b2]">{label}</span><span className="text-[#667085]">{value}</span></div>)}</div></div><div><div className="mb-2 text-[11px] font-medium text-[#667085]">已授权 Scope</div><div className="flex flex-wrap gap-1.5">{app.scopes.map((scope) => <span key={scope} className="rounded bg-[#eef5ff] px-2 py-1 font-mono text-[10px] text-[#377dff]">{scope}</span>)}</div></div><div className="flex flex-wrap gap-2 border-t border-[#edf0f4] pt-4"><Button variant="danger">停用应用</Button><Button>调整权限</Button><Button>查看调用</Button><Button>重置 Secret</Button></div></div></Drawer>;
}

function BillingPage({ store, onChange }: { store: DeveloperPlatformAdminStore; onChange: (store: DeveloperPlatformAdminStore) => void }) {
  const [selectedId, setSelectedId] = useState(store.capabilities[0]?.id ?? '');
  const selected = store.capabilities.find((item) => item.id === selectedId) ?? store.capabilities[0];
  const updateBilling = (key: keyof AdminCapability['billing'], value: string | boolean) => { if (!selected) return; const next = { ...selected, billing: { ...selected.billing, [key]: value }, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }; onChange({ ...store, capabilities: store.capabilities.map((item) => item.id === selected.id ? next : item), auditLogs: [createAdminAuditLog('计费与额度', '更新计费规则', selected.name, `${selected.billing.mode} / ${selected.billing.unitPrice}`, `${next.billing.mode} / ${next.billing.unitPrice}`), ...store.auditLogs] }); };
  return <><PageTitle eyebrow="BILLING & QUOTA" title="计费与额度" description="配置能力计费模式、免费额度、失败退还和企业套餐规则；每次调整保留版本和操作审计。" actions={<Button><RefreshCcw className="h-3.5 w-3.5" />刷新配置</Button>} /><div className="grid grid-cols-[1fr_1.2fr] gap-3"><Panel><PanelHeader title="能力计费规则" description="选择能力查看当前生效版本。" /><div className="divide-y divide-[#edf0f4]">{store.capabilities.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`flex w-full items-center justify-between px-5 py-3 text-left transition ${selected?.id === item.id ? 'bg-[#eef6ff]' : 'hover:bg-[#fbfcfd]'}`}><div><div className="text-[12px] font-medium text-[#344054]">{item.name}</div><div className="mt-1 text-[10px] text-[#98a2b2]">{item.capabilityCode}</div></div><div className="text-right"><div className="text-[11px] text-[#667085]">{item.billing.mode}</div><div className="mt-1 text-[10px] text-[#98a2b2]">{item.billing.unitPrice}</div></div></button>)}</div></Panel>{selected ? <Panel><PanelHeader title="计费配置" description={`${selected.name} · 当前版本 ${selected.version}`} actions={<span className="rounded-full bg-[#e6f7ee] px-2 py-1 text-[10px] text-[#18875d]">已生效</span>} /><div className="space-y-4 p-5"><div className="grid grid-cols-2 gap-3"><Field label="计费模式"><SelectInput value={selected.billing.mode} onChange={(value) => updateBilling('mode', value)} options={['免费', '按调用次数', '按任务计费', '按积分计费', '企业套餐额度', '需申请']} /></Field><Field label="计费单位"><TextInput value={selected.billing.unit} onChange={(value) => updateBilling('unit', value)} /></Field><Field label="单价"><TextInput value={selected.billing.unitPrice} onChange={(value) => updateBilling('unitPrice', value)} /></Field><Field label="免费额度"><TextInput value={selected.billing.freeQuota} onChange={(value) => updateBilling('freeQuota', value)} /></Field><Field label="企业价格"><TextInput value={selected.billing.enterprisePrice} onChange={(value) => updateBilling('enterprisePrice', value)} /></Field><Field label="生效时间"><TextInput value={selected.billing.effectiveAt} onChange={(value) => updateBilling('effectiveAt', value)} /></Field></div><div className="space-y-2 rounded-[7px] bg-[#f7f9fc] p-3"><label className="flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={selected.billing.priceVisible} onChange={(event) => updateBilling('priceVisible', event.target.checked)} />公开展示价格</label><label className="flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={selected.billing.refundOnFailure} onChange={(event) => updateBilling('refundOnFailure', event.target.checked)} />任务失败退还积分</label><label className="flex items-center gap-2 text-[11px] text-[#667085]"><input type="checkbox" checked={selected.billing.retryCharge} onChange={(event) => updateBilling('retryCharge', event.target.checked)} />重试再次计费</label></div><div className="rounded-[7px] border border-[#f0e5cf] bg-[#fffaf0] p-3 text-[11px] leading-5 text-[#8b6b2c]">公开首页不会展示完整计费信息。后台规则发布后，开发者控制台才可看到当前适用的额度与计费说明。</div><div className="border-t border-[#edf0f4] pt-4"><h3 className="text-[12px] font-semibold text-[#344054]">版本历史</h3><div className="mt-3 space-y-2 text-[11px] text-[#667085]"><div className="flex items-center justify-between rounded bg-[#f7f9fc] px-3 py-2"><span>v{selected.version} · 当前生效</span><span>{selected.billing.effectiveAt}</span></div><div className="flex items-center justify-between rounded bg-[#fbfcfd] px-3 py-2 text-[#98a2b2]"><span>历史版本 · 仅审计可见</span><span>2026-10-01</span></div></div></div></div></Panel> : <Panel><EmptyTable message="请选择能力" /></Panel>}</div></>;
}

function StatisticsPage({ store }: { store: DeveloperPlatformAdminStore }) {
  const overview = useMemo(() => getDeveloperPlatformAdminOverview(store), [store]);
  const [range, setRange] = useState('近 7 天');
  const exportData = () => downloadCsv(`developer-platform-statistics-${range}.csv`, [
    ['时间范围', range],
    ['指标', '数值'],
    ['调用总量', overview.stats.totalCalls.toLocaleString()],
    ['今日调用', overview.stats.todayCalls.toLocaleString()],
    ['积分消耗', overview.stats.totalPoints.toLocaleString()],
    ['今日积分', overview.stats.todayPoints.toLocaleString()],
    ['失败任务', String(overview.stats.failedTasks)],
    ...overview.callTrend.map((item) => [item.date, String(item.value)]),
  ]);
  return <><PageTitle eyebrow="OBSERVABILITY" title="数据统计" description="按时间、应用、组织、能力、接入方式和任务结果查看调用、延迟、失败和积分数据。" actions={<div className="flex items-center gap-2"><SelectInput value={range} onChange={setRange} options={['今天', '近 7 天', '近 30 天']} /><Button onClick={exportData}><RefreshCcw className="h-3.5 w-3.5" />导出数据</Button></div>} /><div className="grid grid-cols-5 gap-3"><StatCard icon={<Activity className="h-4 w-4" />} label="调用总量" value={overview.stats.totalCalls.toLocaleString()} /><StatCard icon={<Check className="h-4 w-4" />} label="成功率" value="99.4%" tone="green" /><StatCard icon={<Activity className="h-4 w-4" />} label="平均延迟" value="420ms" tone="purple" /><StatCard icon={<BarChart3 className="h-4 w-4" />} label="P95 延迟" value="1.2s" tone="orange" /><StatCard icon={<CircleAlert className="h-4 w-4" />} label="超时 / 限流" value="18" tone="orange" /></div><div className="mt-3 grid grid-cols-[1.35fr_1fr] gap-3"><Panel><PanelHeader title="调用趋势" description={`${range} · 支持按应用、能力和渠道筛选`} /><TrendChart data={overview.callTrend} /></Panel><Panel><PanelHeader title="渠道占比" /><div className="p-5"><LegendRows items={overview.channelDistribution} /></div></Panel></div><div className="mt-3 grid grid-cols-2 gap-3"><Panel><PanelHeader title="能力排行" /><RankTable rows={overview.capabilityRanks.map((item) => ({ name: item.name, secondary: item.category, primary: `${item.calls.toLocaleString()} 次`, trailing: `${item.successRate.toFixed(1)}%` }))} /></Panel><Panel><PanelHeader title="失败原因" /><div className="space-y-3 p-5">{[['素材下载超时', 8, '#f5a623'], ['权限不足', 5, '#ef7c50'], ['参数校验失败', 3, '#8b6cf6'], ['应用已停用', 2, '#98a2b2']].map(([label, value, color]) => <div key={String(label)}><div className="mb-1 flex justify-between text-[11px]"><span className="text-[#667085]">{label}</span><span className="text-[#344054]">{value}</span></div><div className="h-1.5 rounded-full bg-[#edf0f4]"><div className="h-1.5 rounded-full" style={{ width: `${Number(value) * 10}%`, background: String(color) }} /></div></div>)}</div></Panel></div></>;
}

function TasksPage({ store }: { store: DeveloperPlatformAdminStore }) {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('全部状态');
  const tasks = store.tasks.filter((task) => `${task.taskId} ${task.appName} ${task.capability}`.toLowerCase().includes(keyword.toLowerCase()) && (status === '全部状态' || task.status === status));
  return <><PageTitle eyebrow="ASYNC TASKS" title="任务监控" description="统一监控 AI、导出、文件解析、合规、批量和 Webhook 任务，定位失败原因和重试情况。" actions={<Button><RefreshCcw className="h-3.5 w-3.5" />刷新任务</Button>} /><Panel><div className="flex items-center gap-2 border-b border-[#edf0f4] p-4"><div className="relative w-[300px]"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#98a2b2]" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索 Task ID / 应用 / 能力" className="h-8 w-full rounded-[6px] border border-[#dce3eb] pl-8 pr-2 text-[12px] outline-none focus:border-[#6caaf5]" /></div><SelectInput value={status} onChange={setStatus} options={['全部状态', '已创建', '排队中', '运行中', '已成功', '已失败', '已取消', '已过期']} /><Button variant="ghost"><ListFilter className="h-3.5 w-3.5" />高级筛选</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[1050px] border-collapse text-left"><thead><tr className="border-b border-[#edf0f4] bg-[#fbfcfd] text-[10px] text-[#98a2b2]"><th className="px-5 py-3 font-medium">Task ID</th><th className="px-3 py-3 font-medium">应用</th><th className="px-3 py-3 font-medium">能力</th><th className="px-3 py-3 font-medium">渠道</th><th className="px-3 py-3 font-medium">状态</th><th className="px-3 py-3 font-medium">创建时间</th><th className="px-3 py-3 font-medium">耗时</th><th className="px-3 py-3 font-medium">积分</th><th className="px-5 py-3 text-right font-medium">重试</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.taskId} className="border-b border-[#f0f2f5] text-[11px]"><td className="px-5 py-3 font-mono text-[#667085]">{task.taskId}</td><td className="px-3 py-3 text-[#344054]">{task.appName}</td><td className="px-3 py-3 text-[#667085]">{task.capability}</td><td className="px-3 py-3 text-[#667085]">{channelLabels[task.channel]}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] ${taskStyles[task.status]}`}>{task.status}</span>{task.failureReason !== '—' ? <div className="mt-1 text-[10px] text-[#d94f45]">{task.failureReason}</div> : null}</td><td className="px-3 py-3 text-[#98a2b2]">{task.createdAt}</td><td className="px-3 py-3 text-[#667085]">{task.duration}</td><td className="px-3 py-3 text-[#667085]">{task.points}</td><td className="px-5 py-3 text-right text-[#98a2b2]">{task.retries > 0 ? `${task.retries} 次` : '—'}</td></tr>)}</tbody></table>{tasks.length === 0 ? <EmptyTable message="没有匹配的任务" /> : null}</div></Panel></>;
}

function LogsPage({ store }: { store: DeveloperPlatformAdminStore }) {
  const [keyword, setKeyword] = useState('');
  const logs = store.auditLogs.filter((log) => `${log.operator} ${log.module} ${log.action} ${log.objectName} ${log.requestId}`.toLowerCase().includes(keyword.toLowerCase()));
  return <><PageTitle eyebrow="AUDIT LOG" title="操作日志" description="记录能力新增、编辑、发布、下线、计费变更、应用权限和 Secret 操作，支持审计追溯。" actions={<Button><RefreshCcw className="h-3.5 w-3.5" />刷新日志</Button>} /><Panel><div className="flex items-center justify-between border-b border-[#edf0f4] p-4"><div className="relative w-[340px]"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#98a2b2]" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索操作人 / 模块 / 对象 / Request ID" className="h-8 w-full rounded-[6px] border border-[#dce3eb] pl-8 pr-2 text-[12px] outline-none focus:border-[#6caaf5]" /></div><div className="flex items-center gap-2 text-[11px] text-[#98a2b2]"><ShieldCheck className="h-3.5 w-3.5 text-[#37a977]" />所有配置变更保留前后值</div></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] border-collapse text-left"><thead><tr className="border-b border-[#edf0f4] bg-[#fbfcfd] text-[10px] text-[#98a2b2]"><th className="px-5 py-3 font-medium">时间</th><th className="px-3 py-3 font-medium">操作人</th><th className="px-3 py-3 font-medium">模块 / 动作</th><th className="px-3 py-3 font-medium">对象</th><th className="px-3 py-3 font-medium">变更</th><th className="px-3 py-3 font-medium">IP</th><th className="px-5 py-3 font-medium">Request ID</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-b border-[#f0f2f5] text-[11px]"><td className="px-5 py-3 text-[#98a2b2]">{log.createdAt}</td><td className="px-3 py-3 text-[#344054]">{log.operator}</td><td className="px-3 py-3"><div className="text-[#344054]">{log.module}</div><div className="mt-1 text-[10px] text-[#377dff]">{log.action}</div></td><td className="px-3 py-3 text-[#667085]">{log.objectName}</td><td className="px-3 py-3"><div className="max-w-[260px] truncate text-[10px] text-[#98a2b2]">{log.before}</div><div className="max-w-[260px] truncate text-[10px] text-[#18875d]">→ {log.after}</div></td><td className="px-3 py-3 font-mono text-[10px] text-[#98a2b2]">{log.ip}</td><td className="px-5 py-3 font-mono text-[10px] text-[#667085]">{log.requestId}</td></tr>)}</tbody></table>{logs.length === 0 ? <EmptyTable message="没有匹配的操作日志" /> : null}</div></Panel></>;
}

export function DeveloperPlatformAdminPage({ activePage, onBackToDirectory }: DeveloperPlatformAdminPageProps) {
  const [store, setStore] = useState<DeveloperPlatformAdminStore>(() => getDeveloperPlatformAdminStore());
  const commitStore = (nextStore: DeveloperPlatformAdminStore) => { setStore(nextStore); saveDeveloperPlatformAdminStore(nextStore); };
  const content = activePage === 'overview' ? <OverviewPage store={store} /> : activePage === 'capabilities' ? <CapabilityPage store={store} onChange={commitStore} /> : activePage === 'apps' ? <AppsPage store={store} /> : activePage === 'billing' ? <BillingPage store={store} onChange={commitStore} /> : activePage === 'statistics' ? <StatisticsPage store={store} /> : activePage === 'tasks' ? <TasksPage store={store} /> : <LogsPage store={store} />;
  return <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#283244]"><AdminSidebar onBackToDirectory={onBackToDirectory} activeItem={pageLabels[activePage]} /><TopHeader /><main className="ml-[228px] min-h-screen pt-[62px]"><div className="border-b border-[#e6e9ef] bg-white px-6 py-3"><div className="flex items-center gap-2 text-[11px] text-[#98a2b2]"><span>开发者平台</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4d5b70]">{pageLabels[activePage]}</span><span className="ml-auto rounded-full bg-[#eaf3ff] px-2 py-1 text-[10px] text-[#377dff]">MVP 配置中心</span></div></div><div className="px-6 py-5">{content}</div></main></div>;
}
