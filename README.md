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
