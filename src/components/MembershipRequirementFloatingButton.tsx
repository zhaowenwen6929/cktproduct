import { useEffect, useState } from 'react';
import { Check, Clipboard, FileText, Maximize2, Minimize2, X } from 'lucide-react';

export type MembershipRequirementSection = {
  title: string;
  items: string[];
  highlight?: boolean;
  table?: MembershipRequirementTable;
  highlightTerms?: string[];
};

export type MembershipRequirementTable = {
  columns: string[];
  rows: Array<{ cells: string[]; highlight?: boolean }>;
};

export type MembershipRequirementDocumentMeta = {
  background: string;
  goal: string;
  path: string;
  acceptance: string[];
  verificationNotes: string[];
};

/** V2610 页面新等级与历史会员等级的对照关系。 */
export const MEMBERSHIP_LEVEL_LEGACY_MAPPING: Record<number, number> = {
  240: 230,
  241: 230,
  310: 300,
  311: 301,
  312: 220,
};

export const MEMBERSHIP_UPGRADE_REQUIREMENT_META: MembershipRequirementDocumentMeta = {
  background: '会员体系新增个人与企业会员等级，并新增按时间/按会员组织套餐的展示形式；原补差价升级页的套餐区域无法完整承载新增会员和新增展示方式，用户无法清晰选择对应等级、时长、积分档位和企业席位。当前原型以会员套餐管理页面的本地配置数据模拟后台数据，需求说明必须明确真实字段、固定字典和计算值的边界。',
  goal: '仅改造补差价升级页的套餐显示区域：从会员套餐管理的补差价升级套餐组读取新增会员套餐，支持个人/企业身份、按时间/按会员两种组织方式、积分档位和企业席位计算；下方已有支付区域沿用原能力，仅接收选中的套餐结果，不改动其布局。',
  path: '创客贴前台 > 会员中心 > 常见问题第 8 条 > 补差价升级页（/membership-upgrade）',
  acceptance: [
    '从常见问题第 8 条点击“请点击此处”后进入 /membership-upgrade，页面加载补差价升级套餐数据并按默认展示方式呈现。',
    '页面默认按时间展示，时间条按后台配置的显示顺序排列；空间不足时出现“更多”，点击后可以展开，首个时间项不被裁切。',
    '按会员模式与按时间模式可以互相切换，身份切换和展示方式控制在同一行的右侧悬浮区，不改变当前已选套餐。',
    '个人使用只出现基础版（个人）、专业版（个人），企业使用只出现基础版（企业）、专业版（企业）、旗舰版（企业）。',
    '每个会员等级默认选中第一个可用时间组及其第一个积分档位；选中卡片为蓝色边框，未选中卡片为灰色边框。',
    '同一会员等级、同一时长的不同积分档位切换后，价格、划线原价、每积分价格、积分说明和二维码金额同步变化。',
    '个人套餐价格等于选中套餐的基础价格；企业套餐价格按基础价 +（席位数 - 1）× 单席位价格实时计算。',
    '免费团队席位默认取实际成员数，已购团队会员默认取已购买席位数；减号不能把席位降到最小值，最大席位为 20。',
    '企业席位输入超过 20 人时自动回落到 20 人，并通过 toast 提示“最大购买席位数为20人”；最大购买席位数固定为 20 人。',
    '低于当前会员等级、签约/自动续费不支持购买或其他受限套餐不展示支付二维码，二维码位置显示具体原因，点击按钮有 toast 反馈。',
    '可购买套餐显示实际金额、购买后有效期、支付二维码、支付方式和协议；切换套餐或席位后二维码和有效期同步更新。',
  ],
  verificationNotes: [
    '验证辅助项，不属于补差价升级业务需求：页面提供身份切换，用于模拟免费版、个人会员和企业会员等状态，验证不同会员等级下的展示与购买限制。',
    '验证辅助项，不属于补差价升级业务需求：页面右下角的黄色“需求说明”按钮、V2610 标识和红色虚线框仅用于需求定位与效果验收；红色虚线框只圈选新增/改版的套餐区域，不包含下方已有支付区域。',
    '验证辅助项，不属于补差价升级业务需求：独立页面的返回按钮和不显示会员弹框关闭按钮用于验证页面形态，不扩展为新的会员业务规则。',
  ],
};

export const MEMBERSHIP_CENTER_REQUIREMENT_META: MembershipRequirementDocumentMeta = {
  background: '会员支付弹框同时承载会员身份、个人/企业套餐、积分档位、席位、优惠券和支付信息；用户可能从免费用户、同等级会员或低等级会员进入，必须在一个弹框内得到一致的价格、资格和有效期反馈。当前原型由会员页面配置和会员套餐管理页面的本地配置数据组成，必须明确每个展示值究竟来自配置字段、固定字典还是前端计算。',
  goal: '将全新的会员支付弹框建设为首页会员入口、后续会员页入口和购买流程统一使用的会员服务入口；弹框内部按 Banner区、套餐切换区、套餐展示购买区、权益概览区、AI模型消耗区、详细权益区、商用授权区和常见问题区组织，明确区分开通、续费、升级、降级与延期升级逻辑。会员弹框采用延期升级：将当前会员剩余价值折算为目标会员对应时长并叠加到新有效期，不在本弹框内误走补差价支付。',
  path: '创客贴前台 > 首页 > 顶部导航 > 会员中心（会员支付弹框）',
  acceptance: [
    '首页右上角“会员中心”可以打开会员支付弹框，并正常展示用户信息、套餐和支付区域。',
    '免费版、基础版（个人）、专业版（企业）等身份切换可以改变当前身份、席位、剩余积分和购买限制，且不影响正常支付功能。',
    '个人使用显示基础版（个人）、专业版（个人）；企业使用显示基础版（企业）、专业版（企业）、旗舰版（企业）。',
    '时间条按照后台配置顺序展示，显示不下时收纳到“更多”并可展开；购买积分与时间条同一行、字号一致。',
    '同一等级、同一时长的积分档位切换后，套餐价格、划线原价、每积分价格、优惠券匹配结果和支付二维码金额同步更新。',
    '同等级会员点击购买时显示“立即续费”，更高等级显示“立即升级”，免费用户显示“立即开通”；低等级套餐不允许购买并显示降级原因。',
    '会员弹框的升级采用延期升级：当前剩余价值按目标会员价格折算为对应时长，折算时长叠加到新会员有效期，不走补差价支付。',
    '企业席位按免费团队实际成员数或已购团队席位自动填充；席位下限、20 席上限、单席位价和总价计算准确。',
    '优惠券仅在当前会员等级、时长、套餐类型和价格满足配置时展示，优惠后金额与二维码订单金额一致。',
    '不可购买或签约限制套餐不展示支付二维码，二维码位置显示原因；点击按钮通过 toast 告知具体限制。',
    '二维码上方展示按实际套餐时长计算的“购买后有效期至：xxx”，支付完成后有效期和积分以当前选中套餐为准。',
    '会员支付弹框支持统一的打开、关闭、当前会员信息传递和补差价升级入口；首页会员入口、后续会员页入口和购买流程均使用这套全新会员服务能力，不再分别实现会员套餐与支付逻辑。',
    '支持通过链接中的约定标识符调起会员支付弹框；链接标识符用于识别会员入口或指定会员场景，打开后仍按当前用户身份和套餐购买规则展示，不得绕过购买资格校验。',
    '模块边界清晰：Banner区、套餐切换区、套餐展示购买区、权益概览区、AI模型消耗区、详细权益区、商用授权区和常见问题区分别可独立定位；模块之间围绕当前会员、当前身份、套餐选择、席位和支付结果联动。',
  ],
  verificationNotes: [
    '验证辅助项，不属于会员支付业务需求：身份切换选项用于模拟不同用户状态，验证开通、续费、升级、降级和席位规则。',
    '验证辅助项，不属于会员支付业务需求：V2610 标识、黄色需求说明按钮和说明面板用于需求定位与效果验收，不参与支付流程。',
  ],
};

