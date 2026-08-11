import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, CalendarDays, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

type ReportType = 'daily' | 'weekly' | 'monthly';

interface DataReportPageProps {
  onBack: () => void;
}

const PASSWORD = '123456';
const STORAGE_KEY = 'ckt-data-report-unlocked';
const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const cloneDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const shiftDays = (date: Date, days: number) => {
  const next = cloneDate(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getWeekStart = (date: Date) => {
  const current = cloneDate(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  return current;
};

const getWeekRangeLabel = (date: Date) => {
  const start = getWeekStart(date);
  const end = shiftDays(start, 6);
  return `${formatDate(start)} 至 ${formatDate(end)}`;
};

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getMonthLabel = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const shiftMonths = (date: Date, months: number) => {
  const start = getMonthStart(date);
  return new Date(start.getFullYear(), start.getMonth() + months, 1);
};

const getDailyMetrics = (date: Date) => {
  const seed = date.getDate() + (date.getMonth() + 1) * 3;
  return [
    { label: '访问量', value: `${1180 + seed * 17}`, trend: '+8.4%', tone: 'text-emerald-600' },
    { label: '生成次数', value: `${320 + seed * 6}`, trend: '+5.1%', tone: 'text-sky-600' },
    { label: '消耗点数', value: `${960 + seed * 11}`, trend: '-2.3%', tone: 'text-amber-600' },
    { label: '转化率', value: `${(12 + (seed % 7) * 0.8).toFixed(1)}%`, trend: '+1.2%', tone: 'text-fuchsia-600' },
  ];
};

const getWeeklyMetrics = (date: Date) => {
  const weekStart = getWeekStart(date);
  const seed = weekStart.getDate() + (weekStart.getMonth() + 1) * 5;
  return [
    { label: '周访问量', value: `${8600 + seed * 43}`, trend: '+12.7%', tone: 'text-emerald-600' },
    { label: '周生成次数', value: `${2310 + seed * 14}`, trend: '+9.6%', tone: 'text-sky-600' },
    { label: '周消耗点数', value: `${7280 + seed * 25}`, trend: '+3.8%', tone: 'text-amber-600' },
    { label: '周留存率', value: `${(24 + (seed % 6) * 1.1).toFixed(1)}%`, trend: '+0.9%', tone: 'text-fuchsia-600' },
  ];
};

const getMonthlyMetrics = (date: Date) => {
  const monthStart = getMonthStart(date);
  const seed = (monthStart.getMonth() + 1) * 9;
  return [
    { label: '月访问量', value: `${38200 + seed * 117}`, trend: '+18.6%', tone: 'text-emerald-600' },
    { label: '月生成次数', value: `${12680 + seed * 39}`, trend: '+14.2%', tone: 'text-sky-600' },
    { label: '月消耗点数', value: `${40120 + seed * 88}`, trend: '+6.4%', tone: 'text-amber-600' },
    { label: '月付费转化', value: `${(31 + (seed % 5) * 1.3).toFixed(1)}%`, trend: '+2.1%', tone: 'text-fuchsia-600' },
  ];
};

const getDailyRows = (date: Date) => {
  const seed = date.getDate() + date.getMonth() * 2;
  return [
    { name: '图片生成', volume: 180 + seed * 2, users: 74 + (seed % 12), rate: `${(14 + (seed % 5) * 0.7).toFixed(1)}%` },
    { name: '视频生成', volume: 72 + seed, users: 28 + (seed % 8), rate: `${(9 + (seed % 4) * 0.6).toFixed(1)}%` },
    { name: '智能排版', volume: 95 + seed, users: 41 + (seed % 10), rate: `${(11 + (seed % 3) * 0.9).toFixed(1)}%` },
    { name: '导出下载', volume: 123 + seed * 2, users: 66 + (seed % 9), rate: `${(18 + (seed % 4) * 0.8).toFixed(1)}%` },
  ];
};

const getWeeklyRows = (date: Date) => {
  const seed = getWeekStart(date).getDate() + date.getMonth() * 4;
  return [
    { name: '图片生成', volume: 1420 + seed * 6, users: 502 + (seed % 30), rate: `${(15 + (seed % 6) * 0.5).toFixed(1)}%` },
    { name: '视频生成', volume: 588 + seed * 3, users: 201 + (seed % 18), rate: `${(10 + (seed % 5) * 0.6).toFixed(1)}%` },
    { name: '智能排版', volume: 760 + seed * 4, users: 318 + (seed % 25), rate: `${(12 + (seed % 4) * 0.7).toFixed(1)}%` },
    { name: '导出下载', volume: 980 + seed * 5, users: 436 + (seed % 28), rate: `${(19 + (seed % 5) * 0.5).toFixed(1)}%` },
  ];
};

const getMonthlyRows = (date: Date) => {
  const seed = (date.getMonth() + 1) * 8;
  return [
    { name: '图片生成', volume: 6480 + seed * 11, users: 2430 + (seed % 120), rate: `${(16 + (seed % 6) * 0.6).toFixed(1)}%` },
    { name: '视频生成', volume: 2870 + seed * 7, users: 1090 + (seed % 80), rate: `${(11 + (seed % 5) * 0.7).toFixed(1)}%` },
    { name: '智能排版', volume: 3510 + seed * 8, users: 1520 + (seed % 95), rate: `${(13 + (seed % 4) * 0.8).toFixed(1)}%` },
    { name: '导出下载', volume: 4290 + seed * 9, users: 1980 + (seed % 110), rate: `${(21 + (seed % 5) * 0.6).toFixed(1)}%` },
  ];
};

export function DataReportPage({ onBack }: DataReportPageProps) {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [dailyDate, setDailyDate] = useState(() => cloneDate(new Date()));
  const [weeklyDate, setWeeklyDate] = useState(() => getWeekStart(new Date()));
  const [monthlyDate, setMonthlyDate] = useState(() => getMonthStart(new Date()));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsUnlocked(window.sessionStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const currentTitle =
    reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '月报';
  const currentTimeLabel =
    reportType === 'daily'
      ? `${formatDate(dailyDate)} ${DAY_LABELS[(dailyDate.getDay() + 6) % 7]}`
      : reportType === 'weekly'
        ? getWeekRangeLabel(weeklyDate)
        : getMonthLabel(monthlyDate);
  const summaryMetrics = useMemo(
    () =>
      reportType === 'daily'
        ? getDailyMetrics(dailyDate)
        : reportType === 'weekly'
          ? getWeeklyMetrics(weeklyDate)
          : getMonthlyMetrics(monthlyDate),
    [dailyDate, monthlyDate, reportType, weeklyDate]
  );
  const tableRows = useMemo(
    () =>
      reportType === 'daily'
        ? getDailyRows(dailyDate)
        : reportType === 'weekly'
          ? getWeeklyRows(weeklyDate)
          : getMonthlyRows(monthlyDate),
    [dailyDate, monthlyDate, reportType, weeklyDate]
  );

  const handleUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordInput !== PASSWORD) {
      setPasswordError('密码错误，请输入 123456');
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsUnlocked(true);
    setPasswordError('');
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const step = direction === 'prev' ? -1 : 1;
    if (reportType === 'daily') {
      setDailyDate((prev) => shiftDays(prev, step));
      return;
    }
    if (reportType === 'weekly') {
      setWeeklyDate((prev) => shiftDays(prev, step * 7));
      return;
    }
    setMonthlyDate((prev) => shiftMonths(prev, step));
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f0e3_0%,#efe7da_45%,#e3dacb_100%)] px-6 py-8 text-stone-900">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_70px_rgba(89,67,35,0.15)] backdrop-blur">
            <button
              type="button"
              onClick={onBack}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              返回目录
            </button>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-[0_14px_30px_rgba(41,37,36,0.18)]">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-stone-900">周日报数据查看</h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              进入页面前需要密码验证。当前访问密码为 123456。
            </p>
            <form className="mt-8 space-y-4" onSubmit={handleUnlock}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">输入密码</span>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => {
                    setPasswordInput(event.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="请输入访问密码"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white"
                />
              </label>
              {passwordError ? <div className="text-sm text-rose-500">{passwordError}</div> : null}
              <button
                type="submit"
                className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                进入数据报告
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f1e8_0%,#ede5d7_100%)] px-6 py-8 text-stone-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl gap-6">
        <aside className="flex w-full max-w-[280px] flex-col rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,244,237,0.94)_100%)] p-6 shadow-[0_24px_60px_rgba(99,78,45,0.12)]">
          <button
            type="button"
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            返回目录
          </button>
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-500">
              <BarChart3 className="h-3.5 w-3.5" />
              数据中心
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">周日报数据查看</h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              左侧切换报告类型，右侧查看对应时间和数据。日报按天切换，周报按自然周切换，月报按自然月切换。
            </p>
          </div>
          <div className="space-y-3">
            {[
              { key: 'daily' as const, title: '日报', desc: '按天查看核心数据变化' },
              { key: 'weekly' as const, title: '周报', desc: '按自然周查看周度汇总' },
              { key: 'monthly' as const, title: '月报', desc: '按自然月查看月度汇总' },
            ].map((item) => {
              const active = reportType === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setReportType(item.key)}
                  className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                    active
                      ? 'border-stone-900 bg-stone-900 text-white shadow-[0_18px_36px_rgba(41,37,36,0.18)]'
                      : 'border-stone-200 bg-white text-stone-900 hover:border-stone-300'
                  }`}
                >
                  <div className="text-base font-semibold">{item.title}</div>
                  <div className={`mt-1 text-sm leading-6 ${active ? 'text-stone-300' : 'text-stone-500'}`}>{item.desc}</div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_28px_70px_rgba(95,72,37,0.12)] backdrop-blur">
          <div className="flex flex-col gap-5 rounded-[28px] bg-[linear-gradient(135deg,#1f1b16_0%,#51412f_100%)] p-6 text-white shadow-[0_24px_50px_rgba(31,27,22,0.18)] lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-stone-200">
                <CalendarDays className="h-3.5 w-3.5" />
                {currentTitle}
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{currentTitle}数据概览</h2>
              <p className="mt-2 text-sm leading-7 text-stone-300">
                当前查看时间：{currentTimeLabel}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/10 p-1.5 lg:self-auto">
              <button
                type="button"
                onClick={() => navigatePeriod('prev')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="min-w-[220px] px-3 text-center text-sm font-medium text-stone-100">{currentTimeLabel}</div>
              <button
                type="button"
                onClick={() => navigatePeriod('next')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryMetrics.map((metric) => (
              <section
                key={metric.label}
                className="rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8f5ef_100%)] p-5 shadow-[0_18px_32px_rgba(120,97,63,0.08)]"
              >
                <div className="text-sm text-stone-500">{metric.label}</div>
                <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-stone-900">{metric.value}</div>
                <div className={`mt-3 text-sm font-medium ${metric.tone}`}>{metric.trend} 较上期</div>
              </section>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)] p-6 shadow-[0_18px_42px_rgba(120,97,63,0.08)]">
            <div className="flex flex-col gap-2 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-stone-900">功能数据明细</h3>
                <p className="mt-1 text-sm text-stone-500">
                  展示 {currentTitle} 维度下的主要功能使用情况和转化表现。
                </p>
              </div>
              <div className="text-sm text-stone-400">统计口径：{currentTimeLabel}</div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[22px] border border-stone-200">
              <table className="min-w-full border-collapse text-left">
                <thead className="bg-stone-100/80 text-sm text-stone-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">功能模块</th>
                    <th className="px-5 py-4 font-medium">数据量</th>
                    <th className="px-5 py-4 font-medium">活跃用户</th>
                    <th className="px-5 py-4 font-medium">转化率</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm text-stone-700">
                  {tableRows.map((row) => (
                    <tr key={row.name} className="border-t border-stone-100">
                      <td className="px-5 py-4 font-medium text-stone-900">{row.name}</td>
                      <td className="px-5 py-4">{row.volume}</td>
                      <td className="px-5 py-4">{row.users}</td>
                      <td className="px-5 py-4">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
