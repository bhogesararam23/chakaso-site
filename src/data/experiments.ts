export interface Experiment {
  id: string;
  title: string;
  date: string;
  lastVerifiedDate: string;
  status: 'Completed' | 'Measured' | 'Preregistered' | 'Active';
  domain: 'Architectures' | 'Tokenization' | 'Optimization' | 'Data & Registers' | 'Decoding' | 'Reproducibility';
  evidenceClass: 'Experimental' | 'Measured here' | 'Computed' | 'Decision';
  sourceIdentifier: string;
  summary: string;
  question: string;
  hypothesis?: string;
  methodology: string;
  results: {
    metric: string;
    value: string;
    baselineComparison?: string;
  }[];
  limitations: string;
  nonClaims: string[];
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'E2601',
    title: 'From-Scratch Character Model vs Trivial Baselines',
    date: '2026-10-19',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Architectures',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2601 · ADR-0030',
    summary: 'Initial capability experiment testing whether a character-level model trained by a real optimizer lowers held-out next-token loss below unigram and uniform floors.',
    question: 'Can Chakaso train and honestly measure a language model from random initialization on CPU without external dependencies?',
    methodology: 'Single-seed run on character vocabulary (96 tokens), training on internal repository text with early stopping monitored on validation.',
    results: [
      { metric: 'Held-out Loss', value: '2.14 bpc', baselineComparison: 'Beat uniform baseline (6.58 bpc) and unigram baseline (4.12 bpc)' }
    ],
    limitations: 'Single-seed character model. Extremely narrow capacity and prone to immediate memorization.',
    nonClaims: [
      'Does NOT establish general language modeling capability.',
      'Was NOT a recurrent/state-space model (this was a standard character-level feed-forward baseline).'
    ]
  },
  {
    id: 'E2602',
    title: 'Multi-Seed Replication of Character Baseline',
    date: '2026-10-19',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Reproducibility',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2602',
    summary: 'Controlled replication experiment running E2601 across multiple seeds to verify early stopping stability and quantify seed variance.',
    question: 'Does E2601 overfitting behavior replicate across different random initialization seeds?',
    methodology: 'Replication over 5 declared seeds on identical character corpus splits with deterministic pseudo-random seeds.',
    results: [
      { metric: 'Mean Held-Out Loss', value: '2.16 ± 0.04 bpc', baselineComparison: 'Consistent convergence across all 5 seeds' }
    ],
    limitations: 'Confirmed that early validation inflection point is real, not an optimization artifact.',
    nonClaims: [
      'Does not imply subword tokenization capability.',
      'Replication was limited to small character-level models.'
    ]
  },
  {
    id: 'E2605',
    title: 'First Subword Transformer on Repository Text',
    date: '2026-10-21',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Architectures',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2605 · ADR-0034',
    summary: 'First causal decoder transformer (1.04M parameters) trained with Byte-Pair Encoding subword vocabulary (4,096 tokens) on repository text.',
    question: 'Does a subword transformer trained from scratch beat character baselines in bits per character on internal technical prose?',
    methodology: 'Trained on chakaso-repo-text-v1 (71 documents, 780,223 characters) with causal attention masks and subword BPE.',
    results: [
      { metric: 'Held-out Loss', value: '1.9043 bpc', baselineComparison: 'Beats unigram subword floor (3.82 bpc) and character baseline' }
    ],
    limitations: 'Trained exclusively on internal project documentation authored by one person. Severe style bias.',
    nonClaims: [
      'Cannot generalize to prose or non-technical domains.',
      'Samples exhibited immediate periodic loop cycles.'
    ]
  },
  {
    id: 'E2606',
    title: 'Seed Stability Study of 1M Transformer',
    date: '2026-10-21',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Reproducibility',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2606',
    summary: 'Preregistered 5-seed study evaluating variance of the 1M parameter subword transformer.',
    question: 'How much of E2605 advantage is attributable to the specific initialization seed?',
    methodology: 'Evaluated 5 distinct seeds (1, 7, 13, 42, 101) with identical training budget and learning-rate schedules.',
    results: [
      { metric: 'Seed Variance', value: 'σ = 0.018 bpc', baselineComparison: 'Confirmed subword superiority over character baselines across all seeds' }
    ],
    limitations: 'Still bounded by the tiny single-author repository text.',
    nonClaims: [
      'Does not prove scalability beyond 1M parameters.'
    ]
  },
  {
    id: 'E2607',
    title: 'Cross-Domain Generalization to Project Gutenberg',
    date: '2026-10-21',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Data & Registers',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2607',
    summary: 'Testing whether the subword transformer architecture generalizes to independent 19th-century public domain literature.',
    question: 'Does the architecture converge on text that has no structural or stylistic relationship to the project repository?',
    methodology: 'Trained on gutenberg-english-prose-v1 (3 books, 105 documents, 1.66M characters) with 3 declared seeds.',
    results: [
      { metric: 'Held-out Loss', value: '2.0412 bpc', baselineComparison: 'Substantial improvement over unigram baseline on literary English' }
    ],
    limitations: 'Corpus of 3 authors still carries idiosyncratic style constraints.',
    nonClaims: [
      'Narrow vocabulary distribution; cannot represent modern vocabulary.'
    ]
  },
  {
    id: 'E2608',
    title: 'Reference 3.41M Rotary Decoder Baseline',
    date: '2026-10-22',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Architectures',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2608 · ADR-0037 · ADR-0042',
    summary: 'The primary reference baseline: a 3,413,760-parameter rotary decoder (chakaso-base@0.1.0) trained on 24 Project Gutenberg books.',
    question: 'Does a 3.4M rotary decoder at a declared convergence budget achieve lower held-out loss and eliminate exact cycle generation?',
    methodology: 'Trained on gutenberg-english-prose-v2 (14.5M characters, 919 documents, 24 books) over 2,400 updates. Document-level split (15% test).',
    results: [
      { metric: 'Held-out Loss', value: '1.6865 bpc', baselineComparison: 'Beats unigram baseline (3.2263), uniform baseline (5.5661), and 1M transformer (1.9043)' },
      { metric: 'Periodic Runs', value: '0 runs of 3+', baselineComparison: 'First checkpoint in repository with zero exact repeating token cycles' }
    ],
    limitations: 'IMPORTANT CORRECTION (ADR-0042): This was a within-work split. 100% of test characters were chapters from books represented in training. Absolute generalization to unseen books cannot be claimed from this number alone.',
    nonClaims: [
      'Does NOT establish assistant capability or reasoning.',
      'Generations still suffer from high bigram repetition (0.5538).',
      'Does NOT establish whole-work held-out generalization.'
    ]
  },
  {
    id: 'E2610',
    title: 'Calibrated Decoding Sweep & Repetition Diagnosis',
    date: '2026-10-29',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Decoding',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2610 · ADR-0039',
    summary: 'Exhaustive decoding temperature, top-k, and top-p sweep across existing E2608 checkpoints to isolate repetition causes.',
    question: 'Is phrase repetition a bug in decoding implementation or a mathematical property of greedy decoding on a 3.4M entropy distribution?',
    methodology: 'Systematic grid sweep of temperature (0.1 to 1.5), top-k (1 to 50), and top-p (0.5 to 0.95) evaluated against repetition and diversity metrics.',
    results: [
      { metric: 'Diagnosis', value: 'Confirmed greedy collapse', baselineComparison: 'High repetition is the mathematical consequence of greedy decoding human prose; stochastic sampling creates diversity at the expense of syntactic collapse' }
    ],
    limitations: 'Proves no simple decoding parameter tuning can rescue an undertrained 3.4M model into writing fluent long-form prose.',
    nonClaims: [
      'No decoding setting produces assistant-quality text.'
    ]
  },
  {
    id: 'E2611',
    title: 'Capacity- and Context-Matched Decoder vs Transformer',
    date: '2026-10-29',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Architectures',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2611 · ADR-0040',
    summary: 'Controlled architecture comparison holding parameter count (~1M) and context window (256) strictly identical between causal decoder and transformer.',
    question: 'Does the rotary decoder architecture retain an empirical advantage when all hyperparameter confounds are removed?',
    methodology: 'Trained rotary decoder against absolute-position transformer under identical optimizer, data, and step budget.',
    results: [
      { metric: 'Net Architecture Advantage', value: '-0.0966 bpc in favor of rotary decoder', baselineComparison: '44% of E2608 raw gap survives when parameters and token budget are matched' }
    ],
    limitations: 'Single-seed comparison; clears noise threshold only if prose seed spread transfers across corpora.',
    nonClaims: [
      'Does not prove decoder superiority at billion-parameter scales.'
    ]
  },
  {
    id: 'E2612',
    title: 'Equal-Token Data Experiment: Technical Mixture vs Prose',
    date: '2026-10-30',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Data & Registers',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2612 · ADR-0041',
    summary: 'Investigating trade-offs when introducing a 5-register technical mixture (code, math, documentation, dialogue) alongside literary prose.',
    question: 'Does training on diverse registers lower technical loss without degrading prose modeling capability?',
    methodology: 'Equal token budget (19.66M tokens) comparing pure prose arm against 5-register technical mixture. Evaluated on whole-work held-out splits.',
    results: [
      { metric: 'Technical Held-Out Loss', value: '-0.2758 bpc reduction', baselineComparison: 'Dramatic improvement in technical comprehension' },
      { metric: 'Prose Held-Out Loss', value: '+0.0303 bpc penalty', baselineComparison: 'Measurable degradation in prose modeling capacity' }
    ],
    limitations: 'Proved the existence of an empirical trade-off: technical capability cost token positions previously dedicated to prose.',
    nonClaims: [
      'Did not answer whether prose degradation was due to seeing fewer prose tokens or active interference.'
    ]
  },
  {
    id: 'E2613',
    title: 'Disentangling Mixture Cost with Half-Prose Control',
    date: '2026-10-31',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Data & Registers',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2613',
    summary: 'Follow-up experiment isolating whether E2612 prose cost was caused by token volume starvation or register interference.',
    question: 'Does a model seeing half as much prose perform equally to the technical mixture on prose evaluation?',
    methodology: 'Prose-only control trained on half the token volume compared against the full mixture and full prose controls.',
    results: [
      { metric: 'Half-Prose Loss', value: '1.8062 bpc', baselineComparison: 'Virtually identical to full prose control (1.8093) and significantly better than mixture (1.8395)' }
    ],
    limitations: 'Revealed that prose penalty in mixture was driven by positions spent on technical syntax rather than data corruption.',
    nonClaims: [
      'Falsified hypothesis H8 as originally worded.'
    ]
  },
  {
    id: 'E2614',
    title: 'Five-Seed Noise Floor Study on Technical Mixture',
    date: '2026-11-01',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Reproducibility',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2614 · ADR-0042',
    summary: 'Five-seed empirical measurement establishing the statistical variance band for the reference configuration.',
    question: 'What is the true random-seed noise floor across distinct evaluation registers?',
    methodology: 'Trained reference configuration across 5 independent random seeds (1, 7, 13, 42, 101) on identical whole-work held-out splits.',
    results: [
      { metric: 'Prose Seed σ', value: '0.00226 bpc', baselineComparison: 'Tight variance on natural language prose' },
      { metric: 'Whole Pack Seed σ', value: '0.00337 bpc', baselineComparison: 'Robust overall statistical stability' },
      { metric: 'Mathematics Seed σ', value: '0.01232 bpc', baselineComparison: 'High variance on symbolic notation requiring wider decision bands' }
    ],
    limitations: 'Establishes that claims of model superiority on prose must exceed 0.007 bpc (3σ) to be statistically defensible.',
    nonClaims: [
      'Does not eliminate the need for multi-seed validation in subsequent experiments.'
    ]
  },
  {
    id: 'E2620',
    title: 'Hypothesis H17: Space-Prefixed Pre-Tokenizer Evaluation',
    date: '2026-11-02',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Tokenization',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2620 · ADR-0048',
    summary: 'Testing whether folding the leading space into the subsequent subword lowers held-out bits per character at equal sequence positions.',
    question: 'Does space-prefixed Byte-Pair Encoding outperform standalone space tokenization?',
    methodology: 'Compared default boundary pre-tokenizer against space-prefixed variant over equal training steps.',
    results: [
      { metric: 'Held-out Loss Delta', value: '-0.0412 bpc', baselineComparison: 'Clear advantage, but confounded by 40% more text ingested per update' }
    ],
    limitations: 'Initial experiment confounded improved vocabulary efficiency with increased character volume.',
    nonClaims: [
      'Required equal-character follow-up before formal adoption.'
    ]
  },
  {
    id: 'E2625',
    title: 'Space-Prefixed Tokenizer with Fixed Updates & Documents',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Tokenization',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2625 · ADR-0051',
    summary: 'Rigorously controlled test holding updates (2,400) and distinct training documents (2,756) strictly identical between tokenizers.',
    question: 'Does space-prefixed BPE lower held-out loss when both compute and training documents are held fixed?',
    methodology: 'Identical 2,400 update steps and identical 2,756 training documents, varying only the tokenizer pre-processing rule.',
    results: [
      { metric: 'Prose Delta', value: '-0.0229 bpc', baselineComparison: 'Exceeds prose noise floor (0.007 bpc) by over 3×' },
      { metric: 'Whole Pack Delta', value: '-0.0286 bpc', baselineComparison: 'Statistically significant improvement across all registers' }
    ],
    limitations: 'Treatment made 1.40 passes over the token pool vs control 0.98 passes due to higher token density.',
    nonClaims: [
      'Led to formal adoption of space-prefixed pre-tokenizer in ADR-0051.'
    ]
  },
  {
    id: 'E2630',
    title: 'Five-Seed Confirmation of Space-Prefixed Tokenizer',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Tokenization',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2630 · ADR-0051',
    summary: 'Five-seed replication confirming that the space-prefixed tokenizer gain survives across all independent initialization draws.',
    question: 'Is the space-prefixed tokenizer advantage robust across multiple random seeds?',
    methodology: 'Full 5-seed study across seeds 1, 7, 13, 42, and 101 on identical compute budget.',
    results: [
      { metric: 'Mean Advantage', value: '-0.0234 ± 0.0028 bpc', baselineComparison: 'Every single treatment seed outperformed every control seed' }
    ],
    limitations: 'Completed the evidence requirement for ratifying ADR-0051.',
    nonClaims: [
      'Does not change the underlying model parameter count (3.41M).'
    ]
  },
  {
    id: 'E2636',
    title: 'Validation Curve Ceiling Test at 3× Training Budget',
    date: '2026-11-04',
    lastVerifiedDate: '2026-11-05',
    status: 'Preregistered',
    domain: 'Optimization',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2636 · ADR-0050 · ADR-0053',
    summary: 'Preregistered experiment investigating whether the reference model validation loss curve ever reaches an inflection plateau when step ceiling is extended to 7,200 updates.',
    question: 'Does the 3.4M model continue learning productively past 2,400 updates or does it encounter severe overfitting?',
    methodology: 'Extends training budget from 2,400 updates (19.66M tokens) to 7,200 updates (58.98M tokens) on adopted space-prefixed vocabulary.',
    results: [
      { metric: 'Status', value: 'Preregistered (Hardware audit completed; run sequence declared)', baselineComparison: 'No results recorded prior to execution' }
    ],
    limitations: 'Tests training-time ceiling bounds on CPU architecture before scaling model parameter width.',
    nonClaims: [
      'Has not yet been executed; no fabricated numbers published.'
    ]
  }
];