export const MEMBERSHIP_WEB_PAYMENT_REQUIREMENT_META: MembershipRequirementDocumentMeta = {
  background: 'Web 会员支付弹框、挽留弹框和补差价升级页需要共同承载新增个人/企业会员等级；原有支付流程无法完整表达新等级、积分档位、企业席位和购买限制，因此需要统一补齐三类页面的会员展示与支付边界。',
  goal: '在会员支付弹框、挽留弹框和补差价升级页中新增并正确响应 V2610 会员等级，分别明确延期升级、直接扫码支付和补差价支付的业务边界；页面不把设计页外或设计页内的入口处理混入本子需求。',
  path: '创客贴前台 > 会员中心 > 会员支付弹框/挽留弹框/补差价升级页（/agent-skills-home、/membership-upgrade）',
  acceptance: [
    '会员支付弹框、挽留弹框和补差价升级页均展示基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312，并按 240→230、241→230、310→300、311→301、312→220 处理历史等级映射。',
    '会员支付弹框按全屏模块展示套餐、权益、AI 模型消耗、积分、席位和支付信息；同等级续费、低等级升级、高等级降级限制和企业席位规则与 V2610 总规则一致。',
    '挽留弹框按补差价升级中的会员默认展示规则选择会员和套餐，确认购买后直接展示二维码，不再显示“立即开通”按钮。',
    '补差价升级页只改造套餐展示区域，下方已有支付区域继续负责二维码和补差价支付；切换等级、时长、积分档位或席位后金额与二维码同步更新。',
  ],
  verificationNotes: [
    '入口处理不属于本子需求：设计页外和设计页/无限画布内的会员入口分别归入对应 Web 入口子需求。',
    'V2610 标识、红色虚线框和需求说明按钮仅用于定位和验收，不参与支付、升级或订单计算。',
  ],
};

export const MEMBERSHIP_WEB_ENTRY_REQUIREMENT_META: MembershipRequirementDocumentMeta = {
  background: '设计页外存在顶部会员中心、会员购买和升级等入口，需要在新增会员等级后继续使用统一的会员服务能力，避免入口文案、打开方式和会员身份展示不一致。',
  goal: '统一处理设计页外各会员入口与新会员的关系：入口只负责触发会员支付弹框或补差价升级页，不重复实现套餐和支付逻辑，并保证入口标识和跳转路径清晰可追溯。',
  path: '创客贴前台 > 设计页外 > 会员入口（/agent-skills-home、/membership-upgrade）',
  acceptance: [
    '创客贴首页顶部导航的“会员中心”入口展示 V2610 标识，点击后打开统一会员支付弹框，入口文案、位置和打开行为保持一致。',
    '设计页外的会员购买入口均复用统一会员支付弹框，不在入口页面重复维护会员等级、套餐价格、积分和席位规则。',
    '常见问题中的补差价升级入口进入 /membership-upgrade，独立页面承接补差价支付；入口不直接创建订单，也不把延期升级流程混入补差价流程。',
    '入口触发后同步当前用户会员身份，展示基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312 对应的新会员名称和购买状态。',
    '入口标识和说明不遮挡顶部导航、用户信息、会员中心按钮或跳转控件；页面标识沿用 V2610。',
  ],
  verificationNotes: [
    '入口页面的身份切换和需求说明按钮是验证辅助项，不代表真实登录身份切换，也不参与会员资格计算。',
    '红色虚线框与 V2610 标识只用于页面定位及验收，不改变原有入口布局。',
  ],
};

export const MEMBERSHIP_WEB_CANVAS_ENTRY_REQUIREMENT_META: MembershipRequirementDocumentMeta = {
  background: '设计页和无限画布内部存在会员模板、会员权益和升级提示等入口；新增会员等级后，这些入口需要与新版会员服务保持一致，避免在创作过程中继续展示旧会员名称或旧购买路径。',
  goal: '统一处理设计页/无限画布内各会员入口对新会员等级的展示、会员支付弹框调起和权益响应，保证创作场景中的入口不重复实现支付逻辑，并能正确识别个人与企业会员。',
  path: '创客贴前台 > 设计页/无限画布 > 会员入口（/design-app、/design-app/ai-create、/canvas）',
  acceptance: [
    '设计页和无限画布内的会员入口展示新会员等级和对应权益，不再出现旧等级名称、旧 level 或无法识别的会员状态。',
    '点击设计页/无限画布内的会员开通、升级或权益入口时，统一调起会员支付弹框；入口只传递当前会员身份和场景，不重复拼装套餐和支付内容。',
    '个人与企业会员在创作场景中的权益展示、会员模板权限和 AI 模型消耗提示与会员支付弹框配置保持一致。',
    '当入口需要补差价升级时，跳转独立 /membership-upgrade 页面；不可购买、降级或席位受限时，展示明确原因，不生成错误订单。',
    '设计页和无限画布入口的 V2610 标识不遮挡编辑、生成、模板和会员操作控件。',
  ],
  verificationNotes: [
    '设计页/无限画布中的编辑和生成流程不属于本子需求改造范围，只有会员入口及其会员状态响应纳入验收。',
    '身份切换、V2610 标识和需求说明按钮属于验证辅助项，不改变真实用户会员数据。',
  ],
};

const MEMBERSHIP_SECTION_DESCRIPTIONS: Record<string, string> = {
  '新增会员等级': '明确会员套餐管理中的会员名称、新 level、历史等级映射与页面默认等级表的对应关系，并标注哪些值来自后台配置、哪些值是固定回退。',
  '会员级别总体排列': '统一等级比较、页面展示顺序和可购买方向；排序按会员总排序维护，不由价格或套餐显示顺序推导。',
  '页面入口与路由范围': '定义页面真实入口和路由边界，避免把会员弹框和独立升级页混为一个入口。',
  '套餐显示区域（核心改动范围）': '本次改动原因是新增会员等级和套餐展示形式；红色虚线框只标记身份下方的组织方式、时间筛选、版本卡片、积分/席位等改造区域，不包含下方已有支付区域。',
  '展示方式与筛选': '定义身份、展示模式、时间项和套餐卡片的组织方式，保证窄屏下仍能访问全部选项。',
  '数据来源与筛选规则': '明确补差价升级套餐组、Web 新版套餐组、套餐明细字段及筛选聚合规则。',
  '默认选中与套餐切换': '定义首次进入、时间切换、积分档位切换以及价格和支付信息的联动范围。',
  '会员身份与购买限制': '定义不同会员身份下的开通、续费、升级、降级和不可购买反馈。',
  '企业席位与价格': '定义免费团队、已购团队、席位上下限和单席位价格的计算口径。',
  '支付区域与样式': '定义支付二维码、有效期、支付方式、卡片颜色和悬浮说明的展示边界。',
  '入口与页面范围': '说明新的会员全屏弹框的产品定位、统一承载页面、真实入口和打开权限；明确直接访问会员页与各入口调起使用同一套弹框。',
  '页面数据来源': '明确会员页面配置、套餐明细、优惠券和支付选择的业务字段、来源位置及回退数据。',
  '身份切换与展示字段': '区分真实会员信息、固定验证身份、页面配置文案和套餐明细字段。',
  '会员等级与套餐选择': '定义页面会员等级、时间配置与套餐明细的关联、时间匹配、积分档位生成和切换联动。',
  '购买、续费、升级与降级规则': '定义按钮文案、延期升级、优惠限制、二维码显示和 toast 反馈。',
  '企业席位与价格计算': '定义当前团队人数、已购席位、企业单席位价格、20 席上限和实时总价公式。',
  '支付弹框字段与计算': '定义支付选择回传、套餐字段重匹配、金额、有效期、每积分价格和二维码生成边界。',
  '弹框样式与交互': '定义弹框容器、滚动、吸顶、关闭、说明面板和 V2610 视觉标识。',
  '兼容逻辑与埋点边界': '说明全屏弹框必须继承原会员支付小弹框的路径定位、会员等级定位、外部来源参数和全部埋点逻辑，确保升级不影响已有转化链路。',
  'Banner区': '定义 Banner 广告的配置来源、有效广告筛选、双图叠加展示、倒计时触发条件、空数据占位和点击跳转边界。',
  '套餐切换区': '定义个人/企业 tab、时间 options、更多收纳和购买积分入口的配置来源、排序与交互联动。',
  '套餐展示购买区': '定义会员等级、套餐明细、积分档位、席位控件、按钮状态、卡片样式和支付触发的字段映射与计算口径。',
  '购买与支付规则': '定义选中套餐如何传给支付弹框，支付金额、优惠、有效期和二维码的重算边界，以及不可购买时的替代提示。',
  '权益概览区': '定义套餐卡片内的权益概览、专享权益、模型权益、二维码咨询和权益样式来源。',
  'AI模型消耗区': '定义按积分档位展示图片/视频模型消耗和预估生成数量的配置、展开与换算规则。',
  '详细权益区': '定义个人/企业详细权益对比表、权益分组、版本列、查看全部权益和配置来源。',
  '商用授权区': '定义线上、线下和禁用商用场景，以及企业咨询、案例和品牌信息的展示边界。',
  '常见问题区': '定义常见问题列表、展开状态、双列/单列布局和补差价升级入口。',
};

