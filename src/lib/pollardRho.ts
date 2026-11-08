import type { RhoResult } from '../types/experiments';

export const hashToBits = (input: number, bits: number): number => {
  let value = (input ^ 0x9e3779b9) >>> 0;
  for (let round = 0; round < 5; round += 1) {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    value = Math.imul(value, 0x45d9f3b) >>> 0;
  }
  return value & ((1 << bits) - 1);
};

export const runPollardRho = (bits: number): RhoResult => {
  const seen = new Map<number, number>();
  const points: number[] = [];
  let value = 7;
  let collisionIndex = 0;
  let collisionValue = 0;
  for (let index = 0; index < 260; index += 1) {
    value = hashToBits(value + 11, bits);
    points.push(value);
    const previous = seen.get(value);
    if (previous !== undefined) {
      collisionIndex = index;
      collisionValue = value;
      return {
        points,
        collisionIndex,
        cycleStart: previous,
        cycleLength: index - previous,
        collisionValue,
      };
    }
    seen.set(value, index);
  }
  return {
    points,
    collisionIndex: points.length - 1,
    cycleStart: 0,
    cycleLength: points.length,
    collisionValue: value,
  };
};
