import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ComparisonChart from './ComparisonChart';
import type { OutputBits } from '../../types/experiments';

it('mantém barras separadas e visíveis ao incluir saídas de 32 bits', () => {
  const comparison = ([8,16,24,32] as OutputBits[]).map(bits => ({
    bits, trials: 5, iterations: 1.25 * 2 ** (bits/2),
    minIterations: 2 ** (bits/2), maxIterations: 2 * 2 ** (bits/2),
    evaluations: 5 * 2 ** (bits/2), expected: Math.sqrt(Math.PI/2) * 2 ** (bits/2),
  }));
  const {container} = render(<ComparisonChart comparison={comparison}/>);
  const svg = screen.getByRole('img');
  const width = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const expected = container.querySelectorAll('rect.bar-expected');
  const actual = container.querySelectorAll('rect.bar-actual');
  comparison.forEach((_, index) => {
    const expectedEnd = Number(expected[index].getAttribute('x')) + Number(expected[index].getAttribute('width'));
    const actualStart = Number(actual[index].getAttribute('x'));
    expect(expectedEnd).toBeLessThan(actualStart);
    expect(actualStart + Number(actual[index].getAttribute('width'))).toBeLessThan(width);
  });
  expect(screen.getByText('65536')).toBeInTheDocument();
  expect(screen.getByText('32 bits')).toBeInTheDocument();
});
