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

/** Small seeded PRNG (mulberry32): a run seed always gives the same sequence of draws. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

/** Distinct starting points drawn uniformly from the domain (repeats only if count exceeds it). */
export function drawSeeds(random: () => number, count: number, domainSize: number): number[] {
  const seeds = new Set<number>();
  while (seeds.size < Math.min(count, domainSize)) seeds.add(Math.floor(random() * domainSize));
  const list = [...seeds];
  while (list.length < count) list.push(list[list.length % seeds.size]);
  return list;
}

/**
 * Average length of the rho (μ + λ) for each output size, over `trials` seeds drawn at random
 * from `runSeed`. Each run of the comparison uses a new runSeed, so results vary between runs.
 */
export function* comparePollardRho(sizes: readonly OutputBits[], trials: number, runSeed = 1): Generator<SearchProgress, ComparisonEntry[]> {
  if (!Number.isInteger(trials) || trials < 1 || trials > 100) throw new RangeError('Número de amostras inválido.');
  const random = createRandom(runSeed);
  const entries: ComparisonEntry[] = [];
  let completedTrials = 0;
  for (const bits of sizes) {
    let sum = 0;
    let evaluations = 0;
    let minIterations = Infinity;
    let maxIterations = 0;
    for (const seed of drawSeeds(random, trials, 2 ** bits)) {
      const search = searchPollardRho(bits, { seed });
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
      evaluations: evaluations / trials, expected: Math.sqrt(Math.PI / 2) * 2 ** (bits / 2)});
  }
  return entries;
}
