import { useState, type ReactNode } from 'react';
import {
  ChevronDown,
  CircleDollarSign,
  Download,
  Droplets,
  Grid2X2,
  Info,
  LayoutTemplate,
  Palette,
  PenLine,
  Search,
  Settings2,
  Smartphone,
  UserRound,
  Users,
} from 'lucide-react';

export type TemplateEditorSection = 'basic' | 'detail' | 'paid';

type OpenPlatformTemplateEditorPageProps = {
  onNotify: (message: string) => void;
};

const basicMetrics = [
  { label: '累计账号', value: '142', icon: Users },
  { label: '累计创建设计', value: '1371', icon: PenLine },
  { label: '累计下载设计', value: '209', icon: Download },
  { label: '累计调用次数', value: '13', icon: LayoutTemplate },
  { label: '累计付费账号', value: '0', icon: CircleDollarSign },
];

const yesterdayMetrics = [
  { label: '新增账号', value: '0', icon: Users },
  { label: '创建设计', value: '0', icon: PenLine },
  { label: '下载设计', value: '0', icon: Download },
  { label: '调用次数', value: '0', icon: LayoutTemplate },
  { label: '新增付费账号', value: '0', icon: CircleDollarSign },
];

const usageRows = [
  ['手机海报', '541', '39.46%'],
  ['动态横版海报', '187', '13.64%'],
  ['商品主图', '124', '9.04%'],
  ['长图海报', '46', '3.36%'],
  ['美图画照', '35', '2.55%'],
  ['公众号次图', '32', '2.33%'],
  ['每日一签', '29', '2.12%'],
  ['A4贴纸', '27', '1.97%'],
  ['小红书配图', '26', '1.90%'],
  ['方形海报', '23', '1.68%'],
];

const pieLegend = [
  ['手机海报', '#5d8ff4'],
  ['动态横版海报', '#c9d8fb'],
  ['商品主图', '#62d2aa'],
  ['长图海报', '#cdeee2'],
  ['美图画照', '#66799a'],
  ['公众号次图', '#d8dce5'],
  ['每日一签', '#f4b31c'],
  ['A4贴纸', '#ffe8b8'],
  ['小红书配图', '#7469e8'],
  ['方形海报', '#d4cef8'],
  ['自定义px', '#79c4e9'],
  ['横版海报', '#b9e4f4'],
  ['全屏海报', '#8c5bb1'],
  ['方形二维码', '#cbb6d9'],
  ['16:9超信卡片', '#f58b51'],
  ['其他', '#ffdec5'],
] as const;

const detailRows = ['2026-11-02', '2026-11-01', '2026-10-31', '2026-10-30', '2026-10-29', '2026-10-28', '2026-10-27'];

const navGroups = [
  { label: '配置管理', icon: Settings2, kind: 'single' as const },
  { label: '主题设置', icon: Palette, kind: 'single' as const },
  { label: '水印设置', icon: Droplets, kind: 'single' as const },
  { label: '轻应用', icon: Smartphone, kind: 'single' as const },
  { label: '其他设置', icon: Grid2X2, kind: 'single' as const },
];

export function OpenPlatformTemplateEditorPage({ onNotify }: OpenPlatformTemplateEditorPageProps) {
  return (
    <div className="open-platform-template-workspace">
      <aside className="open-platform-template-sidebar">
        <div className="open-platform-template-sidebar-menu">
          {navGroups.map((item) => {
            const Icon = item.icon;
            return <button type="button" key={item.label} className="open-platform-template-sidebar-heading" onClick={() => onNotify(`${item.label}即将打开`)}><Icon size={16} /><span>{item.label}</span><ChevronDown size={14} /></button>;
          })}
        </div>
        <button type="button" className="open-platform-template-sidebar-collapse" aria-label="收起模板编辑器侧边栏" onClick={() => onNotify('侧边栏已收起')}>‹</button>
      </aside>

      <div className="open-platform-template-content">
        <h1>模板编辑器</h1>
        <section className="open-platform-template-white-panel open-platform-template-editor-placeholder">
          <TemplatePanelTitle>配置管理</TemplatePanelTitle>
          <div className="open-platform-template-placeholder-body"><Settings2 size={30} /><strong>模板编辑器配置</strong><span>请从左侧选择需要配置的功能</span></div>
        </section>
      </div>
    </div>
  );
}

