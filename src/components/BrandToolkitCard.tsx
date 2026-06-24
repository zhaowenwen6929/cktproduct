import React from 'react';
import { SwatchBook } from 'lucide-react';
import { cn } from '../lib/utils';

type Props = {
  title: string;
  className?: string;
  onOpenDetails: () => void;
};

function FolderIllustration() {
  return (
    <svg
      width="92"
      height="76"
      viewBox="0 0 92 76"
      className="shrink-0 text-gray-200"
      aria-hidden
    >
      <path
        d="M12 18h28l6 8h38a4 4 0 014 4v38a6 6 0 01-6 6H14a6 6 0 01-6-6V24a6 6 0 016-6z"
        fill="currentColor"
        className="text-[#e8eaef]"
      />
      <path
        d="M18 28h56a3 3 0 013 3v28H15V31a3 3 0 013-3z"
        fill="#2d3a4a"
        opacity="0.92"
      />
      <path
        d="M22 32h48v22H22V32z"
        fill="#f4f6f8"
      />
      <path
        d="M8 34h76a4 4 0 014 4v32a6 6 0 01-6 6H10a6 6 0 01-6-6V38a4 4 0 014-4z"
        fill="#f8f9fb"
        stroke="#e2e5eb"
        strokeWidth="1"
      />
    </svg>
  );
}

export const BrandToolkitCard: React.FC<Props> = ({ title, className, onOpenDetails }) => {
  return (
    <div className={cn('w-full max-w-full', className)}>
      <div className="flex items-center gap-1.5 mb-2 text-gray-400">
        <SwatchBook size={14} strokeWidth={2} className="shrink-0" />
        <span className="text-[11px] leading-none">品牌工具包</span>
      </div>
      <button
        type="button"
        onClick={onOpenDetails}
        className="w-full text-left rounded-2xl border border-gray-200/90 bg-white shadow-sm hover:border-[#5c5cfc]/30 hover:shadow-md transition-all overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5c5cfc]/40"
      >
        <div className="flex items-stretch min-h-[100px] pl-4 pr-3 py-3 gap-2">
          <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
            <p className="text-[14px] font-bold text-gray-900 leading-snug pr-1">{title}</p>
            <span className="text-[12px] text-gray-500 mt-3 inline-flex items-center gap-0.5 hover:text-[#5c5cfc] transition-colors">
              <span className="text-gray-400" aria-hidden>
                &lt;
              </span>{' '}
              Check Details
            </span>
          </div>
          <div className="flex items-center justify-end shrink-0 self-center">
            <FolderIllustration />
          </div>
        </div>
      </button>
    </div>
  );
};
