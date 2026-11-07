import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type RefObject } from 'react';
import {
  AudioLines,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileAudio,
  FileCode2,
  Film,
  Image as ImageIcon,
  Layers3,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react';

export type AiVideoExportClip = {
  id: string;
  kind: string;
  label: string;
  start: number;
  duration: number;
  poster?: string;
};

type ExportTab = 'video' | 'audio' | 'motion' | 'frame' | 'project';
type CoverMode = 'frame' | 'ai';
type CoverRatio = '16:9' | '9:16' | '4:3' | '3:4' | '1:1';
type ProjectCompiler = '剪映' | 'DaVinci' | 'Premiere';

type AiVideoExportDialogProps = {
  open: boolean;
  projectTitle: string;
  poster: string;
  canvasRatio: string;
  duration: number;
  currentTime: number;
  clips: AiVideoExportClip[];
  anchorRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  onSetPoster: (poster: string) => void;
  onExport: (message: string) => void;
};

const exportTabs: Array<{ id: ExportTab; label: string; icon: typeof Film }> = [
  { id: 'video', label: '视频', icon: Film },
  { id: 'audio', label: '音频', icon: AudioLines },
  { id: 'motion', label: '动态图形', icon: Layers3 },
  { id: 'frame', label: '静帧', icon: ImageIcon },
  { id: 'project', label: '工程', icon: FileCode2 },
];

const coverRatios: CoverRatio[] = ['16:9', '9:16', '4:3', '3:4', '1:1'];
const projectCompilers: ProjectCompiler[] = ['剪映', 'DaVinci', 'Premiere'];

const formatTime = (value: number) => {
  const safeValue = Math.max(0, Math.round(value));
  const minutes = Math.floor(safeValue / 60).toString().padStart(2, '0');
  const seconds = (safeValue % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const formatDuration = (value: number) => {
  if (value < 60) return `${Math.round(value)} 秒`;
  return formatTime(value);
};

const projectDescriptions: Record<ProjectCompiler, string> = {
  剪映: '包含素材、封面和可继续编辑的剪映时间线。',
  DaVinci: '包含素材、封面、字幕和两条时间线。部分不兼容的源素材会转换为通用格式。',
  Premiere: '包含兼容格式素材、封面、字幕和两条时间线。动画、样式文字、滤镜和转场会渲染为外观。',
};

function ExportTabButton({ tab, active, onClick }: { tab: typeof exportTabs[number]; active: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  return (
    <button type="button" className={`ai-video-export-tab${active ? ' is-active' : ''}`} onClick={onClick} role="tab" aria-selected={active}>
      <Icon size={15} strokeWidth={1.8} />
      <span>{tab.label}</span>
    </button>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="ai-video-export-segmented" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button type="button" key={option} className={option === value ? 'is-selected' : ''} onClick={() => onChange(option)} aria-pressed={option === value}>
          {option}
        </button>
      ))}
    </div>
  );
}

export function AiVideoExportDialog({
  open,
  projectTitle,
  poster,
  canvasRatio,
  duration,
  currentTime,
  clips,
  anchorRef,
  onClose,
  onSetPoster,
  onExport,
}: AiVideoExportDialogProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>('video');
  const [resolution, setResolution] = useState('1080P');
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [motionFormat, setMotionFormat] = useState('MOV');
  const [compiler, setCompiler] = useState<ProjectCompiler>('剪映');
  const [isCoverEditorOpen, setIsCoverEditorOpen] = useState(false);
  const [coverMode, setCoverMode] = useState<CoverMode>('frame');
  const [coverDraftPoster, setCoverDraftPoster] = useState(poster);
  const [coverTime, setCoverTime] = useState(currentTime);
  const [coverRatio, setCoverRatio] = useState<CoverRatio>('16:9');
  const [coverDescription, setCoverDescription] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [aiCoverGenerated, setAiCoverGenerated] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveTab('video');
    setResolution('1080P');
    setRemoveWatermark(false);
    setCoverDraftPoster(poster);
    setCoverTime(currentTime);
    setAiCoverGenerated(false);
    setIsCoverEditorOpen(false);
  }, [open]);

  useEffect(() => {
    if (open && !isCoverEditorOpen) setCoverDraftPoster(poster);
  }, [isCoverEditorOpen, open, poster]);

  useEffect(() => {
    if (!isGeneratingCover) return undefined;
    const timer = window.setTimeout(() => {
      setIsGeneratingCover(false);
      setAiCoverGenerated(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isGeneratingCover]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const updatePopoverPosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) {
        setPopoverPosition(null);
        return;
      }
      const rect = anchor.getBoundingClientRect();
      setPopoverPosition({
        top: Math.round(rect.bottom + 10),
        right: Math.max(16, Math.round(window.innerWidth - rect.right)),
      });
    };
    updatePopoverPosition();
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);
    return () => {
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [anchorRef, open]);

  const coverFrames = useMemo(() => {
    const frames = clips.filter((clip) => clip.poster).slice(0, 8).map((clip) => ({ src: clip.poster!, clip }));
    if (frames.length === 0 && poster) frames.push({ src: poster, clip: { id: 'poster', kind: 'video', label: '当前封面', start: 0, duration, poster } });
    return frames;
  }, [clips, duration, poster]);

  const audioClipCount = clips.filter((clip) => ['voice', 'music', 'sfx'].includes(clip.kind)).length;
  const motionClipCount = clips.filter((clip) => clip.kind === 'mg').length;
  const videoClipCount = clips.filter((clip) => clip.kind === 'video').length;
  const previewSource = coverDraftPoster || poster;

  if (!open) return null;

  const selectCoverFrame = (src: string, time: number) => {
    setCoverDraftPoster(src);
    setCoverTime(time);
    setAiCoverGenerated(false);
  };

  const selectCoverTime = (time: number) => {
    setCoverTime(time);
    const nearestFrame = coverFrames.reduce<{ src: string; distance: number } | null>((nearest, frame) => {
      const distance = Math.abs(frame.clip.start - time);
      return !nearest || distance < nearest.distance ? { src: frame.src, distance } : nearest;
    }, null);
    if (nearestFrame) {
      setCoverDraftPoster(nearestFrame.src);
      setAiCoverGenerated(false);
    }
  };

  const openCoverEditor = () => {
    setCoverDraftPoster(poster);
    setCoverTime(currentTime);
    setCoverMode('frame');
    setAiCoverGenerated(false);
    setIsCoverEditorOpen(true);
  };

  const handleCoverUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setCoverDraftPoster(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSetCover = () => {
    onSetPoster(coverDraftPoster);
    setIsCoverEditorOpen(false);
  };

  const handleExport = () => {
    if (activeTab === 'video') onExport(`视频导出任务已创建 · ${resolution}`);
    if (activeTab === 'audio') onExport('MP3 音频导出任务已创建');
    if (activeTab === 'motion') onExport(`${motionClipCount} 个动态图形导出任务已创建 · ${motionFormat}`);
    if (activeTab === 'frame') onExport(`当前帧已导出为 PNG · ${formatTime(currentTime)}`);
    if (activeTab === 'project') onExport(`${compiler} 工程导出任务已创建`);
  };

  const exportButtonLabel = activeTab === 'video'
    ? '导出视频'
    : activeTab === 'audio'
      ? '导出 MP3'
      : activeTab === 'motion'
        ? '导出动态图形'
        : activeTab === 'frame'
          ? '导出当前帧'
          : `导出 ${compiler} 工程`;

  const popoverStyle = popoverPosition ? ({ '--ai-video-export-top': `${popoverPosition.top}px`, '--ai-video-export-right': `${popoverPosition.right}px` } as CSSProperties) : undefined;

  return (
    <div className="ai-video-export-backdrop" style={popoverStyle} role="dialog" aria-modal="true" aria-label="导出视频" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="ai-video-export-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <header className="ai-video-export-header">
          <div className="ai-video-export-header-title">
            <div className="ai-video-export-header-icon"><Download size={17} /></div>
            <div>
              <strong>导出</strong>
              <span>{projectTitle} · 选择输出方式</span>
            </div>
          </div>
          <button type="button" className="ai-video-export-close" onClick={onClose} aria-label="关闭导出面板" title="关闭"><X size={18} /></button>
        </header>

        <nav className="ai-video-export-tabs" role="tablist" aria-label="导出类型">
          {exportTabs.map((tab) => <ExportTabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />)}
        </nav>

        <div className="ai-video-export-body">
          <div className="ai-video-export-main">
            {activeTab === 'video' && <>
              <div className="ai-video-export-preview-card">
                <div className="ai-video-export-preview-frame">
                  {previewSource ? <img src={previewSource} alt={`${projectTitle} 封面预览`} /> : <div className="ai-video-export-preview-empty"><Film size={24} /><span>暂无预览</span></div>}
                  <div className="ai-video-export-preview-badge">封面</div>
                </div>
                <div className="ai-video-export-preview-meta">
                  <div><strong>{projectTitle}</strong><span><Clock3 size={12} /> {formatDuration(duration)} · {canvasRatio} · {videoClipCount || 1} 个视频片段</span></div>
                  <button type="button" className="ai-video-export-secondary-button" onClick={openCoverEditor}><ImageIcon size={14} /> 编辑封面</button>
                </div>
              </div>
              <section className="ai-video-export-section">
                <div className="ai-video-export-section-heading"><div><strong>输出分辨率</strong><span>分辨率越高，画面细节越丰富，导出时间也会增加</span></div><span className="ai-video-export-section-meta">MP4</span></div>
                <SegmentedControl options={['720P', '1080P', '4K']} value={resolution} onChange={setResolution} ariaLabel="视频输出分辨率" />
              </section>
              <div className="ai-video-export-summary"><Film size={15} /><div><strong>导出完整视频</strong><span>{duration ? formatDuration(duration) : '完整时长'} · {canvasRatio} · MP4</span></div><ChevronRight size={15} /></div>
            </>}

            {activeTab === 'audio' && <div className="ai-video-export-simple-panel">
              <div className="ai-video-export-large-icon"><FileAudio size={25} /></div>
              <div><h2>导出为 MP3 音频</h2><p>视频轨道将被忽略，仅保留口播、配乐和音效。</p></div>
              <div className="ai-video-export-summary ai-video-export-summary--stack"><AudioLines size={15} /><div><strong>{audioClipCount || 1} 段音频内容</strong><span>口播、配乐和音效 · {formatDuration(duration)}</span></div></div>
              <div className="ai-video-export-note">导出后会生成一个 MP3 文件，适合单独下载或继续进行音频处理。</div>
            </div>}

            {activeTab === 'motion' && <div className="ai-video-export-simple-panel">
              <div className="ai-video-export-large-icon"><Layers3 size={25} /></div>
              <div><h2>导出所有动态图形</h2><p>每个 MG 元素会单独导出，保留透明背景，方便在其他软件中继续合成。</p></div>
              <div className="ai-video-export-section ai-video-export-section--compact"><div className="ai-video-export-section-heading"><div><strong>导出格式</strong><span>{motionClipCount || 1} 个动态图形片段</span></div></div><SegmentedControl options={['MOV', 'MP4']} value={motionFormat} onChange={setMotionFormat} ariaLabel="动态图形导出格式" /></div>
              <div className="ai-video-export-summary ai-video-export-summary--stack"><Layers3 size={15} /><div><strong>{motionClipCount || 1} 个独立文件</strong><span>透明背景 · 保留时间长度和动画节奏</span></div></div>
            </div>}

            {activeTab === 'frame' && <div className="ai-video-export-simple-panel ai-video-export-simple-panel--frame">
              <div className="ai-video-export-frame-preview">{previewSource ? <img src={previewSource} alt="当前帧预览" /> : <ImageIcon size={28} />}</div>
              <div><h2>导出当前帧为 PNG</h2><p>将预览区当前时间点的画面导出为一张 PNG 图片。</p></div>
              <div className="ai-video-export-summary ai-video-export-summary--stack"><ImageIcon size={15} /><div><strong>当前时间点 · {formatTime(currentTime)}</strong><span>PNG · {canvasRatio} · 保留画布比例</span></div></div>
            </div>}

            {activeTab === 'project' && <div className="ai-video-export-simple-panel">
              <div className="ai-video-export-large-icon"><FileCode2 size={25} /></div>
              <div><h2>导出可继续编辑的工程</h2><p>{projectDescriptions[compiler]}</p></div>
              <div className="ai-video-export-section ai-video-export-section--compact"><div className="ai-video-export-section-heading"><div><strong>选择剪辑软件</strong><span>下载前请保持本页面打开</span></div></div><SegmentedControl options={projectCompilers} value={compiler} onChange={(value) => setCompiler(value as ProjectCompiler)} ariaLabel="工程剪辑软件" /></div>
              <div className="ai-video-export-project-items"><span>包含素材</span><span>封面</span><span>字幕</span><span>时间线</span></div>
            </div>}
            <div className="ai-video-export-watermark ai-video-export-watermark--main">
              <button type="button" className={`ai-video-export-switch${removeWatermark ? ' is-on' : ''}`} role="switch" aria-checked={removeWatermark} aria-label="去除水印" onClick={() => setRemoveWatermark((value) => !value)}><span /></button>
              <div><strong>去除水印</strong><span>{removeWatermark ? '导出内容不含水印' : '免费版导出会保留水印'}</span></div>
              <span className="ai-video-export-free">免费</span>
            </div>
          </div>
        </div>

        <footer className="ai-video-export-footer">
          <div><span>导出后仍可回到编辑器继续修改</span>{removeWatermark && <small><Check size={12} /> 已选择去除水印</small>}</div>
          <button type="button" className="ai-video-export-primary-button" onClick={handleExport}><Download size={15} /> {exportButtonLabel}</button>
        </footer>
      </div>

      {isCoverEditorOpen && <div className="ai-video-cover-backdrop" role="dialog" aria-modal="true" aria-label="编辑封面" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCoverEditorOpen(false); }}>
        <div className="ai-video-cover-dialog" onMouseDown={(event) => event.stopPropagation()}>
          <header className="ai-video-cover-header"><div><strong>编辑封面</strong><span>选择视频中的画面，或用 AI 生成一张封面图</span></div><button type="button" onClick={() => setIsCoverEditorOpen(false)} aria-label="关闭封面编辑"><X size={18} /></button></header>
          <div className="ai-video-cover-mode-tabs"><button type="button" className={coverMode === 'frame' ? 'is-active' : ''} onClick={() => setCoverMode('frame')}>从视频帧截取</button><button type="button" className={coverMode === 'ai' ? 'is-active' : ''} onClick={() => setCoverMode('ai')}><WandSparkles size={14} /> AI 生成封面图</button></div>
          <div className="ai-video-cover-content">
            <div className="ai-video-cover-preview-wrap"><div className="ai-video-cover-preview" style={{ aspectRatio: coverRatio.replace(':', '/') }}>{previewSource ? <img src={previewSource} alt="封面预览" /> : <Film size={28} />}{aiCoverGenerated && <span className="ai-video-cover-ai-badge"><Sparkles size={12} /> AI 预览</span>}</div></div>
            {coverMode === 'frame' ? <div className="ai-video-cover-frame-tools">
              <div className="ai-video-cover-frame-meta"><strong>从视频帧截取</strong><span>{formatTime(coverTime)} / {formatTime(duration)}</span></div>
              <input className="ai-video-cover-range" type="range" min="0" max={Math.max(duration, 1)} step="0.1" value={coverTime} onChange={(event) => selectCoverTime(Number(event.target.value))} aria-label="封面时间点" />
              <div className="ai-video-cover-thumbnails">{coverFrames.slice(0, 8).map(({ src, clip }) => <button type="button" key={`${clip.id}-${src}`} className={coverDraftPoster === src ? 'is-selected' : ''} onClick={() => selectCoverFrame(src, clip.start)}><img src={src} alt="" /><span>{formatTime(clip.start)}</span></button>)}</div>
              <label className="ai-video-cover-upload"><Upload size={16} /><span>上传封面图</span><input type="file" accept="image/*" onChange={handleCoverUpload} /></label>
            </div> : <div className="ai-video-cover-ai-tools">
              <label><span>封面描述</span><textarea value={coverDescription} onChange={(event) => setCoverDescription(event.target.value)} placeholder="输入封面描述…" rows={4} /></label>
              <div className="ai-video-cover-ratio"><span>封面比例</span><div>{coverRatios.map((ratio) => <button type="button" key={ratio} className={coverRatio === ratio ? 'is-selected' : ''} onClick={() => setCoverRatio(ratio)}>{ratio}</button>)}</div></div>
              <button type="button" className="ai-video-cover-generate" onClick={() => setIsGeneratingCover(true)} disabled={isGeneratingCover}><WandSparkles size={15} /> {isGeneratingCover ? '生成中…' : 'AI 生成封面'} <em><Sparkles size={12} /> 15</em></button>
            </div>}
          </div>
          <footer className="ai-video-cover-footer"><button type="button" className="ai-video-export-secondary-button" onClick={() => setIsCoverEditorOpen(false)}>取消</button><button type="button" className="ai-video-export-primary-button" onClick={handleSetCover}><Check size={15} /> 设为封面</button></footer>
        </div>
      </div>}
    </div>
  );
}
