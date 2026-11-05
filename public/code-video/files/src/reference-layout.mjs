const WIDTH = 1280;
const HEIGHT = 720;
export const MAX_STEP_COUNT = 8;

const POSITION_PRESETS = {
  2: [
    { x: 170, y: 230 },
    { x: 780, y: 330 },
  ],
  3: [
    { x: 100, y: 190 },
    { x: 500, y: 270 },
    { x: 880, y: 380 },
  ],
  4: [
    { x: 60, y: 230 },
    { x: 440, y: 300 },
    { x: 800, y: 360 },
    { x: 1120, y: 550 },
  ],
};

const ICON_DIMENSIONS = {
  bulb: { halfWidth: 84, halfHeight: 70 },
  chat: { halfWidth: 48, halfHeight: 58 },
  book: { halfWidth: 50, halfHeight: 54 },
  spiral: { halfWidth: 82, halfHeight: 55 },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapText(value, maxCharacters = 9) {
  const sourceLines = String(value || "").split(/\r?\n/);
  return sourceLines.flatMap((line) => {
    const characters = Array.from(line);
    const lines = [];
    for (let index = 0; index < characters.length; index += maxCharacters) {
      lines.push(characters.slice(index, index + maxCharacters).join(""));
    }
    return lines.length > 0 ? lines : [""];
  });
}

function columnPositions(count) {
  if (count === 1) return [640];
  if (count === 2) return [170, 780];
  if (count === 3) return [100, 500, 880];
  return [70, 370, 670, 970];
}

function snakePositions(stepCount) {
  const rowCount = Math.ceil(stepCount / 4);
  const baseCount = Math.floor(stepCount / rowCount);
  const extraCount = stepCount % rowCount;
  const positions = [];
  for (let row = 0; row < rowCount; row += 1) {
    const count = baseCount + (row < extraCount ? 1 : 0);
    const rowPositions = columnPositions(count).map((x) => ({ x, y: row === 0 ? 190 : 420 }));
    positions.push(...(row % 2 === 0 ? rowPositions : rowPositions.reverse()));
  }
  return positions;
}

function iconBounds(position, iconId) {
  const dimensions = ICON_DIMENSIONS[iconId] || { halfWidth: 58, halfHeight: 58 };
  return {
    x: position.x + 24 - dimensions.halfWidth,
    y: position.y + 85 - dimensions.halfHeight,
    width: dimensions.halfWidth * 2,
    height: dimensions.halfHeight * 2,
  };
}

function createNoteLayout(position, lines, step) {
  const multiline = lines.length > 1;
  const width = 190;
  const height = multiline ? 88 : 62;
  const icon = iconBounds(position, step?.icon);
  const isRightEdge = position.x > 900;
  const cardX = isRightEdge
    ? position.x - width - 60
    : Math.max(position.x + 66, icon.x + icon.width + 24);
  const cardY = position.y + (multiline ? 112 : 61);
  const safeCardX = clamp(cardX, 22, WIDTH - width - 22);
  const safeCardY = clamp(cardY, 64, HEIGHT - height - 48);
  return {
    cardX: safeCardX,
    cardY: safeCardY,
    originX: safeCardX + 6,
    originY: safeCardY + (multiline ? 44 : 29),
    width,
    height,
    top: -(multiline ? 44 : 29),
    textX: safeCardX + 16,
    textY: safeCardY + (multiline ? 28 : 30),
    lineGap: 24,
    lines,
  };
}

function cameraFocus(position) {
  let offsetX = 80;
  if (position.x < 250) offsetX = 340;
  else if (position.x < 600) offsetX = 320;
  else if (position.x < 850) offsetX = 270;
  return {
    x: clamp(position.x + offsetX, 260, 1050),
    y: clamp(position.y + 120, 270, 500),
    scale: 1.1,
  };
}

function connectorAssetForStep(index, positions) {
  if (index === 0) return null;
  const previous = positions[index - 1];
  const current = positions[index];
  const deltaY = current.y - previous.y;
  return Math.abs(deltaY) > 140 ? "elbow-arrow" : "curve-arrow";
}

export function createReferenceLayout(params = {}) {
  const steps = Array.isArray(params.steps) ? params.steps : [];
  if (steps.length > MAX_STEP_COUNT) throw new Error(`步骤数量最多为 ${MAX_STEP_COUNT} 个，请拆分视频`);
  const stepCount = clamp(steps.length || 4, 2, MAX_STEP_COUNT);
  const positions = (POSITION_PRESETS[stepCount] || snakePositions(stepCount)).map((position) => ({ ...position }));
  const isLargeStyle = Number(params.durationSeconds) > 20;
  const labelSize = isLargeStyle ? 32 : 26;
  const layoutSteps = steps.slice(0, stepCount);
  const noteLayouts = layoutSteps.map((step, index) => {
    const lines = isLargeStyle ? wrapText(step?.note || "") : [step?.note || ""];
    return createNoteLayout(positions[index], lines, step);
  });

  return {
    schema: "code-video-reference-layout/1",
    stepCount,
    isLargeStyle,
    labelSize,
    positions,
    noteLayouts,
    connectorAssets: positions.map((_, index) => connectorAssetForStep(index, positions)),
    cameraFocus: positions.map(cameraFocus),
    overview: { x: WIDTH / 2, y: HEIGHT / 2, scale: 0.82 },
  };
}
