export const formatHex = (value: number, bits: number): string =>
  value.toString(16).padStart(Math.ceil(bits / 4), '0');

export const formatByte = (value: number): string => formatHex(value, 8).toUpperCase();

/** Whole number in Brazilian format (1.234). */
export const formatCount = (value: number): string => Math.round(value).toLocaleString('pt-BR');
