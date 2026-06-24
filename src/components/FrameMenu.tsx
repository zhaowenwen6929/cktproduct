import React from 'react';
import { Square, Monitor, Smartphone, FileText, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface FramePreset {
  id: string;
  label: string;
  icon: React.ElementType;
  width: number;
  height: number;
}

const PRESETS: FramePreset[] = [
  { id: 'free', label: '自由绘制', icon: Maximize2, width: 400, height: 400 },
  { id: '4_3', label: '4:3', icon: Square, width: 400, height: 300 },
  { id: '16_9', label: '16:9', icon: Square, width: 480, height: 270 },
  { id: '1_1', label: '1:1', icon: Square, width: 400, height: 400 },
  { id: '9_16', label: '9:16', icon: Square, width: 270, height: 480 },
  { id: '3_4', label: '3:4', icon: Square, width: 300, height: 400 },
  { id: 'a4', label: 'A4', icon: FileText, width: 210 * 2, height: 297 * 2 },
  { id: 'web', label: '网页', icon: Monitor, width: 1440 / 2, height: 900 / 2 },
  { id: 'iphone', label: 'iPhone', icon: Smartphone, width: 390, height: 844 },
];

interface FrameMenuProps {
  onSelect: (preset: FramePreset) => void;
  onClose: () => void;
}

export const FrameMenu: React.FC<FrameMenuProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute left-full ml-4 top-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 grid grid-cols-3 gap-3 w-[320px] z-50">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => {
            onSelect(preset);
            onClose();
          }}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100"
        >
          <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
            <preset.icon size={24} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-gray-500 group-hover:text-black">
            {preset.label}
          </span>
        </button>
      ))}
    </div>
  );
};
