import { describe, expect, it } from 'vitest';
import { formatByte, formatHex } from './format';

describe('formatação hexadecimal', () => {
  it.each([
    { value: 0, bits: 4, expected: '0' },
    { value: 1, bits: 8, expected: '01' },
    { value: 15, bits: 6, expected: '0f' },
    { value: 255, bits: 8, expected: 'ff' },
    { value: 256, bits: 12, expected: '100' },
  ])('formata $value com saída de $bits bits', ({ value, bits, expected }) => {
    expect(formatHex(value, bits)).toBe(expected);
  });

  it('formata bytes com dois dígitos e letras maiúsculas', () => {
    expect(formatByte(0)).toBe('00');
    expect(formatByte(10)).toBe('0A');
    expect(formatByte(255)).toBe('FF');
  });
});
