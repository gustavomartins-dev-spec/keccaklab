import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

function ModalHarness({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir detalhes</button>
      {isOpen && (
        <Modal
          titleId="test-modal-title"
          header={<h2 id="test-modal-title">Detalhes de teste</h2>}
          onClose={() => {
            onClose();
            setIsOpen(false);
          }}
        >
          <p>Conteúdo da transformação</p>
          <label htmlFor="test-value">Valor</label>
          <input id="test-value" />
          <button disabled>Indisponível</button>
          <button>Confirmar</button>
        </Modal>
      )}
    </>
  );
}

async function openModal() {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const view = render(<ModalHarness onClose={onClose} />);
  await user.click(screen.getByRole('button', { name: 'Abrir detalhes' }));
  return { user, onClose, ...view };
}

describe('Modal', () => {
  it('associa o título ao diálogo, foca o fechamento e bloqueia a rolagem', async () => {
    await openModal();
    const dialog = screen.getByRole('dialog', { name: 'Detalhes de teste' });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('button', { name: 'Fechar' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('mantém o foco dentro do diálogo nos dois sentidos e ignora botões desabilitados', async () => {
    const { user } = await openModal();
    const closeButton = screen.getByRole('button', { name: 'Fechar' });

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Valor' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  it('fecha com Escape e devolve o foco ao botão que abriu o diálogo', async () => {
    const { user, onClose } = await openModal();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Abrir detalhes' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('fecha pelo botão de fechamento', async () => {
    const { user, onClose } = await openModal();
    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mantém o diálogo ao clicar no conteúdo e fecha ao clicar no fundo', async () => {
    const { user, onClose } = await openModal();
    await user.click(screen.getByText('Conteúdo da transformação'));
    expect(onClose).not.toHaveBeenCalled();

    const backdrop = screen.getByRole('dialog').parentElement!;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('restaura a configuração anterior de rolagem quando é desmontado', async () => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'scroll';
    const view = await openModal();

    try {
      view.unmount();
      expect(document.body.style.overflow).toBe('scroll');
    } finally {
      view.unmount();
      document.body.style.overflow = previousOverflow;
    }
  });
});
