export const KECCAK_STEPS = [
  { label: 'Entrada', symbol: '↳', caption: 'O ponto de partida' },
  { label: 'Theta', symbol: 'θ', caption: 'Difusão' },
  { label: 'Rho', symbol: 'ρ', caption: 'Rotação' },
  { label: 'Pi', symbol: 'π', caption: 'Permutação' },
  { label: 'Chi', symbol: 'χ', caption: 'Não linearidade' },
  { label: 'Iota', symbol: 'ι', caption: 'Constante' },
] as const;

export const LAST_KECCAK_STEP = KECCAK_STEPS.length - 1;
export const PLAYBACK_INTERVAL_MS = 850;
