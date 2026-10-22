import { ArrowLeft, CheckCircle2, ClipboardList, FileText } from 'lucide-react';

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
    summary: '在管理后台统一维护 AI 电商功能配置，支持按功能标识和场景查询、在线编辑 JSON，并在清理缓存后让新配置立即生效。',
    background: 'AI 电商能力持续增加后，功能配置分散在数据和服务侧，运营同学缺少一个可视化入口来确认当前配置、快速修改参数和验证配置是否已经生效。',
    goal: '提供一个低学习成本的配置管理入口，降低配置变更和缓存处理的沟通成本，同时保留 JSON 原始结构，方便研发与运营协作。',
    sections: [
      {
        title: '入口与权限',
        description: '页面属于现有创客贴管理后台，沿用后台账号和权限体系。',
        items: [
          { label: '菜单位置', content: '灵感社区 > 玩法管理 > AI电商配置。入口需要用 NEW 标识突出新功能，并支持悬停查看需求摘要。' },
          { label: '可见范围', content: 'admin、operator 可以查询、编辑配置和清理缓存；viewer 仅可查看和复制 JSON，不显示修改、保存和清理缓存操作。' },
          { label: '页面返回', content: '通过左侧管理后台 Logo 或页面返回入口回到需求目录，路由变化不影响已有后台页面。' },
        ],
      },
      {
        title: '配置查询',
        description: '通过业务侧真实使用的两个维度定位配置。',
        items: [
          { label: '查询项', content: '功能标识（function_code）和场景（scene），例如 function_code=ags-live-visual-material、scene=live-stream。' },
          { label: '查询动作', content: '点击查询后再展示对应配置；输入未提交时不改变当前结果。点击重置恢复示例配置。' },
          { label: '无结果状态', content: '展示“未找到对应的 AI 电商配置”，提示检查功能标识和场景是否正确。' },
        ],
      },
      {
        title: 'JSON 配置查看与编辑',
        description: '完整保留配置 JSON，支持原地修改，不再额外打开编辑弹框。',
        items: [
          { label: '查看区域', content: '以深色代码区域展示完整 JSON，提供复制按钮；代码框高度根据可视区域自适应，内容过长时在框内滚动。' },
          { label: '修改流程', content: '点击修改后直接在 JSON 框内编辑，实时校验 JSON 格式和必要字段；格式错误时禁用保存并展示错误原因。' },
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
        description: '页面原型需要预留真实接口接入位置。',
        items: [
          { label: '配置查询', content: '按 function_code + scene 查询配置详情，返回 JSON、更新时间、启用状态等信息。' },
          { label: '配置更新', content: '提交校验通过的 JSON，服务端需要做结构校验、权限校验和更新记录。' },
          { label: '缓存清理', content: '按 function_code 清理对应功能缓存，返回成功、失败及失败原因。' },
        ],
      },
    ],
    acceptance: [
      '进入 AI电商配置后默认展示查询区、JSON 配置区和当前 function_code / scene 信息。',
      'function_code 或 scene 不匹配时不会误展示其他配置，查询结果状态清晰。',
      'JSON 编辑支持格式校验、取消、二次确认保存和复制，长 JSON 不撑破页面布局。',
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
          { label: '菜单位置', content: '内容运营管理 > 搜索管理 > 实体词典、搜索引导管理。搜索引导管理紧跟在实体词典下面，使用 NEW 标识提示新增需求。' },
          { label: '权限差异', content: 'admin、operator 可导入、编辑、上下线和导出；viewer 只读，不展示编辑类操作。' },
          { label: '页面形态', content: '三个 Tab 共用页面容器，切换 Tab 不跳转新页面，并保留各自的筛选条件。' },
        ],
      },
      {
        title: '引导词节点 Tab',
        description: '管理 guided_search_node 表，维护引导词的基础信息和层级关系。',
        items: [
          { label: '操作区', content: '提供导入数据、下载导入模板、导出当前筛选结果、刷新；支持关键词、归一化键、层级、类型、状态、地区、语言筛选。' },
          { label: '表格内容', content: '展示 node_id、keyword、normalized_key、level、parent_id、guide_type、external_score、status、source、updated_at 和操作列。默认示例包含手机海报、简历、招聘、极简风、互联网、餐饮。' },
          { label: '导入预览', content: '上传 CSV/Excel 后先预览，展示行号、关键词、归一化键、层级、父节点和校验结果；错误行标红，可下载错误行，仅当存在通过行时允许确认导入。' },
        ],
      },
      {
        title: '引导词关系 Tab',
        description: '管理 guided_search_edge 表，支持多父挂载和关系数据校验。',
        items: [
          { label: '筛选与表格', content: '支持父/子节点 ID 或关键词、关系类型、状态、权重区间筛选；表格展示 edge_id、父节点、子节点、edge_type、weight、cooccur_cnt、source、status、updated_at。' },
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
      '内容运营管理展开后，搜索引导管理与实体词典同级，入口带 NEW 标识且悬停可查看需求说明。',
      '节点和关系导入均先预览校验，错误行清晰标识，不允许绕过错误直接入库。',
      '查询映射只读，能够直观看到胶囊顺序、归一化 query_key 和结果排序。',
      '无数据、无结果、加载中和导入失败等状态都有明确反馈，不影响其他 Tab 的筛选条件。',
    ],
  },
};

export function RequirementDocumentPage({ kind, onBack }: { kind: RequirementKind; onBack: () => void }) {
  const spec = requirementSpecs[kind];

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
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eaf3ff] text-[#4f8fe5]"><ClipboardList className="h-6 w-6" /></div>
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
