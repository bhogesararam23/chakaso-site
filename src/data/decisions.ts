export interface DecisionRecord {
  id: string;
  title: string;
  date: string;
  status: 'Accepted' | 'Implemented' | 'Superseded';
  category: 'System Boundary' | 'Model Architecture' | 'Evaluation & Data' | 'Runtime & Serving' | 'Release Contract';
  sourceIdentifier: string;
  summary: string;
  context: string;
  decision: string;
  consequences: string;
}

export const DECISIONS: DecisionRecord[] = [
  {
    id: 'ADR-0001',
    title: 'Local-First Runtime Architecture',
    date: '2026-10-07',
    status: 'Accepted',
    category: 'System Boundary',
    sourceIdentifier: 'docs/decisions/ADR-0001-local-first-runtime.md',
    summary: 'Establishes that Chakaso operates strictly as a local-first system with zero runtime cloud or commercial API dependencies.',
    context: 'Relying on external commercial AI APIs prevents honest evaluation of internal model behavior, breaks reproducibility, and leaks data.',
    decision: 'The system shall run entirely offline on standard CPU hardware with zero external service dependencies.',
    consequences: 'Enables complete offline reproducibility; requires strict optimization discipline to maintain low computational footprint.'
  },
  {
    id: 'ADR-0002',
    title: 'Explicit Language Model Boundary',
    date: '2026-10-07',
    status: 'Accepted',
    category: 'System Boundary',
    sourceIdentifier: 'docs/decisions/ADR-0002-language-model-boundary.md',
    summary: 'Decouples application code from concrete model implementations via a strict TextScorer and generator interface.',
    context: 'Application layers that depend directly on PyTorch tensors or specific model classes cannot easily be evaluated against doubles or alternative architectures.',
    decision: 'Define an abstract language model protocol in the core package that any trained checkpoint or development double satisfies.',
    consequences: 'Enables testing of retrieval and application logic without loading neural weights.'
  },
  {
    id: 'ADR-0004',
    title: 'Apache-2.0 License and Artifact Boundary',
    date: '2026-10-08',
    status: 'Accepted',
    category: 'System Boundary',
    sourceIdentifier: 'docs/decisions/ADR-0004-apache-2.0-license.md',
    summary: 'Licenses all codebase software under Apache-2.0 while reserving heavy binary weights and datasets for explicit provenance tracking.',
    context: 'Committing heavy binary weights into Git pollutes history and obscures the boundary between code, data, and training checkpoints.',
    decision: 'Code is licensed under Apache-2.0. Large model checkpoint binaries are tracked by cryptographic hashes and kept out of Git.',
    consequences: 'Repository stays lean; checkpoints are cited by SHA-256 digests and reproduced from manifests.'
  },
  {
    id: 'ADR-0033',
    title: 'Model-Centred Product Contract',
    date: '2026-10-14',
    status: 'Accepted',
    category: 'Model Architecture',
    sourceIdentifier: 'docs/decisions/ADR-0033-model-centred-product-contract.md',
    summary: 'Establishes that the primary product of Chakaso is the trained model and Python interface, not a conversational application layer.',
    context: 'Surrounding an immature model with a complex chat application risks disguising model deficiencies instead of evaluating them.',
    decision: 'The Python library (chakaso.models.load_model) is the authoritative product. Grounded retrieval infrastructure exists to measure the model, not hide it.',
    consequences: 'All engineering serves the training and evaluation of models rather than cosmetic chat features.'
  },
  {
    id: 'ADR-0036',
    title: 'Corpus Snapshot Recovery from History',
    date: '2026-10-20',
    status: 'Accepted',
    category: 'Evaluation & Data',
    sourceIdentifier: 'docs/decisions/ADR-0036-corpus-snapshot-recovery-from-history.md',
    summary: 'Implements deterministic extraction of corpus snapshots from repository git revisions to ensure training runs remain retrainable.',
    context: 'As project documentation evolves, training on live repository files causes older experimental results to drift and become irreproducible.',
    decision: 'Corpus manifests pin document paths and content digests to specific Git revisions, allowing exact historical snapshots to be recovered.',
    consequences: 'Guarantees that E2605 and E2606 remain reproducible even as the repository edits its own text.'
  },
  {
    id: 'ADR-0037',
    title: 'Reference Model Sized by Measured Throughput',
    date: '2026-10-21',
    status: 'Accepted',
    category: 'Model Architecture',
    sourceIdentifier: 'docs/decisions/ADR-0037-reference-model-sized-by-measured-throughput.md',
    summary: 'Sizes the reference model architecture (3.41M parameters) strictly according to measured CPU training throughput on standard hosts.',
    context: 'Choosing arbitrary model dimensions (e.g. 100M+ parameters) without compute to train them to convergence yields poorly trained artifacts.',
    decision: 'Fix baseline dimensions to d_model=256, n_layers=6, n_heads=4, context=256, allowing full training runs to complete within hours on consumer CPU.',
    consequences: 'Yields a fully trained 3.41M baseline (E2608) rather than an undertrained giant.'
  },
  {
    id: 'ADR-0038',
    title: 'Local HTTP Serving Adapter from Standard Library',
    date: '2026-10-20',
    status: 'Accepted',
    category: 'Runtime & Serving',
    sourceIdentifier: 'docs/decisions/ADR-0038-local-http-serving-adapter-from-the-standard-library.md',
    summary: 'Builds an OpenAI-compatible HTTP serving adapter (/v1/chat/completions) using Python standard-library http.server with zero third-party dependencies.',
    context: 'Serving frameworks like FastAPI and Uvicorn introduce heavy dependencies and complex async runtimes unnecessary for local-first execution.',
    decision: 'Implement loopback serving using built-in http.server, with SSE streaming and immediate generator teardown on client abort.',
    consequences: 'Zero runtime dependencies for serving; verified in CI without any numerical or web frameworks installed.'
  },
  {
    id: 'ADR-0039',
    title: 'Three-Level Model Release Gate',
    date: '2026-10-24',
    status: 'Accepted',
    category: 'Release Contract',
    sourceIdentifier: 'docs/decisions/ADR-0039-three-level-model-release-gate.md',
    summary: 'Defines formal three-tier release criteria: Level 1 (Structural Artifact), Level 2 (Reproducible Integration), and Level 3 (Useful Assistant Behavior).',
    context: 'Releasing models without clear gates encourages false claims regarding capability and readiness.',
    decision: 'Mandate that Level 1 requires integrity checks, Level 2 requires reproducible training and runtime loading, and Level 3 requires demonstrated assistant utility.',
    consequences: 'Chakaso Base 0.1.0 is formally released at Level 2, with Level 3 explicitly withheld on measured evidence.'
  },
  {
    id: 'ADR-0042',
    title: 'A Held-Out Score is Held Out by Work, Not by Chunk',
    date: '2026-10-30',
    status: 'Accepted',
    category: 'Evaluation & Data',
    sourceIdentifier: 'docs/decisions/ADR-0042-held-out-means-held-out-works.md',
    summary: 'Establishes that validation and test splits must be partitioned at the whole-work level, correcting the within-work split used in E2608.',
    context: 'In E2608, 100% of test characters were chapters from books represented in training. This measured within-work interpolation rather than cross-work generalization.',
    decision: 'All future corpus splits must isolate whole works so that no book appears in both training and evaluation partitions.',
    consequences: 'E2608 numbers are formally categorized as within-work; E2612 and later adopt strict whole-work partitioning.'
  },
  {
    id: 'ADR-0043',
    title: 'Training Stages Separated by What Changes and Entered by Gates',
    date: '2026-10-30',
    status: 'Accepted',
    category: 'Model Architecture',
    sourceIdentifier: 'docs/decisions/ADR-0043-training-stages-are-separated-by-what-changes-and-entered-by-gates.md',
    summary: 'Formally delineates base pretraining, mid-training, and post-training stages, keeping mid- and post-training gates strictly closed until evidence justifies them.',
    context: 'Rushing into instruction fine-tuning or alignment before a base model demonstrates basic language coherence produces fragile, superficial behaviors.',
    decision: 'Base pretraining is the only active stage. Mid-training and post-training gates remain closed until a coherence metric passes threshold.',
    consequences: 'Prevents wasted compute on fine-tuning undertrained models.'
  },
  {
    id: 'ADR-0051',
    title: 'Adoption of the Space-Prefixed Pre-Tokenizer',
    date: '2026-11-03',
    status: 'Accepted',
    category: 'Model Architecture',
    sourceIdentifier: 'docs/decisions/ADR-0051-the-space-prefixed-pre-tokenizer-is-adopted-and-a-run-stops-inheriting-one.md',
    summary: 'Replaces standalone space tokenization with space-prefixed Byte-Pair Encoding following empirical confirmation across E2620, E2625, and E2630.',
    context: 'Encoding spaces as independent tokens wastes sequence positions and inflates vocabulary fragmentation.',
    decision: 'Adopt space-prefixed BPE where leading spaces fold into word initial tokens, while preserving byte fallback and word boundaries.',
    consequences: 'Lowers held-out loss by 0.023 bpc across all seeds at identical compute and distinct training document budgets.'
  },
  {
    id: 'ADR-0053',
    title: 'Seed Study Recovers Its Own Interrupted Run',
    date: '2026-11-04',
    status: 'Accepted',
    category: 'Runtime & Serving',
    sourceIdentifier: 'docs/decisions/ADR-0053-a-seed-study-recovers-its-own-interrupted-run-and-a-resume-point-attests-its-run.md',
    summary: 'Implements atomic checkpoint resumption for multi-seed studies, guaranteeing that resumed training matches uninterrupted execution exactly.',
    context: 'Long training runs on consumer hosts can be interrupted by system updates or power cycles. Flawed resumption causes optimizer state drift.',
    decision: 'Checkpoint saves optimizer states, scheduler steps, RNG seeds, and resume attestations, verified by a dedicated interruption test suite.',
    consequences: 'Enables safe execution of extended training runs (E2636) on standard desktop hardware.'
  }
];
