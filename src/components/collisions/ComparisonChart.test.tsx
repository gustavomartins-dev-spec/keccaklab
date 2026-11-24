import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import ComparisonChart from './ComparisonChart';
import type { OutputBits } from '../../types/experiments';

const entries = (sizes: OutputBits[]) =>
  sizes.map((bits) => ({
    bits, trials: 30, iterations: 1.25 * 2 ** (bits / 2),
    minIterations: 2 ** (bits / 2), maxIterations: 2 * 2 ** (bits / 2),
    evaluations: 5 * 2 ** (bits / 2), expected: Math.sqrt(Math.PI / 2) * 2 ** (bits / 2),
  }));

it('desenha uma barra por tamanho, crescendo com os bits, com a marca do valor esperado', () => {
  const { container } = render(<ComparisonChart comparison={entries([8, 16, 24, 32])} />);
  const chart = screen.getByRole('img', { name: /passos até repetir um valor/ });
  const widths = [...container.querySelectorAll<HTMLElement>('.steps-bar')].map((bar) => parseFloat(bar.style.width));
  expect(widths).toHaveLength(4);
  expect(widths.every((width, i) => i === 0 || width > widths[i - 1])).toBe(true);
  expect(widths.every((width) => width > 0 && width <= 100)).toBe(true);
  expect(container.querySelectorAll('.steps-expected')).toHaveLength(4);
  // Rótulos em linguagem simples: tamanho, valores possíveis, passos medidos e eixo em potências de 10.
  expect(within(chart).getByText('32 bits')).toBeInTheDocument();
  expect(within(chart).getByText('4.294.967.296 valores')).toBeInTheDocument();
  expect(within(chart).getByText('81.920 passos')).toBeInTheDocument();
  expect(within(chart).getByText('100 mil')).toBeInTheDocument();
  expect(chart).toHaveAccessibleName(/32 bits: 81\.920 passos em média, esperado 82\.137/);
});
