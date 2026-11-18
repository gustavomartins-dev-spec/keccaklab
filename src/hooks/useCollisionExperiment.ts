import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_OUTPUT_BITS, RECENT_RUNS_LIMIT } from '../constants/experiments';
import { runPollardRho } from '../lib/pollardRho';
import { startCollisionComparison, startCollisionSearch } from '../services/collisionRunner';
import { getRecentRuns, saveExperimentRun } from '../services/experimentRuns';
import type { ComparisonEntry, OutputBits, RunRecord, SearchProgress } from '../types/experiments';

export function useCollisionExperiment() {
  const [bits, setBits] = useState<OutputBits>(DEFAULT_OUTPUT_BITS);
  const [seed, setSeed] = useState('7');
  const [result, setResult] = useState(() => runPollardRho(DEFAULT_OUTPUT_BITS));
  const [resultBits, setResultBits] = useState<OutputBits>(DEFAULT_OUTPUT_BITS);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [job, setJob] = useState<'search' | 'compare' | null>(null);
  const [progress, setProgress] = useState<SearchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [comparison, setComparison] = useState<ComparisonEntry[]>([]);
  const active = useRef<{cancel: () => void} | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let isActive = true;
    void getRecentRuns().then(records => {
      if (isActive) setRuns(records);
    }).catch(() => {});
    return () => {
      isActive = false;
      mounted.current = false;
      generation.current++;
      active.current?.cancel();
      active.current = null;
    };
  }, []);

  const cancel = useCallback(() => {
    generation.current++;
    active.current?.cancel();
    active.current = null;
    setJob(null);
    setProgress(null);
    setError('Cálculo cancelado. O resultado anterior foi preservado.');
  }, []);

  const execute = useCallback(async (): Promise<void> => {
    if (active.current || isSaving) return;
    const numericSeed = Number(seed);
    if (!seed.trim() || !Number.isSafeInteger(numericSeed) || numericSeed < 0 || numericSeed >= 2 ** bits) {
      setError('Informe uma semente inteira entre 0 e ' + (2 ** bits - 1) + '.');
      return;
    }
    const current = ++generation.current;
    const isCurrent = () => mounted.current && current === generation.current;
    setJob('search');
    setProgress(null);
    setError(null);
    try {
      const task = startCollisionSearch(bits, numericSeed, update => { if (isCurrent()) setProgress(update); });
      active.current = task;
      const completed = await task.promise;
      if (!isCurrent()) return;
      setResult(completed.result);
      setResultBits(bits);
      setElapsedMs(completed.elapsedMs);
      setJob(null);
      setProgress(null);
      setIsSaving(true);
      try {
        const record = await saveExperimentRun(bits, completed.result);
        if (record && isCurrent()) setRuns(currentRuns => [record,...currentRuns].slice(0,RECENT_RUNS_LIMIT));
      } catch {
        if (isCurrent()) setError('A colisão foi calculada, mas não foi possível salvar o histórico.');
      }
    } catch (failure) {
      if (isCurrent()) setError(failure instanceof Error ? failure.message : 'Falha ao calcular a colisão.');
    } finally {
      if (isCurrent()) {
        active.current = null;
        setJob(null);
        setProgress(null);
        setIsSaving(false);
      }
    }
  }, [bits,seed,isSaving]);

  const compare = useCallback(async (): Promise<void> => {
    if (active.current || isSaving) return;
    const current = ++generation.current;
    const isCurrent = () => mounted.current && current === generation.current;
    setJob('compare');
    setProgress(null);
    setError(null);
    try {
      const task = startCollisionComparison(update => { if (isCurrent()) setProgress(update); });
      active.current = task;
      const completed = await task.promise;
      if (isCurrent()) setComparison(completed.result);
    } catch (failure) {
      if (isCurrent()) setError(failure instanceof Error ? failure.message : 'Falha ao comparar as saídas.');
    } finally {
      if (isCurrent()) { active.current = null; setJob(null); setProgress(null); }
    }
  }, [isSaving]);

  return {bits,setBits,seed,setSeed,result,resultBits,runs,isSaving,job,progress,error,elapsedMs,comparison,execute,compare,cancel};
}

export type CollisionExperimentController = ReturnType<typeof useCollisionExperiment>;
