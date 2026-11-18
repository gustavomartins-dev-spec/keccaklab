import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRecentRuns, saveExperimentRun } from '../services/experimentRuns';
import { startCollisionSearch, startCollisionComparison } from '../services/collisionRunner';
import { collisionFixture, comparisonFixture, createDeferred, createRun } from '../test/fixtures';
import type { RhoResult, RunRecord } from '../types/experiments';
import { useCollisionExperiment } from './useCollisionExperiment';

vi.mock('../services/experimentRuns',()=>({getRecentRuns:vi.fn(),saveExperimentRun:vi.fn()}));
vi.mock('../services/collisionRunner',()=>({startCollisionSearch:vi.fn(),startCollisionComparison:vi.fn()}));
beforeEach(()=>{
  vi.mocked(getRecentRuns).mockReset().mockResolvedValue([]);
  vi.mocked(saveExperimentRun).mockReset().mockResolvedValue(null);
  vi.mocked(startCollisionSearch).mockReset().mockImplementation((bits,seed)=>({
    promise:Promise.resolve({result:{...collisionFixture,bits,seed},elapsedMs:10}),cancel:vi.fn(),
  }));
  vi.mocked(startCollisionComparison).mockReset().mockReturnValue({promise:Promise.resolve({result:comparisonFixture,elapsedMs:20}),cancel:vi.fn()});
});
async function renderExperiment(){
  const view=renderHook(useCollisionExperiment);
  await waitFor(()=>expect(getRecentRuns).toHaveBeenCalledOnce());
  return view;
}

describe('useCollisionExperiment',()=>{
  it('carrega histórico e inicia com oito bits e um resultado local verificado',async()=>{
    const history=[createRun()];
    vi.mocked(getRecentRuns).mockResolvedValue(history);
    const {result}=await renderExperiment();
    await waitFor(()=>expect(result.current.runs).toEqual(history));
    expect(result.current.bits).toBe(8);
    expect(result.current.resultBits).toBe(8);
    expect(result.current.result.collisionInputs[0]).not.toBe(result.current.result.collisionInputs[1]);
    expect(result.current.job).toBeNull();
  });
  it('preserva o resultado anterior ao mudar apenas os parâmetros',async()=>{
    const {result}=await renderExperiment();
    const previous=result.current.result;
    act(()=>result.current.setBits(16));
    expect(result.current.bits).toBe(16);
    expect(result.current.resultBits).toBe(8);
    expect(result.current.result).toBe(previous);
  });
  it('aguarda o worker, apresenta progresso e salva somente um resultado concluído',async()=>{
    const calculation=createDeferred<{result:RhoResult;elapsedMs:number}>();
    const saving=createDeferred<RunRecord|null>();
    vi.mocked(startCollisionSearch).mockReturnValue({promise:calculation.promise,cancel:vi.fn()});
    vi.mocked(saveExperimentRun).mockReturnValue(saving.promise);
    const {result}=await renderExperiment();
    act(()=>result.current.setBits(16));
    let execution!:Promise<void>;
    act(()=>{execution=result.current.execute();});
    expect(result.current.job).toBe('search');
    expect(result.current.resultBits).toBe(8);
    expect(saveExperimentRun).not.toHaveBeenCalled();
    act(()=>vi.mocked(startCollisionSearch).mock.calls[0][2]({phase:'detect',bits:16,seed:7,attempts:1,evaluations:1024,tortoise:2,hare:3}));
    expect(result.current.progress?.evaluations).toBe(1024);
    const completed={...collisionFixture,bits:16};
    await act(async()=>{calculation.resolve({result:completed,elapsedMs:12});await calculation.promise;});
    expect(result.current.isSaving).toBe(true);
    expect(result.current.resultBits).toBe(16);
    expect(saveExperimentRun).toHaveBeenCalledWith(16,completed);
    await act(async()=>{saving.resolve(createRun({bits:16}));await execution;});
    expect(result.current.isSaving).toBe(false);
    expect(result.current.runs[0].bits).toBe(16);
  });
  it('limita o histórico aos cinco registros mais recentes',async()=>{
    const history=Array.from({length:5},(_,i)=>createRun({id:'old-'+i}));
    vi.mocked(getRecentRuns).mockResolvedValue(history);
    const saved=createRun({id:'new'});
    vi.mocked(saveExperimentRun).mockResolvedValue(saved);
    const {result}=await renderExperiment();
    await act(async()=>{await result.current.execute();});
    expect(result.current.runs).toEqual([saved,...history.slice(0,4)]);
  });
  it('preserva a colisão calculada quando o salvamento falha',async()=>{
    vi.mocked(saveExperimentRun).mockRejectedValue(new Error('offline'));
    const {result}=await renderExperiment();
    await act(async()=>{await result.current.execute();});
    expect(result.current.error).toMatch(/não foi possível salvar/);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.resultBits).toBe(8);
  });
  it('informa falhas do worker sem substituir o resultado anterior',async()=>{
    vi.mocked(startCollisionSearch).mockImplementation(()=>({promise:Promise.reject(new Error('Limite atingido')),cancel:vi.fn()}));
    const {result}=await renderExperiment();
    const previous=result.current.result;
    await act(async()=>{await result.current.execute();});
    expect(result.current.error).toBe('Limite atingido');
    expect(result.current.result).toBe(previous);
    expect(result.current.job).toBeNull();
    expect(saveExperimentRun).not.toHaveBeenCalled();
  });
  it('cancela e ignora resultados atrasados, sem gravar no banco',async()=>{
    const pending=createDeferred<{result:RhoResult;elapsedMs:number}>();
    const cancel=vi.fn();
    vi.mocked(startCollisionSearch).mockReturnValue({promise:pending.promise,cancel});
    const {result}=await renderExperiment();
    const previous=result.current.result;
    let execution!:Promise<void>;
    act(()=>{execution=result.current.execute();});
    act(()=>result.current.cancel());
    expect(cancel).toHaveBeenCalledOnce();
    await act(async()=>{pending.resolve({result:collisionFixture,elapsedMs:10});await execution;});
    expect(result.current.result).toBe(previous);
    expect(result.current.job).toBeNull();
    expect(result.current.error).toMatch(/cancelado/);
    expect(saveExperimentRun).not.toHaveBeenCalled();
  });
  it('cancela o worker ao desmontar',async()=>{
    const pending=createDeferred<{result:RhoResult;elapsedMs:number}>();
    const cancel=vi.fn(()=>pending.reject(new DOMException('cancelled','AbortError')));
    vi.mocked(startCollisionSearch).mockReturnValue({promise:pending.promise,cancel});
    const {result,unmount}=await renderExperiment();
    let execution!:Promise<void>;
    act(()=>{execution=result.current.execute();});
    unmount();
    await execution;
    expect(cancel).toHaveBeenCalledOnce();
    expect(saveExperimentRun).not.toHaveBeenCalled();
  });
  it('rejeita sementes inválidas antes de iniciar o worker',async()=>{
    const {result}=await renderExperiment();
    act(()=>result.current.setSeed('256'));
    await act(async()=>{await result.current.execute();});
    expect(result.current.error).toMatch(/semente inteira/);
    expect(startCollisionSearch).not.toHaveBeenCalled();
  });
  it('compara múltiplas sementes em segundo plano sem gravar experimentos',async()=>{
    const {result}=await renderExperiment();
    await act(async()=>{await result.current.compare();});
    expect(result.current.comparison).toEqual(comparisonFixture);
    expect(startCollisionComparison).toHaveBeenCalledOnce();
    expect(saveExperimentRun).not.toHaveBeenCalled();
  });
});
