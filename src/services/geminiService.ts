import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export class GenerationError extends Error {
  code: 'missing_api_key' | 'unauthorized' | 'quota_exceeded' | 'no_image_generated' | 'unknown';

  constructor(
    code: 'missing_api_key' | 'unauthorized' | 'quota_exceeded' | 'no_image_generated' | 'unknown',
    message: string,
  ) {
    super(message);
    this.name = 'GenerationError';
    this.code = code;
  }
}

const normalizeGenerationError = (error: unknown): GenerationError => {
  if (error instanceof GenerationError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (!process.env.GEMINI_API_KEY) {
    return new GenerationError('missing_api_key', '未配置 GEMINI_API_KEY，当前无法调用生图服务。');
  }

  if (
    normalized.includes('api key not valid') ||
    normalized.includes('invalid api key') ||
    normalized.includes('permission denied') ||
    normalized.includes('unauthorized') ||
    normalized.includes('forbidden') ||
    normalized.includes('authentication')
  ) {
    return new GenerationError('unauthorized', 'GEMINI_API_KEY 无效，或当前账号没有该模型权限。');
  }

  if (
    normalized.includes('quota') ||
    normalized.includes('rate limit') ||
    normalized.includes('resource exhausted') ||
    normalized.includes('429')
  ) {
    return new GenerationError('quota_exceeded', 'Gemini 配额不足或触发限流，请稍后重试。');
  }

  if (normalized.includes('no image generated')) {
    return new GenerationError('no_image_generated', '模型返回成功，但结果里没有可用图片数据。');
  }

  return new GenerationError('unknown', message || '未知生图错误');
};

export async function generateLogo(prompt: string, count = 4): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new GenerationError('missing_api_key', '未配置 GEMINI_API_KEY，当前无法调用生图服务。');
  }

  const model = "gemini-2.5-flash-image";
  
  // We'll ask for 4 variations in the prompt logic if needed, 
  // but the current API usually returns one per call or we can try to prompt for a grid.
  // Actually, standard practice for "4 variations" is often 4 separate calls or a model that supports it.
  // For this demo, we'll do 4 calls to simulate the UI.
  
  const generateOne = async () => {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: `Generate a high-quality logo based on this description: ${prompt}. Minimalist, clean, professional.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new GenerationError('no_image_generated', '模型返回成功，但结果里没有可用图片数据。');
  };

  try {
    const safeCount = Math.max(1, Math.min(count, 4));
    const results = await Promise.all(
      Array.from({ length: safeCount }, () => generateOne())
    );
    return results;
  } catch (error) {
    console.error("Error generating logos:", error);
    throw normalizeGenerationError(error);
  }
}
