import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LAST_KECCAK_STEP, PLAYBACK_INTERVAL_MS } from '../constants/keccak';
import { useKeccak } from './useKeccak';

beforeEach(() => vi.useFakeTimers());

describe('useKeccak', () => {
  it('inicia na entrada, sem reprodução ou células alteradas', () => {
    const { result } = renderHook(useKeccak);
    expect(result.current.step).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.detail.title).toBe('Estado inicial');
    expect(result.current.hexState).toHaveLength(50);
    expect(result.current.cellChanges).toEqual([]);
    expect(result.current.changedCells.size).toBe(0);
  });

  it.each([
    { input: -10, expected: 0 },
    { input: 99, expected: 5 },
  ])('limita a seleção $input à etapa $expected', ({ input, expected }) => {
    const { result } = renderHook(useKeccak);
    act(() => result.current.selectStep(input));
    expect(result.current.step).toBe(expected);
  });

  it('avança uma transformação por intervalo e encerra na última etapa', () => {
    const { result } = renderHook(useKeccak);
    act(() => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(true);

    for (let step = 1; step <= LAST_KECCAK_STEP; step++) {
      act(() => vi.advanceTimersByTime(PLAYBACK_INTERVAL_MS));
      expect(result.current.step).toBe(step);
    }

    expect(result.current.isPlaying).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(PLAYBACK_INTERVAL_MS * 2));
    expect(result.current.step).toBe(LAST_KECCAK_STEP);
  });

  it('pausa e retoma a reprodução a partir da etapa atual', () => {
    const { result } = renderHook(useKeccak);
    act(() => result.current.togglePlayback());
    act(() => vi.advanceTimersByTime(PLAYBACK_INTERVAL_MS));
    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(PLAYBACK_INTERVAL_MS * 3));

    expect(result.current.step).toBe(1);
    expect(result.current.isPlaying).toBe(false);

    act(() => result.current.togglePlayback());
    act(() => vi.advanceTimersByTime(PLAYBACK_INTERVAL_MS));
    expect(result.current.step).toBe(2);
  });

  it('interrompe o temporizador quando uma etapa é selecionada manualmente', () => {
    const { result } = renderHook(useKeccak);
    act(() => result.current.togglePlayback());
    act(() => result.current.selectStep(3));
    act(() => vi.advanceTimersByTime(PLAYBACK_INTERVAL_MS * 2));

    expect(result.current.step).toBe(3);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.detail.name).toBe('Pi');
    expect(result.current.cellChanges.length).toBeGreaterThan(0);
  });

  it('reinicia na entrada ao reproduzir uma rodada concluída', () => {
    const { result } = renderHook(useKeccak);
    act(() => result.current.selectStep(LAST_KECCAK_STEP));
    act(() => result.current.togglePlayback());

    expect(result.current.step).toBe(0);
    expect(result.current.isPlaying).toBe(true);
    act(() => vi.advanceTimersByTime(PLAYBACK_INTERVAL_MS));
    expect(result.current.step).toBe(1);
  });

  it('cancela a reprodução ao desmontar o hook', () => {
    const { result, unmount } = renderHook(useKeccak);
    act(() => result.current.togglePlayback());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
