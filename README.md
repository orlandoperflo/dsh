# Eternity Operator Workspace

Internal operational intelligence compiler for Eternity operators. Upload company intelligence, run an analysis pipeline, inspect generated workflows/agents/memory/architecture, and generate a copyable production-ready client repository structure.

## Run locally

```bash
npm install
npm run dev
```

## OpenAI setup

For local development, create `.env.local` from `.env.example` and set `OPENAI_API_KEY`. If no key is present, the app uses a deterministic fallback pipeline so the workspace and repository generator still work locally.

For Vercel, add the key in **Project Settings → Environment Variables**:

```bash
OPENAI_API_KEY=sk-...
```

The `/api/analyze` route reads this value at server runtime, so the key never needs to be exposed to the browser. After adding or changing the Vercel environment variable, redeploy the project so the serverless function receives the updated environment.

You can verify the deployed environment without exposing the secret by visiting:

```text
https://your-vercel-domain.vercel.app/api/analyze
```

A working Vercel setup returns JSON with `openai.configured: true` and the environment variable name being used. Then run orchestration from the workspace; `Mode: openai` plus the success message `OpenAI generation received successfully` means the context was sent to OpenAI and the generated JSON was received and validated. If you see a fallback message, the dashboard is deterministic template output rather than a live OpenAI generation.

The API also checks `OPEN_AI_API_KEY` as a compatibility alias, but `OPENAI_API_KEY` is preferred.

## Vercel deployment

This is a Next.js App Router application using serverless API routes. Import the repository into Vercel, add `OPENAI_API_KEY`, and deploy with the default Next.js preset.
