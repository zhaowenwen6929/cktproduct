import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Code2,
  Download,
  FileAudio,
  FileText,
  FileJson2,
  FolderOpen,
  Image as ImageIcon,
  Layers3,
  Play,
  RefreshCw,
  Sparkles,
  Video,
  WandSparkles,
  X,
} from 'lucide-react';

type CodeVideoPageProps = {
  onBackToDirectory: () => void;
};

const sampleParams = {
  title: '多智能体 Agent 的三个步骤',
  items: [
    { label: '理解需求', note: ['明确目标和边界'] },
    { label: '拆分任务', note: ['分配给合适的子 Agent'] },
    { label: '汇总结果', note: ['统一检查并输出'] },
  ],
  conclusion: ['让复杂任务变得可执行'],
  durationSeconds: 12,
};

const scenes = [
  { time: '00:00', title: '标题入场', description: '标题与手绘下划线出现' },
  { time: '00:01', title: '步骤留页', description: '三个步骤按顺序进入画面' },
  { time: '00:08', title: '结论收束', description: '回到全局并展示结论' },
];

const referenceStyleScenes = [
  { time: '00:00', title: '手写标题', description: '铅笔跟随标题和下划线进入画面' },
  { time: '00:03', title: '步骤展开', description: '编号、箭头、图标和便签分层出现' },
  { time: '00:13', title: '全局收束', description: '四个步骤完成后镜头拉远' },
  { time: '00:17', title: '结论贴纸', description: '黄色便签和底部结论完成收尾' },
];

const referenceStyleV14Scenes = [
  { time: '00:00', title: '手写标题', description: '铅笔跟随标题和下划线进入画面' },
  { time: '00:04', title: '逐步展开', description: '标题写完后，再按编号、连线、图标、便签顺序出现' },
  { time: '00:14', title: '模块接力', description: '连接线只连接主模块标题，笔尖保持稳定朝向' },
  { time: '00:24', title: '结论收束', description: '自然语速旁白结束，镜头回到全局' },
];

const demoVariants = {
  referenceV14: {
    label: '参考风格 Demo v1.4',
    meta: '1280×720 · 60 fps · 27.4 秒 · 自然语速 + 完整笔画 + 稳定笔尖',
    src: '/code-video/reference-style-demo-v14-voice.mp4',
    poster: '/code-video/reference-style-demo-v14-poster.png',
  },
  referenceV13: {
    label: '参考风格 Demo v1.3',
    meta: '1280×720 · 60 fps · 20 秒 · 模块汉字笔画 + 安全连线 + 普通话旁白',
    src: '/code-video/reference-style-demo-v13-voice.mp4',
    poster: '/code-video/reference-style-demo-v13-poster.png',
  },
  referenceV12: {
    label: '参考风格 Demo v1.2',
    meta: '1280×720 · 60 fps · 20 秒 · 分段普通话旁白 + SVG 路径',
    src: '/code-video/reference-style-demo-v12-voice.mp4',
    poster: '/code-video/reference-style-demo-v12-poster.png',
  },
  referenceV11: {
    label: '参考风格 Demo v1.1',
    meta: '1280×720 · 60 fps · 20 秒 · SVG 图标/连接线 + 脚本计划驱动',
    src: '/code-video/reference-style-demo-v11-voice.mp4',
    poster: '/code-video/reference-style-demo-v11-poster.png',
  },
  referenceV10: {
    label: '参考风格 Demo v1.0',
    meta: '1280×720 · 60 fps · 20 秒 · 真实笔画标题 + 笔尖跟随',
    src: '/code-video/reference-style-demo-v10-voice.mp4',
    poster: '/code-video/reference-style-demo-v10-poster.png',
  },
  basic: {
    label: '基础参数 Demo',
    meta: '1920×1080 · 30 fps · 12 秒',
    src: '/code-video/demo.mp4',
    poster: '/code-video/preview.png',
  },
  reference: {
    label: '参考风格 Demo v0.2',
    meta: '1280×720 · 60 fps · 20 秒 · 含中文讲解',
    src: '/code-video/reference-style-demo-voice.mp4',
    poster: '/code-video/reference-style-demo-poster.png',
  },
  referenceV3: {
    label: '参考风格 Demo v0.3',
    meta: '1280×720 · 60 fps · 20 秒 · 双声道旁白 + 动作音效',
    src: '/code-video/reference-style-demo-v3-voice.mp4',
    poster: '/code-video/reference-style-demo-v3-poster.png',
  },
  referenceV4: {
    label: '参考风格 Demo v0.4',
    meta: '1280×720 · 60 fps · 20 秒 · 逐字书写 + 左上拽动',
    src: '/code-video/reference-style-demo-v4-voice.mp4',
    poster: '/code-video/reference-style-demo-v4-poster.png',
  },
  referenceV5: {
    label: '参考风格 Demo v0.5',
    meta: '1280×720 · 60 fps · 20 秒 · 手绘细节打磨版',
    src: '/code-video/reference-style-demo-v5-voice.mp4',
    poster: '/code-video/reference-style-demo-v5-poster.png',
  },
  referenceV6: {
    label: '参考风格 Demo v0.6',
    meta: '1280×720 · 60 fps · 20 秒 · 笔画路径 + 线条纹理',
    src: '/code-video/reference-style-demo-v6-voice.mp4',
    poster: '/code-video/reference-style-demo-v6-poster.png',
  },
  referenceV7: {
    label: '参考风格 Demo v0.7',
    meta: '1280×720 · 60 fps · 20 秒 · 毛笔标题 + 收口镜头',
    src: '/code-video/reference-style-demo-v7-voice.mp4',
    poster: '/code-video/reference-style-demo-v7-poster.png',
  },
  referenceV8: {
    label: '参考风格 Demo v0.8',
    meta: '1280×720 · 60 fps · 20 秒 · 分镜校正 + 逐元素绘制',
    src: '/code-video/reference-style-demo-v8-voice.mp4',
    poster: '/code-video/reference-style-demo-v8-poster.png',
  },
  referenceV9: {
    label: '参考风格 Demo v0.9',
    meta: '1280×720 · 60 fps · 20 秒 · 笔尖驱动路径绘制',
    src: '/code-video/reference-style-demo-v9-voice.mp4',
    poster: '/code-video/reference-style-demo-v9-poster.png',
  },
} as const;

type CodeVideoFileKind = 'text' | 'image' | 'video' | 'audio' | 'binary';

type CodeVideoFile = {
  path: string;
  name: string;
  kind: CodeVideoFileKind;
  size: string;
  url: string;
};

