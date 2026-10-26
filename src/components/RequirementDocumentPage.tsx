import { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Clipboard, ClipboardList, FileText, Maximize2, Minimize2, X } from 'lucide-react';
import { MEMBERSHIP_CENTER_REQUIREMENT_SECTIONS, MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS, MEMBERSHIP_UPGRADE_REQUIREMENT_SECTIONS, type MembershipRequirementSection } from './MembershipRequirementFloatingButton';

type RequirementKind = 'ai-ecommerce' | 'search-guide' | 'membership';

type RequirementSectionItemData = {
  label: string;
  content: string;
  path?: string;
};

type RequirementSectionGroup = {
  title: string;
  items: RequirementSectionItemData[];
};

type RequirementSection = {
  title: string;
  description: string;
  items: RequirementSectionItemData[];
  groups?: RequirementSectionGroup[];
};

export type RequirementSpec = {
  title: string;
  requirementKey: string;
  status: string;
  eyebrow: string;
  summary: string;
  background: string;
  goal: string;
  sections: RequirementSection[];
  acceptance: string[];
  verificationNotes?: string[];
};

const toRequirementDocumentSections = (prefix: string, sections: MembershipRequirementSection[]): RequirementSection[] => sections.map((section) => ({
  title: prefix ? `${prefix} · ${section.title}` : section.title,
  description: '',
  items: section.items.map((content, index) => ({ label: `${section.title}${index + 1}`, content })),
}));

