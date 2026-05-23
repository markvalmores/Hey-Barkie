import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, ShieldCheck, Activity, Zap, VolumeX } from 'lucide-react';
import { VocalizationType } from '../types';

interface AcousticVisualizerProps {
  onAcousticTrigger: (data: {
    type: VocalizationType;
    frequency: number;
    amplitude: number;
    duration: number;
    pulseCount: number;
  }) => void;
  isTranslating: boolean;
  onBreedAutoDetect?: (breedId: string) => void;
  activeBreedId?: string;
}

export default function AcousticVisualizer({ 
  onAcousticTrigger, 
  isTranslating, 
  onBreedAutoDetect,
  activeBreedId 
}: AcousticVisualizerProps) {
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  // Real-time metrics
  const [peakFrequency, setPeakFrequency] = useState(0);
  const [dbLevel, setDbLevel] = useState(0);
  const [noiseFloor, setNoiseFloor] = useState(30);
  const [dogProfileMatch, setDogProfileMatch] = useState(0);
  const [humanSpeechDetected, setHumanSpeechDetected] = useState(false);
  const [signalType, setSignalType] = useState<VocalizationType>('none');
  const [detectedBreedId, setDetectedBreedId] = useState<string | null>(null);

  // Consecutive matches for high confidence breed prediction
  const consecutiveBreedMatchRef = useRef<{ id: string; count: number }>({ id: '', count: 0 });

  // Web Audio Nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Auto trigger threshold tracker
  const stableTimerRef = useRef<number | null>(null);
  const inCanineTriggerRef = useRef(false);
  const triggerDurationRef = useRef(0);
  const pulseCounterRef = useRef(0);
  const pulseTimerRef = useRef<number | null>(null);

  // Session accumulation statistics for stopping the mic to translate
  const sessionMaxFrequencyRef = useRef<number>(0);
  const sessionSumFrequencyRef = useRef<number>(0);
  const sessionFrequencyCountRef = useRef<number>(0);
  const sessionMaxDbRef = useRef<number>(0);
  const sessionPulseCountRef = useRef<number>(0);
  const sessionDurationRef = useRef<number>(0);
  const sessionTypeTallyRef = useRef<Record<VocalizationType, number>>({
    bark: 0,
    growl: 0,
    whine: 0,
    whimer: 0, // Fallback safely
    whimper: 0,
    howl: 0,
    none: 0
  });

  // Request/Toggle Microphone
  const toggleListening = async () => {
    if (isListening) {
      stopListening(true);
    } else {
      await startListening();
    }
  };

  const startListening = async () => {
    try {
      // Reset all session metrics refs to guarantee a clean slate
      sessionMaxFrequencyRef.current = 0;
      sessionSumFrequencyRef.current = 0;
      sessionFrequencyCountRef.current = 0;
      sessionMaxDbRef.current = 0;
      sessionPulseCountRef.current = 0;
      sessionDurationRef.current = 0;
      sessionTypeTallyRef.current = {
        bark: 0,
        growl: 0,
        whine: 0,
        whimer: 0,
        whimper: 0,
        howl: 0,
        none: 0
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission('granted');

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      
      // Connect sound pipeline: Source -> Analyser
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setMicPermission('denied');
    }
  };

  const stopListening = (shouldTriggerTranslation = false) => {
    if (shouldTriggerTranslation && isListening) {
      // Find dominant vocal type from tally
      let dominantType: VocalizationType = 'none';
      let maxTally = 0;
      const tallies = sessionTypeTallyRef.current;
      
      (Object.keys(tallies) as VocalizationType[]).forEach(k => {
        if (k !== 'none' && tallies[k] > maxTally) {
          maxTally = tallies[k];
          dominantType = k;
        }
      });

      // Calculate final pitch characteristics from the session
      const avgF0 = sessionFrequencyCountRef.current > 0 
        ? Math.round(sessionSumFrequencyRef.current / sessionFrequencyCountRef.current) 
        : 0;

      // Map to proper canine vocal types if none was directly matched
      if (dominantType === 'none' && avgF0 > 0) {
        if (avgF0 >= 100 && avgF0 < 300) dominantType = 'growl';
        else if (avgF0 >= 300 && avgF0 <= 580) dominantType = 'bark';
        else if (avgF0 > 580 && avgF0 <= 1100) dominantType = 'whimper';
        else if (avgF0 > 1100 && avgF0 <= 2800) dominantType = 'whine';
        else if (avgF0 > 2800) dominantType = 'howl';
      }

      // Compile final audio attributes
      const finalFrequency = avgF0 > 0 ? avgF0 : (sessionMaxFrequencyRef.current > 0 ? sessionMaxFrequencyRef.current : 380);
      const finalDb = sessionMaxDbRef.current > 20 ? sessionMaxDbRef.current : 58;
      const finalDuration = sessionDurationRef.current > 100 ? Math.round(sessionDurationRef.current) : 1200;
      const finalPulses = sessionPulseCountRef.current > 0 ? sessionPulseCountRef.current : 2;
      const finalType = dominantType !== 'none' ? dominantType : 'bark';

      console.log('Synthesizing immediate stop-translation from active session data:', {
        type: finalType,
        frequency: finalFrequency,
        amplitude: finalDb,
        duration: finalDuration,
        pulseCount: finalPulses
      });

      onAcousticTrigger({
        type: finalType,
        frequency: finalFrequency,
        amplitude: finalDb,
        duration: finalDuration,
        pulseCount: finalPulses
      });
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    analyserRef.current = null;
    audioContextRef.current = null;
    setIsListening(false);
    
    // Reset visual indicators
    setPeakFrequency(0);
    setDbLevel(0);
    setDogProfileMatch(0);
    setHumanSpeechDetected(false);
    setSignalType('none');
  };

  // Dynamic Canvas Resize Observer for responsive layout and device orientations
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Draw a subtle initial grid so it's not completely black on mount
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        const gridStepX = 30 * dpr;
        const gridStepY = 20 * dpr;
        for (let x = 0; x < canvas.width; x += gridStepX) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridStepY) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateSize);
      });
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  // Run analyzer and draw canvas
  useEffect(() => {
    if (!isListening || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDomainArray = new Float32Array(bufferLength);

    const checkAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      analyser.getFloatTimeDomainData(timeDomainArray);

      // 1. Calculate general volume (decibel scale)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += timeDomainArray[i] * timeDomainArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      // Rough mapping of RMS to readable dB-like indicator
      const db = Math.round(Math.max(20, rms * 140));
      setDbLevel(db);

      // Auto-calibrate background noise floor
      if (db < noiseFloor && db > 22) {
        setNoiseFloor(prev => Math.round(prev * 0.95 + db * 0.05));
      }

      // Record audio energy telemetry to session refs for high precision stop listening translations
      if (db > noiseFloor + 5) {
        if (db > sessionMaxDbRef.current) {
          sessionMaxDbRef.current = db;
        }
        sessionDurationRef.current += 16.7; // Approx ms per frame
      }

      // 2. Precise pitch detection via Autocorrelation (YIN-like fundamental tracker)
      const detectPitch = (buf: Float32Array, sampleRate: number) => {
        const threshold = 0.2;
        let r = new Float32Array(buf.length);
        for (let tau = 0; tau < buf.length / 2; tau++) {
          for (let i = 0; i < buf.length / 2; i++) {
            r[tau] += buf[i] * buf[i + tau];
          }
        }

        // Find the period matching the autocorrelation peak
        let maxVal = -1;
        let maxPeriod = -1;
        for (let i = 2; i < buf.length / 2; i++) {
          if (r[i] > maxVal && r[i] > r[i - 1] && r[i] > r[i + 1]) {
            maxVal = r[i];
            maxPeriod = i;
          }
        }

        if (maxPeriod !== -1 && maxVal > threshold) {
          return sampleRate / maxPeriod;
        }
        return 0;
      };

      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      const f0 = detectPitch(timeDomainArray, sampleRate);
      const roundedF0 = Math.round(f0);

      // Apply low pass heuristics to only set non-zero peaks when audio matches noise thresholds
      if (db > noiseFloor + 12 && roundedF0 > 80 && roundedF0 < 4000) {
        setPeakFrequency(roundedF0);

        // 3. Human Speech Rejection Logic
        // Human speaking speech fundamental range is usually 85Hz - 255Hz
        const isHumanRange = roundedF0 >= 85 && roundedF0 <= 260;
        // Verify harmonic clarity (dogs growl low, but human speech ranges have high voice pitch stability)
        if (isHumanRange && db > noiseFloor + 15) {
          setHumanSpeechDetected(true);
          setDogProfileMatch(prev => Math.max(0, prev - 10));
          setSignalType('none');
          // Reset trigger state if human talking takes over
          inCanineTriggerRef.current = false;
        } else {
          setHumanSpeechDetected(false);

          // 4. Canine Band Core Match Tracker
          // Canines vocalize mostly between 280Hz and 3000Hz.
          // Growls are lower (around 120Hz-280Hz, but highly chaotic unlike harmonic human vocals)
          const isDogRegister =
            (roundedF0 >= 280 && roundedF0 <= 2500) || 
            (roundedF0 >= 100 && roundedF0 <= 270 && db > noiseFloor + 20); // Low growl threshold with extra force

          if (isDogRegister) {
            // Determine Vocalization Type based on scientific ranges
            let type: VocalizationType = 'none';
            let profilePercent = 40;

            if (roundedF0 >= 100 && roundedF0 < 300) {
              type = 'growl';
              profilePercent = 88; // Low warning rumbles
            } else if (roundedF0 >= 300 && roundedF0 <= 580) {
              type = 'bark';
              profilePercent = 96; // Standard canine bark scale
            } else if (roundedF0 > 580 && roundedF0 <= 1100) {
              type = 'whimper';
              profilePercent = 85; 
            } else if (roundedF0 > 1100 && roundedF0 <= 2800) {
              type = 'whine';
              profilePercent = 90; // High pitch anticipatory whine
            } else if (roundedF0 > 2800) {
              type = 'howl';
              profilePercent = 75;
            }

            setSignalType(type);
            setDogProfileMatch(Math.min(99, Math.round(profilePercent + (db / 10))));

            // Auto breed classifier covering popular, rare, and mysterious brands based on pitch dynamics
            let predictedId = 'unknown_mix';
            if (type === 'howl' || type === 'whine') {
              if (roundedF0 > 1300) predictedId = 'astro_hound';
              else if (roundedF0 > 850) predictedId = 'chihuahua';
              else if (roundedF0 > 650) predictedId = 'pomeranian';
              else if (roundedF0 > 480) predictedId = 'shiba';
              else if (roundedF0 < 320) predictedId = 'cyber_gsd';
              else predictedId = 'husky';
            } else if (type === 'growl') {
              if (roundedF0 < 125) predictedId = 'mastiff';
              else if (roundedF0 < 165) predictedId = 'gsd';
              else if (roundedF0 < 220) predictedId = 'frenchie';
              else if (roundedF0 > 290) predictedId = 'cereberus';
              else predictedId = 'anubis';
            } else if (type === 'whimper') {
              if (roundedF0 > 820) predictedId = 'basenji';
              else if (roundedF0 > 580) predictedId = 'poodle';
              else if (roundedF0 > 420) predictedId = 'aspin';
              else predictedId = 'unknown_mix';
            } else { // Standard barks
              if (roundedF0 > 780) predictedId = 'chihuahua';
              else if (roundedF0 > 620) predictedId = 'pomeranian';
              else if (roundedF0 > 520) predictedId = 'corgi';
              else if (roundedF0 > 450) predictedId = 'shiba';
              else if (roundedF0 > 390) predictedId = 'beagle';
              else if (roundedF0 > 330) predictedId = 'border';
              else if (roundedF0 > 270) predictedId = 'golden';
              else if (roundedF0 > 200) predictedId = 'dane';
              else predictedId = 'aspin';
            }

            // Require 8 consecutive ticks of confirmation to trigger dynamic breed switch
            if (consecutiveBreedMatchRef.current.id === predictedId) {
              consecutiveBreedMatchRef.current.count += 1;
              if (consecutiveBreedMatchRef.current.count === 8) {
                setDetectedBreedId(predictedId);
                if (onBreedAutoDetect) {
                  onBreedAutoDetect(predictedId);
                }
              }
            } else {
              consecutiveBreedMatchRef.current = { id: predictedId, count: 1 };
            }

            // Update session-level pitch & type accumulators on valid classification matches
            if (type !== 'none') {
              sessionTypeTallyRef.current[type] = (sessionTypeTallyRef.current[type] || 0) + 1;
              if (roundedF0 > sessionMaxFrequencyRef.current) {
                sessionMaxFrequencyRef.current = roundedF0;
              }
              sessionSumFrequencyRef.current += roundedF0;
              sessionFrequencyCountRef.current += 1;
            }

            // Trigger handler once sound stays active
            if (!inCanineTriggerRef.current) {
              inCanineTriggerRef.current = true;
              triggerDurationRef.current = 0;
              pulseCounterRef.current = 1;
              
              // Increment pulse count on volume surges during this trigger cycle
              if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
              pulseTimerRef.current = window.setInterval(() => {
                if (analyserRef.current) {
                  const checkArr = new Uint8Array(bufferLength);
                  analyserRef.current.getByteFrequencyData(checkArr);
                  const partialRms = checkArr.reduce((a, b) => a + b, 0) / bufferLength;
                  if (partialRms > 60) {
                    pulseCounterRef.current += 1;
                  }
                }
              }, 180);
            } else {
              triggerDurationRef.current += 16.7; // add frame rate latency
            }

            sessionPulseCountRef.current = Math.max(sessionPulseCountRef.current, pulseCounterRef.current);

            // If sound is stabilized for at least 600ms, and we have high confidence, dispatch translation!
            if (triggerDurationRef.current > 750 && !isTranslating) {
              const currentType = type;
              const currentF0 = roundedF0;
              const currentDb = db;
              const totalPulses = pulseCounterRef.current;
              const duration = triggerDurationRef.current;

              // Force trigger and reset
              inCanineTriggerRef.current = false;
              if (pulseTimerRef.current) {
                clearInterval(pulseTimerRef.current);
                pulseTimerRef.current = null;
              }

              // Fire translation callback
              onAcousticTrigger({
                type: currentType,
                frequency: currentF0,
                amplitude: currentDb,
                duration: Math.round(duration),
                pulseCount: totalPulses || 1
              });
            }
          } else {
            setDogProfileMatch(prev => Math.max(0, prev - 4));
            // Decay trigger duration if silence takes over
            if (inCanineTriggerRef.current) {
              triggerDurationRef.current -= 50;
              if (triggerDurationRef.current <= 0) {
                inCanineTriggerRef.current = false;
                if (pulseTimerRef.current) {
                  clearInterval(pulseTimerRef.current);
                  pulseTimerRef.current = null;
                }
              }
            }
          }
        }
      } else {
        // Quiet state
        setPeakFrequency(prev => Math.max(0, prev - 5));
        setSignalType('none');
        setDogProfileMatch(prev => Math.max(0, prev - 6));
        setHumanSpeechDetected(false);
      }

      // 5. Draw the cybernetic visualizer graph canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const dpr = window.devicePixelRatio || 1;
          ctx.clearRect(0, 0, width, height);

          // Draw neon back-grid
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          const gridStepX = 30 * dpr;
          const gridStepY = 20 * dpr;
          for (let x = 0; x < width; x += gridStepX) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += gridStepY) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Draw the spectrum bar waveform
          const barWidth = (width / bufferLength) * 1.6;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height * 0.85;

            // Gradient based on whether sound is classified as canine or not
            let barGradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            if (humanSpeechDetected) {
              barGradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)'); // Quiet red
              barGradient.addColorStop(1, 'rgba(239, 68, 68, 0.7)'); 
            } else if (dogProfileMatch > 40) {
              barGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)'); // Vibrant dog green
              barGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)'); // Blue middle
              barGradient.addColorStop(1, 'rgba(6, 182, 212, 0.95)'); // Cyan peaks
            } else {
              barGradient.addColorStop(0, 'rgba(100, 116, 139, 0.1)'); // Standard slate grey
              barGradient.addColorStop(1, 'rgba(148, 163, 184, 0.5)'); 
            }

            ctx.fillStyle = barGradient;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          }

          // Draw real-time moving oscilloscope waveform line
          ctx.beginPath();
          ctx.lineWidth = 2 * dpr;
          ctx.strokeStyle = dogProfileMatch > 40 ? '#06b6d4' : humanSpeechDetected ? '#ef4444' : '#3b82f6';
          const sliceWidth = width / bufferLength;
          let ox = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = timeDomainArray[i] * 1.8;
            const oy = (v + 1) * (height / 2);
            if (i === 0) {
              ctx.moveTo(ox, oy);
            } else {
              ctx.lineTo(ox, oy);
            }
            ox += sliceWidth;
          }
          ctx.stroke();

          // Draw target locked canine bracket if active
          if (dogProfileMatch > 50 && signalType !== 'none') {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
            ctx.lineWidth = 1 * dpr;
            ctx.setLineDash([4 * dpr, 4 * dpr]);

            // Target scope overlay
            ctx.strokeRect(width * 0.15, height * 0.15, width * 0.7, height * 0.7);
            
            ctx.fillStyle = 'rgba(6, 182, 212, 0.95)';
            ctx.font = `${Math.round(10 * dpr)}px "JetBrains Mono", monospace`;
            ctx.fillText(`[CANINE SIGNAL LOCK: ${signalType.toUpperCase()}]`, 20 * dpr, 25 * dpr);
            ctx.setLineDash([]);
          }

          // Draw real-time rhythmic pulse count counter visually in canvas bounds
          if (isListening) {
            ctx.fillStyle = 'rgba(15, 17, 21, 0.85)';
            ctx.beginPath();
            ctx.arc(width - 45 * dpr, 30 * dpr, 14 * dpr, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 1.5 * dpr;
            ctx.stroke();

            // Real-time pulse count index
            ctx.fillStyle = '#22d3ee';
            ctx.font = `bold ${Math.round(11 * dpr)}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${pulseCounterRef.current || 0}`, width - 45 * dpr, 30 * dpr);

            // Small header descriptor text
            ctx.textBaseline = 'alphabetic';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.font = `${Math.round(7.5 * dpr)}px "JetBrains Mono", monospace`;
            ctx.fillText("RHYTHMIC PULSE SURGES:", width - 66 * dpr, 33 * dpr);

            // Restore defaults
            ctx.textAlign = 'left';
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkAudio);
    };

    animationFrameRef.current = requestAnimationFrame(checkAudio);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
      }
    };
  }, [isListening, noiseFloor, humanSpeechDetected, dogProfileMatch, signalType, isTranslating]);

  // Real-time Canine Bio-frequency Mood Interpreter
  const computedMoodInfo = React.useMemo(() => {
    if (!isListening) {
      return {
        label: "STANDBY SENSORS",
        emoji: "💤",
        color: "text-zinc-500 border-zinc-500/10 bg-zinc-500/5",
        description: "Acoustic bridge offline. Awaiting dog bio-signals..."
      };
    }

    if (humanSpeechDetected) {
      return {
        label: "HUMAN INTELLIGENCE BLOCKED",
        emoji: "🤐",
        color: "text-red-400 border-red-550/20 bg-red-500/5",
        description: "Zero human voice recording or transcription permitted. Dog audio stream only!"
      };
    }

    if (peakFrequency === 0) {
      return {
        label: "LISTENING & ANALYZING",
        emoji: "📡",
        color: "text-cyan-400 border-cyan-500/10 bg-cyan-500/5",
        description: "Calibrating background room audio floor. Speak, howl, growl or bark!"
      };
    }

    // Classify mood based on acoustic decibels & pitches
    if (signalType === 'growl' || (peakFrequency >= 100 && peakFrequency < 300)) {
      if (dbLevel > 65) {
        return {
          label: "Territorial Sentinel Defense Status",
          emoji: "🛡️",
          color: "text-red-400 border-red-500/15 bg-gradient-to-r from-red-950/15 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.06)]",
          description: "Low-frequency rumbles signaling border lockdown posturing or guarding instincts."
        };
      } else {
        return {
          label: "Playful Tug-of-war Challenge",
          emoji: "😈",
          color: "text-amber-400 border-amber-500/15 bg-gradient-to-r from-amber-950/15 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.06)]",
          description: "Low-tension acoustic growls expressing friendly competitive play drive."
        };
      }
    }

    if (signalType === 'bark' || (peakFrequency >= 300 && peakFrequency <= 580)) {
      if (dbLevel > 70) {
        return {
          label: "Hyper-Ecstatic Zoomie Euphoria",
          emoji: "🎉",
          color: "text-emerald-400 border-emerald-500/15 bg-gradient-to-r from-emerald-950/15 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.06)]",
          description: "High repetitions and steep pressure curves representing intense joyous excitement."
        };
      } else {
        return {
          label: "Prosocial Interaction / Treat Appeal",
          emoji: "🍖",
          color: "text-yellow-400 border-yellow-500/15 bg-gradient-to-r from-yellow-950/15 to-transparent shadow-[0_0_15px_rgba(234,179,8,0.06)]",
          description: "Standard mid-range greetings demanding interactive attention or delicious rewards."
        };
      }
    }

    if (signalType === 'whimper' || (peakFrequency > 580 && peakFrequency <= 1100)) {
      if (dbLevel > 56) {
        return {
          label: "Separation Sentiment / Cuddle Appeal",
          emoji: "🥺",
          color: "text-pink-400 border-pink-500/15 bg-gradient-to-r from-pink-950/15 to-transparent shadow-[0_0_15px_rgba(244,114,182,0.06)]",
          description: "Gentle high-pitched whimpering signaling attachment appeal or longing for warmth."
        };
      } else {
        return {
          label: "Sub-harmonic REM Dream Processing",
          emoji: "🌙",
          color: "text-indigo-400 border-indigo-500/15 bg-gradient-to-r from-indigo-950/15 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.06)]",
          description: "Resting brainwave impulses manifesting as sleeping squeaks during happy dreams."
        };
      }
    }

    if (signalType === 'whine' || (peakFrequency > 1100 && peakFrequency <= 2800)) {
      return {
        label: "Anticipatory Action Singularity",
        emoji: "🎒",
        color: "text-cyan-400 border-cyan-500/15 bg-gradient-to-r from-cyan-950/15 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.06)]",
        description: "Intense high frequency motivation to begin walks, open locked doors, or share active spaces."
      };
    }

    if (signalType === 'howl' || peakFrequency > 2800) {
      return {
        label: "Dramatic Ancestral Wolf Anthem",
        emoji: "🌌",
        color: "text-purple-400 border-purple-500/15 bg-gradient-to-r from-purple-950/15 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.06)]",
        description: "Continuous harmonic peak response singing to ambulances, music, or calling out to distant packs."
      };
    }

    return {
      label: "Parsing Vocal Bio-Spectrum",
      emoji: "🐕",
      color: "text-cyan-400 border-cyan-500/15 bg-cyan-500/5",
      description: "Deciphering real-time frequency soundwave nodes..."
    };
  }, [isListening, peakFrequency, dbLevel, signalType, humanSpeechDetected]);

  return (
    <div id="acoustic-visualizer-card" className="bg-[#0F1115] border border-white/10 rounded-3xl p-8 relative overflow-hidden transition-all duration-300">
      {/* Absolute clean layout guidelines */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-zinc-500/[0.02] blur-3xl pointer-events-none rounded-full" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-cyan-400 uppercase flex items-center gap-2 mb-1.5 bg-cyan-500/10 border border-cyan-500/20 w-max px-3 py-1 rounded-full select-none">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Digital Audio Scope
          </span>
          <h2 className="text-2xl font-light text-[#E0E2E6] tracking-tight">
            Canine Acoustic Engine
          </h2>
          <p className="text-[#E0E2E6]/40 text-xs mt-1">
            Decibles and spectral frequency analysis running in strict bioacoustic constraints.
          </p>
        </div>

        <button
          id="toggle-listening-btn"
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium tracking-wider text-xs uppercase border transition-all duration-300 active:scale-[0.98] w-full md:w-auto cursor-pointer ${
            isListening
              ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
              : 'bg-white/[0.04] border-white/10 text-[#E0E2E6] hover:bg-white/[0.08] hover:border-white/20'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 text-red-400" />
              <span>Deactivate Bridge</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Activate Live Mic</span>
            </>
          )}
        </button>
      </div>

      {/* Main visual canvas screen */}
      <div ref={containerRef} className="relative border border-white/10 bg-[#0F1115] rounded-2xl overflow-hidden mb-8 h-48 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {!isListening && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0F1115]/90 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mb-3">
              <VolumeX className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="font-light text-sm text-[#E0E2E6]">Acoustic Scope Offline</p>
            <p className="text-zinc-500 text-xs max-w-xs mt-1 leading-relaxed">
              Activate the microphone or choose a mock vocalization below to let BarkDecoder scan your pup's pitch signature.
            </p>
          </div>
        )}

        {/* Live trigger indicators inside the camera screen */}
        {isListening && (
          <div className="absolute top-4 left-4 bg-black/85 border border-white/10 rounded-2xl p-4 font-mono text-[10px] space-y-1.5 select-none text-left backdrop-blur-md max-w-[210px] sm:max-w-xs shadow-xl min-w-[170px]">
            <div className="flex items-center gap-1.5 text-[8px] tracking-wider text-cyan-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SENSORS: DOGS ONLY</span>
            </div>
            {detectedBreedId ? (
              <div className="text-emerald-400 text-[11px] font-bold leading-tight">
                🧬 AUTO-BREED: 
                <span className="block text-white uppercase mt-0.5 tracking-wide text-xs">
                  {detectedBreedId === 'gsd' ? 'German Shepherd' : 
                   detectedBreedId === 'frenchie' ? 'French Bulldog' : 
                   detectedBreedId === 'golden' ? 'Golden Retriever' : 
                   detectedBreedId === 'husky' ? 'Siberian Husky' : 
                   detectedBreedId === 'pomeranian' ? 'Pomeranian' : 
                   detectedBreedId === 'corgi' ? 'Welsh Corgi' : 
                   detectedBreedId === 'chihuahua' ? 'Chihuahua' : 
                   detectedBreedId === 'shiba' ? 'Shiba Inu' : 
                   detectedBreedId === 'beagle' ? 'Beagle' : 
                   detectedBreedId === 'border' ? 'Border Collie' : 
                   detectedBreedId === 'dane' ? 'Great Dane' : 
                   detectedBreedId === 'poodle' ? 'Standard Poodle' : 
                   detectedBreedId === 'basenji' ? 'Basenji' : 
                   detectedBreedId === 'mastiff' ? 'Tibetan Mastiff' : 
                   detectedBreedId === 'aspin' ? 'Aspin / Street-Smart Mix' : 
                   detectedBreedId === 'unknown_mix' ? 'Mysterious Mix' : 
                   detectedBreedId === 'anubis' ? 'Anubis Sphinx Guard' : 
                   detectedBreedId === 'astro_hound' ? 'Astro-Hound (Cosmic)' : 
                   detectedBreedId === 'cyber_gsd' ? 'Cybernetic Neo-GSD' : 
                   detectedBreedId === 'cereberus' ? 'Cerberus Pup' : 
                   detectedBreedId}
                </span>
              </div>
            ) : (
              <div className="text-zinc-500 italic">Listening for dog...</div>
            )}
            <div className="text-[8px] text-red-400 font-semibold border-t border-white/5 pt-1 mt-1">
              *REJECTING HUMAN VOICES
            </div>
          </div>
        )}

        {isListening && inCanineTriggerRef.current && (
          <div className="absolute top-4 right-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3.5 py-1.5 rounded-full text-[9px] tracking-[0.2em] font-mono animate-pulse flex items-center gap-2 uppercase select-none">
            <Zap className="w-3" /> Target Locked
          </div>
        )}
      </div>

      {/* Real-time Frequency-to-Mood Bioacoustic Decoder Board */}
      <div className={`border rounded-2xl p-5 mb-8 relative overflow-hidden transition-all duration-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-white/5 bg-[#12141D] ${computedMoodInfo.color}`}>
        <div className="space-y-1.5 z-10 text-left">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">{computedMoodInfo.emoji}</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-500 font-bold">
                REAL-TIME FREQUENCY MOOD SCANNER
              </span>
              <h3 className="text-sm font-bold tracking-tight text-white uppercase sm:text-base mt-0.5">
                {computedMoodInfo.label}
              </h3>
            </div>
          </div>
          <p className="text-xs text-[#E0E2E6]/75 leading-relaxed max-w-2xl font-light">
            {computedMoodInfo.description}
          </p>
        </div>

        {/* Neural Sync Graphics in mini layout */}
        <div className="shrink-0 flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 w-full md:w-auto font-mono select-none">
          <div className="w-full md:w-auto flex flex-col items-center md:items-start text-left">
            <span className="text-[9px] uppercase text-[#E0E2E6]/40 block mb-1 font-sans">SPECTRUM WAVE</span>
            <div className="flex items-end gap-1.5 h-7">
              <span className={`w-1 rounded-sm bg-gradient-to-t from-cyan-500 to-purple-500 transition-all duration-300 ${isListening ? 'h-5 animate-pulse' : 'h-1'}`} />
              <span className={`w-1 rounded-sm bg-gradient-to-t from-cyan-400 to-purple-400 transition-all duration-300 delay-100 ${isListening ? 'h-7 animate-pulse' : 'h-1'}`} />
              <span className={`w-1 rounded-sm bg-gradient-to-t from-cyan-500 to-purple-500 transition-all duration-300 delay-200 ${isListening ? 'h-4 animate-pulse' : 'h-1'}`} />
              <span className={`w-1 rounded-sm bg-gradient-to-t from-cyan-300 to-purple-300 transition-all duration-300 delay-300 ${isListening ? 'h-6 animate-pulse' : 'h-1'}`} />
              <span className={`w-1 rounded-sm bg-gradient-to-t from-cyan-400 to-purple-400 transition-all duration-300 delay-400 ${isListening ? 'h-3 animate-pulse' : 'h-1'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid statistics overlay */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 font-mono">
        {/* Metric 1 */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] text-[#E0E2E6]/40 uppercase tracking-[0.2em] block font-sans mb-1.5">Peak Frequency</span>
          <span className={`text-lg font-light tabular-nums ${peakFrequency > 0 ? 'text-cyan-400' : 'text-zinc-650'}`}>
            {peakFrequency > 0 ? `${peakFrequency} Hz` : 'Scanning...'}
          </span>
          <div className="text-[9px] text-[#E0E2E6]/30 mt-2 font-sans uppercase">
            {peakFrequency > 600 ? '🔊 Upper Whine' : peakFrequency > 250 ? '🔊 Middle Bark' : peakFrequency > 0 ? '🔊 Lower Growl' : '---'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] text-[#E0E2E6]/40 uppercase tracking-[0.2em] block font-sans mb-1.5">Signal Amplitude</span>
          <span className="text-lg font-light text-[#E0E2E6] tabular-nums">
            {isListening ? `${dbLevel} dB` : '0 dB'}
          </span>
          <div className="text-[9px] text-[#E0E2E6]/30 mt-2 font-sans uppercase">
            Floor: {noiseFloor} dB
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] text-[#E0E2E6]/40 uppercase tracking-[0.2em] block font-sans mb-1.5">Canine Match</span>
          <span className={`text-lg font-light tabular-nums ${dogProfileMatch > 60 ? 'text-emerald-400' : dogProfileMatch > 30 ? 'text-yellow-400' : 'text-zinc-600'}`}>
            {isListening ? `${dogProfileMatch}%` : '0%'}
          </span>
          <div className="text-[9px] text-[#E0E2E6]/30 mt-2 font-sans uppercase">
            {dogProfileMatch > 75 ? '⚡ Secured LOCK' : dogProfileMatch > 30 ? '⚠️ Interference' : 'No Signal'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] text-[#E0E2E6]/40 uppercase tracking-[0.2em] block font-sans mb-1.5">Speech Gating</span>
          <span className={`text-lg font-light flex items-center gap-1.5 ${
            humanSpeechDetected 
              ? 'text-red-400' 
              : isListening 
                ? 'text-emerald-400' 
                : 'text-zinc-650'
          }`}>
            <ShieldCheck className="w-4 h-4 stroke-2" />
            {humanSpeechDetected ? 'REJECT' : isListening ? 'ACTIVE' : 'STANDBY'}
          </span>
          <div className={`text-[9px] mt-2 uppercase font-sans ${humanSpeechDetected ? 'text-red-400/80' : 'text-[#E0E2E6]/30'}`}>
            {humanSpeechDetected ? '⚠️ Speech Flagged' : 'Suppressing interfere'}
          </div>
        </div>
      </div>

      {/* Instant Action Info Header */}
      {isListening && !humanSpeechDetected && dogProfileMatch > 70 && (
        <div className="mt-5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
          <span className="font-light leading-relaxed">
            Highly coherent dog frequency signature detected! Hold vocalization for <strong>0.8 seconds</strong> to auto-translate.
          </span>
        </div>
      )}
    </div>
  );
}
