# Contributing to the Chakaso Website

Thank you for your interest in contributing to the official Chakaso website.

This document outlines the local development setup, code standards, research verification rules, and deployment procedures for maintainers and contributors.

---

## 1. Prerequisites

- **Node.js:** `>= 22.23.4` (or `24.x`, matching `@astrojs/react` requirements)
- **Package Manager:** `pnpm` (recommended), `npm`, or `bun`
- **Git:** Git 2.30+

---

## 2. Local Setup & Commands

### Clone the Repository
```bash
git clone https://github.com/bhogesararam23/chakaso-site.git
cd chakaso-site
```

### Install Dependencies
```bash
pnpm install
```

### Run the Development Server
```bash
pnpm dev
```
Starts the local development server at `http://localhost:4321` with Hot Module Replacement (HMR).

### Type Checking & Linting
```bash
npx tsc --noEmit
```
Verifies TypeScript types across the entire project in strict mode.

### Production Build
```bash
pnpm build
```
Compiles static HTML, CSS, client scripts, and assets into the `dist/` directory.

### Preview Production Artifact
```bash
pnpm preview
```
Serves the generated `dist/` directory locally to verify static routing and asset paths before deployment.

---

## 3. Research Verification & Content Rules

All research content published on `chakaso.tech` must adhere to strict factual integrity:

1. **Upstream Authority:** Every metric, parameter count, dataset figure, and claim must be verified against the official model research repository (`bhogesararam23/chakaso`).
2. **No Fabricated Milestones:** Never invent benchmark scores, assistant capabilities, team members, institutional affiliations, or download links.
3. **Traceable Provenance:** Every experiment or decision cited should carry a readable source reference (e.g. `Research basis: E2612 · ADR-0042 · verified 04 November 2026`).
4. **No Direct GitHub Research Links:** Public visitors should read complete research on-site. Do not add links instructing users to read Markdown files on GitHub; only use GitHub as a repository link in the navigation, footer, and repository CTAs.
5. **No Runtime GitHub API Requests:** All research data and documentation must be statically baked at build time. Never fetch raw files from the GitHub API in the browser.

---

## 4. Code & Visual Standards

- **Semantic HTML & Accessibility:** Use appropriate landmark elements (`<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`). Ensure all interactive elements have visible focus rings and accessible labels.
- **Design Tokens:** Follow the dark graphite (`#07080a`), deep charcoal (`#0c0e12`), restrained violet (`#818cf8`), and cool-blue (`#38bdf8`) palette defined in `src/styles/global.css`.
- **Motion Restraint:** All custom cursor and animation effects must respect the `(prefers-reduced-motion: reduce)` media query.
- **Zero Heavy 3D Bloat:** Canvas visualisations must use efficient render loops with automatic pause on document visibility change.

---

## 5. Deployment Guidelines

The website is statically deployed to **Cloudflare Pages**:

- **Framework Preset:** `None` / `Astro`
- **Build Command:** `pnpm build`
- **Build Output Directory:** `dist`
- **Environment Variable:** `NODE_VERSION=20.18.0`

Do not report the website as "deployed" or "live" until Cloudflare Pages has successfully completed a production deployment and custom domain DNS routing to `chakaso.tech` has been verified.
