import React from 'react';
import { Volume2, Heart, ShieldAlert, Sparkles, Smile, MessageSquareLock } from 'lucide-react';
import { VocalizationType } from '../types';

interface PlaybackSample {
  id: string;
  name: string;
  type: VocalizationType;
  icon: React.ReactNode;
  frequency: number;
  amplitude: number;
  duration: number;
  pulseCount: number;
  engDesc: string;
  tagDesc: string;
  badgeColor: string;
}

interface PlaygroundSimulatorProps {
  onSimulate: (data: {
    type: VocalizationType;
    frequency: number;
    amplitude: number;
    duration: number;
    pulseCount: number;
  }) => void;
  isTranslating: boolean;
}

export default function PlaygroundSimulator({ onSimulate, isTranslating }: PlaygroundSimulatorProps) {
  const samples: PlaybackSample[] = [
    {
      id: 'happy_bark',
      name: 'Ebullient Social Greeting',
      type: 'bark',
      icon: <Smile className="w-5 h-5 text-emerald-400" />,
      frequency: 480, // High-pitched, friendly
      amplitude: 65,
      duration: 600,
      pulseCount: 4, // Multi pulses
      engDesc: 'High frequency barks suggesting energetic greeting & expectation',
      tagDesc: 'Mabilis na tahol na nagpapakita ng tuwa at pagbati',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'alarm_guard',
      name: 'Sentry Defense Alert',
      type: 'bark',
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      frequency: 340, // Deeper, alert warning
      amplitude: 88,
      duration: 900,
      pulseCount: 7, 
      engDesc: 'Deep pitch, heavy repetition indicating defensive alert protocol',
      tagDesc: 'Malalim na tahol na hudyat ng babala at pagprotekta',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20'
    },
    {
      id: 'whimper_anxiety',
      name: 'Submissive Appeal',
      type: 'whimper',
      icon: <Heart className="w-5 h-5 text-blue-400" />,
      frequency: 850, // High register whine
      amplitude: 38,
      duration: 520,
      pulseCount: 2,
      engDesc: 'High pitched seeking contact or mild separation stress markers',
      tagDesc: 'Tungayaw na may mataas na tono, humihingi ng yakap o pagkain',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: 'protective_growl',
      name: 'De-Escalation Growl',
      type: 'growl',
      icon: <MessageSquareLock className="w-5 h-5 text-amber-500" />,
      frequency: 180, // Very low rumble
      amplitude: 72,
      duration: 1200,
      pulseCount: 1,
      engDesc: 'Sub-audible warning tone representing active boundary management',
      tagDesc: 'Mababang dagundong na nagpapakita ng babala at layo muna',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    },
    {
      id: 'pack_howl',
      name: 'Acoustic Cohesion Howl',
      type: 'howl',
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
      frequency: 1250, // Resonant continuous howl
      amplitude: 80,
      duration: 2500,
      pulseCount: 1,
      engDesc: 'Long-range resonant sound serving communal pack call backbones',
      tagDesc: 'Mahabang alulong na bumabati sa kaniyang kawan o pamilya',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    }
  ];

  return (
    <div id="canine-simulator-card" className="bg-[#0F1115] border border-white/10 rounded-3xl p-8 relative transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-light text-[#E0E2E6] tracking-tight">Canine Acoustic Simulator</h2>
          <p className="text-[#E0E2E6]/40 text-xs mt-1">
            Play standard canine frequencies to test the translations immediately.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {samples.map((sample) => (
          <button
            key={sample.id}
            id={`simulate-btn-${sample.id}`}
            disabled={isTranslating}
            onClick={() => onSimulate({
              type: sample.type,
              frequency: sample.frequency,
              amplitude: sample.amplitude,
              duration: sample.duration,
              pulseCount: sample.pulseCount
            })}
            className={`group text-left border rounded-2xl p-5 flex flex-col justify-between h-52 transition-all duration-300 active:scale-[0.98] cursor-pointer ${
              isTranslating
                ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/[0.01]'
                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-[#0F1115] border border-white/5 group-hover:bg-white/[0.02] transition-colors">
                  {sample.icon}
                </div>
                <span className={`text-[9px] font-mono tracking-widest border px-2 py-0.5 rounded-full ${sample.badgeColor}`}>
                  {sample.type.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-[#E0E2E6] tracking-tight group-hover:text-cyan-300 transition-colors mb-2 leading-tight">
                {sample.name}
              </h3>
            </div>

            <div className="mt-auto">
              <p className="text-[10px] text-[#E0E2E6]/50 leading-relaxed line-clamp-2">
                {sample.engDesc}
              </p>
              <div className="text-[9px] text-[#E0E2E6]/30 truncate mt-3 border-t border-white/5 pt-2 font-mono">
                {sample.frequency}Hz · {sample.pulseCount}p · {sample.amplitude}dB
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
