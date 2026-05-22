import React, { useState, useEffect } from 'react';
import { Languages, Volume2, Sparkles, AlertTriangle, Play, Square, Shield } from 'lucide-react';
import { TranslationResponse } from '../types';

interface TranslationHubProps {
  translation: TranslationResponse | null;
  isTranslating: boolean;
  selectedLanguage: 'en' | 'fil';
  onLanguageChange: (lang: 'en' | 'fil') => void;
}

export default function TranslationHub({
  translation,
  isTranslating,
  selectedLanguage,
  onLanguageChange
}: TranslationHubProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);
  const [activeUtterance, setActiveUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynth(window.speechSynthesis);
    }
  }, []);

  // Handle TTS Playback
  const handleToggleSpeech = () => {
    if (!speechSynth || !translation) return;

    if (isPlayingAudio) {
      speechSynth.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = selectedLanguage === 'en' 
      ? translation.englishTranslation 
      : translation.filipinoTranslation;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Select best speaking voice based on requested language
    if (selectedLanguage === 'fil') {
      utterance.lang = 'fil-PH';
      utterance.pitch = 1.1; // Filipino dog translations are lively
      utterance.rate = 1.05;
    } else {
      utterance.lang = 'en-US';
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveUtterance(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveUtterance(null);
    };

    setActiveUtterance(utterance);
    setIsPlayingAudio(true);
    speechSynth.speak(utterance);
  };

  // Silence TTS if translation overrides or changes
  useEffect(() => {
    if (speechSynth && isPlayingAudio) {
      speechSynth.cancel();
      setIsPlayingAudio(false);
    }
  }, [translation, selectedLanguage]);

  return (
    <div id="translation-console-card" className="bg-[#0F1115] border border-white/10 rounded-3xl p-8 shadow-2xl relative transition-all duration-300 flex flex-col justify-between h-full min-h-[440px]">
      {/* Background radial shine */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] blur-3xl pointer-events-none rounded-full" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
              <Languages className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-[#E0E2E6] tracking-tight">Translation Console</h2>
              <p className="text-[#E0E2E6]/40 text-xs mt-1">Dual-mode conversion with active voice synthesizer.</p>
            </div>
          </div>

          {/* Seamless language switcher pill */}
          <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl select-none shrink-0 self-start md:self-auto">
            <button
              id="lang-btn-en"
              onClick={() => onLanguageChange('en')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                selectedLanguage === 'en'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-[#E0E2E6]/40 hover:text-[#E0E2E6]/80'
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-fil"
              onClick={() => onLanguageChange('fil')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                selectedLanguage === 'fil'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-[#E0E2E6]/40 hover:text-[#E0E2E6]/80'
              }`}
            >
              Filipino
            </button>
          </div>
        </div>

        {/* Translation State Renderer */}
        {isTranslating ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* Pulsing cybernetic ring loader */}
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 animate-pulse" />
              <div className="absolute inset-5 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <p className="font-light text-[#E0E2E6] text-sm tracking-wide">Syncing Dog Frequencies...</p>
            <p className="text-zinc-500 text-xs mt-2 max-w-xs leading-relaxed">
              BarkDecoder is matching frequency waves with Gemini bioacoustic cognitive models.
            </p>
          </div>
        ) : translation ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Primary Translation Card bubble */}
            <div id="translation-speech-bubble" className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              {/* Highlight decoration edge */}
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/80" />
              
              <div className="flex items-center justify-between mb-4 pl-2">
                <div>
                  <span className="text-[10px] text-[#E0E2E6]/40 uppercase tracking-[0.2em] font-mono block">Canine Vocal Mindset</span>
                  <span className="text-sm font-semibold text-cyan-400 tracking-tight">
                    {translation.emotion}
                  </span>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                  {translation.confidence}% Acc
                </div>
              </div>

              {/* Translation Text Quotes section */}
              <div className="pl-2 pr-2 py-6 border-t border-b border-white/5 my-4">
                <p className="text-[#E0E2E6] font-sans text-2xl font-light leading-relaxed tracking-tight italic select-text">
                  "{selectedLanguage === 'en' ? translation.englishTranslation : translation.filipinoTranslation}"
                </p>
              </div>

              {/* TTS Voice Synthesizer row */}
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-3">
                  <button
                    id="tts-trigger-btn"
                    onClick={handleToggleSpeech}
                    className={`px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-semibold tracking-wider uppercase border transition-all duration-350 active:scale-[0.98] cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400'
                        : 'bg-white/[0.04] border-white/10 text-cyan-400 hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-red-400" />
                        <span>Mute Synth</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-cyan-400" />
                        <span>Speak</span>
                      </>
                    )}
                  </button>

                  {/* Tiny simulated voice equalizer bars if playing */}
                  {isPlayingAudio && (
                    <div className="flex items-center gap-0.5 h-4 px-2 select-none">
                      <span className="w-0.5 bg-cyan-400 rounded-xs animate-[bounce_0.6s_infinite_100ms] h-3" />
                      <span className="w-0.5 bg-cyan-400 rounded-xs animate-[bounce_0.6s_infinite_300ms] h-4" />
                      <span className="w-0.5 bg-cyan-400 rounded-xs animate-[bounce_0.6s_infinite_500ms] h-2.5" />
                      <span className="w-0.5 bg-cyan-400 rounded-xs animate-[bounce_0.6s_infinite_200ms] h-3.5" />
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                  TTS Engine: {selectedLanguage === 'en' ? 'en-US' : 'fil-PH'}
                </span>
              </div>
            </div>

            {/* Scientific Acoustic Explanation */}
            <div className="space-y-3 select-text">
              <h3 className="text-[10px] font-bold text-[#E0E2E6]/40 uppercase tracking-[0.2em]">
                Bioacoustic Spectrum Breakdown
              </h3>
              <p className="text-xs text-[#E0E2E6]/70 leading-relaxed font-sans bg-white/[0.01] border border-white/5 rounded-xl p-4">
                {translation.acousticAnalysis}
              </p>
            </div>

            {/* Warn message if running local simulation */}
            {translation.rejectionWarning && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-amber-400 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold block mb-0.5">Telemetry Notification</span>
                  {translation.rejectionWarning}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center select-none border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
            <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mb-4">
              <Volume2 className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="font-light text-[#E0E2E6]/80 text-sm">Awaiting Dog Voice Signals</p>
            <p className="text-zinc-500 text-xs mt-2 max-w-xs leading-relaxed">
              Listening for acoustic amplitude spikes or simulated templates to bridge the communication gap.
            </p>
          </div>
        )}
      </div>

      {/* Decorative footer element */}
      <div className="border-t border-white/5 pt-5 mt-8 flex items-center justify-between text-[10px] text-zinc-650 font-mono relative z-10 select-none">
        <span>STIPULATED ACCURACY PROTOCOL V2.0</span>
        <span>SYS: ACTIVE</span>
      </div>
    </div>
  );
}
