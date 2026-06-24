import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ExportMode = 'source' | 'snapshot';
export type ExportFormat = 'png' | 'jpg';
export type ExportScale = 0.5 | 1 | 1.5 | 2 | 2.5 | 3;
export type ImageExportFormat = 'png' | 'jpg';
export type VideoExportFormat = 'mp4' | 'frame-png' | 'frame-jpg';

export interface ExportItem {
  id: string;
  type: 'image' | 'text' | 'shape' | 'frame' | 'video' | 'group' | 'image-generator';
  name: string;
  width: number;
  height: number;
  thumbnail?: string;
  source?: string;
}

export type ExportSubmitPayload =
  | { mode: 'source'; imageFormat: ImageExportFormat; videoFormat: VideoExportFormat; itemIds: string[] }
  | { mode: 'snapshot'; format: ExportFormat; scale: ExportScale; itemIds: string[] };

interface ExportDialogProps {
  open: boolean;
  projectName: string;
  items: ExportItem[];
  selectedIds: string[];
  defaultFormat?: ExportFormat;
  defaultScale?: ExportScale;
  onClose: () => void;
  onSubmit: (payload: ExportSubmitPayload) => void;
}

const formatOptions: Array<{
  value: ExportFormat;
  label: string;
  description: string;
}> = [
  { value: 'png', label: 'PNG', description: '文件体积大，适合透明背景或复杂图片' },
  { value: 'jpg', label: 'JPG', description: '文件体积小，适合分享传播' },
];

const scaleOptions: Array<{ value: ExportScale; label: string }> = [
  { value: 1, label: '原尺寸' },
  { value: 0.5, label: '0.5倍' },
  { value: 1.5, label: '1.5倍' },
  { value: 2, label: '2倍' },
  { value: 2.5, label: '2.5倍' },
  { value: 3, label: '3倍' },
];

const modeOptions: Array<{
  value: ExportMode;
  label: string;
  description: string;
}> = [
  { value: 'source', label: '直接导出', description: '将已选内容逐一导出；选中多个时自动打包下载' },
  { value: 'snapshot', label: '合并导出', description: '将已选内容合为单图片导出，视频仅取首帧' },
];

const imageFormatOptions: Array<{ value: ImageExportFormat; label: string }> = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
];

const videoFormatOptions: Array<{ value: VideoExportFormat; label: string }> = [
  { value: 'mp4', label: 'MP4' },
  { value: 'frame-png', label: '首帧 PNG' },
  { value: 'frame-jpg', label: '首帧 JPG' },
];

const imageFormatDescriptions: Record<ImageExportFormat, string> = {
  png: '文件体积大，适合透明背景或复杂图片',
  jpg: '文件体积小，适合分享传播',
};

const videoFormatDescriptions: Record<VideoExportFormat, string> = {
  mp4: '保留视频文件，适合直接播放与传播',
  'frame-png': '导出视频首帧为 PNG，适合保留清晰细节',
  'frame-jpg': '导出视频首帧为 JPG，适合轻量分享',
};

