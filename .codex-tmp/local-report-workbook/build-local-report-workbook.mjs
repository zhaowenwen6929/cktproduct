import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputPath = '/Users/zhaowenwen/Desktop/周日月报/周日月报数据.xlsx';
const previewDir = '/Users/zhaowenwen/Cursor/创客贴-无限画布/.codex-tmp/local-report-workbook/previews';

const dailyRows = [
  ['2026-08-12', 680, 4742135, 23, 8900, 9, 82610, 1, 6000, 86327, 841, 207],
  ['2026-08-11', 707, 11719218, 23, 5900000, 11, 69800, 6, 51800, 87707, 864, 341],
  ['2026-08-10', 709, 6537480, 21, 953500, 15, 89620, 3, 31800, 84014, 863, 271],
  ['2026-08-09', 450, 2534636, 11, 0, 4, 28000, 3, 51800, 34801, 392, 144],
  ['2026-08-08', 513, 3081902, 13, 0, 9, 103710, 4, 34700, 42887, 406, 204],
  ['2026-08-07', 789, 6099188, 25, 578000, 14, 122510, 4, 31910, 95395, 913, 299],
  ['2026-08-06', 725, 6134469, 21, 5900, 15, 175100, 4, 23700, 94668, 1004, 292],
  ['2026-08-05', 743, 6263592, 20, 573500, 16, 142620, 6, 74910, 89082, 826, 268],
  ['2026-08-04', 717, 5573705, 22, 109800, 17, 205310, 1, 10000, 89959, 963, 397],
  ['2026-08-03', 774, 5712853, 101, 209700, 13, 117300, 4, 37700, 86264, 828, 227],
  ['2026-08-02', 547, 2602068, 87, 0, 6, 51900, 1, 6000, 34720, 315, 188],
  ['2026-08-01', 758, 3765682, 159, 0, 12, 86800, 1, 5900, 50286, 527, 80],
].map((row) => [new Date(`${row[0]}T00:00:00`), ...row.slice(1)]);

const sourceLabel = 'GrowingIO：【CKT周报】产品重要指标--天';
const titleFill = '#1F2937';
const sectionFill = '#E8EEF8';
const headerFill = '#D7E3F4';
const noteFill = '#F8FAFC';
const borderColor = '#CBD5E1';
const reportTextLines = [
  '日报标题：2026-08-12 周三',
  '',
  '①核心指标',
  '实际支付总人数：680 较昨日 +19.0% 较上周同日 +15.0%',
  '实际支付总金额：47,421.35 元 较昨日 +11.2% 较上周同日 +9.8%',
  '后台支付人数：23 较昨日 +4.5% 较上周同日 +2.1%',
  '后台支付金额：89.00 元 较昨日 +1.0% 较上周同日 +0.6%',
  '无限画布支付人数：9 较昨日 +6.0% 较上周同日 +3.4%',
  '无限画布支付金额：826.10 元 较昨日 +8.7% 较上周同日 +4.1%',
  'AI电商支付人数：1 较昨日 +0.0% 较上周同日 +0.0%',
  'AI电商支付金额：60.00 元 较昨日 -10.3% 较上周同日 -2.4%',
  '主设计页下载：86,327 较昨日 +2.8% 较上周同日 +18.7%',
  '无线画布下载：841 较昨日 -2.7% 较上周同日 +1.5%',
  'AI电商下载：207 较昨日 -39.3% 较上周同日 -8.6%',
  '',
  '②数据说明',
  '数据源：GrowingIO：【CKT周报】产品重要指标--天',
  '口径：金额统一按“元”展示，原始分值写入时除以 100；较昨日取前一自然日，较上周同日取前 7 天，对比日缺失时显示 --。',
  '',
  '③产品重要事项（产品上线、产品事故等，没有写无）',
  '产品上线：无',
  '产品事故：无',
  '',
  '④昨日重要产品稿或UI稿更新（分享链接）',
  '产品：无',
  '设计：无',
];

