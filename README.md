# Eternity Operator Workspace

Internal operational intelligence compiler for Eternity operators. Upload company intelligence, run an analysis pipeline, inspect generated workflows/agents/memory/architecture, and generate a copyable production-ready client repository structure.

## Run locally

```bash
npm install
npm run dev
```

## OpenAI setup

Create `.env.local` from `.env.example` and set `OPENAI_API_KEY`. If no key is present, the app uses a deterministic fallback pipeline so the workspace and repository generator still work locally.

## Vercel deployment

This is a Next.js App Router application using serverless API routes. The app pins Next.js to a patched 15.3.x release to satisfy Vercel security checks for CVE-2025-66478. Import the repository into Vercel, add `OPENAI_API_KEY`, and deploy with the default Next.js preset. After deployment, verify the homepage loads and the repository generator can run in deterministic fallback mode without an OpenAI key.
