import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer, Circle, RegularPolygon, Arrow, Group, Line } from 'react-konva';
import { Html } from 'react-konva-utils';
import Konva from 'konva';
import JSZip from 'jszip';
import useImage from 'use-image';
import { AppMode, CanvasObject, CanvasMode, WorkflowLink } from '../types';
import { 
  Scissors, 
  Eraser, 
  Layers as LayersIcon, 
  Type, 
  Target, 
  Crop, 
  MessageSquare, 
  Download, 
  Maximize, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  X, 
  ChevronDown, 
  Copy, 
  RotateCcw, 
  Info, 
  Moon,
  Layers,
  Video as VideoIcon,
  Plus,
  Play,
  PanelTop,
  Ungroup,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Wand2,
  Languages,
  Paintbrush,
  ScanSearch,
  Expand,
  BadgeInfo,
  BetweenHorizontalStart,
  Captions,
  Blend
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LayerPanel } from './LayerPanel';

interface CanvasProps {
  objects: CanvasObject[];
  workflowLinks: WorkflowLink[];
  onObjectUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  selectedIds: string[];
  onSelect: (id: string | null, isMulti?: boolean) => void;
  mode: CanvasMode;
  appMode: AppMode;
  onAddGenerator: (generatorType: 'image' | 'video' | 'text', state?: any) => void;
  onCreateLinkedGenerator: (sourceId: string, side: 'left' | 'right', generatorType: 'image' | 'video' | 'text') => void;
  onReEdit: (prompt: string) => void;
  isLayerPanelOpen: boolean;
  onToggleLayerPanel: () => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onExportObject: (id: string) => void;
  onExportSelection: (ids: string[]) => void;
  onReorderObjects: (newObjects: CanvasObject[]) => void;
  onGroup: () => void;
  onCreateArtboard: () => void;
  onCancelArtboard: (id: string) => void;
  onMergeLayers: () => void;
  exportRequest:
    | {
        requestId: number;
        mode: 'source';
        objectIds: string[];
        imageFormat: 'png' | 'jpg';
        videoFormat: 'mp4' | 'frame-png' | 'frame-jpg';
        filename: string;
      }
    | {
        requestId: number;
        mode: 'snapshot';
        objectIds: string[];
        format: 'png' | 'jpg';
        scale: number;
        filename: string;
      }
    | null;
  onExportComplete: (requestId: number) => void;
}

const buildIncludedNodeIds = (objectIds: string[]) =>
  new Set(
    objectIds.flatMap((id) => [
      id,
      `${id}__label`,
      `${id}__content`,
      `${id}__processingMask`,
      `${id}__processingText`,
    ])
  );

const getObjectBounds = (objects: CanvasObject[]) =>
  objects.reduce(
    (acc, obj) => ({
      x: Math.min(acc.x, obj.x),
      y: Math.min(acc.y, obj.y),
      maxX: Math.max(acc.maxX, obj.x + obj.width),
      maxY: Math.max(acc.maxY, obj.y + obj.height),
    }),
    {
      x: Number.POSITIVE_INFINITY,
      y: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }
  );

const inferExtension = (mimeType?: string, fallback = 'bin') => {
  if (!mimeType) return fallback;
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('quicktime')) return 'mov';
  return fallback;
};

const GRID_SIZE = 100;
const GRID_DOT_SIZE = 2;
const GRID_MARGIN_CELLS = 6;
const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

const clampScale = (nextScale: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));

const getObjectScreenRect = (
  obj: CanvasObject,
  scale: number,
  position: { x: number; y: number }
) => ({
  left: obj.x * scale + position.x,
  top: obj.y * scale + position.y,
  right: (obj.x + obj.width) * scale + position.x,
  bottom: (obj.y + obj.height) * scale + position.y,
  width: obj.width * scale,
  height: obj.height * scale,
});

const getRectOverlapArea = (
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number }
) => {
  const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return overlapWidth * overlapHeight;
};

const getWorkflowMenuPlacement = ({
  sourceObject,
  side,
  objects,
  scale,
  position,
  dimensions,
}: {
  sourceObject: CanvasObject;
  side: 'left' | 'right';
  objects: CanvasObject[];
  scale: number;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
}) => {
  const menuWidth = 240;
  const menuHeight = 196;
  const gap = 16;
  const safeMargin = 16;
  const sourceRect = getObjectScreenRect(sourceObject, scale, position);

  const clampLeft = (left: number) =>
    Math.min(
      Math.max(safeMargin, left),
      Math.max(safeMargin, dimensions.width - menuWidth - safeMargin)
    );
  const clampTop = (top: number) =>
    Math.min(
      Math.max(safeMargin, top),
      Math.max(safeMargin, dimensions.height - menuHeight - safeMargin)
    );

  const preferredX =
    side === 'right' ? sourceRect.right + gap : sourceRect.left - menuWidth - gap;

  const candidates = [
    { left: preferredX, top: sourceRect.top - menuHeight - gap, weight: 0 },
    { left: preferredX, top: sourceRect.bottom + gap, weight: 1200 },
    {
      left: side === 'right' ? sourceRect.right + gap : sourceRect.left - menuWidth - gap,
      top: sourceRect.top + sourceRect.height / 2 - menuHeight / 2,
      weight: 300,
    },
    {
      left: side === 'right' ? sourceRect.left - menuWidth - gap : sourceRect.right + gap,
      top: sourceRect.top + sourceRect.height / 2 - menuHeight / 2,
      weight: 800,
    },
  ];

  const otherRects = objects
    .filter((item) => !item.hidden && item.id !== sourceObject.id)
    .map((item) => getObjectScreenRect(item, scale, position));

  let best = { left: clampLeft(candidates[0].left), top: clampTop(candidates[0].top), score: Number.POSITIVE_INFINITY };

  candidates.forEach((candidate) => {
    const rect = {
      left: clampLeft(candidate.left),
      top: clampTop(candidate.top),
      right: clampLeft(candidate.left) + menuWidth,
      bottom: clampTop(candidate.top) + menuHeight,
    };
    const overlapWithSource = getRectOverlapArea(rect, sourceRect);
    const overlapWithOthers = otherRects.reduce((sum, itemRect) => sum + getRectOverlapArea(rect, itemRect), 0);
    const score = overlapWithSource * 10 + overlapWithOthers + candidate.weight;

    if (score < best.score) {
      best = { left: rect.left, top: rect.top, score };
    }
  });

  return { x: best.left, y: best.top };
};

const getGeneratorPanelPlacement = ({
  obj,
  scale,
  position,
  dimensions,
  panelWidth,
}: {
  obj: CanvasObject;
  scale: number;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  panelWidth: number;
}) => {
  const gap = 8;
  const safeMargin = 16;
  const objectRect = {
    left: obj.x * scale + position.x,
    right: (obj.x + obj.width) * scale + position.x,
    bottom: (obj.y + obj.height) * scale + position.y,
  };

  const left = Math.min(
    Math.max(safeMargin, objectRect.left + (objectRect.right - objectRect.left) / 2 - panelWidth / 2),
    Math.max(safeMargin, dimensions.width - panelWidth - safeMargin)
  );

  return {
    left,
    top: objectRect.bottom + gap,
  };
};

const getScreenSelectionBounds = (
  items: CanvasObject[],
  scale: number,
  position: { x: number; y: number }
) => {
  if (items.length === 0) return null;

  return items.reduce(
    (acc, item) => {
      const rect = getObjectScreenRect(item, scale, position);
      return {
        left: Math.min(acc.left, rect.left),
        top: Math.min(acc.top, rect.top),
        right: Math.max(acc.right, rect.right),
        bottom: Math.max(acc.bottom, rect.bottom),
      };
    },
    {
      left: Number.POSITIVE_INFINITY,
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
    }
  );
};

const getGeneratorType = (obj: CanvasObject) => obj.generatorState?.generatorType || 'image';

const GENERATOR_CONFIG = {
  image: {
    label: '图片生成器',
    modelOptions: [
      { name: 'Seedream 3.0', credits: 4 },
      { name: 'Seedream 4.0', credits: 10 },
      { name: 'Seedream 4.5', credits: 10 },
      { name: '全能图像 2.0', credits: 15 },
    ],
    ratioOptions: ['1:1', '4:3', '3:4', '16:9', '9:16'],
    placeholder: '请描述你所需要的图片要求',
    buttonText: '生成图片',
  },
  video: {
    label: '视频生成器',
    modelOptions: [
      { name: '可灵视频 1.6', credits: 20 },
      { name: '可灵视频 1.7', credits: 30 },
      { name: 'Runway Gen-4', credits: 40 },
    ],
    ratioOptions: ['9:16', '16:9', '1:1', '4:3'],
    placeholder: '请描述你想要的视频镜头、动作与氛围',
    buttonText: '生成视频',
  },
  text: {
    label: '文本生成器',
    modelOptions: [
      { name: '文案助手 Pro', credits: 2 },
      { name: '品牌文案 2.0', credits: 4 },
      { name: '营销标题助手', credits: 3 },
    ],
    ratioOptions: ['auto'],
    placeholder: '请描述你需要的标题、卖点文案或段落内容',
    buttonText: '生成文本',
  },
} as const;

const createMockTextResult = (prompt: string) => {
  const safePrompt = prompt.trim().replace(/\s+/g, ' ').slice(0, 28) || '新品发布';
  return `【${safePrompt}】\n以更清晰、有传播感的方式表达核心卖点，突出重点信息与视觉节奏，适合作为画布中的标题、说明文案或营销短句使用。`;
};

const createMockVideoResult = async (prompt: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  }

  const MediaRecorderCtor = window.MediaRecorder;
  if (!MediaRecorderCtor || typeof HTMLCanvasElement === 'undefined') {
    return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  }

  const stream = canvas.captureStream(24);
  const mimeType = MediaRecorderCtor.isTypeSupported?.('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';
  const recorder = new MediaRecorderCtor(stream, { mimeType });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const renderFrame = (progress: number) => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${250 + progress * 70}, 88%, 62%)`);
    gradient.addColorStop(1, `hsl(${220 + progress * 40}, 84%, 54%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.arc(110 + progress * 210, 180, 96, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(340 - progress * 140, 540, 134, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 34px sans-serif';
    ctx.fillText('Video Concept', 40, 86);

    ctx.font = '500 20px sans-serif';
    const safePrompt = prompt.trim().slice(0, 18) || '视频生成测试';
    ctx.fillText(safePrompt, 40, 122);

    const cardY = 270 + Math.sin(progress * Math.PI * 2) * 26;
    ctx.fillStyle = 'rgba(15,23,42,0.18)';
    ctx.fillRect(58, cardY, 364, 214);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(48, cardY - 10, 364, 214);

    ctx.fillStyle = '#111827';
    ctx.font = '600 24px sans-serif';
    ctx.fillText('Preview Clip', 78, cardY + 54);
    ctx.font = '400 18px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('用于测试画布内视频生成器效果，', 78, cardY + 100);
    ctx.fillText('支持预览、导出与首帧合并。', 78, cardY + 132);

    ctx.fillStyle = '#5c5cfc';
    ctx.beginPath();
    ctx.roundRect(78, cardY + 154, 142, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('Play Demo', 114, cardY + 178);
  };

  recorder.start();
  const duration = 1600;
  const start = performance.now();

  await new Promise<void>((resolve) => {
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      renderFrame(progress);
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        window.setTimeout(resolve, 120);
      }
    };
    window.requestAnimationFrame(tick);
  });

  const blob = await new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.stop();
  });

  return URL.createObjectURL(blob);
};

