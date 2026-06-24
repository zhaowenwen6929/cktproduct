import React, { useRef } from 'react';
import { Image as ImageIcon, Video as VideoIcon, Sparkles, Type } from 'lucide-react';

interface UploadMenuProps {
  onUpload: (file: File, type: 'image' | 'video') => void;
  onAddGenerator: (generatorType: 'image' | 'video' | 'text') => void;
  onClose: () => void;
}

export const UploadMenu: React.FC<UploadMenuProps> = ({ onUpload, onAddGenerator, onClose }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, type);
      onClose();
    }
  };

  return (
    <div className="absolute left-full ml-4 top-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-[180px] z-50">
      <button
        onClick={() => {
          onAddGenerator('image');
          onClose();
        }}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all group"
      >
        <div className="text-purple-400 group-hover:text-purple-600">
          <Sparkles size={18} strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
          图片生成器
        </span>
      </button>

      <button
        onClick={() => {
          onAddGenerator('video');
          onClose();
        }}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-all group"
      >
        <div className="text-violet-400 group-hover:text-violet-600">
          <VideoIcon size={18} strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-violet-600">
          视频生成器
        </span>
      </button>

      <button
        onClick={() => {
          onAddGenerator('text');
          onClose();
        }}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50 transition-all group"
      >
        <div className="text-sky-400 group-hover:text-sky-600">
          <Type size={18} strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-sky-600">
          文本生成器
        </span>
      </button>

      <button
        onClick={() => imageInputRef.current?.click()}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
      >
        <div className="text-gray-400 group-hover:text-black">
          <ImageIcon size={18} strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-black">
          上传图片
        </span>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'image')}
        />
      </button>

      <button
        onClick={() => videoInputRef.current?.click()}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
      >
        <div className="text-gray-400 group-hover:text-black">
          <VideoIcon size={18} strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-black">
          上传视频
        </span>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'video')}
        />
      </button>
    </div>
  );
};
