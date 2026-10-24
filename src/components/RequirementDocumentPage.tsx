import { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Clipboard, ClipboardList, FileText, Maximize2, Minimize2, X } from 'lucide-react';

type RequirementKind = 'ai-ecommerce' | 'search-guide' | 'membership';

type RequirementSection = {
  title: string;
  description: string;
  items: Array<{ label: string; content: string }>;
};

type RequirementSpec = {
  title: string;
  requirementKey: string;
  status: string;
  eyebrow: string;
  summary: string;
  background: string;
  goal: string;
  sections: RequirementSection[];
  acceptance: string[];
};

const requirementSpecs: Record<RequirementKind, RequirementSpec> = {
  membership: {
    title: '2026年10月会员改版',
    requirementKey: 'V2610',
    status: '待开发',
    eyebrow: 'MEMBERSHIP EXPERIENCE REDESIGN',
    summary: '统一完善会员开通、会员套餐和会员页面配置能力，确保会员类型、套餐权益和积分发放规则在各入口保持一致。',
    background: '会员中心后台包含开通会员、会员套餐管理和会员页面配置等多个入口，会员类型和套餐规则需要同步维护；本次改版将新增会员等级、套餐积分配置和会员页面版本管理，并让开发可以通过需求标识快速对齐改动点。',
    goal: '建立一套统一的会员管理后台交互和数据展示规则，保证会员类型、level、套餐积分、权益配置和页面版本之间的数据口径一致。',
    sections: [
      {
        title: '开通会员新增会员类型',
        description: '开通会员页沿用套餐管理中的完整会员类型列表，新增等级必须同步展示名称和 level。',
        items: [
          { label: '入口位置', content: '会员中心 > 开通会员，进入后左侧会员中心目录默认展开并选中开通会员。' },
          { label: '会员类型', content: '与会员套餐管理使用同一份会员类型数据，包含个人版VIP、标准版(个人)、标准版(企业)、标准版(大企业)、个人高级版、企业高级版、高级版、协作版、旗舰版、高级版(大企业)、通用版(个人)、通用版(企业)、高级版(团队)、专业版(团队)、至尊版(团队)、基础版(单人)、高级版(单人)、专业版(单人)、至尊版(单人)。' },
          { label: '新增等级', content: '基础版（个人）240、专业版（个人）241、基础版（企业）310、专业版（企业）311、旗舰版（企业）220；列表展示名称在前，level 数字在后。' },
          { label: '开通表单', content: '包含用户ID、会员类型、会员时长、成员人数、积分量、发放单位、发放周期、支付状态、支付金额、开通公司名称和开通原因；积分量沿用会员套餐管理的配置与发放规则，必填项使用红色星号标识。' },
          { label: '积分量说明', content: '积分量为空时按照套餐所属会员等级发放；已配置时按具体值、发放单位和周期发放，具体规则与会员套餐管理保持一致。' },
          { label: '专业版布局', content: '切换专业版后隐藏会员类型，增加“配置域名”页签和配置域名字段，保留用户ID、会员时长、成员人数、积分量、支付状态、支付金额、开通公司名称和开通原因。' },
          { label: '企业历史记录', content: '企业会员历史记录按记录类型和支付状态筛选，列表在成员人数后展示积分量；积分量沿用会员套餐列表规则，空值显示“按会员等级发”，已配置值显示“具体值/单位/周期”。' },
        ],
      },
      {
        title: '会员套餐管理与积分量',
        description: '套餐详情、新增套餐和编辑套餐中统一展示积分量配置，并保留历史套餐兼容逻辑。',
        items: [
          { label: '积分量配置', content: '积分量为必填项，填写非负整数；发放单位默认每人，可选团队；发放周期默认按月，可选一次性。' },
          { label: '历史套餐', content: '历史套餐未配置积分量时，按照套餐所属会员等级的积分量和规则发放；已配置的历史套餐积分量不可修改。' },
          { label: '列表展示规则', content: '积分量为空时显示“按会员等级发”；已配置具体值时显示“具体值/单位/周期”，例如“600/每人/按月”。' },
          { label: '积分发放规则', content: '优先查询用户当前生效套餐对应的积分量，按规则发放；套餐中未配置积分量的，按照套餐对应会员等级的积分量和规则发放。' },
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
        title: '需求标识与展示规则',
        description: '通过统一标识区分同一主需求下的不同修改点，降低开发对齐成本。',
        items: [
          { label: '主需求标识', content: '2026年10会员改版使用唯一短标识 V2610，所有相关子需求、页面入口和具体功能点沿用该标识。' },
          { label: '状态展示', content: '需求说明展示完整需求名称、需求标识和状态；待开发使用红色标识，已上线使用绿色标识。' },
          { label: '入口规则', content: '上级目录只展示红点提示是否存在待开发需求；具体功能目录显示需求标识，功能页改动区域显示需求标识和需求说明。' },
          { label: '遮挡处理', content: '需求标识放在改动区域虚线框外侧；需求说明弹层自动避让顶部、底部和页面边界，确保内容完整可见。' },
        ],
      },
    ],
    acceptance: [
      '开通会员页的会员类型与会员套餐管理完全共用同一份列表，新增 5 个会员等级名称和 level 展示一致。',
      '会员套餐列表、套餐详情、新增套餐和编辑套餐均按统一规则展示积分量，并正确处理空值和已配置值。',
      '积分发放优先使用当前生效套餐配置，套餐未配置时回退到对应会员等级配置，规则说明分条清晰展示。',
      '会员页面配置支持版本新增、状态开关和进入具体版本配置，默认版本与左侧目录状态正确。',
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
          { label: '菜单位置', content: '内容运营管理 > 搜索管理 > 实体词典、搜索引导管理。搜索引导管理与实体词典保持同一级。' },
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
    return `### ${index + 1}. ${section.title}\n${section.description}\n${items}`;
  }).join('\n\n');

  return `你是一名资深后台产品经理、交互设计师和前端开发者。请严格根据下面的需求说明，设计并实现“${spec.title}”功能，不要擅自扩展业务范围。\n\n## 需求概述\n${spec.summary}\n\n## 需求背景\n${spec.background}\n\n## 需求目标\n${spec.goal}\n\n## 具体需求\n${sections}\n\n## 验收标准\n${spec.acceptance.map((item) => `- ${item}`).join('\n')}\n\n## 输出要求\n请先梳理页面信息架构、组件划分、交互流程、接口依赖、权限差异、空态、加载态和错误态，再给出实现方案。保持现有项目的视觉风格和路由结构；涉及接口时说明请求参数、返回数据和异常处理，不要编造未确认的后端能力。`;
}

export function RequirementDocumentPage({ kind, onBack }: { kind: RequirementKind; onBack: () => void }) {
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

          <div className="space-y-4 px-6 pb-6">
            {spec.sections.map((section, sectionIndex) => (
              <section key={section.title} className="rounded-[12px] border border-[#e8ecf2] bg-white p-5">
                <div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#edf4ff] text-[11px] font-semibold text-[#4c87d7]">{String(sectionIndex + 1).padStart(2, '0')}</span><div><h2 className="text-[15px] font-semibold text-[#344158]">{section.title}</h2><p className="mt-1 text-[12px] text-[#8b96a7]">{section.description}</p></div></div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">{section.items.map((item) => <div key={item.label} className="rounded-[9px] bg-[#f8fafc] px-4 py-3"><div className="text-[12px] font-medium text-[#536178]">{item.label}</div><p className="mt-1.5 text-[12px] leading-5 text-[#778397]">{item.content}</p></div>)}</div>
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

export function RequirementDocumentDrawer({ kind, onClose }: { kind: RequirementKind; onClose: () => void }) {
  const spec = requirementSpecs[kind];
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

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
          <div className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-[#4f8fe5]" /><span className="text-[14px] font-semibold text-[#29364d]">需求说明</span><span className="truncate text-[12px] text-[#8a96a8]">· {spec.title}</span><span className="hidden rounded-[4px] bg-[#eaf3ff] px-2 py-1 text-[10px] font-semibold text-[#3979b7] sm:inline-flex">{spec.requirementKey}</span><span className="hidden rounded-[4px] bg-[#fff7dc] px-2 py-1 text-[10px] font-medium text-[#a36d08] sm:inline-flex">{spec.status}</span></div>
          <div className="flex items-center gap-2"><button type="button" onClick={() => setIsFullScreen((current) => !current)} className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-[#dce5f1] bg-white px-3 text-[11px] font-medium text-[#5d7392] transition hover:border-[#a9c8ee] hover:bg-[#f5f9ff] hover:text-[#278fee]">{isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}{isFullScreen ? '退出全屏' : '全屏查看'}</button><button type="button" onClick={onClose} aria-label="关闭" className="flex h-8 w-8 items-center justify-center rounded-[5px] text-[#8c97a6] transition hover:bg-[#f2f5f8] hover:text-[#334155]"><X className="h-4 w-4" /></button></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <section className="overflow-hidden rounded-[14px] border border-[#e4e8ef] bg-white shadow-[0_8px_26px_rgba(38,55,82,.06)]">
            <div className="bg-[linear-gradient(135deg,#f5f8ff_0%,#ffffff_62%)] px-6 py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0"><span className="inline-flex items-center rounded-full border border-[#dce7fb] bg-white px-3 py-1 text-[10px] font-semibold tracking-[.12em] text-[#6d83a7]">{spec.eyebrow}</span><div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-[4px] bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-semibold text-[#3979b7]">需求标识：{spec.requirementKey}</span><span className="rounded-[4px] bg-[#fff7dc] px-2.5 py-1 text-[10px] font-medium text-[#a36d08]">状态：{spec.status}</span></div><h1 className="mt-3 text-[24px] font-semibold tracking-[-.03em] text-[#243149]">{spec.title} · 需求说明</h1><p className="mt-2 text-[13px] leading-6 text-[#647187]">{spec.summary}</p></div>
                <button type="button" onClick={() => void copyAiPrompt()} className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-[7px] border px-3.5 text-[11px] font-medium transition ${copied ? 'border-[#b9e5ce] bg-[#effaf4] text-[#2f9564]' : 'border-[#cfe0f8] bg-white text-[#3f78bf] hover:border-[#8eb8ed] hover:bg-[#f5f9ff]'}`}>{copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}{copied ? '已复制' : '复制 AI 提示词'}</button>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[#edf0f4] p-4 md:grid-cols-2 md:p-5"><div className="rounded-[10px] border border-[#edf0f4] bg-[#fbfcfe] p-4"><h2 className="text-[14px] font-semibold text-[#344158]">需求背景</h2><p className="mt-2 text-[12px] leading-5 text-[#6c788c]">{spec.background}</p></div><div className="rounded-[10px] border border-[#e3ecfb] bg-[#f7faff] p-4"><h2 className="text-[14px] font-semibold text-[#344158]">需求目标</h2><p className="mt-2 text-[12px] leading-5 text-[#6c788c]">{spec.goal}</p></div></div>

            <div className="space-y-3 px-4 pb-4 md:px-5 md:pb-5">{spec.sections.map((section, sectionIndex) => <section key={section.title} className="rounded-[10px] border border-[#e8ecf2] bg-white p-4"><div className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[#edf4ff] text-[10px] font-semibold text-[#4c87d7]">{String(sectionIndex + 1).padStart(2, '0')}</span><div><h2 className="text-[14px] font-semibold text-[#344158]">{section.title}</h2><p className="mt-1 text-[11px] leading-5 text-[#8b96a7]">{section.description}</p></div></div><div className="mt-3 grid gap-2 md:grid-cols-2">{section.items.map((item) => <div key={item.label} className="rounded-[8px] bg-[#f8fafc] px-3 py-2.5"><div className="text-[11px] font-medium text-[#536178]">{item.label}</div><p className="mt-1 text-[11px] leading-5 text-[#778397]">{item.content}</p></div>)}</div></section>)}</div>

            <section className="mx-4 mb-4 rounded-[10px] border border-[#dfeafc] bg-[#f6f9ff] p-4 md:mx-5 md:mb-5"><h2 className="text-[14px] font-semibold text-[#344158]">验收标准</h2><div className="mt-2 grid gap-2 md:grid-cols-2">{spec.acceptance.map((item) => <div key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#647187]"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4e9a7b]" />{item}</div>)}</div></section>
          </section>
        </div>
      </aside>
    </div>
  );
}
