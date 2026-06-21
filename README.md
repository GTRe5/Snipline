# snipline

A real-time URL shortener built with Next.js (App Router), TypeScript, and Tailwind CSS — ready to deploy on Vercel.

Paste a long link, get a short one back instantly, with optional custom aliases, live click tracking, and a manifest of every link you've created.

## Stack

- **Next.js 16** (App Router, Server Components, Route Handlers)
- **TypeScript** throughout
- **Tailwind CSS v4** for styling, with a small custom design-token system (see `src/app/globals.css`)
- **Framer Motion** for the handful of intentional micro-interactions
- **Upstash Redis** for persistent storage in production, with an automatic in-memory fallback for local development

## Project structure

```
src/
  app/
    page.tsx               Home page (hero + the shortener app)
    layout.tsx              Fonts, theme bootstrap, header/footer
    globals.css              Design tokens (colors, fonts, dark mode)
    not-found.tsx            Branded 404, also shown for unknown short codes
    [code]/page.tsx          Looks up a code, tracks the click, redirects
    api/
      shorten/route.ts       POST — create a short link
      stats/route.ts         POST — fetch current click counts for a batch of codes
  components/
    site-header.tsx, site-footer.tsx, theme-toggle.tsx, status-dot.tsx
    shortener/
      shortener-app.tsx      Wires the form + ledger together via shared state
      shortener-card.tsx     The URL input, alias toggle, and submit button
      link-result.tsx        The "snipped" reveal shown after creating a link
      link-ledger.tsx        The recent-links table
      ledger-row.tsx, copy-button.tsx
  hooks/
    use-link-history.ts      localStorage persistence + polling for live click counts
  context/
    theme-provider.tsx       Light/dark theme, persisted, no flash on load
  lib/
    store.ts                 Storage abstraction (Redis or in-memory)
    validators.ts             URL + alias validation
    codegen.ts                Short-code generation
    types.ts
```

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without any extra configuration, links are stored in memory — fine for trying things out, but they'll reset whenever the dev server restarts.

## Persistent storage (recommended for production)

Serverless functions on Vercel don't share memory between invocations, so the in-memory fallback isn't suitable for a live deployment — links could disappear or click counts could get out of sync. To fix that, connect Upstash Redis (it has a free tier and pairs natively with Vercel):

1. In your Vercel project dashboard: **Storage → Create Database → Upstash for Redis** (or create one directly at console.upstash.com and connect it manually).
2. Vercel will automatically add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to your project's environment variables.
3. For local development, copy the same two values into a `.env.local` file (see `.env.example`).

That's it — `src/lib/store.ts` detects the environment variables automatically and switches from the in-memory store to Redis with no code changes needed.

## Deploying to Vercel

**Option A — Vercel CLI**

```bash
npm install -g vercel
vercel
```

**Option B — GitHub**

1. Push this project to a GitHub repository.
2. Go to vercel.com/new and import the repository.
3. Vercel auto-detects Next.js — no build configuration needed.
4. Add the Upstash Redis integration (see above) before or after the first deploy.

## How it works

- **Shortening** — `POST /api/shorten` validates the URL, generates a 7-character code (or checks your custom alias for availability), and stores the mapping. It's rate-limited per IP (30 links / 10 minutes) to keep the manifest from being flooded.
- **Redirecting** — visiting `/{code}` looks up the destination, increments its click counter, and redirects — all server-side, before any page renders.
- **Real-time updates** — the browser keeps a local list of links you've created (in `localStorage`) and polls `/api/stats` every few seconds to refresh click counts, so the ledger reflects clicks happening anywhere, not just on your screen.

## Customizing

- **Code length / alphabet** — `src/lib/codegen.ts`
- **Colors, fonts, dark mode** — `src/app/globals.css`
- **Rate limit** — `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` in `src/lib/store.ts`
- **History size / poll frequency** — `MAX_HISTORY` / `POLL_INTERVAL_MS` in `src/hooks/use-link-history.ts`
