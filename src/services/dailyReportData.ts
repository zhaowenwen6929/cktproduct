export interface DailyReportRawRow {
  date: string;
  actualPaidCount: number;
  actualPaymentAmountFen: number;
  backendPaidCount: number;
  backendPaymentAmountFen: number;
  canvasPaidCount: number;
  canvasPaymentAmountFen: number;
  ecommercePaidCount: number;
  ecommercePaymentAmountFen: number;
  mainDesignDownloadCount: number;
  canvasDownloadCount: number;
  ecommerceDownloadCount: number;
}

export interface DailyReportMetricBreakdown {
  label: string;
  valueText: string;
}

export interface DailyReportMetric {
  label: string;
  valueText: string;
  yesterdayChange: string;
  yesterdayReason: string;
  lastWeekChange: string;
  lastWeekReason: string;
  sourceField: string;
  breakdown?: DailyReportMetricBreakdown[];
}

export interface DailyReportSection {
  title: string;
  metrics: DailyReportMetric[];
}

export interface DailyReport {
  title: string;
  dateLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  sections: DailyReportSection[];
  text: string;
}

export const GROWING_IO_DAILY_REPORT_URL =
  'https://www.growingio.com/projects/QRe7ENoq/product-analytics/eventAnalysis/woVqG5YP';

export const DAILY_REPORT_SOURCE_START_DATE_KEY = '2026-01-01';

export const DAILY_REPORT_FIELD_MAPPING = [
  { label: '实际支付总人数', sourceField: 'I 订单支付(Z)_次' },
  { label: '实际支付总金额', sourceField: 'J 订单支付(Z)_订单实际支付金额_求和' },
  { label: '后台支付人数', sourceField: 'K 订单支付(Z)_次' },
  { label: '后台支付金额', sourceField: 'L 订单支付(Z)_订单实际支付金额_求和' },
  { label: '无限画布支付人数', sourceField: 'M 订单支付(Z)_次' },
  { label: '无限画布支付金额', sourceField: 'N 订单支付(Z)_订单实际支付金额_求和' },
  { label: 'AI电商支付人数', sourceField: 'O 订单支付(Z)_次' },
  { label: 'AI电商支付金额', sourceField: 'P 订单支付(Z)_订单实际支付金额_求和' },
  { label: '自平台主设计页', sourceField: 'H 下载完成_次' },
  { label: '自平台无线画布', sourceField: 'B 下载完成_次' },
  { label: '自平台AI电商', sourceField: 'Q 下载弹窗内下载按钮_次' },
];

