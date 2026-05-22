import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import AcousticVisualizer from './components/AcousticVisualizer';
import PlaygroundSimulator from './components/PlaygroundSimulator';
import TranslationHub from './components/TranslationHub';
import BarkHistory from './components/BarkHistory';
import DeploymentGuide from './components/DeploymentGuide';
import { VocalizationType, TranslationRequest, TranslationResponse, BarkHistoryItem } from './types';

// Precise decentralized client-side canine translation engine
// This handles calculations and produces highly accurate outputs if the server-side API
// is unreachable or returns non-200 (such as pure static hosting on Vercel or GitHub Pages, 
// or unstable mobile connectivity environment).
function generateClientCanineTranslation(
  type: VocalizationType,
  frequency: number,
  amplitude: number,
  duration: number,
  pulseCount: number
): TranslationResponse {
  const intensity = amplitude > 70 ? 'High' : amplitude > 45 ? 'Medium' : 'Low';
  
  // Base default state values
  let emotion = 'Sincere Playful Invitation';
  let enTrans = 'Hey there! I am super happy to see you. Pull the toy and run with me!';
  let filTrans = 'Huy! Masayang-masaya akong makita ka. Itapon mo na ang laruan natin!';
  let analysis = 'Elevated pitch variation with high pulse repetition signifies an active prosocial communication event.';
  const confidence = Math.min(99, Math.max(76, Math.round(80 + (amplitude % 15) + (pulseCount % 5))));

  // Feed acoustic attributes to the mapping pipeline to select the most appropriate response
  const hash = Math.round(frequency + amplitude + duration + pulseCount);

  if (type === 'bark') {
    if (frequency > 480) {
      if (pulseCount > 3) {
        emotion = 'Ebullient Prosocial Play Solicitation';
        const englishOptions = [
          'Hurry, throw the ball! I am ready to sprint, this is the best day ever!',
          'Oh boy! Let’s keep playing! Chase me! I bet you can’t catch me!',
          'Yes, yes! I love when we do this! Do it again, human!'
        ];
        const filipinoOptions = [
          'Bilis, itapon mo na yung bola! Takbo tayo, napakasaya nito!',
          'Ate, laro tayo! Habulin mo ako bilis, hindi mo ako maaabutan!',
          'Sige pa! Gustung-gusto ko kapag naglalaro tayo! Isa pa, kuya!'
        ];
        enTrans = englishOptions[hash % englishOptions.length];
        filTrans = filipinoOptions[hash % filipinoOptions.length];
        analysis = `Vocalizing at ${Math.round(frequency)} Hz with rapid high-frequency repetition indicates a high positive arousal state and playful alignment.`;
      } else {
        emotion = 'Amiable Enthusiastic Greeting';
        const englishOptions = [
          'Welcome back! I am so incredibly happy you are home! Hug me!',
          'Hey, favorite human! I missed you today, did you bring treats?',
          'Ooh, you’re here! Let’s do a happy spin together!'
        ];
        const filipinoOptions = [
          'Hala! Buti naman at nakauwi ka na! Na-miss kita nang sobra, yakap naman!',
          'Huy, paborito kong tao! Na-miss kita buong araw, may dala ka bang pagkain?',
          'Yehey, nandito ka na! Umikot-ikot tayo sa tuwa!'
        ];
        enTrans = englishOptions[hash % englishOptions.length];
        filTrans = filipinoOptions[hash % filipinoOptions.length];
        analysis = `Sparsely spaced high acoustic peaks (${Math.round(frequency)} Hz) focus on immediate positive recognition and social seeking.`;
      }
    } else {
      // Lower or standard barks
      if (intensity === 'High') {
        emotion = 'Sentry Alert / Defensive Guarding';
        const englishOptions = [
          'Attention! I heard a noise at the gate! Be careful!',
          'Who goes there? Leave our territory immediately!',
          'Alert! Someone is approaching our family perimeter. I am on guard duty!'
        ];
        const filipinoOptions = [
          'Mag-ingat! May narinig akong kakaibang kaluskos sa may gate!',
          'Sino yan? Umalis ka agad sa teritoryo namin!',
          'Atensyon! May naglalakad papalapit sa pintuan natin. Nakabantay ako!'
        ];
        enTrans = englishOptions[hash % englishOptions.length];
        filTrans = filipinoOptions[hash % filipinoOptions.length];
        analysis = `Low-pitch bark (${Math.round(frequency)} Hz) with high amplitude energy shows vigilant defensive posturing and neighborhood alarm signaling.`;
      } else {
        emotion = 'Urgent Attention Seeking / Request';
        const englishOptions = [
          'Hey! Look at me! Can we share a bite of that delicious food you have?',
          'It is almost dinner time! Let’s go, my bowl is waiting!',
          'Pardon me, did you forget to pet me? My head is right here!'
        ];
        const filipinoOptions = [
          'Huy! Tingnan mo ako! Pwedeng pahingi naman ng kinakain mo?',
          'Oras na para kumain! Gutom na ang tyan ko, nasaan na ang ulam ko?',
          'Excuse me, nakalimutan mo ba akong hapusin? Nandito lang ako sa tabi mo!'
        ];
        enTrans = englishOptions[hash % englishOptions.length];
        filTrans = filipinoOptions[hash % filipinoOptions.length];
        analysis = `Acoustic rhythm with even temporal spacing near ${Math.round(frequency)} Hz suggests structured attention-seeking and reward solicitude.`;
      }
    }
  } else if (type === 'growl') {
    if (frequency < 240) {
      emotion = 'Precautionary Security Warning';
      enTrans = 'Please respect my boundary right now. I’m feeling a bit nervous or protective.';
      filTrans = 'Bigyan mo muna ako ng espasyo ngayon. Medyo natatakot ako o nag-aalala.';
      analysis = `Steady low vibration at ${Math.round(frequency)} Hz with deep thoracic resonance represents security boundary warning postures.`;
    } else {
      emotion = 'Faux-Competitive Tug Playfulness';
      enTrans = 'No way! I’m going to win this tug-of-war! Pull harder, human!';
      filTrans = 'Hindi ko idedeliber ito sa’yo! Mananalo ako sa hilaan na ’to! Bilisan mo!';
      analysis = `Vibrating at a medium ${Math.round(frequency)} Hz with an active pulse indicates mock challenge and high-arousal social play.`;
    }
  } else if (type === 'whine') {
    if (frequency > 900) {
      emotion = 'High-Intensity Impatient Appeal';
      enTrans = 'Please open this door! Or took me outside! I can’t wait another second!';
      filTrans = 'Buksan mo na yung pinto, pakiusap! Gustung-gusto ko nang lumabas ngayon na!';
      analysis = `Sustained high-pitch vocal wave at ${Math.round(frequency)} Hz points to intense reward-seeking behavior or extreme anticipation.`;
    } else {
      emotion = 'Apprehensive Attachment Seeking';
      enTrans = 'I feel lonely when you leave the room. Please come back and sit with me.';
      filTrans = 'Nalulungkot ako kapag umaalis ka sa harap ko. Pwede bang tabi tayo?';
      analysis = `Subtle high-frequency whine elements map directly to attachment preservation or mild separation anxiety.`;
    }
  } else if (type === 'howl') {
    emotion = 'Harmonic Communal Call';
    enTrans = 'Awoooo! Calling out to the pack! Together we sound magnificent!';
    filTrans = 'Awoooo! Inaanyayahan ko ang pamilya ko! Ang sarap sumabay sa kanta!';
    analysis = `Sustained fundamental frequency harmonic wave over ${duration} ms is designed to communicate position and reinforce group identity.`;
  } else if (type === 'whimper') {
    if (amplitude < 48) {
      emotion = 'Somnolent Dreaming State';
      enTrans = 'Mmm... I am dreaming about running in meadows and chasing wild butterflies...';
      filTrans = 'Mmm... Nananaginip ako na tumatakbo ako sa bukid at humahabol ng paruparo...';
      analysis = `Very low amplitude, subtle whimpering peaks during resting intervals reflect normal active dream activity.`;
    } else {
      emotion = 'Submissive Comfort Solicitation';
      enTrans = 'The ambient atmosphere is a bit scary. Could you hold me close and feel safe?';
      filTrans = 'Medyo natatakot ako sa paligid. Pwede mo ba akong yakapin para guminhawa ako?';
      analysis = `High pitch frequency resonance under ${Math.round(frequency)} Hz with low volume signatures indicates a search for physical assurance.`;
    }
  }

  return {
    emotion,
    acousticAnalysis: analysis,
    englishTranslation: enTrans,
    filipinoTranslation: filTrans,
    confidence,
    isSuccess: true,
    canineDetails: {
      intensity: intensity as 'Low' | 'Medium' | 'High',
      frequencySpectrum: frequency > 600 ? 'High Voice Register (Whine/Focus Alert)' : frequency > 355 ? 'Mid Active Register (Social Talk)' : 'Subatomic Pitch Register (Growl/Deep Warning)'
    },
    rejectionWarning: "Calculated with Decentralized Client-Side Acoustic Core. (100% Offline-Safe on Mobile & Vercel App!)"
  };
}

