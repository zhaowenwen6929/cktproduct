import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronDown, ChevronUp, List, ChevronRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { BrandGroup } from '../types';

type SectionId = 'logo' | 'color' | 'font' | 'tone' | 'illustration' | 'spokesperson';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'logo', label: 'Logo' },
  { id: 'color', label: '颜色' },
  { id: 'font', label: '字体' },
  { id: 'tone', label: '调性' },
  { id: 'illustration', label: '插画' },
  { id: 'spokesperson', label: '代言人' },
];

type Props = {
  open: boolean;
  brand: BrandGroup | undefined;
  onClose: () => void;
};

export const BrandDetailPanel: React.FC<Props> = ({ open, brand, onClose }) => {
  const [expanded, setExpanded] = useState<SectionId | null>('color');
  const [copied, setCopied] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const brandName = brand?.name ?? '';
  const displayTitle = useMemo(
    () => (brandName.includes('品牌组') ? brandName : brandName ? `品牌组 ${brandName}` : '品牌组'),
    [brandName]
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = dialogRef.current;
      if (!el) return;
      // 无全局遮罩：点击弹框外区域即可关闭
      if (!el.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open, onClose]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      window.setTimeout(() => setCopied((v) => (v === text ? null : v)), 1200);
    } catch {
      // ignore
    }
  };

  // 注意：不要在 hooks 之前根据 brand/open return，否则会导致 hooks 顺序不一致 -> 白屏
  if (!open || !brand) return null;

  const palettes = brand.palettes?.length ? brand.palettes : [{ label: '主色', colors: brand.colors }];

  const logos = brand.logos?.length
    ? brand.logos
    : [{ label: 'Primary Logo' }, { label: 'Symbol' }, { label: 'Wordmark' }];
  const fonts = brand.fonts?.length ? brand.fonts : [{ family: '系统字体', styles: ['Regular', 'Bold'] }];
  const toneTags = brand.toneTags?.length ? brand.toneTags : ['品牌调性'];
  const toneBlocks = brand.toneBlocks?.length ? brand.toneBlocks : [{ title: '表达方式', items: ['简洁、清晰、可执行'] }];
  const illustrations = brand.illustrations?.length ? brand.illustrations : [{ label: '插画风格', caption: '待补充' }];
  const spokespersons = brand.spokespersons?.length ? brand.spokespersons : [{ label: '代言人素材', caption: '待补充' }];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.aside
            key="brand-panel-aside"
            role="dialog"
            aria-modal="true"
            aria-labelledby="brand-panel-title"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed z-[90] top-1/2 -translate-y-1/2 right-[420px] w-[min(470px,calc(100vw-460px))] h-[60vh] bg-white shadow-2xl border border-gray-100 rounded-2xl flex flex-col md:left-auto md:-translate-x-0 max-md:left-1/2 max-md:-translate-x-1/2 max-md:right-auto max-md:w-[min(470px,92vw)]"
          >
            <div ref={dialogRef} className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 id="brand-panel-title" className="text-[15px] font-semibold text-gray-900 pr-4 truncate">
                {displayTitle}
              </h2>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="p-1.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  aria-label="列表"
                >
                  <List size={18} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  aria-label="关闭"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {SECTIONS.map((sec) => {
                const isOpen = expanded === sec.id;
                return (
                  <div key={sec.id} className="border-b border-gray-50">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : sec.id)}
                      className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50/80 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-[14px] font-medium text-gray-900">
                        {sec.label}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {sec.id === 'logo' && isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-0 space-y-3">
                            <button
                              type="button"
                              className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-[#5c5cfc] transition-colors"
                            >
                              查看使用指南
                              <ChevronRight size={14} />
                            </button>
                            <div className="grid grid-cols-3 gap-3">
                              {logos.slice(0, 3).map((l, idx) => (
                                <div key={idx} className="space-y-2">
                                  <div className="h-[78px] rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-black/80 text-white flex items-center justify-center text-[10px] font-bold">
                                      {brand.name.slice(0, 1).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className="text-[11px] text-gray-500">{l.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {sec.id === 'color' && isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-0 space-y-4">
                            <button
                              type="button"
                              className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-[#5c5cfc] transition-colors"
                            >
                              查看使用指南
                              <ChevronRight size={14} />
                            </button>
                            {palettes.map((pg, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[11px] text-gray-500">{pg.label}</p>
                                  <button
                                    type="button"
                                    className="text-[11px] text-gray-400 hover:text-[#5c5cfc] transition-colors"
                                  >
                                    使用指南
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {pg.colors.map((c, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => copyText(c)}
                                      className="h-9 flex-1 min-w-[56px] max-w-[84px] rounded-md border border-gray-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5c5cfc]/30"
                                      style={{ backgroundColor: c }}
                                      title={`点击复制 ${c}`}
                                      aria-label={`复制颜色 ${c}`}
                                    />
                                  ))}
                                </div>
                                {copied && pg.colors.includes(copied) && (
                                  <div className="text-[10px] text-gray-400">已复制：{copied}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {sec.id === 'font' && isOpen && (
                      <div className="px-5 pb-4 space-y-3">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-[#5c5cfc] transition-colors"
                        >
                          查看使用指南
                          <ChevronRight size={14} />
                        </button>
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500">
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">标识</div>
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">副标题</div>
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">小标题</div>
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">正文</div>
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">引言</div>
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">字幕</div>
                        </div>
                        <div className="space-y-2">
                          {fonts.map((f, idx) => (
                            <div key={idx} className="space-y-1.5">
                              <div className="text-[12px] text-gray-800 font-medium truncate">{f.family}</div>
                              <div className="space-y-0.5">
                                {f.styles.map((s, i) => (
                                  <div key={i} className="text-[11px] text-gray-500">
                                    {`${f.family}-${s}`}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.id === 'tone' && isOpen && (
                      <div className="px-5 pb-4 space-y-3 text-[12px] text-gray-600">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-[#5c5cfc] transition-colors"
                        >
                          查看使用指南
                          <ChevronRight size={14} />
                        </button>
                        <div className="flex flex-wrap gap-2">
                          {toneTags.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-full bg-gray-50 border border-gray-100 text-[11px] text-gray-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {toneBlocks.map((b, i) => (
                            <div key={i} className="space-y-1">
                              <div className="font-medium text-gray-900">{b.title}</div>
                              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                {b.items.map((it, j) => (
                                  <li key={j}>{it}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.id === 'illustration' && isOpen && (
                      <div className="px-5 pb-4 space-y-3">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-[#5c5cfc] transition-colors"
                        >
                          查看使用指南
                          <ChevronRight size={14} />
                        </button>
                        <div className="overflow-x-auto -mx-5 px-5">
                          <div className="flex gap-3 w-max pb-1">
                            {illustrations.slice(0, 6).map((it, i) => (
                              <div
                                key={i}
                                className="w-[96px] shrink-0"
                                aria-label={`插画：${it.label}`}
                              >
                                <div className="aspect-square rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shadow-sm">
                                  <img
                                    src={`https://picsum.photos/seed/${encodeURIComponent(it.label)}-${i}-il/240/240`}
                                    alt={it.label}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {sec.id === 'spokesperson' && isOpen && (
                      <div className="px-5 pb-4 space-y-3">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-[#5c5cfc] transition-colors"
                        >
                          查看使用指南
                          <ChevronRight size={14} />
                        </button>
                        <div className="overflow-x-auto -mx-5 px-5">
                          <div className="flex gap-3 w-max pb-1">
                            {spokespersons.slice(0, 6).map((it, i) => (
                              <div
                                key={i}
                                className="w-[96px] shrink-0"
                                aria-label={`代言人：${it.label}`}
                              >
                                <div className="aspect-square rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shadow-sm">
                                  <img
                                    src={`https://picsum.photos/seed/${encodeURIComponent(it.label)}-${i}-sp-${brand.name}/240/240`}
                                    alt={it.label}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
