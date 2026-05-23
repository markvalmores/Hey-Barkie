export interface DogBreed {
  id: string;
  name: string;
  size: 'Toy' | 'Small' | 'Medium' | 'Large' | 'Giant';
  pitchMultiplier: number;
  personality: string;
  emoji: string;
  accentColor: string;
}

export const DOG_BREEDS: DogBreed[] = [
  // --- POPULAR / STANDARD CLASSICS ---
  {
    id: 'pomeranian',
    name: 'Pomeranian (Pombon)',
    size: 'Toy',
    pitchMultiplier: 1.35,
    personality: 'Spirited, intelligent, vocal, fluffy, and energetic.',
    emoji: '🦊',
    accentColor: 'border-orange-500/20 text-orange-400 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.05)]'
  },
  {
    id: 'chihuahua',
    name: 'Chihuahua',
    size: 'Toy',
    pitchMultiplier: 1.60,
    personality: 'Sassy, alert, feisty, devoted, but highly nervous & alert.',
    emoji: '🐕',
    accentColor: 'border-pink-500/20 text-pink-400 bg-pink-500/5 shadow-[0_0_15px_rgba(236,72,153,0.05)]'
  },
  {
    id: 'husky',
    name: 'Siberian Husky',
    size: 'Large',
    pitchMultiplier: 0.95,
    personality: 'Dramatic complainers, highly vocal, mischievous, and free-spirited howling storyteller.',
    emoji: '🐺',
    accentColor: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
  },
  {
    id: 'golden',
    name: 'Golden Retriever',
    size: 'Large',
    pitchMultiplier: 0.85,
    personality: 'Gentle, food-loving, helpful helper, pure happiness, and play-obsessed.',
    emoji: '🦮',
    accentColor: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.05)]'
  },
  {
    id: 'gsd',
    name: 'German Shepherd',
    size: 'Large',
    pitchMultiplier: 0.75,
    personality: 'Security-oriented, serious, guard duty focused, and deeply loyal.',
    emoji: '🐕‍🦺',
    accentColor: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
  },
  {
    id: 'frenchie',
    name: 'French Bulldog',
    size: 'Small',
    pitchMultiplier: 1.10,
    personality: 'Chilled out, snort-prone, grumbly, lazy but highly adorable.',
    emoji: '🐷',
    accentColor: 'border-purple-500/20 text-purple-400 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.05)]'
  },
  {
    id: 'corgi',
    name: 'Welsh Corgi',
    size: 'Small',
    pitchMultiplier: 1.25,
    personality: 'Bossy, energetic herder, food-motivated, and attention-loving.',
    emoji: '🦊',
    accentColor: 'border-amber-500/20 text-amber-400 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
  },
  {
    id: 'shiba',
    name: 'Shiba Inu',
    size: 'Small',
    pitchMultiplier: 1.20,
    personality: 'Dignified, independent, drama queen, and makes high pitched Shiba-screams.',
    emoji: '🐕',
    accentColor: 'border-red-400/20 text-red-400 bg-red-400/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
  },
  {
    id: 'beagle',
    name: 'Beagle',
    size: 'Small',
    pitchMultiplier: 1.05,
    personality: 'Merry, scent-driven trackers, stubborn baying, and extremely foodie.',
    emoji: '🐾',
    accentColor: 'border-amber-600/20 text-amber-500 bg-amber-600/5 shadow-[0_0_15px_rgba(217,119,6,0.05)]'
  },
  {
    id: 'border',
    name: 'Border Collie',
    size: 'Medium',
    pitchMultiplier: 0.98,
    personality: 'Workaholic, hyper-intelligent genius, intense eye contact, herds everything.',
    emoji: '🏃',
    accentColor: 'border-blue-500/20 text-blue-400 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
  },
  {
    id: 'dane',
    name: 'Great Dane',
    size: 'Giant',
    pitchMultiplier: 0.55,
    personality: 'Gentle giant, couch potato, believes they are toy-sized, deep subharmonic boom barks.',
    emoji: '🦕',
    accentColor: 'border-sky-500/20 text-sky-400 bg-sky-500/5 shadow-[0_0_15px_rgba(14,165,233,0.05)]'
  },
  {
    id: 'poodle',
    name: 'Standard Poodle',
    size: 'Medium',
    pitchMultiplier: 1.15,
    personality: 'Proud, highly sophisticated, elegant athlete, loves puzzle games.',
    emoji: '🐩',
    accentColor: 'border-fuchsia-400/20 text-fuchsia-400 bg-fuchsia-400/5 shadow-[0_0_15px_rgba(217,70,239,0.05)]'
  },

  // --- RARE & CLASSIC REGULARS ---
  {
    id: 'basenji',
    name: 'Basenji (Barkless)',
    size: 'Small',
    pitchMultiplier: 1.40,
    personality: 'The barkless wonder. Cleans themselves like a cat, and makes expressive yodels.',
    emoji: '🐈',
    accentColor: 'border-teal-400/25 text-teal-300 bg-teal-400/5 shadow-[0_0_15px_rgba(45,212,191,0.05)]'
  },
  {
    id: 'mastiff',
    name: 'Tibetan Mastiff',
    size: 'Giant',
    pitchMultiplier: 0.45,
    personality: 'Ancient monumental guardian, acts like a majestic lion, heavy deep frequency growler.',
    emoji: '🦁',
    accentColor: 'border-amber-700/20 text-amber-600 bg-amber-700/5 shadow-[0_0_15px_rgba(180,83,9,0.05)]'
  },

  // --- STREET-SMART MIXES / NOT KNOWN ---
  {
    id: 'aspin',
    name: 'Aspin / Street-Smart Mix',
    size: 'Medium',
    pitchMultiplier: 1.00,
    personality: 'Supreme street intelligence, incredibly resilient, loyal protector with Philippine tagalog dialect affinity.',
    emoji: '🇵🇭',
    accentColor: 'border-yellow-400/30 text-yellow-300 bg-yellow-400/5 shadow-[0_0_15px_rgba(250,204,21,0.1)]'
  },
  {
    id: 'unknown_mix',
    name: 'Mysterious Mixed Breed',
    size: 'Medium',
    pitchMultiplier: 1.00,
    personality: 'The perfect universal dog. A gorgeous blend of every dog ever made. High adaptability.',
    emoji: '❓',
    accentColor: 'border-zinc-500/25 text-zinc-300 bg-zinc-500/5 shadow-[0_0_15px_rgba(113,113,122,0.05)]'
  },

  // --- SCI-FI / MYSTICAL / CONTEXT-CLEANSERS ---
  {
    id: 'anubis',
    name: 'Anubis Sphinx Guard',
    size: 'Large',
    pitchMultiplier: 0.88,
    personality: 'Ancient egyptian immortal guardian. Speaks with deep, mysterious, pharaoh-grade authority.',
    emoji: '🔮',
    accentColor: 'border-purple-400/40 text-purple-300 bg-purple-900/10 shadow-[0_0_20px_rgba(192,132,252,0.15)] animate-pulse'
  },
  {
    id: 'astro_hound',
    name: 'Astro-Hound (Cosmic)',
    size: 'Medium',
    pitchMultiplier: 1.50,
    personality: 'Zero-gravity star explorer. Speaks with echoes of the universe and stellar radio wave barks.',
    emoji: '🚀',
    accentColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-950/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
  },
  {
    id: 'cyber_gsd',
    name: 'Cybernetic Neo-GSD',
    size: 'Large',
    pitchMultiplier: 0.70,
    personality: 'Synthetic augmented canine. Features mechanized diagnostic tone filters and quantum protection telemetry.',
    emoji: '🤖',
    accentColor: 'border-lime-400/30 text-lime-300 bg-lime-950/10 shadow-[0_0_20px_rgba(163,230,53,0.15)]'
  },
  {
    id: 'cereberus',
    name: 'Cerberus Pup (Mythic)',
    size: 'Medium',
    pitchMultiplier: 1.05,
    personality: 'Mischievous three-headed underworld baby. Three thoughts in perfect harmony. Incredibly adorable yet legendary.',
    emoji: '🔥',
    accentColor: 'border-red-500/40 text-red-300 bg-red-950/20 shadow-[0_0_20px_rgba(248,113,113,0.15)]'
  }
];
