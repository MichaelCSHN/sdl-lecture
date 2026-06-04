# Deployment Guide — SDL Course App (Lecture MVP)

状态: active
日期: 2026-06-04

## 1. Overview

The Lecture MVP is a static SPA deployed to Vercel. No server, no database, no
backend — just static HTML/CSS/JS served from a CDN edge network.

**Online URL**: https://sdl-lecture.vercel.app

## 2. Tech Stack (Deployment View)

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime (Vercel) | Node.js | 22 (via `.nvmrc`) |
| Runtime (local) | Node.js | 22.13.0 (via conda `sdl-course`) |
| Package manager | npm | 10.9.2 |
| Build tool | Vite | 7.3.0 |
| TypeScript | tsc | 5.9 |
| Framework | React + react-router | 19 + 7 |

## 3. Local Build Commands

**The correct invocation on Windows (PowerShell):**

```powershell
# Prepend conda env to PATH so Node 22.13.0 resolves first
$env:Path = "D:\anaconda3\envs\sdl-course;" + $env:Path

# Verify you're on the right Node
node --version   # must show v22.13.0 (NOT v22.11.0)

# Install dependencies (first time only)
npm install

# Type-check + build
npm run build    # equivalent: tsc -b && vite build

# Local dev server (hot reload, port 3000)
npm run dev

# Preview production build locally (port 4173)
npx vite preview
```

**⚠️ Do NOT run `npm run build` without the PATH override.** The system Node
(`D:\Program Files\nodejs\node.exe`) is v22.11.0, which triggers:

```
You are using Node.js 22.11.0. Vite requires Node.js version 20.19+ or 22.12+.
```

The build still succeeds on 22.11.0, but the warning indicates the Node version
is outside Vite's supported range. Use the conda env Node (22.13.0) for all
lecture-day operations.

## 4. Node Version: Root Cause Analysis

### The problem

The system PATH has `D:\Program Files\nodejs\` (Node 22.11.0) before the conda
env directory. Running `npm` or `node` without explicit PATH management picks
up the unsupported 22.11.0.

### What "locked" means — honestly

| Environment | Node version | How it's controlled | Status |
|------------|-------------|-------------------|--------|
| **Vercel build** | 22 (latest patch) | `.nvmrc` | ✅ Locked — Vercel reads `.nvmrc` and selects the correct build image |
| **conda env `sdl-course`** | 22.13.0 | `environment.yml` (`nodejs=22.13`) | ✅ Locked — conda manages this |
| **System global** | 22.11.0 | Installed at `D:\Program Files\nodejs\` | ❌ NOT locked — this is the user's pre-existing installation |

The `.nvmrc` lock works for Vercel. The `environment.yml` lock works for conda.
But neither controls which `node` resolves from a plain PowerShell prompt —
that's determined by the user's PATH order.

### How to ensure the right Node

Always run one of these before any npm command:

```powershell
# Option A: PATH override (recommended for lecture day)
$env:Path = "D:\anaconda3\envs\sdl-course;" + $env:Path

# Option B: Use conda run (best for one-off commands)
conda run -n sdl-course node --version
```

When in doubt, run `node --version` first. If it says `v22.11.0`, apply the PATH
override.

## 5. SPA Routing

### vercel.json rewrite rule

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

All requests go to `index.html`. React-router handles client-side routing.

### Verified routes (all return HTTP 200, tested 2026-06-04)

| Path | Page | Status |
|------|------|--------|
| `/` | Home (course entry) | ✅ |
| `/course` | Course map | ✅ |
| `/foundations` | Foundations | ✅ |
| `/a-lab` | A-Lab case file | ✅ |
| `/case-studio` | Case Studio (RGB LED live) | ✅ |
| `/methods` | Methods Lab (placeholder) | ✅ |
| `/design-studio` | Design Studio (placeholder) | ✅ |
| `/resources` | Resources (placeholder) | ✅ |

### Asset caching

`/assets/*` files have content-hashed names (`index-C-ChT0vX.js`) and are served
with `Cache-Control: public, max-age=31536000, immutable`.

## 6. Vercel Deploy Workflow

### First-time setup (one time)

```bash
npx vercel login
```

### Deploy to production

```bash
# From project root
npx vercel --prod --yes
```

Note: `npx vercel` may pick up system Node 22.11.0. This is fine — the Vercel
CLI just uploads files; the actual build runs on Vercel's infrastructure which
uses Node 22 (via `.nvmrc`).

### CI/CD (optional)

Connect the GitHub repo at [vercel.com](https://vercel.com):
1. Import repository → Vercel auto-detects Vite
2. Build command: `npm run build`
3. Output directory: `dist`
4. Node version: auto-detected from `.nvmrc`

Every push to `main` triggers a production deploy.

## 7. Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Vite warns about Node 22.11.0 | System Node in PATH | Apply `$env:Path = "D:\anaconda3\envs\sdl-course;" + $env:Path` first |
| `conda run` encoding error | GBK codec can't handle build output | Use PATH override instead of `conda run` for `npm run build` |
| Route gives 404 on refresh | SPA rewrite not applied | Check `vercel.json` rewrites |
| Assets 404 online | `base` in vite.config changed | Must be `'./'` for relative paths |
| Build fails on Vercel but passes locally | Node version mismatch | Check `.nvmrc` has `22` |
