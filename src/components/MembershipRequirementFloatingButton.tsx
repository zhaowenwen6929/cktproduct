import { useEffect, useState } from 'react';
import { Check, Clipboard, FileText, Maximize2, Minimize2, X } from 'lucide-react';

export type MembershipRequirementSection = {
  title: string;
  items: string[];
  highlight?: boolean;
};

export type MembershipRequirementDocumentMeta = {
  background: string;
  goal: string;
  path: string;
  acceptance: string[];
  verificationNotes: string[];
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
  goal: '将全新的会员支付弹框建设为首页会员入口、后续会员页入口和购买流程统一使用的会员服务入口；弹框内部按顶部 Banner、类型/时间切换、套餐展示、权益内容、支付和辅助说明模块组织，明确区分开通、续费、升级、降级与延期升级逻辑。会员弹框采用延期升级：将当前会员剩余价值折算为目标会员对应时长并叠加到新有效期，不在本弹框内误走补差价支付。',
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
    '会员支付弹框支持统一的打开、关闭、当前会员信息传递和补差价升级入口；首页会员入口、后续会员页入口和购买流程复用同一套会员服务能力，不重复实现会员套餐与支付逻辑。',
    '模块边界清晰：顶部 Banner、类型/时间切换、套餐区、权益内容、支付区、FAQ/需求说明分别可独立定位；模块之间围绕当前会员、当前身份、套餐选择、席位和支付结果联动。',
  ],
  verificationNotes: [
    '验证辅助项，不属于会员支付业务需求：身份切换选项用于模拟不同用户状态，验证开通、续费、升级、降级和席位规则。',
    '验证辅助项，不属于会员支付业务需求：V2610 标识、黄色需求说明按钮和说明面板用于需求定位与效果验收，不参与支付流程。',
  ],
};

const MEMBERSHIP_SECTION_DESCRIPTIONS: Record<string, string> = {
  '新增需求等级': '明确会员套餐管理中的会员名称、等级编号与页面默认等级表的对应关系，并标注哪些值来自后台配置、哪些值是固定回退。',
  '会员级别总体排列': '统一等级比较、页面展示顺序和可购买方向；排序按会员总排序维护，不由价格或套餐显示顺序推导。',
  '页面入口与路由范围': '定义页面真实入口和路由边界，避免把会员弹框和独立升级页混为一个入口。',
  '套餐显示区域（核心改动范围）': '本次改动原因是新增会员等级和套餐展示形式；红色虚线框只标记身份下方的组织方式、时间筛选、版本卡片、积分/席位等改造区域，不包含下方已有支付区域。',
  '展示方式与筛选': '定义身份、展示模式、时间项和套餐卡片的组织方式，保证窄屏下仍能访问全部选项。',
  '数据来源与筛选规则': '明确补差价升级套餐组、Web 新版套餐组、套餐明细字段及筛选聚合规则。',
  '默认选中与套餐切换': '定义首次进入、时间切换、积分档位切换以及价格和支付信息的联动范围。',
  '会员身份与购买限制': '定义不同会员身份下的开通、续费、升级、降级和不可购买反馈。',
  '企业席位与价格': '定义免费团队、已购团队、席位上下限和单席位价格的计算口径。',
  '支付区域与样式': '定义支付二维码、有效期、支付方式、卡片颜色和悬浮说明的展示边界。',
  '入口与页面范围': '定义会员中心弹框的真实入口和业务范围，不改变原有会员支付流程。',
  '页面数据来源': '明确会员页面配置、套餐明细、优惠券和支付选择的业务字段、来源位置及回退数据。',
  '身份切换与展示字段': '区分真实会员信息、固定验证身份、页面配置文案和套餐明细字段。',
  '会员等级与套餐选择': '定义页面会员等级、时间配置与套餐明细的关联、时间匹配、积分档位生成和切换联动。',
  '购买、续费、升级与降级规则': '定义按钮文案、延期升级、优惠限制、二维码显示和 toast 反馈。',
  '企业席位与价格计算': '定义当前团队人数、已购席位、企业单席位价格、20 席上限和实时总价公式。',
  '支付弹框字段与计算': '定义支付选择回传、套餐字段重匹配、金额、有效期、每积分价格和二维码生成边界。',
  '弹框样式与交互': '定义弹框容器、滚动、吸顶、关闭、说明面板和 V2610 视觉标识。',
  '统一使用方式与模块边界': '定义会员支付弹框的统一使用方式和模块之间的业务边界，保证会员页入口和购买流程复用同一套能力。',
  '顶部 Banner 模块': '定义促销文案、倒计时和视觉结构的来源边界；当前 Banner 文案和倒计时为固定前端展示规则，不与套餐价格字段混用。',
  '类型与时间切换模块': '定义个人/企业 tab、时间 options、更多收纳和购买积分入口的配置来源、排序与交互联动。',
  '套餐展示模块': '定义会员等级、套餐明细、积分档位、席位控件、按钮状态和卡片样式的字段映射与计算口径。',
  '支付与订单模块': '定义选中套餐如何传给支付弹框，支付金额、优惠、有效期和二维码的重算边界，以及不可购买时的替代提示。',
  '权益、FAQ 与辅助模块': '定义权益对比、模型消耗、商用授权、FAQ、优惠券、客服和需求说明的配置来源与交互边界。',
};