const DAILY_REPORT_ROWS: DailyReportRawRow[] = [
  {
    date: '2026-08-10',
    actualPaidCount: 709,
    actualPaymentAmountFen: 6537480,
    backendPaidCount: 21,
    backendPaymentAmountFen: 953500,
    canvasPaidCount: 15,
    canvasPaymentAmountFen: 89620,
    ecommercePaidCount: 3,
    ecommercePaymentAmountFen: 31800,
    mainDesignDownloadCount: 84014,
    canvasDownloadCount: 863,
    ecommerceDownloadCount: 271,
  },
  {
    date: '2026-08-09',
    actualPaidCount: 450,
    actualPaymentAmountFen: 2534636,
    backendPaidCount: 11,
    backendPaymentAmountFen: 0,
    canvasPaidCount: 4,
    canvasPaymentAmountFen: 28000,
    ecommercePaidCount: 3,
    ecommercePaymentAmountFen: 51800,
    mainDesignDownloadCount: 34801,
    canvasDownloadCount: 392,
    ecommerceDownloadCount: 144,
  },
  {
    date: '2026-08-08',
    actualPaidCount: 513,
    actualPaymentAmountFen: 3081902,
    backendPaidCount: 13,
    backendPaymentAmountFen: 0,
    canvasPaidCount: 9,
    canvasPaymentAmountFen: 103710,
    ecommercePaidCount: 4,
    ecommercePaymentAmountFen: 34700,
    mainDesignDownloadCount: 42887,
    canvasDownloadCount: 406,
    ecommerceDownloadCount: 204,
  },
  {
    date: '2026-08-07',
    actualPaidCount: 789,
    actualPaymentAmountFen: 6099188,
    backendPaidCount: 25,
    backendPaymentAmountFen: 578000,
    canvasPaidCount: 14,
    canvasPaymentAmountFen: 122510,
    ecommercePaidCount: 4,
    ecommercePaymentAmountFen: 31910,
    mainDesignDownloadCount: 95395,
    canvasDownloadCount: 913,
    ecommerceDownloadCount: 299,
  },
  {
    date: '2026-08-06',
    actualPaidCount: 725,
    actualPaymentAmountFen: 6134469,
    backendPaidCount: 21,
    backendPaymentAmountFen: 5900,
    canvasPaidCount: 15,
    canvasPaymentAmountFen: 175100,
    ecommercePaidCount: 4,
    ecommercePaymentAmountFen: 23700,
    mainDesignDownloadCount: 94668,
    canvasDownloadCount: 1004,
    ecommerceDownloadCount: 292,
  },
  {
    date: '2026-08-05',
    actualPaidCount: 743,
    actualPaymentAmountFen: 6263592,
    backendPaidCount: 20,
    backendPaymentAmountFen: 573500,
    canvasPaidCount: 16,
    canvasPaymentAmountFen: 142620,
    ecommercePaidCount: 6,
    ecommercePaymentAmountFen: 74910,
    mainDesignDownloadCount: 89082,
    canvasDownloadCount: 826,
    ecommerceDownloadCount: 268,
  },
  {
    date: '2026-08-04',
    actualPaidCount: 717,
    actualPaymentAmountFen: 5573705,
    backendPaidCount: 22,
    backendPaymentAmountFen: 109800,
    canvasPaidCount: 17,
    canvasPaymentAmountFen: 205310,
    ecommercePaidCount: 1,
    ecommercePaymentAmountFen: 10000,
    mainDesignDownloadCount: 89959,
    canvasDownloadCount: 963,
    ecommerceDownloadCount: 397,
  },
  {
    date: '2026-08-03',
    actualPaidCount: 774,
    actualPaymentAmountFen: 5712853,
    backendPaidCount: 101,
    backendPaymentAmountFen: 209700,
    canvasPaidCount: 13,
    canvasPaymentAmountFen: 117300,
    ecommercePaidCount: 4,
    ecommercePaymentAmountFen: 37700,
    mainDesignDownloadCount: 86264,
    canvasDownloadCount: 828,
    ecommerceDownloadCount: 227,
  },
  {
    date: '2026-08-02',
    actualPaidCount: 547,
    actualPaymentAmountFen: 2602068,
    backendPaidCount: 87,
    backendPaymentAmountFen: 0,
    canvasPaidCount: 6,
    canvasPaymentAmountFen: 51900,
    ecommercePaidCount: 1,
    ecommercePaymentAmountFen: 6000,
    mainDesignDownloadCount: 34720,
    canvasDownloadCount: 315,
    ecommerceDownloadCount: 188,
  },
  {
    date: '2026-08-01',
    actualPaidCount: 758,
    actualPaymentAmountFen: 3765682,
    backendPaidCount: 159,
    backendPaymentAmountFen: 0,
    canvasPaidCount: 12,
    canvasPaymentAmountFen: 86800,
    ecommercePaidCount: 1,
    ecommercePaymentAmountFen: 5900,
    mainDesignDownloadCount: 50286,
    canvasDownloadCount: 527,
    ecommerceDownloadCount: 80,
  },
];

const shiftDateKey = (date: Date, days: number) => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return formatDateKey(next);
};

export const parseDateKey = (dateKey: string) => {
  const [year, month, date] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, date);
};

export const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const getDailyReportSnapshotRows = () => [...DAILY_REPORT_ROWS];

export const getLatestDailyReportDate = (rows = DAILY_REPORT_ROWS) =>
  parseDateKey(
    rows.map((row) => row.date).sort((a, b) => b.localeCompare(a))[0]
  );

const formatNumber = (value: number) =>
  value.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
  });

const formatPercent = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return `${formatNumber(rounded)}%`;
};

