# Lecture Usage Guide — SDL Course App (Lecture MVP)

状态: active
日期: 2026-06-04

## 1. Online Link

**Production URL**: https://sdl-lecture.vercel.app

## 2. Lecture MVP Path (Main Routes)

For a 3-hour graduate lecture, follow this sequence:

| Order | Route | Topic | Type |
|-------|-------|-------|------|
| 1 | `/` | Course entry — what this is, who it's for | Narrative |
| 2 | `/course` | Full course map — where this lecture fits | Orientation |
| 3 | `/foundations#sec-experiment-history` | Experiment: history and evolution | Content |
| 4 | `/foundations#sec-taxonomy` | MSE experiment taxonomy (8 categories) | Content |
| 5 | `/foundations#doe-vs-sdl` | DOE vs SDL: 7-dimension comparison table | Content |
| 6 | `/foundations#sec-sdl-concepts` | SDL core concepts (surrogate, uncertainty, acquisition, closed-loop) | Content |
| 7 | `/a-lab` | A-Lab case file: problem, system, results, controversy, lessons | Case study |
| 8 | `/case-studio` | **Live demo**: RGB LED closed-loop optimization | Demonstration |

## 3. Case Studio Demo Script (~5 minutes)

### Preparation (before lecture)

1. Open `/case-studio` in a separate browser tab
2. Verify it shows "LIVE" badge and seed=42
3. Confirm "NEXT RECOMMENDATION" panel has values (not blank)
4. Note: after a browser refresh, the page resets to initial state — this is intentional

### Step-by-step demo

**Step 1: Starting state (30s)**
```
-- Show: three-column layout (Target / Best So Far / Next Recommendation)
-- Say: "This is a live SDL closed loop. Left: our target — a warm orange color.
        Center: our best result so far — empty because we haven't started.
        Right: the model's next recommendation — based on the GP prior."
-- Point: "Seed=42 means every run produces the identical sequence. Reproducibility."
```

**Step 2: First experiment (45s)**
```
-- Click: [Run 1 Step]
-- Point: "Row 1 appears in the history table. Note the recommendation explanation:
          [Initial] — no prior data, so the first point is quasi-random."
-- Say: "The GP now has one data point. Watch how the next recommendation changes."
```

**Step 3: Second and third experiments (60s)**
```
-- Click: [Run 1 Step] twice more
-- Point: "The recommendation explanation may show [Exploration] or [Balanced].
          The GP is deciding between exploring unknown regions vs exploiting known ones."
-- Point: "Look at the Best So Far panel — the score and color are improving."
```

**Step 4: Rapid convergence (30s)**
```
-- Click: [Run 5 Steps]
-- Say: "5 steps at once. Watch Best So Far converge toward the target orange."
-- Point: "After about 8-10 total iterations, the model typically finds the right region."
```

**Step 5: Reproducibility proof (45s)**
```
-- Click: [Reset (Seed 42)]
-- Say: "Reset clears everything. Same seed, same starting point."
-- Click: [Run 5 Steps]
-- Say: "Same 5 steps, same results. This is critical: autonomous experiments
        must be reproducible, or we cannot trust the conclusions."
```

**Step 6: Summary (30s)**
```
-- Say: "Three things to remember:
        1. Gaussian Process acts as a surrogate model — it learns from sparse data
        2. Expected Improvement balances explore vs exploit
        3. Closed loop: recommend → execute → observe → update → repeat
        This is the same logic A-Lab uses, just in a 3D color space instead of a
        high-dimensional chemistry space."
```

## 4. Key Numbers for the RGB LED Demo

| Metric | Value | Note |
|--------|-------|------|
| Parameters | 3 (R, G, B PWM 0-100%) | Simple enough to visualize |
| Target | `rgb(180, 120, 60)` | Warm orange/amber |
| Metric | Color distance → match score (0-100) | Higher = closer to target |
| Seed | 42 (fixed) | Deterministic reproducibility |
| Typical convergence | 8-12 iterations | Score > 95 |
| RNG | mulberry32 PRNG | Pure JS, no external deps |

## 5. Fallback Plan: If Online Version is Unavailable

### Option A: Local dev server

```bash
cd D:\A-Lab\sdl-lecture
conda activate sdl-course
npm run dev
# Opens at http://localhost:3000
```

All pages and the Case Studio demo work identically in local dev mode.

### Option B: Local production preview

```bash
cd D:\A-Lab\sdl-lecture
conda activate sdl-course
npm run build
npx vite preview
# Opens at http://localhost:4173
```

This serves the exact same build output as the Vercel deployment.

### Option C: Screenshot backup

If all else fails, the lecturer should have screenshots of:
1. The Foundations DOE vs SDL comparison table
2. The A-Lab problem/system/controversy panels
3. The Case Studio workbench layout

## 6. Known Limitations in Lecture MVP

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| Only 1 live case (RGB LED) | Can't demo chemistry cases live | Show A-Lab page as case study, explain SnAr/perovskite conceptually |
| No GP contour visualization | Can't show surrogate surface | Describe verbally; GP visualization planned for Phase 2 |
| Methods Lab is placeholder | Can't show method comparison interactively | Use Foundations DOE vs SDL table instead |
| Design Studio is placeholder | Can't do live research design exercise | Use whiteboard or discussion instead |
| No offline fallback beyond local | Requires internet for online version | Keep local `npm run dev` ready as backup |

## 7. Post-Lecture Student Access

After the lecture, share the online URL with students. They can:

1. Browse all course and foundations content independently
2. Re-read the A-Lab case file with all source references
3. Run the RGB LED demo themselves (each browser session starts fresh with seed=42)
4. See the same results the lecturer demonstrated (deterministic seed)

Suggested student task (~20-30 min):
1. Start at `/course` — read the course map
2. Go to `/a-lab` — read the controversy section (05)
3. Go to `/case-studio` — run the demo 10 steps, then reset and try to predict
   what happens differently if the model were more "exploratory" vs "exploitative"