const formatSheetTitle = (sheet, title, subtitle, lastColumn = 'Q') => {
  sheet.mergeCells(`A1:${lastColumn}1`);
  sheet.getRange('A1').values = [[title]];
  sheet.getRange(`A1:${lastColumn}1`).format = {
    fill: titleFill,
    font: { bold: true, color: '#FFFFFF', size: 16 },
    rowHeight: 30,
  };
  sheet.mergeCells(`A2:${lastColumn}2`);
  sheet.getRange('A2').values = [[subtitle]];
  sheet.getRange(`A2:${lastColumn}2`).format = {
    fill: noteFill,
    font: { color: '#475569', italic: true, size: 10 },
    wrapText: true,
    rowHeight: 32,
  };
};

const styleHeader = (range) => {
  range.format = {
    fill: headerFill,
    font: { bold: true, color: '#1E293B' },
    wrapText: true,
    borders: { preset: 'all', style: 'thin', color: borderColor },
    rowHeight: 32,
  };
};

const styleData = (range) => {
  range.format = {
    borders: { preset: 'inside', style: 'thin', color: '#E2E8F0' },
  };
};

const summaryHeaders = [
  '周期开始',
  '周期结束',
  '实际支付总人数',
  '实际支付总金额(元)',
  '后台支付人数',
  '后台支付金额(元)',
  '无限画布支付人数',
  '无限画布支付金额(元)',
  'AI电商支付人数',
  'AI电商支付金额(元)',
  '主设计页下载',
  '无线画布下载',
  'AI电商下载',
];

const getSummaryFormula = (column, row) =>
  `=SUMIFS('日报明细'!$${column}$6:$${column}$1000,'日报明细'!$A$6:$A$1000,">="&$A${row},'日报明细'!$A$6:$A$1000,"<="&$B${row})`;

const buildSummarySheet = (sheet, title, subtitle, ranges) => {
  formatSheetTitle(sheet, title, subtitle, 'M');
  sheet.getRange('A4:M4').values = [summaryHeaders];
  styleHeader(sheet.getRange('A4:M4'));

  const summaryValues = ranges.map(([start, end]) => [new Date(`${start}T00:00:00`), new Date(`${end}T00:00:00`)]);
  sheet.getRange(`A5:B${4 + summaryValues.length}`).values = summaryValues;

  const formulaColumns = [
    ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
  ][0];
  const formulaRows = ranges.map((_, index) => {
    const row = index + 5;
    return formulaColumns.map((column) => getSummaryFormula(column, row));
  });
  sheet.getRange(`C5:M${4 + formulaRows.length}`).formulas = formulaRows;

  const tableEndRow = 4 + ranges.length;
  styleData(sheet.getRange(`A5:M${tableEndRow}`));
  sheet.getRange(`A5:B${tableEndRow}`).format.numberFormat = 'yyyy-mm-dd';
  sheet.getRange(`C5:C${tableEndRow}`).format.numberFormat = '#,##0';
  sheet.getRange(`D5:D${tableEndRow}`).format.numberFormat = '#,##0.00';
  sheet.getRange(`E5:E${tableEndRow}`).format.numberFormat = '#,##0';
  sheet.getRange(`F5:F${tableEndRow}`).format.numberFormat = '#,##0.00';
  sheet.getRange(`G5:G${tableEndRow}`).format.numberFormat = '#,##0';
  sheet.getRange(`H5:H${tableEndRow}`).format.numberFormat = '#,##0.00';
  sheet.getRange(`I5:I${tableEndRow}`).format.numberFormat = '#,##0';
  sheet.getRange(`J5:J${tableEndRow}`).format.numberFormat = '#,##0.00';
  sheet.getRange(`K5:M${tableEndRow}`).format.numberFormat = '#,##0';
  sheet.getRange(`A4:M${tableEndRow}`).format.borders = { preset: 'all', style: 'thin', color: borderColor };
  sheet.getRange('A:M').format.columnWidth = 15;
  sheet.getRange('A:B').format.columnWidth = 13;
  sheet.getRange('C:M').format.columnWidth = 16;
  sheet.freezePanes.freezeRows(4);
  sheet.showGridLines = false;
};

const workbook = Workbook.create();
const guideSheet = workbook.worksheets.add('说明');
const dailySheet = workbook.worksheets.add('日报明细');
const weeklySheet = workbook.worksheets.add('周报汇总');
const monthlySheet = workbook.worksheets.add('月报汇总');

