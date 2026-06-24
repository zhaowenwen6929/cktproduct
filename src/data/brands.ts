import type { BrandGroup } from '../types';

export const BRAND_GROUPS: BrandGroup[] = [
  {
    id: 'brand-1',
    name: 'Seedream Global',
    colors: ['#5c5cfc', '#000000', '#ffffff'],
    description: '官方品牌视觉规范',
    logos: [
      { label: 'Primary Logo' },
      { label: 'Symbol' },
      { label: 'Wordmark' },
    ],
    palettes: [
      {
        label: '来自主 logo 的颜色',
        colors: ['#6B4423', '#5C7A3D', '#1E5C5C', '#7B4CB8'],
      },
      {
        label: '花瓣轻舞',
        colors: ['#D4E8A8', '#F5C4A8', '#E8A8C8', '#5CD4E8', '#1A1A1A'],
      },
    ],
    fonts: [
      { family: '思源黑体', styles: ['Normal', 'Regular', 'Light', 'Medium', 'Heavy', 'Bold', 'ExtraLight'] },
      { family: '思源宋体', styles: ['Normal', 'Regular', 'Heavy'] },
    ],
    toneTags: ['品牌调性', '轻松的', '轻盈而有质感', '友好的', '克制的', '理性', '温暖'],
    toneBlocks: [
      {
        title: '人称代词',
        items: ['“我们”（更具参与感）', '“你”（联结感强）'],
      },
      {
        title: '典型（不夸张/不教条）',
        items: ['清爽、轻量', '留白与秩序', '友好但不幼稚', '专业且不过度术语'],
      },
      {
        title: '语气与表达',
        items: ['简洁直接，控制句长', '适度使用动词，避免冗余', '遇到复杂信息用分段/要点化'],
      },
    ],
    illustrations: [
      { label: '插画风格 1', caption: '几何抽象、低饱和、留白' },
      { label: '插画风格 2', caption: '扁平渐变、轻量阴影' },
      { label: '插画风格 3', caption: '线性插画、细线条' },
      { label: '插画风格 4', caption: '3D 轻量、柔和材质' },
    ],
    spokespersons: [
      { label: '代言人素材 1', caption: '形象与使用范围' },
      { label: '代言人素材 2', caption: '姿态与表情规范' },
    ],
  },
  {
    id: 'brand-2',
    name: 'Coffee Cat',
    colors: ['#8b4513', '#f5deb3', '#ffffff'],
    description: '咖啡猫系列周边品牌',
    logos: [
      { label: 'Primary Logo' },
      { label: 'Symbol' },
      { label: 'Wordmark' },
    ],
    palettes: [
      { label: '主色', colors: ['#8b4513', '#f5deb3', '#ffffff', '#3d2914'] },
      { label: '辅助', colors: ['#d4a574', '#fff8f0', '#2c1810'] },
    ],
    fonts: [
      { family: 'Noto Sans', styles: ['Regular', 'Medium', 'Bold'] },
      { family: 'Noto Serif', styles: ['Regular', 'SemiBold'] },
    ],
    toneTags: ['温暖', '手作感', '轻松', '带一点俏皮'],
    toneBlocks: [
      { title: '关键词', items: ['奶油感', '香气', '慢生活', '治愈'] },
      { title: '表达方式', items: ['多用感官词', '句子短、轻快', '避免过度营销口吻'] },
    ],
    illustrations: [{ label: '插画风格', caption: '手绘线稿 + 纸张纹理' }],
    spokespersons: [{ label: 'IP 角色', caption: '咖啡猫表情包与姿态' }],
  },
  {
    id: 'brand-3',
    name: 'TechFlow',
    colors: ['#00d2ff', '#3a7bd5', '#ffffff'],
    description: '科技流体设计规范',
    logos: [
      { label: 'Primary Logo' },
      { label: 'Symbol' },
      { label: 'Wordmark' },
    ],
    palettes: [
      { label: '科技主色', colors: ['#00d2ff', '#3a7bd5', '#0a1628', '#ffffff'] },
      { label: '渐变辅色', colors: ['#5ee7df', '#4facfe', '#1e3a5f'] },
    ],
    fonts: [
      { family: 'Inter', styles: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
      { family: 'JetBrains Mono', styles: ['Regular', 'Medium'] },
    ],
    toneTags: ['科技感', '理性', '速度', '清晰', '可信赖'],
    toneBlocks: [
      { title: '表达方式', items: ['少形容词、多事实', '结构化输出（标题/要点/结论）', '强调可验证与可执行'] },
    ],
    illustrations: [{ label: '插画风格', caption: '流体渐变、粒子、光效' }],
    spokespersons: [{ label: '代言人', caption: '偏专业/工程师画像' }],
  },
];
