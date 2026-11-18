export type OutputBits = 4 | 6 | 8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40;
export type SearchPhase = 'detect' | 'locate' | 'measure';

export interface SearchProgress {
  phase: SearchPhase;
  bits: number;
  seed: number;
  attempts: number;
  evaluations: number;
  tortoise: number;
  hare: number;
  completedTrials?: number;
  totalTrials?: number;
}

export interface RhoResult {
  bits: number;
  requestedSeed: number;
  seed: number;
  attempts: number;
  evaluations: number;
  cycleStart: number;
  cycleLength: number;
  collisionIndex: number;
  collisionValue: number;
  collisionInputs: [number, number];
  meetingStep: number;
  meetingValue: number;
}

export interface RunRecord {
  id: string;
  bits: OutputBits;
  cycleLength: number;
  createdAt: string;
}

export interface ComparisonEntry {
  bits: OutputBits;
  trials: number;
  iterations: number;
  minIterations: number;
  maxIterations: number;
  evaluations: number;
  expected: number;
}

export interface RhoNode {
  id: string;
  index: number | null;
  value: number | null;
  group: 'tail' | 'cycle';
  omitted?: number;
}

export interface FloydFrame {
  step: number;
  tortoise: number;
  hare: number;
}
