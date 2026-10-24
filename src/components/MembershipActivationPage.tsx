import { useMemo, useState } from 'react';
import { ChevronDown, KeyRound, Search, X } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { MEMBER_TYPE_REQUIREMENT, MEMBER_TYPE_REQUIREMENT_SECTIONS, RequirementHint } from './MembershipPackagePage';

type MembershipActivationPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
};

type ActivationRecord = {
  id: number;
  name: string;
  memberType: string;
  duration: string;
  channel: string;
  generated: number;
  status: '已生成' | '生成中';
  used: number;
  createdAt: string;
  creator: string;
};

const INITIAL_ACTIVATION_RECORDS: ActivationRecord[] = [
  { id: 7373, name: '测试', memberType: '通用版（个人）', duration: '90', channel: '创客贴运营', generated: 1, status: '已生成', used: 1, createdAt: '2026-10-23 10:51:36', creator: 'wangjx' },
  { id: 7370, name: '1022电商用户补偿-1天', memberType: '通用版（个人）', duration: '1', channel: '创客贴运营', generated: 100, status: '已生成', used: 0, createdAt: '2026-10-22 11:16:02', creator: 'fengml' },
  { id: 7368, name: '1012内部测试-AA', memberType: '通用版（个人）', duration: '7', channel: '电商-天津成长管理', generated: 5, status: '已生成', used: 2, createdAt: '2026-10-12 19:03:28', creator: 'fengml' },
  { id: 7360, name: '小红书博主', memberType: '基础版（单人）', duration: '7', channel: '创客贴运营', generated: 100, status: '已生成', used: 0, createdAt: '2026-10-09 16:18:10', creator: 'wangjx' },
  { id: 7353, name: '0929蓝色兄弟协作3人2年', memberType: '协作版', duration: '820', channel: '蓝色兄弟', generated: 1, status: '已生成', used: 1, createdAt: '2026-09-29 14:07:18', creator: 'fengml' },
];

const EXISTING_ACTIVATION_TYPE_OPTIONS = [
  '个人版VIP',
  '企业基础版VIP',
  '企业标准团队版VIP',
  '高级团队版VIP',
  '基础团队版VIP',
  '全用途版VIP',
  '新媒体商户版',
  '全用途商户版',
  '基础版（单人）',
  '高级版（单人）',
  '专业版（单人）',
  '旗舰版（企业）',
];
const NEW_ACTIVATION_TYPE_OPTIONS = ['基础版（个人） 240', '专业版（个人） 241', '基础版（企业） 310', '专业版（企业） 311', '旗舰版（企业） 220'];
const ACTIVATION_TYPE_OPTIONS = [...EXISTING_ACTIVATION_TYPE_OPTIONS, ...NEW_ACTIVATION_TYPE_OPTIONS];

const CHANNEL_OPTIONS = ['创客贴运营', '电商-天津成长管理', '蓝色兄弟'];
const PACKAGE_TYPE_OPTIONS = ['签约套餐', '非签约套餐'];

function ActivationSelect({ value, placeholder, options, onChange, open, onToggle, highlightOptions = [], requirementName }: { value: string; placeholder: string; options: string[]; onChange: (value: string) => void; open: boolean; onToggle: () => void; highlightOptions?: string[]; requirementName?: string }) {
  const existingOptions = options.filter((option) => !highlightOptions.includes(option));
  const newOptions = options.filter((option) => highlightOptions.includes(option));
  const renderOption = (option: string, newOption = false) => <button key={option} type="button" onClick={() => onChange(option)} className={`block w-full rounded-[2px] px-3 py-2.5 text-left text-[14px] ${value === option ? (newOption ? 'bg-[#ffe6e1] text-[#e05252]' : 'bg-[#e8f5ff] text-[#278fee]') : (newOption ? 'text-[#454e5b] hover:bg-[#fff0ed]' : 'text-[#454e5b] hover:bg-[#f2f7fb]')}`}>{option}</button>;
  return (
    <div className="relative">
      <button type="button" aria-expanded={open} onClick={onToggle} className={`flex h-11 w-full items-center justify-between rounded-[3px] border bg-white px-3 text-left text-[14px] outline-none transition ${open ? 'border-[#278fee]' : 'border-[#d7dce3]'}`}>
        <span className={value ? 'text-[#30343b]' : 'text-[#c5cbd2]'}>{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#a5adb7] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-[255px] w-full overflow-y-auto rounded-[3px] border border-[#dfe4eb] bg-white py-1 shadow-[0_8px_18px_rgba(31,43,61,.18)]">
          {existingOptions.map((option) => renderOption(option))}
          {newOptions.length > 0 ? <div className="relative mt-2 rounded-[5px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-1 pb-1 pt-4">
            <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2"><RequirementHint text={MEMBER_TYPE_REQUIREMENT} requirementName={requirementName ?? '会员激活码新增新会员等级'} sections={MEMBER_TYPE_REQUIREMENT_SECTIONS} /></div>
            {newOptions.map((option) => renderOption(option, true))}
          </div> : null}
        </div>
      ) : null}
    </div>
  );
}

