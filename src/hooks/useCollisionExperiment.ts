import { useCallback, useEffect, useState } from 'react';
import { BIT_OPTIONS, DEFAULT_OUTPUT_BITS, RECENT_RUNS_LIMIT } from '../constants/experiments';
import { runPollardRho } from '../lib/pollardRho';
import { getRecentRuns, saveExperimentRun } from '../services/experimentRuns';
import type { ComparisonEntry, OutputBits, RunRecord } from '../types/experiments';

export function useCollisionExperiment() {
  const [bits, setBits] = useState<OutputBits>(DEFAULT_OUTPUT_BITS);
  const [result, setResult] = useState(() => runPollardRho(DEFAULT_OUTPUT_BITS));
  const [resultBits, setResultBits] = useState<OutputBits>(DEFAULT_OUTPUT_BITS);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [comparison, setComparison] = useState<ComparisonEntry[]>([]);

  useEffect(() => {
    let isActive = true;

    void getRecentRuns().then((records) => {
      if (isActive) setRuns(records);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const execute = useCallback(async (): Promise<void> => {
    const nextResult = runPollardRho(bits);
    setResult(nextResult);
    setResultBits(bits);
    setIsSaving(true);

    try {
      const record = await saveExperimentRun(bits, nextResult);
      if (record) setRuns((current) => [record, ...current].slice(0, RECENT_RUNS_LIMIT));
    } finally {
      setIsSaving(false);
    }
  }, [bits]);

  const compare = useCallback((): void => {
    setComparison(
      BIT_OPTIONS.map((outputBits) => {
        const run = runPollardRho(outputBits);
        return {
          bits: outputBits,
          iterations: run.points.length,
          cycleLength: run.cycleLength,
          expected: Math.pow(2, outputBits / 2),
        };
      }),
    );
  }, []);

  return { bits, setBits, result, resultBits, runs, isSaving, comparison, execute, compare };
}

export type CollisionExperimentController = ReturnType<typeof useCollisionExperiment>;
