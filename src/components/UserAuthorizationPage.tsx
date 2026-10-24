import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { MEMBER_TYPE_REQUIREMENT, MEMBER_TYPE_REQUIREMENT_SECTIONS, RequirementEntryFrame, RequirementHint } from './MembershipPackagePage';

type UserAuthorizationPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
};

type AuthorizationRecord = {
  userId: string;
  source: string;
  benefitLevel: string;
  seats: string;
  duration: string;
  openedAt: string;
  benefitStatus: '生效中' | '已失效';
  authorizationStatus: '个人' | '企业';
};

const EXISTING_BENEFIT_LEVEL_OPTIONS = [
  '基础版VIP',
  '协作版VIP',
  '高级团队版VIP',
  '个人版VIP',
  '标准团队版VIP',
  '企业专业版VIP',
  '加强版VIP',
  '基础团队版VIP',
  '全用途版VIP',
  '高级团队版VIP',
  '基础版（单人）',
  '高级版（单人）',
  '专业版（单人）',
  '旗舰版（企业）',
];
const NEW_BENEFIT_LEVEL_OPTIONS = ['基础版（个人） 240', '专业版（个人） 241', '基础版（企业） 310', '专业版（企业） 311', '旗舰版（企业） 220'];

const AUTHORIZATION_RECORDS: AuthorizationRecord[] = [
  { userId: '121904831', source: '主站/WPS', benefitLevel: '基础版VIP', seats: '1', duration: '31', openedAt: '2026-04-30 15:08:16', benefitStatus: '已失效', authorizationStatus: '个人' },
  { userId: '121904831', source: '主站/WPS', benefitLevel: '协作版VIP', seats: '1', duration: '31', openedAt: '2026-09-25 01:27:32', benefitStatus: '生效中', authorizationStatus: '个人' },
  { userId: '16535727', source: '主站/WPS', benefitLevel: '个人版VIP', seats: '1', duration: '365', openedAt: '2021-03-24 11:05:18', benefitStatus: '已失效', authorizationStatus: '个人' },
  { userId: '86948007', source: '主站/WPS', benefitLevel: '基础版（单人）', seats: '1', duration: '365', openedAt: '2026-05-19 15:59:10', benefitStatus: '生效中', authorizationStatus: '个人' },
  { userId: '16535727', source: '主站/WPS', benefitLevel: '高级版（单人）', seats: '1', duration: '365', openedAt: '2026-09-25 01:34:30', benefitStatus: '生效中', authorizationStatus: '个人' },
  { userId: '127013838', source: '主站/WPS', benefitLevel: '基础版（单人）', seats: '1', duration: '91', openedAt: '2026-09-23 15:01:53', benefitStatus: '生效中', authorizationStatus: '个人' },
];

function FilterSelect({ value, onChange, placeholder, options }: { value: string; onChange: (value: string) => void; placeholder: string; options: string[] }) {
  return (
    <div className="relative min-w-0">
      <select value={value} onChange={(event) => onChange(event.currentTarget.value)} className="h-11 w-full appearance-none rounded-[3px] border border-[#d7dce3] bg-white px-3 pr-9 text-[14px] text-[#30343b] outline-none transition focus:border-[#278fee]">
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a6adb7]" />
    </div>
  );
}

