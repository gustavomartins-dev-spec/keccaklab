import { describe, expect, it } from 'vitest';
import { comparePollardRho, hashToBits, runPollardRho, searchPollardRho } from './pollardRho';

describe.each([4,6,8,12,16])('Floyd com Keccak-200 truncado em %i bits',bits=>{
  it('recupera e verifica duas entradas distintas com o mesmo resumo',()=>{
    const result=runPollardRho(bits);
    const [a,b]=result.collisionInputs;
    expect(a).not.toBe(b);
    expect(hashToBits(a,bits)).toBe(result.collisionValue);
    expect(hashToBits(b,bits)).toBe(result.collisionValue);
    expect(result.evaluations).toBeGreaterThan(result.collisionIndex);
    expect(result).not.toHaveProperty('points');
  });
  it('concorda com uma busca independente por tabela de visitados',()=>{
    const result=runPollardRho(bits);
    const seen=new Map<number,number>();
    let value=result.seed;
    let index=0;
    while(!seen.has(value)){
      seen.set(value,index++);
      value=hashToBits(value,bits);
    }
    expect(result.cycleStart).toBe(seen.get(value));
    expect(result.collisionIndex).toBe(index);
    expect(result.cycleLength).toBe(index-seen.get(value)!);
    expect(result.collisionValue).toBe(value);
    expect(runPollardRho(bits)).toEqual(result);
  });
});

describe('casos de borda de Floyd',()=>{
  it('localiza cauda e ciclo e não confunde encontro com colisão',()=>{
    const edges=[1,2,3,2];
    const result=runPollardRho(4,{seed:0,transition:value=>edges[value]});
    expect(result.cycleStart).toBe(2);
    expect(result.cycleLength).toBe(2);
    expect(result.collisionInputs).toEqual([1,3]);
    expect(result.collisionValue).toBe(2);
  });
  it('reinicia quando a semente já está em um ciclo, inclusive ponto fixo',()=>{
    const result=runPollardRho(4,{seed:0,transition:()=>0});
    expect(result.seed).toBe(1);
    expect(result.attempts).toBe(2);
    expect(result.collisionInputs).toEqual([1,0]);
    expect(result.cycleLength).toBe(1);
  });
  it('não inventa colisão quando a transição é uma permutação',()=>{
    expect(()=>runPollardRho(4,{transition:value=>value})).toThrow(/sementes/);
  });
  it('contabiliza exatamente todas as chamadas e respeita o orçamento',()=>{
    let calls=0;
    const result=runPollardRho(4,{seed:1,transition:()=>{calls++;return 0;}});
    expect(result.evaluations).toBe(calls);
    expect(()=>runPollardRho(16,{maxEvaluations:2})).toThrow(/Limite/);
  });
  it('mantém valores acima de 32 bits durante a detecção e recuperação',()=>{
    const a=2**35,b=a+1,c=a+2,d=a+3;
    const edges=new Map([[a,b],[b,c],[c,d],[d,c]]);
    const result=runPollardRho(40,{seed:a,transition:value=>edges.get(value)!});
    expect(result.collisionInputs).toEqual([b,d]);
    expect(result.collisionValue).toBe(c);
  });
  it('emite progresso e valida parâmetros inválidos',()=>{
    const job=searchPollardRho(8);
    const next=job.next();
    expect(next.done).toBe(false);
    expect(next.value).toMatchObject({phase:'detect',evaluations:3});
    expect(()=>runPollardRho(8,{seed:256})).toThrow(RangeError);
    expect(()=>runPollardRho(8,{maxEvaluations:0})).toThrow(RangeError);
    expect(()=>runPollardRho(8,{transition:()=>-1})).toThrow(RangeError);
  });
  it('calcula média e dispersão de múltiplas sementes sem confundir passos com avaliações',()=>{
    const job=comparePollardRho([8,12],3);
    let next=job.next();
    while(!next.done)next=job.next();
    expect(next.value).toHaveLength(2);
    for(const entry of next.value){
      expect(entry.trials).toBe(3);
      expect(entry.iterations).toBeGreaterThanOrEqual(entry.minIterations);
      expect(entry.iterations).toBeLessThanOrEqual(entry.maxIterations);
      expect(entry.evaluations).toBeGreaterThan(entry.iterations);
      expect(entry.expected).toBeCloseTo(Math.sqrt(Math.PI/2)*2**(entry.bits/2));
    }
  });
});
