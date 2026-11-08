export interface CorpusRecord {
  id: string;
  name: string;
  version: string;
  fingerprint: string;
  documentCount: number;
  workCount: number;
  characterCount: number;
  license: string;
  experimentsTrained: string[];
  splitStrategy: 'Document-level / within-work' | 'Whole-work held-out' | 'Single-corpus document split';
  composition: string;
  limitations: string;
}

export const CORPORA: CorpusRecord[] = [
  {
    id: 'chakaso-repo-text-v1',
    name: 'Chakaso Repository Prose v1',
    version: 'v1.0',
    fingerprint: 'e45993f9badf706c',
    documentCount: 71,
    workCount: 71,
    characterCount: 780223,
    license: 'Apache-2.0',
    experimentsTrained: ['E2601', 'E2605', 'E2606'],
    splitStrategy: 'Single-corpus document split',
    composition: 'Internal tracked project documentation, architectural decision records, and technical design notes.',
    limitations: 'Written by a single author in technical prose style. Cannot evaluate general linguistic variation.'
  },
  {
    id: 'gutenberg-english-prose-v1',
    name: 'Project Gutenberg English Prose v1',
    version: 'v1.0',
    fingerprint: '931b07a635ca5a0c',
    documentCount: 105,
    workCount: 3,
    characterCount: 1660274,
    license: 'Public Domain (US) / Project Gutenberg License',
    experimentsTrained: ['E2607'],
    splitStrategy: 'Document-level / within-work',
    composition: 'Three 19th-century public-domain literary works, partitioned into chapter-sized chunks.',
    limitations: 'Narrow sample of three authors from a single historical era. Style remains highly idiosyncratic.'
  },
  {
    id: 'gutenberg-english-prose-v2',
    name: 'Project Gutenberg English Prose v2',
    version: 'v2.0',
    fingerprint: 'e9fc2e92f59d88ea',
    documentCount: 919,
    workCount: 24,
    characterCount: 14490005,
    license: 'Public Domain (US) / Project Gutenberg License',
    experimentsTrained: ['E2608', 'E2610', 'E2611'],
    splitStrategy: 'Document-level / within-work',
    composition: '24 Project Gutenberg texts chosen so that no single source contributes more than 14.6% of the token volume.',
    limitations: 'Historical within-work split: 100% of test characters were chapters from books represented in training (ADR-0042). Archaic vocabulary.'
  },
  {
    id: 'technical-mixture-v1',
    name: 'Chakaso Multi-Register Technical Mixture v1',
    version: 'v1.0',
    fingerprint: 'd7b42fae9102c817',
    documentCount: 2756,
    workCount: 142,
    characterCount: 19660800,
    license: 'Apache-2.0 and Verified Public Domain',
    experimentsTrained: ['E2612', 'E2613', 'E2614', 'E2620', 'E2625', 'E2630'],
    splitStrategy: 'Whole-work held-out',
    composition: 'Five balanced registers: literary prose (40%), technical documentation (20%), clean code (15%), mathematical exposition (15%), and technical dialogue (10%).',
    limitations: 'Evaluation across heterogeneous registers shows non-uniform loss variance (mathematics seed standard deviation of 0.0123 bpc vs prose 0.0023 bpc).'
  }
];
