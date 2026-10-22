import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Network,
  Pencil,
  Power,
  Search,
  Table2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AdminSidebar, TopHeader } from './AdminBackofficePage';

type TabKey = 'nodes' | 'edges' | 'mapping';
type ImportKind = 'nodes' | 'edges';

type NodeRow = {
  node_id: number;
  keyword: string;
  normalized_key: string;
  level: number;
  parent_id: number | null;
  guide_type: string;
  external_score: string;
  status: '启用' | '禁用';
  source: string;
  updated_at: string;
  updated_by: string;
};

type EdgeRow = {
  edge_id: number;
  parent: string;
  child: string;
  edge_type: string;
  weight: string;
  cooccur_cnt: number;
  source: string;
  status: '启用' | '禁用';
  updated_at: string;
  updated_by: string;
};

type MappingRow = {
  rank_position: number;
  guide_node_id: number;
  keyword: string;
  guide_type: string;
  rank_score_base: string;
  rank_score_final: string;
  recall_source: string;
  user_segment: string;
  ctr_7d: string;
  expire_at: string;
};

const nodeRows: NodeRow[] = [
  { node_id: 1001, keyword: '手机海报', normalized_key: 'shouji_haibao', level: 1, parent_id: null, guide_type: 'category', external_score: '1.00', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:28', updated_by: '管理员' },
  { node_id: 1003, keyword: '简历', normalized_key: 'jianli', level: 1, parent_id: null, guide_type: 'category', external_score: '0.33', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:27', updated_by: '管理员' },
  { node_id: 1010, keyword: '招聘', normalized_key: 'zhaopin', level: 2, parent_id: 1001, guide_type: 'scene', external_score: '0.90', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:26', updated_by: '管理员' },
  { node_id: 1020, keyword: '极简风', normalized_key: 'jijianfeng', level: 2, parent_id: 1001, guide_type: 'style', external_score: '0.80', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:25', updated_by: '管理员' },
  { node_id: 1030, keyword: '互联网', normalized_key: 'hulianwang', level: 3, parent_id: 1010, guide_type: 'industry', external_score: '0.70', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:24', updated_by: '管理员' },
  { node_id: 1031, keyword: '餐饮', normalized_key: 'canyin', level: 3, parent_id: 1010, guide_type: 'industry', external_score: '0.49', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:23', updated_by: '管理员' },
];

const edgeRows: EdgeRow[] = [
  { edge_id: 2002, parent: '手机海报(1001)', child: '招聘(1010)', edge_type: 'parent_child', weight: '0.88', cooccur_cnt: 12000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:20', updated_by: '管理员' },
  { edge_id: 2005, parent: '手机海报(1001)', child: '极简风(1020)', edge_type: 'parent_child', weight: '0.95', cooccur_cnt: 15000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:19', updated_by: '管理员' },
  { edge_id: 2014, parent: '简历(1003)', child: '招聘(1010)', edge_type: 'parent_child', weight: '0.95', cooccur_cnt: 8000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:18', updated_by: '管理员' },
  { edge_id: 2023, parent: '招聘(1010)', child: '互联网(1030)', edge_type: 'parent_child', weight: '0.95', cooccur_cnt: 5000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:17', updated_by: '管理员' },
  { edge_id: 2024, parent: '招聘(1010)', child: '餐饮(1031)', edge_type: 'parent_child', weight: '0.81', cooccur_cnt: 3000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:16', updated_by: '管理员' },
];

const mappingRows: MappingRow[] = [
  { rank_position: 1, guide_node_id: 1010, keyword: '招聘', guide_type: 'scene', rank_score_base: '0.892', rank_score_final: '0.892', recall_source: 'graph', user_segment: 'all', ctr_7d: '0.041', expire_at: '2026-12-31' },
  { rank_position: 2, guide_node_id: 1020, keyword: '极简风', guide_type: 'style', rank_score_base: '0.860', rank_score_final: '0.860', recall_source: 'graph', user_segment: 'all', ctr_7d: '0.038', expire_at: '2026-12-31' },
  { rank_position: 3, guide_node_id: 1011, keyword: '促销', guide_type: 'scene', rank_score_base: '0.836', rank_score_final: '0.836', recall_source: 'graph', user_segment: 'all', ctr_7d: '0.035', expire_at: '2026-12-31' },
];

const guideCapsules = ['招聘', '极简风', '促销', '节日', '电商', '国潮'];

const displayValueMap: Record<string, string> = {
  category: '分类',
  scene: '场景',
  style: '风格',
  industry: '行业',
  parent_child: '父子关系',
  synonym: '同义关系',
  related: '相关关系',
  template_tag: '模板标签',
  co_occur: '共现数据',
  graph: '图谱',
  rule: '规则',
  all: '全部',
  NULL: '无',
};

const displayValue = (value: string) => displayValueMap[value] ?? value;

const normalizeQuery = (value: string) => {
  const trimmed = value.trim();
  if (trimmed === '手机海报') return 'shouji_haibao';
  return trimmed.toLowerCase().replace(/\s+/g, '_');
};

function ActionButton({ icon: Icon, children, onClick, variant = 'secondary' }: { icon: typeof Download; children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-1.5 rounded-[4px] px-3.5 text-[12px] transition ${variant === 'primary' ? 'bg-[#278fee] text-white shadow-[0_4px_10px_rgba(39,143,238,.16)] hover:bg-[#167fdc]' : 'border border-[#dfe3ea] bg-white text-[#5f6b7d] hover:border-[#aeb9c8] hover:text-[#278fee]'}`}><Icon className="h-3.5 w-3.5" />{children}</button>;
}

function StatusTag({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${status === '启用' ? 'bg-[#e9f8ef] text-[#35a16b]' : 'bg-[#f1f3f6] text-[#929baa]'}`}>{status}</span>;
}

function ImportDialog({ kind, onClose, onConfirm }: { kind: ImportKind; onClose: () => void; onConfirm: (successCount: number, errorCount: number) => void }) {
  const [fileName, setFileName] = useState('');
  const [previewReady, setPreviewReady] = useState(false);
  const isNode = kind === 'nodes';
  const successCount = isNode ? 2 : 3;
  const errorCount = isNode ? 1 : 2;
  const previewRows: string[][] = isNode
    ? [['1', '手机海报', 'shouji_haibao', '1', 'NULL', '通过'], ['2', '招聘', 'zhaopin', '2', '1001', '通过'], ['3', '互联网', 'hulianwang', '3', '9999', '错误：父节点不存在']]
    : [['1', '1001', '1010', 'parent_child', '0.88', '通过'], ['2', '1001', '1001', 'parent_child', '0.90', '错误：不可自环'], ['3', '1001', '1030', 'parent_child', '0.76', '警告：可能跳级']];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1830]/45 p-5 backdrop-blur-[2px]">
      <div className="w-[min(980px,calc(100vw-40px))] overflow-hidden rounded-[12px] bg-white shadow-[0_24px_80px_rgba(16,27,52,.28)]">
        <div className="flex items-center justify-between border-b border-[#e7eaf0] px-6 py-4"><div><h2 className="text-[17px] font-semibold text-[#273244]">导入{isNode ? '引导词节点' : '引导词关系'}</h2><p className="mt-1 text-[11px] text-[#99a2b0]">上传后先预览校验结果，不会直接写入数据</p></div><button type="button" onClick={onClose} className="rounded-full p-1.5 text-[#8d97a6] hover:bg-[#f2f4f7]"><X className="h-5 w-5" /></button></div>
        <div className="p-6">
          <div className="flex items-center justify-between rounded-[8px] border border-dashed border-[#cfd8e7] bg-[#f8faff] px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf2ff] text-[#278fee]"><FileSpreadsheet className="h-4 w-4" /></div><div><p className="text-[12px] font-medium text-[#3c485a]">上传 CSV / Excel 文件</p><p className="mt-1 text-[10px] text-[#9ca6b5]">支持 .csv、.xlsx、.xls，建议使用标准模板</p></div></div><div className="flex items-center gap-3"><button type="button" onClick={() => setPreviewReady(true)} className="text-[11px] text-[#278fee] hover:underline">使用示例数据预览</button><label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[4px] bg-[#278fee] px-3 text-[11px] text-white hover:bg-[#167fdc]"><Upload className="h-3.5 w-3.5" />选择文件<input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) { setFileName(file.name); setPreviewReady(true); } }} /></label></div></div>
          {fileName ? <p className="mt-2 text-[11px] text-[#6d7889]">已选择：{fileName}</p> : null}
          {previewReady ? (
            <div className="mt-5 overflow-hidden rounded-[8px] border border-[#e6e9ef]"><div className="flex items-center justify-between border-b border-[#edf0f4] bg-[#fafbfc] px-4 py-3"><div className="text-[12px] font-medium text-[#354154]">导入预览</div><div className="flex items-center gap-3 text-[11px]"><span className="text-[#35a16b]">通过 {successCount} 行</span><span className="text-[#e05d62]">错误 {errorCount} 行</span></div></div><div className="max-h-[300px] overflow-auto"><table className="w-full min-w-[760px] text-left text-[11px]"><thead className="sticky top-0 bg-[#f8fafc] text-[#7a8596]"><tr>{(isNode ? ['行号', '关键词', '归一化键', '层级', '父节点编号', '校验结果'] : ['行号', '父节点编号', '子节点编号', '关系类型', '权重', '校验结果']).map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{previewRows.map((row, rowIndex) => <tr key={row[0]} className={`border-t border-[#f0f2f5] ${row[row.length - 1].startsWith('错误') ? 'bg-[#fff4f4] text-[#cf555b]' : row[row.length - 1].startsWith('警告') ? 'bg-[#fffaf0] text-[#a4772d]' : 'text-[#536073]'}`}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cell}`} className="px-4 py-3">{cellIndex === (isNode ? 4 : 3) ? displayValue(cell) : cell}</td>)}</tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-[#edf0f4] px-4 py-3"><span className="text-[10px] text-[#9ba4b2]">错误行不会写入，可下载后修正</span><button type="button" className="inline-flex items-center gap-1 text-[11px] text-[#278fee]"><Download className="h-3.5 w-3.5" />下载错误行</button></div></div>
          ) : <div className="mt-5 flex h-[180px] items-center justify-center rounded-[8px] border border-[#eef0f4] bg-[#fbfcfe] text-center"><div><FileSpreadsheet className="mx-auto h-8 w-8 text-[#c3cad6]" /><p className="mt-2 text-[12px] text-[#7e899a]">上传文件后查看导入预览</p><p className="mt-1 text-[10px] text-[#a9b1bd]">支持先预览，确认后再导入</p></div></div>}
        </div>
        <div className="flex items-center justify-between border-t border-[#e7eaf0] px-6 py-4"><span className="text-[11px] text-[#9ba4b2]">校验通过的数据才会进入导入队列</span><div className="flex items-center gap-3"><button type="button" onClick={onClose} className="h-9 rounded-[4px] border border-[#dfe3ea] px-5 text-[12px] text-[#687386]">取消</button><button type="button" disabled={!previewReady || successCount < 1} onClick={() => onConfirm(successCount, errorCount)} className="h-9 rounded-[4px] bg-[#278fee] px-5 text-[12px] text-white disabled:cursor-not-allowed disabled:bg-[#b9c8d8]">确认导入</button></div></div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, disabled = false, type = 'text', placeholder }: { label: string; value: string; onChange?: (value: string) => void; disabled?: boolean; type?: string; placeholder?: string }) {
  return <label className="flex flex-col gap-1.5"><span className="text-[11px] font-medium text-[#5e6b7f]">{label}</span><input type={type} value={value} disabled={disabled} placeholder={placeholder} onChange={(event) => onChange?.(event.currentTarget.value)} className={`h-9 rounded-[5px] border px-3 text-[12px] outline-none transition ${disabled ? 'cursor-not-allowed border-[#edf0f4] bg-[#f5f7fa] text-[#9aa4b2]' : 'border-[#dfe3ea] bg-white text-[#354154] focus:border-[#278fee] focus:ring-2 focus:ring-[#278fee]/10'}`} /></label>;
}

function FormSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ label: string; value: string }>; onChange: (value: string) => void }) {
  return <label className="flex flex-col gap-1.5"><span className="text-[11px] font-medium text-[#5e6b7f]">{label}</span><select value={value} onChange={(event) => onChange(event.currentTarget.value)} className="h-9 rounded-[5px] border border-[#dfe3ea] bg-white px-3 text-[12px] text-[#354154] outline-none transition focus:border-[#278fee] focus:ring-2 focus:ring-[#278fee]/10">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function EditModalShell({ title, description, onClose, onSave, children }: { title: string; description: string; onClose: () => void; onSave: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0b1830]/45 p-5 backdrop-blur-[2px]"><div className="w-[min(700px,calc(100vw-40px))] overflow-hidden rounded-[12px] bg-white shadow-[0_24px_80px_rgba(16,27,52,.28)]"><div className="flex items-start justify-between border-b border-[#e7eaf0] px-6 py-4"><div><h2 className="text-[17px] font-semibold text-[#273244]">{title}</h2><p className="mt-1 text-[11px] text-[#99a2b0]">{description}</p></div><button type="button" onClick={onClose} className="rounded-full p-1.5 text-[#8d97a6] hover:bg-[#f2f4f7]"><X className="h-5 w-5" /></button></div><div className="max-h-[62vh] overflow-y-auto p-6">{children}</div><div className="flex items-center justify-end gap-3 border-t border-[#e7eaf0] px-6 py-4"><button type="button" onClick={onClose} className="h-9 rounded-[5px] border border-[#dfe3ea] px-5 text-[12px] text-[#687386] hover:border-[#b8c2d0]">取消</button><button type="button" onClick={onSave} className="h-9 rounded-[5px] bg-[#278fee] px-5 text-[12px] text-white shadow-[0_4px_10px_rgba(39,143,238,.16)] hover:bg-[#167fdc]">保存</button></div></div></div>;
}

function NodeEditDialog({ row, onClose, onSave }: { row: NodeRow; onClose: () => void; onSave: (row: NodeRow) => void }) {
  const [form, setForm] = useState(row);
  const update = (patch: Partial<NodeRow>) => setForm((current) => ({ ...current, ...patch }));

  return <EditModalShell title="编辑引导词节点" description="节点编号和关键词不可编辑，其余配置可以修改。保存后会更新当前列表数据。" onClose={onClose} onSave={() => onSave({ ...form, updated_at: formatUpdatedAt(), updated_by: '管理员' })}><div className="grid grid-cols-2 gap-4"><FormInput label="节点编号" value={String(form.node_id)} disabled /><FormInput label="关键词" value={form.keyword} disabled /><FormInput label="归一化键" value={form.normalized_key} onChange={(value) => update({ normalized_key: value })} /><FormSelect label="层级" value={String(form.level)} options={[{ label: '1级', value: '1' }, { label: '2级', value: '2' }, { label: '3级', value: '3' }]} onChange={(value) => update({ level: Number(value) })} /><FormInput label="父节点编号" value={form.parent_id == null ? '' : String(form.parent_id)} placeholder="无父节点可留空" onChange={(value) => update({ parent_id: value.trim() ? Number(value) : null })} /><FormSelect label="引导类型" value={form.guide_type} options={[{ label: '分类', value: 'category' }, { label: '场景', value: 'scene' }, { label: '风格', value: 'style' }, { label: '行业', value: 'industry' }]} onChange={(value) => update({ guide_type: value })} /><FormInput label="外部评分" value={form.external_score} onChange={(value) => update({ external_score: value })} /><FormSelect label="状态" value={form.status} options={[{ label: '启用', value: '启用' }, { label: '禁用', value: '禁用' }]} onChange={(value) => update({ status: value as NodeRow['status'] })} /><FormInput label="数据来源" value={form.source} onChange={(value) => update({ source: value })} /><FormInput label="更新人" value="管理员（保存后自动记录）" disabled /></div></EditModalShell>;
}

function EdgeEditDialog({ row, onClose, onSave }: { row: EdgeRow; onClose: () => void; onSave: (row: EdgeRow) => void }) {
  const [form, setForm] = useState(row);
  const update = (patch: Partial<EdgeRow>) => setForm((current) => ({ ...current, ...patch }));

  return <EditModalShell title="编辑引导词关系" description="关系编号不可编辑，其余关系配置可以修改。保存后会更新当前列表数据。" onClose={onClose} onSave={() => onSave({ ...form, updated_at: formatUpdatedAt(), updated_by: '管理员' })}><div className="grid grid-cols-2 gap-4"><FormInput label="关系编号" value={String(form.edge_id)} disabled /><FormInput label="父节点" value={form.parent} onChange={(value) => update({ parent: value })} /><FormInput label="子节点" value={form.child} onChange={(value) => update({ child: value })} /><FormSelect label="关系类型" value={form.edge_type} options={[{ label: '父子关系', value: 'parent_child' }, { label: '同义关系', value: 'synonym' }, { label: '相关关系', value: 'related' }]} onChange={(value) => update({ edge_type: value })} /><FormInput label="权重" value={form.weight} onChange={(value) => update({ weight: value })} /><FormInput label="共现次数" value={String(form.cooccur_cnt)} onChange={(value) => update({ cooccur_cnt: Number(value) || 0 })} /><FormSelect label="状态" value={form.status} options={[{ label: '启用', value: '启用' }, { label: '禁用', value: '禁用' }]} onChange={(value) => update({ status: value as EdgeRow['status'] })} /><FormInput label="数据来源" value={form.source} onChange={(value) => update({ source: value })} /><FormInput label="更新人" value="管理员（保存后自动记录）" disabled /></div></EditModalShell>;
}

type EditTarget = { kind: 'nodes'; row: NodeRow } | { kind: 'edges'; row: EdgeRow };

function DeleteConfirmDialog({ label, onClose, onConfirm }: { label: string; onClose: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#0b1830]/45 p-5 backdrop-blur-[2px]"><div className="w-[min(440px,calc(100vw-40px))] rounded-[12px] bg-white p-6 shadow-[0_24px_80px_rgba(16,27,52,.28)]"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff5e8] text-[#e8a234]"><AlertTriangle className="h-5 w-5" /></div><div><h2 className="text-[16px] font-semibold text-[#273244]">确认删除</h2><p className="mt-2 text-[12px] leading-5 text-[#6e798a]">确定要删除“{label}”吗？删除后数据将从当前列表中移除，且无法恢复。</p></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="h-9 rounded-[5px] border border-[#dfe3ea] px-5 text-[12px] text-[#687386] hover:border-[#b8c2d0]">取消</button><button type="button" onClick={onConfirm} className="h-9 rounded-[5px] bg-[#e85a5a] px-5 text-[12px] text-white hover:bg-[#d94747]">确认删除</button></div></div></div>;
}

function formatUpdatedAt() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function GuidedSearchConfigPage({ onBackToDirectory, onNavigateToSkillConfig, onOpenRequirement }: { onBackToDirectory: () => void; onNavigateToSkillConfig: () => void; onOpenRequirement?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabKey>('nodes');
  const [nodes, setNodes] = useState(nodeRows);
  const [edges, setEdges] = useState(edgeRows);
  const [nodeFilters, setNodeFilters] = useState({ keyword: '', normalizedKey: '', level: '', guideType: '', status: '', region: 'CN', language: 'zh' });
  const [appliedNodeFilters, setAppliedNodeFilters] = useState(nodeFilters);
  const [edgeFilters, setEdgeFilters] = useState({ parent: '', child: '', edgeType: '', status: '', weight: '' });
  const [appliedEdgeFilters, setAppliedEdgeFilters] = useState(edgeFilters);
  const [mappingQuery, setMappingQuery] = useState('');
  const [mappingRegion, setMappingRegion] = useState('CN');
  const [mappingLanguage, setMappingLanguage] = useState('zh');
  const [mappingQueried, setMappingQueried] = useState(false);
  const [mappingType, setMappingType] = useState('');
  const [mappingSource, setMappingSource] = useState('');
  const [importKind, setImportKind] = useState<ImportKind | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: ImportKind; id: number; label: string } | null>(null);
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const filteredNodes = useMemo(() => nodes.filter((row) => (!appliedNodeFilters.keyword || row.keyword.includes(appliedNodeFilters.keyword)) && (!appliedNodeFilters.normalizedKey || row.normalized_key.includes(appliedNodeFilters.normalizedKey)) && (!appliedNodeFilters.level || String(row.level) === appliedNodeFilters.level) && (!appliedNodeFilters.guideType || row.guide_type === appliedNodeFilters.guideType) && (!appliedNodeFilters.status || row.status === appliedNodeFilters.status)), [appliedNodeFilters, nodes]);
  const filteredEdges = useMemo(() => edges.filter((row) => (!appliedEdgeFilters.parent || row.parent.includes(appliedEdgeFilters.parent)) && (!appliedEdgeFilters.child || row.child.includes(appliedEdgeFilters.child)) && (!appliedEdgeFilters.edgeType || row.edge_type === appliedEdgeFilters.edgeType) && (!appliedEdgeFilters.status || row.status === appliedEdgeFilters.status)), [appliedEdgeFilters, edges]);
  const filteredMappings = useMemo(() => mappingRows.filter((row) => (!mappingType || row.guide_type === mappingType) && (!mappingSource || row.recall_source === mappingSource)), [mappingSource, mappingType]);
  const queryKey = normalizeQuery(mappingQuery);

  const handleImportConfirm = (successCount: number, errorCount: number) => {
    setImportKind(null);
    notify(`导入完成：成功 ${successCount} 条，失败 ${errorCount} 条`);
  };

  const handleEditSave = (updatedRow: NodeRow | EdgeRow) => {
    if ('node_id' in updatedRow) {
      setNodes((current) => current.map((row) => row.node_id === updatedRow.node_id ? updatedRow : row));
      notify(`节点“${updatedRow.keyword}”已保存`);
    } else {
      setEdges((current) => current.map((row) => row.edge_id === updatedRow.edge_id ? updatedRow : row));
      notify(`关系 ${updatedRow.edge_id} 已保存`);
    }
    setEditTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'nodes') {
      setNodes((current) => current.filter((row) => row.node_id !== deleteTarget.id));
    } else {
      setEdges((current) => current.filter((row) => row.edge_id !== deleteTarget.id));
    }
    notify(`“${deleteTarget.label}”已删除`);
    setDeleteTarget(null);
  };

  const applyNodeFilters = () => {
    setAppliedNodeFilters(nodeFilters);
    notify('节点筛选条件已应用');
  };

  const applyEdgeFilters = () => {
    setAppliedEdgeFilters(edgeFilters);
    notify('关系筛选条件已应用');
  };

  const toggleNodeStatus = (row: NodeRow) => {
    const nextStatus: NodeRow['status'] = row.status === '启用' ? '禁用' : '启用';
    setNodes((current) => current.map((item) => item.node_id === row.node_id ? { ...item, status: nextStatus, updated_at: formatUpdatedAt(), updated_by: '管理员' } : item));
    notify(`${row.keyword} 已${nextStatus}`);
  };

  const toggleEdgeStatus = (row: EdgeRow) => {
    const nextStatus: EdgeRow['status'] = row.status === '启用' ? '禁用' : '启用';
    setEdges((current) => current.map((item) => item.edge_id === row.edge_id ? { ...item, status: nextStatus, updated_at: formatUpdatedAt(), updated_by: '管理员' } : item));
    notify(`关系 ${row.edge_id} 已${nextStatus}`);
  };

  const renderNodeTab = () => (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#edf0f4] bg-[#fafbfc] p-3"><div className="flex min-w-0 flex-1 flex-wrap items-center gap-2"><input value={nodeFilters.keyword} onChange={(event) => setNodeFilters((current) => ({ ...current, keyword: event.currentTarget.value }))} placeholder="关键词" className="h-8 w-[150px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><input value={nodeFilters.normalizedKey} onChange={(event) => setNodeFilters((current) => ({ ...current, normalizedKey: event.currentTarget.value }))} placeholder="归一化键" className="h-8 w-[150px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><select value={nodeFilters.level} onChange={(event) => setNodeFilters((current) => ({ ...current, level: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">层级</option><option value="1">1级</option><option value="2">2级</option><option value="3">3级</option></select><select value={nodeFilters.guideType} onChange={(event) => setNodeFilters((current) => ({ ...current, guideType: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">类型</option><option value="category">分类</option><option value="scene">场景</option><option value="style">风格</option><option value="industry">行业</option></select><select value={nodeFilters.status} onChange={(event) => setNodeFilters((current) => ({ ...current, status: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">状态</option><option value="启用">启用</option><option value="禁用">禁用</option></select><select value={nodeFilters.region} onChange={(event) => setNodeFilters((current) => ({ ...current, region: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="CN">中国大陆</option><option value="US">美国</option></select><select value={nodeFilters.language} onChange={(event) => setNodeFilters((current) => ({ ...current, language: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="zh">中文</option><option value="en">英文</option></select><ActionButton icon={Search} variant="primary" onClick={applyNodeFilters}>查询</ActionButton></div><div className="ml-auto flex shrink-0 items-center gap-2"><ActionButton icon={Upload} variant="primary" onClick={() => setImportKind('nodes')}>导入数据</ActionButton></div></div>
      <div className="mt-4 overflow-x-auto rounded-[8px] border border-[#e7eaf0]"><table className="w-full min-w-[1260px] text-left text-[11px]"><thead className="bg-[#f8fafc] text-[#7b8697]"><tr>{['节点编号', '关键词', '归一化键', '层级', '父节点编号', '引导类型', '外部评分', '状态', '数据来源', '更新时间', '更新人', '操作'].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{filteredNodes.map((row) => <tr key={row.node_id} className="border-t border-[#edf0f4] text-[#536073] hover:bg-[#fafcff]"><td className="px-4 py-3 font-medium text-[#344155]">{row.node_id}</td><td className="px-4 py-3 font-medium text-[#344155]">{row.keyword}</td><td className="px-4 py-3 font-mono text-[#6c7890]">{row.normalized_key}</td><td className="px-4 py-3">{row.level}级</td><td className="px-4 py-3">{row.parent_id ?? '无'}</td><td className="px-4 py-3"><span className="rounded bg-[#f1f4fb] px-2 py-1 text-[10px] text-[#637089]">{displayValue(row.guide_type)}</span></td><td className="px-4 py-3">{row.external_score}</td><td className="px-4 py-3"><StatusTag status={row.status} /></td><td className="px-4 py-3">{displayValue(row.source)}</td><td className="px-4 py-3 whitespace-nowrap text-[#8d97a7]">{row.updated_at}</td><td className="px-4 py-3 whitespace-nowrap text-[#667286]">{row.updated_by}</td><td className="px-4 py-3"><div className="flex items-center gap-2 whitespace-nowrap"><button type="button" onClick={() => setEditTarget({ kind: 'nodes', row })} className="text-[#278fee] hover:underline"><Pencil className="mr-1 inline h-3.5 w-3.5" />编辑</button><button type="button" onClick={() => toggleNodeStatus(row)} className="text-[#7f8999] hover:text-[#278fee]"><Power className="mr-1 inline h-3.5 w-3.5" />{row.status === '启用' ? '禁用' : '启用'}</button><button type="button" onClick={() => setDeleteTarget({ kind: 'nodes', id: row.node_id, label: row.keyword })} className="text-[#e05d62] hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" />删除</button></div></td></tr>)}</tbody></table>{filteredNodes.length === 0 ? <div className="p-12 text-center text-[12px] text-[#9ca5b2]">暂无引导词节点，可导入数据或手动新增</div> : null}</div>
      <Pagination total={filteredNodes.length} />
    </>
  );

  const renderEdgeTab = () => (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#edf0f4] bg-[#fafbfc] p-3"><div className="flex min-w-0 flex-1 flex-wrap items-center gap-2"><input value={edgeFilters.parent} onChange={(event) => setEdgeFilters((current) => ({ ...current, parent: event.currentTarget.value }))} placeholder="父节点编号 / 关键词" className="h-8 w-[180px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><input value={edgeFilters.child} onChange={(event) => setEdgeFilters((current) => ({ ...current, child: event.currentTarget.value }))} placeholder="子节点编号 / 关键词" className="h-8 w-[180px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><select value={edgeFilters.edgeType} onChange={(event) => setEdgeFilters((current) => ({ ...current, edgeType: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">关系类型</option><option value="parent_child">父子关系</option><option value="synonym">同义关系</option><option value="related">相关关系</option></select><select value={edgeFilters.status} onChange={(event) => setEdgeFilters((current) => ({ ...current, status: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">状态</option><option value="启用">启用</option><option value="禁用">禁用</option></select><input value={edgeFilters.weight} onChange={(event) => setEdgeFilters((current) => ({ ...current, weight: event.currentTarget.value }))} placeholder="权重范围，如 0.8-1" className="h-8 w-[150px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><ActionButton icon={Search} variant="primary" onClick={applyEdgeFilters}>查询</ActionButton></div><div className="ml-auto flex shrink-0 items-center gap-2"><ActionButton icon={Upload} variant="primary" onClick={() => setImportKind('edges')}>导入数据</ActionButton></div></div>
      <div className="mt-4 overflow-x-auto rounded-[8px] border border-[#e7eaf0]"><table className="w-full min-w-[1200px] text-left text-[11px]"><thead className="bg-[#f8fafc] text-[#7b8697]"><tr>{['关系编号', '父节点', '子节点', '关系类型', '权重', '共现次数', '数据来源', '状态', '更新时间', '更新人', '操作'].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{filteredEdges.map((row) => <tr key={row.edge_id} className="border-t border-[#edf0f4] text-[#536073] hover:bg-[#fafcff]"><td className="px-4 py-3 font-medium text-[#344155]">{row.edge_id}</td><td className="px-4 py-3 font-medium text-[#344155]">{row.parent}</td><td className="px-4 py-3 font-medium text-[#344155]">{row.child}</td><td className="px-4 py-3"><span className="rounded bg-[#f1f4fb] px-2 py-1 text-[10px] text-[#637089]">{displayValue(row.edge_type)}</span></td><td className="px-4 py-3">{row.weight}</td><td className="px-4 py-3">{row.cooccur_cnt.toLocaleString()}</td><td className="px-4 py-3">{displayValue(row.source)}</td><td className="px-4 py-3"><StatusTag status={row.status} /></td><td className="px-4 py-3 whitespace-nowrap text-[#8d97a7]">{row.updated_at}</td><td className="px-4 py-3 whitespace-nowrap text-[#667286]">{row.updated_by}</td><td className="px-4 py-3"><div className="flex items-center gap-2 whitespace-nowrap"><button type="button" onClick={() => setEditTarget({ kind: 'edges', row })} className="text-[#278fee] hover:underline"><Pencil className="mr-1 inline h-3.5 w-3.5" />编辑</button><button type="button" onClick={() => toggleEdgeStatus(row)} className="text-[#7f8999] hover:text-[#278fee]"><Power className="mr-1 inline h-3.5 w-3.5" />{row.status === '启用' ? '禁用' : '启用'}</button><button type="button" onClick={() => setDeleteTarget({ kind: 'edges', id: row.edge_id, label: `${row.parent} → ${row.child}` })} className="text-[#e05d62] hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" />删除</button></div></td></tr>)}</tbody></table>{filteredEdges.length === 0 ? <div className="p-12 text-center text-[12px] text-[#9ca5b2]">暂无关系数据，可导入或先维护节点</div> : null}</div>
      <Pagination total={filteredEdges.length} />
    </>
  );

  const renderMappingTab = () => (
    <>
      <div className="rounded-[8px] border border-[#edf0f4] bg-[#fafbfc] p-4"><div className="flex flex-wrap items-end gap-3"><label className="flex min-w-[320px] flex-1 flex-col gap-1.5"><span className="text-[11px] font-medium text-[#677386]">业务搜索词</span><input value={mappingQuery} onChange={(event) => { setMappingQuery(event.currentTarget.value); setMappingQueried(false); }} placeholder="输入用户可能搜索的词，如“手机海报”" className="h-9 rounded-[4px] border border-[#dfe3ea] bg-white px-3 text-[12px] outline-none focus:border-[#278fee]" /></label><label className="flex flex-col gap-1.5"><span className="text-[11px] font-medium text-[#677386]">地区</span><select value={mappingRegion} onChange={(event) => setMappingRegion(event.currentTarget.value)} className="h-9 w-[100px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[12px] text-[#657184] outline-none"><option value="CN">中国大陆</option><option value="US">美国</option></select></label><label className="flex flex-col gap-1.5"><span className="text-[11px] font-medium text-[#677386]">语言</span><select value={mappingLanguage} onChange={(event) => setMappingLanguage(event.currentTarget.value)} className="h-9 w-[100px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[12px] text-[#657184] outline-none"><option value="zh">中文</option><option value="en">英文</option></select></label><button type="button" onClick={() => { if (!mappingQuery.trim()) { setMappingQueried(false); notify('请输入业务搜索词'); return; } setMappingQueried(true); notify('查询映射已更新'); }} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[#278fee] px-5 text-[12px] text-white hover:bg-[#167fdc]"><Search className="h-3.5 w-3.5" />查询</button></div>{mappingQuery.trim() ? <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8b95a4]">当前归一化查询键：<span className="rounded bg-[#eef3fb] px-2 py-1 font-mono text-[#56647a]">{queryKey}</span></div> : null}</div>
      {!mappingQueried ? <div className="mt-5 flex min-h-[330px] items-center justify-center rounded-[8px] border border-[#edf0f4] bg-white"><div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[#5d91e9]"><Search className="h-5 w-5" /></div><h3 className="mt-3 text-[14px] font-medium text-[#4f5c70]">输入业务搜索词，查看该词下配置的引导胶囊及排序</h3><p className="mt-1 text-[11px] text-[#a0a8b5]">例如输入“手机海报”，查看真实映射结果</p></div></div> : (
        <div className="mt-5"><div className="rounded-[8px] border border-[#e1e7f4] bg-[linear-gradient(135deg,#f5f8ff,#ffffff)] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[12px] font-semibold text-[#2f3d53]">查询摘要</div><div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#798597]"><span>原始输入：<b className="font-medium text-[#46546a]">{mappingQuery}</b></span><span>归一化查询键：<b className="font-mono font-medium text-[#46546a]">{queryKey}</b></span><span>地区：{displayValue(mappingRegion)}</span><span>语言：{displayValue(mappingLanguage)}</span><span>命中映射条数：6</span></div></div><div className="flex h-9 items-center gap-2 rounded-[6px] bg-white px-3 text-[11px] text-[#5f6d82] shadow-[0_3px_12px_rgba(60,87,132,.08)]"><Network className="h-4 w-4 text-[#5a8fea]" />图谱命中</div></div><div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-[11px] text-[#8993a3]">用户将看到：</span>{guideCapsules.map((capsule, index) => <span key={capsule} className={`rounded-full border px-3 py-1.5 text-[11px] ${index < 3 ? 'border-[#bbd2fa] bg-[#edf4ff] text-[#3f76c7]' : 'border-[#e5e9f1] bg-white text-[#657286]'}`}>{capsule}</span>)}</div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[12px] font-medium text-[#354154]"><Table2 className="h-4 w-4 text-[#5b8de2]" />排序结果</div><div className="flex items-center gap-2"><select value={mappingType} onChange={(event) => setMappingType(event.currentTarget.value)} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">全部引导类型</option><option value="scene">场景</option><option value="style">风格</option></select><select value={mappingSource} onChange={(event) => setMappingSource(event.currentTarget.value)} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">全部召回来源</option><option value="graph">图谱</option><option value="rule">规则</option></select></div></div><div className="mt-3 overflow-x-auto rounded-[8px] border border-[#e7eaf0]"><table className="w-full min-w-[1100px] text-left text-[11px]"><thead className="bg-[#f8fafc] text-[#7b8697]"><tr>{['排序位置', '引导节点编号', '引导词', '引导类型', '基础排序分', '最终排序分', '召回来源', '用户分群', '近7日点击率', '过期时间'].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{filteredMappings.map((row) => <tr key={row.guide_node_id} className="border-t border-[#edf0f4] text-[#536073] hover:bg-[#fafcff]"><td className="px-4 py-3 font-semibold text-[#278fee]">{row.rank_position}</td><td className="px-4 py-3">{row.guide_node_id}</td><td className="px-4 py-3 font-medium text-[#344155]">{row.keyword}</td><td className="px-4 py-3"><span className="rounded bg-[#f1f4fb] px-2 py-1 text-[10px] text-[#637089]">{displayValue(row.guide_type)}</span></td><td className="px-4 py-3">{row.rank_score_base}</td><td className="px-4 py-3 font-medium text-[#405a85]">{row.rank_score_final}</td><td className="px-4 py-3">{displayValue(row.recall_source)}</td><td className="px-4 py-3">{row.user_segment === 'all' ? '全部用户' : row.user_segment}</td><td className="px-4 py-3">{row.ctr_7d}</td><td className="px-4 py-3">{row.expire_at}</td></tr>)}</tbody></table>{filteredMappings.length === 0 ? <div className="p-12 text-center text-[12px] text-[#9ca5b2]">该查询词暂无映射配置<p className="mt-1 text-[11px]">可检查节点/关系是否已配置，或等待离线任务生成映射</p></div> : null}</div><Pagination total={filteredMappings.length} /></div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#1f2838]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="搜索引导管理" onNavigate={(item) => item === 'AI电商配置' && onNavigateToSkillConfig()} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5"><div className="mb-4 flex items-center gap-2 text-[12px] text-[#9aa3b1]"><span>内容运营管理</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4f5b6f]">搜索引导管理</span></div><section className="rounded-[3px] bg-white p-5 shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[20px] font-semibold text-[#283244]">搜索引导管理</h1><p className="mt-1.5 text-[12px] text-[#8e98a8]">维护引导词节点、节点关系，并按业务搜索词查询实际映射配置</p></div><button type="button" onClick={onOpenRequirement} className="inline-flex h-9 shrink-0 items-center rounded-[5px] border border-[#ff8b83] bg-[#fff0ee] px-4 text-[12px] font-semibold text-[#e84b43] shadow-[0_3px_10px_rgba(232,75,67,.12)] transition hover:border-[#f05b53] hover:bg-[#ffe2df] hover:text-[#d9362e]">需求说明</button></div><div className="mt-5 flex items-center gap-1 border-b border-[#e9edf3]"><TabButton active={activeTab === 'nodes'} onClick={() => setActiveTab('nodes')} icon={Table2}>引导词节点</TabButton><TabButton active={activeTab === 'edges'} onClick={() => setActiveTab('edges')} icon={Network}>引导词关系</TabButton><TabButton active={activeTab === 'mapping'} onClick={() => setActiveTab('mapping')} icon={Search}>查询映射</TabButton></div><div className="pt-5">{activeTab === 'nodes' ? renderNodeTab() : activeTab === 'edges' ? renderEdgeTab() : renderMappingTab()}</div></section></div>
      </main>
      {toast ? <div className="fixed bottom-7 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-[8px] bg-[#263449] px-4 py-3 text-[12px] text-white shadow-[0_12px_30px_rgba(22,34,54,.22)]"><Check className="h-4 w-4 text-[#65d49b]" />{toast}</div> : null}
      {importKind ? <ImportDialog kind={importKind} onClose={() => setImportKind(null)} onConfirm={handleImportConfirm} /> : null}
      {editTarget?.kind === 'nodes' ? <NodeEditDialog key={`node-${editTarget.row.node_id}`} row={editTarget.row} onClose={() => setEditTarget(null)} onSave={handleEditSave} /> : null}
      {editTarget?.kind === 'edges' ? <EdgeEditDialog key={`edge-${editTarget.row.edge_id}`} row={editTarget.row} onClose={() => setEditTarget(null)} onSave={handleEditSave} /> : null}
      {deleteTarget ? <DeleteConfirmDialog label={deleteTarget.label} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} /> : null}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Table2; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`relative inline-flex items-center gap-2 px-4 pb-3 text-[13px] transition ${active ? 'font-medium text-[#278fee]' : 'text-[#7c8797] hover:text-[#278fee]'}`}>{<Icon className="h-4 w-4" />}{children}{active ? <span className="absolute bottom-[-1px] left-3 right-3 h-0.5 rounded-full bg-[#278fee]" /> : null}</button>;
}

function Pagination({ total }: { total: number }) {
  return <div className="flex items-center justify-between py-4 text-[11px] text-[#98a2b0]"><span>共 {total} 条</span><div className="flex items-center gap-2"><button type="button" disabled className="h-7 rounded border border-[#e1e5eb] px-2.5 disabled:text-[#c2c8d1]">上一页</button><span className="flex h-7 min-w-7 items-center justify-center rounded bg-[#278fee] px-2 text-white">1</span><button type="button" className="h-7 rounded border border-[#e1e5eb] px-2.5 text-[#687386]">下一页</button><select className="h-7 rounded border border-[#e1e5eb] bg-white px-2 text-[11px] text-[#687386]"><option>20条/页</option><option>50条/页</option></select></div></div>;
}

