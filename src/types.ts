export type VocalizationType = 'bark' | 'growl' | 'whine' | 'howl' | 'whimper' | 'none';

export interface TranslationRequest {
  type: VocalizationType;
  frequency: number; // Peak frequency in Hz
  amplitude: number; // Sound level metric or scale
  duration: number;  // Duration of current sound event in ms
  pulseCount: number; // Number of distinct pulses in the pattern
  targetLanguage: 'en' | 'fil';
  breedId?: string; // Selected dog breed identifier
}

export interface TranslationResponse {
  emotion: string; // Dynamic emotion label (e.g., "Sentry Alert / Defensive Guarding", "Ebullient Play Solicitation")
  acousticAnalysis: string; // Vet-science / acoustic breakdown of frequency and length
  englishTranslation: string; // Highly accurate English translation
  filipinoTranslation: string; // Highly accurate Filipino translation
  confidence: number; // Confidence level based on match %
  isSuccess: boolean;
  canineDetails: {
    intensity: 'Low' | 'Medium' | 'High';
    frequencySpectrum: string; // E.g., "Medium Pitch (380-450 Hz)"
  };
  rejectionWarning?: string; // If sound is flagged as human or noise
}

export interface BarkHistoryItem {
  id: string;
  timestamp: string;
  request: TranslationRequest;
  response: TranslationResponse;
}