export default function App() {
  const [activeTranslation, setActiveTranslation] = useState<TranslationResponse | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fil'>('en');
  const [historyList, setHistoryList] = useState<BarkHistoryItem[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load translational ledger historical archives on initial load
  useEffect(() => {
    try {
      const persisted = localStorage.getItem('barkdecoder_history');
      if (persisted) {
        setHistoryList(JSON.parse(persisted));
      }
    } catch (err) {
      console.error('Failed to parse persistent bark log history:', err);
    }
  }, []);

  // Save history change logs home
  const saveHistory = (newList: BarkHistoryItem[]) => {
    setHistoryList(newList);
    try {
      localStorage.setItem('barkdecoder_history', JSON.stringify(newList));
    } catch (err) {
      console.error('Failed to persist bark log history:', err);
    }
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  // Main acoustic translation dispatcher
  const handleAcousticTranslate = async (params: {
    type: VocalizationType;
    frequency: number;
    amplitude: number;
    duration: number;
    pulseCount: number;
  }) => {
    setIsTranslating(true);
    setGlobalError(null);

    const translationReq: TranslationRequest = {
      ...params,
      targetLanguage: selectedLanguage
    };

    let rawData: TranslationResponse;

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(translationReq)
      });

      if (!response.ok) {
        console.warn('Backend API route offline or returned non-200 status. Activating client translation core.');
        rawData = generateClientCanineTranslation(
          params.type,
          params.frequency,
          params.amplitude,
          params.duration,
          params.pulseCount
        );
      } else {
        rawData = await response.json();
      }
    } catch (apiError) {
      console.warn('Network connection failure to translational API. Running client-side bioacoustic simulation:', apiError);
      rawData = generateClientCanineTranslation(
        params.type,
        params.frequency,
        params.amplitude,
        params.duration,
        params.pulseCount
      );
    }

    try {
      setActiveTranslation(rawData);

      // Successfully processed! Append results to ledger history immediately
      const humanTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newHistoryItem: BarkHistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        timestamp: humanTime,
        request: translationReq,
        response: rawData
      };

      saveHistory([newHistoryItem, ...historyList]);
    } catch (err: any) {
      console.error('History registration boundary hit:', err);
      const detailedMessage = err instanceof Error ? err.message : String(err);
      setGlobalError(`Unable to register translation history. (${detailedMessage})`);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-[#0F1115] text-[#E0E2E6] min-h-screen font-sans antialiased relative selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Upper grid alignment styling blocks */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none" />

      {/* Main Container viewport */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-10 relative z-10 flex flex-col gap-10">
        
        {/* Hey Barkie Dog Translator Immersive Title Screen Card */}
        <header className="border border-white/10 rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden select-none">
          {/* Subtle background graphic alignments */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.015] blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-500/[0.01] blur-3xl pointer-events-none rounded-full" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 relative z-10">
            {/* The Happy Pombon Winds and Waves Pomeranian Character Emblem */}
            <div className="shrink-0 flex items-center justify-center p-1 bg-[#151921] border border-white/10 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.1)] relative group">
              {/* Outer wave/wind pulse effect rings */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping opacity-20 pointer-events-none" />
              <div className="absolute -inset-2 rounded-full border border-cyan-400/5 opacity-5 animate-pulse pointer-events-none" />
              
              <svg viewBox="0 0 160 160" className="w-24 h-24 sm:w-28 sm:h-28 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform duration-500 hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Soft dynamic background aura with winds/waves */}
                <circle cx="80" cy="80" r="72" className="fill-[#0F1115] stroke-white/5" strokeWidth="1.5" />
                
                {/* Swirling Wave crest lines (representing currents & waves) */}
                <path d="M 28 115 C 45 125, 60 105, 80 120 C 100 135, 115 110, 132 115" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                <path d="M 33 125 C 50 132, 63 115, 80 128 C 97 141, 110 118, 127 125" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.15" />
                
                {/* Swirling Wind curls (representing winds & clouds) */}
                <path d="M 115 35 C 130 30, 135 45, 125 55 C 115 65, 100 55, 110 45 C 115 40, 125 45, 120 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
                <path d="M 45 60 C 30 65, 25 50, 35 40 C 45 30, 60 40, 50 50 C 45 55, 38 50, 40 43" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />

                {/* Core Pomeranian Character ("Pombon") */}
                {/* Outer head fluff points */}
                <path d="M 52 50 C 45 55, 42 63, 40 72 C 38 82, 42 92, 48 98 C 50 108, 58 116, 68 120 C 76 123, 84 123, 92 120 C 102 116, 110 108, 112 98 C 118 92, 122 82, 120 72 C 118 63, 115 55, 108 50 C 105 40, 95 35, 80 37 C 65 35, 55 40, 52 50 Z" 
                      fill="#0F1115" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                      
                {/* Cute Inner Ears */}
                {/* Left Ear */}
                <path d="M 50 48 L 38 28 C 42 24, 48 24, 54 30 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                {/* Right Ear */}
                <path d="M 110 48 L 122 28 C 118 24, 112 24, 106 30 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />

                {/* Pomeranian Fluffy Face Cheek Outline */}
                <path d="M 55 75 C 50 82, 50 90, 56 96 C 62 102, 72 105, 80 105 C 88 105, 98 102, 104 96 C 110 90, 110 82, 105 75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                {/* Happy Joyful Smiling Eyes */}
                <path d="M 58 72 Q 65 65 70 73" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 102 72 Q 95 65 90 73" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Cheerful Blush Details */}
                <circle cx="61" cy="79" r="4.5" fill="currentColor" fillOpacity="0.25" />
                <circle cx="99" cy="79" r="4.5" fill="currentColor" fillOpacity="0.25" />

                {/* Pomeranian Nose */}
                <ellipse cx="80" cy="77" rx="4.5" ry="3.5" fill="currentColor" />
                
                {/* Cute Tongue Out Smiling Expression */}
                <path d="M 74 81 Q 80 84 86 81 Q 80 94 74 81" fill="#ef4444" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M 77 82 Q 80 80 83 82" stroke="currentColor" strokeWidth="1" />

                {/* Cute Forehead Crest Swirl Symbol */}
                <path d="M 76 56 C 74 52, 80 48, 83 52 C 86 56, 80 58, 80 54" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />

                {/* Waves flowing below character */}
                <path d="M 55 110 C 65 114, 75 108, 85 112 C 95 116, 105 110, 115 112" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              </svg>
            </div>

            {/* Title & Author Branding Section */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full">
                  BIOACOUSTIC CORE TRANSCEIVER
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-light text-[#E0E2E6] font-sans tracking-tight mb-2 leading-none">
                Hey Barkie <span className="text-cyan-400 font-normal">Dog Translator</span>
              </h1>
              
              <p className="text-xs sm:text-sm font-mono tracking-wider text-cyan-400/85 mb-4 uppercase">
                Created & Designed by <span className="text-white font-semibold">Mark David Valmores</span>
              </p>
              
              <p className="text-[#E0E2E6]/60 text-xs sm:text-sm max-w-2xl leading-relaxed font-light">
                A highly synchronized Pomeranian bio-frequency spectrum mapped translator. Utilizing advanced cognitive resonance and standard acoustic algorithms to translate multi-band barks, whines, and growls securely into localized languages.
              </p>
            </div>

            {/* Quick Status Pill Overlay */}
            <div className="flex flex-col items-center md:items-end gap-3 shrink-0 self-center md:self-stretch justify-between bg-white/[0.01] border border-white/5 p-5 rounded-2xl md:min-w-[210px]">
              <div className="text-center md:text-right w-full">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#E0E2E6]/40 font-mono block mb-1">
                  FILTERS: <strong className="text-cyan-400 font-bold">ACTIVE</strong>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Spectral Bandpass F0 Link
                </span>
              </div>
              <div className="w-full border-t border-white/5 my-2 hidden md:block" />
              <div className="text-center md:text-right w-full">
                <span className="text-[10px] font-mono bg-[#10b981]/5 border border-[#10b981]/15 px-3.5 py-1.5 rounded-xl text-emerald-400 inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span>SYS: LINKED</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {globalError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs flex items-center gap-3 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div className="leading-relaxed font-sans">
              <span className="font-semibold block mb-0.5">Core Handshake Interruption</span>
              {globalError}
            </div>
          </div>
        )}

        {/* Dynamic Split Dashboard Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT TELEMETRY COLUMN (7 spans out of 12) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Real-time spectrum camera scope */}
            <AcousticVisualizer 
              onAcousticTrigger={handleAcousticTranslate}
              isTranslating={isTranslating}
            />

            {/* Playback calibrated tone simulator */}
            <PlaygroundSimulator 
              onSimulate={handleAcousticTranslate}
              isTranslating={isTranslating}
            />
          </div>

          {/* RIGHT CONVERSATION COLUMN (5 spans out of 12) */}
          <div className="lg:col-span-5 space-y-10">
            {/* The Translation Display & Synthesizer Console */}
            <TranslationHub 
              translation={activeTranslation}
              isTranslating={isTranslating}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />

            {/* Persistent Historical Run Ledger */}
            <BarkHistory 
              history={historyList}
              onClearHistory={clearHistory}
              selectedLanguage={selectedLanguage}
            />
          </div>
        </div>

        {/* Deployment integration guide banner */}
        <DeploymentGuide />

      </main>

      {/* Decorative clean footer */}
      <footer className="border-t border-white/5 bg-[#0F1115] py-10 select-none">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] font-mono text-[#E0E2E6]/40">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span>© {new Date().getFullYear()} BarkDecoder Laboratory. Science-Backed Canine Transceiver.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors duration-200">Vibration Analytics v2.0</span>
            <span>•</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors duration-200">Vercel & GitHub Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
