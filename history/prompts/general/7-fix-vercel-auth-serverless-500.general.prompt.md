---
id: 7
title: Fix Vercel Serverless Function 500 for Better-Auth Handler
stage: general
date: 2026-11-16
surface: agent
model: baidu/ernie-5.5-flash-preview:free
feature: none
branch: main
user: Mahad Khan
command: git push origin main
labels: [vercel, serverless, better-auth, bugfix, 500-error]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - api/auth/[...all].js
tests:
  - Simulated Web Request/Response flow with auth.handler (Status 200 OK, valid token returned)
  - git push origin main (exited 0)
---

## Prompt

```text
https://book-bymahad.vercel.app/   yai mera vercel deployment url hai dekho kyo 500 ka error de raha hai
```

## Response snapshot

1. Diagnosed the 500 error (`FUNCTION_INVOCATION_FAILED`): `better-auth/node`'s `toNodeHandler` with Express wrapper expected internal socket TLS properties that Vercel serverless environment does not provide.
2. Refactored `api/auth/[...all].js` to use Better-Auth's native Web Standard `auth.handler(webReq)` with URL and header adaptation.
3. Verified locally with test signup query returning status 200 and session token.
4. Pushed commit `5c89aa6` to GitHub.

## Outcome

- ✅ Impact: Auth serverless function on Vercel is fixed; Vercel auto-deploys the update.
- 🧪 Tests: Local simulation passed with status 200 and generated token.
- 📁 Files: `api/auth/[...all].js`.
- 🔁 Next prompts: Wait for Vercel redeployment and test signup again on live site.

## Evaluation notes (flywheel)

- Failure modes observed: Express adapter incompatibility with Vercel serverless runtime.
- Graders run and results (PASS/FAIL): PASS
- Next experiment (smallest change to try): Test signup on https://book-bymahad.vercel.app/register.
