import React from 'react';
import { Square, Circle, Triangle, Star, ArrowRight, MessageSquare, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ShapePreset {
  id: string;
  type: 'rect' | 'circle' | 'triangle' | 'star' | 'arrow' | 'speech-rect' | 'speech-round';
  icon: React.ElementType;
  hasText?: boolean;
}

const SHAPES: ShapePreset[] = [
  { id: 'rect', type: 'rect', icon: Square },
  { id: 'circle', type: 'circle', icon: Circle },
  { id: 'triangle', type: 'triangle', icon: Triangle },
  { id: 'star', type: 'star', icon: Star },
  { id: 'arrow', type: 'arrow', icon: ArrowRight },
];

const TEXT_SHAPES: ShapePreset[] = [
  { id: 't-rect', type: 'rect', icon: Square, hasText: true },
  { id: 't-circle', type: 'circle', icon: Circle, hasText: true },
  { id: 't-speech-rect', type: 'speech-rect', icon: MessageSquare, hasText: true },
  { id: 't-speech-round', type: 'speech-round', icon: MessageCircle, hasText: true },
  { id: 't-arrow', type: 'arrow', icon: ArrowRight, hasText: true },
];

interface ShapeMenuProps {
  onSelect: (type: ShapePreset['type'], hasText?: boolean) => void;
  onClose: () => void;
}

export const ShapeMenu: React.FC<ShapeMenuProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute left-full ml-4 top-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[280px] z-50">
      <div className="mb-4">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">形状</h3>
        <div className="grid grid-cols-5 gap-2">
          {SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => {
                onSelect(shape.type);
                onClose();
              }}
              className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-all text-gray-500 hover:text-black border border-transparent hover:border-gray-100"
            >
              <shape.icon size={20} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">文字形状</h3>
        <div className="grid grid-cols-5 gap-2">
          {TEXT_SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => {
                onSelect(shape.type, true);
                onClose();
              }}
              className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-all text-gray-500 hover:text-black border border-transparent hover:border-gray-100"
            >
              <shape.icon size={20} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
