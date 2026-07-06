import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Loader2, RefreshCcw, MessageSquarePlus, History, Maximize2, ArrowUp, Plus, Link, X, MessageSquare, Calendar, Clock, Briefcase, Check, ChevronRight, Ban, TriangleAlert, Square, Copy, Pencil, Bot, Image as ImageIcon, Clapperboard, ChevronUp, ChevronDown, SlidersHorizontal, FolderOpen, Music, Upload } from 'lucide-react';
import { ChatMessage, GenerationAttachment, GenerationPlan, GenerationTask, Session } from '../types';
import { BRAND_GROUPS } from '../data/brands';
import { shouldShowBrandToolkit } from '../lib/brandKeywords';
import { BrandToolkitCard } from './BrandToolkitCard';
import { BrandDetailPanel } from './BrandDetailPanel';
import { ResourceLibraryDialog } from './ResourceLibraryDialog';
import { executeGenerationPlan, planGenerationRequest, WorkflowStage, WorkflowStatus } from '../services/generationWorkflow';
import { GenerationError } from '../services/geminiService';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

type NotificationPreferenceScope = 'once' | 'today' | 'always';

interface SidebarProps {
  onAddImage: (url: string) => void;
  onAddVideo: (url: string) => void;
  onAddGeneratedAssets: (attachments: GenerationAttachment[]) => Promise<void> | void;
  input: string;
  onInputChange: (val: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  credits: number;
  onCreditsChange: React.Dispatch<React.SetStateAction<number>>;
  onSessionTitleChange: (title: string) => void;
}

const Tooltip = ({
  text,
  content,
  alignPopover = 'center',
  children,
}: {
  text?: string;
  content?: React.ReactNode;
  alignPopover?: 'center' | 'end';
  children: React.ReactNode;
}) => {
  const rich = content != null;
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div
        className={cn(
          'absolute bottom-full mb-2 bg-gray-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg',
          rich
            ? cn(
                'min-w-[288px] max-w-[340px] px-4 py-3 text-left whitespace-normal',
                alignPopover === 'end' ? 'right-0 left-auto' : 'left-1/2 -translate-x-1/2'
              )
            : 'left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] whitespace-nowrap'
        )}
      >
        {rich ? content : text}
        <div
          className={cn(
            'absolute top-full border-4 border-transparent border-t-gray-800',
            alignPopover === 'end' && rich ? 'right-3 left-auto' : 'left-1/2 -translate-x-1/2'
          )}
        />
      </div>
    </div>
  );
};

const BRAND_MANAGE_URL = 'https://www.chuangkit.com/brand'; // 品牌管理外部链接，可按需替换
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const GENERATING_HINT_DELAY_MS = 5000;
const GENERATING_ESTIMATE_MS = 120000;
const GENERATING_HINT_TEXT = '亲爱的用户，由于近期需求增长，算力紧张，生成任务排队较多，出图变慢且偶有波动，请大家耐心等待~';
const NOTIFICATION_PREFERENCE_STORAGE_KEY = 'generation_notification_preference';
const CANCEL_PRD_URL = 'https://github.com/zhaowenwen6929/cktproduct/blob/main/docs/%E7%94%9F%E6%88%90%E4%BB%BB%E5%8A%A1%E5%8F%96%E6%B6%88%E4%B8%8E%E6%85%A2%E6%8F%90%E9%86%92%E9%9C%80%E6%B1%82%E6%96%87%E6%A1%A3.md';
const GENERATING_DEMO_DURATION_MS = 14800;
const PERFUME_DEMO_IMAGES = [
  'https://picsum.photos/seed/perfume-candle-1/720/960',
  'https://picsum.photos/seed/perfume-candle-2/720/960',
  'https://picsum.photos/seed/perfume-candle-3/720/960',
  'https://picsum.photos/seed/perfume-candle-4/720/960',
];
const DEMO_REFERENCE_ATTACHMENT: GenerationAttachment = {
  id: 'demo-reference-image',
  type: 'image',
  url: '/demo-perfume-reference.png',
  name: '图片',
};
const isPerfumeDemoPrompt = (prompt: string, attachments: GenerationAttachment[]) =>
  /米色蜡烛/.test(prompt) &&
  /白色花朵/.test(prompt) &&
  /产品摄影风格/.test(prompt) &&
  attachments.some((attachment) => attachment.type === 'image');

const applyGenerationModeHint = (prompt: string, mode: 'agent' | 'image' | 'video') => {
  if (mode === 'video' && !/视频|动图|短片|短视频|动画/i.test(prompt)) {
    return `${prompt}\n\n请将以上内容生成为一段短视频。`;
  }
  if (mode === 'image' && /视频|动图|短片|短视频|动画/i.test(prompt)) {
    return `${prompt}\n\n请改为输出静态图片结果。`;
  }
  return prompt;
};

const deriveDesignTitle = (prompt: string) => {
  const normalized = prompt
    .replace(/\s+/g, '')
    .replace(/[，。、“”"'‘’：:；;！!？?（）()\[\]【】]/g, ' ')
    .trim();

  const preferredPatterns = [
    /(海报|主视觉|KV|Banner|横幅|封面|详情页|场景图|产品图|产品摄影图|Logo|品牌视觉|视频)/i,
    /(香水|蜡烛|花朵|石块|电商|劳动节|母亲节|咖啡|美妆|护肤|服饰|珠宝)/i,
  ];

  const picked: string[] = [];
  preferredPatterns.forEach((pattern) => {
    const match = normalized.match(pattern);
    if (match?.[0]) picked.push(match[0]);
  });

  let title = picked.join('');
  if (!title) {
    title = normalized.slice(0, 10);
  }

  title = title
    .replace(/生成|设计|制作|一个|一张|一套|以上传图中的商品为主体/g, '')
    .trim();

  if (!title) {
    title = normalized.slice(0, 10);
  }

  return title.slice(0, 10) || '设计任务';
};

const getAttachmentDisplayLabel = (attachment: GenerationAttachment) => {
  if (attachment.displayTypeLabel) return attachment.displayTypeLabel;
  if (attachment.type === 'video') return '视频';
  if (attachment.type === 'audio') return '音频';
  return '图片';
};

type VideoInputMode = 'text' | 'frames' | 'reference';
type VideoReferenceSlotId = 'frame-start' | 'frame-end' | 'ref-image' | 'ref-video' | 'ref-audio';
type VideoModelId = 'seedance-20' | 'seedance-20-fast' | 'seedance-15-pro' | 'kling-v25-turbo' | 'kling-v26';
type ImageModelId = 'gpt-image-2-low' | 'gpt-image-2-medium' | 'gpt-image-2-high' | 'auto';
type VideoParameterKey = 'ratio' | 'duration' | 'resolution';
type ImageParameterKey = 'ratio';
type LibraryTab = 'image' | 'video' | 'audio' | 'model';

type AnnotationBadgeProps = {
  id: number;
  moduleName: string;
  detail: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement | null>;
  portalRoot: HTMLElement | null;
  positionCache?: { x: number; y: number };
  badgeOffset?: { top: number; right: number };
};

const AnnotationBadge = ({
  id,
  moduleName,
  detail,
  anchorRef,
  portalRoot,
  positionCache,
  badgeOffset = { top: -8, right: -4 },
}: AnnotationBadgeProps) => {
  const [open, setOpen] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(positionCache ?? null);
  const [dragState, setDragState] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [layout, setLayout] = useState<{ badgeX: number; badgeY: number; tooltipX: number; tooltipY: number } | null>(null);

  useEffect(() => {
    if (!portalRoot || !anchorRef.current) return;

    const updateLayout = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const badgeX = rect.right + badgeOffset.right;
      const badgeY = rect.top + badgeOffset.top;
      const defaultTooltipX = badgeX - 450;
      const defaultTooltipY = badgeY + 22;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 450;
      const tooltipHeight = 260;
      let tooltipX = dragPosition?.x ?? defaultTooltipX;
      let tooltipY = dragPosition?.y ?? defaultTooltipY;

      if (!dragPosition) {
        if (tooltipX < 8) tooltipX = 8;
        if (tooltipX + tooltipWidth > viewportWidth - 8) tooltipX = Math.max(8, viewportWidth - tooltipWidth - 8);
        if (tooltipY + tooltipHeight > viewportHeight - 8) {
          tooltipY = Math.max(8, badgeY - tooltipHeight - 8);
        }
      }

      setLayout({ badgeX, badgeY, tooltipX, tooltipY });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, true);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout, true);
    };
  }, [anchorRef, portalRoot, badgeOffset.right, badgeOffset.top, dragPosition]);

  useEffect(() => {
    if (!dragState) return;

    const handleMove = (event: MouseEvent) => {
      event.preventDefault();
      setDragPosition({
        x: dragState.originX + event.clientX - dragState.startX,
        y: dragState.originY + event.clientY - dragState.startY,
      });
    };

    const handleUp = () => setDragState(null);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragState]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`[data-annotation-root="${id}"]`)) {
        return;
      }
      event.stopPropagation();
    };

    window.addEventListener('mousedown', handleMouseDown, true);
    return () => window.removeEventListener('mousedown', handleMouseDown, true);
  }, [id, open]);

  if (!portalRoot || !layout) return null;

  return createPortal(
    <>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        style={{
          position: 'fixed',
          left: layout.badgeX,
          top: layout.badgeY,
          display: 'inline-block',
          verticalAlign: 'top',
          background: 'rgb(250, 173, 20)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 700,
          lineHeight: '14px',
          padding: '0 4px',
          borderRadius: '2px',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9999,
        }}
      >
        {id}
      </button>
      {open && (
        <div
          data-annotation-root={id}
          style={{
            position: 'fixed',
            left: layout.tooltipX,
            top: layout.tooltipY,
            width: 450,
            background: '#f0efef',
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
            zIndex: 9999,
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onWheel={(event) => event.stopPropagation()}
        >
          <div
            style={{ cursor: 'move', padding: '12px 12px 0 12px' }}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragState({
                startX: event.clientX,
                startY: event.clientY,
                originX: layout.tooltipX,
                originY: layout.tooltipY,
              });
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{moduleName}</div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                }}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: 12 }}
              >
                X
              </button>
            </div>
          </div>
          <div style={{ padding: '8px 12px 12px 12px', fontSize: 12, lineHeight: 1.6, color: '#374151' }}>{detail}</div>
        </div>
      )}
    </>,
    portalRoot
  );
};

const SlowHintAnnotation = ({
  anchorRef,
  portalRoot,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  portalRoot: HTMLElement | null;
}) => (
  <AnnotationBadge
    id={1}
    moduleName="生成中慢提醒"
    anchorRef={anchorRef}
    portalRoot={portalRoot}
    positionCache={{ x: 0, y: 0 }}
    detail={<>
      <div><strong>显示样式：</strong>任务进入 `generating` 阶段且超过 5 秒未返回预览结果时，在生成面板内展示慢提醒文案；采用逐字展示效果。</div>
      <div className="mt-2"><strong>交互与排序：</strong>仅在 `generating` 阶段显示；若任务被取消、结果已返回，或用户已开启完成提醒，则慢提醒区域不再继续展示。</div>
      <div className="mt-2"><strong>业务定义：</strong>该模块属于“生成过程支持取消”链路的一部分，用于在正式生成阶段向用户解释当前变慢原因，并与取消任务、完成通知形成联动。</div>
      <div className="mt-2"><strong>备注：</strong>完整取消规则、积分处理、确认弹窗与异常边界见 <a href="https://github.com/zhaowenwen6929/cktproduct/blob/main/docs/%E7%94%9F%E6%88%90%E4%BB%BB%E5%8A%A1%E5%8F%96%E6%B6%88%E4%B8%8E%E6%85%A2%E6%8F%90%E9%86%92%E9%9C%80%E6%B1%82%E6%96%87%E6%A1%A3.md" target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>需求文档</a>。</div>
    </>}
  />
);

const getGenerationFailureMessage = (error: unknown, refundedCredits: number) => {
  const prefix = `任务执行失败，已为您返还 ${refundedCredits} 积分。`;

  if (error instanceof GenerationError) {
    return `${prefix}${error.message} 请处理后重试。`;
  }

  if (error instanceof Error && error.message) {
    return `${prefix}${error.message} 请稍后重试。`;
  }

  return `${prefix}请稍后重试。`;
};

const typewrite = async (
  text: string,
  onChunk: (value: string) => void,
  isCancelled?: () => boolean,
  step = 34,
) => {
  let current = '';
  for (const char of text) {
    if (isCancelled?.()) return;
    current += char;
    onChunk(current);
    await wait(step);
  }
};

const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const readStoredNotificationPreference = (): Extract<NotificationPreferenceScope, 'today' | 'always'> | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_PREFERENCE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { scope?: 'today' | 'always'; date?: string };
    if (parsed.scope === 'always') return 'always';

    if (parsed.scope === 'today' && parsed.date === getLocalDateKey()) {
      return 'today';
    }

    window.localStorage.removeItem(NOTIFICATION_PREFERENCE_STORAGE_KEY);
  } catch {
    window.localStorage.removeItem(NOTIFICATION_PREFERENCE_STORAGE_KEY);
  }

  return null;
};

const writeStoredNotificationPreference = (scope: Extract<NotificationPreferenceScope, 'today' | 'always'> | null) => {
  if (typeof window === 'undefined') return;

  if (!scope) {
    window.localStorage.removeItem(NOTIFICATION_PREFERENCE_STORAGE_KEY);
    return;
  }

  const payload = scope === 'always'
    ? { scope }
    : { scope, date: getLocalDateKey() };

  window.localStorage.setItem(NOTIFICATION_PREFERENCE_STORAGE_KEY, JSON.stringify(payload));
};

