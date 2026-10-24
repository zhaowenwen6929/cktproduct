import { useState } from 'react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';
import { RequirementHint, type RequirementSection } from './MembershipPackagePage';

type AuthorizationScopePageProps = {
  onBackToDirectory: () => void;
  onNavigateToSkillConfig?: () => void;
  onNavigateToGuidedSearch?: () => void;
  onNavigateToMembershipPackages?: () => void;
  onNavigateToMembershipPageConfig?: () => void;
};

const EXISTING_MEMBER_TYPES = [
  '个人版VIP', '基础版VIP', '基础团队版VIP', '加强版VIP', '协作版VIP', '全用途版VIP', '标准团队版VIP', '高级团队版VIP', '企业专业版VIP',
  '基础版VIP', '全用途版VIP', '标准团队版VIP', '高级团队版VIP', '企业专业版', '新媒体商户版', '全用途商户版', '团队协作版', '标准版(个人)',
  '标准版(企业)', '个人高级版', '企业高级版', '高级版', '标准版(大企业)', '高级版(大企业)', '协作版', '高级版(团队)', '专业版(团队)', '至尊版(团队)',
  '通用版(个人)', '通用版(企业)', '基础版(单人)', '高级版(单人)', '专业版(单人)', '至尊版(单人)', '旗舰版',
];
const NEW_MEMBER_TYPES = ['基础版（个人） 240', '专业版（个人） 241', '基础版（企业） 310', '专业版（企业） 311', '旗舰版（企业） 220'];
const MEMBER_TYPES = [...EXISTING_MEMBER_TYPES, ...NEW_MEMBER_TYPES];

type ScopeItem = {
  title: string;
  description: string;
  enabled: boolean;
  agreementVisible: boolean;
};

type ScopeSection = {
  title: string;
  items: ScopeItem[];
};

const createDefaultScopeSections = (): ScopeSection[] => [
  {
    title: '线上推广用途',
    items: [
      { title: '新媒体配图', description: '微信公众号、企业微信红包封面、小程序、今日头条、百度问答、知乎问答、抖音、快手等新媒体平台配图', enabled: true, agreementVisible: true },
      { title: '网站及应用程序', description: '网页设计、APP设计、皮肤/主题、H5、微信/微博配图、电邮（非广告性质）等', enabled: true, agreementVisible: true },
      { title: '电商用途', description: '淘宝、京东、天猫、有赞、拼多多、美团、饿了么、小红书、微商城、在线教育等第三方电商平台用图', enabled: true, agreementVisible: true },
      { title: '推广及线上媒体广告', description: '网站、网店站外推广（百度推广、淘宝直通车等）、通过线上媒体渠道投放的平面及视频广告', enabled: true, agreementVisible: true },
      { title: '网络视频用途', description: '网络视频等媒体播放平台，如抖音、优酷、YouTube、微信视频号等（预算在 10 万元以内）', enabled: false, agreementVisible: false },
      { title: '网络视频用途', description: '网络视频等媒体播放平台，如抖音、优酷、YouTube、微信视频号等', enabled: true, agreementVisible: true },
    ],
  },
  {
    title: '线下印刷用途',
    items: [
      { title: '商业提案（非转售）', description: '网络设计、VI设计、项目营销策划等提案', enabled: true, agreementVisible: true },
      { title: '线下印刷', description: '书籍、杂志、广告海报、宣传册、折页、门店陈设、门店商业显示屏投放等；纺织品、手机壳、贺卡、明信片、日历、杯子、T恤、抱枕、箱包等非转售印刷品（印刷数量60万份以内）', enabled: true, agreementVisible: true },
      { title: '线下印刷', description: '书籍、杂志、广告海报、宣传册、折页、门店陈设、门店商业显示屏投放等；纺织品、手机壳、贺卡、明信片、日历、杯子、T恤、抱枕、箱包等非转售印刷品', enabled: false, agreementVisible: false },
      { title: '图书出版', description: '报纸配图、杂志封面及配图、图书封面及配图（出版数量60万份以内）', enabled: true, agreementVisible: true },
      { title: '图书出版', description: '报纸配图、杂志封面及配图、图书封面及配图', enabled: false, agreementVisible: false },
      { title: '办公用途', description: '行政公文、工作汇报、市场及行业报告、企业V1、宣传册、宣传语、标准字、楼书、企业内刊等设计用途（商标、LOGO除外）', enabled: true, agreementVisible: true },
      { title: '户外广告（大牌广告除外）', description: '对外发布的户外广告（宣传册、海报、报纸杂志广告、楼宇、车身、灯箱、围挡、橱窗、公共场所陈列等）', enabled: true, agreementVisible: true },
    ],
  },
  {
    title: '禁用',
    items: [
      { title: '户外广告牌', description: '制作户外广告牌', enabled: false, agreementVisible: true },
      { title: '网络转售', description: '软件程序、课件、教学视频、APP皮肤/主题、设计模板、H5模板、PPT模板、屏幕保护程序', enabled: false, agreementVisible: true },
      { title: '包装设计用途', description: '用于市场流通的食品、日用百货、电器等各类实物产品的包装', enabled: false, agreementVisible: true },
      { title: '商标注册', description: '制作及注册商标、LOGO', enabled: false, agreementVisible: true },
      { title: 'AI数据训练', description: '用于训练AI各类人工智能模型', enabled: false, agreementVisible: true },
      { title: '敏感行业用途', description: '用于制作药物、保健品和烟草行业；用于成人娱乐、约会婚恋等敏感类广告宣传', enabled: false, agreementVisible: true },
    ],
  },
];