const formatDelta = (value: number, unit: '次' | '元') => {
  const absValue = Math.abs(value);
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatNumber(absValue)}${unit}`;
};

const getChangeText = (current: number, compare?: number) => {
  if (compare == null) return '--';
  if (compare === 0) return current === 0 ? '0%' : '--';
  return formatPercent(((current - compare) / compare) * 100);
};

const getTopChangeBreakdown = (
  items: Array<{ label: string; current: number; compare: number | undefined; unit: '次' | '元' }>
) => {
  const candidates = items
    .filter((item) => item.compare != null)
    .map((item) => ({
      ...item,
      delta: item.current - (item.compare as number),
    }))
    .filter((item) => item.delta !== 0);

  if (!candidates.length) return null;

  return candidates.sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))[0];
};

const getComparisonReason = (
  label: string,
  current: DailyReportRawRow,
  compare: DailyReportRawRow | undefined,
  compareType: 'yesterday' | 'lastWeek'
) => {
  if (!compare) return '对比日暂无数据';

  const compareLabel = compareType === 'yesterday' ? '昨日' : '上周同日';
  const weekendGap =
    compareType === 'lastWeek' ? current.date.slice(0, 10) !== compare.date.slice(0, 10) : false;

  if (label === '实际支付总人数') {
    const topChannel = getTopChangeBreakdown([
      { label: '后台', current: current.backendPaidCount, compare: compare.backendPaidCount, unit: '次' },
      { label: '无限画布', current: current.canvasPaidCount, compare: compare.canvasPaidCount, unit: '次' },
      { label: 'AI电商', current: current.ecommercePaidCount, compare: compare.ecommercePaidCount, unit: '次' },
    ]);
    if (!topChannel) return `与${compareLabel}基本持平`;
    return `${topChannel.label}付费人数${topChannel.delta > 0 ? '增加' : '减少'}${formatDelta(topChannel.delta, '次')}，带动整体变化`;
  }

  if (label === '实际支付总金额') {
    const topChannel = getTopChangeBreakdown([
      { label: '后台', current: current.backendPaymentAmountFen / 100, compare: compare.backendPaymentAmountFen / 100, unit: '元' },
      { label: '无限画布', current: current.canvasPaymentAmountFen / 100, compare: compare.canvasPaymentAmountFen / 100, unit: '元' },
      { label: 'AI电商', current: current.ecommercePaymentAmountFen / 100, compare: compare.ecommercePaymentAmountFen / 100, unit: '元' },
    ]);
    if (!topChannel) return `与${compareLabel}金额基本持平`;
    return `${topChannel.label}支付金额${topChannel.delta > 0 ? '增加' : '减少'}${formatDelta(topChannel.delta, '元')}，是主要影响项`;
  }

  if (label === '自平台主设计页') {
    const delta = current.mainDesignDownloadCount - compare.mainDesignDownloadCount;
    if (delta === 0) return `与${compareLabel}下载量基本持平`;
    if (compareType === 'yesterday') {
      return delta > 0 ? `工作日流量回升，主设计页下载增加${formatDelta(delta, '次')}` : `流量走弱，主设计页下载减少${formatDelta(delta, '次')}`;
    }
    return delta > 0
      ? `较上周同日多出${formatDelta(delta, '次')}，说明主设计页需求更强`
      : `较上周同日少了${formatDelta(delta, '次')}，主设计页需求偏弱`;
  }

  if (label === '自平台无线画布') {
    const delta = current.canvasDownloadCount - compare.canvasDownloadCount;
    if (delta === 0) return `与${compareLabel}下载量基本持平`;
    return delta > 0
      ? `无线画布下载增加${formatDelta(delta, '次')}，创作活跃度更高`
      : `无线画布下载减少${formatDelta(delta, '次')}，创作活跃度回落`;
  }

  if (label === '自平台AI电商') {
    const delta = current.ecommerceDownloadCount - compare.ecommerceDownloadCount;
    if (delta === 0) return `与${compareLabel}下载量基本持平`;
    return delta > 0
      ? `AI电商下载增加${formatDelta(delta, '次')}，商家出图需求提升`
      : `AI电商下载减少${formatDelta(delta, '次')}，商家出图需求回落`;
  }

  return weekendGap ? `较${compareLabel}存在自然流量波动` : `与${compareLabel}相比出现正常波动`;
};

const buildMetric = (
  label: string,
  current: number,
  previous: number | undefined,
  lastWeek: number | undefined,
  currentRow: DailyReportRawRow,
  previousRow: DailyReportRawRow | undefined,
  lastWeekRow: DailyReportRawRow | undefined,
  sourceField: string,
  unit: '次' | '元',
  breakdown?: DailyReportMetricBreakdown[],
): DailyReportMetric => ({
  label,
  valueText: `${formatNumber(current)}${unit}`,
  yesterdayChange: getChangeText(current, previous),
  yesterdayReason: getComparisonReason(label, currentRow, previousRow, 'yesterday'),
  lastWeekChange: getChangeText(current, lastWeek),
  lastWeekReason: getComparisonReason(label, currentRow, lastWeekRow, 'lastWeek'),
  sourceField,
  breakdown,
});

const formatMetricLine = (metric: DailyReportMetric) =>
  `${metric.label}：${metric.valueText}${metric.breakdown ? `（其中${metric.breakdown.map((item) => `${item.label}${item.valueText}`).join('，')}）` : ''}，较昨日${metric.yesterdayChange}，较上周同日${metric.lastWeekChange}`;

export const buildDailyReport = (date: Date, rows = DAILY_REPORT_ROWS): DailyReport | null => {
  const rowByDate = new Map(rows.map((row) => [row.date, row]));
  const dateKey = formatDateKey(date);
  const current = rowByDate.get(dateKey);
  if (!current) return null;

  const previous = rowByDate.get(shiftDateKey(date, -1));
  const lastWeek = rowByDate.get(shiftDateKey(date, -7));
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const incomeMetrics = [
    buildMetric(
      '实际支付总人数',
      current.actualPaidCount,
      previous?.actualPaidCount,
      lastWeek?.actualPaidCount,
      current,
      previous,
      lastWeek,
      'I 订单支付(Z)_次',
      '次',
      [
        { label: '后台', valueText: `${formatNumber(current.backendPaidCount)}次` },
        { label: '无限画布', valueText: `${formatNumber(current.canvasPaidCount)}次` },
        { label: 'AI电商', valueText: `${formatNumber(current.ecommercePaidCount)}次` },
      ],
    ),
    buildMetric(
      '实际支付总金额',
      current.actualPaymentAmountFen / 100,
      previous ? previous.actualPaymentAmountFen / 100 : undefined,
      lastWeek ? lastWeek.actualPaymentAmountFen / 100 : undefined,
      current,
      previous,
      lastWeek,
      'J 订单支付(Z)_订单实际支付金额_求和',
      '元',
      [
        { label: '后台', valueText: `${formatNumber(current.backendPaymentAmountFen / 100)}元` },
        { label: '无限画布', valueText: `${formatNumber(current.canvasPaymentAmountFen / 100)}元` },
        { label: 'AI电商', valueText: `${formatNumber(current.ecommercePaymentAmountFen / 100)}元` },
      ],
    ),
  ];

  const exportMetrics = [
    buildMetric(
      '自平台主设计页',
      current.mainDesignDownloadCount,
      previous?.mainDesignDownloadCount,
      lastWeek?.mainDesignDownloadCount,
      current,
      previous,
      lastWeek,
      'H 下载完成_次',
      '次',
    ),
    buildMetric(
      '自平台无线画布',
      current.canvasDownloadCount,
      previous?.canvasDownloadCount,
      lastWeek?.canvasDownloadCount,
      current,
      previous,
      lastWeek,
      'B 下载完成_次',
      '次',
    ),
    buildMetric(
      '自平台AI电商',
      current.ecommerceDownloadCount,
      previous?.ecommerceDownloadCount,
      lastWeek?.ecommerceDownloadCount,
      current,
      previous,
      lastWeek,
      'Q 下载弹窗内下载按钮_次',
      '次',
    ),
  ];

  const sections: DailyReportSection[] = [
    {
      title: '①创客贴收入（gio统计）：',
      metrics: incomeMetrics,
    },
    {
      title: '②总导出图片设计量：',
      metrics: exportMetrics,
    },
  ];

  const title = `${month}月${day}日关键数据及产品事项：`;
  const text = [
    title,
    '',
    sections[0].title,
    ...sections[0].metrics.map(formatMetricLine),
    '',
    sections[1].title,
    ...sections[1].metrics.map(formatMetricLine),
  ].join('\n');

  return {
    title,
    dateLabel: `${month}月${day}日`,
    sourceLabel: 'GrowingIO：产品重要指标--天',
    sourceUrl: GROWING_IO_DAILY_REPORT_URL,
    sections,
    text,
  };
};
