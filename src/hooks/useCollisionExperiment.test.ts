import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRecentRuns, saveExperimentRun } from '../services/experimentRuns';
import { createDeferred, createRun } from '../test/fixtures';
import type { RunRecord } from '../types/experiments';
import { useCollisionExperiment } from './useCollisionExperiment';

vi.mock('../services/experimentRuns', () => ({
  getRecentRuns: vi.fn(),
  saveExperimentRun: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(getRecentRuns).mockReset().mockResolvedValue([]);
  vi.mocked(saveExperimentRun).mockReset().mockResolvedValue(null);
});

async function renderExperiment() {
  const view = renderHook(useCollisionExperiment);
  await waitFor(() => expect(getRecentRuns).toHaveBeenCalledOnce());
  return view;
}

describe('useCollisionExperiment', () => {
  it('carrega o histórico e inicia com uma saída de seis bits', async () => {
    const history = [createRun()];
    vi.mocked(getRecentRuns).mockResolvedValue(history);
    const { result } = await renderExperiment();

    await waitFor(() => expect(result.current.runs).toEqual(history));
    expect(result.current.bits).toBe(6);
    expect(result.current.resultBits).toBe(6);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.comparison).toEqual([]);
  });

  it('preserva o resultado anterior enquanto a nova configuração não é executada', async () => {
    const { result } = await renderExperiment();
    const previousResult = result.current.result;
    act(() => result.current.setBits(8));

    expect(result.current.bits).toBe(8);
    expect(result.current.resultBits).toBe(6);
    expect(result.current.result).toBe(previousResult);
  });

  it('atualiza a busca imediatamente e mantém o estado de salvamento até a resposta', async () => {
    const pending = createDeferred<RunRecord | null>();
    const savedRun = createRun({ id: 'saved-run', bits: 8 });
    vi.mocked(saveExperimentRun).mockReturnValueOnce(pending.promise);
    const { result } = await renderExperiment();
    act(() => result.current.setBits(8));

    let execution!: Promise<void>;
    act(() => {
      execution = result.current.execute();
    });

    expect(result.current.isSaving).toBe(true);
    expect(result.current.resultBits).toBe(8);
    expect(result.current.runs).toEqual([]);
    expect(saveExperimentRun).toHaveBeenCalledWith(8, result.current.result);

    await act(async () => {
      pending.resolve(savedRun);
      await execution;
    });

    expect(result.current.isSaving).toBe(false);
    expect(result.current.runs).toEqual([savedRun]);
  });

  it('adiciona o experimento mais recente e limita o histórico a cinco registros', async () => {
    const history = Array.from({ length: 5 }, (_, index) => createRun({ id: `run-${index}` }));
    const savedRun = createRun({ id: 'new-run' });
    vi.mocked(getRecentRuns).mockResolvedValue(history);
    vi.mocked(saveExperimentRun).mockResolvedValue(savedRun);
    const { result } = await renderExperiment();
    await waitFor(() => expect(result.current.runs).toHaveLength(5));

    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.runs).toEqual([savedRun, ...history.slice(0, 4)]);
  });

  it('continua executando localmente quando o serviço não retorna um registro', async () => {
    const history = [createRun()];
    vi.mocked(getRecentRuns).mockResolvedValue(history);
    const { result } = await renderExperiment();
    await waitFor(() => expect(result.current.runs).toEqual(history));
    act(() => result.current.setBits(4));
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.resultBits).toBe(4);
    expect(result.current.runs).toEqual(history);
    expect(result.current.isSaving).toBe(false);
  });

  it('libera o estado de salvamento mesmo quando o serviço lança um erro', async () => {
    vi.mocked(saveExperimentRun).mockRejectedValueOnce(new Error('Falha ao salvar'));
    const { result } = await renderExperiment();

    await act(async () => {
      await expect(result.current.execute()).rejects.toThrow('Falha ao salvar');
    });
    expect(result.current.isSaving).toBe(false);
    expect(result.current.runs).toEqual([]);
  });

  it('compara as três saídas sem gravar novos experimentos', async () => {
    const { result } = await renderExperiment();
    act(() => result.current.compare());

    expect(result.current.comparison.map(({ bits }) => bits)).toEqual([4, 6, 8]);
    expect(result.current.comparison.map(({ expected }) => expected)).toEqual([4, 8, 16]);
    for (const entry of result.current.comparison) {
      expect(entry.iterations).toBeGreaterThan(1);
      expect(entry.iterations).toBeLessThanOrEqual(2 ** entry.bits + 1);
      expect(entry.cycleLength).toBeGreaterThan(0);
    }
    expect(saveExperimentRun).not.toHaveBeenCalled();
  });
});
