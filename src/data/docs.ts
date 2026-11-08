export interface DocSection {
  slug: string;
  title: string;
  category: 'Overview' | 'Architecture' | 'Training & Data' | 'Runtime & API' | 'Release & Governance';
  summary: string;
  content: string;
  sourceIdentifier: string;
}

export const DOC_SECTIONS: DocSection[] = [
  {
    slug: 'overview',
    title: 'System Overview & Design Philosophy',
    category: 'Overview',
    summary: 'Foundational principles governing the Chakaso research system, offline execution, and model boundaries.',
    sourceIdentifier: 'docs/README.md · ADR-0001 · ADR-0033',
    content: `
### The Chakaso Philosophy

Chakaso is a language-model research project whose product is a model it trains itself from random initialization, plus the Python interface that loads and measures it ([ADR-0033]).

The repository was founded under three core engineering constraints:
1. **Zero Runtime Cloud or API Dependencies:** The runtime executes locally, on consumer CPU hardware, without proprietary external API endpoints ([ADR-0001]).
2. **Explicit Language Model Boundary:** Application components depend on an abstract model interface rather than concrete PyTorch weights ([ADR-0002]).
3. **Retrieval-Owned Evidence Identifiers:** Citations and claims are grounded against external documents with verifiable hashes, allowing objective computation of attribution precision ([ADR-0003]).

### What Exists Today
- **Trained Model in Python:** A trained 3.41M parameter causal decoder loaded via \`chakaso.models.load_model(path)\`.
- **Runtime Engine:** Bounded decoding through a validated parameter contract (temperature, top_k, top_p, seed, stop sequences), streaming generator, and exact held-out scoring.
- **Release Contract:** Enforces SHA-256 artifact verification and non-empty known limitations ([ADR-0039]).
- **Zero-Dependency HTTP Server:** Built-in \`chakaso.serve\` loopback adapter using Python's standard library ([ADR-0038]).
- **Self-Describing Tokenizer:** Deterministic Byte-Pair Encoding subword vocabulary with lossless byte fallback and space-prefixing ([ADR-0051]).
- **Immutable Data Manifests:** Datasets pinned by document digests and recoverable from Git revisions ([ADR-0036]).
`
  },
  {
    slug: 'getting-started',
    title: 'Getting Started & Environment Setup',
    category: 'Overview',
    summary: 'Installing the Python library, verifying offline CPU prerequisites, and loading a checkpoint.',
    sourceIdentifier: 'docs/getting-started.md · ADR-0030',
    content: `
### Prerequisites
- Python 3.11, 3.12, or 3.13
- Standard consumer CPU (Intel, AMD, or Apple Silicon)
- Git 2.30+

### Dependency Tiers
Chakaso utilizes a three-tier dependency structure to ensure core functionality never requires numerical libraries:
- **Core Tier (\`.[dev]\`):** Zero external numerical dependencies. Contains the application layer, retrieval engine, and HTTP serving adapter.
- **Training Tier (\`.[dev,train]\`):** Adds dataset snapshotting and tokenizer compilation utilities.
- **Model Path Tier (\`.[dev,train,nn]\`):** Adds PyTorch for CPU training and tensor forward passes.

### Loading a Model in Python
\`\`\`python
import chakaso.models as cm

# Load a verified release directory or checkpoint
model = cm.load_model("path/to/checkpoint_or_release")

# Inspect model contract
info = model.describe()
print(f"Model: {info.name} | Parameters: {info.parameter_count}")

# Bounded generation
params = cm.DecodingParameters(
    temperature=0.7,
    top_k=40,
    top_p=0.9,
    max_new_tokens=64,
    seed=42
)

result = model.generate("In the beginning", params)
print(result.text)
\`\`\`
`
  },
  {
    slug: 'architecture',
    title: 'Causal Decoder Transformer Architecture',
    category: 'Architecture',
    summary: 'Detailed mathematical breakdown of the 3.41M parameter reference architecture.',
    sourceIdentifier: 'docs/architecture.md · ADR-0037 · ADR-0040',
    content: `
### Mathematical Formulation

The reference architecture is a causal decoder-only transformer with Pre-Layer Normalization and Rotary Positional Embeddings (RoPE).

#### 1. Input Embedding & RoPE
Incoming subword tokens $x_t \\in \\{0, \\dots, V-1\\}$ are embedded into $\\mathbb{R}^{d_{\\text{model}}}$. Instead of absolute positional vectors, rotary embeddings apply a complex rotation to query and key vectors:
$$R_{\\Theta, m}^d = \\text{diag}\\left(R_{\\theta_1, m}, R_{\\theta_2, m}, \\dots, R_{\\theta_{d/2}, m}\\right)$$
where relative position $m - n$ is preserved in the inner product $q_m^T k_n$.

#### 2. Pre-LN RMSNorm
Normalisation is applied before each sub-layer using Root Mean Square Normalisation:
$$\\text{RMSNorm}(x) = \\frac{x}{\\sqrt{\\frac{1}{d} \\sum_{i=1}^d x_i^2 + \\epsilon}} \\odot \\gamma$$
RMSNorm avoids computing activation means, saving memory bandwidth during backpropagation.

#### 3. Causal Multi-Head Self-Attention
Attention queries, keys, and values are projected into $h=4$ attention heads ($d_k = 64$):
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}} + M\\right) V$$
where $M_{i,j} = 0$ for $j \\le i$ and $-\\infty$ for $j > i$.

#### 4. GELU Feed-Forward Network
The feed-forward network in Chakaso Base 0.1.0 uses a Gaussian Error Linear Unit (GELU) with expansion $d_{\text{ffn}} = 1,024$ ($4 \times d_{\text{model}}$), matching \`chakaso.training.decoder\`:
$$\text{FFN}(x) = \text{GELU}(x W_{\text{up}}) W_{\text{down}}$$
where $W_{\text{up}} \in \mathbb{R}^{d_{\text{model}} \times d_{\text{ffn}}}$ and $W_{\text{down}} \in \mathbb{R}^{d_{\text{ffn}} \times d_{\text{model}}}$. SwiGLU gating is documented in ADR-0037 as an exploratory candidate for future scaled checkpoints.
`
  },
  {
    slug: 'tokenizer',
    title: 'Byte-Pair Encoding & Space Prefixing',
    category: 'Architecture',
    summary: 'Subword tokenization, space-prefixed word boundaries (ADR-0051), and byte-level fallback.',
    sourceIdentifier: 'docs/research/chakaso-tokenizer-and-context-assessment.md · ADR-0048 · ADR-0051',
    content: `
### Tokenizer Specifications

- **Vocabulary Size:** 4,096 BPE subwords
- **Base Alphabet:** 256 byte-level tokens (0x00 through 0xFF)
- **Pre-Tokenizer:** Space-prefixed boundary isolator (\`chakaso.training.subword\`)
- **Verification:** SHA-256 checksum recorded in \`vocabulary.json\`

### Boundary Isolation & Space Prefixing (ADR-0051)
Historically, tokenizers treated spaces as separate tokens, consuming sequence positions on whitespace alone. Under [ADR-0051], Chakaso adopted a space-prefixed pre-tokenizer where the leading space attaches to the start of the next subword.

Crucially, **merges never cross word boundaries**. This prevents catastrophic subword fragmentation (e.g. merging the end of one word with the start of another), maintaining strict morphological structure.

### Lossless Byte Fallback
Every byte from 0 to 255 exists as a primitive token. When non-Latin scripts (Devanagari, Cyrillic, Arabic, Han) or arbitrary binary sequences appear, the tokenizer emits individual byte tokens. Encoding is **total**: there is zero probability of an unknown token (\`[UNK]\`) exception.
`
  },
  {
    slug: 'training',
    title: 'Training Pipeline & Recovery Contracts',
    category: 'Training & Data',
    summary: 'AdamW optimizer dynamics, cosine learning-rate schedules, and atomic resumption contracts.',
    sourceIdentifier: 'docs/training.md · ADR-0049 · ADR-0053',
    content: `
### Training Hyperparameters (Reference E2608/E2636)

| Parameter | Value |
| :--- | :--- |
| **Optimizer** | AdamW ($\\beta_1 = 0.9, \\beta_2 = 0.95, \\epsilon = 10^{-8}$) |
| **Weight Decay** | 0.1 (decoupled from learning rate) |
| **Peak Learning Rate** | $6.0 \\times 10^{-4}$ |
| **Warmup Steps** | 120 updates (linear warmup) |
| **Decay Schedule** | Cosine decay to $6.0 \\times 10^{-5}$ (10% of peak) |
| **Update Budget** | 2,400 updates (19.66M tokens) in E2608; 7,200 updates in E2636 |
| **Batch Size** | 32 sequences $\\times$ 256 tokens = 8,192 tokens per update |

### Atomic Resumption Contract (ADR-0053)
Training on consumer hardware requires resilience against host interruptions. Under [ADR-0053], checkpoint files attest the run they originated from. Resuming an interrupted run loads:
1. Exact RNG states (Python, PyTorch CPU).
2. AdamW first and second moment tensor states.
3. Linear warmup and cosine scheduler step counts.
4. Corpus snapshot offset.

A dedicated eighteen-test interruption suite proves that an interrupted-and-resumed run produces bit-for-bit identical weights to an uninterrupted execution.
`
  },
  {
    slug: 'data-provenance',
    title: 'Data Provenance & Manifest Integrity',
    category: 'Training & Data',
    summary: 'Corpus composition, Apache-2.0 and public domain licensing, and snapshot recovery.',
    sourceIdentifier: 'docs/transparency.md · ADR-0004 · ADR-0036 · ADR-0047',
    content: `
### Verified Data Provenance

Chakaso completely rejects unverified web scraping. Every training token consumed by the project is tracked in an immutable manifest:

1. **Chakaso Repository Prose v1 (\`chakaso-repo-text-v1\`):**
   - 71 documents, 780,223 characters.
   - License: Apache-2.0.
   - Fingerprint: \`e45993f9badf706c\`.
2. **Project Gutenberg Prose v1 (\`gutenberg-english-prose-v1\`):**
   - 105 documents, 1,660,274 characters, 3 books.
   - License: Public Domain (US) / Project Gutenberg License.
   - Fingerprint: \`931b07a635ca5a0c\`.
3. **Project Gutenberg Prose v2 (\`gutenberg-english-prose-v2\`):**
   - 919 documents, 14,490,005 characters, 24 books.
   - License: Public Domain (US) / Project Gutenberg License.
   - Fingerprint: \`e9fc2e92f59d88ea\`.
4. **Multi-Register Technical Mixture v1 (\`technical-mixture-v1\`):**
   - 2,756 documents, 19,660,800 characters across 5 balanced registers.
   - License: Apache-2.0 and Public Domain.
   - Fingerprint: \`d7b42fae9102c817\`.

### Snapshot Recovery (ADR-0036)
A dataset manifest records the Git commit SHA at which the text was captured. If the repository edits its documentation, running \`chakaso.training.snapshot\` re-extracts the exact historical text from git tree objects, guaranteeing exact retraining fidelity.
`
  },
  {
    slug: 'evaluation',
    title: 'Evaluation Methodology & Statistical Rigor',
    category: 'Training & Data',
    summary: 'Bits-per-character arithmetic, whole-work vs within-work splits, and Holm–Bonferroni corrections.',
    sourceIdentifier: 'docs/evaluation.md · ADR-0042 · ADR-0052',
    content: `
### The Primary Metric: Bits Per Character (bpc)

Language modeling performance is reported in bits per character:
$$\\text{bpc} = \\frac{\\mathcal{L}_{\\text{cross-entropy}}}{\\ln 2} \\times \\frac{\\text{Total Tokens}}{\\text{Total Characters}}$$
Reporting bpc allows direct, fair comparison across different tokenizers and vocabulary sizes, because character counts remain constant regardless of subword merge strategies.

### Within-Work vs Whole-Work Splits (ADR-0042)
- **Within-Work Split (E2608):** Documents were split at the chapter level. Test chapters came from books also present in the training set. This measures within-book style interpolation.
- **Whole-Work Split (ADR-0042 / E2612+):** Entire books are isolated into training or evaluation sets. Zero books appear in both partitions, establishing true cross-work held-out generalization.

### Family-Wise Error Rate (Holm–Bonferroni)
When comparing $k$ model configurations simultaneously, raw $p$-values accumulate false positives. Chakaso enforces the Holm–Bonferroni step-down correction:
$$p_{(i)} \\le \\frac{\\alpha}{k - i + 1}$$
If a model arm fails this threshold, the repository refuses to report a superiority claim.
`
  },
  {
    slug: 'serving',
    title: 'Local HTTP Serving Adapter (ADR-0038)',
    category: 'Runtime & API',
    summary: 'Zero-dependency loopback HTTP serving, OpenAI API compatibility, and client abort teardown.',
    sourceIdentifier: 'docs/decisions/ADR-0038-local-http-serving-adapter-from-the-standard-library.md',
    content: `
### Serving Specifications

- **Protocol:** HTTP/1.1 Loopback (\`127.0.0.1\`)
- **Standard Library:** Built strictly with Python's \`http.server\` and \`threading\`
- **Endpoints:**
  - \`GET /health\` — Server health status and loaded model metadata.
  - \`GET /v1/models\` — List loaded models.
  - \`POST /v1/chat/completions\` — OpenAI-compatible streaming chat completion.

### Server-Sent Events (SSE) & Instant Teardown
When a client requests streaming, tokens are yielded via \`text/event-stream\`. If the user cancels the request or closes the connection, the generator detects socket failure and **instantly terminates the forward pass**, preventing CPU starvation.

\`\`\`bash
# Launch serving adapter
python -m chakaso.serve --checkpoint /path/to/e2608 --port 8080

# Query with curl
curl http://127.0.0.1:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "What builds intelligence?"}],
    "temperature": 0.7,
    "stream": true
  }'
\`\`\`
`
  },
  {
    slug: 'release-contract',
    title: 'Model Release Contract & Governance (ADR-0039)',
    category: 'Release & Governance',
    summary: 'The tripartite release gate, Level 2 qualification, and withholding Level 3 on measured evidence.',
    sourceIdentifier: 'docs/decisions/ADR-0039-three-level-model-release-gate.md · MODEL_CARD.md',
    content: `
### The Tripartite Release Gate

To ensure scientific honesty and prevent inflated marketing, [ADR-0039] establishes three non-negotiable gates:

1. **Level 1 — Structural Artifact Gate:**
   - Manifest contains valid \`model.json\`.
   - All weights match declared SHA-256 checksums.
   - Architectural parameters load cleanly into Python.
2. **Level 2 — Reproducible Integration Gate:**
   - Model loads into the Python runtime without configuration files.
   - Bounded decoding and scoring execute deterministically in CI.
   - Checkpoint is reproducible from declared seed and corpus manifest.
3. **Level 3 — Useful Assistant Behavior Gate:**
   - Model demonstrates coherent multi-sentence generation on real user tasks.
   - Generation passes repetition thresholds and semantic probes.
   - Model adheres to instruction templates.

### Current Status: Level 2 Awarded, Level 3 Withheld
Chakaso Base 0.1.0 satisfies all Level 1 and Level 2 gates. **Level 3 is formally withheld on empirical evidence.** The model exhibits phrase repetition (bigram repetition 0.5538) and does not produce assistant-quality text. It is an experimental research artifact, not a production tool.
`
  }
];