const requirementSpecs: Record<RequirementKind, RequirementSpec> = {
  membership: {
    title: '2026年10月会员改版',
    requirementKey: 'V2610',
    status: '待开发',
    eyebrow: 'MEMBERSHIP EXPERIENCE REDESIGN',
    summary: '统一完善会员开通、会员套餐、会员页面配置、会员支付弹框和补差价升级页能力，并将会员购买、续费、升级、降级规则与数据来源沉淀为一套可实现、可验收的 V2610 规范。',
    background: '会员中心后台包含开通会员、会员套餐管理和会员页面配置等多个入口，前台又有会员中心弹框和补差价升级独立页面；新增个人/企业会员等级后，原有入口无法完整表达套餐积分档位、企业席位和购买方向。本次改版需要同时明确后台字段、前端固定字典、价格/席位计算值以及验证辅助项的边界，避免把演示身份切换或需求说明工具误认为业务需求。',
    goal: '建立一套可直接实现和验收的会员管理后台及前台会员页面数据口径：新增 5 个会员等级，统一会员名称、等级编号、套餐时长、积分量、价格、席位、页面配置和购买限制的来源；首页会员入口、后续会员页入口和购买流程统一使用同一会员支付弹框，弹框使用延期升级，独立升级页使用补差价支付，并按模块维护交互、样式和验收边界。',
    sections: [
      ...toRequirementDocumentSections('', MEMBERSHIP_LEVEL_OVERVIEW_SECTIONS),
      {
        title: '开通会员新增新会员等级',
        description: '开通会员页沿用套餐管理中的完整会员类型列表，新增等级必须同步展示名称和 level。',
        items: [
          { label: '入口位置', content: '会员中心 > 开通会员，进入后左侧会员中心目录默认展开并选中开通会员。' },
          { label: '会员类型', content: '会员类型来源为会员套餐管理中的会员名称字段；后台配置的会员类型列表作为唯一业务来源，不能从卡片显示名称反推等级。' },
          { label: '新增等级', content: '新增等级为基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）220；名称取会员名称字段，等级数字取等级编号字段；后台未配置时，会员页面按本次改版默认等级表回退。' },
          { label: '开通表单', content: '包含用户ID、会员类型、会员时长、成员人数、积分量、发放单位、发放周期、支付状态、支付金额、开通公司名称和开通原因；新会员等级积分量为必填项，历史会员等级按等级积分量回显且不可修改。终身会员按99年识别。' },
          { label: '积分量说明', content: '历史会员开通时积分量非必填，前端按会员等级自动回显等级积分量并锁定；新会员等级仍可配置具体值、发放单位和周期。' },
          { label: '专业版布局', content: '切换专业版后隐藏会员类型，增加“配置域名”页签和配置域名字段，保留用户ID、会员时长、成员人数、积分量、支付状态、支付金额、开通公司名称和开通原因。' },
          { label: '企业历史记录', content: '企业会员历史记录按记录类型和支付状态筛选，列表在成员人数后展示积分量；积分量沿用会员套餐列表规则，空值显示“按会员等级发”，已配置值显示“具体值/单位/周期”。' },
        ],
      },
      {
        title: '会员套餐管理与积分量',
        description: '套餐详情、新增套餐和编辑套餐中统一展示积分量配置，并保留历史套餐兼容逻辑。',
        items: [
          { label: '积分量配置', content: '后台套餐明细中的积分量、发放单位和发放周期为统一配置项；新会员等级积分量为必填项，填写非负整数；发放单位默认每人，可选团队；发放周期默认按月，可选一次性。前台卡片不从会员名称猜积分，直接读取当前选中套餐的这三项配置。' },
          { label: '历史套餐', content: '历史等级创建套餐时，积分量按所属会员等级自动回显且不可编辑；终身会员按套餐时长99年识别，即按天字段填写36135天。' },
          { label: '列表展示规则', content: '积分量为空时显示固定文案“按会员等级发”；已配置具体值时显示“积分量/发放单位/发放周期”，例如“600/每人/按月”。会员支付和补差价页面的积分档位只使用已填写积分量且状态为显示的套餐。' },
          { label: '积分发放规则', content: '购买套餐时，对应用户/团队的积分量按照购买套餐对应的「积分量」设置进行发放；每次购买将立即按生效套餐发放，上一笔对应的未使用积分量失效。优先查询用户当前生效套餐对应的积分量，套餐中未配置积分量的，按照套餐对应会员等级的积分量和规则发放。' },
          { label: '改动标识', content: '具体功能点显示 V2610 需求标识并支持查看需求说明；上级目录只显示红点，标识和说明不能遮挡原有功能内容。' },
        ],
      },
      {
        title: '会员页面配置',
        description: '先管理页面版本，再进入具体版本配置会员页面内容。',
        items: [
          { label: '版本管理', content: '会员页面配置入口默认展示页面版本列表，支持新增页面版本，并通过开关切换已增加版本的状态。' },
          { label: '版本进入', content: '点击“2026年10版本会员页”进入该版本的会员页配置；进入配置页时左侧自动展开会员中心并保持页面上下文。' },
          { label: '配置内容', content: '支持网页版和移动端，配置套餐、权益概览、权益明细、模型消耗、商用授权和常见问题等模块，会员套餐价格和积分沿用真实套餐数据。' },
          { label: '保存与查看', content: '具体需求说明通过右侧边栏展示，可继续全屏查看；需求标识和状态在说明区域中同步展示。' },
        ],
      },
      {
        title: '会员支付弹框组件化',
        description: '全新的会员支付弹框作为统一会员入口承载会员页访问、套餐选择和购买支付，后续所有相关入口均统一调起，并按模块补齐数据来源与验收口径。',
        items: [
          { label: '统一使用方式', content: '本次会员支付弹框为全新会员服务入口；首页顶部“会员中心”、后续会员页入口、会员购买入口和支付流程统一打开这一弹框，不再分别实现会员套餐和支付流程。弹框需要支持统一的打开、关闭、当前会员信息和补差价升级入口。' },
          { label: '模块划分', content: '弹框拆分为顶部 Banner、类型/时间切换、套餐展示、权益内容、支付与订单、FAQ/优惠券/客服/需求说明辅助模块；各模块围绕当前会员、当前身份、套餐选择和支付结果联动。' },
          { label: '统一入口', content: '首页右上角“会员中心”、后续会员页入口、会员购买入口和支付流程均使用同一会员支付弹框；支持通过链接中的约定标识符调起并识别打开场景。链接标识符只负责进入指定会员场景，不改变当前用户身份、套餐价格和购买资格。补差价升级仍由 FAQ 第 8 条进入 /membership-upgrade，不把延期升级和补差价升级混为一套支付逻辑。' },
          { label: '数据边界', content: '页面配置和套餐明细从现有后台原型配置读取，会员身份、价格、积分、席位和有效期分别按字段、固定字典或计算规则使用；Banner 活动文案属于固定前端活动配置，不从套餐名称推导。' },
          { label: '验收重点', content: '可从不同入口打开同一会员支付弹框；类型、时间、积分和席位切换后卡片与二维码金额同步；不可购买时显示原因而不生成二维码；弹框打开和关闭状态在各入口保持一致。' },
        ],
      },
      {
        title: '本次新增需求与会员购买状态规则',
        description: '本节汇总本次会员改版新增的业务规则，供会员弹框和补差价升级页共同引用；身份切换、需求说明、虚线框等仅属于验证辅助项，不纳入业务需求。',
        items: [
          { label: '新增会员等级', content: '新增基础版（个人）（等级编号 240）、专业版（个人）（等级编号 241）、基础版（企业）（等级编号 310）、专业版（企业）（等级编号 311）、旗舰版（企业）（等级编号 220）。会员名称和等级编号均取后台套餐明细中的会员等级配置；无配置时才使用页面预设的等级字典回退，不能根据价格或套餐名称推断等级。' },
          { label: '会员总排序', content: '统一按会员总排序进行等级比较：4（限次会员）< 1 = 125 < 199 = 4（不限次） = 211 = 230 = 240 < 241 < 105 = 9 = 130 = 200 = 212 = 231 < 232 < 233 < 210 < 201 < 7 = 8 < 2 = 5 = 6 = 100 = 110 = 115 = 135 = 202 = 203 = 205 = 300 = 310 < 301 = 311 < 302 = 312 < 204 < 3 = 120 = 220；同一分组视为同等级，排序不由价格或套餐显示顺序计算。' },
          { label: '购买按钮状态', content: '免费用户购买任一可购买套餐时显示“立即开通”；当前会员与目标套餐同等级时显示“立即续费”，允许叠加时长；当前会员低于目标等级时显示“立即升级”；当前会员高于目标等级时视为降级购买，按钮不可购买并提示“请购买 XX 及以上会员”，不生成支付二维码。' },
          { label: '延期升级与补差价边界', content: '会员支付弹框只执行延期升级：将当前会员剩余价值按目标会员价格折算为对应时长，再叠加到新会员有效期，不创建补差价订单。补差价升级页是 FAQ 第 8 条进入的独立页面，只改造套餐显示区域，选中可购买套餐后由下方既有支付区域完成补差价支付。' },
          { label: '企业席位规则', content: '企业免费身份按当前团队实际成员数填充席位；已购买团队会员按已购买席位数填充，最小席位数不得低于当前实际成员数或已购席位数；最大购买席位数为 20，输入超过 20 自动回落到 20 并 toast 提示。企业自动续费/签约套餐只支持 1 席位且不能购买扩展席位，需提示选择企业使用的非签约套餐。' },
          { label: '企业价格计算', content: '企业套餐基础价、套餐时长和积分量读取套餐明细；单席位价格当前按会员等级配置为基础版（企业）300、专业版（企业）500、旗舰版（企业）800。N 个席位总价 = 基础价 +（N - 1）× 单席位价格；席位、积分档位或套餐切换后同步重算卡片金额和支付金额。' },
          { label: '套餐与字段来源', content: '会员支付弹框优先读取会员页面配置中的会员类型、时间、会员等级和展示文案，再关联 Web端-新版套餐组（ID 8）的套餐明细；补差价升级页读取补差价升级套餐组（ID 9），新增会员套餐由 ID 8 同步复制全部业务字段。积分量读取积分量、发放单位和发放周期字段，价格读取当前售价、原价和折扣字段，排序读取显示顺序字段，席位单价读取企业单席位价格字段；同一等级、时长和套餐类型下有多个积分量时才显示积分切换。' },
          { label: '不可购买展示', content: '购买资格判断在生成支付二维码前执行；签约套餐、降级套餐、席位超出可购买范围或其他限制命中时，按钮位置保留原因提示，展示对应 toast/卡片提示，不展示支付二维码，不创建支付订单。' },
          { label: '改动范围', content: '会员支付弹框拆分为顶部 Banner、类型与时间切换、套餐、权益、支付与订单、FAQ/优惠券/客服/需求说明模块，并作为统一会员入口复用；补差价升级页只改造个人/企业、按时间/按会员、套餐卡片、积分和席位区域，下方已有支付区域保持原布局并接收选中套餐结果。' },
        ],
      },
      {
        title: '会员补差价升级页',
        description: '因新增会员等级和套餐展示形式，改造补差价升级页的套餐显示区域；下方已有支付区域沿用原能力，仅接收选中的套餐结果。',
        items: [
          { label: '页面入口', content: '会员中心 > 会员补差价升级页，页面独立展示用户套餐信息、单人/团队切换和升级套餐。', path: '/membership-upgrade' },
          { label: '数据来源', content: '读取会员套餐管理中的“Web端-新版-补差价页面”套餐组（ID 9）；正式接入时由套餐组查询结果提供页面数据。新增会员套餐由 Web端-新版套餐组（ID 8）对应等级的数据同步复制，必须保留来源套餐的全部业务配置，不能只复制会员名称。', path: '/membership-upgrade' },
          { label: '字段与筛选', content: '套餐名称取后台配置的显示名称，时长取有效天数/时长名称，排序取后台显示顺序，价格取当前售价、划线原价和折扣信息，订阅识别取套餐类型，积分取积分量、发放单位、发放周期和积分说明，席位单价取企业单席位价格；仅状态为显示且已配置积分量的套餐参与时间和积分档位展示。', path: '/membership-upgrade' },
          { label: '等级与套餐', content: '个人使用和企业使用的等级展示来自会员等级配置；每个等级按后台显示顺序最靠前的时间组默认选中，组内按积分量从小到大默认选中第一个积分档位，并展示当前套餐的价格、划线原价、积分说明和支付金额。', path: '/membership-upgrade' },
          { label: '积分切换', content: '同一会员等级、同一有效时长、同一套餐类型下存在多个积分量时才显示积分切换控件；切换后重新匹配对应套餐，价格、每积分价格、积分说明和二维码金额全部使用新套餐重新计算。', path: '/membership-upgrade' },
          { label: '支付区域', content: '套餐显示区域下方继续使用已有支付区域，展示支付二维码、实际应付金额、成员席位提示、支付协议和支付宝/微信支付方式；切换套餐后仅同步更新金额和支付数据，不改动支付区域布局。', path: '/membership-upgrade' },
        ],
      },
      {
        title: '首页会员中心入口',
        description: '首页顶部导航的会员入口统一使用会员中心文案，并与会员改版需求保持一致。',
        items: [
          { label: '入口位置', content: '创客贴首页 > 顶部导航 > 会员中心。' },
          { label: '入口文案', content: '右上角原“开通会员”改为“会员中心”，点击后继续打开已有会员中心弹框。' },
          { label: '需求标识', content: '入口改动区域展示 V2610 需求标识，标识放在改动区域外侧，不遮挡会员中心按钮。' },
        ],
      },
      {
        title: '需求标识与展示规则',
        description: '通过统一标识区分同一主需求下的不同修改点，降低开发对齐成本。',
        items: [
          { label: '主需求标识', content: '2026年10会员改版使用唯一短标识 V2610，所有相关子需求、页面入口和具体功能点沿用该标识。' },
          { label: '状态展示', content: '需求说明展示完整需求名称、需求标识和状态；待开发使用红色标识，已上线使用绿色标识。' },
          { label: '入口规则', content: '上级目录只展示红点提示是否存在待开发需求；具体功能目录显示需求标识，功能页改动区域显示需求标识和需求说明。' },
          { label: '遮挡处理', content: '需求标识放在改动区域虚线框外侧；需求说明弹层自动避让顶部、底部和页面边界，确保内容完整可见。' },
        ],
      },
      ...toRequirementDocumentSections('会员补差价升级页', MEMBERSHIP_UPGRADE_REQUIREMENT_SECTIONS.slice(2)),
      ...toRequirementDocumentSections('会员支付弹框', MEMBERSHIP_CENTER_REQUIREMENT_SECTIONS.slice(2)),
    ],
    acceptance: [
      '开通会员页的会员类型与会员套餐管理完全共用同一份列表，新增 5 个会员等级名称和 level 展示一致。',
      '会员套餐列表、套餐详情、新增套餐和编辑套餐均按统一规则展示积分量，并正确处理空值和已配置值。',
      '积分发放优先使用当前生效套餐配置，套餐未配置时回退到对应会员等级配置，规则说明分条清晰展示。',
      '会员页面配置支持版本新增、状态开关和进入具体版本配置，默认版本与左侧目录状态正确。',
      'V2610 主需求说明明确列出新增 5 个会员等级、完整会员总排序及同等级续费、低等级升级、高等级禁止降级的判断规则；会员弹框和补差价升级页使用同一套等级字典。',
      '免费用户、同等级会员、低等级会员和高等级会员分别显示开通、续费、升级和不可购买状态；不可购买套餐显示明确原因，不生成二维码或支付订单。',
      '会员支付弹框的升级按延期升级执行，将当前剩余价值折算为目标会员时长后叠加；补差价升级页仅由独立页面和既有支付区域执行补差价，两套流程边界清晰。',
      '企业免费身份使用实际成员数、已购团队会员使用已购席位数作为初始席位；席位范围遵守最小值、20 人上限、签约套餐 1 席位限制，价格按基础价 +（N - 1）× 单席位价格计算。',
      '首页右上角入口显示“会员中心”，点击后继续打开会员中心弹框，入口附近显示 V2610 且不遮挡按钮。',
      '会员补差价升级页从 ID 9 套餐组读取数据，并能追溯到 ID 8 Web 新版新增会员的完整配置；页面明确展示每个字段的来源、固定回退和计算规则，不把前端演示数据描述成真实接口。',
      '同一等级、同一时长存在多个积分量时才显示积分切换；切换不同积分量后，价格、划线原价、每积分价格、积分说明和二维码金额都按对应套餐行更新。',
      '会员补差价升级页和会员支付弹框均展示 V2610 黄色需求说明悬浮按钮，点击后从按钮左侧打开可滚动说明，正文覆盖等级、排序、数据、字段、规则和样式。',
      '需求说明正文不包含过程讨论或修改记录，页面标识、需求列表、需求说明和验收标准均使用同一套会员等级、价格和购买限制口径。',
      'V2610 在具体功能点、需求说明和页面入口处保持一致，上级目录仅显示待开发红点，已上线标识变为绿色。',
      '所有需求标识和说明均不遮挡原有表单、表格、下拉选项及操作按钮，弹层在可视区域内完整展示。',
    ],
  },
  'ai-ecommerce': {
    title: 'AI电商配置',
    requirementKey: 'AIE-2610',
    status: '待开发',
    eyebrow: 'AI E-COMMERCE CONFIGURATION',
    summary: '在管理后台统一查询和维护 AI 电商功能配置，支持从 moni 读取预置 JSON、在线编辑配置，并在清理缓存后让新配置立即生效。',
    background: 'AI 电商能力持续增加后，功能配置分散在数据和服务侧，运营同学缺少一个可视化入口来确认当前配置、快速修改参数和验证配置是否已经生效。',
    goal: '提供一个低学习成本的配置管理入口，降低配置查询、变更和缓存处理的沟通成本；完整保留服务端 JSON 原始结构，方便研发与运营协作。',
    sections: [
      {
        title: '入口与权限',
        description: '页面属于现有创客贴管理后台，沿用后台账号和权限体系。',
        items: [
          { label: '菜单位置', content: '灵感社区 > 玩法管理 > AI电商配置。' },
          { label: '可见范围', content: 'admin、operator 可以查询、编辑配置和清理缓存；viewer 仅可查看和复制 JSON，不显示修改、保存和清理缓存操作。' },
          { label: '页面返回', content: '通过左侧管理后台 Logo 或页面返回入口回到需求目录，路由变化不影响已有后台页面。' },
        ],
      },
      {
        title: '配置查询',
        description: '通过业务侧真实使用的功能标识定位 moni 中的预置配置，场景根据实际配置可选。',
        items: [
          { label: '查询项', content: '功能标识（function_code）必填，场景（scene）可选。例如 ags-live-visual-material 可按具体场景查询；ags-aplus-detail 的实际配置 scene 为空，允许只填写功能标识查询。' },
          { label: '数据来源', content: '查询 moni 的 Agent Skill 配置接口，读取返回的 config、skill_code、scene 和 update_time；页面以服务端返回的预置 JSON 为准，不使用本地示例数据替代查询结果。' },
          { label: '初始与重置', content: '首次进入页面时查询项和结果区域均为空，不主动展示任何配置。重置清空功能标识、场景、查询结果和状态。' },
          { label: '首次使用示例', content: '空状态下提供可操作的示例“ags-aplus-detail”，并说明 scene 可留空；点击“使用示例”后只回填功能标识和场景，用户确认输入无误后再点击查询。' },
          { label: '最近查询', content: '查询成功后记住最近 5 次功能标识与场景组合；再次聚焦查询输入框时展示历史记录，点击记录可直接回填并重新查询。场景为空的记录显示为默认场景。' },
          { label: '无结果与错误', content: '功能标识为空时提示补充查询条件；接口无数据时展示“未找到对应的 AI 电商配置”，并显示当前查询的 function_code 和 scene；接口请求失败时展示失败原因和重试引导。' },
        ],
      },
      {
        title: 'JSON 配置查看与编辑',
        description: '完整保留服务端返回的配置 JSON，支持原地修改，不再额外打开编辑弹框。',
        items: [
          { label: '查看区域', content: '以深色代码区域展示完整 JSON，提供复制按钮；代码框高度根据可视区域自适应，内容过长时在框内滚动。头部只展示当前 function_code 和 scene，不展示字段数量、配置中心/启用状态绿标或预览图。' },
          { label: '结构兼容', content: '不根据固定字段数量统计配置，也不要求必须符合某一套 fields 结构；只要接口返回合法 JSON，就完整展示其原始内容，支持不同 Agent Skill 配置结构共用页面。' },
          { label: '修改流程', content: '点击修改后直接在 JSON 框内编辑，实时校验 JSON 格式；格式错误时禁用保存并展示错误原因，不因字段数量或预览结构不同而误判。' },
          { label: '保存确认', content: '点击保存后弹出二次确认，确认后更新当前配置并提示保存成功；取消则回到编辑状态。' },
        ],
      },
      {
        title: '功能缓存清理',
        description: '为配置变更提供明确、可控的生效操作。',
        items: [
          { label: '触发条件', content: '清理缓存按钮位于查询按钮后，必须填写具体 function_code 才可点击，清理目标为该功能对应的缓存。' },
          { label: '确认提示', content: '点击后提示：“缓存清理后更新的配置将会立即生效，是否继续操作？”同时展示当前功能标识。' },
          { label: '完成反馈', content: '确认后关闭弹框，并展示已提交清理的功能标识；实际缓存清理由后端接口完成。' },
        ],
      },
      {
        title: '接口与数据依赖',
        description: '页面依赖 moni 配置服务和后台权限体系，查询结果必须与实际预置配置保持一致。',
        items: [
          { label: '配置查询', content: '调用 moni Agent Skill 配置查询能力，按 skill_code 查询；scene 有值时作为查询条件，scene 为空时按空场景配置查询，返回 JSON、实际 scene 和更新时间。' },
          { label: '配置更新', content: '提交校验通过的 JSON，服务端需要做结构校验、权限校验和更新记录。' },
          { label: '缓存清理', content: '按 function_code 清理对应功能缓存，返回成功、失败及失败原因。' },
        ],
      },
    ],
    acceptance: [
      '首次进入 AI电商配置时页面为空；输入有效 function_code 后能够查询并展示 moni 中对应的预置 JSON。',
      'scene 可为空；scene 有值或为空时都不会误展示其他配置，页面展示服务端返回的实际 function_code / scene。',
      '空状态提供可点击的首次使用示例，点击后能正确回填 ags-aplus-detail 和空 scene，并由用户点击查询完成查询。',
      '查询成功后能保留最近 5 次查询，聚焦查询框可回填并再次查询；无结果、参数不完整和接口失败状态提示清晰。',
      'JSON 编辑支持任意合法配置结构、格式校验、取消、二次确认保存和复制，长 JSON 不撑破页面布局。',
      '未填写 function_code 时不能清理缓存，确认后能明确反馈对应功能标识。',
    ],
  },
  'search-guide': {
    title: '搜索引导管理',
    requirementKey: 'SG-2610',
    status: '待开发',
    eyebrow: 'GUIDED SEARCH MANAGEMENT',
    summary: '维护搜索引导词节点、节点关系及真实查询映射，让运营同学可以从实体词典和关系数据追踪用户最终看到的引导胶囊。',
    background: '搜索引导能力依赖节点、关系和离线映射结果共同工作，现有数据缺少统一的后台维护和排查入口，运营无法快速判断某个业务搜索词为什么命中或未命中引导词。',
    goal: '建立以实体词典为入口的搜索引导管理页面，支持节点与关系导入维护，并按实际业务搜索词查看排序后的映射结果。',
    sections: [
      {
        title: '入口与导航层级',
        description: '入口位于内容运营管理，和实体词典保持同一级。',
        items: [
          { label: '菜单位置', content: '创客贴管理后台 > 内容运营管理 > 搜索管理 > 搜索引导管理。搜索引导管理与实体词典保持同一级。' },
          { label: '权限差异', content: 'admin、operator 可导入、编辑、启用/禁用和删除；viewer 只读，不展示编辑类操作。' },
          { label: '页面形态', content: '三个 Tab 共用页面容器，切换 Tab 不跳转新页面，并保留各自的筛选条件。' },
        ],
      },
      {
        title: '引导词节点 Tab',
        description: '管理 guided_search_node 表，维护引导词的基础信息和层级关系。',
        items: [
          { label: '筛选与操作区', content: '筛选项与操作按钮保持同一行，左侧支持关键词、归一化键、层级、关键词类型、状态、地区、语言和数据来源筛选，关键词类型包括颜色、风格、行业、场景、节日、用途、格式、主体、氛围、品牌和其他；筛选项后提供蓝色“查询”按钮，右侧只保留“导入数据”，不在操作区展示数据总数。' },
          { label: '表格内容', content: '展示节点编号、关键词、归一化键、层级、父节点编号、关键词类型、地区、语言、外部评分、状态、数据来源、更新时间、更新人和操作列。默认示例包含手机海报、简历、招聘、极简风、互联网、餐饮。' },
          { label: '编辑与删除', content: '每条节点支持编辑和删除。点击编辑弹出回填当前数据的表单，节点编号和关键词不可编辑，其余字段支持修改并保存；编辑表单不展示更新人，保存时自动使用当前登录账号记录更新人并更新更新时间；父节点编号使用节点列表下拉选择，展开后可按关键词、节点编号或归一化键搜索，当前节点不可选择为自己的父节点；数据来源使用下拉选择，选项包括模板类目树、模板标签、素材标签、搜索日志、运营种子和 LLM 候选。点击删除必须先二次确认，确认后移除对应节点。' },
          { label: '导入预览', content: '上传 CSV/Excel 后先预览，展示行号、关键词、归一化键、层级、父节点和校验结果；错误行标红，可下载错误行，仅当存在通过行时允许确认导入。' },
        ],
      },
      {
        title: '引导词关系 Tab',
        description: '管理 guided_search_edge 表，支持多父挂载和关系数据校验。',
        items: [
          { label: '筛选与操作区', content: '筛选项与操作按钮保持同一行，左侧支持父/子节点编号或关键词、关系类型、状态、权重范围和数据来源筛选，筛选项后提供蓝色“查询”按钮，右侧只保留“导入数据”，不在操作区展示数据总数。' },
          { label: '校验规则', content: '预览时校验两端节点是否存在、是否自环、是否重复、父子关系是否跳级（警告）以及是否成环（错误）。' },
          { label: '示例关系', content: '默认展示手机海报(1001)到招聘(1010)、极简风(1020)，以及简历(1003)到招聘(1010)，体现招聘节点可被多个父节点挂载。' },
          { label: '编辑与删除', content: '每条关系展示更新人，并支持编辑和删除。点击编辑弹出回填当前数据的表单，关系编号不可编辑，其余字段支持修改并保存；编辑表单不展示更新人，保存时自动使用当前登录账号记录更新人并更新更新时间；数据来源使用同一组下拉选项；点击删除必须先二次确认，确认后移除对应关系。' },
        ],
      },
      {
        title: '查询映射 Tab',
        description: '只读查看真实搜索词对应的引导胶囊和排序结果。',
        items: [
          { label: '查询区', content: '输入业务搜索词，选择地区和语言后查询；可查看归一化查询键，并支持按关键词类型、召回来源二次筛选。关键词类型包括颜色、风格、行业、场景、节日、用途、格式、主体、氛围、品牌和其他。' },
          { label: '查询结果', content: '展示原始输入、归一化查询键、地区、语言、命中条数和胶囊预览；结果表按排序位置升序展示引导节点编号、关键词、分数、召回来源、用户分群、近7日点击率和过期时间。' },
          { label: '空态', content: '未输入时提示输入业务搜索词；无结果时展示“该查询词暂无映射配置”，并提示检查节点/关系或等待离线任务。' },
        ],
      },
      {
        title: '接口与数据依赖',
        description: '页面不新定义数据库结构，依赖现有或待补齐的服务能力。',
        items: [
          { label: '节点能力', content: '节点列表、导入预览、导入、编辑、删除，以及节点启用/禁用能力；操作按钮与状态互相映射，启用状态显示“禁用”，禁用状态显示“启用”，编辑保存后记录更新时间和更新人。' },
          { label: '关系能力', content: '关系列表、导入预览、导入、编辑、删除、启用/禁用和关系校验能力；操作按钮与状态互相映射，删除前必须二次确认。' },
          { label: '映射能力', content: '按 query_key + region + language 查询 guided_search_mapping，并返回排序与统计字段。' },
        ],
      },
    ],
    acceptance: [
      '内容运营管理展开后，搜索引导管理与实体词典同级，能够从菜单正常进入。',
      '节点和关系导入均先预览校验，错误行清晰标识，不允许绕过错误直接入库。',
      '查询映射只读，能够直观看到胶囊顺序、归一化查询键和结果排序，业务可见字段使用中文名称。',
      '无数据、无结果、加载中和导入失败等状态都有明确反馈，不影响其他 Tab 的筛选条件。',
      '节点列表展示并可按地区、语言、数据来源查询，关系列表可按数据来源查询；筛选通过蓝色“查询”按钮提交，列表操作保留编辑、启用/禁用和删除，不提供查看和导出操作；启用状态的操作按钮为“禁用”，禁用状态的操作按钮为“启用”。',
      '节点和关系列表展示更新人；编辑表单回填当前数据，节点编号/关键词或关系编号不可编辑，保存后列表立即更新；删除必须二次确认。',
    ],
  },
};

