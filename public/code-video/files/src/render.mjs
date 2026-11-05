import { createHash } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright";
import { validateParams } from "./validate.mjs";

const execFileAsync = promisify(execFile);
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

function parseArgs(argv) {
  const input = argv[0];
  const mode = argv[1];
  const output = argv[2];
  if (!input || !mode || !output || !["--preview", "--render"].includes(mode)) {
    throw new Error("用法：node src/render.mjs <params.json> --preview <dir> 或 --render <file>");
  }
  return { input, mode, output };
}

function buildTimeline(params) {
  const intro = 1.2;
  const gap = 2.2;
  const itemDuration = 1.2;
  const conclusionStart = intro + params.items.length * gap + 0.2;
  const minimumDuration = conclusionStart + 1.5;
  if (params.durationSeconds < minimumDuration) {
    throw new Error(`当前内容至少需要 ${minimumDuration.toFixed(1)} 秒`);
  }
  return {
    intro,
    itemDuration,
    conclusionStart,
    conclusionEnd: params.durationSeconds,
    items: params.items.map((item, index) => ({
      ...item,
      index,
      start: intro + index * gap
    }))
  };
}

function buildHtml(params, timeline) {
  const safeParams = JSON.stringify({ params, timeline }).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <style>
    html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #f7f2e7; }
    canvas { display: block; width: 1920px; height: 1080px; }
  </style>
</head>
<body>
  <canvas id="canvas" width="1920" height="1080"></canvas>
  <script>
    const input = ${safeParams};
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const colors = {
      paper: '#F7F2E7',
      ink: '#1F2A44',
      mint: '#8ED5BB',
      yellow: '#F5CF66',
      muted: '#CBC1AD',
      card: '#FFFDF7',
      shadow: 'rgba(31, 42, 68, 0.12)'
    };

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const easeOut = (value) => 1 - Math.pow(1 - clamp(value, 0, 1), 3);
    const fade = (time, start, duration) => easeOut((time - start) / duration);
    const font = (size, family = 'Arial') => '500 ' + size + 'px ' + family;

    function drawPaper() {
      ctx.fillStyle = colors.paper;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(203, 193, 173, 0.7)';
      for (let x = 40; x < W; x += 40) {
        for (let y = 40; y < H; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function drawText(text, x, y, size, color = colors.ink, align = 'left') {
      ctx.font = font(size);
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
    }

    function drawTitle(time) {
      const amount = fade(time, 0, 0.8);
      ctx.save();
      ctx.globalAlpha = amount;
      ctx.translate(0, (1 - amount) * -28);
      drawText(input.params.title, W / 2, 128, 76, colors.ink, 'center');
      ctx.strokeStyle = colors.mint;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(W / 2 - 250, 188);
      ctx.quadraticCurveTo(W / 2, 202, W / 2 + 250, 188);
      ctx.stroke();
      ctx.restore();
    }

    function drawCard(item, time) {
      const amount = fade(time, item.start, 0.7);
      if (amount <= 0) return;
      const column = item.index % 3;
      const row = Math.floor(item.index / 3);
      const x = 150 + column * 585;
      const y = 320 + row * 300;
      const active = clamp((time - item.start) / 1.2, 0, 1);
      const lift = (1 - amount) * 30;
      const scale = 0.94 + amount * 0.06;
      ctx.save();
      ctx.globalAlpha = amount;
      ctx.translate(x + 220, y + 105 - lift);
      ctx.scale(scale, scale);
      ctx.translate(-220, -105);
      ctx.shadowColor = colors.shadow;
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = colors.card;
      ctx.beginPath();
      ctx.roundRect(0, 0, 440, 210, 18);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = active > 0.8 ? colors.mint : colors.muted;
      ctx.lineWidth = active > 0.8 ? 5 : 3;
      ctx.stroke();
      ctx.fillStyle = item.index % 2 === 0 ? colors.mint : colors.yellow;
      ctx.beginPath();
      ctx.arc(52, 52, 25, 0, Math.PI * 2);
      ctx.fill();
      drawText(String(item.index + 1), 52, 54, 24, colors.ink, 'center');
      drawText(item.label, 95, 53, 36, colors.ink);
      ctx.strokeStyle = item.index % 2 === 0 ? colors.yellow : colors.mint;
      ctx.globalAlpha = amount * 0.8;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(95, 104);
      ctx.lineTo(360, 104);
      ctx.stroke();
      ctx.globalAlpha = amount;
      item.note.forEach((line, lineIndex) => drawText(line, 95, 143 + lineIndex * 30, 25, colors.ink));
      ctx.restore();
    }

    function drawConclusion(time) {
      const amount = fade(time, input.timeline.conclusionStart, 0.8);
      if (amount <= 0) return;
      ctx.save();
      ctx.globalAlpha = amount;
      ctx.translate(0, (1 - amount) * 24);
      drawText(input.params.conclusion.join('  '), W / 2, 930, 42, colors.ink, 'center');
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 12]);
      ctx.beginPath();
      ctx.moveTo(420, 875);
      ctx.lineTo(1500, 875);
      ctx.stroke();
      ctx.restore();
    }

    function draw(time) {
      ctx.clearRect(0, 0, W, H);
      drawPaper();
      drawTitle(time);
      input.timeline.items.forEach((item) => drawCard(item, time));
      drawConclusion(time);
    }

    window.renderFrame = (time) => draw(time);
    window.renderFrame(0);
  </script>
</body>
</html>`;
}

async function renderFrame(page, time, file) {
  await page.evaluate((frameTime) => window.renderFrame(frameTime), time);
  await page.screenshot({ path: file, type: "png" });
}

async function launchPage(params, timeline) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  await page.setContent(buildHtml(params, timeline), { waitUntil: "load" });
  return { browser, page };
}

async function preview(params, timeline, outputDir) {
  await mkdir(outputDir, { recursive: true });
  const { browser, page } = await launchPage(params, timeline);
  try {
    const times = [0, params.durationSeconds / 2, Math.max(0, params.durationSeconds - 0.1)];
    const files = [];
    for (let index = 0; index < times.length; index += 1) {
      const file = path.join(outputDir, `frame-${String(index).padStart(4, "0")}.png`);
      await renderFrame(page, times[index], file);
      files.push({ time: times[index], file });
    }
    const report = { schema: "code-video-preview/1", width: WIDTH, height: HEIGHT, fps: FPS, files, timeline };
    await writeFile(path.join(outputDir, "preview-report.json"), `${JSON.stringify(report, null, 2)}\n`);
    return report;
  } finally {
    await browser.close();
  }
}

async function runFfmpeg(frameDir, output) {
  await mkdir(path.dirname(output), { recursive: true });
  await new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", [
      "-y",
      "-loglevel", "error",
      "-framerate", String(FPS),
      "-i", path.join(frameDir, "frame-%06d.png"),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      output
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited with ${code}`)));
  });
}

