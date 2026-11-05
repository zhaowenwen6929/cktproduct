import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignLeft,
  ArrowLeft,
  AudioLines,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Cloud,
  Download,
  Film,
  FolderOpen,
  Gauge,
  Image as ImageIcon,
  Layers3,
  Maximize2,
  MessageCircle,
  Mic2,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Redo2,
  Scissors,
  Send,
  Settings2,
  Sparkles,
  SquareMousePointer,
  Subtitles,
  TextCursorInput,
  Undo2,
  Upload,
  Volume2,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

type AiVideoEditorPageProps = {
  onBackToDirectory: () => void;
};

type ChatMessage = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  time?: string;
};

type ToolId = 'media' | 'edit' | 'text' | 'audio' | 'effects';

const DEFAULT_VIDEO = '/code-video/reference-style-demo-v14-voice.mp4';
const DEFAULT_POSTER = '/code-video/reference-style-demo-v14-poster.png';

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'assistant',
    text: '视频已经导入，我先帮你梳理了一遍内容。当前素材约 27 秒，共识别到 4 个画面段落。',
    time: '刚刚',
  },
  {
    id: 2,
    role: 'assistant',
    text: '你可以直接告诉我想怎么改，比如“把开头压缩到 3 秒”“给视频加上自动字幕”或“换一首更有节奏感的音乐”。',
  },
];

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const remainder = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