export const MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS: MembershipRequirementSection[] = [
  {
    title: '新增会员等级',
    table: {
      columns: ['新 level', '名称', '历史等级映射', '类型', '授权'],
      rows: [
        { cells: ['240', '基础版（个人）', '230', '个人', '个人商用授权（仅限个人使用）'], highlight: true },
        { cells: ['241', '专业版（个人）', '230', '个人', '个人商用授权（仅限个人使用）'], highlight: true },
        { cells: ['310', '基础版（企业）', '300', '企业', '线上推广、线下印刷、团队协作与共享；禁用网络转售、商标注册等用途'], highlight: true },
        { cells: ['311', '专业版（企业）', '301', '企业', '线上推广、线下印刷、团队协作与共享；禁用网络转售、商标注册等用途'], highlight: true },
        { cells: ['312', '旗舰版（企业）', '220', '企业', '线上推广、线下印刷、团队协作与共享；禁用网络转售、商标注册等用途'], highlight: true },
      ],
    },
    items: [],
  },
  {
    title: '会员级别总体排列',
    highlightTerms: ['240', '241', '310', '311', '312'],
    items: [
      '排序来源：会员总排序是统一的业务等级规则，不是套餐价格或套餐显示顺序计算出来的；同一等级分组内的会员视为同等级。',
      '会员总排序：4（限次会员）< 1 = 125 < 199 = 4（不限次） = 211 = 230 = 240 < 241 < 105 = 9 = 130 = 200 = 212 = 231 < 232 < 233 < 210 < 201 < 7 = 8 < 2 = 5 = 6 = 100 = 110 = 115 = 135 = 202 = 203 = 205 = 300 = 310 < 301 = 311 < 302 = 312 < 204 < 3 = 120 = 220。',
      '页面展示顺序：个人/企业 tab 内分别使用固定等级数组；个人为基础版（个人）< 专业版（个人），企业为基础版（企业）< 专业版（企业）< 旗舰版（企业）。',
      '购买判断：先将当前会员和目标套餐映射到会员总排序，再比较等级位置；相等允许叠加时长购买同等级，低等级可升级到高等级，高等级不可降级购买低等级。',
    ],
    highlight: true,
  },
];

export const MEMBERSHIP_WEB_PAYMENT_REQUIREMENT_SECTIONS: MembershipRequirementSection[] = [
  ...MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS,
  {
    title: '会员支付弹框',
    highlight: true,
    items: [
      '会员支付弹框按全屏大弹框还原 Banner、个人/企业切换、时间条、购买积分、套餐展示购买、权益概览、AI 模型消耗、详细权益、商用授权、常见问题和扫码支付区域。',
      '弹框展示基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）312；历史等级映射为 240→230、241→230、310→300、311→301、312→220。',
      '会员弹框执行延期升级：同等级允许续费叠加，低等级可升级到高等级，高等级不可降级购买；企业席位、优惠券、金额、有效期和二维码按当前套餐同步计算。',
      '弹框内切换会员类型、时长、积分档位或席位后，套餐卡片、权益、支付金额、有效期和二维码使用同一选中套餐重新匹配。',
    ],
  },
  {
    title: '挽留弹框',
    items: [
      '挽留弹框的会员和套餐默认规则与补差价升级页保持一致，按当前会员身份和默认选中套餐展示新增会员等级、价格、积分和权益。',
      '挽留弹框选择目标会员后，支付区域直接展示二维码和实际应付金额；二维码下方保留支付方式、协议和发票说明。',
      '挽留弹框不再展示“立即开通”按钮，不能因为弹框入口不同而重复创建开通订单或绕过当前会员购买限制。',
    ],
  },
  {
    title: '补差价升级页',
    items: [
      '补差价升级页使用 /membership-upgrade，按个人/企业、按时间/按会员展示新增等级、套餐卡片、积分档位和企业席位。',
      '补差价升级页读取补差价升级套餐组（ID 9），新增会员套餐由 Web端-新版套餐组（ID 8）同步完整业务配置；切换套餐后价格、积分说明、席位金额和二维码同步更新。',
      '套餐展示区域下方继续使用原有支付区域完成补差价支付；本次不把已有支付区域改造成会员弹框，也不把延期升级计算混入补差价流程。',
    ],
  },
];

export const MEMBERSHIP_WEB_ENTRY_REQUIREMENT_SECTIONS: MembershipRequirementSection[] = [
  {
    title: '设计页外入口范围',
    highlight: true,
    items: [
      '入口位置：创客贴设计页外 > 顶部导航 > 会员中心；点击“会员中心”打开统一会员支付弹框，入口本身不维护套餐和支付逻辑。',
      '设计页外的会员购买入口均复用统一会员支付弹框，统一传递当前会员身份、打开场景和目标会员，不重复拼装会员套餐。',
      '常见问题中的补差价升级入口进入 /membership-upgrade，独立页面负责补差价支付；入口不直接创建订单，也不把延期升级流程混入补差价流程。',
    ],
  },
  {
    title: '新会员入口响应',
    items: [
      '入口触发后使用新会员名称和 level：个人为基础版（个人）240、专业版（个人）241；企业为基础版（企业）310、专业版（企业）311、旗舰版（企业）312。',
      '入口和跳转页面均沿用 V2610 标识；标识和需求说明不遮挡顶部导航、用户信息、会员中心按钮或跳转控件。',
      '设计页外入口只负责打开统一会员支付弹框或进入补差价升级页；会员类型、套餐、积分、席位和支付规则分别由目标页面承载。',
    ],
  },
];

export const MEMBERSHIP_WEB_CANVAS_ENTRY_REQUIREMENT_SECTIONS: MembershipRequirementSection[] = [
  {
    title: '设计页入口',
    highlight: true,
    items: [
      '设计页内会员模板、会员权益和升级提示等入口展示新会员名称、level 和对应权益，不再出现旧等级名称或旧购买路径。',
      '点击设计页内的会员开通、升级或权益入口时，统一调起会员支付弹框；入口只传递当前会员身份和场景，不重复拼装套餐与支付内容。',
      '设计页中的个人/企业会员权益、会员模板权限和 AI 模型消耗提示与会员页面配置保持一致。',
    ],
  },
  {
    title: '无限画布入口',
    items: [
      '无限画布内的会员入口使用同一套新会员等级和会员状态判断，支持从 /canvas 或相关创作入口进入会员支付弹框。',
      '当入口需要补差价升级时跳转 /membership-upgrade；不可购买、降级或席位受限时展示明确原因，不生成错误订单。',
      '设计页和无限画布入口的 V2610 标识不遮挡编辑、生成、模板和会员操作控件；编辑与生成流程本身不在本子需求中改造。',
    ],
  },
];

