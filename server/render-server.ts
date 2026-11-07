import express from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright-core';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { MgAnimationOverlay } from '../src/components/ai-video/MgAnimationOverlay';
import type { VideoProjectManifest } from '../src/components/ai-video/videoProjectManifest';

type RenderStatus = 'queued' | 'running' | 'done' | 'failed';

type RenderJob = {
  id: string;
  status: RenderStatus;
  createdAt: string;
  updatedAt: string;
  url?: string;
  error?: string;
};

type RenderRequest = {
  manifestPath?: string;
  sourceVideoPath?: string;
};

const execFileAsync = promisify(execFile);
const port = Number(process.env.RENDER_SERVER_PORT ?? 4175);
const projectRoot = resolve(process.cwd());
const publicRoot = resolve(projectRoot, 'public');
const renderRoot = resolve(projectRoot, 'renders');
const jobs = new Map<string, RenderJob>();
let activeJobId: string | null = null;

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', process.env.RENDER_CORS_ORIGIN ?? '*');
  response.setHeader('Access-Control-Allow-Headers', 'content-type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

app.use('/assets', express.static(publicRoot));
app.use('/renders', express.static(renderRoot));

function now() {
  return new Date().toISOString();
}

function resolvePublicPath(publicPath: string) {
  if (!publicPath.startsWith('/')) throw new Error('资源路径必须以 / 开头');
  const absolutePath = resolve(publicRoot, `.${publicPath}`);
  const relativePath = relative(publicRoot, absolutePath);
  if (relativePath.startsWith('..') || relativePath.includes('..' + '/')) {
    throw new Error('资源路径超出 public 目录');
  }
  return absolutePath;
}

function toAssetUrl(publicPath: string) {
  return `http://127.0.0.1:${port}/assets${publicPath}`;
}

function resolveExecutablePath() {
  const configured = process.env.BROWSER_EXECUTABLE_PATH;
  if (configured) return configured;
  if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (process.platform === 'win32') {
    return `${process.env['PROGRAMFILES'] ?? 'C:\\Program Files'}\\Google\\Chrome\\Application\\chrome.exe`;
  }
  return '/usr/bin/google-chrome';
}

function createRenderPageHtml(sourceUrl: string) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #f3eadf; }
      #stage { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
      #video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
      .ai-video-editor-mg-overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    </style>
  </head>
  <body>
    <div id="stage">
      <video id="video" src="${sourceUrl}" preload="auto" playsinline></video>
      <div id="overlay"></div>
    </div>
  </body>
</html>`;
}

async function runFfmpeg(framePattern: string, sourceVideoPath: string, outputPath: string, manifest: VideoProjectManifest) {
  const args = [
    '-y',
    '-loglevel', 'error',
    '-framerate', String(manifest.project.fps),
    '-i', framePattern,
    '-i', sourceVideoPath,
    '-map', '0:v:0',
    '-map', '1:a:0?',
    '-c:v', 'libx264',
    '-preset', process.env.RENDER_FFMPEG_PRESET ?? 'fast',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-t', String(manifest.project.duration_seconds),
    '-movflags', '+faststart',
    outputPath,
  ];
  await execFileAsync('ffmpeg', args, { maxBuffer: 1024 * 1024 * 4 });
}

async function renderJob(job: RenderJob, request: RenderRequest) {
  const manifestPath = request.manifestPath ?? '';
  const sourceVideoPath = request.sourceVideoPath ?? '';
  const manifestAbsolutePath = resolvePublicPath(manifestPath);
  const sourceVideoAbsolutePath = resolvePublicPath(sourceVideoPath);
  const manifest = JSON.parse(await readFile(manifestAbsolutePath, 'utf8')) as VideoProjectManifest;
  if (!manifest.project || !Array.isArray(manifest.scenes)) throw new Error('Manifest 格式不正确');
  if (!existsSync(sourceVideoAbsolutePath)) throw new Error('源视频不存在');

  const jobRoot = join(renderRoot, job.id);
  const frameRoot = join(jobRoot, 'frames');
  const outputPath = join(renderRoot, `${job.id}.mp4`);
  await mkdir(frameRoot, { recursive: true });

  const executablePath = resolveExecutablePath();
  if (!existsSync(executablePath)) throw new Error(`找不到 Chrome，可通过 BROWSER_EXECUTABLE_PATH 指定路径：${executablePath}`);

  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: manifest.project.width, height: manifest.project.height }, deviceScaleFactor: 1 });
    await page.setContent(createRenderPageHtml(toAssetUrl(sourceVideoPath)), { waitUntil: 'load' });
    await page.locator('#video').evaluate((element) => {
      const video = element as HTMLVideoElement;
      return new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }
        video.addEventListener('loadeddata', () => resolve(), { once: true });
        video.addEventListener('error', () => reject(new Error('源视频加载失败')), { once: true });
      });
    });

    const frameCount = Math.ceil(manifest.project.duration_seconds * manifest.project.fps);
    for (let frame = 0; frame < frameCount; frame += 1) {
      const currentTime = frame / manifest.project.fps;
      await page.locator('#video').evaluate((element, time) => {
        const video = element as HTMLVideoElement;
        return new Promise<void>((resolve) => {
          if (Math.abs(video.currentTime - time) < 0.001) {
            requestAnimationFrame(() => resolve());
            return;
          }
          video.addEventListener('seeked', () => resolve(), { once: true });
          video.currentTime = time;
        });
      }, currentTime);
      const overlayMarkup = renderToStaticMarkup(React.createElement(MgAnimationOverlay, { manifest, currentTime }));
      await page.locator('#overlay').evaluate((element, markup) => {
        element.innerHTML = markup;
      }, overlayMarkup);
      await page.screenshot({ path: join(frameRoot, `frame-${String(frame + 1).padStart(6, '0')}.png`) });
      if (frame % Math.max(1, Math.floor(manifest.project.fps * 5)) === 0) job.updatedAt = now();
    }

    await runFfmpeg(join(frameRoot, 'frame-%06d.png'), sourceVideoAbsolutePath, outputPath, manifest);
    job.url = `/renders/${job.id}.mp4`;
  } finally {
    await browser.close();
    await rm(jobRoot, { recursive: true, force: true });
  }
}

async function startRender(job: RenderJob, request: RenderRequest) {
  activeJobId = job.id;
  job.status = 'running';
  job.updatedAt = now();
  try {
    await renderJob(job, request);
    job.status = 'done';
  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : '渲染失败';
  } finally {
    job.updatedAt = now();
    activeJobId = null;
  }
}

app.get('/api/video/health', (_request, response) => {
  response.json({ ok: true, activeJobId });
});

app.post('/api/video/render', (request, response) => {
  if (activeJobId) {
    response.status(409).json({ error: '已有一个渲染任务正在执行，请稍后再试', jobId: activeJobId });
    return;
  }

  const body = request.body as RenderRequest;
  if (!body?.manifestPath || !body.sourceVideoPath) {
    response.status(400).json({ error: 'manifestPath 和 sourceVideoPath 为必填项' });
    return;
  }

  const job: RenderJob = { id: randomUUID(), status: 'queued', createdAt: now(), updatedAt: now() };
  jobs.set(job.id, job);
  void startRender(job, body);
  response.status(202).json({ jobId: job.id, status: job.status });
});

app.get('/api/video/render/:jobId', (request, response) => {
  const job = jobs.get(request.params.jobId);
  if (!job) {
    response.status(404).json({ error: '渲染任务不存在' });
    return;
  }
  response.json(job);
});

app.listen(port, () => {
  console.log(`视频渲染服务已启动：http://127.0.0.1:${port}`);
});
