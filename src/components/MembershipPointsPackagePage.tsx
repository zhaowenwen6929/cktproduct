import { useMemo, useState } from 'react';
import { ChevronRight, Pencil, Plus, Search, X } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { MEMBERSHIP_LEVEL_OPTIONS } from './membershipLevelCatalog';
import {
  DEFAULT_POINTS_PACKAGE_GROUP_ID,
  persistMembershipPointsPackageConfig,
  readMembershipPointsPackageConfig,
  type MembershipPointsPackageConfig,
  type MembershipPointsPackageGroup,
  type MembershipPointsPackageItem,
  type PointsPackageEligibility,
  type PointsPackageType,
} from './membershipPointsPackageConfig';

type CommonAdminPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
  onNavigateToRequirement?: (path: string) => void;
};

const ELIGIBILITY_OPTIONS: Array<{ value: PointsPackageEligibility; label: string; description: string }> = [
  { value: 'all', label: '所有用户', description: '免费用户和会员均可购买' },
  { value: 'free', label: '仅免费用户', description: '仅当前未开通会员的用户可购买' },
  { value: 'members', label: '全部会员', description: '任意有效会员等级均可购买' },
  { value: 'specified', label: '指定会员等级', description: '仅选中的会员等级可购买' },
];

const emptyGroup = (): MembershipPointsPackageGroup => ({
  id: `points-group-${Date.now()}`,
  name: '',
  description: '',
  packageCode: '',
  creator: '赵文文',
  createdAt: '',
  status: '使用中',
});

const emptyPackage = (groupId: string): MembershipPointsPackageItem => ({
  id: `points-${Date.now()}`,
  groupId,
  name: '',
  displayName: '',
  packageType: 'standard',
  points: 0,
  price: 0,
  originalPrice: 0,
  outputText: '',
  validityDays: 365,
  tag: '',
  eligibility: 'all',
  memberLevels: [],
  sort: 1,
  status: '显示',
});

function formatEligibility(item: MembershipPointsPackageItem) {
  if (item.eligibility === 'specified') {
    const names = item.memberLevels.map((level) => MEMBERSHIP_LEVEL_OPTIONS.find((option) => option.level === level)?.name ?? String(level));
    return names.length ? `指定：${names.join('、')}` : '指定会员等级（未选择）';
  }
  return ELIGIBILITY_OPTIONS.find((option) => option.value === item.eligibility)?.label ?? '所有用户';
}

function GroupEditorModal({ group, onClose, onSave }: { group: MembershipPointsPackageGroup; onClose: () => void; onSave: (group: MembershipPointsPackageGroup) => void }) {
  const [form, setForm] = useState(group);
  const update = (key: keyof MembershipPointsPackageGroup, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (!form.name.trim() || !form.packageCode.trim()) return;
    onSave({ ...form, name: form.name.trim(), packageCode: form.packageCode.trim(), createdAt: form.createdAt || '2026-11-05 10:00:00' });
  };

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f1d2f]/40 p-5">
    <div className="w-full max-w-[620px] rounded-[5px] bg-white shadow-[0_16px_50px_rgba(20,35,57,.24)]">
      <div className="flex h-14 items-center justify-between border-b border-[#edf0f4] px-6"><h2 className="text-[16px] font-medium text-[#252d3b]">{group.name ? '编辑积分套餐组' : '新增积分套餐组'}</h2><button type="button" onClick={onClose} aria-label="关闭"><X className="h-5 w-5 text-[#a0a8b4]" /></button></div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4 px-6 py-6">
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐组名称</span><input value={form.name} onChange={(event) => update('name', event.currentTarget.value)} placeholder="例如：2026年10月积分套餐" className="h-9 rounded-[3px] border border-[#dfe3ea] px-3 text-[12px] outline-none focus:border-[#278fee]" /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐组标识</span><input value={form.packageCode} onChange={(event) => update('packageCode', event.currentTarget.value)} placeholder="例如：points-2026-10" className="h-9 rounded-[3px] border border-[#dfe3ea] px-3 text-[12px] outline-none focus:border-[#278fee]" /></label>
        <label className="col-span-2 flex flex-col gap-2 text-[12px] text-[#657084]"><span>描述</span><textarea value={form.description} onChange={(event) => update('description', event.currentTarget.value)} placeholder="说明该套餐组的使用场景和前台关联关系" className="min-h-[78px] resize-none rounded-[3px] border border-[#dfe3ea] px-3 py-2 text-[12px] leading-5 outline-none focus:border-[#278fee]" /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>创建人</span><input disabled value={form.creator} className="h-9 rounded-[3px] border border-[#dfe3ea] bg-[#f7f8fa] px-3 text-[12px] text-[#697487]" /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>状态</span><select value={form.status} onChange={(event) => update('status', event.currentTarget.value)} className="h-9 rounded-[3px] border border-[#dfe3ea] bg-white px-3 text-[12px] outline-none focus:border-[#278fee]"><option value="使用中">使用中</option><option value="停止使用">停止使用</option></select></label>
      </div>
      <div className="flex justify-end gap-3 border-t border-[#edf0f4] px-6 py-4"><button type="button" onClick={onClose} className="h-9 rounded-[3px] border border-[#dfe3ea] px-5 text-[12px] text-[#667285]">取消</button><button type="button" onClick={submit} disabled={!form.name.trim() || !form.packageCode.trim()} className="h-9 rounded-[3px] bg-[#278fee] px-5 text-[12px] text-white disabled:cursor-not-allowed disabled:opacity-50">保存</button></div>
    </div>
  </div>;
}

