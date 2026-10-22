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

type PackageDetailRow = {
  id: number;
  name: string;
  displayName: string;
  duration: number;
  originalPrice: number;
  discount: number;
  currentPrice: number;
  contractPrice: string;
  packageType: string;
  member: string;
  sort: number;
  trialDays: number;
  segment: string;
  displayTime: string;
  status: '显示' | '隐藏';
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

const initialPackageDetails: PackageDetailRow[] = [
  { id: 3480, name: 'web-高级版（团队）-3年（加送1年）', displayName: '3年+1年', duration: 1460, originalPrice: 1578, discount: 100, currentPrice: 1578, contractPrice: '-', packageType: '普通套餐', member: '高级版（团队）', sort: 0, trialDays: 0, segment: '/', displayTime: '/', status: '显示' },
  { id: 3479, name: 'web-高级版（团队）-2年会员（加6个月）', displayName: '2年+6个月', duration: 910, originalPrice: 1138, discount: 100, currentPrice: 1138, contractPrice: '-', packageType: '普通套餐', member: '高级版（团队）', sort: 1, trialDays: 0, segment: '/', displayTime: '/', status: '显示' },
  { id: 3438, name: 'web-高级版（单人）-连续包季（199）', displayName: '连续包季', duration: 90, originalPrice: 239, discount: 83, currentPrice: 199, contractPrice: '1-199', packageType: '订阅套餐', member: '高级版（单人）', sort: 0, trialDays: 0, segment: '/', displayTime: '/', status: '显示' },
  { id: 3392, name: 'web-基础版（单人）-连续包年（139）', displayName: '连续包年', duration: 365, originalPrice: 159, discount: 94, currentPrice: 149, contractPrice: '1-139', packageType: '订阅套餐', member: '基础版（单人）', sort: 3, trialDays: 0, segment: '109', displayTime: '/', status: '隐藏' },
  { id: 3391, name: 'web-基础版（单人）-连续包年（139）', displayName: '连续包年', duration: 365, originalPrice: 159, discount: 94, currentPrice: 149, contractPrice: '1-139', packageType: '订阅套餐', member: '基础版（单人）', sort: 3, trialDays: 0, segment: '110', displayTime: '/', status: '隐藏' },
  { id: 3388, name: 'web-基础版（单人）-连续包年（139）', displayName: '连续包年', duration: 365, originalPrice: 159, discount: 87, currentPrice: 139, contractPrice: '1-139', packageType: '订阅套餐', member: '基础版（单人）', sort: 3, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏' },
  { id: 3385, name: 'web-基础版（单人）-连续包年（139）', displayName: '连续包年', duration: 365, originalPrice: 159, discount: 94, currentPrice: 149, contractPrice: '1-139', packageType: '订阅套餐', member: '基础版（单人）', sort: 3, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏' },
  { id: 3383, name: 'web-高级版（团队）-2年会员', displayName: '2年', duration: 730, originalPrice: 1138, discount: 100, currentPrice: 1138, contractPrice: '-', packageType: '普通套餐', member: '高级版（团队）', sort: 1, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏' },
  { id: 3382, name: 'web-高级版（团队）-3年会员', displayName: '3年', duration: 1095, originalPrice: 1578, discount: 100, currentPrice: 1578, contractPrice: '-', packageType: '普通套餐', member: '高级版（团队）', sort: 0, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏' },
  { id: 3381, name: 'web-高级版（团队）-2年会员', displayName: '2年', duration: 730, originalPrice: 1138, discount: 100, currentPrice: 1138, contractPrice: '-', packageType: '普通套餐', member: '高级版（团队）', sort: 1, trialDays: 0, segment: '/', displayTime: '/', status: '隐藏' },
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

function MembershipPackageDetailPage({ packageName, onBack, onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch }: { packageName: string; onBack: () => void; onBackToDirectory: () => void; onNavigateToSkillConfig?: () => void; onNavigateToGuidedSearch?: () => void }) {
  const [details, setDetails] = useState(initialPackageDetails);
  const [nameQuery, setNameQuery] = useState('');
  const [memberType, setMemberType] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [submittedMemberType, setSubmittedMemberType] = useState('');
  const filteredDetails = useMemo(() => details.filter((row) => (!submittedName.trim() || row.name.includes(submittedName.trim())) && (!submittedMemberType || row.member === submittedMemberType)), [details, submittedMemberType, submittedName]);

  const toggleDisplay = (id: number) => setDetails((current) => current.map((row) => row.id === id ? { ...row, status: row.status === '显示' ? '隐藏' : '显示' } : row));

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员套餐管理" onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); }} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-[25px] pt-[25px]"><div className="flex items-center gap-2 text-[13px] text-[#8b9199]"><button type="button" onClick={onBack} className="hover:text-[#278fee]">会员套餐管理</button><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#2d2d2d]">{packageName}</span></div>
          <section className="mt-[25px] min-h-[calc(100vh-130px)] bg-white px-[25px] pb-8">
            <div className="flex items-center justify-end gap-5 border-b border-[#f0f0f0] py-4"><button type="button" className="h-[33px] rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]">推荐套餐配置</button><input value={nameQuery} onChange={(event) => setNameQuery(event.currentTarget.value)} placeholder="名称" className="h-[33px] w-[240px] rounded-[2px] border border-[#d9d9d9] px-3 text-[12px] outline-none focus:border-[#278fee]" /><select value={memberType} onChange={(event) => setMemberType(event.currentTarget.value)} className="h-[33px] w-[240px] rounded-[2px] border border-[#d9d9d9] bg-white px-3 text-[12px] text-[#b6bbc1] outline-none focus:border-[#278fee]"><option value="">请选择会员类型</option><option value="高级版（团队）">高级版（团队）</option><option value="高级版（单人）">高级版（单人）</option><option value="基础版（单人）">基础版（单人）</option></select><button type="button" onClick={() => { setSubmittedName(nameQuery); setSubmittedMemberType(memberType); }} className="h-[33px] rounded-[2px] bg-[#278fee] px-5 text-[12px] text-white hover:bg-[#167fdc]">查询</button><button type="button" className="h-[33px] rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]">＋ 新增套餐</button><button type="button" onClick={() => setDetails((current) => [...current])} className="h-[33px] rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]">刷新缓存</button></div>
            <div className="mt-[23px] overflow-x-auto"><table className="w-full min-w-[1420px] table-fixed border-collapse text-center text-[13px]"><colgroup><col className="w-[5%]" /><col className="w-[13%]" /><col className="w-[8%]" /><col className="w-[6%]" /><col className="w-[6%]" /><col className="w-[7%]" /><col className="w-[6%]" /><col className="w-[7%]" /><col className="w-[7%]" /><col className="w-[8%]" /><col className="w-[5%]" /><col className="w-[6%]" /><col className="w-[6%]" /><col className="w-[6%]" /><col className="w-[5%]" /><col className="w-[11%]" /></colgroup><thead className="h-[76px] bg-[#fafafa] text-[#222]"><tr>{['ID', '名称', '显示名称', '时长\n(天)', '原价', '套餐折\n扣率', '现价', '签约价\n格', '套餐\n类型', '所属会员', '排\n序', '试用\n天数', '显示分\n群', '显示\n时间', '状\n态', '操作'].map((label) => <th key={label} className="whitespace-pre-line px-2 font-normal leading-5">{label}</th>)}</tr></thead><tbody>{filteredDetails.map((row) => <tr key={row.id} className="h-[97px] border-b border-[#ededed] text-[#3b3b3b] hover:bg-[#fcfdff]"><td className="px-2">{row.id}</td><td className="px-2 leading-5">{row.name}</td><td className="px-2 leading-5">{row.displayName}</td><td className="px-2">{row.duration}</td><td className="px-2">{row.originalPrice}</td><td className="px-2">{row.discount}</td><td className="px-2">{row.currentPrice}</td><td className="px-2">{row.contractPrice}</td><td className="px-2 leading-5">{row.packageType}</td><td className="px-2 leading-5">{row.member}</td><td className="px-2">{row.sort}</td><td className="px-2">{row.trialDays}</td><td className="px-2">{row.segment}</td><td className="px-2">{row.displayTime}</td><td className="px-2 leading-5">{row.status}</td><td className="px-2"><div className="flex flex-wrap items-center justify-center gap-2"><button type="button" className="h-[33px] rounded-[2px] border border-[#d8dce1] bg-white px-4 text-[12px] text-[#333] hover:border-[#278fee] hover:text-[#278fee]">编辑</button><button type="button" onClick={() => toggleDisplay(row.id)} className={`h-[33px] rounded-[2px] px-4 text-[12px] text-white ${row.status === '显示' ? 'bg-[#ff4b55] hover:bg-[#ed3b45]' : 'bg-[#278fee] hover:bg-[#167fdc]'}`}>{row.status === '显示' ? '隐藏' : '显示'}</button><button type="button" className="h-[33px] rounded-[2px] bg-[#ff4b55] px-4 text-[12px] text-white hover:bg-[#ed3b45]">关闭</button></div></td></tr>)}</tbody></table>{filteredDetails.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无匹配的套餐</div> : null}</div>
          </section>
        </div>
      </main>
    </div>
  );
}

export function MembershipPackagePage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch }: { onBackToDirectory: () => void; onNavigateToSkillConfig?: () => void; onNavigateToGuidedSearch?: () => void }) {
  const [packages, setPackages] = useState(initialPackages);
  const [nameQuery, setNameQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [modal, setModal] = useState<{ mode: 'detail' | 'edit' | 'create'; row: PackageRow } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageRow | null>(null);
  const filteredPackages = useMemo(() => packages.filter((row) => !submittedQuery.trim() || row.name.includes(submittedQuery.trim())), [packages, submittedQuery]);

  const savePackage = (row: PackageRow) => {
    setPackages((current) => row.id && current.some((item) => item.id === row.id) ? current.map((item) => item.id === row.id ? row : item) : [row, ...current]);
    setModal(null);
  };

  if (selectedPackage) {
    return <MembershipPackageDetailPage packageName={selectedPackage.id === 32 ? 'web端-新成' : selectedPackage.name} onBack={() => setSelectedPackage(null)} onBackToDirectory={onBackToDirectory} onNavigateToSkillConfig={onNavigateToSkillConfig} onNavigateToGuidedSearch={onNavigateToGuidedSearch} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="会员套餐管理" onNavigate={(item) => { if (item === 'AI电商配置') onNavigateToSkillConfig?.(); if (item === '搜索引导管理') onNavigateToGuidedSearch?.(); }} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <section className="mx-[27px] mt-[27px] min-h-[calc(100vh-89px)] bg-white">
          <header className="flex h-[65px] items-center justify-between border-b border-[#ededed] px-[25px]"><h1 className="text-[16px] font-medium text-[#252525]">会员套餐管理</h1><button type="button" onClick={() => setModal({ mode: 'create', row: { id: 0, name: '', description: '', packageCode: '', creator: '赵文文', createdAt: '', status: '使用中' } })} className="inline-flex h-[33px] items-center gap-1.5 rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]"><Plus className="h-4 w-4" />新增套餐组</button></header>
          <div className="px-[25px] pb-8 pt-6">
            <form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(nameQuery); }} className="flex items-center"><input value={nameQuery} onChange={(event) => setNameQuery(event.currentTarget.value)} placeholder="名称" className="h-[32px] w-[335px] rounded-l-[2px] border border-[#d9d9d9] px-3 text-[12px] text-[#333] outline-none focus:border-[#278fee]" /><button type="submit" className="inline-flex h-[32px] w-[65px] items-center justify-center gap-1 rounded-r-[2px] bg-[#278fee] text-[12px] text-white hover:bg-[#167fdc]"><Search className="h-3.5 w-3.5" />搜索</button></form>
            <div className="mt-[30px] overflow-x-auto"><table className="w-full min-w-[1180px] table-fixed border-collapse text-left text-[13px]"><colgroup><col className="w-[7%]" /><col className="w-[18%]" /><col className="w-[18%]" /><col className="w-[12%]" /><col className="w-[11%]" /><col className="w-[16%]" /><col className="w-[10%]" /><col className="w-[18%]" /></colgroup><thead className="h-[54px] bg-[#fafafa] text-[#222]"><tr>{['ID', '名称', '描述', '套餐标识', '创建人', '创建时间', '状态', '操作'].map((label) => <th key={label} className="px-6 font-normal">{label}</th>)}</tr></thead><tbody>{filteredPackages.map((row) => <tr key={row.id} className="h-[65px] border-b border-[#ededed] text-[#3b3b3b] hover:bg-[#fcfdff]"><td className="px-6">{row.id}</td><td className="px-6">{row.name}</td><td className="px-6">{row.description}</td><td className="px-6">{row.packageCode}</td><td className="px-6">{row.creator}</td><td className="px-6 whitespace-nowrap">{row.createdAt}</td><td className="px-6">{row.status}</td><td className="px-6"><div className="flex items-center gap-3 whitespace-nowrap"><button type="button" onClick={() => setSelectedPackage(row)} className="inline-flex h-[33px] items-center gap-1 rounded-[2px] border border-[#d9dfe6] bg-white px-4 text-[12px] text-[#444] hover:border-[#278fee] hover:text-[#278fee]"><Eye className="h-3.5 w-3.5" />套餐详情</button><button type="button" onClick={() => setModal({ mode: 'edit', row })} className="inline-flex h-[33px] items-center gap-1 rounded-[2px] bg-[#278fee] px-4 text-[12px] text-white hover:bg-[#167fdc]"><Pencil className="h-3.5 w-3.5" />编辑套餐组</button></div></td></tr>)}</tbody></table>{filteredPackages.length === 0 ? <div className="py-20 text-center text-[13px] text-[#9ba3ad]">暂无匹配的套餐组</div> : null}</div>
          </div>
        </section>
      </main>
      {modal ? <PackageModal mode={modal.mode} row={modal.row} onClose={() => setModal(null)} onSave={savePackage} /> : null}
    </div>
  );
}
