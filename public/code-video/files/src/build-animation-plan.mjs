import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scriptFile = path.resolve(root, process.argv[2] || "examples/reference-style-script.json");
const outputFile = path.resolve(root, process.argv[3] || "out/reference-style-plan.json");
const contractFile = path.resolve(root, "template/knowledge-explainer-contract.json");

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function lengthOf(value) {
  return Array.from(value || "").length;
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function handwriteDuration(text, perCharacter, interval, tail = 0.12) {
  const characterCount = lengthOf(text);
  return round(perCharacter + Math.max(0, characterCount - 1) * interval + tail);
}

function addError(errors, message) {
  errors.push(message);
}

function checkRange(errors, value, range, label) {
  if (value < range.minimum || value > range.maximum) {
    addError(errors, `${label}长度应为 ${range.minimum}–${range.maximum}，当前为 ${value}`);
  }
}

function validateScript(script, contract, iconData, connectorData) {
  const errors = [];
  const warnings = [];
  const constraints = contract.constraints;
  const iconIds = new Set(iconData.icons.map((icon) => icon.id));
  const connectorIds = new Set(connectorData.connectors.map((connector) => connector.id));
  const scenes = script.scenes || [];
  const steps = scenes.filter((scene) => scene.kind === "step");
  const voiceSegments = script.voice?.segments || [];
  const voiceIds = new Set(voiceSegments.map((segment) => segment.id));

  if (script.templateId !== contract.templateId) addError(errors, "脚本模板与模板契约不一致");
  if (script.contractVersion !== contract.version) addError(errors, "脚本契约版本与模板契约不一致");
  checkRange(errors, script.durationSeconds, constraints.durationSeconds, "视频时长");
  checkRange(errors, steps.length, constraints.stepCount, "步骤数量");
  checkRange(errors, lengthOf(script.title), constraints.titleCharacters, "标题");
  checkRange(errors, lengthOf(script.subtitle), constraints.subtitleCharacters, "副标题");

  if (scenes.length === 0) addError(errors, "脚本至少需要一个场景");
  if (scenes[0]?.start !== 0) addError(errors, "第一个场景必须从 0 秒开始");

  scenes.forEach((scene, index) => {
    if (!(scene.end > scene.start)) addError(errors, `场景 ${scene.id} 的结束时间必须晚于开始时间`);
    if (scene.start < 0 || scene.end > script.durationSeconds) addError(errors, `场景 ${scene.id} 超出视频时长范围`);
    const next = scenes[index + 1];
    if (next && scene.end !== next.start) addError(errors, `场景 ${scene.id} 与 ${next.id} 之间存在时间空档或重叠`);
    if (!voiceIds.has(scene.voiceSegmentId)) addError(errors, `场景 ${scene.id} 引用了不存在的语音片段`);
    if (scene.kind === "step") {
      const content = scene.content || {};
      checkRange(errors, lengthOf(content.label), constraints.labelCharacters, `${scene.id} 标题`);
      checkRange(errors, lengthOf(content.note), constraints.noteCharacters, `${scene.id} 注释`);
      if (!iconIds.has(content.iconId)) addError(errors, `${scene.id} 引用了不存在的图标 ${content.iconId}`);
      if (content.connectorAssetId && !connectorIds.has(content.connectorAssetId)) addError(errors, `${scene.id} 引用了不存在的连接线 ${content.connectorAssetId}`);
      if (content.connectsFrom && !scenes.some((candidate) => candidate.id === content.connectsFrom)) addError(errors, `${scene.id} 的 connectsFrom 不存在`);
    }
    if (scene.kind === "conclusion" && scene.content?.connectorAssetId && !connectorIds.has(scene.content.connectorAssetId)) {
      addError(errors, `${scene.id} 引用了不存在的连接线 ${scene.content.connectorAssetId}`);
    }
  });

  voiceSegments.forEach((segment) => {
    if (!(segment.end > segment.start)) addError(errors, `语音片段 ${segment.id} 的结束时间必须晚于开始时间`);
    if (segment.start < 0 || segment.end > script.durationSeconds) addError(errors, `语音片段 ${segment.id} 超出视频时长范围`);
  });

  const plannedWords = lengthOf(voiceSegments.map((segment) => segment.text).join(""));
  if (script.timingStatus !== "final-audio") warnings.push("当前时间轴是脚本规划时间，拿到最终语音后需要重新校准片段时长");
  if (plannedWords > 120) warnings.push("语音文本较长，建议生成语音后检查实际语速");

  return { errors, warnings };
}

function createPlan(script, contract, validation) {
  const tracks = [
    { id: "background", kind: "visual", clips: [] },
    { id: "camera", kind: "camera", clips: [] },
    { id: "connectors", kind: "visual", clips: [] },
    { id: "icons", kind: "visual", clips: [] },
    { id: "handwriting", kind: "visual", clips: [] },
    { id: "notes", kind: "visual", clips: [] },
    { id: "captions", kind: "text", clips: [] },
    { id: "voice", kind: "audio", clips: [] }
  ];
  const trackMap = new Map(tracks.map((track) => [track.id, track]));
  const scenes = [];

  function addClip(trackId, clip) {
    trackMap.get(trackId).clips.push({ ...clip, start: round(clip.start), duration: round(clip.duration) });
  }

  script.scenes.forEach((scene) => {
    const duration = scene.end - scene.start;
    const scenePlan = {
      id: scene.id,
      kind: scene.kind,
      start: scene.start,
      end: scene.end,
      voiceSegmentId: scene.voiceSegmentId,
      clips: []
    };
    const addSceneClip = (trackId, clip) => {
      const normalized = { ...clip, sceneId: scene.id };
      scenePlan.clips.push({ trackId, ...normalized });
      addClip(trackId, normalized);
    };

    addSceneClip("voice", {
      id: `${scene.id}-voice`,
      type: "voiceSegment",
      start: scene.start,
      duration,
      segmentId: scene.voiceSegmentId,
      timingSource: "script"
    });
    addSceneClip("captions", {
      id: `${scene.id}-caption`,
      type: "caption",
      start: scene.start,
      duration,
      text: scene.caption,
      animation: { enter: "fade-up", exit: "fade-down" }
    });

    if (scene.kind === "intro") {
      addSceneClip("camera", {
        id: "camera-intro",
        type: "cameraHold",
        start: scene.start,
        duration,
        anchor: scene.layoutAnchor
      });
      addSceneClip("handwriting", {
        id: "title-handwrite",
        type: "handwriteText",
        start: 0.12,
        duration: 1.58,
        textBinding: "title",
        animation: { mode: "stroke-characters", perCharacter: 0.38, interval: 0.28, pen: "pencil" }
      });
      addSceneClip("handwriting", {
        id: "title-underline",
        type: "pathDraw",
        start: 1.62,
        duration: 0.92,
        assetId: "builtin:hand-underline",
        animation: { mode: "path-length", easing: "easeOutCubic", pen: "pencil" }
      });
      addSceneClip("handwriting", {
        id: "subtitle-handwrite",
        type: "handwriteText",
        start: 1.68,
        duration: 0.75,
        textBinding: "subtitle",
        emphasis: scene.content.emphasis,
        animation: { mode: "stroke-characters", perCharacter: 0.2, interval: 0.05, pen: "pencil" }
      });
    }

    if (scene.kind === "step") {
      const content = scene.content;
      const labelPerCharacter = 0.27;
      const labelInterval = 0.12;
      const labelStart = scene.start + 1.36;
      const labelDuration = handwriteDuration(content.label, labelPerCharacter, labelInterval, 0.16);
      const iconStart = labelStart + labelDuration + 0.18;
      const iconDuration = 0.95;
      const notePerCharacter = 0.18;
      const noteInterval = 0.055;
      const noteStart = iconStart + iconDuration + 0.15;
      const noteDuration = handwriteDuration(content.note, notePerCharacter, noteInterval, 0.14);
      addSceneClip("camera", {
        id: `${scene.id}-camera-pan`,
        type: "cameraPan",
        start: scene.start,
        duration: 0.65,
        targetAnchor: scene.layoutAnchor,
        easing: "easeInOutQuad"
      });
      addSceneClip("handwriting", {
        id: `${scene.id}-number`,
        type: "numberStamp",
        start: scene.start + 0.75,
        duration: 0.52,
        text: content.number,
        style: { alternatingFill: ["mint", "yellow"] }
      });
      addSceneClip("handwriting", {
        id: `${scene.id}-label`,
        type: "handwriteText",
        start: labelStart,
        duration: labelDuration,
        textBinding: `scenes.${scene.id}.content.label`,
        animation: { mode: "stroke-characters", perCharacter: labelPerCharacter, interval: labelInterval, pen: "pencil" }
      });
      if (content.connectorAssetId) {
        addSceneClip("connectors", {
          id: `${scene.id}-connector`,
          type: "connectorDraw",
          start: scene.start + 0.08,
          duration: 0.58,
          assetId: content.connectorAssetId,
          fromSceneId: content.connectsFrom,
          toSceneId: scene.id,
          animation: { mode: "ordered-paths", pen: "pencil" }
        });
      }
      addSceneClip("icons", {
        id: `${scene.id}-icon`,
        type: "pathDraw",
        start: iconStart,
        duration: iconDuration,
        assetId: content.iconId,
        animation: { mode: "ordered-paths", pen: "pencil" }
      });
      addSceneClip("notes", {
        id: `${scene.id}-note`,
        type: "noteReveal",
        start: noteStart,
        duration: noteDuration,
        textBinding: `scenes.${scene.id}.content.note`,
        animation: { mode: "clip-and-handwrite", perCharacter: notePerCharacter, interval: noteInterval, pen: "pencil" }
      });
    }

    if (scene.kind === "conclusion") {
      addSceneClip("camera", {
        id: "camera-overview",
        type: "cameraPan",
        start: scene.start + 0.2,
        duration: 0.9,
        targetAnchor: scene.layoutAnchor,
        easing: "easeInOutQuad"
      });
      addSceneClip("connectors", {
        id: "conclusion-guide",
        type: "connectorDraw",
        start: scene.start + 0.08,
        duration: 2.05,
        assetId: scene.content.connectorAssetId,
        animation: { mode: "ordered-paths", pen: "pencil" }
      });
      addSceneClip("notes", {
        id: "conclusion-note",
        type: "noteReveal",
        start: scene.start + 1.2,
        duration: handwriteDuration("讲得清楚，才是真的懂了。", 0.18, 0.055, 0.14),
        textBinding: "conclusion",
        animation: { mode: "clip-and-handwrite", perCharacter: 0.18, interval: 0.055, pen: "pencil" }
      });
    }
    scenes.push(scenePlan);
  });

  return {
    schema: "code-video-animation-plan/1",
    project: {
      id: script.id,
      templateId: script.templateId,
      contractVersion: script.contractVersion,
      renderer: "reference-style-v1"
    },
    timing: {
      durationSeconds: script.durationSeconds,
      fps: contract.fixed.canvas.fps,
      status: script.timingStatus,
      voiceIsAuthoritative: contract.fixed.timingRules.voiceIsAuthoritative
    },
    resources: {
      icons: script.scenes.filter((scene) => scene.kind === "step").map((scene) => scene.content.iconId),
      connectors: script.scenes.flatMap((scene) => {
        if (scene.kind === "step" && scene.content.connectorAssetId) return [scene.content.connectorAssetId];
        if (scene.kind === "conclusion" && scene.content.connectorAssetId) return [scene.content.connectorAssetId];
        return [];
      })
    },
    tracks,
    scenes,
    validation: {
      status: validation.errors.length === 0 ? "ok" : "error",
      errors: validation.errors,
      warnings: validation.warnings
    }
  };
}

const script = await readJson(scriptFile);
const contract = await readJson(contractFile);
const iconData = await readJson(path.resolve(root, contract.assetLibraries.icons));
const connectorData = await readJson(path.resolve(root, contract.assetLibraries.connectors));
const validation = validateScript(script, contract, iconData, connectorData);
const plan = createPlan(script, contract, validation);

await writeFile(outputFile, `${JSON.stringify(plan, null, 2)}\n`);
console.log(JSON.stringify({
  ok: validation.errors.length === 0,
  script: path.relative(root, scriptFile),
  output: path.relative(root, outputFile),
  scenes: script.scenes.length,
  tracks: plan.tracks.length,
  clips: plan.tracks.reduce((sum, track) => sum + track.clips.length, 0),
  errors: validation.errors,
  warnings: validation.warnings
}, null, 2));

if (validation.errors.length > 0) process.exitCode = 1;
