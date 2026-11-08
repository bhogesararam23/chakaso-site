export interface ResearchDomainDetail {
  id: string;
  num: string;
  title: string;
  status: 'Implemented' | 'Experimenting' | 'Planned' | 'Conceptual';
  question: string;
  whyItMatters: string;
  implemented: string;
  measured: string;
  unknowns: string;
  nextEvidence: string;
  experiments: string[];
  adrs: string[];
}

export const RESEARCH_DOMAINS: ResearchDomainDetail[] = [
  {
    id: 'architectures',
    num: '01',
    title: 'Model Architecture & Scaling',
    status: 'Implemented',
    question: 'How do architectural primitives (causal decoders, rotary embeddings, normalization schemes) perform when trained from scratch under constrained token budgets?',
    whyItMatters: 'Most contemporary architectures are evaluated at billion-parameter scales on trillion-token corpora. Understanding how architectural inductive biases function in compact parameter regimes (1M–50M) isolates true mathematical efficiency from sheer data volume.',
    implemented: 'Causal decoder-only transformer with Pre-LN RMSNorm, RoPE rotary positional embeddings, GELU feed-forward networks (4× expansion), and strict lower-triangular causal attention masking.',
    measured: 'In E2608, a 3.41M rotary decoder reached 1.6865 bpc. In E2611, holding context and parameters identical (~1M), the rotary decoder beat standard transformer by 0.0966 bpc. Frontier mechanisms (GQA, MLA, MoE, sliding-window) showed no published evidence of benefit at 3.4M.',
    unknowns: 'Whether state-space or linear attention variants can maintain syntactic precision while scaling beyond 256 context positions.',
    nextEvidence: 'Extended training budget study (E2636) to establish whether validation loss turns over prior to increasing layer depth.',
    experiments: ['E2601', 'E2605', 'E2608', 'E2611', 'E2636'],
    adrs: ['ADR-0037', 'ADR-0040']
  },
  {
    id: 'tokenization',
    num: '02',
    title: 'Representation & Tokenization',
    status: 'Implemented',
    question: 'How do subword pre-tokenization boundaries and space-prefixing rules impact sequence compression and downstream cross-entropy loss?',
    whyItMatters: 'A defective tokenizer permanently degrades downstream transformer capacity. Merges that cross word boundaries destroy morphology, while standalone space tokens waste valuable sequence positions.',
    implemented: 'Byte-Pair Encoding (BPE) subword tokenizer with deterministic boundary isolation, space-prefix folding (ADR-0051), and total byte-level fallback ensuring zero unknown tokens ([UNK]).',
    measured: 'In E2625 and E2630, space-prefixed tokenization lowered held-out loss by 0.023 bpc across all seeds with compute and distinct training documents held strictly fixed. Non-Latin scripts encode as raw bytes (1.00 bytes/token).',
    unknowns: 'Optimal vocabulary size trade-offs between embedding parameter overhead and sequence position efficiency at 3M–10M model scales.',
    nextEvidence: 'Evaluation of frequency thresholding (ADR-0046) on vocabulary compactness.',
    experiments: ['E2605', 'E2620', 'E2625', 'E2630'],
    adrs: ['ADR-0044', 'ADR-0048', 'ADR-0051']
  },
  {
    id: 'data',
    num: '03',
    title: 'Data Composition & Provenance',
    status: 'Implemented',
    question: 'How does register diversity (literary prose, technical documentation, code, mathematics) influence cross-register transfer and loss dynamics?',
    whyItMatters: 'Web-scale corpora license their packaging, not their underlying content. Sustainable independent research requires clean provenance (Apache-2.0, public domain) and controlled register mixtures.',
    implemented: 'Corpus manifest engine (ADR-0047) with SHA-256 document pinning and snapshot recovery from Git history (ADR-0036). Created the 5-register technical mixture (prose, doc, code, math, dialogue).',
    measured: 'In E2612, training on a 5-register mixture lowered technical loss by 0.2758 bpc while increasing prose loss by 0.0303 bpc. E2613 proved this prose penalty was caused by spending token positions on technical text, not data corruption.',
    unknowns: 'The optimal token allocation budget across registers to prevent catastrophic forgetting in compact models.',
    nextEvidence: 'Era partitioning of literary corpora to assess linguistic drift between 19th-century and contemporary English.',
    experiments: ['E2607', 'E2608', 'E2612', 'E2613'],
    adrs: ['ADR-0036', 'ADR-0041', 'ADR-0045', 'ADR-0047']
  },
  {
    id: 'optimization',
    num: '04',
    title: 'Training Dynamics & Optimization',
    status: 'Experimenting',
    question: 'What are the precise learning rate schedules, warmup profiles, and weight decay thresholds required to maintain stable convergence under CPU constraints?',
    whyItMatters: 'Small models trained at high token-to-parameter ratios behave differently from compute-optimal Chinchilla regimes. Overfitting curves must be precisely characterized.',
    implemented: 'AdamW optimizer with decoupled weight decay, cosine annealing learning rate scheduler with linear warmup, and atomic checkpoint resumption (ADR-0053).',
    measured: 'In E2602, early stopping selected on validation was proven to reproduce across seeds. In E2615/E2616, step decay profiles were evaluated across multiple seeds. Training throughput benchmarked on standard consumer CPUs.',
    unknowns: 'Whether learning rate warmup duration significantly alters final loss floor at 7,200 update steps.',
    nextEvidence: 'Completion of preregistered E2636 at 3× ceiling budget (7,200 updates / 58.98M tokens).',
    experiments: ['E2602', 'E2615', 'E2616', 'E2636'],
    adrs: ['ADR-0049', 'ADR-0050', 'ADR-0053']
  },
  {
    id: 'evaluation',
    num: '05',
    title: 'Evaluation & Statistical Methodology',
    status: 'Implemented',
    question: 'How can model progress be measured reliably without falling prey to benchmark gamification or within-work data leakage?',
    whyItMatters: 'Public AI claims frequently mistake memorization for generalization. A valid metric must isolate unseen works and clear empirical random-seed noise floors.',
    implemented: 'Whole-work held-out splitting (ADR-0042), non-parametric statistical tests, Holm–Bonferroni family-wise error rate corrections, and multi-seed noise measurement.',
    measured: 'E2614 established that the random-seed noise floor is σ = 0.0023 bpc for prose, 0.0034 bpc for the whole pack, and 0.0123 bpc for mathematics. ADR-0042 corrected E2608 by identifying that its 1.6865 bpc score was a within-work split.',
    unknowns: 'How to construct an automated coherence instrument capable of detecting true syntactic and structural improvements that cross-entropy loss obscures.',
    nextEvidence: 'Development of calibrated grammatical and continuation probes that separate trained models from random baselines.',
    experiments: ['E2608', 'E2610', 'E2614'],
    adrs: ['ADR-0039', 'ADR-0042', 'ADR-0052']
  },
  {
    id: 'capability',
    num: '06',
    title: 'Model Behaviour & Capability Limits',
    status: 'Experimenting',
    question: 'What linguistic structures and semantic properties actually emerge in a 3.4M parameter base model?',
    whyItMatters: 'Transparency demands reporting failure modes as clearly as successes. A model must not be called an assistant when it only performs subword completion.',
    implemented: 'Calibrated decoding quality evaluator (`chakaso.training.quality_eval`) measuring repetition rates, bigram entropy, and periodic cycle detection.',
    measured: 'In E2608, exact periodic runs of 3+ tokens were reduced to zero. In E2610, greedy decoding was proven to cause phrase repetition (bigram repetition 0.5538); stochastic sampling prevented repetition but degraded syntactic coherence. Generation remains unusable text.',
    unknowns: 'The minimum parameter threshold at which multi-clause syntactic coherence emerges without repeating phrases.',
    nextEvidence: 'Calibrated continuation evaluations under bounded decoding constraints.',
    experiments: ['E2608', 'E2610'],
    adrs: ['ADR-0039', 'ADR-0043']
  },
  {
    id: 'systems',
    num: '07',
    title: 'Computational Systems & Integration',
    status: 'Implemented',
    question: 'Can a language model runtime and HTTP serving adapter be built completely from Python standard library with zero third-party dependencies?',
    whyItMatters: 'Modern deployment stacks suffer from extreme package bloat. A local-first, zero-dependency serving architecture ensures perpetual stability, offline execution, and complete verifiability.',
    implemented: 'Standard-library HTTP adapter (`chakaso.serve`) with loopback binding, SSE streaming, bounded thread concurrency, and client-disconnect cancellation. Verified across 3 strict CI tiers on CPU.',
    measured: 'Three-tier CI matrix runs offline on CPU across Python 3.11–3.13, passing with zero network access and zero GPU requirements. Release contracts verified by SHA-256 checksums before loading.',
    unknowns: 'Throughput optimization under concurrent multi-client requests on memory-constrained systems.',
    nextEvidence: 'Benchmarking CPU execution latency across quantization formats.',
    experiments: ['E2608', 'E2610'],
    adrs: ['ADR-0001', 'ADR-0033', 'ADR-0038', 'ADR-0039']
  }
];