export const Sidebar: React.FC<SidebarProps> = ({ onAddImage, onAddVideo, onAddGeneratedAssets, input, onInputChange, isCollapsed, onToggleCollapse, credits, onCreditsChange, onSessionTitleChange }) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [debugNoBrandData, setDebugNoBrandData] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      title: '简约咖啡猫LOGO设计',
      messages: [],
      timestamp: Date.now()
    },
    {
      id: '2',
      title: '电商场景图生成',
      messages: [],
      timestamp: Date.now() - 86400000 // Yesterday
    },
    {
      id: '3',
      title: '品牌视觉方案',
      messages: [],
      timestamp: Date.now() - 86400000 * 3 // 3 days ago
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('1');
  const [showHistory, setShowHistory] = useState(false);
  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showResourceLibraryDialog, setShowResourceLibraryDialog] = useState(false);
  const [resourceLibraryInitialTab, setResourceLibraryInitialTab] = useState<LibraryTab | undefined>(undefined);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [brandDetailOpen, setBrandDetailOpen] = useState(false);
  const [brandDetailBrandId, setBrandDetailBrandId] = useState<string | null>(null);
  const [pendingBrandPrompt, setPendingBrandPrompt] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<GenerationAttachment[]>([]);
  const [generationMode, setGenerationMode] = useState<'agent' | 'image' | 'video'>('agent');
  const [videoInputMode, setVideoInputMode] = useState<VideoInputMode>('text');
  const [showVideoInputModeMenu, setShowVideoInputModeMenu] = useState(false);
  const [videoReferenceTarget, setVideoReferenceTarget] = useState<VideoReferenceSlotId | null>(null);
  const [videoReferenceMenuSlotId, setVideoReferenceMenuSlotId] = useState<VideoReferenceSlotId | null>(null);
  const [videoReferenceSlots, setVideoReferenceSlots] = useState<Record<VideoReferenceSlotId, GenerationAttachment | null>>({
    'frame-start': null,
    'frame-end': null,
    'ref-image': null,
    'ref-video': null,
    'ref-audio': null,
  });
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [modelPreference, setModelPreference] = useState<ImageModelId>('auto');
  const [showModelPreferenceDialog, setShowModelPreferenceDialog] = useState(false);
  const [modelPreferenceTab, setModelPreferenceTab] = useState<'image' | 'video'>('image');
  const [isModelPreferenceEnabled, setIsModelPreferenceEnabled] = useState(false);
  const [agentImageModelPreferences, setAgentImageModelPreferences] = useState<ImageModelId[]>(['auto']);
  const [agentVideoModelPreferences, setAgentVideoModelPreferences] = useState<VideoModelId[]>(['seedance-20']);
  const [imageModelSettings, setImageModelSettings] = useState({
    ratio: '3:4',
  });
  const [videoModelPreference, setVideoModelPreference] = useState<VideoModelId>('seedance-20');
  const [videoModelSettings, setVideoModelSettings] = useState({
    ratio: '3:4',
    duration: '5s',
    resolution: '480p',
  });
  const [loading, setLoading] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<{
    id: string;
    stage: WorkflowStage;
    label: string;
    plan: GenerationPlan;
    creditsCharged: boolean;
    thoughtTitle?: string;
    typedThought?: string;
    model?: string;
    showGeneratingPanel?: boolean;
    generatingStartedAt?: number;
    previewResults?: string[];
  } | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => (
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  ));
  const [notifyOnComplete, setNotifyOnComplete] = useState(false);
  const [notificationScope, setNotificationScope] = useState<NotificationPreferenceScope | null>(null);
  const [showNotificationScopePicker, setShowNotificationScopePicker] = useState(false);
  const [showGeneratingHint, setShowGeneratingHint] = useState(false);
  const [typedGeneratingHint, setTypedGeneratingHint] = useState('');
  const [countdownMs, setCountdownMs] = useState(GENERATING_ESTIMATE_MS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{
    taskId: string;
    title: string;
    description: string;
    confirmLabel: string;
  } | null>(null);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState<{
    url: string;
    name?: string;
    x: number;
    y: number;
  } | null>(null);
  const taskRuntimeRef = useRef<Record<string, { cancelled: boolean }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoReferenceInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const assetMenuRef = useRef<HTMLDivElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const modelPreferenceRef = useRef<HTMLDivElement>(null);
  const modelPreferenceTriggerRef = useRef<HTMLButtonElement>(null);
  const modelPreferencePanelRef = useRef<HTMLDivElement>(null);
  const notificationScopeRef = useRef<HTMLDivElement>(null);
  const slowHintAnnotationRef = useRef<HTMLDivElement>(null);
  const cancelActionAnnotationRef = useRef<HTMLDivElement>(null);
  const cancelDialogAnnotationRef = useRef<HTMLDivElement>(null);

  const brandGroups = debugNoBrandData ? [] : BRAND_GROUPS;

  const selectedBrand = brandGroups.find(b => b.id === selectedBrandId);
  const brandForDetailPanel = brandDetailBrandId
    ? brandGroups.find((b) => b.id === brandDetailBrandId)
    : undefined;
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession.messages;

  const MODE_OPTIONS = [
    { id: 'agent' as const, label: 'Agent', icon: Bot },
    { id: 'image' as const, label: '图像', icon: ImageIcon },
    { id: 'video' as const, label: '视频', icon: Clapperboard },
  ];
  const currentModeOption = MODE_OPTIONS.find((item) => item.id === generationMode) ?? MODE_OPTIONS[0];
  const MODEL_OPTIONS = [
    {
      id: 'gpt-image-2-low' as const,
      label: '全能图像2.0',
      badge: '',
      params: {
        ratio: ['1:1', '4:3', '3:4', '16:9', '9:16'],
      },
    },
    {
      id: 'gpt-image-2-medium' as const,
      label: '全能图像pro',
      badge: '',
      params: {
        ratio: ['1:1', '4:3', '3:4', '16:9', '9:16'],
      },
    },
    {
      id: 'gpt-image-2-high' as const,
      label: 'Seedream 3.0',
      badge: '',
      params: {
        ratio: ['1:1', '3:4', '4:3', '9:16', '16:9'],
      },
    },
    {
      id: 'auto' as const,
      label: 'Seedream 4.0',
      badge: '',
      params: {
        ratio: ['1:1', '3:4', '4:3', '9:16', '16:9'],
      },
    },
  ];
  const VIDEO_MODEL_OPTIONS = [
    {
      id: 'seedance-20' as const,
      label: 'Seedance 2.0',
      badge: 'VIP',
      params: {
        ratio: ['16:9', '9:16', '4:3', '3:4', '1:1'],
        duration: ['5s', '10s', '12s'],
        resolution: ['480p', '720p', '1080p'],
      },
    },
    {
      id: 'seedance-20-fast' as const,
      label: 'Seedance 2.0-Fast',
      badge: 'VIP',
      params: {
        ratio: ['16:9', '9:16', '1:1'],
        duration: ['5s', '10s'],
        resolution: ['480p', '720p'],
      },
    },
    {
      id: 'seedance-15-pro' as const,
      label: 'Seedance 1.5 Pro',
      badge: 'VIP',
      params: {
        ratio: ['16:9', '9:16', '3:4', '1:1'],
        duration: ['5s', '10s'],
        resolution: ['480p', '720p', '1080p'],
      },
    },
    {
      id: 'kling-v25-turbo' as const,
      label: 'Kling V2.5-Turbo',
      badge: 'VIP',
      params: {
        ratio: ['16:9', '9:16'],
        duration: ['5s', '10s'],
        resolution: ['720p', '1080p'],
      },
    },
    {
      id: 'kling-v26' as const,
      label: 'Kling V2.6',
      badge: 'VIP',
      params: {
        ratio: ['16:9', '9:16', '4:3', '3:4'],
        duration: ['5s', '10s'],
        resolution: ['720p', '1080p'],
      },
    },
  ];
  const currentModelOption = MODEL_OPTIONS.find((item) => item.id === modelPreference);
  const currentVideoModelOption = VIDEO_MODEL_OPTIONS.find((item) => item.id === videoModelPreference) ?? VIDEO_MODEL_OPTIONS[0];
  const VIDEO_INPUT_MODE_OPTIONS = [
    { id: 'text' as const, label: '文生视频' },
    { id: 'frames' as const, label: '首尾帧' },
    { id: 'reference' as const, label: '全能参考' },
  ];
  const currentVideoInputModeOption = VIDEO_INPUT_MODE_OPTIONS.find((item) => item.id === videoInputMode) ?? VIDEO_INPUT_MODE_OPTIONS[0];
  const currentVideoParameterSummary = [
    videoModelSettings.ratio,
    videoModelSettings.duration,
    videoModelSettings.resolution,
  ].filter(Boolean).join(' / ');
  const currentImageParameterSummary = [
    imageModelSettings.ratio,
  ].filter(Boolean).join(' / ');
  const currentAgentModelSummary = `图片 ${agentImageModelPreferences.length} / 视频 ${agentVideoModelPreferences.length}`;
  const isVideoParameterPreferenceActive = generationMode === 'video';
  const isSeedanceVideoModel = currentVideoModelOption.id.startsWith('seedance');
  const showSeedanceModelGuide = generationMode === 'video' && videoInputMode !== 'text' && isSeedanceVideoModel;

  const updateVideoModelSetting = (key: VideoParameterKey, value: string) => {
    setVideoModelSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateImageModelSetting = (key: ImageParameterKey, value: string) => {
    setImageModelSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAgentImageModelPreference = (modelId: ImageModelId) => {
    setAgentImageModelPreferences((prev) => (
      prev.includes(modelId)
        ? (prev.length > 1 ? prev.filter((item) => item !== modelId) : prev)
        : [...prev, modelId]
    ));
  };

  const toggleAgentVideoModelPreference = (modelId: VideoModelId) => {
    setAgentVideoModelPreferences((prev) => (
      prev.includes(modelId)
        ? (prev.length > 1 ? prev.filter((item) => item !== modelId) : prev)
        : [...prev, modelId]
    ));
  };

  const openModelTabResourceLibrary = () => {
    setVideoReferenceTarget(null);
    setResourceLibraryInitialTab('model');
    setShowAssetMenu(false);
    setShowResourceLibraryDialog(true);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
  };

  const resolveSeedanceStatus = (name: string) => {
    const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return hash % 3 === 0 ? 'failed' : 'passed';
  };

  const shouldRunSeedanceDetection = (file: File, targetSlotId: VideoReferenceSlotId | null) =>
    generationMode === 'video' &&
    isSeedanceVideoModel &&
    file.type.startsWith('image/') &&
    (videoInputMode !== 'text' || Boolean(targetSlotId));

  useEffect(() => {
    onSessionTitleChange(currentSession.title);
  }, [currentSession.title, onSessionTitleChange]);

  useEffect(() => {
    const nextOption = VIDEO_MODEL_OPTIONS.find((item) => item.id === videoModelPreference);
    if (!nextOption) return;

    setVideoModelSettings((prev) => ({
      ratio: nextOption.params.ratio.includes(prev.ratio) ? prev.ratio : nextOption.params.ratio[0] ?? '',
      duration: nextOption.params.duration.includes(prev.duration) ? prev.duration : nextOption.params.duration[0] ?? '',
      resolution: nextOption.params.resolution.includes(prev.resolution) ? prev.resolution : nextOption.params.resolution[0] ?? '',
    }));
  }, [videoModelPreference]);

  useEffect(() => {
    const nextOption = MODEL_OPTIONS.find((item) => item.id === modelPreference);
    if (!nextOption) return;

    setImageModelSettings((prev) => ({
      ratio: nextOption.params.ratio.includes(prev.ratio) ? prev.ratio : nextOption.params.ratio[0] ?? '',
    }));
  }, [modelPreference]);

  const setMessages = (newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: typeof newMessages === 'function' ? newMessages(s.messages) : newMessages
        };
      }
      return s;
    }));
  };

  const updateCurrentSessionTitle = (title: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? { ...session, title }
          : session
      )
    );
  };

  const isTaskCancelled = (taskId: string) => taskRuntimeRef.current[taskId]?.cancelled === true;

  const cancelTask = (workflow: NonNullable<typeof activeWorkflow>) => {
    taskRuntimeRef.current[workflow.id] = { cancelled: true };
    if (workflow.creditsCharged && workflow.stage !== 'generating') {
      onCreditsChange((prev) => prev + workflow.plan.credits);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `${workflow.id}-cancelled`,
        role: 'assistant',
        content:
          workflow.stage === 'generating'
            ? `已停止当前${workflow.plan.mediaType === 'video' ? '视频' : '图片'}生成任务，积分不返还。\n您可以编辑输入信息后再次发送，重新生成。`
            : workflow.creditsCharged
              ? `已取消当前任务，${workflow.plan.credits} 积分已返还。\n您可以编辑输入信息后再次发送，重新生成。`
              : '已取消当前任务，本阶段尚未扣除积分。\n您可以编辑输入信息后再次发送，重新生成。',
        timestamp: Date.now(),
      },
    ]);
    setActiveWorkflow(null);
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [
    messages,
    activeWorkflow?.label,
    activeWorkflow?.typedThought,
    activeWorkflow?.thoughtTitle,
    activeWorkflow?.showGeneratingPanel,
    activeWorkflow?.model,
  ]);

  useEffect(() => {
    // 避免 document.body 在极端时机为空导致 createPortal 运行时报错
    if (typeof document !== 'undefined') setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setDebugNoBrandData(window.localStorage.getItem('debug_no_brand_data') === '1');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('debug_no_brand_data', debugNoBrandData ? '1' : '0');
    } catch {
      // ignore
    }
  }, [debugNoBrandData]);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setNotificationPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!showModelPreferenceDialog) return;

    const updatePosition = () => {
      const trigger = modelPreferenceTriggerRef.current;
      const panel = modelPreferencePanelRef.current;
      if (!trigger || !panel) return;

      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const viewportPadding = 12;
      const left = Math.min(
        Math.max(triggerRect.right - panelRect.width, viewportPadding),
        window.innerWidth - panelRect.width - viewportPadding,
      );
      const top = Math.max(triggerRect.top - panelRect.height - 8, viewportPadding);

      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.opacity = '1';
    };

    const rafId = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showModelPreferenceDialog, generationMode]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    readStoredNotificationPreference();
  }, []);

  useEffect(() => {
    const isGenerating = activeWorkflow?.showGeneratingPanel;
    const startedAt = activeWorkflow?.generatingStartedAt;

    if (!isGenerating || !startedAt) {
      setShowGeneratingHint(false);
      setTypedGeneratingHint('');
      setCountdownMs(GENERATING_ESTIMATE_MS);
      setNotifyOnComplete(false);
      setNotificationScope(null);
      setShowNotificationScopePicker(false);
      return;
    }

    const autoScope = readStoredNotificationPreference();
    setNotifyOnComplete(Boolean(autoScope));
    setNotificationScope(autoScope);
    setShowNotificationScopePicker(false);

    let cancelled = false;
    setCountdownMs(Math.max(GENERATING_ESTIMATE_MS - (Date.now() - startedAt), 0));

    const countdownTimer = window.setInterval(() => {
      setCountdownMs(Math.max(GENERATING_ESTIMATE_MS - (Date.now() - startedAt), 0));
    }, 1000);

    const hintTimer = window.setTimeout(async () => {
      if (cancelled) return;
      if (autoScope) return;
      setShowGeneratingHint(true);
      await typewrite(
        GENERATING_HINT_TEXT,
        (value) => {
          if (!cancelled) setTypedGeneratingHint(value);
        },
        () => cancelled,
        24,
      );
    }, GENERATING_HINT_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearInterval(countdownTimer);
      window.clearTimeout(hintTimer);
    };
  }, [activeWorkflow?.id, activeWorkflow?.showGeneratingPanel, activeWorkflow?.generatingStartedAt]);

  useEffect(() => {
    if (!activeWorkflow?.previewResults?.length || !notifyOnComplete || typeof Notification === 'undefined') {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('✅ 创作完成提醒', {
        body: `你的${activeWorkflow.plan.mediaType === 'video' ? '视频' : '图片'}结果已生成完成，可以回来查看了。`,
      });
      setNotifyOnComplete(false);
      setNotificationScope(null);
    }
  }, [activeWorkflow?.previewResults, activeWorkflow?.plan.mediaType, notifyOnComplete]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assetMenuRef.current && !assetMenuRef.current.contains(event.target as Node)) {
        setShowAssetMenu(false);
      }
      if (!(event.target instanceof Element && event.target.closest('[data-video-reference-trigger="true"]'))) {
        setVideoReferenceMenuSlotId(null);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false);
        setShowVideoInputModeMenu(false);
      }
      const clickedInsideModelPreferenceTrigger = modelPreferenceRef.current?.contains(event.target as Node);
      const clickedInsideModelPreferencePanel = modelPreferencePanelRef.current?.contains(event.target as Node);
      if (!clickedInsideModelPreferenceTrigger && !clickedInsideModelPreferencePanel) {
        setShowModelPreferenceDialog(false);
      }
      if (notificationScopeRef.current && !notificationScopeRef.current.contains(event.target as Node)) {
        setShowNotificationScopePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (generationMode !== 'video') {
      setShowVideoInputModeMenu(false);
      setVideoReferenceTarget(null);
      setVideoReferenceMenuSlotId(null);
    }
  }, [generationMode]);

  useEffect(() => {
    syncSelectedChipState(selectedAttachmentId);
  }, [selectedAttachmentId]);

  useEffect(() => {
    if (!editorRef.current) return;
    const currentPlainText = getEditorPlainText(editorRef.current);
    if (currentPlainText === input) return;

    const fragment = document.createDocumentFragment();
    if (input) {
      fragment.appendChild(document.createTextNode(input));
    }
    pendingAttachments.forEach((attachment) => {
      fragment.appendChild(document.createTextNode('\u00a0'));
      const chip = document.createElement('span');
      chip.contentEditable = 'false';
      chip.setAttribute('data-attachment-id', attachment.id);
      chip.className = 'inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-0.5 align-middle mr-1.5';
      if (attachment.type === 'image') {
        const img = document.createElement('img');
        img.src = attachment.url;
        img.alt = attachment.name || '图片';
        img.className = 'w-5 h-5 rounded-md object-cover';
        chip.appendChild(img);
      } else if (attachment.type === 'audio') {
        const icon = document.createElement('span');
        icon.className = 'inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#eef2ff] text-[#5c5cfc] text-[10px] font-bold';
        icon.textContent = '♪';
        chip.appendChild(icon);
      }
      const label = document.createElement('span');
      label.className = 'text-[11px] font-medium text-gray-700';
      label.textContent = getAttachmentDisplayLabel(attachment);
      chip.appendChild(label);
      fragment.appendChild(chip);
    });

    editorRef.current.innerHTML = '';
    editorRef.current.appendChild(fragment);
  }, [input, pendingAttachments]);

  const buildPromptWithBrand = (basePrompt: string, brand: typeof brandGroups[number] | undefined) => {
    if (!brand) return basePrompt;
    const colorHints = (brand.palettes ?? [])
      .flatMap((p) => p.colors)
      .slice(0, 8)
      .join(', ');
    const toneHints = (brand.toneTags ?? []).slice(0, 6).join('、');
    return `${basePrompt}

请严格遵循以下品牌规范进行视觉生成：
- 品牌组：${brand.name}
- 品牌描述：${brand.description ?? '无'}
- 色彩建议：${colorHints || '请使用品牌主色调'}
- 调性关键词：${toneHints || '简洁、专业、一致'}
- 输出要求：保持品牌一致性、视觉统一、适合营销场景。`;
  };

  const getVideoReferenceAccept = (slotId: VideoReferenceSlotId | null) => {
    if (slotId === 'ref-audio') return 'audio/*';
    if (slotId === 'ref-video') return 'video/*';
    return 'image/*';
  };

  const addAttachmentToComposer = (attachment: GenerationAttachment) => {
    setPendingAttachments((prev) => [...prev, attachment]);
    insertAttachmentChip(attachment);
  };

  const removeAttachmentById = (attachmentId: string) => {
    const exists = pendingAttachments.some((item) => item.id === attachmentId);
    if (exists) {
      removeAttachment(attachmentId);
    }
  };

  const assignVideoReferenceAttachment = (slotId: VideoReferenceSlotId, attachment: GenerationAttachment) => {
    const previous = videoReferenceSlots[slotId];
    if (previous) {
      removeAttachmentById(previous.id);
    }
    setVideoReferenceSlots((prev) => ({ ...prev, [slotId]: attachment }));
    addAttachmentToComposer(attachment);
  };

  const handleAttachmentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (videoReferenceTarget) {
      const file = files[0];
      if (!file) return;
      if (shouldRunSeedanceDetection(file, videoReferenceTarget) && resolveSeedanceStatus(file.name) !== 'passed') {
        showErrorToast('未通过Seedance检测，请更换其他资源');
        event.target.value = '';
        setVideoReferenceTarget(null);
        return;
      }
      const nextAttachment: GenerationAttachment = {
        id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 7)}`,
        type: file.type.startsWith('audio/')
          ? 'audio'
          : file.type.startsWith('video/')
            ? 'video'
            : 'image',
        url: URL.createObjectURL(file),
        name: file.name,
        displayTypeLabel: file.type.startsWith('audio/')
          ? '音频'
          : file.type.startsWith('video/')
            ? '视频'
            : videoReferenceTarget === 'frame-start'
              ? '首帧图'
              : videoReferenceTarget === 'frame-end'
                ? '尾帧图'
                : '图片',
      };
      assignVideoReferenceAttachment(videoReferenceTarget, nextAttachment);
      setVideoReferenceTarget(null);
      event.target.value = '';
      return;
    }

    const validFiles = files.filter((file) => {
      if (!shouldRunSeedanceDetection(file, null)) return true;
      return resolveSeedanceStatus(file.name) === 'passed';
    });
    const blockedFiles = files.filter((file) => {
      if (!shouldRunSeedanceDetection(file, null)) return false;
      return resolveSeedanceStatus(file.name) !== 'passed';
    });

    blockedFiles.forEach((file) => {
      showErrorToast(`“${file.name}”未通过Seedance检测，请更换其他资源`);
    });

    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }

    const nextAttachments = validFiles.map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 7)}`,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(file),
      name: file.name,
    })) as GenerationAttachment[];

    setPendingAttachments((prev) => [...prev, ...nextAttachments]);
    nextAttachments.forEach(insertAttachmentChip);
    event.target.value = '';
  };

  const addLibraryAttachments = (assets: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    name: string;
    displayTypeLabel?: string;
  }>) => {
    if (assets.length === 0) return;

    if (videoReferenceTarget) {
      const asset = assets[0];
      const nextAttachment: GenerationAttachment = {
        id: `${Date.now()}-${asset.type}-${Math.random().toString(36).slice(2, 7)}`,
        type: asset.type,
        url: asset.url,
        name: asset.name,
        displayTypeLabel: asset.displayTypeLabel,
      };
      assignVideoReferenceAttachment(videoReferenceTarget, nextAttachment);
      setVideoReferenceTarget(null);
      setShowAssetMenu(false);
      setResourceLibraryInitialTab(undefined);
      setShowResourceLibraryDialog(false);
      return;
    }

    const nextAttachments: GenerationAttachment[] = assets.map((asset) => ({
      id: `${Date.now()}-${asset.type}-${Math.random().toString(36).slice(2, 7)}`,
      type: asset.type,
      url: asset.url,
      name: asset.name,
      displayTypeLabel: asset.displayTypeLabel,
    }));

    setPendingAttachments((prev) => [...prev, ...nextAttachments]);
    nextAttachments.forEach(insertAttachmentChip);
    setShowAssetMenu(false);
    setResourceLibraryInitialTab(undefined);
    setShowResourceLibraryDialog(false);
  };

  const requestCompletionNotification = async () => {
    if (typeof Notification === 'undefined') return;

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      setShowNotificationScopePicker(true);
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      setShowNotificationScopePicker(true);
    }
  };

  const applyNotificationPreference = (scope: NotificationPreferenceScope) => {
    setNotifyOnComplete(true);
    setNotificationScope(scope);
    setShowNotificationScopePicker(false);
    setShowGeneratingHint(false);
    setTypedGeneratingHint('');

    if (scope === 'today' || scope === 'always') {
      writeStoredNotificationPreference(scope);
      return;
    }

    writeStoredNotificationPreference(null);
  };

  const clearNotificationPreference = () => {
    if (notificationScope === 'today' || notificationScope === 'always') {
      writeStoredNotificationPreference(null);
    }

    setNotifyOnComplete(false);
    setNotificationScope(null);
    setShowNotificationScopePicker(false);
  };

  const notificationScopeLabel = notificationScope === 'today'
    ? '今日任务自动提醒中'
    : notificationScope === 'always'
      ? '后续任务自动提醒中'
      : '本次任务完成后提醒你';

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const playCompletionSound = () => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const audioCtx = new AudioCtx();
    const now = audioCtx.currentTime;
    const notes = [
      { freq: 659.25, start: 0, duration: 0.12 },
      { freq: 783.99, start: 0.12, duration: 0.12 },
      { freq: 987.77, start: 0.25, duration: 0.18 },
    ];

    notes.forEach((note) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.freq, now + note.start);
      gainNode.gain.setValueAtTime(0.0001, now + note.start);
      gainNode.gain.exponentialRampToValueAtTime(0.08, now + note.start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(now + note.start);
      oscillator.stop(now + note.start + note.duration);
    });

    window.setTimeout(() => {
      void audioCtx.close().catch(() => undefined);
    }, 700);
  };

  const removeAttachment = (attachmentId: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((item) => item.id === attachmentId);
      if (target?.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== attachmentId);
    });
    const node = editorRef.current?.querySelector(`[data-attachment-id="${attachmentId}"]`);
    node?.remove();
    setSelectedAttachmentId((prev) => (prev === attachmentId ? null : prev));
    setHoverPreview((prev) => (prev?.url === pendingAttachments.find((item) => item.id === attachmentId)?.url ? null : prev));
    onInputChange(editorRef.current ? getEditorPlainText(editorRef.current) : '');
  };

  const clearAllAttachments = () => {
    setPendingAttachments((prev) => {
      prev.forEach((item) => {
        if (item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
      return [];
    });
    if (editorRef.current) {
      editorRef.current.querySelectorAll('[data-attachment-id]').forEach((node) => node.remove());
    }
    setSelectedAttachmentId(null);
    setHoverPreview(null);
  };

  const syncSelectedChipState = (attachmentId: string | null) => {
    if (!editorRef.current) return;
    editorRef.current.querySelectorAll('[data-attachment-id]').forEach((node) => {
      const isActive = attachmentId != null && node.getAttribute('data-attachment-id') === attachmentId;
      node.classList.toggle('ring-2', isActive);
      node.classList.toggle('ring-[#5c5cfc]', isActive);
      node.classList.toggle('border-[#5c5cfc]/40', isActive);
    });
  };

  const saveSelectionRange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current?.contains(range.startContainer)) {
      selectionRangeRef.current = range.cloneRange();
      const chip = range.startContainer instanceof Element
        ? range.startContainer.closest('[data-attachment-id]')
        : range.startContainer.parentElement?.closest('[data-attachment-id]');
      const attachmentId = chip?.getAttribute('data-attachment-id') ?? null;
      setSelectedAttachmentId(attachmentId);
      syncSelectedChipState(attachmentId);
    }
  };

  const getEditorPlainText = (root: HTMLDivElement) => {
    const clone = root.cloneNode(true) as HTMLDivElement;
    clone.querySelectorAll('[data-attachment-id]').forEach((node) => node.remove());
    return (clone.textContent || '').replace(/\u00a0/g, ' ').trim();
  };

  const focusEditorToEnd = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    selectionRangeRef.current = range.cloneRange();
  };

  const insertAttachmentChip = (attachment: GenerationAttachment) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    const selection = window.getSelection();
    const range = selectionRangeRef.current?.cloneRange() ?? document.createRange();

    if (!selectionRangeRef.current) {
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }

    const chip = document.createElement('span');
    chip.contentEditable = 'false';
    chip.setAttribute('data-attachment-id', attachment.id);
    chip.className = 'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-1 align-middle mr-2';
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setSelectedAttachmentId(attachment.id);
      syncSelectedChipState(attachment.id);
      const chipRange = document.createRange();
      chipRange.selectNode(chip);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(chipRange);
      selectionRangeRef.current = chipRange.cloneRange();
    });
    chip.addEventListener('mouseenter', () => {
      if (attachment.type !== 'image') return;
      const rect = chip.getBoundingClientRect();
      setHoverPreview({
        url: attachment.url,
        name: attachment.name,
        x: rect.left + rect.width / 2,
        y: rect.top - 12,
      });
    });
    chip.addEventListener('mouseleave', () => {
      setHoverPreview((prev) => (prev?.url === attachment.url ? null : prev));
    });

    if (attachment.type === 'image') {
      const img = document.createElement('img');
      img.src = attachment.url;
      img.alt = attachment.name || '图片';
      img.className = 'w-6 h-6 rounded object-cover';
      chip.appendChild(img);
    } else if (attachment.type === 'audio') {
      const icon = document.createElement('span');
      icon.className = 'inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#eef2ff] text-[#5c5cfc] text-[12px] font-bold';
      icon.textContent = '♪';
      chip.appendChild(icon);
    }

    const label = document.createElement('span');
    label.className = 'text-[12px] font-medium text-gray-700';
    label.textContent = getAttachmentDisplayLabel(attachment);
    chip.appendChild(label);

    const spacer = document.createTextNode('\u00a0');
    range.deleteContents();
    range.insertNode(spacer);
    range.insertNode(chip);
    range.setStartAfter(spacer);
    range.collapse(true);

    selection?.removeAllRanges();
    selection?.addRange(range);
    selectionRangeRef.current = range.cloneRange();
    setSelectedAttachmentId(null);
    syncSelectedChipState(null);
    onInputChange(getEditorPlainText(editorRef.current));
  };

  const prependDemoAttachment = (attachment: GenerationAttachment, text: string) => {
    clearAllAttachments();
    setPendingAttachments([attachment]);
    onInputChange(text);

    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      editorRef.current.innerHTML = '';
      const textNode = document.createTextNode(text);
      editorRef.current.appendChild(textNode);

      const range = document.createRange();
      range.setStart(editorRef.current, 0);
      range.collapse(true);
      selectionRangeRef.current = range.cloneRange();
      insertAttachmentChip(attachment);
      focusEditorToEnd();
    });
  };

  const populateComposer = (text: string, imageUrls: string[] = []) => {
    clearAllAttachments();
    const attachments: GenerationAttachment[] = imageUrls.map((url, index) => ({
      id: `message-attachment-${Date.now()}-${index}`,
      type: 'image',
      url,
      name: '图片',
    }));

    setPendingAttachments(attachments);
    onInputChange(text);

    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      editorRef.current.innerHTML = '';
      editorRef.current.appendChild(document.createTextNode(text));

      const range = document.createRange();
      range.setStart(editorRef.current, 0);
      range.collapse(true);
      selectionRangeRef.current = range.cloneRange();

      attachments.forEach(insertAttachmentChip);
      focusEditorToEnd();
    });
  };

  const renderVideoReferenceTrigger = (
    slotId: VideoReferenceSlotId,
    title: string,
    kinds: Array<'image' | 'video' | 'audio'>,
    joinLabel?: string,
  ) => {
    const attachment = videoReferenceSlots[slotId];
    const isMenuOpen = videoReferenceMenuSlotId === slotId;

    return (
      <div
        key={slotId}
        data-video-reference-trigger="true"
        className="relative"
      >
        <button
          type="button"
          onClick={() => setVideoReferenceMenuSlotId((prev) => (prev === slotId ? null : slotId))}
          className="group relative block w-full overflow-hidden rounded-[16px] border border-[#e7ebf4] bg-white text-left transition-all hover:border-[#cad5eb] hover:shadow-[0_10px_24px_rgba(143,158,186,0.12)]"
        >
          <div className="flex aspect-[1.08] items-center justify-center overflow-hidden bg-[#f5f7fc]">
            {attachment ? (
              attachment.type === 'audio' ? (
                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#eef2ff_0%,#f8faff_100%)]">
                  <Music size={22} className="text-[#5c5cfc]" />
                </div>
              ) : attachment.type === 'video' ? (
                <video src={attachment.url} className="h-full w-full object-cover" muted playsInline autoPlay loop />
              ) : (
                <img src={attachment.url} alt={attachment.name || title} className="h-full w-full object-cover" />
              )
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-[#98a4bb]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dbe3f3] bg-white transition-colors group-hover:border-[#c6d3ec] group-hover:text-[#6c7894]">
                  <Plus size={16} />
                </div>
                <div className="text-[11px]">{title}</div>
              </div>
            )}
          </div>
        </button>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className={cn(
                'absolute z-[80] w-[168px] rounded-[18px] border border-gray-100 bg-white p-1.5 shadow-2xl',
                joinLabel ? 'left-1/2 top-full mt-2 -translate-x-1/2' : 'left-0 top-full mt-2'
              )}
            >
            <button
              type="button"
              onClick={() => {
                setVideoReferenceTarget(slotId);
                setVideoReferenceMenuSlotId(null);
                videoReferenceInputRef.current?.click();
              }}
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Plus size={14} className="text-gray-400" />
              本地上传
            </button>
            <button
              type="button"
              onClick={() => {
                setVideoReferenceTarget(slotId);
                setVideoReferenceMenuSlotId(null);
                setResourceLibraryInitialTab(undefined);
                setShowResourceLibraryDialog(true);
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left text-[12px] font-medium text-gray-700 transition-colors hover:bg-[#f5f6fb]"
            >
              <FolderOpen size={14} className="text-[#5c5cfc]" />
              <span>资源库选择</span>
            </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleCopyMessage = async (msg: ChatMessage) => {
    try {
      if (msg.images?.[0] && navigator.clipboard && 'ClipboardItem' in window) {
        const response = await fetch(msg.images[0]);
        const blob = await response.blob();
        const item = new ClipboardItem({
          [blob.type]: blob,
          'text/plain': new Blob([msg.content], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([item]);
        return;
      }

      await navigator.clipboard.writeText(msg.content);
    } catch {
      await navigator.clipboard.writeText(msg.content);
    }
  };

  const getAssistantResultAttachments = (msg: ChatMessage): GenerationAttachment[] => {
    if (msg.generationAttachments?.length) {
      return msg.generationAttachments;
    }
    return (msg.images ?? []).map((url, index) => ({
      id: `${msg.id}-image-${index}`,
      type: 'image',
      url,
      name: '图片',
    }));
  };

  const generateAndAppend = async (rawPrompt: string, brand?: typeof brandGroups[number], messageIdPrefix?: string) => {
    const reqId = messageIdPrefix ?? Date.now().toString();
    if (isPerfumeDemoPrompt(rawPrompt, pendingAttachments)) {
      taskRuntimeRef.current[reqId] = { cancelled: false };
      setLoading(true);
      setActiveWorkflow({
        id: reqId,
        stage: 'submitting',
        label: '正在解析需求',
        plan: {
          id: `${reqId}-plan`,
          prompt: rawPrompt,
          enrichedPrompt: rawPrompt,
          mediaType: 'image',
          skillName: 'image_generation',
          model: 'Seedream 4.5',
          outputCount: 4,
          credits: 40,
          batches: [{ id: 'batch-1', count: 4 }],
        },
        creditsCharged: false,
      });

      try {
        await wait(2000);
        if (isTaskCancelled(reqId)) return;
        setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, stage: 'analyzing', label: '正在分析理解图片以完成您的需求...' } : prev);

        await wait(1000);
        if (isTaskCancelled(reqId)) return;
        setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, label: '图片分析中' } : prev);

        await wait(4000);
        if (isTaskCancelled(reqId)) return;
        setMessages((prev) => [
          ...prev,
          {
            id: `${reqId}-analysis-done`,
            role: 'assistant',
            content: '我已分析图片，现在为您生成以图中香水瓶为主体的符合要求的产品摄影图。',
            timestamp: Date.now(),
          },
        ]);

        setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, label: '解析需求中' } : prev);
        await wait(600);
        if (isTaskCancelled(reqId)) return;

        setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, thoughtTitle: '正在思考设计计划...', typedThought: '' } : prev);
        await typewrite(
          '用户现在需要生成一张以香水瓶为主体，加蜡烛花朵石块，暖米色背景的写实产品摄影图，任务类型是img_video_generate，属于visual-creative的skill，首先我先读取对应的SKILL.md对吧？不对，哦不对，等下，首先要给启动语，然后读取skill？不对，先看规则：收到任务先启动语，然后读取对应skill。哦对，首先启动语是“开始处理您的香水瓶产品摄影图生成需求！”，然后因为是img_video_generate的视觉生成任务，要读取visual-creative的SKILL.md，路径是/app/skills/visual-creative/SKILL.md。',
          (value) => setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, typedThought: value } : prev),
          () => isTaskCancelled(reqId),
        );
        if (isTaskCancelled(reqId)) return;

        setMessages((prev) => [
          ...prev,
          {
            id: `${reqId}-start`,
            role: 'assistant',
            content: '开始处理您的以参考图香水瓶为主体搭配蜡烛花朵的写实产品摄影图生成需求！',
            timestamp: Date.now(),
          },
        ]);

        setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, thoughtTitle: '正在思考设计计划...', typedThought: '' } : prev);
        await typewrite(
          '用户现在需要的是写实的产品摄影，属于需要参考图的生图任务，首先看工具选择，根据skill里的规则，需要参考图的话优先选seedream_4_5或者all_round_v2之类的，这里用户提供了参考图，主体是参考图里的方形香水瓶，还要加点燃的米色蜡烛、白色花朵、天然石块和暖米色背景，所以模型优先选择 Seedream 4.5，输出4张高质感产品摄影图，构图保留主体清晰、光线柔和、氛围自然静谧。',
          (value) => setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, typedThought: value } : prev),
          () => isTaskCancelled(reqId),
        );
        if (isTaskCancelled(reqId)) return;

        onCreditsChange((prev) => prev - 40);
        setActiveWorkflow((prev) => prev && prev.id === reqId ? {
          ...prev,
          stage: 'generating',
          label: '生成中',
          model: 'Seedream 4.5',
          creditsCharged: true,
          showGeneratingPanel: true,
          thoughtTitle: undefined,
          typedThought: '',
          generatingStartedAt: Date.now(),
          previewResults: undefined,
        } : prev);

        await wait(GENERATING_DEMO_DURATION_MS);
        if (isTaskCancelled(reqId)) return;

        setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, previewResults: PERFUME_DEMO_IMAGES } : prev);
        await wait(900);
        if (isTaskCancelled(reqId)) return;

        playCompletionSound();
        PERFUME_DEMO_IMAGES.forEach((url) => onAddImage(url));
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#3b82f6', '#000000']
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `${reqId}-done`,
            role: 'assistant',
            content: '已为您生成4张符合要求的香水瓶产品摄影图，画面以参考图中的方形香水瓶为主体，搭配了点燃的米色蜡烛、白色花朵与石块，米色背景烘托出自然静谧的质感，采用写实产品摄影风格呈现。',
            images: PERFUME_DEMO_IMAGES,
            modelName: 'Seedream 4.5',
            creditsCost: 40,
            timestamp: Date.now(),
          },
        ]);
      } catch (error) {
        const cancelled = error instanceof Error && error.message === 'WORKFLOW_CANCELLED';
        if (!cancelled) {
          setMessages((prev) => [
            ...prev,
            {
              id: `${reqId}-err`,
              role: 'assistant',
              content: '任务执行失败，请稍后重试。',
              timestamp: Date.now(),
            },
          ]);
        }
      } finally {
        setLoading(false);
        setActiveWorkflow(null);
        delete taskRuntimeRef.current[reqId];
        setPendingAttachments([]);
      }
      return;
    }

    const brandContext = brand ? buildPromptWithBrand('', brand).trim() : undefined;
    const effectivePrompt = applyGenerationModeHint(rawPrompt, generationMode);
    const plan = planGenerationRequest({
      prompt: effectivePrompt,
      attachments: pendingAttachments,
      brandContext,
    });
    let creditsCharged = false;

    taskRuntimeRef.current[reqId] = { cancelled: false };
    setLoading(true);
    setActiveWorkflow({
      id: reqId,
      stage: 'submitting',
      label: '正在提交需求',
      plan,
      creditsCharged: false,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `${reqId}-ack`,
        role: 'assistant',
        content: brand
          ? `好的，我这就基于「${brand.name}」品牌规范为您处理这个${plan.mediaType === 'video' ? '视频' : '图片'}需求。`
          : `好的，我这就为您处理这个${plan.mediaType === 'video' ? '视频' : '图片'}需求。`,
        timestamp: Date.now(),
      },
    ]);

    try {
        const result = await executeGenerationPlan(plan, {
        isCancelled: () => isTaskCancelled(reqId),
        onStatusChange: (status: WorkflowStatus) => {
          setActiveWorkflow((prev) => {
            if (!prev || prev.id !== reqId) return prev;

            const shouldChargeNow = status.stage === 'queued' && !prev.creditsCharged;
            if (shouldChargeNow) {
              creditsCharged = true;
              onCreditsChange((creditsPrev) => creditsPrev - plan.credits);
            }

            return {
              ...prev,
              stage: status.stage,
              label: status.label,
              creditsCharged: shouldChargeNow ? true : prev.creditsCharged,
              showGeneratingPanel: status.stage === 'generating',
              generatingStartedAt:
                status.stage === 'generating'
                  ? prev.generatingStartedAt ?? Date.now()
                  : prev.generatingStartedAt,
              previewResults: status.stage === 'generating' ? prev.previewResults : undefined,
            };
          });
        },
      });

      if (isTaskCancelled(reqId)) return;

      setActiveWorkflow((prev) => prev && prev.id === reqId ? { ...prev, previewResults: result.results } : prev);
      await wait(900);
      if (isTaskCancelled(reqId)) return;

      playCompletionSound();
      const resultAttachments: GenerationAttachment[] = result.results.map((url, index) => ({
        id: `${reqId}-result-${index}`,
        type: result.mediaType === 'video' ? 'video' : 'image',
        url,
        name: result.mediaType === 'video' ? `视频 ${index + 1}` : `图片 ${index + 1}`,
      }));
      await onAddGeneratedAssets(resultAttachments);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#3b82f6', '#000000']
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${reqId}-done`,
          role: 'assistant',
          content:
            result.mediaType === 'video'
              ? `已完成视频任务编排，并返回 ${result.results.length} 个预览结果。当前消耗 ${result.credits} 积分，使用模型 ${result.model}。`
              : `已完成生成并返回 ${result.results.length} 个结果。当前消耗 ${result.credits} 积分，使用模型 ${result.model}。`,
          images: result.results,
          generationAttachments: resultAttachments,
          modelName: result.model,
          creditsCost: result.credits,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      const cancelled = error instanceof Error && error.message === 'WORKFLOW_CANCELLED';
      if (!cancelled) {
        console.error('Generation workflow failed:', error);
        if (creditsCharged) {
          onCreditsChange((prev) => prev + plan.credits);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `${reqId}-err`,
            role: 'assistant',
            content: getGenerationFailureMessage(error, plan.credits),
            timestamp: Date.now(),
          },
        ]);
      }
    } finally {
      setLoading(false);
      setActiveWorkflow(null);
      delete taskRuntimeRef.current[reqId];
      setPendingAttachments([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const previewPlan = planGenerationRequest({
      prompt: applyGenerationModeHint(input, generationMode),
      attachments: pendingAttachments,
      brandContext: selectedBrand ? buildPromptWithBrand('', selectedBrand).trim() : undefined,
    });

    if (credits < previewPlan.credits) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-credit-err`,
          role: 'assistant',
          content: `当前积分不足。本次任务预计消耗 ${previewPlan.credits} 积分，你当前剩余 ${credits} 积分，请减少输出数量或补充积分后再试。`,
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const baseId = Date.now();
    const userMsg: ChatMessage = {
      id: `${baseId}-u`,
      role: 'user',
      content: editorRef.current ? getEditorPlainText(editorRef.current) : input,
      images: pendingAttachments.filter((item) => item.type === 'image').map((item) => item.url),
      timestamp: baseId,
    };
    updateCurrentSessionTitle(deriveDesignTitle(userMsg.content));

    let brandToolkitMsg: ChatMessage | null = null;
    if (shouldShowBrandToolkit(input)) {
      if (selectedBrandId) {
        // 情况 3：已选择某个品牌组，则列出已选择的品牌组
        brandToolkitMsg = {
          id: `${baseId}-kit`,
          role: 'assistant',
          content: '',
          timestamp: baseId + 1,
          variant: 'brand_toolkit',
          brandId: selectedBrandId,
        };
      } else if (brandGroups.length > 0) {
        // 情况 1：不使用品牌但有品牌组数据，列出当前所有品牌组供选择
        brandToolkitMsg = {
          id: `${baseId}-kit`,
          role: 'assistant',
          content: '',
          timestamp: baseId + 1,
          variant: 'brand_toolkit',
          brandIds: brandGroups.map((b) => b.id),
        };
      } else {
        // 情况 2：不使用品牌且没有品牌数据，引导去创建
        brandToolkitMsg = {
          id: `${baseId}-kit`,
          role: 'assistant',
          content: '',
          timestamp: baseId + 1,
          variant: 'brand_toolkit',
        };
      }
    }

    setMessages((prev) => [...prev, userMsg, ...(brandToolkitMsg ? [brandToolkitMsg] : [])]);
    onInputChange('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }

    // 场景 1：先让用户选品牌组，再触发生图
    if (shouldShowBrandToolkit(userMsg.content) && !selectedBrandId && brandGroups.length > 0) {
      setPendingBrandPrompt(userMsg.content);
      return;
    }

    // 场景 2：无品牌组时只引导创建，不触发生图
    if (shouldShowBrandToolkit(userMsg.content) && !selectedBrandId && brandGroups.length === 0) {
      return;
    }

    // 常规 / 场景 3：直接生图（已选品牌时自动注入品牌数据）
    const currentBrand = selectedBrandId ? brandGroups.find((b) => b.id === selectedBrandId) : undefined;
    await generateAndAppend(userMsg.content, currentBrand, `${baseId}`);
  };

  const handleCancelClick = (workflow: NonNullable<typeof activeWorkflow>) => {
    if (workflow.stage === 'submitting' || workflow.stage === 'analyzing') {
      cancelTask(workflow);
      return;
    }

    if (workflow.stage === 'queued') {
      setCancelDialog({
        taskId: workflow.id,
        title: '确认取消排队中的任务？',
        description: `当前任务仍在等待生成，建议继续等待结果返回。若现在取消，系统将返还 ${workflow.plan.credits} 积分。`,
        confirmLabel: '确认取消并返还积分',
      });
      return;
    }

    if (workflow.stage === 'generating') {
      setCancelDialog({
        taskId: workflow.id,
        title: `确认停止当前${workflow.plan.mediaType === 'video' ? '视频' : '图片'}生成？`,
        description: `当前任务已进入正式生成阶段，建议耐心等待结果返回。若现在取消，将停止任务且不返还 ${workflow.plan.credits} 积分。`,
        confirmLabel: '确认停止且不返还积分',
      });
    }
  };

  const handleNewSession = () => {
    const newId = Date.now().toString();
    const newSession: Session = {
      id: newId,
      title: '新会话',
      messages: [],
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setShowHistory(false);
    onInputChange('');
  };

  const elapsedMs = activeWorkflow?.generatingStartedAt
    ? Math.max(GENERATING_ESTIMATE_MS - countdownMs, 0)
    : 0;
  const generatingTimeLabel = `${formatCountdown(elapsedMs)}/${formatCountdown(GENERATING_ESTIMATE_MS)}`;
  const showPinnedNotificationBar = Boolean(activeWorkflow?.showGeneratingPanel && notifyOnComplete);
  const showSlowHintCard = Boolean(showGeneratingHint && !activeWorkflow?.previewResults?.length && !notifyOnComplete);

  const groupSessionsByDate = () => {
    const groups: { [key: string]: Session[] } = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    sessions.forEach(session => {
      const date = new Date(session.timestamp);
      const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      
      let groupKey = '更早以前';
      if (sessionDate === today) groupKey = '今天';
      else if (sessionDate === yesterday) groupKey = '昨天';
      else if (sessionDate > today - 86400000 * 7) groupKey = '最近7天';

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(session);
    });

    return groups;
  };

  if (isCollapsed) {
    return (
      <div className="fixed top-20 right-6 z-50">
        <Tooltip text="展开会话">
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className="w-12 h-12 bg-white rounded-full shadow-2xl border border-gray-100 flex items-center justify-center text-[#5c5cfc] transition-all"
          >
            <MessageSquare size={24} />
          </motion.button>
        </Tooltip>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      className="w-[400px] h-full bg-white border-l border-gray-100 flex flex-col shadow-xl z-10 relative overflow-visible"
    >
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white z-20">
        <h2 className="font-bold text-[16px] text-gray-800">Agent对话</h2>
        <div className="flex gap-4">
          <Tooltip text="新建会话">
            <button 
              onClick={handleNewSession}
              className="text-gray-600 hover:text-[#5c5cfc] transition-colors p-1 hover:bg-gray-50 rounded"
            >
              <MessageSquarePlus size={20} />
            </button>
          </Tooltip>
          <Tooltip text="历史会话">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={cn("text-gray-600 hover:text-[#5c5cfc] transition-colors p-1 hover:bg-gray-50 rounded", showHistory && "text-[#5c5cfc] bg-gray-50")}
            >
              <History size={20} />
            </button>
          </Tooltip>
          <Tooltip text="收起对话">
            <button 
              onClick={onToggleCollapse}
              className="text-gray-600 hover:text-[#5c5cfc] transition-colors p-1 hover:bg-gray-50 rounded"
            >
              <Maximize2 size={20} className="rotate-45" />
            </button>
          </Tooltip>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 top-[61px] bg-white z-30 border-l border-gray-100 flex flex-col"
          >
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-800 font-bold">
                <History size={18} />
                <span>历史会话</span>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {Object.entries(groupSessionsByDate()).map(([group, groupSessions]) => (
                <div key={group} className="space-y-2">
                  <h3 className="text-[12px] font-bold text-gray-400 px-2 flex items-center gap-2">
                    <Calendar size={12} />
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {groupSessions.map(session => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setCurrentSessionId(session.id);
                          setShowHistory(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-3 rounded-xl transition-all group flex flex-col gap-1",
                          currentSessionId === session.id 
                            ? "bg-[#5c5cfc]/5 border border-[#5c5cfc]/20" 
                            : "hover:bg-gray-50 border border-transparent"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-[14px] font-medium truncate flex-1",
                            currentSessionId === session.id ? "text-[#5c5cfc]" : "text-gray-700"
                          )}>
                            {session.title}
                          </span>
                          <Clock size={12} className="text-gray-300" />
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth">
        {messages.length === 0 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1.5">
              <h1 className="text-[15px] font-medium tracking-[0.02em] text-[#7c7cfc]">你好，欢迎开始创作</h1>
              <h2 className="text-[28px] leading-[1.08] font-semibold tracking-[-0.03em] text-[#4f53f7]">我是你的专属 AI 助手</h2>
              <p className="max-w-[280px] text-[13px] leading-6 text-gray-500">
                从商品场景、品牌视觉到日常创意物料，你可以直接输入想法，或者从下面的示例开始。
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => prependDemoAttachment(DEMO_REFERENCE_ATTACHMENT, '以上传图中的商品为主体，主体旁边有一支点燃的米色蜡烛，周围搭配白色花朵、石块，背景为暖色调的米色，营造出自然、静谧且富有质感的氛围，采用写实的产品摄影风格。')}
                className="group relative overflow-hidden rounded-[24px] border border-[#e7ebf4] bg-[linear-gradient(180deg,#fbfcff_0%,#f4f7fb_100%)] px-5 py-4 min-h-[128px] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d7ddf2] hover:shadow-[0_18px_40px_rgba(100,110,180,0.12)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(92,92,252,0.08),transparent_38%)] opacity-80" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="z-10 flex-1 space-y-1">
                    <h3 className="text-[24px] leading-none font-semibold tracking-[-0.03em] text-[#1f2937]">电商场景图</h3>
                    <p className="max-w-[155px] text-[12px] leading-5 text-gray-500">
                      上传商品图，快速生成更有氛围感和质感的展示场景。
                    </p>
                  </div>
                  <div className="relative flex h-[102px] w-[132px] shrink-0 items-center justify-center">
                    <div className="absolute inset-x-3 bottom-1 h-7 rounded-full bg-[#ccd4e7]/45 blur-xl transition-all duration-300 group-hover:bg-[#bac5e7]/55" />
                    <div className="relative z-0 h-[78px] w-[60px] overflow-hidden rounded-[18px] border-[3px] border-white shadow-[0_18px_34px_rgba(31,41,55,0.16)] rotate-[-11deg] translate-x-7">
                      <img src="https://picsum.photos/seed/shop1/200/300" alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative z-10 h-[90px] w-[68px] overflow-hidden rounded-[20px] border-[3px] border-white shadow-[0_22px_38px_rgba(31,41,55,0.22)]">
                      <img src="https://picsum.photos/seed/shop2/200/300" alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative z-0 h-[78px] w-[60px] overflow-hidden rounded-[18px] border-[3px] border-white shadow-[0_18px_34px_rgba(31,41,55,0.16)] rotate-[11deg] -translate-x-7">
                      <img src="https://picsum.photos/seed/shop3/200/300" alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => onInputChange('设计一个极简风格的品牌Logo，融合自然元素与现代感，配色采用高级灰与莫兰迪色调。')}
                className="group relative overflow-hidden rounded-[24px] border border-[#e7ebf4] bg-[linear-gradient(180deg,#fffdf8_0%,#f7f6f2_100%)] px-5 py-4 min-h-[128px] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ddd8cb] hover:shadow-[0_18px_40px_rgba(141,120,70,0.12)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,187,94,0.12),transparent_42%)] opacity-90" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="z-10 flex-1 space-y-1">
                    <h3 className="text-[24px] leading-none font-semibold tracking-[-0.03em] text-[#1f2937]">品牌与 Logo</h3>
                    <p className="max-w-[165px] text-[12px] leading-5 text-gray-500">
                      生成更完整的品牌视觉方向，从标识、配色到整体调性一起定义。
                    </p>
                  </div>
                  <div className="relative flex h-[102px] w-[132px] shrink-0 items-center justify-center">
                    <div className="absolute inset-x-3 bottom-1 h-7 rounded-full bg-[#ddd7c7]/50 blur-xl transition-all duration-300 group-hover:bg-[#d4cbaf]/60" />
                    <div className="relative z-0 h-[78px] w-[60px] overflow-hidden rounded-[18px] border-[3px] border-white shadow-[0_18px_34px_rgba(31,41,55,0.16)] rotate-[-11deg] translate-x-7">
                      <img src="https://picsum.photos/seed/logo1/200/300" alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative z-10 h-[90px] w-[68px] overflow-hidden rounded-[20px] border-[3px] border-white shadow-[0_22px_38px_rgba(31,41,55,0.22)]">
                      <img src="https://picsum.photos/seed/logo2/200/300" alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative z-0 h-[78px] w-[60px] overflow-hidden rounded-[18px] border-[3px] border-white shadow-[0_18px_34px_rgba(31,41,55,0.16)] rotate-[11deg] -translate-x-7">
                      <img src="https://picsum.photos/seed/logo3/200/300" alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === 'assistant' && msg.variant === 'brand_toolkit') {
            // 情况 3：只展示当前已选择的品牌组
            if (msg.brandId) {
              const kitBrand = brandGroups.find((b) => b.id === msg.brandId);
              return (
                <div key={msg.id} className="w-full flex flex-col gap-2 items-start">
                  <BrandToolkitCard
                    title={kitBrand ? `[Sample] ${kitBrand.name} Brand Kit` : '品牌工具包'}
                    onOpenDetails={() => {
                      if (loading) return;
                      if (kitBrand) setSelectedBrandId(kitBrand.id);
                      setBrandDetailBrandId(msg.brandId!);
                      setBrandDetailOpen(true);
                    }}
                  />
                </div>
              );
            }

            // 情况 1：不使用品牌但有品牌数据，列出所有品牌组供选择
            if (msg.brandIds && msg.brandIds.length > 0) {
              const listBrands = brandGroups.filter((b) => msg.brandIds!.includes(b.id));
              return (
                <div key={msg.id} className="w-full flex flex-col gap-2 items-start">
                  <div className="text-[11px] text-gray-500">
                    发现当前有多个品牌组，请选择要使用哪个
                  </div>
                  {listBrands.map((b) => (
                    <BrandToolkitCard
                      key={b.id}
                      title={b.name}
                      onOpenDetails={async () => {
                        if (loading) return;
                        setSelectedBrandId(b.id);
                        setBrandDetailBrandId(b.id);
                        setBrandDetailOpen(true);

                        // 场景 1：用户选择品牌后，立即按“品牌数据 + 原提示词”生图
                        if (pendingBrandPrompt) {
                          await generateAndAppend(pendingBrandPrompt, b, `${Date.now()}-pick`);
                          setPendingBrandPrompt(null);
                        }
                      }}
                    />
                  ))}
                </div>
              );
            }

            // 情况 2：没有品牌数据，引导创建品牌
            return (
              <div key={msg.id} className="w-full flex flex-col gap-2 items-start">
                <div className="w-full max-w-full">
                  <div className="mb-2 text-[10px] text-gray-500">未检测到可用的品牌组，建议先创建品牌工具包。</div>
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-3.5 py-2.5 flex items-center justify-between gap-3">
                    <div className="text-[12px] text-gray-800 font-medium">前往品牌管理创建品牌</div>
                    <a
                      href={BRAND_MANAGE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-medium hover:bg-gray-900"
                    >
                      去创建
                    </a>
                  </div>
                </div>
              </div>
            );
          }

          return (
          <div key={msg.id} className={cn("group/message flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
            {msg.role === 'user' && msg.images && msg.images.length > 0 ? (
              <div className="w-full max-w-[88%] rounded-[20px] border border-[#dfe3ff] bg-[#f6f7ff] px-3 py-2 text-gray-800 shadow-sm">
                <div className="text-[11px] leading-[1.95] text-[#253047]">
                  {msg.images[0] && (
                    <span
                      className="mr-1 inline-flex translate-y-[-1px] items-center gap-1 rounded-[12px] border border-[#d9def5] bg-white px-1.5 py-0.5 shadow-sm align-middle"
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHoverPreview({
                          url: msg.images![0],
                          name: '图片预览',
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                        });
                      }}
                      onMouseLeave={() => setHoverPreview((prev) => (prev?.url === msg.images?.[0] ? null : prev))}
                    >
                      <img
                        src={msg.images[0]}
                        alt="Uploaded"
                        className="h-5 w-5 rounded object-cover"
                      />
                      <span className="text-[10px] font-semibold text-[#253047]">图片</span>
                    </span>
                  )}
                  <span>{msg.content}</span>
                </div>
              </div>
            ) : (
              <div className={cn(
                "max-w-[88%] px-3 py-2 rounded-[16px] text-[12px] leading-[1.8] whitespace-pre-wrap",
                msg.role === 'user' 
                  ? "bg-black text-white rounded-tr-none" 
                  : "bg-gray-50 text-gray-700 rounded-tl-none border border-gray-100"
              )}>
                {msg.content}
              </div>
            )}
            {msg.role === 'user' && (
              <div className="flex items-center gap-2.5 pr-1 text-gray-400 opacity-0 transition-opacity group-hover/message:opacity-100">
                <button
                  type="button"
                  onClick={() => handleCopyMessage(msg)}
                  className="inline-flex items-center gap-1 text-[11px] hover:text-gray-700 transition-colors"
                >
                  <Copy size={14} />
                  <span>复制</span>
                </button>
                <button
                  type="button"
                  onClick={() => populateComposer(msg.content, msg.images ?? [])}
                  className="inline-flex items-center gap-1 text-[11px] hover:text-gray-700 transition-colors"
                >
                  <Pencil size={14} />
                  <span>编辑</span>
                </button>
              </div>
            )}
            {msg.role !== 'user' && getAssistantResultAttachments(msg).length > 0 && (
              <div className="w-full mt-1 rounded-[20px] bg-[#f6f7ff] border border-[#e7eaff] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#6b63ff]" />
                    <span className="text-[14px] font-semibold text-gray-900">生成完成</span>
                  </div>
                  {msg.modelName && <span className="text-[11px] font-medium text-[#8d98b8]">{msg.modelName}</span>}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {getAssistantResultAttachments(msg).map((attachment, idx) => (
                    <div
                      key={attachment.id ?? idx}
                      className="group relative aspect-[3/4] rounded-[14px] overflow-hidden border border-[#d7ddff] cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      onClick={() => attachment.type === 'video' ? onAddVideo(attachment.url) : onAddImage(attachment.url)}
                    >
                      {attachment.type === 'video' ? (
                        <video src={attachment.url} className="w-full h-full object-cover" muted playsInline autoPlay loop />
                      ) : (
                        <img src={attachment.url} alt="Generated" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white text-black text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                          {attachment.type === 'video' ? '点击添加视频' : '点击添加'}
                        </span>
                      </div>
                      {attachment.type === 'video' && (
                        <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
                          视频
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 text-[12px] leading-6 text-gray-800">{msg.content}</div>
                {msg.creditsCost != null && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[#6b63ff] text-[11px] font-semibold">
                    <Sparkles size={14} />
                    <span>生成完成</span>
                    <span className="text-[#b0b7d2] font-medium">|</span>
                    <span className="text-[#8d98b8] font-medium">本次消耗{msg.creditsCost}积分</span>
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}
        {activeWorkflow && (
          <div className="space-y-2">
            {activeWorkflow.thoughtTitle && activeWorkflow.typedThought && (
              <div className="rounded-[18px] bg-[#f4f6ff] border border-[#e7eaff] p-3">
                <div className="flex items-center gap-1.5 text-[#6b63ff] text-[12px] font-semibold">
                  <Sparkles size={13} className="shrink-0" />
                  <span>{activeWorkflow.thoughtTitle}</span>
                </div>
                <div className="mt-2 text-[11px] leading-5 text-gray-600 whitespace-pre-wrap">
                  {activeWorkflow.typedThought}
                </div>
              </div>
            )}

            {activeWorkflow.showGeneratingPanel && (
              <div className="rounded-[20px] bg-[#f6f7ff] border border-[#e7eaff] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 text-[14px] font-semibold text-gray-900">
                      <Sparkles size={14} className="text-[#6b63ff]" />
                      <span>生成中...</span>
                    </div>
                    <span className="text-[11px] font-medium tabular-nums text-[#a7afd1]">
                      {generatingTimeLabel}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-[#8d98b8]">
                    {activeWorkflow.model}
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {showPinnedNotificationBar && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-2.5 rounded-[14px] border border-[#dfe3ff] bg-white/95 px-3 py-2.5 shadow-[0_10px_24px_rgba(130,143,255,0.08)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[12px] font-medium text-[#4f5bd5]">已开启完成提醒</div>
                          <div className="mt-0.5 text-[11px] text-[#8d98b8]">
                            {notificationScopeLabel}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearNotificationPreference}
                          className="rounded-full bg-[#eef1ff] px-3 py-1 text-[11px] font-medium text-[#5b61d6] transition-colors hover:bg-[#e2e7ff]"
                        >
                          关闭
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={false}
                  animate={{
                    opacity: showSlowHintCard ? 1 : 0,
                    height: showSlowHintCard ? 'auto' : 0,
                    marginTop: showSlowHintCard ? 10 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <div ref={notificationScopeRef} className="relative rounded-[14px] bg-white/90 px-3 py-2.5 shadow-[0_10px_24px_rgba(130,143,255,0.08)]">
                    <div ref={slowHintAnnotationRef} className="absolute right-0 top-0 h-0 w-0" aria-hidden="true" />
                    <div className="text-[12px] leading-6 text-[#5f6887] min-h-[48px]">
                      {typedGeneratingHint}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-[#eef1ff] pt-2.5">
                      <span className={cn(
                        'text-[11px]',
                        notificationPermission === 'denied' && !notifyOnComplete ? 'text-[#f08a5d]' : 'text-[#8d98b8]'
                      )}>
                        {notifyOnComplete
                          ? '已开启提醒，我们将在任务完成后通知你'
                          : notificationPermission === 'denied'
                            ? '浏览器通知已禁用，请先在浏览器设置中开启通知权限'
                          : '开启通知任务完成后提醒我'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (notifyOnComplete) {
                            clearNotificationPreference();
                            return;
                          }
                          void requestCompletionNotification();
                        }}
                        className={cn(
                          'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                          notifyOnComplete
                            ? 'bg-[#6b63ff] text-white shadow-[0_8px_20px_rgba(107,99,255,0.2)]'
                            : notificationPermission === 'denied'
                              ? 'bg-[#fff1eb] text-[#f08a5d] cursor-not-allowed'
                            : 'bg-[#eef1ff] text-[#5b61d6] hover:bg-[#e2e7ff]'
                        )}
                        disabled={notificationPermission === 'denied' && !notifyOnComplete}
                      >
                        {notifyOnComplete
                          ? '关闭'
                          : notificationPermission === 'denied'
                            ? '已禁用'
                            : '开启'}
                      </button>
                    </div>
                    <AnimatePresence>
                      {showNotificationScopePicker && notificationPermission === 'granted' && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          className="mt-3 rounded-[14px] border border-[#e5e9ff] bg-[#f8f9ff] p-2"
                        >
                          <div className="px-2 py-1 text-[11px] text-[#7a84a7]">
                            选择提醒范围，后续将按你的选择自动生效
                          </div>
                          <div className="mt-1 grid gap-2">
                            <button
                              type="button"
                              onClick={() => applyNotificationPreference('once')}
                              className="rounded-[12px] bg-white px-3 py-2 text-left transition-colors hover:bg-[#eef1ff]"
                            >
                              <div className="text-[12px] font-medium text-gray-900">只提醒本次</div>
                              <div className="mt-0.5 text-[11px] leading-5 text-[#8d98b8]">仅当前任务完成时通知，后续任务不自动开启</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyNotificationPreference('today')}
                              className="rounded-[12px] bg-white px-3 py-2 text-left transition-colors hover:bg-[#eef1ff]"
                            >
                              <div className="text-[12px] font-medium text-gray-900">提醒今日任务</div>
                              <div className="mt-0.5 text-[11px] leading-5 text-[#8d98b8]">今天内后续生成任务自动提醒，次日失效</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyNotificationPreference('always')}
                              className="rounded-[12px] bg-white px-3 py-2 text-left transition-colors hover:bg-[#eef1ff]"
                            >
                              <div className="text-[12px] font-medium text-gray-900">提醒后续所有任务</div>
                              <div className="mt-0.5 text-[11px] leading-5 text-[#8d98b8]">当前及后续所有生成任务默认自动提醒</div>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const resultUrl = activeWorkflow.previewResults?.[idx];
                    return (
                      <div key={idx} className="relative aspect-[3/4] overflow-hidden rounded-[14px] border border-[#d7ddff] bg-gradient-to-br from-[#edf0ff] to-[#dfe5ff]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(229,234,255,0.4)_55%,_rgba(220,226,255,0.9)_100%)]" />
                        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(156,164,255,0.35)_1px,transparent_1px)] [background-size:10px_10px]" />
                        <motion.div
                          initial={false}
                          animate={{ opacity: resultUrl ? 0 : 1 }}
                          className="absolute inset-0"
                        />
                        {resultUrl && (
                          <motion.img
                            initial={{ opacity: 0, scale: 1.03 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                            src={resultUrl}
                            alt={`生成结果 ${idx + 1}`}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!activeWorkflow.thoughtTitle && !activeWorkflow.showGeneratingPanel && (
              <div className="flex items-center gap-1.5 text-[#6b63ff] text-[11px] font-medium">
                <Sparkles size={12} className="shrink-0" />
                <span>{activeWorkflow.label}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="relative bg-white rounded-[22px] p-3.5 border border-gray-200 focus-within:border-[#5c5cfc] focus-within:ring-4 focus-within:ring-[#5c5cfc]/5 transition-all shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleAttachmentSelect}
            className="hidden"
          />
          <input
            ref={videoReferenceInputRef}
            type="file"
            accept={getVideoReferenceAccept(videoReferenceTarget)}
            onChange={handleAttachmentSelect}
            className="hidden"
          />
          {generationMode === 'video' && (
            <div className="mb-3 grid gap-2.5">
              {videoInputMode !== 'text' && showSeedanceModelGuide && (
                <div className="flex items-center justify-between rounded-[18px] bg-[#f7f7fa] px-3.5 py-2.5">
                  <span className="pr-3 text-[12px] font-medium text-[#5f6880]">
                    模特/角色素材通过资源库审核通过后方可使用
                  </span>
                  <button
                    type="button"
                    onClick={openModelTabResourceLibrary}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e3e7ef] bg-white px-3 py-1.5 text-[12px] font-medium text-[#5f6880] transition-colors hover:bg-[#f8fafe]"
                  >
                    <Upload size={12} />
                    <span>上传</span>
                  </button>
                </div>
              )}

              {videoInputMode !== 'text' && (
                videoInputMode === 'frames' ? (
                  <div className="grid grid-cols-3 items-center gap-2.5">
                    {renderVideoReferenceTrigger('frame-start', '首帧图', ['image'])}
                    <div className="flex items-center justify-center text-[14px] font-medium text-[#99a4bb]">与</div>
                    {renderVideoReferenceTrigger('frame-end', '尾帧图', ['image'])}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {renderVideoReferenceTrigger('ref-image', '图片', ['image'])}
                    {renderVideoReferenceTrigger('ref-video', '视频', ['video'])}
                    {renderVideoReferenceTrigger('ref-audio', '音频', ['audio'])}
                  </div>
                )
              )}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="点击左侧可上传图片，或者直接描述下您想要的内容，我们为您呈现～"
            className="w-full bg-transparent border-none focus:outline-none text-[12px] text-gray-800 min-h-[82px] p-1.5 leading-6 empty:before:content-[attr(data-placeholder)] empty:before:text-[12px] empty:before:leading-6 empty:before:text-gray-400 empty:before:pointer-events-none"
            onInput={(e) => {
              onInputChange(getEditorPlainText(e.currentTarget));
              saveSelectionRange();
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAttachmentId) {
                e.preventDefault();
                removeAttachment(selectedAttachmentId);
                focusEditorToEnd();
                return;
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onKeyUp={saveSelectionRange}
            onMouseUp={saveSelectionRange}
            onBlur={() => {
              saveSelectionRange();
              setTimeout(() => {
                setSelectedAttachmentId(null);
                syncSelectedChipState(null);
              }, 0);
            }}
          />
          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {generationMode !== 'video' && (
                <div className="relative" ref={assetMenuRef}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      saveSelectionRange();
                    }}
                    onClick={() => {
                      if (!editorRef.current?.contains(document.activeElement)) {
                        focusEditorToEnd();
                      }
                      setShowAssetMenu((prev) => !prev);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-100 text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Plus size={14} />
                  </button>

                  <AnimatePresence>
                    {showAssetMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute bottom-full left-0 z-[100] mb-2 w-40 rounded-[18px] border border-gray-100 bg-white p-1.5 shadow-2xl"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowAssetMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Plus size={14} className="text-gray-400" />
                          <span>本地上传</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAssetMenu(false);
                            setResourceLibraryInitialTab(undefined);
                            setShowResourceLibraryDialog(true);
                          }}
                          className="mt-1 flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left text-[12px] font-medium text-gray-700 transition-colors hover:bg-[#f5f6fb]"
                        >
                          <FolderOpen size={14} className="text-[#5c5cfc]" />
                          <span>资源库选择</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <div className="relative" ref={modeMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowModeMenu((prev) => !prev)}
                  className="inline-flex h-7 items-center gap-1 rounded-full border border-gray-100 bg-[#f5f6fb] px-2 text-gray-700 transition-all hover:bg-gray-100"
                >
                  <currentModeOption.icon size={13} />
                  <span className="text-[11px] font-medium">{currentModeOption.label}</span>
                  {showModeMenu ? <ChevronUp size={11} className="text-gray-500" /> : <ChevronDown size={11} className="text-gray-500" />}
                </button>
                {generationMode === 'video' && (
                  <button
                    type="button"
                    onClick={() => setShowVideoInputModeMenu((prev) => !prev)}
                    className="ml-1 inline-flex h-7 items-center gap-1 rounded-full border border-gray-100 bg-[#f5f6fb] px-2 text-gray-700 transition-all hover:bg-gray-100"
                  >
                    <span className="text-[11px] font-medium">{currentVideoInputModeOption.label}</span>
                    {showVideoInputModeMenu ? <ChevronUp size={11} className="text-gray-500" /> : <ChevronDown size={11} className="text-gray-500" />}
                  </button>
                )}

                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute bottom-full left-0 z-[90] mb-2 w-36 rounded-[18px] border border-gray-100 bg-white p-1.5 shadow-2xl"
                    >
                      {MODE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setGenerationMode(option.id);
                            setShowModeMenu(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between rounded-[14px] px-2.5 py-1.5 text-left transition-colors",
                            generationMode === option.id ? "bg-[#f5f6fb] text-gray-900" : "hover:bg-gray-50 text-gray-700"
                          )}
                        >
                          <span className="inline-flex items-center gap-3">
                            <option.icon size={14} />
                            <span className="text-[12px] font-medium">{option.label}</span>
                          </span>
                          {generationMode === option.id && <Check size={13} className="text-gray-700" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {generationMode === 'video' && showVideoInputModeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute bottom-full left-28 z-[95] mb-2 w-36 rounded-[18px] border border-gray-100 bg-white p-1.5 shadow-2xl"
                    >
                      {VIDEO_INPUT_MODE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setVideoInputMode(option.id);
                            setShowVideoInputModeMenu(false);
                            setVideoReferenceTarget(null);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between rounded-[14px] px-2.5 py-1.5 text-left transition-colors",
                            videoInputMode === option.id ? "bg-[#f5f6fb] text-gray-900" : "hover:bg-gray-50 text-gray-700"
                          )}
                        >
                          <span className="text-[12px] font-medium">{option.label}</span>
                          {videoInputMode === option.id && <Check size={13} className="text-gray-700" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative" ref={modelPreferenceRef}>
                <Tooltip
                  text={generationMode === 'video'
                    ? `模型参数偏好：${currentVideoModelOption.label}${currentVideoParameterSummary ? ` · ${currentVideoParameterSummary}` : ''}`
                    : generationMode === 'agent'
                      ? isModelPreferenceEnabled
                        ? `模型偏好：${currentAgentModelSummary}`
                        : '模型偏好'
                    : isModelPreferenceEnabled
                      ? `模型偏好：${currentModelOption?.label ?? '已设置'}${currentImageParameterSummary ? ` · ${currentImageParameterSummary}` : ''}`
                      : '模型偏好'}
                >
                  <button
                    ref={modelPreferenceTriggerRef}
                    type="button"
                    aria-label={generationMode === 'video' ? '模型参数偏好' : '模型偏好'}
                    onClick={() => setShowModelPreferenceDialog((prev) => !prev)}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full border transition-all",
                      generationMode === 'video' || isModelPreferenceEnabled
                        ? "border-[#5c5cfc]/30 bg-[#5c5cfc]/8 text-[#5c5cfc] shadow-sm"
                        : "border-gray-100 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    )}
                  >
                    <SlidersHorizontal size={13} />
                  </button>
                </Tooltip>
                {portalRoot && createPortal(
                  <AnimatePresence>
                    {showModelPreferenceDialog && (
                      <motion.div
                        ref={modelPreferencePanelRef}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        className="fixed z-[120] w-[352px] max-w-[calc(100vw-24px)] rounded-[18px] border border-gray-100 bg-white p-2.5 shadow-2xl"
                        style={{ left: -9999, top: -9999, opacity: 0 }}
                      >
                      {generationMode === 'video' ? (
                        <>
                          <h3 className="text-[13px] font-semibold text-gray-900">模型参数偏好</h3>
                          <div className="mt-2.5 grid grid-cols-[156px_minmax(0,1fr)] gap-2">
                            <div className="rounded-[14px] bg-[#f6f8fc] p-2">
                              <div className="px-1 pb-1 text-[11px] font-medium text-[#7c879d]">视频模型</div>
                              <div className="space-y-1">
                                {VIDEO_MODEL_OPTIONS.map((option) => {
                                  const selected = videoModelPreference === option.id;
                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => setVideoModelPreference(option.id)}
                                      className={cn(
                                        "w-full rounded-[12px] px-2.5 py-2 text-left transition-colors",
                                        selected ? "bg-white text-gray-900 shadow-sm ring-1 ring-[#cfd7ff]" : "text-gray-700 hover:bg-white/70"
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[12px] font-medium">{option.label}</span>
                                        {selected && <Check size={13} className="shrink-0 text-[#5c5cfc]" />}
                                      </div>
                                      {option.badge && (
                                        <span className="mt-1 inline-flex rounded-full bg-[#f9dcc5] px-1.5 py-0.5 text-[9px] font-semibold text-[#7b4a1f]">
                                          {option.badge}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="rounded-[14px] border border-[#edf1f7] bg-white p-3">
                              <div className="text-[11px] font-medium text-[#7c879d]">参数设置</div>
                              <div className="mt-3 space-y-3">
                                {([
                                  { key: 'ratio', label: '比例' },
                                  { key: 'duration', label: '时长' },
                                  { key: 'resolution', label: '分辨率' },
                                ] as Array<{ key: VideoParameterKey; label: string }>).map((section) => {
                                  const values = currentVideoModelOption.params[section.key];
                                  if (!values?.length) return null;
                                  return (
                                    <div key={section.key}>
                                      <div className="text-[12px] font-medium text-[#7c879d]">{section.label}</div>
                                      <div className="mt-2 grid grid-cols-3 gap-2">
                                        {values.map((value) => {
                                          const selected = videoModelSettings[section.key] === value;
                                          return (
                                            <button
                                              key={value}
                                              type="button"
                                              onClick={() => updateVideoModelSetting(section.key, value)}
                                              className={cn(
                                                "rounded-[12px] border px-2 py-2 text-[12px] font-medium transition-all",
                                                selected
                                                  ? "border-[#cfd7ff] bg-[#eef0ff] text-[#5c5cfc]"
                                                  : "border-transparent bg-[#f6f8fc] text-[#5f6880] hover:border-[#e1e6f0] hover:bg-white"
                                              )}
                                            >
                                              {value}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : generationMode === 'image' ? (
                        <>
                          <h3 className="text-[13px] font-semibold text-gray-900">模型偏好</h3>
                          <div className="mt-2.5 grid grid-cols-[156px_minmax(0,1fr)] gap-2">
                            <div className="rounded-[14px] bg-[#f6f8fc] p-2">
                              <div className="px-1 pb-1 text-[11px] font-medium text-[#7c879d]">图片模型</div>
                              <div className="space-y-1">
                                {MODEL_OPTIONS.map((option) => {
                                  const selected = modelPreference === option.id;
                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => {
                                        setModelPreference(option.id);
                                        setIsModelPreferenceEnabled(true);
                                      }}
                                      className={cn(
                                        "w-full rounded-[12px] px-2.5 py-2 text-left transition-colors",
                                        selected ? "bg-white text-gray-900 shadow-sm ring-1 ring-[#cfd7ff]" : "text-gray-700 hover:bg-white/70"
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[12px] font-medium">{option.label}</span>
                                        {selected && <Check size={13} className="shrink-0 text-[#5c5cfc]" />}
                                      </div>
                                      {option.badge && (
                                        <span className="mt-1 inline-flex rounded-full bg-[#f9dcc5] px-1.5 py-0.5 text-[9px] font-semibold text-[#7b4a1f]">
                                          {option.badge}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="rounded-[14px] border border-[#edf1f7] bg-white p-3">
                              <div className="text-[11px] font-medium text-[#7c879d]">参数设置</div>
                              <div className="mt-3 space-y-3">
                                <div>
                                  <div className="text-[12px] font-medium text-[#7c879d]">比例</div>
                                  <div className="mt-2 grid grid-cols-3 gap-2">
                                    {currentModelOption?.params.ratio.map((value) => {
                                      const selected = imageModelSettings.ratio === value;
                                      return (
                                        <button
                                          key={value}
                                          type="button"
                                          onClick={() => updateImageModelSetting('ratio', value)}
                                          className={cn(
                                            "rounded-[12px] border px-2 py-2 text-[12px] font-medium transition-all",
                                            selected
                                              ? "border-[#cfd7ff] bg-[#eef0ff] text-[#5c5cfc]"
                                              : "border-transparent bg-[#f6f8fc] text-[#5f6880] hover:border-[#e1e6f0] hover:bg-white"
                                          )}
                                        >
                                          {value}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="text-[13px] font-semibold text-gray-900">模型偏好</h3>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-medium text-gray-700">智能选择</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsModelPreferenceEnabled((prev) => {
                                    const next = !prev;
                                    if (!next) setModelPreference('auto');
                                    return next;
                                  });
                                }}
                                className={cn(
                                  "relative h-5 w-9 rounded-full transition-colors",
                                  isModelPreferenceEnabled ? "bg-[#5c5cfc]" : "bg-gray-200"
                                )}
                              >
                                <span
                                  className={cn(
                                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                                    isModelPreferenceEnabled ? "left-4.5" : "left-0.5"
                                  )}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2.5 grid grid-cols-2 gap-1 rounded-[12px] bg-[#f3f5fb] p-1">
                            {[
                              { id: 'image' as const, label: '生图片', badge: '' },
                              { id: 'video' as const, label: '生视频', badge: 'VIP' },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setModelPreferenceTab(tab.id)}
                                className={cn(
                                  "flex items-center justify-center gap-1 rounded-[10px] px-2 py-1.5 text-[12px] font-medium transition-colors",
                                  modelPreferenceTab === tab.id ? "bg-white text-gray-900 shadow-sm ring-2 ring-[#1f6fd6]" : "text-gray-700"
                                )}
                              >
                                <span>{tab.label}</span>
                                {tab.badge && <span className="rounded-full bg-[#f9dcc5] px-1.5 py-0.5 text-[9px] font-semibold text-[#7b4a1f]">{tab.badge}</span>}
                              </button>
                            ))}
                          </div>

                          {modelPreferenceTab === 'video' ? (
                            <div className="mt-2.5 rounded-[14px] bg-[#f6f8fc] p-2">
                              <div className="px-1 pb-1 text-[11px] font-medium text-[#7c879d]">视频模型</div>
                              <div className="space-y-1">
                                {VIDEO_MODEL_OPTIONS.map((option) => {
                                  const selected = agentVideoModelPreferences.includes(option.id);
                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => {
                                        setIsModelPreferenceEnabled(true);
                                        toggleAgentVideoModelPreference(option.id);
                                      }}
                                      className={cn(
                                        "w-full rounded-[12px] px-2.5 py-2 text-left transition-colors",
                                        selected ? "bg-white text-gray-900 shadow-sm ring-1 ring-[#cfd7ff]" : "text-gray-700 hover:bg-white/70"
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[12px] font-medium">{option.label}</span>
                                        {selected && <Check size={13} className="shrink-0 text-[#5c5cfc]" />}
                                      </div>
                                      {option.badge && (
                                        <span className="mt-1 inline-flex rounded-full bg-[#f9dcc5] px-1.5 py-0.5 text-[9px] font-semibold text-[#7b4a1f]">
                                          {option.badge}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2.5 rounded-[14px] bg-[#f6f8fc] p-2">
                              <div className="px-1 pb-1 text-[11px] font-medium text-[#7c879d]">图片模型</div>
                              <div className="space-y-1">
                                {MODEL_OPTIONS.map((option) => {
                                  const selected = agentImageModelPreferences.includes(option.id);
                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => {
                                        setIsModelPreferenceEnabled(true);
                                        toggleAgentImageModelPreference(option.id);
                                      }}
                                      className={cn(
                                        "w-full rounded-[12px] px-2.5 py-2 text-left transition-colors",
                                        selected ? "bg-white text-gray-900 shadow-sm ring-1 ring-[#cfd7ff]" : "text-gray-700 hover:bg-white/70"
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[12px] font-medium">{option.label}</span>
                                        {selected && <Check size={13} className="shrink-0 text-[#5c5cfc]" />}
                                      </div>
                                      {option.badge && (
                                        <span className="mt-1 inline-flex rounded-full bg-[#f9dcc5] px-1.5 py-0.5 text-[9px] font-semibold text-[#7b4a1f]">
                                          {option.badge}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  portalRoot
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative">
                <Tooltip
                  alignPopover="end"
                  content={
                    selectedBrand ? (
                      <div className="space-y-2.5">
                        <div className="text-[12px] font-bold leading-tight">{selectedBrand.name}</div>
                        <div className="flex items-center gap-1">
                          {selectedBrand.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{selectedBrand.description}</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-[12px] font-semibold leading-tight">品牌应用</div>
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          关联品牌组件，生成自动遵循品牌规范
                        </p>
                      </div>
                    )
                  }
                >
                  <button
                    type="button"
                    aria-label={selectedBrand ? `已选品牌组：${selectedBrand.name}` : '品牌应用'}
                    onClick={() => setShowBrandSelector(!showBrandSelector)}
                    className={cn(
                      'relative flex h-7 w-7 items-center justify-center rounded-full border transition-all',
                      selectedBrand
                        ? 'bg-[#5c5cfc]/5 border-[#5c5cfc]/30 text-[#5c5cfc] shadow-sm'
                        : 'bg-white border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Briefcase size={13} className={cn(selectedBrand ? 'text-[#5c5cfc]' : 'text-gray-400')} />
                    {selectedBrand && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#5c5cfc] animate-pulse" />
                    )}
                  </button>
                </Tooltip>

                <AnimatePresence>
                  {showBrandSelector && (
                    <>
                      <div className="fixed inset-0 z-[60]" onClick={() => setShowBrandSelector(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[70] overflow-hidden"
                      >
                        <div className="px-3 py-2 mb-1">
                          <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">选择品牌组</h3>
                        </div>
                        
                        <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
                          <button 
                            onClick={() => {
                              setSelectedBrandId(null);
                              setShowBrandSelector(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left",
                              !selectedBrandId ? "bg-gray-50 text-gray-900" : "hover:bg-gray-50 text-gray-600"
                            )}
                          >
                            <span className="text-[14px]">不使用品牌</span>
                            {!selectedBrandId && <Check size={16} className="text-[#5c5cfc]" />}
                          </button>

                          <div className="h-[1px] bg-gray-50 my-1 mx-2" />

                          {brandGroups.map(brand => (
                            <button
                              key={brand.id}
                              onClick={() => {
                                setSelectedBrandId(brand.id);
                                setShowBrandSelector(false);
                              }}
                              className={cn(
                                "w-full flex flex-col gap-1 px-3 py-2.5 rounded-xl transition-all text-left group",
                                selectedBrandId === brand.id ? "bg-[#5c5cfc]/5 border border-[#5c5cfc]/10" : "hover:bg-gray-50 border border-transparent"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-[14px] font-bold",
                                  selectedBrandId === brand.id ? "text-[#5c5cfc]" : "text-gray-800"
                                )}>
                                  {brand.name}
                                </span>
                                {selectedBrandId === brand.id && <Check size={16} className="text-[#5c5cfc]" />}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="flex -space-x-1">
                                  {brand.colors.map((color, i) => (
                                    <div 
                                      key={i} 
                                      className="w-3 h-3 rounded-full border border-white shadow-sm" 
                                      style={{ backgroundColor: color }} 
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-gray-400 truncate flex-1">{brand.description}</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-50 px-1">
                          <button className="w-full flex items-center justify-between px-3 py-2 text-[12px] text-gray-500 hover:text-[#5c5cfc] hover:bg-[#5c5cfc]/5 rounded-lg transition-all group">
                            <span>管理品牌资产</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>

                        <div className="mt-1 px-1 pb-1">
                          <button
                            type="button"
                            onClick={() => {
                              setDebugNoBrandData((v) => !v);
                              setSelectedBrandId(null);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 text-[12px] rounded-lg transition-all',
                              debugNoBrandData
                                ? 'text-[#5c5cfc] bg-[#5c5cfc]/5'
                                : 'text-gray-500 hover:text-[#5c5cfc] hover:bg-[#5c5cfc]/5'
                            )}
                          >
                            <span>调试：模拟无品牌组数据</span>
                            <span
                              className={cn(
                                'w-9 h-5 rounded-full relative transition-colors',
                                debugNoBrandData ? 'bg-[#5c5cfc]' : 'bg-gray-200'
                              )}
                            >
                              <span
                                className={cn(
                                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all',
                                  debugNoBrandData ? 'left-[18px]' : 'left-0.5'
                                )}
                              />
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div ref={cancelActionAnnotationRef}>
              <Tooltip text={activeWorkflow ? '停止' : '发送'}>
                <button 
                  onClick={() => {
                    if (activeWorkflow) {
                      handleCancelClick(activeWorkflow);
                      return;
                    }
                    handleSend();
                  }}
                  disabled={!activeWorkflow && (!input.trim() || loading)}
                  className={cn(
                    "group relative flex h-7 w-7 items-center justify-center rounded-full transition-all",
                    activeWorkflow
                      ? "bg-[#111111] text-white shadow-lg shadow-black/15 hover:bg-[#222222] hover:scale-105 active:scale-95"
                      : input.trim() && !loading 
                        ? "bg-[#5c5cfc] text-white shadow-lg shadow-[#5c5cfc]/20 hover:scale-105 active:scale-95" 
                        : "bg-gray-100 text-gray-300"
                  )}
                >
                  {activeWorkflow ? (
                    <Square size={10} fill="currentColor" />
                  ) : loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ArrowUp size={14} />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
          </div>
        </div>
      </div>

      {portalRoot
        ? createPortal(
            <>
              <AnimatePresence>
                {showSlowHintCard && (
                  <SlowHintAnnotation anchorRef={slowHintAnnotationRef} portalRoot={portalRoot} />
                )}
                {portalRoot && cancelActionAnnotationRef.current && (
                  <AnnotationBadge
                    id={2}
                    moduleName="发送与停止入口"
                    anchorRef={cancelActionAnnotationRef}
                    portalRoot={portalRoot}
                    positionCache={{ x: 0, y: 0 }}
                    detail={<>
                      <div><strong>显示样式：</strong>无进行中任务时显示发送按钮与箭头图标；有进行中任务时切换为停止按钮与方块图标。</div>
                      <div className="mt-2"><strong>交互与排序：</strong>输入为空时发送按钮禁用；任务进行中时再次点击不会新建任务，而是进入取消链路。</div>
                      <div className="mt-2"><strong>业务定义：</strong>该入口承接“发送任务”和“停止任务”两种语义切换，是生成过程支持取消的第一触发点。</div>
                      <div className="mt-2"><strong>备注：</strong>完整阶段规则与取消策略见 <a href={CANCEL_PRD_URL} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>需求文档</a>。</div>
                    </>}
                  />
                )}
                {hoverPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="fixed z-[115] w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl"
                    style={{
                      left: hoverPreview.x,
                      top: hoverPreview.y,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    <div className="overflow-hidden rounded-xl bg-gray-50">
                      <img src={hoverPreview.url} alt={hoverPreview.name || '预览图'} className="w-full h-56 object-cover" />
                    </div>
                    <div className="px-1 pt-2 text-[12px] font-medium text-gray-600 truncate">
                      {hoverPreview.name || '图片预览'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <BrandDetailPanel
                open={brandDetailOpen}
                brand={brandForDetailPanel}
                onClose={() => setBrandDetailOpen(false)}
              />

              <ResourceLibraryDialog
                open={showResourceLibraryDialog}
                onClose={() => {
                  setShowResourceLibraryDialog(false);
                  setResourceLibraryInitialTab(undefined);
                }}
                seedanceDetectionMode={generationMode === 'video' && currentVideoModelOption.id.startsWith('seedance')}
                initialTab={
                  resourceLibraryInitialTab ?? (
                    videoReferenceTarget === 'ref-audio'
                      ? 'audio'
                      : videoReferenceTarget === 'ref-video'
                        ? 'video'
                        : videoReferenceTarget
                          ? 'image'
                          : undefined
                  )
                }
                selectionMode={videoReferenceTarget ? 'single' : 'multi'}
                confirmLabel={videoReferenceTarget ? '确定选择' : '确定添加'}
                onConfirmAssets={addLibraryAttachments}
              />

              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    className="fixed left-1/2 top-6 z-[140] -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2 text-[12px] font-medium text-white shadow-[0_18px_36px_rgba(17,24,39,0.22)]"
                  >
                    {toastMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {cancelDialog && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[110] bg-black/35 backdrop-blur-[1px]"
                      onClick={() => setCancelDialog(null)}
                    />
                    <motion.div
                      ref={cancelDialogAnnotationRef}
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.96 }}
                      className="fixed left-1/2 top-1/2 z-[111] w-[420px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                          <TriangleAlert size={18} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[18px] font-semibold text-gray-900">{cancelDialog.title}</h3>
                          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">{cancelDialog.description}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => setCancelDialog(null)}
                          className="rounded-full border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
                        >
                          继续等待
                        </button>
                        <button
                          onClick={() => {
                            if (activeWorkflow && activeWorkflow.id === cancelDialog.taskId) {
                              cancelTask(activeWorkflow);
                            }
                            setCancelDialog(null);
                          }}
                          className="rounded-full bg-black px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-900"
                        >
                          {cancelDialog.confirmLabel}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
                {portalRoot && cancelDialog && cancelDialogAnnotationRef.current && (
                  <AnnotationBadge
                    id={4}
                    moduleName="取消确认与结果反馈"
                    anchorRef={cancelDialogAnnotationRef}
                    portalRoot={portalRoot}
                    positionCache={{ x: 0, y: 0 }}
                    detail={<>
                      <div><strong>显示样式：</strong>`queued` 与 `generating` 阶段点击停止后弹出确认弹窗；包含标题、说明、继续等待和确认按钮。</div>
                      <div className="mt-2"><strong>交互与排序：</strong>`queued` 阶段确认后取消并返还积分；`generating` 阶段确认后停止任务但不返还积分；点击“继续等待”关闭弹窗并保持任务继续。</div>
                      <div className="mt-2"><strong>业务定义：</strong>该弹窗用于在高成本阶段拦截误取消，并在确认后写入对应的助手反馈消息与重新生成引导。</div>
                      <div className="mt-2"><strong>备注：</strong>弹窗标题与说明会根据阶段和媒体类型动态变化，详细文案见 <a href={CANCEL_PRD_URL} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>需求文档</a>。</div>
                    </>}
                  />
                )}

            </>,
            portalRoot
          )
        : null}
    </motion.div>
  );
};