function EligibilityEditor({ value, memberLevels, onChange, onMemberLevelsChange }: { value: PointsPackageEligibility; memberLevels: number[]; onChange: (value: PointsPackageEligibility) => void; onMemberLevelsChange: (levels: number[]) => void }) {
  return <div className="rounded-[7px] border border-[#e4e9f0] bg-[#fbfcfe] p-4">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{ELIGIBILITY_OPTIONS.map((option) => <label key={option.value} className={`cursor-pointer rounded-[6px] border px-3 py-3 ${value === option.value ? 'border-[#278fee] bg-[#eef7ff]' : 'border-[#e4e9f0] bg-white'}`}><span className="flex items-center gap-2 text-[12px] font-medium text-[#334155]"><input type="radio" checked={value === option.value} onChange={() => onChange(option.value)} />{option.label}</span><span className="mt-1 block text-[10px] leading-4 text-[#8b96a6]">{option.description}</span></label>)}</div>
    {value === 'specified' ? <div className="mt-4 rounded-[6px] border border-dashed border-[#ffb8ae] bg-[#fff8f6] p-3"><div className="mb-2 text-[12px] font-medium text-[#8a4d46]">选择可购买会员等级</div><div className="grid grid-cols-2 gap-2 md:grid-cols-3">{MEMBERSHIP_LEVEL_OPTIONS.map((option) => <label key={option.level} className="flex items-center gap-2 text-[11px] text-[#596579]"><input type="checkbox" checked={memberLevels.includes(option.level)} onChange={(event) => onMemberLevelsChange(event.currentTarget.checked ? [...memberLevels, option.level] : memberLevels.filter((level) => level !== option.level))} />{option.name} <span className="text-[#a3adba]">({option.level})</span></label>)}</div></div> : null}
  </div>;
}

