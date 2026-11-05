import { createHash } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright";
import { createReferenceLayout } from "./reference-layout.mjs";

const execFileAsync = promisify(execFile);
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 60;
const BRUSH_FONT_BASE64 = (await readFile(new URL("../assets/MaShanZheng-subset.ttf", import.meta.url))).toString("base64");
const MODULE_TEXT_DATA = JSON.parse(await readFile(new URL("../assets/hanzi-writer-data/module-text.json", import.meta.url), "utf8"));
const TITLE_CHARS = [..."费曼学习法"];
const TITLE_SOURCE_TOP = 900;
const TITLE_SOURCE_CENTER_X = 512;
const TITLE_TARGET_HEIGHT = 178;
const TITLE_CELL_WIDTH = 154;
const TITLE_LEFT = 88;

function medianPath(median) {
  return median.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
}

function titleCharacterTransform(index) {
  const scale = TITLE_TARGET_HEIGHT / 1024;
  const cellCenterX = TITLE_LEFT + index * TITLE_CELL_WIDTH + TITLE_CELL_WIDTH / 2;
  return `translate(${cellCenterX} 96) scale(${scale} ${-scale}) translate(${-TITLE_SOURCE_CENTER_X} ${-TITLE_SOURCE_TOP})`;
}

function findPlanClip(animationPlan, id) {
  return animationPlan?.tracks.flatMap((track) => track.clips).find((clip) => clip.id === id) || null;
}

async function loadTitleData(animationPlan = null) {
  const strokes = [];
  const titleClip = findPlanClip(animationPlan, "title-handwrite");
  let cursor = titleClip?.start ?? 0.12;
  for (const [charIndex, char] of TITLE_CHARS.entries()) {
    const file = new URL(`../assets/hanzi-writer-data/${char}.json`, import.meta.url);
    const data = JSON.parse(await readFile(file, "utf8"));
    const transform = titleCharacterTransform(charIndex);
    data.strokes.forEach((strokePath, strokeIndex) => {
      const start = cursor;
      const end = start + 0.032;
      cursor = end + 0.006;
      strokes.push({
        index: strokes.length,
        start,
        end,
        transform,
        strokePath,
        medianPath: medianPath(data.medians[strokeIndex]),
      });
    });
  }
  const underlineClip = findPlanClip(animationPlan, "title-underline");
  return {
    strokes,
    underline: { start: underlineClip?.start ?? 1.62, duration: underlineClip?.duration ?? 0.92 },
  };
}

function titleStrokeMarkup(stroke) {
  const strokeId = `title-stroke-${stroke.index}`;
  const fillId = `title-fill-${stroke.index}`;
  const maskId = `title-mask-${stroke.index}`;
  return `
    <g transform="${stroke.transform}">
      <mask id="${maskId}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="-1024" y="-1024" width="2048" height="2048">
        <rect x="-1024" y="-1024" width="2048" height="2048" fill="black" />
        <path id="${strokeId}" d="${stroke.medianPath}" fill="none" stroke="white" stroke-width="150" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1" pathLength="1" />
      </mask>
      <path id="${fillId}" d="${stroke.strokePath}" fill="#1F2A44" mask="url(#${maskId})" />
    </g>`;
}

function buildTitleSvg(titleData) {
  const strokes = titleData.strokes.map(titleStrokeMarkup).join("\n");
  return `<svg id="title-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
    <g id="title-world" opacity="0">
      ${strokes}
      <path id="title-underline" d="M110 312 Q500 322 850 311" fill="none" stroke="#1F2A44" stroke-width="4" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" />
    </g>
    <g id="title-pencil" opacity="0" pointer-events="none">
      <polygon points="0,0 -8,13 8,13" fill="#D4D0C5" />
      <polygon points="0,0 -2.4,6 2.4,6" fill="#1F2A44" />
      <rect x="-8" y="12" width="16" height="48" rx="2" fill="#24324E" />
      <rect x="-8" y="35" width="16" height="11" fill="#F5CF66" />
      <path d="M-5 15V58 M5 15V58" stroke="rgba(255,255,255,.32)" stroke-width="1.5" />
    </g>
  </svg>`;
}

function parseArgs(argv) {
  const input = argv[0];
  const mode = argv[1];
  const output = argv[2];
  const planInput = argv[3] || null;
  if (!input || !mode || !output || !["--preview", "--render"].includes(mode)) {
    throw new Error("用法：node src/render-reference-style.mjs <params.json> --preview <dir> [plan.json] 或 --render <file> [plan.json]");
  }
  return { input, mode, output, planInput };
}

function stepConnectorEndpoints(index, steps = [], labelSize = 26, positions = []) {
  const previous = positions[index - 1];
  const current = positions[index];
  const previousLabel = steps[index - 1]?.label || "";
  const labelWidth = Array.from(previousLabel).length * labelSize * 0.98;
  return {
    from: { x: previous.x + 30 + labelWidth + 14, y: previous.y + 1 },
    to: { x: current.x - 10, y: current.y - 14 }
  };
}

function affinePathTransform(from, to, anchors) {
  const localX = anchors.to.x - anchors.from.x;
  const localY = anchors.to.y - anchors.from.y;
  const worldX = to.x - from.x;
  const worldY = to.y - from.y;
  const localLength = Math.hypot(localX, localY);
  const worldLength = Math.hypot(worldX, worldY);
  const rotation = (Math.atan2(worldY, worldX) - Math.atan2(localY, localX)) * 180 / Math.PI;
  const scale = worldLength / localLength;
  return `translate(${from.x} ${from.y}) rotate(${rotation}) scale(${scale}) translate(${-anchors.from.x} ${-anchors.from.y})`;
}

function affinePathScale(from, to, anchors) {
  const localLength = Math.hypot(anchors.to.x - anchors.from.x, anchors.to.y - anchors.from.y);
  const worldLength = Math.hypot(to.x - from.x, to.y - from.y);
  return worldLength / localLength;
}

function createAssetIntervals(paths, clip) {
  const pathGap = paths.length > 1 ? (clip.duration > 2 ? 0.035 : 0.04) : 0;
  const totalWeight = paths.reduce((sum, assetPath) => sum + (assetPath.durationWeight ?? 1), 0);
  const unitDuration = (clip.duration - pathGap * Math.max(0, paths.length - 1)) / totalWeight;
  let cursor = clip.start;
  return paths.map((assetPath) => {
    const start = cursor;
    const end = start + unitDuration * (assetPath.durationWeight ?? 1);
    cursor = end + pathGap;
    return { start, end };
  });
}

