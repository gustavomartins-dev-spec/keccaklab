import type { CellChange, Matrix } from '../types/keccak';

const seedMatrix: Matrix = [
  [0x1f, 0xa3, 0x52, 0x9c, 0x17],
  [0x88, 0x2e, 0xd1, 0x64, 0xb7],
  [0x40, 0xf8, 0x0b, 0x36, 0x71],
  [0xcd, 0x19, 0x5a, 0xe2, 0x93],
  [0x76, 0x0d, 0xab, 0x48, 0xf0],
];

const clone = (matrix: Matrix): Matrix => matrix.map((row: number[]) => [...row]);
const byte = (value: number): number => value & 0xff;

const applyTheta = (input: Matrix): Matrix => {
  const columns = input[0].map((_, column) => input.reduce((sum, row) => sum ^ row[column], 0));
  return input.map((row, y) =>
    row.map((value, x) =>
      byte(value ^ columns[(x + 4) % 5] ^ ((columns[(x + 1) % 5] << 1) & 0xff) ^ y),
    ),
  );
};

const applyRho = (input: Matrix): Matrix =>
  input.map((row, y) =>
    row.map((value, x) =>
      byte((value << (x + 2 * y) % 7) | (value >> (8 - ((x + 2 * y) % 7 || 8)))),
    ),
  );
const applyPi = (input: Matrix): Matrix =>
  input.map((row, y) => row.map((_, x) => input[(2 * x + 3 * y) % 5][(x + 3 * y) % 5]));
const applyChi = (input: Matrix): Matrix =>
  input.map((row, y) =>
    row.map((value, x) => byte(value ^ (~input[y][(x + 1) % 5] & input[y][(x + 2) % 5]))),
  );
const applyIota = (input: Matrix): Matrix =>
  input.map((row, y) => row.map((value, x) => byte(value ^ ((0x9d + y * 31 + x * 17) & 0xff))));

export const getStateAtStep = (step: number): Matrix => {
  let state = clone(seedMatrix);
  if (step >= 1) state = applyTheta(state);
  if (step >= 2) state = applyRho(state);
  if (step >= 3) state = applyPi(state);
  if (step >= 4) state = applyChi(state);
  if (step >= 5) state = applyIota(state);
  return state;
};

export const matrixToHex = (matrix: Matrix): string =>
  matrix
    .flat()
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');

export const getCellChanges = (step: number): CellChange[] => {
  if (step === 0) return [];
  const before = getStateAtStep(step - 1);
  const after = getStateAtStep(step);
  const changes: CellChange[] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      if (before[y][x] !== after[y][x]) {
        changes.push({ x, y, before: before[y][x], after: after[y][x] });
      }
    }
  }
  return changes;
};

export const getChangedCellSet = (step: number): Set<string> => {
  const changes = getCellChanges(step);
  return new Set(changes.map((c) => `${c.x},${c.y}`));
};

export const getColumnParities = (matrix: Matrix): number[] =>
  matrix[0].map((_, column) => matrix.reduce((sum, row) => sum ^ row[column], 0));

export const getDValues = (matrix: Matrix): number[] => {
  const c = getColumnParities(matrix);
  return c.map((_, x) => byte(c[(x + 4) % 5] ^ ((c[(x + 1) % 5] << 1) & 0xff)));
};

export const getRhoOffsets = (): number[][] => {
  const offsets: number[][] = [];
  for (let y = 0; y < 5; y++) {
    const row: number[] = [];
    for (let x = 0; x < 5; x++) {
      row.push((x + 2 * y) % 7);
    }
    offsets.push(row);
  }
  return offsets;
};

export const getPiMap = (): Array<{ from: [number, number]; to: [number, number] }> => {
  const map: Array<{ from: [number, number]; to: [number, number] }> = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      map.push({ from: [x, y], to: [y, (2 * x + 3 * y) % 5] });
    }
  }
  return map;
};

export const getRoundConstant = (round: number): number => {
  const constants = [
    0x01, 0x82, 0x8a, 0x00, 0x8b, 0x01, 0x81, 0x80, 0x09, 0x08, 0x8a, 0x88, 0x09, 0x09, 0x8a, 0x08,
    0x81, 0x89, 0x81, 0x09, 0x8a, 0x88, 0x00, 0x8b,
  ];
  return constants[round % constants.length];
};
