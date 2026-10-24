import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Upload } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';

type UserSegmentPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
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

export function UserSegmentPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig }: UserSegmentPageProps) {
  const [segments] = useState(INITIAL_SEGMENTS);
  const [nameQuery, setNameQuery] = useState('');
  const [editorQuery, setEditorQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [appliedFilters, setAppliedFilters] = useState({ name: '', editor: '', type: '全部' });
  const [actionMessage, setActionMessage] = useState('');

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
                <button type="button" onClick={() => showActionMessage('已打开 CSV 导入分群')} className="inline-flex h-9 items-center gap-1.5 rounded-[3px] bg-[#278fee] px-4 text-[13px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]"><Upload className="h-4 w-4" />CSV导入分群</button>
                <button type="button" onClick={() => showActionMessage('已打开新增规则分群')} className="inline-flex h-9 items-center gap-1.5 rounded-[3px] bg-[#278fee] px-4 text-[13px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]"><Plus className="h-4 w-4" />新增规则分群</button>
                <button type="button" onClick={() => showActionMessage('已打开定制分群条件')} className="inline-flex h-9 items-center gap-1.5 rounded-[3px] bg-[#278fee] px-4 text-[13px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]"><Plus className="h-4 w-4" />定制分群条件</button>
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
    </div>
  );
}
