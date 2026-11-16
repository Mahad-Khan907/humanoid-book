---
id: 6
title: Unify Frontend and Backend into Fullstack Vercel Serverless Architecture
stage: general
date: 2026-11-16
surface: agent
model: baidu/ernie-5.5-flash-preview:free
feature: none
branch: main
user: Mahad Khan
command: git push origin main
labels: [vercel, serverless, fullstack, unified, qdrant, better-auth, openrouter]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - api/ask.js
  - api/auth/[...all].js
  - vercel.json
  - docusaurus.config.ts
  - src/components/ChatWidget/index.tsx
tests:
  - api/ask.js local execution (status 200, retrieved Qdrant context & Baidu Ernie reply)
  - npm run build (static generation passed in 52s)
  - git push origin main (clean push, no secrets exposed)
---

## Prompt

```text
kuch esa ho sakta hai tum apas me sab combine karo or updated github par push karo or me sara project aik sath vercel par deploy kar do sab work kare
```

## Response snapshot

1. Built a unified fullstack serverless architecture so the entire app (Frontend + Auth Backend + AI RAG Backend) deploys directly to Vercel in one single place.
2. Created `api/ask.js` as a Vercel Serverless Function that queries Cohere embeddings and the Qdrant cluster directly via REST API, then calls OpenRouter (`baidu/ernie-5.5-flash-preview:free`).
3. Created `api/auth/[...all].js` as a Vercel Serverless Function running Better-Auth with the Neon PostgreSQL database.
4. Updated `vercel.json` with serverless rewrites and updated `ChatWidget` and `docusaurus.config.ts` to use relative `/api/*` endpoints.
5. Successfully pushed commit `cecc2b6` to GitHub `https://github.com/Mahad-Khan907/humanoid-book`.

## Outcome

- ✅ Impact: User does not need Hugging Face or external backend servers anymore; the entire book, AI RAG chatbot, and auth deploy together on Vercel.
- 🧪 Tests: Serverless function tested locally with 200 OK; build tested; git push passed.
- 📁 Files: `api/ask.js`, `api/auth/[...all].js`, `vercel.json`, `docusaurus.config.ts`, `src/components/ChatWidget/index.tsx`.
- 🔁 Next prompts: Deploy repository on Vercel and add environment variables.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Next experiment (smallest change to try): Add environment variables in Vercel project settings.