export const MEMBERSHIP_UPGRADE_REQUIREMENT_SECTIONS: MembershipRequirementSection[] = [
  ...MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS,
  {
    title: '页面入口与路由范围',
    items: [
      '页面路径：创客贴前台 > 会员中心 > 补差价升级页，路由为 /membership-upgrade。',
      '常见问题第 8 条“低版本套餐费用升级为高版本套餐，如何折算？”中的“请点击此处”可以打开本页。',
    ],
  },
  {
    title: '套餐显示区域（核心改动范围）',
    items: [
      '改动范围：个人使用/企业使用切换下方的套餐显示区域，包含展示方式、时间筛选、会员版本卡片、积分档位、企业席位和套餐价格计算；下方已有支付区域不属于本次框选和布局改造范围。',
      '区域结构：先按当前展示模式显示时间筛选或会员等级筛选，再显示对应套餐卡片；卡片内继续承载积分/席位配置和套餐总价，选择结果传递给下方已有支付区域。',
      '时间筛选：按后台套餐配置的显示顺序展示连续包年、连续包月、连续包季、季度、1年、2年、3年、终身等有效时长；宽度不足时收纳到“更多”，展开后仍能选择完整时间项。',
      '会员版本：个人使用显示基础版（个人）、专业版（个人）；企业使用显示基础版（企业）、专业版（企业）、旗舰版（企业），版本顺序固定且与会员等级排序一致。',
      '套餐卡片：按选中版本和时长读取套餐数据，展示套餐名称、定位、副标题、现价、划线原价、月价、每积分价格和积分说明；同一时长不同积分量聚合在同一卡片内。',
      '支付联动：切换时间、版本、积分档位或席位后，更新下方已有支付区域所使用的套餐价格、积分说明、有效期和支付二维码数据，但不修改支付区域的布局和交互结构。',
    ],
    highlight: true,
  },
  {
    title: '展示方式与筛选',
    items: [
      '页面默认按时间展示；右下角悬浮控制区提供“按时间”和“按会员”两种展示方式，身份切换与展示方式控制保持同一行。',
      '按时间：先显示套餐时长，再按会员等级显示对应套餐卡片；按会员：先显示当前会员等级，再显示该等级下的全部时长套餐。',
      '个人使用只展示基础版（个人）、专业版（个人）；企业使用只展示基础版（企业）、专业版（企业）、旗舰版（企业）。',
      '时间选项按后台套餐配置的显示顺序展示；空间不足时收纳到“更多”，点击后展开下拉选项，首个时间选项不能被裁切。',
      '套餐卡片横向滚动，不上下折行；选中卡片使用蓝色边框，未选中卡片使用灰色边框。',
    ],
  },
  {
    title: '数据来源与筛选规则',
    items: [
      '数据读取入口：补差价升级页读取会员套餐管理 > Web端-新版-补差价页面/补差价升级套餐组（组 ID 9）。',
      '数据使用边界：当前原型以套餐管理页面已配置的套餐数据作为展示依据；正式接入服务后，组 ID 9 应由套餐组查询结果返回，不能把原型示例数据当成后台真实配置。',
      '新增会员同步规则：补差价升级组的新增会员套餐由 Web端-新版套餐组（组 ID 8）中属于五个新增等级的数据复制而来；复制时保留来源套餐的全部业务配置，仅生成升级组内部唯一标识和升级场景使用的名称。每次读取升级组都会用组 8 的新增会员数据同步组 9，避免两组积分量、价格和套餐类型不一致。',
      '后台字段映射：套餐明细主键用于唯一识别套餐；套餐展示名称用于显示时长；有效天数用于计算有效期；当前售价、划线原价和折扣用于价格展示；套餐类型用于识别普通套餐/订阅套餐；首充/续费信息用于连续套餐说明；显示状态控制是否展示；显示顺序控制时间和套餐排序。',
      '后台字段映射：会员名称和等级编号用于关联会员等级；积分量、发放单位、发放周期和积分说明用于积分展示；企业单席位价格用于席位加价；销售说明用于卡片标签、Banner 和颜色文案。',
      '筛选规则：只保留显示状态有效、等级属于当前个人/企业范围且已配置积分量的套餐；隐藏套餐不显示，也不参与时间选项和积分档位计算。',
      '时间分组规则：以套餐展示名称和有效天数组合识别同一时间组，组内按后台显示顺序排列；同一时长下的不同积分量归入同一时间组，通过积分档位切换具体套餐。',
      '排序规则：时间选项由有效套餐的展示名称和有效天数去重生成；补差价页默认使用套餐配置派生的时间顺序。页面上的“个人使用/企业使用”、等级短名称和当前身份验证选项是本次改版固定的展示规则，不来自内部套餐名称。',
      '空值与回退：积分说明为空时显示固定文案“按套餐配置发放积分”；等级编号为空时按会员名称匹配默认等级表；没有有效套餐时显示“当前套餐暂无可购买配置”，不会生成虚假价格或二维码。',
    ],
  },
  {
    title: '默认选中与套餐切换',
    items: [
      '默认选中规则：每个会员等级按后台显示顺序最靠前的时间组默认选中，每个时间组按积分量从小到大后的第一个有效套餐默认选中；按时间模式下每个等级选中当前时间组的第一个积分档位。',
      '点击会员等级、时间组或积分档位只更新对应选择，不清除其他等级已经选择的席位和积分档位。',
      '同一时间有不同积分量时，积分滑块和档位按钮切换到对应套餐，并同步更新价格、划线原价、每积分价格、积分说明和支付二维码金额。',
      '每积分价格计算：按月套餐先用当前售价 ÷ 有效月份数得到月价，再用月价 ÷ 积分量；一次性套餐直接用当前售价 ÷ 积分量；结果保留 4 位小数。',
      '套餐价格展示直接使用当前套餐明细的当前售价；企业席位变化后的总价不修改后台基础售价，只按基础价和单席位价格计算显示总价。',
    ],
  },
  {
    title: '会员身份与购买限制',
    items: [
      '身份数据来源：页面使用当前会员的等级、名称、有效期、剩余积分、团队成员数、已购席位和使用类型；右下角身份切换是固定的验证辅助数据，不是后台用户数据。',
      '固定验证身份：免费版 1人/5人、基础版（个人）1人/3人、专业版（企业）3人；切换时只替换当前页面的模拟身份，不改变真实账户或套餐配置。',
      '按钮文案规则：当前没有会员等级显示“立即开通”；同等级显示“立即续费”；目标等级更高显示“立即升级”；目标等级更低显示“请购买当前会员及以上会员”。',
      '降级判断不比较等级数字大小，而是依据会员总排序；同一等级分组视为同等级，允许叠加时长。',
      '当前会员购买低于自身等级的套餐不可购买，按钮下方固定显示“无法降级购买低版本会员”；当前套餐仍展示真实套餐信息，不伪造可购买状态。',
      '不可购买原因：无有效套餐时显示“当前套餐暂无可购买配置”；降级显示“无法降级购买低版本会员”；企业签约套餐席位受限时显示“当前席位数高于可购买的席位数无法购买，请选择企业使用的非签约套餐”。',
      '不可购买套餐的支付区域不生成二维码，改为红色原因提示；点击不可购买按钮时以 toast 告知当前限制原因，该提示为业务规则文案，不是套餐字段。',
    ],
    highlight: true,
  },
  {
    title: '企业席位与价格',
    items: [
      '席位输入来源：当前团队成员数表示当前团队实际成员数，已购买席位数表示已购买席位；免费团队取实际成员数，已购买团队会员取已购席位数，作为最小席位并填入控件。',
      '席位上下限：最小值不低于 1 和当前团队实际成员数/已购席位数中的较大值，最大值固定为 20；加减按钮和直接输入都经过同一边界校验。',
      '超限处理：输入值超过 20 时截断为 20，并显示固定 toast“最大购买席位数为20人，已自动调整为20人”；输入空值或非数字时回退到最小席位。',
      '单席位价格来源：优先读取当前套餐的企业单席位价格；该字段为空时按会员等级回退：基础版（企业）310=300、专业版（企业）311=500、旗舰版（企业）312=800。',
      '企业总价计算：基础价取当前套餐售价，N 取席位控件值；总价 = 基础价 +（N - 1）× 单席位价格。该结果是实时计算值，不回写后台套餐基础售价。',
      '自动续费/签约识别：套餐类型为订阅套餐或展示名称以“连续”开头时视为签约套餐；该套餐按 1 席位处理，若最小席位大于 1 则不可购买并显示原因。',
      '企业卡片显示“合计”计算价和席位提示；个人卡片固定 seatCount=1，不使用企业单席位价格。',
    ],
  },
  {
    title: '支付区域与样式',
    items: [
      '支付区域固定放在套餐卡片横向展示区的下方，独占一行，不因大屏宽度改为套餐卡片右侧或上方；区域内展示支付二维码、实际应付金额、成员席位提示、VIP 服务协议和支付宝/微信支付方式。',
      '支付金额使用当前选中套餐的当前售价和企业席位数实时计算；二维码上方显示“购买后有效期至：xxx”，日期由当前日期加套餐有效天数计算，终身套餐按 99 年折算。',
      '不可购买套餐的支付区域替换为不可购买原因，不生成或展示支付二维码。',
      '个人基础版使用中性白色卡片，个人/企业专业版使用浅蓝色卡片，企业旗舰版使用浅橙色卡片；卡片最低高度统一，底部积分说明区域对齐。',
      '底部客服悬浮按钮和黄色身份/展示方式控制不参与页面正常滚动。',
    ],
  },
];

