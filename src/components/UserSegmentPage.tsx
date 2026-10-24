import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Upload, X } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { MEMBER_TYPE_REQUIREMENT, MEMBER_TYPE_REQUIREMENT_SECTIONS, RequirementHint } from './MembershipPackagePage';

type UserSegmentPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
  onNavigateToNewRule?: () => void;
  onNavigateToCustomRule?: () => void;
};

type SegmentRecord = {
  id: number;
  name: string;
  count: number;
  type: '定制分群条件(实时)' | 'CSV导入';
  editor: string;
  createdAt: string;
  calculatedAt: string;
};

const INITIAL_SEGMENTS: SegmentRecord[] = [
  { id: 311, name: '数仓-连续包季-会员', count: 0, type: '定制分群条件(实时)', editor: 'sunyaq', createdAt: '2026-01-14', calculatedAt: '2026-01-14' },
  { id: 310, name: '数仓-通用个人会员', count: 0, type: '定制分群条件(实时)', editor: 'sunyaq', createdAt: '2026-01-14', calculatedAt: '2026-01-14' },
  { id: 309, name: '数仓-通用个人会员-历史', count: 0, type: '定制分群条件(实时)', editor: 'sunyaq', createdAt: '2026-01-14', calculatedAt: '2026-01-14' },
  { id: 308, name: '数仓-低频非会员', count: 0, type: '定制分群条件(实时)', editor: 'sunyaq', createdAt: '2025-12-30', calculatedAt: '2025-12-30' },
  { id: 307, name: '数仓-低频非会员-近30天', count: 0, type: '定制分群条件(实时)', editor: 'sunyaq', createdAt: '2025-12-30', calculatedAt: '2025-12-30' },
  { id: 306, name: '数仓-低频非会员-近90天', count: 0, type: '定制分群条件(实时)', editor: 'sunyaq', createdAt: '2025-12-30', calculatedAt: '2025-12-30' },
  { id: 305, name: '数仓-到期后电商用户', count: 0, type: '定制分群条件(实时)', editor: 'sunyaq', createdAt: '2025-12-30', calculatedAt: '2025-12-30' },
  { id: 304, name: '数仓-到期前电商用户', count: 0, type: '定制分群条件(实时)', editor: 'sunyaq', createdAt: '2025-12-30', calculatedAt: '2025-12-30' },
  { id: 303, name: '10.28-11.28下载用户', count: 45259, type: 'CSV导入', editor: 'sunyaq', createdAt: '2025-11-28', calculatedAt: '2025-11-28' },
];

export const MEMBER_LEVEL_OPTIONS = [
  '基础版，1', '协作版，2', '高级团队版，3', '个人版，4', '标准版团队，5', '企业专业版，6', '加强版，7',
  '基础团队版，8', '全用途版，9', '基础版，100', '全用途版，105', '标准团队版，110', '高级团队版，115', '企业专业版，120',
  '新媒体商户版，125', '全用途商户版，130', '团队协作版，135', '个人高级版，201', '企业高级版，202', '标准版（个人），199',
  '标准版（企业），200', '标准版（大企业），210', '高级版，203', '高级版（大企业），204', '旗舰版，220', '通用版（个人），211',
  '通用版（企业），212', '协作版，205', '基础版（单人），230', '高级版（单人），231', '专业版（单人），232', '至尊版（单人），233',
  '高级版（团队），300', '专业版（团队），301', '至尊版（团队），302', '基础版（个人），240', '专业版（个人），241',
  '基础版（企业），310', '专业版（企业），311', '旗舰版（企业），220',
];

export const MEMBER_TYPE_OPTIONS = ['个人限次会员', '个人不限次会员', '企业会员'];
const NEW_MEMBER_LEVEL_OPTIONS = ['基础版（个人），240', '专业版（个人），241', '基础版（企业），310', '专业版（企业），311', '旗舰版（企业），220'];
const PACKAGE_TYPE_OPTIONS = ['签约套餐', '非签约套餐'];