function buildAssetLayer(params, animationPlan, assetData, layout) {
  const iconMap = new Map(assetData.icons.map((icon) => [icon.id, icon]));
  const connectorMap = new Map(assetData.connectors.map((connector) => [connector.id, connector]));
  const clips = animationPlan?.tracks.flatMap((track) => track.clips).filter((clip) => clip.type === "pathDraw" || clip.type === "connectorDraw") || [];
  const markup = [];
  const runtimeClips = [];

  function addAssetPaths(clip, asset, prefix, geometryScale = 1) {
    const pathIds = asset.paths.map((assetPath) => `${prefix}-${assetPath.id}`);
    const intervals = createAssetIntervals(asset.paths, clip);
    asset.paths.forEach((assetPath, index) => {
      const strokeWidth = (assetPath.strokeWidth ?? assetData.defaultStyle.strokeWidth) / geometryScale;
      markup.push(`<path id="${pathIds[index]}" d="${assetPath.d}" transform="${assetPath.transform || ""}" fill="${assetData.defaultStyle.fill}" stroke="${assetData.defaultStyle.stroke}" stroke-width="${strokeWidth}" stroke-linecap="${assetData.defaultStyle.lineCap}" stroke-linejoin="${assetData.defaultStyle.lineJoin}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" opacity="0" filter="url(#asset-hand-drawn-ink)" />`);
    });
    runtimeClips.push({ id: clip.id, assetId: asset.id, pathIds, intervals });
  }

  const stepScenes = animationPlan?.scenes.filter((scene) => scene.kind === "step") || [];
  stepScenes.forEach((scene, index) => {
    const clip = clips.find((candidate) => candidate.id === `${scene.id}-icon`);
    const iconId = params.steps?.[index]?.icon;
    const icon = iconMap.get(iconId);
    if (!clip || !icon) return;
    const render = icon.render || icon.display || { scale: 1, centerY: 50 };
    const position = layout.positions[index];
    const transform = `translate(${position.x + 24} ${position.y + 85}) scale(${render.scale}) translate(-50 -${render.centerY})`;
    markup.push(`<g id="asset-icon-${scene.id}" transform="${transform}">`);
    addAssetPaths(clip, icon, `asset-path-${clip.id}-${iconId}`, render.scale);
    markup.push("</g>");
  });

  stepScenes.forEach((scene, index) => {
    const clip = clips.find((candidate) => candidate.id === `${scene.id}-connector`);
    const connectorId = clip?.assetId === "curve-arrow"
      ? layout.connectorAssets?.[index] || clip.assetId
      : clip?.assetId;
    const connector = connectorMap.get(connectorId);
    if (!clip || !connector || index === 0) return;
    const { from, to } = stepConnectorEndpoints(index, params.steps, layout.labelSize, layout.positions);
    const transform = affinePathTransform(from, to, connector.anchors, layout.stepCount >= 5 ? 1.15 : 1);
    const geometryScale = affinePathScale(from, to, connector.anchors);
    markup.push(`<g id="asset-connector-${scene.id}" transform="${transform}">`);
    addAssetPaths(clip, connector, `asset-path-${clip.id}-${connectorId}`, layout.stepCount >= 5 ? 1.15 : geometryScale);
    markup.push("</g>");
  });

  const guideClip = clips.find((candidate) => candidate.id === "conclusion-guide");
  const guide = connectorMap.get("guide-dash");
  if (guideClip && guide) {
    const transform = affinePathTransform({ x: 180, y: 560 }, { x: 1100, y: 548 }, guide.anchors);
    const geometryScale = affinePathScale({ x: 180, y: 560 }, { x: 1100, y: 548 }, guide.anchors);
    markup.push(`<g id="asset-connector-conclusion" transform="${transform}">`);
    addAssetPaths(guideClip, guide, `asset-path-${guideClip.id}-guide-dash`, geometryScale);
    markup.push("</g>");
  }

  return {
    markup: `<svg id="asset-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" fill="none" style="background: transparent">
    <defs>
      <filter id="asset-hand-drawn-ink" filterUnits="userSpaceOnUse" x="-2000" y="-1200" width="5000" height="3200" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.055" numOctaves="1" seed="17" result="inkNoise" />
        <feDisplacementMap in="SourceGraphic" in2="inkNoise" scale="${assetData.defaultStyle.handDrawn?.displacement ?? 0.75}" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
    <g id="asset-world">${markup.join("\n")}</g>
  </svg>`,
    runtime: { clips: runtimeClips }
  };
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function buildModuleTextLayer(params, animationPlan, layout) {
  const clips = animationPlan?.tracks.flatMap((track) => track.clips) || [];
  const markup = [];
  const runtimeClips = [];
  const runtimeGlyphs = [];

  function addText(textId, text, clip, x, y, size, weight, align = "left", lineGap = size * 1.22) {
    if (!clip || !text) return;
    const perCharacter = clip.animation?.perCharacter ?? 0.16;
    const interval = clip.animation?.interval ?? 0.035;
    const pathIds = [];
    const intervals = [];
    const lines = Array.isArray(text) ? text : [text];
    let globalCharacterIndex = 0;

    lines.forEach((line, lineIndex) => {
      const characters = [...line];
      const cellWidth = size * 0.98;
      const totalWidth = characters.length * cellWidth;
      let cursor = align === "center" ? x - totalWidth / 2 : x;
      const lineY = y + lineIndex * lineGap;
      characters.forEach((character, charIndex) => {
        const charStart = clip.start + globalCharacterIndex * interval;
        const charData = MODULE_TEXT_DATA[character];
        const centerX = cursor + cellWidth / 2;
        const anchorY = lineY - size * 0.44;
        if (charData) {
          const strokeDuration = Math.max(0.018, perCharacter / charData.strokes.length);
          const transform = `translate(${centerX} ${anchorY}) scale(${size / 1024} ${-(size / 1024)}) translate(-512 -900)`;
          charData.strokes.forEach((strokePath, strokeIndex) => {
            const pathId = `module-text-path-${textId}-${lineIndex}-${charIndex}-${strokeIndex}`;
            const maskId = `module-text-mask-${textId}-${lineIndex}-${charIndex}-${strokeIndex}`;
            const start = charStart + strokeIndex * strokeDuration;
            const end = Math.min(clip.start + clip.duration, start + strokeDuration * 1.08);
            pathIds.push(pathId);
            intervals.push({ start, end });
            markup.push(`<g transform="${transform}"><mask id="${maskId}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="-1024" y="-1024" width="2048" height="2048"><rect x="-1024" y="-1024" width="2048" height="2048" fill="black"/><path id="${pathId}" d="${strokePath}" fill="none" stroke="white" stroke-width="150" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></mask><path d="${strokePath}" fill="#1F2A44" mask="url(#${maskId})"/></g>`);
          });
        } else {
          const glyphId = `module-text-glyph-${textId}-${lineIndex}-${charIndex}`;
          markup.push(`<text id="${glyphId}" x="${cursor}" y="${lineY + size * 0.36}" fill="#1F2A44" font-family="Hiragino Sans GB, PingFang SC, serif" font-size="${size}" font-weight="${weight}" opacity="0">${escapeXml(character)}</text>`);
          runtimeGlyphs.push({ id: glyphId, start: charStart, end: Math.min(clip.start + clip.duration, charStart + perCharacter) });
        }
        cursor += cellWidth;
        globalCharacterIndex += 1;
      });
    });
    if (pathIds.length > 0) runtimeClips.push({ id: textId, pathIds, intervals });
  }

  const stepScenes = animationPlan?.scenes.filter((scene) => scene.kind === "step") || [];
  stepScenes.forEach((scene, index) => {
    const position = layout.positions[index];
    const labelClip = clips.find((clip) => clip.id === `${scene.id}-label`);
    const noteClip = clips.find((clip) => clip.id === `${scene.id}-note`);
    const noteLayout = layout.noteLayouts[index];
    addText(`${scene.id}-label`, params.steps?.[index]?.label, labelClip, position.x + 30, position.y + 1, layout.labelSize, 700);
    addText(`${scene.id}-note`, noteLayout?.lines || [params.steps?.[index]?.note], noteClip, noteLayout?.textX || position.x + 80, noteLayout?.textY || position.y + 90, layout.isLargeStyle ? 17 : 14, 500, "left", noteLayout?.lineGap);
  });

  const conclusionClip = clips.find((clip) => clip.id === "conclusion-note");
  addText("conclusion-note-line-1", "讲得清楚，", conclusionClip, 1120, 210, 18, 700, "center");
  addText("conclusion-note-line-2", "才是真的懂了。", conclusionClip, 1120, 234, 18, 700, "center");

  return {
    markup: `<svg id="module-text-layer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" fill="none"><g id="module-text-world">${markup.join("\n")}</g></svg>`,
    runtime: { clips: runtimeClips, glyphs: runtimeGlyphs }
  };
}

function buildHtml(params, titleData, animationPlan = null, assetData = { icons: [], connectors: [], defaultStyle: {} }) {
  const layout = createReferenceLayout(params);
  const safeParams = JSON.stringify(params).replaceAll("<", "\\u003c");
  const safeTitleData = JSON.stringify({
    strokes: titleData.strokes.map(({ index, start, end }) => ({ index, start, end })),
    underline: titleData.underline,
  }).replaceAll("<", "\\u003c");
  const assetLayer = buildAssetLayer(params, animationPlan, assetData, layout);
  const moduleTextLayer = buildModuleTextLayer(params, animationPlan, layout);
  const safeAssetRuntime = JSON.stringify(assetLayer.runtime).replaceAll("<", "\\u003c");
  const safeModuleTextRuntime = JSON.stringify(moduleTextLayer.runtime).replaceAll("<", "\\u003c");
  const safeAnimationPlan = JSON.stringify(animationPlan).replaceAll("<", "\\u003c");
  const safeLayout = JSON.stringify(layout).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <style>
    @font-face { font-family: "CodeVideoBrush"; src: url(data:font/ttf;base64,${BRUSH_FONT_BASE64}) format("truetype"); font-weight: 400; font-style: normal; }
    html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: #f7f2e7; }
    #stage { position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; }
    canvas, #asset-layer, #module-text-layer, #title-layer { position: absolute; inset: 0; display: block; width: ${WIDTH}px; height: ${HEIGHT}px; }
    #asset-layer { pointer-events: none; z-index: 1; background: transparent; mix-blend-mode: multiply; }
    #module-text-layer { pointer-events: none; z-index: 2; }
    #title-layer { pointer-events: none; z-index: 3; }
  </style>
</head>
<body>
  <div id="stage">
    <canvas id="canvas" width="${WIDTH}" height="${HEIGHT}"></canvas>
    ${assetLayer.markup}
    ${moduleTextLayer.markup}
    ${buildTitleSvg(titleData)}
  </div>
  <script>
    const input = ${safeParams};
    const titleConfig = ${safeTitleData};
    const animationPlan = ${safeAnimationPlan};
    const layoutConfig = ${safeLayout};
    const assetConfig = ${safeAssetRuntime};
    const moduleTextConfig = ${safeModuleTextRuntime};
    const canvas = document.getElementById('canvas');
    const assetWorld = document.getElementById('asset-world');
    const moduleTextWorld = document.getElementById('module-text-world');
    const titleLayer = document.getElementById('title-layer');
    const titleWorld = document.getElementById('title-world');
    const titlePencil = document.getElementById('title-pencil');
    const titleUnderline = document.getElementById('title-underline');
    const titleStrokeElements = titleConfig.strokes.map((stroke) => ({
      ...stroke,
      path: document.getElementById('title-stroke-' + stroke.index),
      fill: document.getElementById('title-fill-' + stroke.index),
    }));
    const assetPaths = new Map(assetConfig.clips.flatMap((clip) => clip.pathIds.map((pathId, index) => [pathId, { clip, interval: clip.intervals[index] }])));
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const colors = {
      paper: '#F7F2E7',
      ink: '#1F2A44',
      mint: '#8ED5BB',
      yellow: '#F5CF66',
      muted: '#B9B1A1',
      card: '#FFFDF7',
      shadow: 'rgba(31, 42, 68, 0.14)'
    };
    const stepPositions = layoutConfig.positions;
    function stepConnectorEndpoints(index, steps = [], labelSize = 26) {
      const previous = stepPositions[index - 1];
      const current = stepPositions[index];
      const previousLabel = steps[index - 1]?.label || '';
      const labelWidth = [...previousLabel].length * labelSize * 0.98;
      return {
        from: { x: previous.x + 30 + labelWidth + 14, y: previous.y + 1 },
        to: { x: current.x - 10, y: current.y - 14 }
      };
    }
    const legacyStepStarts = [3.1, 6.6, 10.1, 13.4];
    const isV3 = input.version === 3;
    const isV9 = input.version === 9;
    const isV14 = isV9 && layoutConfig.isLargeStyle;
    const isV8 = input.version === 8 || isV9;
    const isV7 = input.version === 7 || isV8;
    const isV6 = input.version === 6 || isV7;
    const isV4 = input.version === 4 || input.version === 5 || isV6;
    const isMotionVersion = isV3 || isV4 || isV9;
    const isPencilDriven = isV9;
    const useAnimationPlan = Boolean(animationPlan && animationPlan.project?.renderer === 'reference-style-v1' && isV9);
    const planClips = animationPlan ? animationPlan.tracks.flatMap((track) => track.clips) : [];
    const planClip = (id) => planClips.find((clip) => clip.id === id) || null;
    const planScenes = animationPlan?.scenes || [];
    const planScene = (id) => planScenes.find((scene) => scene.id === id) || null;
    const stepScenes = planScenes.filter((scene) => scene.kind === 'step');
    const stepStarts = useAnimationPlan ? stepScenes.map((scene) => scene.start) : legacyStepStarts;
    const planTimes = {
      titleEnd: useAnimationPlan ? planScene('intro').end + 0.05 : 3.15,
      conclusionStart: useAnimationPlan ? planScene('conclusion').start : 17.0,
      finalPath: useAnimationPlan ? planClip('conclusion-guide') : null,
      conclusionNote: useAnimationPlan ? planClip('conclusion-note') : null
    };

    const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
    const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);
    const easeInOut = (value) => value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
    const progress = (time, start, duration) => easeOut((time - start) / duration);
    const visible = (time, start, duration = 0.7) => clamp((time - start) / duration);
    const font = (size, weight = 500, family = 'body') => family === 'brush'
      ? '400 ' + size + 'px "CodeVideoBrush"'
      : weight + ' ' + size + 'px "Hiragino Sans GB", "PingFang SC", "Songti SC", serif';

    function setTitleWorldTransform(camera, overview = false) {
      const layout = overview ? ' translate(-132 10) scale(0.5 0.34)' : '';
      titleWorld.setAttribute('transform', 'translate(' + camera.offsetX + ' ' + camera.offsetY + ') scale(' + camera.scale + ')' + layout);
    }

    function titlePointOnPath(path, amount) {
      const length = path.getTotalLength();
      const point = path.getPointAtLength(length * amount);
      const matrix = path.getCTM();
      const current = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      return {
        x: current.x,
        y: current.y,
        rotation: -0.55,
      };
    }

    function assetPointOnClip(clipId, time) {
      const clip = assetConfig.clips.find((candidate) => candidate.id === clipId);
      if (!clip) return null;
      const pathIndex = clip.intervals.findIndex((interval) => time >= interval.start && time < interval.end);
      if (pathIndex < 0) return null;
      const interval = clip.intervals[pathIndex];
      const raw = (time - interval.start) / (interval.end - interval.start);
      const amount = easeOut(raw);
      const path = document.getElementById(clip.pathIds[pathIndex]);
      const length = path.getTotalLength();
      const point = path.getPointAtLength(length * amount);
      const pathMatrix = path.getCTM();
      const worldMatrix = assetWorld.getCTM();
      const worldInverse = worldMatrix.inverse();
      const currentScreen = new DOMPoint(point.x, point.y).matrixTransform(pathMatrix);
      const current = currentScreen.matrixTransform(worldInverse);
      return {
        x: current.x,
        y: current.y,
        rotation: -0.55,
      };
    }

    function setAssetProgress(time, camera) {
      assetWorld.setAttribute('transform', 'translate(' + camera.offsetX + ' ' + camera.offsetY + ') scale(' + camera.scale + ')');
      assetConfig.clips.forEach((clip) => {
        clip.pathIds.forEach((pathId, index) => {
          const path = document.getElementById(pathId);
          const interval = clip.intervals[index];
          const raw = (time - interval.start) / (interval.end - interval.start);
          const amount = easeOut(raw);
          path.style.strokeDasharray = '1';
          path.style.strokeDashoffset = String(1 - amount);
          path.style.opacity = raw >= 0 ? '1' : '0';
        });
      });
    }

    function moduleTextPointOnClip(clipId, time) {
      const clip = moduleTextConfig.clips.find((candidate) => candidate.id === clipId);
      if (!clip) return null;
      const pathIndex = clip.intervals.findIndex((interval) => time >= interval.start && time < interval.end);
      if (pathIndex < 0) return null;
      const interval = clip.intervals[pathIndex];
      const amount = easeOut((time - interval.start) / (interval.end - interval.start));
      const path = document.getElementById(clip.pathIds[pathIndex]);
      const length = path.getTotalLength();
      const point = path.getPointAtLength(length * amount);
      const pathMatrix = path.getCTM();
      const worldMatrix = moduleTextWorld.getCTM();
      const worldInverse = worldMatrix.inverse();
      const currentScreen = new DOMPoint(point.x, point.y).matrixTransform(pathMatrix);
      const current = currentScreen.matrixTransform(worldInverse);
      return {
        x: current.x,
        y: current.y,
        rotation: -0.55,
      };
    }

    function setModuleTextProgress(time, camera) {
      moduleTextWorld.setAttribute('transform', 'translate(' + camera.offsetX + ' ' + camera.offsetY + ') scale(' + camera.scale + ')');
      moduleTextConfig.clips.forEach((clip) => {
        clip.pathIds.forEach((pathId, index) => {
          const path = document.getElementById(pathId);
          const interval = clip.intervals[index];
          const raw = (time - interval.start) / (interval.end - interval.start);
          const amount = easeOut(raw);
          path.style.strokeDasharray = '1';
          path.style.strokeDashoffset = String(1 - amount);
        });
      });
      moduleTextConfig.glyphs.forEach((glyph) => {
        const amount = easeOut((time - glyph.start) / (glyph.end - glyph.start));
        const element = document.getElementById(glyph.id);
        element.style.opacity = String(clamp(amount));
      });
    }

    function setTitleProgress(time, visible, overview = false) {
      titleWorld.style.opacity = visible ? '1' : '0';
      titlePencil.style.opacity = '0';
      if (!visible) return;
      let active = null;
      titleStrokeElements.forEach((stroke) => {
        const raw = (time - stroke.start) / (stroke.end - stroke.start);
        const amount = easeOut(raw);
        stroke.path.style.strokeDasharray = '1';
        stroke.path.style.strokeDashoffset = String(1 - amount);
        stroke.fill.style.opacity = '1';
        if (raw >= 0 && raw < 1) active = { path: stroke.path, amount };
      });
      const underlineRaw = overview ? 1 : (time - titleConfig.underline.start) / titleConfig.underline.duration;
      const underlineAmount = easeOut(underlineRaw);
      titleUnderline.style.strokeDasharray = '1';
      titleUnderline.style.strokeDashoffset = String(1 - underlineAmount);
      if (!overview && underlineRaw >= 0 && underlineRaw < 1) active = { path: titleUnderline, amount: underlineAmount };
      if (active) {
        const point = titlePointOnPath(active.path, active.amount);
        titlePencil.style.opacity = '1';
        titlePencil.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ') rotate(' + (point.rotation * 180 / Math.PI) + ')');
      }
    }

    function drawPaper() {
      const frameAmount = isV4 && !isV9 ? progress(timeForReveal, isV8 ? planTimes.conclusionStart : 16.1, 1.1) : 0;
      const left = 24 * frameAmount;
      const top = 18 * frameAmount;
      const right = W - 24 * frameAmount;
      const bottom = H - 135 * frameAmount;
      ctx.fillStyle = frameAmount > 0 ? colors.ink : colors.paper;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = colors.paper;
      ctx.fillRect(left, top, right - left, bottom - top);
      ctx.fillStyle = 'rgba(203, 193, 173, 0.72)';
      for (let x = 24 + left; x < right; x += 28) {
        for (let y = 24 + top; y < bottom; y += 28) {
          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      drawTape(38 + left, 48 + top, 78, -0.16, 0.95);
    }

    function drawTape(x, y, width, rotation, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = colors.mint;
      ctx.fillRect(-width / 2, -10, width, 20);
      ctx.globalAlpha = alpha * 0.23;
      ctx.fillStyle = '#FFFFFF';
      for (let offset = -width / 2; offset < width / 2; offset += 12) ctx.fillRect(offset, -10, 4, 20);
      ctx.restore();
    }

    function drawText(text, x, y, size, color = colors.ink, align = 'left', weight = 500) {
      ctx.font = font(size, weight);
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
    }

    function drawPencil(x, y, rotation, alpha = 1, scale = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.shadowColor = colors.shadow;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#24324E';
      ctx.fillRect(-7, -30, 14, 52);
      ctx.fillStyle = '#F5CF66';
      ctx.fillRect(-7, -5, 14, 12);
      ctx.fillStyle = '#D4D0C5';
      ctx.beginPath();
      ctx.moveTo(-7, -30);
      ctx.lineTo(7, -30);
      ctx.lineTo(0, -44);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.moveTo(-2, -40);
      ctx.lineTo(2, -40);
      ctx.lineTo(0, -47);
      ctx.closePath();
      ctx.fill();
      if (isV6) {
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255,255,255,0.32)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3.5, -27); ctx.lineTo(-3.5, 43);
        ctx.moveTo(3.5, -27); ctx.lineTo(3.5, 43);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawPencilAtPoint(x, y, rotation = -0.55, alpha = 1, scale = 1) {
      const tipOffsetX = 47 * scale * Math.sin(rotation);
      const tipOffsetY = -47 * scale * Math.cos(rotation);
      drawPencil(x - tipOffsetX, y - tipOffsetY, rotation, alpha, scale);
    }

    function quadraticPoint(x1, y1, controlX, controlY, x2, y2, amount) {
      const p = clamp(amount);
      const inverse = 1 - p;
      return {
        x: inverse * inverse * x1 + 2 * inverse * p * controlX + p * p * x2,
        y: inverse * inverse * y1 + 2 * inverse * p * controlY + p * p * y2,
      };
    }

    function arrowPenPoint(x1, y1, x2, y2, amount) {
      const controlX = (x1 + x2) / 2;
      const controlY = Math.min(y1, y2) - 48;
      const point = quadraticPoint(x1, y1, controlX, controlY, x2, y2, amount);
      return { ...point, rotation: -0.55 };
    }

    function drawLine(x1, y1, x2, y2, amount, color = colors.ink, width = 3, dashed = false) {
      const length = Math.hypot(x2 - x1, y2 - y1);
      const visibleLength = Math.max(1, length * clamp(amount));
      ctx.save();
      ctx.globalAlpha = clamp(amount);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.setLineDash(dashed ? [Math.min(12, visibleLength), 10] : [visibleLength, 1600]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (isV6 && !dashed) {
        ctx.globalAlpha = clamp(amount) * 0.26;
        ctx.lineWidth = Math.max(1, width * 0.55);
        ctx.translate(0.8, -0.7);
        ctx.setLineDash([visibleLength * 0.9, 1600]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawHandUnderline(amount, centerX = W / 2, width = 310, lineY = 117) {
      const p = clamp(amount);
      ctx.save();
      ctx.globalAlpha = p;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([width * 1.35 * p, 1600]);
      ctx.beginPath();
      ctx.moveTo(centerX - width / 2, lineY);
      ctx.quadraticCurveTo(centerX - width * 0.06, lineY + 6, centerX + width / 2, lineY - 2);
      ctx.stroke();
      if (isV6) {
        ctx.globalAlpha = p * 0.24;
        ctx.lineWidth = 1.4;
        ctx.translate(0.8, -0.7);
        ctx.setLineDash([width * 1.35 * p * 0.92, 1600]);
        ctx.beginPath();
        ctx.moveTo(centerX - width / 2, lineY);
        ctx.quadraticCurveTo(centerX - width * 0.06, lineY + 6, centerX + width / 2, lineY - 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawRevealText(text, x, y, size, color, weight, start, interval, duration, align = 'center', letterGap = 0) {
      const family = isV7 && size >= 32 ? 'brush' : 'body';
      ctx.font = font(size, weight, family);
      const characters = [...text];
      const widths = characters.map((character) => ctx.measureText(character).width);
      const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, characters.length - 1) * letterGap;
      let cursor = align === 'center' ? x - totalWidth / 2 : x;
      let lastProgress = 0;
      characters.forEach((character, index) => {
        const characterProgress = easeOut((timeForReveal - start - index * interval) / duration);
        const p = clamp(characterProgress);
        const jitter = ((index * 7) % 3) - 1;
        if (p > 0) {
          ctx.save();
          ctx.globalAlpha = p;
          ctx.translate(cursor + widths[index] / 2, y + (1 - p) * 8 + jitter);
          ctx.rotate((index % 3 - 1) * 0.012);
            if (isV6 && (!isV8 || size >= 32 || isV9)) {
            ctx.font = font(size, weight, family);
            if (isV7) ctx.textBaseline = 'middle';
            ctx.strokeStyle = color;
              ctx.lineWidth = isV9 ? Math.max(0.9, size * 0.055) : isV7 ? (size > 40 ? 3.6 : 2.2) : (size > 40 ? 2.1 : 1.4);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.setLineDash([Math.max(1, widths[index] * 5.5 * p), 1600]);
            ctx.strokeText(character, 0, 0);
            const fillProgress = clamp((p - 0.42) / 0.58);
            if (fillProgress > 0) {
              ctx.globalAlpha = fillProgress;
              ctx.fillStyle = color;
              ctx.fillText(character, 0, 0);
            }
          } else {
            ctx.beginPath();
            ctx.rect(-widths[index] / 2 - 3, -size, widths[index] + 6, size * 1.4);
            ctx.clip();
            drawText(character, 0, 0, size, color, 'center', weight);
          }
          ctx.restore();
        }
        lastProgress = Math.max(lastProgress, p);
        cursor += widths[index] + letterGap;
      });
      return { progress: lastProgress, endX: cursor };
    }

    function getTextPenPoint(text, x, y, size, weight, start, interval, duration, align = 'center', letterGap = 0) {
      const family = isV7 && size >= 32 ? 'brush' : 'body';
      ctx.font = font(size, weight, family);
      const characters = [...text];
      const widths = characters.map((character) => ctx.measureText(character).width);
      const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, characters.length - 1) * letterGap;
      let cursor = align === 'center' ? x - totalWidth / 2 : x;
      for (let index = 0; index < characters.length; index += 1) {
        const raw = (timeForReveal - start - index * interval) / duration;
        if (raw >= 0 && raw < 1) {
          const p = easeOut(raw);
          return {
            x: cursor + widths[index] * (0.18 + 0.72 * p),
            y: y + (1 - p) * 8,
            rotation: -0.55,
          };
        }
        cursor += widths[index] + letterGap;
      }
      return null;
    }

    function drawRevealTextWithHighlight(text, phrase, x, y, size, color, weight, start, interval, duration, align = 'center') {
      const family = isV7 && size >= 32 ? 'brush' : 'body';
      if (phrase) {
        ctx.font = font(size, weight, family);
        const characters = [...text];
        const widths = characters.map((character) => ctx.measureText(character).width);
        const totalWidth = widths.reduce((sum, width) => sum + width, 0);
        const baseX = align === 'center' ? x - totalWidth / 2 : x;
        const phraseIndex = text.indexOf(phrase);
        if (phraseIndex >= 0) {
          const phraseX = baseX + widths.slice(0, phraseIndex).reduce((sum, width) => sum + width, 0);
          const phraseWidth = widths.slice(phraseIndex, phraseIndex + [...phrase].length).reduce((sum, width) => sum + width, 0);
          const phraseAmount = easeOut((timeForReveal - start - phraseIndex * interval) / duration);
          ctx.save();
          ctx.globalAlpha = clamp(phraseAmount) * 0.92;
          ctx.fillStyle = colors.yellow;
          ctx.translate(phraseX - 4, y - size * 0.42);
          ctx.rotate(-0.025);
          ctx.fillRect(0, 0, phraseWidth + 8, size * 0.68);
          ctx.restore();
        }
      }
      return drawRevealText(text, x, y, size, color, weight, start, interval, duration, align);
    }

    function drawArrow(x1, y1, x2, y2, amount) {
      const p = clamp(amount);
      if (isV4) {
        const controlX = (x1 + x2) / 2;
        const controlY = Math.min(y1, y2) - 48;
        const length = Math.hypot(x2 - x1, y2 - y1) * 1.22;
        ctx.save();
        ctx.globalAlpha = p;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([Math.max(1, length * p), 1600]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(controlX, controlY, x2, y2);
        ctx.stroke();
        if (isV6) {
          ctx.globalAlpha = p * 0.24;
          ctx.lineWidth = 1.4;
          ctx.translate(0.9, -0.7);
          ctx.setLineDash([Math.max(1, length * p * 0.9), 1600]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(controlX, controlY, x2, y2);
          ctx.stroke();
        }
        ctx.restore();
        if (p > 0.72) {
          const angle = Math.atan2(y2 - controlY, x2 - controlX);
          const size = 12 * easeOut((p - 0.72) / 0.28);
          ctx.save();
          ctx.globalAlpha = size / 12;
          ctx.fillStyle = colors.ink;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - Math.cos(angle - 0.55) * size, y2 - Math.sin(angle - 0.55) * size);
          ctx.lineTo(x2 - Math.cos(angle + 0.55) * size, y2 - Math.sin(angle + 0.55) * size);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        return;
      }
      drawLine(x1, y1, x2, y2, p, colors.ink, 3);
      if (p > 0.72) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const size = 12 * easeOut((p - 0.72) / 0.28);
        ctx.save();
        ctx.globalAlpha = size / 12;
        ctx.fillStyle = colors.ink;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - Math.cos(angle - 0.55) * size, y2 - Math.sin(angle - 0.55) * size);
        ctx.lineTo(x2 - Math.cos(angle + 0.55) * size, y2 - Math.sin(angle + 0.55) * size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function drawNumber(number, x, y, color, amount) {
      ctx.save();
      const p = clamp(amount);
      ctx.globalAlpha = p;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      if (isV8) {
        ctx.setLineDash([Math.max(1, Math.PI * 34 * p), 1600]);
        ctx.beginPath();
        ctx.arc(x, y, 17, -Math.PI / 2, Math.PI * 1.5);
        ctx.stroke();
        const fillAmount = clamp((p - 0.5) / 0.5);
        ctx.globalAlpha = fillAmount;
        ctx.beginPath();
        ctx.arc(x, y, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = fillAmount;
        if (isV9) {
          ctx.font = font(18, 700);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = 1;
          ctx.setLineDash([Math.max(1, 34 * fillAmount), 1600]);
          ctx.strokeText(number, x, y + 1);
          if (fillAmount > 0.6) {
            ctx.globalAlpha = clamp((fillAmount - 0.6) / 0.4);
            ctx.fillStyle = colors.ink;
            ctx.fillText(number, x, y + 1);
          }
        } else drawText(number, x, y + 1, 18, colors.ink, 'center', 700);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 17, 0, Math.PI * 2);
        ctx.fill();
        drawText(number, x, y + 1, 18, colors.ink, 'center', 700);
      }
      ctx.restore();
    }

    function drawIcon(type, x, y, amount) {
      const p = clamp(amount);
      ctx.save();
      ctx.globalAlpha = p;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([Math.max(1, 900 * p), 1600]);
      if (type === 'bulb') {
        ctx.beginPath();
        ctx.arc(x, y - 8, 27, Math.PI * 0.16, Math.PI * 0.84);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 12); ctx.lineTo(x + 15, y + 12);
        ctx.moveTo(x - 11, y + 20); ctx.lineTo(x + 11, y + 20);
        ctx.stroke();
        for (let index = 0; index < 5; index += 1) {
          const angle = -Math.PI * 0.9 + index * Math.PI * 0.45;
          const startX = x + Math.cos(angle) * 34;
          const startY = y - 8 + Math.sin(angle) * 34;
          drawLine(startX, startY, startX + Math.cos(angle) * 12 * p, startY + Math.sin(angle) * 12 * p, p, colors.ink, 2);
        }
        ctx.fillStyle = colors.mint;
        ctx.globalAlpha = p * 0.7;
        ctx.beginPath(); ctx.arc(x, y - 8, 17, 0, Math.PI * 2); ctx.fill();
      } else if (type === 'chat') {
        ctx.beginPath();
        ctx.roundRect(x - 34, y - 24, 68, 44, 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 20); ctx.lineTo(x - 28, y + 37); ctx.lineTo(x - 5, y + 23);
        ctx.stroke();
        drawLine(x - 18, y - 6, x + 18, y - 6, p, colors.ink, 2);
        drawLine(x - 18, y + 6, x + 8, y + 6, p, colors.ink, 2);
      } else if (type === 'book') {
        ctx.beginPath();
        ctx.moveTo(x, y - 22); ctx.quadraticCurveTo(x - 25, y - 32, x - 42, y - 20); ctx.lineTo(x - 42, y + 26); ctx.quadraticCurveTo(x - 20, y + 16, x, y + 28);
        ctx.moveTo(x, y - 22); ctx.quadraticCurveTo(x + 25, y - 32, x + 42, y - 20); ctx.lineTo(x + 42, y + 26); ctx.quadraticCurveTo(x + 20, y + 16, x, y + 28);
        ctx.stroke();
        drawLine(x, y - 22, x, y + 28, p, colors.ink, 2);
        ctx.fillStyle = colors.mint;
        ctx.globalAlpha = p * 0.75;
        ctx.beginPath(); ctx.roundRect(x - 34, y - 14, 26, 30, 4); ctx.fill();
      } else {
        ctx.beginPath();
        for (let index = 0; index < 80; index += 1) {
          const angle = index / 79 * Math.PI * 4.2;
          const radius = 2 + index * 0.32;
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        drawLine(x + 46, y + 28, x + 78, y + 28, p, colors.yellow, 8);
        drawText('＋', x + 60, y + 3, 24, colors.ink, 'center', 700);
      }
      ctx.restore();
    }

    function iconPenPoint(type, x, y, amount) {
      const p = clamp(amount);
      if (type === 'bulb') {
        const angle = Math.PI * 0.16 + Math.PI * 0.68 * p;
        return { x: x + Math.cos(angle) * 27, y: y - 8 + Math.sin(angle) * 27, rotation: -0.55 };
      }
      if (type === 'chat') {
        const perimeter = 2 * (68 + 44) + 42;
        let distance = p * perimeter;
        if (distance < 68) return { x: x - 34 + distance, y: y - 24, rotation: -0.55 };
        distance -= 68;
        if (distance < 44) return { x: x + 34, y: y - 24 + distance, rotation: -0.55 };
        distance -= 44;
        if (distance < 68) return { x: x + 34 - distance, y: y + 20, rotation: -0.55 };
        distance -= 68;
        if (distance < 42) return { x: x - 34 + distance, y: y - 24, rotation: -0.55 };
        return { x: x - 15, y: y + 20, rotation: -0.55 };
      }
      if (type === 'book') {
        const side = p < 0.5 ? p * 2 : (p - 0.5) * 2;
        if (p < 0.5) return { x: x - 42 + side * 42, y: y - 20 + side * 46, rotation: -0.55 };
        return { x, y: y - 22 + side * 50, rotation: -0.55 };
      }
      const angle = p * Math.PI * 4.2;
      const radius = 2 + p * 25;
      return { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius, rotation: -0.55 };
    }

    let timeForReveal = 0;

    function drawTitle(time) {
      if (isV7 && time < planTimes.titleEnd) {
        timeForReveal = time;
        if (isV9) {
          drawRevealTextWithHighlight(input.subtitle, '讲给别人听', 150, 372, 40, colors.ink, 400, 1.68, 0.05, 0.2, 'left');
          return;
        }
        const title = drawRevealText(input.title, 40, 228, 145, colors.ink, 400, 0.16, 0.28, 0.38, 'left', 10);
        const underlineAmount = progress(time, 1.62, 0.92);
        drawHandUnderline(underlineAmount, 515, 750, 315);
        drawRevealTextWithHighlight(input.subtitle, '讲给别人听', 150, 372, 40, colors.ink, 400, 1.68, 0.05, 0.2, 'left');
        const titleProgress = clamp((time - 0.16) / 1.58);
        if (isPencilDriven) {
          const titlePen = getTextPenPoint(input.title, 40, 228, 145, 400, 0.16, 0.28, 0.38, 'left', 10);
          const subtitlePen = getTextPenPoint(input.subtitle, 150, 372, 40, 400, 1.68, 0.05, 0.2, 'left');
          if (titlePen) {
            drawPencilAtPoint(titlePen.x, titlePen.y, titlePen.rotation, 0.98, 1.48);
          } else if (underlineAmount > 0 && underlineAmount < 1) {
            const point = quadraticPoint(140, 315, 492, 321, 890, 313, underlineAmount);
            drawPencilAtPoint(point.x, point.y, -0.55, 0.98, 1.58);
          } else if (subtitlePen) {
            drawPencilAtPoint(subtitlePen.x, subtitlePen.y, subtitlePen.rotation, 0.94, 1.08);
          }
        } else if (time < 1.62) {
          const pencilProgress = clamp((time - 0.16) / 1.46);
          drawPencil(168 + pencilProgress * 700, 154 + pencilProgress * 128, -0.55, 0.98, 1.68);
        } else if (underlineAmount < 1) {
          const underlinePencilProgress = clamp((time - 1.62) / 0.92);
          drawPencil(150 + underlinePencilProgress * 730, 319, -0.55, 0.98, 1.68);
        } else if (title.progress < 1) {
          drawPencil(168 + titleProgress * 700, 154 + titleProgress * 128, -0.55, 0.98, 1.68);
        }
        return;
      }
      if (isV8 && time < planTimes.conclusionStart) {
        if (time < 5.4) {
          drawRevealTextWithHighlight(input.subtitle, '讲给别人听', 220, 20, 24, colors.ink, 500, 1.5, 0.08, 0.2, 'center');
        }
        return;
      }
      if (isV4) {
        timeForReveal = time;
        const overviewStart = isV8 ? planTimes.conclusionStart : 15.5;
        const isFinalOverview = isV7 && time > overviewStart;
        const overviewTitleX = isFinalOverview ? -80 : time > overviewStart ? 260 : W / 2;
        const overviewTitleSize = isFinalOverview ? 78 : 54;
        const overviewTitleAlign = isFinalOverview ? 'left' : 'center';
        if (isV9) {
          drawRevealTextWithHighlight(input.subtitle, '讲给别人听', isFinalOverview ? -40 : overviewTitleX, 146, isFinalOverview ? 28 : 24, colors.ink, 500, 1.5, 0.08, 0.2, isFinalOverview ? 'left' : 'center');
          return;
        }
        const title = drawRevealText(input.title, overviewTitleX, 84, overviewTitleSize, colors.ink, 700, 0.15, 0.28, 0.34, overviewTitleAlign);
        const underlineAmount = progress(time, 1.45, 0.7);
        drawHandUnderline(underlineAmount, isFinalOverview ? 185 : overviewTitleX, isFinalOverview ? 450 : 310, 117);
        drawRevealTextWithHighlight(input.subtitle, '讲给别人听', isFinalOverview ? -40 : overviewTitleX, 146, isFinalOverview ? 28 : 24, colors.ink, 500, 1.5, 0.08, 0.2, isFinalOverview ? 'left' : 'center');
        const pencilProgress = clamp((time - 0.15) / 1.75);
        if (pencilProgress > 0 && pencilProgress < 1) {
          drawPencil(W / 2 - 205 + pencilProgress * 405, 92, -0.55, 0.98, isV7 ? 1.42 : 1.22);
        } else if (title.progress < 1) {
          drawPencil(W / 2 - 205 + title.progress * 405, 92, -0.55, 0.98, isV7 ? 1.42 : 1.22);
        }
        return;
      }
      const titleAmount = progress(time, 0.2, 1.8);
      const subtitleAmount = progress(time, 1.5, 1.1);
      const underlineAmount = progress(time, 1.0, 1.2);
      ctx.save();
      ctx.globalAlpha = titleAmount;
      drawText(input.title, W / 2, 84 - (1 - titleAmount) * 16, 54, colors.ink, 'center', 700);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = underlineAmount;
      if (isV3) drawHandUnderline(underlineAmount);
      else drawLine(W / 2 - 155, 117, W / 2 + 155, 117, underlineAmount, colors.ink, 3);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = subtitleAmount;
      drawText(input.subtitle, W / 2, 146, 24, colors.ink, 'center', 500);
      ctx.restore();
      const pencilProgress = clamp((time - 0.3) / 2.3);
      drawPencil(W / 2 - 210 + pencilProgress * 420, 92, -0.55, pencilProgress > 0 && pencilProgress < 1 ? 1 : 0);
    }

    function drawStep(step, index, time) {
      const scene = useAnimationPlan ? stepScenes[index] : null;
      const numberClip = useAnimationPlan ? planClip(scene.id + '-number') : null;
      const labelClip = useAnimationPlan ? planClip(scene.id + '-label') : null;
      const connectorClip = useAnimationPlan ? planClip(scene.id + '-connector') : null;
      const iconClip = useAnimationPlan ? planClip(scene.id + '-icon') : null;
      const noteClip = useAnimationPlan ? planClip(scene.id + '-note') : null;
      const start = stepStarts[index];
      const position = stepPositions[index];
      const labelStart = labelClip?.start ?? start + 0.08;
      const labelInterval = labelClip?.animation?.interval ?? 0.08;
      const labelDuration = labelClip?.animation?.perCharacter ?? 0.22;
      const noteTextStart = noteClip?.start ?? start + 1.05;
      const labelSize = layoutConfig.labelSize;
      const noteLayout = layoutConfig.noteLayouts[index] || {
        originX: position.x + 72,
        originY: position.y + 90,
        width: 150,
        height: 56,
        top: -26,
        textX: position.x + 80,
        textY: position.y + 90,
        lineGap: 0,
        lines: [step.note]
      };
      const noteLines = noteLayout.lines || [step.note];
      const noteSize = layoutConfig.isLargeStyle ? 17 : 14;
      const titleAmount = progress(time, numberClip?.start ?? start, numberClip?.duration ?? 0.7);
      const iconAmount = progress(time, iconClip?.start ?? start + (isV8 ? 1.15 : 0.45), iconClip?.duration ?? (isV8 ? 0.85 : 0.9));
      const noteAmount = progress(time, noteClip?.start ?? start + (isV8 ? 1.45 : 0.95), noteClip?.duration ?? 0.7);
      const arrowAmount = index > 0 ? progress(time, connectorClip?.start ?? start - 0.65, connectorClip?.duration ?? 0.8) : 0;
      if (titleAmount <= 0) return;
      const numberColor = index % 2 === 0 ? colors.mint : colors.yellow;
      drawNumber(step.number, position.x, position.y, numberColor, titleAmount);
      const labelPhrase = index === 1 ? '外行' : index === 3 ? '打比方' : '';
      if (useAnimationPlan) {
        // 计划驱动版本的模块文字由 SVG 笔画层绘制，Canvas 只保留背景和笔尖。
      } else if (isV4) drawRevealTextWithHighlight(step.label, labelPhrase, position.x + 30, position.y + 1, isV7 ? 25 : labelSize, colors.ink, isV7 ? 500 : 700, labelStart, labelInterval, labelDuration, 'left');
      else {
        ctx.save();
        ctx.globalAlpha = titleAmount;
        drawText(step.label, position.x + 30, position.y + 1, labelSize, colors.ink, 'left', 700);
        ctx.restore();
      }
      if (index > 0) {
        const previous = stepPositions[index - 1];
        if (!useAnimationPlan) drawArrow(previous.x + 54, previous.y + 18, position.x - 42, position.y - 10, arrowAmount);
      }
      if (!useAnimationPlan) drawIcon(step.icon, position.x + 24, position.y + 85, iconAmount);
      if (noteAmount > 0) {
        ctx.save();
        ctx.globalAlpha = noteAmount;
        ctx.translate(noteLayout.originX, noteLayout.originY + (1 - noteAmount) * 16);
        if (isV8) {
          ctx.beginPath();
          ctx.rect(-6, noteLayout.top, noteLayout.width * noteAmount, noteLayout.height);
          ctx.clip();
        }
        ctx.rotate(index % 2 === 0 ? -0.04 : 0.04);
        ctx.shadowColor = colors.shadow;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 7;
        ctx.fillStyle = index === 3 ? '#FFF0B6' : '#D9F1E7';
        ctx.fillRect(-6, noteLayout.top, noteLayout.width, noteLayout.height);
        ctx.shadowColor = 'transparent';
        if (isV4 && !useAnimationPlan) {
          drawTape(noteLayout.width / 2, noteLayout.top - 1, isV14 ? 88 : 74, index === 3 ? 0.04 : -0.04, noteAmount);
          noteLines.forEach((line, lineIndex) => drawRevealText(line, noteLayout.textX - noteLayout.originX, noteLayout.textY - noteLayout.originY + lineIndex * noteLayout.lineGap, noteSize, colors.ink, 500, noteTextStart + lineIndex * 0.18, 0.035, 0.16, 'left'));
        } else if (!useAnimationPlan) {
          noteLines.forEach((line, lineIndex) => drawText(line, noteLayout.textX - noteLayout.originX, noteLayout.textY - noteLayout.originY + lineIndex * noteLayout.lineGap, noteSize, colors.ink, 'left', 500));
        }
        ctx.restore();
      }
      if (isMotionVersion && !isPencilDriven) {
        const pencilAmount = clamp((time - start - 0.2) / 1.35);
        if (pencilAmount > 0 && pencilAmount < 1) {
          drawPencil(position.x - 18 + pencilAmount * 142, position.y + 130, -0.82, 0.95, isV6 ? 1.18 : isV4 ? 1.08 : 1);
        }
      }
      if (isPencilDriven) {
        const labelPen = useAnimationPlan && labelClip
          ? moduleTextPointOnClip(labelClip.id, time)
          : getTextPenPoint(step.label, position.x + 30, position.y + 1, labelSize, 500, labelStart, labelInterval, labelDuration, 'left');
        let penPoint = labelPen;
        if (!penPoint && useAnimationPlan && connectorClip && arrowAmount > 0 && arrowAmount < 1) {
          penPoint = assetPointOnClip(connectorClip.id, time);
        }
        if (!penPoint && arrowAmount > 0 && arrowAmount < 1 && index > 0) {
      const endpoints = stepConnectorEndpoints(index, input.steps, layoutConfig.labelSize);
          penPoint = arrowPenPoint(endpoints.from.x, endpoints.from.y, endpoints.to.x, endpoints.to.y, arrowAmount);
        }
        if (!penPoint && useAnimationPlan && iconClip && iconAmount > 0 && iconAmount < 1) {
          penPoint = assetPointOnClip(iconClip.id, time);
        }
        if (!penPoint && iconAmount > 0 && iconAmount < 1) penPoint = iconPenPoint(step.icon, position.x + 24, position.y + 85, iconAmount);
        if (!penPoint && useAnimationPlan && noteClip && noteAmount > 0 && noteAmount < 1) {
          penPoint = moduleTextPointOnClip(noteClip.id, time);
        }
        if (!penPoint && noteAmount > 0 && noteAmount < 1) {
          penPoint = { x: noteLayout.originX - 6 + noteLayout.width * noteAmount, y: noteLayout.originY + noteLayout.top, rotation: -0.55 };
        }
        if (!penPoint && titleAmount > 0 && titleAmount < 1) {
          const angle = -Math.PI / 2 + Math.PI * 2 * titleAmount;
          penPoint = { x: position.x + Math.cos(angle) * 17, y: position.y + Math.sin(angle) * 17, rotation: -0.55 };
        }
        if (penPoint) drawPencilAtPoint(penPoint.x, penPoint.y, penPoint.rotation, 0.96, 1.02);
      }
    }

    function drawFinalPath(time) {
      if (useAnimationPlan) {
        const pathPoint = assetPointOnClip('conclusion-guide', time);
        if (pathPoint) drawPencilAtPoint(pathPoint.x, pathPoint.y, pathPoint.rotation, 1, 1.08);
        return;
      }
      const amount = progress(time, planTimes.finalPath?.start ?? (isV8 ? 16.4 : 15.2), planTimes.finalPath?.duration ?? 2.3);
      if (amount <= 0) return;
      ctx.save();
      ctx.globalAlpha = amount;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(180, 560);
      ctx.quadraticCurveTo(W / 2, 640, 1100, 548);
      ctx.stroke();
      ctx.restore();
      const pathPoint = quadraticPoint(180, 560, W / 2, 640, 1100, 548, amount);
      if (isPencilDriven) drawPencilAtPoint(pathPoint.x, pathPoint.y, -0.55, amount < 0.98 ? 1 : 0, 1.08);
      else drawPencil(180 + amount * 880, 560 - Math.sin(amount * Math.PI) * 26, -0.55, amount < 0.98 ? 1 : 0);
    }

    function drawConclusion(time) {
      const amount = progress(time, planTimes.conclusionNote?.start ?? (isV8 ? 17.4 : 16.5), planTimes.conclusionNote?.duration ?? 1.1);
      if (amount <= 0) return;
      ctx.save();
      ctx.globalAlpha = amount;
      ctx.translate(0, (1 - amount) * 18);
      if (isV8) {
        ctx.beginPath();
        ctx.rect(W - 245, 164, 170 * amount, 91);
        ctx.clip();
      }
      drawTape(W - 160, 164, 96, 0.08, amount);
      ctx.fillStyle = '#FFE68C';
      ctx.shadowColor = colors.shadow;
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillRect(W - 245, 185, 170, 70);
      ctx.shadowColor = 'transparent';
      if (isV8 && !useAnimationPlan) {
        drawRevealText('讲得清楚，', W - 160, 210, 18, colors.ink, 700, 17.55, 0.035, 0.16);
        drawRevealText('才是真的懂了。', W - 160, 234, 18, colors.ink, 700, 17.72, 0.035, 0.16);
        drawRevealText(input.conclusion, W / 2, isMotionVersion ? 570 : 665, 22, colors.ink, 700, 17.65, 0.035, 0.16);
      } else if (!useAnimationPlan) {
        drawText('讲得清楚，', W - 160, 210, 18, colors.ink, 'center', 700);
        drawText('才是真的懂了。', W - 160, 234, 18, colors.ink, 'center', 700);
        drawText(input.conclusion, W / 2, isMotionVersion ? 570 : 665, 22, colors.ink, 'center', 700);
      }
      if (isPencilDriven && useAnimationPlan) {
        const textPoint = moduleTextPointOnClip('conclusion-note-line-1', time) || moduleTextPointOnClip('conclusion-note-line-2', time);
        if (textPoint) drawPencilAtPoint(textPoint.x, textPoint.y, textPoint.rotation, 0.96, 0.82);
      } else if (isPencilDriven && amount > 0 && amount < 1) {
        drawPencilAtPoint(W - 245 + 170 * amount, 185, -0.55, 0.96, 0.92);
      }
      ctx.restore();
    }

    function cameraAt(time) {
      const introEnd = useAnimationPlan ? planScene('intro').end : 3.1;
      const conclusionStart = useAnimationPlan ? planScene('conclusion').start : 17.0;
      const legacyStarts = useAnimationPlan ? stepScenes.map((scene) => scene.start) : legacyStepStarts;
      const step1Start = legacyStarts[0] ?? 3.1;
      const step2Start = legacyStarts[1] ?? 6.6;
      const step3Start = legacyStarts[2] ?? 10.1;
      const step4Start = legacyStarts[3] ?? 13.4;
      if (isV8) {
        const keyframes = [
          { time: 0, x: 640, y: 360, scale: 1 },
          { time: introEnd, x: 640, y: 360, scale: 1 },
        ];
        stepScenes.forEach((scene, index) => {
          const focus = layoutConfig.cameraFocus[index] || layoutConfig.overview;
          const nextStart = stepScenes[index + 1]?.start ?? conclusionStart;
          keyframes.push({ time: scene.start + 0.5, ...focus });
          keyframes.push({ time: nextStart, ...focus });
        });
        const lastFocus = layoutConfig.cameraFocus[layoutConfig.cameraFocus.length - 1] || layoutConfig.overview;
        keyframes.push({ time: conclusionStart + 0.2, ...lastFocus });
        keyframes.push({ time: conclusionStart + 1, ...layoutConfig.overview });
        keyframes.push({ time: input.durationSeconds, ...layoutConfig.overview });
        let currentIndex = 0;
        for (let index = 1; index < keyframes.length; index += 1) {
          if (time >= keyframes[index].time) currentIndex = index;
          else break;
        }
        const current = keyframes[currentIndex];
        const next = keyframes[Math.min(currentIndex + 1, keyframes.length - 1)];
        const p = current === next ? 1 : easeInOut((time - current.time) / (next.time - current.time));
        const scale = current.scale + (next.scale - current.scale) * p;
        const centerX = current.x + (next.x - current.x) * p;
        const centerY = current.y + (next.y - current.y) * p;
        return { scale, offsetX: W / 2 - centerX * scale, offsetY: H / 2 - centerY * scale };
      }
      const shots = isV4 ? [
        { start: 0, end: introEnd, x: 640, y: 145, scale: 1 },
        { start: step1Start, end: step2Start, x: 590, y: 410, scale: 1.08 },
        { start: step2Start, end: step3Start, x: 720, y: 420, scale: 1.08 },
        { start: step3Start, end: step4Start, x: 850, y: 430, scale: 1.08 },
        { start: step4Start, end: 15.5, x: 980, y: 440, scale: 1.08 },
        { start: 15.5, end: input.durationSeconds, x: 640, y: 360, scale: 0.82 }
      ] : [
        { start: 0, end: introEnd, x: 640, y: 145, scale: 1 },
        { start: step1Start, end: step2Start, x: 270, y: 255, scale: 1.06 },
        { start: step2Start, end: step3Start, x: 510, y: 300, scale: 1.06 },
        { start: step3Start, end: step4Start, x: 770, y: 350, scale: 1.06 },
        { start: step4Start, end: 15.5, x: 1010, y: 410, scale: 1.07 },
        { start: 15.5, end: input.durationSeconds, x: 640, y: 360, scale: 0.88 }
      ];
      const current = shots.find((shot) => time <= shot.end) || shots[shots.length - 1];
      const next = shots[Math.min(shots.indexOf(current) + 1, shots.length - 1)];
      const p = current === next ? 1 : easeInOut((time - current.start) / (current.end - current.start));
      const scale = current.scale + (next.scale - current.scale) * p;
      const centerX = current.x + (next.x - current.x) * p;
      const centerY = current.y + (next.y - current.y) * p;
      return { scale, offsetX: W / 2 - centerX * scale, offsetY: H / 2 - centerY * scale };
    }

    function drawCaption(time) {
      if (!isMotionVersion || !Array.isArray(input.captions) || input.captions.length === 0) return;
      const starts = useAnimationPlan
        ? planScenes.map((scene) => scene.start)
        : [0, 3.1, 6.6, 10.1, 13.4, isV8 ? 17.0 : 16.5];
      let index = starts.length - 1;
      for (let candidate = 0; candidate < starts.length; candidate += 1) {
        if (time < starts[candidate]) {
          index = Math.max(0, candidate - 1);
          break;
        }
      }
      const start = starts[index];
      const end = starts[index + 1] ?? input.durationSeconds;
      const entering = easeOut(clamp((time - start) / 0.3));
      const leavingEnd = isV7 && index === starts.length - 1
        ? (useAnimationPlan ? planScene('conclusion').end - 0.65 : (isV8 ? 19.35 : 19.05))
        : end;
      const leaving = easeInOut(clamp((leavingEnd - time) / 0.3));
      const alpha = Math.min(entering, leaving);
      const text = input.captions[index] || input.captions[input.captions.length - 1];
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = font(22, 600);
      const cardWidth = Math.min(960, Math.max(460, ctx.measureText(text).width + 120));
      const cardX = (W - cardWidth) / 2;
      const cardY = 620;
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowColor = colors.shadow;
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 7;
      ctx.fillStyle = '#FFFDF7';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, 58, 14);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      drawTape(cardX + 72, cardY - 3, 86, -0.08, alpha * 0.95);
      if (isV8) {
        drawRevealText(text, W / 2, cardY + 30, 22, colors.ink, 600, start + 0.03, 0.025, 0.16);
        if (isPencilDriven) {
          const penPoint = getTextPenPoint(text, W / 2, cardY + 30, 22, 600, start + 0.03, 0.025, 0.16);
          if (penPoint) drawPencilAtPoint(penPoint.x, penPoint.y, -0.55, alpha * 0.94, 0.82);
        }
      }
      else drawText(text, W / 2, cardY + 30, 22, colors.ink, 'center', 600);
      ctx.restore();
    }

    function draw(time) {
      timeForReveal = time;
      ctx.clearRect(0, 0, W, H);
      drawPaper();
      const overview = progress(time, 15.5, 2.2);
      const legacyZoom = 1 - overview * 0.15;
      const camera = isMotionVersion ? cameraAt(time) : {
        scale: legacyZoom,
        offsetX: (W - W * legacyZoom) / 2,
        offsetY: (H - H * legacyZoom) / 2
      };
      setAssetProgress(time, camera);
      setModuleTextProgress(time, camera);
      const titleOverview = isV9 && time >= planTimes.conclusionStart;
      setTitleWorldTransform(camera, titleOverview);
      setTitleProgress(time, isV9 && (time < planTimes.titleEnd || titleOverview), titleOverview);
      ctx.save();
      ctx.translate(camera.offsetX, camera.offsetY);
      ctx.scale(camera.scale, camera.scale);
      drawTitle(time);
      input.steps.forEach((step, index) => drawStep(step, index, time));
      drawFinalPath(time);
      drawConclusion(time);
      ctx.restore();
      drawCaption(time);
      const badgeAmount = progress(time, 0, 0.6);
      ctx.save();
      ctx.globalAlpha = badgeAmount * 0.9;
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.roundRect(W - 132, 14, 112, 22, 5);
      ctx.fill();
      drawText('CodeVideo Demo', W - 76, 25, 12, '#FFFFFF', 'center', 700);
      ctx.restore();
    }

    window.renderFrame = (time) => draw(time);
    window.renderFrame(0);
  </script>
</body>
</html>`;
}

async function launchPage(params, titleData, animationPlan, assetData) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  await page.setContent(buildHtml(params, titleData, animationPlan, assetData), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return { browser, page };
}

async function renderFrame(page, time, file) {
  await page.evaluate((frameTime) => window.renderFrame(frameTime), time);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({ path: file, type: "png" });
}

async function preview(params, outputDir, titleData, animationPlan, assetData) {
  await mkdir(outputDir, { recursive: true });
  const { browser, page } = await launchPage(params, titleData, animationPlan, assetData);
  try {
    const sceneTimes = animationPlan?.scenes?.flatMap((scene) => [scene.start, Math.min(scene.end - 0.05, scene.start + 2.3)]) || [];
    const times = [...new Set([0, 2, ...sceneTimes, Math.max(0, params.durationSeconds - 0.1)])]
      .filter((time) => time >= 0 && time <= params.durationSeconds)
      .sort((a, b) => a - b);
    const files = [];
    for (let index = 0; index < times.length; index += 1) {
      const file = path.join(outputDir, `frame-${String(index).padStart(4, "0")}.png`);
      await renderFrame(page, times[index], file);
      files.push({ time: times[index], file });
    }
    const report = { schema: "code-video-reference-style-preview/1", width: WIDTH, height: HEIGHT, fps: FPS, files };
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
      "-y", "-loglevel", "error",
      "-framerate", String(FPS),
      "-i", path.join(frameDir, "frame-%06d.png"),
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited with ${code}`)));
  });
}

async function render(params, output, titleData, animationPlan, assetData) {
  const frameDir = await fsMkdtemp("code-video-reference-style-");
  const { browser, page } = await launchPage(params, titleData, animationPlan, assetData);
  const totalFrames = Math.ceil(params.durationSeconds * FPS);
  try {
    for (let frame = 0; frame < totalFrames; frame += 1) {
      const file = path.join(frameDir, `frame-${String(frame).padStart(6, "0")}.png`);
      await renderFrame(page, frame / FPS, file);
      if (frame === 0 || (frame + 1) % FPS === 0) console.log(`render ${frame + 1}/${totalFrames}`);
    }
  } finally {
    await browser.close();
  }
  await runFfmpeg(frameDir, output);
  const { stdout } = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,width,height,nb_frames,r_frame_rate:format=duration", "-of", "json", output]);
  const report = {
    schema: "code-video-reference-style-render/1",
    output,
    sha256: createHash("sha256").update(await readFile(output)).digest("hex"),
    expected: { width: WIDTH, height: HEIGHT, fps: FPS, frames: totalFrames },
    ffprobe: JSON.parse(stdout)
  };
  await writeFile(`${output}.json`, `${JSON.stringify(report, null, 2)}\n`);
  await rm(frameDir, { recursive: true, force: true });
  return report;
}

async function fsMkdtemp(prefix) {
  const { mkdtemp } = await import("node:fs/promises");
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

const { input, mode, output, planInput } = parseArgs(process.argv.slice(2));
const params = JSON.parse(await readFile(input, "utf8"));
const animationPlan = planInput ? JSON.parse(await readFile(planInput, "utf8")) : null;
const assetData = {
  icons: JSON.parse(await readFile(new URL("../assets/icon-paths/icons.json", import.meta.url), "utf8")),
  connectors: JSON.parse(await readFile(new URL("../assets/icon-paths/connectors.json", import.meta.url), "utf8"))
};
const normalizedAssetData = {
  icons: assetData.icons.icons,
  connectors: assetData.connectors.connectors,
  defaultStyle: assetData.icons.defaultStyle
};
const titleData = await loadTitleData(animationPlan);
const result = mode === "--preview" ? await preview(params, output, titleData, animationPlan, normalizedAssetData) : await render(params, output, titleData, animationPlan, normalizedAssetData);
console.log(JSON.stringify({ ok: true, operation: mode.slice(2), ...result }, null, 2));