const MEMBERSHIP_CENTER_LEVEL_OVERVIEW_SECTIONS: MembershipRequirementSection[] =
  MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS.map((section, index) => {
    if (index !== 1) return section;

    return {
      ...section,
      items: [
        ...section.items.slice(0, 2),
        '会员支付弹框采用延期升级逻辑：从当前会员升级到更高等级时，将当前会员剩余价值按目标会员的价格折算为对应时长，并把折算后的时长叠加到新会员有效期上；不走补差价支付逻辑。',
        '高等级不可降级购买低等级。',
      ],
    };
  });

export const MEMBERSHIP_CENTER_REQUIREMENT_SECTIONS: MembershipRequirementSection[] = [
  ...MEMBERSHIP_CENTER_LEVEL_OVERVIEW_SECTIONS,
  {
    title: '入口与页面范围',
    items: [
      '产品定位：这是 **新的会员全屏弹框**，在原会员支付小弹框的已有能力基础上进行全面升级；在 **保留原有支付、路径定位、数据统计等逻辑** 的基础上，扩展会员权益说明和 AI 模型消耗说明。',
      '统一承载范围：上线后，用户直接访问 **/price/vip**，或从已有任意会员入口调起会员购买弹框，均使用同一套全屏弹框完成会员展示与支付转化；不再分别维护独立会员页和支付弹框两套能力。',
      '打开权限：**未登录用户、非团队创建者也可以打开并浏览弹框**；打开阶段不做拦截，统一在“立即购买”按钮处校验购买资格并拦截，向用户展示具体原因。',
      '业务承载：弹框统一承载会员身份、个人/企业使用、套餐时长、会员等级、积分档位、优惠券、支付二维码、购买限制、续费升级、权益说明和 AI 模型消耗说明。',
    ],
  },
  {
    title: '兼容逻辑与埋点边界',
    items: [
      '路径调起兼容：**保留原会员支付弹框通过路径标识打开的能力**；系统根据路径标识识别打开场景，并在弹框打开后 **定位到对应的会员等级**，不得因改为全屏弹框而丢失原有定位结果。',
      '等级定位规则：外部指定会员等级时，弹框按原逻辑选中对应会员等级及其可用套餐；未指定等级时，沿用原默认等级和默认套餐，不因入口来源不同而产生两套默认规则。',
      '来源参数与埋点：**保留原会员支付弹框接收外部来源参数用于埋点的能力**，来源参数需要随入口进入弹框，并用于识别用户从哪里触发会员购买。',
      '埋点完整保留：**原会员支付弹框中的所有已有埋点逻辑、事件、字段和触发时机均需保留**；全屏改版只能扩展新的权益/模型展示埋点，不得删除、改名或改变已有支付转化埋点口径。',
      '能力边界：入口只负责传递路径标识、会员等级和来源参数并打开弹框；弹框内部继续负责套餐展示、购买资格校验、支付转化和数据统计，不能在不同入口重复实现一套逻辑。',
      '补差价边界：独立补差价升级页仍保持单独页面和业务流程；本全屏会员弹框承载原会员支付弹框和会员页能力，不把补差价支付逻辑混入普通会员购买流程。',
    ],
  },
  {
    title: 'Banner区',
    items: [
      '数据来源：通过广告位 **web_vippop_top_ad** 配置对应的数据，仅获取该广告位下按有效状态过滤后的 **第 1 条广告信息**进行展示。',
      '广告位标识：**web_vippop_top_ad**；该标识需要在广告位配置和需求联调中保持一致，并作为 Banner 数据来源的重点识别字段。',
      '图片展示：读取广告配置中的 **两张图片**，按照广告配置的前后层级进行 **叠加展示**；Banner 不从会员套餐明细推导活动图片或促销内容。',
      '倒计时规则：右侧为倒计时区域，**仅当广告剩余时长不足 7 天时显示倒计时**；广告剩余时长不少于 7 天时不显示倒计时区域，倒计时按天/小时/分钟/秒展示。',
      '无广告处理：**获取不到有效广告信息时，Banner 整体不展示且不占位**，不显示空白容器或默认活动内容。',
      '点击行为：广告配置了 **跳转地址** 时，点击 Banner 跳转到对应页面；**未配置跳转地址时点击无反应**，不得跳转到默认页面或触发会员购买。',
    ],
  },
  {
    title: '套餐切换区',
    items: [
      '类型来源：会员页面配置中的类型名称显示个人使用/企业使用；切换后重新计算当前身份下的时间、套餐和最小席位。',
      '时间来源：会员页面配置中的时间名称、说明、折扣提示和有效时长；配置顺序或后台显示顺序决定展示顺序，Web 新版套餐有效数据可补齐缺失的时间项。',
      '更多规则：根据实际容器宽度判断时间项是否放得下，放不下时保留首项并将其余项收纳到“更多”；点击“更多”展开选项，选择后更新当前时间，首项不得被裁切。',
      '购买积分：右侧“购买积分”是固定功能入口，字号与时间条一致；点击只打开积分购买辅助弹框，不改变当前套餐和会员类型状态。',
      '联动限制：切换类型或时间后只重置对应筛选状态；套餐区根据新的身份和时间重新筛选可用套餐，优惠券与支付信息同步匹配。',
    ],
  },
  {
    title: '套餐展示购买区',
    items: [
      '等级和卡片来源：会员页面配置提供等级名称、展示名称、副标题和标签；页面权益配置提供卡片颜色、权益和专享内容；二者按等级编号关联，套餐卡片不从标题文字猜等级。',
      '价格和积分来源：同一等级、有效时长和套餐类型下的套餐明细提供当前售价、原价、折扣、首充/续费信息、积分量、发放单位、发放周期、积分说明、展示名称和销售说明；隐藏套餐或未配置积分量的行不进入卡片。',
      '积分档位：仅当同等级、同时间、同套餐类型存在两条及以上不同积分量时显示积分切换；默认选中第一档，档位按积分量从小到大排列；切换后整张卡片读取对应套餐的价格、划线价、每积分价格、积分说明和优惠券匹配结果。',
      '企业席位：企业使用时显示席位减号/人数/加号和合计；免费团队最小值取当前团队成员数，已购团队最小值取已购买席位数，最小值不低于 1，最大值固定 20；自动续费/签约套餐只支持 1 席位。',
      '卡片状态：没有当前会员等级为立即开通，同等级为立即续费，目标等级更高为立即升级，目标等级更低为不可降级；选中/强调卡片使用页面配置的蓝/橙色，不可购买卡片仍可点击反馈原因。',
      '样式边界：卡片区域可横向滚动、按版本组织；积分说明块与卡片底部留出独立间距；个人专业版专享权益使用比当前背景更深的蓝色且去掉外层边框，企业旗舰版专享权益去掉外层边框，二维码说明在二维码右侧上下排列。',
    ],
  },
  {
    title: '权益概览区',
    items: [
      '展示位置：权益概览位于每张套餐卡片的购买按钮和购买说明之后，展示当前会员等级对应的专享权益、通用权益和模型权益摘要。',
      '内容来源：卡片权益读取会员页面配置中当前等级的 benefitSections/features；权益文案、是否启用、角标、说明、图标和专享二维码均由配置控制，不从价格或等级名称推导。',
      '当前套餐联动：切换个人/企业、会员等级、时长或积分档位后，卡片权益概览跟随当前卡片配置更新；不可购买状态只影响购买按钮和支付区域，不隐藏权益概览。',
      '样式规则：专享权益按配置使用颜色、背景和边框；模型权益显示图片/视频图标；旗舰版等需要咨询的权益显示二维码及“扫码咨询/专属顾问”说明。',
    ],
  },
  {
    title: 'AI模型消耗区',
    items: [
      '展示位置：会员弹框权益概览之后展示 AI 模型消耗表，标题、说明、积分档位列和模型分组来自网页版会员页面配置。',
      '消耗口径：图片模型按张数、视频模型按单视频估算；每个积分档位展示对应模型的预估生成数量和单位，数值直接读取 modelConsumption 配置。',
      '展开规则：模型分组默认展示前 3 条，超过 3 条时显示“查看更多”；点击后展开该分组全部模型，再次点击收起，不影响其他分组状态。',
      '配置联动：后台修改模型名称、积分档位、预估数量、单位或说明后，会员弹框刷新配置即可同步展示，不把模型消耗写死在套餐卡片价格逻辑中。',
    ],
  },
  {
    title: '详细权益区',
    items: [
      '展示位置：AI 模型消耗区之后展示详细权益对比表，按权益分组列出会员版本与各版本对应值。',
      '内容来源：表头、版本标签、权益分组、权益名称和各版本取值读取网页版会员页面配置 details；个人/企业切换后展示对应的对比表。',
      '展示规则：基础信息默认展示，其他权益按预览数量展示；权益数量超过预览范围时显示“查看全部权益”，点击后展开全部分组，再次点击收起。',
      '状态表达：配置值为“✓”显示已具备图标，“—”显示不具备状态，文本值按原配置换行展示，不用卡片价格或积分字段推导权益内容。',
    ],
  },
  {
    title: '商用授权区',
    items: [
      '展示位置：详细权益区之后展示商用授权范围说明，包含线上用途、线下用途和禁用项三个授权分组。',
      '内容来源：授权标题、说明、分组启用状态及场景明细读取 commercialLicense 配置；启用项使用勾选样式，禁用项使用不可用样式。',
      '企业服务：企业商用授权区域可展示服务案例、品牌 logo、企业专属服务和咨询二维码；点击企业咨询入口打开多人采购优惠通道，不改变当前套餐选择。',
      '边界说明：商用授权仅用于展示授权范围和咨询入口，不能绕过会员等级、席位、套餐购买限制或支付资格校验。',
    ],
  },
  {
    title: '常见问题区',
    items: [
      '展示位置：商用授权区之后展示常见问题，移动端使用单列，桌面端按奇偶项分为两列。',
      '内容来源：问题标题、答案、默认展开状态和操作入口读取 faq 配置；问题内容支持换行展示并保持配置顺序。',
      '交互规则：问题卡片按配置的 openByDefault 决定默认展开；点击问题标题可展开/收起答案，不影响会员类型、套餐和支付状态。',
      '升级入口：补差价升级问题通过配置的 action 指向 /membership-upgrade；点击“请点击此处”进入独立补差价升级页面，不在 FAQ 区直接创建订单。',
    ],
  },
  {
    title: '购买与支付规则',
    items: [
      '支付入口：套餐卡片将选中的会员等级、时间、积分档位、身份类型和席位传递给支付区域；支付弹框打开后再次按等级、有效时长、套餐类型和积分量匹配当前套餐明细，避免使用卡片旧展示信息。',
      '金额规则：个人支付金额取选中套餐当前售价；企业基础价取当前售价，再按企业席位公式基础价 +（N - 1）× 单席位价格计算总价，单席位价格优先取套餐字段，缺失时按 310=300、311=500、220=800 回退。',
      '优惠规则：优惠券按会员等级、有效时长、套餐类型和当前套餐价格匹配；优惠后金额只在匹配成功时生效，并同步二维码订单金额。',
      '有效期规则：购买后有效期由当前日期加套餐有效天数计算；终身使用 99×365 天；二维码上方显示计算后的日期，不把日期写死在卡片文案中。',
      '延期升级规则：会员弹框中的“升级”不创建补差价订单；支付服务将当前会员剩余价值按目标会员价格折算为目标会员时长，再叠加到目标会员有效期。页面只传递当前会员和目标套餐，独立补差价升级页不复用该计算。',
      '不可购买规则：降级套餐、企业签约套餐席位不满足限制时，不生成二维码，在支付位置显示具体原因；按钮保持可点击并通过 toast 反馈，不允许用户面对无响应的禁用按钮。',
    ],
  },
  {
    title: '页面数据来源',
    items: [
      '页面配置入口：读取会员页面配置中网页版的内容；未配置时使用本次改版默认的页面展示内容。',
      '页面配置字段：类型名称用于显示“个人使用/企业使用”；时间配置提供时间名称、显示顺序、有效时长和折扣提示；会员等级配置提供等级编号、会员名称、展示名称、副标题、Banner 文案和标签。',
      '套餐明细入口：读取会员套餐管理 > Web端-新版套餐组（组 ID 8）；该套餐组是会员支付弹框的套餐和价格来源。',
      '套餐明细字段：等级编号和会员名称负责关联会员等级；套餐展示名称和有效时长负责匹配时间；当前售价、原价、折扣和首充/续费信息负责价格；积分量、发放单位、发放周期和积分说明负责积分；套餐类型和企业单席位价格负责订阅识别和企业席位价；显示状态决定是否展示。',
      '会员卡片内容来源：会员页面配置提供会员类型、等级名称、副标题、颜色、标签、权益和专享内容；运行时按等级编号关联套餐明细，卡片价格和积分优先取套餐明细。',
      '权益和样式来源：权益概览、模型消耗、商用授权等模块来自同一份网页版会员页面配置；专享权益的二维码、背景和边框由权益配置控制，不由套餐价格字段推导。',
      '优惠券来源：优惠券配置；使用券时按会员等级、有效时长、套餐类型与当前套餐明细匹配，并按优惠金额计算；无匹配券不展示优惠。',
      '支付选择信息：支付区域接收选中的会员等级、时间、积分档位、身份类型和席位；支付弹框根据这些信息重新读取套餐明细，计算价格、优惠、有效期和二维码，不使用卡片上一次渲染的旧信息。',
      '固定值边界：免费/会员验证身份、会员总排序、企业席位上限 20、企业单席位价 300/500/800、支付协议和“升级会员畅享模板AI创作权益”等文案当前为前端固定规则或固定文案，不是后台套餐字段。',
    ],
  },
  {
    title: '身份切换与展示字段',
    items: [
      '身份切换数据：免费版 1 人、免费版 5 人、基础版（个人）1 人、基础版（个人）3 人、专业版（企业）3 人仅用于验证身份逻辑；真实业务使用当前登录用户的会员信息。',
      '顶部用户字段：会员名称、等级、有效期和剩余积分来自当前用户会员信息；免费用户的“升级会员畅享模板AI创作权益”是固定引导文案。',
      '个人/企业 tab：名称来自会员页面配置；如果后台配置缺失，回退固定“个人使用/企业使用”。企业席位数据来自当前用户的已购席位或团队成员数，按免费/已购会员规则计算最小值。',
      '顶部套餐时长：优先使用会员页面配置的时间名称、说明、颜色和有效时长；Web 配置会用有效套餐的展示名称和有效时长去重补齐时间项。显示不下时收纳到“更多”并可展开，购买积分按钮是固定功能文案，字号跟时间条一致。',
      '套餐卡片字段：会员名称和副标题来自会员等级及权益配置；现价、划线原价、折扣、月价、每积分价格、积分量、积分周期、积分说明来自当前套餐明细；优惠券标识来自优惠券匹配结果；权益内容来自页面权益配置。',
    ],
  },
  {
    title: '会员等级与套餐选择',
    items: [
      '等级来源：从会员页面配置读取等级编号、会员名称和展示名称；仅保留套餐明细中状态为“显示”且已配置积分量的等级。个人使用为 240/241，企业使用为 310/311/220。',
      '时间来源：用会员页面配置中的时间名称和有效时长匹配套餐明细；连续包年、连续包月、连续包季等订阅选项优先匹配订阅套餐，季度/月度等一次性选项优先匹配非订阅套餐。',
      '积分档位规则：筛选同一等级、同一有效时长、同一套餐类型下积分量不同的套餐，按积分量从小到大生成档位；只有档位数量大于 1 时才显示积分切换控件。',
      '积分切换联动：切换积分档位后，选中的套餐改为对应积分量的套餐明细，价格、划线原价、每积分价格、积分说明、优惠券匹配和二维码金额全部重新计算。',
      '默认值：每个等级/时长默认选中第一个有效积分档位；第一次进入时默认选中当前时间条的第一个有效套餐。不同积分量必须使用各自套餐配置的价格，不能共用一个默认价格。',
      '会员卡片、专享权益、资产管理权益和 QR 咨询区域使用当前页面配置的颜色和内容；专享权益区域不额外绘制与需求不一致的外层边框。',
    ],
  },
  {
    title: '购买、续费、升级与降级规则',
    items: [
      '按钮文案来源：依据当前会员等级与目标套餐等级的总排序关系确定；免费用户显示“立即开通”，同等级显示“立即续费”，更高等级显示“立即升级”，低等级显示“请购买当前会员及以上会员”。',
      '降级限制来源：依据会员总排序比较等级位置；按钮下方的“无法降级购买低版本会员”是固定提示，不来自套餐配置。',
      '延期升级逻辑：会员支付弹框不是补差价支付；当前会员剩余价值按目标会员的价格折算成剩余时长，再叠加到目标会员有效期。该规则需要支付服务按订单和会员状态计算，页面只负责传递目标套餐和当前会员信息。',
      '不可购买交互：按钮保持可点击并展示当前限制原因；不可购买套餐的支付二维码区域替换为原因提示，不创建支付二维码。',
      '企业签约限制：套餐类型为订阅套餐或展示名称以“连续”开头时视为自动续费/签约套餐，只支持 1 席位；当前最小席位大于 1 时禁止购买，提示选择非签约套餐。',
    ],
    highlight: true,
  },
  {
    title: '企业席位与价格计算',
    items: [
      '席位输入来源：免费团队使用当前团队实际成员数，已购买团队会员使用已购买席位数；该值作为最小席位并自动填入席位控件。',
      '席位边界：最大购买席位数固定为 20；加减和输入都不能低于最小席位，超过 20 自动回落到 20 并 toast 提示。',
      '单席位价来源：当前套餐的企业单席位价格优先；缺失时按会员等级回退：310=300、311=500、220=800。',
      '总价公式：基础价取当前套餐售价，N 取当前席位数；企业总价 = 基础价 +（N - 1）× 单席位价格。该总价是实时计算值，不改写套餐管理中的基础售价。',
    ],
  },
  {
    title: '支付弹框字段与计算',
    items: [
      '支付选择来源：选中的会员等级、时间、积分档位、身份类型和席位传入支付弹框；支付弹框再次按等级、有效时长、套餐类型和积分量从套餐明细匹配当前行。',
      '支付标题和时长取当前套餐展示名称；实际金额取当前售价，企业再叠加席位计算；优惠券按会员等级、有效时长、套餐类型和当前价格匹配。',
      '有效期计算：当前日期 + 当前套餐有效天数；终身套餐按 99×365 天计算。二维码上方的“购买后有效期至：xxx”是计算值，不是套餐固定文案。',
      '每积分价格计算：按月套餐使用月价 ÷ 积分量，一次性套餐使用套餐总价 ÷ 积分量，结果保留 4 位小数；积分量、单位和周期直接取套餐明细。',
      '二维码、支付宝/微信图标、服务协议和发票说明是支付区域固定结构；不可购买时不生成二维码，改为当前购买资格和席位规则的原因。',
    ],
  },
  {
    title: '弹框样式与交互',
    items: [
      '会员弹框为固定居中的白色圆角容器，内容区域纵向滚动，顶部用户信息和关闭按钮吸顶；背景使用半透明遮罩。',
      '顶部 banner、个人/企业 tab、时间条、购买积分按钮、套餐卡片、权益区域和支付弹框沿用 V2610 会员改版的蓝色/橙色视觉体系。',
      '身份切换、时间选择、积分档位、席位增减、优惠券、支付方式和关闭行为均保持原有会员支付功能不变。',
    ],
  },
];