function buildAiPrompt(spec: RequirementSpec) {
  const sections = spec.sections.map((section, index) => {
    const items = section.items.map((item) => `- ${item.label}：${item.content}`).join('\n');
    const groups = section.groups?.map((group) => {
      const groupItems = group.items.map((item) => `- ${item.label}：${item.content}`).join('\n');
      return `#### ${group.title}\n${groupItems}`;
    }).join('\n\n') ?? '';
    return `### ${index + 1}. ${section.title}\n${section.description}\n${items}${groups ? `\n${groups}` : ''}`;
  }).join('\n\n');

  const verification = spec.verificationNotes?.length ? `\n\n## 验证辅助项（非业务需求）\n${spec.verificationNotes.map((item) => `- ${item}`).join('\n')}` : '';
  return `你是一名资深后台产品经理、交互设计师和前端开发者。请严格根据下面的需求说明，设计并实现“${spec.title}”功能，不要擅自扩展业务范围。\n\n## 需求概述\n${spec.summary}\n\n## 需求背景\n${spec.background}\n\n## 需求目标\n${spec.goal}\n\n## 具体需求\n${sections}\n\n## 验收标准\n${spec.acceptance.map((item) => `- ${item}`).join('\n')}${verification}\n\n## 输出要求\n请先梳理页面信息架构、组件划分、交互流程、接口依赖、权限差异、空态、加载态和错误态，再给出实现方案。保持现有项目的视觉风格和路由结构；涉及接口时说明请求参数、返回数据和异常处理，不要编造未确认的后端能力。`;
}

