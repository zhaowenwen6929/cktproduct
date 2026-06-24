import React from 'react';
import { MousePointer2, Hand } from 'lucide-react';
import { CanvasMode } from '../types';

interface SelectionMenuProps {
  currentMode: CanvasMode;
  onSelect: (mode: CanvasMode) => void;
  onClose: () => void;
}

const MODES = [
  { id: 'select', label: '指针', icon: MousePointer2, shortcut: 'V' },
  { id: 'hand', label: '抓手', icon: Hand, shortcut: 'H' },
];

export const SelectionMenu: React.FC<SelectionMenuProps> = ({ currentMode, onSelect, onClose }) => {
  return (
    <div className="absolute left-full ml-4 top-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-[200px] z-50">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => {
            onSelect(mode.id as CanvasMode);
            onClose();
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className={currentMode === mode.id ? "text-blue-600" : "text-gray-400 group-hover:text-black"}>
              <mode.icon size={18} strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-black">
              {mode.label}
            </span>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 text-[10px] font-bold text-gray-400">
            {mode.shortcut}
          </div>
        </button>
      ))}
    </div>
  );
};