export const MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS: MembershipRequirementSection[] = [
  {
    title: '新增需求等级',
    items: [
      '等级字典：当前补差价升级页展示基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）220；会员支付弹框优先读取会员页面配置中的等级与展示文案，后台未配置时使用同一套默认等级表。',
      '后台对照：会员套餐管理 > Web端-新版/补差价升级套餐组 > 套餐明细中的会员名称字段用于显示会员名称，等级编号字段用于确定等级。',
      '等级名称：会员支付弹框的会员名称、展示名称和副标题读取会员页面配置；补差价升级页的卡片短名称和定位文案使用本次改版统一的等级展示规则，不从内部套餐名称截取。',
      '基础版（个人）（等级编号 240）：个人使用，模板设计与基础 AI 创作能力；专业版（个人）（等级编号 241）：个人使用，完整 AI 创作与更高积分额度。',
      '基础版（企业）（等级编号 310）：企业使用，团队协作、共享和商用授权；专业版（企业）（等级编号 311）：企业使用，AI 创作、团队协作与共享；旗舰版（企业）（等级编号 220）：企业使用，面向大型企业的高配额和灵活席位。',
    ],
  },
  {
    title: '会员级别总体排列',
    items: [
      '排序来源：会员总排序是统一的业务等级规则，不是套餐价格或套餐显示顺序计算出来的；同一等级分组内的会员视为同等级。',
      '会员总排序：4（限次会员）< 1 = 125 < 199 = 4（不限次） = 211 = 230 = 240 < 241 < 105 = 9 = 130 = 200 = 212 = 231 < 232 < 233 < 210 < 201 < 7 = 8 < 2 = 5 = 6 = 100 = 110 = 115 = 135 = 202 = 203 = 205 = 300 = 310 < 301 = 311 < 302 = 312 < 204 < 3 = 120 = 220。',
      '页面展示顺序：个人/企业 tab 内分别使用固定等级数组；个人为基础版（个人）< 专业版（个人），企业为基础版（企业）< 专业版（企业）< 旗舰版（企业）。',
      '购买判断：先将当前会员和目标套餐映射到会员总排序，再比较等级位置；相等允许叠加时长购买同等级，低等级可升级到高等级，高等级不可降级购买低等级。',
    ],
    highlight: true,
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
      '单席位价格来源：优先读取当前套餐的企业单席位价格；该字段为空时按会员等级回退：基础版（企业）310=300、专业版（企业）311=500、旗舰版（企业）220=800。',
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
      '首页右上角“会员中心”打开会员支付弹框，继续复用现有会员中心入口和弹框打开行为。',
      '会员支付弹框覆盖会员身份、个人/企业使用、套餐时长、会员等级、积分档位、优惠券、支付二维码、购买限制和续费升级操作。',
    ],
  },
  {
    title: '统一使用方式与模块边界',
    items: [
      '统一入口：全新的会员支付弹框由统一会员服务入口提供；首页顶部“会员中心”、后续会员页入口和会员购买流程均打开同一套弹框，不再各自复制会员套餐和支付流程。',
      '使用边界：弹框支持打开、关闭、传入当前会员信息以及进入补差价升级页；不同入口只负责触发入口行为，不负责重新拼装套餐和支付内容。',
      '状态边界：弹框内部维护当前身份、会员类型、时间选择、积分档位、企业席位、优惠券、支付选择和辅助弹框状态；入口侧只负责打开/关闭、传递当前会员和处理升级页跳转。',
      '模块关系：Banner 负责活动信息；类型/时间模块负责筛选条件；套餐模块负责输出选中的等级、时长、积分和席位；支付模块根据选中结果重新匹配套餐明细。',
      '复用限制：独立补差价升级页仍是单独页面和业务流程，本次统一会员弹框不承载补差价升级逻辑；会员弹框只负责延期升级，补差价入口进入独立升级页。',
    ],
  },
  {
    title: '顶部 Banner 模块',
    items: [
      '结构：Banner 位于会员弹框内容顶部，包含活动标签、主促销文案、赠送文案和右侧天/小时/分钟/秒倒计时；小屏隐藏倒计时块，保留左侧文案。',
      '文案来源：当前原型“✦ Seedance 2.5”“四重福利”“¥0.19超低单秒价备战双11”“最高额外加赠2个月会员、4万+积分”为固定前端活动文案；后续接入活动服务时应替换为活动配置字段，不从会员套餐明细推导。',
      '倒计时规则：活动倒计时使用固定活动时长，打开弹框时开始计算，每秒刷新并按天/小时/分钟/秒格式化；倒计时归零后显示 00，不影响套餐购买资格。',
      '样式：蓝到黄色渐变背景、圆角、阴影、白色标签和黄色赠送文案；Banner 只负责视觉活动信息，不承载会员等级、价格、积分或支付按钮。',
    ],
  },
  {
    title: '类型与时间切换模块',
    items: [
      '类型来源：会员页面配置中的类型名称显示个人使用/企业使用；切换后重新计算当前身份下的时间、套餐和最小席位。',
      '时间来源：会员页面配置中的时间名称、说明、折扣提示和有效时长；配置顺序或后台显示顺序决定展示顺序，Web 新版套餐有效数据可补齐缺失的时间项。',
      '更多规则：根据实际容器宽度判断时间项是否放得下，放不下时保留首项并将其余项收纳到“更多”；点击“更多”展开选项，选择后更新当前时间，首项不得被裁切。',
      '购买积分：右侧“购买积分”是固定功能入口，字号与时间条一致；点击只打开积分购买辅助弹框，不改变当前套餐和会员类型状态。',
      '联动限制：切换类型或时间后只重置对应筛选状态；套餐区根据新的身份和时间重新筛选可用套餐，优惠券与支付信息同步匹配。',
    ],
  },
  {
    title: '套餐展示模块',
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
    title: '支付与订单模块',
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
    title: '权益、FAQ 与辅助模块',
    items: [
      '权益数据：details、modelConsumption、commercialLicense、faq 从会员页面配置同名字段读取；PlanCard 的 features/benefitSections 仅展示当前会员等级权益，不参与价格计算。',
      '权益样式：权益区域跟随页面配置的卡片颜色、强调样式和专享权益内容；专享权益二维码说明固定在右侧上下结构，视觉标记不覆盖业务内容。',
      'FAQ 入口：常见问题第 8 条点击“请点击此处”进入 /membership-upgrade；FAQ 本身不直接创建补差价订单。',
      '辅助弹框：优惠券/码、购买积分、企业咨询客服、挽留弹框和支付弹框分别管理打开/关闭状态，关闭辅助弹框不关闭会员中心主弹框。',
      '需求说明：右下角 V2610 黄色悬浮按钮和左侧抽屉是验收辅助工具，不参与会员价格、资格、支付和有效期计算；抽屉支持全屏查看、复制 AI 提示词和 ESC 关闭。',
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
            <div className="mt-3 grid gap-2">{section.items.map((item, itemIndex) => <div key={item} className={`rounded-[8px] px-3 py-2.5 ${section.highlight ? 'bg-white/80' : 'bg-[#f8fafc]'}`}><div className={`text-[10px] font-medium ${section.highlight ? 'text-[#b34c4c]' : 'text-[#536178]'}`}>{getMembershipRequirementItemLabel(item, itemIndex)}</div><p className="mt-1 text-[11px] leading-5 text-[#778397]">{getMembershipRequirementItemContent(item, itemIndex)}</p></div>)}</div>
          </section>)}
        </div>
        <section className="mx-4 mb-4 rounded-[10px] border border-[#dfeafc] bg-[#f6f9ff] p-4"><h2 className="text-[14px] font-semibold text-[#344158]">验收标准</h2><div className="mt-2 grid gap-2">{meta.acceptance.map((item) => <div key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#647187]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4e9a7b]" />{item}</div>)}</div></section>
      </section>
    </div>
    </aside>
  </div>;

  return <div className={`fixed z-[115] ${className}`}>
    {floatingButton()}
  </div>;
}
