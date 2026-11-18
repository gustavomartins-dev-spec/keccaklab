import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startCollisionComparison, startCollisionSearch } from './collisionRunner';
import { collisionFixture } from '../test/fixtures';

class FakeWorker {
  static instances:FakeWorker[]=[];
  onmessage:((event:{data:unknown})=>void)|null=null;
  onerror:(()=>void)|null=null;
  onmessageerror:(()=>void)|null=null;
  postMessage=vi.fn();
  terminate=vi.fn();
  constructor(public url:URL,public options:WorkerOptions){FakeWorker.instances.push(this);}
  emit(data:unknown){this.onmessage?.({data});}
}
beforeEach(()=>{FakeWorker.instances=[];vi.stubGlobal('Worker',FakeWorker);});
afterEach(()=>vi.unstubAllGlobals());

describe('execução em worker',()=>{
  it('encaminha parâmetros e progresso e encerra o worker ao concluir',async()=>{
    const progress=vi.fn();
    const task=startCollisionSearch(40,2**35,progress);
    const worker=FakeWorker.instances[0];
    expect(worker.options.type).toBe('module');
    expect(worker.postMessage).toHaveBeenCalledWith({type:'search',bits:40,seed:2**35});
    worker.emit({type:'progress',progress:{evaluations:1024}});
    expect(progress).toHaveBeenCalledWith({evaluations:1024});
    worker.emit({type:'done',result:collisionFixture,elapsedMs:123});
    await expect(task.promise).resolves.toEqual({result:collisionFixture,elapsedMs:123});
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it('termina imediatamente e rejeita a promessa quando cancelado',async()=>{
    const task=startCollisionSearch(40,7,vi.fn());
    const rejected=expect(task.promise).rejects.toMatchObject({name:'AbortError'});
    task.cancel();
    await rejected;
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
  });
  it('propaga erros sem produzir resultado',async()=>{
    const task=startCollisionComparison(vi.fn());
    FakeWorker.instances[0].emit({type:'error',message:'Limite atingido'});
    await expect(task.promise).rejects.toThrow('Limite atingido');
  });
  it('trata erros de carregamento e de mensagens',async()=>{
    const load=startCollisionSearch(8,7,vi.fn());
    FakeWorker.instances[0].onerror?.();
    await expect(load.promise).rejects.toThrow(/segundo plano/);
    const message=startCollisionSearch(8,7,vi.fn());
    FakeWorker.instances[1].onmessageerror?.();
    await expect(message.promise).rejects.toThrow(/Resposta inválida/);
  });
});
