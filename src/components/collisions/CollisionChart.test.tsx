import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe,expect,it,vi } from 'vitest';
import { runPollardRho } from '../../lib/pollardRho';
import CollisionChart from './CollisionChart';

describe('visualização rho e reprodução de Floyd',()=>{
  it('mostra a prova da colisão e controla avanço, retorno e reprodução',()=>{
    vi.useFakeTimers();
    const result=runPollardRho(8);
    render(<CollisionChart result={result} bits={8}/>);
    expect(screen.getByRole('img',{name:'Trajetória rho com cauda, ciclo e ponteiros de Floyd'})).toBeInTheDocument();
    expect(screen.getByLabelText('Verificação da colisão')).toHaveTextContent('a ≠ b');
    expect(screen.getByLabelText('Passo anterior de Floyd')).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Próximo passo de Floyd'));
    expect(screen.getByText(/Passo 2:/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Passo anterior de Floyd'));
    fireEvent.click(screen.getByText('Reproduzir Floyd'));
    act(()=>vi.advanceTimersByTime(650));
    expect(screen.getByText(/Passo 2:/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Pausar Floyd'));
    act(()=>vi.advanceTimersByTime(1300));
    expect(screen.getByText(/Passo 2:/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reproduzir Floyd'));
    for(let i=2;i<result.meetingStep;i++)act(()=>vi.advanceTimersByTime(650));
    expect(screen.getByText(/encontro dos ponteiros/)).toBeInTheDocument();
    expect(screen.getByLabelText('Próximo passo de Floyd')).toBeDisabled();
    fireEvent.click(screen.getByText('Reproduzir Floyd'));
    expect(screen.getByText(/Passo 1:/)).toBeInTheDocument();
  });
  it('identifica trechos omitidos e reinicia a animação com outro resultado',()=>{
    const first=runPollardRho(16);
    const {rerender}=render(<CollisionChart result={first} bits={16}/>);
    expect(screen.getByText(/Trajetória resumida/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Próximo passo de Floyd'));
    rerender(<CollisionChart result={runPollardRho(4)} bits={4}/>);
    expect(screen.getByText(/Passo 1:/)).toBeInTheDocument();
  });
});
