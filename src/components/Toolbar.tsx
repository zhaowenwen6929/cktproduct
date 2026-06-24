import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, Plus, Hash, Type, Square, Image as ImageIcon, MapPin, Hand, Workflow, LayoutPanelTop } from 'lucide-react';
import { cn } from '../lib/utils';
import { FrameMenu } from './FrameMenu';
import { ShapeMenu } from './ShapeMenu';
import { SelectionMenu } from './SelectionMenu';
import { ResourceMenu } from './ResourceMenu';
import { UploadMenu } from './UploadMenu';
import { AppMode, CanvasMode } from '../types';

interface ToolbarProps {
  onAddFrame: (width: number, height: number, label: string) => void;
  onAddShape: (type: string, hasText?: boolean) => void;
  onAddImage: (url: string) => void;
  onAddText: () => void;
  onAddGenerator: (generatorType: 'image' | 'video' | 'text') => void;
  onUpload: (file: File, type: 'image' | 'video') => void;
  currentMode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  appMode: AppMode;
  onAppModeChange: (mode: AppMode) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddFrame, onAddShape, onAddImage, onAddText, onAddGenerator, onUpload, currentMode, onModeChange, appMode, onAppModeChange }) => {
  const [showFrameMenu, setShowFrameMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [showResourceMenu, setShowResourceMenu] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowFrameMenu(false);
        setShowShapeMenu(false);
        setShowSelectionMenu(false);
        setShowResourceMenu(false);
        setShowUploadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenus = () => {
    setShowFrameMenu(false);
    setShowShapeMenu(false);
    setShowSelectionMenu(false);
    setShowResourceMenu(false);
    setShowUploadMenu(false);
  };

  const isSelectModeActive = currentMode === 'select' || currentMode === 'hand';
  const selectToolIcon = currentMode === 'hand' ? Hand : MousePointer2;
  const selectToolLabel = currentMode === 'hand' ? '抓手' : '选择';
  const selectToolShortcut = currentMode === 'hand' ? 'H' : 'V';

  const tools = [
    { id: 'select', icon: selectToolIcon, label: selectToolLabel, shortcut: selectToolShortcut, active: isSelectModeActive },
    { id: 'point', icon: MapPin, label: '点选', shortcut: 'M', active: currentMode === 'point' },
    { id: 'add', icon: Plus, label: 'Add' },
    { id: 'frame', icon: Hash, label: 'Frame' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'shape', icon: Square, label: 'Shape' },
    { id: 'image', icon: ImageIcon, label: 'Resource Library' },
  ];

  return (
    <div ref={toolbarRef} className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 flex flex-col gap-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="relative"
            onMouseEnter={() => {
              if (tool.id === 'select') {
                setShowSelectionMenu(true);
              }
            }}
            onMouseLeave={() => {
              if (tool.id === 'select') {
                setShowSelectionMenu(false);
              }
            }}
          >
            <button
              onClick={() => {
                if (tool.id === 'select') {
                  onModeChange('select');
                  setShowFrameMenu(false);
                  setShowShapeMenu(false);
                  setShowResourceMenu(false);
                  setShowUploadMenu(false);
                } else if (tool.id === 'point') {
                  onModeChange('point');
                  closeMenus();
                } else if (tool.id === 'add') {
                  setShowUploadMenu(!showUploadMenu);
                  setShowSelectionMenu(false);
                  setShowFrameMenu(false);
                  setShowShapeMenu(false);
                  setShowResourceMenu(false);
                } else if (tool.id === 'frame') {
                  setShowFrameMenu(!showFrameMenu);
                  setShowShapeMenu(false);
                  setShowSelectionMenu(false);
                  setShowResourceMenu(false);
                  setShowUploadMenu(false);
                } else if (tool.id === 'text') {
                  onAddText();
                  setShowFrameMenu(false);
                  setShowShapeMenu(false);
                  setShowSelectionMenu(false);
                  setShowResourceMenu(false);
                  setShowUploadMenu(false);
                } else if (tool.id === 'shape') {
                  setShowShapeMenu(!showShapeMenu);
                  setShowFrameMenu(false);
                  setShowSelectionMenu(false);
                  setShowResourceMenu(false);
                  setShowUploadMenu(false);
                } else if (tool.id === 'image') {
                  setShowResourceMenu(!showResourceMenu);
                  setShowShapeMenu(false);
                  setShowFrameMenu(false);
                  setShowSelectionMenu(false);
                  setShowUploadMenu(false);
                }
              }}
              className={cn(
                "p-3 rounded-xl transition-all group relative",
                tool.active ? "bg-black text-white shadow-lg" : "text-gray-400 hover:bg-gray-50 hover:text-black"
              )}
              aria-pressed={tool.active}
            >
              <tool.icon size={20} />
              <span className="absolute left-full top-1/2 z-[90] ml-4 -translate-y-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                {tool.shortcut ? `${tool.label} ${tool.shortcut}` : tool.label}
              </span>
            </button>
            {tool.id === 'select' && showSelectionMenu && (
              <SelectionMenu 
                currentMode={currentMode}
                onSelect={onModeChange}
                onClose={() => setShowSelectionMenu(false)}
              />
            )}
            {tool.id === 'add' && showUploadMenu && (
              <UploadMenu 
                onUpload={onUpload}
                onAddGenerator={onAddGenerator}
                onClose={() => setShowUploadMenu(false)}
              />
            )}
            {tool.id === 'frame' && showFrameMenu && (
              <FrameMenu 
                onSelect={(preset) => onAddFrame(preset.width, preset.height, preset.label)} 
                onClose={() => setShowFrameMenu(false)} 
              />
            )}
            {tool.id === 'shape' && showShapeMenu && (
              <ShapeMenu 
                onSelect={(type, hasText) => onAddShape(type, hasText)} 
                onClose={() => setShowShapeMenu(false)} 
              />
            )}
            {tool.id === 'image' && showResourceMenu && (
              <ResourceMenu 
                onAddImage={(url) => onAddImage(url)} 
                onClose={() => setShowResourceMenu(false)} 
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl">
        <button
          type="button"
          onClick={() => onAppModeChange('canvas')}
          className={cn(
            "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
            appMode === 'canvas' ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50 hover:text-black"
          )}
        >
          <LayoutPanelTop size={18} />
          <span className="absolute left-full top-1/2 z-[90] ml-4 -translate-y-1/2 rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition-opacity whitespace-nowrap pointer-events-none group-hover:opacity-100">
            画布模式
          </span>
        </button>
        <button
          type="button"
          onClick={() => onAppModeChange('workflow')}
          className={cn(
            "group relative mt-1.5 flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
            appMode === 'workflow' ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50 hover:text-black"
          )}
        >
          <Workflow size={18} />
          <span className="absolute left-full top-1/2 z-[90] ml-4 -translate-y-1/2 rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition-opacity whitespace-nowrap pointer-events-none group-hover:opacity-100">
            工作流模式
          </span>
        </button>
      </div>
    </div>
  );
};