const Dropdown = <T extends string | number>({
  value,
  options,
  onChange,
  renderOption,
}: {
  value: T;
  options: Array<{ value: T; label: string; description?: string }>;
  onChange: (value: T) => void;
  renderOption?: (option: { value: T; label: string; description?: string }, selected: boolean) => React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-[#d7dcef] bg-white px-4 text-left text-[15px] text-gray-800 transition-colors hover:border-[#b9c4ec]"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={16} className={cn('text-[#8792b0] transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[#eef1fb] bg-white p-2 shadow-[0_18px_40px_rgba(24,39,75,0.12)]">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-start justify-between rounded-xl px-3 py-2.5 text-left transition-colors',
                  selected ? 'bg-[#f2f4ff]' : 'hover:bg-gray-50'
                )}
              >
                {renderOption ? renderOption(option, selected) : <span className="text-[15px] text-gray-800">{option.label}</span>}
                {selected && <Check size={16} className="mt-0.5 text-[#5c5cfc]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MediaFormatDropdown = ({
  imageFormat,
  videoFormat,
  showImage,
  showVideo,
  onImageFormatChange,
  onVideoFormatChange,
}: {
  imageFormat: ImageExportFormat;
  videoFormat: VideoExportFormat;
  showImage: boolean;
  showVideo: boolean;
  onImageFormatChange: (value: ImageExportFormat) => void;
  onVideoFormatChange: (value: VideoExportFormat) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const summary = [
    showImage ? `图片：${imageFormat.toUpperCase()}` : null,
    showVideo ? `视频：${videoFormatOptions.find((option) => option.value === videoFormat)?.label ?? 'MP4'}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const renderRow = <T extends string>({
    title,
    value,
    options,
    onChange,
    description,
  }: {
    title: string;
    value: T;
    options: Array<{ value: T; label: string }>;
    onChange: (value: T) => void;
    description: string;
  }) => (
    <div className="space-y-2">
      <div className="text-xs font-medium text-[#7f8aa8]">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[13px] transition-colors',
                selected
                  ? 'border-[#5c5cfc] bg-[#f2f4ff] text-[#5c5cfc]'
                  : 'border-[#d7dcef] bg-white text-gray-700 hover:border-[#b9c4ec]'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="text-xs leading-5 text-[#95a0bc]">{description}</div>
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#d7dcef] bg-white px-4 py-2 text-left text-[14px] text-gray-800 transition-colors hover:border-[#b9c4ec]"
      >
        <span className="pr-3 leading-5">{summary || '图片：PNG | 视频：MP4'}</span>
        <ChevronDown size={16} className={cn('shrink-0 text-[#8792b0] transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-2xl border border-[#eef1fb] bg-white p-3 shadow-[0_18px_40px_rgba(24,39,75,0.12)]">
          <div className="space-y-3">
            {showImage &&
              renderRow({
                title: '图片',
                value: imageFormat,
                options: imageFormatOptions,
                onChange: onImageFormatChange,
                description: imageFormatDescriptions[imageFormat],
              })}
            {showVideo &&
              renderRow({
                title: '视频',
                value: videoFormat,
                options: videoFormatOptions,
                onChange: onVideoFormatChange,
                description: videoFormatDescriptions[videoFormat],
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  projectName,
  items,
  selectedIds,
  defaultFormat = 'png',
  defaultScale = 1,
  onClose,
  onSubmit,
}) => {
  const [mode, setMode] = useState<ExportMode>('source');
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const [scale, setScale] = useState<ExportScale>(defaultScale);
  const [imageFormat, setImageFormat] = useState<ImageExportFormat>('png');
  const [videoFormat, setVideoFormat] = useState<VideoExportFormat>('mp4');
  const [checkedIds, setCheckedIds] = useState<string[]>(selectedIds);
  const [showRangePanel, setShowRangePanel] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setMode('source');
    setFormat(defaultFormat);
    setScale(defaultScale);
    setImageFormat('png');
    setVideoFormat('mp4');
    setCheckedIds(selectedIds);
    setShowRangePanel(false);
  }, [defaultFormat, defaultScale, open, selectedIds]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  useEffect(() => {
    if (!showRangePanel) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) {
        setShowRangePanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRangePanel]);

  const checkedSet = useMemo(() => new Set(checkedIds), [checkedIds]);
  const selectedCount = checkedIds.length;
  const allChecked = items.length > 0 && selectedCount === items.length;
  const selectedItems = items.filter((item) => checkedSet.has(item.id));
  const hasSelectedVideo = selectedItems.some((item) => item.type === 'video');
  const hasSelectedImageLike = selectedItems.some((item) => item.type !== 'video');

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className="absolute right-0 top-full z-[140] mt-3 w-[380px] rounded-[20px] border border-[#eef1fb] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)]"
    >
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <h2 className="text-[28px] font-semibold tracking-tight text-gray-900">导出作品</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[#8792b0] transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 pb-3">
          <div className="space-y-2">
            <div className="text-[14px] font-medium text-gray-800">导出方式</div>
            <Dropdown
              value={mode}
              options={modeOptions}
              onChange={(nextMode) => setMode(nextMode as ExportMode)}
              renderOption={(option) => (
                <div>
                  <div className="text-[15px] text-gray-900">{option.label}</div>
                  <div className="mt-1 text-xs leading-5 text-[#95a0bc]">{option.description}</div>
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="text-[14px] font-medium text-gray-800">
              {'导出格式'}
            </div>
            {mode === 'snapshot' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <Dropdown
                    value={format}
                    options={formatOptions}
                    onChange={setFormat}
                    renderOption={(option) => (
                      <div>
                        <div className="text-[15px] text-gray-900">{option.label}</div>
                        {option.description && <div className="mt-1 text-xs leading-5 text-[#95a0bc]">{option.description}</div>}
                      </div>
                    )}
                  />
                  <Dropdown value={scale} options={scaleOptions} onChange={setScale} />
                </div>
                <div className="text-xs leading-5 text-[#95a0bc]">
                  {formatOptions.find((option) => option.value === format)?.description}
                </div>
                {hasSelectedVideo && (
                  <div className="rounded-xl bg-[#f7f8fc] px-3 py-2 text-xs leading-5 text-[#7f8aa8]">
                    合并导出时，选中的视频将以当前首帧参与合成并输出为单张图片。
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <MediaFormatDropdown
                  imageFormat={imageFormat}
                  videoFormat={videoFormat}
                  showImage={hasSelectedImageLike}
                  showVideo={hasSelectedVideo}
                  onImageFormatChange={setImageFormat}
                  onVideoFormatChange={setVideoFormat}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[14px] font-medium text-gray-800">导出范围</div>
            <div className="relative" ref={rangeRef}>
              <button
                type="button"
                onClick={() => setShowRangePanel((prev) => !prev)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-[#d7dcef] bg-white px-4 text-left text-[15px] text-gray-800 transition-colors hover:border-[#b9c4ec]"
              >
                <span>已选内容 {selectedCount}/{items.length}</span>
                <ChevronDown size={16} className={cn('text-[#8792b0] transition-transform', showRangePanel && 'rotate-180')} />
              </button>

              {showRangePanel && (
                <div className="absolute left-0 top-full z-30 mt-2 w-full max-h-[min(420px,calc(100vh-180px))] overflow-hidden rounded-[18px] border border-[#eef1fb] bg-white shadow-[0_18px_40px_rgba(24,39,75,0.12)]">
                  <div className="flex items-center justify-between px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-2 text-[15px] text-gray-900">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#b8c1e4] accent-[#5c5cfc]"
                        checked={allChecked}
                        onChange={() => setCheckedIds(allChecked ? [] : items.map((item) => item.id))}
                      />
                      <span>全部内容</span>
                    </label>
                    <span className="rounded-lg bg-[#f5f7ff] px-3 py-1 text-xs font-medium text-[#7f8aa8]">
                      {projectName}
                    </span>
                  </div>

                  <div className="max-h-[320px] space-y-1 overflow-y-auto px-2 pb-2">
                    {items.map((item, index) => {
                      const checked = checkedSet.has(item.id);
                      return (
                        <label
                          key={item.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 transition-colors',
                            checked ? 'bg-[#f2f4ff]' : 'hover:bg-gray-50'
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#b8c1e4] accent-[#5c5cfc]"
                            checked={checked}
                            onChange={() => {
                              setCheckedIds((prev) =>
                                checked ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                              );
                            }}
                          />

                          <div className="h-14 w-[72px] shrink-0 overflow-hidden rounded-xl border border-[#e4e8f5] bg-[#f7f8fc]">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-[#98a2bd]">
                                无预览
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-[15px] font-medium text-gray-900">
                              {index + 1}.{item.name}
                            </div>
                            <div className="mt-1 text-sm text-[#95a0bc]">
                              {Math.round(item.width)}x{Math.round(item.height)} px
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#f0f2fa] p-3">
                    <button
                      type="button"
                      onClick={() => setShowRangePanel(false)}
                      className="h-12 w-full rounded-2xl bg-[#5c5cfc] text-[16px] font-medium text-white transition-colors hover:bg-[#4f4ff0]"
                    >
                      完成
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-4 pt-2">
          <button
            type="button"
            disabled={checkedIds.length === 0}
            onClick={() =>
              mode === 'snapshot'
                ? onSubmit({ mode, format, scale, itemIds: checkedIds })
                : onSubmit({ mode, imageFormat, videoFormat, itemIds: checkedIds })
            }
            className={cn(
              'h-12 w-full rounded-2xl text-[16px] font-medium text-white transition-colors',
              checkedIds.length === 0 ? 'cursor-not-allowed bg-[#c9cdfa]' : 'bg-[#5c5cfc] hover:bg-[#4f4ff0]'
            )}
          >
            {mode === 'snapshot' ? '下载' : '开始下载'}
          </button>
          <div className="mt-3 text-xs text-[#98a2bd]">
            下载即视为您已阅读并同意
            <button type="button" className="ml-1 text-[#5c5cfc]">
              《会员授权许可协议》
            </button>
          </div>
        </div>
    </div>
  );
};
