import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptFile = path.resolve(process.cwd(), process.argv[2] || "examples/reference-style-script.json");
const outputFile = path.resolve(process.cwd(), process.argv[3] || "out/reference-style-demo-narration-v12.m4a");
const voice = process.argv[4] || "Tingting";
const rate = Number(process.argv[5] || 190);

async function durationOf(file) {
  const { stdout } = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file]);
  return Number(stdout.trim());
}

function tempoFilter(speed) {
  const filters = [];
  let remaining = speed;
  while (remaining > 2) {
    filters.push("atempo=2");
    remaining /= 2;
  }
  while (remaining < 0.5) {
    filters.push("atempo=0.5");
    remaining /= 0.5;
  }
  filters.push(`atempo=${remaining}`);
  return filters.join(",");
}

const script = JSON.parse(await readFile(scriptFile, "utf8"));
const tempDir = await mkdtemp(path.join(os.tmpdir(), "code-video-narration-"));
const segmentFiles = [];
const segmentReports = [];

try {
  for (let index = 0; index < script.voice.segments.length; index += 1) {
    const segment = script.voice.segments[index];
    const targetDuration = segment.end - segment.start;
    const rawFile = path.join(tempDir, `raw-${String(index).padStart(2, "0")}.aiff`);
    const normalizedFile = path.join(tempDir, `segment-${String(index).padStart(2, "0")}.wav`);
    await execFileAsync("say", ["-v", voice, "-r", String(rate), "-o", rawFile, segment.text]);
    const rawDuration = await durationOf(rawFile);
    const speed = rawDuration > targetDuration ? rawDuration / targetDuration : 1;
    await execFileAsync("ffmpeg", [
      "-y", "-loglevel", "error", "-i", rawFile,
      "-filter:a", `${tempoFilter(speed)},afade=t=in:st=0:d=0.025,afade=t=out:st=${Math.max(0, targetDuration - 0.04)}:d=0.04,apad,atrim=duration=${targetDuration}`,
      "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", normalizedFile,
    ]);
    segmentFiles.push(normalizedFile);
    segmentReports.push({ id: segment.id, start: segment.start, end: segment.end, targetDuration, rawDuration, speed });
  }

  const concatFile = path.join(tempDir, "concat.txt");
  await writeFile(concatFile, `${segmentFiles.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join("\n")}\n`);
  const fullWav = path.join(tempDir, "full.wav");
  await execFileAsync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", concatFile, "-c:a", "pcm_s16le", fullWav]);
  await execFileAsync("ffmpeg", ["-y", "-loglevel", "error", "-i", fullWav, "-af", "loudnorm=I=-17:TP=-1.5:LRA=5", "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "160k", outputFile]);
  const outputDuration = await durationOf(outputFile);
  await writeFile(`${outputFile}.json`, `${JSON.stringify({ schema: "code-video-narration/2", output: outputFile, script: scriptFile, voice, rate, duration: outputDuration, segments: segmentReports }, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, output: outputFile, voice, rate, duration: outputDuration, segments: segmentReports }, null, 2));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
