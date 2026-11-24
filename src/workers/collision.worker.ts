import { COMPARISON_BITS, COMPARISON_TRIALS } from '../constants/experiments';
import { comparePollardRho, searchPollardRho } from '../lib/pollardRho';
import type { ComparisonEntry, RhoResult, SearchProgress } from '../types/experiments';

interface Request { type: 'search' | 'compare'; bits: number; seed: number }
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage: (message: unknown) => void;
};

scope.onmessage = ({ data }) => {
  const started = performance.now();
  const job: Generator<SearchProgress, RhoResult | ComparisonEntry[]> = data.type === 'search'
    ? searchPollardRho(data.bits, {seed:data.seed})
    : comparePollardRho(COMPARISON_BITS, COMPARISON_TRIALS, data.seed);
  let lastProgress = -Infinity;
  const pump = (): void => {
    try {
      // Work in ~12 ms slices: fewer timer round-trips, still frequent progress messages.
      const sliceStart = performance.now();
      let next = job.next();
      // The first tick reports progress right away, so the interface reacts immediately.
      while (!next.done && lastProgress !== -Infinity && performance.now() - sliceStart < 12) next = job.next();
      if (next.done) {
        scope.postMessage({type:'done', result:next.value, elapsedMs:performance.now()-started});
        return;
      }
      if (performance.now() - lastProgress > 80) {
        lastProgress = performance.now();
        scope.postMessage({type:'progress', progress:next.value});
      }
      setTimeout(pump, 0);
    } catch (error) {
      scope.postMessage({type:'error', message:error instanceof Error ? error.message : 'Falha na busca.'});
    }
  };
  pump();
};
