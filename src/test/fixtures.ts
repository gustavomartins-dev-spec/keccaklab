import type { RhoResult, RunRecord } from '../types/experiments';

export const collisionFixture: RhoResult = {
  points: [1, 2, 1],
  collisionIndex: 2,
  cycleStart: 0,
  cycleLength: 2,
  collisionValue: 1,
};

export function createRun(overrides: Partial<RunRecord> = {}): RunRecord {
  return {
    id: 'run-1',
    bits: 6,
    cycleLength: 2,
    createdAt: '2026-11-07T15:00:00.000Z',
    ...overrides,
  };
}

export function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });

  return { promise, resolve, reject };
}
