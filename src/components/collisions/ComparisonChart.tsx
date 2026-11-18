import { scaleLog } from 'd3';
import type { ComparisonEntry } from '../../types/experiments';

export default function ComparisonChart({comparison}: {comparison:ComparisonEntry[]}) {
  const max=Math.max(...comparison.flatMap(entry=>[entry.maxIterations,entry.expected]),1);
  const height=scaleLog().base(2).domain([1,max]).range([0,165]);
  return (
    <>
      <div className="comparison-chart">
        <svg viewBox="0 0 800 280" role="img" aria-label="Gráfico comparando passos por tamanho de saída">
          <text className="bar-label" x="60" y="24">passos · escala log₂</text>
          {[1,16,256,4096].filter(value=>value<=max).map(value=><g key={value}><path className="chart-grid" d={'M60 '+(225-height(value))+'H760'}/><text className="bar-label" x="52" y={229-height(value)} textAnchor="end">{value}</text></g>)}
          {comparison.map((entry,i)=>{
            const x=140+i*230;
            return <g key={entry.bits}>
              <rect className="bar-expected" x={x-50} y={225-height(entry.expected)} width="100" height={height(entry.expected)} rx="2"/>
              <rect className="bar-actual" x={x-50} y={225-height(entry.iterations)} width="100" height={height(entry.iterations)} rx="2"/>
              <path className="bar-range" d={'M'+x+' '+(225-height(entry.minIterations))+'V'+(225-height(entry.maxIterations))+'M'+(x-7)+' '+(225-height(entry.maxIterations))+'H'+(x+7)}/>
              <text className="bar-label" x={x} y="251" textAnchor="middle">{entry.bits} bits</text>
              <text className="bar-value" x={x} y={Math.max(22,215-height(entry.maxIterations))} textAnchor="middle">{Math.round(entry.iterations)}</text>
            </g>;
          })}
        </svg>
      </div>
      <div className="comparison-legend"><span><i className="legend-dot actual"/>média de passos</span><span><i className="legend-dot expected"/>referência 2ⁿ/²</span><span>traço escuro: mínimo a máximo</span></div>
    </>
  );
}
