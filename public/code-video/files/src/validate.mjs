import { readFile } from "node:fs/promises";

const lengthOf = (value) => [...String(value)].length;

export function validateParams(params) {
  const errors = [];

  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return { ok: false, errors: ["参数必须是 JSON 对象"] };
  }

  if (typeof params.title !== "string" || lengthOf(params.title) < 1 || lengthOf(params.title) > 28) {
    errors.push("title 必须是 1–28 个字符");
  }

  if (!Array.isArray(params.items) || params.items.length < 2 || params.items.length > 8) {
    errors.push("items 必须包含 2–8 个步骤");
  } else {
    params.items.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`items[${index}] 必须是对象`);
        return;
      }
      if (typeof item.label !== "string" || lengthOf(item.label) < 1 || lengthOf(item.label) > 12) {
        errors.push(`items[${index}].label 必须是 1–12 个字符`);
      }
      if (!Array.isArray(item.note) || item.note.length < 1 || item.note.length > 2) {
        errors.push(`items[${index}].note 必须包含 1–2 行`);
      } else if (item.note.some((line) => typeof line !== "string" || lengthOf(line) < 1 || lengthOf(line) > 18)) {
        errors.push(`items[${index}].note 每行必须是 1–18 个字符`);
      }
    });
  }

  if (!Array.isArray(params.conclusion) || params.conclusion.length < 1 || params.conclusion.length > 2) {
    errors.push("conclusion 必须包含 1–2 行");
  } else if (params.conclusion.some((line) => typeof line !== "string" || lengthOf(line) < 1 || lengthOf(line) > 20)) {
    errors.push("conclusion 每行必须是 1–20 个字符");
  }

  if (!Number.isFinite(params.durationSeconds) || params.durationSeconds < 10 || params.durationSeconds > 40) {
    errors.push("durationSeconds 必须在 10–40 秒之间");
  }

  const allowed = new Set(["title", "items", "conclusion", "durationSeconds"]);
  for (const key of Object.keys(params)) {
    if (!allowed.has(key)) errors.push(`不支持的参数：${key}`);
  }

  return { ok: errors.length === 0, errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv[2];
  if (!input) {
    console.error("用法：node src/validate.mjs <params.json>");
    process.exit(1);
  }
  const params = JSON.parse(await readFile(input, "utf8"));
  const result = validateParams(params);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}
