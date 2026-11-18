import { runPollardRho } from '../lib/pollardRho';
import type { ComparisonEntry, RunRecord } from '../types/experiments';

export const collisionFixture = runPollardRho(8);
export const comparisonFixture: ComparisonEntry[] = [8,16,24].map((bits,index)=>({
  bits:bits as 8|16|24,trials:5,iterations:10**(index+1),minIterations:5**(index+1),
  maxIterations:2*10**(index+1),evaluations:5*10**(index+1),expected:2**(bits/2),
}));

export function createRun(overrides: Partial<RunRecord> = {}): RunRecord {
  return {id:'run-1',bits:8,cycleLength:collisionFixture.cycleLength,createdAt:'2026-11-07T15:00:00.000Z',...overrides};
}

export function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((onResolve,onReject)=>{resolve=onResolve;reject=onReject;});
  return {promise,resolve,reject};
}
