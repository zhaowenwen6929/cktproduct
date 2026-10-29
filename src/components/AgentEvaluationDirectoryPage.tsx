import { useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  Copy,
  FileJson,
  FolderKanban,
  Layers3,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import {
  type EvalProject,
  type EvalRequirement,
  readEvalProjects,
  readEvalRequirements,
  saveEvalProjects,
  saveEvalRequirements,
} from './agentEvaluationData';

function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'purple' | 'green' | 'amber' | 'slate' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-violet-50 text-violet-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

function PageShell({ children, onBack, breadcrumb }: { children: ReactNode; onBack: () => void; breadcrumb: string }) {
  return <div className="min-h-screen bg-[#f5f7fb] text-[#1c2738]">
    <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-4"><button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-[#6c7890] transition hover:text-[#0773fc]"><ArrowLeft className="h-4 w-4" />返回上一级</button><span className="h-5 w-px bg-[#e6eaf0]" /><div className="flex items-center gap-2 text-[14px] font-semibold"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eaf3ff] text-[#0773fc]"><Activity className="h-4 w-4" /></span>自动化验证平台</div><span className="text-[12px] text-[#a1adbd]">/</span><span className="text-[12px] text-[#6f7d91]">{breadcrumb}</span></div>
        <div className="flex items-center gap-3 text-[12px] text-[#8190a4]"><ShieldCheck className="h-4 w-4 text-[#07af4c]" />本地评测环境 <span className="rounded-full bg-[#effaf4] px-2.5 py-1 text-[#27885a]">MVP</span></div>
      </div>
    </header>
    {children}
  </div>;
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d9e1eb] bg-[#fbfcfe] text-center"><FolderKanban className="h-8 w-8 text-[#b5c1d1]" /><div className="mt-3 text-[14px] font-medium text-[#637188]">{title}</div><div className="mt-1 max-w-md text-[11px] leading-5 text-[#9aa5b5]">{description}</div>{action ? <div className="mt-4">{action}</div> : null}</div>;
}

const CASE_PACKAGE_TEMPLATE = {
  format: 'ckt-eval/v1',
  requirement: {
    id: 'TR-V2610-01',
    key: 'TR-V2610-01',
    name: '会员页面配置 - 套餐切换回归',
    target: '会员页面配置',
    pagePath: '创客贴管理后台 > 会员页面配置',
    version: 'V2610',
    scope: '套餐切换、数据刷新和异常提示',
    environment: '测试环境',
    preconditions: '已登录后台；测试数据和依赖服务已准备。',
    testData: '个人专业版套餐、企业旗舰版套餐',
  },
  cases: [
    {
      id: 'TC-TR-V2610-01-001',
      kind: 'Page',
      mode: 'browser',
      target: '会员页面配置 > 套餐切换',
      name: '切换套餐后内容刷新',
      input: '进入会员页面配置，当前选择网页版，切换到个人专业版。',
      expected: '套餐名称、价格、积分和权益内容同步刷新。',
      priority: 'P0',
      tags: ['页面改版', '主流程', '回归'],
      preconditions: ['已登录后台', '页面已加载完成'],
      testData: '个人专业版套餐',
      pagePath: '创客贴管理后台 > 会员页面配置',
      browser: {
        steps: [
          { action: 'goto', url: 'https://admin.example.com/member-page-config' },
          { action: 'click', selector: '[data-testid="member-type-select"]' },
          { action: 'click', selector: '[data-testid="member-type-personal-pro"]' },
          { action: 'waitForSelector', selector: '[data-testid="package-price"]', state: 'visible' },
          { action: 'waitForText', text: '专业版' },
          { action: 'screenshot', name: '套餐切换完成' },
        ],
        allowedHosts: ['admin.example.com'],
        textContains: '专业版',
      },
    },
    {
      id: 'TC-TR-V2610-01-002',
      kind: 'Page',
      mode: 'api',
      target: '会员套餐配置接口',
      name: '套餐接口返回正确配置',
      input: '请求个人专业版套餐配置。',
      expected: '接口返回正确的套餐等级、价格、积分和权益数据。',
      priority: 'P0',
      tags: ['接口', '数据一致性'],
      api: { endpoint: 'https://api.example.com/member/package', method: 'GET', expectedStatus: 200, expectedText: 'professional' },
    },
  ],
};

function TestCaseStandardModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const template = JSON.stringify(CASE_PACKAGE_TEMPLATE, null, 2);
  const copyTemplate = async () => {
    try {
      await navigator.clipboard?.writeText(template);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18243a]/35 p-5" onClick={onClose}><div className="flex max-h-[88vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between border-b border-[#e8edf3] px-5 py-4"><div><div className="flex items-center gap-2"><FileJson className="h-4 w-4 text-[#0773fc]" /><h2 className="text-[16px] font-semibold text-[#27344a]">测试用例输出规范</h2></div><p className="mt-1 text-[11px] text-[#8a96a8]">建议先创建测试需求，再导入包含 requirement + cases 的标准测试包。</p></div><button type="button" onClick={onClose} className="text-[#8a96a8]"><X className="h-4 w-4" /></button></div><div className="grid min-h-0 gap-5 overflow-y-auto p-5 lg:grid-cols-[.8fr_1.2fr]"><div className="space-y-4 text-[12px] text-[#5d6a7f]"><div className="rounded-xl border border-[#dce8f8] bg-[#f5f9ff] p-4"><div className="font-semibold text-[#3979b7]">固定层级</div><div className="mt-2 leading-6">测试项目 → 测试需求 → 测试用例 → 执行结果</div></div><div><div className="font-semibold text-[#536178]">测试需求必须提供</div><ul className="mt-2 space-y-1.5 leading-5"><li>• 需求编号、名称、验证目标</li><li>• 页面/功能路径、版本或发布批次</li><li>• 测试范围、环境、前置条件、测试数据</li></ul></div><div><div className="font-semibold text-[#536178]">测试用例必须提供</div><ul className="mt-2 space-y-1.5 leading-5"><li>• 稳定用例编号、测试对象和执行方式</li><li>• 输入、步骤、可判定的期望结果</li><li>• P0/P1/P2 优先级和可搜索标签</li></ul></div><div><div className="font-semibold text-[#536178]">执行约束</div><ul className="mt-2 space-y-1.5 leading-5"><li>• `mode`：api 或 browser</li><li>• `kind`：Page、Feature、Agent、Skill、API 或 Workflow</li><li>• 浏览器优先使用 data-testid 等稳定选择器</li><li>• press 必须同时提供 selector 和 key，不能省略 selector</li></ul></div></div><div className="min-w-0 rounded-xl border border-[#e4eaf2] bg-[#18243a] p-4"><div className="mb-3 flex items-center justify-between"><div className="text-[12px] font-medium text-white">ckt-eval/v1 标准 JSON</div><button type="button" onClick={() => void copyTemplate()} className="inline-flex h-7 items-center gap-1 rounded-md bg-white/10 px-2.5 text-[11px] text-[#d5e3f9] hover:bg-white/15">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? '已复制' : '复制模板'}</button></div><pre className="max-h-[58vh] overflow-auto whitespace-pre-wrap break-words text-[10px] leading-5 text-[#c9d8ee]">{template}</pre></div></div><div className="flex justify-end border-t border-[#e8edf3] px-5 py-3"><button type="button" onClick={onClose} className="h-8 rounded-lg border border-[#dce3ed] px-4 text-[12px] text-[#69778d]">关闭</button></div></div></div>;
}

function ProjectForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (name: string, description: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18243a]/35 p-5" onClick={onClose}><div className="w-full max-w-[480px] rounded-2xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold text-[#27344a]">新建测试项目</h2><button type="button" onClick={onClose} className="text-[#8a96a8]"><X className="h-4 w-4" /></button></div><p className="mt-1 text-[12px] text-[#8a96a8]">项目用于隔离不同业务域或不同测试资产。</p><label className="mt-5 block text-[12px] font-medium text-[#536178]">项目名称<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：工作流 Agent 验证" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="mt-3 block text-[12px] font-medium text-[#536178]">项目说明<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="说明这个项目覆盖的能力范围" className="mt-1.5 min-h-[84px] w-full resize-none rounded-lg border border-[#dce3ed] p-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-9 rounded-lg border border-[#dce3ed] px-4 text-[12px] text-[#69778d]">取消</button><button type="button" disabled={!name.trim()} onClick={() => onSubmit(name.trim(), description.trim())} className="h-9 rounded-lg bg-[#0773fc] px-4 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">创建项目</button></div></div></div>;
}

export function AgentEvaluationProjectsPage({ onBack, onOpenProject }: { onBack: () => void; onOpenProject: (projectId: string) => void }) {
  const [projects, setProjects] = useState<EvalProject[]>(readEvalProjects);
  const [requirements] = useState<EvalRequirement[]>(readEvalRequirements);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStandardOpen, setIsStandardOpen] = useState(false);
  const visibleProjects = useMemo(() => projects.filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(search.trim().toLowerCase())), [projects, search]);
  const createProject = (name: string, description: string) => {
    const project: EvalProject = { id: `project-${Date.now()}`, name, key: `TP-${String(Date.now()).slice(-4)}`, description: description || '待补充项目说明', owner: '当前用户', updatedAt: new Date().toISOString().slice(0, 10) };
    const nextProjects = [project, ...projects];
    setProjects(nextProjects);
    saveEvalProjects(nextProjects);
    setIsFormOpen(false);
    onOpenProject(project.id);
  };
  return <PageShell onBack={onBack} breadcrumb="测试项目">
    <main className="mx-auto max-w-[1440px] space-y-5 px-5 py-6 lg:px-8 lg:py-8">
      <section className="rounded-2xl border border-[#e1e9f5] bg-[linear-gradient(120deg,#f4f8ff,#fbf7ff)] px-6 py-6 shadow-[0_12px_32px_rgba(37,72,112,.06)] lg:px-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="mb-3 flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0773fc,#7b61ff)] text-white"><FolderKanban className="h-5 w-5" /></span><Badge>测试资产中心</Badge></div><h1 className="text-[25px] font-semibold tracking-[-.04em] text-[#172235]">测试项目</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#68758b]">按业务域或测试资产隔离项目；进入项目后创建具体测试需求，再维护用例、执行配置和结果。开发完成后可按统一 JSON 规范直接输出并导入。</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => setIsStandardOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#cfe0f8] bg-white px-3 text-[12px] font-medium text-[#3979b7]"><FileJson className="h-3.5 w-3.5" />用例规范</button><button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0773fc] px-3.5 text-[12px] font-medium text-white shadow-[0_4px_10px_rgba(7,115,252,.2)]"><Plus className="h-3.5 w-3.5" />新建测试项目</button></div></div></section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="rounded-xl border border-[#e6ebf2] bg-white p-4"><div className="text-[12px] text-[#8490a3]">测试项目</div><div className="mt-2 text-[26px] font-semibold tracking-[-.04em] text-[#0773fc]">{projects.length}</div></div><div className="rounded-xl border border-[#e6ebf2] bg-white p-4"><div className="text-[12px] text-[#8490a3]">测试需求</div><div className="mt-2 text-[26px] font-semibold tracking-[-.04em] text-[#7b61ff]">{requirements.length}</div></div><div className="rounded-xl border border-[#e6ebf2] bg-white p-4"><div className="text-[12px] text-[#8490a3]">接口验证</div><div className="mt-2 text-[26px] font-semibold tracking-[-.04em] text-[#07af4c]">{requirements.filter((item) => item.modes.includes('接口')).length}</div></div><div className="rounded-xl border border-[#e6ebf2] bg-white p-4"><div className="text-[12px] text-[#8490a3]">浏览器验证</div><div className="mt-2 text-[26px] font-semibold tracking-[-.04em] text-[#f59e0b]">{requirements.filter((item) => item.modes.includes('浏览器')).length}</div></div></div>
      <section className="rounded-xl border border-[#e1e7ef] bg-white shadow-[0_6px_20px_rgba(38,58,88,.04)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9edf3] px-5 py-4"><div><h2 className="text-[14px] font-semibold">项目列表</h2><p className="mt-1 text-[11px] text-[#8591a4]">一个项目可以包含多个独立的测试需求。</p></div><label className="relative block"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa5b5]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索项目" className="h-8 w-[220px] rounded-lg border border-[#dce3ed] pl-8 pr-3 text-[11px] outline-none focus:border-[#77aef0]" /></label></div><div className="grid gap-3 p-4 lg:grid-cols-2">{visibleProjects.map((project) => { const projectRequirements = requirements.filter((item) => item.projectId === project.id); const caseCount = projectRequirements.reduce((sum, item) => sum + item.caseIds.length, 0); return <button type="button" key={project.id} onClick={() => onOpenProject(project.id)} className="group rounded-xl border border-[#e4eaf2] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#a8c9f4] hover:shadow-[0_8px_24px_rgba(55,103,166,.1)]"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-[#3979b7]"><FolderKanban className="h-5 w-5" /></span><div><div className="flex items-center gap-2"><h3 className="text-[14px] font-semibold text-[#344158]">{project.name}</h3><Badge tone="blue">{project.key}</Badge></div><p className="mt-2 text-[12px] leading-5 text-[#68768b]">{project.description}</p></div></div><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#a3afbe] transition group-hover:translate-x-0.5 group-hover:text-[#0773fc]" /></div><div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#edf0f4] pt-3 text-[11px] text-[#8995a7]"><span className="inline-flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" />{projectRequirements.length} 个测试需求</span><span className="inline-flex items-center gap-1"><Layers3 className="h-3.5 w-3.5" />{caseCount} 条用例</span><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{project.owner}</span><span className="ml-auto inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />更新于 {project.updatedAt}</span></div></button>; })}</div>{!visibleProjects.length ? <div className="p-4"><EmptyState title="没有匹配的测试项目" description="换一个关键词，或直接新建一个测试项目。" /></div> : null}</section>
    </main>
    {isFormOpen ? <ProjectForm onClose={() => setIsFormOpen(false)} onSubmit={createProject} /> : null}
    {isStandardOpen ? <TestCaseStandardModal onClose={() => setIsStandardOpen(false)} /> : null}
  </PageShell>;
}

function RequirementForm({ projectName, onClose, onSubmit }: { projectName: string; onClose: () => void; onSubmit: (name: string, target: string, description: string, mode: 'api' | 'browser' | 'mixed', pagePath: string, version: string, preconditions: string, testData: string) => void }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'api' | 'browser' | 'mixed'>('api');
  const [pagePath, setPagePath] = useState('');
  const [version, setVersion] = useState('');
  const [preconditions, setPreconditions] = useState('');
  const [testData, setTestData] = useState('');
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18243a]/35 p-5" onClick={onClose}><div className="max-h-[88vh] w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div><h2 className="text-[16px] font-semibold text-[#27344a]">新建测试需求</h2><p className="mt-1 text-[11px] text-[#98a4b5]">所属项目：{projectName}</p></div><button type="button" onClick={onClose} className="text-[#8a96a8]"><X className="h-4 w-4" /></button></div><label className="mt-5 block text-[12px] font-medium text-[#536178]">测试需求名称<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：Agent 路由回归 2026-10" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="mt-3 block text-[12px] font-medium text-[#536178]">验证目标<input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="例如：Agent 路由" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="mt-3 block text-[12px] font-medium text-[#536178]">默认执行方式<select value={mode} onChange={(event) => setMode(event.target.value as 'api' | 'browser' | 'mixed')} className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] bg-white px-3 text-[12px] outline-none focus:border-[#77aef0]"><option value="api">接口验证</option><option value="browser">浏览器验证</option><option value="mixed">接口 + 浏览器混合</option></select></label><label className="mt-3 block text-[12px] font-medium text-[#536178]">页面 / 功能路径<input value={pagePath} onChange={(event) => setPagePath(event.target.value)} placeholder="例如：管理后台 > 会员页面配置" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="mt-3 block text-[12px] font-medium text-[#536178]">版本 / 发布批次<input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="例如：V2610 / 2026-10-29" className="mt-1.5 h-9 w-full rounded-lg border border-[#dce3ed] px-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="mt-3 block text-[12px] font-medium text-[#536178]">前置条件<textarea value={preconditions} onChange={(event) => setPreconditions(event.target.value)} placeholder="例如：已登录、依赖服务已启动、测试数据已准备" className="mt-1.5 min-h-[62px] w-full resize-none rounded-lg border border-[#dce3ed] p-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="mt-3 block text-[12px] font-medium text-[#536178]">测试数据<textarea value={testData} onChange={(event) => setTestData(event.target.value)} placeholder="填写测试账号、套餐、商品或其他必要数据" className="mt-1.5 min-h-[62px] w-full resize-none rounded-lg border border-[#dce3ed] p-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><label className="mt-3 block text-[12px] font-medium text-[#536178]">需求说明<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="说明本次测试要覆盖的范围和验收目标" className="mt-1.5 min-h-[84px] w-full resize-none rounded-lg border border-[#dce3ed] p-3 text-[12px] outline-none focus:border-[#77aef0]" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-9 rounded-lg border border-[#dce3ed] px-4 text-[12px] text-[#69778d]">取消</button><button type="button" disabled={!name.trim() || !target.trim()} onClick={() => onSubmit(name.trim(), target.trim(), description.trim(), mode, pagePath.trim(), version.trim(), preconditions.trim(), testData.trim())} className="h-9 rounded-lg bg-[#0773fc] px-4 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">创建并进入</button></div></div></div>;
}

export function AgentEvaluationRequirementsPage({ project, onBack, onOpenRequirement }: { project: EvalProject; onBack: () => void; onOpenRequirement: (requirementId: string) => void }) {
  const [requirements, setRequirements] = useState<EvalRequirement[]>(() => readEvalRequirements().filter((item) => item.projectId === project.id));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const visibleRequirements = requirements.filter((item) => `${item.name} ${item.target} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase()));
  const createRequirement = (name: string, target: string, description: string, mode: 'api' | 'browser' | 'mixed', pagePath: string, version: string, preconditions: string, testData: string) => {
    const caseIds = mode === 'browser' ? ['browser-001'] : mode === 'mixed' ? ['agent-001', 'skill-001', 'browser-001'] : ['agent-001', 'skill-001'];
    const modes: Array<'接口' | '浏览器'> = mode === 'browser' ? ['浏览器'] : mode === 'mixed' ? ['接口', '浏览器'] : ['接口'];
    const requirement: EvalRequirement = { id: `requirement-${Date.now()}`, projectId: project.id, name, key: `TR-${String(Date.now()).slice(-6)}`, description: description || '待补充测试需求说明', target, status: '待测试', updatedAt: new Date().toISOString().slice(0, 10), caseIds, modes, pagePath: pagePath || '待补充页面 / 功能路径', version: version || '待补充版本 / 批次', preconditions: preconditions || '待补充前置条件', testData: testData || '待补充测试数据' };
    const nextAll = [...readEvalRequirements(), requirement];
    saveEvalRequirements(nextAll);
    setRequirements((current) => [requirement, ...current]);
    setIsFormOpen(false);
    onOpenRequirement(requirement.id);
  };
  return <PageShell onBack={onBack} breadcrumb={project.name}>
    <main className="mx-auto max-w-[1440px] space-y-5 px-5 py-6 lg:px-8 lg:py-8">
      <section className="rounded-2xl border border-[#e1e9f5] bg-white px-6 py-6 shadow-[0_12px_32px_rgba(37,72,112,.06)] lg:px-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2"><Badge>{project.key}</Badge><Badge tone="slate">测试项目</Badge></div><h1 className="mt-3 text-[25px] font-semibold tracking-[-.04em] text-[#172235]">{project.name}</h1><p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#68758b]">{project.description}</p></div><button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0773fc] px-3.5 text-[12px] font-medium text-white shadow-[0_4px_10px_rgba(7,115,252,.2)]"><Plus className="h-3.5 w-3.5" />新建测试需求</button></div></section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="rounded-xl border border-[#e6ebf2] bg-white p-4"><div className="text-[12px] text-[#8490a3]">测试需求</div><div className="mt-2 text-[26px] font-semibold tracking-[-.04em] text-[#0773fc]">{requirements.length}</div></div><div className="rounded-xl border border-[#e6ebf2] bg-white p-4"><div className="text-[12px] text-[#8490a3]">待测试</div><div className="mt-2 text-[26px] font-semibold tracking-[-.04em] text-[#f59e0b]">{requirements.filter((item) => item.status === '待测试').length}</div></div><div className="rounded-xl border border-[#e6ebf2] bg-white p-4"><div className="text-[12px] text-[#8490a3]">接口需求</div><div className="mt-2 text-[26px] font-semibold tracking-[-.04em] text-[#07af4c]">{requirements.filter((item) => item.modes.includes('接口')).length}</div></div><div className="rounded-xl border border-[#e6ebf2] bg-white p-4"><div className="text-[12px] text-[#8490a3]">浏览器需求</div><div className="mt-2 text-[26px] font-semibold tracking-[-.04em] text-[#f59e0b]">{requirements.filter((item) => item.modes.includes('浏览器')).length}</div></div></div>
      <section className="rounded-xl border border-[#e1e7ef] bg-white shadow-[0_6px_20px_rgba(38,58,88,.04)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9edf3] px-5 py-4"><div><h2 className="text-[14px] font-semibold">测试需求列表</h2><p className="mt-1 text-[11px] text-[#8591a4]">每个测试需求拥有独立的用例集、执行配置和结果记录。</p></div><label className="relative block"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa5b5]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索测试需求" className="h-8 w-[220px] rounded-lg border border-[#dce3ed] pl-8 pr-3 text-[11px] outline-none focus:border-[#77aef0]" /></label></div>{visibleRequirements.length ? <div className="divide-y divide-[#edf0f4]">{visibleRequirements.map((item) => <button type="button" key={item.id} onClick={() => onOpenRequirement(item.id)} className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#fbfdff]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f5ff] text-[#3979b7]"><ClipboardCheck className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[14px] font-semibold text-[#344158]">{item.name}</h3><Badge tone="blue">{item.key}</Badge><Badge tone={item.status === '已完成' ? 'green' : item.status === '测试中' ? 'purple' : 'amber'}>{item.status}</Badge></div><p className="mt-1.5 text-[12px] leading-5 text-[#68768b]">{item.description}</p><div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-[#8995a7]"><span className="inline-flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />目标：{item.target}</span><span className="max-w-[300px] truncate">页面/功能：{item.pagePath || '待补充'}</span><span>版本：{item.version || '待补充'}</span><span className="inline-flex items-center gap-1"><Layers3 className="h-3.5 w-3.5" />{item.caseIds.length} 条用例</span><span>{item.modes.join(' + ')}</span><span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />更新于 {item.updatedAt}</span></div></div><ChevronRight className="h-4 w-4 shrink-0 text-[#a3afbe] transition group-hover:translate-x-0.5 group-hover:text-[#0773fc]" /></button>)}</div> : <div className="p-4"><EmptyState title="还没有测试需求" description="先创建一个测试需求，再进入它维护用例并执行验证。" action={<button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0773fc] px-3 text-[11px] font-medium text-white"><Plus className="h-3.5 w-3.5" />新建测试需求</button>} /></div>}</section>
    </main>
    {isFormOpen ? <RequirementForm projectName={project.name} onClose={() => setIsFormOpen(false)} onSubmit={createRequirement} /> : null}
  </PageShell>;
}
