export type VideoProjectAnimation = {
  enter?: string;
  active?: string;
  exit?: string;
};

export type VideoProjectLayer = {
  id: string;
  type: string;
  role: string;
  content?: string;
  layout?: {
    anchor?: string;
  };
  animation?: VideoProjectAnimation;
};

export type VideoProjectScene = {
  id: string;
  start: number;
  end: number;
  layers: VideoProjectLayer[];
};

export type VideoProjectManifest = {
  schema: string;
  project: {
    title: string;
    duration_seconds: number;
    aspect_ratio: string;
    width: number;
    height: number;
    fps: number;
  };
  scenes: VideoProjectScene[];
};

export async function loadVideoProjectManifest(path: string): Promise<VideoProjectManifest> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`加载视频项目 Manifest 失败：${response.status}`);
  }

  const manifest = await response.json() as VideoProjectManifest;
  if (!manifest.schema || !manifest.project || !Array.isArray(manifest.scenes)) {
    throw new Error('视频项目 Manifest 缺少必要字段');
  }
  return manifest;
}
