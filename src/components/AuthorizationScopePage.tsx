import { useState } from 'react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';

type AuthorizationScopePageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
};

const MEMBER_TYPES = [
  '个人版VIP', '基础版VIP', '基础团队版VIP', '加强版VIP', '协作版VIP', '全用途版VIP', '标准团队版VIP', '高级团队版VIP', '企业专业版VIP',
  '基础版VIP', '全用途版VIP', '标准团队版VIP', '高级团队版VIP', '企业专业版', '新媒体商户版', '全用途商户版', '团队协作版', '标准版(个人)',
  '标准版(企业)', '个人高级版', '企业高级版', '高级版', '标准版(大企业)', '高级版(大企业)', '协作版', '高级版(团队)', '专业版(团队)', '至尊版(团队)',
  '通用版(个人)', '通用版(企业)', '基础版(单人)', '高级版(单人)', '专业版(单人)', '至尊版(单人)', '旗舰版',
];

type ScopeItem = {
  title: string;
  description: string;
  agreementVisible: boolean;
};

const INITIAL_SCOPE_ITEMS: ScopeItem[] = [
  { title: '新媒体配图', description: '微信公众号、企业微信红包封面、小程序、今日头条、百度问答、知乎问答、抖音、快手等新媒体平台配图', agreementVisible: true },
  { title: '网站及应用程序', description: '网页设计、APP设计、皮肤/主题、H5、微信/微博配图、电邮（非广告性质）等', agreementVisible: true },
  { title: '电商用途', description: '淘宝、京东、天猫、有赞、拼多多、美团、饿了么、小红书、微商城、在线教育等第三方电商平台用图', agreementVisible: true },
  { title: '推广及线上媒体广告', description: '网站、网店站外推广（百度推广、淘宝直通车等）、通过线上媒体渠道投放的平面及视频广告', agreementVisible: true },
  { title: '网络视频用途', description: '网络视频等媒体播放平台，如抖音、优酷、YouTube、微信视频号等（预算在 10 万元以内）', agreementVisible: false },
  { title: '网络视频用途', description: '网络视频等媒体播放平台，如抖音、优酷、YouTube、微信视频号等', agreementVisible: true },
];

function AgreementSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" aria-label={checked ? '已在会员协议显示' : '未在会员协议显示'} onClick={onChange} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${checked ? 'bg-[#278fee]' : 'bg-[#c5c9ce]'}`}>
      <span className={`h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)] transition ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function AuthorizationScopePage({ onBackToDirectory, onNavigateToSkillConfig, onNavigateToGuidedSearch, onNavigateToMembershipPackages, onNavigateToMembershipPageConfig }: AuthorizationScopePageProps) {
  const [saleType, setSaleType] = useState<'member' | 'retail'>('member');
  const [selectedMemberType, setSelectedMemberType] = useState(MEMBER_TYPES[0]);
  const [scopeItems, setScopeItems] = useState(INITIAL_SCOPE_ITEMS);

  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };

  const toggleScope = (index: number) => {
    setScopeItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, agreementVisible: !item.agreementVisible } : item));
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#30343b]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="授权范围设置" onNavigate={handleNavigate} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5">
          <section className="overflow-hidden rounded-[2px] bg-white shadow-[0_2px_8px_rgba(44,57,83,.04)]">
            <header className="border-b border-[#e8edf3] px-8 py-5"><h1 className="text-[18px] font-semibold text-[#283244]">授权范围设置</h1></header>

            <div className="m-5 overflow-hidden border border-[#edf0f4]">
              <div className="border-b border-[#edf0f4] px-4 py-4 text-[15px] font-semibold text-[#303943]">授权属性</div>
              <div className="space-y-5 px-4 py-4">
                <div className="flex flex-wrap items-start gap-4 text-[14px]">
                  <span className="w-[72px] shrink-0 pt-2 text-[#424a55]">售卖类型：</span>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setSaleType('member')} className={`rounded-[4px] border px-3 py-2 transition ${saleType === 'member' ? 'border-[#278fee] bg-[#278fee] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)]' : 'border-[#e1e5ea] bg-white text-[#4d5664]'}`}>会员售卖</button>
                    <button type="button" onClick={() => setSaleType('retail')} className={`rounded-[4px] border px-3 py-2 transition ${saleType === 'retail' ? 'border-[#278fee] bg-[#278fee] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)]' : 'border-[#e1e5ea] bg-white text-[#4d5664]'}`}>零售</button>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-[14px]">
                  <span className="w-[72px] shrink-0 pt-2 text-[#424a55]">会员类型：</span>
                  <div className="flex flex-wrap gap-2">
                    {MEMBER_TYPES.map((memberType, index) => (
                      <button key={`${memberType}-${index}`} type="button" onClick={() => setSelectedMemberType(memberType)} className={`rounded-[4px] border px-3 py-2 transition ${selectedMemberType === memberType ? 'border-[#278fee] bg-[#278fee] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)]' : 'border-[#e1e5ea] bg-white text-[#4d5664] hover:border-[#b8d7f5] hover:text-[#278fee]'}`}>{memberType}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="m-5 overflow-hidden border border-[#edf0f4]">
              <div className="border-b border-[#edf0f4] px-4 py-4 text-[15px] font-semibold text-[#303943]">授权范围设置</div>
              <div className="space-y-5 px-8 py-6">
                {scopeItems.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="space-y-2 text-[14px] leading-6 text-[#424a55]">
                    <label className="flex cursor-pointer items-start gap-2">
                      <input type="checkbox" defaultChecked={index !== 4} className="mt-1 h-4 w-4 accent-[#278fee]" />
                      <span><strong className="font-medium text-[#303943]">{item.title}</strong><span className="ml-2">{item.description}</span></span>
                    </label>
                    <div className="ml-7 flex items-center gap-2 text-[13px] text-[#303943]">
                      <span>是否在会员协议显示：</span>
                      <AgreementSwitch checked={item.agreementVisible} onChange={() => toggleScope(index)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