const codeVideoFileGroups: Array<{ directory: string; files: CodeVideoFile[] }> = [
  {
    directory: 'template',
    files: [
      { path: 'template/motion.json', name: 'motion.json', kind: 'text', size: '642 B', url: '/code-video/files/template/motion.json' },
      { path: 'template/params.schema.json', name: 'params.schema.json', kind: 'text', size: '1.3 KB', url: '/code-video/files/template/params.schema.json' },
      { path: 'template/guide.md', name: 'guide.md', kind: 'text', size: '682 B', url: '/code-video/files/template/guide.md' },
      { path: 'template/knowledge-explainer-contract.json', name: 'knowledge-explainer-contract.json', kind: 'text', size: '3.1 KB', url: '/code-video/files/template/knowledge-explainer-contract.json' },
    ],
  },
  {
    directory: 'assets',
    files: [
      { path: 'assets/MaShanZheng-subset.ttf', name: 'MaShanZheng-subset.ttf', kind: 'binary', size: '40 KB', url: '/code-video/files/assets/MaShanZheng-subset.ttf' },
      { path: 'assets/hanzi-writer-data/费.json', name: '费.json', kind: 'text', size: '3.6 KB', url: '/code-video/files/assets/hanzi-writer-data/费.json' },
      { path: 'assets/hanzi-writer-data/曼.json', name: '曼.json', kind: 'text', size: '3.3 KB', url: '/code-video/files/assets/hanzi-writer-data/曼.json' },
      { path: 'assets/hanzi-writer-data/学.json', name: '学.json', kind: 'text', size: '2.3 KB', url: '/code-video/files/assets/hanzi-writer-data/学.json' },
      { path: 'assets/hanzi-writer-data/习.json', name: '习.json', kind: 'text', size: '1.0 KB', url: '/code-video/files/assets/hanzi-writer-data/习.json' },
      { path: 'assets/hanzi-writer-data/法.json', name: '法.json', kind: 'text', size: '2.1 KB', url: '/code-video/files/assets/hanzi-writer-data/法.json' },
      { path: 'assets/hanzi-writer-data/module-text.json', name: 'module-text.json', kind: 'text', size: '150 KB', url: '/code-video/files/assets/hanzi-writer-data/module-text.json' },
      { path: 'assets/hanzi-writer-data/README.md', name: 'README.md', kind: 'text', size: '414 B', url: '/code-video/files/assets/hanzi-writer-data/README.md' },
      { path: 'assets/icon-paths/icons.json', name: 'icons.json', kind: 'text', size: '7.6 KB', url: '/code-video/files/assets/icon-paths/icons.json' },
      { path: 'assets/icon-paths/connectors.json', name: 'connectors.json', kind: 'text', size: '6.2 KB', url: '/code-video/files/assets/icon-paths/connectors.json' },
    ],
  },
  {
    directory: 'src',
    files: [
      { path: 'src/compose.mjs', name: 'compose.mjs', kind: 'text', size: '1.6 KB', url: '/code-video/files/src/compose.mjs' },
      { path: 'src/validate.mjs', name: 'validate.mjs', kind: 'text', size: '2.5 KB', url: '/code-video/files/src/validate.mjs' },
      { path: 'src/render.mjs', name: 'render.mjs', kind: 'text', size: '10.1 KB', url: '/code-video/files/src/render.mjs' },
      { path: 'src/render-reference-style.mjs', name: 'render-reference-style.mjs', kind: 'text', size: '68.8 KB', url: '/code-video/files/src/render-reference-style.mjs' },
      { path: 'src/reference-layout.mjs', name: 'reference-layout.mjs', kind: 'text', size: '4.2 KB', url: '/code-video/files/src/reference-layout.mjs' },
      { path: 'src/mix-narration-sfx.mjs', name: 'mix-narration-sfx.mjs', kind: 'text', size: '2.5 KB', url: '/code-video/files/src/mix-narration-sfx.mjs' },
      { path: 'src/build-animation-plan.mjs', name: 'build-animation-plan.mjs', kind: 'text', size: '12.8 KB', url: '/code-video/files/src/build-animation-plan.mjs' },
      { path: 'src/generate-narration.mjs', name: 'generate-narration.mjs', kind: 'text', size: '4.1 KB', url: '/code-video/files/src/generate-narration.mjs' },
    ],
  },
  {
    directory: 'examples',
    files: [
      { path: 'examples/reference-style-narration.txt', name: 'reference-style-narration.txt', kind: 'text', size: '325 B', url: '/code-video/files/examples/reference-style-narration.txt' },
      { path: 'examples/reference-style-v3.json', name: 'reference-style-v3.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v3.json' },
      { path: 'examples/reference-style-narration-v3.txt', name: 'reference-style-narration-v3.txt', kind: 'text', size: '325 B', url: '/code-video/files/examples/reference-style-narration-v3.txt' },
      { path: 'examples/reference-style-v4.json', name: 'reference-style-v4.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v4.json' },
      { path: 'examples/reference-style-narration-v4.txt', name: 'reference-style-narration-v4.txt', kind: 'text', size: '325 B', url: '/code-video/files/examples/reference-style-narration-v4.txt' },
      { path: 'examples/reference-style-v5.json', name: 'reference-style-v5.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v5.json' },
      { path: 'examples/reference-style-narration-v5.txt', name: 'reference-style-narration-v5.txt', kind: 'text', size: '325 B', url: '/code-video/files/examples/reference-style-narration-v5.txt' },
      { path: 'examples/reference-style-v6.json', name: 'reference-style-v6.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v6.json' },
      { path: 'examples/reference-style-narration-v6.txt', name: 'reference-style-narration-v6.txt', kind: 'text', size: '325 B', url: '/code-video/files/examples/reference-style-narration-v6.txt' },
      { path: 'examples/reference-style-v7.json', name: 'reference-style-v7.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v7.json' },
      { path: 'examples/reference-style-narration-v7.txt', name: 'reference-style-narration-v7.txt', kind: 'text', size: '325 B', url: '/code-video/files/examples/reference-style-narration-v7.txt' },
      { path: 'examples/reference-style-v8.json', name: 'reference-style-v8.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v8.json' },
      { path: 'examples/reference-style-narration-v8.txt', name: 'reference-style-narration-v8.txt', kind: 'text', size: '325 B', url: '/code-video/files/examples/reference-style-narration-v8.txt' },
      { path: 'examples/reference-style-v9.json', name: 'reference-style-v9.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v9.json' },
      { path: 'examples/reference-style-narration-v9.txt', name: 'reference-style-narration-v9.txt', kind: 'text', size: '325 B', url: '/code-video/files/examples/reference-style-narration-v9.txt' },
      { path: 'examples/reference-style-v10.json', name: 'reference-style-v10.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v10.json' },
      { path: 'examples/reference-style-script.json', name: 'reference-style-script.json', kind: 'text', size: '6.4 KB', url: '/code-video/files/examples/reference-style-script.json' },
    ],
  },
  {
    directory: 'out',
    files: [
      { path: 'out/params.json', name: 'params.json', kind: 'text', size: '460 B', url: '/code-video/files/out/params.json' },
      { path: 'out/demo.mp4', name: 'demo.mp4', kind: 'video', size: '276 KB', url: '/code-video/demo.mp4' },
      { path: 'out/demo.mp4.json', name: 'demo.mp4.json', kind: 'text', size: '1.2 KB', url: '/code-video/files/out/demo.mp4.json' },
      { path: 'out/reference-style-demo.mp4', name: 'reference-style-demo.mp4', kind: 'video', size: '610 KB', url: '/code-video/reference-style-demo.mp4' },
      { path: 'out/reference-style-demo.mp4.json', name: 'reference-style-demo.mp4.json', kind: 'text', size: '564 B', url: '/code-video/files/out/reference-style-demo.mp4.json' },
      { path: 'out/reference-style-demo-voice.mp4', name: 'reference-style-demo-voice.mp4', kind: 'video', size: '833 KB', url: '/code-video/reference-style-demo-voice.mp4' },
      { path: 'out/reference-style-demo-voice.mp4.json', name: 'reference-style-demo-voice.mp4.json', kind: 'text', size: '841 B', url: '/code-video/files/out/reference-style-demo-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration.m4a', name: 'reference-style-demo-narration.m4a', kind: 'audio', size: '217 KB', url: '/code-video/files/out/reference-style-demo-narration.m4a' },
      { path: 'out/reference-style-demo-v3.mp4', name: 'reference-style-demo-v3.mp4', kind: 'video', size: '1.4 MB', url: '/code-video/reference-style-demo-v3.mp4' },
      { path: 'out/reference-style-demo-v3.mp4.json', name: 'reference-style-demo-v3.mp4.json', kind: 'text', size: '567 B', url: '/code-video/files/out/reference-style-demo-v3.mp4.json' },
      { path: 'out/reference-style-demo-v3-voice.mp4', name: 'reference-style-demo-v3-voice.mp4', kind: 'video', size: '1.8 MB', url: '/code-video/reference-style-demo-v3-voice.mp4' },
      { path: 'out/reference-style-demo-v3-voice.mp4.json', name: 'reference-style-demo-v3-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v3-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v3.m4a', name: 'reference-style-demo-narration-v3.m4a', kind: 'audio', size: '398 KB', url: '/code-video/files/out/reference-style-demo-narration-v3.m4a' },
      { path: 'out/reference-style-demo-v4.mp4', name: 'reference-style-demo-v4.mp4', kind: 'video', size: '1.4 MB', url: '/code-video/reference-style-demo-v4.mp4' },
      { path: 'out/reference-style-demo-v4.mp4.json', name: 'reference-style-demo-v4.mp4.json', kind: 'text', size: '567 B', url: '/code-video/files/out/reference-style-demo-v4.mp4.json' },
      { path: 'out/reference-style-demo-v4-voice.mp4', name: 'reference-style-demo-v4-voice.mp4', kind: 'video', size: '1.8 MB', url: '/code-video/reference-style-demo-v4-voice.mp4' },
      { path: 'out/reference-style-demo-v4-voice.mp4.json', name: 'reference-style-demo-v4-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v4-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v4.m4a', name: 'reference-style-demo-narration-v4.m4a', kind: 'audio', size: '395 KB', url: '/code-video/files/out/reference-style-demo-narration-v4.m4a' },
      { path: 'out/reference-style-demo-v5.mp4', name: 'reference-style-demo-v5.mp4', kind: 'video', size: '1.4 MB', url: '/code-video/reference-style-demo-v5.mp4' },
      { path: 'out/reference-style-demo-v5.mp4.json', name: 'reference-style-demo-v5.mp4.json', kind: 'text', size: '567 B', url: '/code-video/files/out/reference-style-demo-v5.mp4.json' },
      { path: 'out/reference-style-demo-v5-voice.mp4', name: 'reference-style-demo-v5-voice.mp4', kind: 'video', size: '1.8 MB', url: '/code-video/reference-style-demo-v5-voice.mp4' },
      { path: 'out/reference-style-demo-v5-voice.mp4.json', name: 'reference-style-demo-v5-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v5-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v5.m4a', name: 'reference-style-demo-narration-v5.m4a', kind: 'audio', size: '395 KB', url: '/code-video/files/out/reference-style-demo-narration-v5.m4a' },
      { path: 'out/reference-style-demo-v6.mp4', name: 'reference-style-demo-v6.mp4', kind: 'video', size: '1.2 MB', url: '/code-video/reference-style-demo-v6.mp4' },
      { path: 'out/reference-style-demo-v6.mp4.json', name: 'reference-style-demo-v6.mp4.json', kind: 'text', size: '567 B', url: '/code-video/files/out/reference-style-demo-v6.mp4.json' },
      { path: 'out/reference-style-demo-v6-voice.mp4', name: 'reference-style-demo-v6-voice.mp4', kind: 'video', size: '1.6 MB', url: '/code-video/reference-style-demo-v6-voice.mp4' },
      { path: 'out/reference-style-demo-v6-voice.mp4.json', name: 'reference-style-demo-v6-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v6-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v6.m4a', name: 'reference-style-demo-narration-v6.m4a', kind: 'audio', size: '371 KB', url: '/code-video/files/out/reference-style-demo-narration-v6.m4a' },
      { path: 'out/reference-style-demo-v7.mp4', name: 'reference-style-demo-v7.mp4', kind: 'video', size: '1.3 MB', url: '/code-video/reference-style-demo-v7.mp4' },
      { path: 'out/reference-style-demo-v7.mp4.json', name: 'reference-style-demo-v7.mp4.json', kind: 'text', size: '567 B', url: '/code-video/files/out/reference-style-demo-v7.mp4.json' },
      { path: 'out/reference-style-demo-v7-voice.mp4', name: 'reference-style-demo-v7-voice.mp4', kind: 'video', size: '1.7 MB', url: '/code-video/reference-style-demo-v7-voice.mp4' },
      { path: 'out/reference-style-demo-v7-voice.mp4.json', name: 'reference-style-demo-v7-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v7-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v7.m4a', name: 'reference-style-demo-narration-v7.m4a', kind: 'audio', size: '371 KB', url: '/code-video/files/out/reference-style-demo-narration-v7.m4a' },
      { path: 'out/reference-style-demo-v8.mp4', name: 'reference-style-demo-v8.mp4', kind: 'video', size: '849 KB', url: '/code-video/reference-style-demo-v8.mp4' },
      { path: 'out/reference-style-demo-v8.mp4.json', name: 'reference-style-demo-v8.mp4.json', kind: 'text', size: '567 B', url: '/code-video/files/out/reference-style-demo-v8.mp4.json' },
      { path: 'out/reference-style-demo-v8-voice.mp4', name: 'reference-style-demo-v8-voice.mp4', kind: 'video', size: '1.2 MB', url: '/code-video/reference-style-demo-v8-voice.mp4' },
      { path: 'out/reference-style-demo-v8-voice.mp4.json', name: 'reference-style-demo-v8-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v8-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v8.m4a', name: 'reference-style-demo-narration-v8.m4a', kind: 'audio', size: '371 KB', url: '/code-video/files/out/reference-style-demo-narration-v8.m4a' },
      { path: 'out/reference-style-demo-v9.mp4', name: 'reference-style-demo-v9.mp4', kind: 'video', size: '862 KB', url: '/code-video/reference-style-demo-v9.mp4' },
      { path: 'out/reference-style-demo-v9.mp4.json', name: 'reference-style-demo-v9.mp4.json', kind: 'text', size: '567 B', url: '/code-video/files/out/reference-style-demo-v9.mp4.json' },
      { path: 'out/reference-style-demo-v9-voice.mp4', name: 'reference-style-demo-v9-voice.mp4', kind: 'video', size: '1.2 MB', url: '/code-video/reference-style-demo-v9-voice.mp4' },
      { path: 'out/reference-style-demo-v9-voice.mp4.json', name: 'reference-style-demo-v9-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v9-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v9.m4a', name: 'reference-style-demo-narration-v9.m4a', kind: 'audio', size: '371 KB', url: '/code-video/files/out/reference-style-demo-narration-v9.m4a' },
      { path: 'out/reference-style-demo-v10.mp4', name: 'reference-style-demo-v10.mp4', kind: 'video', size: '843 KB', url: '/code-video/reference-style-demo-v10.mp4' },
      { path: 'out/reference-style-demo-v10.mp4.json', name: 'reference-style-demo-v10.mp4.json', kind: 'text', size: '568 B', url: '/code-video/files/out/reference-style-demo-v10.mp4.json' },
      { path: 'out/reference-style-demo-v10-voice.mp4', name: 'reference-style-demo-v10-voice.mp4', kind: 'video', size: '1.2 MB', url: '/code-video/reference-style-demo-v10-voice.mp4' },
      { path: 'out/reference-style-demo-v10-voice.mp4.json', name: 'reference-style-demo-v10-voice.mp4.json', kind: 'text', size: '927 B', url: '/code-video/files/out/reference-style-demo-v10-voice.mp4.json' },
      { path: 'out/reference-style-demo-v11.mp4', name: 'reference-style-demo-v11.mp4', kind: 'video', size: '846 KB', url: '/code-video/reference-style-demo-v11.mp4' },
      { path: 'out/reference-style-demo-v11.mp4.json', name: 'reference-style-demo-v11.mp4.json', kind: 'text', size: '568 B', url: '/code-video/files/out/reference-style-demo-v11.mp4.json' },
      { path: 'out/reference-style-demo-v11-voice.mp4', name: 'reference-style-demo-v11-voice.mp4', kind: 'video', size: '1.2 MB', url: '/code-video/reference-style-demo-v11-voice.mp4' },
      { path: 'out/reference-style-demo-v11-voice.mp4.json', name: 'reference-style-demo-v11-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v11-voice.mp4.json' },
      { path: 'out/reference-style-plan.json', name: 'reference-style-plan.json', kind: 'text', size: '29.5 KB', url: '/code-video/files/out/reference-style-plan.json' },
      { path: 'out/reference-style-demo-v12.mp4', name: 'reference-style-demo-v12.mp4', kind: 'video', size: '846 KB', url: '/code-video/reference-style-demo-v12.mp4' },
      { path: 'out/reference-style-demo-v12-voice.mp4', name: 'reference-style-demo-v12-voice.mp4', kind: 'video', size: '1.2 MB', url: '/code-video/reference-style-demo-v12-voice.mp4' },
      { path: 'out/reference-style-demo-v12-voice.mp4.json', name: 'reference-style-demo-v12-voice.mp4.json', kind: 'text', size: '925 B', url: '/code-video/files/out/reference-style-demo-v12-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v12.m4a', name: 'reference-style-demo-narration-v12.m4a', kind: 'audio', size: '329 KB', url: '/code-video/files/out/reference-style-demo-narration-v12.m4a' },
      { path: 'out/reference-style-demo-narration-v12.m4a.json', name: 'reference-style-demo-narration-v12.m4a.json', kind: 'text', size: '1.4 KB', url: '/code-video/files/out/reference-style-demo-narration-v12.m4a.json' },
      { path: 'out/reference-style-demo-v13.mp4', name: 'reference-style-demo-v13.mp4', kind: 'video', size: '856 KB', url: '/code-video/reference-style-demo-v13.mp4' },
      { path: 'out/reference-style-demo-v13-voice.mp4', name: 'reference-style-demo-v13-voice.mp4', kind: 'video', size: '1.2 MB', url: '/code-video/reference-style-demo-v13-voice.mp4' },
      { path: 'out/reference-style-demo-v13.mp4.json', name: 'reference-style-demo-v13.mp4.json', kind: 'text', size: '568 B', url: '/code-video/files/out/reference-style-demo-v13.mp4.json' },
      { path: 'out/reference-style-demo-v13-voice.mp4.json', name: 'reference-style-demo-v13-voice.mp4.json', kind: 'text', size: '928 B', url: '/code-video/files/out/reference-style-demo-v13-voice.mp4.json' },
      { path: 'out/reference-style-demo-v14.mp4', name: 'reference-style-demo-v14.mp4', kind: 'video', size: '881 KB', url: '/code-video/reference-style-demo-v14.mp4' },
      { path: 'out/reference-style-demo-v14-voice.mp4', name: 'reference-style-demo-v14-voice.mp4', kind: 'video', size: '1.3 MB', url: '/code-video/reference-style-demo-v14-voice.mp4' },
      { path: 'out/reference-style-demo-v14.mp4.json', name: 'reference-style-demo-v14.mp4.json', kind: 'text', size: '568 B', url: '/code-video/files/out/reference-style-demo-v14.mp4.json' },
      { path: 'out/reference-style-demo-v14-voice.mp4.json', name: 'reference-style-demo-v14-voice.mp4.json', kind: 'text', size: '930 B', url: '/code-video/files/out/reference-style-demo-v14-voice.mp4.json' },
      { path: 'out/reference-style-demo-narration-v14.m4a', name: 'reference-style-demo-narration-v14.m4a', kind: 'audio', size: '446 KB', url: '/code-video/files/out/reference-style-demo-narration-v14.m4a' },
      { path: 'out/reference-style-demo-narration-v14.m4a.json', name: 'reference-style-demo-narration-v14.m4a.json', kind: 'text', size: '1.2 KB', url: '/code-video/files/out/reference-style-demo-narration-v14.m4a.json' },
      { path: 'out/reference-style-plan-v14.json', name: 'reference-style-plan-v14.json', kind: 'text', size: '30 KB', url: '/code-video/files/out/reference-style-plan-v14.json' },
      { path: 'out/reference-style-plan-layout-6.json', name: 'reference-style-plan-layout-6.json', kind: 'text', size: '44 KB', url: '/code-video/files/out/reference-style-plan-layout-6.json' },
      { path: 'examples/reference-style-script-v14.json', name: 'reference-style-script-v14.json', kind: 'text', size: '5.3 KB', url: '/code-video/files/examples/reference-style-script-v14.json' },
      { path: 'examples/reference-style-v14.json', name: 'reference-style-v14.json', kind: 'text', size: '1.1 KB', url: '/code-video/files/examples/reference-style-v14.json' },
      { path: 'examples/reference-style-layout-6.json', name: 'reference-style-layout-6.json', kind: 'text', size: '1.3 KB', url: '/code-video/files/examples/reference-style-layout-6.json' },
      { path: 'examples/reference-style-script-layout-6.json', name: 'reference-style-script-layout-6.json', kind: 'text', size: '4.4 KB', url: '/code-video/files/examples/reference-style-script-layout-6.json' },
      { path: 'examples/reference-style-layout-8.json', name: 'reference-style-layout-8.json', kind: 'text', size: '1.6 KB', url: '/code-video/files/examples/reference-style-layout-8.json' },
      { path: 'examples/reference-style-script-layout-8.json', name: 'reference-style-script-layout-8.json', kind: 'text', size: '7.6 KB', url: '/code-video/files/examples/reference-style-script-layout-8.json' },
      { path: 'out/preview/frame-0000.png', name: 'preview/frame-0000.png', kind: 'image', size: '11.2 KB', url: '/code-video/files/out/preview/frame-0000.png' },
      { path: 'out/preview/frame-0001.png', name: 'preview/frame-0001.png', kind: 'image', size: '77.6 KB', url: '/code-video/files/out/preview/frame-0001.png' },
      { path: 'out/preview/frame-0002.png', name: 'preview/frame-0002.png', kind: 'image', size: '83.2 KB', url: '/code-video/files/out/preview/frame-0002.png' },
      { path: 'out/preview/preview-report.json', name: 'preview/preview-report.json', kind: 'text', size: '959 B', url: '/code-video/files/out/preview/preview-report.json' },
      { path: 'out/preview-from-compose/frame-0000.png', name: 'preview-from-compose/frame-0000.png', kind: 'image', size: '11.2 KB', url: '/code-video/files/out/preview-from-compose/frame-0000.png' },
      { path: 'out/preview-from-compose/frame-0001.png', name: 'preview-from-compose/frame-0001.png', kind: 'image', size: '77.6 KB', url: '/code-video/files/out/preview-from-compose/frame-0001.png' },
      { path: 'out/preview-from-compose/frame-0002.png', name: 'preview-from-compose/frame-0002.png', kind: 'image', size: '83.2 KB', url: '/code-video/files/out/preview-from-compose/frame-0002.png' },
      { path: 'out/preview-from-compose/preview-report.json', name: 'preview-from-compose/preview-report.json', kind: 'text', size: '998 B', url: '/code-video/files/out/preview-from-compose/preview-report.json' },
      { path: 'out/preview-reference-style-v2/frame-0000.png', name: 'preview-reference-style-v2/frame-0000.png', kind: 'image', size: '39.2 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0000.png' },
      { path: 'out/preview-reference-style-v2/frame-0001.png', name: 'preview-reference-style-v2/frame-0001.png', kind: 'image', size: '43.1 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0001.png' },
      { path: 'out/preview-reference-style-v2/frame-0002.png', name: 'preview-reference-style-v2/frame-0002.png', kind: 'image', size: '48.7 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0002.png' },
      { path: 'out/preview-reference-style-v2/frame-0003.png', name: 'preview-reference-style-v2/frame-0003.png', kind: 'image', size: '52.1 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0003.png' },
      { path: 'out/preview-reference-style-v2/frame-0004.png', name: 'preview-reference-style-v2/frame-0004.png', kind: 'image', size: '55.8 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0004.png' },
      { path: 'out/preview-reference-style-v2/frame-0005.png', name: 'preview-reference-style-v2/frame-0005.png', kind: 'image', size: '59.4 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0005.png' },
      { path: 'out/preview-reference-style-v2/frame-0006.png', name: 'preview-reference-style-v2/frame-0006.png', kind: 'image', size: '65.2 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0006.png' },
      { path: 'out/preview-reference-style-v2/frame-0007.png', name: 'preview-reference-style-v2/frame-0007.png', kind: 'image', size: '68.4 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0007.png' },
      { path: 'out/preview-reference-style-v2/frame-0008.png', name: 'preview-reference-style-v2/frame-0008.png', kind: 'image', size: '69.1 KB', url: '/code-video/files/out/preview-reference-style-v2/frame-0008.png' },
      { path: 'out/preview-reference-style-v3/frame-0000.png', name: 'preview-reference-style-v3/frame-0000.png', kind: 'image', size: '39.2 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0000.png' },
      { path: 'out/preview-reference-style-v3/frame-0001.png', name: 'preview-reference-style-v3/frame-0001.png', kind: 'image', size: '45.4 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0001.png' },
      { path: 'out/preview-reference-style-v3/frame-0002.png', name: 'preview-reference-style-v3/frame-0002.png', kind: 'image', size: '53.1 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0002.png' },
      { path: 'out/preview-reference-style-v3/frame-0003.png', name: 'preview-reference-style-v3/frame-0003.png', kind: 'image', size: '57.8 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0003.png' },
      { path: 'out/preview-reference-style-v3/frame-0004.png', name: 'preview-reference-style-v3/frame-0004.png', kind: 'image', size: '65.3 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0004.png' },
      { path: 'out/preview-reference-style-v3/frame-0005.png', name: 'preview-reference-style-v3/frame-0005.png', kind: 'image', size: '72.7 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0005.png' },
      { path: 'out/preview-reference-style-v3/frame-0006.png', name: 'preview-reference-style-v3/frame-0006.png', kind: 'image', size: '78.6 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0006.png' },
      { path: 'out/preview-reference-style-v3/frame-0007.png', name: 'preview-reference-style-v3/frame-0007.png', kind: 'image', size: '82.1 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0007.png' },
      { path: 'out/preview-reference-style-v3/frame-0008.png', name: 'preview-reference-style-v3/frame-0008.png', kind: 'image', size: '84.5 KB', url: '/code-video/files/out/preview-reference-style-v3/frame-0008.png' },
      { path: 'out/preview-reference-style-v3/preview-report.json', name: 'preview-reference-style-v3/preview-report.json', kind: 'text', size: '959 B', url: '/code-video/files/out/preview-reference-style-v3/preview-report.json' },
      { path: 'out/preview-reference-style-v4/frame-0000.png', name: 'preview-reference-style-v4/frame-0000.png', kind: 'image', size: '39.2 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0000.png' },
      { path: 'out/preview-reference-style-v4/frame-0001.png', name: 'preview-reference-style-v4/frame-0001.png', kind: 'image', size: '44.8 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0001.png' },
      { path: 'out/preview-reference-style-v4/frame-0002.png', name: 'preview-reference-style-v4/frame-0002.png', kind: 'image', size: '52.6 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0002.png' },
      { path: 'out/preview-reference-style-v4/frame-0003.png', name: 'preview-reference-style-v4/frame-0003.png', kind: 'image', size: '57.6 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0003.png' },
      { path: 'out/preview-reference-style-v4/frame-0004.png', name: 'preview-reference-style-v4/frame-0004.png', kind: 'image', size: '64.8 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0004.png' },
      { path: 'out/preview-reference-style-v4/frame-0005.png', name: 'preview-reference-style-v4/frame-0005.png', kind: 'image', size: '71.7 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0005.png' },
      { path: 'out/preview-reference-style-v4/frame-0006.png', name: 'preview-reference-style-v4/frame-0006.png', kind: 'image', size: '76.8 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0006.png' },
      { path: 'out/preview-reference-style-v4/frame-0007.png', name: 'preview-reference-style-v4/frame-0007.png', kind: 'image', size: '80.8 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0007.png' },
      { path: 'out/preview-reference-style-v4/frame-0008.png', name: 'preview-reference-style-v4/frame-0008.png', kind: 'image', size: '82.7 KB', url: '/code-video/files/out/preview-reference-style-v4/frame-0008.png' },
      { path: 'out/preview-reference-style-v4/preview-report.json', name: 'preview-reference-style-v4/preview-report.json', kind: 'text', size: '959 B', url: '/code-video/files/out/preview-reference-style-v4/preview-report.json' },
      { path: 'out/preview-reference-style-v5/frame-0000.png', name: 'preview-reference-style-v5/frame-0000.png', kind: 'image', size: '39.2 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0000.png' },
      { path: 'out/preview-reference-style-v5/frame-0001.png', name: 'preview-reference-style-v5/frame-0001.png', kind: 'image', size: '44.8 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0001.png' },
      { path: 'out/preview-reference-style-v5/frame-0002.png', name: 'preview-reference-style-v5/frame-0002.png', kind: 'image', size: '52.6 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0002.png' },
      { path: 'out/preview-reference-style-v5/frame-0003.png', name: 'preview-reference-style-v5/frame-0003.png', kind: 'image', size: '57.6 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0003.png' },
      { path: 'out/preview-reference-style-v5/frame-0004.png', name: 'preview-reference-style-v5/frame-0004.png', kind: 'image', size: '64.8 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0004.png' },
      { path: 'out/preview-reference-style-v5/frame-0005.png', name: 'preview-reference-style-v5/frame-0005.png', kind: 'image', size: '71.7 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0005.png' },
      { path: 'out/preview-reference-style-v5/frame-0006.png', name: 'preview-reference-style-v5/frame-0006.png', kind: 'image', size: '76.8 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0006.png' },
      { path: 'out/preview-reference-style-v5/frame-0007.png', name: 'preview-reference-style-v5/frame-0007.png', kind: 'image', size: '80.8 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0007.png' },
      { path: 'out/preview-reference-style-v5/frame-0008.png', name: 'preview-reference-style-v5/frame-0008.png', kind: 'image', size: '82.7 KB', url: '/code-video/files/out/preview-reference-style-v5/frame-0008.png' },
      { path: 'out/preview-reference-style-v5/preview-report.json', name: 'preview-reference-style-v5/preview-report.json', kind: 'text', size: '959 B', url: '/code-video/files/out/preview-reference-style-v5/preview-report.json' },
      { path: 'out/preview-reference-style-v6/frame-0000.png', name: 'preview-reference-style-v6/frame-0000.png', kind: 'image', size: '14 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0000.png' },
      { path: 'out/preview-reference-style-v6/frame-0001.png', name: 'preview-reference-style-v6/frame-0001.png', kind: 'image', size: '45 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0001.png' },
      { path: 'out/preview-reference-style-v6/frame-0002.png', name: 'preview-reference-style-v6/frame-0002.png', kind: 'image', size: '55 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0002.png' },
      { path: 'out/preview-reference-style-v6/frame-0003.png', name: 'preview-reference-style-v6/frame-0003.png', kind: 'image', size: '69 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0003.png' },
      { path: 'out/preview-reference-style-v6/frame-0004.png', name: 'preview-reference-style-v6/frame-0004.png', kind: 'image', size: '61 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0004.png' },
      { path: 'out/preview-reference-style-v6/frame-0005.png', name: 'preview-reference-style-v6/frame-0005.png', kind: 'image', size: '76 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0005.png' },
      { path: 'out/preview-reference-style-v6/frame-0006.png', name: 'preview-reference-style-v6/frame-0006.png', kind: 'image', size: '109 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0006.png' },
      { path: 'out/preview-reference-style-v6/frame-0007.png', name: 'preview-reference-style-v6/frame-0007.png', kind: 'image', size: '118 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0007.png' },
      { path: 'out/preview-reference-style-v6/frame-0008.png', name: 'preview-reference-style-v6/frame-0008.png', kind: 'image', size: '116 KB', url: '/code-video/files/out/preview-reference-style-v6/frame-0008.png' },
      { path: 'out/preview-reference-style-v6/preview-report.json', name: 'preview-reference-style-v6/preview-report.json', kind: 'text', size: '954 B', url: '/code-video/files/out/preview-reference-style-v6/preview-report.json' },
      { path: 'out/preview-reference-style-v7/frame-0000.png', name: 'preview-reference-style-v7/frame-0000.png', kind: 'image', size: '17 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0000.png' },
      { path: 'out/preview-reference-style-v7/frame-0001.png', name: 'preview-reference-style-v7/frame-0001.png', kind: 'image', size: '84 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0001.png' },
      { path: 'out/preview-reference-style-v7/frame-0002.png', name: 'preview-reference-style-v7/frame-0002.png', kind: 'image', size: '59 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0002.png' },
      { path: 'out/preview-reference-style-v7/frame-0003.png', name: 'preview-reference-style-v7/frame-0003.png', kind: 'image', size: '72 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0003.png' },
      { path: 'out/preview-reference-style-v7/frame-0004.png', name: 'preview-reference-style-v7/frame-0004.png', kind: 'image', size: '62 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0004.png' },
      { path: 'out/preview-reference-style-v7/frame-0005.png', name: 'preview-reference-style-v7/frame-0005.png', kind: 'image', size: '74 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0005.png' },
      { path: 'out/preview-reference-style-v7/frame-0006.png', name: 'preview-reference-style-v7/frame-0006.png', kind: 'image', size: '110 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0006.png' },
      { path: 'out/preview-reference-style-v7/frame-0007.png', name: 'preview-reference-style-v7/frame-0007.png', kind: 'image', size: '118 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0007.png' },
      { path: 'out/preview-reference-style-v7/frame-0008.png', name: 'preview-reference-style-v7/frame-0008.png', kind: 'image', size: '108 KB', url: '/code-video/files/out/preview-reference-style-v7/frame-0008.png' },
      { path: 'out/preview-reference-style-v7/preview-report.json', name: 'preview-reference-style-v7/preview-report.json', kind: 'text', size: '954 B', url: '/code-video/files/out/preview-reference-style-v7/preview-report.json' },
      { path: 'out/preview-reference-style-v8/frame-0000.png', name: 'preview-reference-style-v8/frame-0000.png', kind: 'image', size: '17 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0000.png' },
      { path: 'out/preview-reference-style-v8/frame-0001.png', name: 'preview-reference-style-v8/frame-0001.png', kind: 'image', size: '82 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0001.png' },
      { path: 'out/preview-reference-style-v8/frame-0002.png', name: 'preview-reference-style-v8/frame-0002.png', kind: 'image', size: '45 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0002.png' },
      { path: 'out/preview-reference-style-v8/frame-0003.png', name: 'preview-reference-style-v8/frame-0003.png', kind: 'image', size: '52 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0003.png' },
      { path: 'out/preview-reference-style-v8/frame-0004.png', name: 'preview-reference-style-v8/frame-0004.png', kind: 'image', size: '53 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0004.png' },
      { path: 'out/preview-reference-style-v8/frame-0005.png', name: 'preview-reference-style-v8/frame-0005.png', kind: 'image', size: '57 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0005.png' },
      { path: 'out/preview-reference-style-v8/frame-0006.png', name: 'preview-reference-style-v8/frame-0006.png', kind: 'image', size: '67 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0006.png' },
      { path: 'out/preview-reference-style-v8/frame-0007.png', name: 'preview-reference-style-v8/frame-0007.png', kind: 'image', size: '100 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0007.png' },
      { path: 'out/preview-reference-style-v8/frame-0008.png', name: 'preview-reference-style-v8/frame-0008.png', kind: 'image', size: '91 KB', url: '/code-video/files/out/preview-reference-style-v8/frame-0008.png' },
      { path: 'out/preview-reference-style-v8/preview-report.json', name: 'preview-reference-style-v8/preview-report.json', kind: 'text', size: '954 B', url: '/code-video/files/out/preview-reference-style-v8/preview-report.json' },
      { path: 'out/preview-reference-style-v9/frame-0000.png', name: 'preview-reference-style-v9/frame-0000.png', kind: 'image', size: '8.6 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0000.png' },
      { path: 'out/preview-reference-style-v9/frame-0001.png', name: 'preview-reference-style-v9/frame-0001.png', kind: 'image', size: '83 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0001.png' },
      { path: 'out/preview-reference-style-v9/frame-0002.png', name: 'preview-reference-style-v9/frame-0002.png', kind: 'image', size: '44 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0002.png' },
      { path: 'out/preview-reference-style-v9/frame-0003.png', name: 'preview-reference-style-v9/frame-0003.png', kind: 'image', size: '59 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0003.png' },
      { path: 'out/preview-reference-style-v9/frame-0004.png', name: 'preview-reference-style-v9/frame-0004.png', kind: 'image', size: '59 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0004.png' },
      { path: 'out/preview-reference-style-v9/frame-0005.png', name: 'preview-reference-style-v9/frame-0005.png', kind: 'image', size: '63 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0005.png' },
      { path: 'out/preview-reference-style-v9/frame-0006.png', name: 'preview-reference-style-v9/frame-0006.png', kind: 'image', size: '76 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0006.png' },
      { path: 'out/preview-reference-style-v9/frame-0007.png', name: 'preview-reference-style-v9/frame-0007.png', kind: 'image', size: '110 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0007.png' },
      { path: 'out/preview-reference-style-v9/frame-0008.png', name: 'preview-reference-style-v9/frame-0008.png', kind: 'image', size: '98 KB', url: '/code-video/files/out/preview-reference-style-v9/frame-0008.png' },
      { path: 'out/preview-reference-style-v9/preview-report.json', name: 'preview-reference-style-v9/preview-report.json', kind: 'text', size: '954 B', url: '/code-video/files/out/preview-reference-style-v9/preview-report.json' },
    ],
  },
];