export type CsvSelectProps = {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

export function CsvSelect({ value, onChange, children, className = '' }: CsvSelectProps) {
  return (
    <div className={`relative w-full max-w-[360px] ${className}`}>
      <select value={value} onChange={(event) => onChange(event.currentTarget.value)} className="h-10 w-full appearance-none rounded-[3px] border border-[#d7dce3] bg-white px-3 pr-9 text-[16px] text-[#30343b] outline-none transition focus:border-[#278fee]">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8afb9]" />
    </div>
  );
}

const MEMBER_IDENTITY_OPTIONS = [
  { value: 'unlimited', label: '不限制' },
  { value: 'member', label: '是会员用户' },
  { value: 'member-level', label: '是会员用户（按等级）' },
  { value: 'non-member', label: '不是会员用户' },
  { value: 'non-member-level', label: '不是会员用户（按等级）' },
];

function SegmentRequirementDot({ label }: { label: string }) {
  return <span title={label} aria-label={label} className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5a5f] shadow-[0_0_6px_rgba(255,90,95,.75)]" />;
}

export function MemberIdentitySelect({ value, onChange, className = '' }: { value: string; onChange: (value: string) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = MEMBER_IDENTITY_OPTIONS.find((option) => option.value === value) ?? MEMBER_IDENTITY_OPTIONS[0];

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative w-full max-w-[360px] ${className}`}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex h-10 w-full items-center justify-between rounded-[3px] border border-[#d7dce3] bg-white px-3 text-left text-[16px] text-[#30343b] outline-none transition hover:border-[#278fee] focus:border-[#278fee]">
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#a8afb9] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div role="listbox" className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-[3px] border border-[#d7dce3] bg-white py-1 shadow-[0_6px_18px_rgba(25,38,58,.16)]">
          {MEMBER_IDENTITY_OPTIONS.map((option) => (
            <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex min-h-10 w-full items-center justify-between px-3 text-left text-[16px] transition hover:bg-[#eef7ff] ${option.value === value ? 'bg-[#eef7ff] text-[#278fee]' : 'text-[#30343b]'}`}>
              <span>{option.label}</span>
              {option.value === 'member-level' ? <SegmentRequirementDot label="是会员用户（按等级）有需求改动" /> : null}
            </button>
          ))}
        </div>
      ) : null}
      <span className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2"><SegmentRequirementDot label="是会员用户（按等级）有需求改动" /></span>
    </div>
  );
}

export type CsvCheckboxGroupProps = {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  dense?: boolean;
};

