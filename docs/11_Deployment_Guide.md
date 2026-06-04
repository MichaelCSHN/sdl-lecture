# Deployment Guide — SDL Course App (Lecture MVP)

状态: active
日期: 2026-06-04

## 1. Overview

The Lecture MVP is a static SPA deployed to Vercel. No server, no database, no
backend — just static HTML/CSS/JS served from a CDN edge network.

**Online URL**: https://sdl-lecture.vercel.app

## 2. Tech Stack (Deployment View)

| Layer | Technology | Version Requirement |
|-------|-----------|---------------------|
| Runtime | Node.js | **22** (>=22.12 required by Vite 7) |
| Package manager | npm | Bundled with Node |
| Build tool | Vite + tsc | Vite 7.x, TypeScript 5.9 |
| Framework | React + react-router | React 19, react-router 7 |
| Hosting | Vercel (static) | — |

## 3. Build Commands

```bash
# Install dependencies
npm install

# Type-check + build
npm run build
# Equivalent to: tsc -b && vite build

# Build output directory
dist/

# Local preview (simulates production)
npx vite preview
```

## 4. Node Version

### How we lock it

1. `.nvmrc` — specifies `22`. Vercel reads this at build time to select
   the correct Node.js build image.
2. `package.json` `engines` field — `"node": "^20.19.0 || >=22.12.0"`.
   This is the authoritative constraint. Vercel also respects this field.

### Why 22?

Vite 7 requires Node.js >=20.19.0 or >=22.12.0. Node 22 is the current
LTS and is fully supported on Vercel.

### Avoid Node 22.11.0

Node 22.11.0 is known to have issues with some native modules. The
lock file ensures Vercel picks the latest Node 22 patch release.

## 5. SPA Routing

All client-side routes must serve `index.html` so that react-router
can handle navigation. If a user refreshes on `/a-lab`, the server
must return the SPA shell, not a 404.

### vercel.json rewrite rule

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This sends every request to `index.html`. React-router then reads the URL
and renders the correct page component.

### Verified routes

After deployment, these paths must load directly (no 404):

| Path | Page |
|------|------|
| `/` | Home (course entry) |
| `/course` | Course map |
| `/foundations` | Foundations (experiment history, taxonomy, DOE vs SDL, SDL concepts) |
| `/a-lab` | A-Lab case file |
| `/case-studio` | Case Studio (RGB LED live demo) |
| `/methods` | Methods Lab (placeholder) |
| `/design-studio` | Design Studio (placeholder) |
| `/resources` | Resources (placeholder) |

### Asset caching

Static assets in `/assets/*` are served with immutable cache headers
(`Cache-Control: public, max-age=31536000, immutable`) because Vite
generates content-hashed filenames (`index-C-ChT0vX.js`).

## 6. How to Deploy (Vercel)

### First-time setup

```bash
# Install Vercel CLI globally (one time)
npm i -g vercel

# Login (one time)
vercel login

# Link project (one time, from project root)
vercel link
```

### Every deploy

```bash
# Deploy preview (staging URL, no production alias)
vercel

# Deploy to production
vercel --prod
```

### CI/CD notes

If connecting the GitHub repo to Vercel:
1. Go to [vercel.com](https://vercel.com) → "Add New Project"
2. Import the repository
3. Vercel auto-detects Vite from `vite.config.ts`
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Install command: `npm install`
8. Set Node version: Vercel reads `.nvmrc` automatically

Every push to `main` will trigger a production deploy.

## 7. How to Update

1. Make changes locally
2. `npm run build` — verify locally
3. Commit and push to `main`
4. Vercel auto-deploys from `main` (if CI is configured)
5. Or manually: `vercel --prod`

## 8. Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Build fails on Vercel but passes locally | Node version mismatch | Check `.nvmrc` has `22` |
| Route gives 404 on refresh | SPA rewrite not applied | Check `vercel.json` rewrites |
| Assets 404 | `base` in vite.config changed | Must be `'./'` for relative paths |
| Build timeout | Vercel free tier has 45-min timeout | Normal build takes ~2 min, fine |
| `tsc -b` fails | TypeScript errors introduced | Run `npm run build` locally before push |
