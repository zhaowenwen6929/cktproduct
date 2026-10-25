import fs from 'node:fs/promises';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseNumber(text) {
  const normalized = String(text ?? '').replace(/,/g, '').trim();
  if (!normalized || normalized === '--') return 0;
  return Number(normalized);
}

function normalizeDate(text) {
  const match = String(text).match(/(\d{2})-(\d{2})/);
  if (!match) return null;
  return `2026-${match[1]}-${match[2]}`;
}

globalThis.__collectReportData = async function collectReportData() {
  const tab = globalThis.reportTab;
  if (!tab) throw new Error('reportTab not initialized');

  const extractRows = async () => {
    return await tab.playwright.evaluate(() => {
      const tables = Array.from(document.querySelectorAll('table'));
      const target = tables.find((table) => table.innerText.includes('Q 下载弹窗内下载按钮_次'));
      if (!target) return [];
      const rows = Array.from(target.querySelectorAll('tbody tr'));
      return rows.map((row) => Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.replace(/\s+/g, ' ').trim() ?? ''));
    });
  };

  const readCurrentPage = async () => {
    const rows = await extractRows();
    return rows
      .map((cells) => {
        if (cells.length < 18) return null;
        return {
          rawDate: cells[0],
          date: normalizeDate(cells[0]),
          actualPaidCount: parseNumber(cells[9]),
          actualPaymentAmountFen: parseNumber(cells[10]),
          backendPaidCount: parseNumber(cells[11]),
          backendPaymentAmountFen: parseNumber(cells[12]),
          canvasPaidCount: parseNumber(cells[13]),
          canvasPaymentAmountFen: parseNumber(cells[14]),
          ecommercePaidCount: parseNumber(cells[15]),
          ecommercePaymentAmountFen: parseNumber(cells[16]),
          mainDesignDownloadCount: parseNumber(cells[8]),
          canvasDownloadCount: parseNumber(cells[2]),
          ecommerceDownloadCount: parseNumber(cells[17]),
        };
      })
      .filter(Boolean);
  };

  const clickNextPage = async () => {
    const state = await tab.playwright.evaluate(() => {
      const pager = Array.from(document.querySelectorAll('li,button,span,div')).find((node) =>
        (node.textContent || '').replace(/\s+/g, ' ').trim() === '下一页'
      );
      if (!pager) return { found: false, disabled: true };
      const element = pager instanceof HTMLElement ? pager : pager.parentElement;
      if (!element) return { found: false, disabled: true };
      const className = element.className || '';
      const disabled =
        /disabled|forbid|ban|gray|is-disabled/.test(String(className)) ||
        element.getAttribute('aria-disabled') === 'true' ||
        element.disabled === true;
      return { found: true, disabled };
    });
    if (!state.found || state.disabled) return false;

    const before = await tab.playwright.evaluate(() => {
      const tables = Array.from(document.querySelectorAll('table'));
      const target = tables.find((table) => table.innerText.includes('Q 下载弹窗内下载按钮_次'));
      const firstCell = target?.querySelector('tbody tr td');
      return firstCell?.textContent?.trim() || '';
    });

    await tab.playwright.getByText('下一页', { exact: true }).first().click({ timeoutMs: 10000 });
    for (let i = 0; i < 20; i += 1) {
      await sleep(700);
      const after = await tab.playwright.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('table'));
        const target = tables.find((table) => table.innerText.includes('Q 下载弹窗内下载按钮_次'));
        const firstCell = target?.querySelector('tbody tr td');
        return firstCell?.textContent?.trim() || '';
      });
      if (after && after !== before) return true;
    }
    return true;
  };

  const collected = [];
  const seenDates = new Set();
  for (let page = 1; page <= 20; page += 1) {
    const rows = await readCurrentPage();
    for (const row of rows) {
      if (!row?.date || seenDates.has(row.date)) continue;
      seenDates.add(row.date);
      collected.push(row);
    }
    if (rows.some((row) => row?.date === '2026-01-01')) break;
    const moved = await clickNextPage();
    if (!moved) break;
  }

  collected.sort((a, b) => b.date.localeCompare(a.date));
  await fs.writeFile('/Users/zhaowenwen/Cursor/创客贴-无限画布/.codex-tmp/daily-report-rows.json', JSON.stringify(collected, null, 2), 'utf8');
  return { count: collected.length, first: collected[0]?.date, last: collected[collected.length - 1]?.date };
};
