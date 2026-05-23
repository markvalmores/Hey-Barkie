import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Languages, Volume2, Sparkles, AlertTriangle, Play, Square, Shield, Copy, Check, Share2, Download, X, ExternalLink } from 'lucide-react';
import { TranslationResponse } from '../types';
import { DOG_BREEDS, DogBreed } from '../data/breeds';

interface TranslationHubProps {
  translation: TranslationResponse | null;
  isTranslating: boolean;
  selectedLanguage: 'en' | 'fil';
  onLanguageChange: (lang: 'en' | 'fil') => void;
  selectedBreedId?: string;
}

// Custom typography text wrapping helper for HTML5 Canvas rendering
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

export default function TranslationHub({
  translation,
  isTranslating,
  selectedLanguage,
  onLanguageChange,
  selectedBreedId = 'pomeranian'
}: TranslationHubProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);
  const [activeUtterance, setActiveUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Custom features
  const [isCopied, setIsCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [breedImageUrl, setBreedImageUrl] = useState<string | null>(null);
  const [isRenderingImage, setIsRenderingImage] = useState(false);
  const [isCopyingPng, setIsCopyingPng] = useState(false);
  const [pngCopied, setPngCopied] = useState(false);

  // Load dog breed details for the active translation match
  const selectedBreedObj = useMemo(() => {
    return DOG_BREEDS.find(b => b.id === selectedBreedId) || DOG_BREEDS[0];
  }, [selectedBreedId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynth(window.speechSynthesis);
    }
  }, []);

  // Fetch a clean, randomized live dog.ceo photo aligned with the active breed
  useEffect(() => {
    if (!selectedBreedId) return;
    const CEO_BREED_MAP: Record<string, string> = {
      pomeranian: 'pomeranian',
      chihuahua: 'chihuahua',
      husky: 'husky',
      golden: 'retriever/golden',
      gsd: 'germanshepherd',
      frenchie: 'bulldog/french',
      corgi: 'corgi',
      shiba: 'shiba',
      beagle: 'beagle',
      border: 'collie/border',
      dane: 'dane/great',
      poodle: 'poodle/standard',
      basenji: 'basenji',
      mastiff: 'mastiff/tibetan'
    };
    
    const apiBreed = CEO_BREED_MAP[selectedBreedId];
    if (apiBreed) {
      fetch(`https://dog.ceo/api/breed/${apiBreed}/images/random`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setBreedImageUrl(data.message);
          } else {
            setBreedImageUrl(null);
          }
        })
        .catch(() => setBreedImageUrl(null));
    } else {
      setBreedImageUrl(null);
    }
  }, [selectedBreedId]);

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

  // Copy Translation text to Clipboard
  const handleCopyText = () => {
    if (!translation) return;
    const textToCopy = selectedLanguage === 'en' 
      ? translation.englishTranslation 
      : translation.filipinoTranslation;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Helper to load image securely allowing anonymous CORS draws for local export
  const loadBlobImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to download image asset.'));
      img.src = url;
    });
  };

  // Build the gorgeous visual image postcard dynamically in the background via Canvas
  const generatePostcardCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not init 2D context.');

    // 1. Draw Linear Dark Cosmic Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#0F1115');
    grad.addColorStop(1, '#1A1D24');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // 2. Draw Futuristic Grid Background detailing
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 800; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 600);
      ctx.stroke();
    }
    for (let i = 0; i < 600; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(800, i);
      ctx.stroke();
    }

    // 3. Draw Dual Futuristic Neon Borders
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, 560);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.strokeRect(26, 26, 748, 548);

    // 4. Header Bar Texting
    ctx.fillStyle = '#22D3EE';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText('🐾 CANINE BIOACOUSTIC TRANSLATION POSTCARD', 50, 60);

    ctx.fillStyle = '#A855F7';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('STIPULATED ONLINE ACCURACY MATCH V2.0', 750, 60);
    ctx.textAlign = 'left';

    // Thin separator line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(50, 80);
    ctx.lineTo(750, 80);
    ctx.stroke();

    // 5. Draw Dog Photo thumbnail or fallback emoji
    try {
      if (breedImageUrl) {
        const loadedImg = await loadBlobImage(breedImageUrl);
        ctx.save();
        ctx.beginPath();
        // Create rounded rectangle mask
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(50, 115, 170, 170, 20);
        } else {
          ctx.rect(50, 115, 170, 170);
        }
        ctx.clip();
        ctx.drawImage(loadedImg, 50, 115, 170, 170);
        ctx.restore();
      } else {
        throw new Error('No breed photo');
      }
    } catch {
      // Fallback box with Emoji
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(50, 115, 170, 170, 20);
      } else {
        ctx.rect(50, 115, 170, 170);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '72px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedBreedObj.emoji, 135, 200);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    // 6. Draw Dog Breed Info specs
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText(selectedBreedObj.name, 245, 145);

    ctx.fillStyle = '#A855F7';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(`SIZE: ${selectedBreedObj.size.toUpperCase()} REGISTER`, 245, 170);

    ctx.fillStyle = '#22D3EE';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`MINDSET / EMOTION: ${translation?.emotion.toUpperCase() || 'CALIBRATING'}`, 245, 200);

    // Dynamic Personality Wrap description text
    ctx.fillStyle = 'rgba(224, 226, 230, 0.65)';
    ctx.font = '13px "Inter", sans-serif';
    wrapText(ctx, selectedBreedObj.personality, 245, 230, 500, 20);

    // Large separator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(50, 315);
    ctx.lineTo(750, 315);
    ctx.stroke();

    // 7. Write the core translation dialogue in high-contrast styling
    ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText('“', 50, 365);

    const translatedSpeech = selectedLanguage === 'en' 
      ? translation?.englishTranslation 
      : translation?.filipinoTranslation;

    ctx.fillStyle = '#F3F4F6';
    ctx.font = 'italic 21px Georgia, serif';
    const endY = wrapText(ctx, translatedSpeech || 'Signal calibrating...', 55, 395, 680, 32);

    ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.font = 'bold 44px Georgia, serif';
    const safetyX = ctx.measureText(translatedSpeech || '').width > 680 ? 730 : 50 + ctx.measureText(translatedSpeech || '').width + 20;
    ctx.fillText('”', Math.min(730, safetyX), endY + 25);

    // 8. Footer metadata stamps with watermarks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(50, 520);
    ctx.lineTo(750, 520);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`BIOMETRIC ACCURACY CONFIDENCE RATIO: ${translation?.confidence || 93}%`, 50, 548);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#22D3EE';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText('HEY BARKIE • CREATED & DESIGNED BY MARK DAVID VALMORES', 750, 548);
    ctx.textAlign = 'left';

    return canvas;
  };

  // Safe user trigger to output generated file directly to disk
  const downloadToGallery = async () => {
    try {
      setIsRenderingImage(true);
      const canvas = await generatePostcardCanvas();
      const timestamp = Date.now();
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Hey_Barkie_Postcard_${selectedBreedObj.id}_${timestamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to compile postcard canvas:', err);
    } finally {
      setIsRenderingImage(false);
    }
  };

  // Clipboard image copying mechanism with grace fallbacks
  const copyPostcardImage = async () => {
    try {
      setIsCopyingPng(true);
      const canvas = await generatePostcardCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setPngCopied(true);
            setTimeout(() => setPngCopied(false), 2000);
          } else {
            throw new Error('Sandbox browser block');
          }
        } catch {
          // Direct fallback saving
          alert('Pasting image blobs is restricted inside iframe sandboxes. Automatically downloading the physical premium card file to your device gallery!');
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `Hey_Barkie_Postcard_${selectedBreedObj.id}.png`;
          link.href = dataUrl;
          link.click();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard image writing error:', err);
    } finally {
      setIsCopyingPng(false);
    }
  };

  // Generate Social Share Links
  const tweetText = useMemo(() => {
    if (!translation) return '';
    const text = selectedLanguage === 'en' ? translation.englishTranslation : translation.filipinoTranslation;
    return encodeURIComponent(`My lovely ${selectedBreedObj.name} dog companion just translated with Hey Barkie: "${text}"! 🐾 Created by Mark David Valmores! #HeyBarkie #DogTranslator`);
  }, [translation, selectedLanguage, selectedBreedObj]);

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
                  <span className="text-sm font-semibold text-cyan-400 tracking-tight flex items-center gap-1.5">
                    <span className="text-base">{selectedBreedObj.emoji}</span> {translation.emotion}
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

              {/* TTS Voice Synthesizer / Toolbelt button row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pl-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="tts-trigger-btn"
                    onClick={handleToggleSpeech}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase border transition-all duration-350 active:scale-[0.98] cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400'
                        : 'bg-white/[0.04] border-white/10 text-cyan-400 hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square className="w-3 h-3 fill-red-400" />
                        <span>Mute</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-cyan-400" />
                        <span>Speak</span>
                      </>
                    )}
                  </button>

                  {/* Copy Translation Text Button */}
                  <button
                    onClick={handleCopyText}
                    title="Copy text of translation"
                    className="px-3.5 py-2 rounded-lg flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase border bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer active:scale-[0.96]"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 text-[10px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Share photo card button */}
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    title="Share and Save Custom Postcard"
                    className="px-3.5 py-2 rounded-lg flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase border bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/25 hover:border-purple-500/50 text-purple-300 hover:text-purple-200 transition-all cursor-pointer active:scale-[0.96] animate-pulse"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Postcard</span>
                  </button>

                  {/* Tiny simulated voice equalizer bars if playing */}
                  {isPlayingAudio && (
                    <div className="flex items-center gap-0.5 h-4 px-2 select-none">
                      <span className="w-0.5 bg-cyan-400 rounded-xs animate-[bounce_0.6s_infinite_100ms] h-3" />
                      <span className="w-0.5 bg-cyan-400 rounded-xs animate-[bounce_0.6s_infinite_300ms] h-4" />
                      <span className="w-0.5 bg-cyan-400 rounded-xs animate-[bounce_0.6s_infinite_500ms] h-2.5" />
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

      {/* --- PREMIUM SAVE & SOCIALS PHOTO CARD CREATOR MODAL --- */}
      {isShareModalOpen && translation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0F1115] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase bg-cyan-900/15 border border-cyan-500/15 px-3 py-1 rounded-full inline-block mb-2">
                BarkPostcard Studio
              </span>
              <h3 className="text-xl font-light tracking-tight text-[#E0E2E6]">Save & Share Dog Quote Postcard</h3>
              <p className="text-zinc-500 text-xs mt-0.5 font-light">Preview and share physical souvenir cards of what your dog is thinking.</p>
            </div>

            {/* --- IMMERSIVE CUSTOM DESIGN POSTCARD PREVIEW (RESPONSIVE HTLM/CSS COPY OF CANVAS) --- */}
            <div className="border border-white/10 rounded-2xl bg-gradient-to-b from-[#11141B] to-[#171A21] p-5 sm:p-7 relative overflow-hidden shadow-xl select-none flex flex-col gap-5">
              
              {/* Tech aesthetics overlay */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400/[0.03] to-transparent pointer-events-none rounded-full" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />

              {/* Top watermark tags */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[8px] font-mono text-cyan-400/70 tracking-widest uppercase">CANINE TRANSLATION SOUVENIR</span>
                <span className="text-[8px] font-mono text-purple-400/80 tracking-widest uppercase">SYS LEVEL: MATCHED</span>
              </div>

              {/* Dog metadata rows */}
              <div className="flex gap-4">
                {breedImageUrl ? (
                  <img 
                    src={breedImageUrl} 
                    alt={selectedBreedObj.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/10 shrink-0 shadow-lg shadow-black/50"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                    <span className="text-3xl">{selectedBreedObj.emoji}</span>
                  </div>
                )}
                
                <div className="space-y-1 text-left min-w-0">
                  <h4 className="text-base sm:text-lg font-bold tracking-tight text-white truncate flex items-center gap-1.5">
                    {selectedBreedObj.name}
                  </h4>
                  <span className="text-[8px] font-mono uppercase bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/10 inline-block font-semibold">
                    {selectedBreedObj.size} Class Register
                  </span>
                  <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-bold truncate">
                    EMOTION: {translation.emotion}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2 italic font-light">
                    {selectedBreedObj.personality}
                  </p>
                </div>
              </div>

              {/* Main quote dialogue bubble in card */}
              <div className="py-4 border-t border-b border-white/5 min-h-[100px] flex flex-col justify-center">
                <p className="text-gray-200 text-lg sm:text-xl font-light italic leading-relaxed text-center font-serif px-2">
                  “{selectedLanguage === 'en' ? translation.englishTranslation : translation.filipinoTranslation}”
                </p>
              </div>

              {/* Card Footer signatures */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] font-mono text-zinc-500 pt-1">
                <span>CONFIDENCE RATIO: {translation.confidence}% ACCURACY</span>
                <span className="text-cyan-400 text-center sm:text-right">HEY BARKIE • BY MARK DAVID VALMORES</span>
              </div>
            </div>

            {/* Micro instructions */}
            <p className="text-[10px] text-zinc-500 font-mono text-center mt-4">
              ✨ Generated as a 800x600 High-Res premium postcard on download.
            </p>

            {/* Action Buttons cluster */}
            <div className="grid grid-cols-2 gap-3.5 mt-5">
              <button
                onClick={downloadToGallery}
                disabled={isRenderingImage}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold p-3.5 rounded-xl text-xs uppercase tracking-wider shrink-0 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-500/15 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isRenderingImage ? 'Building PNG...' : 'Save to Gallery'}</span>
              </button>

              <button
                onClick={copyPostcardImage}
                disabled={isCopyingPng}
                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 text-zinc-300 font-bold p-3.5 rounded-xl text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {pngCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Card</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Share on Social Networking Channels */}
            <div className="mt-6 border-t border-white/5 pt-5 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-3.5">
                Quick Social Dispatch
              </span>
              <div className="flex justify-center items-center gap-4">
                <a 
                  href={tweetText ? `https://twitter.com/intent/tweet?text=${tweetText}` : '#'}
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-400 border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  Share on X (Twitter)
                </a>
                
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  Share on Facebook
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Decorative footer element */}
      <div className="border-t border-white/5 pt-5 mt-8 flex items-center justify-between text-[10px] text-zinc-650 font-mono relative z-10 select-none">
        <span>STIPULATED ACCURACY PROTOCOL V2.0</span>
        <span>SYS: ACTIVE</span>
      </div>
    </div>
  );
}
