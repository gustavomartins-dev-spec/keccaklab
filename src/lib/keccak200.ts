/** Keccak-f[200], 18 rounds. State byte x + 5*y is lane A[x,y]. */
export const KECCAK_ROUNDS = 18;
export const KECCAK_RATE_BYTES = 15;
export const KECCAK_CAPACITY_BITS = 80;
export const ROUND_CONSTANTS = [
  0x01, 0x82, 0x8a, 0x00, 0x8b, 0x01, 0x81, 0x09, 0x8a,
  0x88, 0x09, 0x0a, 0x8b, 0x8b, 0x89, 0x03, 0x02, 0x80,
] as const;
export const RHO_OFFSETS = [
  0, 1, 6, 4, 3,
  4, 4, 6, 7, 4,
  3, 2, 3, 1, 7,
  1, 5, 7, 5, 0,
  2, 2, 5, 0, 6,
] as const;

export const rotateByte = (value: number, shift: number): number =>
  ((value << shift) | (value >>> (8 - shift))) & 0xff;

export function theta(state: Uint8Array, columns = new Uint8Array(5)): void {
  for (let x = 0; x < 5; x++) {
    columns[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
  }
  for (let x = 0; x < 5; x++) {
    const d = columns[(x + 4) % 5] ^ rotateByte(columns[(x + 1) % 5], 1);
    for (let y = 0; y < 25; y += 5) state[y + x] ^= d;
  }
}

export function rho(state: Uint8Array): void {
  for (let i = 0; i < 25; i++) state[i] = rotateByte(state[i], RHO_OFFSETS[i]);
}

export function pi(state: Uint8Array, buffer = new Uint8Array(25)): void {
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) buffer[y + 5 * ((2 * x + 3 * y) % 5)] = state[x + 5 * y];
  }
  state.set(buffer);
}

export function chi(state: Uint8Array, buffer = new Uint8Array(25)): void {
  buffer.set(state);
  for (let y = 0; y < 25; y += 5) {
    for (let x = 0; x < 5; x++) {
      state[y + x] = buffer[y + x] ^ (~buffer[y + (x + 1) % 5] & buffer[y + (x + 2) % 5]);
    }
  }
}

export function iota(state: Uint8Array, round: number): void {
  if (!Number.isInteger(round) || round < 0 || round >= KECCAK_ROUNDS) {
    throw new RangeError('A rodada de Keccak-f[200] deve estar entre 0 e 17.');
  }
  state[0] ^= ROUND_CONSTANTS[round];
}

/** Scratch buffers are reused; the permutation uses a fixed amount of memory. */
export function createKeccakPermutation200(): (state: Uint8Array) => void {
  const columns = new Uint8Array(5);
  const buffer = new Uint8Array(25);
  return (state) => {
    if (state.length !== 25) throw new RangeError('O estado deve conter 25 bytes.');
    for (let round = 0; round < KECCAK_ROUNDS; round++) {
      theta(state, columns);
      rho(state);
      pi(state, buffer);
      chi(state, buffer);
      iota(state, round);
    }
  };
}

export function keccakF200(input: Uint8Array): Uint8Array {
  const state = new Uint8Array(input);
  createKeccakPermutation200()(state);
  return state;
}

/** Educational Keccak[r=120,c=80], pad10*1 (suffix 0x01), not standardized SHA-3. */
export function keccak200(message: Uint8Array, outputBytes = 5): Uint8Array {
  if (!Number.isInteger(outputBytes) || outputBytes < 1 || outputBytes > 1024) {
    throw new RangeError('O resumo deve conter entre 1 e 1024 bytes.');
  }
  const state = new Uint8Array(25);
  const permute = createKeccakPermutation200();
  let offset = 0;
  while (offset + KECCAK_RATE_BYTES <= message.length) {
    for (let i = 0; i < KECCAK_RATE_BYTES; i++) state[i] ^= message[offset + i];
    permute(state);
    offset += KECCAK_RATE_BYTES;
  }
  const remaining = message.length - offset;
  for (let i = 0; i < remaining; i++) state[i] ^= message[offset + i];
  state[remaining] ^= 0x01;
  state[KECCAK_RATE_BYTES - 1] ^= 0x80;
  permute(state);
  const digest = new Uint8Array(outputBytes);
  for (let written = 0; written < outputBytes; written += KECCAK_RATE_BYTES) {
    digest.set(state.subarray(0, Math.min(KECCAK_RATE_BYTES, outputBytes - written)), written);
    if (written + KECCAK_RATE_BYTES < outputBytes) permute(state);
  }
  return digest;
}

export function validateOutputBits(bits: number): void {
  if (!Number.isInteger(bits) || bits < 4 || bits > 40) {
    throw new RangeError('A saída deve ter um número inteiro de 4 a 40 bits.');
  }
}

/** Fixed-width little-endian encoding; Number arithmetic preserves all 40 bits. */
export function encodeState(value: number, bits: number): Uint8Array {
  validateOutputBits(bits);
  if (!Number.isSafeInteger(value) || value < 0 || value >= 2 ** bits) {
    throw new RangeError('A entrada deve caber no tamanho de saída selecionado.');
  }
  const bytes = new Uint8Array(Math.ceil(bits / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = value % 256;
    value = Math.floor(value / 256);
  }
  return bytes;
}

export function createTruncatedKeccak200(bits: number): (input: number) => number {
  validateOutputBits(bits);
  const state = new Uint8Array(25);
  const permute = createKeccakPermutation200();
  const inputBytes = Math.ceil(bits / 8);
  const domainSize = 2 ** bits;
  return (input) => {
    if (!Number.isSafeInteger(input) || input < 0 || input >= domainSize) {
      throw new RangeError('A entrada deve caber no tamanho de saída selecionado.');
    }
    state.fill(0);
    for (let i = 0; i < inputBytes; i++) {
      state[i] = input % 256;
      input = Math.floor(input / 256);
    }
    state[inputBytes] ^= 0x01;
    state[KECCAK_RATE_BYTES - 1] ^= 0x80;
    permute(state);
    let value = 0;
    for (let i = inputBytes - 1; i >= 0; i--) value = value * 256 + state[i];
    return value % domainSize;
  };
}