const INITIAL_SCOPE_SECTIONS = createDefaultScopeSections();
const AUTHORIZATION_SCOPE_REQUIREMENT_SECTIONS: RequirementSection[] = [
  { title: '功能说明', items: ['授权范围按会员等级分别配置，切换会员等级后展示并维护对应的授权范围。'] },
  { title: '新增会员', items: ['基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）220。'] },
  { title: '授权范围配置', items: ['每个新增会员均配置线上推广用途、线下印刷用途和禁用三类授权范围。', '每条范围支持单独启用/停用，并配置是否在会员协议显示。'] },
];
const AUTHORIZATION_SCOPE_REQUIREMENT = AUTHORIZATION_SCOPE_REQUIREMENT_SECTIONS.flatMap((section) => section.items).join(' ');

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
  const [scopeConfigs, setScopeConfigs] = useState<Record<string, ScopeSection[]>>(() => Object.fromEntries(NEW_MEMBER_TYPES.map((memberType) => [memberType, createDefaultScopeSections()])));
  const selectedScopeSections = scopeConfigs[selectedMemberType] ?? INITIAL_SCOPE_SECTIONS;

  const handleNavigate = (item: string) => {
    if (item === 'AI电商配置') onNavigateToSkillConfig?.();
    if (item === '搜索引导管理') onNavigateToGuidedSearch?.();
    if (item === '会员套餐管理') onNavigateToMembershipPackages?.();
    if (item === '会员页面配置') onNavigateToMembershipPageConfig?.();
  };

  const updateSelectedScope = (sectionIndex: number, itemIndex: number, key: 'enabled' | 'agreementVisible') => {
    setScopeConfigs((current) => {
      const selectedSections = current[selectedMemberType] ?? createDefaultScopeSections();
      return {
        ...current,
        [selectedMemberType]: selectedSections.map((section, currentSectionIndex) => currentSectionIndex === sectionIndex ? {
          ...section,
          items: section.items.map((item, currentItemIndex) => currentItemIndex === itemIndex ? { ...item, [key]: !item[key] } : item),
        } : section),
      };
    });
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
                    {EXISTING_MEMBER_TYPES.map((memberType, index) => (
                      <button key={`${memberType}-${index}`} type="button" onClick={() => setSelectedMemberType(memberType)} className={`rounded-[4px] border px-3 py-2 transition ${selectedMemberType === memberType ? 'border-[#278fee] bg-[#278fee] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)]' : 'border-[#e1e5ea] bg-white text-[#4d5664] hover:border-[#b8d7f5] hover:text-[#278fee]'}`}>{memberType}</button>
                    ))}
                    <div className="relative mt-1 w-full rounded-[5px] border border-dashed border-[#ff665b] bg-[#fff7f5] px-3 pb-3 pt-4">
                      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2"><RequirementHint text={AUTHORIZATION_SCOPE_REQUIREMENT} requirementName="授权范围设置新增新会员等级" sections={AUTHORIZATION_SCOPE_REQUIREMENT_SECTIONS} /></div>
                      <div className="flex flex-wrap gap-2">
                        {NEW_MEMBER_TYPES.map((memberType) => (
                          <button key={memberType} type="button" onClick={() => setSelectedMemberType(memberType)} className={`rounded-[4px] border px-3 py-2 transition ${selectedMemberType === memberType ? 'border-[#278fee] bg-[#278fee] text-white shadow-[0_3px_8px_rgba(39,143,238,.16)]' : 'border-[#e1e5ea] bg-white text-[#4d5664] hover:border-[#ffb0a8] hover:text-[#e05252]'}`}>{memberType}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="m-5 overflow-hidden border border-[#edf0f4]">
              <div className="flex items-center justify-between border-b border-[#edf0f4] px-4 py-4 text-[15px] font-semibold text-[#303943]"><span>授权范围设置</span><span className="text-[12px] font-normal text-[#8b95a2]">当前会员：{selectedMemberType}</span></div>
              <div className="space-y-5 px-8 py-6">
                {selectedScopeSections.map((section, sectionIndex) => (
                  <div key={section.title} className="border-b border-[#edf0f4] pb-5 last:border-b-0 last:pb-0">
                    <h2 className="mb-4 text-[16px] font-semibold text-[#303943]">【{section.title}】</h2>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={`${item.title}-${itemIndex}`} className="space-y-2 text-[14px] leading-6 text-[#424a55]">
                          <label className="flex cursor-pointer items-start gap-2">
                            <input type="checkbox" checked={item.enabled} onChange={() => updateSelectedScope(sectionIndex, itemIndex, 'enabled')} className="mt-1 h-4 w-4 accent-[#278fee]" />
                            <span><strong className="font-medium text-[#303943]">{item.title}</strong><span className="ml-2">{item.description}</span></span>
                          </label>
                          <div className="ml-7 flex items-center gap-2 text-[13px] text-[#303943]">
                            <span>是否在会员协议显示：</span>
                            <AgreementSwitch checked={item.agreementVisible} onChange={() => updateSelectedScope(sectionIndex, itemIndex, 'agreementVisible')} />
                          </div>
                        </div>
                      ))}
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
