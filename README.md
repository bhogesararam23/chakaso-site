# Chakaso Official Website

The official source repository for the **Chakaso** research website.

Chakaso is an independent artificial intelligence research and engineering initiative focused on developing language models from random initialization and exploring the foundational computational systems, architectures, and methodologies of machine intelligence. This repository hosts the public-facing editorial and presentation platform for the project.

- **Intended Domain:** [https://chakaso.tech](https://chakaso.tech) *(configured destination for upcoming deployment)*
- **Model Research Repository:** [https://github.com/bhogesararam23/chakaso](https://github.com/bhogesararam23/chakaso)
- **License:** [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)

---

## Brand & Research Positioning

> **CHAKASO**  
> *"Language models, trained from random initialization."*  
>  
> *"An independent exploration of compact language models, subword tokenization, and empirical evaluation harnesses."*

The website presents Chakaso as a serious, technically sophisticated independent research initiative. It avoids marketing exaggerations, student portfolio clichés, and generic AI startup tropes, communicating ambition while strictly reflecting the measured empirical reality of the underlying research.

---

## Website Purpose & Scope

The website serves as the primary editorial, educational, and publication interface for the Chakaso project. Its purpose is to:

1. **Publish First-Party Research:** Present verified experimental findings, methodologies, and architectural decisions directly on-site without forcing visitors to navigate raw source files on GitHub.
2. **Transparently Report Baselines:** Document model parameters, held-out losses, dataset provenance, and exact behavioural limitations with scientific integrity.
3. **Detail System Architecture:** Provide visual, mathematical, and conceptual explanations of the causal transformer pipeline, tokenizer contracts, and local zero-dependency runtimes.
4. **House the Documentation Hub:** Provide a fully rendered Markdown technical reference for the Chakaso Python interface, model lifecycle, and serving protocols.
5. **Maintain an Empirical Journal:** Track chronological architectural decision records (ADRs) and experiment reports with clear evidence classifications.

---

## Information Architecture & Sections

The website is structured into eleven dedicated knowledge sections and sub-domains:

| Section | Route | Focus |
| :--- | :--- | :--- |
| **Homepage** | `/` | Technical architecture schematic, research positioning, foundational inquiry domains, and research ledger. |
| **Research Hub** | `/research` | The research program, questions, active hypotheses, and technical sub-domains. |
| **Experiment Archive** | `/research/experiments` | Searchable, filterable ledger of all 35 verified experiments (E2601–E2608, E2610–E2636) with exact parameters and findings. |
| **Methodology** | `/research/methodology` | Scientific standards: preregistration, multi-seed variance bounds, Holm–Bonferroni corrections, and negative-result reporting. |
| **Data & Provenance** | `/research/data` | Corpus composition, document boundaries, SHA-256 fingerprints, and licensing. |
| **Evaluation** | `/research/evaluation` | Bits per character (bpc), within-work vs whole-work splits, repetition metrics, and capability probes. |
| **Models** | `/models` | Model research catalog and detailed profile for Chakaso Base 0.1.0 (3.41M parameters, Level 2 release gate). |
| **Architecture** | `/architecture` | Deep computational breakdown of the causal decoder stack, tensor dimensions, and standard-library HTTP serving. |
| **Documentation** | `/docs` | Comprehensive on-site technical guides for the Python library, model contracts, and local serving adapters with formatted Markdown. |
| **Journal** | `/journal` | Formal publication log of Architectural Decision Records (ADRs) and research dispatches. |
| **About** | `/about` | Project genesis, engineering ethics, non-commercial research ethos, and licensing boundaries. |

---

## Frontend Architecture & Design Principles

The website is engineered for clarity, readability, and technical precision:

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generation for fast page loads and complete SEO indexing)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with a restrained dark technical palette, legible typography scales, and native accessibility
- **Interactive Components:** React 19 islands for interactive tokenizer exploration and dynamic experiment filtering
- **Technical Schematics:** Purpose-built, static architecture schematics representing exact tensor shapes and pipeline stages of `chakaso-base@0.1.0`
- **Documentation Engine:** Safe, sanitized Markdown parsing (marked + sanitize-html) with automated ADR cross-linking
- **Dependencies:** Pure static output with zero runtime external API dependencies (no GitHub API rate limits, no third-party trackers, no backend server requirements)

---

## Deployment & Hosting Target

The website is engineered for static output compatible with **Cloudflare Pages**:

- **Target Host:** Cloudflare Pages
- **Build Output:** Pure static HTML, CSS, and client-side JavaScript in `dist/`
- **Intended Domain:** `https://chakaso.tech`

> *Note: The domain `chakaso.tech` is the intended production destination. It is configured as the destination for initial deployment once DNS and Cloudflare Pages setup are verified.*

---

## Relationship to the Research Repository

- **Website Repository (`chakaso-site`):** The public-facing presentation, editorial content, interactive visualisations, and documentation hub.
- **Model Research Repository (`chakaso`):** The authoritative source for PyTorch model code, tokenizer training, dataset manifests, experiment logs, automated CI test suites, and Architectural Decision Records (ADRs).

All public claims, metrics, and architecture descriptions on this website are derived from and verified against the upstream research repository.

---

## Contribution & Local Development

Maintainer setup, local development workflows, type-checking instructions, and research verification requirements are documented in [**`CONTRIBUTING.md`**](./CONTRIBUTING.md).

---

## License

This project is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
