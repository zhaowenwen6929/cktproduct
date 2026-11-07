import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignLeft,
  ArrowLeft,
  AudioLines,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileAudio,
  Film,
  FolderOpen,
  Gauge,
  History,
  Image as ImageIcon,
  Layers3,
  LayoutTemplate,
  Lock,
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
  Unlock,
  Upload,
  Volume2,
  VolumeX,
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

type ToolId = 'import' | 'library' | 'templates' | 'media' | 'text';
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

type TimelineTrackId = 'video' | 'mg' | 'captions' | 'text' | 'voiceover' | 'music' | 'sfx';
type TimelineClipKind = 'video' | 'mg' | 'subtitle' | 'text' | 'voice' | 'music' | 'sfx';
type TimelineClip = {
  id: string;
  trackId: TimelineTrackId;
  kind: TimelineClipKind;
  label: string;
  start: number;
  duration: number;
  poster?: string;
};
type TimelineTrackState = {
  id: TimelineTrackId;
  hidden: boolean;
  locked: boolean;
  muted: boolean;
};
type TimelineDragMode = 'move' | 'resize-start' | 'resize-end';
type TimelineDragState = {
  clipId: string;
  mode: TimelineDragMode;
  startX: number;
  trackWidth: number;
  beforeClips: TimelineClip[];
};

const DEFAULT_VIDEO = '/code-video/reference-style-demo-v14-voice.mp4';
const DEFAULT_POSTER = '/code-video/reference-style-demo-v14-poster.png';

