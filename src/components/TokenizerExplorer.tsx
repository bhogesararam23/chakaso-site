import React, { useState } from 'react';

interface TokenItem {
  id: number;
  text: string;
  bytes: string[];
}

const PRESETS = [
  "Intelligence, engineered from first principles.",
  "chakaso.models.load_model('checkpoints/e2608')",
  "Transformer(d_model=256, n_layers=6, vocab=4096)",
  "Deterministic subword vocabulary with lossless byte fallback."
];

// Deterministic mock subword segmentation modeling BPE rules:
// - Boundary isolation (merges do not cross whitespace or punctuation)
// - Subword merges
function tokenizeText(text: string): TokenItem[] {
  if (!text) return [];

  // Match words, whitespace, or punctuation
  const regex = /(\s+|[a-zA-Z]+|[0-9]+|[^\s\w]+)/g;
  const matches = text.match(regex) || [];
  const tokens: TokenItem[] = [];
  let currentId = 101;

  matches.forEach((segment) => {
    // If word is long (> 5 chars), simulate BPE subword split
    if (/^[a-zA-Z]{6,}$/.test(segment)) {
      const splitAt = Math.floor(segment.length / 2);
      const sub1 = segment.slice(0, splitAt);
      const sub2 = segment.slice(splitAt);
      
      tokens.push({
        id: (currentId * 17) % 4096,
        text: sub1,
        bytes: Array.from(new TextEncoder().encode(sub1)).map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
      });
      currentId++;

      tokens.push({
        id: (currentId * 23) % 4096,
        text: sub2,
        bytes: Array.from(new TextEncoder().encode(sub2)).map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
      });
      currentId++;
    } else {
      tokens.push({
        id: (currentId * 13) % 4096,
        text: segment,
        bytes: Array.from(new TextEncoder().encode(segment)).map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
      });
      currentId++;
    }
  });

  return tokens;
}

const COLOR_CLASSES = [
  'bg-indigo-500/15 border-indigo-500/30 text-indigo-200',
  'bg-purple-500/15 border-purple-500/30 text-purple-200',
  'bg-sky-500/15 border-sky-500/30 text-sky-200',
  'bg-emerald-500/15 border-emerald-500/30 text-emerald-200',
  'bg-amber-500/15 border-amber-500/30 text-amber-200'
];

export default function TokenizerExplorer() {
  const [inputText, setInputText] = useState(PRESETS[0]);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);

  const tokens = tokenizeText(inputText);
  const charCount = inputText.length;
  const tokenCount = tokens.length;
  const compressionRatio = tokenCount > 0 ? (charCount / tokenCount).toFixed(2) : '0';

  const selectedToken = selectedTokenIndex !== null && tokens[selectedTokenIndex] ? tokens[selectedTokenIndex] : null;

  return (
    <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0c0e12]/90 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
        <div>
          <span className="font-mono text-xs text-indigo-400 uppercase tracking-widest">Interactive Simulation</span>
          <h3 className="text-xl font-bold text-white mt-1">Subword Tokenization & Byte Breakdown</h3>
          <p className="text-xs text-slate-400 mt-1">
            Test how boundary-isolated Byte-Pair Encoding segments phrases without cross-word leakage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded font-mono text-[11px] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Vocab: 4,096 BPE
          </span>
        </div>
      </div>

      {/* Presets */}
      <div className="pt-6">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-2">Preset Samples:</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(preset);
                setSelectedTokenIndex(null);
              }}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-indigo-500/30 text-slate-300 transition-colors cursor-pointer text-left truncate max-w-xs"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="mt-4">
        <label htmlFor="tokenizer-input" className="sr-only">Input text to tokenize</label>
        <textarea
          id="tokenizer-input"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setSelectedTokenIndex(null);
          }}
          rows={3}
          className="w-full p-4 rounded-xl border border-white/10 bg-[#07080a] text-sm text-slate-200 font-mono focus:border-indigo-500/50 focus:outline-none transition-colors"
          placeholder="Type or paste any text to see real-time BPE token discretization..."
        />
      </div>

      {/* Live Statistics */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
        <div className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.01]">
          <div className="text-[10px] text-slate-500 uppercase">Tokens</div>
          <div className="text-lg font-semibold text-white mt-0.5">{tokenCount}</div>
        </div>
        <div className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.01]">
          <div className="text-[10px] text-slate-500 uppercase">Characters</div>
          <div className="text-lg font-semibold text-white mt-0.5">{charCount}</div>
        </div>
        <div className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.01]">
          <div className="text-[10px] text-slate-500 uppercase">Chars / Token</div>
          <div className="text-lg font-semibold text-indigo-300 mt-0.5">{compressionRatio}</div>
        </div>
        <div className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.01]">
          <div className="text-[10px] text-slate-500 uppercase">Byte Fallback</div>
          <div className="text-lg font-semibold text-emerald-400 mt-0.5">100% Total</div>
        </div>
      </div>

      {/* Token Chips Visualisation */}
      <div className="mt-6 pt-6 border-t border-white/[0.08]">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-3">
          Discretized Token Sequence (Click any token to inspect byte mapping):
        </span>
        <div className="p-4 rounded-xl border border-white/[0.06] bg-[#07080a] min-h-[90px] flex flex-wrap gap-1.5 items-center">
          {tokens.map((tok, index) => {
            const colorClass = COLOR_CLASSES[index % COLOR_CLASSES.length];
            const isSelected = selectedTokenIndex === index;
            const displayChar = tok.text === ' ' ? '␣' : tok.text === '\n' ? '↵' : tok.text;

            return (
              <button
                key={index}
                onClick={() => setSelectedTokenIndex(isSelected ? null : index)}
                className={`px-2 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${colorClass} ${
                  isSelected ? 'ring-2 ring-white scale-105 shadow-md shadow-indigo-500/20' : 'hover:scale-105'
                }`}
                title={`Token #${index} — ID: ${tok.id}`}
              >
                <span>{displayChar}</span>
                <span className="text-[9px] opacity-60 ml-1">#{tok.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Token Inspector */}
      {selectedToken && (
        <div className="mt-4 p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-indigo-400 font-semibold">TOKEN INSPECTOR: </span>
            <span className="text-white font-bold ml-1">"{selectedToken.text}"</span>
            <span className="text-slate-400 ml-3">(ID: {selectedToken.id})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">UTF-8 Bytes:</span>
            <div className="flex flex-wrap gap-1">
              {selectedToken.bytes.map((b, bIdx) => (
                <span key={bIdx} className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 text-[10px]">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
