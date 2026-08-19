import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Globe, Loader2, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PlanFlow } from '../types';

interface PlanningFlowCardProps {
  task: PlanFlow;
  onSubmitAnswers: (answers: Record<string, string>) => void;
}

const THINK_TEXT = '好的，我先搜索创客贴品牌的视觉调性和核心信息，再据此生成。';
const SEARCH_ITEMS = [
  'aistarmap.com',
  'Canva vs 稿定 vs 创客贴：2026终极选择指南，5分钟读懂',
  '新媒体运营的10个工具，快速变运营推广大拿 | 人人都是产品经理',
  'chuangkit.com',
  '创客贴设计-AI海报图片设计 - App Store',
];
const SEARCH_SUMMARY = '搜索创客贴（chuangkit.com）品牌信息，包括品牌定位、slogan、视觉风格、Logo…';
const SEARCH_REFERENCE_ITEMS = [
  {
    title: '李白《赠汪伦》儿童风格水彩画',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: '水墨风格画，描绘楼台、竹子、仙鹤',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: '古风场景描绘，文人雅士在船上',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: '水墨风格画，有竹子、山色与飞鸟',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: '淡彩留白构图，带有山峦与树影',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80&auto=format&fit=crop',
  },
];

const buildPosterDataUri = (variant: number) => {
  const palettes = [
    ['#4f46e5', '#6366f1', '#8b5cf6'],
    ['#0ea5e9', '#2563eb', '#4f46e5'],
    ['#f97316', '#fb7185', '#8b5cf6'],
    ['#14b8a6', '#0f766e', '#2563eb'],
  ] as const;
  const palette = palettes[(variant - 1) % palettes.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="640" viewBox="0 0 420 640">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="55%" stop-color="${palette[1]}"/>
          <stop offset="100%" stop-color="${palette[2]}"/>
        </linearGradient>
        <radialGradient id="r" cx="30%" cy="20%" r="80%">
          <stop offset="0%" stop-color="#9fcbff" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="420" height="640" rx="28" fill="url(#g)"/>
      <circle cx="70" cy="80" r="110" fill="#ffffff" opacity="0.12"/>
      <circle cx="340" cy="90" r="120" fill="#ffffff" opacity="0.09"/>
      <circle cx="300" cy="520" r="150" fill="#ffffff" opacity="0.08"/>
      <rect x="24" y="26" width="372" height="78" rx="20" fill="#ffffff" opacity="0.14"/>
      <text x="44" y="67" font-family="Arial, PingFang SC, sans-serif" font-size="22" fill="#fff" opacity="0.9">GPT Image 2</text>
      <text x="44" y="126" font-family="Arial, PingFang SC, sans-serif" font-size="52" font-weight="700" fill="#fff">不会设计？</text>
      <text x="44" y="186" font-family="Arial, PingFang SC, sans-serif" font-size="52" font-weight="700" fill="#fff">也能做出高级感</text>
      <rect x="42" y="220" width="250" height="32" rx="16" fill="#93c5fd" opacity="0.28"/>
      <text x="58" y="242" font-family="Arial, PingFang SC, sans-serif" font-size="20" fill="#fff" opacity="0.95">海量模板 × AI 智能设计 × 写作创作</text>
      <rect x="30" y="292" width="360" height="210" rx="22" fill="#ffffff" opacity="0.18"/>
      <rect x="56" y="320" width="120" height="150" rx="18" fill="#fff" opacity="0.18"/>
      <rect x="206" y="318" width="130" height="162" rx="20" fill="#fff" opacity="0.24"/>
      <rect x="82" y="350" width="62" height="18" rx="9" fill="#fff" opacity="0.8"/>
      <rect x="82" y="382" width="80" height="14" rx="7" fill="#fff" opacity="0.72"/>
      <rect x="226" y="346" width="82" height="18" rx="9" fill="#fff" opacity="0.76"/>
      <rect x="226" y="378" width="88" height="14" rx="7" fill="#fff" opacity="0.66"/>
      <rect x="48" y="536" width="324" height="56" rx="18" fill="#ffffff" opacity="0.14"/>
      <text x="68" y="570" font-family="Arial, PingFang SC, sans-serif" font-size="18" fill="#fff">为职场人打造的高效设计工具</text>
      <text x="342" y="602" font-family="Arial, PingFang SC, sans-serif" font-size="15" fill="#fff" opacity="0.82">#${variant}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const POSTER_PREVIEWS = [1, 2, 3, 4].map((variant) => buildPosterDataUri(variant));

export const PlanningFlowCard: React.FC<PlanningFlowCardProps> = ({ task, onSubmitAnswers }) => {
  const plannerIntro = '你希望做什么主题的海报呢？我需要了解更多的信息才能继续往下推进，请按照提示完善你的需求吧：';
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>(
    task.selectedAnswers ? Object.fromEntries(Object.entries(task.selectedAnswers).map(([key, value]) => [key, value])) : {}
  );
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [typedIntro, setTypedIntro] = useState('');
  const [questionExpanded, setQuestionExpanded] = useState(true);
  const [thinkingDone, setThinkingDone] = useState(false);
  const [searchVisibleCount, setSearchVisibleCount] = useState(0);
  const [searchDone, setSearchDone] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(true);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterDone, setPosterDone] = useState(false);
  const [searchSummaryVisible, setSearchSummaryVisible] = useState(false);
  const [searchReferenceOpen, setSearchReferenceOpen] = useState(false);
  const [searchReferencePosition, setSearchReferencePosition] = useState({ top: 96, left: 96 });
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState('');
  const searchReferenceTriggerRef = useRef<HTMLButtonElement>(null);

  const introComplete = task.status === 'clarifying' && typedIntro.length >= plannerIntro.length;
  const showQuestionPanel = Boolean(task.questions.length) && (task.questionSubmitted || introComplete);
  const showProcessPanel = !task.awaitingBrandSelection && Boolean(task.subAgentName) && (task.questionSubmitted || task.status === 'running' || task.status === 'completed');

  useEffect(() => {
    setSelectedAnswers(task.selectedAnswers ?? {});
  }, [task.selectedAnswers, task.id]);

  useEffect(() => {
    setTypedIntro('');
  }, [task.id]);

  useEffect(() => {
    if (task.status !== 'clarifying') {
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedIntro(plannerIntro.slice(0, index));
      if (index >= plannerIntro.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [plannerIntro, task.id, task.status]);

  useEffect(() => {
    if (!showProcessPanel) {
      setQuestionExpanded(true);
      setThinkingDone(false);
      setSearchVisibleCount(0);
      setSearchDone(false);
      setSearchExpanded(true);
      setSearchSummaryVisible(false);
      setSearchReferenceOpen(false);
      setPosterVisible(false);
      setPosterDone(false);
      setVote(null);
      setFeedbackOpen(false);
      setFeedbackReason('');
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const wait = (ms: number) => new Promise<void>((resolve) => {
      const id = window.setTimeout(resolve, ms);
      timers.push(id);
    });

    const typeThinking = async () => {
      setQuestionExpanded(true);
      setThinkingDone(false);
      setSearchVisibleCount(0);
      setSearchDone(false);
      setSearchSummaryVisible(false);
      setSearchReferenceOpen(false);
      setPosterVisible(false);
      setPosterDone(false);
      setVote(null);
      setFeedbackOpen(false);
      setFeedbackReason('');

      for (let i = 1; i <= THINK_TEXT.length; i += 1) {
        if (cancelled) return;
        await wait(Math.max(18, Math.floor(3000 / THINK_TEXT.length)));
      }
      if (cancelled) return;
      setThinkingDone(true);

      await wait(250);
      if (cancelled) return;

      setSearchExpanded(true);
      for (let i = 1; i <= SEARCH_ITEMS.length; i += 1) {
        await wait(2000);
        if (cancelled) return;
        setSearchVisibleCount(i);
      }
      if (cancelled) return;
      setSearchDone(true);
      setSearchSummaryVisible(true);

      await wait(3000);
      if (cancelled) return;
      setPosterVisible(true);
      setPosterDone(true);
    };

    void typeThinking();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [showProcessPanel, task.id]);

  const getQuestionMode = (question: NonNullable<(typeof task.questions)[number]>) => question.selectionMode ?? 'single';
  const getQuestionValue = (questionId: string) => selectedAnswers[questionId];

  const getCustomDisplayValue = (questionId: string) => {
    const value = selectedAnswers[questionId];
    if (typeof value !== 'string') return '';
    return value.startsWith('自定义：') ? value.slice(4) : '';
  };

  const isCustomSelected = (questionId: string) => typeof selectedAnswers[questionId] === 'string' && `${selectedAnswers[questionId]}`.startsWith('自定义');
  const isQuestionSelected = (questionId: string) => Array.isArray(selectedAnswers[questionId]) ? (selectedAnswers[questionId] as string[]).length > 0 : Boolean(selectedAnswers[questionId]);

  const setSingleAnswer = (questionId: string, value: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleMultiAnswer = (questionId: string, value: string) => {
    setSelectedAnswers((prev) => {
      const current = prev[questionId];
      const list = Array.isArray(current) ? current : [];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...prev, [questionId]: next };
    });
  };

  const submitAnswers = () => {
    const merged = task.questions.reduce<Record<string, string>>((acc, question) => {
      const value = selectedAnswers[question.id];
      if (Array.isArray(value)) {
        if (value.length > 0) acc[question.id] = value.join('、');
        return acc;
      }
      const selectedValue = value?.trim();
      if (selectedValue === '自定义') {
        const customValue = customInputs[question.id]?.trim();
        acc[question.id] = customValue ? `自定义：${customValue}` : '自定义';
        return acc;
      }
      if (selectedValue) acc[question.id] = selectedValue;
      return acc;
    }, {});
    onSubmitAnswers(merged);
  };

  const thoughtLine = '我先判断你想做什么，再把约束和输出形态整理清楚。';
  const completionTitle = task.resultTitle || '生成完成';
  const completionText = task.resultText || '已完成生成并返回 4 个结果，结果已同步到画布并可反馈。';
  const completionModelLabel = 'Seedream 4.0（模拟流程）';

  useEffect(() => {
    if (!searchReferenceOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchReferenceTriggerRef.current?.contains(target)) return;
      const panel = document.getElementById(`search-reference-panel-${task.id}`);
      if (panel?.contains(target)) return;
      setSearchReferenceOpen(false);
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [searchReferenceOpen, task.id]);

  const openSearchReferencePanel = () => {
    const rect = searchReferenceTriggerRef.current?.getBoundingClientRect();
    const panelWidth = 620;
    const top = Math.max(16, (rect?.top ?? 96) - 8);
    const left = Math.max(16, (rect?.left ?? 96) - panelWidth - 16);
    setSearchReferencePosition({ top, left });
    setSearchReferenceOpen(true);
  };

  return (
    <div className="w-full">
      {task.status === 'thinking' && (
        <div className="ml-0 inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2 text-[13px] font-medium text-[#111827] shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          <Loader2 size={14} className="animate-spin text-[#111827]" />
          思考中
        </div>
      )}

      {task.status !== 'thinking' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
              AI
            </div>
            <div className="text-[13px] font-semibold text-[#111827]">需求规划师</div>
          </div>
          <div className="ml-0 inline-flex max-w-[92%] rounded-[18px] bg-white px-4 py-3 text-[13px] leading-6 text-[#111827] shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            {typedIntro}
            {task.status === 'clarifying' && typedIntro.length < plannerIntro.length && <span className="ml-0.5 inline-block h-4 w-[1px] animate-pulse bg-[#111827] align-middle" />}
          </div>
        </div>
      )}

      {showQuestionPanel && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2.5 rounded-[18px] bg-[#f7f9ff] px-3 py-3 shadow-[0_10px_24px_rgba(92,92,252,0.06)]">
          <div className="space-y-2">
            {task.questions.map((question) => {
              const mode = getQuestionMode(question);
              const selectedValue = getQuestionValue(question.id);
              const readOnly = Boolean(task.questionSubmitted) || task.status === 'running' || task.status === 'completed';
              return (
                <div key={question.id} className="py-1">
                  <div className="mb-2 text-[13px] font-semibold leading-5 text-[#1f2937]">{question.title}</div>
                  {mode !== 'input' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {(question.options ?? []).map((option) => {
                        const selected = mode === 'multiple'
                          ? Array.isArray(selectedValue) && selectedValue.includes(option.label)
                          : (option.label === '自定义'
                              ? typeof selectedValue === 'string' && selectedValue.startsWith('自定义')
                              : selectedValue === option.label);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={readOnly}
                            onClick={() => {
                              if (readOnly) return;
                              return mode === 'multiple' ? toggleMultiAnswer(question.id, option.label) : setSingleAnswer(question.id, option.label);
                            }}
                            className={[
                              'min-h-[40px] rounded-[14px] border px-3 py-2 text-left transition-all',
                              selected
                                ? 'border-[#5c5cfc] bg-[#eef1ff] text-[#111827] shadow-[0_0_0_1px_rgba(92,92,252,0.12),0_8px_18px_rgba(92,92,252,0.12)] ring-1 ring-[#5c5cfc]/20'
                                : readOnly
                                  ? 'border-transparent bg-[#f1f3f8] text-gray-400'
                                  : 'border-transparent bg-white text-gray-800 hover:border-[#dce1ff] hover:bg-[#f4f6ff]',
                            ].join(' ')}
                          >
                            <div className="text-[12px] font-medium leading-4">{option.label}</div>
                            {option.description && <div className="mt-0.5 text-[10px] leading-4 text-gray-500">{option.description}</div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {mode !== 'input' && isCustomSelected(question.id) && (
                    <input
                      type="text"
                      value={readOnly ? getCustomDisplayValue(question.id) : (customInputs[question.id] ?? '')}
                      onChange={(e) => setCustomInputs((prev) => ({ ...prev, [question.id]: e.target.value }))}
                      placeholder="请输入自定义内容"
                      disabled={readOnly}
                      className="mt-2 h-9 w-full rounded-[12px] bg-white px-3 text-[11px] text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#5c5cfc]/10"
                    />
                  )}
                  {readOnly && mode !== 'input' && !isQuestionSelected(question.id) && <div className="mt-2 text-[11px] text-gray-400">未选择</div>}
                  {mode === 'input' && (
                    <>
                      {readOnly ? (
                        <div className="mt-2 rounded-[12px] bg-[#f1f3f8] px-3 py-2 text-[11px] text-gray-500">
                          {typeof selectedValue === 'string' && selectedValue.startsWith('自定义：')
                            ? selectedValue.slice(4)
                            : (typeof selectedValue === 'string' ? selectedValue : '')}
                        </div>
                      ) : (
                        <textarea
                          value={typeof selectedValue === 'string' ? selectedValue : ''}
                          onChange={(e) => setSingleAnswer(question.id, e.target.value)}
                          placeholder={question.customInputPlaceholder || '请输入补充信息'}
                          className="min-h-[78px] w-full rounded-[14px] bg-white px-3 py-2 text-[11px] text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#5c5cfc]/10"
                        />
                      )}
                    </>
                  )}
                  {!readOnly && mode !== 'input' && question.allowCustomInput && (
                    <textarea
                      value={typeof selectedValue === 'string' ? selectedValue : ''}
                      onChange={(e) => setSingleAnswer(question.id, e.target.value)}
                      placeholder={question.customInputPlaceholder || '请输入补充信息'}
                      className="mt-2 min-h-[64px] w-full rounded-[14px] bg-white px-3 py-2 text-[11px] text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#5c5cfc]/10"
                    />
                  )}
                </div>
              );
            })}
          </div>
          {!task.questionSubmitted && (
            <div className="mt-2.5 flex justify-end">
              <button
                type="button"
                onClick={submitAnswers}
                className="inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-gray-900"
              >
                <Check size={14} />
                确认补充
              </button>
            </div>
          )}
        </motion.div>
      )}

      {showProcessPanel && (
        <div className="mt-2 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-medium text-[#a3a3a3] shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
            <span className="text-[#5c5cfc] font-semibold">{`@${task.subAgentName}`}</span>
            <span>接手任务</span>
          </div>
        </div>
      )}

      {showProcessPanel && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2.5 rounded-[18px] bg-[#f5f7fd] p-3 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d9ecff_0%,#b8d7ff_100%)] text-[11px] font-semibold text-[#2554d8] shadow-[0_8px_18px_rgba(37,84,216,0.16)]">
              平
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold leading-5 text-[#3d4454]">{task.subAgentName}</div>
              <div className="mt-0.5 text-[10px] text-[#8a93a6]">根据补充信息继续完成任务拆解与执行</div>
            </div>
          </div>

          <div className="mt-3 relative">
            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[#dce4f6]" />
            <div className="space-y-2">
              <ProcessStep
                title={thinkingDone ? '思考完成' : '思考中'}
                active={!thinkingDone}
                done={thinkingDone}
                collapsible
                icon={thinkingDone ? <Check size={11} /> : <Loader2 size={11} className="animate-spin" />}
                open={questionExpanded}
                onToggle={() => setQuestionExpanded((prev) => !prev)}
              >
                <TypingText text={thoughtLine} done={thinkingDone} />
              </ProcessStep>

              {thinkingDone && (
                <ProcessStep
                  title={searchDone ? '联网搜索完成' : '联网搜索中'}
                  active={!searchDone}
                  done={searchDone}
                  collapsible
                  icon={searchDone ? <Check size={11} /> : <Globe size={11} />}
                  open={searchExpanded}
                  onToggle={() => setSearchExpanded((prev) => !prev)}
                >
                  <div className="space-y-2">
                    {SEARCH_ITEMS.slice(0, searchVisibleCount).map((item) => (
                      <div key={item} className="flex items-center gap-2 rounded-[10px] bg-[#f9fbff] px-2.5 py-2 text-[11px] text-[#6b7280]">
                        <Globe size={11} className="shrink-0 text-[#8a93a6]" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                    {searchSummaryVisible && (
                      <button
                        ref={searchReferenceTriggerRef}
                        type="button"
                        onClick={openSearchReferencePanel}
                        className="mt-1 flex w-full items-center gap-2 rounded-[12px] border border-[#e9eefb] bg-white px-2.5 py-2 text-left transition-colors hover:bg-[#f8faff]"
                      >
                        <div className="min-w-0 flex-1 text-[11px] leading-5 text-[#6b7280]">{SEARCH_SUMMARY}</div>
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-[8px] bg-[#eef1ff]">
                          <img src={SEARCH_REFERENCE_ITEMS[0].image} alt="" className="h-full w-full object-cover" />
                        </div>
                      </button>
                    )}
                  </div>
                </ProcessStep>
              )}

              {searchDone && (
                <div className="relative">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-[#5c5cfc]">
                    <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#eef1ff] text-[10px] ring-4 ring-[#f5f7fd]">
                      {posterDone ? <Check size={11} /> : 3}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[14px] border border-[#e9eefb] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                    <div className="flex w-full items-start justify-between gap-3 px-3.5 py-2.5 text-left">
                      <div className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-[#6b63ff]">
                        <Sparkles size={11} className="shrink-0" />
                        <span className="truncate">{completionModelLabel}</span>
                      </div>
                    </div>
                    <div className="border-t border-[#f0f3ff] px-3.5 py-2.5">
                      {!posterDone ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-3 py-1.5 text-[10px] leading-4 text-[#7b8496]">
                          <Loader2 size={11} className="animate-spin" />
                          {posterVisible ? '生图完成，正在整理最终结果' : 'loading...'}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 text-[10px] leading-4 text-[#7b8496]">
                            <Check size={11} className="text-[#5c5cfc]" />
                            <span>生图完成并同步到最终生成流</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {POSTER_PREVIEWS.map((src, index) => (
                              <div key={`${src}-${index}`} className="aspect-[3/4] overflow-hidden rounded-[12px] border border-[#d7ddff] bg-[#eef1ff]">
                                <img src={src} alt={`Generated ${index + 1}`} className="h-full w-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setVote('up');
                                setFeedbackOpen(false);
                                setFeedbackReason('');
                              }}
                              className={[
                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors',
                                vote === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f8fafc] text-gray-700 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              <ThumbsUp size={13} />
                              赞
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVote('down');
                                setFeedbackOpen(true);
                              }}
                              className={[
                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors',
                                vote === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-[#f8fafc] text-gray-700 hover:bg-gray-50',
                              ].join(' ')}
                            >
                              <ThumbsDown size={13} />
                              踩
                            </button>
                          </div>
                          {feedbackOpen && vote === 'down' && (
                            <div className="rounded-[14px] bg-[#fff5f6] p-3">
                              <div className="text-[12px] font-medium text-gray-900">哪里需要改进？</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {['没有遵循指令', '细节有错误', '风格不对', '等待太久'].map((reason) => (
                                  <button
                                    key={reason}
                                    type="button"
                                    onClick={() => {
                                      setFeedbackReason(reason);
                                      setFeedbackOpen(false);
                                    }}
                                    className="rounded-full bg-white px-3 py-1 text-[11px] text-gray-700 ring-1 ring-rose-100"
                                  >
                                    {reason}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={feedbackReason}
                                onChange={(e) => setFeedbackReason(e.target.value)}
                                placeholder="补充说明"
                                className="mt-2 min-h-[64px] w-full rounded-[12px] border border-rose-100 bg-white px-3 py-2 text-[11px] text-gray-800 outline-none placeholder:text-gray-400"
                              />
                            </div>
                          )}
                          <div className="text-[12px] leading-6 text-gray-800">{completionText}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {searchReferenceOpen && (
        <div
          id={`search-reference-panel-${task.id}`}
          className="fixed z-50"
          style={{ top: `${searchReferencePosition.top}px`, left: `${searchReferencePosition.left}px` }}
        >
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.98 }}
            className="w-[620px] rounded-[22px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.18)] ring-1 ring-black/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[15px] font-semibold leading-7 text-gray-900">
                  搜索小学六年级必背古诗列表，确认适合制作视觉海报的经典篇目
                </div>
                <div className="mt-2 text-[12px] leading-6 text-gray-500">视觉参考</div>
              </div>
              <button
                type="button"
                onClick={() => setSearchReferenceOpen(false)}
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <ChevronDown size={18} className="rotate-45" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {SEARCH_REFERENCE_ITEMS.slice(0, 3).map((item) => (
                <div key={item.title} className="overflow-hidden rounded-[14px] border border-[#e9eefb] bg-[#fafbff]">
                  <div className="aspect-[4/3] overflow-hidden bg-[#eef1ff]">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-2.5 text-[11px] leading-5 text-gray-700">{item.title}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {SEARCH_REFERENCE_ITEMS.slice(3).map((item) => (
                <div key={item.title} className="overflow-hidden rounded-[14px] border border-[#e9eefb] bg-[#fafbff]">
                  <div className="aspect-[4/3] overflow-hidden bg-[#eef1ff]">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-2.5 text-[11px] leading-5 text-gray-700">{item.title}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

function ProcessStep({
  title,
  active,
  done,
  collapsible,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  active: boolean;
  done: boolean;
  collapsible: boolean;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-7">
      <div className={`absolute left-[2px] top-3 flex h-5.5 w-5.5 items-center justify-center rounded-full text-[10px] font-semibold ring-4 ring-[#f5f7fd] ${done ? 'bg-emerald-50 text-emerald-600' : active ? 'bg-[#eef1ff] text-[#5c5cfc]' : 'bg-gray-100 text-gray-400'}`}>
        {icon}
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[#e9eefb] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
        <button
          type="button"
          disabled={!collapsible}
          onClick={onToggle}
          className={`flex w-full items-start justify-between gap-3 px-3.5 py-2.5 text-left ${!collapsible ? 'cursor-default' : ''}`}
        >
          <div className="min-w-0">
            <div className="text-[10px] font-normal leading-5 text-[#1f2937]">{title}</div>
          </div>
          {collapsible ? (open ? <ChevronUp size={13} className="mt-0.5 shrink-0 text-gray-400" /> : <ChevronDown size={13} className="mt-0.5 shrink-0 text-gray-400" />) : null}
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[#f0f3ff]">
              <div className="px-3.5 py-2.5">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TypingText({ text, done }: { text: string; done: boolean }) {
  const [visible, setVisible] = useState('');
  useEffect(() => {
    if (done) {
      setVisible(text);
      return;
    }
    setVisible('');
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setVisible(text.slice(0, i));
      if (i >= text.length) window.clearInterval(timer);
    }, Math.max(18, Math.floor(3000 / Math.max(text.length, 1))));
    return () => window.clearInterval(timer);
  }, [done, text]);

  return <div className="inline-flex rounded-full bg-[#f5f7fb] px-2.5 py-1.5 text-[10px] leading-4 text-[#7b8496]">{visible}</div>;
}
