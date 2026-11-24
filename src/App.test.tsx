import { StrictMode } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRecentRuns, saveExperimentRun } from './services/experimentRuns';
import { collisionFixture, comparisonFixture, createDeferred, createRun } from './test/fixtures';
import type { RunRecord } from './types/experiments';
import App from './App';

vi.mock('./services/experimentRuns', () => ({
  getRecentRuns: vi.fn(),
  saveExperimentRun: vi.fn(),
}));

vi.mock('./services/collisionRunner', () => ({
  startCollisionSearch: vi.fn((bits:number,seed:number) => ({promise:Promise.resolve({result:{...collisionFixture,bits,seed},elapsedMs:10}),cancel:vi.fn()})),
  startCollisionComparison: vi.fn(() => ({promise:Promise.resolve({result:comparisonFixture,elapsedMs:20}),cancel:vi.fn()})),
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
    // The grid remounts on every step to restart its animation, so it is queried each time.
    const matrix = () => screen.getByLabelText('Estado interno em matriz 5 por 5');
    const initialState = matrix().textContent;

    expect(screen.getByRole('heading', { name: 'Visualizar Keccak' })).toBeInTheDocument();
    expect(matrix().children).toHaveLength(25);
    expect(screen.getByRole('button', { name: 'Etapa anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    expect(
      screen.getByRole('heading', { name: 'Difusão por paridade de colunas' }),
    ).toBeInTheDocument();
    expect(matrix().textContent).not.toBe(initialState);
    expect(screen.getByRole('button', { name: 'Etapa anterior' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Etapa anterior' }));
    expect(matrix().textContent).toBe(initialState);
    await user.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    await user.click(screen.getByRole('button', { name: 'Reiniciar rodada' }));
    expect(screen.getByRole('heading', { name: 'Estado inicial' })).toBeInTheDocument();
    expect(matrix().textContent).toBe(initialState);
  });

  it('preserva a etapa selecionada ao navegar entre as telas', async () => {
    const user = renderApp();
    const steps = screen.getByLabelText('Etapas da rodada Keccak');
    await user.click(within(steps).getByRole('button', { name: /Theta/ }));
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    expect(
      screen.getByRole('heading', { name: 'Busca de colisões' }),
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

  it('abre a rodada escolhida na barra lateral a partir da tela de colisões', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    const rounds = screen.getByRole('group', { name: 'Rodadas de Keccak-f[200]' });
    await user.click(within(rounds).getByRole('button', { name: 'Rodada 5' }));

    expect(screen.getByRole('heading', { name: 'Visualizar Keccak' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Entrada da rodada 5' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Rodadas de Keccak-f[200]' })).getByRole('button', {
        name: 'Rodada 5',
      }),
    ).toHaveAttribute('aria-current', 'step');
  });

  it('recolhe a barra lateral e os painéis do inspetor, lembrando a escolha', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Recolher barra lateral' }));
    expect(screen.getByRole('button', { name: 'Expandir barra lateral' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    // A navegação continua acessível pelo nome, mesmo só com ícones.
    expect(screen.getByRole('button', { name: 'Busca de colisões' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Recolher painel de transformação' }));
    expect(screen.queryByRole('button', { name: 'Detalhes da transformação' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Estado inicial' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Recolher painel de efeito avalanche' }));
    expect(
      screen.queryByLabelText('Bits que diferem entre as duas execuções, matriz 5 por 5'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('1', { selector: '.avalanche-count strong' })).toBeInTheDocument();

    expect(window.localStorage.getItem('keccaklab:sidebar-collapsed')).toBe('1');
    expect(window.localStorage.getItem('keccaklab:transformation-collapsed')).toBe('1');
  });

  it('abre os detalhes da transformação e restaura o foco ao fechar', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    const trigger = screen.getByRole('button', { name: 'Detalhes da transformação' });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Difusão por paridade de colunas' });
    expect(within(dialog).getByText('1. Paridade de cada coluna C[x]')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('navega pelas 18 rodadas e atravessa a fronteira entre rodadas pelas setas', async () => {
    const user = userEvent.setup();
    render(<App />);

    const rounds = screen.getByRole('group', { name: 'Rodadas de Keccak-f[200]' });
    expect(within(rounds).getAllByRole('button')).toHaveLength(18);
    expect(screen.getByRole('button', { name: 'Rodada anterior' })).toBeDisabled();

    await user.click(within(rounds).getByRole('button', { name: 'Rodada 17' }));
    expect(within(rounds).getByRole('button', { name: 'Rodada 17' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: 'Próxima rodada' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Entrada da rodada 17' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Etapa anterior' }));
    expect(within(rounds).getByRole('button', { name: 'Rodada 16' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(
      screen.getByRole('heading', { name: 'Quebra de simetria com constante de rodada' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    for (let step = 1; step <= 5; step++) {
      await user.click(screen.getByRole('button', { name: 'Próxima etapa' }));
    }
    expect(screen.getByRole('button', { name: 'Próxima etapa' })).toBeDisabled();
    expect(screen.getByText(/resultado completo de Keccak-f\[200\]/)).toBeInTheDocument();
  });

  it('reproduz, pausa e reinicia uma rodada pelos controles da tela', () => {
    vi.useFakeTimers();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir rodada 0' }));
    act(() => vi.advanceTimersByTime(850));
    expect(
      screen.getByRole('heading', { name: 'Difusão por paridade de colunas' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar reprodução' }));
    act(() => vi.advanceTimersByTime(1700));
    expect(
      screen.getByRole('heading', { name: 'Difusão por paridade de colunas' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir rodada 0' }));
    for (let step = 2; step <= 5; step++) {
      act(() => vi.advanceTimersByTime(850));
    }
    // A reprodução para no fim da rodada; a seta seguinte leva à rodada 1.
    expect(screen.getByRole('button', { name: 'Próxima etapa' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir novamente' }));
    expect(screen.getByRole('heading', { name: 'Estado inicial' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausar reprodução' })).toBeInTheDocument();
  });

  it('executa e salva a configuração escolhida, bloqueia novas buscas durante a gravação e preserva o resultado ao navegar', async () => {
    const pending = createDeferred<RunRecord | null>();
    vi.mocked(saveExperimentRun).mockReturnValueOnce(pending.promise);
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    await user.click(screen.getByRole('button', { name: '16 bits' }));

    expect(screen.getByRole('button', { name: '16 bits' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('saída 8 bits')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Executar busca' }));

    expect(screen.getByText('saída 16 bits')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    expect(saveExperimentRun).toHaveBeenCalledExactlyOnceWith(16, expect.any(Object));
    await act(async () => {
      pending.resolve(createRun({ bits: 8 }));
    });

    expect(screen.getByRole('button', { name: 'Executar busca' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Visualizador Keccak' }));
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    expect(screen.getByText('saída 16 bits')).toBeInTheDocument();
  });

  it('compara as três saídas na tela derivada e a conserva ao trocar de tela', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    const views = screen.getByRole('navigation', { name: 'Telas da busca de colisões' });
    await user.click(within(views).getByRole('button', { name: 'Comparar tamanhos' }));
    expect(within(views).getByRole('button', { name: 'Comparar tamanhos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    // A tela de comparação não mostra o diagrama da busca única.
    expect(screen.queryByRole('button', { name: 'Executar busca' })).not.toBeInTheDocument();

    const chartName = 'Gráfico comparando comprimento de ρ por tamanho de saída';
    expect(screen.queryByRole('img', { name: chartName })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Executar comparação' }));

    const chart = screen.getByRole('img', { name: chartName });
    for (const label of ['8 bits', '16 bits', '24 bits']) {
      expect(within(chart).getByText(label)).toBeInTheDocument();
    }
    expect(saveExperimentRun).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Visualizador Keccak' }));
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    expect(screen.getByRole('img', { name: chartName })).toBeInTheDocument();

    await user.click(within(screen.getByRole('navigation', { name: 'Telas da busca de colisões' })).getByRole('button', { name: 'Busca única' }));
    expect(screen.getByLabelText('Verificação da colisão')).toHaveTextContent('a ≠ b');
  });

  it('explica o método num modal, fora da tela principal', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Busca de colisões' }));
    await user.click(screen.getByRole('button', { name: 'Como funciona' }));
    const dialog = screen.getByRole('dialog', { name: 'Como funciona a busca de colisões' });
    // Um tópico por vez: começa na função h e avança pelos botões, setas ou abas.
    expect(within(dialog).getByRole('heading', { name: 'A função h' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('heading', { name: 'Floyd: tartaruga e lebre' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Tópico anterior' })).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: 'Próximo tópico' }));
    expect(within(dialog).getByRole('heading', { name: 'Floyd: tartaruga e lebre' })).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('heading', { name: 'Como ler o diagrama' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /O nome/ }));
    expect(within(dialog).getByRole('button', { name: 'Próximo tópico' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
