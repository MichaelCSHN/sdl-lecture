# Self-driving Labs Lecture App

Interactive web application for the "Autonomous Laboratory & Closed-loop Discovery" graduate lecture.

## Features

### 7 Interactive Modules
1. **Hero** — Animated introduction with particle background and key metrics
2. **Background** — Knowledge graph visualization, Wikipedia API integration, Bayesian optimization primer
3. **Concept** — SDL architecture diagram (Mermaid), technology timeline, technology readiness levels
4. **Case Study** — A-Lab deep dive with validation discussion and follow-up experiments
5. **Interactive Demos** — 7 Live Cases with real Gaussian Process + Bayesian Optimization simulation
   - BO Simulator with 8 live cases (Branin, Suzuki, Perovskite, RGB LED, Catalyst, Battery, CO2 reduction, SnAr)
   - DOE comparison (Random, LHS, Sobol, Full Factorial) with visual sampling comparison
   - BO vs DOE convergence race with animated chart
   - AI Planning Assistant with Deepseek V3 API streaming + offline fallback
   - SDL Decomposition mode — auto-decompose research topics into SDL components
   - GP hyperparameter sensitivity visualization (lengthScale effects)
   - Quiz with 5 questions
6. **Challenges** — Technical challenges, solutions, and future outlook
7. **Resources** — Key papers with BibTeX download, learning progress tracker, QR code generator

### Technical Highlights
- **Real Gaussian Process** implementation with RBF kernel, Cholesky inversion
- **Bayesian Optimization** with EI and UCB acquisition functions
- **Seeded PRNG** (mulberry32) for reproducible experiments
- **DOE sampling engines** — Random, LHS, Sobol (Van der Corput), Full Factorial
- **Deepseek V3 API** streaming with typewriter effect
- **Offline LLM fallback** — keyword-based regex matching for offline mode
- **XSS protection** — HTML escaping + Markdown formatting
- **Mobile responsive** — bottom navigation for mobile devices
- **Progress tracking** — intersection observer-based learning progress indicator

## Tech Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 3.4 + shadcn/ui components
- Framer Motion (animations)
- Plotly.js (scientific visualization)
- D3-force (knowledge graph)
- Mermaid (flow diagrams)
- ml-matrix (linear algebra for GP)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  sections/         — Page sections (Hero, Background, Concept, etc.)
  components/       — Reusable components (MobileNav, QRCodeGenerator)
  lib/              — Core algorithms (bo_engine.ts, doe_engine.ts)
  data/             — Static data (quiz_data.ts)
```

## License

MIT
