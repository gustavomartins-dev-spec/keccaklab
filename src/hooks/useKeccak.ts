import { useCallback, useEffect, useMemo, useState } from 'react';
import { LAST_KECCAK_STEP, PLAYBACK_INTERVAL_MS } from '../constants/keccak';
import { STEP_DETAILS } from '../constants/keccakDetails';
import { getCellChanges, getChangedCellSet, getStateAtStep, matrixToHex } from '../lib/keccak';

export function useKeccak() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const matrix = useMemo(() => getStateAtStep(step), [step]);
  const changedCells = useMemo(() => getChangedCellSet(step), [step]);
  const cellChanges = useMemo(() => getCellChanges(step), [step]);
  const hexState = useMemo(() => matrixToHex(matrix), [matrix]);

  useEffect(() => {
    if (!isPlaying) return;
    if (step === LAST_KECCAK_STEP) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => setStep((current) => current + 1), PLAYBACK_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [isPlaying, step]);

  const selectStep = useCallback((nextStep: number): void => {
    setStep(Math.max(0, Math.min(nextStep, LAST_KECCAK_STEP)));
    setIsPlaying(false);
  }, []);

  const pause = useCallback((): void => setIsPlaying(false), []);

  const togglePlayback = useCallback((): void => {
    setStep((current) => (current === LAST_KECCAK_STEP ? 0 : current));
    setIsPlaying((current) => !current);
  }, []);

  return {
    step,
    isPlaying,
    matrix,
    changedCells,
    cellChanges,
    hexState,
    detail: STEP_DETAILS[step],
    selectStep,
    pause,
    togglePlayback,
  };
}

export type KeccakController = ReturnType<typeof useKeccak>;
