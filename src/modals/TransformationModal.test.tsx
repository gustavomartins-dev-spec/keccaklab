import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { STEP_DETAILS } from '../constants/keccakDetails';
import { getStateAtStep } from '../lib/keccak';
import TransformationModal from './TransformationModal';

describe('TransformationModal', () => {
  it.each([
    { step: 0, diagram: 'Estrutura do estado' },
    { step: 1, diagram: '1. Paridade de cada coluna C[x]' },
    { step: 2, diagram: 'Tabela de deslocamentos r[x,y] = (x + 2y) mod 7' },
    { step: 3, diagram: 'Mapeamento de posições: (x,y) → (y, (2x+3y) mod 5)' },
    { step: 4, diagram: 'Exemplo com a linha y=0' },
    { step: 5, diagram: 'Constante de rodada RC[0]' },
  ])('apresenta o conteúdo e o diagrama da etapa $step', ({ step, diagram }) => {
    const detail = STEP_DETAILS[step];
    render(
      <TransformationModal
        detail={detail}
        step={step}
        matrix={getStateAtStep(step)}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: detail.title });
    expect(within(dialog).getByText(diagram)).toBeInTheDocument();
    expect(
      within(dialog).getByText(detail.formula.replace(/\s+/g, ' '), { selector: 'code' }),
    ).toBeInTheDocument();
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(detail.steps.length);
  });
});
