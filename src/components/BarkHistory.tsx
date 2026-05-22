import React from 'react';
import { History, Trash2, Calendar, Shield, Activity, VolumeX } from 'lucide-react';
import { BarkHistoryItem } from '../types';

interface BarkHistoryProps {
  history: BarkHistoryItem[];
  onClearHistory: () => void;
  selectedLanguage: 'en' | 'fil';
}

export default function BarkHistory({ history, onClearHistory, selectedLanguage }: BarkHistoryProps) {
  return (
    <div id="bark-history-card" className="bg-[#0F1115] border border-white/10 rounded-3xl p-8 relative transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
            <History className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-light text-[#E0E2E6] tracking-tight">Translation Ledger</h2>
            <p className="text-[#E0E2E6]/40 text-xs mt-1">Persistent database of successfully decoded vocal signatures.</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            id="clear-history-btn"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-medium text-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Logs</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
          <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mb-4">
            <VolumeX className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="font-light text-[#E0E2E6]/80 text-sm">Ledger Empty</p>
          <p className="text-zinc-500 text-xs mt-2 max-w-xs leading-relaxed">
            Successfully captured dog voice signals automatically populate this chronological audit trail database.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((item) => (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              className="group border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 rounded-2xl p-5 transition-all duration-300 select-text"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono tracking-wider px-2.5 py-1 rounded-full border ${
                    item.request.type === 'bark'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                      : item.request.type === 'growl'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/15'
                        : item.request.type === 'whine'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/15'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15'
                  }`}>
                    {item.request.type.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-[#E0E2E6] group-hover:text-cyan-300 transition-colors">
                    {item.response.emotion}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.timestamp}
                  </span>
                  <span className="flex items-center gap-1.5 bg-cyan-500/5 text-cyan-450 px-2.5 py-0.5 rounded-md border border-cyan-500/10">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    {item.response.confidence}% Acc
                  </span>
                </div>
              </div>

              {/* Translation quotation */}
              <div className="bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3.5 mb-4 leading-relaxed">
                <p className="text-[#E0E2E6] font-sans text-sm italic font-medium leading-normal">
                  "{selectedLanguage === 'en' ? item.response.englishTranslation : item.response.filipinoTranslation}"
                </p>
              </div>

              {/* Bioacoustic statistics tag line */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-zinc-500 font-mono border-t border-white/5 pt-3">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Freq: {item.request.frequency} Hz
                </span>
                <span>•</span>
                <span>Volume: {item.request.amplitude} dB</span>
                <span>•</span>
                <span>Pulses: {item.request.pulseCount}</span>
                <span>•</span>
                <span>Hold: {item.request.duration} ms</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
