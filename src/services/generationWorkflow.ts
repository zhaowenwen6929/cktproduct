import { GenerationPlan, GenerationRequest } from '../types';
import { generateLogo } from './geminiService';

const CN_NUMBER_MAP: Record<string, number> = {
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

export type WorkflowStage = 'submitting' | 'analyzing' | 'queued' | 'generating';

export interface WorkflowStatus {
  stage: WorkflowStage;
  label: string;
}

export interface ExecuteWorkflowOptions {
  isCancelled?: () => boolean;
  onStatusChange?: (status: WorkflowStatus) => void;
}

const LOCAL_MOCK_HOSTS = new Set(['localhost', '127.0.0.1']);

const detectMediaType = (prompt: string, attachments: GenerationRequest['attachments']) => {
  if (attachments.some((attachment) => attachment.type === 'video')) return 'video';
  return /视频|动图|短片|短视频|动画/i.test(prompt) ? 'video' : 'image';
};

const inferRequestedOutputCount = (prompt: string) => {
  const digitMatch = prompt.match(/(\d+)\s*(张|个|幅|组|套|条|段)/);
  if (digitMatch) {
    return Math.min(Math.max(Number(digitMatch[1]), 1), 12);
  }

  const cnMatch = prompt.match(/([一二两三四五六七八九十]+)\s*(张|个|幅|组|套|条|段)/);
  if (cnMatch) {
    const count = CN_NUMBER_MAP[cnMatch[1]] ?? 4;
    return Math.min(Math.max(count, 1), 12);
  }

  return 4;
};

const chooseModel = (mediaType: 'image' | 'video', attachments: GenerationRequest['attachments']) => {
  if (mediaType === 'video') return '可灵视频 1.6';
  if (attachments.length > 0) return '全能图像 2.0';
  return 'Seedream 4.0';
};

const unitCreditsByModel: Record<string, number> = {
  'Seedream 4.0': 4,
  '全能图像 2.0': 4,
  '可灵视频 1.6': 20,
};

const splitOutputBatches = (count: number) => {
  const batches = [];
  let remaining = count;
  let index = 1;

  while (remaining > 0) {
    const size = Math.min(4, remaining);
    batches.push({ id: `batch-${index}`, count: size });
    remaining -= size;
    index += 1;
  }

  return batches;
};

export const planGenerationRequest = (request: GenerationRequest): GenerationPlan => {
  const mediaType = detectMediaType(request.prompt, request.attachments);
  const outputCount = inferRequestedOutputCount(request.prompt);
  const model = chooseModel(mediaType, request.attachments);
  const unitCredits = unitCreditsByModel[model] ?? 4;
  const enrichedPrompt = [
    request.prompt,
    request.brandContext,
    request.attachments.length > 0 ? `请参考用户上传的 ${request.attachments.length} 个附件内容保持主体一致性。` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    id: `plan-${Date.now()}`,
    prompt: request.prompt,
    enrichedPrompt,
    mediaType,
    skillName: mediaType === 'video' ? 'video_generation' : 'image_generation',
    model,
    outputCount,
    credits: outputCount * unitCredits,
    batches: splitOutputBatches(outputCount),
  };
};

const assertNotCancelled = (isCancelled?: () => boolean) => {
  if (isCancelled?.()) {
    throw new Error('WORKFLOW_CANCELLED');
  }
};

const shouldUseMockGeneration = () => {
  if (process.env.SKIP_GENERATION === 'true') {
    return true;
  }

  if (!process.env.GEMINI_API_KEY && typeof window !== 'undefined') {
    return LOCAL_MOCK_HOSTS.has(window.location.hostname);
  }

  return false;
};

const buildMockResults = (plan: GenerationPlan) => {
  const promptSeed = encodeURIComponent(plan.prompt.slice(0, 48) || 'generation');

  return Array.from({ length: plan.outputCount }, (_, index) => {
    const item = index + 1;
    return `https://picsum.photos/seed/${promptSeed}-${plan.mediaType}-${item}/720/960`;
  });
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
    gradient.addColorStop(0, `hsl(${240 + progress * 80}, 85%, 62%)`);
    gradient.addColorStop(1, `hsl(${190 + progress * 60}, 82%, 52%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath();
    ctx.arc(100 + progress * 260, 180, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(360 - progress * 180, 520, 140, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 34px sans-serif';
    ctx.fillText('Demo Video', 42, 86);

    ctx.font = '500 22px sans-serif';
    const safePrompt = prompt.trim().slice(0, 18) || '视频生成测试';
    ctx.fillText(safePrompt, 42, 126);

    const cardY = 260 + Math.sin(progress * Math.PI * 2) * 28;
    ctx.fillStyle = 'rgba(15,23,42,0.18)';
    ctx.fillRect(58, cardY, 364, 220);
    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.fillRect(48, cardY - 10, 364, 220);

    ctx.fillStyle = '#111827';
    ctx.font = '600 24px sans-serif';
    ctx.fillText('Export Test Clip', 78, cardY + 54);
    ctx.font = '400 18px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('用于测试对话流视频生成、', 78, cardY + 100);
    ctx.fillText('画布落点与导出打包效果', 78, cardY + 132);

    ctx.fillStyle = '#5c5cfc';
    ctx.beginPath();
    ctx.roundRect(78, cardY + 158, 148, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('Preview Clip', 110, cardY + 183);
  };

  recorder.start();
  const duration = 1800;
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

export const executeGenerationPlan = async (
  plan: GenerationPlan,
  options: ExecuteWorkflowOptions = {},
) => {
  options.onStatusChange?.({ stage: 'submitting', label: '正在提交需求' });
  await new Promise((resolve) => setTimeout(resolve, 400));
  assertNotCancelled(options.isCancelled);

  options.onStatusChange?.({ stage: 'analyzing', label: '正在解析需求' });
  await new Promise((resolve) => setTimeout(resolve, 800));
  assertNotCancelled(options.isCancelled);

  options.onStatusChange?.({ stage: 'queued', label: '正在创建生成任务' });
  await new Promise((resolve) => setTimeout(resolve, 600));
  assertNotCancelled(options.isCancelled);

  options.onStatusChange?.({
    stage: 'generating',
    label: plan.mediaType === 'video' ? '正在生成视频' : '正在生成图片',
  });

  if (shouldUseMockGeneration()) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    assertNotCancelled(options.isCancelled);

    if (plan.mediaType === 'video') {
      const demoVideoUrl = await createMockVideoResult(plan.prompt);
      return {
        mediaType: plan.mediaType,
        model: `${plan.model}（模拟流程）`,
        credits: plan.credits,
        results: Array.from({ length: plan.outputCount }, () => demoVideoUrl),
      };
    }

    return {
      mediaType: plan.mediaType,
      model: `${plan.model}（模拟流程）`,
      credits: plan.credits,
      results: buildMockResults(plan),
    };
  }

  const results: string[] = [];
  for (const batch of plan.batches) {
    assertNotCancelled(options.isCancelled);

    if (plan.mediaType === 'video') {
      const storyboardFrames = await generateLogo(
        `${plan.enrichedPrompt}\n\n请先生成用于视频创意预览的关键帧画面，保持镜头语言连贯。`,
        batch.count,
      );
      results.push(...storyboardFrames);
    } else {
      const images = await generateLogo(plan.enrichedPrompt, batch.count);
      results.push(...images);
    }
  }

  return {
    mediaType: plan.mediaType,
    model: plan.model,
    credits: plan.credits,
    results,
  };
};