function PointsPackageEditorModal({ item, onClose, onSave }: { item: MembershipPointsPackageItem; onClose: () => void; onSave: (item: MembershipPointsPackageItem) => void }) {
  const [form, setForm] = useState(item);
  const [error, setError] = useState('');
  const update = <K extends keyof MembershipPointsPackageItem>(key: K, value: MembershipPointsPackageItem[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (!form.name.trim() || !form.displayName.trim()) return;
    if (form.packageType === 'standard' && (!form.points || form.points <= 0 || form.price == null || form.price < 0)) {
      setError('标准积分量套餐需要填写积分量和套餐售价。');
      return;
    }
    if (form.packageType === 'custom' && (!form.unitPrice || form.unitPrice <= 0)) {
      setError('自定义积分量套餐需要填写单个积分的价格。');
      return;
    }
    if (form.eligibility === 'specified' && form.memberLevels.length === 0) {
      setError('请选择至少一个可购买的会员等级。');
      return;
    }
    setError('');
    onSave({ ...form, name: form.name.trim(), displayName: form.displayName.trim(), tag: form.tag?.trim() });
  };
  const inputClass = 'h-9 w-full rounded-[3px] border border-[#dfe3ea] bg-white px-3 text-[12px] text-[#303b4d] outline-none focus:border-[#278fee] disabled:bg-[#f5f6f8] disabled:text-[#aab2bf]';
  const priceText = form.packageType === 'custom' ? `用户输入积分量 × ¥${form.unitPrice ?? 0}/积分` : `套餐售价 ¥${form.price ?? 0}`;

  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#0f1d2f]/45 p-5"><div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[920px] flex-col rounded-[5px] bg-white shadow-[0_16px_60px_rgba(15,29,47,.28)]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#edf0f4] px-6"><div><h2 className="text-[16px] font-medium text-[#252d3b]">{item.name ? '编辑积分套餐' : '新增积分套餐'}</h2><p className="mt-1 text-[11px] text-[#9aa5b5]">卡片内容、价格、有效期和可购买会员等级均由此套餐配置维护；展示分组请到会员页面配置中设置。</p></div><button type="button" onClick={onClose} aria-label="关闭"><X className="h-5 w-5 text-[#a0a8b4]" /></button></div>
    <div className="flex-1 overflow-y-auto px-6 py-6"><div className="mx-auto max-w-[760px]">
      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐名称</span><input value={form.name} onChange={(event) => update('name', event.currentTarget.value)} placeholder="后台管理名称" className={inputClass} /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span><b className="mr-1 font-normal text-[#ff4d4f]">*</b>前台显示名称</span><input value={form.displayName} onChange={(event) => update('displayName', event.currentTarget.value)} placeholder="例如：1500积分" className={inputClass} /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span><b className="mr-1 font-normal text-[#ff4d4f]">*</b>套餐类型</span><select value={form.packageType} onChange={(event) => update('packageType', event.currentTarget.value as PointsPackageType)} className={inputClass}><option value="standard">标准积分量</option><option value="custom">自定义积分量</option></select></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>{form.packageType === 'custom' ? '单个积分价格（元）' : '积分量'}</span><input type="number" min="0.001" step={form.packageType === 'custom' ? '0.001' : '1'} value={form.packageType === 'custom' ? form.unitPrice ?? '' : form.points ?? ''} onChange={(event) => update(form.packageType === 'custom' ? 'unitPrice' : 'points', Number(event.currentTarget.value))} placeholder={form.packageType === 'custom' ? '例如：0.066' : '例如：1500'} className={inputClass} />{form.packageType === 'custom' ? <span className="text-[11px] text-[#8b96a6]">用户在前台输入任意积分量，按此单价计算应付金额。</span> : null}</label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>{form.packageType === 'custom' ? '计算说明' : '套餐售价（元）'}</span>{form.packageType === 'custom' ? <input disabled value={priceText} className={inputClass} /> : <input type="number" min="0" step="0.01" value={form.price ?? ''} onChange={(event) => update('price', Number(event.currentTarget.value))} placeholder="例如：100" className={inputClass} />}</label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>{form.packageType === 'custom' ? '单积分原价（元，可选）' : '套餐原价（元）'}</span><input type="number" min="0" step="0.01" value={form.originalPrice ?? ''} onChange={(event) => update('originalPrice', Number(event.currentTarget.value))} placeholder="可不填" className={inputClass} /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span><b className="mr-1 font-normal text-[#ff4d4f]">*</b>有效期（天）</span><input type="number" min="1" step="1" value={form.validityDays} onChange={(event) => update('validityDays', Number(event.currentTarget.value))} className={inputClass} /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>生成/使用说明</span><input value={form.outputText} onChange={(event) => update('outputText', event.currentTarget.value)} placeholder="例如：约生150~375张图" className={inputClass} /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>角标文案</span><input value={form.tag ?? ''} onChange={(event) => update('tag', event.currentTarget.value)} placeholder="例如：限时特惠、65折" className={inputClass} /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>排序</span><input type="number" min="0" step="1" value={form.sort} onChange={(event) => update('sort', Number(event.currentTarget.value))} className={inputClass} /></label>
        <label className="flex flex-col gap-2 text-[12px] text-[#657084]"><span>状态</span><select value={form.status} onChange={(event) => update('status', event.currentTarget.value as '显示' | '隐藏')} className={inputClass}><option value="显示">显示</option><option value="隐藏">隐藏</option></select></label>
      </div>
      <div className="mt-6"><div className="mb-2 text-[12px] font-medium text-[#334155]">可购买会员等级</div><EligibilityEditor value={form.eligibility} memberLevels={form.memberLevels} onChange={(value) => update('eligibility', value)} onMemberLevelsChange={(levels) => update('memberLevels', levels)} /></div>
      {error ? <p className="mt-4 rounded-[4px] bg-[#fff2f0] px-3 py-2 text-[12px] text-[#d94b43]">{error}</p> : null}
    </div></div>
    <div className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-[#edf0f4] px-6"><button type="button" onClick={onClose} className="h-8 rounded-[2px] border border-[#d8d8d8] bg-white px-4 text-[13px] text-[#555]">取消</button><button type="button" onClick={submit} className="h-8 rounded-[2px] bg-[#278fee] px-5 text-[13px] text-white hover:bg-[#167fdc]">保存</button></div>
  </div></div>;
}

export function MembershipPointsPackagePage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPageConfig, onNavigateToRequirement }: CommonAdminPageProps) {
  const [config, setConfig] = useState<MembershipPointsPackageConfig>(() => readMembershipPointsPackageConfig());
  const [selectedGroupId, setSelectedGroupId] = useState(DEFAULT_POINTS_PACKAGE_GROUP_ID);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [groupEditor, setGroupEditor] = useState<MembershipPointsPackageGroup | null>(null);
  const [packageEditor, setPackageEditor] = useState<MembershipPointsPackageItem | null>(null);
  const selectedGroup = config.groups.find((group) => group.id === selectedGroupId) ?? config.groups[0];
  const filteredPackages = useMemo(() => config.packages.filter((item) => item.groupId === selectedGroup?.id).sort((left, right) => left.sort - right.sort).filter((item) => !submittedQuery.trim() || `${item.name}${item.displayName}`.includes(submittedQuery.trim())), [config, selectedGroup?.id, submittedQuery]);
  const updateConfig = (next: MembershipPointsPackageConfig) => {
    setConfig(next);
    persistMembershipPointsPackageConfig(next);
  };
  const saveGroup = (group: MembershipPointsPackageGroup) => {
    const exists = config.groups.some((item) => item.id === group.id);
    const next = { ...config, groups: exists ? config.groups.map((item) => item.id === group.id ? group : item) : [...config.groups, group] };
    updateConfig(next);
    setSelectedGroupId(group.id);
    setGroupEditor(null);
  };
  const savePackage = (item: MembershipPointsPackageItem) => {
    const exists = config.packages.some((candidate) => candidate.id === item.id);
    updateConfig({ ...config, packages: exists ? config.packages.map((candidate) => candidate.id === item.id ? item : candidate) : [...config.packages, item] });
    setPackageEditor(null);
  };

  return <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#30343b]"><AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="积分套餐配置" onNavigateToRequirement={onNavigateToRequirement} onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); if (item === '会员页面配置') onNavigateToMembershipPageConfig?.(); }} /><TopHeader /><main className="ml-[228px] min-h-screen pt-[62px]"><div className="px-[25px] pt-[25px]"><div className="mb-4 flex items-center gap-2 text-[13px] text-[#8b9199]"><span>会员中心</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#2d2d2d]">积分套餐配置</span></div><section className="min-h-[calc(100vh-130px)] bg-white"><header className="flex items-center justify-between border-b border-[#ededed] px-[25px] py-4"><div><h1 className="text-[16px] font-medium text-[#252525]">积分套餐配置</h1><p className="mt-1 text-[12px] text-[#8b9199]">先创建积分套餐组，再在套餐组下配置标准积分量或自定义积分量套餐。</p></div><button type="button" onClick={() => setGroupEditor(emptyGroup())} className="inline-flex h-[33px] items-center gap-1.5 rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]"><Plus className="h-4 w-4" />新增套餐组</button></header>
      <div className="grid min-h-[650px] grid-cols-[300px_1fr] divide-x divide-[#edf0f4]"><aside className="p-5"><div className="mb-3 text-[13px] font-medium text-[#27344a]">积分套餐组 <span className="ml-1 text-[11px] text-[#9ba5b4]">{config.groups.length}</span></div><div className="space-y-2">{config.groups.map((group) => <button type="button" key={group.id} onClick={() => setSelectedGroupId(group.id)} className={`w-full rounded-[6px] border px-3 py-3 text-left transition ${selectedGroup?.id === group.id ? 'border-[#b9ddfa] bg-[#eef7ff]' : 'border-[#e7ebf0] bg-white hover:border-[#c8dced]'}`}><div className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-medium text-[#334155]">{group.name}</span><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${group.status === '使用中' ? 'bg-[#eaf7ef] text-[#2b9160]' : 'bg-[#f1f3f6] text-[#7c8797]'}`}>{group.status}</span></div><div className="mt-1 text-[11px] text-[#99a4b3]">{group.packageCode} · {config.packages.filter((item) => item.groupId === group.id).length} 个套餐</div></button>)}</div></aside>
        <section className="min-w-0 p-6">
          {selectedGroup ? <>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#edf0f4] pb-5">
              <div>
                <div className="flex items-center gap-2"><h2 className="text-[18px] font-semibold text-[#27344a]">{selectedGroup.name}</h2><span className="rounded-[4px] bg-[#eef7ff] px-2 py-1 text-[10px] text-[#278fee]">{selectedGroup.packageCode}</span></div>
                <p className="mt-2 text-[12px] text-[#8b96a6]">{selectedGroup.description || '暂无描述'}</p>
                <p className="mt-2 text-[11px] text-[#a2abb8]">创建人：{selectedGroup.creator}　创建时间：{selectedGroup.createdAt || '—'}</p>
              </div>
              <div className="flex items-center gap-2"><button type="button" onClick={() => setGroupEditor(selectedGroup)} className="inline-flex h-8 items-center gap-1 rounded-[3px] border border-[#d8dfe8] px-3 text-[12px] text-[#536176] hover:border-[#278fee] hover:text-[#278fee]"><Pencil className="h-3.5 w-3.5" />编辑套餐组</button><button type="button" onClick={() => setPackageEditor(emptyPackage(selectedGroup.id))} className="inline-flex h-8 items-center gap-1 rounded-[3px] bg-[#278fee] px-3 text-[12px] text-white hover:bg-[#167fdc]"><Plus className="h-3.5 w-3.5" />新增积分套餐</button></div>
            </div>
            <div className="flex items-center justify-between gap-4 py-5"><form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query); }} className="flex items-center"><input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="套餐名称/显示名称" className="h-8 w-[260px] rounded-l-[3px] border border-[#d9dfe7] px-3 text-[12px] outline-none focus:border-[#278fee]" /><button type="submit" className="inline-flex h-8 items-center gap-1 rounded-r-[3px] bg-[#278fee] px-4 text-[12px] text-white"><Search className="h-3.5 w-3.5" />查询</button></form><span className="text-[11px] text-[#98a2b2]">前台价格和积分卡片均从此处读取，展示分组由会员页面配置决定</span></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[1020px] table-fixed border-collapse text-left text-[12px]"><colgroup><col className="w-[9%]" /><col className="w-[17%]" /><col className="w-[11%]" /><col className="w-[10%]" /><col className="w-[12%]" /><col className="w-[16%]" /><col className="w-[10%]" /><col className="w-[15%]" /></colgroup><thead className="h-[50px] bg-[#fafbfd] text-[#6f7c8e]"><tr>{['ID', '套餐名称', '类型', '积分量/单价', '售价', '可购买会员等级', '有效期', '操作'].map((label) => <th key={label} className="px-3 font-normal">{label}</th>)}</tr></thead><tbody>{filteredPackages.map((item) => <tr key={item.id} className="h-[66px] border-b border-[#edf0f4] text-[#3b4655] hover:bg-[#fbfdff]"><td className="px-3 text-[#8994a4]">{item.id}</td><td className="px-3"><div className="font-medium">{item.name}</div><div className="mt-1 text-[10px] text-[#9aa5b5]">显示：{item.displayName}{item.tag ? ` · ${item.tag}` : ''}</div></td><td className="px-3">{item.packageType === 'custom' ? <span className="rounded-[4px] bg-[#fff3dc] px-2 py-1 text-[10px] text-[#b87513]">自定义积分量</span> : <span className="rounded-[4px] bg-[#eef7ff] px-2 py-1 text-[10px] text-[#278fee]">标准积分量</span>}</td><td className="px-3">{item.packageType === 'custom' ? `¥${item.unitPrice ?? 0}/积分` : `${item.points ?? 0} 积分`}</td><td className="px-3">{item.packageType === 'custom' ? '按输入量计算' : `¥${item.price ?? 0}`}{item.originalPrice ? <del className="ml-1 text-[10px] text-[#a4acb8]">¥{item.originalPrice}</del> : null}</td><td className="px-3 leading-5">{formatEligibility(item)}</td><td className="px-3">{item.validityDays} 天</td><td className="px-3"><button type="button" onClick={() => setPackageEditor(item)} className="h-7 rounded-[3px] border border-[#d8dfe8] px-3 text-[11px] text-[#536176] hover:border-[#278fee] hover:text-[#278fee]">编辑</button></td></tr>)}</tbody></table>{filteredPackages.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无匹配的积分套餐</div> : null}</div>
          </> : <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无积分套餐组，请先新增套餐组</div>}
        </section>
      </div></section></div></main>{groupEditor ? <GroupEditorModal group={groupEditor} onClose={() => setGroupEditor(null)} onSave={saveGroup} /> : null}{packageEditor ? <PointsPackageEditorModal item={packageEditor} onClose={() => setPackageEditor(null)} onSave={savePackage} /> : null}</div>;
}
