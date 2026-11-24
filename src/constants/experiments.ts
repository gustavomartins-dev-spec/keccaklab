import type { OutputBits } from '../types/experiments';

export const BIT_OPTIONS: readonly OutputBits[] = [4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40];
export const DEFAULT_OUTPUT_BITS: OutputBits = 8;
export const COMPARISON_BITS: readonly OutputBits[] = [8, 16, 24];
/** Seeds per output size (a couple of seconds in total). Seeds share one function h, so the
 *  cycle λ repeats across them and more seeds steady the tail μ more than the mean. */
export const COMPARISON_TRIALS = 30;
export const MAX_HASH_EVALUATIONS = 20_000_000;
export const RECENT_RUNS_LIMIT = 5;
