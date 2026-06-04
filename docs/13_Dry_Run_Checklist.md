# Lecture Dry Run Checklist — SDL Course App

状态: active
日期: 2026-06-04

## 1. Before the Lecture (30 min before)

### Environment check

- [ ] Open PowerShell in `D:\A-Lab\sdl-lecture`
- [ ] Run: `$env:Path = "D:\anaconda3\envs\sdl-course;" + $env:Path`
- [ ] Run: `node --version` → must show `v22.13.0` (NOT v22.11.0!)
- [ ] Run: `npm run build` → must pass with 0 errors, no Vite warning
- [ ] Close any apps that might interfere (VPN, heavy IDEs, streaming)

### Online availability check

- [ ] Open https://sdl-lecture.vercel.app in browser → must load
- [ ] Navigate to `/course` → must show course map
- [ ] Navigate to `/foundations` → must show experiment timeline + taxonomy + DOE vs SDL + SDL concepts
- [ ] Navigate to `/a-lab` → must show A-Lab case file (7 sections)
- [ ] Navigate to `/case-studio` → must show "LIVE" badge, not blank

### Local fallback check

- [ ] Run: `npm run dev` → opens at http://localhost:3000
- [ ] Verify all 5 main routes load locally
- [ ] Keep this terminal open (minimized) during the lecture — it's your hot spare

## 2. Case Studio Pre-Flight (5 min before demo)

- [ ] Open `/case-studio` in a clean browser tab (not the same window as your slides)
- [ ] Verify: shows **"LIVE"** badge (green) next to "RGB LED Color Matching"
- [ ] Verify: **Seed: 42** is displayed in the header bar
- [ ] Verify: **"NEXT RECOMMENDATION"** panel shows parameter values (not blank or "—")
- [ ] Verify: **History table** is empty (if not, click Reset)
- [ ] Verify: **Best So Far** panel shows "No experiments yet. Run a step to begin."
- [ ] Test click: **Run 1 Step** → a row appears in history, Best So Far updates
- [ ] Test click: **Reset** → history clears, back to initial state
- [ ] Restore clean state: Reset one more time

### What "normal" looks like

| Element | Expected |
|---------|----------|
| Target panel | Warm orange swatch, `rgb(180, 120, 60)` |
| Next Recommendation | 3 PWM values (e.g., `R 45.2% G 67.8% B 23.1%`), explanation text |
| History table | Empty (after reset) |
| Controls | 3 buttons with icons — Run 1 Step, Run 5 Steps, Reset |
| Seed | `42` |

### If Case Studio is not working

1. **Problem: page is blank or shows no content**
   - Wait 3 seconds for JS bundle to load (Vercel CDN + cold start on first visit)
   - Hard refresh: `Ctrl+Shift+R`
   - If still broken: switch to local `http://localhost:3000/case-studio`

2. **Problem: recommendation panel shows "—" or NaN**
   - This means the case engine failed to initialize (unlikely with seed=42)
   - Refresh the page
   - If persistent: switch to local dev server

3. **Problem: Run 1 Step does nothing**
   - Check browser console (F12) for JS errors
   - The case engine is pure client-side JS — no network dependency
   - Refresh and try again

## 3. Lecture Path Walkthrough (10 min dry run)

Walk through the exact sequence, using the online version if possible:

- [ ] **Stop 1: `/`** — scroll down, verify three entry cards (Start Course / Case Studio / A-Lab) are visible
- [ ] **Stop 2: `/course`** — verify 10 lectures in 3 modules, Lecture MVP badges visible on lectures 01, 02, 05, 07, 08, 09
- [ ] **Stop 3: `/foundations#sec-experiment-history`** — scroll to the timeline, test the category filter (click Methodology, click All)
- [ ] **Stop 4: `/foundations#sec-taxonomy`** — verify 8 taxonomy categories are visible
- [ ] **Stop 5: `/foundations#doe-vs-sdl`** — verify the DOE vs SDL comparison table is visible and has 7 rows
- [ ] **Stop 6: `/foundations#sec-sdl-concepts`** — verify 4 SDL concept cards (Surrogate, Uncertainty, Acquisition, Closed-Loop)
- [ ] **Stop 7: `/a-lab`** — scroll through all 7 sections; verify source attributions are present in section 05 (Controversy)
- [ ] **Stop 8: `/case-studio`** — the live demo (see Section 2 above)

## 4. If Everything Fails — Static Fallback

If both the online site AND the local server are unavailable:

- [ ] Open the course platform offline: navigate to `D:\A-Lab\sdl-lecture\docs\` and use the markdown files directly (they contain the core content)
- [ ] Use the syllabus (`docs/07_Syllabus.md`) as your lecture outline
- [ ] Use the course outline (`docs/06_Course_Outline.md`) for the narrative
- [ ] Use the competitive landscape (`docs/09_Competitive_Landscape_Benchmarking.md`) for the "why this course is different"
- [ ] Use the differentiation statement (`docs/10_Course_Differentiation_Statement.md`) for closing remarks
- [ ] **Describe** the RGB LED concept verbally: "3 parameters, a target color, a Gaussian Process learns which PWM values produce the closest match. The algorithm balances exploration vs exploitation. After ~10 iterations it converges to the target."

## 5. After the Lecture

- [ ] Share the online URL with students: **https://sdl-lecture.vercel.app**
- [ ] Suggested student task: browse the A-Lab case file independently, then run the RGB LED demo 10 steps and try to explain why each recommendation was made
- [ ] Stop the local dev server (`Ctrl+C`) if it was running
