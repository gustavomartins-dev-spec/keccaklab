import { scaleLog } from 'd3';
import type { ComparisonEntry } from '../../types/experiments';

export default function ComparisonChart({comparison}: {comparison:ComparisonEntry[]}) {
  const max=Math.max(...comparison.flatMap(entry=>[entry.maxIterations,entry.expected]),2);
  const height=scaleLog().base(2).domain([1,max]).range([0,165]);
  const chartWidth = Math.max(800, comparison.length * 180 + 100);
  const plotWidth = chartWidth - 100;
  const ticks = Array.from({length: Math.floor(Math.log2(max) / 4) + 1}, (_, k) => 16 ** k);
  return (
    <>
      <div className="comparison-chart">
        <svg viewBox={`0 0 ${chartWidth} 280`} style={{minWidth: chartWidth}} role="img" aria-label="Gráfico comparando comprimento de ρ por tamanho de saída">
          <text className="bar-label" x="60" y="24">comprimento de ρ (μ + λ) · escala log₂</text>
          {ticks.map(value=><g key={value}><path className="chart-grid" d={'M60 '+(225-height(value))+'H'+(chartWidth-40)}/><text className="bar-label" x="52" y={229-height(value)} textAnchor="end">{value}</text></g>)}
          {comparison.map((entry,i)=>{
            const x=60+(plotWidth/comparison.length)*(i+0.5);
            const actualX=x+28;
            return <g key={entry.bits}>
              <rect className="bar-expected" x={x-52} y={225-height(entry.expected)} width="48" height={height(entry.expected)} rx="2"/>
              <rect className="bar-actual" x={x+4} y={225-height(entry.iterations)} width="48" height={height(entry.iterations)} rx="2"/>
              <path className="bar-range" d={'M'+actualX+' '+(225-height(entry.minIterations))+'V'+(225-height(entry.maxIterations))+'M'+(actualX-7)+' '+(225-height(entry.maxIterations))+'H'+(actualX+7)}/>
              <text className="bar-label" x={x} y="251" textAnchor="middle">{entry.bits} bits</text>
              <text className="bar-value" x={actualX} y={Math.max(22,215-height(entry.maxIterations))} textAnchor="middle">{Math.round(entry.iterations)}</text>
            </g>;
          })}
        </svg>
      </div>
      <div className="comparison-legend"><span><i className="legend-dot actual"/>média de μ + λ</span><span><i className="legend-dot expected"/>esperado ≈ √(πN/2)</span><span>traço escuro: mínimo a máximo</span></div>
    </>
  );
}
