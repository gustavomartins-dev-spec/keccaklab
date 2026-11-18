import { describe, expect, it } from 'vitest';
import { createTruncatedKeccak200, encodeState, keccak200, keccakF200, theta, rho, pi, chi, iota } from './keccak200';
const hex=(bytes:Uint8Array)=>Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');

describe('Keccak-f[200] contra vetores oficiais XKCP',()=>{
  // https://github.com/XKCP/XKCP/blob/master/tests/TestVectors/KeccakF-200-IntermediateValues.txt
  it('reproduz as duas permutações completas do vetor oficial',()=>{
    const zero=new Uint8Array(25);
    const first=keccakF200(zero);
    expect(hex(first)).toBe('3c2826841cb35c171eaae9b811134ceaa3852c69d2c5abafea');
    expect(hex(keccakF200(first))).toBe('1bef689492a8a543a5999fdb834e3166a14be827d95040479e');
    expect(zero.every(value=>value===0)).toBe(true);
  });
  it('reproduz cada etapa da rodada 1 do vetor oficial',()=>{
    const state=new Uint8Array(25);state[0]=1;
    theta(state);
    expect(hex(state)).toBe('01010000020001000002000100000200010000020001000002');
    rho(state);
    expect(hex(state)).toBe('01020000100010000020000400000100200000020004000080');
    pi(state);
    expect(hex(state)).toBe('01100000800020002000020000020010000400000000010004');
    chi(state);
    expect(hex(state)).toBe('01108001900000002020020200000014000410000100050004');
    iota(state,1);
    expect(hex(state)).toBe('83108001900000002020020200000014000410000100050004');
  });
  it('rejeita estados com largura errada e rodadas inexistentes',()=>{
    expect(()=>keccakF200(new Uint8Array(24))).toThrow(RangeError);
    expect(()=>iota(new Uint8Array(25),18)).toThrow(RangeError);
  });
});

describe('esponja Keccak[r=120,c=80], pad10*1',()=>{
  // Cross-checked with an independent matrix-based Python reference and the XKCP permutation vectors.
  it.each([
    [0,'85e2044edfd38ecd82c39f9262046ed8e74e531a4cb7baf5f976478a087c66ae'],
    [1,'16e6c287205bacadaafd97c24f83b23eb5f79419880e7abf723e95fb9401c8bf'],
    [14,'f9d7e91935edb16dec48e3777c198d08e3c1448417905c8ca1d431e346151fa2'],
    [15,'523a8750f44478a2ab84e1b63da48cc2e8e20de6718c5a6e2833feea791e0ab1'],
    [16,'449f2b21f793e82aca81b8fe2e1c0f67bb17bc898d0187765bfac9d55c13f399'],
    [30,'94615e22591621bdce49f05c125ef24658e96ccf5b2a2c09d2005271f7fe9101'],
  ])('valida absorção, padding e squeeze para %i bytes',(length,expected)=>{
    expect(hex(keccak200(Uint8Array.from({length:length as number},(_,i)=>i),32))).toBe(expected);
  });
  it.each([4,6,8,12,16,24,32,36,40])('trunca corretamente %i bits sem perder os bits acima de 32',bits=>{
    const hash=createTruncatedKeccak200(bits);
    for(const value of [0,7,2**bits-1]){
      const digest=keccak200(encodeState(value,bits),Math.ceil(bits/8));
      let expected=0;
      for(let i=digest.length-1;i>=0;i--)expected=expected*256+digest[i];
      expect(hash(value)).toBe(expected%2**bits);
    }
  });
  it('preserva cinco bytes de uma entrada de 40 bits',()=>{
    expect(Array.from(encodeState(0x123456789a,40))).toEqual([0x9a,0x78,0x56,0x34,0x12]);
    expect(createTruncatedKeccak200(40)(2**32+7)).not.toBe(createTruncatedKeccak200(40)(7));
  });
  it.each([0,3,41,4.5,NaN])('rejeita tamanho de saída %s',bits=>{
    expect(()=>createTruncatedKeccak200(bits)).toThrow(RangeError);
  });
  it('rejeita entradas fora do domínio e comprimentos de resumo inválidos',()=>{
    for(const value of [-1,256,1.5,NaN])expect(()=>createTruncatedKeccak200(8)(value)).toThrow(RangeError);
    expect(()=>encodeState(-1,8)).toThrow(RangeError);
    expect(()=>keccak200(new Uint8Array(),0)).toThrow(RangeError);
  });
});
