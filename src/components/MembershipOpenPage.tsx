import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';

type MembershipOpenPageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
  onNavigateToRequirement?: (path: string) => void;
};

type MembershipCategory = '个人会员' | '企业会员' | '专业版';
type MembershipPanel = '开通会员' | '购买席位' | '历史记录';

const membershipTypes = ['标准团队版VIP', '通用版（企业）', '协作版', '旗舰版'];

const inputClassName = 'h-[42px] rounded-[3px] border border-[#d9dfe7] bg-white px-3 text-[13px] text-[#303b4d] outline-none transition placeholder:text-[#c6cbd3] focus:border-[#278fee] focus:shadow-[0_0_0_2px_rgba(39,143,238,.08)]';
const selectClassName = `${inputClassName} appearance-none pr-10`;

function FormRow({ label, required = false, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3">
      <span className="text-right text-[13px] text-[#3f4651]">
        {required ? <b className="mr-1 font-normal text-[#ff4d4f]">*</b> : null}
        {label}：
      </span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}

export function MembershipOpenPage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig, onNavigateToRequirement }: MembershipOpenPageProps) {
  const [category, setCategory] = useState<MembershipCategory>('企业会员');
  const [panel, setPanel] = useState<MembershipPanel>('开通会员');
  const [membershipType, setMembershipType] = useState(membershipTypes[0]);
  const [form, setForm] = useState({
    userId: '',
    duration: '',
    memberCount: '',
    paymentStatus: '未支付',
    paymentAmount: '',
    companyName: '',
    reason: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const updateForm = (key: keyof typeof form, value: string) => {
    setSubmitted(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#30343b]">
      <AdminSidebar
        onBackToDirectory={onBackToDirectory}
        activeItem="开通会员"
        onNavigateToRequirement={onNavigateToRequirement}
        onNavigate={handleNavigate}
      />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-[25px] pt-[25px]">
          <div className="mb-4 flex items-center gap-2 text-[13px] text-[#8b9199]">
            <span>会员中心</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#2d2d2d]">开通会员</span>
          </div>

          <section className="min-h-[calc(100vh-130px)] bg-white">
            <div className="border-b border-[#edf0f3] px-[25px] pt-[22px]">
              <h1 className="text-[22px] font-semibold tracking-[-.02em] text-[#252525]">开通会员</h1>
              <div className="mt-5 space-y-1 text-[14px] leading-6 text-[#ff5a5f]">
                <p>开通会员需先在企微提交审批，审批通过后可按照对应要求开通会员。</p>
                <p>当前在售所有会员均在「企业会员」目录下开通，根据需求选择会员类型<span className="text-[17px] font-semibold">通用版（个人）、通用版（企业）、协作版、旗舰版</span>进行开通。</p>
              </div>
              <div className="mt-7 flex items-end gap-8">
                {(['个人会员', '企业会员', '专业版'] as MembershipCategory[]).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`relative pb-3 text-[15px] transition ${category === item ? 'font-medium text-[#278fee]' : 'text-[#333] hover:text-[#278fee]'}`}
                  >
                    {item}
                    {category === item ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#278fee]" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="mx-[25px] mt-8 border border-[#f0f1f3] bg-white">
              <div className="flex h-[58px] items-end gap-8 border-b border-[#edf0f3] px-8">
                {(['开通会员', '购买席位', '历史记录'] as MembershipPanel[]).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setPanel(item)}
                    className={`relative pb-[17px] text-[15px] transition ${panel === item ? 'font-medium text-[#278fee]' : 'text-[#333] hover:text-[#278fee]'}`}
                  >
                    {item}
                    {panel === item ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#278fee]" /> : null}
                  </button>
                ))}
              </div>

              {panel === '开通会员' ? (
                <form
                  className="px-8 pb-12 pt-11"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="max-w-[590px] space-y-7">
                    <FormRow label="用户ID" required>
                      <div className="flex">
                        <input value={form.userId} onChange={(event) => updateForm('userId', event.currentTarget.value)} placeholder="请输入用户ID" className={`${inputClassName} min-w-0 flex-1 rounded-r-none`} />
                        <button type="button" disabled className="h-[42px] shrink-0 rounded-r-[3px] bg-[#d9d9d9] px-5 text-[13px] text-white">确认ID信息</button>
                      </div>
                    </FormRow>

                    <FormRow label="会员类型" required>
                      <div className="relative w-[185px]">
                        <select value={membershipType} onChange={(event) => setMembershipType(event.currentTarget.value)} className={`${selectClassName} w-full`}>
                          {membershipTypes.map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7afb9]" />
                      </div>
                    </FormRow>

                    <FormRow label="会员时长" required>
                      <input value={form.duration} onChange={(event) => updateForm('duration', event.currentTarget.value)} placeholder="请输入开通会员时长的天数（天）" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <FormRow label="成员人数" required>
                      <input value={form.memberCount} onChange={(event) => updateForm('memberCount', event.currentTarget.value)} placeholder="请输入成员人数（人）" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <FormRow label="支付状态" required>
                      <div className="relative w-[185px]">
                        <select value={form.paymentStatus} onChange={(event) => updateForm('paymentStatus', event.currentTarget.value)} className={`${selectClassName} w-full`}>
                          <option>未支付</option>
                          <option>已支付</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7afb9]" />
                      </div>
                    </FormRow>

                    <FormRow label="支付金额" required>
                      <input value={form.paymentAmount} onChange={(event) => updateForm('paymentAmount', event.currentTarget.value)} placeholder="请输入支付金额（元）" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <FormRow label="开通公司名称">
                      <input value={form.companyName} onChange={(event) => updateForm('companyName', event.currentTarget.value)} placeholder="请输入公司名称" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <FormRow label="开通原因" required>
                      <input value={form.reason} onChange={(event) => updateForm('reason', event.currentTarget.value)} placeholder="请输入企业微信中会员开通的审批号" className={`${inputClassName} w-[425px] max-w-full`} />
                    </FormRow>

                    <div className="pl-[125px] pt-1">
                      <button type="submit" className="h-[42px] rounded-[3px] bg-[#278fee] px-7 text-[14px] text-white shadow-[0_3px_8px_rgba(39,143,238,.15)] transition hover:bg-[#167fdc]">开通</button>
                      {submitted ? <span className="ml-4 text-[12px] text-[#2b9a66]">已提交开通申请</span> : null}
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex min-h-[530px] items-center justify-center text-[14px] text-[#9aa3af]">暂无{panel}记录</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
