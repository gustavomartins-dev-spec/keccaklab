export type Matrix = number[][];

export interface CellChange {
  x: number;
  y: number;
  before: number;
  after: number;
}

export interface StepDetail {
  symbol: string;
  name: string;
  title: string;
  shortDescription: string;
  description: string;
  formula: string;
  effect: string;
  steps: string[];
}