export function CsvCheckboxGroup({ label, options, value, onChange, dense = false }: CsvCheckboxGroupProps) {
  const toggleOption = (option: string) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  };
  const existingOptions = options.filter((option) => !NEW_MEMBER_LEVEL_OPTIONS.includes(option));
  const newOptions = options.filter((option) => NEW_MEMBER_LEVEL_OPTIONS.includes(option));
  const renderOption = (option: string) => (
    <label key={option} className="inline-flex min-h-7 cursor-pointer items-center gap-2 text-[16px] text-[#30343b]">
      <input type="checkbox" checked={value.includes(option)} onChange={() => toggleOption(option)} className="h-4 w-4 accent-[#278fee]" />
      <span>{option}</span>
    </label>
  );

  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-4">
      <span className="pt-1.5 text-right text-[16px] text-[#30343b]">{label}：</span>
      <div className={`grid gap-x-5 gap-y-2.5 ${dense ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {existingOptions.map(renderOption)}
        {newOptions.length > 0 ? (
          <div className="relative col-span-full mt-2 rounded-[5px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-3 pb-2 pt-4">
            <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2"><RequirementHint text={MEMBER_TYPE_REQUIREMENT} requirementName="用户分群新增新会员等级" sections={MEMBER_TYPE_REQUIREMENT_SECTIONS} /></div>
            <div className={`grid gap-x-5 gap-y-2.5 ${dense ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {newOptions.map(renderOption)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type CsvImportUserSegmentModalProps = {
  onClose: () => void;
  onComplete: () => void;
};

function CsvImportUserSegmentModal({ onClose, onComplete }: CsvImportUserSegmentModalProps) {
  const [groupName, setGroupName] = useState('');
  const [fileName, setFileName] = useState('');
  const [memberIdentity, setMemberIdentity] = useState('member');
  const [previousIdentity, setPreviousIdentity] = useState('member');
  const [memberTypes, setMemberTypes] = useState<string[]>([]);
  const [packageTypes, setPackageTypes] = useState<string[]>([]);
  const [memberExpiry, setMemberExpiry] = useState('unlimited');
  const [previousExpiry, setPreviousExpiry] = useState('unlimited');

  const isReady = groupName.trim().length > 0 && fileName.length > 0;
  const isPreviousMemberMode = memberIdentity === 'non-member-level';
  const isMemberMode = memberIdentity === 'member' || memberIdentity === 'member-level';
  const isMemberLevelMode = memberIdentity === 'member-level' || memberIdentity === 'non-member-level';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-2 sm:p-4 lg:pl-[244px]">
      <section className="relative flex max-h-[calc(100vh-24px)] w-full max-w-none flex-col overflow-hidden rounded-[3px] bg-white shadow-[0_12px_40px_rgba(0,0,0,.24)]">
        <header className="flex min-h-[68px] shrink-0 items-center justify-between border-b border-[#e6e8eb] px-6 sm:px-8">
          <h2 className="text-[22px] font-medium text-[#292d32]">CSV导入用户分群</h2>
          <button type="button" aria-label="关闭" onClick={onClose} className="rounded p-1 text-[#96999d] transition hover:bg-[#f3f5f7] hover:text-[#4c5259]"><X className="h-6 w-6" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          <div className="max-w-[1800px] space-y-5">
            <label className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[16px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>分群名称：</span>
              <input value={groupName} onChange={(event) => setGroupName(event.currentTarget.value)} placeholder="分群名称" className="h-11 w-full max-w-[400px] rounded-[3px] border border-[#d7dce3] px-3 text-[16px] text-[#30343b] outline-none placeholder:text-[#c8cbd0] focus:border-[#278fee]" />
            </label>

            <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[16px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>csv文件：</span>
              <div className="flex flex-wrap items-center gap-4">
                <label htmlFor="csv-user-segment-file" className="inline-flex h-11 cursor-pointer items-center rounded-[3px] bg-[#278fee] px-5 text-[16px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]">＋上传文件</label>
                <input id="csv-user-segment-file" type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name ?? '')} />
                <button type="button" className="text-[16px] text-[#278fee] hover:text-[#167fdc]">下载模板</button>
                {fileName ? <span className="max-w-[420px] truncate text-[16px] text-[#6f7b8c]" title={fileName}>{fileName}</span> : null}
              </div>
            </div>

            <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[16px] text-[#30343b]">会员身份：</span>
              <MemberIdentitySelect value={memberIdentity} onChange={setMemberIdentity} className="max-w-[360px]" />
            </div>

            {isPreviousMemberMode ? (
              <>
                <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
                  <span className="text-right text-[16px] text-[#30343b]">用户之前的身份：</span>
                  <CsvSelect value={previousIdentity} onChange={setPreviousIdentity}>
                    <option value="unlimited">不限制</option>
                    <option value="free">一直是免费会员</option>
                    <option value="member">之前是会员</option>
                  </CsvSelect>
                </div>
                <CsvCheckboxGroup label="会员类型" options={MEMBER_LEVEL_OPTIONS} value={memberTypes} onChange={setMemberTypes} dense />
              </>
            ) : isMemberLevelMode ? (
              <CsvCheckboxGroup label="会员类型" options={MEMBER_LEVEL_OPTIONS} value={memberTypes} onChange={setMemberTypes} dense />
            ) : isMemberMode ? (
              <CsvCheckboxGroup label="会员类型" options={MEMBER_TYPE_OPTIONS} value={memberTypes} onChange={setMemberTypes} />
            ) : null}

            <CsvCheckboxGroup label="套餐类型" options={PACKAGE_TYPE_OPTIONS} value={packageTypes} onChange={setPackageTypes} />

            <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[16px] text-[#30343b]">{isPreviousMemberMode ? '之前会员到期时间' : '会员到期时间'}：</span>
              <CsvSelect value={isPreviousMemberMode ? previousExpiry : memberExpiry} onChange={isPreviousMemberMode ? setPreviousExpiry : setMemberExpiry}>
                <option value="unlimited">不限制</option>
                <option value="expired">已过期</option>
                <option value="within-30">30天内到期</option>
                <option value="within-90">90天内到期</option>
              </CsvSelect>
            </div>
          </div>
        </div>

        <footer className="flex h-[78px] shrink-0 items-center justify-center border-t border-[#e6e8eb]">
          <button type="button" disabled={!isReady} onClick={onComplete} className="h-11 min-w-[104px] rounded-[3px] border border-[#d7d9dc] bg-[#f7f7f7] px-6 text-[16px] text-[#c1c3c6] transition enabled:border-[#278fee] enabled:bg-[#278fee] enabled:text-white enabled:hover:bg-[#167fdc]">完成</button>
        </footer>
      </section>
    </div>
  );
}

export function UserSegmentPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig, onNavigateToNewRule, onNavigateToCustomRule }: UserSegmentPageProps) {
  const [segments] = useState(INITIAL_SEGMENTS);
  const [nameQuery, setNameQuery] = useState('');
  const [editorQuery, setEditorQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [appliedFilters, setAppliedFilters] = useState({ name: '', editor: '', type: '全部' });
  const [actionMessage, setActionMessage] = useState('');
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  const filteredSegments = useMemo(() => segments.filter((segment) => {
    const matchesName = !appliedFilters.name || segment.name.includes(appliedFilters.name);
    const matchesEditor = !appliedFilters.editor || segment.editor.includes(appliedFilters.editor);
    const matchesType = appliedFilters.type === '全部' || segment.type === appliedFilters.type;
    return matchesName && matchesEditor && matchesType;
  }), [appliedFilters, segments]);

  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };

  const runSearch = () => {
    setAppliedFilters({ name: nameQuery.trim(), editor: editorQuery.trim(), type: typeFilter });
    setActionMessage('');
  };

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(''), 2200);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="用户分群" onNavigate={handleNavigate} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <div className="mb-4 flex items-center gap-2 text-[12px] text-[#98a2b2]"><span>用户中心</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4d5b70]">用户分群</span></div>
          <section className="overflow-hidden rounded-[4px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <header className="border-b border-[#e8edf3] px-5 py-5"><h1 className="text-[18px] font-semibold text-[#283244]">用户分群</h1></header>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0f4] px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setIsCsvImportOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-[3px] bg-[#278fee] px-4 text-[13px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]"><Upload className="h-4 w-4" /><span>CSV导入分群</span><SegmentRequirementDot label="CSV导入分群有需求改动" /></button>
                <button type="button" onClick={() => onNavigateToNewRule?.()} className="inline-flex h-9 items-center gap-1.5 rounded-[3px] bg-[#278fee] px-4 text-[13px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]"><Plus className="h-4 w-4" />新增规则分群</button>
                <button type="button" onClick={() => onNavigateToCustomRule?.()} className="inline-flex h-9 items-center gap-1.5 rounded-[3px] bg-[#278fee] px-4 text-[13px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]"><Plus className="h-4 w-4" />定制分群条件</button>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <input value={nameQuery} onChange={(event) => setNameQuery(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') runSearch(); }} placeholder="分群名称" className="h-9 w-[190px] rounded-[3px] border border-[#dfe3ea] px-3 text-[12px] text-[#303b4d] outline-none placeholder:text-[#c8c8c8] focus:border-[#278fee]" />
                <input value={editorQuery} onChange={(event) => setEditorQuery(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') runSearch(); }} placeholder="最后编辑人" className="h-9 w-[190px] rounded-[3px] border border-[#dfe3ea] px-3 text-[12px] text-[#303b4d] outline-none placeholder:text-[#c8c8c8] focus:border-[#278fee]" />
                <div className="relative"><select value={typeFilter} onChange={(event) => setTypeFilter(event.currentTarget.value)} className="h-9 w-[130px] appearance-none rounded-[3px] border border-[#dfe3ea] bg-white px-3 pr-8 text-[12px] text-[#303b4d] outline-none focus:border-[#278fee]"><option>全部</option><option>定制分群条件(实时)</option><option>CSV导入</option></select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa5b4]" /></div>
                <button type="button" onClick={runSearch} className="h-9 rounded-[3px] bg-[#278fee] px-5 text-[13px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]">查询</button>
              </div>
            </div>
            <div className="px-5 pb-5 pt-4">
              <div className="overflow-x-auto border border-[#f0f1f3]">
                <table className="w-full min-w-[1000px] table-fixed border-collapse text-center text-[13px] text-[#4d5664]">
                  <colgroup><col className="w-[10%]" /><col className="w-[23%]" /><col className="w-[12%]" /><col className="w-[18%]" /><col className="w-[15%]" /><col className="w-[11%]" /><col className="w-[11%]" /><col className="w-[10%]" /></colgroup>
                  <thead className="h-[58px] bg-[#fafafa] text-[#2f3744]"><tr>{['分群ID', '分群名称', '分群人数', '分群类型', '最后编辑人', '创建时间', '最近计算', '操作'].map((label) => <th key={label} className="px-3 font-medium">{label}</th>)}</tr></thead>
                  <tbody>{filteredSegments.map((segment) => <tr key={segment.id} className="h-[78px] border-t border-[#edf0f4] transition hover:bg-[#fbfdff]"><td className="px-3">{segment.id}</td><td className="truncate px-3 text-left text-[#278fee]" title={segment.name}>{segment.name}</td><td className="px-3">{segment.count}</td><td className="px-3 leading-5">{segment.type}</td><td className="px-3">{segment.editor}</td><td className="px-3">{segment.createdAt}</td><td className="px-3">{segment.calculatedAt}</td><td className="px-3"><div className="flex items-center justify-center gap-4"><button type="button" onClick={() => showActionMessage(`已打开分群 ${segment.id} 编辑`)} className="text-[#278fee] hover:text-[#167fdc]">编辑</button><button type="button" onClick={() => showActionMessage(`已发起删除分群 ${segment.id}`)} className="text-[#278fee] hover:text-[#167fdc]">删除</button></div></td></tr>)}</tbody>
                </table>
                {filteredSegments.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无匹配的分群</div> : null}
              </div>
              <div className="flex items-center justify-between px-2 pt-4 text-[12px] text-[#8c97a7]"><span>共 {filteredSegments.length} 条记录</span><div className="flex items-center gap-2"><button type="button" disabled className="h-7 rounded-[3px] border border-[#e0e4ea] px-2.5 text-[#b7bec8]">上一页</button><span className="flex h-7 min-w-7 items-center justify-center rounded-[3px] bg-[#278fee] px-2 text-white">1</span><button type="button" disabled className="h-7 rounded-[3px] border border-[#e0e4ea] px-2.5 text-[#b7bec8]">下一页</button></div></div>
            </div>
          </section>
        </div>
      </main>
      {actionMessage ? <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-[4px] bg-[#263247] px-4 py-2 text-[12px] text-white shadow-[0_6px_18px_rgba(25,38,58,.25)]">{actionMessage}</div> : null}
      {isCsvImportOpen ? <CsvImportUserSegmentModal onClose={() => setIsCsvImportOpen(false)} onComplete={() => { setIsCsvImportOpen(false); showActionMessage('CSV导入分群已提交'); }} /> : null}
    </div>
  );
}
