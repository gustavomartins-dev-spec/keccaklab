import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getAvalancheProfile } from '../../lib/keccak';
import AvalancheDiff from './AvalancheDiff';
import RoundRail from './RoundRail';

describe('RoundRail', () => {
  it('lista as 18 rodadas com os bits diferentes e seleciona a rodada clicada', async () => {
    const user = userEvent.setup();
    const onSelectRound = vi.fn();
    render(<RoundRail round={0} onSelectRound={onSelectRound} />);

    const rounds = screen.getByRole('group', { name: 'Rodadas de Keccak-f[200]' });
    expect(within(rounds).getAllByRole('button')).toHaveLength(18);
    const bits = getAvalancheProfile({ x: 0, y: 0, bit: 0 }).counts[9][5];
    const row = within(rounds).getByRole('button', { name: 'Rodada 9' });
    expect(row).toHaveAccessibleDescription(`${bits} de 200 bits diferentes`);

    await user.click(row);
    expect(onSelectRound).toHaveBeenCalledWith(9);
  });

  it('não oferece seletor do bit invertido', () => {
    render(<RoundRail round={0} onSelectRound={vi.fn()} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});

describe('AvalancheDiff', () => {
  it('mostra 1 bit diferente na entrada e 11 após θ', () => {
    const { rerender } = render(<AvalancheDiff round={0} step={0} />);
    expect(screen.getByText('1', { selector: '.avalanche-count strong' })).toBeInTheDocument();
    rerender(<AvalancheDiff round={0} step={1} />);
    expect(screen.getByText('11', { selector: '.avalanche-count strong' })).toBeInTheDocument();
  });
});
