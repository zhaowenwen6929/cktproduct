import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Upload, FolderOpen, ChevronDown, ChevronUp, Play, Music, UserRound, Image as ImageIcon, Clapperboard, Check, X, MoreHorizontal, CircleHelp } from 'lucide-react';
import { cn } from '../lib/utils';

type ResourceTab = 'image' | 'video' | 'audio' | 'model';
type VideoGenerateMode = 'text' | 'frames' | 'reference';
type ReferenceSlotKind = 'image' | 'video' | 'audio';

interface ResourceLibraryDialogProps {
  open: boolean;
  onClose: () => void;
  initialTab?: ResourceTab;
  selectionMode?: 'multi' | 'single';
  confirmLabel?: string;
  seedanceDetectionMode?: boolean;
  onConfirmAssets: (assets: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    name: string;
    displayTypeLabel?: string;
  }>) => void;
}

type FolderItem = {
  id: string;
  name: string;
};

type ImageAsset = {
  id: string;
  kind: 'image' | 'model';
  name: string;
  url: string;
  aspectClass: string;
  seedanceStatus: 'untested' | 'passed' | 'failed' | 'pending';
  isUploaded?: boolean;
};

type VideoAsset = {
  id: string;
  kind: 'video';
  name: string;
  url: string;
  cover: string;
};

type AudioAsset = {
  id: string;
  kind: 'audio';
  name: string;
  url: string;
  duration: string;
  accent: string;
};

type SelectedAsset = {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  displayTypeLabel?: string;
};

type ReferenceSlotConfig = {
  id: string;
  label: string;
  kind: ReferenceSlotKind;
};

const FOLDERS: FolderItem[] = [
  { id: 'folder-1', name: '新建看看' },
  { id: 'folder-2', name: '你好北京你...' },
  { id: 'folder-3', name: '333(2)' },
  { id: 'folder-4', name: '品牌素材' },
  { id: 'folder-5', name: '秋季上新' },
  { id: 'folder-6', name: '模特合集' },
];

