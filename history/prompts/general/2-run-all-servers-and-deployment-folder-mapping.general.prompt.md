---
id: 2
title: Run Frontend and Backend Servers and Deployment Folder Mapping
stage: general
date: 2026-11-16
surface: agent
model: baidu/ernie-5.5-flash-preview:free
feature: none
branch: main
user: Mahad Khan
command: Development & Deployment Guidance
labels: [servers, localhost, vercel, huggingface, deployment, docusaurus, fastapi]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/auth_server/src/index.ts
  - backend/auth_server/src/auth.ts
  - DEPLOYMENT_GUIDE.md
tests:
  - Frontend HTTP 200 check (http://localhost:3002/)
  - RAG Backend status online check (http://localhost:7860/)
  - Auth Server status OK check (http://localhost:3001/)
---

## Prompt

```text
muhe run kar ky do frontend and backend both or mujhe batao konsi folder vercel par deploy karna hai or konsa hugging face
```

## Response snapshot

1. Checked active system ports; detected port 3000 was in use by another Next.js process, so mapped Docusaurus frontend to port 3002 and updated Auth allowedOrigins.
2. Started all 3 components as persistent background daemon services:
   - Auth Backend (Better-Auth + Neon DB) on http://localhost:3001
   - RAG AI Backend (FastAPI + Qdrant + OpenRouter Ernie) on http://localhost:7860
   - Frontend (Docusaurus 3.10.2) on http://localhost:3002
3. Verified all 3 servers return HTTP 200 / status: online.
4. Provided exact folder-by-folder instructions for Vercel and Hugging Face Spaces deployments.

## Outcome

- ✅ Impact: Frontend and backend servers are running live simultaneously. User has clear deployment mapping.
- 🧪 Tests: Node fetch tests verified all 3 endpoints simultaneously.
- 📁 Files: `backend/auth_server/src/index.ts`, `backend/auth_server/src/auth.ts`, `DEPLOYMENT_GUIDE.md`.
- 🔁 Next prompts: Open http://localhost:3002 in browser to interact with the textbook and chatbot.

## Evaluation notes (flywheel)

- Failure modes observed: Port 3000 busy with existing process -> cleanly resolved with port 3002.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Test signup and AI chat in the browser.
