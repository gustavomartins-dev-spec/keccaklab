import type { CSSProperties } from 'react';
import type { ComparisonEntry } from '../../types/experiments';
import { formatCount } from '../../utils/format';

interface ComparisonChartProps {
  comparison: ComparisonEntry[];
}

/** Short tick label: 1, 10, 100, 1 mil, 10 mil, 100 mil, 1 mi… */
const tickLabel = (value: number): string =>
  value >= 1e6 ? `${value / 1e6} mi` : value >= 1e3 ? `${value / 1e3} mil` : String(value);

/**
 * Horizontal bars, one per output size: average number of steps until a value repeats,
 * on a base-10 log scale, with a marker for the value expected from theory.
 * Drawn in HTML so text keeps its real size at any width.
 */
export default function ComparisonChart({ comparison }: ComparisonChartProps) {
  const max = Math.max(...comparison.flatMap((entry) => [entry.iterations, entry.expected]), 10);
  const decades = Math.ceil(Math.log10(max * 1.15));
  const ticks = Array.from({ length: decades + 1 }, (_, k) => 10 ** k);
  const position = (value: number): string =>
    `${(Math.log10(Math.max(1, value)) / decades) * 100}%`;
  const summary = comparison
    .map(
      (entry) =>
        `${entry.bits} bits: ${formatCount(entry.iterations)} passos em média, esperado ${formatCount(entry.expected)}`,
    )
    .join('; ');

  return (
    <div className="steps-chart">
      <div
        className="steps-chart-plot"
        role="img"
        aria-label={`Gráfico: passos até repetir um valor, por tamanho de saída. ${summary}.`}
      >
        <div className="steps-axis" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} style={{ left: position(tick) }}>
              {tickLabel(tick)}
            </span>
          ))}
        </div>
        {comparison.map((entry) => {
          /* Long bars hold their value inside, short ones beside them. */
          const inside = Math.log10(Math.max(1, entry.iterations)) / decades > 0.3;
          return (
            <div className="steps-row" key={entry.bits}>
              <div className="steps-label">
                <strong>{entry.bits} bits</strong>
                <span>{formatCount(2 ** entry.bits)} valores</span>
              </div>
              <div className="steps-track" aria-hidden="true">
                {ticks.map((tick) => (
                  <i key={tick} className="steps-grid" style={{ left: position(tick) }} />
                ))}
                <div
                  className={`steps-bar ${inside ? 'inside' : ''}`}
                  style={{ width: position(entry.iterations) }}
                >
                  <span>{formatCount(entry.iterations)} passos</span>
                </div>
                <div
                  className="steps-expected"
                  style={{ left: position(entry.expected) } as CSSProperties}
                  title={`Esperado pela teoria: ≈ ${formatCount(entry.expected)} passos`}
                />
              </div>
            </div>
          );
        })}
        <div className="steps-axis-title" aria-hidden="true">
          passos até um valor se repetir (escala logarítmica: cada linha vale 10× a anterior)
        </div>
      </div>
      <div className="comparison-legend">
        <span>
          <i className="legend-dot actual" /> média medida
        </span>
        <span>
          <i className="legend-expected" /> esperado pela teoria
        </span>
      </div>
    </div>
  );
}