type MembershipRequirementFloatingButtonProps = {
  title: string;
  subtitle: string;
  sections: MembershipRequirementSection[];
  meta: MembershipRequirementDocumentMeta;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const MEMBERSHIP_REQUIREMENT_DRAWER_WIDTH = 520;

function getMembershipRequirementItemLabel(item: string, index: number) {
  const separatorIndex = item.search(/[：:]/);
  if (separatorIndex > 1 && separatorIndex <= 22) return item.slice(0, separatorIndex);
  return `需求点 ${String(index + 1).padStart(2, '0')}`;
}

function getMembershipRequirementItemContent(item: string, index: number) {
  const label = getMembershipRequirementItemLabel(item, index);
  const prefix = `${label}：`;
  return item.startsWith(prefix) ? item.slice(prefix.length).trim() : item;
}

function renderMembershipRequirementText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`} className="font-semibold text-[#c43f3f]">{part.slice(2, -2)}</strong>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function buildMembershipRequirementPrompt(title: string, subtitle: string, sections: MembershipRequirementSection[], meta: MembershipRequirementDocumentMeta) {
  const body = sections.map((section, index) => `### ${index + 1}. ${section.title}\n${MEMBERSHIP_SECTION_DESCRIPTIONS[section.title] ?? ''}\n${section.items.map((item, itemIndex) => `- ${getMembershipRequirementItemLabel(item, itemIndex)}：${getMembershipRequirementItemContent(item, itemIndex)}`).join('\n')}`).join('\n\n');
  return `你是一名资深后台产品经理、交互设计师和前端开发者。请严格根据下面的需求说明，设计并实现“${title}”功能，不要擅自扩展业务范围。\n\n## 需求标识\nV2610（2026年10月会员改版）\n\n## 需求概述\n${subtitle}\n\n## 需求背景\n${meta.background}\n\n## 需求目标\n${meta.goal}\n\n## 页面路径\n${meta.path}\n\n## 具体需求\n${body}\n\n## 验收标准\n${meta.acceptance.map((item) => `- ${item}`).join('\n')}\n\n## 验证辅助项（非业务需求）\n${meta.verificationNotes.map((item) => `- ${item}`).join('\n')}\n\n## 输出要求\n请先梳理页面信息架构、组件划分、交互流程、数据来源、字段映射、权限差异、购买限制、空态、加载态和错误态，再给出实现方案。保持现有项目的视觉风格和路由结构；涉及接口时说明请求参数、返回数据和异常处理，不要编造未确认的后端能力。`;
}

