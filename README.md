# Chakaso Official Website

The official website for **Chakaso** &mdash; an independent AI research and engineering initiative exploring language models, computational systems, and the foundations of machine intelligence.

- **Production Domain:** [https://chakaso.tech](https://chakaso.tech)
- **Model Research Repository:** [https://github.com/bhogesararam23/chakaso](https://github.com/bhogesararam23/chakaso)
- **License:** [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)

---

## Architecture & Technology Stack

The website is engineered for static delivery, high responsiveness, and zero external runtime dependencies:

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generator)
- **Language:** TypeScript (Strict mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom dark graphite & violet design tokens
- **Interactive Islands:** React 19 + Canvas 2D spatial intelligence topology
- **Icons:** Lucide Icons
- **Target Deployment:** Cloudflare Pages (Static Output)

---

## Pages & Routes

| Route | Title | Purpose |
| :--- | :--- | :--- |
| `/` | Homepage | Primary experience: 3D interactive lattice, research philosophy, domains, architecture preview, and status matrix. |
| `/research` | Research Program | 6 research domains, training methodology, whole-work splits, and reproducibility standards. |
| `/architecture` | Architecture | Deep breakdown of tokenization, embeddings, causal transformer blocks, and standard-library serving. |
| `/models` | Experimental Models | Transparent documentation of the 3.41M parameter baseline and the 3-level release gate. |
| `/journal` | Research Journal | Verified Architectural Decision Records (ADRs) and experiment reports. |
| `/about` | About the Initiative | Genesis, purpose, engineering standards, open-source commitment, and vision. |
| `/404` | 404 Error | Custom dark technical 404 page with navigation fallbacks. |

---

## Local Development & Verification

### Prerequisites
- Node.js `20.x` or later (or Node.js 24)
- `pnpm` (recommended), `npm`, or `bun`

### Install Dependencies
```bash
pnpm install
```

### Start Development Server
```bash
pnpm dev
```
Runs the local dev server at `http://localhost:4321`.

### Type Check
```bash
pnpm check
```

### Build Production Artifact
```bash
pnpm build
```
Generates pure static HTML, CSS, and JS in the `dist/` directory.

### Preview Production Build
```bash
pnpm preview
```

---

## Cloudflare Pages Deployment Configuration

To deploy to Cloudflare Pages:

1. **Framework Preset:** `None` / `Astro`
2. **Build Command:** `pnpm build` (or `npm run build`)
3. **Build Output Directory:** `dist`
4. **Environment Variables:**
   - `NODE_VERSION`: `20.18.0` (or `22`)

Once built, configure your custom domain `chakaso.tech` in Cloudflare Pages &rarr; Custom Domains.