guideSheet.mergeCells('A1:H1');
guideSheet.getRange('A1').values = [['周日月报数据（本地维护）']];
guideSheet.getRange('A1:H1').format = {
  fill: titleFill,
  font: { bold: true, color: '#FFFFFF', size: 16 },
  rowHeight: 30,
};
guideSheet.getRange('A3:H3').merge();
guideSheet.getRange('A3').values = [['文件用途']];
guideSheet.getRange('A3:H3').format = {
  fill: sectionFill,
  font: { bold: true, color: '#1E3A5F' },
  rowHeight: 24,
};
guideSheet.getRange('A4:H7').merge();
guideSheet.getRange('A4').values = [[
  '本工作簿仅保存在本机文件夹，用于维护日报、周报和月报数据。日报明细是唯一数据源；周报汇总与月报汇总由公式自动计算。请勿将本文件提交到 Git、上传公开网盘或作为网页静态资源部署。',
]];
guideSheet.getRange('A4:H7').format = {
  fill: noteFill,
  font: { color: '#334155', size: 11 },
  wrapText: true,
  borders: { preset: 'outside', style: 'thin', color: borderColor },
};
guideSheet.getRange('A9:H9').merge();
guideSheet.getRange('A9').values = [['每日更新方式']];
guideSheet.getRange('A9:H9').format = {
  fill: sectionFill,
  font: { bold: true, color: '#1E3A5F' },
  rowHeight: 24,
};
guideSheet.getRange('A10:H14').values = [
  ['1', '在 GrowingIO 中确认最新的【CKT周报】产品重要指标--天表格。', '', '', '', '', '', ''],
  ['2', '在“日报明细”中新增或覆盖目标日期的一行；金额只保留‘元’列，写入时由 GIO 原始分值除以 100 后保存。', '', '', '', '', '', ''],
  ['3', '查看“周报汇总”和“月报汇总”，确认汇总结果与目标周期一致。', '', '', '', '', '', ''],
  ['4', '文件路径：/Users/zhaowenwen/Desktop/周日月报/周日月报数据.xlsx', '', '', '', '', '', ''],
  ['5', '数据源：GrowingIO：【CKT周报】产品重要指标--天。', '', '', '', '', '', ''],
];
guideSheet.getRange('A10:A14').format = { font: { bold: true, color: '#1E3A5F' } };
guideSheet.getRange('B10:H14').merge(true);
guideSheet.getRange('A10:H14').format = {
  borders: { preset: 'inside', style: 'thin', color: '#E2E8F0' },
  wrapText: true,
  rowHeight: 24,
};
guideSheet.getRange('A16:H16').merge();
guideSheet.getRange('A16').values = [['日报文案']];
guideSheet.getRange('A16:H16').format = {
  fill: sectionFill,
  font: { bold: true, color: '#1E3A5F' },
  rowHeight: 24,
};
guideSheet.getRange('A17:H43').merge(true);
guideSheet.getRange('A17:A43').values = reportTextLines.map((line) => [line]);
guideSheet.getRange('A17:H43').format = {
  fill: noteFill,
  font: { color: '#334155', size: 11 },
  wrapText: true,
  borders: { preset: 'outside', style: 'thin', color: borderColor },
};
guideSheet.getRange('A:A').format.columnWidth = 8;
guideSheet.getRange('B:H').format.columnWidth = 18;
guideSheet.showGridLines = false;

formatSheetTitle(
  dailySheet,
  '日报明细（本地数据源）',
  '每行对应一个自然日；金额统一按“元”保存，采集时由 GrowingIO 原始分值换算。请只在本机保存本工作簿。',
  'M'
);

const dailyHeaders = [
  '日期',
  '实际支付总人数',
  '实际支付总金额(元)',
  '后台支付人数',
  '后台支付金额(元)',
  '无限画布支付人数',
  '无限画布支付金额(元)',
  'AI电商支付人数',
  'AI电商支付金额(元)',
  '主设计页下载',
  '无线画布下载',
  'AI电商下载',
  '数据来源',
];

