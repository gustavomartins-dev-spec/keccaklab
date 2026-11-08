export type OutputBits = 4 | 6 | 8;

export interface RhoResult {
  points: number[];
  collisionIndex: number;
  cycleStart: number;
  cycleLength: number;
  collisionValue: number;
}

export interface RunRecord {
  id: string;
  bits: OutputBits;
  cycleLength: number;
  createdAt: string;
}

export interface ComparisonEntry {
  bits: OutputBits;
  iterations: number;
  cycleLength: number;
  expected: number;
}
