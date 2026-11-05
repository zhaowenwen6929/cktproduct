import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateParams } from "./validate.mjs";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("用法：node src/compose.mjs <request.txt> <params.json>");
  process.exit(1);
}

const text = await readFile(inputPath, "utf8");
const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const titleLine = lines.find((line) => /^标题[:：]/.test(line));
const conclusionLine = lines.find((line) => /^结论[:：]/.test(line));
const durationLine = lines.find((line) => /^时长[:：]/.test(line));
const items = lines
  .filter((line) => /^\d+[.、)]/.test(line))
  .map((line) => {
    const body = line.replace(/^\d+[.、)]\s*/, "");
    const [label, ...noteParts] = body.split(/[|｜]/);
    return {
      label: label.trim(),
      note: [noteParts.join("｜").trim() || label.trim()]
    };
  });

const params = {
  title: titleLine?.replace(/^标题[:：]\s*/, "").trim() ?? "",
  items,
  conclusion: conclusionLine ? [conclusionLine.replace(/^结论[:：]\s*/, "").trim()] : [],
  durationSeconds: Number(durationLine?.replace(/^时长[:：]\s*/, "").trim() ?? 12)
};

const result = validateParams(params);
if (!result.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(params, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, output: outputPath, params }, null, 2));
