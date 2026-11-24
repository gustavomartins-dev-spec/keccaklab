import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getAvalancheProfile } from '../../lib/keccak';
import AvalanchePanel from './AvalanchePanel';

describe('AvalanchePanel', () => {
  it('mostra 1 bit diferente na entrada e 11 após θ', () => {
    const { rerender } = render(<AvalanchePanel round={0} step={0} onSelectRound={vi.fn()} />);
    expect(screen.getByText('1', { selector: '.avalanche-count strong' })).toBeInTheDocument();
    rerender(<AvalanchePanel round={0} step={1} onSelectRound={vi.fn()} />);
    expect(screen.getByText('11', { selector: '.avalanche-count strong' })).toBeInTheDocument();
  });

  it('seleciona a rodada ao clicar na barra e recalcula ao trocar o bit invertido', async () => {
    const user = userEvent.setup();
    const onSelectRound = vi.fn();
    render(<AvalanchePanel round={0} step={5} onSelectRound={onSelectRound} />);

    const bits = getAvalancheProfile({ x: 0, y: 0, bit: 0 }).counts[9][5];
    await user.click(screen.getByRole('button', { name: `Rodada 9: ${bits} de 200 bits diferentes` }));
    expect(onSelectRound).toHaveBeenCalledWith(9);

    await user.selectOptions(screen.getByLabelText('Lane x'), '3');
    await user.selectOptions(screen.getByLabelText('Bit'), '6');
    const other = getAvalancheProfile({ x: 3, y: 0, bit: 6 }).counts[9][5];
    expect(screen.getByRole('button', { name: `Rodada 9: ${other} de 200 bits diferentes` })).toBeInTheDocument();
    expect(screen.getByText(/A\[3,0\]:/)).toBeInTheDocument();
  });

  it('oferece a mesma série como tabela', () => {
    render(<AvalanchePanel round={0} step={0} onSelectRound={vi.fn()} />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(20);
  });
});
