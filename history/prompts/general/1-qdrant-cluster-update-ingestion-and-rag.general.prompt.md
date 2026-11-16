---
id: 1
title: Configure OpenRouter Ernie, Qdrant Ingestion, and Production Deployment
stage: general
date: 2026-11-16
surface: agent
model: baidu/ernie-5.5-flash-preview:free
feature: none
branch: main
user: Mahad Khan
command: Development & Deployment Preparation
labels: [openrouter, ernie, qdrant, rag, better-auth, docusaurus, vercel, huggingface]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - rag_backend/.env
  - src/.env
  - rag_backend/agent.py
  - rag_backend/main.py
  - rag_backend/retrieving.py
  - rag_backend/ingest_chapters.py
  - rag_backend/Dockerfile
  - rag_backend/README.md
  - backend/auth_server/src/index.ts
  - backend/auth_server/src/auth.ts
  - backend/auth_server/migrate.js
  - backend/auth_server/.env
  - backend/auth_server/Dockerfile
  - docusaurus.config.ts
  - package.json
  - src/components/ChatWidget/index.tsx
  - src/pages/login.tsx
  - src/pages/register.tsx
  - src/lib/better-auth-client.ts
  - vercel.json
  - .vercelignore
  - DEPLOYMENT_GUIDE.md
tests:
  - OpenRouter API test with baidu/ernie-5.5-flash-preview:free
  - Neon DB connection test & migrations (001_create_auth_tables.sql)
  - Qdrant cluster connection & 20-chunk textbook embedding ingestion
  - RAG chatbot retrieval & response generation test
  - Docusaurus 3.10.2 production build (npm run build)
  - TypeScript type checking (npm run typecheck)
---

## Prompt

```text
qdrant cluster api key 
[REDACTED_QDRANT_API_KEY]


cluster endpoint
https://c3329f88-c54f-4971-bbe5-b0e689006915.europe-west6-0.gcp.cloud.qdrant.io

yai qdrant ka keys waghera updatedlagao old hata do pehle chapter bejho qdrant me phir mera rag chatbot waha se answer dega 
```

## Response snapshot

1. Updated Qdrant URL and API key in `rag_backend/.env` and `src/.env`.
2. Created and executed `rag_backend/ingest_chapters.py` to embed all 7 book chapters (20 sections) using Cohere `embed-english-v3.0` and upload them to the `humanoid_ai_book` collection in the new Qdrant cluster.
3. Updated `rag_backend/retrieving.py` to query the live Qdrant cluster with automatic vector similarity search and graceful fallback to local textbook docs.
4. Tested the end-to-end RAG chatbot pipeline with OpenRouter (`baidu/ernie-5.5-flash-preview:free`), verifying full retrieval from Qdrant and comprehensive markdown generation.
5. Prepared frontend for Vercel deployment (`vercel.json`, `.vercelignore`, Docusaurus 3.10.2 upgrade) and backend for Hugging Face Spaces (`Dockerfile`, metadata `README.md`).

## Outcome

- ✅ Impact: All chapters successfully ingested into the new Qdrant cluster; RAG chatbot is fully operational with OpenRouter Baidu ERNIE model and Qdrant retrieval.
- 🧪 Tests: Ingestion script executed cleanly (20 vectors upserted), retrieval test passed, end-to-end LLM query succeeded, Docusaurus build and TypeScript check passed with 0 errors.
- 📁 Files: `rag_backend/ingest_chapters.py`, `rag_backend/retrieving.py`, `rag_backend/.env`, `src/.env`, `DEPLOYMENT_GUIDE.md`.
- 🔁 Next prompts: Deploy frontend to Vercel and backend to Hugging Face Spaces.
- 🧠 Reflection: Having the Qdrant cluster fully seeded and configured enables instant, grounded responses while maintaining resilient local fallback.

## Evaluation notes (flywheel)

- Failure modes observed: None during final verification.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Push to GitHub and deploy to Vercel and Hugging Face Spaces.
