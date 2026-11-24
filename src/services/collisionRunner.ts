import type { ComparisonEntry, RhoResult, SearchProgress } from '../types/experiments';

export interface RunningTask<T> {
  promise: Promise<{result:T; elapsedMs:number}>;
  cancel: () => void;
}

function startTask<T>(type: 'search' | 'compare', bits: number, seed: number, onProgress: (progress: SearchProgress) => void): RunningTask<T> {
  const worker = new Worker(new URL('../workers/collision.worker.ts', import.meta.url), {type:'module'});
  let rejectTask: (reason: Error) => void = () => {};
  const promise = new Promise<{result:T; elapsedMs:number}>((resolve, reject) => {
    rejectTask = reject;
    worker.onmessage = ({data}) => {
      if (data.type === 'progress') onProgress(data.progress);
      if (data.type === 'done') { worker.terminate(); resolve({result:data.result,elapsedMs:data.elapsedMs}); }
      if (data.type === 'error') { worker.terminate(); reject(new Error(data.message)); }
    };
    worker.onerror = () => { worker.terminate(); reject(new Error('Não foi possível executar a busca em segundo plano.')); };
    worker.onmessageerror = () => { worker.terminate(); reject(new Error('Resposta inválida do cálculo em segundo plano.')); };
    worker.postMessage({type,bits,seed});
  });
  return {
    promise,
    cancel: () => { worker.terminate(); rejectTask(new DOMException('Busca cancelada.', 'AbortError')); },
  };
}

export const startCollisionSearch = (bits: number, seed: number, onProgress: (progress: SearchProgress) => void): RunningTask<RhoResult> =>
  startTask('search', bits, seed, onProgress);
/** A fresh random run seed, so each comparison draws new starting points. */
const randomRunSeed = (): number => crypto.getRandomValues(new Uint32Array(1))[0];

export const startCollisionComparison = (
  onProgress: (progress: SearchProgress) => void,
  runSeed: number = randomRunSeed(),
): RunningTask<ComparisonEntry[]> => startTask('compare', 8, runSeed, onProgress);