const IMAGE_ASSETS: ImageAsset[] = [
  { id: 'image-1', kind: 'image', name: '轻纱戒指', url: 'https://picsum.photos/seed/resource-image-1/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'passed' },
  { id: 'image-2', kind: 'image', name: '旅行箱', url: 'https://picsum.photos/seed/resource-image-2/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'untested' },
  { id: 'image-3', kind: 'image', name: '灯笼', url: 'https://picsum.photos/seed/resource-image-3/720/720', aspectClass: 'aspect-square', seedanceStatus: 'untested' },
  { id: 'image-4', kind: 'image', name: '女装半身', url: 'https://picsum.photos/seed/resource-image-4/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'passed' },
  { id: 'image-5', kind: 'image', name: '沙发场景', url: 'https://picsum.photos/seed/resource-image-5/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'untested' },
  { id: 'image-6', kind: 'image', name: '印花T恤', url: 'https://picsum.photos/seed/resource-image-6/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'untested' },
  { id: 'image-7', kind: 'image', name: '模特站姿', url: 'https://picsum.photos/seed/resource-image-7/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'passed' },
  { id: 'image-8', kind: 'image', name: '浅绿连衣裙', url: 'https://picsum.photos/seed/resource-image-8/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'untested' },
];

const VIDEO_ASSETS: VideoAsset[] = [
  { id: 'video-1', kind: 'video', name: '氛围展示视频', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', cover: 'https://picsum.photos/seed/resource-video-1/720/960' },
  { id: 'video-2', kind: 'video', name: '产品旋转视频', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', cover: 'https://picsum.photos/seed/resource-video-2/720/960' },
  { id: 'video-3', kind: 'video', name: '穿搭走秀视频', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', cover: 'https://picsum.photos/seed/resource-video-3/720/960' },
  { id: 'video-4', kind: 'video', name: '空间氛围视频', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', cover: 'https://picsum.photos/seed/resource-video-4/720/960' },
];

const AUDIO_ASSETS: AudioAsset[] = [
  { id: 'audio-1', kind: 'audio', name: '城市氛围', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3', duration: '00:18', accent: 'from-[#f7b36f] to-[#f4d287]' },
  { id: 'audio-2', kind: 'audio', name: '轻快节奏', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3', duration: '00:24', accent: 'from-[#79b3ff] to-[#c6dbff]' },
  { id: 'audio-3', kind: 'audio', name: '柔和旁白', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3', duration: '00:12', accent: 'from-[#84d4bd] to-[#d8f5eb]' },
  { id: 'audio-4', kind: 'audio', name: '电商提示音', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3', duration: '00:08', accent: 'from-[#cab3ff] to-[#ece3ff]' },
];

const MODEL_ASSETS: ImageAsset[] = [
  { id: 'model-1', kind: 'model', name: '通勤女模', url: 'https://picsum.photos/seed/resource-model-1/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'passed' },
  { id: 'model-2', kind: 'model', name: '潮流男模', url: 'https://picsum.photos/seed/resource-model-2/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'untested' },
  { id: 'model-3', kind: 'model', name: '站姿女模', url: 'https://picsum.photos/seed/resource-model-3/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'passed' },
  { id: 'model-4', kind: 'model', name: '半身男模', url: 'https://picsum.photos/seed/resource-model-4/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'untested' },
  { id: 'model-5', kind: 'model', name: '童模正面', url: 'https://picsum.photos/seed/resource-model-5/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'untested' },
  { id: 'model-6', kind: 'model', name: '姿态模特', url: 'https://picsum.photos/seed/resource-model-6/720/960', aspectClass: 'aspect-[3/4]', seedanceStatus: 'passed' },
];

const TABS: Array<{ id: ResourceTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { id: 'image', label: '图像', icon: ImageIcon },
  { id: 'video', label: '视频', icon: Clapperboard },
  { id: 'audio', label: '音频', icon: Music },
  { id: 'model', label: '模特', icon: UserRound },
];

const VIDEO_MODE_OPTIONS: Array<{ id: VideoGenerateMode; label: string }> = [
  { id: 'text', label: '文生视频' },
  { id: 'frames', label: '首尾帧' },
  { id: 'reference', label: '全能参考' },
];

const FRAME_SLOT_CONFIGS: ReferenceSlotConfig[] = [
  { id: 'frame-start', label: '首帧图', kind: 'image' },
  { id: 'frame-end', label: '尾帧图', kind: 'image' },
];

const REFERENCE_SLOT_CONFIGS: ReferenceSlotConfig[] = [
  { id: 'ref-image', label: '图片', kind: 'image' },
  { id: 'ref-video', label: '视频', kind: 'video' },
  { id: 'ref-audio', label: '音频', kind: 'audio' },
];

export const ResourceLibraryDialog: React.FC<ResourceLibraryDialogProps> = ({
  open,
  onClose,
  onConfirmAssets,
  initialTab,
  selectionMode = 'multi',
  confirmLabel,
  seedanceDetectionMode = false,
}) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const uploadedBlobUrlsRef = useRef<string[]>([]);
  const detectTimersRef = useRef<number[]>([]);
  const [activeTab, setActiveTab] = useState<ResourceTab>('image');
  const [showVideoModeMenu, setShowVideoModeMenu] = useState(false);
  const [videoMode, setVideoMode] = useState<VideoGenerateMode>('text');
  const [keyword, setKeyword] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [seedanceOnly, setSeedanceOnly] = useState(false);
  const [showSeedanceGuide, setShowSeedanceGuide] = useState(false);
  const [assetMenuId, setAssetMenuId] = useState<string | null>(null);
  const [seedanceTip, setSeedanceTip] = useState<string | null>(null);
  const [pendingReferenceSlotId, setPendingReferenceSlotId] = useState<string | null>(null);
  const [referenceSlots, setReferenceSlots] = useState<Record<string, SelectedAsset | null>>({
    'frame-start': null,
    'frame-end': null,
    'ref-image': null,
    'ref-video': null,
    'ref-audio': null,
  });
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [imageAssets, setImageAssets] = useState<ImageAsset[]>(IMAGE_ASSETS);
  const [videoAssets, setVideoAssets] = useState<VideoAsset[]>(VIDEO_ASSETS);
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>(AUDIO_ASSETS);
  const [modelAssets, setModelAssets] = useState<ImageAsset[]>(MODEL_ASSETS);

  useEffect(() => {
    return () => {
      uploadedBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      detectTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (open && initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, open]);

  useEffect(() => {
    if (activeTab !== 'video') {
      setShowVideoModeMenu(false);
      setPendingReferenceSlotId(null);
    }
  }, [activeTab]);

  useEffect(() => {
    setAssetMenuId(null);
    setShowSeedanceGuide(false);
    if (activeTab !== 'image' && activeTab !== 'model') {
      setSeedanceOnly(false);
    }
  }, [activeTab]);

  const filteredFolders = useMemo(() => (showAllFolders ? FOLDERS : FOLDERS.slice(0, 3)), [showAllFolders]);
  const filteredImageAssets = useMemo(
    () => imageAssets.filter((item) => item.name.toLowerCase().includes(keyword.trim().toLowerCase()) && (!seedanceOnly || item.seedanceStatus === 'passed')),
    [imageAssets, keyword, seedanceOnly],
  );
  const filteredVideoAssets = useMemo(() => videoAssets.filter((item) => item.name.toLowerCase().includes(keyword.trim().toLowerCase())), [videoAssets, keyword]);
  const filteredAudioAssets = useMemo(() => audioAssets.filter((item) => item.name.toLowerCase().includes(keyword.trim().toLowerCase())), [audioAssets, keyword]);
  const filteredModelAssets = useMemo(
    () => modelAssets.filter((item) => item.name.toLowerCase().includes(keyword.trim().toLowerCase()) && (!seedanceOnly || item.seedanceStatus === 'passed')),
    [modelAssets, keyword, seedanceOnly],
  );

  const activeReferenceConfigs = videoMode === 'frames' ? FRAME_SLOT_CONFIGS : videoMode === 'reference' ? REFERENCE_SLOT_CONFIGS : [];

  const getSlotKindById = (slotId: string): ReferenceSlotKind | null =>
    [...FRAME_SLOT_CONFIGS, ...REFERENCE_SLOT_CONFIGS].find((slot) => slot.id === slotId)?.kind ?? null;

  const pendingSlotKind = pendingReferenceSlotId ? getSlotKindById(pendingReferenceSlotId) : null;
  const currentUploadAccept = pendingSlotKind
    ? pendingSlotKind === 'audio'
      ? 'audio/*'
      : pendingSlotKind === 'video'
        ? 'video/*'
        : 'image/*'
    : activeTab === 'video'
      ? 'video/*'
      : activeTab === 'audio'
        ? 'audio/*'
        : 'image/*';

  const addSelectedAssetUnique = (asset: SelectedAsset) => {
    setSelectedAssets((prev) => (prev.some((item) => item.id === asset.id) ? prev : [...prev, asset]));
  };

  const clearReferenceSlotsByAssetId = (assetId: string) => {
    setReferenceSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((slotId) => {
        if (next[slotId]?.id === assetId) {
          next[slotId] = null;
        }
      });
      return next;
    });
  };

  const resolveSeedanceStatus = (name: string) => {
    const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return hash % 3 === 0 ? 'failed' : 'passed';
  };

  const startSeedanceDetection = (
    tab: 'image' | 'model',
    assetId: string,
    assetName: string,
    onPassed?: () => void,
    onFailed?: () => void,
  ) => {
    const updateList = tab === 'model' ? setModelAssets : setImageAssets;
    updateList((prev) => prev.map((item) => (item.id === assetId ? { ...item, seedanceStatus: 'pending' } : item)));
    clearReferenceSlotsByAssetId(assetId);
    setSelectedAssets((prev) => prev.filter((item) => item.id !== assetId));
    setAssetMenuId(null);
    setSeedanceTip(null);

    const timer = window.setTimeout(() => {
      const result = resolveSeedanceStatus(assetName);
      updateList((prev) => prev.map((item) => (item.id === assetId ? { ...item, seedanceStatus: result } : item)));
      if (result === 'passed') {
        onPassed?.();
      } else {
        setSeedanceTip('未通过Seedance检测，请更换其他资源');
        onFailed?.();
      }
    }, 1600);

    detectTimersRef.current.push(timer);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (pendingReferenceSlotId) {
      const slotKind = getSlotKindById(pendingReferenceSlotId);
      const file = files[0];
      if (!slotKind || !file) {
        event.target.value = '';
        return;
      }

      const url = URL.createObjectURL(file);
      uploadedBlobUrlsRef.current.push(url);
      const asset: SelectedAsset = {
        id: `${pendingReferenceSlotId}-${Date.now()}`,
        type: slotKind,
        url,
        name: file.name.replace(/\.[^.]+$/, ''),
        displayTypeLabel: slotKind === 'image' ? '图片' : slotKind === 'video' ? '视频' : '音频',
      };
      setReferenceSlots((prev) => ({ ...prev, [pendingReferenceSlotId]: asset }));
      addSelectedAssetUnique(asset);
      setPendingReferenceSlotId(null);
      event.target.value = '';
      return;
    }

    if (activeTab === 'video') {
      const nextAssets = files.map((file, index) => {
        const url = URL.createObjectURL(file);
        uploadedBlobUrlsRef.current.push(url);
        return { id: `video-upload-${Date.now()}-${index}`, kind: 'video' as const, name: file.name.replace(/\.[^.]+$/, ''), url, cover: url };
      });
      setVideoAssets((prev) => [...nextAssets, ...prev]);
    } else if (activeTab === 'audio') {
      const nextAssets = files.map((file, index) => {
        const url = URL.createObjectURL(file);
        uploadedBlobUrlsRef.current.push(url);
        return { id: `audio-upload-${Date.now()}-${index}`, kind: 'audio' as const, name: file.name.replace(/\.[^.]+$/, ''), url, duration: '本地上传', accent: 'from-[#b4c7ff] to-[#e1e9ff]' };
      });
      setAudioAssets((prev) => [...nextAssets, ...prev]);
    } else {
      const nextAssets = files.map((file, index) => {
        const url = URL.createObjectURL(file);
        uploadedBlobUrlsRef.current.push(url);
        return {
          id: `${activeTab}-upload-${Date.now()}-${index}`,
          kind: (activeTab === 'model' ? 'model' : 'image') as 'image' | 'model',
          name: file.name.replace(/\.[^.]+$/, ''),
          url,
          aspectClass: 'aspect-[3/4]',
          seedanceStatus: 'pending' as const,
          isUploaded: true,
        };
      });
      if (activeTab === 'model') {
        setModelAssets((prev) => [...nextAssets, ...prev]);
        nextAssets.forEach((asset) => startSeedanceDetection('model', asset.id, asset.name));
      } else {
        setImageAssets((prev) => [...nextAssets, ...prev]);
        nextAssets.forEach((asset) => startSeedanceDetection('image', asset.id, asset.name));
      }
    }

    event.target.value = '';
  };

  const mapAssetToSelection = (asset: ImageAsset | VideoAsset | AudioAsset): SelectedAsset => {
    if (asset.kind === 'video') {
      return { id: asset.id, type: 'video', url: asset.url, name: asset.name, displayTypeLabel: '视频' };
    }
    if (asset.kind === 'audio') {
      return { id: asset.id, type: 'audio', url: asset.url, name: asset.name, displayTypeLabel: '音频' };
    }
    return { id: asset.id, type: 'image', url: asset.url, name: asset.name, displayTypeLabel: asset.kind === 'model' ? '模特' : '图片' };
  };

  const applyAssetSelection = (asset: ImageAsset | VideoAsset | AudioAsset) => {
    const next = mapAssetToSelection(asset);
    if (pendingReferenceSlotId) {
      const slotKind = getSlotKindById(pendingReferenceSlotId);
      if (slotKind === next.type) {
        setReferenceSlots((prev) => ({ ...prev, [pendingReferenceSlotId]: next }));
        addSelectedAssetUnique(next);
      }
      setPendingReferenceSlotId(null);
      return;
    }

    const exists = selectedAssets.some((item) => item.id === next.id);
    setSelectedAssets((prev) => (exists ? prev.filter((item) => item.id !== next.id) : [...prev, next]));
    if (exists) {
      clearReferenceSlotsByAssetId(next.id);
    }
  };

  const toggleSelect = (asset: ImageAsset | VideoAsset | AudioAsset) => {
    if (asset.kind === 'image' || asset.kind === 'model') {
      if (asset.seedanceStatus === 'pending' || asset.seedanceStatus === 'failed') return;
      if (seedanceDetectionMode && asset.seedanceStatus === 'untested') {
        startSeedanceDetection(
          asset.kind === 'model' ? 'model' : 'image',
          asset.id,
          asset.name,
          () => applyAssetSelection({ ...asset, seedanceStatus: 'passed' }),
        );
        return;
      }
    }
    applyAssetSelection(asset);
  };

  const removeSelectedAsset = (assetId: string) => {
    setSelectedAssets((prev) => prev.filter((item) => item.id !== assetId));
    clearReferenceSlotsByAssetId(assetId);
  };

  const confirmSelection = () => {
    if (selectedAssets.length === 0) return;
    onConfirmAssets(selectedAssets.map(({ type, url, name, displayTypeLabel }) => ({ type, url, name, displayTypeLabel })));
    setSelectedAssets([]);
    setKeyword('');
    setShowSearchInput(false);
    setShowAllFolders(false);
    onClose();
  };

  const resourceCount = activeTab === 'image' ? filteredImageAssets.length : activeTab === 'video' ? filteredVideoAssets.length : activeTab === 'audio' ? filteredAudioAssets.length : filteredModelAssets.length;

  const isSelected = (assetId: string) => selectedAssets.some((item) => item.id === assetId);
  const isSeedanceFilterVisible = activeTab === 'image' || activeTab === 'model';

  const getSeedanceStatusMeta = (status: ImageAsset['seedanceStatus']) => {
    if (status === 'passed') return { label: 'Seedance可用', className: 'bg-[#e9fff3] text-[#177245]' };
    if (status === 'pending') return { label: '检测中', className: 'bg-[#eef2ff] text-[#4f5bd5]' };
    return null;
  };

  const renderSeedanceBadge = () => (
    <div className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-white shadow-sm ring-1 ring-[#dbe7ff]">
      <div className="flex items-end gap-[2px]">
        <span className="h-2.5 w-[2px] rounded-full bg-[#111827]" />
        <span className="h-1.5 w-[2px] rounded-full bg-[#111827]" />
        <span className="h-3.5 w-[2px] rounded-full bg-[#111827]" />
      </div>
    </div>
  );

  const isAssetDisabled = (asset: ImageAsset) =>
    asset.seedanceStatus === 'pending' || asset.seedanceStatus === 'failed';

  const openReferenceLocalUpload = (slotId: string) => {
    setPendingReferenceSlotId(slotId);
    uploadInputRef.current?.click();
  };

  const armReferenceLibrarySelect = (slotId: string) => {
    setPendingReferenceSlotId(slotId);
  };

  const renderReferenceSlot = (slot: ReferenceSlotConfig) => {
    const assigned = referenceSlots[slot.id];
    const armed = pendingReferenceSlotId === slot.id;

    return (
      <div
        key={slot.id}
        className={cn(
          'rounded-[18px] border bg-white p-3 transition-all',
          armed ? 'border-[#111827] ring-2 ring-[#111827]/15' : 'border-[#e4e9f2]'
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[12px] font-medium text-gray-800">{slot.label}</div>
          {assigned && (
            <button
              type="button"
              onClick={() => {
                clearReferenceSlotsByAssetId(assigned.id);
                setSelectedAssets((prev) => prev.filter((item) => item.id !== assigned.id));
              }}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={11} />
            </button>
          )}
        </div>
        <div className="overflow-hidden rounded-[14px] border border-[#eef2f7] bg-[#f7f9fc]">
          <div className="flex aspect-[1.15] items-center justify-center overflow-hidden">
            {assigned ? (
              assigned.type === 'audio' ? (
                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#eef2ff_0%,#f8faff_100%)]">
                  <Music size={22} className="text-[#5c5cfc]" />
                </div>
              ) : assigned.type === 'video' ? (
                <video src={assigned.url} className="h-full w-full object-cover" muted playsInline autoPlay loop />
              ) : (
                <img src={assigned.url} alt={assigned.name} className="h-full w-full object-cover" />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#93a1b8]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Upload size={16} />
                </div>
                <div className="text-[11px]">{armed ? '请从下方资源选择' : `添加${slot.label}`}</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-[#eef2f7] bg-[#eef2f7]">
            <button
              type="button"
              onClick={() => openReferenceLocalUpload(slot.id)}
              className="bg-white px-3 py-2 text-[11px] font-medium text-[#5b6780] hover:bg-[#f8fafe]"
            >
              本地上传
            </button>
            <button
              type="button"
              onClick={() => armReferenceLibrarySelect(slot.id)}
              className={cn(
                'bg-white px-3 py-2 text-[11px] font-medium hover:bg-[#f8fafe]',
                armed ? 'text-[#111827]' : 'text-[#5b6780]'
              )}
            >
              资源库选择
            </button>
          </div>
        </div>
      </div>
    );
  };

  const seedanceGuidePopover = (
    <AnimatePresence>
      {showSeedanceGuide && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="absolute right-0 top-full z-[30] mt-3 w-[420px] rounded-[24px] border border-[#e7ebf3] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="text-[18px] font-semibold text-[#111827]">Seedance 主体素材要求</div>
            <button
              type="button"
              onClick={() => setShowSeedanceGuide(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f5f7fb]"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-6 space-y-6 text-[13px] leading-6 text-[#374151]">
            <div className="grid grid-cols-[76px_1fr] gap-5">
              <div className="font-semibold text-[#111827]">肖像</div>
              <ul className="list-disc space-y-0.5 pl-5">
                <li>格式: JPEG, PNG, WEBP, BMP, TIFF, GIF, HEIC/HEIF</li>
                <li>宽高比: 0.4–2.5</li>
                <li>尺寸: 300–6000 px</li>
                <li>文件大小: &lt; 30 MB per image</li>
              </ul>
            </div>

            <div className="grid grid-cols-[76px_1fr] gap-5">
              <div className="font-semibold text-[#111827]">音频</div>
              <ul className="list-disc space-y-0.5 pl-5">
                <li>格式: WAV, MP3</li>
                <li>时长: 2–15 s</li>
                <li>最大文件大小: 15 MB</li>
              </ul>
            </div>

            <div className="grid grid-cols-[76px_1fr] gap-5">
              <div className="font-semibold text-[#111827]">视频</div>
              <ul className="list-disc space-y-0.5 pl-5">
                <li>格式: MP4, MOV</li>
                <li>分辨率: 480p, 720p</li>
                <li>时长: 2–15 s</li>
                <li>宽高比: 0.4–2.5</li>
                <li>尺寸: 300–6000 px</li>
                <li>总像素: 409,600–927,408</li>
                <li>帧率: 24–60 FPS</li>
                <li>最大文件大小: 50 MB</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-[12px] text-[#b0b7c5]">满足以上要求并不保证一定通过审核。</div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[118] bg-[rgba(15,23,42,0.24)] backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            className="fixed left-1/2 top-1/2 z-[119] flex h-[min(760px,calc(100vh-40px))] w-[min(920px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="flex w-full flex-col">
              <div className="flex items-center justify-between border-b border-[#edf1f7] px-6 py-5">
                <div>
                  <div className="text-[20px] font-semibold tracking-[-0.02em] text-gray-900">资源库选择</div>
                  <div className="mt-1 text-[12px] text-[#7c89a8]">从资源库中选择图像、视频、音频或模特素材添加到当前对话。</div>
                </div>
                <button type="button" onClick={onClose} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e6ebf3] bg-white px-4 text-[12px] font-medium text-gray-700 transition-colors hover:bg-[#f6f8fc]">
                  <X size={14} />
                  <span>关闭</span>
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
                  <input ref={uploadInputRef} type="file" accept={currentUploadAccept} multiple onChange={handleUpload} className="hidden" />

                  <div className="sticky top-0 z-10 -mx-6 border-b border-[#edf1f7] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] px-6 pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {TABS.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium transition-all',
                              activeTab === tab.id ? 'bg-[#111827] text-white shadow-[0_10px_24px_rgba(17,24,39,0.16)]' : 'text-[#68758f] hover:bg-[#f4f7fb]'
                            )}
                          >
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                          </button>
                        ))}
                        {activeTab === 'video' && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowVideoModeMenu((prev) => !prev)}
                              className="inline-flex items-center gap-2 rounded-full border border-[#e1e6f0] bg-white px-3 py-2 text-[13px] font-medium text-[#5b6780] transition-colors hover:bg-[#f7f9fc]"
                            >
                              <span>{VIDEO_MODE_OPTIONS.find((option) => option.id === videoMode)?.label ?? '文生视频'}</span>
                              <ChevronDown size={14} />
                            </button>
                            <AnimatePresence>
                              {showVideoModeMenu && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                  className="absolute left-0 top-full z-20 mt-2 w-40 rounded-[16px] border border-[#e4e9f2] bg-white p-1.5 shadow-[0_18px_34px_rgba(17,24,39,0.12)]"
                                >
                                  {VIDEO_MODE_OPTIONS.map((option) => (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => {
                                        setVideoMode(option.id);
                                        setShowVideoModeMenu(false);
                                        setPendingReferenceSlotId(null);
                                      }}
                                      className={cn(
                                        'flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-[12px] transition-colors',
                                        videoMode === option.id ? 'bg-[#f5f7fb] text-[#111827]' : 'text-[#5b6780] hover:bg-[#f8fafe]'
                                      )}
                                    >
                                      <span>{option.label}</span>
                                      {videoMode === option.id && <Check size={13} className="text-[#111827]" />}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSearchInput((prev) => !prev)}
                          className={cn(
                            'inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-colors',
                            showSearchInput || keyword ? 'border-[#111827] text-[#111827]' : 'border-[#e6ebf3] text-[#6b7280] hover:bg-[#f7f9fc]'
                          )}
                        >
                          <Search size={15} />
                        </button>
                        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e6ebf3] bg-white text-[#6b7280] transition-colors hover:bg-[#f7f9fc]">
                          <FolderOpen size={16} />
                        </button>
                        {activeTab !== 'video' && (
                          <button type="button" onClick={() => uploadInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-full border border-[#dbe4f4] bg-white px-3 text-[12px] font-medium text-[#5b6780] transition-colors hover:bg-[#f7f9fc]">
                            <Upload size={14} />
                            <span>上传</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <AnimatePresence initial={false}>
                      {showSearchInput && (
                        <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                            <input
                              value={keyword}
                              onChange={(event) => setKeyword(event.target.value)}
                              placeholder="资源搜索"
                              className="h-11 w-full rounded-2xl border border-[#e7ecf5] bg-[#f8fafe] pl-11 pr-4 text-[13px] text-gray-800 outline-none transition-colors placeholder:text-[#9aa8bf] focus:border-[#9db5ff]"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {activeTab === 'video' && videoMode !== 'text' && (
                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-[14px] font-semibold text-gray-900">
                          {videoMode === 'frames' ? '首尾帧素材' : '全能参考素材'}
                        </div>
                        {pendingReferenceSlotId && (
                          <div className="rounded-full bg-[#111827] px-3 py-1 text-[11px] font-medium text-white">
                            请从下方资源选择对应素材
                          </div>
                        )}
                      </div>
                      {videoMode === 'frames' ? (
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          {renderReferenceSlot(FRAME_SLOT_CONFIGS[0])}
                          <div className="text-[14px] font-medium text-[#9aa6bd]">与</div>
                          {renderReferenceSlot(FRAME_SLOT_CONFIGS[1])}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {REFERENCE_SLOT_CONFIGS.map((slot) => renderReferenceSlot(slot))}
                        </div>
                      )}
                    </div>
                  )}

                  <AnimatePresence>
                    {seedanceTip && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-5 flex items-center justify-between rounded-[18px] border border-[#f4d6c8] bg-[#fff6f1] px-4 py-3 text-[12px] text-[#9a4f2d]"
                      >
                        <span>{seedanceTip}</span>
                        <button
                          type="button"
                          onClick={() => setSeedanceTip(null)}
                          className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-[#9a4f2d]"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[14px] font-semibold text-gray-900">
                        文件夹 <span className="ml-1 text-[#97a3b8]">{FOLDERS.length}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {filteredFolders.map((folder) => (
                        <button key={folder.id} type="button" className="group rounded-[18px] border border-[#edf1f7] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#d7deed] hover:shadow-[0_12px_28px_rgba(99,114,130,0.12)]">
                          <div className="flex h-[72px] items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#fff8d8_0%,#fff1b8_100%)]">
                            <FolderOpen size={28} className="text-[#f0b429]" />
                          </div>
                          <div className="mt-3 truncate text-[12px] font-medium text-gray-700">{folder.name}</div>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setShowAllFolders((prev) => !prev)} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#7d8aa3] transition-colors hover:text-[#4c5872]">
                      <span>{showAllFolders ? '收起' : '展开'}</span>
                      {showAllFolders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[14px] font-semibold text-gray-900">
                        资源 <span className="ml-1 text-[#97a3b8]">{resourceCount}</span>
                      </div>
                      {isSeedanceFilterVisible && (
                        <div className="relative flex items-center gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-[#5f6880]">
                            <input
                              type="checkbox"
                              checked={seedanceOnly}
                              onChange={(event) => setSeedanceOnly(event.target.checked)}
                              className="h-4 w-4 rounded border-[#cfd7e6] text-[#111827] focus:ring-[#111827]/20"
                            />
                            <span>Seedance可用</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowSeedanceGuide((prev) => !prev)}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#f3f6fb] hover:text-[#5f6880]"
                          >
                            <CircleHelp size={14} />
                          </button>
                          {seedanceGuidePopover}
                        </div>
                      )}
                    </div>

                    {activeTab === 'image' && (
                      <div className="grid grid-cols-5 gap-3">
                        {filteredImageAssets.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            disabled={isAssetDisabled(asset)}
                            onClick={() => toggleSelect(asset)}
                            className={cn(
                              'group relative block w-full overflow-hidden rounded-[18px] border bg-white text-left transition-all',
                              !isAssetDisabled(asset)
                                ? 'hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(99,114,130,0.14)]'
                                : 'cursor-not-allowed opacity-55 grayscale-[0.2] saturate-[0.75]',
                              isSelected(asset.id) ? 'border-[#111827] ring-2 ring-[#111827]/20 shadow-[0_16px_36px_rgba(17,24,39,0.18)]' : 'border-[#e8ecf4] hover:border-[#cad5ea]'
                            )}
                          >
                            {isSelected(asset.id) && <div className="absolute inset-0 z-[1] bg-[#111827]/6 pointer-events-none" />}
                            {isSelected(asset.id) && <div className="absolute right-2 top-2 z-[2] flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-white shadow-sm"><Check size={13} /></div>}
                            <div className="absolute right-2 top-2 z-[4]">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setAssetMenuId((prev) => (prev === asset.id ? null : asset.id));
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/92 text-[#4b5563] shadow-sm backdrop-blur-sm hover:bg-white"
                              >
                                <MoreHorizontal size={15} />
                              </button>
                              <AnimatePresence>
                                {assetMenuId === asset.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    className="absolute right-0 top-9 z-[5] w-36 rounded-[14px] border border-[#e4e9f2] bg-white p-1.5 shadow-[0_18px_34px_rgba(17,24,39,0.12)]"
                                  >
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        startSeedanceDetection('image', asset.id, asset.name);
                                      }}
                                      disabled={asset.seedanceStatus === 'pending'}
                                      className={cn(
                                        'w-full rounded-[10px] px-3 py-2 text-left text-[12px] transition-colors',
                                        asset.seedanceStatus === 'pending' ? 'cursor-not-allowed text-[#9aa6bd]' : 'text-[#4b5563] hover:bg-[#f8fafe]'
                                      )}
                                    >
                                      提交Seedance检测
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            {asset.seedanceStatus === 'passed' ? (
                              <div className="group absolute left-2 top-2 z-[3]">
                                {renderSeedanceBadge()}
                                <div className="pointer-events-none absolute left-0 top-full mt-2 whitespace-nowrap rounded-full bg-[#111827] px-3 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                  Seedance可用
                                </div>
                              </div>
                            ) : getSeedanceStatusMeta(asset.seedanceStatus) ? (
                              <div className={cn('absolute left-2 top-2 z-[3] rounded-full px-2 py-1 text-[10px] font-medium shadow-sm', getSeedanceStatusMeta(asset.seedanceStatus)?.className)}>
                                {getSeedanceStatusMeta(asset.seedanceStatus)?.label}
                              </div>
                            ) : null}
                            <div className={cn('overflow-hidden bg-[#f4f6fb]', asset.aspectClass)}>
                              <img src={asset.url} alt={asset.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                            </div>
                            <div className="flex items-center justify-between px-2.5 py-2">
                              <span className="truncate text-[11px] font-medium text-gray-700">{asset.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeTab === 'video' && (
                      <div className="grid grid-cols-5 gap-3">
                        {filteredVideoAssets.map((asset) => (
                          <button key={asset.id} type="button" onClick={() => toggleSelect(asset)} className={cn('group relative overflow-hidden rounded-[18px] border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(99,114,130,0.14)]', isSelected(asset.id) ? 'border-[#111827] ring-2 ring-[#111827]/20 shadow-[0_16px_36px_rgba(17,24,39,0.18)]' : 'border-[#e8ecf4] hover:border-[#cad5ea]')}>
                            {isSelected(asset.id) && <div className="absolute inset-0 z-[1] bg-[#111827]/6 pointer-events-none" />}
                            {isSelected(asset.id) && <div className="absolute right-2 top-2 z-[3] flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-white shadow-sm"><Check size={13} /></div>}
                            <div className="relative aspect-[3/4] overflow-hidden bg-[#eef2f8]">
                              <video src={asset.url} poster={asset.cover} className="h-full w-full object-cover" muted playsInline autoPlay loop />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                              <div className="absolute left-3 top-3 rounded-full bg-white/92 p-2 text-gray-900 shadow-sm">
                                <Play size={12} fill="currentColor" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between px-2.5 py-2">
                              <div className="min-w-0">
                                <div className="truncate text-[11px] font-medium text-gray-800">{asset.name}</div>
                                <div className="mt-0.5 text-[10px] text-[#8c98ae]">视频素材</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeTab === 'audio' && (
                      <div className="grid grid-cols-5 gap-3">
                        {filteredAudioAssets.map((asset) => (
                          <button key={asset.id} type="button" onClick={() => toggleSelect(asset)} className={cn('group relative w-full rounded-[18px] border bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(99,114,130,0.14)]', isSelected(asset.id) ? 'border-[#111827] ring-2 ring-[#111827]/20 bg-[#f9fbff] shadow-[0_16px_36px_rgba(17,24,39,0.18)]' : 'border-[#e8ecf4] hover:border-[#cad5ea]')}>
                            {isSelected(asset.id) && <div className="absolute right-2 top-2 z-[2] flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-white shadow-sm"><Check size={13} /></div>}
                            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-[#1f2937]', asset.accent)}>
                              <Music size={18} />
                            </div>
                            <div className="mt-2 min-w-0">
                              <div className="truncate text-[11px] font-medium text-gray-900">{asset.name}</div>
                              <div className="mt-0.5 text-[10px] font-medium text-[#8c98ae]">{asset.duration}</div>
                              <div className="mt-2 flex h-8 items-end gap-1">
                                {Array.from({ length: 24 }).map((_, index) => (
                                  <span key={index} className="w-1 rounded-full bg-[#cfd8e8]" style={{ height: `${4 + ((index * 5) % 14)}px` }} />
                                ))}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeTab === 'model' && (
                      <div className="grid grid-cols-5 gap-3">
                        {filteredModelAssets.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            disabled={isAssetDisabled(asset)}
                            onClick={() => toggleSelect(asset)}
                            className={cn(
                              'group relative block w-full overflow-hidden rounded-[18px] border bg-white text-left transition-all',
                              !isAssetDisabled(asset)
                                ? 'hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(99,114,130,0.14)]'
                                : 'cursor-not-allowed opacity-55 grayscale-[0.2] saturate-[0.75]',
                              isSelected(asset.id) ? 'border-[#111827] ring-2 ring-[#111827]/20 shadow-[0_16px_36px_rgba(17,24,39,0.18)]' : 'border-[#e8ecf4] hover:border-[#cad5ea]'
                            )}
                          >
                            {isSelected(asset.id) && <div className="absolute inset-0 z-[1] bg-[#111827]/6 pointer-events-none" />}
                            {isSelected(asset.id) && <div className="absolute right-2 top-2 z-[2] flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-white shadow-sm"><Check size={13} /></div>}
                            <div className="absolute right-2 top-2 z-[4]">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setAssetMenuId((prev) => (prev === asset.id ? null : asset.id));
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/92 text-[#4b5563] shadow-sm backdrop-blur-sm hover:bg-white"
                              >
                                <MoreHorizontal size={15} />
                              </button>
                              <AnimatePresence>
                                {assetMenuId === asset.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    className="absolute right-0 top-9 z-[5] w-36 rounded-[14px] border border-[#e4e9f2] bg-white p-1.5 shadow-[0_18px_34px_rgba(17,24,39,0.12)]"
                                  >
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        startSeedanceDetection('model', asset.id, asset.name);
                                      }}
                                      disabled={asset.seedanceStatus === 'pending'}
                                      className={cn(
                                        'w-full rounded-[10px] px-3 py-2 text-left text-[12px] transition-colors',
                                        asset.seedanceStatus === 'pending' ? 'cursor-not-allowed text-[#9aa6bd]' : 'text-[#4b5563] hover:bg-[#f8fafe]'
                                      )}
                                    >
                                      提交Seedance检测
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            {asset.seedanceStatus === 'passed' ? (
                              <div className="group absolute left-2 top-2 z-[3]">
                                {renderSeedanceBadge()}
                                <div className="pointer-events-none absolute left-0 top-full mt-2 whitespace-nowrap rounded-full bg-[#111827] px-3 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                  Seedance可用
                                </div>
                              </div>
                            ) : getSeedanceStatusMeta(asset.seedanceStatus) ? (
                              <div className={cn('absolute left-2 top-2 z-[3] rounded-full px-2 py-1 text-[10px] font-medium shadow-sm', getSeedanceStatusMeta(asset.seedanceStatus)?.className)}>
                                {getSeedanceStatusMeta(asset.seedanceStatus)?.label}
                              </div>
                            ) : null}
                            <div className={cn('overflow-hidden bg-[#f4f6fb]', asset.aspectClass)}>
                              <img src={asset.url} alt={asset.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                            </div>
                            <div className="flex items-center justify-between px-2.5 py-2">
                              <span className="truncate text-[11px] font-medium text-gray-700">{asset.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#edf1f7] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] px-6 py-4">
                  <div className="flex items-stretch gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-h-[90px] gap-3 overflow-x-auto rounded-[22px] border border-[#e8ecf4] bg-[#fafbfe] p-3 custom-scrollbar">
                        {selectedAssets.length === 0 ? (
                          <div className="flex w-full items-center justify-center text-[12px] text-[#97a3b8]">选择上方资源后，会在这里汇总展示</div>
                        ) : (
                          selectedAssets.map((asset) => (
                            <div key={asset.id} className="relative w-[84px] shrink-0 overflow-hidden rounded-[14px] border border-[#dfe6f2] bg-white">
                              <button type="button" onClick={() => removeSelectedAsset(asset.id)} className="absolute right-1.5 top-1.5 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70">
                                <X size={12} />
                              </button>
                              <div className="absolute left-1.5 top-1.5 z-10 rounded-full bg-white/92 px-1.5 py-0.5 text-[9px] font-medium text-[#111827] shadow-sm">
                                {asset.displayTypeLabel ?? '素材'}
                              </div>
                              <div className="aspect-square overflow-hidden bg-[#f3f5fa]">
                                {asset.type === 'audio' ? (
                                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#eef2ff_0%,#f8faff_100%)]">
                                    <Music size={18} className="text-[#5c5cfc]" />
                                  </div>
                                ) : asset.type === 'video' ? (
                                  <video src={asset.url} className="h-full w-full object-cover" muted playsInline autoPlay loop />
                                ) : (
                                  <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={confirmSelection}
                      disabled={selectedAssets.length === 0}
                      className={cn(
                        'inline-flex min-h-[90px] shrink-0 items-center self-stretch rounded-[22px] px-5 text-[12px] font-medium transition-all',
                        selectedAssets.length === 0 ? 'bg-gray-100 text-gray-300' : 'bg-[#111827] text-white hover:bg-[#1f2937]'
                      )}
                    >
                      {`${confirmLabel ?? (selectionMode === 'single' ? '确定选择' : '确定添加')}（${selectedAssets.length}）`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
