import { describe, expect, it } from 'vitest';
import { keccakF200 } from './keccak200';
import {
  getCellChanges,
  getChangedCellSet,
  getColumnParities,
  getDValues,
  getPiMap,
  getRoundConstant,
  getStateAtStep,
  matrixToHex,
} from './keccak';

describe('estado do visualizador Keccak', () => {
  it('mantém a entrada original isolada entre chamadas', () => {
    const matrix = getStateAtStep(0);
    expect(matrixToHex(matrix)).toBe('1fa3529c17882ed164b740f80b3671cd195ae293760dab48f0');

    matrix[0][0] = 0;
    matrix[1].fill(0);

    expect(getStateAtStep(0)[0][0]).toBe(0x1f);
    expect(getStateAtStep(0)[1]).toEqual([0x88, 0x2e, 0xd1, 0x64, 0xb7]);
  });

  it.each([0, 1, 2, 3, 4, 5])('preserva uma matriz de 25 bytes na etapa %i', (step) => {
    const matrix = getStateAtStep(step);
    expect(matrix).toHaveLength(5);
    matrix.forEach((row) => expect(row).toHaveLength(5));
    matrix.flat().forEach((value) => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(255);
    });
    expect(matrixToHex(matrix)).toMatch(/^[0-9a-f]{50}$/);
  });

  it('a rotação preserva a quantidade de bits ativos de cada lane', () => {
    const before = getStateAtStep(1).flat();
    const after = getStateAtStep(2).flat();
    const countBits = (value: number) => value.toString(2).replace(/0/g, '').length;
    expect(after.map(countBits)).toEqual(before.map(countBits));
  });

  it('a permutação conserva todos os valores, sem perder ou duplicar lanes', () => {
    const sortBytes = (values: number[]) => values.sort((a, b) => a - b);
    expect(sortBytes(getStateAtStep(3).flat())).toEqual(sortBytes(getStateAtStep(2).flat()));
  });

  it('não indica alterações antes da primeira transformação', () => {
    expect(getCellChanges(0)).toEqual([]);
    expect(getChangedCellSet(0)).toEqual(new Set());
  });

  it('aplica Iota apenas à lane A[0,0] com a primeira constante oficial', () => {
    expect(getCellChanges(5)).toEqual([{ x: 0, y: 0, before: getStateAtStep(4)[0][0], after: getStateAtStep(4)[0][0] ^ 1 }]);
  });

  it.each([1, 2, 3, 4, 5])(
    'localiza as alterações na etapa %i com coordenadas e valores corretos',
    (step) => {
      const before = getStateAtStep(step - 1);
      const after = getStateAtStep(step);
      const changes = getCellChanges(step);
      const positions = getChangedCellSet(step);

      expect(changes.length).toBeGreaterThan(0);
      expect(positions.size).toBe(changes.length);

      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          expect(positions.has(`${x},${y}`)).toBe(before[y][x] !== after[y][x]);
        }
      }
      for (const change of changes) {
        expect(change.before).toBe(before[change.y][change.x]);
        expect(change.after).toBe(after[change.y][change.x]);
      }
    },
  );
});

describe('operações auxiliares do Keccak', () => {
  const matrix = [
    [1, 0, 0, 0, 0],
    [2, 0, 0, 0, 0],
    [4, 0, 0, 0, 0],
    [8, 0, 0, 0, 0],
    [16, 0, 0, 0, 0],
  ];

  it('calcula a paridade e os valores de difusão das colunas vizinhas', () => {
    expect(getColumnParities(matrix)).toEqual([31, 0, 0, 0, 0]);
    expect(getDValues(matrix)).toEqual([0, 31, 0, 0, 62]);
  });

  it('mapeia as 25 posições para destinos únicos e dentro da matriz', () => {
    const mapping = getPiMap();
    expect(mapping).toHaveLength(25);
    expect(new Set(mapping.map(({ from }) => from.join(','))).size).toBe(25);
    expect(new Set(mapping.map(({ to }) => to.join(','))).size).toBe(25);
    for (const { to } of mapping) {
      to.forEach((coordinate) => {
        expect(coordinate).toBeGreaterThanOrEqual(0);
        expect(coordinate).toBeLessThan(5);
      });
    }
  });

  it('usa as 18 constantes oficiais de Keccak-f[200]', () => {
    expect(getRoundConstant(0)).toBe(0x01);
    expect(getRoundConstant(1)).toBe(0x82);
    expect(getRoundConstant(17)).toBe(0x80);
    expect(() => getRoundConstant(18)).toThrow(RangeError);
  });

  it('serializa os bytes com zeros à esquerda e na ordem das linhas', () => {
    expect(
      matrixToHex([
        [0, 15],
        [16, 255],
      ]),
    ).toBe('000f10ff');
  });
});

describe('rodadas do visualizador Keccak', () => {
  const flat = (round: number, step: number) => Uint8Array.from(getStateAtStep(step, round).flat());

  it('a saída da rodada 17 é Keccak-f[200] completo sobre a matriz inicial', () => {
    expect(flat(17, 5)).toEqual(keccakF200(flat(0, 0)));
  });

  it('a entrada de cada rodada é a saída da rodada anterior', () => {
    for (let round = 1; round < 18; round++) {
      expect(getStateAtStep(0, round)).toEqual(getStateAtStep(5, round - 1));
    }
  });

  it('aplica em ι a constante da rodada selecionada', () => {
    for (let round = 0; round < 18; round++) {
      const before = getStateAtStep(4, round)[0][0];
      expect(getStateAtStep(5, round)[0][0]).toBe(before ^ getRoundConstant(round));
    }
  });

  it('rejeita rodadas fora de 0 a 17 e protege o traço contra mutação', () => {
    expect(() => getStateAtStep(0, 18)).toThrow(RangeError);
    expect(() => getStateAtStep(0, -1)).toThrow(RangeError);
    const copy = getStateAtStep(3, 9);
    copy[0][0] ^= 0xff;
    expect(getStateAtStep(3, 9)[0][0]).not.toBe(copy[0][0]);
  });
});