function RequirementSectionItem({ item, compact = false, onNavigate }: { item: RequirementSectionItemData; compact?: boolean; onNavigate?: (path: string) => void }) {
  const className = compact ? 'rounded-[8px] bg-[#f8fafc] px-3 py-2.5 text-left transition' : 'rounded-[9px] bg-[#f8fafc] px-4 py-3 text-left transition';
  const content = <><div className={compact ? 'text-[11px] font-medium text-[#536178]' : 'text-[12px] font-medium text-[#536178]'}>{item.label}</div><p className={compact ? 'mt-1 text-[11px] leading-5 text-[#778397]' : 'mt-1.5 text-[12px] leading-5 text-[#778397]'}>{item.content}</p>{item.path && onNavigate ? <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#278fee]">查看对应页面<ChevronRight className="h-3 w-3" /></span> : null}</>;

  if (item.path && onNavigate) {
    return <button type="button" onClick={() => onNavigate(item.path!)} className={`${className} w-full hover:bg-[#eef6ff] hover:text-[#278fee]`}>
      {content}
    </button>;
  }

  return <div className={className}>{content}</div>;
}

function RequirementSectionItems({ section, compact = false, onNavigate }: { section: RequirementSection; compact?: boolean; onNavigate?: (path: string) => void }) {
  const itemsClassName = compact
    ? 'mt-3 grid gap-2'
    : `mt-4 grid gap-3 ${section.items.length > 1 ? 'md:grid-cols-2' : ''}`;
  const groupClassName = compact
    ? 'mt-3 rounded-[8px] border border-[#edf1f6] bg-[#fbfcfe] p-3'
    : 'mt-4 rounded-[9px] border border-[#edf1f6] bg-[#fbfcfe] p-4';
  const groupTitleClassName = compact
    ? 'text-[11px] font-semibold text-[#4c87d7]'
    : 'text-[12px] font-semibold text-[#4c87d7]';
  const groupItemsClassName = compact
    ? 'mt-2 grid gap-2'
    : 'mt-3 grid gap-3 md:grid-cols-2';

  return <>
    {section.groups?.map((group) => <div key={group.title} className={groupClassName}>
      <h3 className={groupTitleClassName}>{group.title}</h3>
      <div className={groupItemsClassName}>
        {group.items.map((item) => <RequirementSectionItem key={`${group.title}-${item.label}`} item={item} compact={compact} onNavigate={onNavigate} />)}
      </div>
    </div>)}
    {section.items.length > 0 ? <div className={itemsClassName}>
      {section.items.map((item) => <RequirementSectionItem key={item.label} item={item} compact={compact} onNavigate={onNavigate} />)}
    </div> : null}
  </>;
}

export function RequirementDocumentPage({ kind, onBack, onNavigate }: { kind: RequirementKind; onBack: () => void; onNavigate?: (path: string) => void }) {
  const spec = requirementSpecs[kind];
  const [copied, setCopied] = useState(false);

  const copyAiPrompt = async () => {
    const prompt = buildAiPrompt(spec);
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

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#1f2838]">
      <header className="sticky top-0 z-20 border-b border-[#e4e8ef] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[62px] max-w-[1180px] items-center justify-between px-6">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[12px] text-[#68758a] transition hover:text-[#278fee]"><ArrowLeft className="h-4 w-4" />返回配置页面</button>
          <div className="flex items-center gap-2 text-[11px] text-[#9aa3b1]"><FileText className="h-3.5 w-3.5" />需求说明</div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 py-8">
        <section className="overflow-hidden rounded-[18px] border border-[#e4e8ef] bg-white shadow-[0_12px_34px_rgba(38,55,82,.06)]">
          <div className="bg-[linear-gradient(135deg,#f5f8ff_0%,#ffffff_62%)] px-8 py-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-[800px]">
                <span className="inline-flex items-center rounded-full border border-[#dce7fb] bg-white px-3 py-1 text-[10px] font-semibold tracking-[.15em] text-[#6d83a7]">{spec.eyebrow}</span>
                <div className="mt-3 flex flex-wrap items-center gap-2"><span className="rounded-[4px] bg-[#eaf3ff] px-2.5 py-1 text-[11px] font-semibold text-[#3979b7]">需求标识：{spec.requirementKey}</span><span className="rounded-[4px] bg-[#fff7dc] px-2.5 py-1 text-[11px] font-medium text-[#a36d08]">状态：{spec.status}</span></div>
                <h1 className="mt-4 text-[30px] font-semibold tracking-[-.03em] text-[#243149]">{spec.title} · 需求说明</h1>
                <p className="mt-3 text-[14px] leading-7 text-[#647187]">{spec.summary}</p>
              </div>
              <div className="flex items-center gap-3"><button type="button" onClick={() => void copyAiPrompt()} className={`inline-flex h-10 items-center gap-2 rounded-[7px] border px-4 text-[12px] font-medium transition ${copied ? 'border-[#b9e5ce] bg-[#effaf4] text-[#2f9564]' : 'border-[#cfe0f8] bg-white text-[#3f78bf] hover:border-[#8eb8ed] hover:bg-[#f5f9ff]'}`}>{copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}{copied ? '已复制 AI 提示词' : '复制 AI 提示词'}</button><div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eaf3ff] text-[#4f8fe5]"><ClipboardList className="h-6 w-6" /></div></div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#edf0f4] p-6 md:grid-cols-2">
            <div className="rounded-[12px] border border-[#edf0f4] bg-[#fbfcfe] p-5"><h2 className="text-[15px] font-semibold text-[#344158]">需求背景</h2><p className="mt-3 text-[13px] leading-6 text-[#6c788c]">{spec.background}</p></div>
            <div className="rounded-[12px] border border-[#e3ecfb] bg-[#f7faff] p-5"><h2 className="text-[15px] font-semibold text-[#344158]">需求目标</h2><p className="mt-3 text-[13px] leading-6 text-[#6c788c]">{spec.goal}</p></div>
          </div>

          {spec.verificationNotes?.length ? <section className="mx-6 mb-4 rounded-[12px] border border-[#f1d98c] bg-[#fffaf0] p-5"><h2 className="text-[15px] font-semibold text-[#8b650d]">验证辅助项（非业务需求）</h2><p className="mt-1 text-[12px] leading-5 text-[#a07b28]">以下内容仅用于验证页面效果和规则，不属于产品业务功能，不纳入业务验收口径。</p><div className="mt-3 grid gap-2 md:grid-cols-2">{spec.verificationNotes.map((item) => <div key={item} className="flex items-start gap-2 text-[12px] leading-5 text-[#8a7133]"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#d4a62a]" />{item.replace(/^验证辅助项，不属于[^：]+：/, '')}</div>)}</div></section> : null}

          <div className="space-y-4 px-6 pb-6">
            {spec.sections.map((section, sectionIndex) => (
              <section key={section.title} className="rounded-[12px] border border-[#e8ecf2] bg-white p-5">
                <div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#edf4ff] text-[11px] font-semibold text-[#4c87d7]">{String(sectionIndex + 1).padStart(2, '0')}</span><div><h2 className="text-[15px] font-semibold text-[#344158]">{section.title}</h2>{section.description ? <p className="mt-1 text-[12px] text-[#8b96a7]">{section.description}</p> : null}</div></div>
                <RequirementSectionItems section={section} onNavigate={onNavigate} />
              </section>
            ))}
          </div>

          <section className="mx-6 mb-6 rounded-[12px] border border-[#dfeafc] bg-[#f6f9ff] p-5">
            <h2 className="text-[15px] font-semibold text-[#344158]">验收标准</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2">{spec.acceptance.map((item) => <div key={item} className="flex items-start gap-2 text-[12px] leading-5 text-[#647187]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4e9a7b]" />{item}</div>)}</div>
          </section>
        </section>
      </main>
    </div>
  );
}

export function RequirementDocumentDrawer({ kind, spec: customSpec, onClose, onNavigate }: { kind?: RequirementKind; spec?: RequirementSpec; onClose: () => void; onNavigate?: (path: string) => void }) {
  const spec = customSpec ?? (kind ? requirementSpecs[kind] : undefined);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!spec) return null;

  const copyAiPrompt = async () => {
    const prompt = buildAiPrompt(spec);
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

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      {isFullScreen ? <button type="button" aria-label="关闭需求说明" onClick={onClose} className="pointer-events-auto absolute inset-0 bg-[#1f2937]/35 backdrop-blur-[1px]" /> : null}
      <aside role="dialog" aria-modal="true" aria-label={`${spec.title}需求说明`} style={isFullScreen ? undefined : { width: 'min(520px, max(320px, calc(100vw - 244px)))' }} className={`pointer-events-auto absolute flex flex-col overflow-hidden border border-[#dfe6f0] bg-[#f4f6f9] shadow-[-12px_0_38px_rgba(28,45,70,.18)] transition-[inset,width,border-radius] duration-200 ${isFullScreen ? 'inset-4 rounded-[16px]' : 'inset-y-0 right-0'}`}>
        <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#e4e8ef] bg-white px-5">
          <div className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-[#4f8fe5]" /><span className="text-[14px] font-semibold text-[#29364d]">需求说明</span></div>
          <div className="flex items-center gap-1.5"><button type="button" onClick={() => void copyAiPrompt()} className={`inline-flex h-7 items-center gap-1 rounded-[5px] border px-2.5 text-[10px] font-medium transition ${copied ? 'border-[#b9e5ce] bg-[#effaf4] text-[#2f9564]' : 'border-[#cfe0f8] bg-[#f7faff] text-[#3979c7] hover:border-[#8eb8ed] hover:bg-[#eef6ff] hover:text-[#278fee]'}`}>{copied ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}{copied ? '已复制' : '复制 AI 提示词'}</button><button type="button" onClick={() => setIsFullScreen((current) => !current)} className="inline-flex h-7 items-center gap-1 rounded-[5px] border border-[#cfe0f8] bg-[#f7faff] px-2.5 text-[10px] font-medium text-[#3979c7] transition hover:border-[#8eb8ed] hover:bg-[#eef6ff] hover:text-[#278fee]">{isFullScreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}{isFullScreen ? '退出全屏' : '全屏查看'}</button><button type="button" onClick={onClose} aria-label="关闭" className="flex h-7 w-7 items-center justify-center rounded-[5px] text-[#8c97a6] transition hover:bg-[#f2f5f8] hover:text-[#334155]"><X className="h-3.5 w-3.5" /></button></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <section className="overflow-hidden rounded-[14px] border border-[#e4e8ef] bg-white shadow-[0_8px_26px_rgba(38,55,82,.06)]">
            <div className="bg-[linear-gradient(135deg,#f5f8ff_0%,#ffffff_62%)] px-6 py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0"><span className="inline-flex items-center rounded-full border border-[#dce7fb] bg-white px-3 py-1 text-[10px] font-semibold tracking-[.12em] text-[#6d83a7]">{spec.eyebrow}</span><div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-[4px] bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-semibold text-[#3979b7]">需求标识：{spec.requirementKey}</span><span className="rounded-[4px] bg-[#fff7dc] px-2.5 py-1 text-[10px] font-medium text-[#a36d08]">状态：{spec.status}</span></div><h1 className="mt-3 text-[24px] font-semibold tracking-[-.03em] text-[#243149]">{spec.title} · 需求说明</h1><p className="mt-2 text-[13px] leading-6 text-[#647187]">{spec.summary}</p></div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[#edf0f4] p-4 md:grid-cols-2 md:p-5"><div className="rounded-[10px] border border-[#edf0f4] bg-[#fbfcfe] p-4"><h2 className="text-[14px] font-semibold text-[#344158]">需求背景</h2><p className="mt-2 text-[12px] leading-5 text-[#6c788c]">{spec.background}</p></div><div className="rounded-[10px] border border-[#e3ecfb] bg-[#f7faff] p-4"><h2 className="text-[14px] font-semibold text-[#344158]">需求目标</h2><p className="mt-2 text-[12px] leading-5 text-[#6c788c]">{spec.goal}</p></div></div>

            {spec.verificationNotes?.length ? <section className="mx-4 mb-3 rounded-[10px] border border-[#f1d98c] bg-[#fffaf0] p-4 md:mx-5"><h2 className="text-[14px] font-semibold text-[#8b650d]">验证辅助项（非业务需求）</h2><p className="mt-1 text-[11px] leading-5 text-[#a07b28]">以下内容仅用于验证页面效果和规则，不属于产品业务功能，不纳入业务验收口径。</p><div className="mt-2 grid gap-2">{spec.verificationNotes.map((item) => <div key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#8a7133]"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#d4a62a]" />{item.replace(/^验证辅助项，不属于[^：]+：/, '')}</div>)}</div></section> : null}

            <div className="space-y-3 px-4 pb-4 md:px-5 md:pb-5">{spec.sections.map((section, sectionIndex) => <section key={section.title} className="rounded-[10px] border border-[#e8ecf2] bg-white p-4"><div className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[#edf4ff] text-[10px] font-semibold text-[#4c87d7]">{String(sectionIndex + 1).padStart(2, '0')}</span><div><h2 className="text-[14px] font-semibold text-[#344158]">{section.title}</h2>{section.description ? <p className="mt-1 text-[11px] leading-5 text-[#8b96a7]">{section.description}</p> : null}</div></div><RequirementSectionItems section={section} compact onNavigate={onNavigate} /></section>)}</div>

            <section className="mx-4 mb-4 rounded-[10px] border border-[#dfeafc] bg-[#f6f9ff] p-4 md:mx-5 md:mb-5"><h2 className="text-[14px] font-semibold text-[#344158]">验收标准</h2><div className="mt-2 grid gap-2">{spec.acceptance.map((item) => <div key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#647187]"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4e9a7b]" />{item}</div>)}</div></section>
          </section>
        </div>
      </aside>
    </div>
  );
}
