import { useMemo, useState } from 'react';
import { ChevronRight, Eye, Pencil, Plus, Search, X } from 'lucide-react';
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
];

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

export function MembershipPackagePage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch }: { onBackToDirectory: () => void; onNavigateToSkillConfig?: () => void; onNavigateToGuidedSearch?: () => void }) {
  const [packages, setPackages] = useState(initialPackages);
  const [nameQuery, setNameQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [modal, setModal] = useState<{ mode: 'detail' | 'edit' | 'create'; row: PackageRow } | null>(null);
  const filteredPackages = useMemo(() => packages.filter((row) => !submittedQuery.trim() || row.name.includes(submittedQuery.trim())), [packages, submittedQuery]);

  const savePackage = (row: PackageRow) => {
    setPackages((current) => row.id && current.some((item) => item.id === row.id) ? current.map((item) => item.id === row.id ? row : item) : [row, ...current]);
    setModal(null);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员套餐管理" onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); }} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <section className="mx-[27px] mt-[27px] min-h-[calc(100vh-89px)] bg-white">
          <header className="flex h-[65px] items-center justify-between border-b border-[#ededed] px-[25px]"><h1 className="text-[16px] font-medium text-[#252525]">会员套餐管理</h1><button type="button" onClick={() => setModal({ mode: 'create', row: { id: 0, name: '', description: '', packageCode: '', creator: '赵文文', createdAt: '', status: '使用中' } })} className="inline-flex h-[33px] items-center gap-1.5 rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]"><Plus className="h-4 w-4" />新增套餐组</button></header>
          <div className="px-[25px] pb-8 pt-6">
            <form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(nameQuery); }} className="flex items-center"><input value={nameQuery} onChange={(event) => setNameQuery(event.currentTarget.value)} placeholder="名称" className="h-[32px] w-[335px] rounded-l-[2px] border border-[#d9d9d9] px-3 text-[12px] text-[#333] outline-none focus:border-[#278fee]" /><button type="submit" className="inline-flex h-[32px] w-[65px] items-center justify-center gap-1 rounded-r-[2px] bg-[#278fee] text-[12px] text-white hover:bg-[#167fdc]"><Search className="h-3.5 w-3.5" />搜索</button></form>
            <div className="mt-[30px] overflow-x-auto"><table className="w-full min-w-[1180px] table-fixed border-collapse text-left text-[13px]"><colgroup><col className="w-[7%]" /><col className="w-[18%]" /><col className="w-[18%]" /><col className="w-[12%]" /><col className="w-[11%]" /><col className="w-[16%]" /><col className="w-[10%]" /><col className="w-[18%]" /></colgroup><thead className="h-[54px] bg-[#fafafa] text-[#222]"><tr>{['ID', '名称', '描述', '套餐标识', '创建人', '创建时间', '状态', '操作'].map((label) => <th key={label} className="px-6 font-normal">{label}</th>)}</tr></thead><tbody>{filteredPackages.map((row) => <tr key={row.id} className="h-[65px] border-b border-[#ededed] text-[#3b3b3b] hover:bg-[#fcfdff]"><td className="px-6">{row.id}</td><td className="px-6">{row.name}</td><td className="px-6">{row.description}</td><td className="px-6">{row.packageCode}</td><td className="px-6">{row.creator}</td><td className="px-6 whitespace-nowrap">{row.createdAt}</td><td className="px-6">{row.status}</td><td className="px-6"><div className="flex items-center gap-3 whitespace-nowrap"><button type="button" onClick={() => setModal({ mode: 'detail', row })} className="inline-flex h-[33px] items-center gap-1 rounded-[2px] border border-[#d9dfe6] bg-white px-4 text-[12px] text-[#444] hover:border-[#278fee] hover:text-[#278fee]"><Eye className="h-3.5 w-3.5" />套餐详情</button><button type="button" onClick={() => setModal({ mode: 'edit', row })} className="inline-flex h-[33px] items-center gap-1 rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]"><Pencil className="h-3.5 w-3.5" />编辑套餐组</button></div></td></tr>)}</tbody></table>{filteredPackages.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无匹配的套餐组</div> : null}</div>
          </div>
        </section>
      </main>
      {modal ? <PackageModal mode={modal.mode} row={modal.row} onClose={() => setModal(null)} onSave={savePackage} /> : null}
    </div>
  );
}
