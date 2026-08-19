import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { BrandGroup } from '../types';
import { cn } from '../lib/utils';

type Props = {
  brands: BrandGroup[];
  selectedBrandId: string | null;
  loading?: boolean;
  onSelectBrand: (brandId: string) => void;
  onSkip: () => void;
  onConfirm: () => void;
};

export const BrandSelectionCard: React.FC<Props> = ({
  brands,
  selectedBrandId,
  loading = false,
  onSelectBrand,
  onSkip,
  onConfirm,
}) => {
  return (
    <div className="w-full rounded-[18px] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#eef1f7]">
      <div className="text-[12px] leading-6 text-[#3d4454]">
        这次需求需要品牌信息，请先选择一个品牌后我再继续。
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
                selected
                  ? 'border-[#6c72ff] bg-[#f5f6ff] shadow-[0_0_0_1px_rgba(108,114,255,0.08)]'
                  : 'border-transparent bg-[#f6f7fb] text-[#3d4454] hover:border-[#e3e6f5]'
              )}
            >
              <span className={cn('text-[14px]', selected ? 'font-semibold text-[#2f3566]' : 'font-medium text-[#3d4454]')}>
                {brand.name}
              </span>
              {selected && <Check size={18} className="text-[#2f3566]" />}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[12px] text-[#9aa3bf] transition-colors hover:text-[#6f7897] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>跳过，直接生成</span>
          <ArrowRight size={13} />
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selectedBrandId || loading}
          className={cn(
            'rounded-full px-4 py-1.5 text-[12px] font-medium transition-all',
            selectedBrandId && !loading
              ? 'bg-[#efe9ff] text-[#7a62ff] hover:bg-[#e7deff]'
              : 'bg-[#f2f3f7] text-[#b7bdd1] cursor-not-allowed'
          )}
        >
          确定
        </button>
      </div>
    </div>
  );
};
