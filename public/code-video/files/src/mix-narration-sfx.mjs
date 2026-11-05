import { createHash } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const [videoInput, narrationInput, output] = process.argv.slice(2);

if (!videoInput || !narrationInput || !output) {
  throw new Error("用法：node src/mix-narration-sfx.mjs <video.mp4> <narration.m4a> <output.mp4>");
}

const { stdout: videoDurationOutput } = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", videoInput]);
const videoDuration = Number(videoDurationOutput.trim());
const effects = [0.14, 0.32, 0.5, 0.69, 0.89].map((ratio) => Math.round(videoDuration * ratio * 1000));
const inputs = [
  "-y", "-loglevel", "error",
  "-i", videoInput,
  "-i", narrationInput,
];
for (let index = 0; index < effects.length; index += 1) {
  inputs.push("-f", "lavfi", "-t", "0.18", "-i", "anoisesrc=color=pink:sample_rate=48000:duration=0.18");
}

const filterParts = [
  `[1:a]aresample=48000,aformat=channel_layouts=stereo,apad=pad_dur=${videoDuration},atrim=duration=${videoDuration},volume=0.95[narr]`,
];
effects.forEach((delay, index) => {
  filterParts.push(`[${index + 2}:a]highpass=f=900,lowpass=f=4800,afade=t=in:st=0:d=0.015,afade=t=out:st=0.07:d=0.11,volume=0.16,adelay=${delay}|${delay}[s${index}]`);
});
filterParts.push(`[narr]${effects.map((_, index) => `[s${index}]`).join("")}amix=inputs=${effects.length + 1}:duration=first:dropout_transition=0,loudnorm=I=-17:TP=-1.5:LRA=4[a]`);

await new Promise((resolve, reject) => {
  const child = spawn("ffmpeg", [
    ...inputs,
    "-filter_complex", filterParts.join(";"),
    "-map", "0:v:0",
    "-map", "[a]",
    "-c:v", "copy",
    "-c:a", "aac",
    "-ar", "48000",
    "-ac", "2",
    "-b:a", "160k",
    "-t", String(videoDuration),
    "-movflags", "+faststart",
    output,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (data) => { stderr += data.toString(); });
  child.on("error", reject);
  child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited with ${code}`)));
});

const { stdout } = await execFileAsync("ffprobe", [
  "-v", "error",
  "-show_entries", "stream=index,codec_type,codec_name,width,height,nb_frames,r_frame_rate,sample_rate,channels:format=duration",
  "-of", "json",
  output,
]);
const report = {
  schema: "code-video-narration-sfx-mix/1",
  output,
  sourceVideo: videoInput,
  sourceNarration: narrationInput,
  effects,
  sha256: createHash("sha256").update(await readFile(output)).digest("hex"),
  ffprobe: JSON.parse(stdout),
};
await writeFile(`${output}.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, output, duration: report.ffprobe.format.duration, streams: report.ffprobe.streams }, null, 2));
