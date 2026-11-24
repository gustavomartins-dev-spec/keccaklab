import { getAvalancheProfile, type AvalancheProfile, type FlippedBit } from './keccak';

export const TOTAL_STATE_BITS = 200;

/** The avalanche comparison always flips the least significant bit of lane A[0,0]. */
export const AVALANCHE_FLIP: FlippedBit = { x: 0, y: 0, bit: 0 };

/** Profile of the fixed flip; computed on first use and cached by getAvalancheProfile. */
export const getDefaultAvalancheProfile = (): AvalancheProfile => getAvalancheProfile(AVALANCHE_FLIP);

export const formatPercent = (bits: number): string =>
  `${((bits / TOTAL_STATE_BITS) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