function DateRangeFilter({ start, end, onStartChange, onEndChange }: { start: string; end: string; onStartChange: (value: string) => void; onEndChange: (value: string) => void }) {
  return (
    <div className="flex h-11 min-w-0 items-center rounded-[3px] border border-[#d7dce3] bg-white px-3 text-[14px] text-[#9da5af] focus-within:border-[#278fee]">
      <div className="relative min-w-0 flex-1">
        <input aria-label="开始日期" type="date" value={start} onChange={(event) => onStartChange(event.currentTarget.value)} className="h-9 w-full min-w-0 bg-transparent pr-5 text-[13px] text-[#4a5563] outline-none [color-scheme:light]" />
        {!start ? <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#b7bdc5]">开始日期</span> : null}
      </div>
      <span className="px-2 text-[#a4acb5]">→</span>
      <div className="relative min-w-0 flex-1">
        <input aria-label="结束日期" type="date" value={end} onChange={(event) => onEndChange(event.currentTarget.value)} className="h-9 w-full min-w-0 bg-transparent pr-5 text-[13px] text-[#4a5563] outline-none [color-scheme:light]" />
        {!end ? <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#b7bdc5]">结束日期</span> : null}
      </div>
      <CalendarDays className="ml-2 h-4 w-4 shrink-0 text-[#a6adb7]" />
    </div>
  );
}

export function UserAuthorizationPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig }: UserAuthorizationPageProps) {
  const [type, setType] = useState('会员');
  const [benefitLevel, setBenefitLevel] = useState('');
  const [benefitStatus, setBenefitStatus] = useState('');
  const [authorizationStatus, setAuthorizationStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [nameOrCompany, setNameOrCompany] = useState('');
  const [identityCode, setIdentityCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [openedStart, setOpenedStart] = useState('');
  const [openedEnd, setOpenedEnd] = useState('');
  const [expiryStart, setExpiryStart] = useState('');
  const [expiryEnd, setExpiryEnd] = useState('');
  const [benefitDropdownOpen, setBenefitDropdownOpen] = useState(false);

  const records = useMemo(() => AUTHORIZATION_RECORDS.filter((record) => {
    const matches = (value: string, query: string) => !query || value.includes(query.trim());
    const openedDate = record.openedAt.slice(0, 10);
    return (
      (type === '' || type === '会员') &&
      matches(record.benefitLevel, benefitLevel) &&
      matches(record.benefitStatus, benefitStatus) &&
      matches(record.authorizationStatus, authorizationStatus) &&
      matches(record.userId, userId) &&
      matches(`${record.userId}${record.source}`, nameOrCompany) &&
      matches(`${record.source}${record.authorizationStatus}`, identityCode) &&
      matches(record.userId, phone) &&
      matches(record.source, email) &&
      (!openedStart || openedDate >= openedStart) &&
      (!openedEnd || openedDate <= openedEnd) &&
      (!expiryStart || openedDate >= expiryStart) &&
      (!expiryEnd || openedDate <= expiryEnd)
    );
  }), [authorizationStatus, benefitLevel, benefitStatus, email, expiryEnd, expiryStart, identityCode, nameOrCompany, openedEnd, openedStart, phone, type, userId]);

  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="用户授权信息查看" onNavigate={handleNavigate} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <section className="overflow-hidden rounded-[2px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <header className="border-b border-[#e8edf3] px-8 py-5">
              <h1 className="text-[18px] font-semibold text-[#283244]">用户授权信息管理</h1>
            </header>

            <div className="space-y-4 px-8 py-5">
              <div className="grid grid-cols-[82px_minmax(140px,158px)_112px_minmax(160px,1fr)_112px_minmax(160px,1fr)_112px_minmax(160px,1fr)] items-center gap-x-3 gap-y-3 text-[14px]">
                <span className="text-[#424a55]">全部类型：</span>
                <FilterSelect value={type} onChange={setType} placeholder="全部类型" options={['会员', '零售']} />
                <span className="text-right text-[#424a55]">权益等级/类型：</span>
                <div className="relative">
                  <RequirementEntryFrame className="w-full" text={MEMBER_TYPE_REQUIREMENT} requirementName="用户授权信息查看新增新会员等级" sections={MEMBER_TYPE_REQUIREMENT_SECTIONS}>
                    <button type="button" aria-expanded={benefitDropdownOpen} onClick={() => setBenefitDropdownOpen((open) => !open)} className="flex h-11 w-full items-center justify-between rounded-[3px] border border-[#278fee] bg-white px-3 text-left text-[14px] text-[#a7afb9] outline-none">
                      <span className="truncate">{benefitLevel || '权益等级/...'}</span>
                      <Search className="h-4 w-4 shrink-0 text-[#a6adb7]" />
                    </button>
                  </RequirementEntryFrame>
                  {benefitDropdownOpen ? (
                    <div className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-[250px] w-full overflow-y-auto rounded-[3px] border border-[#dfe4eb] bg-white py-1 shadow-[0_8px_18px_rgba(31,43,61,.16)]">
                      <button type="button" onClick={() => { setBenefitLevel(''); setBenefitDropdownOpen(false); }} className="block w-full px-3 py-2 text-left text-[14px] text-[#4a5563] hover:bg-[#eef6fd]">全部等级</button>
                      {EXISTING_BENEFIT_LEVEL_OPTIONS.map((option) => <button key={option} type="button" onClick={() => { setBenefitLevel(option); setBenefitDropdownOpen(false); }} className={`block w-full px-3 py-2 text-left text-[14px] ${benefitLevel === option ? 'bg-[#eaf5ff] text-[#278fee]' : 'text-[#4a5563] hover:bg-[#eef6fd]'}`}>{option}</button>)}
                      <div className="relative mt-2 rounded-[5px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-1 pb-1 pt-4">
                        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2"><RequirementHint text={MEMBER_TYPE_REQUIREMENT} requirementName="用户授权信息查看新增新会员等级" sections={MEMBER_TYPE_REQUIREMENT_SECTIONS} /></div>
                        {NEW_BENEFIT_LEVEL_OPTIONS.map((option) => <button key={option} type="button" onClick={() => { setBenefitLevel(option); setBenefitDropdownOpen(false); }} className={`block w-full rounded-[2px] px-3 py-2 text-left text-[14px] ${benefitLevel === option ? 'bg-[#ffe6e1] text-[#e05252]' : 'text-[#4a5563] hover:bg-[#fff0ed]'}`}>{option}</button>)}
                      </div>
                    </div>
                  ) : null}
                </div>
                <span className="text-right text-[#424a55]">权益状态：</span>
                <FilterSelect value={benefitStatus} onChange={setBenefitStatus} placeholder="权益状态" options={['生效中', '已失效']} />
                <span className="text-right text-[#424a55]">授权状态：</span>
                <FilterSelect value={authorizationStatus} onChange={setAuthorizationStatus} placeholder="授权状态" options={['个人', '企业']} />
              </div>

              <div className="grid grid-cols-[112px_minmax(140px,1fr)_112px_minmax(140px,1fr)_112px_minmax(140px,1fr)_76px_minmax(140px,1fr)_64px_minmax(140px,1fr)] items-center gap-x-3 text-[14px]">
                <span className="text-right text-[#424a55]">用户ID：</span>
                <input value={userId} onChange={(event) => setUserId(event.currentTarget.value)} placeholder="用户ID" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#b7bdc5] focus:border-[#278fee]" />
                <span className="text-right text-[#424a55]">姓名/公司名称：</span>
                <input value={nameOrCompany} onChange={(event) => setNameOrCompany(event.currentTarget.value)} placeholder="姓名/公司名称" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#b7bdc5] focus:border-[#278fee]" />
                <span className="text-right text-[#424a55]">身份证/信用代码：</span>
                <input value={identityCode} onChange={(event) => setIdentityCode(event.currentTarget.value)} placeholder="身份证/信用代码" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#b7bdc5] focus:border-[#278fee]" />
                <span className="text-right text-[#424a55]">手机号：</span>
                <input value={phone} onChange={(event) => setPhone(event.currentTarget.value)} placeholder="手机号" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#b7bdc5] focus:border-[#278fee]" />
                <span className="text-right text-[#424a55]">邮箱：</span>
                <input value={email} onChange={(event) => setEmail(event.currentTarget.value)} placeholder="邮箱" className="h-11 rounded-[3px] border border-[#d7dce3] px-3 text-[14px] outline-none placeholder:text-[#b7bdc5] focus:border-[#278fee]" />
              </div>

              <div className="grid grid-cols-[112px_minmax(360px,1fr)_130px_minmax(360px,1fr)_84px] items-center gap-x-3 text-[14px]">
                <span className="text-right text-[#424a55]">开通时间范围：</span>
                <DateRangeFilter start={openedStart} end={openedEnd} onStartChange={setOpenedStart} onEndChange={setOpenedEnd} />
                <span className="text-right text-[#424a55]">权益到期时间范围：</span>
                <DateRangeFilter start={expiryStart} end={expiryEnd} onStartChange={setExpiryStart} onEndChange={setExpiryEnd} />
                <button type="button" onClick={() => setBenefitDropdownOpen(false)} className="h-11 rounded-[3px] bg-[#278fee] px-6 text-[14px] font-medium text-white shadow-[0_3px_8px_rgba(39,143,238,.16)] transition hover:bg-[#167fdc]">查询</button>
              </div>
            </div>

            <div className="mx-8 mb-8 overflow-x-auto border-t border-[#edf0f4]">
              <table className="min-w-[1280px] w-full table-fixed border-collapse text-[14px] text-[#424a55]">
                <thead>
                  <tr className="h-14 bg-[#fafbfc] text-[#303943]">
                    <th className="w-[10%] px-3 text-left font-medium">用户ID</th>
                    <th className="w-[11%] px-3 text-left font-medium">用户来源</th>
                    <th className="w-[18%] px-3 text-left font-medium">权益等级/类型</th>
                    <th className="w-[8%] px-3 text-center font-medium">席位数</th>
                    <th className="w-[10%] px-3 text-center font-medium">开通时长</th>
                    <th className="w-[16%] px-3 text-center font-medium">开通时间</th>
                    <th className="w-[10%] px-3 text-center font-medium">权益状态</th>
                    <th className="w-[9%] px-3 text-center font-medium">授权</th>
                    <th className="w-[15%] px-3 text-center font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={`${record.userId}-${record.openedAt}`} className="h-[96px] border-b border-[#edf0f4]">
                      <td className="px-3">{record.userId}</td>
                      <td className="px-3">{record.source}</td>
                      <td className="px-3">{record.benefitLevel}</td>
                      <td className="px-3 text-center">{record.seats}</td>
                      <td className="px-3 text-center">{record.duration}</td>
                      <td className="whitespace-pre-line px-3 text-center">{record.openedAt.replace(' ', '\n')}</td>
                      <td className={`px-3 text-center ${record.benefitStatus === '生效中' ? 'text-[#3f9b69]' : 'text-[#9098a2]'}`}>{record.benefitStatus}</td>
                      <td className="px-3 text-center">{record.authorizationStatus}</td>
                      <td className="px-3 text-center"><div className="flex flex-col items-center gap-2 text-[13px] text-[#278fee]"><button type="button" className="hover:text-[#167fdc]">按公司名称查</button><button type="button" className="hover:text-[#167fdc]">按信用代码查</button></div></td>
                    </tr>
                  ))}
                  {records.length === 0 ? <tr><td colSpan={9} className="py-16 text-center text-[#8b95a2]">暂无符合条件的授权信息</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
