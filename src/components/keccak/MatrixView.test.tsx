import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { applyStep, getStateAtStep, popcount8 } from '../../lib/keccak';
import { RHO_OFFSETS } from '../../lib/keccak200';
import MatrixView, { describeCellAnimation } from './MatrixView';

const input = getStateAtStep(0);

describe('animações da matriz (RF06)', () => {
  it('θ marca como invertidos exatamente os bits que mudaram', () => {
    const after = applyStep(input, 1);
    render(<MatrixView matrix={after} previous={input} activeStep={1} changedCells={new Set()} />);
    const grid = screen.getByLabelText('Estado interno em matriz 5 por 5');
    const expected = after.flat().reduce((sum, value, i) => sum + popcount8(value ^ input.flat()[i]), 0);
    expect(grid).toHaveClass('animated');
    expect(grid.querySelectorAll('.bit.flip')).toHaveLength(expected);
  });

  it('ρ desloca os bits sem invertê-los, conforme o offset da lane', () => {
    const after = applyStep(input, 2);
    for (let i = 0; i < 25; i++) {
      const anim = describeCellAnimation(2, input, after, i % 5, Math.floor(i / 5));
      expect(anim.flips).toBe(0);
      expect(anim.rotation).toBe(RHO_OFFSETS[i] === 0 ? undefined : RHO_OFFSETS[i]);
    }
  });

  it('ρ marca como "dando a volta" os r bits mais à direita', () => {
    const after = applyStep(input, 2);
    render(<MatrixView matrix={after} previous={input} activeStep={2} changedCells={new Set()} />);
    const cell = screen.getByLabelText('Estado interno em matriz 5 por 5').children[2]; // A[2,0], r = 6
    expect(cell.querySelectorAll('.bit.shift')).toHaveLength(8);
    expect(cell.querySelectorAll('.bit.wrapped')).toHaveLength(6);
  });

  it('π move as lanes a partir da origem, sem inverter bits', () => {
    const after = applyStep(input, 3);
    render(<MatrixView matrix={after} previous={input} activeStep={3} changedCells={new Set()} />);
    const grid = screen.getByLabelText('Estado interno em matriz 5 por 5');
    expect(grid.querySelectorAll('.bit.flip')).toHaveLength(0);
    expect(grid.querySelectorAll('.state-cell.moving')).toHaveLength(24); // A[0,0] fica no lugar
    expect(describeCellAnimation(3, input, after, 0, 2).move).toEqual({ dx: 1, dy: -2 });
  });

  it('não anima o estado de entrada', () => {
    render(<MatrixView matrix={input} previous={input} activeStep={0} changedCells={new Set()} />);
    expect(screen.getByLabelText('Estado interno em matriz 5 por 5')).not.toHaveClass('animated');
  });
});
