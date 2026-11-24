import type { CellChange, Matrix } from '../types/keccak';
import { theta, rho, pi, chi, iota, rotateByte, KECCAK_ROUNDS, RHO_OFFSETS, ROUND_CONSTANTS } from './keccak200';

const seedMatrix: Matrix = [
  [0x1f, 0xa3, 0x52, 0x9c, 0x17],
  [0x88, 0x2e, 0xd1, 0x64, 0xb7],
  [0x40, 0xf8, 0x0b, 0x36, 0x71],
  [0xcd, 0x19, 0x5a, 0xe2, 0x93],
  [0x76, 0x0d, 0xab, 0x48, 0xf0],
];

const toMatrix = (state: Uint8Array): Matrix =>
  Array.from({ length: 5 }, (_, y) => Array.from(state.slice(y * 5, y * 5 + 5)));

/**
 * Trace of the 18 rounds for an input state: trace[round][step], step 0 is the round
 * input and steps 1..5 are the states after θ, ρ, π, χ and ι. The input of round r + 1
 * is the output of round r, so trace[17][5] is Keccak-f[200] applied to the input.
 */
export const computeTrace = (input: Uint8Array): Matrix[][] => {
  if (input.length !== 25) throw new RangeError('O estado deve conter 25 bytes.');
  const state = Uint8Array.from(input);
  const rounds: Matrix[][] = [];
  for (let round = 0; round < KECCAK_ROUNDS; round++) {
    const steps = [toMatrix(state)];
    theta(state);
    steps.push(toMatrix(state));
    rho(state);
    steps.push(toMatrix(state));
    pi(state);
    steps.push(toMatrix(state));
    chi(state);
    steps.push(toMatrix(state));
    iota(state, round);
    steps.push(toMatrix(state));
    rounds.push(steps);
  }
  return rounds;
};

const TRACE: Matrix[][] = computeTrace(Uint8Array.from(seedMatrix.flat()));

const assertRound = (round: number): void => {
  if (!Number.isInteger(round) || round < 0 || round >= KECCAK_ROUNDS) {
    throw new RangeError('Keccak-f[200] possui 18 rodadas, de 0 a 17.');
  }
};

/** Returns a copy, so callers cannot mutate the shared trace. */
export const getStateAtStep = (step: number, round = 0): Matrix => {
  assertRound(round);
  const clamped = Math.max(0, Math.min(step, 5));
  return TRACE[round][clamped].map(row => [...row]);
};

export const matrixToHex = (matrix: Matrix): string =>
  matrix.flat().map(value => value.toString(16).padStart(2, '0')).join('');

export const getCellChanges = (step: number, round = 0): CellChange[] => {
  if (step === 0) return [];
  const before = getStateAtStep(step - 1, round);
  const after = getStateAtStep(step, round);
  const changes: CellChange[] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      if (before[y][x] !== after[y][x]) changes.push({ x, y, before: before[y][x], after: after[y][x] });
    }
  }
  return changes;
};
export const getChangedCellSet = (step: number, round = 0): Set<string> =>
  new Set(getCellChanges(step, round).map(cell => `${cell.x},${cell.y}`));

export const getColumnParities = (matrix: Matrix): number[] =>
  matrix[0].map((_, column) => matrix.reduce((sum, row) => sum ^ row[column], 0));

export const getDValues = (matrix: Matrix): number[] => {
  const columns = getColumnParities(matrix);
  return columns.map((_, x) => columns[(x + 4) % 5] ^ rotateByte(columns[(x + 1) % 5], 1));
};

export const getRhoOffsets = (): number[][] =>
  Array.from({ length: 5 }, (_, y) => RHO_OFFSETS.slice(y * 5, y * 5 + 5));

export const getPiMap = (): Array<{ from: [number, number]; to: [number, number] }> =>
  Array.from({ length: 25 }, (_, i) => {
    const x = i % 5;
    const y = Math.floor(i / 5);
    return { from: [x, y], to: [y, (2 * x + 3 * y) % 5] };
  });

export const getRoundConstant = (round: number): number => {
  if (!Number.isInteger(round) || round < 0 || round >= ROUND_CONSTANTS.length) {
    throw new RangeError('Keccak-f[200] possui 18 rodadas, de 0 a 17.');
  }
  return ROUND_CONSTANTS[round];
};