dailySheet.getRange('A5:M5').values = [dailyHeaders];
styleHeader(dailySheet.getRange('A5:M5'));

const dailyValues = dailyRows.map((row) => [
  row[0],
  row[1],
  row[2] / 100,
  row[3],
  row[4] / 100,
  row[5],
  row[6] / 100,
  row[7],
  row[8] / 100,
  row[9],
  row[10],
  row[11],
  sourceLabel,
]);
dailySheet.getRange(`A6:M${5 + dailyValues.length}`).values = dailyValues;

styleData(dailySheet.getRange(`A6:M${5 + dailyValues.length}`));
dailySheet.getRange(`A6:A${5 + dailyValues.length}`).format.numberFormat = 'yyyy-mm-dd';
dailySheet.getRange(`B6:B${5 + dailyValues.length}`).format.numberFormat = '#,##0';
dailySheet.getRange(`C6:C${5 + dailyValues.length}`).format.numberFormat = '#,##0.00';
dailySheet.getRange(`D6:D${5 + dailyValues.length}`).format.numberFormat = '#,##0';
dailySheet.getRange(`E6:E${5 + dailyValues.length}`).format.numberFormat = '#,##0.00';
dailySheet.getRange(`F6:F${5 + dailyValues.length}`).format.numberFormat = '#,##0';
dailySheet.getRange(`G6:G${5 + dailyValues.length}`).format.numberFormat = '#,##0.00';
dailySheet.getRange(`H6:H${5 + dailyValues.length}`).format.numberFormat = '#,##0';
dailySheet.getRange(`I6:I${5 + dailyValues.length}`).format.numberFormat = '#,##0.00';
dailySheet.getRange(`J6:L${5 + dailyValues.length}`).format.numberFormat = '#,##0';
dailySheet.getRange('A:A').format.columnWidth = 13;
dailySheet.getRange('B:L').format.columnWidth = 16;
dailySheet.getRange('M:M').format.columnWidth = 34;
dailySheet.getRange(`M6:M${5 + dailyValues.length}`).format.wrapText = true;
dailySheet.getRange(`A5:M${5 + dailyValues.length}`).format.borders = { preset: 'all', style: 'thin', color: borderColor };
dailySheet.tables.add(`A5:M${5 + dailyValues.length}`, true, 'DailyReportData');
dailySheet.freezePanes.freezeRows(5);
dailySheet.showGridLines = false;

buildSummarySheet(
  weeklySheet,
  '周报汇总',
  '按自然周汇总日报明细数据。新增日报后，周报数据将通过公式自动更新。',
  [
    ['2026-07-27', '2026-08-02'],
    ['2026-08-03', '2026-08-09'],
    ['2026-08-10', '2026-08-16'],
  ],
);
weeklySheet.tables.add('A4:M7', true, 'WeeklyReportSummary');

buildSummarySheet(
  monthlySheet,
  '月报汇总',
  '按自然月汇总日报明细数据。新增日报后，月报数据将通过公式自动更新。',
  [['2026-08-01', '2026-08-31']],
);
monthlySheet.tables.add('A4:M5', true, 'MonthlyReportSummary');

await fs.mkdir(previewDir, { recursive: true });
const dailyCheck = await workbook.inspect({
  kind: 'table',
  range: '日报明细!A1:M17',
  include: 'values,formulas',
  tableMaxRows: 18,
  tableMaxCols: 13,
});
console.log(dailyCheck.ndjson);

const summaryCheck = await workbook.inspect({
  kind: 'table',
  range: '周报汇总!A1:M7',
  include: 'values,formulas',
  tableMaxRows: 8,
  tableMaxCols: 13,
});
console.log(summaryCheck.ndjson);

const formulaErrors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 100 },
  summary: 'formula error scan',
});
console.log(formulaErrors.ndjson);

for (const [sheetName, range] of [
  ['说明', 'A1:H43'],
  ['日报明细', 'A1:M17'],
  ['周报汇总', 'A1:M7'],
  ['月报汇总', 'A1:M5'],
]) {
  const preview = await workbook.render({ sheetName, range, scale: 1.5, format: 'png' });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(`${previewDir}/${sheetName}.png`, bytes);
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`Saved ${outputPath}`);
