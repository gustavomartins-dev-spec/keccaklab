import { describe, expect, it } from 'vitest';
import { hashToBits, runPollardRho } from './pollardRho';

describe.each([4, 6, 8])('busca de colisões com saída de %i bits', (bits) => {
  it('produz hashes determinísticos dentro do intervalo da saída', () => {
    for (const input of [-1, 0, 1, 7, 255, 0xffffffff]) {
      const hash = hashToBits(input, bits);
      expect(hash).toBe(hashToBits(input, bits));
      expect(Number.isInteger(hash)).toBe(true);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThan(2 ** bits);
    }
  });

  it('encerra na primeira repetição e informa a entrada e o comprimento do ciclo', () => {
    const result = runPollardRho(bits);
    const uniquePoints = result.points.slice(0, -1);

    expect(result.points.length).toBeGreaterThan(1);
    expect(result.points.length).toBeLessThanOrEqual(2 ** bits + 1);
    expect(new Set(uniquePoints).size).toBe(uniquePoints.length);
    expect(result.collisionIndex).toBe(result.points.length - 1);
    expect(result.points[result.cycleStart]).toBe(result.collisionValue);
    expect(result.points[result.collisionIndex]).toBe(result.collisionValue);
    expect(uniquePoints.indexOf(result.collisionValue)).toBe(result.cycleStart);
    expect(result.cycleLength).toBe(result.collisionIndex - result.cycleStart);
    expect(result.cycleLength).toBeGreaterThan(0);
  });

  it('mantém a trajetória reproduzível e consistente com a função de transição', () => {
    const result = runPollardRho(bits);
    expect(runPollardRho(bits)).toEqual(result);
    expect(result.points[0]).toBe(hashToBits(18, bits));
    for (let index = 1; index < result.points.length; index++) {
      expect(result.points[index]).toBe(hashToBits(result.points[index - 1] + 11, bits));
    }
  });
});