const formatLongTime = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const remainder = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}:00`;
};

const timelineTicks = ['00:00', '00:03', '00:06', '00:09', '00:12', '00:15', '00:18', '00:21', '00:24', '00:27'];

const toolItems: Array<{ id: ToolId; label: string; icon: typeof Film }> = [
  { id: 'media', label: '素材', icon: Film },
  { id: 'edit', label: '剪辑', icon: Scissors },
  { id: 'text', label: '文字', icon: TextCursorInput },
  { id: 'audio', label: '音频', icon: Music2 },
  { id: 'effects', label: '特效', icon: WandSparkles },
];

export function AiVideoEditorPage({ onBackToDirectory }: AiVideoEditorPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<ToolId>('media');
  const [activeRightTab, setActiveRightTab] = useState<'chat' | 'settings'>('chat');
  const [videoSource, setVideoSource] = useState(DEFAULT_VIDEO);
  const [poster, setPoster] = useState(DEFAULT_POSTER);
  const [videoName, setVideoName] = useState('灵感短片 · 版本 01');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(27.4);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [hasCaptions, setHasCaptions] = useState(false);
  const [hasMusic, setHasMusic] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [zoom, setZoom] = useState(72);
  const [showToast, setShowToast] = useState('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const notify = (message: string) => setShowToast(message);

  const seekTo = (nextTime: number) => {
    const safeTime = Math.max(0, Math.min(duration, nextTime));
    setCurrentTime(safeTime);
    if (videoRef.current) videoRef.current.currentTime = safeTime;
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play().catch(() => undefined);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSource(url);
    setPoster('');
    setVideoName(file.name.replace(/\.[^/.]+$/, '') || '新视频');
    setCurrentTime(0);
    notify('视频已添加到时间线');
  };

  const addAssistantMessage = (text: string) => {
    setMessages((items) => [...items, { id: Date.now(), role: 'assistant', text }]);
  };

  const handleSend = (preset?: string) => {
    const text = (preset ?? chatInput).trim();
    if (!text || isThinking) return;
    setMessages((items) => [...items, { id: Date.now(), role: 'user', text }]);
    setChatInput('');
    setIsThinking(true);

    window.setTimeout(() => {
      const normalized = text.replace(/\s/g, '');
      if (/字幕|文字/.test(normalized)) {
        setHasCaptions(true);
        addAssistantMessage('好的，我已为整段视频生成自动字幕，并把字幕轨道放到时间线。你可以继续让我调整字幕样式或位置。');
      } else if (/音乐|配乐|音频/.test(normalized)) {
        setHasMusic(true);
        addAssistantMessage('我为这支视频匹配了一条轻快、层次感更明显的背景音乐，已经放入音频轨道。');
      } else if (/开头|压缩|剪掉|剪辑/.test(normalized)) {
        seekTo(Math.min(3, duration));
        addAssistantMessage('已将播放位置定位到开头剪辑点。建议保留 00:03 之后的内容，节奏会更紧凑。');
      } else {
        addAssistantMessage('收到，我会按这个方向调整视频。你也可以继续补充具体的节奏、字幕或配乐偏好。');
      }
      setIsThinking(false);
      notify('AI 已完成一次编辑建议');
    }, 750);
  };

  const activeToolTitle = useMemo(
    () => toolItems.find((item) => item.id === activeTool)?.label ?? '素材',
    [activeTool]
  );

  const handleVideoMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
  };

  return (
    <div className="ai-video-editor-shell">
      <header className="ai-video-editor-topbar">
        <div className="ai-video-editor-topbar__left">
          <button type="button" className="ai-video-editor-back" onClick={onBackToDirectory} aria-label="返回目录">
            <ArrowLeft size={16} />
          </button>
          <div className="ai-video-editor-brand" aria-label="创客贴">
            <span className="ai-video-editor-brand__mark">Ai</span>
          </div>
          <span className="ai-video-editor-divider" />
          <div className="ai-video-editor-title-wrap">
            <strong>AI视频编辑器</strong>
            <span><Cloud size={13} /> 已自动保存</span>
          </div>
        </div>
        <div className="ai-video-editor-topbar__actions">
          <button type="button" className="ai-video-editor-plain-button" onClick={() => notify('预览窗口已准备好')}>
            <Play size={14} /> 预览
          </button>
          <button type="button" className="ai-video-editor-plain-button" onClick={() => notify('分享链接已复制')}>
            <ShareIcon /> 分享
          </button>
          <div className="ai-video-editor-credit"><span /> 204,843 <em>积分</em></div>
          <button type="button" className="ai-video-editor-member"><Sparkles size={14} /> 会员</button>
          <button type="button" className="ai-video-editor-export" onClick={() => notify('视频导出任务已创建')}>
            <Download size={14} /> 导出视频
          </button>
        </div>
      </header>

      <div className="ai-video-editor-body">
        <aside className="ai-video-editor-left-rail">
          <button type="button" className="ai-video-editor-rail-add" onClick={() => fileInputRef.current?.click()}>
            <Plus size={18} />
            <span>导入</span>
          </button>
          <div className="ai-video-editor-rail-tools">
            {toolItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`ai-video-editor-rail-tool${activeTool === item.id ? ' is-active' : ''}`}
                  onClick={() => setActiveTool(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="ai-video-editor-rail-bottom">
            <button type="button" className="ai-video-editor-rail-tool" onClick={() => notify('快捷键面板即将打开')}><CircleHelp size={18} /><span>帮助</span></button>
            <button type="button" className="ai-video-editor-rail-tool" onClick={() => setActiveRightTab('settings')}><Settings2 size={18} /><span>设置</span></button>
          </div>
          <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoUpload} hidden />
        </aside>

        <main className="ai-video-editor-main">
          <div className="ai-video-editor-mainbar">
            <div className="ai-video-editor-mainbar__crumbs">
              <button type="button" onClick={onBackToDirectory}>我的作品</button>
              <ChevronRight size={13} />
              <strong>{videoName}</strong>
            </div>
            <div className="ai-video-editor-mainbar__actions">
              <button type="button" onClick={() => notify('已撤销上一步操作')}><Undo2 size={15} /></button>
              <button type="button" onClick={() => notify('已重做上一步操作')}><Redo2 size={15} /></button>
              <span className="ai-video-editor-mainbar__divider" />
              <button type="button" onClick={() => notify('画布比例保持为 16:9')}><span className="ai-video-editor-ratio">16:9</span><ChevronDown size={13} /></button>
            </div>
          </div>

          <div className="ai-video-editor-workspace">
            <section className="ai-video-editor-preview-panel">
              <div className="ai-video-editor-preview-head">
                <div className="ai-video-editor-section-label"><span className="ai-video-editor-status-dot" /> 视频预览</div>
                <div className="ai-video-editor-preview-head__actions">
                  <span>1080p</span>
                  <button type="button" onClick={() => notify('预览画布已放大')}><Maximize2 size={15} /></button>
                  <button type="button" onClick={() => notify('更多预览选项')}><MoreHorizontal size={17} /></button>
                </div>
              </div>
              <div className="ai-video-editor-stage-wrap">
                <div className="ai-video-editor-stage">
                  <video
                    ref={videoRef}
                    src={videoSource}
                    poster={poster || undefined}
                    onLoadedMetadata={handleVideoMetadata}
                    onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    muted={isMuted}
                    playsInline
                  />
                  <div className="ai-video-editor-stage-overlay">
                    <span>AI VIDEO EDITOR</span>
                    <small>让每一帧，都更接近你的想法</small>
                  </div>
                  {hasCaptions && <div className="ai-video-editor-caption-preview">让每一帧，都更接近你的想法</div>}
                  <button type="button" className="ai-video-editor-stage-play" onClick={togglePlay} aria-label={isPlaying ? '暂停' : '播放'}>
                    {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                  </button>
                </div>
              </div>
              <div className="ai-video-editor-player-controls">
                <div className="ai-video-editor-player-controls__left">
                  <button type="button" onClick={togglePlay} aria-label={isPlaying ? '暂停' : '播放'}>{isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button>
                  <span>{formatTime(currentTime)} <i>/</i> {formatTime(duration)}</span>
                  <button type="button" onClick={() => setIsMuted((value) => !value)} aria-label={isMuted ? '取消静音' : '静音'}>{isMuted ? <VolumeOffIcon /> : <Volume2 size={16} />}</button>
                </div>
                <div className="ai-video-editor-player-controls__right">
                  <span>自动播放</span>
                  <button type="button" className={`ai-video-editor-toggle${isAutoPlay ? ' is-on' : ''}`} onClick={() => setIsAutoPlay((value) => !value)}><span /></button>
                  <button type="button" onClick={() => notify('播放速度 1x')}><Gauge size={15} /> 1x</button>
                </div>
              </div>
            </section>

            <section className="ai-video-editor-timeline-panel">
              <div className="ai-video-editor-timeline-head">
                <div className="ai-video-editor-timeline-actions">
                  <button type="button" onClick={() => notify('已撤销剪辑操作')}><Undo2 size={15} /></button>
                  <button type="button" onClick={() => notify('已重做剪辑操作')}><Redo2 size={15} /></button>
                  <span />
                  <button type="button" onClick={() => notify('已剪切当前片段')}><Scissors size={15} /> 分割</button>
                  <button type="button" onClick={() => notify('已删除选中片段')}><X size={15} /> 删除</button>
                </div>
                <div className="ai-video-editor-timeline-zoom">
                  <button type="button" onClick={() => setZoom((value) => Math.max(48, value - 8))}><ZoomOut size={14} /></button>
                  <div className="ai-video-editor-zoom-track"><span style={{ width: `${zoom}%` }} /></div>
                  <button type="button" onClick={() => setZoom((value) => Math.min(100, value + 8))}><ZoomIn size={14} /></button>
                </div>
              </div>
              <div className="ai-video-editor-timeline">
                <div className="ai-video-editor-timeline-ruler">
                  <div className="ai-video-editor-track-spacer" />
                  <div className="ai-video-editor-ruler-scale">
                    {timelineTicks.map((tick) => <span key={tick}>{tick}</span>)}
                  </div>
                </div>
                <div className="ai-video-editor-track-row">
                  <div className="ai-video-editor-track-label"><Film size={14} /><span>视频</span><MoreHorizontal size={14} /></div>
                  <div className="ai-video-editor-track-content">
                    <div className="ai-video-editor-playhead" style={{ left: `${progress}%` }}><span /></div>
                    <input aria-label="视频时间线" type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(event) => seekTo(Number(event.target.value))} />
                    <div className="ai-video-editor-video-clip">
                      <div className="ai-video-editor-clip-thumbs">
                        {Array.from({ length: 8 }, (_, index) => <img key={index} src={poster || DEFAULT_POSTER} alt="" />)}
                      </div>
                      <div className="ai-video-editor-clip-name"><Film size={13} /> {videoName}</div>
                    </div>
                  </div>
                </div>
                <div className="ai-video-editor-track-row">
                  <div className="ai-video-editor-track-label"><Subtitles size={14} /><span>字幕</span><MoreHorizontal size={14} /></div>
                  <div className="ai-video-editor-track-content">
                    {hasCaptions ? <div className="ai-video-editor-caption-clip"><Subtitles size={13} /> 自动字幕 <span>27.4s</span></div> : <button type="button" className="ai-video-editor-empty-track" onClick={() => handleSend('给视频加上自动字幕')}><Plus size={13} /> 点击让 AI 生成字幕</button>}
                  </div>
                </div>
                <div className="ai-video-editor-track-row">
                  <div className="ai-video-editor-track-label"><AudioLines size={14} /><span>音频</span><MoreHorizontal size={14} /></div>
                  <div className="ai-video-editor-track-content">
                    {hasMusic ? <div className="ai-video-editor-audio-clip"><div className="ai-video-editor-waveform">{Array.from({ length: 54 }, (_, index) => <i key={index} style={{ height: `${14 + ((index * 17) % 28)}%` }} />)}</div><span><Music2 size={12} /> Morning Lights · AI 推荐</span></div> : <button type="button" className="ai-video-editor-empty-track" onClick={() => handleSend('给视频配一首轻快的音乐')}><Plus size={13} /> 添加背景音乐</button>}
                  </div>
                </div>
              </div>
              <div className="ai-video-editor-timeline-footer">
                <span><Layers3 size={13} /> 3 个轨道</span>
                <span><Clock3 size={13} /> 总时长 {formatLongTime(duration)}</span>
                <button type="button" onClick={() => notify('时间线帮助已打开')}><CircleHelp size={14} /></button>
              </div>
            </section>
          </div>
        </main>

        <aside className="ai-video-editor-chat-panel">
          <div className="ai-video-editor-chat-tabs">
            <button type="button" className={activeRightTab === 'chat' ? 'is-active' : ''} onClick={() => setActiveRightTab('chat')}><Sparkles size={15} /> AI 对话</button>
            <button type="button" className={activeRightTab === 'settings' ? 'is-active' : ''} onClick={() => setActiveRightTab('settings')}><Settings2 size={15} /> 参数</button>
          </div>

          {activeRightTab === 'chat' ? (
            <div className="ai-video-editor-chat-content">
              <div className="ai-video-editor-chat-intro">
                <div className="ai-video-editor-agent-icon"><Sparkles size={15} /></div>
                <div><strong>创客贴 AI</strong><span>视频剪辑 Agent · 在线</span></div>
                <button type="button" onClick={() => notify('已新建一轮对话')}><MessageCircle size={15} /></button>
              </div>
              <div className="ai-video-editor-chat-scroll">
                <div className="ai-video-editor-chat-date">今天 10:28</div>
                {messages.map((message) => (
                  <div key={message.id} className={`ai-video-editor-message ai-video-editor-message--${message.role}`}>
                    {message.role === 'assistant' && <div className="ai-video-editor-message-avatar"><Sparkles size={12} /></div>}
                    <div className="ai-video-editor-message-bubble">
                      <p>{message.text}</p>
                      {message.time && <span>{message.time}</span>}
                    </div>
                  </div>
                ))}
                {isThinking && <div className="ai-video-editor-message ai-video-editor-message--assistant"><div className="ai-video-editor-message-avatar"><Sparkles size={12} /></div><div className="ai-video-editor-message-bubble ai-video-editor-thinking"><i /><i /><i /></div></div>}
                <div ref={chatEndRef} />
              </div>
              <div className="ai-video-editor-suggestion-title">试试这样说</div>
              <div className="ai-video-editor-suggestions">
                <button type="button" onClick={() => handleSend('把开头压缩到 3 秒，让节奏更紧凑')}><Scissors size={14} /> 压缩开头节奏 <ChevronRight size={13} /></button>
                <button type="button" onClick={() => handleSend('给视频加上自动字幕')}><Subtitles size={14} /> 生成自动字幕 <ChevronRight size={13} /></button>
                <button type="button" onClick={() => handleSend('给视频配一首轻快的音乐')}><Music2 size={14} /> 匹配背景音乐 <ChevronRight size={13} /></button>
              </div>
              <div className="ai-video-editor-composer">
                <textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} placeholder="告诉 AI 你想怎么改..." rows={2} />
                <div className="ai-video-editor-composer-footer"><button type="button" onClick={() => notify('附件上传面板已打开')}><Plus size={15} /></button><span>Enter 发送</span><button type="button" className="ai-video-editor-send" onClick={() => handleSend()} disabled={!chatInput.trim() || isThinking}><Send size={14} /></button></div>
              </div>
            </div>
          ) : (
            <div className="ai-video-editor-settings-panel">
              <div className="ai-video-editor-settings-heading"><div><strong>视频参数</strong><span>调整当前项目的画布与输出</span></div><Settings2 size={17} /></div>
              <label>画布比例<select defaultValue="16:9"><option>16:9 横屏</option><option>9:16 竖屏</option><option>1:1 方形</option></select></label>
              <label>输出分辨率<select defaultValue="1080p"><option>1080p</option><option>2K</option><option>4K</option></select></label>
              <label>帧率<select defaultValue="30 fps"><option>30 fps</option><option>60 fps</option></select></label>
              <div className="ai-video-editor-settings-row"><span>自动字幕</span><button type="button" className={`ai-video-editor-toggle${hasCaptions ? ' is-on' : ''}`} onClick={() => setHasCaptions((value) => !value)}><span /></button></div>
              <div className="ai-video-editor-settings-row"><span>智能配乐</span><button type="button" className={`ai-video-editor-toggle${hasMusic ? ' is-on' : ''}`} onClick={() => setHasMusic((value) => !value)}><span /></button></div>
              <button type="button" className="ai-video-editor-settings-save" onClick={() => { setActiveRightTab('chat'); notify('视频参数已保存'); }}><Check size={15} /> 保存参数</button>
            </div>
          )}
        </aside>
      </div>
      {showToast && <div className="ai-video-editor-toast"><Check size={14} /> {showToast}</div>}
    </div>
  );
}

function ShareIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" /></svg>;
}

function VolumeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m23 9-6 6M17 9l6 6" /></svg>;
}
