import { useEffect, useId, useMemo, useState } from 'react';
import { line, path as createPath } from 'd3';
import { buildRhoVisualization, canonicalIndex } from '../../lib/rhoVisualization';
import type { OutputBits, RhoNode, RhoResult } from '../../types/experiments';
import { formatHex } from '../../utils/format';

interface CollisionChartProps { result: RhoResult; bits: OutputBits }
interface PositionedNode extends RhoNode { x: number; y: number }

export default function CollisionChart({result,bits}: CollisionChartProps) {
  const markerId = useId().replace(/:/g,'');
  const visualization = useMemo(() => buildRhoVisualization(result),[result]);
  const [frameIndex,setFrameIndex] = useState(0);
  const [playing,setPlaying] = useState(false);
  useEffect(() => {setFrameIndex(0);setPlaying(false);},[result]);
  useEffect(() => {
    if (!playing) return;
    if (frameIndex >= visualization.frames.length-1) {setPlaying(false);return;}
    const timer=window.setTimeout(()=>setFrameIndex(index=>index+1),650);
    return ()=>window.clearTimeout(timer);
  },[playing,frameIndex,visualization.frames.length]);
  const frame=visualization.frames[frameIndex];
  const tail=visualization.nodes.filter(node=>node.group==='tail');
  const cycle=visualization.nodes.filter(node=>node.group==='cycle');
  const nodes: PositionedNode[] = [
    ...tail.map((node,i)=>({...node,x:45+i*(290/Math.max(tail.length,1)),y:220})),
    ...cycle.map((node,i)=>{
      const angle=Math.PI+i*2*Math.PI/cycle.length;
      return {...node,x:510+175*Math.cos(angle),y:220+175*Math.sin(angle)};
    }),
  ];
  const findPointer = (index: number): PositionedNode | undefined => {
    const canonical=canonicalIndex(index,result);
    return nodes.find(node=>node.index===canonical) ?? nodes.find(node=>node.index===null && node.group===(canonical<result.cycleStart ? 'tail' : 'cycle'));
  };
  const tortoise=frame ? findPointer(frame.step) : undefined;
  const hare=frame ? findPointer(frame.step*2) : undefined;
  const path=line<[number,number]>();
  const edges=nodes.flatMap((node,i)=>{
    const target=node.group==='tail' ? nodes[i+1] : nodes[i+1]?.group==='cycle' ? nodes[i+1] : nodes.find(candidate=>candidate.index===result.cycleStart);
    if(!target) return [];
    let d: string | null;
    if(node===target) d='M '+(node.x+8)+' '+(node.y-13)+' C '+(node.x+85)+' '+(node.y-95)+' '+(node.x-85)+' '+(node.y-95)+' '+(node.x-8)+' '+(node.y-13);
    else if(node.group==='cycle') {
      const angle=Math.atan2(node.y-220,node.x-510);
      const shape=createPath();
      shape.arc(510,220,175,angle+18/175,angle+2*Math.PI/cycle.length-22/175);
      d=shape.toString();
    } else {
      const distance=Math.hypot(target.x-node.x,target.y-node.y);
      const dx=(target.x-node.x)/distance;
      const dy=(target.y-node.y)/distance;
      const targetPadding=target.group==='tail' ? 16 : 20;
      d=path([[node.x+13*dx,node.y+13*dy],[target.x-targetPadding*dx,target.y-targetPadding*dy]]);
    }
    return [<path key={node.id} className={'rho-edge '+node.group} d={d ?? ''} markerEnd={'url(#'+markerId+')'}/>];
  });
  return (
    <div className="rho-visual">
      <div className="panel-header">
        <div><span className="panel-label">POLLARD RHO · DETECÇÃO COM FLOYD</span><h3>Cauda + ciclo</h3></div>
        <span className="round-tag">saída {bits} bits</span>
      </div>
      <div className="rho-graph-scroll" role="region" aria-label="Diagrama de cauda e ciclo; deslize para explorar" tabIndex={0}>
        <svg className="rho-graph" viewBox="0 0 760 450" role="img" aria-label="Trajetória rho com cauda, ciclo e ponteiros de Floyd">
          <title>Cauda com {result.cycleStart} estados e ciclo com {result.cycleLength} estados</title>
          <defs><marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>
          <text x="40" y="30" className="rho-region-label">CAUDA · μ = {result.cycleStart}</text>
          <text x="410" y="30" className="rho-region-label">CICLO · λ = {result.cycleLength}</text>
          {edges}
          {nodes.map(node=>(
            <g key={node.id} className={'rho-node '+node.group+(node.index===result.cycleStart ? ' entry' : '')}>
              <circle cx={node.x} cy={node.y} r={node.group==='tail' ? 11 : node.omitted ? 17 : 15}/>
              <text x={node.x} y={node.y+4} textAnchor="middle">{node.omitted ? '…' : node.index===result.cycleStart ? 'μ' : node.group==='cycle' ? node.index!-result.cycleStart : node.index}</text>
              <title>{node.omitted ? node.omitted+' estados omitidos' : 'x'+node.index+' = 0x'+formatHex(node.value!,bits)}</title>
            </g>
          ))}
          {tortoise && <g className="floyd-pointer tortoise"><rect x={tortoise.x-9} y={tortoise.y-37} width="18" height="18" rx="3"/><text x={tortoise.x} y={tortoise.y-24} textAnchor="middle">T</text></g>}
          {hare && <g className="floyd-pointer hare"><circle cx={hare.x} cy={hare.y+29} r="10"/><text x={hare.x} y={hare.y+33} textAnchor="middle">L</text></g>}
        </svg>
      </div>
      <div className="chart-legend"><span><i className="legend-dot path"/>cauda</span><span><i className="legend-dot cycle"/>ciclo</span><span>□ T: tartaruga, 1 passo</span><span>○ L: lebre, 2 passos</span></div>
      <div className="floyd-playback">
        <div className="floyd-buttons">
          <button className="secondary-button" onClick={()=>{setPlaying(false);setFrameIndex(index=>Math.max(0,index-1));}} disabled={frameIndex===0} aria-label="Passo anterior de Floyd">←</button>
          <button className="primary-button" onClick={()=>{if(frameIndex===visualization.frames.length-1)setFrameIndex(0);setPlaying(value=>!value);}}>{playing ? 'Pausar Floyd' : 'Reproduzir Floyd'}</button>
          <button className="secondary-button" onClick={()=>{setPlaying(false);setFrameIndex(index=>Math.min(visualization.frames.length-1,index+1));}} disabled={frameIndex===visualization.frames.length-1} aria-label="Próximo passo de Floyd">→</button>
        </div>
        {frame && <p className="floyd-state" aria-live="polite">Passo {frame.step}: T = 0x{formatHex(frame.tortoise,bits)} · L = 0x{formatHex(frame.hare,bits)}{frame.tortoise===frame.hare ? ' · encontro dos ponteiros' : ''}</p>}
        <p className="control-description">O encontro detecta o ciclo. A colisão é recuperada depois, pelas duas entradas distintas que chegam à entrada do ciclo.</p>
        {visualization.condensed && <p className="control-description">Trajetória resumida: “…” indica estados omitidos. A reprodução mostra até 48 passos iniciais e salta para o encontro final. Ponteiros sobre “…” podem representar estados distintos desse trecho.</p>}
      </div>
      <div className="collision-proof" aria-label="Verificação da colisão">
        <strong>Colisão verificada: a ≠ b e h(a) = h(b)</strong>
        <code>a = 0x{formatHex(result.collisionInputs[0],bits)}</code>
        <code>b = 0x{formatHex(result.collisionInputs[1],bits)}</code>
        <code>h(a) = h(b) = 0x{formatHex(result.collisionValue,bits)}</code>
        <small>Os nós do ciclo são numerados a partir de μ. Explore cada nó para ver seu índice na trajetória e seu valor. No celular, deslize o diagrama para explorar.</small>
      </div>
    </div>
  );
}