const initialUserPrompt = `请制作一支中文科普短片《一颗桑葚，半部中国史》MG动画。
全片结构：整部视频以纯MG演示动画与真实视频共同构成，整体节奏清晰，画面干净，历史感强。插画、素材和文字演示需根据脚本合理放置，所有元素不得超出画布，不得被裁剪
文字动效：字体需清晰易读。标题可使用简体书法字体，正文使用黑体或圆体。关键词可使用高亮、盖章、扫光、弹跳、逐字出现等轻量动效。重点词包括：“起源于中国”“驯化”“桑”“祥瑞”“贡品”“药引”“本草纲目”“完整形态”“1600年”。红色印章只用于关键结论和片尾。
旁白与背景音乐：旁白使用科普片常见的清晰、沉稳声音。BGM使用一段完整配乐，从低沉神秘开始，逐渐加入古琴、鼓点、编钟、暖笛；后半段加入轻电子节拍，片尾用弦乐和钢琴升华。
分镜脚本：
片段0，视频开头。
画面：将透明素材放置在画面左侧，渐隐并滑动出现；枝叶保持轻微风动，背景干净简洁。
文字动效：大标题“一颗桑葚”“半部中国史”采用竖排错位排版，分别逐字出现；副标题“从远古起源到今日见证”淡入；朱红竖排印章“桑葚”落下后转入片段1。
片段1，约1亿年前。
画面：参考生成演示实景视频。文字动效：左侧顶部大标题边框“雅鲁藏布江流域”向右淡入；视频出现2秒后，右侧大标题边框“约1亿年前”“起源于中国”依次出现。
旁白及字幕：约1亿年前，野生桑树诞生在雅鲁藏布江流域，桑葚起源于中国。
片段2，新石器时期。
画面：使用透明素材，依次渐隐出现在画面中心。
文字动效：“桑叶 + 蚕”使用浅绿色图标，“= 驯化”使用红色图标并高亮。
旁白及字幕：新石器时期，先民们在野生桑林中发现了桑叶与蚕，开始了对二者的驯化之旅。
片段3，甲骨文与商朝。
画面：透明素材渐隐出现并向左滑动，与标题居左对齐；“桑”字逐笔写出，随后红色印章“商”随机盖在大字旁边。
文字动效：“桑”字笔画一笔一笔写出，随后放大突出。
旁白及字幕：商朝时，甲骨文中已经出现了蚕、桑、丝等象形字，其中“桑”的象形字多达六种。
片段4，西汉时期。
画面1：使用场景素材，以涂抹方式出现在米色背景中，持续到字幕“宫廷园林中出现白桑树”结束，随后切换到真实影像场景。
画面2：使用场景素材生成真实影像视频，从指定开篇画面开始，到指定结束画面收束，生成一个不间断的连续镜头。全程使用 slow push-in，不停顿；以香炉青烟与烛光光影的弥漫作为衔接媒介，使画面像穿过烟雾一样，从宗庙贡品自然过渡到殿堂赏赐。
文字动效：“西汉宗庙贡品”与英文“IMPERIAL TRIBUTE”分为上下两排，中间用红线分隔并渐隐出现；随后“赏赐功臣”文字依次落下，并用黄线与“IMPERIAL REWARD”进行分割。
旁白：结出的白桑葚被视为祥瑞，并成为贡品，用于祭祀天地、赏赐功臣。
片段5，东汉末年到明朝。
画面1：使用场景素材生成真实影像视频，镜头 slow push-in，逐渐靠近药罐；一只手以正常速度将白桑葚丢进炭炉上的陶制药罐，桑葚落入药汁并溅起水花。
文字动效1：“药引”竖排大字渐隐出现，用竖线与竖排文字“白桑葚入药”分隔。
旁白1：东汉末年，白桑葚被用作药引，帮助百姓治疗疾病。
画面2：使用透明素材，渐隐并位移到画面左侧的米色背景中。
文字动效2：右侧线框古书展开，“本草纲目”以红色书签边框形式竖排放置在古书上；“桑椹·果部第三十三卷”“单食，止消渴，利五脏关节，通血气。久服不饥，安魂镇神，令人聪慧。”横排出现在古书左下角，对齐后渐隐出现。
旁白2：到了明代，李时珍又在《本草纲目》中记下了桑葚的养生之法。
片段6，新石器时期到1950s。
MG画面1：使用透明素材固定在画面右上角，以相框MG形式展示；随后描边圆形在相框左上角弹出，展示MG绘制的黑色小籽粒。
文字动效1：“碳化籽粒”大字渐隐出现，小字“将食用史推回新石器时期。”随后出现；下方居中出现时间轴，由“新石器时期”箭头指引至“1950年代”。
旁白1：二十世纪五十年代，半坡遗址发现的碳化桑葚籽粒，把人们食用桑葚的历史推回到新石器时期。
MG画面2：放大镜扫过黑色小籽粒，进行演示动画后转场；黑色小籽粒被文字折线图标注“唐代桑葚干”以及对应时间。
文字动效：“桑葚干”使用文字折线图进行标注。
旁白2：1959年，阿斯塔那古墓群出土的唐代桑葚干，仍保留着完整形态。
片段7，如今。
画面1：使用场景素材生成真实影像视频。以指定画面为首帧，远景 slow push-in 缓缓推进，展现巨树全貌与身后河流、山脉；随后以指定近景画面为首帧，使用 slow tilt up 自下而上仰拍，突出千年古木的纹理与枝叶细节；最后回到远景，slow pull-out 缓缓拉远，使桑树王与尼洋河、远山同框收束。全程无原生音频。
文字动效1：“约1600年”大字竖排出现，小字“西藏尼洋河畔”依次弹出。
文字动效2：左侧两列行书大字“一颗桑葚”“演绎半部中国史”错位竖排；注解竖排小字“从远古起源到今日见证”出现；朱红印章“桑”落下。
旁白：如今，西藏尼洋河畔一棵约1600年树龄的桑树王仍静静矗立。它是世界上最古老的桑树，也像一位时间的见证者，讲述着一颗桑葚与中国历史的漫长关系。

时长:1:12、画面比例:16:9、字幕:有`;

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'user',
    text: initialUserPrompt,
    time: '刚刚',
  },
  {
    id: 2,
    role: 'assistant',
    text: '收到。我会按“纯 MG 演示动画 + 真实视频”的方式制作这支中文科普短片，保留历史感和干净的画面秩序，确保文字、插画和素材都在 16:9 画布内完整呈现。',
    time: '刚刚',
  },
  {
    id: 3,
    role: 'assistant',
    text: '我已将你的需求整理为 8 个片段：开场、远古起源、新石器驯化、甲骨文与商朝、西汉贡品、东汉至明代药引、考古证据，以及今天的桑树王。片长约 72 秒，画面比例 16:9，并保留字幕。',
  },
  {
    id: 4,
    role: 'assistant',
    text: '脚本、旁白重点、文字动效、配乐情绪和镜头运动已整理完成。请先确认脚本，确认后我会生成口播声音，并按照真实时长编排分镜。',
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
  { id: 'library', label: '资源库', icon: FolderOpen },
  { id: 'templates', label: '模板', icon: LayoutTemplate },
  { id: 'media', label: '素材', icon: Film },
  { id: 'text', label: '文字', icon: TextCursorInput },
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

const mediaCategories = ['全部', '视频', '图片', '透明素材', '音频', '特效'] as const;
type MediaCategory = (typeof mediaCategories)[number];

const mediaAssets: Array<{ id: string; title: string; category: Exclude<MediaCategory, '全部'>; meta: string; poster: string }> = [
  { id: 'valley', title: '雅鲁藏布江河谷', category: '视频', meta: '00:08', poster: '/code-video/reference-style-demo-v11-poster.png' },
  { id: 'mulberry-king', title: '桑树王 · 尼洋河畔', category: '视频', meta: '00:12', poster: '/code-video/reference-style-demo-v13-poster.png' },
  { id: 'oracle', title: '甲骨文 · 桑字', category: '图片', meta: 'PNG', poster: '/code-video/reference-style-demo-v9-poster.png' },
  { id: 'medicine', title: '古籍与药罐', category: '图片', meta: 'JPG', poster: '/code-video/reference-style-demo-v8-poster.png' },
  { id: 'mulberry-branch', title: '桑葚枝叶', category: '透明素材', meta: '透明 PNG', poster: '/code-video/reference-style-demo-v7-poster.png' },
  { id: 'mulberry-seed', title: '碳化籽粒', category: '透明素材', meta: '透明 PNG', poster: '/code-video/reference-style-demo-v5-poster.png' },
  { id: 'narration-pearl', title: 'Pearl · 中文旁白', category: '音频', meta: '72.2s', poster: '/code-video/reference-style-demo-v14-poster.png' },
  { id: 'documentary-music', title: '纪录片配乐 · 低沉神秘', category: '音频', meta: '72 BPM', poster: '/code-video/reference-style-demo-v8-poster.png' },
  { id: 'ink-reveal', title: '墨迹涂抹转场', category: '特效', meta: '转场', poster: '/code-video/reference-style-demo-v9-poster.png' },
  { id: 'stamp-pop', title: '朱红印章盖章', category: '特效', meta: '文字动效', poster: '/code-video/reference-style-demo-v7-poster.png' },
];

const libraryCategories = ['我的素材', '收藏', 'AI生成', '最近使用'] as const;
type LibraryCategory = (typeof libraryCategories)[number];

const libraryAssets: Array<{ id: string; title: string; category: LibraryCategory; detail: string; poster: string }> = [
  { id: 'library-history', title: '桑葚中国史素材包', category: '我的素材', detail: '8 个素材', poster: '/code-video/reference-style-demo-v14-poster.png' },
  { id: 'library-branch', title: '枝叶透明素材', category: '我的素材', detail: '透明 PNG', poster: '/code-video/reference-style-demo-v7-poster.png' },
  { id: 'library-tribute', title: '西汉贡品场景', category: '收藏', detail: '视频片段', poster: '/code-video/reference-style-demo-v8-poster.png' },
  { id: 'library-book', title: '本草纲目古籍', category: '收藏', detail: '图片素材', poster: '/code-video/reference-style-demo-v9-poster.png' },
  { id: 'library-river', title: '远古河谷演示', category: 'AI生成', detail: '视频片段', poster: '/code-video/reference-style-demo-v11-poster.png' },
  { id: 'library-tree', title: '千年桑树王', category: 'AI生成', detail: '视频片段', poster: '/code-video/reference-style-demo-v13-poster.png' },
  { id: 'library-seed', title: '碳化籽粒标注', category: '最近使用', detail: 'MG 素材', poster: '/code-video/reference-style-demo-v5-poster.png' },
  { id: 'library-oracle', title: '甲骨文字形', category: '最近使用', detail: '图片素材', poster: '/code-video/reference-style-demo-v9-poster.png' },
];

const textCategories = ['标题', '正文', '字幕', '标签'] as const;
type TextCategory = (typeof textCategories)[number];

const textPresets: Array<{ id: string; title: string; category: TextCategory; sample: string; detail: string }> = [
  { id: 'title-ink', title: '书法大标题', category: '标题', sample: '一颗桑葚', detail: '简体书法 · 竖排' },
  { id: 'title-documentary', title: '纪录片标题', category: '标题', sample: '半部中国史', detail: '沉稳黑体 · 横排' },
  { id: 'body-clean', title: '清晰正文', category: '正文', sample: '从远古起源到今日见证', detail: '黑体 · 适合说明' },
  { id: 'body-note', title: '注解文字', category: '正文', sample: '野生桑树诞生在雅鲁藏布江流域', detail: '圆体 · 适合注释' },
  { id: 'caption-bottom', title: '底部字幕', category: '字幕', sample: '桑葚起源于中国', detail: '高对比 · 适合旁白' },
  { id: 'caption-highlight', title: '重点字幕', category: '字幕', sample: '起源于中国', detail: '关键词高亮' },
  { id: 'tag-stamp', title: '朱红印章', category: '标签', sample: '祥瑞', detail: '关键结论使用' },
  { id: 'tag-time', title: '时间标签', category: '标签', sample: '约1亿年前', detail: '边框标签' },
];

const scriptRows: ScriptRow[] = [
  { id: 0, section: '片段 0 · 视频开头', narration: '开场无旁白：一颗桑葚，半部中国史。从远古起源到今日见证。' },
  { id: 1, section: '片段 1 · 约1亿年前', narration: '约1亿年前，野生桑树诞生在雅鲁藏布江流域，桑葚起源于中国。' },
  { id: 2, section: '片段 2 · 新石器时期', narration: '新石器时期，先民们在野生桑林中发现了桑叶与蚕，开始了对二者的驯化之旅。' },
  { id: 3, section: '片段 3 · 甲骨文与商朝', narration: '商朝时，甲骨文中已经出现了蚕、桑、丝等象形字，其中“桑”的象形字多达六种。' },
  { id: 4, section: '片段 4 · 西汉时期', narration: '结出的白桑葚被视为祥瑞，并成为贡品，用于祭祀天地、赏赐功臣。' },
  { id: 5, section: '片段 5 · 东汉末年到明朝', narration: '东汉末年，白桑葚被用作药引，帮助百姓治疗疾病。到了明代，李时珍又在《本草纲目》中记下了桑葚的养生之法。' },
  { id: 6, section: '片段 6 · 新石器时期到1950s', narration: '二十世纪五十年代，半坡遗址发现的碳化桑葚籽粒，把人们食用桑葚的历史推回到新石器时期。1959年，阿斯塔那古墓群出土的唐代桑葚干，仍保留着完整形态。' },
  { id: 7, section: '片段 7 · 如今', narration: '如今，西藏尼洋河畔一棵约1600年树龄的桑树王仍静静矗立。它是世界上最古老的桑树，也像一位时间的见证者，讲述着一颗桑葚与中国历史的漫长关系。' },
];

const storyboardRows: StoryboardRow[] = [
  { id: 0, time: '00:00', title: '片段 0 · 一颗桑葚', visual: '透明枝叶与桑葚从左侧渐隐滑入，保持轻微风动；标题竖排错位出现，朱红印章落下后转场。', text: '一颗桑葚，半部中国史', duration: '5s' },
  { id: 1, time: '00:05', title: '片段 1 · 雅鲁藏布江流域', visual: '河谷远景与桑树实景结合，镜头 slow push-in；左侧出现雅鲁藏布江流域，右侧依次出现约1亿年前、起源于中国。', text: '桑葚起源于中国', duration: '6.4s' },
  { id: 2, time: '00:11', title: '片段 2 · 桑叶与蚕', visual: '桑叶和蚕的透明素材依次出现在画面中心，以浅绿色图标连接到红色“驯化”结论。', text: '从野生桑林到驯化', duration: '7.1s' },
  { id: 3, time: '00:18', title: '片段 3 · 甲骨文与商朝', visual: '甲骨文素材向左滑入并对齐标题，“桑”字逐笔写出放大，红色“商”印章盖在大字旁。', text: '“桑”的象形字多达六种', duration: '8.1s' },
  { id: 4, time: '00:26', title: '片段 4 · 西汉贡品', visual: '米色背景中的宫廷园林与白桑树涂抹出现，随后穿过香炉青烟和烛光过渡到宗庙贡品与殿堂赏赐。', text: '祥瑞 · 贡品 · 赏赐功臣', duration: '10s' },
  { id: 5, time: '00:36', title: '片段 5 · 药引与本草纲目', visual: '镜头 slow push-in 靠近药罐，白桑葚落入药汁；随后线框古书展开，红色书签标出“本草纲目”。', text: '药引 · 本草纲目', duration: '10s' },
  { id: 6, time: '00:46', title: '片段 6 · 碳化籽粒', visual: '相框 MG 展示黑色小籽粒，时间轴从新石器时期指向1950年代；放大镜扫过籽粒并标注唐代桑葚干。', text: '完整形态，留住1600年的时间线', duration: '12s' },
  { id: 7, time: '00:58', title: '片段 7 · 桑树王', visual: '尼洋河与远山中的桑树王由远景推进至树干细节，再 slow pull-out 回到全景收束。', text: '约1600年 · 一颗桑葚，演绎半部中国史', duration: '14s' },
];

const timelineSegmentStarts = [0, 5, 11.4, 18.5, 26.6, 36.6, 46.6, 58.6];
const timelineSegmentDurations = [5, 6.4, 7.1, 8.1, 10, 10, 12, 13.6];

const initialTimelineTracks: TimelineTrackState[] = [
  { id: 'video', hidden: false, locked: false, muted: false },
  { id: 'mg', hidden: false, locked: false, muted: false },
  { id: 'captions', hidden: false, locked: false, muted: false },
  { id: 'text', hidden: false, locked: false, muted: false },
  { id: 'voiceover', hidden: false, locked: false, muted: false },
  { id: 'music', hidden: false, locked: false, muted: false },
  { id: 'sfx', hidden: false, locked: false, muted: false },
];

const initialTimelineClips: TimelineClip[] = [
  { id: 'video-main', trackId: 'video', kind: 'video', label: '灵感短片 · 版本 01', start: 0, duration: 72.2, poster: DEFAULT_POSTER },
  ...scriptRows.map((row, index) => ({
    id: `caption-${row.id}`,
    trackId: 'captions' as const,
    kind: 'subtitle' as const,
    label: row.narration,
    start: timelineSegmentStarts[index],
    duration: timelineSegmentDurations[index],
  })),
  ...storyboardRows.map((row, index) => ({
    id: `mg-${row.id}`,
    trackId: 'mg' as const,
    kind: 'mg' as const,
    label: row.title.replace(/片段 \d+ · /, ''),
    start: timelineSegmentStarts[index],
    duration: timelineSegmentDurations[index],
    poster: DEFAULT_POSTER,
  })),
  ...storyboardRows.map((row, index) => ({
    id: `text-${row.id}`,
    trackId: 'text' as const,
    kind: 'text' as const,
    label: row.text,
    start: timelineSegmentStarts[index],
    duration: timelineSegmentDurations[index],
  })),
  ...scriptRows.map((row, index) => ({
    id: `voice-${row.id}`,
    trackId: 'voiceover' as const,
    kind: 'voice' as const,
    label: `Pearl · ${row.id.toString().padStart(2, '0')}`,
    start: timelineSegmentStarts[index],
    duration: timelineSegmentDurations[index],
  })),
  { id: 'music-main', trackId: 'music', kind: 'music', label: '低沉神秘的纪录片配乐 · 72 BPM', start: 0, duration: 72.2 },
  { id: 'sfx-paper', trackId: 'sfx', kind: 'sfx', label: '纸张翻页', start: 26, duration: 2 },
  { id: 'sfx-wind', trackId: 'sfx', kind: 'sfx', label: '轻微沙沙声', start: 58, duration: 3 },
  { id: 'sfx-end', trackId: 'sfx', kind: 'sfx', label: '收束音', start: 69.5, duration: 2.7 },
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
  const [openToolPanelId, setOpenToolPanelId] = useState<ToolId | null>(null);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<TemplateCategory>('全部');
  const [activeMediaCategory, setActiveMediaCategory] = useState<MediaCategory>('全部');
  const [activeLibraryCategory, setActiveLibraryCategory] = useState<LibraryCategory>('我的素材');
  const [activeTextCategory, setActiveTextCategory] = useState<TextCategory>('标题');
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
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('版本 01');
  const [zoom, setZoom] = useState(72);
  const [timelineTracks, setTimelineTracks] = useState<TimelineTrackState[]>(initialTimelineTracks);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>(initialTimelineClips);
  const [selectedTimelineClipId, setSelectedTimelineClipId] = useState<string | null>('video-main');
  const [timelineHistory, setTimelineHistory] = useState<TimelineClip[][]>([]);
  const [timelineRedo, setTimelineRedo] = useState<TimelineClip[][]>([]);
  const [timelineDrag, setTimelineDrag] = useState<TimelineDragState | null>(null);
  const timelineClipsRef = useRef<TimelineClip[]>(initialTimelineClips);
  const [showToast, setShowToast] = useState('');
  const notify = (message: string) => setShowToast(message);
  const projectTitle = videoName.split(' · ')[0] || videoName;

  useEffect(() => {
    if (messages.length === initialMessages.length && !isThinking) return;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    timelineClipsRef.current = timelineClips;
  }, [timelineClips]);

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
  const timelineDuration = Math.max(duration, 1);

  const seekTo = (nextTime: number) => {
    const safeTime = Math.max(0, Math.min(duration, nextTime));
    setCurrentTime(safeTime);
    if (videoRef.current) videoRef.current.currentTime = safeTime;
  };

  const getTimelineTrack = (trackId: TimelineTrackId) => timelineTracks.find((track) => track.id === trackId);

  const commitTimelineChange = (nextClips: TimelineClip[], message?: string) => {
    setTimelineHistory((items) => [...items, timelineClipsRef.current].slice(-30));
    setTimelineRedo([]);
    setTimelineClips(nextClips);
    if (message) notify(message);
  };

  const undoTimeline = () => {
    const previous = timelineHistory[timelineHistory.length - 1];
    if (!previous) {
      notify('没有可撤销的剪辑操作');
      return;
    }
    setTimelineHistory((items) => items.slice(0, -1));
    setTimelineRedo((items) => [...items, timelineClipsRef.current]);
    setTimelineClips(previous);
    notify('已撤销剪辑操作');
  };

  const redoTimeline = () => {
    const next = timelineRedo[timelineRedo.length - 1];
    if (!next) {
      notify('没有可重做的剪辑操作');
      return;
    }
    setTimelineRedo((items) => items.slice(0, -1));
    setTimelineHistory((items) => [...items, timelineClipsRef.current].slice(-30));
    setTimelineClips(next);
    notify('已重做剪辑操作');
  };

  const toggleTimelineTrack = (trackId: TimelineTrackId, key: 'hidden' | 'locked' | 'muted') => {
    setTimelineTracks((items) => items.map((track) => track.id === trackId ? { ...track, [key]: !track[key] } : track));
    if (trackId === 'video' && key === 'muted') setIsMuted((value) => !value);
  };

  const startTimelineDrag = (event: React.PointerEvent, clip: TimelineClip, mode: TimelineDragMode) => {
    const track = getTimelineTrack(clip.trackId);
    if (track?.locked) {
      notify('该轨道已锁定');
      return;
    }
    const trackContent = (event.currentTarget as HTMLElement).closest('.ai-video-editor-track-content');
    const trackWidth = trackContent?.getBoundingClientRect().width || 1;
    event.stopPropagation();
    setSelectedTimelineClipId(clip.id);
    setTimelineDrag({ clipId: clip.id, mode, startX: event.clientX, trackWidth, beforeClips: timelineClipsRef.current });
  };

  useEffect(() => {
    if (!timelineDrag) return;
    const handlePointerMove = (event: PointerEvent) => {
      const activeClip = timelineClipsRef.current.find((clip) => clip.id === timelineDrag.clipId);
      if (!activeClip) return;
      const delta = ((event.clientX - timelineDrag.startX) / timelineDrag.trackWidth) * timelineDuration;
      setTimelineClips((items) => items.map((clip) => {
        if (clip.id !== timelineDrag.clipId) return clip;
        if (timelineDrag.mode === 'move') {
          return { ...clip, start: Math.max(0, Math.min(timelineDuration - clip.duration, activeClip.start + delta)) };
        }
        if (timelineDrag.mode === 'resize-start') {
          const nextStart = Math.max(0, Math.min(activeClip.start + activeClip.duration - 0.2, activeClip.start + delta));
          return { ...clip, start: nextStart, duration: activeClip.start + activeClip.duration - nextStart };
        }
        return { ...clip, duration: Math.max(0.2, Math.min(timelineDuration - activeClip.start, activeClip.duration + delta)) };
      }));
    };
    const handlePointerUp = () => {
      setTimelineHistory((items) => [...items, timelineDrag.beforeClips].slice(-30));
      setTimelineRedo([]);
      setTimelineDrag(null);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [timelineDrag, timelineDuration]);

  const splitSelectedTimelineClip = () => {
    const clip = timelineClips.find((item) => item.id === selectedTimelineClipId);
    if (!clip) {
      notify('请先选择时间线片段');
      return;
    }
    if (getTimelineTrack(clip.trackId)?.locked) {
      notify('该轨道已锁定');
      return;
    }
    if (currentTime <= clip.start + 0.2 || currentTime >= clip.start + clip.duration - 0.2) {
      notify('请将播放头放在片段内部再分割');
      return;
    }
    const leftDuration = currentTime - clip.start;
    const rightDuration = clip.duration - leftDuration;
    const stamp = Date.now();
    const leftClip = { ...clip, id: `${clip.id}-a-${stamp}`, duration: leftDuration, label: `${clip.label} · 片段 1` };
    const rightClip = { ...clip, id: `${clip.id}-b-${stamp}`, start: currentTime, duration: rightDuration, label: `${clip.label} · 片段 2` };
    commitTimelineChange(timelineClips.flatMap((item) => item.id === clip.id ? [leftClip, rightClip] : [item]), '已按播放头分割片段');
    setSelectedTimelineClipId(rightClip.id);
  };

  const deleteSelectedTimelineClip = () => {
    const clip = timelineClips.find((item) => item.id === selectedTimelineClipId);
    if (!clip) {
      notify('请先选择时间线片段');
      return;
    }
    if (clip.id === 'video-main') {
      notify('主视频轨道不能删除');
      return;
    }
    if (getTimelineTrack(clip.trackId)?.locked) {
      notify('该轨道已锁定');
      return;
    }
    commitTimelineChange(timelineClips.filter((item) => item.id !== clip.id), '已删除选中片段');
    setSelectedTimelineClipId(null);
  };

  const timelineClipStyle = (clip: TimelineClip) => ({
    left: `${(clip.start / timelineDuration) * 100}%`,
    width: `${(clip.duration / timelineDuration) * 100}%`,
  });

  const renderTimelineClip = (clip: TimelineClip, className: string, content: React.ReactNode) => {
    const track = getTimelineTrack(clip.trackId);
    if (track?.hidden) return null;
    const isSelected = selectedTimelineClipId === clip.id;
    return (
      <button
        type="button"
        className={`${className}${isSelected ? ' is-selected' : ''}${track?.locked ? ' is-locked' : ''}`}
        style={timelineClipStyle(clip)}
        onPointerDown={(event) => startTimelineDrag(event, clip, 'move')}
        onClick={(event) => { event.stopPropagation(); setSelectedTimelineClipId(clip.id); }}
      >
        {content}
        {isSelected && !track?.locked && <>
          <span className="ai-video-editor-timeline-clip-handle ai-video-editor-timeline-clip-handle--start" onPointerDown={(event) => startTimelineDrag(event, clip, 'resize-start')} />
          <span className="ai-video-editor-timeline-clip-handle ai-video-editor-timeline-clip-handle--end" onPointerDown={(event) => startTimelineDrag(event, clip, 'resize-end')} />
        </>}
      </button>
    );
  };

  const renderTimelineTrackLabel = (trackId: TimelineTrackId, icon: React.ReactNode, label: string) => {
    const track = getTimelineTrack(trackId);
    if (!track) return null;
    const isAudioTrack = trackId === 'voiceover' || trackId === 'music' || trackId === 'sfx';
    return (
      <div className={`ai-video-editor-track-label${track.hidden ? ' is-hidden' : ''}`}>
        <span className="ai-video-editor-track-label__name"><span className="ai-video-editor-track-icon">{icon}</span><span>{label}</span></span>
        <div className="ai-video-editor-track-controls">
          <button type="button" className="ai-video-editor-track-control" onClick={() => toggleTimelineTrack(trackId, 'hidden')} aria-label={`${track.hidden ? '显示' : '隐藏'}${label}`} title={`${track.hidden ? '显示' : '隐藏'}${label}`}>{track.hidden ? <EyeOff size={12} /> : <Eye size={12} />}</button>
          <button type="button" className="ai-video-editor-track-control" onClick={() => toggleTimelineTrack(trackId, 'locked')} aria-label={`${track.locked ? '解锁' : '锁定'}${label}`} title={`${track.locked ? '解锁' : '锁定'}${label}`}>{track.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
          {isAudioTrack && <button type="button" className="ai-video-editor-track-control" onClick={() => toggleTimelineTrack(trackId, 'muted')} aria-label={`${track.muted ? '取消静音' : '静音'}${label}`} title={`${track.muted ? '取消静音' : '静音'}${label}`}><VolumeX size={12} /></button>}
        </div>
      </div>
    );
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
    setTimelineClips((items) => items.map((clip) => clip.id === 'video-main' ? { ...clip, label: file.name, poster: '' } : clip));
    setTimelineHistory([]);
    setTimelineRedo([]);
    setSelectedTimelineClipId('video-main');
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
      { id: Date.now(), role: 'user', text: '确认生成 · 8 个视频 · 共 72s · 16:9' },
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
    () => activeTool === 'import' ? '导入' : toolItems.find((item) => item.id === activeTool)?.label ?? '素材',
    [activeTool]
  );

  const openToolPanel = (tool: ToolId) => {
    setActiveTool(tool);
    setOpenToolPanelId(tool);
  };

  const visibleTemplates = useMemo(
    () => activeTemplateCategory === '全部'
      ? videoTemplates
      : videoTemplates.filter((template) => template.category === activeTemplateCategory),
    [activeTemplateCategory]
  );

  const visibleMediaAssets = useMemo(
    () => activeMediaCategory === '全部'
      ? mediaAssets
      : mediaAssets.filter((asset) => asset.category === activeMediaCategory),
    [activeMediaCategory]
  );

  const visibleLibraryAssets = useMemo(
    () => libraryAssets.filter((asset) => asset.category === activeLibraryCategory),
    [activeLibraryCategory]
  );

  const visibleTextPresets = useMemo(
    () => textPresets.filter((preset) => preset.category === activeTextCategory),
    [activeTextCategory]
  );

  const applyVideoTemplate = (template: (typeof videoTemplates)[number]) => {
    setVideoSource(DEFAULT_VIDEO);
    setPoster(template.poster);
    setVideoName(template.title);
    setCurrentTime(0);
    setTimelineClips((items) => items.map((clip) => clip.id === 'video-main' ? { ...clip, label: template.title, poster: template.poster } : clip));
    setTimelineHistory([]);
    setTimelineRedo([]);
    setSelectedTimelineClipId('video-main');
    notify(`已选择模板：${template.title}`);
  };

  const handleVideoMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (videoSource !== DEFAULT_VIDEO && Number.isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
      setTimelineClips((items) => items.map((clip) => clip.id === 'video-main' ? { ...clip, duration: video.duration } : clip));
    }
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
          <div className="ai-video-editor-workflow-heading"><div><strong>确认脚本</strong><span>共 8 个段落 · 约 72 秒</span></div><span className="ai-video-editor-cost">本方案预计消耗 12 积分</span></div>
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
          <div className="ai-video-editor-workflow-heading"><div><strong>确认分镜方案</strong><span>共 8 个镜头 · 约 72 秒 · 16:9</span></div><span className="ai-video-editor-cost">预计消耗 73–121 积分</span></div>
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
          <div className="ai-video-editor-workflow-heading"><div><strong>{mgStatus === 'generating' ? '正在生成 MG 画面与文字' : 'MG 画面与文字已生成'}</strong><span>8 个镜头 · 配乐与音效同步准备</span></div><span className="ai-video-editor-cost">预计消耗约 330 积分</span></div>
          {mgStatus === 'generating' ? <div className="ai-video-editor-mg-loading"><div className="ai-video-editor-mg-loading__icon"><Film size={21} /></div><strong>正在生成 8 个 MG 镜头</strong><span>配乐、音效和文字层会同步合成，请稍候…</span><div className="ai-video-editor-progress"><span /></div></div> : <>
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
          <div className="ai-video-editor-workflow-heading"><div><strong>{finalStatus === 'done' ? '视频生成完成' : '确认生成视频'}</strong><span>8 个视频 · 共 72 秒 · 16:9</span></div></div>
          {finalStatus === 'generating' ? <div className="ai-video-editor-final-loading"><div className="ai-video-editor-final-spinner"><span /></div><strong>正在合成最终视频</strong><span>MG 画面、文字层、口播和配乐正在合成…</span></div> : finalStatus === 'done' ? <div className="ai-video-editor-final-done"><CheckCircle2 size={22} /><strong>完整视频已经生成</strong><span>你可以回到时间线预览，也可以直接导出视频。</span><button type="button" className="ai-video-editor-primary-action" onClick={() => notify('预览窗口已准备好')}><Play size={14} /> 预览视频</button></div> : <><p className="ai-video-editor-workflow-note">所有内容都已确认，确认后将开始生成完整视频，预计需要 2–3 分钟。</p><div className="ai-video-editor-final-summary"><span><FileAudio size={14} /> {selectedVoice} 口播</span><span><Layers3 size={14} /> 8 个 MG 镜头</span><span><Clock3 size={14} /> 72 秒</span></div><div className="ai-video-editor-workflow-actions"><button type="button" className="ai-video-editor-secondary-action" onClick={() => setWorkflowStage('mg')}><Edit3 size={14} /> 返回调整</button><button type="button" className="ai-video-editor-primary-action" onClick={startFinalGeneration}><Play size={14} /> 开始生成</button></div></>}
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
            <strong className="ai-video-editor-work-title">{projectTitle}</strong>
            <button type="button" className="ai-video-editor-version-tag" onClick={() => setIsVersionHistoryOpen(true)} aria-label="切换版本" title="切换版本">
              <span>{selectedVersion}</span>
              <ChevronDown size={12} />
            </button>
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

      <div className={`ai-video-editor-body${isTimelineCollapsed ? ' is-timeline-collapsed' : ''}${isChatCollapsed ? ' is-chat-collapsed' : ''}${isChatExpanded ? ' is-chat-expanded' : ''}`}>
        <aside className="ai-video-editor-left-rail">
          <button type="button" className={`ai-video-editor-rail-add${activeTool === 'import' && openToolPanelId === 'import' ? ' is-active' : ''}`} onClick={() => openToolPanel('import')}>
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
                  onClick={() => openToolPanel(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="ai-video-editor-rail-bottom">
            <button type="button" className="ai-video-editor-rail-tool" onClick={() => notify('快捷键面板即将打开')}><CircleHelp size={18} /><span>帮助</span></button>
          </div>
          <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoUpload} hidden />
        </aside>

        <main className="ai-video-editor-main">
          <div className="ai-video-editor-workspace">
            <section className="ai-video-editor-preview-panel">
              <div className="ai-video-editor-preview-head">
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
                <button
                  type="button"
                  className={`ai-video-editor-timeline-toggle${isTimelineCollapsed ? ' is-collapsed' : ''}`}
                  onClick={() => setIsTimelineCollapsed((value) => !value)}
                  aria-label={isTimelineCollapsed ? '展开剪辑区域' : '收起剪辑区域'}
                  aria-expanded={!isTimelineCollapsed}
                >
                  <ChevronDown size={15} />
                </button>
                <div className="ai-video-editor-player-controls__left">
                  <button type="button" onClick={togglePlay} aria-label={isPlaying ? '暂停' : '播放'}>{isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button>
                  <span>{formatTime(currentTime)} <i>/</i> {formatTime(duration)}</span>
                  <button type="button" onClick={() => setIsMuted((value) => !value)} aria-label={isMuted ? '取消静音' : '静音'}>{isMuted ? <VolumeOffIcon /> : <Volume2 size={16} />}</button>
                </div>
                <div className="ai-video-editor-player-controls__right">
                  <span>自动播放</span>
                  <button type="button" className={`ai-video-editor-toggle${isAutoPlay ? ' is-on' : ''}`} onClick={() => setIsAutoPlay((value) => !value)}><span /></button>
                  <button type="button" className="ai-video-editor-player-ratio" onClick={() => notify('画布比例保持为 16:9')}><span>16:9</span><ChevronDown size={13} /></button>
                  <button type="button" onClick={() => notify('播放速度 1x')}><Gauge size={15} /> 1x</button>
                </div>
              </div>
            </section>
          </div>
        </main>

        <section className={`ai-video-editor-timeline-panel${isFinalTimelineReady ? ' is-complete' : ''}${isTimelineCollapsed ? ' is-collapsed' : ''}`}>
              <div className="ai-video-editor-timeline-head">
                <div className="ai-video-editor-timeline-actions">
                  <button type="button" onClick={undoTimeline} disabled={!timelineHistory.length} aria-label="撤销" title="撤销"><Undo2 size={15} /></button>
                  <button type="button" onClick={redoTimeline} disabled={!timelineRedo.length} aria-label="重做" title="重做"><Redo2 size={15} /></button>
                  <span />
                  <button type="button" onClick={splitSelectedTimelineClip}><Scissors size={15} /> 分割</button>
                  <button type="button" onClick={deleteSelectedTimelineClip}><X size={15} /> 删除</button>
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
                  {renderTimelineTrackLabel('video', <Film size={14} />, '视频')}
                  <div className="ai-video-editor-track-content">
                    <div className="ai-video-editor-playhead" style={{ left: `${progress}%` }}><span /></div>
                    <input aria-label="视频时间线" type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={(event) => seekTo(Number(event.target.value))} />
                    {timelineClips.filter((clip) => clip.trackId === 'video').map((clip) => renderTimelineClip(clip, 'ai-video-editor-video-clip', <>
                      <div className="ai-video-editor-clip-thumbs">
                        {Array.from({ length: 8 }, (_, index) => <img key={index} src={clip.poster || poster || DEFAULT_POSTER} alt="" />)}
                      </div>
                      <div className="ai-video-editor-clip-name"><Film size={13} /> {videoName}</div>
                    </>))}
                  </div>
                </div>
                {isFinalTimelineReady ? <>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    {renderTimelineTrackLabel('captions', <Subtitles size={14} />, '字幕')}
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">
                      {timelineClips.filter((clip) => clip.trackId === 'captions').map((clip) => renderTimelineClip(clip, 'ai-video-editor-detail-clip ai-video-editor-detail-clip--subtitle', <span>{clip.label.slice(0, 14)}{clip.label.length > 14 ? '…' : ''}</span>))}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    {renderTimelineTrackLabel('mg', <Layers3 size={14} />, 'MG 画面')}
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">
                      {timelineClips.filter((clip) => clip.trackId === 'mg').map((clip) => renderTimelineClip(clip, 'ai-video-editor-detail-clip ai-video-editor-detail-clip--mg', <><img src={clip.poster || poster || DEFAULT_POSTER} alt="" /><span>{clip.label}</span></>))}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    {renderTimelineTrackLabel('text', <TextCursorInput size={14} />, '文字层')}
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">
                      {timelineClips.filter((clip) => clip.trackId === 'text').map((clip) => renderTimelineClip(clip, 'ai-video-editor-detail-clip ai-video-editor-detail-clip--text', <span>{clip.label}</span>))}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    {renderTimelineTrackLabel('voiceover', <AudioLines size={14} />, '口播声音')}
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">
                      {timelineClips.filter((clip) => clip.trackId === 'voiceover').map((clip, clipIndex) => renderTimelineClip(clip, 'ai-video-editor-detail-clip ai-video-editor-detail-clip--voice', <><div className="ai-video-editor-mini-wave">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ height: `${22 + ((index * (clipIndex + 2) * 13) % 62)}%` }} />)}</div><span>{clip.label}</span></>))}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    {renderTimelineTrackLabel('music', <Music2 size={14} />, '配乐')}
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">{timelineClips.filter((clip) => clip.trackId === 'music').map((clip) => renderTimelineClip(clip, 'ai-video-editor-detail-clip ai-video-editor-detail-clip--music', <><div className="ai-video-editor-wide-wave">{Array.from({ length: 88 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 19) % 47)}%` }} />)}</div><span>{clip.label}</span></>))}</div>
                  </div>
                  <div className="ai-video-editor-track-row ai-video-editor-detailed-track-row">
                    {renderTimelineTrackLabel('sfx', <AudioLines size={14} />, '音效')}
                    <div className="ai-video-editor-track-content ai-video-editor-detailed-track-content">{timelineClips.filter((clip) => clip.trackId === 'sfx').map((clip) => renderTimelineClip(clip, 'ai-video-editor-detail-clip ai-video-editor-detail-clip--sfx', <span>{clip.label}</span>))}</div>
                  </div>
                </> : <>
                  <div className="ai-video-editor-track-row">
                    {renderTimelineTrackLabel('mg', <Layers3 size={14} />, 'MG 画面')}
                    <div className="ai-video-editor-track-content">
                      {hasMgLayers ? <div className="ai-video-editor-mg-clip"><Layers3 size={13} /> 8 个 MG 镜头与文字层 <span>72s</span></div> : <button type="button" className="ai-video-editor-empty-track" onClick={() => notify('请先确认分镜方案')}><Plus size={13} /> 确认分镜后生成画面</button>}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row">
                    {renderTimelineTrackLabel('captions', <Subtitles size={14} />, '字幕')}
                    <div className="ai-video-editor-track-content">
                      {hasCaptions || hasMgLayers ? <div className="ai-video-editor-caption-clip"><Subtitles size={13} /> {hasMgLayers ? '文字层 / 字幕' : '自动字幕'} <span>72.2s</span></div> : <button type="button" className="ai-video-editor-empty-track" onClick={() => handleSend('给视频加上自动字幕')}><Plus size={13} /> 点击让 AI 生成字幕</button>}
                    </div>
                  </div>
                  <div className="ai-video-editor-track-row">
                    {renderTimelineTrackLabel('voiceover', <AudioLines size={14} />, hasVoiceover ? '声音' : '音频')}
                    <div className="ai-video-editor-track-content">
                      {hasVoiceover || hasMusic ? <div className="ai-video-editor-audio-clip"><div className="ai-video-editor-waveform">{Array.from({ length: 54 }, (_, index) => <i key={index} style={{ height: `${14 + ((index * 17) % 28)}%` }} />)}</div><span><FileAudio size={12} /> {hasVoiceover ? `${selectedVoice} · 旁白音频` : 'Morning Lights · AI 推荐'}</span></div> : <button type="button" className="ai-video-editor-empty-track" onClick={() => handleSend('给视频配一首轻快的音乐')}><Plus size={13} /> 添加背景音乐</button>}
                    </div>
                  </div>
                </>}
              </div>
        </section>

        <aside className="ai-video-editor-chat-panel">
          <div className="ai-video-editor-chat-tabs">
            <button type="button" className={activeRightTab === 'chat' ? 'is-active' : ''} onClick={() => setActiveRightTab('chat')}><MessageCircle size={15} /> AI 对话</button>
            <button type="button" className={activeRightTab === 'settings' ? 'is-active' : ''} onClick={() => setActiveRightTab('settings')}><Settings2 size={15} /> 参数</button>
            <div className="ai-video-editor-chat-panel-actions">
              <button type="button" onClick={() => { setIsChatCollapsed(false); setIsChatExpanded((value) => !value); }} aria-label={isChatExpanded ? '恢复对话宽度' : '展开对话面板'} title={isChatExpanded ? '恢复对话宽度' : '展开对话面板'}>{isChatExpanded ? <ZoomOut size={14} /> : <Maximize2 size={14} />}</button>
              <button type="button" onClick={() => setIsChatCollapsed(true)} aria-label="收起对话面板" title="收起对话面板"><ChevronRight size={15} /></button>
            </div>
          </div>

          {activeRightTab === 'chat' ? (
            <>
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
        {isChatCollapsed && <button type="button" className="ai-video-editor-chat-edge-toggle is-collapsed" onClick={() => setIsChatCollapsed(false)} aria-label="展开对话面板" title="展开对话面板"><ChevronLeft size={15} /></button>}
        {!isChatCollapsed && <button type="button" className="ai-video-editor-chat-edge-toggle" onClick={() => setIsChatCollapsed(true)} aria-label="收起对话面板" title="收起对话面板"><ChevronRight size={15} /></button>}
      </div>
      {openToolPanelId && ['import', 'library', 'templates', 'media', 'text'].includes(openToolPanelId) && <aside className={`ai-video-editor-template-panel ai-video-editor-tool-panel${isTimelineCollapsed ? ' is-timeline-collapsed' : ''}${isFinalTimelineReady ? ' is-timeline-complete' : ''}`} aria-label={`${activeToolTitle}面板`}>
        <div className="ai-video-editor-template-panel__head">
          <div>
            <strong>{openToolPanelId === 'import' ? '导入素材' : openToolPanelId === 'library' ? '资源库' : openToolPanelId === 'templates' ? '视频模板' : openToolPanelId === 'media' ? '素材' : '文字'}</strong>
            <span>{openToolPanelId === 'import' ? '添加视频并整理到当前项目' : openToolPanelId === 'library' ? '浏览项目中可复用的内容' : openToolPanelId === 'templates' ? '按分类选择一个视频结构' : openToolPanelId === 'media' ? '选择视频、图片和透明素材' : '选择一套文字层样式'}</span>
          </div>
          <button type="button" onClick={() => setOpenToolPanelId(null)} aria-label={`关闭${activeToolTitle}面板`}><X size={17} /></button>
        </div>

        {openToolPanelId === 'import' && <div className="ai-video-editor-tool-panel__content">
          <button type="button" className="ai-video-editor-import-dropzone" onClick={() => fileInputRef.current?.click()}>
            <span className="ai-video-editor-import-dropzone__icon"><Upload size={20} /></span>
            <strong>导入视频素材</strong>
            <span>支持 MP4、MOV、WebM，点击选择本地视频</span>
            <b>选择文件</b>
          </button>
          <div className="ai-video-editor-tool-panel__section">
            <div className="ai-video-editor-tool-panel__section-head"><strong>快速添加</strong><span>常用来源</span></div>
            <div className="ai-video-editor-import-options">
              <button type="button" onClick={() => fileInputRef.current?.click()}><Film size={17} /><span>本地视频</span><ChevronRight size={14} /></button>
              <button type="button" onClick={() => notify('素材库已准备好')}><FolderOpen size={17} /><span>素材库</span><ChevronRight size={14} /></button>
              <button type="button" onClick={() => notify('最近使用的素材已展开')}><History size={17} /><span>最近使用</span><ChevronRight size={14} /></button>
            </div>
          </div>
          <p className="ai-video-editor-tool-panel__hint">导入后的视频会自动出现在时间线的视频轨道中</p>
        </div>}

        {openToolPanelId === 'library' && <>
          <div className="ai-video-editor-template-categories" role="tablist" aria-label="资源库分类">
            {libraryCategories.map((category) => <button key={category} type="button" role="tab" aria-selected={activeLibraryCategory === category} className={activeLibraryCategory === category ? 'is-active' : ''} onClick={() => setActiveLibraryCategory(category)}>{category}</button>)}
          </div>
          <div className="ai-video-editor-template-grid ai-video-editor-library-grid">
            {visibleLibraryAssets.map((asset) => <button type="button" key={asset.id} className="ai-video-editor-template-card ai-video-editor-library-card" onClick={() => { setPoster(asset.poster); notify(`已选择素材：${asset.title}`); }}>
              <span className="ai-video-editor-template-card__poster"><img src={asset.poster} alt="" /><b>使用素材</b></span>
              <span className="ai-video-editor-template-card__title">{asset.title}</span>
              <span className="ai-video-editor-template-card__category">{asset.detail}</span>
            </button>)}
          </div>
        </>}

        {openToolPanelId === 'templates' && <>
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
        </>}

        {openToolPanelId === 'media' && <>
          <div className="ai-video-editor-template-categories" role="tablist" aria-label="素材分类">
            {mediaCategories.map((category) => <button key={category} type="button" role="tab" aria-selected={activeMediaCategory === category} className={activeMediaCategory === category ? 'is-active' : ''} onClick={() => setActiveMediaCategory(category)}>{category}</button>)}
          </div>
          <div className="ai-video-editor-template-grid ai-video-editor-media-grid">
            {visibleMediaAssets.map((asset) => <button type="button" key={asset.id} className="ai-video-editor-template-card" onClick={() => { setPoster(asset.poster); notify(`已添加素材：${asset.title}`); }}>
              <span className="ai-video-editor-template-card__poster"><img src={asset.poster} alt="" /><span>{asset.meta}</span><b>添加素材</b></span>
              <span className="ai-video-editor-template-card__title">{asset.title}</span>
              <span className="ai-video-editor-template-card__category">{asset.category}</span>
            </button>)}
          </div>
        </>}

        {openToolPanelId === 'text' && <>
          <div className="ai-video-editor-template-categories" role="tablist" aria-label="文字分类">
            {textCategories.map((category) => <button key={category} type="button" role="tab" aria-selected={activeTextCategory === category} className={activeTextCategory === category ? 'is-active' : ''} onClick={() => setActiveTextCategory(category)}>{category}</button>)}
          </div>
          <div className="ai-video-editor-text-preset-grid">
            {visibleTextPresets.map((preset) => <button type="button" key={preset.id} className={`ai-video-editor-text-preset ai-video-editor-text-preset--${preset.category}`} onClick={() => notify(`已添加文字样式：${preset.title}`)}>
              <span className="ai-video-editor-text-preset__sample">{preset.sample}</span>
              <span className="ai-video-editor-text-preset__title">{preset.title}</span>
              <span className="ai-video-editor-text-preset__detail">{preset.detail}</span>
            </button>)}
          </div>
        </>}
      </aside>}
      {isVersionHistoryOpen && <div className="ai-video-editor-version-backdrop" role="presentation" onClick={() => setIsVersionHistoryOpen(false)}>
        <div className="ai-video-editor-version-modal" role="dialog" aria-modal="true" aria-label="历史版本" onClick={(event) => event.stopPropagation()}>
          <div className="ai-video-editor-version-modal__head">
            <div><strong>历史版本</strong><span>{projectTitle}</span></div>
            <button type="button" onClick={() => setIsVersionHistoryOpen(false)} aria-label="关闭历史版本"><X size={17} /></button>
          </div>
          <div className="ai-video-editor-version-list">
            <button type="button" className={`ai-video-editor-version-item${selectedVersion === '版本 01' ? ' is-current' : ''}`} onClick={() => { setSelectedVersion('版本 01'); setIsVersionHistoryOpen(false); notify('已切换到版本 01'); }}>
              <span className="ai-video-editor-version-item__dot" />
              <span className="ai-video-editor-version-item__copy"><strong>版本 01</strong><em>刚刚 · 当前版本</em><small>已更新脚本、分镜和预览画面</small></span>
              {selectedVersion === '版本 01' ? <Check size={14} /> : <History size={14} />}
            </button>
            <button type="button" className={`ai-video-editor-version-item${selectedVersion === '版本 00' ? ' is-current' : ''}`} onClick={() => { setSelectedVersion('版本 00'); setIsVersionHistoryOpen(false); notify('已切换到版本 00'); }}>
              <span className="ai-video-editor-version-item__dot" />
              <span className="ai-video-editor-version-item__copy"><strong>版本 00</strong><em>今天 10:12</em><small>创建项目并上传原始视频</small></span>
              {selectedVersion === '版本 00' ? <Check size={14} /> : <History size={14} />}
            </button>
          </div>
          <div className="ai-video-editor-version-modal__foot">历史版本会自动保存，选择后可继续预览和编辑</div>
        </div>
      </div>}
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