type ActivationModalProps = {
  onClose: () => void;
  onCreate: (record: ActivationRecord) => void;
};

function AddActivationModal({ onClose, onCreate }: ActivationModalProps) {
  const [channel, setChannel] = useState('');
  const [name, setName] = useState('');
  const [activationType, setActivationType] = useState('');
  const [packageType, setPackageType] = useState('');
  const [validity, setValidity] = useState('');
  const [amount, setAmount] = useState('');
  const [revenue, setRevenue] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [openSelect, setOpenSelect] = useState<'channel' | 'activationType' | 'packageType' | null>(null);
  const ready = Boolean(channel && name.trim() && activationType && packageType && validity && amount && revenue && unitPrice);

  const createRecord = () => {
    if (!ready) return;
    onCreate({
      id: 7374,
      name: name.trim(),
      memberType: activationType,
      duration: validity,
      channel,
      generated: Number(amount),
      status: '已生成',
      used: 0,
      createdAt: '2026-10-25 10:00:00',
      creator: '当前用户',
    });
  };

  const closeSelects = () => setOpenSelect(null);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
      <section className="relative flex max-h-[calc(100vh-32px)] w-full max-w-[700px] flex-col overflow-hidden rounded-[3px] bg-white shadow-[0_12px_40px_rgba(0,0,0,.24)]">
        <header className="flex min-h-[72px] shrink-0 items-center justify-between border-b border-[#e7e9ec] px-7">
          <h2 className="text-[20px] font-semibold text-[#292d32]">添加激活码活动</h2>
          <button type="button" aria-label="关闭" onClick={onClose} className="rounded p-1 text-[#96999d] transition hover:bg-[#f3f5f7] hover:text-[#4c5259]"><X className="h-6 w-6" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
          <div className="space-y-5">
            <label className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[14px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>渠道：</span>
              <ActivationSelect value={channel} placeholder="请选择渠道商" options={CHANNEL_OPTIONS} open={openSelect === 'channel'} onToggle={() => setOpenSelect(openSelect === 'channel' ? null : 'channel')} onChange={(value) => { setChannel(value); closeSelects(); }} />
            </label>
            <label className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[14px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>活动名称：</span>
              <input value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder="请输入活动名称最多15字" maxLength={15} className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#c5cbd2] focus:border-[#278fee]" />
            </label>
            <label className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[14px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>激活码类型：</span>
              <ActivationSelect value={activationType} placeholder="请选择激活码类型" options={ACTIVATION_TYPE_OPTIONS} highlightOptions={NEW_ACTIVATION_TYPE_OPTIONS} requirementName="会员激活码新增新会员等级" open={openSelect === 'activationType'} onToggle={() => setOpenSelect(openSelect === 'activationType' ? null : 'activationType')} onChange={(value) => { setActivationType(value); closeSelects(); }} />
            </label>
            <label className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[14px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>激活码套餐类型：</span>
              <ActivationSelect value={packageType} placeholder="请选择激活码套餐类型" options={PACKAGE_TYPE_OPTIONS} open={openSelect === 'packageType'} onToggle={() => setOpenSelect(openSelect === 'packageType' ? null : 'packageType')} onChange={(value) => { setPackageType(value); closeSelects(); }} />
            </label>
            <label className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[14px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>激活码有效期：</span>
              <input value={validity} onChange={(event) => setValidity(event.currentTarget.value)} placeholder="请输入激活码有效期（天）" type="number" min="1" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#c5cbd2] focus:border-[#278fee]" />
            </label>
            <label className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[14px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>生成激活码数量：</span>
              <input value={amount} onChange={(event) => setAmount(event.currentTarget.value)} placeholder="请输入生成数量" type="number" min="1" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#c5cbd2] focus:border-[#278fee]" />
            </label>
            <label className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[14px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>营收金额：</span>
              <input value={revenue} onChange={(event) => setRevenue(event.currentTarget.value)} placeholder="请输入营收金额（元）" type="number" min="0" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#c5cbd2] focus:border-[#278fee]" />
            </label>
            <label className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
              <span className="text-right text-[14px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>激活码单价：</span>
              <input value={unitPrice} onChange={(event) => setUnitPrice(event.currentTarget.value)} placeholder="请输入激活码单价（元）" type="number" min="0" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#c5cbd2] focus:border-[#278fee]" />
            </label>
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-[#e7e9ec] px-7 py-4">
          <button type="button" onClick={onClose} className="h-11 rounded-[3px] border border-[#d7dce3] bg-white px-6 text-[14px] text-[#4a5563] hover:bg-[#f6f8fa]">取消</button>
          <button type="button" disabled={!ready} onClick={createRecord} className="h-11 rounded-[3px] bg-[#278fee] px-7 text-[14px] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc] disabled:cursor-not-allowed disabled:bg-[#d8dadd]">生成</button>
        </footer>
      </section>
    </div>
  );
}

export function MembershipActivationPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig }: MembershipActivationPageProps) {
  const [records, setRecords] = useState(INITIAL_ACTIVATION_RECORDS);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRecords = useMemo(() => {
    const query = submittedSearch.trim();
    if (!query) return records;
    return records.filter((record) => `${record.id}${record.name}`.includes(query));
  }, [records, submittedSearch]);

  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="活动列表" onNavigate={handleNavigate} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <section className="overflow-hidden rounded-[2px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <header className="flex items-center justify-between border-b border-[#e8edf3] px-8 py-5">
              <h1 className="text-[18px] font-semibold text-[#283244]">激活码活动列表</h1>
              <button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex h-11 items-center gap-1.5 rounded-[3px] bg-[#278fee] px-5 text-[14px] font-medium text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]"><KeyRound className="h-4 w-4" />添加激活码活动</button>
            </header>

            <div className="px-8 py-7">
              <div className="flex max-w-[520px]">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b3bbc5]" />
                  <input value={search} onChange={(event) => setSearch(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') setSubmittedSearch(search); }} placeholder="输入活动名称/ID" className="h-11 w-full rounded-l-[3px] border border-[#d7dce3] pl-9 pr-3 text-[14px] outline-none placeholder:text-[#c5cbd2] focus:border-[#278fee]" />
                </div>
                <button type="button" onClick={() => setSubmittedSearch(search)} className="h-11 rounded-r-[3px] bg-[#278fee] px-6 text-[14px] font-medium text-white hover:bg-[#167fdc]">搜索</button>
              </div>
            </div>

            <div className="mx-8 mb-8 overflow-x-auto border-t border-[#f0f2f5]">
              <table className="min-w-[1380px] w-full table-fixed border-collapse text-[14px] text-[#424a55]">
                <thead>
                  <tr className="h-16 bg-[#fafbfc] text-[#303943]">
                    <th className="w-[6%] px-3 font-medium">ID</th>
                    <th className="w-[16%] px-3 font-medium">活动名称</th>
                    <th className="w-[10%] px-3 font-medium">会员<br />类型</th>
                    <th className="w-[8%] px-3 font-medium">会员<br />时长</th>
                    <th className="w-[12%] px-3 font-medium">渠道<br />商</th>
                    <th className="w-[9%] px-3 font-medium">生成数<br />量</th>
                    <th className="w-[7%] px-3 font-medium">状<br />态</th>
                    <th className="w-[10%] px-3 font-medium">已使用/<br />生成总数</th>
                    <th className="w-[12%] bg-[#f6f7f8] px-3 font-medium">创建时间 <span className="text-[#278fee]">↕</span></th>
                    <th className="w-[8%] px-3 font-medium">创建人</th>
                    <th className="w-[16%] px-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="h-[108px] border-b border-[#edf0f4] text-center">
                      <td className="px-3">{record.id}</td>
                      <td className="px-3 text-left">{record.name}</td>
                      <td className="whitespace-pre-line px-3">{record.memberType.replace('（', '\n（')}</td>
                      <td className="px-3">{record.duration}</td>
                      <td className="whitespace-pre-line px-3">{record.channel.replace('-', '\n-')}</td>
                      <td className="px-3"><span className="rounded-[3px] border border-[#ffb18d] px-2 py-1 text-[#ff875c]">{record.generated}</span></td>
                      <td className="whitespace-pre-line px-3">{record.status.replace('已生成', '已\n生成')}</td>
                      <td className="px-3">{record.used}/{record.generated}</td>
                      <td className="whitespace-pre-line bg-[#fafbfc] px-3">{record.createdAt.replace(' ', '\n')}</td>
                      <td className="px-3">{record.creator}</td>
                      <td className="px-3"><div className="flex items-center justify-center gap-3 whitespace-nowrap"><button type="button" className="h-10 rounded-[3px] border border-[#d7dce3] bg-white px-3 text-[13px] text-[#4a5563] hover:border-[#278fee] hover:text-[#278fee]">激活码详情</button><button type="button" className="h-10 rounded-[3px] bg-[#278fee] px-4 text-[13px] text-white hover:bg-[#167fdc]">修改</button><button type="button" className="h-10 rounded-[3px] bg-[#278fee] px-4 text-[13px] text-white hover:bg-[#167fdc]">下载</button></div></td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 ? <tr><td colSpan={11} className="py-16 text-center text-[#8b95a2]">暂无符合条件的激活码活动</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {isModalOpen ? <AddActivationModal onClose={() => setIsModalOpen(false)} onCreate={(record) => { setRecords((current) => [record, ...current]); setIsModalOpen(false); }} /> : null}
    </div>
  );
}
