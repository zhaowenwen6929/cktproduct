import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Network,
  Pencil,
  Power,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Table2,
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
  status: '启用' | '下线';
  source: string;
  updated_at: string;
};

type EdgeRow = {
  edge_id: number;
  parent: string;
  child: string;
  edge_type: string;
  weight: string;
  cooccur_cnt: number;
  source: string;
  status: '启用' | '下线';
  updated_at: string;
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
  { node_id: 1001, keyword: '手机海报', normalized_key: 'shouji_haibao', level: 1, parent_id: null, guide_type: 'category', external_score: '1.00', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:28' },
  { node_id: 1003, keyword: '简历', normalized_key: 'jianli', level: 1, parent_id: null, guide_type: 'category', external_score: '0.33', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:27' },
  { node_id: 1010, keyword: '招聘', normalized_key: 'zhaopin', level: 2, parent_id: 1001, guide_type: 'scene', external_score: '0.90', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:26' },
  { node_id: 1020, keyword: '极简风', normalized_key: 'jijianfeng', level: 2, parent_id: 1001, guide_type: 'style', external_score: '0.80', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:25' },
  { node_id: 1030, keyword: '互联网', normalized_key: 'hulianwang', level: 3, parent_id: 1010, guide_type: 'industry', external_score: '0.70', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:24' },
  { node_id: 1031, keyword: '餐饮', normalized_key: 'canyin', level: 3, parent_id: 1010, guide_type: 'industry', external_score: '0.49', status: '启用', source: 'template_tag', updated_at: '2026-10-21 14:23' },
];

const edgeRows: EdgeRow[] = [
  { edge_id: 2002, parent: '手机海报(1001)', child: '招聘(1010)', edge_type: 'parent_child', weight: '0.88', cooccur_cnt: 12000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:20' },
  { edge_id: 2005, parent: '手机海报(1001)', child: '极简风(1020)', edge_type: 'parent_child', weight: '0.95', cooccur_cnt: 15000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:19' },
  { edge_id: 2014, parent: '简历(1003)', child: '招聘(1010)', edge_type: 'parent_child', weight: '0.95', cooccur_cnt: 8000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:18' },
  { edge_id: 2023, parent: '招聘(1010)', child: '互联网(1030)', edge_type: 'parent_child', weight: '0.95', cooccur_cnt: 5000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:17' },
  { edge_id: 2024, parent: '招聘(1010)', child: '餐饮(1031)', edge_type: 'parent_child', weight: '0.81', cooccur_cnt: 3000, source: 'co_occur', status: '启用', updated_at: '2026-10-21 14:16' },
];

const mappingRows: MappingRow[] = [
  { rank_position: 1, guide_node_id: 1010, keyword: '招聘', guide_type: 'scene', rank_score_base: '0.892', rank_score_final: '0.892', recall_source: 'graph', user_segment: 'all', ctr_7d: '0.041', expire_at: '2026-12-31' },
  { rank_position: 2, guide_node_id: 1020, keyword: '极简风', guide_type: 'style', rank_score_base: '0.860', rank_score_final: '0.860', recall_source: 'graph', user_segment: 'all', ctr_7d: '0.038', expire_at: '2026-12-31' },
  { rank_position: 3, guide_node_id: 1011, keyword: '促销', guide_type: 'scene', rank_score_base: '0.836', rank_score_final: '0.836', recall_source: 'graph', user_segment: 'all', ctr_7d: '0.035', expire_at: '2026-12-31' },
];

const guideCapsules = ['招聘', '极简风', '促销', '节日', '电商', '国潮'];

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
            <div className="mt-5 overflow-hidden rounded-[8px] border border-[#e6e9ef]"><div className="flex items-center justify-between border-b border-[#edf0f4] bg-[#fafbfc] px-4 py-3"><div className="text-[12px] font-medium text-[#354154]">导入预览</div><div className="flex items-center gap-3 text-[11px]"><span className="text-[#35a16b]">通过 {successCount} 行</span><span className="text-[#e05d62]">错误 {errorCount} 行</span></div></div><div className="max-h-[300px] overflow-auto"><table className="w-full min-w-[760px] text-left text-[11px]"><thead className="sticky top-0 bg-[#f8fafc] text-[#7a8596]"><tr>{(isNode ? ['行号', 'keyword', 'normalized_key', 'level', 'parent_id', '校验结果'] : ['行号', 'parent_node_id', 'child_node_id', 'edge_type', 'weight', '校验结果']).map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{previewRows.map((row, rowIndex) => <tr key={row[0]} className={`border-t border-[#f0f2f5] ${row[row.length - 1].startsWith('错误') ? 'bg-[#fff4f4] text-[#cf555b]' : row[row.length - 1].startsWith('警告') ? 'bg-[#fffaf0] text-[#a4772d]' : 'text-[#536073]'}`}>{row.map((cell) => <td key={`${rowIndex}-${cell}`} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-[#edf0f4] px-4 py-3"><span className="text-[10px] text-[#9ba4b2]">错误行不会写入，可下载后修正</span><button type="button" className="inline-flex items-center gap-1 text-[11px] text-[#278fee]"><Download className="h-3.5 w-3.5" />下载错误行</button></div></div>
          ) : <div className="mt-5 flex h-[180px] items-center justify-center rounded-[8px] border border-[#eef0f4] bg-[#fbfcfe] text-center"><div><FileSpreadsheet className="mx-auto h-8 w-8 text-[#c3cad6]" /><p className="mt-2 text-[12px] text-[#7e899a]">上传文件后查看导入预览</p><p className="mt-1 text-[10px] text-[#a9b1bd]">支持先预览，确认后再导入</p></div></div>}
        </div>
        <div className="flex items-center justify-between border-t border-[#e7eaf0] px-6 py-4"><span className="text-[11px] text-[#9ba4b2]">校验通过的数据才会进入导入队列</span><div className="flex items-center gap-3"><button type="button" onClick={onClose} className="h-9 rounded-[4px] border border-[#dfe3ea] px-5 text-[12px] text-[#687386]">取消</button><button type="button" disabled={!previewReady || successCount < 1} onClick={() => onConfirm(successCount, errorCount)} className="h-9 rounded-[4px] bg-[#278fee] px-5 text-[12px] text-white disabled:cursor-not-allowed disabled:bg-[#b9c8d8]">确认导入</button></div></div>
      </div>
    </div>
  );
}

export function GuidedSearchConfigPage({ onBackToDirectory, onNavigateToSkillConfig }: { onBackToDirectory: () => void; onNavigateToSkillConfig: () => void }) {
  const [activeTab, setActiveTab] = useState<TabKey>('nodes');
  const [nodeFilters, setNodeFilters] = useState({ keyword: '', normalizedKey: '', level: '', guideType: '', status: '', region: 'CN', language: 'zh' });
  const [edgeFilters, setEdgeFilters] = useState({ parent: '', child: '', edgeType: '', status: '', weight: '' });
  const [mappingQuery, setMappingQuery] = useState('');
  const [mappingRegion, setMappingRegion] = useState('CN');
  const [mappingLanguage, setMappingLanguage] = useState('zh');
  const [mappingQueried, setMappingQueried] = useState(false);
  const [mappingType, setMappingType] = useState('');
  const [mappingSource, setMappingSource] = useState('');
  const [importKind, setImportKind] = useState<ImportKind | null>(null);
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const filteredNodes = useMemo(() => nodeRows.filter((row) => (!nodeFilters.keyword || row.keyword.includes(nodeFilters.keyword)) && (!nodeFilters.normalizedKey || row.normalized_key.includes(nodeFilters.normalizedKey)) && (!nodeFilters.level || String(row.level) === nodeFilters.level) && (!nodeFilters.guideType || row.guide_type === nodeFilters.guideType) && (!nodeFilters.status || row.status === nodeFilters.status)), [nodeFilters]);
  const filteredEdges = useMemo(() => edgeRows.filter((row) => (!edgeFilters.parent || row.parent.includes(edgeFilters.parent)) && (!edgeFilters.child || row.child.includes(edgeFilters.child)) && (!edgeFilters.edgeType || row.edge_type === edgeFilters.edgeType) && (!edgeFilters.status || row.status === edgeFilters.status)), [edgeFilters]);
  const filteredMappings = useMemo(() => mappingRows.filter((row) => (!mappingType || row.guide_type === mappingType) && (!mappingSource || row.recall_source === mappingSource)), [mappingSource, mappingType]);
  const queryKey = normalizeQuery(mappingQuery);

  const handleImportConfirm = (successCount: number, errorCount: number) => {
    setImportKind(null);
    notify(`导入完成：成功 ${successCount} 条，失败 ${errorCount} 条`);
  };

  const renderNodeTab = () => (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><ActionButton icon={Upload} variant="primary" onClick={() => setImportKind('nodes')}>导入数据</ActionButton><ActionButton icon={Download} onClick={() => notify('节点导入模板下载已开始')}>下载导入模板</ActionButton><ActionButton icon={Download} onClick={() => notify('已按当前筛选条件导出节点结果')}>导出当前筛选结果</ActionButton><ActionButton icon={RefreshCw} onClick={() => notify('节点列表已刷新')}>刷新</ActionButton></div><span className="text-[11px] text-[#9aa3b1]">共 {filteredNodes.length} 条示例数据</span></div>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[8px] border border-[#edf0f4] bg-[#fafbfc] p-3"><Filter className="ml-1 h-4 w-4 text-[#8390a2]" /><input value={nodeFilters.keyword} onChange={(event) => setNodeFilters((current) => ({ ...current, keyword: event.currentTarget.value }))} placeholder="关键词" className="h-8 w-[150px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><input value={nodeFilters.normalizedKey} onChange={(event) => setNodeFilters((current) => ({ ...current, normalizedKey: event.currentTarget.value }))} placeholder="归一化键" className="h-8 w-[150px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><select value={nodeFilters.level} onChange={(event) => setNodeFilters((current) => ({ ...current, level: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">层级</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select><select value={nodeFilters.guideType} onChange={(event) => setNodeFilters((current) => ({ ...current, guideType: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">类型</option><option value="category">category</option><option value="scene">scene</option><option value="style">style</option><option value="industry">industry</option></select><select value={nodeFilters.status} onChange={(event) => setNodeFilters((current) => ({ ...current, status: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">状态</option><option value="启用">启用</option><option value="下线">下线</option></select><select value={nodeFilters.region} onChange={(event) => setNodeFilters((current) => ({ ...current, region: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option>CN</option><option>US</option></select><select value={nodeFilters.language} onChange={(event) => setNodeFilters((current) => ({ ...current, language: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option>zh</option><option>en</option></select></div>
      <div className="mt-4 overflow-x-auto rounded-[8px] border border-[#e7eaf0]"><table className="w-full min-w-[1120px] text-left text-[11px]"><thead className="bg-[#f8fafc] text-[#7b8697]"><tr>{['node_id', 'keyword', 'normalized_key', 'level', 'parent_id', 'guide_type', 'external_score', 'status', 'source', 'updated_at', '操作'].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{filteredNodes.map((row) => <tr key={row.node_id} className="border-t border-[#edf0f4] text-[#536073] hover:bg-[#fafcff]"><td className="px-4 py-3 font-medium text-[#344155]">{row.node_id}</td><td className="px-4 py-3 font-medium text-[#344155]">{row.keyword}</td><td className="px-4 py-3 font-mono text-[#6c7890]">{row.normalized_key}</td><td className="px-4 py-3">L{row.level}</td><td className="px-4 py-3">{row.parent_id ?? 'NULL'}</td><td className="px-4 py-3"><span className="rounded bg-[#f1f4fb] px-2 py-1 text-[10px] text-[#637089]">{row.guide_type}</span></td><td className="px-4 py-3">{row.external_score}</td><td className="px-4 py-3"><StatusTag status={row.status} /></td><td className="px-4 py-3">{row.source}</td><td className="px-4 py-3 whitespace-nowrap text-[#8d97a7]">{row.updated_at}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><button type="button" onClick={() => notify(`查看节点 ${row.node_id}`)} className="text-[#278fee] hover:underline"><Eye className="mr-1 inline h-3.5 w-3.5" />查看</button><button type="button" onClick={() => notify(`编辑节点 ${row.node_id}`)} className="text-[#278fee] hover:underline"><Pencil className="mr-1 inline h-3.5 w-3.5" />编辑</button><button type="button" onClick={() => notify(`${row.keyword} 已切换状态`)} className="text-[#7f8999] hover:text-[#278fee]"><Power className="mr-1 inline h-3.5 w-3.5" />上下线</button></div></td></tr>)}</tbody></table>{filteredNodes.length === 0 ? <div className="p-12 text-center text-[12px] text-[#9ca5b2]">暂无引导词节点，可导入数据或手动新增</div> : null}</div>
      <Pagination total={filteredNodes.length} />
    </>
  );

  const renderEdgeTab = () => (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><ActionButton icon={Upload} variant="primary" onClick={() => setImportKind('edges')}>导入数据</ActionButton><ActionButton icon={Download} onClick={() => notify('关系导入模板下载已开始')}>下载导入模板</ActionButton><ActionButton icon={Download} onClick={() => notify('已按当前筛选条件导出关系结果')}>导出当前筛选结果</ActionButton><ActionButton icon={RefreshCw} onClick={() => notify('关系列表已刷新')}>刷新</ActionButton></div><span className="text-[11px] text-[#9aa3b1]">共 {filteredEdges.length} 条示例数据</span></div>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[8px] border border-[#edf0f4] bg-[#fafbfc] p-3"><Filter className="ml-1 h-4 w-4 text-[#8390a2]" /><input value={edgeFilters.parent} onChange={(event) => setEdgeFilters((current) => ({ ...current, parent: event.currentTarget.value }))} placeholder="父节点 ID / 关键词" className="h-8 w-[180px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><input value={edgeFilters.child} onChange={(event) => setEdgeFilters((current) => ({ ...current, child: event.currentTarget.value }))} placeholder="子节点 ID / 关键词" className="h-8 w-[180px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /><select value={edgeFilters.edgeType} onChange={(event) => setEdgeFilters((current) => ({ ...current, edgeType: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">关系类型</option><option value="parent_child">parent_child</option><option value="synonym">synonym</option><option value="related">related</option></select><select value={edgeFilters.status} onChange={(event) => setEdgeFilters((current) => ({ ...current, status: event.currentTarget.value }))} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">状态</option><option value="启用">启用</option><option value="下线">下线</option></select><input value={edgeFilters.weight} onChange={(event) => setEdgeFilters((current) => ({ ...current, weight: event.currentTarget.value }))} placeholder="权重区间，如 0.8-1" className="h-8 w-[150px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] outline-none focus:border-[#278fee]" /></div>
      <div className="mt-4 overflow-x-auto rounded-[8px] border border-[#e7eaf0]"><table className="w-full min-w-[1060px] text-left text-[11px]"><thead className="bg-[#f8fafc] text-[#7b8697]"><tr>{['edge_id', '父节点', '子节点', 'edge_type', 'weight', 'cooccur_cnt', 'source', 'status', 'updated_at', '操作'].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{filteredEdges.map((row) => <tr key={row.edge_id} className="border-t border-[#edf0f4] text-[#536073] hover:bg-[#fafcff]"><td className="px-4 py-3 font-medium text-[#344155]">{row.edge_id}</td><td className="px-4 py-3 font-medium text-[#344155]">{row.parent}</td><td className="px-4 py-3 font-medium text-[#344155]">{row.child}</td><td className="px-4 py-3"><span className="rounded bg-[#f1f4fb] px-2 py-1 text-[10px] text-[#637089]">{row.edge_type}</span></td><td className="px-4 py-3">{row.weight}</td><td className="px-4 py-3">{row.cooccur_cnt.toLocaleString()}</td><td className="px-4 py-3">{row.source}</td><td className="px-4 py-3"><StatusTag status={row.status} /></td><td className="px-4 py-3 whitespace-nowrap text-[#8d97a7]">{row.updated_at}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><button type="button" onClick={() => notify(`查看关系 ${row.edge_id}`)} className="text-[#278fee] hover:underline"><Eye className="mr-1 inline h-3.5 w-3.5" />查看</button><button type="button" onClick={() => notify(`编辑关系 ${row.edge_id}`)} className="text-[#278fee] hover:underline"><Pencil className="mr-1 inline h-3.5 w-3.5" />编辑</button><button type="button" onClick={() => notify(`${row.edge_id} 已切换状态`)} className="text-[#7f8999] hover:text-[#278fee]"><Power className="mr-1 inline h-3.5 w-3.5" />上下线</button></div></td></tr>)}</tbody></table>{filteredEdges.length === 0 ? <div className="p-12 text-center text-[12px] text-[#9ca5b2]">暂无关系数据，可导入或先维护节点</div> : null}</div>
      <Pagination total={filteredEdges.length} />
    </>
  );

  const renderMappingTab = () => (
    <>
      <div className="rounded-[8px] border border-[#edf0f4] bg-[#fafbfc] p-4"><div className="flex flex-wrap items-end gap-3"><label className="flex min-w-[320px] flex-1 flex-col gap-1.5"><span className="text-[11px] font-medium text-[#677386]">业务搜索词</span><input value={mappingQuery} onChange={(event) => { setMappingQuery(event.currentTarget.value); setMappingQueried(false); }} placeholder="输入用户可能搜索的词，如“手机海报”" className="h-9 rounded-[4px] border border-[#dfe3ea] bg-white px-3 text-[12px] outline-none focus:border-[#278fee]" /></label><label className="flex flex-col gap-1.5"><span className="text-[11px] font-medium text-[#677386]">地区</span><select value={mappingRegion} onChange={(event) => setMappingRegion(event.currentTarget.value)} className="h-9 w-[100px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[12px] text-[#657184] outline-none"><option>CN</option><option>US</option></select></label><label className="flex flex-col gap-1.5"><span className="text-[11px] font-medium text-[#677386]">语言</span><select value={mappingLanguage} onChange={(event) => setMappingLanguage(event.currentTarget.value)} className="h-9 w-[100px] rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[12px] text-[#657184] outline-none"><option>zh</option><option>en</option></select></label><button type="button" onClick={() => { if (!mappingQuery.trim()) { setMappingQueried(false); notify('请输入业务搜索词'); return; } setMappingQueried(true); notify('查询映射已更新'); }} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[#278fee] px-5 text-[12px] text-white hover:bg-[#167fdc]"><Search className="h-3.5 w-3.5" />查询</button></div>{mappingQuery.trim() ? <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8b95a4]">当前归一化 query_key：<span className="rounded bg-[#eef3fb] px-2 py-1 font-mono text-[#56647a]">{queryKey}</span></div> : null}</div>
      {!mappingQueried ? <div className="mt-5 flex min-h-[330px] items-center justify-center rounded-[8px] border border-[#edf0f4] bg-white"><div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[#5d91e9]"><Search className="h-5 w-5" /></div><h3 className="mt-3 text-[14px] font-medium text-[#4f5c70]">输入业务搜索词，查看该词下配置的引导胶囊及排序</h3><p className="mt-1 text-[11px] text-[#a0a8b5]">例如输入“手机海报”，查看真实映射结果</p></div></div> : (
        <div className="mt-5"><div className="rounded-[8px] border border-[#e1e7f4] bg-[linear-gradient(135deg,#f5f8ff,#ffffff)] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[12px] font-semibold text-[#2f3d53]">查询摘要</div><div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#798597]"><span>原始输入：<b className="font-medium text-[#46546a]">{mappingQuery}</b></span><span>query_key：<b className="font-mono font-medium text-[#46546a]">{queryKey}</b></span><span>地区：{mappingRegion}</span><span>语言：{mappingLanguage}</span><span>命中映射条数：6</span></div></div><div className="flex h-9 items-center gap-2 rounded-[6px] bg-white px-3 text-[11px] text-[#5f6d82] shadow-[0_3px_12px_rgba(60,87,132,.08)]"><Network className="h-4 w-4 text-[#5a8fea]" />graph 命中</div></div><div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-[11px] text-[#8993a3]">用户将看到：</span>{guideCapsules.map((capsule, index) => <span key={capsule} className={`rounded-full border px-3 py-1.5 text-[11px] ${index < 3 ? 'border-[#bbd2fa] bg-[#edf4ff] text-[#3f76c7]' : 'border-[#e5e9f1] bg-white text-[#657286]'}`}>{capsule}</span>)}</div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[12px] font-medium text-[#354154]"><Table2 className="h-4 w-4 text-[#5b8de2]" />排序结果</div><div className="flex items-center gap-2"><select value={mappingType} onChange={(event) => setMappingType(event.currentTarget.value)} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">全部 guide_type</option><option value="scene">scene</option><option value="style">style</option></select><select value={mappingSource} onChange={(event) => setMappingSource(event.currentTarget.value)} className="h-8 rounded-[4px] border border-[#dfe3ea] bg-white px-2.5 text-[11px] text-[#657184] outline-none"><option value="">全部 recall_source</option><option value="graph">graph</option><option value="rule">rule</option></select></div></div><div className="mt-3 overflow-x-auto rounded-[8px] border border-[#e7eaf0]"><table className="w-full min-w-[1100px] text-left text-[11px]"><thead className="bg-[#f8fafc] text-[#7b8697]"><tr>{['rank_position', 'guide_node_id', '引导词 keyword', 'guide_type', 'rank_score_base', 'rank_score_final', 'recall_source', 'user_segment', 'ctr_7d', 'expire_at'].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{filteredMappings.map((row) => <tr key={row.guide_node_id} className="border-t border-[#edf0f4] text-[#536073] hover:bg-[#fafcff]"><td className="px-4 py-3 font-semibold text-[#278fee]">{row.rank_position}</td><td className="px-4 py-3">{row.guide_node_id}</td><td className="px-4 py-3 font-medium text-[#344155]">{row.keyword}</td><td className="px-4 py-3"><span className="rounded bg-[#f1f4fb] px-2 py-1 text-[10px] text-[#637089]">{row.guide_type}</span></td><td className="px-4 py-3">{row.rank_score_base}</td><td className="px-4 py-3 font-medium text-[#405a85]">{row.rank_score_final}</td><td className="px-4 py-3">{row.recall_source}</td><td className="px-4 py-3">{row.user_segment}</td><td className="px-4 py-3">{row.ctr_7d}</td><td className="px-4 py-3">{row.expire_at}</td></tr>)}</tbody></table>{filteredMappings.length === 0 ? <div className="p-12 text-center text-[12px] text-[#9ca5b2]">该查询词暂无映射配置<p className="mt-1 text-[11px]">可检查节点/关系是否已配置，或等待离线任务生成映射</p></div> : null}</div><Pagination total={filteredMappings.length} /></div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-[#1f2838]">
      <AdminSidebar onBackToDirectory={onBackToDirectory} activeItem="搜索引导管理" onNavigate={(item) => item === 'AI电商配置' && onNavigateToSkillConfig()} />
      <TopHeader />
      <main className="ml-[228px] min-h-screen pt-[62px]">
        <div className="px-6 py-5"><div className="mb-4 flex items-center gap-2 text-[12px] text-[#9aa3b1]"><span>内容运营管理</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-[#4f5b6f]">搜索引导管理</span></div><section className="rounded-[3px] bg-white p-5 shadow-[0_2px_8px_rgba(44,57,83,.04)]"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[20px] font-semibold text-[#283244]">搜索引导管理</h1><p className="mt-1.5 text-[12px] text-[#8e98a8]">维护引导词节点、节点关系，并按业务搜索词查询实际映射配置</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-[#edf8f2] px-3 py-1 text-[11px] text-[#35a16b]">配置中心</span><span className="rounded-full bg-[#f1f4fa] px-3 py-1 text-[11px] text-[#66748a]">当前角色：admin</span></div></div><div className="mt-5 flex items-center gap-1 border-b border-[#e9edf3]"><TabButton active={activeTab === 'nodes'} onClick={() => setActiveTab('nodes')} icon={Table2}>引导词节点</TabButton><TabButton active={activeTab === 'edges'} onClick={() => setActiveTab('edges')} icon={Network}>引导词关系</TabButton><TabButton active={activeTab === 'mapping'} onClick={() => setActiveTab('mapping')} icon={Search}>查询映射</TabButton></div><div className="pt-5">{activeTab === 'nodes' ? renderNodeTab() : activeTab === 'edges' ? renderEdgeTab() : renderMappingTab()}</div></section></div>
      </main>
      {toast ? <div className="fixed bottom-7 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-[8px] bg-[#263449] px-4 py-3 text-[12px] text-white shadow-[0_12px_30px_rgba(22,34,54,.22)]"><Check className="h-4 w-4 text-[#65d49b]" />{toast}</div> : null}
      {importKind ? <ImportDialog kind={importKind} onClose={() => setImportKind(null)} onConfirm={handleImportConfirm} /> : null}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Table2; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`relative inline-flex items-center gap-2 px-4 pb-3 text-[13px] transition ${active ? 'font-medium text-[#278fee]' : 'text-[#7c8797] hover:text-[#278fee]'}`}>{<Icon className="h-4 w-4" />}{children}{active ? <span className="absolute bottom-[-1px] left-3 right-3 h-0.5 rounded-full bg-[#278fee]" /> : null}</button>;
}

function Pagination({ total }: { total: number }) {
  return <div className="flex items-center justify-between py-4 text-[11px] text-[#98a2b0]"><span>共 {total} 条</span><div className="flex items-center gap-2"><button type="button" disabled className="h-7 rounded border border-[#e1e5eb] px-2.5 disabled:text-[#c2c8d1]">上一页</button><span className="flex h-7 min-w-7 items-center justify-center rounded bg-[#278fee] px-2 text-white">1</span><button type="button" className="h-7 rounded border border-[#e1e5eb] px-2.5 text-[#687386]">下一页</button><select className="h-7 rounded border border-[#e1e5eb] bg-white px-2 text-[11px] text-[#687386]"><option>20条/页</option><option>50条/页</option></select></div></div>;
}

