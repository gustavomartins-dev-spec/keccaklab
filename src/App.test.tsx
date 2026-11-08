import { StrictMode } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRecentRuns, saveExperimentRun } from './services/experimentRuns';
import { createDeferred, createRun } from './test/fixtures';
import type { RunRecord } from './types/experiments';
import App from './App';

vi.mock('./services/experimentRuns', () => ({
  getRecentRuns: vi.fn(),
  saveExperimentRun: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(getRecentRuns).mockReset().mockResolvedValue([]);
  vi.mocked(saveExperimentRun)
    .mockReset()
    .mockResolvedValue(createRun({ bits: 8 }));
});

function renderApp() {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return user;
}

describe('fluxos do laboratório', () => {
  it('permite avançar, voltar e reiniciar a matriz pela interface', async () => {
    const user = renderApp();
    const matrix = screen.getByLabelText('Estado interno em matriz 5 por 5');
    const initialState = matrix.textContent;

    expect(screen.getByRole('heading', { name: 'Por dentro do Keccak.' })).toBeInTheDocument();
    expect(matrix.children).toHaveLength(25);
    expect(screen.getByRole('button', { name: 'Etapa anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    expect(
      screen.getByRole('heading', { name: 'Difusão por paridade de colunas' }),
    ).toBeInTheDocument();
    expect(matrix.textContent).not.toBe(initialState);
    expect(screen.getByRole('button', { name: 'Etapa anterior' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Etapa anterior' }));
    expect(matrix.textContent).toBe(initialState);
    await user.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    await user.click(screen.getByRole('button', { name: 'Reiniciar rodada' }));
    expect(screen.getByRole('heading', { name: 'Estado inicial' })).toBeInTheDocument();
    expect(matrix.textContent).toBe(initialState);
  });

  it('preserva a etapa selecionada ao navegar entre as telas', async () => {
    const user = renderApp();
    const steps = screen.getByLabelText('Etapas da rodada Keccak');
    await user.click(within(steps).getByRole('button', { name: /Theta/ }));
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    expect(
      screen.getByRole('heading', { name: 'Encontre o ponto de retorno.' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Visualizador Keccak' }));
    expect(
      screen.getByRole('heading', { name: 'Difusão por paridade de colunas' }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('Etapas da rodada Keccak')).getByRole('button', {
        name: /Theta/,
      }),
    ).toHaveAttribute('aria-current', 'step');
  });

  it('abre a etapa escolhida na barra lateral a partir da tela de colisões', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    await user.click(screen.getByRole('button', { name: /Chi/ }));

    expect(
      screen.getByRole('heading', { name: 'Substituição não-linear entre vizinhos' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Etapa da rodada' })).toHaveAttribute(
      'aria-valuenow',
      '4',
    );
  });

  it('abre os detalhes da transformação e restaura o foco ao fechar', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    const trigger = screen.getByRole('button', { name: 'Explorar esta transformação' });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Difusão por paridade de colunas' });
    expect(within(dialog).getByText('1. Paridade de cada coluna C[x]')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('reproduz, pausa e reinicia uma rodada pelos controles da tela', () => {
    vi.useFakeTimers();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir rodada' }));
    act(() => vi.advanceTimersByTime(850));
    expect(
      screen.getByRole('heading', { name: 'Difusão por paridade de colunas' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar reprodução' }));
    act(() => vi.advanceTimersByTime(1700));
    expect(
      screen.getByRole('heading', { name: 'Difusão por paridade de colunas' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir rodada' }));
    for (let step = 2; step <= 5; step++) {
      act(() => vi.advanceTimersByTime(850));
    }
    expect(screen.getByRole('button', { name: 'Próxima etapa' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir novamente' }));
    expect(screen.getByRole('heading', { name: 'Estado inicial' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausar reprodução' })).toBeInTheDocument();
  });

  it('executa a configuração escolhida, bloqueia novas buscas durante a gravação e mostra o histórico', async () => {
    const pending = createDeferred<RunRecord | null>();
    vi.mocked(saveExperimentRun).mockReturnValueOnce(pending.promise);
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    await user.click(screen.getByRole('button', { name: '8 bits' }));

    expect(screen.getByRole('button', { name: '8 bits' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('saída 6 bits')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Executar busca' }));

    expect(screen.getByText('saída 8 bits')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    await act(async () => {
      pending.resolve(createRun({ bits: 8 }));
    });

    expect(screen.getByRole('button', { name: 'Executar busca' })).toBeEnabled();
    expect(screen.getByText('2 passos')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Visualizador Keccak' }));
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    expect(screen.getByText('saída 8 bits')).toBeInTheDocument();
    expect(screen.getByText('2 passos')).toBeInTheDocument();
  });

  it('compara as três saídas e conserva a comparação ao trocar de tela', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    const chartName = 'Gráfico comparando iterações por tamanho de saída';
    expect(screen.queryByRole('img', { name: chartName })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Comparar tamanhos' }));

    const chart = screen.getByRole('img', { name: chartName });
    for (const label of ['4 bits', '6 bits', '8 bits']) {
      expect(within(chart).getByText(label)).toBeInTheDocument();
    }
    expect(saveExperimentRun).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Visualizador Keccak' }));
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    expect(screen.getByRole('img', { name: chartName })).toBeInTheDocument();
  });
});
