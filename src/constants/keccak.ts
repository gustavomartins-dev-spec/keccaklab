export const KECCAK_STEPS = [
  { label: 'Entrada', symbol: '↳', caption: 'Estado inicial' },
  { label: 'Theta', symbol: 'θ', caption: 'Difusão' },
  { label: 'Rho', symbol: 'ρ', caption: 'Rotação' },
  { label: 'Pi', symbol: 'π', caption: 'Permutação' },
  { label: 'Chi', symbol: 'χ', caption: 'Não linearidade' },
  { label: 'Iota', symbol: 'ι', caption: 'Constante' },
] as const;

export const LAST_KECCAK_STEP = KECCAK_STEPS.length - 1;
export const PLAYBACK_INTERVAL_MS = 850;

export const KECCAK_ROUND_COUNT = 18;
export const LAST_KECCAK_ROUND = KECCAK_ROUND_COUNT - 1;
