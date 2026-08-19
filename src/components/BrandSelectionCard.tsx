import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { BrandGroup } from '../types';
import { cn } from '../lib/utils';

type Props = {
  brands: BrandGroup[];
  selectedBrandId: string | null;
  loading?: boolean;
  readOnly?: boolean;
  onSelectBrand: (brandId: string) => void;
  onSkip: () => void;
  onConfirm: () => void;
};

export const BrandSelectionCard: React.FC<Props> = ({
  brands,
  selectedBrandId,
  loading = false,
  readOnly = false,
  onSelectBrand,
  onSkip,
  onConfirm,
}) => {
  const promptText = '这次需求需要品牌信息，请先选择一个品牌后我再继续。';
  const [typedLength, setTypedLength] = useState(0);
  const typedPrompt = useMemo(() => promptText.slice(0, typedLength), [typedLength]);

  useEffect(() => {
    setTypedLength(0);
    const timer = window.setInterval(() => {
      setTypedLength((current) => {
        if (current >= promptText.length) {
          window.clearInterval(timer);
          return promptText.length;
        }
        return current + 1;
      });
    }, 28);

    return () => window.clearInterval(timer);
  }, [promptText]);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
          AI
        </div>
        <div className="text-[13px] font-semibold text-[#111827]">需求规划师</div>
      </div>
      <div className="rounded-[18px] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#eef1f7]">
        <div className={cn('text-[12px] leading-6', readOnly ? 'text-[#aab0c0]' : 'text-[#3d4454]')}>
          {typedPrompt}
        </div>

        <div className="mt-2.5 space-y-2">
          {brands.map((brand) => {
            const selected = selectedBrandId === brand.id;
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => onSelectBrand(brand.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-left transition-all',
                  readOnly
                    ? selected
                      ? 'border-[#d7daf0] bg-[#eef1f8] text-[#8087a3] cursor-default'
                      : 'border-transparent bg-[#f3f5fa] text-[#b2b8c8] cursor-default'
                    : selected
                      ? 'border-[#6c72ff] bg-[#f5f6ff] shadow-[0_0_0_1px_rgba(108,114,255,0.08)]'
                      : 'border-transparent bg-[#f6f7fb] text-[#3d4454] hover:border-[#e3e6f5]'
                )}
                disabled={readOnly}
              >
                <span
                  className={cn(
                    'text-[14px]',
                    readOnly
                      ? selected
                        ? 'font-semibold text-[#5d6480]'
                        : 'font-medium text-[#b2b8c8]'
                      : selected
                        ? 'font-semibold text-[#2f3566]'
                        : 'font-medium text-[#3d4454]'
                  )}
                >
                  {brand.name}
                </span>
                {selected && <Check size={18} className={readOnly ? 'text-[#8e94aa]' : 'text-[#2f3566]'} />}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            disabled={loading || readOnly}
            className="inline-flex items-center gap-1 text-[12px] text-[#9aa3bf] transition-colors hover:text-[#6f7897] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>跳过，直接生成</span>
            <ArrowRight size={13} />
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!selectedBrandId || loading || readOnly}
            className={cn(
              'rounded-full px-4 py-1.5 text-[12px] font-medium transition-all',
              selectedBrandId && !loading && !readOnly
                ? 'bg-[#efe9ff] text-[#7a62ff] hover:bg-[#e7deff]'
                : 'bg-[#f2f3f7] text-[#b7bdd1] cursor-not-allowed'
            )}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