export function MembershipRequirementFloatingButton({ title, subtitle, sections, meta, className = 'fixed bottom-7 right-8', open: controlledOpen, onOpenChange }: MembershipRequirementFloatingButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (open) return undefined;
    setIsFullScreen(false);
    setCopied(false);
    return undefined;
  }, [open]);

  const copyAiPrompt = async () => {
    const prompt = buildMembershipRequirementPrompt(title, subtitle, sections, meta);
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const floatingButton = (buttonClassName = '') => <button type="button" aria-expanded={open} aria-label={`${title}需求说明`} onClick={() => setOpen(!open)} className={`flex h-[64px] w-[88px] flex-col items-center justify-center gap-1 rounded-[14px] border border-[#f0c44f] bg-[#ffd85f] text-[11px] font-semibold text-[#604700] shadow-[0_12px_30px_rgba(140,105,32,.22)] transition hover:bg-[#ffca36] ${buttonClassName}`}>
    <span className="rounded-[4px] bg-[#fff4bd] px-1.5 py-0.5 text-[9px] font-bold tracking-[.04em]">V2610</span>
    <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />需求说明</span>
  </button>;

  if (open) return <div className="pointer-events-none fixed inset-0 z-[115]">
    {isFullScreen ? <button type="button" aria-label="关闭全屏需求说明" onClick={() => setIsFullScreen(false)} className="pointer-events-auto absolute inset-0 bg-[#1f2937]/35 backdrop-blur-[1px]" /> : null}
    <aside className={`pointer-events-auto absolute flex flex-col overflow-visible border border-[#dfe6f0] bg-[#f4f6f9] text-left shadow-[-12px_0_38px_rgba(28,45,70,.18)] transition-[inset,width,border-radius] duration-200 ${isFullScreen ? 'inset-4 rounded-[16px]' : 'inset-y-0 right-0 w-[min(520px,max(320px,calc(100vw-244px)))]'}`} role="dialog" aria-modal={isFullScreen} aria-label={`${title}需求说明`}>
    {isFullScreen ? null : floatingButton('absolute bottom-7 -left-[88px]')}
    <div className="flex h-[62px] shrink-0 items-center justify-between gap-3 border-b border-[#e4e8ef] bg-white px-5">
      <div className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-[#4f8fe5]" /><span className="text-[14px] font-semibold text-[#29364d]">需求说明</span></div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={() => void copyAiPrompt()} className={`inline-flex h-7 items-center gap-1 rounded-[5px] border px-2.5 text-[10px] font-medium transition ${copied ? 'border-[#b9e5ce] bg-[#effaf4] text-[#2f9564]' : 'border-[#cfe0f8] bg-[#f7faff] text-[#3979c7] hover:border-[#8eb8ed] hover:bg-[#eef6ff] hover:text-[#278fee]'}`}><span className="flex items-center gap-1">{copied ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}{copied ? '已复制' : '复制 AI 提示词'}</span></button>
        <button type="button" onClick={() => setIsFullScreen((current) => !current)} className="inline-flex h-7 items-center gap-1 rounded-[5px] border border-[#cfe0f8] bg-[#f7faff] px-2.5 text-[10px] font-medium text-[#3979c7] transition hover:border-[#8eb8ed] hover:bg-[#eef6ff] hover:text-[#278fee]">{isFullScreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}{isFullScreen ? '退出全屏' : '全屏查看'}</button>
        <button type="button" aria-label="关闭需求说明" onClick={() => setOpen(false)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] text-[#8c97a6] transition hover:bg-[#f2f5f8] hover:text-[#334155]"><X className="h-3.5 w-3.5" /></button>
      </div>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
      <section className="overflow-hidden rounded-[14px] border border-[#e4e8ef] bg-white shadow-[0_8px_26px_rgba(38,55,82,.06)]">
        <div className="bg-[linear-gradient(135deg,#f5f8ff_0%,#ffffff_62%)] px-5 py-5">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-[4px] bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-semibold text-[#3979b7]">需求标识：V2610</span><span className="rounded-[4px] bg-[#fff7dc] px-2.5 py-1 text-[10px] font-medium text-[#a36d08]">2026年10月会员改版</span></div>
          <h1 className="mt-3 text-[22px] font-semibold tracking-[-.03em] text-[#243149]">{title} · 需求说明</h1>
          <p className="mt-2 text-[12px] leading-6 text-[#647187]">{subtitle}</p>
        </div>
        <div className="grid gap-3 border-t border-[#edf0f4] p-4 md:grid-cols-2">
          <div className="rounded-[10px] border border-[#edf0f4] bg-[#fbfcfe] p-4"><h2 className="text-[13px] font-semibold text-[#344158]">需求背景</h2><p className="mt-2 text-[11px] leading-5 text-[#6c788c]">{meta.background}</p></div>
          <div className="rounded-[10px] border border-[#e3ecfb] bg-[#f7faff] p-4"><h2 className="text-[13px] font-semibold text-[#344158]">需求目标</h2><p className="mt-2 text-[11px] leading-5 text-[#6c788c]">{meta.goal}</p></div>
        </div>
        <div className="border-t border-[#edf0f4] px-4 py-3"><div className="text-[10px] font-semibold text-[#536178]">所在路径</div><div className="mt-1 text-[11px] leading-5 text-[#778397]">{meta.path}</div></div>
        <section className="mx-4 rounded-[10px] border border-[#f1d98c] bg-[#fffaf0] p-4"><h2 className="text-[14px] font-semibold text-[#8b650d]">验证辅助项（非业务需求）</h2><p className="mt-1 text-[10px] leading-5 text-[#a07b28]">以下内容仅用于验证页面效果和规则，不属于产品业务功能，不纳入业务验收口径。</p><div className="mt-2 grid gap-2">{meta.verificationNotes.map((item) => <div key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#8a7133]"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#d4a62a]" />{item.replace(/^验证辅助项，不属于[^：]+：/, '')}</div>)}</div></section>
        <div className="space-y-3 border-t border-[#edf0f4] px-4 py-4">
          {sections.map((section, index) => <section key={section.title} className={`rounded-[10px] border p-4 ${section.highlight ? 'border-[#f2caca] bg-[#fff8f7]' : 'border-[#e8ecf2] bg-white'}`}>
            <div className="flex items-start gap-3"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] text-[10px] font-semibold ${section.highlight ? 'bg-[#fff0ed] text-[#c43f3f]' : 'bg-[#edf4ff] text-[#4c87d7]'}`}>{String(index + 1).padStart(2, '0')}</span><div><h2 className={`text-[14px] font-semibold ${section.highlight ? 'text-[#c43f3f]' : 'text-[#344158]'}`}>{section.title}</h2><p className="mt-1 text-[10px] leading-5 text-[#8b96a7]">{MEMBERSHIP_SECTION_DESCRIPTIONS[section.title] ?? '按页面功能拆分可定位、可验收的需求点。'}</p></div></div>
            <div className="mt-3 grid gap-2">{section.items.map((item, itemIndex) => <div key={item} className={`rounded-[8px] px-3 py-2.5 ${section.highlight ? 'bg-white/80' : 'bg-[#f8fafc]'}`}><div className={`text-[10px] font-medium ${section.highlight ? 'text-[#b34c4c]' : 'text-[#536178]'}`}>{getMembershipRequirementItemLabel(item, itemIndex)}</div><p className="mt-1 text-[11px] leading-5 text-[#778397]">{renderMembershipRequirementText(getMembershipRequirementItemContent(item, itemIndex))}</p></div>)}</div>
          </section>)}
        </div>
        <section className="mx-4 mb-4 rounded-[10px] border border-[#dfeafc] bg-[#f6f9ff] p-4"><h2 className="text-[14px] font-semibold text-[#344158]">验收标准</h2><div className="mt-2 grid gap-2">{meta.acceptance.map((item) => <div key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#647187]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4e9a7b]" />{item}</div>)}</div></section>
      </section>
    </div>
    </aside>
  </div>;

  return <div className={`z-[115] ${className}`}>
    {floatingButton()}
  </div>;
}
