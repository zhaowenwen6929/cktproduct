import React, { useState, useRef, useEffect } from 'react';
import { Share2, Download, User, ChevronDown, Home, Pencil, Plus, Copy, Undo2, Redo2, Save, ExternalLink, Crown } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopbarProps {
  credits: number;
  projectName: string;
  onExportClick: () => void;
  exportDropdown?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({ credits, projectName, onExportClick, exportDropdown }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="relative z-30 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative" ref={menuRef}>
          <div 
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 shadow-lg transition-transform hover:scale-105"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span className="select-none text-base font-bold italic text-white">Ai</span>
          </div>

          {showMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-2 mb-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
                  <Home size={16} className="text-gray-500" />
                  <span>返回首页</span>
                </button>
              </div>

              <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between group">
                <span className="text-sm font-bold text-gray-900 truncate">{projectName}</span>
                <Pencil size={14} className="text-gray-400 group-hover:text-purple-600 cursor-pointer" onClick={() => { setIsEditing(true); setShowMenu(false); }} />
              </div>

              <div className="py-1 border-b border-gray-50">
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <span>创建</span>
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <span>创建副本</span>
                </button>
              </div>

              <div className="py-1 border-b border-gray-50">
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span>撤销</span>
                  </div>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">⌘Z</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span>重做</span>
                  </div>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">⇧⌘Z</span>
                </button>
              </div>

              <div className="py-1">
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <span>保存</span>
                  <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-400">所有更改已保存</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <span>前往我的作品</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-gray-200" />
        
        <div className="group relative flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={projectName}
              onChange={() => {}}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="w-32 rounded bg-gray-50 px-2 py-1 text-[13px] font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-purple-200"
              readOnly
            />
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer group/name"
              onClick={() => setIsEditing(true)}
            >
              <h1 className="text-[13px] font-semibold text-gray-800 transition-colors group-hover/name:text-purple-600">
                {projectName}
              </h1>
              <Pencil 
                size={12} 
                className="text-gray-300 opacity-0 group-hover/name:opacity-100 transition-all" 
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-blue-600">{credits}</span>
            <span className="text-[10px] text-gray-400">积分</span>
          </div>
          <button className="flex items-center gap-1 bg-[#fff8e6] px-2.5 py-1 text-[11px] font-bold text-[#d4a017] rounded-full border border-[#ffe599] transition-all hover:bg-[#fff2cc]">
            <Crown size={13} fill="currentColor" />
            <span>会员</span>
          </button>
        </div>
        
        <div className="relative">
          <button
            onClick={onExportClick}
            className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-[11px] font-bold text-white shadow-lg transition-all hover:bg-gray-800"
          >
            <Download size={13} />
            导出
          </button>
          {exportDropdown}
        </div>
      </div>
    </div>
  );
};
