import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe,expect,it,vi } from 'vitest';
import { runPollardRho } from '../../lib/pollardRho';
import CollisionChart from './CollisionChart';

describe('visualização rho e reprodução de Floyd',()=>{
  it('controla avanço, retorno e reprodução de Floyd',()=>{
    vi.useFakeTimers();
    const result=runPollardRho(8);
    render(<CollisionChart result={result}/>);
    expect(screen.getByRole('group',{name:'Trajetória rho com cauda, ciclo e ponteiros de Floyd'})).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button',{name:'Reproduzir novamente'}));
    expect(screen.getByText(/Passo 1:/)).toBeInTheDocument();
  });
  it('identifica trechos omitidos e reinicia a animação com outro resultado',()=>{
    const first=runPollardRho(16);
    const {rerender}=render(<CollisionChart result={first}/>);
    expect(screen.getByText(/Trajetória resumida/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Próximo passo de Floyd'));
    rerender(<CollisionChart result={runPollardRho(4)}/>);
    expect(screen.getByText(/Passo 1:/)).toBeInTheDocument();
  });
  it('permite consultar a e b por clique e teclado e limpa a seleção ao trocar o resultado',()=>{
    const result=runPollardRho(8);
    const {rerender}=render(<CollisionChart result={result}/>);
    const a=screen.getByRole('button',{name:`Estado x${result.cycleStart-1}, entrada a da colisão`});
    const b=screen.getByRole('button',{name:`Estado x${result.collisionIndex-1}, entrada b da colisão`});
    expect(a).toHaveClass('collision-input');
    expect(b).toHaveClass('collision-input');
    fireEvent.click(a);
    expect(a).toHaveAttribute('aria-pressed','true');
    expect(screen.getByRole('status')).toHaveTextContent(`Estado x${result.cycleStart-1} = 0x`);
    fireEvent.keyDown(b,{key:' '});
    expect(b).toHaveAttribute('aria-pressed','true');
    expect(a).toHaveAttribute('aria-pressed','false');
    fireEvent.keyDown(a,{key:'Enter'});
    expect(a).toHaveAttribute('aria-pressed','true');
    rerender(<CollisionChart result={runPollardRho(4)}/>);
    expect(screen.getByRole('status')).toHaveTextContent('Selecione um nó');
  });
  it('destaca b mesmo quando ele também é a entrada de um ciclo unitário',()=>{
    const result={...runPollardRho(8),cycleStart:1,cycleLength:1,collisionIndex:2};
    render(<CollisionChart result={result}/>);
    expect(screen.getByRole('button',{name:'Estado x1, entrada b da colisão'})).toHaveClass('entry','collision-input');
  });

});
