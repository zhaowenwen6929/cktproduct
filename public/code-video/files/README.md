# 代码视频模板 Demo

这是一个独立的视频模板实验项目，不属于 `multi-agent` Agent 项目。

第一版只验证一条最短链路：

```text
文案 → 模板参数 JSON → 参数校验 → Canvas 逐帧绘制 → MP4
```

当前模板是原创的点阵手账风格 `step-sequence`，不依赖或复制个人 `.motion` 包。

## 环境

- Node.js 22+
- FFmpeg / ffprobe
- Playwright Chromium

如果当前环境还没有 Playwright，执行 `npm install`。本机已有可用的 Playwright 和 Chromium。

## 运行

```sh
npm run validate
npm run compose
npm run preview
npm run render

# 笔画路径实验：真实汉字笔顺 + 笔尖跟随
npm run preview:stroke-lab
npm run render:stroke-lab

# 基础图标路径实验：灯泡、聊天框、书本、旋涡
npm run preview:icon-path-lab
npm run render:icon-path-lab

# 基础连接线路径实验：弧形箭头、折线箭头、双转折、虚线引导
npm run preview:connector-path-lab
npm run render:connector-path-lab

# 结构化脚本 → 动画计划
npm run plan:reference-style

# 使用动画计划渲染 v9（图标和连接线走 SVG 路径）
npm run preview:reference-style-v9
npm run render:reference-style-v9
npm run mix:narration-sfx-v9

# 使用汉字笔画和安全连线渲染 v13
npm run preview:reference-style-v13
npm run render:reference-style-v13
npm run mix:narration-sfx-v13

# 使用自然时长、完整逐字动画和稳定笔尖渲染 v14
npm run plan:reference-style-v14
npm run preview:reference-style-v14
npm run render:reference-style-v14
npm run narration:reference-style-v14
npm run mix:narration-sfx-v14

# 验证 6 步输入的网格排版
npm run plan:reference-style-layout-6
npm run preview:reference-style-layout-6
npm run plan:reference-style-layout-8
npm run preview:reference-style-layout-8
```

输出文件：

- `out/params.json`：结构化模板参数
- `out/preview/`：三个预览帧和预览报告
- `out/demo.mp4`：最终视频
- `out/demo.mp4.json`：视频编码校验报告
- `out/whiteboard-stroke-lab.html`：可拖动时间轴的笔画路径实验
- `out/whiteboard-stroke-lab.svg`：实验最终 SVG 画面
- `out/preview-whiteboard-stroke-lab/`：实验关键帧
- `out/whiteboard-stroke-lab.mp4`：实验短视频
- `out/icon-path-lab.html`：可拖动时间轴的基础图标路径实验
- `out/icon-path-lab.json`：图标来源、路径顺序和时间线数据
- `out/preview-icon-path-lab/`：基础图标实验关键帧
- `out/icon-path-lab.mp4`：基础图标路径实验短视频
- `out/connector-path-lab.html`：可拖动时间轴的基础连接线路径实验
- `out/connector-path-lab.json`：连接线路径、来源和时间线数据
- `out/preview-connector-path-lab/`：基础连接线实验关键帧
- `out/connector-path-lab.mp4`：基础连接线路径实验短视频
- `out/reference-style-plan.json`：由结构化脚本生成的分轨动画计划
- `out/reference-style-plan-v14.json`：按字符数计算文字时长的分轨动画计划
- `src/reference-layout.mjs`：按 2–8 个步骤选择蛇形排版、便签位置、镜头焦点和连接线策略
- `examples/reference-style-layout-6.json`：6 步排版参数样例
- `examples/reference-style-script-layout-6.json`：6 步结构化脚本样例
- `assets/hanzi-writer-data/module-text.json`：模块标签和便签文字的汉字笔画数据

`preview:reference-style-v9` 和 `render:reference-style-v9` 会读取 `out/reference-style-plan.json`；没有传入计划文件时，旧版本仍使用内置时间和 Canvas 兼容绘制。
`preview:reference-style-v13` 和 `render:reference-style-v13` 在此基础上将模块文字改为汉字笔画层，并使用模块内容区的安全锚点绘制连接线。
`preview:reference-style-v14` 和 `render:reference-style-v14` 按文字长度自动计算书写时长，视频总时长由脚本决定，不再固定为 20 秒；旁白使用较慢速率生成，笔尖保持稳定朝向。

## 当前边界

- 只支持点阵手账步骤讲解；
- 只支持标题、2–8 个步骤和结论；超过 8 步建议拆分视频；
- 暂不支持音乐、图片、真人视频和多模板路由；
- 长文本会被校验拒绝，不会自动缩小到不可读；
- `examples/request.txt` 只提供一个确定性文案解析示例，不代表最终 Agent。
