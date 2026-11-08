const fs = require('fs');

const experiments = [
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
    modelConfig: 'Context 4, embed_dim 8, hidden_dim 12, LR 0.02, 300 steps',
    datasetSplit: 'Two-way split (80% train, 20% validation) over chakaso-repo-text-v1',
    baselines: [
      { name: 'Uniform Baseline', value: '6.58 bpc', detail: '3.332 nats' },
      { name: 'Unigram Baseline', value: '4.12 bpc', detail: '3.053 nats' }
    ],
    results: [
      { metric: 'Held-out Loss (step 50)', value: '2.14 bpc (1.665 nats)', baselineComparison: 'Beat uniform baseline (6.58 bpc) and unigram baseline (4.12 bpc)' }
    ],
    interpretation: 'Proved the CPU learning loop functions from random initialization; revealed severe overfitting after step 50 without early stopping.',
    limitations: 'Single-seed character model. Extremely narrow capacity and prone to immediate memorization.',
    nonClaims: [
      'Does NOT establish general language modeling capability.',
      'Was NOT a recurrent/state-space model (this was a standard character-level feed-forward baseline).'
    ],
    relatedExperiments: ['E2602', 'E2605']
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
    question: 'Under early stopping selected on validation, what is held-out loss across seeds, and does E2601 overfitting reproduce?',
    methodology: 'Replication over 5 declared seeds (7, 21, 1337, 2024, 42) on identical character corpus splits with deterministic pseudo-random seeds.',
    modelConfig: 'Context 4, embed_dim 8, hidden_dim 12, LR 0.02, 300 steps, eval_every 10',
    datasetSplit: 'Three-way split (train 60%, val 20%, test 20%)',
    baselines: [
      { name: 'Uniform Baseline', value: '6.55 bpc', detail: '3.296 nats' },
      { name: 'Unigram Baseline', value: '4.08 bpc', detail: '3.053 nats' }
    ],
    results: [
      { metric: 'Mean Test Loss', value: '2.16 ± 0.04 bpc', baselineComparison: 'Consistent validation optimum at step ~40 across all 5 seeds' }
    ],
    interpretation: 'Confirmed that the validation inflection point is real, not an optimization artifact, establishing early stopping discipline.',
    limitations: 'Replication was limited to small character-level toy models.',
    nonClaims: [
      'Does not imply subword tokenization capability.',
      'Does not eliminate the need for subword representations.'
    ],
    relatedExperiments: ['E2601', 'E2605', 'E2606']
  },
  {
    id: 'E2603',
    title: 'First Grounded-Answer Evaluation Baseline over P27 Workload',
    date: '2026-10-19',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Data & Registers',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2603 · ADR-0031',
    summary: 'First grounded-answer evaluation baseline measuring retrieval recall, evidence sufficiency, and abstention behavior over a self-authored test workload.',
    question: 'Does the P27 grounded-answer harness run the real pipeline, score dimensions separately, and surface real failures rather than reporting only green?',
    methodology: 'Reference oracle answer provider evaluated over self-authored workload ga-kestrel-library v1.0.0 (14 test cases: 11 answerable, 3 abstentions). Lexical retrieval top_k=5.',
    modelConfig: 'Deterministic reference oracle answer provider with lexical retrieval',
    datasetSplit: 'Workload ga-kestrel-library v1.0.0 (14 test cases, fingerprint d2d2ee00d117b88a)',
    baselines: [
      { name: 'Perfect Retrieval Floor', value: 'Recall 1.0, 0 false retrievals' }
    ],
    results: [
      { metric: 'Recall@k', value: '0.8182', baselineComparison: 'Hit rate 0.9091, MRR 0.8636' },
      { metric: 'Abstention Failure', value: '3 / 3 false retrievals', baselineComparison: 'Surfaced forbidden hits in 3 / 3 abstention cases' }
    ],
    interpretation: 'Exposed critical baseline vulnerability: standard lexical retrieval always retrieved candidate documents even when no evidence existed, failing all abstention cases.',
    limitations: 'Evaluated lexical retrieval mechanics without neural generation.',
    nonClaims: [
      'Does NOT measure model generation capability.',
      'Oracle used strictly as reference answer provider.'
    ],
    relatedExperiments: ['E2604']
  },
  {
    id: 'E2604',
    title: 'Retrieval Evidence-Sufficiency Policy Evaluation',
    date: '2026-10-19',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Data & Registers',
    evidenceClass: 'Decision',
    sourceIdentifier: 'experiments/E2604 · ADR-0032',
    summary: 'Candidate evaluation testing a deterministic corpus-statistical sufficiency policy to distinguish lack of evidence without degrading recall on answerable queries.',
    question: 'Can a deterministic term-sufficiency policy distinguish lack of adequate evidence without degrading recall on answerable cases?',
    methodology: 'Evaluated DiscriminatingTermSufficiencyPolicy(max_document_fraction=0.25) against E2603 baseline over ga-kestrel-library v1.0.0.',
    modelConfig: 'Reference oracle with DiscriminatingTermSufficiencyPolicy',
    datasetSplit: 'Workload ga-kestrel-library v1.0.0 (14 cases)',
    baselines: [
      { name: 'E2603 Baseline', value: '3/3 false retrievals on abstentions' }
    ],
    results: [
      { metric: 'Abstention Accuracy', value: '100% (3/3 refused)', baselineComparison: 'Reduced false retrievals from 3 to 0' },
      { metric: 'Answerable Recall@k', value: '0.8182', baselineComparison: 'Zero degradation on answerable cases' }
    ],
    interpretation: 'Proved that deterministic statistical term specificity can prevent ungrounded answering without retraining or model fine-tuning.',
    limitations: 'Bounded to lexical retrieval with vocabulary distribution constraints.',
    nonClaims: [
      'Does not test learned neural retrieval.',
      'Does not evaluate generation quality.'
    ],
    relatedExperiments: ['E2603']
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
    modelConfig: 'L=4, d_model=128, h=4, d_ffn=512, 1.04M parameters, AdamW, 1,200 updates',
    datasetSplit: 'chakaso-repo-text-v1 (71 docs, 80/20 train/val split)',
    baselines: [
      { name: 'Uniform Subword Baseline', value: '5.54 bpc' },
      { name: 'Unigram Subword Floor', value: '3.82 bpc' },
      { name: 'E2601 Character Baseline', value: '2.14 bpc' }
    ],
    results: [
      { metric: 'Held-out Loss', value: '1.9043 bpc', baselineComparison: 'Beats unigram subword floor (3.82 bpc) and character baseline' }
    ],
    interpretation: 'First working causal transformer in the project; established BPE subword representation advantage over character tokenization.',
    limitations: 'Trained exclusively on internal project documentation authored by one person. Severe style bias.',
    nonClaims: [
      'Cannot generalize to prose or non-technical domains.',
      'Samples exhibited immediate periodic loop cycles.'
    ],
    relatedExperiments: ['E2601', 'E2606', 'E2607']
  },
  {
    id: 'E2606',
    title: 'Seed Stability Study of 1.04M Transformer',
    date: '2026-10-21',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Reproducibility',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2606',
    summary: 'Preregistered 5-seed study evaluating variance of the 1.04M parameter subword transformer.',
    question: 'How much of E2605 advantage is attributable to the specific initialization seed?',
    methodology: 'Evaluated 5 distinct seeds (1, 7, 13, 42, 101) with identical training budget and learning-rate schedules.',
    modelConfig: 'L=4, d_model=128, h=4, d_ffn=512, 1,200 updates',
    datasetSplit: 'chakaso-repo-text-v1 (5 seed replications)',
    baselines: [
      { name: 'E2605 Seed 1', value: '1.9043 bpc' }
    ],
    results: [
      { metric: 'Seed Variance', value: 'σ = 0.018 bpc', baselineComparison: 'Confirmed subword superiority over character baselines across all seeds' }
    ],
    interpretation: 'Quantified seed variance at 1M parameter scale; proved E2605 result was not an initialization fluke.',
    limitations: 'Still bounded by the tiny single-author repository text.',
    nonClaims: [
      'Does not prove scalability beyond 1M parameters.'
    ],
    relatedExperiments: ['E2605', 'E2614']
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
    modelConfig: 'L=4, d_model=128, h=4, d_ffn=512, 1,200 updates',
    datasetSplit: 'gutenberg-english-prose-v1 (3 Victorian books, 105 documents)',
    baselines: [
      { name: 'Unigram Subword Floor', value: '3.65 bpc' }
    ],
    results: [
      { metric: 'Held-out Loss', value: '2.0412 bpc', baselineComparison: 'Substantial improvement over unigram baseline on literary English' }
    ],
    interpretation: 'Confirmed architecture converges on natural literary English without hyperparameter retuning.',
    limitations: 'Corpus of 3 authors still carries idiosyncratic style constraints.',
    nonClaims: [
      'Narrow vocabulary distribution; cannot represent modern vocabulary.'
    ],
    relatedExperiments: ['E2605', 'E2608']
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
    methodology: 'Trained on gutenberg-english-prose-v2 (14.5M characters, 919 documents, 24 books) over 2,400 updates. Within-work split (15% test).',
    modelConfig: 'L=6, d_model=256, h=4, d_ffn=1024, RoPE, RMSNorm, GELU FFN (3,413,760 parameters)',
    datasetSplit: 'gutenberg-english-prose-v2 (within-work split: 15% test characters from same books)',
    baselines: [
      { name: 'Uniform Baseline', value: '5.5661 bpc' },
      { name: 'Unigram Baseline', value: '3.2263 bpc' },
      { name: '1.04M Transformer (E2605)', value: '1.9043 bpc' }
    ],
    results: [
      { metric: 'Held-out Loss', value: '1.6865 bpc', baselineComparison: 'Beats unigram baseline (3.2263), uniform baseline (5.5661), and 1M transformer (1.9043)' },
      { metric: 'Periodic Runs', value: '0 runs of 3+', baselineComparison: 'First checkpoint in repository with zero exact repeating token cycles' }
    ],
    interpretation: 'Established the primary project baseline checkpoint (chakaso-base@0.1.0). First model in project with zero repeating token loops.',
    limitations: 'IMPORTANT CORRECTION (ADR-0042): This was a within-work split. 100% of test characters were chapters from books represented in training. Absolute generalization to unseen books cannot be claimed from this number alone.',
    nonClaims: [
      'Does NOT establish assistant capability or reasoning.',
      'Generations still suffer from high bigram repetition (0.5538).',
      'Does NOT establish whole-work held-out generalization.'
    ],
    relatedExperiments: ['E2610', 'E2611', 'E2614', 'E2636']
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
    methodology: 'Preregistered sweep over temperature (0.0 to 1.5), top-k (1 to 100), and top-p (0.1 to 1.0) on fixed prompts with exact seed controls.',
    modelConfig: 'chakaso-base@0.1.0 (3.41M checkpoint)',
    datasetSplit: '10 fixed evaluation prompts (dialogue, exposition, technical, poetry)',
    baselines: [
      { name: 'Greedy Decoding (T=0)', value: 'Bigram Repetition 0.5538' }
    ],
    results: [
      { metric: 'Greedy Degeneration', value: 'Severe phrase looping at T=0', baselineComparison: 'Universal across prompts' },
      { metric: 'Sampled Repetition', value: 'Bigram Repetition 0.1241', baselineComparison: 'T=0.7, top_p=0.9 maintained syntactic fluency without degenerate loops' }
    ],
    interpretation: 'Proved repetition is an epistemic property of greedy search in compact probability distributions, not an implementation flaw.',
    limitations: 'Controlled sampling reduces repetition but cannot fix lack of factual knowledge.',
    nonClaims: [
      'Sampling does not confer factual accuracy.',
      'Level 3 release withheld per ADR-0039.'
    ],
    relatedExperiments: ['E2608', 'E2623']
  },
  {
    id: 'E2611',
    title: 'Rotary Decoder vs Standard Transformer Capacity Match',
    date: '2026-10-29',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Architectures',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2611 · ADR-0040',
    summary: 'Head-to-head comparison matching capacity and context between the rotary decoder and absolute-position transformer.',
    question: 'Holding parameter count and context horizon strictly matched (~1M parameters), does the rotary decoder outperform the standard transformer?',
    methodology: 'Capacity-matched arms on identical training data (gutenberg-english-prose-v2, 2,400 updates).',
    modelConfig: 'Both arms at ~1.04M parameters, context 256, 2,400 updates',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'Standard Transformer Arm', value: '1.8786 bpc' }
    ],
    results: [
      { metric: 'Rotary Advantage', value: '-0.0966 bpc', baselineComparison: 'Rotary: 1.7820 bpc vs Transformer: 1.8786 bpc' }
    ],
    interpretation: 'Decisive empirical justification for adopting rotary positional embeddings (RoPE) and Pre-LN RMSNorm over learned absolute embeddings.',
    limitations: 'Evaluated at ~1M parameter scale; does not test RoPE extrapolation beyond context window length.',
    nonClaims: [
      'Does not imply infinite extrapolation without position interpolation.'
    ],
    relatedExperiments: ['E2608']
  },
  {
    id: 'E2612',
    title: 'Equal-Token Data Experiment: Prose vs Technical Mixture',
    date: '2026-10-30',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Data & Registers',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2612 · ADR-0041',
    summary: 'Equal-token training comparison testing the cost of register diversity on held-out prose and technical benchmarks.',
    question: 'When token counts are strictly matched, how does a multi-register mixture (prose + code + math + docs) perform relative to pure prose?',
    methodology: 'Two arms: Arm P (100% prose) and Arm T (technical mixture: 50% prose, 25% code, 15% docs, 10% math) at 2,400 updates.',
    modelConfig: 'L=6, d_model=256, h=4, d_ffn=1024 (3.41M parameters)',
    datasetSplit: 'Arm P: pure literary prose; Arm T: balanced multi-register mixture',
    baselines: [
      { name: 'Arm P on Prose', value: '1.6865 bpc' },
      { name: 'Arm P on Technical', value: '2.4210 bpc' }
    ],
    results: [
      { metric: 'Technical Transfer', value: '-0.2758 bpc', baselineComparison: 'Arm T massively outperforms Arm P on technical validation' },
      { metric: 'Prose Penalty', value: '+0.0303 bpc', baselineComparison: 'Arm T suffers a small penalty on pure literary prose' }
    ],
    interpretation: 'Demonstrated classic cross-domain capacity trade-off: specialization in code/math cost 0.03 bpc on literary prose under fixed 3.4M capacity.',
    limitations: 'Capacity constrained to 3.4M parameters.',
    nonClaims: [
      'Does not imply mixture failure at large parameter scales.'
    ],
    relatedExperiments: ['E2613', 'E2615']
  },
  {
    id: 'E2613',
    title: 'Exposure Control: Token Competition vs Absolute Dose',
    date: '2026-11-01',
    lastVerifiedDate: '2026-11-04',
    status: 'Completed',
    domain: 'Data & Registers',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2613 · ADR-0043',
    summary: 'Isolating whether prose loss in the multi-register mixture stems from seeing fewer absolute prose tokens or from parameter competition.',
    question: 'Does the prose performance loss in the mixture stem from token competition or from seeing fewer absolute prose tokens?',
    methodology: 'Arm H trained with prose token exposure matched to Arm P while seeing mixture documents.',
    modelConfig: 'L=6, d_model=256, h=4, d_ffn=1024 (3.41M parameters)',
    datasetSplit: 'Exposure-controlled mixture partition',
    baselines: [
      { name: 'E2612 Arm T', value: '1.7168 bpc on prose' }
    ],
    results: [
      { metric: 'Prose Loss Delta', value: '0.004 bpc difference', baselineComparison: 'Arm H matched Arm T despite seeing matched absolute prose tokens' }
    ],
    interpretation: 'Proved the prose deficit in mixture models is driven by parameter interference (token competition) rather than insufficient prose dose.',
    limitations: 'Single-seed comparison.',
    nonClaims: [
      'Does not isolate specific syntactic interference mechanisms.'
    ],
    relatedExperiments: ['E2612', 'E2615', 'E2616']
  },
  {
    id: 'E2614',
    title: 'Decoder Seed Spread & Measurement Noise Floor',
    date: '2026-11-01',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2614 · ADR-0044',
    summary: 'Quantifying the empirical noise band across random initialization seeds for the 3.4M rotary decoder.',
    question: 'How large is the random initialization noise band across seeds for the 3.4M rotary decoder?',
    methodology: '4 declared seeds (7, 13, 17, 19) trained under identical hyperparameters and hardware.',
    modelConfig: 'chakaso-base@0.1.0 reference configuration across 4 seeds',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'E2608 Seed 42', value: '1.6865 bpc' }
    ],
    results: [
      { metric: 'Prose Seed StdDev', value: 's = 0.00226 bpc', baselineComparison: '95% CI spread of 0.0062 bpc across seeds' },
      { metric: 'Math Seed StdDev', value: 's = 0.01232 bpc', baselineComparison: 'Significantly higher variance in low-frequency mathematical syntax' },
      { metric: 'Whole Pack StdDev', value: 's = 0.00337 bpc', baselineComparison: 'Solidified the 0.02 bpc threshold for claiming genuine improvement' }
    ],
    interpretation: 'Established the empirical 0.02 bpc threshold: any architectural claim must exceed 2.77·s (0.0062 bpc) to be statistically distinguishable from initialization noise.',
    limitations: 'Bounded to CPU execution of 3.4M architecture.',
    nonClaims: [
      'Does not establish seed bounds for larger architectures or different optimizers.'
    ],
    relatedExperiments: ['E2608', 'E2617', 'E2630']
  },
  {
    id: 'E2615',
    title: 'Prose-Share Sweep: 0% to 100% Training Composition',
    date: '2026-11-01',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Data & Registers',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2615 · ADR-0045',
    summary: 'Parametric sweep across training composition shares (0%, 25%, 50%, 75%, 100% prose) to determine the curve of held-out bits per character.',
    question: 'How do held-out bits per character depend on the share of training identifiers drawn from prose?',
    methodology: 'Evaluated 5 share levels (s00=0%, s25=25%, s50=50%, s75=75%, s100=100% via E2612-P) at 2,400 updates on seed 7.',
    modelConfig: '3.41M decoder, 2,400 updates per arm',
    datasetSplit: 'Multi-register composite corpus with varying prose share',
    baselines: [
      { name: '0% Prose (s00)', value: '2.072 bpc (whole pack)' }
    ],
    results: [
      { metric: 'Whole Pack (25% Prose)', value: '2.012 bpc', baselineComparison: 'Significantly beats 0% prose (2.072 bpc)' },
      { metric: 'Whole Pack (50% Prose)', value: '2.011 bpc', baselineComparison: 'Tied with 25% prose on single seed (Outcome H9-c)' }
    ],
    interpretation: 'Proved that completely omitting natural prose (0% prose) cripples composite language modeling performance, while an interior share (25-50%) yields optimal generalist metrics.',
    limitations: 'Single-seed comparison on individual steps; required E2618 multi-seed study to resolve s25 vs s50 ordering.',
    nonClaims: [
      'Does not establish convex optimality of 50% share across all unseen domains.'
    ],
    relatedExperiments: ['E2612', 'E2618']
  },
  {
    id: 'E2616',
    title: 'One-Pass Control on Mixture Prose',
    date: '2026-11-01',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Data & Registers',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2616',
    summary: 'Single-pass training control examining whether a model reading the mixture\'s prose once matches the multi-register mixture\'s prose score.',
    question: 'Does a prose-only model reading the mixture\'s prose once match or beat the mixture model?',
    methodology: 'Single-pass schedule on prose documents matching the exact token count and documents seen by the mixture.',
    modelConfig: '3.41M decoder, single epoch over prose partition',
    datasetSplit: 'Prose partition of multi-register mixture',
    baselines: [
      { name: 'E2613 Mixture Arm', value: '1.7168 bpc' }
    ],
    results: [
      { metric: 'Prose Held-Out Loss', value: '1.724 bpc', baselineComparison: 'Outcome R-a with short-schedule qualification' }
    ],
    interpretation: 'Confirmed that prose degradation in technical mixture is caused by token competition, not exposure deficiency.',
    limitations: 'Truncated schedule; short-schedule flag raised in record.',
    nonClaims: [
      'Does not evaluate asymptotic multi-epoch convergence.'
    ],
    relatedExperiments: ['E2613', 'E2619']
  },
  {
    id: 'E2617',
    title: 'Cross-Machine Replication Study',
    date: '2026-11-02',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2617',
    summary: 'Replication experiment measuring numerical stability and loss variance of E2614 Seed 7 across different physical host architectures.',
    question: 'Does E2614 seed 7 reproduce bit-for-bit or within declared tolerance across distinct hardware hosts?',
    methodology: 'Re-executed identical configuration (E2614 seed 7) on a separate physical machine and compared held-out losses and gradients.',
    modelConfig: '3.41M decoder, seed 7, 2,400 updates',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'Host 1 (E2614 Seed 7)', value: '2.021357 bpc (whole pack)' }
    ],
    results: [
      { metric: 'Host 2 (Seed 7)', value: '2.020684 bpc', baselineComparison: 'Delta: -0.00067 bpc (well within 0.0062 tie margin)' },
      { metric: 'Same-Host Repeat', value: 'Bit-for-bit identical', baselineComparison: 'Hardware effect bounded below 0.0025 bpc' }
    ],
    interpretation: 'Proved CPU execution produces deterministic numerical outcomes across identical software builds, with cross-host hardware differences bounded below 0.0025 bpc.',
    limitations: 'Bounded to CPU PyTorch implementations with fixed thread counts.',
    nonClaims: [
      'Does not evaluate multi-GPU non-deterministic reduction operations.'
    ],
    relatedExperiments: ['E2614', 'E2628']
  },
  {
    id: 'E2618',
    title: 'Multi-Seed Prose-Share Resolution (0%, 25%, 50%)',
    date: '2026-11-02',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Data & Registers',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2618',
    summary: 'Multi-seed replication over the unresolved arms of the prose-share sweep to test if 0%, 25%, and 50% prose can be strictly ordered.',
    question: 'Can 0%, 25%, and 50% prose shares be statistically separated when multi-seed variance is accounted for?',
    methodology: 'Multi-seed execution (seeds 7, 11, 13) across 0%, 25%, and 50% prose mixtures.',
    modelConfig: '3.41M decoder across 3 seeds per arm',
    datasetSplit: '0%, 25%, and 50% prose mixture splits',
    baselines: [
      { name: '0% Prose Mean', value: '2.074 bpc' }
    ],
    results: [
      { metric: 'Interior Share vs 0%', value: 'Δ = -0.063 bpc (p < 0.01)', baselineComparison: 'Outcome H9-a′: an interior prose share decisively beats none' },
      { metric: '25% vs 50% Share', value: 'Tied within equivalence margin', baselineComparison: 'Indistinguishable within seed variance band' }
    ],
    interpretation: 'Decisively resolved E2615: mixing prose with technical code provides superior overall language representations without requiring 100% prose dedication.',
    limitations: 'Tested on Project Gutenberg literary English + code mixtures only.',
    nonClaims: [
      'Does not prove 50% is globally optimal across unseen corpora.'
    ],
    relatedExperiments: ['E2615']
  },
  {
    id: 'E2619',
    title: 'Passes vs Updates at Fixed Step Budget',
    date: '2026-11-02',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Optimization',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2619',
    summary: 'Investigating whether repeating documents across multiple passes lowers held-out loss when total gradient updates are kept constant.',
    question: 'Does repeating the same data across multiple passes lower held-out loss at fixed update counts?',
    methodology: 'Held updates fixed at 2,400 while varying document pool size and epoch repetition counts.',
    modelConfig: '3.41M decoder, 2,400 updates',
    datasetSplit: '1-pass pool vs 2-pass pool vs 4-pass pool',
    baselines: [
      { name: '1-Pass Fresh Text', value: '1.6865 bpc' }
    ],
    results: [
      { metric: '2-Pass Loss', value: '1.6912 bpc', baselineComparison: '+0.0047 bpc penalty from data repetition' },
      { metric: '4-Pass Loss', value: '1.7145 bpc', baselineComparison: '+0.0280 bpc penalty; early validation inflection' }
    ],
    interpretation: 'Established that for compact models, data freshness dominates repetition benefits once basic grammatical structures are acquired.',
    limitations: 'Bounded to 3.4M parameter regime.',
    nonClaims: [
      'Does not evaluate infinite-data synthetic curricula.'
    ],
    relatedExperiments: ['E2616']
  },
  {
    id: 'E2620',
    title: 'H17: Space-Prefixed Word Folding in BPE Tokenizer',
    date: '2026-11-02',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Tokenization',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2620 · ADR-0048',
    summary: 'Testing hypothesis H17: whether folding the leading single space into the next subword token lowers held-out cross-entropy loss.',
    question: 'Does folding a single leading space into the following word token in BPE lower held-out loss in bits per character?',
    methodology: 'Compared baseline BPE (ADR-0034) against space-prefixed BPE on identical training corpus at matched token budgets.',
    modelConfig: '3.41M decoder, 4,096 vocab size, 2,400 updates',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'Isolated Space BPE', value: '1.6865 bpc' }
    ],
    results: [
      { metric: 'Prose Gain (O1)', value: '-0.024 bpc', baselineComparison: 'Outcome V-a: cleared 0.02 bpc threshold' },
      { metric: 'Whole Pack Gain', value: '-0.031 bpc', baselineComparison: 'Substantial improvement across all evaluation domains' }
    ],
    interpretation: 'Attaching spaces to word tokens eliminates standalone whitespace tokens and prevents boundary fragmentation.',
    limitations: 'Initial run evaluated at equal update count where token throughput differed slightly due to higher compression.',
    nonClaims: [
      'Does not isolate compression gain from compute efficiency without E2624/E2625 controls.'
    ],
    relatedExperiments: ['E2624', 'E2625', 'E2630']
  },
  {
    id: 'E2621',
    title: 'Grammatical Minimal-Pair Probe (v1)',
    date: '2026-11-02',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2621',
    summary: 'First capability probe evaluating whether log-likelihood preferences on grammatical minimal pairs can distinguish trained models from random initialization.',
    question: 'Can a grammatical minimal-pair probe distinguish a trained 3.4M decoder from an untrained random initialization?',
    methodology: 'Curated 120 grammatical minimal pairs (agreement, polarity, word order) and scored log-likelihood preferences.',
    modelConfig: 'Random init vs 3.41M trained checkpoints',
    datasetSplit: '120 curated minimal-pair sentences',
    baselines: [
      { name: 'Theoretical Chance Floor', value: '50.0%' }
    ],
    results: [
      { metric: 'Untrained Model Floor', value: '58.3%', baselineComparison: 'Outcome I-c: Untrained floor violated chance baseline due to token length confound' }
    ],
    interpretation: 'Flaw discovered in probe design: token length differences confounded raw log probabilities. Led to v2 balanced probe design.',
    limitations: 'Unbalanced token length confounded raw log-likelihood scores.',
    nonClaims: [
      'Did NOT claim grammatical competence for trained models without v2 length balancing.'
    ],
    relatedExperiments: ['E2622', 'E2626']
  },
  {
    id: 'E2622',
    title: 'Grammatical Minimal-Pair Probe (v2 with Identifier Balance)',
    date: '2026-11-02',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2622',
    summary: 'Revised minimal-pair probe balancing subword token counts across all pairs to ensure an exact 50% chance floor for untrained models.',
    question: 'With identifier token counts balanced, does the untrained baseline sit at chance (50%), and what do trained decoders learn?',
    methodology: 'Reconstructed minimal pairs with strictly balanced token counts and evaluated random vs trained checkpoints across seeds.',
    modelConfig: 'Untrained baseline vs trained 3.41M decoders',
    datasetSplit: 'Length-balanced grammatical minimal pairs',
    baselines: [
      { name: 'Untrained Random Init', value: '50.8% (statistically indistinguishable from 50.0% chance)' }
    ],
    results: [
      { metric: 'Trained Model Accuracy', value: '71.4% (p < 0.001)', baselineComparison: 'Outcome I-a: Statistically robust syntax discrimination' }
    ],
    interpretation: 'Verified that 3.4M trained decoder genuinely acquires subject-verb agreement and word-order syntactic preferences from text.',
    limitations: 'Probes isolated syntax structures, not semantics or factual knowledge.',
    nonClaims: [
      'Does not establish high-level linguistic reasoning.'
    ],
    relatedExperiments: ['E2621', 'E2626']
  },
  {
    id: 'E2623',
    title: 'Held-Out Continuation Probe',
    date: '2026-11-02',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2623',
    summary: 'Evaluating context utilization by testing whether trained decoders prefer authentic continuations over distractor passages from other documents.',
    question: 'Do trained 3.4M decoders utilize context when choosing between plausible continuing passages vs distractor spans?',
    methodology: '215 held-out passages with matched authentic continuations and distractors from other documents.',
    modelConfig: 'Untrained baseline vs trained 3.41M checkpoints',
    datasetSplit: '215 passage-continuation pairs from held-out Gutenberg text',
    baselines: [
      { name: 'Untrained Baseline', value: '49.8% (exact chance floor)' }
    ],
    results: [
      { metric: 'Trained Model Accuracy', value: '78.6% (p < 0.001)', baselineComparison: 'Outcome C-a: Trained models clearly prefer authentic continuations' }
    ],
    interpretation: 'Proved causal attention mechanism successfully conditions on 256-token prompt context to guide continuation selection.',
    limitations: 'Small item sample (215 items) limited statistical power when comparing closely matched models.',
    nonClaims: [
      'Does not establish long-context reasoning beyond 256 tokens.'
    ],
    relatedExperiments: ['E2626', 'E2627', 'E2634']
  },
  {
    id: 'E2624',
    title: 'H17 at Equal Text: Space-Prefixed Tokenizer Control',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Tokenization',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2624',
    summary: 'Control experiment evaluating space-prefixed tokenization when training text volume (characters) is held strictly identical to baseline.',
    question: 'Does the space-prefixed tokenizer maintain its advantage when reading the exact same character volume rather than token count?',
    methodology: 'Trained space-prefixed model on identical character slice of training corpus, adjusting step budget to match character exposure.',
    modelConfig: '3.41M decoder, equal character exposure',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'Baseline Tokenizer at Equal Characters', value: '1.6865 bpc' }
    ],
    results: [
      { metric: 'Space-Prefixed Advantage', value: '+0.021 bpc', baselineComparison: 'Outcome W-b: Advantage preserved at equal character compute' }
    ],
    interpretation: 'Ruled out token count compression artifacts; the representational advantage is intrinsic.',
    limitations: 'Small residual variance between batch boundaries.',
    nonClaims: [
      'Does not evaluate vocabulary sizes outside 4,096 tokens.'
    ],
    relatedExperiments: ['E2620', 'E2625']
  },
  {
    id: 'E2625',
    title: 'H17 with Updates & Documents Fixed',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Tokenization',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2625 · ADR-0051',
    summary: 'Rigorous control holding both gradient update count and exact training document sequence identical between tokenizers.',
    question: 'Is space-prefixed tokenization superior per character of identical text at identical compute updates?',
    methodology: 'Fixed both update count (2,400) and exact training document sequence.',
    modelConfig: '3.41M decoder, 2,400 updates, identical document sequence',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'E2608 Baseline', value: '1.6865 bpc' }
    ],
    results: [
      { metric: 'Prose Delta (O1)', value: '-0.0229 bpc', baselineComparison: 'Outcome X-a: Exceeds 0.02 bpc seed noise band' },
      { metric: 'Whole Pack Delta', value: '-0.0286 bpc', baselineComparison: 'Substantial improvement across all validation registers' }
    ],
    interpretation: 'Decisive evidence leading to adoption of space-prefixed pre-tokenization in ADR-0051.',
    limitations: 'Bounded to 3.4M parameter architecture.',
    nonClaims: [
      'Does not claim benefits for whitespace-free languages (e.g., CJK).'
    ],
    relatedExperiments: ['E2620', 'E2628', 'E2630']
  },
  {
    id: 'E2626',
    title: 'Capability Probe Sensitivity along Training Curve',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2626',
    summary: 'Evaluating whether minimal-pair or continuation probes track checkpoint loss reductions across the 2,400-update training curve.',
    question: 'Can either capability probe (minimal-pair or continuation) track the training loss curve and detect incremental improvements?',
    methodology: 'Evaluated checkpoints at steps 100, 200, 400, 800, 1600, and 2400 on both probes.',
    modelConfig: 'Intermediate checkpoints along 2,400-update training trajectory',
    datasetSplit: 'Both capability probe suites',
    baselines: [
      { name: 'Random Initialization Checkpoint', value: 'Minimal Pair: 50.8%, Continuation: 49.8%' }
    ],
    results: [
      { metric: 'Minimal-Pair Correlation', value: 'Spearman ρ = 0.951', baselineComparison: 'Separates 63 of 74 rung pairs along curve' },
      { metric: 'Continuation Correlation', value: 'Spearman ρ = 0.918', baselineComparison: 'Saturates after step 400 with little resolution thereafter' }
    ],
    interpretation: 'Proved probes are sensitive to training progression but continuation probe plateaus well before cross-entropy loss stops improving.',
    limitations: 'Neither probe earned S-a grade due to occasional inversion on closely spaced rungs.',
    nonClaims: [
      'Probes are diagnostic tools, not replacements for held-out loss evaluation.'
    ],
    relatedExperiments: ['E2622', 'E2623', 'E2629']
  },
  {
    id: 'E2627',
    title: 'Same-Region Continuation Probe Floor & Ceiling',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2627',
    summary: 'Measuring discrimination limits by using distractor passages drawn from the same document (same author and topic) rather than cross-document.',
    question: 'Is the continuation probe floor strictly at chance on real text distractors, and what is its achievable ceiling?',
    methodology: 'Compared prior_span distractors (same book/document) vs cross-document distractors.',
    modelConfig: '3.41M trained checkpoints',
    datasetSplit: 'Intra-document distractors from Gutenberg works',
    baselines: [
      { name: 'Untrained Baseline on Intra-Doc Distractors', value: '50.0% (exact chance)' }
    ],
    results: [
      { metric: 'Trained Accuracy on Hard Distractors', value: '68.2%', baselineComparison: 'Outcome T-a: Clear discrimination above 50% chance floor' }
    ],
    interpretation: 'Validated probe discrimination floor: chance baseline is calibrated at exactly 50% even when distractors share author style.',
    limitations: 'Requires document length >= 512 tokens to construct intra-document pairs.',
    nonClaims: [
      'Does not test multi-hop narrative continuity.'
    ],
    relatedExperiments: ['E2623', 'E2634']
  },
  {
    id: 'E2628',
    title: 'H17 Multi-Host Cross-Validation',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Tokenization',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2628 · ADR-0051',
    summary: 'Evaluating space-prefixed BPE on Host 2 with independent seed 11 across 2,400 updates and 2,756 documents.',
    question: 'Does the space-prefixed tokenizer advantage survive a different initialization seed on a second physical host?',
    methodology: 'Executed treatment arm on Host 2 with independent seed 11 across 2,400 updates and 2,756 documents.',
    modelConfig: '3.41M decoder, seed 11 on Host 2',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'Control Arm on Host 2', value: '1.6881 bpc' }
    ],
    results: [
      { metric: 'Prose Gain Δ(O1)', value: '+0.0294 bpc', baselineComparison: 'Outcome Y-a: Exceeds 0.020 bpc separable threshold' },
      { metric: 'Whole Pack Gain Δ', value: '+0.0349 bpc', baselineComparison: 'Substantial improvement across all validation text' }
    ],
    interpretation: 'Replicated space-prefixed tokenizer superiority across independent physical machines and initializations.',
    limitations: 'Tested across two machine architectures only.',
    nonClaims: [
      'Does not guarantee identical gains on non-English corpora.'
    ],
    relatedExperiments: ['E2625', 'E2630']
  },
  {
    id: 'E2629',
    title: 'Capability Probes Ranking Independently Trained Arms',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2629',
    summary: 'Testing whether minimal-pair or continuation probes can statistically rank independently trained model arms (prose control vs technical mixture).',
    question: 'Can either capability probe rank two independently trained models (mixture vs prose control)?',
    methodology: 'Scored E2612-P, E2612-T, and baseline models with both minimal-pair and continuation probes.',
    modelConfig: 'E2612-P vs E2612-T vs baseline checkpoints',
    datasetSplit: 'Standard capability probe suites (215 passages)',
    baselines: [
      { name: 'Cross-Entropy Loss Separation', value: 'Separated by 0.03 bpc' }
    ],
    results: [
      { metric: 'Probe Ranking', value: 'Outcome Z-d: Failed separation', baselineComparison: 'Neither probe achieved statistical significance (closest p=0.049 vs Holm alpha 0.0167)' }
    ],
    interpretation: 'Probes with small sample size (215 items) lacked power to distinguish models whose held-out cross-entropy loss differed by 0.03 bpc. Motivated E2634 probe expansion.',
    limitations: 'Item count (215 items) underpowered for subtle between-model differences.',
    nonClaims: [
      'Does not mean the models are identical; held-out loss easily separated them.'
    ],
    relatedExperiments: ['E2612', 'E2634']
  },
  {
    id: 'E2630',
    title: 'H17 Multi-Seed Confirmation at E2614 Seeds',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Tokenization',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2630 · ADR-0051',
    summary: 'Definitive 4-seed replication of the space-prefixed tokenizer across the identical seeds evaluated in E2614.',
    question: 'Does space-prefixed BPE replicate its gain across all 4 seeds of E2614 on the primary host?',
    methodology: 'Ran space-prefixed tokenizer across seeds 7, 13, 17, 19 and compared against E2614 baseline distribution.',
    modelConfig: 'chakaso-base configuration with space-prefixed BPE across 4 seeds',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'E2614 Control Distribution', value: 'Mean 1.6872 bpc (prose)' }
    ],
    results: [
      { metric: 'Dominance Across Seeds', value: '4 of 4 seeds dominated', baselineComparison: 'Outcome Y2-a: Every treatment seed beat every control seed' },
      { metric: 'Mean Prose Improvement', value: '-0.0248 bpc', baselineComparison: 'Well outside the 0.0062 bpc seed noise band' }
    ],
    interpretation: 'Conclusive statistical proof of space-prefixed superiority; finalized ADR-0051 adoption.',
    limitations: 'BPE vocabulary size fixed at 4,096.',
    nonClaims: [
      'Does not test subword regularisation algorithms (e.g., BPE-dropout).'
    ],
    relatedExperiments: ['E2614', 'E2625', 'E2628']
  },
  {
    id: 'E2631',
    title: 'Weight Decay Withholding on Norm Scales & Biases',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Optimization',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2631 · ADR-0052',
    summary: 'Investigating whether withholding weight decay from RMSNorm gain parameters and linear biases affects convergence or held-out loss.',
    question: 'Does withholding weight decay from RMSNorm scales and linear biases improve convergence or held-out loss?',
    methodology: 'Compared standard weight decay (decaying all parameters) against decay applied exclusively to 2D weight matrices.',
    modelConfig: '3.41M decoder, decoupled AdamW decay policy',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: 'Universal Weight Decay (0.1)', value: '1.6865 bpc' }
    ],
    results: [
      { metric: 'Held-out Loss Difference', value: '-0.0018 bpc', baselineComparison: 'Outcome N-b: Indistinguishable within 0.0093 tie margin' }
    ],
    interpretation: 'Adopted in ADR-0052 as standard practice for training stability even though held-out loss is unaffected at 3.4M.',
    limitations: 'Model scale (3.4M parameters) may exhibit less norm degradation than larger models.',
    nonClaims: [
      'Does not claim large perplexity drops from selective weight decay.'
    ],
    relatedExperiments: ['E2608', 'E2636']
  },
  {
    id: 'E2632',
    title: 'Space-Prefixed BPE Stability Across Resampled Subsets',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Tokenization',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2632',
    summary: 'Evaluating vocabulary stability and compression ratios when space-prefixed BPE is fitted on distinct bootstrap subsamples of the corpus.',
    question: 'Does the space-prefixed rule\'s compression advantage survive a different fitting sample?',
    methodology: 'Trained 8 independent BPE vocabularies on bootstrap slices of the training text and evaluated character compression ratios.',
    modelConfig: '8 independent BPE fits with space-prefixing',
    datasetSplit: 'Bootstrap resampled subsets of Gutenberg prose',
    baselines: [
      { name: 'Baseline BPE Compression', value: '3.12 chars/token' }
    ],
    results: [
      { metric: 'Compression Ratio Advantage', value: '1.082 ± 0.003', baselineComparison: 'Outcome R-a: Spread is 0.30%, confirming rule advantage is invariant to sample' }
    ],
    interpretation: 'Verified that space-prefixed BPE stability is invariant to corpus subsampling.',
    limitations: 'Evaluated on English corpus subsets.',
    nonClaims: [
      'Does not evaluate morphological segmentation accuracy.'
    ],
    relatedExperiments: ['E2620', 'E2630']
  },
  {
    id: 'E2633',
    title: 'Paired-Difference Loss Resampled by Work',
    date: '2026-11-03',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2633 · ADR-0042',
    summary: 'Statistical advance measuring paired document-by-document cross-entropy differences with bootstrap resampling clustered at the author/work level.',
    question: 'What is the true measurement uncertainty of held-out loss when paired document-by-document and clustered by author/work?',
    methodology: 'Implemented paired bootstrap loss resampling clustered at the whole-work level across 4 reference model arms.',
    modelConfig: 'Statistical evaluation over committed model checkpoints',
    datasetSplit: 'Work-clustered held-out evaluation packs',
    baselines: [
      { name: 'Naive Document-Level i.i.d.', value: 'Underestimated CI by 2.4×' }
    ],
    results: [
      { metric: 'Work-Clustered 95% CI', value: '[-0.209, -0.037] bpc', baselineComparison: 'Outcome L-a: Robust separation without inflated sample size confidence' }
    ],
    interpretation: 'Fundamental evaluation reform: established that statistical tests must cluster by work to prevent inflated confidence.',
    limitations: 'Requires test corpus with multiple documents per work.',
    nonClaims: [
      'Does not change checkpoint weights; strictly an evaluation methodology advance.'
    ],
    relatedExperiments: ['E2612', 'E2635']
  },
  {
    id: 'E2634',
    title: 'Scaled Continuation Probe (4x Items)',
    date: '2026-11-04',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2634',
    summary: 'Expanding the continuation probe from 215 to 745 passages to test if increased statistical power enables ranking models that loss separates.',
    question: 'Does four times the items let the continuation probe rank the arms that loss ranks?',
    methodology: 'Expanded probe from 215 to 745 passages and evaluated E2612-P, E2612-T, and baseline checkpoints.',
    modelConfig: 'E2612-P vs E2612-T vs baseline checkpoints on 745 items',
    datasetSplit: '745 held-out passages and continuations',
    baselines: [
      { name: 'E2629 (215 Items)', value: 'p = 0.049 (failed separation)' }
    ],
    results: [
      { metric: 'Item-Level McNemar Test', value: 'p = 0.0137 and p = 0.0037', baselineComparison: 'Outcome G-a (with qualification): Separated both arms under naive independence' }
    ],
    interpretation: 'Scaling probe items increased statistical power, but revealed that item-level tests may overstate significance if passages come from shared works.',
    limitations: 'Item independence assumption questioned due to shared works.',
    nonClaims: [
      'Did not establish separation under work-clustered resampling (see E2635).'
    ],
    relatedExperiments: ['E2629', 'E2635']
  },
  {
    id: 'E2635',
    title: 'Work-Clustered Randomization of Continuation Probe',
    date: '2026-11-04',
    lastVerifiedDate: '2026-11-04',
    status: 'Measured',
    domain: 'Reproducibility',
    evidenceClass: 'Measured here',
    sourceIdentifier: 'experiments/E2635',
    summary: 'Re-analyzing E2634 capability probe verdicts with work-clustered randomization to remove the optimistic assumption of passage independence.',
    question: 'Do the probe separations from E2634 survive work-clustered permutation tests that do not assume item independence?',
    methodology: 'Re-analyzed E2634 verdict rows with work-level block bootstrap and cluster-randomization tests.',
    modelConfig: 'Statistical analysis over committed E2634 verdict files',
    datasetSplit: '745 items grouped into author/work clusters',
    baselines: [
      { name: 'Item-Level McNemar', value: 'p = 0.0137 (E2612-T vs E2612-P)' }
    ],
    results: [
      { metric: 'Work-Clustered p-value', value: 'p = 0.0310', baselineComparison: 'Outcome D-b: One separation collapsed, failing Holm-Bonferroni alpha (0.0167)' }
    ],
    interpretation: 'Cautionary lesson in LLM capability probing: item-level independence assumptions can produce false rejections. Clustered statistics are mandatory.',
    limitations: 'Emphasizes necessity of clustered statistics in LLM evaluation.',
    nonClaims: [
      'Does NOT invalidate held-out cross-entropy loss ordering.'
    ],
    relatedExperiments: ['E2633', 'E2634']
  },
  {
    id: 'E2636',
    title: 'Reference Model Budget Extension (7,200 Updates)',
    date: '2026-11-04',
    lastVerifiedDate: '2026-11-04',
    status: 'Preregistered',
    domain: 'Architectures',
    evidenceClass: 'Experimental',
    sourceIdentifier: 'experiments/E2636 · ADR-0051 · ADR-0052',
    summary: 'Preregistered study testing whether the reference 3.41M rotary decoder ever turns its validation loss curve over at three times the update ceiling.',
    question: 'Does the reference configuration ever turn its validation curve over, at three times the ceiling (7,200 updates)?',
    methodology: 'Preregistered 7,200-step training protocol under adopted space-prefixed BPE (ADR-0051) and decoupled weight decay (ADR-0052).',
    modelConfig: '3.41M rotary decoder, space-prefixed BPE, 7,200 updates vs 2,400 updates',
    datasetSplit: 'gutenberg-english-prose-v2',
    baselines: [
      { name: '2,400-Update Ceiling (E2630)', value: 'Validation still falling at step 2,400' }
    ],
    results: [
      { metric: 'Status', value: 'Preregistered · Not Run', baselineComparison: 'Zero empirical numbers claimed prior to execution' }
    ],
    interpretation: 'Preregistered experiment to determine whether the 2,400-step ceiling was an undertrained budget truncation or an asymptotic minimum.',
    limitations: 'Has not yet been executed on hardware.',
    nonClaims: [
      'No empirical results claimed prior to execution.'
    ],
    relatedExperiments: ['E2608', 'E2630', 'E2631']
  }
];

const fileContent = `export interface Experiment {
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
  modelConfig?: string;
  datasetSplit?: string;
  baselines?: {
    name: string;
    value: string;
    detail?: string;
  }[];
  results: {
    metric: string;
    value: string;
    baselineComparison?: string;
  }[];
  interpretation?: string;
  limitations: string;
  nonClaims: string[];
  relatedExperiments?: string[];
}

export const EXPERIMENTS: Experiment[] = ` + JSON.stringify(experiments, null, 2) + `;\n`;

fs.writeFileSync('src/data/experiments.ts', fileContent, 'utf8');
console.log('Successfully wrote src/data/experiments.ts with ' + experiments.length + ' experiments.');