const ContextMenu = ({ x, y, type, onAction, onClose }: any) => {
  const imageActions = [
    { id: 'edit-image', label: '改图', icon: Sparkles },
    { id: 'outpaint', label: '扩图', icon: Maximize },
    { id: 'erase', label: '消除', icon: Eraser },
    { id: 'hd-upscale', label: '高清放大', icon: ScanSearch },
    { id: 'layering', label: '图文分层', icon: LayersIcon },
    { id: 'edit-text', label: '无痕改字', icon: Captions },
    { id: 'extract-subject', label: '提取主体', icon: Target },
    { id: 'crop', label: '裁剪', icon: Crop },
    { id: 'add-to-chat', label: '加入对话', icon: MessageSquare },
    { id: 'download', label: '下载', icon: Download },
  ];

  const videoActions = [
    { id: 'upscale', label: '放大分辨率', icon: Maximize },
    { id: 'remove-bg-video', label: '祛除背景', icon: Scissors },
    { id: 'create-similar', label: '做同款', icon: Sparkles },
    { id: 'add-to-chat', label: '加入对话', icon: MessageSquare },
    { id: 'download', label: '下载', icon: Download },
  ];

  const actions = type === 'image' ? imageActions : videoActions;

  return (
    <div 
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 w-48 z-[100] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: x, top: y }}
      onMouseLeave={onClose}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => { onAction(action.id); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
        >
          <action.icon size={16} className="text-gray-400 group-hover:text-purple-600" />
          <span className="font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

const WorkflowAddNodeMenu = ({
  x,
  y,
  onCreate,
  onClose,
}: {
  x: number;
  y: number;
  onCreate: (type: 'text' | 'image' | 'video') => void;
  onClose: () => void;
}) => {
  const items: Array<{
    type: 'text' | 'image' | 'video';
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    shortcut: string;
  }> = [
    { type: 'text', label: '文字生成', icon: Type, shortcut: 'T' },
    { type: 'image', label: '图片生成', icon: ImageIcon, shortcut: 'I' },
    { type: 'video', label: '视频生成', icon: VideoIcon, shortcut: 'V' },
  ];

  return (
    <div
      className="absolute z-[130] w-[240px] rounded-[24px] border border-gray-100 bg-white p-4 shadow-[0_24px_64px_rgba(15,23,42,0.18)]"
      style={{ left: x, top: y }}
      onMouseLeave={onClose}
    >
      <div className="mb-3 text-[14px] font-medium text-[#9aa3b2]">新增节点</div>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => {
              onCreate(item.type);
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-[#f7f8fc]"
          >
            <span className="inline-flex items-center gap-3">
              <item.icon size={18} className="text-[#4b5563]" />
              <span className="text-[15px] font-medium text-gray-900">{item.label}</span>
            </span>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#f5f7fb] px-2 text-[12px] font-semibold text-[#7f8aa8]">
              {item.shortcut}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const URLImage = ({ src, x, y, width, height, id, onSelect, isSelected, onUpdate, mode, onContextMenu, isProcessing, processingType, locked, onCenterInView }: any) => {
  const [img] = useImage(src, 'anonymous');
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={img}
        x={x}
        y={y}
        width={width || 200}
        height={height || 200}
        id={id}
        draggable={(mode === 'select' || mode === 'point') && !locked}
        onClick={() => !locked && onSelect(id)}
        onTap={() => !locked && onSelect(id)}
        onDblClick={() => !locked && onCenterInView?.(id)}
        onDblTap={() => !locked && onCenterInView?.(id)}
        ref={shapeRef}
        onDragEnd={(e) => {
          onUpdate(id, { x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onUpdate(id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          onContextMenu(e.evt.clientX, e.evt.clientY, 'image', id);
        }}
      />
      {isProcessing && (
        <React.Fragment>
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(0,0,0,0.4)"
            id={`${id}__processingMask`}
            cornerRadius={4}
          />
          <Text
            x={x}
            y={y + height / 2 - 10}
            width={width}
            id={`${id}__processingText`}
            text={`${processingType}...`}
            fill="white"
            align="center"
            fontSize={14}
            fontStyle="bold"
          />
        </React.Fragment>
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const Shape = ({ x, y, width, height, id, onSelect, isSelected, onUpdate, shapeType, content, fill, stroke, mode, locked, onCenterInView }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    x,
    y,
    width,
    height,
    id,
    fill: fill || '#ffffff',
    stroke: isSelected ? '#9333ea' : (stroke || '#e2e8f0'),
    strokeWidth: isSelected ? 2 : 1,
    draggable: (mode === 'select' || mode === 'point') && !locked,
    onClick: () => !locked && onSelect(id),
    onTap: () => !locked && onSelect(id),
    onDblClick: () => !locked && onCenterInView?.(id),
    onDblTap: () => !locked && onCenterInView?.(id),
    ref: shapeRef,
    onDragEnd: (e: any) => onUpdate(id, { x: e.target.x(), y: e.target.y() }),
    onTransformEnd: (e: any) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX() || 1;
      const scaleY = node.scaleY() || 1;
      node.scaleX(1);
      node.scaleY(1);
      onUpdate(id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
      });
    },
  };

  const renderShape = () => {
    switch (shapeType) {
      case 'circle':
        return <Circle {...commonProps} width={width} height={height} x={x + width/2} y={y + height/2} radius={Math.min(width, height) / 2} />;
      case 'triangle':
        return <RegularPolygon {...commonProps} sides={3} radius={Math.min(width, height) / 2} x={x + width/2} y={y + height/2} />;
      case 'star':
        return <RegularPolygon {...commonProps} sides={5} radius={Math.min(width, height) / 2} x={x + width/2} y={y + height/2} />;
      case 'arrow':
        return <Arrow {...commonProps} points={[0, 0, width, height]} pointerLength={10} pointerWidth={10} fill={fill || '#000'} stroke={fill || '#000'} />;
      case 'speech-rect':
      case 'speech-round':
        return <Rect {...commonProps} cornerRadius={shapeType === 'speech-round' ? 20 : 5} />;
      default:
        return <Rect {...commonProps} />;
    }
  };

  return (
    <React.Fragment>
      {renderShape()}
      {content && (
        <Text
          x={x}
          y={y}
          width={width}
          height={height}
          id={`${id}__content`}
          text={content}
          fontSize={14}
          fill="#000"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const Frame = ({ x, y, width, height, id, onSelect, isSelected, onUpdate, label, mode, locked, onCenterInView }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        id={id}
        fill="#ffffff"
        stroke={isSelected ? '#9333ea' : '#e2e8f0'}
        strokeWidth={isSelected ? 2 : 1}
        shadowBlur={10}
        shadowColor="rgba(0,0,0,0.05)"
        draggable={(mode === 'select' || mode === 'point') && !locked}
        onClick={() => !locked && onSelect(id)}
        onTap={() => !locked && onSelect(id)}
        onDblClick={() => !locked && onCenterInView?.(id)}
        onDblTap={() => !locked && onCenterInView?.(id)}
        ref={shapeRef}
        onDragEnd={(e) => {
          onUpdate(id, { x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onUpdate(id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      <Text
        x={x}
        y={y - 20}
        id={`${id}__label`}
        text={label}
        fontSize={12}
        fill="#94a3b8"
        fontStyle="bold"
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const Video = ({ src, x, y, width, height, id, onSelect, isSelected, onUpdate, mode, onContextMenu, isProcessing, processingType, locked, onCenterInView }: any) => {
  const videoElement = React.useMemo(() => {
    const element = document.createElement('video');
    element.src = src;
    element.loop = true;
    element.muted = true;
    element.play();
    return element;
  }, [src]);

  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [videoWidth, setVideoWidth] = useState(width);
  const [videoHeight, setVideoHeight] = useState(height);

  useEffect(() => {
    const layer = shapeRef.current?.getLayer();
    const anim = new (window as any).Konva.Animation(() => {}, layer);
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={videoElement}
        x={x}
        y={y}
        width={width}
        height={height}
        id={id}
        draggable={(mode === 'select' || mode === 'point') && !locked}
        onClick={() => !locked && onSelect(id)}
        onTap={() => !locked && onSelect(id)}
        onDblClick={() => !locked && onCenterInView?.(id)}
        onDblTap={() => !locked && onCenterInView?.(id)}
        ref={shapeRef}
        onDragEnd={(e) => {
          onUpdate(id, { x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onUpdate(id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          onContextMenu(e.evt.clientX, e.evt.clientY, 'video', id);
        }}
      />
      {isProcessing && (
        <React.Fragment>
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(0,0,0,0.4)"
            id={`${id}__processingMask`}
            cornerRadius={4}
          />
          <Text
            x={x}
            y={y + height / 2 - 10}
            width={width}
            id={`${id}__processingText`}
            text={`${processingType}...`}
            fill="white"
            align="center"
            fontSize={14}
            fontStyle="bold"
          />
        </React.Fragment>
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const TextObject = ({
  x,
  y,
  width,
  height,
  id,
  onSelect,
  isSelected,
  onUpdate,
  content,
  mode,
  locked,
  onCenterInView,
  objects,
  fill,
  fontSize = 24,
  fontFamily = 'Source Han Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
  fontWeight = 'normal',
  textAlign = 'center',
}: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);

  useEffect(() => {
    setText(content);
  }, [content]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDblClick = () => {
    if (locked) return;
    onCenterInView?.(id);
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(id, { content: text });
  };

  const canPlaceAt = (nextX: number, nextY: number) =>
    !objects.some((item: CanvasObject) => {
      if (item.hidden || item.id === id) return false;
      return !(
        nextX + width <= item.x ||
        nextX >= item.x + item.width ||
        nextY + height <= item.y ||
        nextY >= item.y + item.height
      );
    });

  return (
    <React.Fragment>
      {!isEditing ? (
        <Text
          x={x}
          y={y}
          width={width}
          height={height}
          id={id}
          text={content}
          fontSize={fontSize}
          fill={fill || '#000000'}
          fontFamily={fontFamily}
          fontStyle={fontWeight}
          align={textAlign}
          verticalAlign="middle"
          draggable={(mode === 'select' || mode === 'point') && !locked}
          onClick={() => !locked && onSelect(id)}
          onTap={() => !locked && onSelect(id)}
          onDblClick={handleDblClick}
          onDblTap={handleDblClick}
          ref={shapeRef}
          dragBoundFunc={(nextPos) => (canPlaceAt(nextPos.x, nextPos.y) ? nextPos : { x, y })}
          onDragEnd={(e) => {
            onUpdate(id, { x: e.target.x(), y: e.target.y() });
          }}
          onTransformEnd={(e) => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onUpdate(id, {
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            });
          }}
        />
      ) : (
        <Html>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            style={{
              position: 'absolute',
              top: y,
              left: x,
              width: width,
              height: height,
              fontSize: `${fontSize}px`,
              border: 'none',
              padding: '0px',
              margin: '0px',
              background: 'none',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.3',
              fontFamily,
              color: fill || '#000000',
              fontWeight,
              textAlign,
            }}
          />
        </Html>
      )}
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const GeneratorUI = ({
  obj,
  onUpdate,
  scale,
  position,
  dimensions,
}: {
  obj: CanvasObject,
  onUpdate: any,
  scale: number,
  position: any,
  dimensions: { width: number; height: number },
}) => {
  const generatorType = getGeneratorType(obj);
  const generatorConfig = GENERATOR_CONFIG[generatorType];
  const [prompt, setPrompt] = useState(obj.generatorState?.prompt || '');
  const [model, setModel] = useState(obj.generatorState?.model || generatorConfig.modelOptions[0].name);
  const [ratio, setRatio] = useState(obj.generatorState?.ratio || generatorConfig.ratioOptions[0]);
  const [refImages, setRefImages] = useState<string[]>(obj.generatorState?.refImages || []);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const ratioMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrompt(obj.generatorState?.prompt || '');
    setModel(obj.generatorState?.model || generatorConfig.modelOptions[0].name);
    setRatio(obj.generatorState?.ratio || generatorConfig.ratioOptions[0]);
    setRefImages(obj.generatorState?.refImages || []);
  }, [obj.id, obj.generatorState?.prompt, obj.generatorState?.model, obj.generatorState?.ratio, obj.generatorState?.refImages, generatorConfig.modelOptions, generatorConfig.ratioOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModelMenu && modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
      if (showRatioMenu && ratioMenuRef.current && !ratioMenuRef.current.contains(event.target as Node)) {
        setShowRatioMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelMenu, showRatioMenu]);

  const models = generatorConfig.modelOptions;
  const ratios = generatorConfig.ratioOptions;
  const currentModel = models.find(m => m.name === model) || models[0];
  const showReferenceUpload = generatorType !== 'text';
  const showRatioSelector = generatorType !== 'text';
  const panelWidth = generatorType === 'text' ? 500 : 440;
  const panelPlacement = getGeneratorPanelPlacement({
    obj,
    scale,
    position,
    dimensions,
    panelWidth,
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onUpdate(obj.id, {
      generatorState: {
        ...obj.generatorState,
        generatorType,
        prompt,
        model,
        ratio,
        refImages,
        status: 'generating',
        resultUrl: undefined,
        resultText: undefined,
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && refImages.length < 5) {
      const url = URL.createObjectURL(file);
      setRefImages([...refImages, url]);
    }
  };

  const isGenerating = obj.generatorState?.status === 'generating';

  return (
      <div 
      className={cn(
        "absolute bg-white rounded-[24px] shadow-2xl border border-gray-100 p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 z-[115]",
        isGenerating && "opacity-50 pointer-events-none grayscale"
      )}
      style={{
        width: panelWidth,
        top: panelPlacement.top,
        left: panelPlacement.left,
      }}
      >
        <div className="relative">
          {(obj.generatorState?.upstreamNodeNames?.length ?? 0) > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {obj.generatorState?.upstreamNodeNames?.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-full bg-[#eaf7ff] px-3 py-1 text-[12px] font-medium text-[#1d9bf0]"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
          {showReferenceUpload && refImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {refImages.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                  <button 
                    onClick={() => setRefImages(refImages.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                    <ImageIcon size={12} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={generatorConfig.placeholder}
            className={cn(
              "w-full p-3 bg-gray-50 rounded-[18px] text-sm resize-none outline-none focus:ring-2 focus:ring-purple-500/20 transition-all",
              generatorType === 'text' ? "h-28 leading-7" : "h-24"
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {showReferenceUpload && refImages.length < 5 && (
              <label className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer transition-colors">
                <ImageIcon size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
            
            <div className="relative" ref={modelMenuRef}>
              <button 
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors"
              >
                {model}
                <ChevronDown size={14} />
              </button>
              {showModelMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-100 p-1 w-40 z-50">
                  {models.map(m => (
                    <button
                      key={m.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModel(m.name);
                        setShowModelMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                        model === m.name ? "bg-purple-50 text-purple-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {showRatioSelector && (
              <div className="relative" ref={ratioMenuRef}>
                <button 
                  onClick={() => setShowRatioMenu(!showRatioMenu)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors"
                >
                  {ratio}
                  <ChevronDown size={14} />
                </button>
                {showRatioMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-100 p-1 w-24 z-50">
                    {ratios.map(r => (
                      <button
                        key={r}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRatio(r);
                          setShowRatioMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                          ratio === r ? "bg-purple-50 text-purple-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              prompt.trim() 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <Sparkles size={16} />
            {isGenerating ? '生成中...' : `${generatorConfig.buttonText} (${currentModel.credits}积分)`}
          </button>
        </div>
    </div>
  );
};

const GeneratorObject = ({ obj, onSelect, isSelected, onUpdate, scale, position, mode, appMode, objects, onShowDetails, locked, onCenterInView }: any) => {
  const generatorType = getGeneratorType(obj);
  const generatorLabel = GENERATOR_CONFIG[generatorType].label;
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(obj.name || generatorLabel);
  const [resultImg] = useImage(obj.generatorState?.resultUrl || '');
  const videoElement = React.useMemo(() => {
    if (generatorType !== 'video' || !obj.generatorState?.resultUrl) return null;
    const element = document.createElement('video');
    element.src = obj.generatorState.resultUrl;
    element.loop = true;
    element.muted = true;
    element.playsInline = true;
    void element.play().catch(() => undefined);
    return element;
  }, [generatorType, obj.generatorState?.resultUrl]);
  const [isHoveringIcon, setIsHoveringIcon] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (obj.generatorState?.status === 'generating') {
      let cancelled = false;
      const timer = window.setTimeout(async () => {
        if (cancelled) return;
        if (generatorType === 'video') {
          const resultUrl = await createMockVideoResult(obj.generatorState?.prompt || '');
          if (cancelled) return;
          onUpdate(obj.id, {
            generatorState: {
              ...obj.generatorState,
              generatorType,
              status: 'success',
              resultUrl,
              resultText: undefined,
            }
          });
          return;
        }

        if (generatorType === 'text') {
          onUpdate(obj.id, {
            generatorState: {
              ...obj.generatorState,
              generatorType,
              status: 'success',
              resultUrl: undefined,
              resultText: createMockTextResult(obj.generatorState?.prompt || ''),
            }
          });
          return;
        }

        onUpdate(obj.id, {
          generatorState: {
            ...obj.generatorState,
            generatorType,
            status: 'success',
            resultUrl: `https://picsum.photos/seed/${Math.random()}/500/500`,
            resultText: undefined,
          }
        });
      }, 3000);

      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }
  }, [generatorType, obj.generatorState, onUpdate, obj.id]);

  useEffect(() => {
    if (generatorType !== 'video' || !videoElement) return;
    const layer = shapeRef.current?.getLayer();
    if (!layer) return;
    const anim = new (window as any).Konva.Animation(() => {}, layer);
    anim.start();
    return () => anim.stop();
  }, [generatorType, videoElement]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    setDraftName(obj.name || generatorLabel);
  }, [obj.name, generatorLabel]);

  const status = obj.generatorState?.status;
  const nameBadgeWidth = Math.max(96, Math.min(220, ((obj.name || generatorLabel).length + 2) * 10));
  const ratioBadgeWidth = Math.max(40, Math.min(72, ((obj.generatorState?.ratio || '1:1').length + 2) * 8));
  const textGeneratorTitle = obj.generatorState?.resultText ? '' : '✍️ 双击此处输入文字..';
  const textGeneratorBody = obj.generatorState?.resultText
    || '可以在此输入提示词，比如画面描述、产品卖点、活动主题、场景描述、品牌 slogan 等内容。\n若暂时没有明确内容，也可先输入关键词或草稿，后续随时修改优化哦！\n也可以在底部输入框输入需求，让 AI 自动完成文字生成。';
  const canPlaceAt = (x: number, y: number) =>
    !objects.some((item: CanvasObject) => {
      if (item.hidden || item.id === obj.id) return false;
      return !(
        x + obj.width <= item.x ||
        x >= item.x + item.width ||
        y + obj.height <= item.y ||
        y >= item.y + item.height
      );
    });

  return (
    <React.Fragment>
      <Group
        id={obj.id}
        x={obj.x}
        y={obj.y}
        draggable={(mode === 'select' || mode === 'point') && !locked}
        dragBoundFunc={(nextPos) => {
          if (appMode !== 'workflow') return nextPos;
          return canPlaceAt(nextPos.x, nextPos.y) ? nextPos : { x: obj.x, y: obj.y };
        }}
        onClick={() => !locked && onSelect(obj.id)}
        onTap={() => !locked && onSelect(obj.id)}
        onDblClick={() => !locked && onCenterInView?.(obj.id)}
        onDblTap={() => !locked && onCenterInView?.(obj.id)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        ref={shapeRef}
        onDragEnd={(e) => {
          onUpdate(obj.id, { x: e.target.x(), y: e.target.y() });
        }}
      >
        {status === 'success' && generatorType === 'image' && resultImg ? (
          <KonvaImage
            image={resultImg}
            width={obj.width}
            height={obj.height}
            cornerRadius={12}
          />
        ) : status === 'success' && generatorType === 'video' && videoElement ? (
          <KonvaImage
            image={videoElement}
            width={obj.width}
            height={obj.height}
            cornerRadius={12}
          />
        ) : generatorType === 'text' ? (
          <React.Fragment>
            <Rect
              width={obj.width}
              height={obj.height}
              fill="#ffffff"
              stroke="#cfe5ff"
              strokeWidth={2}
              cornerRadius={22}
              shadowBlur={20}
              shadowColor="rgba(56,189,248,0.10)"
            />
            {!obj.generatorState?.resultText && (
              <Text
                x={28}
                y={62}
                width={obj.width - 56}
                text={textGeneratorTitle}
                fontSize={16}
                lineHeight={1.4}
                fill="#111827"
                fontStyle="bold"
              />
            )}
            <Text
              x={28}
              y={obj.generatorState?.resultText ? 62 : 102}
              width={obj.width - 56}
              text={textGeneratorBody}
              fontSize={obj.generatorState?.resultText ? 18 : 15}
              lineHeight={obj.generatorState?.resultText ? 1.7 : 1.95}
              fill={obj.generatorState?.resultText ? '#111827' : '#9ca3af'}
              fontStyle={obj.generatorState?.resultText ? 'bold' : 'normal'}
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Rect
              width={obj.width}
              height={obj.height}
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth={2}
              dash={[10, 5]}
              cornerRadius={12}
            />
            <Group x={obj.width / 2 - 40} y={obj.height / 2 - 40}>
              <Circle radius={40} fill="#f1f5f9" />
              <Html>
                <div style={{ transform: 'translate(-20px, -20px)' }}>
                  <Sparkles size={40} className="text-gray-300" />
                </div>
              </Html>
            </Group>
            <Text
              y={obj.height / 2 + 60}
              width={obj.width}
              text={status === 'generating' ? '生成中...' : generatorLabel}
              align="center"
              fontSize={16}
              fill="#94a3b8"
              fontStyle="bold"
            />
          </React.Fragment>
        )}
        
        {status === 'generating' && (
          <Rect
            width={obj.width}
            height={obj.height}
            fill="rgba(255,255,255,0.6)"
            cornerRadius={12}
          />
        )}

        <Text
          x={14}
          y={-26}
          text={generatorType === 'video' ? '◉' : generatorType === 'text' ? 'T' : '✦'}
          fontSize={10}
          fill={generatorType === 'video' ? '#5c5cfc' : generatorType === 'text' ? '#0ea5e9' : '#7c3aed'}
          fontStyle="normal"
          onDblClick={() => setIsEditingName(true)}
          onDblTap={() => setIsEditingName(true)}
        />
        <Text
          x={28}
          y={-26}
          width={nameBadgeWidth}
          text={obj.name || generatorLabel}
          fontSize={11}
          fill="#111827"
          fontStyle="normal"
          ellipsis
          wrap="none"
          onDblClick={() => setIsEditingName(true)}
          onDblTap={() => setIsEditingName(true)}
        />
        {generatorType !== 'text' && (
          <Text
            x={obj.width - ratioBadgeWidth - 12}
            y={-26}
            width={ratioBadgeWidth}
            text={obj.generatorState?.ratio || '1:1'}
            align="right"
            fontSize={11}
            fill="#2563eb"
            fontStyle="normal"
            wrap="none"
          />
        )}

        {status === 'success' && (isSelected || isHovering) && (
          <Group 
            x={obj.width - 24} 
            y={24}
            onMouseEnter={() => setIsHoveringIcon(true)}
            onMouseLeave={() => setIsHoveringIcon(false)}
            onClick={(e) => {
              e.cancelBubble = true;
              onSelect(obj.id);
              onShowDetails();
            }}
            cursor="pointer"
          >
            <Circle radius={18} fill="rgba(0,0,0,0.4)" />
            <Html>
              <div className="pointer-events-none" style={{ transform: 'translate(-9px, -9px)' }}>
                <Info size={18} className="text-white" />
              </div>
            </Html>
            
            {isHoveringIcon && (
              <Html>
                <div className="bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap -translate-x-1/2 -translate-y-full mt-[-24px] pointer-events-none shadow-lg">
                  生成详情
                </div>
              </Html>
            )}
          </Group>
        )}
      </Group>

      {isSelected && (
        <Html>
          <div
            style={{
              position: 'absolute',
              top: obj.y * scale + position.y - 40,
              left: obj.x * scale + position.x + 12,
            }}
          >
            {isEditingName ? (
              <input
                value={draftName}
                autoFocus
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => {
                  onUpdate(obj.id, { name: draftName.trim() || generatorLabel });
                  setIsEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdate(obj.id, { name: draftName.trim() || generatorLabel });
                    setIsEditingName(false);
                  }
                  if (e.key === 'Escape') {
                    setDraftName(obj.name || generatorLabel);
                    setIsEditingName(false);
                  }
                }}
                className="h-8 w-[180px] rounded-[10px] border border-[#cdd8ff] bg-white px-3 text-[13px] font-bold text-gray-900 shadow-lg outline-none"
              />
            ) : (
              <button
                type="button"
                onDoubleClick={() => setIsEditingName(true)}
                className="h-8 rounded-[10px] border border-transparent bg-transparent px-2 text-[13px] font-bold text-transparent"
                title="双击修改名称"
              >
                {obj.name || generatorLabel}
              </button>
            )}
          </div>
        </Html>
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 100 || newBox.height < 100) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const GenerationDetails = ({ obj, onClose, onAddGenerator, onReEdit, scale, position }: { obj: CanvasObject, onClose: () => void, onAddGenerator: any, onReEdit: any, scale: number, position: { x: number, y: number } }) => {
  const [copied, setCopied] = useState(false);
  const generatorType = getGeneratorType(obj);
  const generatorLabel = GENERATOR_CONFIG[generatorType].label;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      generatorType === 'text'
        ? obj.generatorState?.resultText || obj.generatorState?.prompt || ''
        : obj.generatorState?.prompt || ''
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate position to be to the right of the object
  const top = (obj.y) * scale + position.y;
  const left = (obj.x + obj.width) * scale + position.x + 16;

  return (
    <div 
      className="absolute bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-6 w-[320px] z-[120] animate-in fade-in zoom-in-95 duration-200"
      style={{ 
        top: Math.max(20, top), 
        left: left + 340 > window.innerWidth ? (obj.x * scale + position.x - 340) : left 
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-[#f6f7fb] flex items-center justify-center">
            {generatorType === 'text' ? (
              <Type size={18} className="text-[#5c5cfc]" />
            ) : generatorType === 'video' ? (
              <VideoIcon size={18} className="text-[#5c5cfc]" />
            ) : (
              <img 
                src={obj.generatorState?.resultUrl} 
                alt="" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <span className="text-[16px] font-bold text-gray-900 tracking-tight">{generatorLabel}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-7">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-gray-400">提示词</label>
            <button 
              onClick={handleCopy} 
              className="text-gray-400 hover:text-purple-600 transition-colors p-1"
              title="复制提示词"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="text-[15px] text-gray-800 leading-relaxed font-medium">
            {obj.generatorState?.prompt || '无提示词'}
          </p>
          {copied && <div className="text-[11px] text-purple-600 mt-1.5 font-bold">复制成功</div>}
        </div>

        {generatorType === 'text' && (
          <div>
            <label className="text-[13px] font-medium text-gray-400 mb-2 block">生成结果</label>
            <div className="rounded-2xl bg-[#f7f8fc] px-4 py-3 text-[14px] leading-7 text-gray-800">
              {obj.generatorState?.resultText || '暂无生成结果'}
            </div>
          </div>
        )}

        <div>
          <label className="text-[13px] font-medium text-gray-400 mb-2 block">基础模型</label>
          <div className="flex items-center gap-2.5 text-[15px] font-bold text-gray-900">
             <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
               <Moon size={14} className="text-gray-900 fill-gray-900" />
             </div>
             <span>{obj.generatorState?.model || 'Nano Banana Pro'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-gray-400 mb-1.5 block">
              {generatorType === 'text' ? '版式' : '尺寸'}
            </label>
            <div className="text-[15px] font-bold text-gray-900">{obj.generatorState?.ratio || 'auto'}</div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-gray-400 mb-1.5 block">
              {generatorType === 'video' ? '时长' : generatorType === 'text' ? '用途' : '分辨率'}
            </label>
            <div className="text-[15px] font-bold text-gray-900">
              {generatorType === 'video' ? '3s Demo' : generatorType === 'text' ? '画布文案' : '1K'}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-50 flex gap-3">
          <button 
            onClick={() => onReEdit(obj.generatorState?.prompt || '')}
            className="flex-1 py-3 rounded-2xl bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
          >
            重新编辑
          </button>
          <button 
            onClick={() => onAddGenerator(generatorType, {
              ...obj.generatorState,
              status: 'generating',
              resultUrl: undefined,
              resultText: undefined,
            })}
            className="flex-1 py-3 rounded-2xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-100"
          >
            再次生成
          </button>
        </div>
      </div>
    </div>
  );
};

const SelectionToolbar = ({ x, y, width, type, onAction, onShowDetails, isGenerated }: { x: number, y: number, width: number, type: 'image' | 'video', onAction: (id: string) => void, onShowDetails: () => void, isGenerated?: boolean }) => {
  const imageActions = [
    { id: 'edit-image', label: '改图', icon: Sparkles },
    { id: 'outpaint', label: '扩图', icon: Maximize },
    { id: 'erase', label: '消除', icon: Eraser },
    { id: 'hd-upscale', label: '高清放大', icon: ScanSearch },
    { id: 'layering', label: '图文分层', icon: LayersIcon },
    { id: 'edit-text', label: '无痕改字', icon: Captions },
    { id: 'extract-subject', label: '提取主体', icon: Target },
    { id: 'crop', label: '裁剪', icon: Crop },
    { id: 'add-to-chat', label: '加入对话', icon: MessageSquare },
    { id: 'download', label: '下载', icon: Download },
  ];

  const videoActions = [
    { id: 'upscale', label: '放大分辨率', icon: Maximize },
    { id: 'remove-bg-video', label: '祛除背景', icon: Scissors },
    { id: 'create-similar', label: '做同款', icon: Sparkles },
    { id: 'add-to-chat', label: '加入对话', icon: MessageSquare },
    { id: 'download', label: '下载', icon: Download },
  ];

  const actions = type === 'image' ? imageActions : videoActions;

  return (
    <div 
      className="absolute bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 flex items-center gap-1 z-[110] -translate-y-full -translate-x-1/2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ left: x + width / 2, top: y }}
    >
      {actions.map((action) => (
        <div key={action.id} className="relative group">
          <button
            onClick={() => action.id === 'details' ? onShowDetails() : onAction(action.id)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
            title={action.label}
          >
            <action.icon size={16} className="text-gray-500 group-hover:text-purple-600" />
          </button>
          <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block">
            {action.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const applyTextAiAction = (
  content: string,
  action: 'rewrite' | 'continue' | 'shorten' | 'translate-en' | 'translate-ja' | 'polish-business' | 'polish-social'
) => {
  const source = (content || '').trim();
  if (!source) return content;

  switch (action) {
    case 'rewrite':
      return `优化表达：${source.replace(/。?$/, '。')}`;
    case 'continue':
      return `${source}\n继续补充一句更完整的说明，帮助信息表达更自然。`;
    case 'shorten':
      return source.length <= 24 ? source : `${source.slice(0, 24).trim()}...`;
    case 'translate-en':
      return `EN: ${source}`;
    case 'translate-ja':
      return `JP: ${source}`;
    case 'polish-business':
      return `商务版：${source.replace(/。?$/, '，突出核心卖点与专业感。')}`;
    case 'polish-social':
      return `传播版：${source.replace(/。?$/, '，更简洁、更有记忆点。')}`;
    default:
      return content;
  }
};

const TextSelectionToolbar = ({
  x,
  y,
  width,
  obj,
  onUpdate,
  onDownload,
}: {
  x: number;
  y: number;
  width: number;
  obj: CanvasObject;
  onUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onDownload: () => void;
}) => {
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showPolishMenu, setShowPolishMenu] = useState(false);

  const currentFontSize = obj.fontSize || 24;
  const currentFontFamily = obj.fontFamily || 'Source Han Sans SC, PingFang SC, Microsoft YaHei, sans-serif';
  const currentWeight = obj.fontWeight || 'normal';
  const currentAlign = obj.textAlign || 'center';
  const currentColor = obj.fill || '#000000';
  const fontOptions = [
    { label: '思源黑体', value: 'Source Han Sans SC, PingFang SC, Microsoft YaHei, sans-serif' },
    { label: '苹方', value: 'PingFang SC, Source Han Sans SC, Microsoft YaHei, sans-serif' },
    { label: '微软雅黑', value: 'Microsoft YaHei, PingFang SC, sans-serif' },
  ];
  const colorOptions = ['#000000', '#5c5cfc', '#2563eb', '#ea580c', '#dc2626'];

  const runTextAction = (
    action: Parameters<typeof applyTextAiAction>[1]
  ) => {
    onUpdate(obj.id, { content: applyTextAiAction(obj.content || '', action) });
    setShowAiMenu(false);
    setShowTranslateMenu(false);
    setShowPolishMenu(false);
  };

  return (
    <div
      className="absolute z-[114] mb-4 flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 -translate-x-1/2 -translate-y-full"
      style={{ left: x + width / 2, top: y }}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAiMenu((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f2ff] text-[#6d4aff] transition-colors hover:bg-[#ede7ff]"
          title="文字处理"
        >
          <Wand2 size={16} />
        </button>
        {showAiMenu && (
          <div className="absolute left-0 top-[48px] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
            <button onClick={() => runTextAction('rewrite')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50">
              <Wand2 size={15} className="text-gray-500" />
              改写
            </button>
            <button onClick={() => runTextAction('continue')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50">
              <Wand2 size={15} className="text-gray-500" />
              续写
            </button>
            <button onClick={() => runTextAction('shorten')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50">
              <Wand2 size={15} className="text-gray-500" />
              缩写
            </button>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTranslateMenu(true)}
                onMouseLeave={() => setShowTranslateMenu(false)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-3">
                  <Languages size={15} className="text-gray-500" />
                  翻译
                </span>
                <ChevronDown size={14} className="-rotate-90 text-gray-400" />
              </button>
              {showTranslateMenu && (
                <div
                  className="absolute left-full top-0 ml-2 w-[120px] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl"
                  onMouseEnter={() => setShowTranslateMenu(true)}
                  onMouseLeave={() => setShowTranslateMenu(false)}
                >
                  <button onClick={() => runTextAction('translate-en')} className="w-full rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50">英文</button>
                  <button onClick={() => runTextAction('translate-ja')} className="w-full rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50">日文</button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onMouseEnter={() => setShowPolishMenu(true)}
                onMouseLeave={() => setShowPolishMenu(false)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-3">
                  <Paintbrush size={15} className="text-gray-500" />
                  润色
                </span>
                <ChevronDown size={14} className="-rotate-90 text-gray-400" />
              </button>
              {showPolishMenu && (
                <div
                  className="absolute left-full top-0 ml-2 w-[132px] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl"
                  onMouseEnter={() => setShowPolishMenu(true)}
                  onMouseLeave={() => setShowPolishMenu(false)}
                >
                  <button onClick={() => runTextAction('polish-business')} className="w-full rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50">商务风格</button>
                  <button onClick={() => runTextAction('polish-social')} className="w-full rounded-xl px-3 py-2 text-left text-[14px] text-gray-700 hover:bg-gray-50">传播风格</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          const next = currentColor === '#000000' ? '#5c5cfc' : '#000000';
          onUpdate(obj.id, { fill: next });
        }}
        className="h-9 w-9 rounded-xl border border-gray-200"
        style={{ backgroundColor: currentColor }}
        title="文字颜色"
      />

      <select
        value={currentFontFamily}
        onChange={(e) => onUpdate(obj.id, { fontFamily: e.target.value })}
        className="h-9 max-w-[120px] rounded-xl border border-transparent bg-transparent px-2 text-[14px] text-gray-800 outline-none hover:bg-gray-50"
      >
        {fontOptions.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={12}
        max={160}
        value={currentFontSize}
        onChange={(e) => onUpdate(obj.id, { fontSize: Number(e.target.value) || currentFontSize })}
        className="h-9 w-[56px] rounded-xl border border-transparent bg-transparent px-2 text-center text-[14px] text-gray-800 outline-none hover:bg-gray-50"
      />

      <button
        type="button"
        onClick={() =>
          onUpdate(obj.id, {
            fontWeight: currentWeight === 'bold' ? 'normal' : 'bold',
          })
        }
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
          currentWeight === 'bold' ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
        )}
        title="加粗"
      >
        <Bold size={16} />
      </button>

      <div className="flex items-center rounded-xl border border-gray-100 bg-[#fafafa] p-1">
        {[
          { key: 'left', icon: AlignLeft },
          { key: 'center', icon: AlignCenter },
          { key: 'right', icon: AlignRight },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onUpdate(obj.id, { textAlign: option.key as 'left' | 'center' | 'right' })}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              currentAlign === option.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            )}
            title={`对齐 ${option.key}`}
          >
            <option.icon size={15} />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onUpdate(obj.id, { fill: color })}
            className={cn(
              "h-5 w-5 rounded-full border",
              currentColor === color ? "border-gray-900" : "border-white"
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onDownload}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#5c5cfc]"
        title="下载"
      >
        <Download size={16} />
      </button>
    </div>
  );
};

const MultiSelectionToolbar = ({
  x,
  y,
  width,
  actions,
}: {
  x: number;
  y: number;
  width: number;
  actions: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    onClick: () => void;
  }>;
}) => {
  return (
    <div
      className="absolute z-[112] mb-4 flex items-center gap-1 rounded-xl border border-gray-100 bg-white p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 -translate-x-1/2 -translate-y-full"
      style={{ left: x + width / 2, top: y }}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={action.onClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#5c5cfc]"
          title={action.label}
        >
          <action.icon size={17} />
        </button>
      ))}
    </div>
  );
};

const ImageFusionPromptPanel = ({
  x,
  y,
  width,
  value,
  onChange,
  onSubmit,
  selectedCount,
  disabled,
}: {
  x: number;
  y: number;
  width: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  selectedCount: number;
  disabled?: boolean;
}) => {
  const panelWidth = Math.max(360, Math.min(520, width));

  return (
    <div
      className="absolute z-[116] rounded-[24px] border border-gray-100 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.14)] animate-in fade-in slide-in-from-top-2 duration-200"
      style={{ left: x + width / 2 - panelWidth / 2, top: y - 132, width: panelWidth }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入你的灵感"
        className="h-24 w-full resize-none rounded-[18px] bg-[#f7f8fc] px-4 py-3 text-[15px] text-gray-900 outline-none ring-0 placeholder:text-[#a0a8bb]"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className={cn(
            "inline-flex h-11 items-center rounded-2xl px-5 text-[14px] font-medium transition-all",
            disabled || !value.trim()
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-[#5c5cfc] text-white hover:bg-[#4f4ff5]"
          )}
        >
          生成
          <span className="ml-2 text-[12px] text-inherit/80">({selectedCount} 张)</span>
        </button>
      </div>
    </div>
  );
};

const WorkflowEmptyState = ({
  onAddGenerator,
}: {
  onAddGenerator: (generatorType: 'image' | 'video' | 'text', state?: any) => void;
}) => {
  const cards: Array<{
    title: string;
    subtitle: string;
    generatorType: 'image' | 'video' | 'text';
    prompt: string;
    gradient: string;
    accent: string;
  }> = [
    {
      title: '图转提示词',
      subtitle: '拆解图片风格与描述结构',
      generatorType: 'text',
      prompt: '请基于上传图片生成一段可复用的高质量提示词。',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #164e63 55%, #334155 100%)',
      accent: 'from-[#67e8f9]/35 to-transparent',
    },
    {
      title: '图生视频',
      subtitle: '让静态画面延展为动态镜头',
      generatorType: 'video',
      prompt: '基于当前图片延展生成一段具有镜头运动感的视频。',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #475569 45%, #020617 100%)',
      accent: 'from-[#93c5fd]/35 to-transparent',
    },
    {
      title: '多图融合',
      subtitle: '组合多素材生成统一画面',
      generatorType: 'image',
      prompt: '将多张参考图的主体、风格与构图融合为一张完整新图。',
      gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c2d12 48%, #111827 100%)',
      accent: 'from-[#fdba74]/35 to-transparent',
    },
    {
      title: '探索工作流',
      subtitle: '从示例节点开始搭建流程',
      generatorType: 'image',
      prompt: '从这里开始搭建一个新的多步骤创作工作流。',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #7c3aed 100%)',
      accent: 'from-[#c4b5fd]/35 to-transparent',
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto flex max-w-[980px] flex-col items-center px-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-8 flex items-center gap-4 text-sm text-[#98a2b3]">
          <button
            type="button"
            onClick={() => onAddGenerator('image')}
            className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:border-[#cfd7ff] hover:text-[#5c5cfc]"
          >
            添加节点
          </button>
          <span className="text-[14px]">
            右键添加或拖拽图片，或是从以下案例入手
          </span>
        </div>

        <div className="grid w-full grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <button
              key={card.title}
              type="button"
              onClick={() =>
                onAddGenerator(card.generatorType, {
                  prompt: card.prompt,
                })
              }
              className="group relative h-[82px] overflow-hidden rounded-[18px] p-0 text-left shadow-[0_10px_40px_rgba(15,23,42,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(15,23,42,0.18)]"
              style={{ background: card.gradient }}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-r opacity-90", card.accent)} />
              <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
                <div className="h-14 w-10 rounded-[10px] border border-white/20 bg-white/15 backdrop-blur-sm" />
                <div className="h-12 w-12 rounded-[12px] border border-white/20 bg-white/20 backdrop-blur-sm" />
                <div
                  className={cn(
                    "h-14 w-9 rounded-[10px] border border-white/15 backdrop-blur-sm",
                    index === 0 ? "bg-black/35" : "bg-white/12"
                  )}
                />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-center px-5">
                <div className="text-[14px] font-semibold tracking-[0.01em] text-white">{card.title}</div>
                <div className="mt-1 text-[11px] text-white/70">{card.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Canvas: React.FC<CanvasProps> = ({ 
  objects, 
  workflowLinks,
  onObjectUpdate, 
  selectedIds, 
  onSelect, 
  mode,
  appMode,
  onAddGenerator,
  onCreateLinkedGenerator,
  onReEdit,
  isLayerPanelOpen,
  onToggleLayerPanel,
  onDeleteObject,
  onDuplicateObject,
  onExportObject,
  onExportSelection,
  onReorderObjects,
  onGroup,
  onCreateArtboard,
  onCancelArtboard,
  onMergeLayers,
  exportRequest,
  onExportComplete
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'image' | 'video', id: string } | null>(null);
  const [showDetailsId, setShowDetailsId] = useState<string | null>(null);
  const [workflowCreateMenu, setWorkflowCreateMenu] = useState<{
    sourceId: string;
    side: 'left' | 'right';
    x: number;
    y: number;
  } | null>(null);
  const [imageFusionState, setImageFusionState] = useState<{
    objectIds: string[];
    prompt: string;
  } | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isStageDragging, setIsStageDragging] = useState(false);
  const hasAutoCenteredRef = useRef(false);

  const viewportBounds = useMemo(() => {
    const safeScale = scale || 1;
    const left = -position.x / safeScale;
    const top = -position.y / safeScale;
    const right = left + dimensions.width / safeScale;
    const bottom = top + dimensions.height / safeScale;

    return { left, top, right, bottom };
  }, [dimensions.height, dimensions.width, position.x, position.y, scale]);

  const gridDots = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];

    const startX =
      Math.floor(viewportBounds.left / GRID_SIZE) * GRID_SIZE - GRID_MARGIN_CELLS * GRID_SIZE;
    const endX =
      Math.ceil(viewportBounds.right / GRID_SIZE) * GRID_SIZE + GRID_MARGIN_CELLS * GRID_SIZE;
    const startY =
      Math.floor(viewportBounds.top / GRID_SIZE) * GRID_SIZE - GRID_MARGIN_CELLS * GRID_SIZE;
    const endY =
      Math.ceil(viewportBounds.bottom / GRID_SIZE) * GRID_SIZE + GRID_MARGIN_CELLS * GRID_SIZE;

    const dots: Array<{ key: string; x: number; y: number }> = [];
    for (let x = startX; x <= endX; x += GRID_SIZE) {
      for (let y = startY; y <= endY; y += GRID_SIZE) {
        dots.push({ key: `${x}-${y}`, x, y });
      }
    }

    return dots;
  }, [dimensions.height, dimensions.width, viewportBounds.bottom, viewportBounds.left, viewportBounds.right, viewportBounds.top]);

  const zoomToPoint = (anchor: { x: number; y: number }, targetScale: number) => {
    const nextScale = clampScale(targetScale);
    const currentScale = scale || 1;
    const worldPoint = {
      x: (anchor.x - position.x) / currentScale,
      y: (anchor.y - position.y) / currentScale,
    };

    setScale(nextScale);
    setPosition({
      x: anchor.x - worldPoint.x * nextScale,
      y: anchor.y - worldPoint.y * nextScale,
    });
  };

  const centerObjectsInView = (targetObjects: CanvasObject[]) => {
    if (dimensions.width === 0 || dimensions.height === 0 || targetObjects.length === 0) return;

    const visibleObjects = targetObjects.filter((obj) => !obj.hidden);
    if (visibleObjects.length === 0) return;

    const bounds = getObjectBounds(visibleObjects);
    if (!Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) return;

    const contentCenterX = bounds.x + (bounds.maxX - bounds.x) / 2;
    const contentCenterY = bounds.y + (bounds.maxY - bounds.y) / 2;

    setPosition({
      x: dimensions.width / 2 - contentCenterX * scale,
      y: dimensions.height / 2 - contentCenterY * scale,
    });
  };

  const centerObjectInView = (targetId: string) => {
    const targetObject = objects.find((obj) => obj.id === targetId && !obj.hidden);
    if (!targetObject) return;

    const relatedObjects =
      targetObject.type === 'frame'
        ? objects.filter((obj) => !obj.hidden && (obj.id === targetId || obj.parentId === targetId))
        : [targetObject];

    centerObjectsInView(relatedObjects);
  };

  useEffect(() => {
    if (selectedIds.length === 0) {
      setShowDetailsId(null);
      setWorkflowCreateMenu(null);
    }
  }, [selectedIds]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    const handleWindowBlur = () => {
      setIsSpacePressed(false);
      setIsStageDragging(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  useEffect(() => {
    if (hasAutoCenteredRef.current) return;
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const visibleObjects = objects.filter((obj) => !obj.hidden);
    if (visibleObjects.length === 0) return;

    centerObjectsInView(visibleObjects);
    hasAutoCenteredRef.current = true;
  }, [dimensions.height, dimensions.width, objects, scale]);

  const selectedObject = objects.find(obj => obj.id === selectedIds[0]);
  const selectedVisibleObjects = selectedIds
    .map((id) => objects.find((obj) => obj.id === id))
    .filter((obj): obj is CanvasObject => Boolean(obj && !obj.hidden));
  const selectedTextObject =
    selectedIds.length === 1 && selectedObject?.type === 'text' && !selectedObject.hidden
      ? selectedObject
      : null;
  const selectedFusionImages = selectedVisibleObjects.filter(
    (obj) => obj.type === 'image' && Boolean(obj.content)
  );
  const selectedGeneratorObject =
    selectedObject?.type === 'image-generator' && !selectedObject.hidden ? selectedObject : null;
  const selectedWorkflowObject =
    appMode === 'workflow' && selectedIds.length === 1 && selectedObject && !selectedObject.hidden
      ? selectedObject
      : null;
  const selectedWorkflowRect = selectedWorkflowObject
    ? getObjectScreenRect(selectedWorkflowObject, scale, position)
    : null;
  const workflowHandles = selectedWorkflowRect
    ? {
        left: {
          x: selectedWorkflowRect.left - 20,
          y: selectedWorkflowRect.top + selectedWorkflowRect.height / 2 - 12,
        },
        right: {
          x: selectedWorkflowRect.right + 4,
          y: selectedWorkflowRect.top + selectedWorkflowRect.height / 2 - 12,
        },
      }
    : null;
  const toolbarPos = selectedObject && (selectedObject.type === 'image' || selectedObject.type === 'video') ? {
    x: selectedObject.x * scale + position.x,
    y: selectedObject.y * scale + position.y,
    width: selectedObject.width * scale,
    type: selectedObject.type,
    isGenerated: !!selectedObject.generatorState
  } : null;
  const textToolbarPos = selectedTextObject
    ? {
        x: selectedTextObject.x * scale + position.x,
        y: selectedTextObject.y * scale + position.y,
        width: selectedTextObject.width * scale,
      }
    : null;
  const multiSelectionBounds =
    selectedVisibleObjects.length > 1
      ? getScreenSelectionBounds(selectedVisibleObjects, scale, position)
      : null;
  const imageFusionBounds =
    imageFusionState
      ? getScreenSelectionBounds(
          imageFusionState.objectIds
            .map((id) => objects.find((obj) => obj.id === id))
            .filter((obj): obj is CanvasObject => Boolean(obj && !obj.hidden)),
          scale,
          position
        )
      : null;
  const workflowMultiSelectableObjects = selectedVisibleObjects.filter(
    (item) => item.type === 'image-generator'
  );

  const handleAction = (actionId: string, targetId?: string) => {
    const id = targetId || contextMenu?.id || selectedIds[0];
    if (!id) return;
    const currentObject = objects.find((obj) => obj.id === id);
    if (!currentObject) return;
    const actionLabels: Record<string, string> = {
      'edit-image': '改图',
      'outpaint': '扩图',
      'erase': '消除',
      'hd-upscale': '高清放大',
      'layering': '图文分层',
      'edit-text': '无痕改字',
      'extract-subject': '提取主体',
      'crop': '裁剪',
      'add-to-chat': '加入对话',
      'download': '下载',
      'upscale': '放大分辨率',
      'remove-bg-video': '祛除背景',
      'create-similar': '做同款',
    };

    if (actionId === 'download') {
      onExportObject(id);
      return;
    }

    if (actionId === 'add-to-chat') {
      const label = currentObject.name || (currentObject.type === 'video' ? '视频' : '图片');
      onReEdit(`基于当前${label}继续处理：`);
      return;
    }

    if (actionId === 'outpaint') {
      onObjectUpdate(id, {
        x: currentObject.x - 24,
        y: currentObject.y - 24,
        width: currentObject.width + 48,
        height: currentObject.height + 48,
        isProcessing: true,
        processingType: actionLabels[actionId],
      });
      window.setTimeout(() => {
        onObjectUpdate(id, { isProcessing: false, processingType: undefined });
      }, 1200);
      return;
    }

    if (actionId === 'hd-upscale' || actionId === 'upscale') {
      onObjectUpdate(id, {
        width: Math.round(currentObject.width * 1.25),
        height: Math.round(currentObject.height * 1.25),
        isProcessing: true,
        processingType: actionLabels[actionId],
      });
      window.setTimeout(() => {
        onObjectUpdate(id, { isProcessing: false, processingType: undefined });
      }, 1200);
      return;
    }

    if (actionId === 'extract-subject') {
      onObjectUpdate(id, {
        stroke: '#5c5cfc',
        isProcessing: true,
        processingType: actionLabels[actionId],
      });
      window.setTimeout(() => {
        onObjectUpdate(id, { isProcessing: false, processingType: undefined });
      }, 1200);
      return;
    }

    if (actionId === 'crop') {
      onObjectUpdate(id, {
        width: Math.max(80, Math.round(currentObject.width * 0.86)),
        height: Math.max(80, Math.round(currentObject.height * 0.86)),
        isProcessing: true,
        processingType: actionLabels[actionId],
      });
      window.setTimeout(() => {
        onObjectUpdate(id, { isProcessing: false, processingType: undefined });
      }, 800);
      return;
    }

    if (actionId === 'edit-text') {
      onObjectUpdate(id, {
        name: `${currentObject.name || '图片'}-改字版`,
        isProcessing: true,
        processingType: actionLabels[actionId],
      });
      window.setTimeout(() => {
        onObjectUpdate(id, { isProcessing: false, processingType: undefined });
      }, 1200);
      return;
    }

    // Mock processing
    onObjectUpdate(id, { isProcessing: true, processingType: actionLabels[actionId] });
    window.setTimeout(() => {
      onObjectUpdate(id, { isProcessing: false });
    }, 2000);
  };

  const handleRunWorkflowNodes = () => {
    workflowMultiSelectableObjects.forEach((item) => {
      if (item.type !== 'image-generator') return;
      const generatorType = getGeneratorType(item);
      const currentPrompt = item.generatorState?.prompt?.trim() || '';
      const upstreamPrompt =
        item.generatorState?.upstreamNodeNames?.length
          ? `基于「${item.generatorState.upstreamNodeNames.join('、')}」继续生成：`
          : '';
      const nextPrompt = currentPrompt || upstreamPrompt;
      if (!nextPrompt) return;

      onObjectUpdate(item.id, {
        generatorState: {
          ...item.generatorState,
          generatorType,
          prompt: nextPrompt,
          status: 'generating',
          resultUrl: undefined,
          resultText: undefined,
        },
      });
    });
  };

  const handleDuplicateSelection = () => {
    selectedVisibleObjects.forEach((item) => onDuplicateObject(item.id));
  };

  const handleDeleteSelection = () => {
    [...selectedVisibleObjects].reverse().forEach((item) => onDeleteObject(item.id));
  };

  const handleExportSelection = () => {
    onExportSelection(selectedVisibleObjects.map((item) => item.id));
  };

  const handleOpenImageFusion = () => {
    if (selectedFusionImages.length < 2) return;
    setImageFusionState({
      objectIds: selectedFusionImages.map((item) => item.id),
      prompt: '',
    });
  };

  const handleSubmitImageFusion = () => {
    if (!imageFusionState) return;
    const fusionObjects = imageFusionState.objectIds
      .map((id) => objects.find((obj) => obj.id === id))
      .filter((obj): obj is CanvasObject => Boolean(obj && obj.type === 'image' && obj.content));
    if (fusionObjects.length < 2) return;

    onAddGenerator('image', {
      prompt: imageFusionState.prompt.trim(),
      refImages: fusionObjects.map((obj) => obj.content as string),
      status: 'idle',
      ratio: '1:1',
      model: 'Seedream 4.0',
    });
    setImageFusionState(null);
  };

  const multiSelectionActions = multiSelectionBounds
    ? [
        ...(selectedFusionImages.length >= 2
          ? [
              {
                id: 'image-fusion',
                label: '图片融合',
                icon: Blend,
                onClick: handleOpenImageFusion,
              },
            ]
          : []),
        ...(appMode === 'workflow' && workflowMultiSelectableObjects.length >= 2
          ? [
              {
                id: 'run',
                label: '运行',
                icon: Play,
                onClick: handleRunWorkflowNodes,
              },
            ]
          : []),
        {
          id: 'duplicate',
          label: '复制',
          icon: Copy,
          onClick: handleDuplicateSelection,
        },
        {
          id: 'group',
          label: '成组',
          icon: Ungroup,
          onClick: onGroup,
        },
        {
          id: 'artboard',
          label: '新建画板',
          icon: PanelTop,
          onClick: onCreateArtboard,
        },
        {
          id: 'merge',
          label: '合并',
          icon: Layers,
          onClick: onMergeLayers,
        },
        {
          id: 'download',
          label: '下载',
          icon: Download,
          onClick: handleExportSelection,
        },
        {
          id: 'delete',
          label: '删除',
          icon: Trash2,
          onClick: handleDeleteSelection,
        },
      ]
    : [];

  useEffect(() => {
    if (!imageFusionState) return;

    const validIds = imageFusionState.objectIds.filter((id) =>
      objects.some((obj) => obj.id === id && !obj.hidden && obj.type === 'image' && obj.content)
    );

    if (validIds.length < 2) {
      setImageFusionState(null);
      return;
    }

    if (validIds.length !== imageFusionState.objectIds.length) {
      setImageFusionState((prev) => (prev ? { ...prev, objectIds: validIds } : prev));
    }
  }, [imageFusionState, objects]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      const scaleBy = 1.1;
      const oldScale = stage.scaleX();
      const nextScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      zoomToPoint(pointer, nextScale);
      return;
    }

    setPosition((current) => ({
      x: current.x - e.evt.deltaX,
      y: current.y - e.evt.deltaY,
    }));
  };

  const isTemporaryHandMode = isSpacePressed;
  const interactionMode: CanvasMode = isTemporaryHandMode ? 'hand' : mode;
  const canPanStage = mode === 'hand' || isTemporaryHandMode || (mode === 'select' && selectedIds.length === 0);
  const stageCursor = isStageDragging
    ? 'grabbing'
    : canPanStage
      ? 'grab'
      : mode === 'point'
        ? 'crosshair'
        : 'default';

  useEffect(() => {
    if (!exportRequest || !stageRef.current) return;

    const stage = stageRef.current;
    const layer = stage.getLayers()[0];
    const objectMap = new Map(objects.map((obj) => [obj.id, obj]));
    const expandedIds = exportRequest.objectIds.flatMap((id) => {
      const target = objectMap.get(id);
      if (!target) return [];
      if (target.type === 'frame') {
        return [id, ...objects.filter((obj) => obj.parentId === id).map((obj) => obj.id)];
      }
      return [id];
    });
    const uniqueObjectIds = Array.from(new Set(expandedIds));
    const targetObjects = uniqueObjectIds
      .map((id) => objectMap.get(id))
      .filter((obj): obj is CanvasObject => Boolean(obj && !obj.hidden));

    if (targetObjects.length === 0) {
      onExportComplete(exportRequest.requestId);
      return;
    }

    const requestedObjects = exportRequest.objectIds
      .map((id) => objectMap.get(id))
      .filter((obj): obj is CanvasObject => Boolean(obj && !obj.hidden));
    const hiddenNodes = new Map<any, boolean>();
    const gridNodes = stage.find('.export-grid');
    const backgroundNodes = stage.find('.export-background');
    const transformers = stage.find('Transformer');

    const setVisible = (node: any, visible: boolean) => {
      if (!hiddenNodes.has(node)) {
        hiddenNodes.set(node, node.visible());
      }
      node.visible(visible);
    };

    const restoreVisibility = () => {
      hiddenNodes.forEach((visible, node) => node.visible(visible));
      stage.batchDraw();
    };

    const withExportScene = async <T,>(
      exportIds: string[],
      boundsSource: CanvasObject[],
      backgroundMode: 'transparent' | 'white',
      action: (bounds: ReturnType<typeof getObjectBounds>) => Promise<T> | T
    ) => {
      const includedNodeIds = buildIncludedNodeIds(exportIds);
      const objectNodes = stage.find((node: any) => {
        if (typeof node.id !== 'function') return false;
        const nodeId = node.id();
        return Boolean(nodeId) && !includedNodeIds.has(nodeId);
      });

      [...gridNodes, ...backgroundNodes, ...transformers, ...objectNodes].forEach((node) => setVisible(node, false));

      let exportBackground: Konva.Rect | null = null;
      const bounds = getObjectBounds(boundsSource);

      if (backgroundMode === 'white') {
        exportBackground = new Konva.Rect({
          x: bounds.x,
          y: bounds.y,
          width: bounds.maxX - bounds.x,
          height: bounds.maxY - bounds.y,
          fill: '#ffffff',
        });
        layer.add(exportBackground);
        exportBackground.moveToBottom();
      }

      stage.batchDraw();

      try {
        return await action(bounds);
      } finally {
        if (exportBackground) {
          exportBackground.destroy();
        }
        restoreVisibility();
      }
    };

    const downloadDataUrl = (dataUrl: string, filename: string) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.click();
    };

    const dataUrlToBlob = async (dataUrl: string) => {
      const response = await fetch(dataUrl);
      return response.blob();
    };

    const fetchSourceBlob = async (obj: CanvasObject) => {
      if (!obj.content) return null;
      try {
        const response = await fetch(obj.content);
        return await response.blob();
      } catch {
        return null;
      }
    };

    const sanitizeName = (value: string) =>
      value.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'asset';

    const run = async () => {
      if (exportRequest.mode === 'snapshot') {
        const boundsSource =
          requestedObjects.length === 1 && requestedObjects[0].type === 'frame'
            ? requestedObjects
            : targetObjects;

        const dataUrl = await withExportScene(
          uniqueObjectIds,
          boundsSource,
          exportRequest.format === 'jpg' ? 'white' : 'transparent',
          async (bounds) =>
            stage.toDataURL({
              x: bounds.x,
              y: bounds.y,
              width: Math.max(1, bounds.maxX - bounds.x),
              height: Math.max(1, bounds.maxY - bounds.y),
              pixelRatio: exportRequest.scale,
              mimeType: exportRequest.format === 'jpg' ? 'image/jpeg' : 'image/png',
              quality: exportRequest.format === 'jpg' ? 1 : undefined,
            })
        );

        downloadDataUrl(dataUrl, `${exportRequest.filename}.${exportRequest.format}`);
        return;
      }

      const shouldZipSourceItems = exportRequest.mode === 'source' && exportRequest.objectIds.length > 1;
      const zip = shouldZipSourceItems ? new JSZip() : null;
      const imageMimeType = exportRequest.imageFormat === 'jpg' ? 'image/jpeg' : 'image/png';
      const imageExt = exportRequest.imageFormat === 'jpg' ? 'jpg' : 'png';
      const videoAsFrame = exportRequest.videoFormat !== 'mp4';
      const videoFrameMimeType = exportRequest.videoFormat === 'frame-jpg' ? 'image/jpeg' : 'image/png';
      const videoFrameExt = exportRequest.videoFormat === 'frame-jpg' ? 'jpg' : 'png';

      for (const objectId of exportRequest.objectIds) {
        const rootObject = objectMap.get(objectId);
        if (!rootObject || rootObject.hidden) continue;

        const exportIds =
          rootObject.type === 'frame'
            ? [objectId, ...objects.filter((obj) => obj.parentId === objectId).map((obj) => obj.id)]
            : [objectId];
        const itemObjects = exportIds
          .map((id) => objectMap.get(id))
          .filter((obj): obj is CanvasObject => Boolean(obj && !obj.hidden));
        if (itemObjects.length === 0) continue;

        const baseName = sanitizeName(rootObject.name || rootObject.content || rootObject.type);
        const shouldDownloadVideoSource = rootObject.type === 'video' && !videoAsFrame;

        if (shouldDownloadVideoSource) {
          const blob = await fetchSourceBlob(rootObject);
          if (blob) {
            const ext = inferExtension(blob.type, 'mp4');
            if (!shouldZipSourceItems) {
              const url = URL.createObjectURL(blob);
              downloadDataUrl(url, `${baseName}.${ext}`);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              continue;
            }
            zip?.file(`${baseName}.${ext}`, blob);
            continue;
          }
        }

        const boundsSource = rootObject.type === 'frame' ? [rootObject] : itemObjects;
        const renderMimeType = rootObject.type === 'video' && videoAsFrame ? videoFrameMimeType : imageMimeType;
        const renderExt = rootObject.type === 'video' && videoAsFrame ? videoFrameExt : imageExt;
        const dataUrl = await withExportScene(
          exportIds,
          boundsSource,
          renderMimeType === 'image/jpeg' ? 'white' : 'transparent',
          async (bounds) =>
            stage.toDataURL({
              x: bounds.x,
              y: bounds.y,
              width: Math.max(1, bounds.maxX - bounds.x),
              height: Math.max(1, bounds.maxY - bounds.y),
              pixelRatio: 2,
              mimeType: renderMimeType,
              quality: renderMimeType === 'image/jpeg' ? 1 : undefined,
            })
        );
        if (!shouldZipSourceItems) {
          downloadDataUrl(dataUrl, `${baseName}.${renderExt}`);
        } else {
          zip?.file(`${baseName}.${renderExt}`, await dataUrlToBlob(dataUrl));
        }
      }

      if (shouldZipSourceItems && zip) {
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        downloadDataUrl(url, `${exportRequest.filename}.zip`);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    };

    run().finally(() => {
      onExportComplete(exportRequest.requestId);
    });
  }, [exportRequest, objects, onExportComplete]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#f0f2f5] overflow-hidden relative"
      style={{ cursor: stageCursor }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        draggable={canPanStage}
        onDragStart={() => setIsStageDragging(true)}
        onDragMove={(e) => {
          setPosition({ x: e.target.x(), y: e.target.y() });
        }}
        onDragEnd={(e) => {
          setIsStageDragging(false);
          setPosition({ x: e.target.x(), y: e.target.y() });
        }}
        onMouseDown={(e) => {
          if (isTemporaryHandMode) {
            return;
          }
          const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('background');
          if (clickedOnEmpty) {
            onSelect(null);
          }
        }}
      >
        <Layer>
          {/* Grid background */}
          <Rect
            x={viewportBounds.left - GRID_MARGIN_CELLS * GRID_SIZE}
            y={viewportBounds.top - GRID_MARGIN_CELLS * GRID_SIZE}
            width={viewportBounds.right - viewportBounds.left + GRID_MARGIN_CELLS * GRID_SIZE * 2}
            height={viewportBounds.bottom - viewportBounds.top + GRID_MARGIN_CELLS * GRID_SIZE * 2}
            fill="#f8f9fa"
            name="background export-background"
          />
          {/* Simple dot grid */}
          {gridDots.map((dot) => (
            <Rect
              key={dot.key}
              x={dot.x}
              y={dot.y}
              width={GRID_DOT_SIZE}
              height={GRID_DOT_SIZE}
              fill="#e2e8f0"
              name="export-grid"
              cornerRadius={1}
            />
          ))}

          {appMode === 'workflow' &&
            workflowLinks.map((link) => {
              const fromObject = objects.find((obj) => obj.id === link.fromId && !obj.hidden);
              const toObject = objects.find((obj) => obj.id === link.toId && !obj.hidden);
              if (!fromObject || !toObject) return null;

              const fromOnLeft = fromObject.x > toObject.x;
              const startX = fromOnLeft ? fromObject.x : fromObject.x + fromObject.width;
              const endX = fromOnLeft ? toObject.x + toObject.width : toObject.x;
              const startY = fromObject.y + fromObject.height / 2;
              const endY = toObject.y + toObject.height / 2;
              const midX = startX + (endX - startX) / 2;

              return (
                <Line
                  key={link.id}
                  points={[startX, startY, midX, startY, midX, endY, endX, endY]}
                  stroke="#111111"
                  strokeWidth={2}
                  tension={0.4}
                  bezier
                  lineCap="round"
                  lineJoin="round"
                />
              );
            })}
          
          {/* Render Frames first so they are at the bottom */}
          {objects.filter(obj => obj.type === 'frame' && !obj.hidden).map((obj) => (
            <Frame
              key={obj.id}
              id={obj.id}
              label={obj.content}
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              isSelected={selectedIds.includes(obj.id)}
              onSelect={onSelect}
              onUpdate={onObjectUpdate}
              mode={interactionMode}
              locked={obj.locked}
              onCenterInView={centerObjectInView}
            />
          ))}

          {/* Render Shapes */}
          {objects.filter(obj => obj.type === 'shape' && !obj.hidden).map((obj) => (
            <Shape
              key={obj.id}
              id={obj.id}
              shapeType={obj.shapeType}
              content={obj.content}
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              fill={obj.fill}
              stroke={obj.stroke}
              isSelected={selectedIds.includes(obj.id)}
              onSelect={onSelect}
              onUpdate={onObjectUpdate}
              mode={interactionMode}
              locked={obj.locked}
              onCenterInView={centerObjectInView}
            />
          ))}

          {/* Render Images on top */}
          {objects.filter(obj => obj.type === 'image' && !obj.hidden).map((obj) => (
            <React.Fragment key={obj.id}>
              <URLImage
                id={obj.id}
                src={obj.content}
                x={obj.x}
                y={obj.y}
                width={obj.width}
                height={obj.height}
                isSelected={selectedIds.includes(obj.id)}
                onSelect={onSelect}
                onUpdate={onObjectUpdate}
                mode={interactionMode}
                onContextMenu={(x: number, y: number, type: string, id: string) => setContextMenu({ x, y, type: type as any, id })}
                isProcessing={obj.isProcessing}
                processingType={obj.processingType}
                locked={obj.locked}
                onCenterInView={centerObjectInView}
              />
              {imageFusionState && imageFusionState.objectIds.includes(obj.id) && (
                <Group x={obj.x + 8} y={obj.y + 8}>
                  <Rect width={28} height={24} fill="rgba(255,255,255,0.92)" cornerRadius={8} />
                  <Text
                    width={28}
                    height={24}
                    text={`#${imageFusionState.objectIds.indexOf(obj.id) + 1}`}
                    align="center"
                    verticalAlign="middle"
                    fontSize={12}
                    fontStyle="bold"
                    fill="#6b7280"
                  />
                </Group>
              )}
            </React.Fragment>
          ))}

          {/* Render Videos */}
          {objects.filter(obj => obj.type === 'video' && !obj.hidden).map((obj) => (
            <Video
              key={obj.id}
              id={obj.id}
              src={obj.content}
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              isSelected={selectedIds.includes(obj.id)}
              onSelect={onSelect}
              onUpdate={onObjectUpdate}
              mode={interactionMode}
              onContextMenu={(x: number, y: number, type: string, id: string) => setContextMenu({ x, y, type: type as any, id })}
              isProcessing={obj.isProcessing}
              processingType={obj.processingType}
              locked={obj.locked}
              onCenterInView={centerObjectInView}
            />
          ))}

          {/* Render Text */}
          {objects.filter(obj => obj.type === 'text' && !obj.hidden).map((obj) => (
            <TextObject
              key={obj.id}
              id={obj.id}
              content={obj.content}
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              isSelected={selectedIds.includes(obj.id)}
              onSelect={onSelect}
              onUpdate={onObjectUpdate}
              mode={interactionMode}
              locked={obj.locked}
              onCenterInView={centerObjectInView}
              objects={objects}
              fill={obj.fill}
              fontSize={obj.fontSize}
              fontFamily={obj.fontFamily}
              fontWeight={obj.fontWeight}
              textAlign={obj.textAlign}
            />
          ))}

          {/* Render Generators */}
          {objects.filter(obj => obj.type === 'image-generator' && !obj.hidden).map((obj) => (
            <GeneratorObject
              key={obj.id}
              obj={obj}
              onSelect={onSelect}
              isSelected={selectedIds.includes(obj.id)}
              onUpdate={onObjectUpdate}
              scale={scale}
              position={position}
              mode={interactionMode}
              appMode={appMode}
              objects={objects}
              onShowDetails={() => setShowDetailsId(obj.id)}
              onCenterInView={centerObjectInView}
            />
          ))}
        </Layer>
      </Stage>

      {selectedGeneratorObject && (
        <GeneratorUI
          obj={selectedGeneratorObject}
          onUpdate={onObjectUpdate}
          scale={scale}
          position={position}
          dimensions={dimensions}
        />
      )}

      {appMode === 'workflow' && selectedWorkflowObject && workflowHandles && (
        <>
          {(['left', 'right'] as const).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => {
                const placement = getWorkflowMenuPlacement({
                  sourceObject: selectedWorkflowObject,
                  side,
                  objects,
                  scale,
                  position,
                  dimensions,
                });
                setWorkflowCreateMenu({
                  sourceId: selectedWorkflowObject.id,
                  side,
                  x: placement.x,
                  y: placement.y,
                });
              }}
              className="absolute z-[120] flex h-6 w-6 items-center justify-center rounded-full border border-[#9fe7ff] bg-[#4fd5ff] text-white shadow-lg transition-transform hover:scale-105"
              style={{
                left: side === 'left' ? workflowHandles.left.x : workflowHandles.right.x,
                top: side === 'left' ? workflowHandles.left.y : workflowHandles.right.y,
              }}
            >
              <Plus size={14} />
            </button>
          ))}
        </>
      )}

      {workflowCreateMenu && (
        <WorkflowAddNodeMenu
          x={workflowCreateMenu.x}
          y={workflowCreateMenu.y}
          onCreate={(type) => onCreateLinkedGenerator(workflowCreateMenu.sourceId, workflowCreateMenu.side, type)}
          onClose={() => setWorkflowCreateMenu(null)}
        />
      )}

      {objects.length === 0 &&
        (appMode === 'workflow' ? (
          <WorkflowEmptyState onAddGenerator={onAddGenerator} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="max-w-md w-full p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-1000">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center border border-gray-100 rotate-[-6deg]">
                  <ImageIcon size={40} className="text-[#5c5cfc]" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-[#5c5cfc] rounded-2xl shadow-lg flex items-center justify-center rotate-[12deg]">
                  <Sparkles size={24} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">开启你的创意之旅</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  你可以通过左侧工具栏上传图片，<br />
                  或者在右侧对话框中描述你的想法，让我为你生成。
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-50">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  AI 助手已就绪
                </div>
              </div>
            </div>
          </div>
        ))}

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          type={contextMenu.type} 
          onAction={(actionId: string) => handleAction(actionId, contextMenu.id)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {toolbarPos && (
        <SelectionToolbar 
          x={toolbarPos.x} 
          y={toolbarPos.y} 
          width={toolbarPos.width} 
          type={toolbarPos.type} 
          isGenerated={toolbarPos.isGenerated}
          onAction={(actionId: string) => handleAction(actionId, selectedIds[0]!)}
          onShowDetails={() => setShowDetailsId(selectedIds[0] || null)}
        />
      )}

      {textToolbarPos && selectedTextObject && (
        <TextSelectionToolbar
          x={textToolbarPos.x}
          y={textToolbarPos.y}
          width={textToolbarPos.width}
          obj={selectedTextObject}
          onUpdate={onObjectUpdate}
          onDownload={() => onExportObject(selectedTextObject.id)}
        />
      )}

      {multiSelectionBounds && (
        <MultiSelectionToolbar
          x={multiSelectionBounds.left}
          y={multiSelectionBounds.top}
          width={multiSelectionBounds.right - multiSelectionBounds.left}
          actions={multiSelectionActions}
        />
      )}

      {imageFusionState && imageFusionBounds && (
        <ImageFusionPromptPanel
          x={imageFusionBounds.left}
          y={imageFusionBounds.top}
          width={imageFusionBounds.right - imageFusionBounds.left}
          value={imageFusionState.prompt}
          onChange={(value) =>
            setImageFusionState((prev) => (prev ? { ...prev, prompt: value } : prev))
          }
          onSubmit={handleSubmitImageFusion}
          selectedCount={imageFusionState.objectIds.length}
        />
      )}

      {showDetailsId && objects.find(o => o.id === showDetailsId) && (
        <GenerationDetails 
          obj={objects.find(o => o.id === showDetailsId)!} 
          onClose={() => setShowDetailsId(null)}
          onAddGenerator={onAddGenerator}
          onReEdit={onReEdit}
          scale={scale}
          position={position}
        />
      )}
      
      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <button 
          onClick={onToggleLayerPanel}
          disabled={objects.length === 0}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all",
            objects.length === 0 
              ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
              : cn(
                  "bg-white text-gray-600 hover:text-black hover:scale-105 active:scale-95",
                  isLayerPanelOpen && "bg-[#5c5cfc] text-white"
                )
          )}
        >
          <Layers size={20} />
        </button>

        <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs font-medium text-gray-500 flex items-center gap-2 h-10">
          <button
            onClick={() =>
              zoomToPoint(
                { x: dimensions.width / 2, y: dimensions.height / 2 },
                scale / 1.1
              )
            }
            className="hover:text-black w-6 h-6 flex items-center justify-center"
          >
            -
          </button>
          <span className="min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() =>
              zoomToPoint(
                { x: dimensions.width / 2, y: dimensions.height / 2 },
                scale * 1.1
              )
            }
            className="hover:text-black w-6 h-6 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isLayerPanelOpen && (
          <LayerPanel 
            objects={objects}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onUpdate={onObjectUpdate}
            onDelete={onDeleteObject}
            onDuplicate={onDuplicateObject}
            onExport={onExportObject}
            onReorder={onReorderObjects}
            onClose={onToggleLayerPanel}
            onGroup={onGroup}
            onCreateArtboard={onCreateArtboard}
            onCancelArtboard={onCancelArtboard}
            onMergeLayers={onMergeLayers}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
