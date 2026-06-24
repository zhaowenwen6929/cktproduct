import React from 'react';
import { Upload, Search, Folder, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResourceMenuProps {
  onAddImage: (url: string) => void;
  onClose: () => void;
}

const FOLDERS = [
  { id: '1', name: '新建看看' },
  { id: '2', name: '你好北京你...' },
  { id: '3', name: '333(2)' },
];

const ASSETS = [
  { id: 'a1', url: 'https://picsum.photos/seed/poster1/400/600', aspect: 'portrait' },
  { id: 'a2', url: 'https://picsum.photos/seed/arch1/400/300', aspect: 'landscape' },
  { id: 'a3', url: 'https://picsum.photos/seed/qr1/200/200', aspect: 'square' },
  { id: 'a4', url: 'https://picsum.photos/seed/logo1/400/150', aspect: 'banner' },
];

export const ResourceMenu: React.FC<ResourceMenuProps> = ({ onAddImage, onClose }) => {
  return (
    <div className="absolute left-full ml-4 top-[-200px] bg-white rounded-2xl shadow-2xl border border-gray-100 w-[360px] max-h-[80vh] flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">资源库</h3>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <Upload size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="资源搜索"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-300 transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <button className="text-sm font-bold text-black border-b-2 border-black pb-1">图片</button>
            <button className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">视频</button>
          </div>
          <button className="text-gray-400 hover:text-black transition-colors">
            <Folder size={18} />
          </button>
        </div>

        {/* Folders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-800">文件夹 <span className="text-gray-400 font-normal">6</span></span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {FOLDERS.map((folder) => (
              <div key={folder.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full aspect-square bg-yellow-50 rounded-xl flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                  <Folder size={32} className="text-yellow-400 fill-yellow-400" />
                </div>
                <span className="text-[10px] text-gray-500 truncate w-full text-center">{folder.name}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
            <span>展开</span>
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Assets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-800">资源 <span className="text-gray-400 font-normal">144</span></span>
          </div>
          <div className="space-y-3">
            {ASSETS.map((asset) => (
              <div 
                key={asset.id} 
                className={cn(
                  "relative rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all",
                  asset.aspect === 'portrait' ? "aspect-[2/3]" : 
                  asset.aspect === 'landscape' ? "aspect-[4/3]" : 
                  asset.aspect === 'banner' ? "aspect-[3/1]" : "aspect-square"
                )}
                onClick={() => onAddImage(asset.url)}
              >
                <img src={asset.url} alt="Asset" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Brand Footer */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">创</span>
          </div>
          <span className="text-sm font-bold text-gray-800 tracking-tighter">创客贴</span>
        </div>
      </div>
    </div>
  );
};
