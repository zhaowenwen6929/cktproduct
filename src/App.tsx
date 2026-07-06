import React, { useMemo, useState, useEffect } from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { AppMode, CanvasObject, CanvasMode, GenerationAttachment, WorkflowLink } from './types';
import { ExportDialog, ExportFormat, ExportItem, ExportScale, ImageExportFormat, VideoExportFormat } from './components/ExportDialog';

type ExportRequest =
  | {
      requestId: number;
      mode: 'source';
      objectIds: string[];
      imageFormat: ImageExportFormat;
      videoFormat: VideoExportFormat;
      filename: string;
    }
  | {
      requestId: number;
      mode: 'snapshot';
      objectIds: string[];
      format: ExportFormat;
      scale: ExportScale;
      filename: string;
    };

let objectIdCounter = 0;
const createObjectId = (prefix = 'obj') => {
  objectIdCounter += 1;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${objectIdCounter}`;
};

const DEFAULT_CANVAS_ORIGIN = { x: 120, y: 120 };
const DEFAULT_ITEM_GAP = 32;
const DEFAULT_PLACEMENT_GAP = 32;
const DEMO_IMAGE_BAG = 'https://picsum.photos/seed/workflow-bag/520/520';
const DEMO_IMAGE_MODEL = 'https://picsum.photos/seed/workflow-model/640/820';
const DEMO_IMAGE_EDITORIAL = 'https://picsum.photos/seed/workflow-editorial/700/860';
const DEMO_IMAGE_MOON = 'https://picsum.photos/seed/workflow-moon/880/620';
const DEMO_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export default function App() {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [workflowLinks, setWorkflowLinks] = useState<WorkflowLink[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentMode, setCurrentMode] = useState<CanvasMode>('select');
  const [appMode, setAppMode] = useState<AppMode>('canvas');
  const [agentInput, setAgentInput] = useState('');
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [credits, setCredits] = useState(204843);
  const [projectName, setProjectName] = useState('Logo设计');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSelectedIds, setExportSelectedIds] = useState<string[]>([]);
  const [exportRequest, setExportRequest] = useState<ExportRequest | null>(null);

  const exportableItems = useMemo<ExportItem[]>(() => {
    return objects
      .filter((obj) => !obj.hidden)
      .map((obj, index) => ({
        id: obj.id,
        type: obj.type,
        name: obj.name || obj.content || `${obj.type}-${index + 1}`,
        width: obj.width,
        height: obj.height,
        thumbnail:
          obj.type === 'image'
            ? obj.content
            : obj.type === 'video'
              ? undefined
              : obj.type === 'image-generator'
                ? obj.generatorState?.resultUrl
                : undefined,
        source: obj.type === 'image-generator' ? obj.generatorState?.resultUrl : obj.content,
      }));
  }, [objects]);

  const exportableIdSet = useMemo(() => new Set(exportableItems.map((item) => item.id)), [exportableItems]);

  const openExportDialog = (preferredIds?: string[]) => {
    if (objects.filter((obj) => !obj.hidden).length === 0) {
      window.alert('画布中还没有任何内容，请先添加一下内容再导出吧！');
      return;
    }

    const nextIds = (preferredIds?.filter((id) => exportableIdSet.has(id)) ?? []);
    setExportSelectedIds(nextIds.length > 0 ? nextIds : exportableItems.map((item) => item.id));
    setIsExportOpen(true);
  };

  const getVisibleObjectBounds = (items: CanvasObject[]) => {
    const visible = items.filter((item) => !item.hidden);
    if (visible.length === 0) return null;

    return visible.reduce(
      (acc, item) => ({
        minX: Math.min(acc.minX, item.x),
        minY: Math.min(acc.minY, item.y),
        maxX: Math.max(acc.maxX, item.x + item.width),
        maxY: Math.max(acc.maxY, item.y + item.height),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      }
    );
  };

  const getGeneratorType = (item: CanvasObject) => item.generatorState?.generatorType || 'image';

  const buildWorkflowPrompt = (upstreamNames: string[]) =>
    upstreamNames.length > 0 ? `基于「${upstreamNames.join('、')}」继续生成：` : '';

  const buildGeneratorObject = (
    items: CanvasObject[],
    generatorType: 'image' | 'video' | 'text',
    initialState?: any,
  ) => {
    const generatorBaseName =
      generatorType === 'video'
        ? '视频生成器'
        : generatorType === 'text'
          ? '文本生成器'
          : '图片生成器';
    const nextGeneratorIndex =
      items.filter(
        (item) =>
          item.type === 'image-generator' &&
          (item.generatorState?.generatorType || 'image') === generatorType
      ).length + 1;

    const defaults =
      generatorType === 'video'
        ? {
            prompt: '',
            model: '可灵视频 1.6',
            ratio: '9:16',
            refImages: [],
            status: 'idle' as const,
            generatorType,
            upstreamNodeNames: [] as string[],
          }
        : generatorType === 'text'
          ? {
              prompt: '',
              model: '文案助手 Pro',
              ratio: 'auto',
              refImages: [],
              status: 'idle' as const,
              generatorType,
              upstreamNodeNames: [] as string[],
            }
          : {
              prompt: '',
              model: 'Seedream 4.0',
              ratio: '1:1',
              refImages: [],
              status: 'idle' as const,
              generatorType,
              upstreamNodeNames: [] as string[],
            };

    const size =
      generatorType === 'text'
        ? { width: 460, height: 360 }
        : generatorType === 'video'
          ? { width: 375, height: 500 }
          : { width: 500, height: 500 };

    return {
      object: {
        id: createObjectId('generator'),
        type: 'image-generator' as const,
        name: `${generatorBaseName}${nextGeneratorIndex}`,
        width: size.width,
        height: size.height,
        generatorState: initialState ? { ...defaults, ...initialState } : defaults,
      },
      size,
    };
  };

  const resolveLinkedNodePosition = (
    items: CanvasObject[],
    sourceObject: CanvasObject,
    side: 'left' | 'right',
    width: number,
    height: number,
  ) => {
    const horizontalGap = 96;
    const verticalGap = 48;
    const preferredX =
      side === 'right'
        ? sourceObject.x + sourceObject.width + horizontalGap
        : sourceObject.x - width - horizontalGap;
    const preferredY = sourceObject.y + Math.max(0, sourceObject.height / 2 - height / 2);

    const intersects = (x: number, y: number) =>
      items.some((item) => {
        if (item.hidden) return false;
        return !(
          x + width <= item.x ||
          x >= item.x + item.width ||
          y + height <= item.y ||
          y >= item.y + item.height
        );
      });

    const yOffsets = [0, height + verticalGap, -(height + verticalGap), (height + verticalGap) * 2, -(height + verticalGap) * 2];
    const xOffsets = [0, width + horizontalGap, (width + horizontalGap) * 2];

    for (const xOffset of xOffsets) {
      const x = side === 'right' ? preferredX + xOffset : preferredX - xOffset;
      for (const yOffset of yOffsets) {
        const y = preferredY + yOffset;
        if (!intersects(x, y)) {
          return { x, y };
        }
      }
    }

    return { x: preferredX, y: preferredY + (height + verticalGap) * 3 };
  };

  const getNextStandalonePosition = (items: CanvasObject[], width: number, height: number) => {
    const bounds = getVisibleObjectBounds(items);
    if (!bounds) return DEFAULT_CANVAS_ORIGIN;

    return {
      x: DEFAULT_CANVAS_ORIGIN.x,
      y: bounds.maxY + DEFAULT_ITEM_GAP,
    };
  };

  const resolveNonOverlappingPosition = (
    items: CanvasObject[],
    width: number,
    height: number,
    preferred?: { x: number; y: number }
  ) => {
    const visible = items.filter((item) => !item.hidden);
    const base = preferred ?? getNextStandalonePosition(items, width, height);

    const intersects = (x: number, y: number) =>
      visible.some((item) => {
        return !(
          x + width <= item.x ||
          x >= item.x + item.width ||
          y + height <= item.y ||
          y >= item.y + item.height
        );
      });

    if (!intersects(base.x, base.y)) return base;

    const columnGap = width + DEFAULT_PLACEMENT_GAP;
    const rowGap = height + DEFAULT_PLACEMENT_GAP;
    const yOffsets = [0, rowGap, -rowGap, rowGap * 2, -rowGap * 2, rowGap * 3];
    const xOffsets = [0, columnGap, -columnGap, columnGap * 2, -columnGap * 2];

    for (const yOffset of yOffsets) {
      for (const xOffset of xOffsets) {
        const next = { x: base.x + xOffset, y: Math.max(DEFAULT_CANVAS_ORIGIN.y, base.y + yOffset) };
        if (!intersects(next.x, next.y)) {
          return next;
        }
      }
    }

    const bounds = getVisibleObjectBounds(visible);
    return bounds
      ? { x: DEFAULT_CANVAS_ORIGIN.x, y: bounds.maxY + DEFAULT_ITEM_GAP }
      : base;
  };

  const getNextMediaGridPosition = (items: CanvasObject[], width: number, height: number) => {
    const visible = items.filter((item) => !item.hidden);
    if (visible.length === 0) {
      return DEFAULT_CANVAS_ORIGIN;
    }

    const mediaItems = visible.filter((item) => item.type === 'image' || item.type === 'video');
    if (mediaItems.length === 0) {
      const bounds = getVisibleObjectBounds(visible);
      return bounds
        ? { x: DEFAULT_CANVAS_ORIGIN.x, y: bounds.maxY + DEFAULT_ITEM_GAP }
        : DEFAULT_CANVAS_ORIGIN;
    }

    const rowTolerance = 24;
    const columnGap = 28;
    const lastRowTop = Math.max(...mediaItems.map((item) => item.y));
    const lastRowItems = mediaItems
      .filter((item) => Math.abs(item.y - lastRowTop) <= rowTolerance)
      .sort((a, b) => a.x - b.x);

    if (lastRowItems.length === 1) {
      const firstItem = lastRowItems[0];
      return {
        x: firstItem.x + firstItem.width + columnGap,
        y: firstItem.y,
      };
    }

    const lastRowBottom = Math.max(...lastRowItems.map((item) => item.y + item.height), lastRowTop + height);
    return {
      x: DEFAULT_CANVAS_ORIGIN.x,
      y: lastRowBottom + DEFAULT_ITEM_GAP,
    };
  };

  const getNextGeneratorPosition = (items: CanvasObject[], width: number, height: number) => {
    const visible = items.filter((item) => !item.hidden);
    if (visible.length === 0) return DEFAULT_CANVAS_ORIGIN;

    const overallBounds = getVisibleObjectBounds(visible);
    const generatorItems = visible.filter((item) => item.type === 'image-generator');
    if (generatorItems.length > 0) {
      const baseY = overallBounds ? Math.max(DEFAULT_CANVAS_ORIGIN.y, overallBounds.maxY + DEFAULT_ITEM_GAP) : DEFAULT_CANVAS_ORIGIN.y;
      const alignedGenerators = generatorItems.filter((item) => item.y >= baseY - height - DEFAULT_ITEM_GAP - 40);
      const sourceItems = alignedGenerators.length > 0 ? alignedGenerators : generatorItems;
      const lastGenerator = sourceItems.reduce((latest, item) =>
        item.y > latest.y || (item.y === latest.y && item.x > latest.x) ? item : latest
      );

      const nextX = lastGenerator.x + lastGenerator.width + DEFAULT_ITEM_GAP;
      const rowLimit = DEFAULT_CANVAS_ORIGIN.x + width * 2 + DEFAULT_ITEM_GAP;

      if (nextX + width <= rowLimit) {
        return { x: nextX, y: lastGenerator.y };
      }

      const rowBottom = Math.max(
        ...sourceItems
          .filter((item) => Math.abs(item.y - lastGenerator.y) < 40)
          .map((item) => item.y + item.height)
      );
      return {
        x: DEFAULT_CANVAS_ORIGIN.x,
        y: Math.max(baseY, rowBottom + DEFAULT_ITEM_GAP),
      };
    }

    return overallBounds
      ? { x: DEFAULT_CANVAS_ORIGIN.x, y: overallBounds.maxY + DEFAULT_ITEM_GAP }
      : DEFAULT_CANVAS_ORIGIN;
  };

  const loadAttachmentSize = (attachment: GenerationAttachment): Promise<{ width: number; height: number }> => {
    if (attachment.type === 'video') {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const width = video.videoWidth || 480;
          const height = video.videoHeight || 640;
          resolve({ width, height });
        };
        video.onerror = () => resolve({ width: 480, height: 640 });
        video.src = attachment.url;
      });
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width || 400, height: img.height || 400 });
      img.onerror = () => resolve({ width: 400, height: 400 });
      img.src = attachment.url;
    });
  };

  const normalizeAttachmentSize = (
    attachment: GenerationAttachment,
    width: number,
    height: number,
  ) => {
    const maxWidth = attachment.type === 'video' ? 480 : 400;
    const maxHeight = attachment.type === 'video' ? 480 : 400;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    return {
      width: width * ratio,
      height: height * ratio,
    };
  };

  const handleAddGeneratedAssets = async (attachments: GenerationAttachment[]) => {
    const canvasAttachments = attachments.filter(
      (attachment): attachment is GenerationAttachment & { type: 'image' | 'video' } => attachment.type !== 'audio'
    );

    if (canvasAttachments.length === 0) return;

    const measured = await Promise.all(
      canvasAttachments.map(async (attachment) => {
        const size = await loadAttachmentSize(attachment);
        return {
          attachment,
          size: normalizeAttachmentSize(attachment, size.width, size.height),
        };
      })
    );

    const columns = 2;
    const columnGap = 28;
    const rowGap = 28;

    setObjects((prev) => {
      const existingBounds = getVisibleObjectBounds(prev);
      const startX = DEFAULT_CANVAS_ORIGIN.x;
      const startY = existingBounds ? existingBounds.maxY + 48 : DEFAULT_CANVAS_ORIGIN.y;
      const columnWidths = Array.from({ length: columns }, (_, col) =>
        Math.max(
          ...measured
            .filter((_, index) => index % columns === col)
            .map((item) => item.size.width),
          0
        )
      );

      const newObjects: CanvasObject[] = measured.map(({ attachment, size }, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const previousColumnWidth = columnWidths.slice(0, column).reduce((sum, value) => sum + value, 0);
        const x = startX + previousColumnWidth + column * columnGap;

        const previousRows = Array.from({ length: row }, (_, rowIndex) => {
          const items = measured.slice(rowIndex * columns, rowIndex * columns + columns);
          return Math.max(...items.map((item) => item.size.height), 0);
        });
        const y = startY + previousRows.reduce((sum, value) => sum + value, 0) + row * rowGap;

        return {
          id: createObjectId(attachment.type),
          type: attachment.type,
          name: attachment.type === 'video' ? '视频' : '图片',
          x,
          y,
          width: size.width,
          height: size.height,
          content: attachment.url,
        };
      });

      return [...prev, ...newObjects];
    });
    setSelectedIds([]);
  };

  const handleAddImage = (url: string) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 400;
      const maxHeight = 400;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      const newObj: CanvasObject = {
        id: createObjectId('image'),
        type: 'image',
        name: '图片',
        x: 0,
        y: 0,
        width,
        height,
        content: url,
      };
      setObjects((prev) => {
        const position = getNextMediaGridPosition(prev, width, height);
        return [...prev, { ...newObj, ...position }];
      });
      setSelectedIds([newObj.id]);
    };
    img.src = url;
  };

  const handleAddVideo = (url: string) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      const maxWidth = 480;
      const maxHeight = 480;
      let width = video.videoWidth || 480;
      let height = video.videoHeight || 640;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

      const newObj: CanvasObject = {
        id: createObjectId('video'),
        type: 'video',
        name: '视频',
        x: 0,
        y: 0,
        width: width * ratio,
        height: height * ratio,
        content: url,
      };
      setObjects((prev) => {
        const position = getNextMediaGridPosition(prev, width * ratio, height * ratio);
        return [...prev, { ...newObj, ...position }];
      });
      setSelectedIds([newObj.id]);
    };
    video.src = url;
  };

  const handleAddFrame = (width: number, height: number, label: string) => {
    const newObj: CanvasObject = {
      id: createObjectId('frame'),
      type: 'frame',
      name: label,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width,
      height,
      content: label,
      fill: '#ffffff',
    };
    setObjects(prev => [...prev, newObj]);
    setSelectedIds([newObj.id]);
  };

  const handleAddShape = (type: any, hasText?: boolean) => {
    const newObj: CanvasObject = {
      id: createObjectId('shape'),
      type: 'shape',
      name: '形状',
      shapeType: type,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      width: 100,
      height: 100,
      content: hasText ? '文字' : '',
      fill: '#ffffff',
      stroke: '#e2e8f0',
    };
    setObjects(prev => [...prev, newObj]);
    setSelectedIds([newObj.id]);
  };

  const handleAddText = () => {
    const newObj: CanvasObject = {
      id: createObjectId('text'),
      type: 'text',
      name: '文字',
      x: 0,
      y: 0,
      width: 200,
      height: 50,
      content: '双击编辑文字',
      fontSize: 24,
      fontFamily: 'Source Han Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      fill: '#000000',
    };
    setObjects(prev => {
      const position = resolveNonOverlappingPosition(prev, newObj.width, newObj.height);
      return [...prev, { ...newObj, ...position }];
    });
    setSelectedIds([newObj.id]);
  };

  const handleAddGenerator = (
    generatorType: 'image' | 'video' | 'text' = 'image',
    initialState?: any
  ) => {
    const built = buildGeneratorObject(objects, generatorType, initialState);
    setObjects(prev => {
      const position = getNextGeneratorPosition(prev, built.size.width, built.size.height);
      return [...prev, { ...built.object, ...position }];
    });
    setSelectedIds([built.object.id]);
  };

  const handleAddWorkflowPreset = (preset: 'prompt' | 'image-to-video' | 'fusion' | 'explore') => {
    const baseX = 48;
    const baseY = 92;

    const makeText = (overrides: Partial<CanvasObject>): CanvasObject => ({
      id: createObjectId('text'),
      type: 'text',
      name: '文字',
      x: 0,
      y: 0,
      width: 220,
      height: 60,
      content: '',
      fontSize: 16,
      fontFamily: 'Source Han Sans SC, PingFang SC, Microsoft YaHei, sans-serif',
      fontWeight: 'normal',
      textAlign: 'left',
      fill: '#111827',
      ...overrides,
    });

    const makeFrame = (overrides: Partial<CanvasObject>): CanvasObject => ({
      id: createObjectId('frame'),
      type: 'frame',
      name: '说明面板',
      x: 0,
      y: 0,
      width: 360,
      height: 640,
      content: '说明面板',
      fill: '#ffffff',
      ...overrides,
    });

    const makeImage = (overrides: Partial<CanvasObject>): CanvasObject => ({
      id: createObjectId('image'),
      type: 'image',
      name: '图片',
      x: 0,
      y: 0,
      width: 280,
      height: 280,
      content: DEMO_IMAGE_BAG,
      ...overrides,
    });

    const buildGenerator = (
      generatorType: 'image' | 'video' | 'text',
      overrides: Partial<CanvasObject> & { generatorState?: any }
    ): CanvasObject => {
      const built = buildGeneratorObject([], generatorType, overrides.generatorState);
      return {
        ...built.object,
        ...overrides,
        generatorState: {
          ...built.object.generatorState,
          ...(overrides.generatorState || {}),
        },
      } as CanvasObject;
    };

    const objectsToAdd: CanvasObject[] = [];
    const linksToAdd: WorkflowLink[] = [];

    if (preset === 'prompt') {
      const source = makeImage({
        id: createObjectId('image'),
        name: '原图',
        x: baseX + 470,
        y: baseY + 20,
        width: 334,
        height: 255,
        content: DEMO_IMAGE_MOON,
      });
      const promptNode = buildGenerator('text', {
        id: createObjectId('generator'),
        name: '提示词生成1',
        x: baseX + 880,
        y: baseY + 20,
        width: 360,
        height: 250,
        generatorState: {
          generatorType: 'text',
          prompt: '分析这张图片并生成可复用摄影提示词',
          model: '文案助手 Pro',
          ratio: 'auto',
          refImages: [DEMO_IMAGE_MOON],
          status: 'success',
          resultText:
            '超现实主义摄影，黄昏暮色的旷野上，年轻女人跪坐在荒草中，身着带蕾丝的宽松白色薄纱长裙，蓬松的浅棕卷发，低头凝视捧自己双手捧住的发光圆月，圆月是满月的纹理，散发温暖暖黄色柔光，整体环境是朦胧的冷调灰蓝色暮色，远景是模糊的草坡与朦胧天空，背景虚化，画面带散景橙暖色光斑，低暗调，柔焦，情绪氛围感，梦幻质感，长焦拍摄，4K高清',
        },
      });
      const panel = makeFrame({
        x: baseX,
        y: baseY,
        width: 380,
        height: 700,
        name: '提示词生成说明',
        content: '提示词生成',
      });

      objectsToAdd.push(
        panel,
        makeText({
          x: baseX + 24,
          y: baseY + 30,
          width: 320,
          height: 48,
          content: '第1步：替换图片',
          fontSize: 22,
          fontWeight: 'bold',
        }),
        makeText({
          x: baseX + 24,
          y: baseY + 102,
          width: 300,
          height: 108,
          content: '选中左侧原图节点，点击工具栏上的「替换」按钮，将原图替换为自己的图片。',
          fontSize: 14,
          fill: '#6b7280',
        }),
        makeText({
          x: baseX + 24,
          y: baseY + 380,
          width: 320,
          height: 48,
          content: '第2步：生成提示词',
          fontSize: 22,
          fontWeight: 'bold',
        }),
        makeText({
          x: baseX + 24,
          y: baseY + 452,
          width: 300,
          height: 112,
          content: '选中右侧提示词生成节点，在弹出的输入框里点击发送按钮，即可生成可复用提示词。',
          fontSize: 14,
          fill: '#6b7280',
        }),
        source,
        promptNode
      );
      linksToAdd.push({
        id: createObjectId('workflow-link'),
        fromId: source.id,
        toId: promptNode.id,
      });
    }

    if (preset === 'fusion') {
      const bag = makeImage({
        id: createObjectId('image'),
        name: '产品图',
        x: baseX + 420,
        y: baseY + 30,
        width: 260,
        height: 260,
        content: DEMO_IMAGE_BAG,
      });
      const model = makeImage({
        id: createObjectId('image'),
        name: '模特图',
        x: baseX + 420,
        y: baseY + 350,
        width: 260,
        height: 345,
        content: DEMO_IMAGE_MODEL,
      });
      const fusionResult = makeImage({
        id: createObjectId('image'),
        name: '融合结果',
        x: baseX + 850,
        y: baseY + 70,
        width: 290,
        height: 380,
        content: DEMO_IMAGE_EDITORIAL,
      });
      const fusionNode = buildGenerator('image', {
        id: createObjectId('generator'),
        name: '图片生成器1',
        x: baseX + 18,
        y: baseY + 70,
        width: 360,
        height: 250,
        generatorState: {
          generatorType: 'image',
          prompt: '将#1包袋产品图与#2模特人像图融合，生成高级时尚大片效果。',
          model: 'Seedream 4.0',
          ratio: '3:4',
          refImages: [DEMO_IMAGE_BAG, DEMO_IMAGE_MODEL],
          status: 'idle',
        },
      });
      const panel = makeFrame({
        x: baseX,
        y: baseY,
        width: 380,
        height: 690,
        name: '多图融合说明',
        content: '多图融合',
      });
      objectsToAdd.push(
        panel,
        makeText({
          x: baseX + 24,
          y: baseY + 30,
          width: 320,
          height: 48,
          content: '第1步：上传多图片',
          fontSize: 22,
          fontWeight: 'bold',
        }),
        makeText({
          x: baseX + 24,
          y: baseY + 102,
          width: 300,
          height: 108,
          content: '先准备产品图与模特图两类素材，分别放到画布中，作为融合时的参考输入。',
          fontSize: 14,
          fill: '#6b7280',
        }),
        makeText({
          x: baseX + 24,
          y: baseY + 380,
          width: 320,
          height: 48,
          content: '第2步：生成融合',
          fontSize: 22,
          fontWeight: 'bold',
        }),
        makeText({
          x: baseX + 24,
          y: baseY + 452,
          width: 300,
          height: 112,
          content: '选中图片生成节点，在弹出的输入框中描述你想要的融合画面效果，点击生成即可。',
          fontSize: 14,
          fill: '#6b7280',
        }),
        fusionNode,
        bag,
        model,
        fusionResult
      );
    }

    if (preset === 'image-to-video') {
      const source = makeImage({
        id: createObjectId('image'),
        name: '封面图',
        x: baseX + 500,
        y: baseY + 40,
        width: 320,
        height: 420,
        content: DEMO_IMAGE_MOON,
      });
      const videoNode = buildGenerator('video', {
        id: createObjectId('generator'),
        name: '视频生成器1',
        x: baseX + 910,
        y: baseY + 10,
        width: 360,
        height: 500,
        generatorState: {
          generatorType: 'video',
          prompt: '让人物与发光月球产生轻微运动，形成梦幻镜头推近效果。',
          model: '可灵视频 1.6',
          ratio: '9:16',
          refImages: [DEMO_IMAGE_MOON],
          status: 'success',
          resultUrl: DEMO_VIDEO_URL,
        },
      });
      objectsToAdd.push(
        source,
        videoNode,
        makeText({
          x: baseX + 32,
          y: baseY + 60,
          width: 300,
          height: 52,
          content: '图生视频示例',
          fontSize: 32,
          fontWeight: 'bold',
        }),
        makeText({
          x: baseX + 32,
          y: baseY + 150,
          width: 340,
          height: 160,
          content: '左侧放一张主视觉图片，右侧接一个视频生成节点，即可基于单图延展动态镜头。',
          fontSize: 16,
          fill: '#6b7280',
        })
      );
      linksToAdd.push({
        id: createObjectId('workflow-link'),
        fromId: source.id,
        toId: videoNode.id,
      });
    }

    if (preset === 'explore') {
      const imageNode = buildGenerator('image', {
        id: createObjectId('generator'),
        name: '图片生成器1',
        x: baseX + 420,
        y: baseY + 80,
        width: 420,
        height: 420,
        generatorState: {
          generatorType: 'image',
          prompt: '生成一张冷色电影感的主视觉封面图。',
          model: 'Seedream 4.0',
          ratio: '1:1',
          refImages: [],
          status: 'success',
          resultUrl: DEMO_IMAGE_MOON,
        },
      });
      const textNode = buildGenerator('text', {
        id: createObjectId('generator'),
        name: '文本生成器1',
        x: baseX + 930,
        y: baseY + 120,
        width: 360,
        height: 260,
        generatorState: {
          generatorType: 'text',
          prompt: '基于这张主视觉图输出一句海报标题与一句副标题。',
          model: '文案助手 Pro',
          ratio: 'auto',
          refImages: [],
          status: 'success',
          resultText: '月光坠入旷野\n把冷色调梦境，定格成一张会呼吸的海报。',
        },
      });
      const videoNode = buildGenerator('video', {
        id: createObjectId('generator'),
        name: '视频生成器1',
        x: baseX + 930,
        y: baseY + 430,
        width: 360,
        height: 500,
        generatorState: {
          generatorType: 'video',
          prompt: '延展这张主视觉图，输出一段带推进感的短视频镜头。',
          model: '可灵视频 1.6',
          ratio: '9:16',
          refImages: [DEMO_IMAGE_MOON],
          status: 'idle',
        },
      });
      objectsToAdd.push(
        makeText({
          x: baseX + 24,
          y: baseY + 30,
          width: 300,
          height: 50,
          content: '探索工作流示例',
          fontSize: 32,
          fontWeight: 'bold',
        }),
        makeText({
          x: baseX + 24,
          y: baseY + 122,
          width: 320,
          height: 180,
          content: '从一个图片节点出发，同时连接文本生成和视频生成，快速搭一个一图多用的创作流程。',
          fontSize: 16,
          fill: '#6b7280',
        }),
        imageNode,
        textNode,
        videoNode
      );
      linksToAdd.push(
        {
          id: createObjectId('workflow-link'),
          fromId: imageNode.id,
          toId: textNode.id,
        },
        {
          id: createObjectId('workflow-link'),
          fromId: imageNode.id,
          toId: videoNode.id,
        }
      );
    }

    setObjects(objectsToAdd);
    setWorkflowLinks(linksToAdd);
    setSelectedIds([]);
    setAppMode('workflow');
  };

  const handleCreateLinkedGenerator = (
    sourceId: string,
    side: 'left' | 'right',
    generatorType: 'image' | 'video' | 'text'
  ) => {
    const sourceObject = objects.find((item) => item.id === sourceId);
    if (!sourceObject) return;

    const sourceName = sourceObject.name || '上游节点';
    const built = buildGeneratorObject(objects, generatorType, {
      upstreamNodeNames: side === 'right' ? [sourceName] : [],
      prompt: side === 'right' ? buildWorkflowPrompt([sourceName]) : '',
    });
    const position = resolveLinkedNodePosition(objects, sourceObject, side, built.size.width, built.size.height);
    const linkedObject = { ...built.object, ...position };

    setObjects((prev) => {
      const nextObjects =
        side === 'left'
          ? prev.map((item) => {
              if (item.id !== sourceId || item.type !== 'image-generator') return item;
              const existingUpstream = item.generatorState?.upstreamNodeNames || [];
              const nextUpstream = existingUpstream.includes(linkedObject.name)
                ? existingUpstream
                : [...existingUpstream, linkedObject.name];
              return {
                ...item,
                generatorState: {
                  ...item.generatorState!,
                  upstreamNodeNames: nextUpstream,
                  prompt: buildWorkflowPrompt(nextUpstream),
                },
              };
            })
          : prev;

      return [...nextObjects, linkedObject];
    });
    setWorkflowLinks((existing) => [
      ...existing,
      {
        id: createObjectId('workflow-link'),
        fromId: side === 'right' ? sourceId : linkedObject.id,
        toId: side === 'right' ? linkedObject.id : sourceId,
      },
    ]);
    setSelectedIds([linkedObject.id]);
  };

  const handleObjectUpdate = (id: string, updates: Partial<CanvasObject>) => {
    setObjects(prev => {
      const original = prev.find(o => o.id === id);
      if (!original) return prev;

      let newObjects = prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj);

      // If a frame moves, move its children
      if (original.type === 'frame' && (updates.x !== undefined || updates.y !== undefined)) {
        const dx = updates.x !== undefined ? updates.x - original.x : 0;
        const dy = updates.y !== undefined ? updates.y - original.y : 0;
        
        newObjects = newObjects.map(obj => {
          if (obj.parentId === id) {
            return {
              ...obj,
              x: obj.x + dx,
              y: obj.y + dy
            };
          }
          return obj;
        });
      }

      return newObjects;
    });
  };

  const handleDeleteObject = (id: string) => {
    setObjects(prev => {
      const toDelete = prev.find(o => o.id === id);
      if (toDelete?.type === 'frame') {
        return prev.filter(o => o.id !== id && o.parentId !== id);
      }
      return prev.filter(o => o.id !== id);
    });
    setWorkflowLinks(prev => prev.filter(link => link.fromId !== id && link.toId !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  };

  const handleDuplicateObject = (id: string) => {
    const original = objects.find(o => o.id === id);
    if (!original) return;

    if (original.type === 'frame') {
      const newFrameId = createObjectId('frame');
      const children = objects.filter(o => o.parentId === id);
      
      const newFrame: CanvasObject = {
        ...original,
        id: newFrameId,
        name: `${original.name || '画板'} 副本1`,
        x: original.x + original.width + 50,
      };

      const newChildren = children.map((child, idx) => ({
        ...child,
        id: createObjectId(`frame-child-${idx}`),
        parentId: newFrameId,
      }));

      setObjects(prev => [...prev, newFrame, ...newChildren]);
      setSelectedIds([newFrameId]);
    } else {
      const newObj: CanvasObject = {
        ...original,
        id: createObjectId(original.type),
        x: original.x + 20,
        y: original.y + 20,
      };
      setObjects(prev => [...prev, newObj]);
      setSelectedIds([newObj.id]);
    }
  };

  const handleExportObject = (id: string) => {
    openExportDialog([id]);
  };

  const handleExportSelection = (ids: string[]) => {
    openExportDialog(ids);
  };

  const handleReorderObjects = (newObjects: CanvasObject[]) => {
    setObjects(newObjects);
  };

  const handleGroup = () => {
    if (selectedIds.length < 2) return;
    const selectedObjects = objects.filter(o => selectedIds.includes(o.id));
    const groupId = `group_${Date.now()}`;
    
    setObjects(prev => prev.map(obj => 
      selectedIds.includes(obj.id) ? { ...obj, parentId: groupId } : obj
    ));
    
    // Create a group object if needed, or just use parentId
    // For now, we'll just use parentId logic
  };

  const handleCreateArtboard = () => {
    if (selectedIds.length === 0) return;
    const selectedObjects = objects.filter(o => selectedIds.includes(o.id));
    
    const minX = Math.min(...selectedObjects.map(o => o.x));
    const minY = Math.min(...selectedObjects.map(o => o.y));
    const maxX = Math.max(...selectedObjects.map(o => o.x + o.width));
    const maxY = Math.max(...selectedObjects.map(o => o.y + o.height));
    
    const frameId = createObjectId('frame');
    const newFrame: CanvasObject = {
      id: frameId,
      type: 'frame',
      name: '新画板',
      x: minX - 20,
      y: minY - 20,
      width: (maxX - minX) + 40,
      height: (maxY - minY) + 40,
      content: '新画板'
    };
    
    setObjects(prev => [
      ...prev.map(obj => selectedIds.includes(obj.id) ? { ...obj, parentId: frameId } : obj),
      newFrame
    ]);
    setSelectedIds([frameId]);
  };

  const handleCancelArtboard = (id: string) => {
    setObjects(prev => prev.map(obj => 
      obj.parentId === id ? { ...obj, parentId: undefined } : obj
    ).filter(o => o.id !== id));
    setSelectedIds([]);
  };

  const handleMergeLayers = () => {
    if (selectedIds.length < 2) return;
    
    const selectedObjects = objects.filter(o => selectedIds.includes(o.id));
    const minX = Math.min(...selectedObjects.map(o => o.x));
    const minY = Math.min(...selectedObjects.map(o => o.y));
    const maxX = Math.max(...selectedObjects.map(o => o.x + o.width));
    const maxY = Math.max(...selectedObjects.map(o => o.y + o.height));
    
    const mergedId = `merged_${Date.now()}`;
    const mergedObj: CanvasObject = {
      id: mergedId,
      type: 'image',
      name: '合并图层',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      content: 'https://picsum.photos/seed/merged/800/600', // Mock merged image
      isProcessing: true,
      processingType: 'merging' as any
    };
    
    setObjects(prev => [
      ...prev.filter(obj => !selectedIds.includes(obj.id)),
      mergedObj
    ]);
    setSelectedIds([mergedId]);
    
    // Simulate backend merge completion
    setTimeout(() => {
      setObjects(prev => prev.map(obj => 
        obj.id === mergedId ? { ...obj, isProcessing: false, processingType: undefined } : obj
      ));
    }, 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'c': {
            // Copy logic
            break;
          }
          case 'v': {
            // Paste logic
            break;
          }
          case 'g': {
            e.preventDefault();
            handleGroup();
            break;
          }
          case 'd': {
            e.preventDefault();
            if (selectedIds.length > 0) handleDuplicateObject(selectedIds[0]);
            break;
          }
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'v': setCurrentMode('select'); break;
          case 'h': setCurrentMode('hand'); break;
          case 'm': setCurrentMode('point'); break;
          case 'backspace':
          case 'delete': {
            selectedIds.forEach(id => handleDeleteObject(id));
            break;
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, objects]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f0f2f5] font-sans text-gray-900 overflow-hidden">
      <Topbar
        credits={credits}
        projectName={projectName}
        onExportClick={() => openExportDialog(selectedIds)}
        exportDropdown={
          <ExportDialog
            open={isExportOpen}
            projectName={projectName}
            items={exportableItems}
            selectedIds={exportSelectedIds}
            onClose={() => setIsExportOpen(false)}
            onSubmit={(payload) => {
              setExportRequest(
                payload.mode === 'snapshot'
                  ? {
                      requestId: Date.now(),
                      mode: 'snapshot',
                      objectIds: payload.itemIds,
                      format: payload.format,
                      scale: payload.scale,
                      filename: projectName.trim() || 'canvas-export',
                    }
                  : {
                      requestId: Date.now(),
                      mode: 'source',
                      objectIds: payload.itemIds,
                      imageFormat: payload.imageFormat,
                      videoFormat: payload.videoFormat,
                      filename: projectName.trim() || 'canvas-assets',
                    }
              );
              setIsExportOpen(false);
            }}
          />
        }
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar 
          onAddFrame={handleAddFrame} 
          onAddShape={handleAddShape} 
          onAddImage={handleAddImage}
          onAddText={handleAddText}
          onAddGenerator={handleAddGenerator}
          onUpload={(file, type) => {
            const url = URL.createObjectURL(file);
            if (type === 'image') {
              const img = new Image();
              img.onload = () => {
                const maxWidth = 400;
                const maxHeight = 400;
                let width = img.width;
                let height = img.height;
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                
                const newObj: CanvasObject = {
                  id: createObjectId('image'),
                  type: 'image',
                  name: '图片',
                  x: 100 + Math.random() * 200,
                  y: 100 + Math.random() * 200,
                  width: width * ratio,
                  height: height * ratio,
                  content: url,
                };
                setObjects(prev => [...prev, newObj]);
                setSelectedIds([newObj.id]);
              };
              img.src = url;
            } else {
              const video = document.createElement('video');
              video.onloadedmetadata = () => {
                const maxWidth = 480;
                const maxHeight = 480;
                let width = video.videoWidth;
                let height = video.videoHeight;
                const ratio = Math.min(maxWidth / width, maxHeight / height);

                const newObj: CanvasObject = {
                  id: createObjectId('video'),
                  type: 'video',
                  name: '视频',
                  x: 100 + Math.random() * 200,
                  y: 100 + Math.random() * 200,
                  width: width * ratio,
                  height: height * ratio,
                  content: url,
                };
                setObjects(prev => [...prev, newObj]);
                setSelectedIds([newObj.id]);
              };
              video.src = url;
            }
          }}
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          appMode={appMode}
          onAppModeChange={setAppMode}
        />
        <main className="flex-1 relative overflow-hidden">
          <Canvas 
            objects={objects} 
            workflowLinks={workflowLinks}
            onObjectUpdate={handleObjectUpdate}
            selectedIds={selectedIds}
            onSelect={(id, isMulti) => {
              if (id) {
                if (isMulti) {
                  setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
                } else {
                  const obj = objects.find(o => o.id === id);
                  if (obj?.type === 'frame') {
                    const childrenIds = objects.filter(o => o.parentId === id).map(o => o.id);
                    setSelectedIds([id, ...childrenIds]);
                  } else {
                    setSelectedIds([id]);
                  }
                }
              } else {
                setSelectedIds([]);
              }
            }}
            onSelectMany={(ids) => {
              setSelectedIds(ids);
            }}
            mode={currentMode}
            appMode={appMode}
            onAddGenerator={handleAddGenerator}
            onAddWorkflowPreset={handleAddWorkflowPreset}
            onCreateLinkedGenerator={handleCreateLinkedGenerator}
            onReEdit={(prompt) => {
              setAgentInput(prompt);
            }}
            isLayerPanelOpen={isLayerPanelOpen}
            onToggleLayerPanel={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
            onDeleteObject={handleDeleteObject}
            onDuplicateObject={handleDuplicateObject}
            onExportObject={handleExportObject}
            onExportSelection={handleExportSelection}
            onReorderObjects={handleReorderObjects}
            onGroup={handleGroup}
            onCreateArtboard={handleCreateArtboard}
            onCancelArtboard={handleCancelArtboard}
            onMergeLayers={handleMergeLayers}
            exportRequest={exportRequest}
            onExportComplete={(requestId) => {
              setExportRequest((prev) => (prev?.requestId === requestId ? null : prev));
            }}
          />
        </main>
        <Sidebar 
          onAddImage={handleAddImage} 
          onAddVideo={handleAddVideo}
          onAddGeneratedAssets={handleAddGeneratedAssets}
          input={agentInput}
          onInputChange={setAgentInput}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          credits={credits}
          onCreditsChange={setCredits}
          onSessionTitleChange={setProjectName}
        />
      </div>
    </div>
  );
}
