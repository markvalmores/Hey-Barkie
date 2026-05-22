import React, { useState } from 'react';
import { ExternalLink, Github, Cpu, ShieldCheck, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function DeploymentGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="deployment-guide-card" className="bg-[#0F1115] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-305">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
        id="toggle-deploy-guide-header"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-light text-[#E0E2E6] tracking-tight">GitHub & Vercel Integration Guide</h2>
            <p className="text-[#E0E2E6]/40 text-xs mt-1">Publish your translator app to GitHub & deploy live on Vercel in seconds.</p>
          </div>
        </div>
        
        <button className="text-zinc-500 hover:text-[#E0E2E6] transition-colors p-1" id="accordion-toggle-arrow">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-8 pt-8 border-t border-white/5 space-y-6 select-text animate-fadeIn">
          {/* Quick Intro */}
          <p className="text-xs text-[#E0E2E6]/60 leading-relaxed font-sans font-light">
            Because this application uses standard <strong>React + Vite + Express</strong> and contains our automated <code>esbuild</code> server compiler file in <code>package.json</code>, you can compile and deploy it anywhere on the cloud seamlessly! Let's review how you can export and run this on your personal accounts.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#0F1115] text-cyan-400 border border-white/10 flex items-center justify-center font-mono font-bold text-xs">01</span>
                <h3 className="text-xs font-semibold text-[#E0E2E6] tracking-wider uppercase font-sans flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-zinc-300" /> GitHub Sync
                </h3>
              </div>
              <p className="text-[11px] text-[#E0E2E6]/55 leading-relaxed font-sans font-light">
                In Google AI Studio, click on <strong>Export</strong> or <strong>Share</strong> in the top-right toolbar. Select <strong>Clone to GitHub</strong> to clone this entire workspace to your public or private GitHub repository instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#0F1115] text-cyan-400 border border-white/10 flex items-center justify-center font-mono font-bold text-xs">02</span>
                <h3 className="text-xs font-semibold text-[#E0E2E6] tracking-wider uppercase font-sans flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-zinc-300" /> Vercel Setup
                </h3>
              </div>
              <p className="text-[11px] text-[#E0E2E6]/55 leading-relaxed font-sans font-light">
                Sign into <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Vercel</a>. Click <strong>Add New &gt; Project</strong> and select your newly exported GitHub repository. Vercel automatically detects Vite setting presets.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#0F1115] text-cyan-400 border border-white/10 flex items-center justify-center font-mono font-bold text-xs">03</span>
                <h3 className="text-xs font-semibold text-[#E0E2E6] tracking-wider uppercase font-sans flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> API Variables
                </h3>
              </div>
              <p className="text-[11px] text-[#E0E2E6]/55 leading-relaxed font-sans font-light">
                Add <code>GEMINI_API_KEY</code> as an <strong>Environment Variable</strong> in your Vercel project Settings. Add your proprietary key from your AI Studio Secrets panel.
              </p>
            </div>
          </div>

          {/* Vercel build specifications */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 text-xs font-mono space-y-3">
            <div className="flex items-center gap-2 text-[#E0E2E6] font-sans font-semibold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Full-Stack Compilation Script Details:</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans font-light leading-relaxed">
              When launching onto container services or server hosts, use these configuration mappings included in our system config:
            </p>
            <div className="bg-[#0F1115] border border-white/5 p-4 rounded-xl text-[#E0E2E6]/80 overflow-x-auto text-[10px] space-y-1.5 select-all leading-normal">
              <div className="text-zinc-650">// Compilation Command (run automatically)</div>
              <div>npm run build</div>
              <div className="text-zinc-650 mt-3">// Launch command (runs compiled bundle)</div>
              <div>npm start</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
