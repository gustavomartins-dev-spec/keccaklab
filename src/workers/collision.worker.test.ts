import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { collisionFixture } from '../test/fixtures';

vi.mock('../constants/experiments',async importOriginal=>({
  ...await importOriginal<typeof import('../constants/experiments')>(),
  COMPARISON_BITS:[4,6,8],COMPARISON_TRIALS:2,
}));

let scope:{onmessage:((event:MessageEvent)=>void)|null;postMessage:ReturnType<typeof vi.fn>};
beforeEach(async()=>{
  vi.resetModules();
  vi.useFakeTimers();
  scope={onmessage:null,postMessage:vi.fn()};
  vi.stubGlobal('self',scope);
  await import('./collision.worker');
});
afterEach(()=>vi.unstubAllGlobals());
describe('cálculo real no worker',()=>{
  it('publica progresso e uma colisão verificável sem bloquear a fila de mensagens',()=>{
    scope.onmessage!({data:{type:'search',bits:8,seed:7}} as MessageEvent);
    expect(scope.postMessage).toHaveBeenCalledWith(expect.objectContaining({type:'progress'}));
    vi.runAllTimers();
    expect(scope.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({type:'done',result:collisionFixture}));
  });
  it('retorna erro para parâmetros inválidos',()=>{
    scope.onmessage!({data:{type:'search',bits:41,seed:7}} as MessageEvent);
    expect(scope.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({type:'error',message:expect.stringContaining('4 a 40')}));
  });
  it('executa a comparação com múltiplas sementes',()=>{
    scope.onmessage!({data:{type:'compare',bits:8,seed:7}} as MessageEvent);
    vi.runAllTimers();
    const done=scope.postMessage.mock.calls.find(([data])=>data.type==='done')?.[0];
    expect(done.result.map((entry:{bits:number})=>entry.bits)).toEqual([4,6,8]);
    expect(done.result.every((entry:{trials:number})=>entry.trials===2)).toBe(true);
  });
});
