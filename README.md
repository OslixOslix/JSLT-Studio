<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1D5Ev_nB_SmsPVfW88qOla_PES45QfLLA

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with Docker

1. Export your Gemini key so it can be embedded at build time:
   ```bash
   export GEMINI_API_KEY="your-api-key"
   ```
2. Build and start the containerized app (project name: `jslt-studio`):
   ```bash
   docker-compose up --build
   ```
   The app will be available at http://127.0.0.1:8083 (mapped to container port 80).
