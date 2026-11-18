import { MAX_HASH_EVALUATIONS } from '../constants/experiments';
import type { ComparisonEntry, OutputBits, RhoResult, SearchProgress } from '../types/experiments';
import { createTruncatedKeccak200, validateOutputBits } from './keccak200';

export const hashToBits = (input: number, bits: number): number => createTruncatedKeccak200(bits)(input);

export interface SearchOptions {
  seed?: number;
  maxEvaluations?: number;
  /** Injectable transition for testing cycle edge cases. */
  transition?: (value: number) => number;
}

/** Floyd's algorithm. No visited-state table or trajectory is retained by the search. */
export function* searchPollardRho(bits: number, options: SearchOptions = {}): Generator<SearchProgress, RhoResult> {
  validateOutputBits(bits);
  const requestedSeed = options.seed ?? 7;
  const domainSize = 2 ** bits;
  if (!Number.isSafeInteger(requestedSeed) || requestedSeed < 0 || requestedSeed >= domainSize) {
    throw new RangeError('A semente deve caber na saída selecionada.');
  }
  const maxEvaluations = options.maxEvaluations ?? MAX_HASH_EVALUATIONS;
  if (!Number.isSafeInteger(maxEvaluations) || maxEvaluations < 1) throw new RangeError('Limite de avaliações inválido.');
  const hash = options.transition ?? createTruncatedKeccak200(bits);
  let evaluations = 0;
  let lastYield = 0;
  const evaluate = (value: number): number => {
    if (evaluations >= maxEvaluations) throw new Error('Limite de avaliações atingido. Tente outra semente ou uma saída menor.');
    evaluations++;
    const next = hash(value);
    if (!Number.isSafeInteger(next) || next < 0 || next >= domainSize) throw new RangeError('A função de transição saiu do domínio.');
    return next;
  };
  for (let attempts = 1; attempts <= Math.min(domainSize, 64); attempts++) {
    const seed = (requestedSeed + attempts - 1) % domainSize;
    let tortoise = evaluate(seed);
    let hare = evaluate(evaluate(seed));
    let meetingStep = 1;
    const progress = (phase: SearchProgress['phase']): SearchProgress => ({phase, bits, seed, attempts, evaluations, tortoise, hare});
    yield progress('detect');
    while (tortoise !== hare) {
      tortoise = evaluate(tortoise);
      hare = evaluate(evaluate(hare));
      meetingStep++;
      if (evaluations - lastYield >= 1024) { lastYield = evaluations; yield progress('detect'); }
    }
    const meetingValue = tortoise;
    tortoise = seed;
    let cycleStart = 0;
    let previousTortoise = seed;
    let previousHare = hare;
    while (tortoise !== hare) {
      previousTortoise = tortoise;
      previousHare = hare;
      tortoise = evaluate(tortoise);
      hare = evaluate(hare);
      cycleStart++;
      if (evaluations - lastYield >= 1024) { lastYield = evaluations; yield progress('locate'); }
    }
    // A seed already on the cycle gives no pair of distinct predecessors: restart.
    if (cycleStart === 0) continue;
    const collisionValue = tortoise;
    let cycleLength = 1;
    hare = evaluate(tortoise);
    while (tortoise !== hare) {
      hare = evaluate(hare);
      cycleLength++;
      if (evaluations - lastYield >= 1024) { lastYield = evaluations; yield progress('measure'); }
    }
    if (previousTortoise === previousHare || evaluate(previousTortoise) !== collisionValue || evaluate(previousHare) !== collisionValue) {
      throw new Error('Não foi possível verificar o par de entradas da colisão.');
    }
    return { bits, requestedSeed, seed, attempts, evaluations, cycleStart, cycleLength,
      collisionIndex: cycleStart + cycleLength, collisionValue,
      collisionInputs: [previousTortoise, previousHare], meetingStep, meetingValue };
  }
  throw new Error('As sementes testadas entraram diretamente em ciclos. Tente outra semente.');
}

export function runPollardRho(bits: number, options: SearchOptions = {}): RhoResult {
  const search = searchPollardRho(bits, options);
  let next = search.next();
  while (!next.done) next = search.next();
  return next.value;
}

export function* comparePollardRho(sizes: readonly OutputBits[], trials: number): Generator<SearchProgress, ComparisonEntry[]> {
  if (!Number.isInteger(trials) || trials < 1 || trials > 20) throw new RangeError('Número de amostras inválido.');
  const entries: ComparisonEntry[] = [];
  let completedTrials = 0;
  for (const bits of sizes) {
    let sum = 0;
    let evaluations = 0;
    let minIterations = Infinity;
    let maxIterations = 0;
    for (let trial = 0; trial < trials; trial++) {
      const search = searchPollardRho(bits, { seed: (7 + 17 * trial) % 2 ** bits });
      let next = search.next();
      while (!next.done) {
        yield { ...next.value, completedTrials, totalTrials: sizes.length * trials };
        next = search.next();
      }
      const result = next.value;
      sum += result.collisionIndex;
      evaluations += result.evaluations;
      minIterations = Math.min(minIterations, result.collisionIndex);
      maxIterations = Math.max(maxIterations, result.collisionIndex);
      completedTrials++;
    }
    entries.push({bits, trials, iterations: sum / trials, minIterations, maxIterations,
      evaluations: evaluations / trials, expected: 2 ** (bits / 2)});
  }
  return entries;
}