const codeVideoFiles = codeVideoFileGroups.flatMap((group) => group.files);

const getFileIcon = (kind: CodeVideoFileKind) => {
  if (kind === 'image') return ImageIcon;
  if (kind === 'video') return Video;
  if (kind === 'audio') return FileAudio;
  return FileText;
};

type ReferenceFileKind = 'text' | 'binary' | 'restricted';

type ReferenceFile = {
  path: string;
  name: string;
  kind: ReferenceFileKind;
  size: string;
  url?: string;
};

const referenceFileGroups: Array<{ directory: string; files: ReferenceFile[] }> = [
  {
    directory: 'root',
    files: [
      { path: '00-START-HERE.md', name: '00-START-HERE.md', kind: 'text', size: '21.2 KB', url: '/code-video/reference/files/00-START-HERE.md' },
      { path: 'README.md', name: 'README.md', kind: 'text', size: '21.2 KB', url: '/code-video/reference/files/README.md' },
      { path: 'motion.json', name: 'motion.json', kind: 'text', size: '1.1 KB', url: '/code-video/reference/files/motion.json' },
    ],
  },
  {
    directory: 'assistant',
    files: [
      { path: 'assistant/BUILD.json', name: 'BUILD.json', kind: 'text', size: '537 B', url: '/code-video/reference/files/assistant/BUILD.json' },
      { path: 'assistant/guide.json', name: 'guide.json', kind: 'text', size: '32 KB', url: '/code-video/reference/files/assistant/guide.json' },
      { path: 'assistant/motion.mjs', name: 'motion.mjs', kind: 'text', size: '823 KB', url: '/code-video/reference/files/assistant/motion.mjs' },
      { path: 'assistant/THIRD-PARTY-NOTICES.txt', name: 'THIRD-PARTY-NOTICES.txt', kind: 'text', size: '76 KB', url: '/code-video/reference/files/assistant/THIRD-PARTY-NOTICES.txt' },
    ],
  },
  {
    directory: 'content',
    files: [
      { path: 'content/release.bin', name: 'release.bin', kind: 'binary', size: '24.5 MB' },
    ],
  },
  {
    directory: 'personal',
    files: [
      { path: 'personal/motiongit.key.json', name: 'motiongit.key.json', kind: 'restricted', size: '156 B' },
      { path: 'personal/receipt.json', name: 'receipt.json', kind: 'restricted', size: '1.5 KB' },
      { path: 'personal/signature.json', name: 'signature.json', kind: 'restricted', size: '162 B' },
    ],
  },
];

