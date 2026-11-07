import type { ReactNode } from 'react';
import type { VideoProjectLayer, VideoProjectManifest, VideoProjectScene } from './videoProjectManifest';

type MgAnimationOverlayProps = {
  manifest: VideoProjectManifest;
  currentTime: number;
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const easeInOut = (value: number) => {
  const safeValue = clamp(value);
  return safeValue < 0.5
    ? 2 * safeValue * safeValue
    : 1 - Math.pow(-2 * safeValue + 2, 2) / 2;
};

function sceneAmount(scene: VideoProjectScene, currentTime: number) {
  const enter = easeOut((currentTime - scene.start) / 0.55);
  const exit = easeInOut((scene.end - currentTime) / 0.55);
  return enter * exit;
}

function layerProgress(scene: VideoProjectScene, currentTime: number) {
  return clamp((currentTime - scene.start) / Math.max(scene.end - scene.start, 0.1));
}

function layerTransform(layer: VideoProjectLayer, progress: number, activeProgress: number) {
  const enter = layer.animation?.enter;
  const enterAmount = easeOut(progress / 0.22);
  const drift = Math.sin(activeProgress * Math.PI * 2) * 5;

  if (enter === 'slide_right') return `translate(${(-48 + enterAmount * 48).toFixed(2)} ${drift.toFixed(2)})`;
  if (enter === 'slide_up') return `translate(0 ${48 - enterAmount * 48 + drift})`;
  if (enter === 'scale_in') return `translate(0 ${drift.toFixed(2)}) scale(${(0.78 + enterAmount * 0.22).toFixed(3)})`;
  return `translate(0 ${drift.toFixed(2)})`;
}

function renderSeed(layer: VideoProjectLayer, transform: string, opacity: number, pulse: number) {
  return (
    <g key={layer.id} transform={`translate(390 690) ${transform}`} opacity={opacity}>
      <ellipse rx="76" ry="52" transform="rotate(-24)" fill="#6d432b" />
      <path d="M-36 9 C-6 -29 28 -28 52 3" fill="none" stroke="#e0ad55" strokeWidth="13" strokeLinecap="round" />
      <circle cx="0" cy="0" r={88 + pulse * 14} fill="none" stroke="#d6a85f" strokeWidth="3" opacity={0.35 - pulse * 0.12} />
    </g>
  );
}

function renderSteam(layer: VideoProjectLayer, transform: string, opacity: number, activeProgress: number) {
  const dash = 128 - easeOut((activeProgress * 1.8) % 1) * 128;
  return (
    <g key={layer.id} transform={`translate(1500 690) ${transform}`} opacity={opacity} fill="none" stroke="#fff8ed" strokeLinecap="round">
      <path d="M-30 100 C-86 36 28 34 -12 -44 C-36 -92 30 -115 12 -174" strokeWidth="11" strokeDasharray="128" strokeDashoffset={dash} />
      <path d="M58 112 C8 49 94 18 66 -42 C40 -96 106 -110 88 -166" strokeWidth="8" strokeDasharray="128" strokeDashoffset={128 - dash} opacity=".72" />
    </g>
  );
}

function renderTree(layer: VideoProjectLayer, transform: string, opacity: number, activeProgress: number) {
  const sway = Math.sin(activeProgress * Math.PI * 2) * 3;
  return (
    <g key={layer.id} transform={`translate(980 770) rotate(${sway}) ${transform}`} opacity={opacity}>
      <path d="M0 280 C-18 180 16 90 0 0" fill="none" stroke="#5b3825" strokeWidth="26" strokeLinecap="round" />
      <path d="M0 110 C-86 60 -126 4 -154 -70 M0 92 C82 36 126 -16 154 -82" fill="none" stroke="#6e8b57" strokeWidth="18" strokeLinecap="round" />
      <circle cx="-168" cy="-90" r="62" fill="#6e8b57" />
      <circle cx="152" cy="-102" r="70" fill="#7b9b61" />
      <circle cx="20" cy="-22" r="72" fill="#6e8b57" />
    </g>
  );
}

function renderCherries(layer: VideoProjectLayer, transform: string, opacity: number, activeProgress: number) {
  const bounce = Math.abs(Math.sin(activeProgress * Math.PI * 3)) * 18;
  return (
    <g key={layer.id} transform={`translate(960 515) ${transform}`} opacity={opacity}>
      {[[-120, 65, 38], [0, -15, 48], [124, 62, 36]].map(([x, y, radius], index) => (
        <g key={index} transform={`translate(${x} ${y - (index === 1 ? bounce : bounce * 0.45)})`}>
          <circle r={radius} fill="#a94c35" />
          <path d={`M0 ${-radius + 4} C${index % 2 ? 18 : -18} ${-radius - 74} ${index % 2 ? 50 : -50} ${-radius - 98} ${index % 2 ? 74 : -74} ${-radius - 110}`} fill="none" stroke="#6e8b57" strokeWidth="12" strokeLinecap="round" />
          <circle cx={-radius * 0.28} cy={-radius * 0.28} r={radius * 0.2} fill="#f8c7a8" opacity=".7" />
        </g>
      ))}
    </g>
  );
}

function renderProcessing(layer: VideoProjectLayer, transform: string, opacity: number, activeProgress: number) {
  const sweep = easeInOut((activeProgress * 1.25) % 1) * 250 - 125;
  const stages: Array<[number, number, string]> = [[-130, 0, '#a94c35'], [0, 0, '#d6a85f'], [130, 0, '#5b3825']];
  return (
    <g key={layer.id} transform={`translate(960 610) ${transform}`} opacity={opacity}>
      <rect x="-230" y="-145" width="460" height="290" rx="28" fill="#f5ebdd" stroke="#5b3825" strokeWidth="10" />
      {stages.map(([x, y, fill], index) => (
        <g key={index} transform={`translate(${x} ${y})`}>
          <circle r="43" fill={fill} />
          <path d="M-24 -48 L-66 -98 M24 -48 L66 -98" stroke="#6e8b57" strokeWidth="11" strokeLinecap="round" />
          {index < 2 && <path d="M48 0 H82" stroke="#6e8b57" strokeWidth="8" strokeLinecap="round" />}
        </g>
      ))}
      <path d={`M${sweep} -125 V125`} stroke="#fff" strokeWidth="18" opacity=".6" />
    </g>
  );
}

function renderRoast(layer: VideoProjectLayer, transform: string, opacity: number, activeProgress: number) {
  const glow = 0.45 + Math.abs(Math.sin(activeProgress * Math.PI * 2)) * 0.45;
  return (
    <g key={layer.id} transform={`translate(960 610) ${transform}`} opacity={opacity}>
      <circle r="170" fill="#d6a85f" opacity={glow * 0.25} />
      {[[-112, 30, 0.82], [0, -42, 1], [112, 32, 0.88]].map(([x, y, scale], index) => (
        <g key={index} transform={`translate(${x} ${y}) scale(${scale}) rotate(${index * 18 - 18})`}>
          <ellipse rx="52" ry="82" fill={index === 1 ? '#5b3825' : '#865331'} />
          <path d="M0 -57 C-24 -16 -24 20 0 58" fill="none" stroke="#d6a85f" strokeWidth="9" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

function renderGrind(layer: VideoProjectLayer, transform: string, opacity: number, activeProgress: number) {
  const rotation = activeProgress * 180;
  return (
    <g key={layer.id} transform={`translate(960 600) rotate(${rotation}) ${transform}`} opacity={opacity}>
      <circle r="112" fill="#f5ebdd" stroke="#5b3825" strokeWidth="12" />
      <circle r="52" fill="#6e8b57" />
      <path d="M-170 0 H170 M0 -170 V170" stroke="#d6a85f" strokeWidth="8" strokeLinecap="round" />
      {[[-230, -42], [230, 50], [-92, 210], [92, -208]].map(([x, y], index) => <circle key={index} cx={x} cy={y} r={12 + (index % 2) * 5} fill="#5b3825" />)}
    </g>
  );
}

function renderPour(layer: VideoProjectLayer, transform: string, opacity: number, activeProgress: number) {
  const streamProgress = easeOut((activeProgress * 1.4) % 1);
  return (
    <g key={layer.id} transform={`translate(960 260) ${transform}`} opacity={opacity}>
      <path d="M-180 -20 C-60 20 40 20 158 -20" fill="none" stroke="#5b3825" strokeWidth="18" strokeLinecap="round" />
      <path d="M158 -20 L205 30" fill="none" stroke="#5b3825" strokeWidth="18" strokeLinecap="round" />
      <path d="M205 34 C198 132 210 232 192 330" fill="none" stroke="#8bc5dc" strokeWidth="13" strokeLinecap="round" strokeDasharray="330" strokeDashoffset={330 - streamProgress * 330} />
      <circle cx="192" cy="330" r={14 + streamProgress * 8} fill="#8bc5dc" opacity=".8" />
    </g>
  );
}

function renderCup(layer: VideoProjectLayer, transform: string, opacity: number, activeProgress: number) {
  const pulse = 1 + Math.sin(activeProgress * Math.PI * 2) * 0.05;
  return (
    <g key={layer.id} transform={`translate(1500 730) scale(${pulse}) ${transform}`} opacity={opacity}>
      <rect x="-150" y="-110" width="250" height="190" rx="28" fill="#fff" stroke="#5b3825" strokeWidth="12" />
      <path d="M100 -56 C250 -58 250 72 100 62" fill="none" stroke="#5b3825" strokeWidth="12" />
      <path d="M-110 -54 H60" stroke="#5b3825" strokeWidth="16" strokeLinecap="round" />
      <circle cx="-30" cy="-15" r="180" fill="none" stroke="#d6a85f" strokeWidth="5" opacity=".28" />
    </g>
  );
}

function renderLayer(layer: VideoProjectLayer, scene: VideoProjectScene, currentTime: number): ReactNode {
  const localProgress = layerProgress(scene, currentTime);
  const activeProgress = clamp((currentTime - scene.start - 0.55) / Math.max(scene.end - scene.start - 0.55, 0.1));
  const opacity = sceneAmount(scene, currentTime);
  const transform = layerTransform(layer, localProgress, activeProgress);
  const pulse = Math.abs(Math.sin(activeProgress * Math.PI * 2));

  if (layer.role === 'coffee_seed') return renderSeed(layer, transform, opacity, pulse);
  if (layer.role === 'coffee_steam') return renderSteam(layer, transform, opacity, activeProgress);
  if (layer.role === 'coffee_tree') return renderTree(layer, transform, opacity, activeProgress);
  if (layer.role === 'coffee_cherry') return renderCherries(layer, transform, opacity, activeProgress);
  if (layer.role === 'coffee_processing') return renderProcessing(layer, transform, opacity, activeProgress);
  if (layer.role === 'coffee_roast') return renderRoast(layer, transform, opacity, activeProgress);
  if (layer.role === 'coffee_grind') return renderGrind(layer, transform, opacity, activeProgress);
  if (layer.role === 'coffee_pour') return renderPour(layer, transform, opacity, activeProgress);
  if (layer.role === 'coffee_cup') return renderCup(layer, transform, opacity, activeProgress);
  return null;
}

export function MgAnimationOverlay({ manifest, currentTime }: MgAnimationOverlayProps) {
  const activeScenes = manifest.scenes.filter((scene) => currentTime >= scene.start - 0.55 && currentTime <= scene.end + 0.2);
  if (activeScenes.length === 0) return null;

  return (
    <svg
      className="ai-video-editor-mg-overlay"
      viewBox={`0 0 ${manifest.project.width} ${manifest.project.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label="MG 动画实时图层"
    >
      {activeScenes.flatMap((scene) => scene.layers.map((layer) => renderLayer(layer, scene, currentTime)))}
    </svg>
  );
}
