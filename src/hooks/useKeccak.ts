import { useCallback, useEffect, useMemo, useState } from 'react';
import { LAST_KECCAK_ROUND, LAST_KECCAK_STEP, PLAYBACK_INTERVAL_MS } from '../constants/keccak';
import { STEP_DETAILS } from '../constants/keccakDetails';
import {
  getCellChanges,
  getChangedCellSet,
  getRoundConstant,
  getStateAtStep,
  matrixToHex,
} from '../lib/keccak';
import type { StepDetail } from '../types/keccak';
import { formatByte } from '../utils/format';

const clampRound = (round: number): number => Math.max(0, Math.min(round, LAST_KECCAK_ROUND));
const clampStep = (step: number): number => Math.max(0, Math.min(step, LAST_KECCAK_STEP));

/** Adapts the static step texts to the selected round (round input and RC[i]). */
export function getStepDetail(step: number, round: number): StepDetail {
  const base = STEP_DETAILS[step];
  if (step === 0 && round > 0) {
    return {
      ...base,
      title: `Entrada da rodada ${round}`,
      shortDescription: `Estado produzido pela rodada ${round - 1}, após ι. É a entrada da rodada ${round}.`,
      description: `Cada rodada de Keccak-f[200] recebe como entrada a saída da rodada anterior. Este estado é o resultado de θ → ρ → π → χ → ι aplicados ${round} ${round === 1 ? 'vez' : 'vezes'} sobre a matriz inicial.`,
      formula: `A ← Rodada${round - 1}(A)`,
      effect: 'Define o estado de entrada da rodada, sem aplicar novas transformações.',
      steps: [
        `Toma o estado final da rodada ${round - 1}.`,
        'Mantém a mesma organização 5 × 5 lanes de 8 bits.',
        `Aplica a seguir θ, ρ, π, χ e ι com a constante RC[${round}].`,
      ],
    };
  }
  if (step === 5) {
    const rc = `0x${formatByte(getRoundConstant(round))}`;
    return {
      ...base,
      formula: `A′[0][0] = A[0][0] ⊕ RC[${round}]   (RC[${round}] = ${rc})`,
    };
  }
  return base;
}

export function useKeccak() {
  const [round, setRound] = useState(0);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const matrix = useMemo(() => getStateAtStep(step, round), [step, round]);
  const changedCells = useMemo(() => getChangedCellSet(step, round), [step, round]);
  const cellChanges = useMemo(() => getCellChanges(step, round), [step, round]);
  const hexState = useMemo(() => matrixToHex(matrix), [matrix]);
  const detail = useMemo(() => getStepDetail(step, round), [step, round]);

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
    setStep(clampStep(nextStep));
    setIsPlaying(false);
  }, []);

  /** Changing rounds keeps the selected transformation, to compare it across rounds. */
  const selectRound = useCallback((nextRound: number): void => {
    setRound(clampRound(nextRound));
    setIsPlaying(false);
  }, []);

  /** Moves one step forward; after ι it continues at the input of the next round. */
  const goNext = useCallback((): void => {
    setIsPlaying(false);
    if (step < LAST_KECCAK_STEP) {
      setStep(step + 1);
    } else if (round < LAST_KECCAK_ROUND) {
      setRound(round + 1);
      setStep(0);
    }
  }, [step, round]);

  /** Moves one step back; before the round input it returns to ι of the previous round. */
  const goPrevious = useCallback((): void => {
    setIsPlaying(false);
    if (step > 0) {
      setStep(step - 1);
    } else if (round > 0) {
      setRound(round - 1);
      setStep(LAST_KECCAK_STEP);
    }
  }, [step, round]);

  const pause = useCallback((): void => setIsPlaying(false), []);

  const togglePlayback = useCallback((): void => {
    setStep((current) => (current === LAST_KECCAK_STEP ? 0 : current));
    setIsPlaying((current) => !current);
  }, []);

  return {
    round,
    step,
    isPlaying,
    matrix,
    changedCells,
    cellChanges,
    hexState,
    detail,
    isFirst: round === 0 && step === 0,
    isLast: round === LAST_KECCAK_ROUND && step === LAST_KECCAK_STEP,
    selectStep,
    selectRound,
    goNext,
    goPrevious,
    pause,
    togglePlayback,
  };
}

export type KeccakController = ReturnType<typeof useKeccak>;
