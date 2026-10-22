import { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Clipboard, ClipboardList, FileText } from 'lucide-react';

type RequirementKind = 'ai-ecommerce' | 'search-guide';

type RequirementSection = {
  title: string;
  description: string;
  items: Array<{ label: string; content: string }>;
};

type RequirementSpec = {
  title: string;
  eyebrow: string;
  summary: string;
  background: string;
  goal: string;
  sections: RequirementSection[];
  acceptance: string[];
};

const requirementSpecs: Record<RequirementKind, RequirementSpec> = {
  'ai-ecommerce': {
    title: 'AI电商配置',
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
          { label: '权限差异', content: 'admin、operator 可导入、编辑、上下线和导出；viewer 只读，不展示编辑类操作。' },
          { label: '页面形态', content: '三个 Tab 共用页面容器，切换 Tab 不跳转新页面，并保留各自的筛选条件。' },
        ],
      },
      {
        title: '引导词节点 Tab',
        description: '管理 guided_search_node 表，维护引导词的基础信息和层级关系。',
        items: [
          { label: '筛选与操作区', content: '筛选项与操作按钮保持同一行，左侧支持关键词、归一化键、层级、类型、状态、地区、语言筛选，右侧只保留“导入数据”和“导出当前筛选结果”。' },
          { label: '表格内容', content: '展示 node_id、keyword、normalized_key、level、parent_id、guide_type、external_score、status、source、updated_at 和操作列。默认示例包含手机海报、简历、招聘、极简风、互联网、餐饮。' },
          { label: '导入预览', content: '上传 CSV/Excel 后先预览，展示行号、关键词、归一化键、层级、父节点和校验结果；错误行标红，可下载错误行，仅当存在通过行时允许确认导入。' },
        ],
      },
      {
        title: '引导词关系 Tab',
        description: '管理 guided_search_edge 表，支持多父挂载和关系数据校验。',
        items: [
          { label: '筛选与操作区', content: '筛选项与操作按钮保持同一行，左侧支持父/子节点 ID 或关键词、关系类型、状态、权重区间筛选，右侧只保留“导入数据”和“导出当前筛选结果”。' },
          { label: '校验规则', content: '预览时校验两端节点是否存在、是否自环、是否重复、parent_child 是否跳级（警告）以及是否成环（错误）。' },
          { label: '示例关系', content: '默认展示手机海报(1001)到招聘(1010)、极简风(1020)，以及简历(1003)到招聘(1010)，体现招聘节点可被多个父节点挂载。' },
        ],
      },
      {
        title: '查询映射 Tab',
        description: '只读查看真实搜索词对应的引导胶囊和排序结果。',
        items: [
          { label: '查询区', content: '输入业务搜索词，选择地区和语言后查询；可查看归一化后的 query_key，并支持按 guide_type、recall_source 二次筛选。' },
          { label: '查询结果', content: '展示原始输入、query_key、地区、语言、命中条数和胶囊预览；结果表按 rank_position 升序展示 guide_node_id、keyword、分数、召回来源、用户分群、CTR 和过期时间。' },
          { label: '空态', content: '未输入时提示输入业务搜索词；无结果时展示“该查询词暂无映射配置”，并提示检查节点/关系或等待离线任务。' },
        ],
      },
      {
        title: '接口与数据依赖',
        description: '页面不新定义数据库结构，依赖现有或待补齐的服务能力。',
        items: [
          { label: '节点能力', content: '节点列表、导入预览、导入、导出、模板下载，以及节点启用/下线和编辑能力。' },
          { label: '关系能力', content: '关系列表、导入预览、导入、导出、模板下载和关系校验能力。' },
          { label: '映射能力', content: '按 query_key + region + language 查询 guided_search_mapping，并返回排序与统计字段。' },
        ],
      },
    ],
    acceptance: [
      '内容运营管理展开后，搜索引导管理与实体词典同级，能够从菜单正常进入。',
      '节点和关系导入均先预览校验，错误行清晰标识，不允许绕过错误直接入库。',
      '查询映射只读，能够直观看到胶囊顺序、归一化 query_key 和结果排序。',
      '无数据、无结果、加载中和导入失败等状态都有明确反馈，不影响其他 Tab 的筛选条件。',
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