export function OpenPlatformTemplateEditorContent({ section, onSectionChange, onNotify, title = '数据统计' }: { section: TemplateEditorSection; onSectionChange: (section: TemplateEditorSection) => void; onNotify: (message: string) => void; title?: string }) {
  return <div className="open-platform-template-content"><h1>{title}</h1>{section === 'basic' ? <TemplateBasicData onNotify={onNotify} /> : <TemplateDetailData section={section} onSectionChange={onSectionChange} onNotify={onNotify} />}</div>;
}

function TemplatePanelTitle({ children, extra }: { children: string; extra?: ReactNode }) {
  return <div className="open-platform-template-panel-title"><h2><span />{children}</h2>{extra}</div>;
}

function MetricTile({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return <div className="open-platform-template-metric-tile"><span>{label}</span><Icon size={22} /><strong>{value}</strong></div>;
}

function TemplateBasicData({ onNotify }: { onNotify: (message: string) => void }) {
  const [period, setPeriod] = useState<'近7天' | '近30天'>('近7天');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const chartDates = period === '近7天' ? detailRows.slice().reverse() : ['2026-10-04', '2026-10-08', '2026-10-12', '2026-10-16', '2026-10-20', '2026-10-24', '2026-10-28', '2026-11-02'];

  return <div className="open-platform-template-basic-page">
    <div className="open-platform-template-summary-grid">
      <section className="open-platform-template-white-panel"><TemplatePanelTitle>基本数据</TemplatePanelTitle><div className="open-platform-template-metric-grid">{basicMetrics.map((metric) => <MetricTile key={metric.label} {...metric} />)}</div></section>
      <section className="open-platform-template-white-panel"><TemplatePanelTitle extra={<span className="open-platform-template-cutoff"><Info size={14} />截止至2026/11/02</span>}>昨日数据</TemplatePanelTitle><div className="open-platform-template-metric-grid">{yesterdayMetrics.map((metric) => <MetricTile key={metric.label} {...metric} />)}</div></section>
    </div>

    <section className="open-platform-template-white-panel open-platform-template-trend-panel">
      <TemplatePanelTitle extra={<div className="open-platform-template-trend-controls"><div className="open-platform-template-segmented"><button type="button" className={period === '近7天' ? 'is-active' : ''} onClick={() => setPeriod('近7天')}>近7天</button><button type="button" className={period === '近30天' ? 'is-active' : ''} onClick={() => setPeriod('近30天')}>近30天</button></div><select aria-label="趋势指标"><option>活跃用户数</option><option>新增账号数</option><option>创建设计量</option></select><select aria-label="趋势日期范围"><option>2026-10-27　→　2026-11-02</option><option>2026-10-04　→　2026-11-02</option></select></div>}>趋势图</TemplatePanelTitle>
      <div className="open-platform-template-chart-wrap">
        <div className="open-platform-template-chart-yaxis"><span>0</span></div>
        <div className="open-platform-template-chart-stage">
          <div className="open-platform-template-chart-gridline" />
          {hoveredDate ? <div className="open-platform-template-chart-tooltip"><strong>{hoveredDate}</strong><span><i />活跃用户数：<b>0</b></span></div> : null}
          <svg className="open-platform-template-line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="活跃用户数趋势"><line x1="0" y1="92" x2="100" y2="92" /><polyline points={chartDates.map((_, index) => `${(index / Math.max(chartDates.length - 1, 1)) * 100},92`).join(' ')} /></svg>
          <div className="open-platform-template-chart-dots">{chartDates.map((date, index) => <button type="button" key={date} aria-label={`查看${date}数据`} style={{ left: `${(index / Math.max(chartDates.length - 1, 1)) * 100}%` }} onMouseEnter={() => setHoveredDate(date)} onMouseLeave={() => setHoveredDate(null)} onFocus={() => setHoveredDate(date)} onBlur={() => setHoveredDate(null)} />)}</div>
          <div className="open-platform-template-chart-labels">{chartDates.map((date) => <span key={date}>{date}</span>)}</div>
        </div>
      </div>
    </section>

    <section className="open-platform-template-white-panel open-platform-template-distribution-panel"><TemplatePanelTitle extra={<span className="open-platform-template-ranking-hint"><Info size={14} />设计场景分布排名</span>}>使用场景分布</TemplatePanelTitle><div className="open-platform-template-distribution-content"><div className="open-platform-template-usage-table"><div className="open-platform-template-usage-row is-header"><span>排名</span><span>场景名称</span><span>设计数量</span><span>占比</span></div>{usageRows.map(([name, count, percent], index) => <div className="open-platform-template-usage-row" key={name}><span>{index + 1}</span><span>{name}</span><span>{count}</span><span>{percent}</span></div>)}</div><div className="open-platform-template-pie-area"><div className="open-platform-template-pie-chart"><span>手机海报: 39.46%</span><span>动态横版海报: 13.64%</span><span>商品主图: 9.04%</span><span>其他: 15.32%</span></div><div className="open-platform-template-pie-legend">{pieLegend.map(([label, color]) => <span key={label}><i style={{ background: color }} />{label}</span>)}</div></div></div></section>
    <button type="button" className="open-platform-template-hidden-action" onClick={() => onNotify('数据统计已刷新')}>刷新</button>
  </div>;
}

function TemplateDetailData({ section, onSectionChange, onNotify }: { section: TemplateEditorSection; onSectionChange: (section: TemplateEditorSection) => void; onNotify: (message: string) => void }) {
  const paid = section === 'paid';
  return <section className="open-platform-template-white-panel open-platform-template-detail-panel"><TemplatePanelTitle>详细数据</TemplatePanelTitle><div className="open-platform-template-detail-tabs"><button type="button" className={!paid ? 'is-active' : ''} onClick={() => onSectionChange('detail')}>详细数据</button><button type="button" className={paid ? 'is-active' : ''} onClick={() => onSectionChange('paid')}>付费账号明细</button></div><div className="open-platform-template-detail-toolbar">{paid ? <input aria-label="用户标识" placeholder="请输入用户标识" /> : null}<select aria-label="详细数据日期范围"><option>2026-10-27　→　2026-11-02</option></select><button type="button" className="open-platform-template-search-button" onClick={() => onNotify('查询已完成')}><Search size={14} />搜索</button><button type="button" className="open-platform-template-export-button" onClick={() => onNotify('数据已准备导出')}><Download size={14} />导出</button></div>{paid ? <PaidAccountTable /> : <DetailTable />}</section>;
}

function DetailTable() {
  return <div className="open-platform-template-data-table"><div className="open-platform-template-data-row is-header"><span>日期</span><span>活跃账号数</span><span>新增账号数</span><span>新增付费账号</span><span>创建设计量</span><span>下载设计量</span><span>创建设计账号数</span><span>下载账号数</span><span>调用次数</span></div>{detailRows.map((date) => <div className="open-platform-template-data-row" key={date}><span>{date}</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span></div>)}</div>;
}

function PaidAccountTable() {
  return <div className="open-platform-template-data-table open-platform-template-paid-table"><div className="open-platform-template-data-row is-header"><span>用户标识</span><span>创建日期</span><span>付费日期</span><span>套餐名称</span><span>套餐金额(元)</span><span>套餐时长(天)</span><span>套餐到期日期</span></div><div className="open-platform-template-empty"><UserRound size={36} /><span>暂无数据</span></div></div>;
}