const referenceFiles = referenceFileGroups.flatMap((group) => group.files);

const getReferenceFileIcon = (kind: ReferenceFileKind) => kind === 'text' ? FileText : FileJson2;

export function CodeVideoPage({ onBackToDirectory }: CodeVideoPageProps) {
  const [prompt, setPrompt] = useState('请用三步解释多智能体 Agent 如何协作');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeDemoVariant, setActiveDemoVariant] = useState<'basic' | 'reference' | 'referenceV3' | 'referenceV4' | 'referenceV5' | 'referenceV6' | 'referenceV7' | 'referenceV8' | 'referenceV9' | 'referenceV10' | 'referenceV11' | 'referenceV12' | 'referenceV13' | 'referenceV14'>('referenceV14');
  const [selectedFilePath, setSelectedFilePath] = useState('template/motion.json');
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isReferenceVideoOpen, setIsReferenceVideoOpen] = useState(false);
  const [selectedReferenceFilePath, setSelectedReferenceFilePath] = useState('motion.json');
  const [selectedReferenceContent, setSelectedReferenceContent] = useState('');
  const activeDemo = demoVariants[activeDemoVariant];
  const activeScenes = activeDemoVariant === 'basic' ? scenes : activeDemoVariant === 'referenceV14' ? referenceStyleV14Scenes : referenceStyleScenes;
  const selectedFile = codeVideoFiles.find((file) => file.path === selectedFilePath) ?? codeVideoFiles[0];
  const selectedReferenceFile = referenceFiles.find((file) => file.path === selectedReferenceFilePath) ?? referenceFiles[0];

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 650);
  };

  useEffect(() => {
    if (selectedFile.kind !== 'text') {
      setSelectedFileContent('');
      return;
    }

    let active = true;
    setSelectedFileContent('读取文件中…');
    fetch(selectedFile.url)
      .then((response) => {
        if (!response.ok) throw new Error(`读取失败：${response.status}`);
        return response.text();
      })
      .then((content) => {
        if (active) setSelectedFileContent(content);
      })
      .catch(() => {
        if (active) setSelectedFileContent('当前文件暂时无法读取。');
      });

    return () => {
      active = false;
    };
  }, [selectedFile]);

  useEffect(() => {
    if (selectedReferenceFile.kind !== 'text' || !selectedReferenceFile.url) {
      setSelectedReferenceContent('');
      return;
    }

    let active = true;
    setSelectedReferenceContent('读取参考文件中…');
    fetch(selectedReferenceFile.url)
      .then((response) => {
        if (!response.ok) throw new Error(`读取失败：${response.status}`);
        return response.text();
      })
      .then((content) => {
        if (active) setSelectedReferenceContent(content);
      })
      .catch(() => {
        if (active) setSelectedReferenceContent('当前参考文件暂时无法读取。');
      });

    return () => {
      active = false;
    };
  }, [selectedReferenceFile]);

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#1f2a44]" data-testid="code-video-page">
      <header className="flex h-[72px] items-center justify-between border-b border-[#dedbd4] bg-white/90 px-6 shadow-[0_8px_24px_rgba(71,57,35,0.05)] backdrop-blur lg:px-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToDirectory}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9d6cf] px-4 py-2 text-sm font-medium text-[#59647a] transition hover:border-[#1f2a44] hover:text-[#1f2a44]"
          >
            <ArrowLeft size={16} />
            项目目录
          </button>
          <div className="h-6 w-px bg-[#e2dfd8]" />
          <div>
            <div className="flex items-center gap-2 text-[15px] font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1f2a44] text-white"><Code2 size={16} /></span>
              代码视频
            </div>
            <div className="mt-0.5 text-xs text-[#8b8f9a]">模板驱动的视频生成实验</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8b8f9a] sm:gap-3">
          <button type="button" onClick={() => setIsReferenceOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-[#d9d6cf] bg-white px-3 py-1.5 font-medium text-[#59647a] transition hover:border-[#1f2a44] hover:text-[#1f2a44]"><FolderOpen size={14} />参考模板文件</button>
          <span className="rounded-full bg-[#eef8f3] px-3 py-1.5 font-medium text-[#21946a]">Demo v1.4</span>
          <span className="hidden md:inline">本地渲染预览</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 lg:grid-cols-[280px_minmax(0,1fr)_300px] lg:px-8">
        <aside className="rounded-[22px] border border-[#e1ddd5] bg-white p-5 shadow-[0_16px_40px_rgba(71,57,35,0.06)]">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ba09d]">Template</div>
              <h1 className="mt-2 text-xl font-semibold tracking-[-0.03em]">选择视频模板</h1>
            </div>
            <Sparkles size={19} className="text-[#f0b83f]" />
          </div>

          <div className="mb-5 rounded-2xl border border-[#d8d3c8] bg-[#fffdfa] p-3 shadow-[0_8px_18px_rgba(71,57,35,0.05)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <div className="text-sm font-semibold">参考视频</div>
                <div className="mt-1 text-xs text-[#8d948f]">MotionGit · 知识讲解模板</div>
              </div>
              <span className="rounded-full bg-[#f7f2e7] px-2.5 py-1 text-[10px] text-[#8d8371]">19.95 秒</span>
            </div>
            <button type="button" aria-label="预览 MotionGit 参考视频" onClick={() => setIsReferenceVideoOpen(true)} className="group relative block w-full overflow-hidden rounded-xl bg-[#1f2a44] text-left">
              <video muted playsInline preload="metadata" poster="/code-video/reference/reference-poster.png" src="/code-video/reference/reference.mp4" className="aspect-video w-full object-cover opacity-90 transition group-hover:scale-[1.02] group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1f2a44]/10 transition group-hover:bg-[#1f2a44]/25"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-[#1f2a44] shadow-lg"><Play size={14} fill="currentColor" />点击预览</span></span>
            </button>
            <div className="mt-3 flex items-center justify-between text-xs text-[#687287]"><span>1280×720 · 60 fps</span><span>参考成片</span></div>
            <div className="mt-3 rounded-xl bg-[#f7f8fa] p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#4d5870]"><span>对应源文件</span><span>{referenceFiles.length} 个</span></div>
              <div className="mt-2 truncate text-[11px] text-[#8d948f]">motion.json · assistant/motion.mjs · README.md</div>
              <button type="button" onClick={() => setIsReferenceOpen(true)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#21946a] transition hover:text-[#1f2a44]"><FolderOpen size={14} />查看源文件目录</button>
            </div>
          </div>

          <button type="button" className="w-full rounded-2xl border-2 border-[#8ed5bb] bg-[#f5fbf7] p-3 text-left shadow-[0_8px_18px_rgba(142,213,187,0.14)]">
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-[#f7f2e7]">
              <img src="/code-video/preview.png" alt="点阵手账模板预览" className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">点阵手账 · 步骤讲解</div>
                <div className="mt-1 text-xs text-[#8d948f]">step-sequence · 1920×1080</div>
              </div>
              <CheckCircle2 size={18} className="text-[#27a879]" />
            </div>
          </button>

          <div className="mt-6 rounded-2xl bg-[#f7f8fa] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Layers3 size={16} /> 模板能力</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['步骤留页', '相机接力', '文字校验', '固定节奏'].map((item) => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-xs text-[#687287]">{item}</span>)}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-[#687287]">
            <div className="rounded-xl border border-[#ebe8e1] p-3"><Clock3 size={15} className="mb-2 text-[#8ed5bb]" />12 秒</div>
            <div className="rounded-xl border border-[#ebe8e1] p-3"><Code2 size={15} className="mb-2 text-[#f0b83f]" />30 fps</div>
          </div>
        </aside>

        <section className="min-w-0 rounded-[22px] border border-[#e1ddd5] bg-[#fffdfa] p-4 shadow-[0_16px_40px_rgba(71,57,35,0.06)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ba09d]">Preview</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">视频预览</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-[#e1ddd5] bg-white p-1">
                <button type="button" onClick={() => setActiveDemoVariant('referenceV14')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV14' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v1.4</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV13')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV13' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v1.3</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV12')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV12' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v1.2</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV11')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV11' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v1.1</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV10')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV10' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v1.0</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV9')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV9' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v0.9</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV8')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV8' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v0.8</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV7')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV7' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v0.7</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV6')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV6' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v0.6</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV5')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV5' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v0.5</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV4')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV4' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v0.4</button>
                <button type="button" onClick={() => setActiveDemoVariant('referenceV3')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'referenceV3' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 v0.3</button>
                <button type="button" onClick={() => setActiveDemoVariant('reference')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'reference' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>参考风格 Demo</button>
                <button type="button" onClick={() => setActiveDemoVariant('basic')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeDemoVariant === 'basic' ? 'bg-[#1f2a44] text-white' : 'text-[#687287] hover:text-[#1f2a44]'}`}>基础 Demo</button>
              </div>
              {isGenerated ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef8f3] px-3 py-1.5 text-xs font-medium text-[#21946a]"><CheckCircle2 size={14} />已生成预览</span> : <span className="rounded-full bg-[#f7f2e7] px-3 py-1.5 text-xs text-[#8d8371]">等待生成</span>}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#d8d3c8] bg-[#f7f2e7] shadow-inner">
            <video key={activeDemo.src} className="aspect-video w-full" controls poster={activeDemo.poster} src={activeDemo.src}>
              <track kind="captions" />
            </video>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#eeeae2] pt-4">
            <div className="flex min-w-0 items-center gap-2 text-xs text-[#8b8f9a]"><Play size={14} /><span className="truncate">{activeDemo.label} · {activeDemo.meta}</span></div>
            <a href={activeDemo.src} download className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#cfcac0] px-4 py-2 text-sm font-medium text-[#4e5a70] transition hover:border-[#1f2a44] hover:text-[#1f2a44]"><Download size={15} />下载 MP4</a>
          </div>

          <div className="mt-6 rounded-2xl border border-[#e4e0d8] bg-white p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">分镜时间线</h3><span className="text-xs text-[#9ba09d]">{activeDemoVariant === 'basic' ? '固定模板节奏' : activeDemoVariant === 'referenceV14' ? '自然语速 + 逐字完成 + 标题安全连线' : activeDemoVariant === 'referenceV13' ? '模块文字笔画 + 安全连线 + 普通话旁白' : activeDemoVariant === 'referenceV12' ? '分段普通话旁白 + SVG 路径绘制' : activeDemoVariant === 'referenceV11' ? '脚本计划驱动 + SVG 路径绘制' : activeDemoVariant === 'referenceV10' ? '真实笔画标题 + 笔尖跟随' : activeDemoVariant === 'referenceV9' ? '笔尖驱动路径绘制' : activeDemoVariant === 'referenceV8' ? '分镜校正 + 逐元素绘制' : activeDemoVariant === 'referenceV7' ? '毛笔标题 + 画框收口' : activeDemoVariant === 'referenceV6' ? '笔画路径 + 线条纹理' : activeDemoVariant === 'referenceV5' ? '手绘细节 + 白板左上拽动' : activeDemoVariant === 'referenceV4' ? '逐字书写 + 白板左上拽动' : activeDemoVariant === 'referenceV3' ? '镜头接力 + 旁白节拍' : '手绘分层节奏'}</span></div>
            <div className={`grid gap-2 ${activeDemoVariant === 'basic' ? 'sm:grid-cols-3' : 'sm:grid-cols-4'}`}>
              {activeScenes.map((scene, index) => <div key={scene.time} className="rounded-xl bg-[#f8f7f4] p-3"><div className="flex items-center justify-between text-xs text-[#8d948f]"><span>0{index + 1}</span><span>{scene.time}</span></div><div className="mt-2 text-sm font-medium">{scene.title}</div><div className="mt-1 text-xs leading-5 text-[#8d948f]">{scene.description}</div></div>)}
            </div>
          </div>
        </section>

        <aside className="rounded-[22px] border border-[#e1ddd5] bg-white p-5 shadow-[0_16px_40px_rgba(71,57,35,0.06)]">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ba09d]">Compose</div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">生成内容</h2>
          <label className="mt-5 block text-sm font-medium text-[#4d5870]" htmlFor="code-video-prompt">告诉 Agent 你想讲什么</label>
          <textarea id="code-video-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-2 h-28 w-full resize-none rounded-2xl border border-[#dcd8d0] bg-[#fcfbf8] p-3 text-sm leading-6 text-[#303c55] outline-none transition focus:border-[#8ed5bb] focus:ring-2 focus:ring-[#8ed5bb]/20" />
          <div className="mt-2 text-right text-xs text-[#a1a29e]">{prompt.length}/200</div>

          <button type="button" onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f2a44] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2d3c5b] disabled:cursor-not-allowed disabled:opacity-50">
            {isGenerating ? <><RefreshCw size={16} className="animate-spin" />正在生成参数</> : <><WandSparkles size={16} />生成代码视频</>}
          </button>

          <div className="mt-6 border-t border-[#eeeae2] pt-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><FileJson2 size={16} />结构化参数 <span className="text-xs font-normal text-[#9ba09d]">out/params.json</span></div>
            <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-[#1f2a44] p-3 text-[11px] leading-5 text-[#d8f4e6]">{JSON.stringify(sampleParams, null, 2)}</pre>
          </div>

          <div className="mt-5 rounded-xl bg-[#fff8e9] p-3 text-xs leading-5 text-[#8c7041]">Demo 当前只验证模板参数、预览和导出，暂不连接真实 Agent 或后端渲染服务。</div>
        </aside>

        <section className="min-w-0 rounded-[22px] border border-[#e1ddd5] bg-white p-4 shadow-[0_16px_40px_rgba(71,57,35,0.06)] lg:col-span-3 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ba09d]">Files</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">项目文件结构与内容</h2>
              <p className="mt-1 text-sm text-[#8b8f9a]">这里展示本次 Demo 的模板、渲染代码和完整输出产物。</p>
            </div>
            <span className="rounded-full bg-[#f7f2e7] px-3 py-1.5 text-xs text-[#8d8371]">{codeVideoFiles.length} 个文件</span>
          </div>

          <div className="mt-5 grid min-h-[560px] overflow-hidden rounded-2xl border border-[#e4e0d8] bg-[#f8f7f4] lg:grid-cols-[300px_minmax(0,1fr)]">
            <nav className="max-h-[620px] overflow-y-auto border-b border-[#e4e0d8] p-3 lg:border-b-0 lg:border-r" aria-label="代码视频项目文件">
              {codeVideoFileGroups.map((group) => (
                <div key={group.directory} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8d948f]"><FolderOpen size={14} />{group.directory}/</div>
                  <div className="space-y-1">
                    {group.files.map((file) => {
                      const FileIcon = getFileIcon(file.kind);
                      const isSelected = selectedFilePath === file.path;
                      return (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => setSelectedFilePath(file.path)}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${isSelected ? 'bg-[#e6f6ed] text-[#1f2a44]' : 'text-[#687287] hover:bg-white'}`}
                        >
                          <FileIcon size={15} className={isSelected ? 'text-[#21946a]' : 'text-[#9ba09d]'} />
                          <span className="min-w-0 flex-1 truncate">{file.name}</span>
                          <span className="text-[10px] text-[#a1a29e]">{file.size}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="min-w-0 bg-[#fffdfa] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeae2] pb-4">
                <div className="flex min-w-0 items-center gap-2">
                  {(() => {
                    const SelectedFileIcon = getFileIcon(selectedFile.kind);
                    return <SelectedFileIcon size={17} className="shrink-0 text-[#21946a]" />;
                  })()}
                  <span className="truncate font-mono text-sm text-[#303c55]">{selectedFile.path}</span>
                </div>
                <span className="text-xs text-[#9ba09d]">{selectedFile.size}</span>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#e4e0d8] bg-[#1f2a44]">
                {selectedFile.kind === 'text' && <pre className="max-h-[520px] overflow-auto p-5 text-xs leading-6 text-[#d8f4e6]">{selectedFileContent}</pre>}
                {selectedFile.kind === 'image' && <div className="flex min-h-[420px] items-center justify-center bg-[#f7f2e7] p-5"><img src={selectedFile.url} alt={selectedFile.path} className="max-h-[480px] max-w-full rounded-xl object-contain shadow-[0_16px_32px_rgba(31,42,68,0.14)]" /></div>}
                {selectedFile.kind === 'video' && <video className="aspect-video w-full bg-black" controls poster="/code-video/preview.png" src={selectedFile.url}><track kind="captions" /></video>}
                {selectedFile.kind === 'audio' && <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 bg-[#f7f2e7] p-6"><FileAudio size={36} className="text-[#8ed5bb]" /><audio className="w-full max-w-[520px]" controls src={selectedFile.url} /><div className="text-xs text-[#8b8f9a]">这是一条与参考风格 Demo 绑定的中文讲解音频。</div></div>}
                {selectedFile.kind === 'binary' && <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 bg-[#f7f2e7] p-6 text-center"><FileText size={36} className="text-[#8ed5bb]" /><div className="text-sm font-medium text-[#303c55]">二进制字体资源</div><div className="max-w-[520px] text-xs leading-5 text-[#8b8f9a]">该字体用于渲染参考视频的毛笔标题，页面不直接展开二进制内容。</div><a href={selectedFile.url} download className="rounded-full border border-[#cfcac0] px-3 py-1.5 text-xs font-medium text-[#59647a] transition hover:border-[#1f2a44] hover:text-[#1f2a44]">下载字体文件</a></div>}
              </div>
            </div>
          </div>
        </section>
      </main>

      {isReferenceOpen && (
        <>
          <button type="button" aria-label="关闭参考模板文件" onClick={() => setIsReferenceOpen(false)} className="fixed inset-0 z-40 cursor-default bg-[#1f2a44]/25 backdrop-blur-[2px]" />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[980px] flex-col bg-[#fbfaf7] shadow-[-24px_0_70px_rgba(31,42,68,0.2)]" aria-label="参考模板文件抽屉">
            <header className="flex items-center justify-between border-b border-[#e1ddd5] bg-white px-5 py-4 sm:px-7">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ba09d]">Reference</div>
                <h2 className="mt-1 text-lg font-semibold text-[#1f2a44]">MotionGit 参考模板</h2>
                <p className="mt-1 text-xs text-[#8b8f9a]">点阵手账 · 知识讲解模板 · v2.7.3</p>
              </div>
              <button type="button" aria-label="关闭参考模板文件" onClick={() => setIsReferenceOpen(false)} className="rounded-full p-2 text-[#687287] transition hover:bg-[#f4f1eb] hover:text-[#1f2a44]"><X size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              <div className="rounded-2xl border border-[#e1ddd5] bg-white p-4 shadow-[0_12px_30px_rgba(71,57,35,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-[#1f2a44]">参考视频</div>
                    <div className="mt-1 text-xs text-[#8b8f9a]">2.5.3-zh-5ebc896f6930.mp4 · 1280×720 · 60 fps · 19.95 秒</div>
                  </div>
                  <a href="/code-video/reference/reference.mp4" download className="rounded-full border border-[#cfcac0] px-3 py-1.5 text-xs font-medium text-[#59647a] transition hover:border-[#1f2a44] hover:text-[#1f2a44]">下载参考视频</a>
                </div>
                <video className="mt-4 aspect-video w-full rounded-xl bg-black" controls src="/code-video/reference/reference.mp4"><track kind="captions" /></video>
              </div>

              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#1f2a44]">源文件目录</div>
                  <div className="mt-1 text-xs text-[#8b8f9a]">点击左侧文件，右侧查看原始内容。</div>
                </div>
                <span className="rounded-full bg-[#f7f2e7] px-3 py-1.5 text-xs text-[#8d8371]">{referenceFiles.length} 个文件</span>
              </div>

              <div className="mt-4 grid min-h-[560px] overflow-hidden rounded-2xl border border-[#e4e0d8] bg-[#f8f7f4] lg:grid-cols-[270px_minmax(0,1fr)]">
                <nav className="max-h-[620px] overflow-y-auto border-b border-[#e4e0d8] p-3 lg:border-b-0 lg:border-r" aria-label="参考模板源文件目录">
                  {referenceFileGroups.map((group) => (
                    <div key={group.directory} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8d948f]"><FolderOpen size={14} />{group.directory}/</div>
                      <div className="space-y-1">
                        {group.files.map((file) => {
                          const FileIcon = getReferenceFileIcon(file.kind);
                          const isSelected = selectedReferenceFilePath === file.path;
                          return (
                            <button
                              key={file.path}
                              type="button"
                              onClick={() => setSelectedReferenceFilePath(file.path)}
                              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${isSelected ? 'bg-[#e6f6ed] text-[#1f2a44]' : 'text-[#687287] hover:bg-white'}`}
                            >
                              <FileIcon size={15} className={isSelected ? 'text-[#21946a]' : 'text-[#9ba09d]'} />
                              <span className="min-w-0 flex-1 truncate">{file.name}</span>
                              <span className="text-[10px] text-[#a1a29e]">{file.size}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                <div className="min-w-0 bg-[#fffdfa] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeae2] pb-4">
                    <div className="flex min-w-0 items-center gap-2">
                      {(() => {
                        const SelectedFileIcon = getReferenceFileIcon(selectedReferenceFile.kind);
                        return <SelectedFileIcon size={17} className="shrink-0 text-[#21946a]" />;
                      })()}
                      <span className="truncate font-mono text-sm text-[#303c55]">{selectedReferenceFile.path}</span>
                    </div>
                    <span className="text-xs text-[#9ba09d]">{selectedReferenceFile.size}</span>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#e4e0d8] bg-[#1f2a44]">
                    {selectedReferenceFile.kind === 'text' && <pre className="max-h-[520px] overflow-auto p-5 text-xs leading-6 text-[#d8f4e6]">{selectedReferenceContent}</pre>}
                    {selectedReferenceFile.kind === 'binary' && <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 bg-[#f7f2e7] p-6 text-center"><FileText size={32} className="text-[#9ba09d]" /><div className="text-sm font-medium text-[#4d5870]">这是模板包中的二进制运行时文件</div><div className="max-w-sm text-xs leading-5 text-[#8b8f9a]">release.bin 不是可读源码，本页面保留文件名和大小用于目录对比，不展开二进制内容。</div></div>}
                    {selectedReferenceFile.kind === 'restricted' && <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 bg-[#fff8e9] p-6 text-center"><FileJson2 size={32} className="text-[#c39b49]" /><div className="text-sm font-medium text-[#8c7041]">个人凭证文件不在页面中展开</div><div className="max-w-sm text-xs leading-5 text-[#8c7041]">这些文件包含 key、receipt 或 signature 信息，只保留目录项供结构对比。</div></div>}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {isReferenceVideoOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
          <button type="button" aria-label="关闭参考视频预览" onClick={() => setIsReferenceVideoOpen(false)} className="absolute inset-0 bg-[#1f2a44]/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-[1080px] rounded-[24px] border border-white/20 bg-[#fffdfa] p-4 shadow-[0_28px_90px_rgba(31,42,68,0.35)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ba09d]">Reference preview</div>
                <h2 className="mt-1 text-lg font-semibold text-[#1f2a44]">MotionGit 点阵手账 · 知识讲解模板</h2>
              </div>
              <button type="button" aria-label="关闭参考视频预览" onClick={() => setIsReferenceVideoOpen(false)} className="rounded-full p-2 text-[#687287] transition hover:bg-[#f4f1eb] hover:text-[#1f2a44]"><X size={20} /></button>
            </div>
            <video autoPlay controls poster="/code-video/reference/reference-poster.png" src="/code-video/reference/reference.mp4" className="aspect-video w-full rounded-2xl bg-black"><track kind="captions" /></video>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b8f9a]"><span>1280×720 · 60 fps · 19.95 秒</span><button type="button" onClick={() => { setIsReferenceVideoOpen(false); setIsReferenceOpen(true); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#cfcac0] px-3 py-1.5 font-medium text-[#59647a] transition hover:border-[#1f2a44] hover:text-[#1f2a44]"><FolderOpen size={14} />查看对应源文件</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
