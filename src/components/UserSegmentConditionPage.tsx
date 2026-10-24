import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { CsvCheckboxGroup, CsvSelect, MEMBER_LEVEL_OPTIONS, MEMBER_TYPE_OPTIONS } from './UserSegmentPage';

type UserSegmentConditionPageProps = {
  mode: 'rule' | 'custom';
  onBackToDirectory: () => void;
  onBackToUserSegments: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
};

const IDENTITY_OPTIONS = [
  { value: 'unlimited', label: '不限制' },
  { value: 'member', label: '是会员用户' },
  { value: 'member-level', label: '是会员用户（按等级）' },
  { value: 'non-member', label: '不是会员用户' },
  { value: 'non-member-level', label: '不是会员用户（按等级）' },
];

function ConditionSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <CsvSelect value={value} onChange={onChange} className="max-w-[360px]">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </CsvSelect>
  );
}

function UserSegmentConditionPage({ mode, onBackToDirectory, onBackToUserSegments, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig }: UserSegmentConditionPageProps) {
  const [groupName, setGroupName] = useState('');
  const [registrationCondition, setRegistrationCondition] = useState('不限制');
  const [memberIdentity, setMemberIdentity] = useState('unlimited');
  const [previousIdentity, setPreviousIdentity] = useState('之前是会员');
  const [memberTypes, setMemberTypes] = useState<string[]>([]);
  const [activeBehavior, setActiveBehavior] = useState('不限');
  const [paidBehavior, setPaidBehavior] = useState('不限');
  const [platform, setPlatform] = useState('不限');
  const [registrationSource, setRegistrationSource] = useState('不限');
  const [loginStatus, setLoginStatus] = useState('不限');
  const [userIndustry, setUserIndustry] = useState('');
  const [designPurpose, setDesignPurpose] = useState('');
  const [message, setMessage] = useState('');

  const isMember = memberIdentity === 'member';
  const isMemberLevel = memberIdentity === 'member-level';
  const isPreviousMember = memberIdentity === 'non-member-level';
  const hasMemberCondition = isMember || isMemberLevel || isPreviousMember;

  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };

  const complete = () => {
    if (!groupName.trim()) return;
    setMessage(`${mode === 'rule' ? '规则分群' : '定制分群条件'}已保存`);
    window.setTimeout(() => setMessage(''), 2200);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="用户分群" onNavigate={handleNavigate} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <section className="min-h-[650px] overflow-hidden rounded-[2px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <div className="px-5 pt-5">
              <div className="flex items-center gap-2 text-[16px] text-[#98a2b2]">
                <button type="button" onClick={onBackToUserSegments} className="transition hover:text-[#278fee]">用户分群</button>
                <ChevronRight className="h-4 w-4" />
                <span className="text-[#4d5b70]">新建分群</span>
              </div>
            </div>

            <div className="px-8 pb-10 pt-5 sm:px-10">
              <div className="max-w-[900px] space-y-4">
                <div className="grid grid-cols-[120px_360px_84px] items-center gap-3">
                  <label htmlFor="segment-name" className="text-right text-[15px] text-[#30343b]"><i className="mr-1 not-italic text-[#ff4d5a]">*</i>分群名称：</label>
                  <input id="segment-name" value={groupName} onChange={(event) => setGroupName(event.currentTarget.value)} placeholder="请输入分群名称" className="h-10 rounded-[3px] border border-[#d7dce3] px-3 text-[15px] outline-none placeholder:text-[#c8cbd0] focus:border-[#278fee]" />
                  <button type="button" disabled={!groupName.trim()} onClick={complete} className="h-10 rounded-[3px] border border-[#d9dde2] bg-[#f5f6f7] text-[14px] text-[#c4c7ca] transition enabled:border-[#278fee] enabled:bg-[#278fee] enabled:text-white enabled:hover:bg-[#167fdc]">完成</button>
                </div>

                <div className="grid grid-cols-[120px_360px] items-center gap-3">
                  <span className="text-right text-[15px]">注册条件：</span>
                  <ConditionSelect value={registrationCondition} onChange={setRegistrationCondition} options={['不限制', '已注册', '未注册']} />
                </div>

                <div className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3">
                  <span className="pt-2 text-right text-[15px]">会员身份：</span>
                  <div className="space-y-4">
                    <CsvSelect value={memberIdentity} onChange={setMemberIdentity} className="max-w-[360px]">
                      {IDENTITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </CsvSelect>

                    {isPreviousMember ? (
                      <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
                        <span className="text-right text-[15px]">用户之前的身份：</span>
                        <ConditionSelect value={previousIdentity} onChange={setPreviousIdentity} options={['不限制', '一直是免费会员', '之前是会员']} />
                      </div>
                    ) : null}

                    {hasMemberCondition ? (
                      <CsvCheckboxGroup
                        label="会员类型"
                        options={isMember ? MEMBER_TYPE_OPTIONS : MEMBER_LEVEL_OPTIONS}
                        value={memberTypes}
                        onChange={setMemberTypes}
                        dense={isMemberLevel || isPreviousMember}
                      />
                    ) : null}
                  </div>
                </div>

                {mode === 'rule' ? (
                  <>
                    <div className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">活跃行为：</span>
                      <ConditionSelect value={activeBehavior} onChange={setActiveBehavior} options={['不限', '活跃用户', '非活跃用户']} />
                    </div>
                    <div className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">付费行为：</span>
                      <ConditionSelect value={paidBehavior} onChange={setPaidBehavior} options={['不限', '付费用户', '未付费用户']} />
                    </div>
                    <div className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">注册来源：</span>
                      <ConditionSelect value={registrationSource} onChange={setRegistrationSource} options={['不限', '自然注册', '邀请注册', '活动注册']} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">活跃行为：</span>
                      <ConditionSelect value={activeBehavior} onChange={setActiveBehavior} options={['不限', '活跃用户', '非活跃用户']} />
                    </div>
                    <div className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">所在平台：</span>
                      <ConditionSelect value={platform} onChange={setPlatform} options={['不限', '网页端', '移动端', '小程序']} />
                    </div>
                    <div className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">注册来源：</span>
                      <ConditionSelect value={registrationSource} onChange={setRegistrationSource} options={['不限', '自然注册', '邀请注册', '活动注册']} />
                    </div>
                    <div className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">登录状态：</span>
                      <ConditionSelect value={loginStatus} onChange={setLoginStatus} options={['不限', '已登录', '未登录']} />
                    </div>
                    <label className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">用户行业：</span>
                      <input value={userIndustry} onChange={(event) => setUserIndustry(event.currentTarget.value)} className="h-10 rounded-[3px] border border-[#d7dce3] px-3 text-[15px] outline-none focus:border-[#278fee]" />
                    </label>
                    <label className="grid grid-cols-[120px_360px] items-center gap-3">
                      <span className="text-right text-[15px]">设计用途：</span>
                      <input value={designPurpose} onChange={(event) => setDesignPurpose(event.currentTarget.value)} className="h-10 rounded-[3px] border border-[#d7dce3] px-3 text-[15px] outline-none focus:border-[#278fee]" />
                    </label>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      {message ? <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-[4px] bg-[#263247] px-4 py-2 text-[12px] text-white shadow-[0_6px_18px_rgba(25,38,58,.25)]">{message}</div> : null}
    </div>
  );
}

export function NewRuleUserSegmentPage(props: Omit<UserSegmentConditionPageProps, 'mode'>) {
  return <UserSegmentConditionPage {...props} mode="rule" />;
}

export function CustomUserSegmentPage(props: Omit<UserSegmentConditionPageProps, 'mode'>) {
  return <UserSegmentConditionPage {...props} mode="custom" />;
}
