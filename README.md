<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5cc29dc5-8529-4080-802d-173a25388911

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 自动化验证平台 Runner

自动化验证平台默认使用 Mock Runner；需要执行真实接口或浏览器操作时，另开一个终端启动本地 Runner：

1. `npm run dev`
2. `npm run eval-runner`

Runner 默认监听 `http://localhost:4174`，支持 HTTP 接口请求和 Playwright 浏览器步骤。浏览器用例只允许访问工作台配置的域名白名单；需要登录的 Moni 页面可在“接口配置”中选择“Moni 登录态文件”，填写本地 Runner 可读取的 Playwright `storageState` 文件路径；登录态失效会返回明确的执行失败。Token、Cookie 和登录态文件不要提交到 Git。如需指定 Chrome 路径，可设置 `BROWSER_EXECUTABLE_PATH`，如需显示浏览器窗口可设置 `EVAL_HEADLESS=0`。

评测平台按“测试项目 → 测试需求 → 测试用例 → 执行结果”组织。访问 `/agent-eval` 后先选择测试项目，再进入项目内的测试需求；新建测试需求后会直接进入对应工作台。测试项目和测试需求均支持删除，删除前必须二次确认；删除项目会级联清理所属需求和本地用例数据。

### 测试用例输出规范

测试用例不要求必须对应已有产品需求文档，也可以直接针对开发完成的页面、功能、Agent、Skill、API 或 Workflow 输出。平台提供“用例规范”入口和模板，标准包格式为 `ckt-eval/v1`，顶层包含 `requirement` 与 `cases`：

```text
测试项目 → 测试需求 → 测试用例 → 执行结果
```

测试需求应提供编号、名称、验证目标、页面/功能路径、版本或发布批次、测试范围、环境、前置条件和测试数据。每条用例应提供稳定 ID、`kind`、`mode`、测试对象、输入、步骤/请求、可判定期望结果、优先级和标签；浏览器步骤优先使用 `data-testid` 等稳定选择器，并配置 `allowedHosts`。完整字段和 JSON 示例见[自动化验证平台测试用例规范](/Users/zhaowenwen/Cursor/创客贴-无限画布/docs/自动化验证平台测试用例规范.md)。

## Public Deployment

This project can be deployed as a static Vite site.

- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback: see [vercel.json](/Users/zhaowenwen/Cursor/创客贴-无限画布/vercel.json)

Before publishing to a public URL, note the current architecture:

- The frontend currently calls Gemini directly.
- That means a real production deployment must move Gemini calls to a backend or Serverless API.
- If you only need a public demo flow, keep mock generation enabled and do not expose a real API key in the frontend bundle.
- This repository currently defaults production builds to demo mode via `.env.production` with `SKIP_GENERATION=true`.

Deployment guide:
- [公网部署指南](/Users/zhaowenwen/Cursor/创客贴-无限画布/docs/公网部署指南.md)