async function render(params, timeline, output) {
  const frameDir = await fsMkdtemp("code-video-demo-frames-");
  const { browser, page } = await launchPage(params, timeline);
  const totalFrames = Math.ceil(params.durationSeconds * FPS);
  try {
    for (let frame = 0; frame < totalFrames; frame += 1) {
      const file = path.join(frameDir, `frame-${String(frame).padStart(6, "0")}.png`);
      await renderFrame(page, frame / FPS, file);
      if (frame === 0 || (frame + 1) % FPS === 0) {
        console.log(`render ${frame + 1}/${totalFrames}`);
      }
    }
  } finally {
    await browser.close();
  }

  await runFfmpeg(frameDir, output);
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-show_entries", "stream=codec_name,width,height,nb_frames,r_frame_rate:format=duration",
    "-of", "json",
    output
  ]);
  const report = {
    schema: "code-video-render/1",
    output,
    sha256: createHash("sha256").update(await readFile(output)).digest("hex"),
    expected: { width: WIDTH, height: HEIGHT, fps: FPS, frames: totalFrames },
    ffprobe: JSON.parse(stdout),
    timeline
  };
  await writeFile(`${output}.json`, `${JSON.stringify(report, null, 2)}\n`);
  await rm(frameDir, { recursive: true, force: true });
  return report;
}

async function fsMkdtemp(prefix) {
  const { mkdtemp } = await import("node:fs/promises");
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

const { input, mode, output } = parseArgs(process.argv.slice(2));
const params = JSON.parse(await readFile(input, "utf8"));
const validation = validateParams(params);
if (!validation.ok) {
  console.error(JSON.stringify(validation, null, 2));
  process.exit(1);
}
const timeline = buildTimeline(params);
const result = mode === "--preview"
  ? await preview(params, timeline, output)
  : await render(params, timeline, output);
console.log(JSON.stringify({ ok: true, operation: mode.slice(2), ...result }, null, 2));
