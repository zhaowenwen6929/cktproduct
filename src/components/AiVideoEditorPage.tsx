import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignLeft,
  ArrowLeft,
  AudioLines,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Cloud,
  Download,
  Edit3,
  FileAudio,
  Film,
  FolderOpen,
  Gauge,
  Image as ImageIcon,
  Layers3,
  LayoutTemplate,
  Maximize2,
  MessageCircle,
  Mic2,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  PlayCircle,
  Plus,
  Redo2,
  Scissors,
  Send,
  Settings2,
  SquareMousePointer,
  Subtitles,
  Table2,
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

type ToolId = 'templates' | 'media' | 'edit' | 'text' | 'audio' | 'effects';
type WorkflowStage = 'script' | 'voice' | 'storyboard' | 'mg' | 'final';

type ScriptRow = {
  id: number;
  section: string;
  narration: string;
};

type StoryboardRow = {
  id: number;
  time: string;
  title: string;
  visual: string;
  text: string;
  duration: string;
};

const DEFAULT_VIDEO = '/code-video/reference-style-demo-v14-voice.mp4';
const DEFAULT_POSTER = '/code-video/reference-style-demo-v14-poster.png';

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'assistant',
    text: '我已经根据你的主题生成了一版旁白脚本，共 7 个段落。开场只保留标题与印象，旁白会从片段 1 进入，全文约 72 秒。',
    time: '刚刚',
  },
  {
    id: 2,
    role: 'assistant',
    text: '请先确认脚本。你可以直接在表格中修改旁白，也可以告诉我想调整的内容；确认后我会进入口播声音选择。',
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

const timelineTicks = ['00:00', '00:08', '00:16', '00:24', '00:32', '00:40', '00:48', '00:56', '01:04', '01:12'];

const toolItems: Array<{ id: ToolId; label: string; icon: typeof Film }> = [
  { id: 'templates', label: '模板', icon: LayoutTemplate },
  { id: 'media', label: '素材', icon: Film },
  { id: 'edit', label: '剪辑', icon: Scissors },
  { id: 'text', label: '文字', icon: TextCursorInput },
  { id: 'audio', label: '音频', icon: Music2 },
  { id: 'effects', label: '特效', icon: WandSparkles },
];

const templateCategories = ['全部', '科普纪录', '品牌产品', '节日活动', '知识分享'] as const;
type TemplateCategory = (typeof templateCategories)[number];

const videoTemplates: Array<{ id: string; title: string; category: Exclude<TemplateCategory, '全部'>; duration: string; poster: string }> = [
  { id: 'history', title: '历史故事 · 纪录片', category: '科普纪录', duration: '01:12', poster: '/code-video/reference-style-demo-v14-poster.png' },
  { id: 'knowledge', title: '知识讲解 · 手绘', category: '科普纪录', duration: '00:48', poster: '/code-video/reference-style-demo-v11-poster.png' },
  { id: 'product', title: '新品发布 · 画面感', category: '品牌产品', duration: '00:30', poster: '/code-video/reference-style-demo-v9-poster.png' },
  { id: 'brand', title: '品牌介绍 · 节奏版', category: '品牌产品', duration: '00:36', poster: '/code-video/reference-style-demo-v8-poster.png' },
  { id: 'festival', title: '节日活动 · 氛围感', category: '节日活动', duration: '00:20', poster: '/code-video/reference-style-demo-v13-poster.png' },
  { id: 'campaign', title: '活动预告 · 快剪', category: '节日活动', duration: '00:15', poster: '/code-video/reference-style-demo-v12-poster.png' },
  { id: 'course', title: '课程分享 · 重点清晰', category: '知识分享', duration: '00:42', poster: '/code-video/reference-style-demo-v7-poster.png' },
  { id: 'tips', title: '经验分享 · 轻量版', category: '知识分享', duration: '00:28', poster: '/code-video/reference-style-demo-v5-poster.png' },
];

const scriptRows: ScriptRow[] = [
  { id: 1, section: '片段 1 · 约化年前', narration: '约化年前，野生桑树诞生在雅鲁藏布江流域，桑基起源于中国。' },
  { id: 2, section: '片段 2 · 新石器时期', narration: '新石器时期，先民们在野生桑林中发现了桑叶与蚕，开始了对二者的驯化之旅。' },
  { id: 3, section: '片段 3 · 商朝', narration: '商朝时，甲骨文中已经出现了蚕、桑、丝等象形字，其中“桑”的象形字多达六种。' },
  { id: 4, section: '片段 4 · 西汉', narration: '结出的白桑被视为祥瑞，并成为贡品，用于祭祀天地、赏赐功臣。' },
  { id: 5, section: '片段 5 · 东汉末年', narration: '东汉末年，白桑被用作药引，帮助百姓治疗疾病。' },
  { id: 6, section: '片段 6 · 新石器时期', narration: '二十世纪五十年代，半坡遗址发现的碳化桑蔓籽粒，把人们食用桑叶的历史推回到新石器时期。' },
  { id: 7, section: '片段 7 · 1959 年', narration: '1959年，阿斯塔那古墓群出土的唐代桑基，仍保留着完整形态。' },
];

const storyboardRows: StoryboardRow[] = [
  { id: 1, time: '00:00', title: '开场 · 一颗桑果', visual: '米色宣纸背景，桑果从远处缓缓推近，保留纸张纹理。', text: '一颗桑果，见证千年文明', duration: '5s' },
  { id: 2, time: '00:05', title: '片段 1 · 雅鲁藏布', visual: '以河谷远景作开篇，镜头缓慢推进至桑树枝叶。', text: '桑树起源于中国', duration: '6.4s' },
  { id: 3, time: '00:11', title: '片段 2 · 桑叶驯化', visual: '桑叶与蚕的 MG 插画逐层出现，连接线轻柔入场。', text: '从野生桑林到人工栽培', duration: '7.1s' },
  { id: 4, time: '00:18', title: '片段 3 · 甲骨文', visual: '甲骨文字形浮现，笔尖沿着文字轮廓完成书写。', text: '“桑”的象形字多达六种', duration: '8.1s' },
  { id: 5, time: '00:26', title: '片段 4 · 祥瑞贡品', visual: '白桑树与古籍纸页叠化，画面从右向左展开。', text: '结出的白桑被视为祥瑞', duration: '5s' },
  { id: 6, time: '00:31', title: '片段 5 · 药引', visual: '药材与桑叶的线稿图标依次出现，留出字幕安全区。', text: '桑叶也成为药引', duration: '4.4s' },
];

const voiceOptions = [
  { id: 'Quentin', name: 'Quentin', detail: '温暖男声，儒雅（推荐）' },
  { id: 'Felix', name: 'Felix', detail: '清晰男声，纯中文' },
  { id: 'Kian', name: 'Kian', detail: '通用男声，清晰' },
  { id: 'Cedric', name: 'Cedric', detail: '通用男声，清晰' },
  { id: 'Magnus', name: 'Magnus', detail: '通用男声，清晰' },
  { id: 'Pearl', name: 'Pearl', detail: '流畅女声，清晰' },
  { id: 'Vienna', name: 'Vienna', detail: '清晰女声，中英混合' },
];

export function AiVideoEditorPage({ onBackToDirectory }: AiVideoEditorPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<ToolId>('media');
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<TemplateCategory>('全部');
  const [activeRightTab, setActiveRightTab] = useState<'chat' | 'settings'>('chat');
  const [videoSource, setVideoSource] = useState(DEFAULT_VIDEO);
  const [poster, setPoster] = useState(DEFAULT_POSTER);
  const [videoName, setVideoName] = useState('灵感短片 · 版本 01');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(72.2);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [hasCaptions, setHasCaptions] = useState(false);
  const [hasMusic, setHasMusic] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('script');
  const [scriptDraft, setScriptDraft] = useState<ScriptRow[]>(scriptRows);
  const [storyboardDraft, setStoryboardDraft] = useState<StoryboardRow[]>(storyboardRows);
  const [selectedVoice, setSelectedVoice] = useState('Pearl');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [mgStatus, setMgStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const [isScriptEditorOpen, setIsScriptEditorOpen] = useState(false);
  const [isStoryboardEditorOpen, setIsStoryboardEditorOpen] = useState(false);
  const [hasVoiceover, setHasVoiceover] = useState(false);
  const [hasStoryboard, setHasStoryboard] = useState(false);
  const [hasMgLayers, setHasMgLayers] = useState(false);
  const [finalStatus, setFinalStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [zoom, setZoom] = useState(72);
  const [showToast, setShowToast] = useState('');
  const notify = (message: string) => setShowToast(message);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    if (workflowStage !== 'mg') return;
    setMgStatus('generating');
    const timer = window.setTimeout(() => {
      setMgStatus('ready');
      setHasMgLayers(true);
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [workflowStage]);

  useEffect(() => {
    if (workflowStage !== 'final' || finalStatus !== 'generating') return;
    const timer = window.setTimeout(() => {
      setFinalStatus('done');
      notify('视频已生成，可以预览或导出');
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [workflowStage, finalStatus]);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

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

  const confirmScript = () => {
    setWorkflowStage('voice');
    setMessages((items) => [
      ...items,
      { id: Date.now(), role: 'user', text: '确认脚本\n确认，按此方案继续' },
      { id: Date.now() + 1, role: 'assistant', text: '旁白脚本已确认。我为你推荐了温暖男声 Quentin，也准备了几种清晰男声和女声供选择。请选择一种口播声音，确认后我会先生成声音并放入声音线。' },
    ]);
    notify('脚本已确认');
  };

  const startVoiceGeneration = () => {
    if (voiceStatus !== 'idle') return;
    setVoiceStatus('generating');
    setIsThinking(true);
    window.setTimeout(() => {
      setVoiceStatus('ready');
      setHasVoiceover(true);
      setIsThinking(false);
      setWorkflowStage('storyboard');
      setMessages((items) => [
        ...items,
        { id: Date.now(), role: 'user', text: `选择口播声音\n${selectedVoice}` },
        { id: Date.now() + 1, role: 'assistant', text: `口播音频已生成，使用 ${selectedVoice} 声音，真实时长约 72.2 秒，已经放入声音线。接下来我根据旁白内容整理了分镜方案，请确认或展开表格编辑。` },
      ]);
      notify('口播音频已生成并放入声音线');
    }, 1500);
  };

  const confirmStoryboard = () => {
    setHasStoryboard(true);
    setWorkflowStage('mg');
    setMessages((items) => [
      ...items,
      { id: Date.now(), role: 'user', text: '确认分镜方案\n确认，按此方案继续' },
      { id: Date.now() + 1, role: 'assistant', text: '分镜已确认。我现在开始生成 MG 画面与文字层，配乐和音效会同步进入生成队列。你可以展开每个镜头调整画面描述或文字。' },
    ]);
    notify('分镜方案已确认');
  };

  const confirmMg = () => {
    setWorkflowStage('final');
    setMessages((items) => [
      ...items,
      { id: Date.now(), role: 'user', text: '确认生成 · 6 个视频 · 共 33s · 16:9' },
      { id: Date.now() + 1, role: 'assistant', text: 'MG 画面、文字层、配乐和音效都已准备完成。最后确认一次，确认后我会开始生成完整视频。' },
    ]);
    notify('MG 画面与文字已确认');
  };

  const startFinalGeneration = () => {
    if (finalStatus !== 'idle') return;
    setFinalStatus('generating');
    setIsThinking(true);
    window.setTimeout(() => setIsThinking(false), 1800);
    notify('视频正在生成中');
  };

  const updateScriptRow = (id: number, field: keyof ScriptRow, value: string) => {
    setScriptDraft((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };

  const updateStoryboardRow = (id: number, field: keyof StoryboardRow, value: string) => {
    setStoryboardDraft((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row));
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
      } else if (workflowStage === 'script') {
        addAssistantMessage('收到，我会按你的想法修改旁白脚本。你也可以直接打开全屏表格，对每个段落逐条编辑。');
      } else if (workflowStage === 'storyboard') {
        addAssistantMessage('收到，我会按你的要求调整分镜。可以打开全屏表格，修改镜头名称、画面描述、文字和时长。');
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

  const visibleTemplates = useMemo(
    () => activeTemplateCategory === '全部'
      ? videoTemplates
      : videoTemplates.filter((template) => template.category === activeTemplateCategory),
    [activeTemplateCategory]
  );

  const applyVideoTemplate = (template: (typeof videoTemplates)[number]) => {
    setVideoSource(DEFAULT_VIDEO);
    setPoster(template.poster);
    setVideoName(template.title);
    setCurrentTime(0);
    notify(`已选择模板：${template.title}`);
  };

  const handleVideoMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (videoSource !== DEFAULT_VIDEO && Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
  };

  const renderWorkflowContent = () => {
    const renderMessages = () => (
      <>
        <div className="ai-video-editor-chat-date">今天 10:28</div>
        {messages.map((message) => (
          <div key={message.id} className={`ai-video-editor-message ai-video-editor-message--${message.role}`}>
            {message.role === 'assistant' && <div className="ai-video-editor-message-avatar"><Film size={12} /></div>}
            <div className="ai-video-editor-message-bubble">
              <p>{message.text}</p>
              {message.time && <span>{message.time}</span>}
            </div>
          </div>
        ))}
      </>
    );

    const renderScriptCard = () => (
      <div className="ai-video-editor-workflow-agent">
        <div className="ai-video-editor-workflow-agent__label"><Film size={14} /> 创客贴 AI</div>
        <div className="ai-video-editor-workflow-card">
          <div className="ai-video-editor-workflow-heading"><div><strong>确认脚本</strong><span>共 7 个段落 · 约 72 秒</span></div><span className="ai-video-editor-cost">本方案预计消耗 12 积分</span></div>
          <p className="ai-video-editor-workflow-note">旁白已按历史脉络整理完成。确认后我会先生成声音，再依据真实时长重新排布分镜。</p>
          <div className="ai-video-editor-script-table">
            <div className="ai-video-editor-script-table__head"><span>段落</span><span>旁白（字幕）</span></div>
            {scriptDraft.map((row) => <div className="ai-video-editor-script-table__row" key={row.id}><span>{row.section}</span><span>{row.narration}</span></div>)}
          </div>
          <div className="ai-video-editor-workflow-hint">确认后会先生成旁白并校准真实时长，再开始编排画面。</div>
          <div className="ai-video-editor-workflow-actions"><button type="button" className="ai-video-editor-secondary-action" onClick={() => setIsScriptEditorOpen(true)}><Table2 size={14} /> 展开表格编辑</button><button type="button" className="ai-video-editor-primary-action" onClick={confirmScript}><Check size={14} /> 确认脚本</button></div>
        </div>
      </div>
    );

    const renderVoiceCard = () => (
      <div className="ai-video-editor-workflow-agent">
        <div className="ai-video-editor-workflow-agent__label"><Film size={14} /> 创客贴 AI</div>
        <div className="ai-video-editor-workflow-card ai-video-editor-voice-card">
          <div className="ai-video-editor-workflow-heading"><div><strong>选择口播声音</strong><span>脚本已确认 · 约 72 秒</span></div></div>
          <p className="ai-video-editor-workflow-note">推荐使用 Quentin 温暖男声。你可以点击右侧播放按钮试听，确认后开始生成声音。</p>
          <div className="ai-video-editor-voice-list">
            {voiceOptions.map((voice, index) => (
              <button type="button" key={voice.id} className={`ai-video-editor-voice-option${selectedVoice === voice.id ? ' is-selected' : ''}`} onClick={() => setSelectedVoice(voice.id)}>
                <span className="ai-video-editor-voice-index">{selectedVoice === voice.id ? <Check size={12} /> : index + 1}</span>
                <span className="ai-video-editor-voice-copy"><strong>{voice.name}</strong><em>— {voice.detail}</em></span>
                <span className="ai-video-editor-voice-play" onClick={(event) => { event.stopPropagation(); notify(`正在试听 ${voice.name}`); }}><PlayCircle size={17} /></span>
              </button>
            ))}
          </div>
          <button type="button" className="ai-video-editor-upload-voice" onClick={() => notify('上传自定义声音入口已打开')}><Plus size={14} /> 上传音频克隆我的声音</button>
          <div className="ai-video-editor-workflow-actions"><button type="button" className="ai-video-editor-secondary-action" onClick={() => notify('可以继续补充声音偏好')}><Edit3 size={14} /> 补充声音偏好</button><button type="button" className="ai-video-editor-primary-action" onClick={startVoiceGeneration} disabled={voiceStatus === 'generating'}>{voiceStatus === 'generating' ? <><span className="ai-video-editor-spinner" /> 正在生成声音</> : <><Mic2 size={14} /> 生成声音</>}</button></div>
        </div>
      </div>
    );

    const renderStoryboardCard = () => (
      <div className="ai-video-editor-workflow-agent">
        <div className="ai-video-editor-workflow-agent__label"><Film size={14} /> 创客贴 AI</div>
        <div className="ai-video-editor-workflow-card">
          <div className="ai-video-editor-workflow-heading"><div><strong>确认分镜方案</strong><span>共 6 个镜头 · 约 33 秒 · 16:9</span></div><span className="ai-video-editor-cost">预计消耗 73–121 积分</span></div>
          <p className="ai-video-editor-workflow-note">口播真实时长已写入声音线。我按旁白节奏拆出了镜头、画面、文字和时长，你可以展开表格后逐项修改。</p>
          <div className="ai-video-editor-storyboard-table">
            <div className="ai-video-editor-storyboard-table__head"><span>镜头</span><span>时间 / 名称</span><span>画面与文字</span><span>时长</span></div>
            {storyboardDraft.map((row) => <div className="ai-video-editor-storyboard-table__row" key={row.id}><span>第 {row.id} 镜</span><span>{row.time}<br />{row.title}</span><span>{row.visual}<br /><b>{row.text}</b></span><span>{row.duration}</span></div>)}
          </div>
          <div className="ai-video-editor-storyboard-footer"><span><Music2 size={13} /> 低沉神秘的纪录片配乐，72 秒，约 70 BPM</span><button type="button" onClick={() => setIsStoryboardEditorOpen(true)}><Maximize2 size={13} /> 展开编辑</button></div>
          <div className="ai-video-editor-workflow-actions"><button type="button" className="ai-video-editor-secondary-action" onClick={() => setIsStoryboardEditorOpen(true)}><Edit3 size={14} /> 修改分镜</button><button type="button" className="ai-video-editor-primary-action" onClick={confirmStoryboard}><Check size={14} /> 确认分镜方案</button></div>
        </div>
      </div>
    );

    const renderMgCard = () => (
      <div className="ai-video-editor-workflow-agent">
        <div className="ai-video-editor-workflow-agent__label"><Film size={14} /> 创客贴 AI</div>
        <div className="ai-video-editor-workflow-card ai-video-editor-mg-card">
          <div className="ai-video-editor-workflow-heading"><div><strong>{mgStatus === 'generating' ? '正在生成 MG 画面与文字' : 'MG 画面与文字已生成'}</strong><span>6 个镜头 · 配乐与音效同步准备</span></div><span className="ai-video-editor-cost">预计消耗约 330 积分</span></div>
          {mgStatus === 'generating' ? <div className="ai-video-editor-mg-loading"><div className="ai-video-editor-mg-loading__icon"><Film size={21} /></div><strong>正在生成 6 个 MG 镜头</strong><span>配乐、音效和文字层会同步合成，请稍候…</span><div className="ai-video-editor-progress"><span /></div></div> : <>
            <p className="ai-video-editor-workflow-note">分镜已执行完成。请展开镜头卡片检查画面描述与文字层，确认后开始生成完整视频。</p>
            <div className="ai-video-editor-scene-list">
              {storyboardDraft.slice(0, 5).map((row) => <div className={`ai-video-editor-scene-card${expandedScene === row.id ? ' is-expanded' : ''}`} key={row.id}>
                <button type="button" className="ai-video-editor-scene-summary" onClick={() => setExpandedScene((value) => value === row.id ? null : row.id)}><span className="ai-video-editor-scene-number">{row.id}</span><span><strong>视频 {row.id}</strong><em>[{row.time}–{row.duration}] {row.title}</em></span><ChevronDown size={14} /></button>
                {expandedScene === row.id && <div className="ai-video-editor-scene-editor"><label>画面描述<textarea value={row.visual} onChange={(event) => updateStoryboardRow(row.id, 'visual', event.target.value)} rows={2} /></label><label>文字层<input value={row.text} onChange={(event) => updateStoryboardRow(row.id, 'text', event.target.value)} /></label></div>}
              </div>)}
            </div>
            <div className="ai-video-editor-workflow-actions"><button type="button" className="ai-video-editor-secondary-action" onClick={() => setIsStoryboardEditorOpen(true)}><Table2 size={14} /> 全屏编辑分镜</button><button type="button" className="ai-video-editor-primary-action" onClick={confirmMg}><Check size={14} /> 确认生成</button></div>
          </>}
        </div>
      </div>
    );

    const renderFinalCard = () => (
      <div className="ai-video-editor-workflow-agent">
        <div className="ai-video-editor-workflow-agent__label"><Film size={14} /> 创客贴 AI</div>
        <div className="ai-video-editor-workflow-card ai-video-editor-final-card">
          <div className="ai-video-editor-workflow-heading"><div><strong>{finalStatus === 'done' ? '视频生成完成' : '确认生成视频'}</strong><span>6 个视频 · 共 33 秒 · 16:9</span></div></div>
          {finalStatus === 'generating' ? <div className="ai-video-editor-final-loading"><div className="ai-video-editor-final-spinner"><span /></div><strong>正在合成最终视频</strong><span>MG 画面、文字层、口播和配乐正在合成…</span></div> : finalStatus === 'done' ? <div className="ai-video-editor-final-done"><CheckCircle2 size={22} /><strong>完整视频已经生成</strong><span>你可以回到时间线预览，也可以直接导出视频。</span><button type="button" className="ai-video-editor-primary-action" onClick={() => notify('预览窗口已准备好')}><Play size={14} /> 预览视频</button></div> : <><p className="ai-video-editor-workflow-note">所有内容都已确认，确认后将开始生成完整视频，预计需要 2–3 分钟。</p><div className="ai-video-editor-final-summary"><span><FileAudio size={14} /> {selectedVoice} 口播</span><span><Layers3 size={14} /> 6 个 MG 镜头</span><span><Clock3 size={14} /> 33 秒</span></div><div className="ai-video-editor-workflow-actions"><button type="button" className="ai-video-editor-secondary-action" onClick={() => setWorkflowStage('mg')}><Edit3 size={14} /> 返回调整</button><button type="button" className="ai-video-editor-primary-action" onClick={startFinalGeneration}><Play size={14} /> 开始生成</button></div></>}
        </div>
      </div>
    );

    const card = workflowStage === 'script' ? renderScriptCard() : workflowStage === 'voice' ? renderVoiceCard() : workflowStage === 'storyboard' ? renderStoryboardCard() : workflowStage === 'mg' ? renderMgCard() : renderFinalCard();
    return <div className="ai-video-editor-chat-content"><div className="ai-video-editor-chat-scroll">{renderMessages()}{card}{isThinking && <div className="ai-video-editor-message ai-video-editor-message--assistant"><div className="ai-video-editor-message-avatar"><Film size={12} /></div><div className="ai-video-editor-message-bubble ai-video-editor-thinking"><i /><i /><i /></div></div>}<div ref={chatEndRef} /></div><div className="ai-video-editor-suggestion-title">{workflowStage === 'script' ? '你也可以告诉我' : workflowStage === 'storyboard' ? '需要调整分镜？' : '继续告诉 AI 你想怎么改'}</div><div className="ai-video-editor-suggestions">{workflowStage === 'script' ? <><button type="button" onClick={() => handleSend('让旁白更口语化一些')}><AlignLeft size={14} /> 让旁白更口语化 <ChevronRight size={13} /></button><button type="button" onClick={() => setIsScriptEditorOpen(true)}><Table2 size={14} /> 打开全屏表格编辑 <ChevronRight size={13} /></button></> : workflowStage === 'storyboard' ? <><button type="button" onClick={() => setIsStoryboardEditorOpen(true)}><Table2 size={14} /> 全屏编辑分镜表格 <ChevronRight size={13} /></button><button type="button" onClick={() => handleSend('把第 1 镜改成更有冲击力的开场')}><WandSparkles size={14} /> 调整镜头节奏 <ChevronRight size={13} /></button></> : <><button type="button" onClick={() => handleSend('让画面节奏更紧凑一些')}><Scissors size={14} /> 调整节奏 <ChevronRight size={13} /></button><button type="button" onClick={() => handleSend('配一首更有纪录片质感的音乐')}><Music2 size={14} /> 调整配乐 <ChevronRight size={13} /></button></>}</div><div className="ai-video-editor-composer"><textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} placeholder={workflowStage === 'script' ? '输入你对脚本的修改意见…' : '告诉 AI 你想怎么改…'} rows={2} /><div className="ai-video-editor-composer-footer"><button type="button" onClick={() => notify('附件上传面板已打开')}><Plus size={15} /></button><span>Enter 发送</span><button type="button" className="ai-video-editor-send" onClick={() => handleSend()} disabled={!chatInput.trim() || isThinking}><Send size={14} /></button></div></div></div>;
  };

  const isFinalTimelineReady = finalStatus === 'done';

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
          <button type="button" className="ai-video-editor-member"><BadgeCheck size={14} /> 会员</button>
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
                    <span>VIDEO EDITOR</span>
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

            <section className={`ai-video-editor-timeline-panel${isFinalTimelineReady ? ' is-complete' : ''}`}>
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
                {isFinalTimelineReady ? <>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    <div className="ai-video-editor-track-label"><Subtitles size={14} /><span>字幕</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">
                      {scriptDraft.map((row) => <button type="button" className="ai-video-editor-detail-clip ai-video-editor-detail-clip--subtitle" key={row.id} onClick={() => notify(`已定位到旁白片段 ${row.id}`)} style={{ width: `${11 + (row.id % 3) * 2}%` }}><span>{row.narration.slice(0, 9)}…</span></button>)}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    <div className="ai-video-editor-track-label"><Layers3 size={14} /><span>MG 画面</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">
                      {storyboardDraft.map((row) => <button type="button" className="ai-video-editor-detail-clip ai-video-editor-detail-clip--mg" key={row.id} onClick={() => notify(`已定位到第 ${row.id} 镜`)} style={{ width: `${13 + (row.id % 2) * 3}%` }}><img src={poster || DEFAULT_POSTER} alt="" /><span>{row.title.replace(/片段 \d+ · /, '')}</span></button>)}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    <div className="ai-video-editor-track-label"><TextCursorInput size={14} /><span>文字层</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">
                      {storyboardDraft.map((row) => <button type="button" className="ai-video-editor-detail-clip ai-video-editor-detail-clip--text" key={row.id} onClick={() => notify(`已定位到文字层：${row.text}`)} style={{ width: `${13 + (row.id % 2) * 3}%` }}><span>{row.text}</span></button>)}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    <div className="ai-video-editor-track-label"><AudioLines size={14} /><span>口播声音</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">
                      {scriptDraft.map((row) => <button type="button" className="ai-video-editor-detail-clip ai-video-editor-detail-clip--voice" key={row.id} onClick={() => notify(`已定位到口播片段 ${row.id}`)} style={{ width: `${11 + (row.id % 3) * 2}%` }}><div className="ai-video-editor-mini-wave">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ height: `${22 + ((index * row.id * 13) % 62)}%` }} />)}</div><span>{selectedVoice} · {row.id.toString().padStart(2, '0')}</span></button>)}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    <div className="ai-video-editor-track-label"><Music2 size={14} /><span>配乐</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content"><button type="button" className="ai-video-editor-detail-clip ai-video-editor-detail-clip--music" onClick={() => notify('已定位到配乐轨道')}><div className="ai-video-editor-wide-wave">{Array.from({ length: 88 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 19) % 47)}%` }} />)}</div><span>低沉神秘的纪录片配乐 · 72 BPM</span></button></div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    <div className="ai-video-editor-track-label"><AudioLines size={14} /><span>音效</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content"><button type="button" className="ai-video-editor-detail-clip ai-video-editor-detail-clip--sfx" onClick={() => notify('已定位到音效轨道')}><span>纸张翻页</span></button><button type="button" className="ai-video-editor-detail-clip ai-video-editor-detail-clip--sfx" onClick={() => notify('已定位到音效轨道')}><span>轻微沙沙声</span></button><button type="button" className="ai-video-editor-detail-clip ai-video-editor-detail-clip--sfx" onClick={() => notify('已定位到音效轨道')}><span>收束音</span></button></div>
                  </div>
                </> : <>
                  <div className="ai-video-editor-track-row">
                    <div className="ai-video-editor-track-label"><Layers3 size={14} /><span>MG 画面</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content">
                      {hasMgLayers ? <div className="ai-video-editor-mg-clip"><Layers3 size={13} /> 6 个 MG 镜头与文字层 <span>33s</span></div> : <button type="button" className="ai-video-editor-empty-track" onClick={() => notify('请先确认分镜方案')}><Plus size={13} /> 确认分镜后生成画面</button>}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row">
                    <div className="ai-video-editor-track-label"><Subtitles size={14} /><span>字幕</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content">
                      {hasCaptions || hasMgLayers ? <div className="ai-video-editor-caption-clip"><Subtitles size={13} /> {hasMgLayers ? '文字层 / 字幕' : '自动字幕'} <span>72.2s</span></div> : <button type="button" className="ai-video-editor-empty-track" onClick={() => handleSend('给视频加上自动字幕')}><Plus size={13} /> 点击让 AI 生成字幕</button>}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row">
                    <div className="ai-video-editor-track-label"><AudioLines size={14} /><span>{hasVoiceover ? '声音' : '音频'}</span><MoreHorizontal size={14} /></div>
                    <div className="ai-video-editor-track-content">
                      {hasVoiceover || hasMusic ? <div className="ai-video-editor-audio-clip"><div className="ai-video-editor-waveform">{Array.from({ length: 54 }, (_, index) => <i key={index} style={{ height: `${14 + ((index * 17) % 28)}%` }} />)}</div><span><FileAudio size={12} /> {hasVoiceover ? `${selectedVoice} · 旁白音频` : 'Morning Lights · AI 推荐'}</span></div> : <button type="button" className="ai-video-editor-empty-track" onClick={() => handleSend('给视频配一首轻快的音乐')}><Plus size={13} /> 添加背景音乐</button>}
                    </div>
                  </div>
                </>}
              </div>
              <div className="ai-video-editor-timeline-footer">
                <span><Layers3 size={13} /> {isFinalTimelineReady ? '7 个轨道 · 全部生成完成' : '4 个轨道'}</span>
                <span><Clock3 size={13} /> 总时长 {formatLongTime(duration)}</span>
                <button type="button" onClick={() => notify('时间线帮助已打开')}><CircleHelp size={14} /></button>
              </div>
            </section>
          </div>
        </main>

        <aside className="ai-video-editor-chat-panel">
          <div className="ai-video-editor-chat-tabs">
            <button type="button" className={activeRightTab === 'chat' ? 'is-active' : ''} onClick={() => setActiveRightTab('chat')}><MessageCircle size={15} /> AI 对话</button>
            <button type="button" className={activeRightTab === 'settings' ? 'is-active' : ''} onClick={() => setActiveRightTab('settings')}><Settings2 size={15} /> 参数</button>
          </div>

          {activeRightTab === 'chat' ? (
            <>
              <div className="ai-video-editor-chat-intro">
                <div className="ai-video-editor-agent-icon"><Film size={15} /></div>
                <div><strong>创客贴 AI</strong><span>视频剪辑 Agent · 阶段 {workflowStage === 'script' ? '1/5' : workflowStage === 'voice' ? '2/5' : workflowStage === 'storyboard' ? '3/5' : workflowStage === 'mg' ? '4/5' : '5/5'}</span></div>
                <button type="button" onClick={() => notify('已新建一轮对话')}><MessageCircle size={15} /></button>
              </div>
              {renderWorkflowContent()}
            </>
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
      {activeTool === 'templates' && <aside className="ai-video-editor-template-panel" aria-label="视频模板面板">
        <div className="ai-video-editor-template-panel__head">
          <div><strong>视频模板</strong><span>按分类选择一个视频结构</span></div>
          <button type="button" onClick={() => setActiveTool('media')} aria-label="关闭模板面板"><X size={17} /></button>
        </div>
        <div className="ai-video-editor-template-categories" role="tablist" aria-label="模板分类">
          {templateCategories.map((category) => <button key={category} type="button" role="tab" aria-selected={activeTemplateCategory === category} className={activeTemplateCategory === category ? 'is-active' : ''} onClick={() => setActiveTemplateCategory(category)}>{category}</button>)}
        </div>
        <div className="ai-video-editor-template-grid">
          {visibleTemplates.map((template) => <button type="button" key={template.id} className="ai-video-editor-template-card" onClick={() => applyVideoTemplate(template)}>
            <span className="ai-video-editor-template-card__poster"><img src={template.poster} alt="" /><span>{template.duration}</span><b>使用模板</b></span>
            <span className="ai-video-editor-template-card__title">{template.title}</span>
            <span className="ai-video-editor-template-card__category">{template.category}</span>
          </button>)}
        </div>
      </aside>}
      {isScriptEditorOpen && <div className="ai-video-editor-modal-backdrop" role="dialog" aria-modal="true" aria-label="编辑脚本">
        <div className="ai-video-editor-fullscreen-modal ai-video-editor-fullscreen-modal--script">
          <div className="ai-video-editor-fullscreen-modal__head"><div><strong>编辑脚本</strong><span>修改旁白后，保存并回到确认脚本卡片</span></div><button type="button" onClick={() => setIsScriptEditorOpen(false)}><X size={18} /></button></div>
          <div className="ai-video-editor-fullscreen-modal__meta"><span>共 {scriptDraft.length} 个段落 · 预计 72 秒</span><span>旁白会同时作为字幕内容</span></div>
          <div className="ai-video-editor-fullscreen-table ai-video-editor-fullscreen-table--script"><div className="ai-video-editor-fullscreen-table__head"><span>段落</span><span>旁白（字幕）</span></div>{scriptDraft.map((row) => <div className="ai-video-editor-fullscreen-table__row" key={row.id}><div><b>片段 {row.id}</b><input value={row.section} onChange={(event) => updateScriptRow(row.id, 'section', event.target.value)} /></div><textarea value={row.narration} onChange={(event) => updateScriptRow(row.id, 'narration', event.target.value)} rows={2} /></div>)}</div>
          <div className="ai-video-editor-fullscreen-modal__foot"><button type="button" className="ai-video-editor-secondary-action" onClick={() => setIsScriptEditorOpen(false)}>收回卡片</button><button type="button" className="ai-video-editor-primary-action" onClick={() => { setIsScriptEditorOpen(false); notify('脚本修改已保存'); }}>保存修改</button><button type="button" className="ai-video-editor-primary-action" onClick={() => { setIsScriptEditorOpen(false); confirmScript(); }}>确认脚本</button></div>
        </div>
      </div>}
      {isStoryboardEditorOpen && <div className="ai-video-editor-modal-backdrop" role="dialog" aria-modal="true" aria-label="编辑分镜">
        <div className="ai-video-editor-fullscreen-modal ai-video-editor-fullscreen-modal--storyboard">
          <div className="ai-video-editor-fullscreen-modal__head"><div><strong>编排 · 分镜表</strong><span>调整镜头时长、画面描述、文字层和音效</span></div><button type="button" onClick={() => setIsStoryboardEditorOpen(false)}><X size={18} /></button></div>
          <div className="ai-video-editor-fullscreen-modal__meta"><span>本方案预计消耗 <b>73–121 积分</b></span><span>画布比例 16:9 · 口播 {selectedVoice}</span></div>
          <div className="ai-video-editor-fullscreen-table ai-video-editor-fullscreen-table--storyboard"><div className="ai-video-editor-fullscreen-table__head"><span>镜头 / 时间</span><span>名称</span><span>视频与动画</span><span>文字层</span><span>时长</span></div>{storyboardDraft.map((row) => <div className="ai-video-editor-fullscreen-table__row" key={row.id}><div><b>第 {row.id} 镜</b><span>{row.time}</span></div><input value={row.title} onChange={(event) => updateStoryboardRow(row.id, 'title', event.target.value)} /><textarea value={row.visual} onChange={(event) => updateStoryboardRow(row.id, 'visual', event.target.value)} rows={3} /><textarea value={row.text} onChange={(event) => updateStoryboardRow(row.id, 'text', event.target.value)} rows={3} /><input value={row.duration} onChange={(event) => updateStoryboardRow(row.id, 'duration', event.target.value)} /></div>)}</div>
          <div className="ai-video-editor-fullscreen-modal__foot"><button type="button" className="ai-video-editor-secondary-action" onClick={() => setIsStoryboardEditorOpen(false)}>收回卡片</button><button type="button" className="ai-video-editor-primary-action" onClick={() => { setIsStoryboardEditorOpen(false); notify('分镜修改已保存'); }}>保存修改</button><button type="button" className="ai-video-editor-primary-action" onClick={() => { setIsStoryboardEditorOpen(false); confirmStoryboard(); }}>确认分镜方案</button></div>
        </div>
      </div>}
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
