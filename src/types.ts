export type CanvasMode = 'select' | 'hand' | 'point';
export type AppMode = 'canvas' | 'workflow';

export interface WorkflowLink {
  id: string;
  fromId: string;
  toId: string;
}

export interface CanvasObject {
  id: string;
  type: 'image' | 'text' | 'shape' | 'frame' | 'video' | 'image-generator' | 'group';
  shapeType?: 'rect' | 'circle' | 'triangle' | 'star' | 'arrow' | 'speech-rect' | 'speech-round';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // URL for image/video, text for text, label for frame/shape
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  fill?: string;
  stroke?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  isProcessing?: boolean;
  processingType?: string;
  name?: string;
  locked?: boolean;
  hidden?: boolean;
  parentId?: string; // For grouping or being inside a frame
  generatorState?: {
    generatorType?: 'image' | 'video' | 'text';
    prompt: string;
    model: string;
    ratio: string;
    refImages: string[];
    status: 'idle' | 'generating' | 'success' | 'error';
    resultUrl?: string;
    resultText?: string;
    upstreamNodeNames?: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[]; // Base64 or URLs
  generationAttachments?: GenerationAttachment[];
  modelName?: string;
  creditsCost?: number;
  timestamp: number;
  /** 对话流中的品牌工具箱卡片（由关键词触发） */
  variant?: 'brand_toolkit' | 'generation_task';
  /** 单一品牌组 id（例如“已选择的品牌组”场景） */
  brandId?: string;
  /** 需要在对话中列出来供选择的一组品牌组 id */
  brandIds?: string[];
  generationTask?: GenerationTask;
}

export interface GenerationAttachment {
  id: string;
  type: 'image' | 'video';
  url: string;
  name?: string;
}

export interface GenerationRequest {
  prompt: string;
  attachments: GenerationAttachment[];
  brandContext?: string;
}

export interface GenerationBatch {
  id: string;
  count: number;
}

export interface GenerationPlan {
  id: string;
  prompt: string;
  enrichedPrompt: string;
  mediaType: 'image' | 'video';
  skillName: 'image_generation' | 'video_generation';
  model: string;
  outputCount: number;
  credits: number;
  batches: GenerationBatch[];
}

export type GenerationTaskStage =
  | 'submitting'
  | 'analyzing'
  | 'queued'
  | 'generating'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface GenerationSubtask {
  id: string;
  label: string;
  status: 'queued' | 'generating' | 'completed' | 'cancelled' | 'failed';
  outputCount: number;
}

export interface GenerationTask {
  id: string;
  prompt: string;
  mediaType: 'image' | 'video';
  stage: GenerationTaskStage;
  stageTitle: string;
  stageDescription: string;
  credits: number;
  images?: string[];
  subtasks: GenerationSubtask[];
  cancelledAtStage?: 'submitting' | 'analyzing' | 'queued' | 'generating';
  refundCredits?: number;
  creditsCharged?: boolean;
  note?: string;
}

export interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface BrandPaletteGroup {
  label: string;
  colors: string[];
}

export interface BrandLogoAsset {
  label: string;
  /** 仅用于演示；真实项目可换成 CDN url */
  url?: string;
}

export interface BrandFontRow {
  family: string;
  styles: string[];
}

export interface BrandToneBlock {
  title: string;
  items: string[];
}

export interface BrandMediaAsset {
  label: string;
  caption?: string;
}

export interface BrandGroup {
  id: string;
  name: string;
  logo?: string;
  colors: string[];
  description?: string;
  /** 详情侧栏中的多组色板 */
  palettes?: BrandPaletteGroup[];
  logos?: BrandLogoAsset[];
  fonts?: BrandFontRow[];
  toneTags?: string[];
  toneBlocks?: BrandToneBlock[];
  illustrations?: BrandMediaAsset[];
  spokespersons?: BrandMediaAsset[];
}
