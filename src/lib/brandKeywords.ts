/**
 * 检测用户输入是否包含品牌相关意图，用于在对话流中自动插入品牌工具箱卡片。
 */
const BRAND_PATTERNS: RegExp[] = [
  /品牌/,
  /VI\b/i,
  /视觉识别/,
  /视觉规范/,
  /品牌规范/,
  /品牌色/,
  /品牌资产/,
  /品牌工具/,
  /色板/,
  /调性/,
  /Logo/i,
  /标识/,
  /字体规范/,
  /Kit\b/i,
];

export function shouldShowBrandToolkit(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return BRAND_PATTERNS.some((re) => re.test(t));
}
