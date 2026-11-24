import { useEffect, useId, useMemo, useState } from 'react';
import { line, path as createPath } from 'd3';
import { buildRhoVisualization, canonicalIndex } from '../../lib/rhoVisualization';
import type { RhoNode, RhoResult } from '../../types/experiments';
import { useSvgScale } from '../../hooks/useSvgScale';
import Icon from '../ui/Icon';
import { formatHex } from '../../utils/format';

interface CollisionChartProps { result: RhoResult }
interface PositionedNode extends RhoNode { x: number; y: number }

export default function CollisionChart({result}: CollisionChartProps) {
  const bits = result.bits;
  const markerId = useId().replace(/[^a-zA-Z0-9_-]/g,'');
  const [selected, setSelected] = useState<RhoNode | null>(null);
  const [svgRef, svgScale] = useSvgScale(760, 450);
  const visualization = useMemo(() => buildRhoVisualization(result),[result]);
  const [frameIndex,setFrameIndex] = useState(0);
  const [playing,setPlaying] = useState(false);
  useEffect(() => {setFrameIndex(0);setPlaying(false);setSelected(null);},[result]);
  useEffect(() => {
    if (!playing) return;
    if (frameIndex >= visualization.frames.length-1) {setPlaying(false);return;}
    const timer=window.setTimeout(()=>setFrameIndex(index=>index+1),650);
    return ()=>window.clearTimeout(timer);
  },[playing,frameIndex,visualization.frames.length]);
  const frame=visualization.frames[frameIndex];
  const atEnd=frameIndex===visualization.frames.length-1;
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
    return [<path key={node.id} className={'rho-edge '+node.group} d={d ?? ''} markerEnd={'url(#'+markerId+'-'+node.group+')'}/>];
  });
  return (
    <div className="rho-visual">
      <div className="panel-header">
        <div><span className="panel-label">POLLARD RHO · DETECÇÃO COM FLOYD</span><h3>Cauda + ciclo</h3></div>
        <div className="chart-legend"><span><i className="legend-dot path"/>cauda</span><span><i className="legend-dot cycle"/>ciclo</span><span>□ T: tartaruga</span><span>○ L: lebre</span></div>
        <span className="round-tag">saída {bits} bits</span>
      </div>
      <div className="rho-graph-scroll" role="region" aria-label="Diagrama de cauda e ciclo; deslize para explorar" tabIndex={0}>
        <svg ref={svgRef} style={svgScale} className="rho-graph" viewBox="0 0 760 450" role="group" aria-label="Trajetória rho com cauda, ciclo e ponteiros de Floyd">
          <title>Cauda com {result.cycleStart} estados e ciclo com {result.cycleLength} estados</title>
          <defs>{(['tail','cycle'] as const).map(group => <marker key={group} id={markerId+'-'+group} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill={group==='tail' ? 'var(--accent)' : 'var(--accent-2)'}/></marker>)}</defs>
          <text x="40" y="30" className="rho-region-label">CAUDA · μ = {result.cycleStart}</text>
          <text x="410" y="30" className="rho-region-label">CICLO · λ = {result.cycleLength}</text>
          {edges}
          {nodes.map(node=>{
            const tag = node.index===result.cycleStart-1 ? 'a' : node.index===result.collisionIndex-1 ? 'b' : null;
            const isSelected = selected?.id===node.id;
            return <g key={node.id}
              className={'rho-node '+node.group+(node.index===result.cycleStart ? ' entry' : '')+(tag ? ' collision-input' : '')+(isSelected ? ' selected' : '')}
              tabIndex={node.omitted ? undefined : 0} role={node.omitted ? undefined : 'button'}
              aria-label={node.omitted ? undefined : 'Estado x'+node.index+(tag ? ', entrada '+tag+' da colisão' : '')}
              aria-pressed={node.omitted ? undefined : isSelected}
              onClick={()=>{if(!node.omitted)setSelected(node);}}
              onKeyDown={event=>{if(!node.omitted && (event.key==='Enter' || event.key===' ')){event.preventDefault();setSelected(node);}}}>
              <circle cx={node.x} cy={node.y} r={node.group==='tail' ? 13 : 17}/>
              {tag && <circle className="collision-ring" cx={node.x} cy={node.y} r={node.group==='tail' ? 18 : 22}/>}
              <text x={node.x} y={node.y+4} textAnchor="middle">{node.omitted ? '…' : tag ?? (node.index===result.cycleStart ? 'xμ' : node.group==='cycle' ? node.index!-result.cycleStart : node.index)}</text>
              <title>{node.omitted ? node.omitted+' estados omitidos' : 'x'+node.index+' = 0x'+formatHex(node.value!,bits)}</title>
            </g>;
          })}
          {tortoise && <g className="floyd-pointer tortoise"><rect x={tortoise.x-9} y={tortoise.y-37} width="18" height="18" rx="3"/><text x={tortoise.x} y={tortoise.y-24} textAnchor="middle">T</text></g>}
          {hare && <g className="floyd-pointer hare"><circle cx={hare.x} cy={hare.y+29} r="10"/><text x={hare.x} y={hare.y+33} textAnchor="middle">L</text></g>}
        </svg>
      </div>
      <p className="rho-selection" role="status">{selected?.value != null ? 'Estado x'+selected.index+' = 0x'+formatHex(selected.value,bits) : 'Selecione um nó por toque, clique ou teclado para consultar seu valor.'}</p>
      <div className="floyd-playback">
        <div className="floyd-buttons">
          <button className="icon-button" onClick={()=>{setPlaying(false);setFrameIndex(index=>Math.max(0,index-1));}} disabled={frameIndex===0} aria-label="Passo anterior de Floyd" title="Passo anterior">
            <Icon name="arrow-left" size={17}/>
          </button>
          <button className="primary-button" onClick={()=>{if(atEnd)setFrameIndex(0);setPlaying(value=>!value);}}>
            <Icon name={playing ? 'pause' : atEnd ? 'reset' : 'play'} size={16}/>
            {playing ? 'Pausar Floyd' : atEnd ? 'Reproduzir novamente' : 'Reproduzir Floyd'}
          </button>
          <button className="icon-button" onClick={()=>{setPlaying(false);setFrameIndex(index=>Math.min(visualization.frames.length-1,index+1));}} disabled={atEnd} aria-label="Próximo passo de Floyd" title="Próximo passo">
            <Icon name="arrow-right" size={17}/>
          </button>
        </div>
        {frame && <p className="floyd-state" aria-live="polite">Passo {frame.step}: T = 0x{formatHex(frame.tortoise,bits)} · L = 0x{formatHex(frame.hare,bits)}{frame.tortoise===frame.hare ? ' · encontro dos ponteiros' : ''}</p>}
        {visualization.condensed && <p className="control-description">Trajetória resumida: “…” indica estados omitidos. A reprodução mostra até 48 passos iniciais e salta para o encontro final. Ponteiros sobre “…” podem representar estados distintos desse trecho.</p>}
      </div>
    </div>
  );
}
