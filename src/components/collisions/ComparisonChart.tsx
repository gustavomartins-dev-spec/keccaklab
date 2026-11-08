import type { ComparisonEntry } from '../../types/experiments';

interface ComparisonChartProps {
  comparison: ComparisonEntry[];
}

export default function ComparisonChart({ comparison }: ComparisonChartProps) {
  const maxComparisonIterations = Math.max(
    ...comparison.flatMap((entry) => [entry.iterations, entry.expected]),
    1,
  );

  return (
    <>
      <div className="comparison-chart">
        <div className="chart-axis">
          <span>iterações até colisão</span>
          <span>tamanho da saída →</span>
        </div>
        <svg
          viewBox="0 0 800 280"
          role="img"
          aria-label="Gráfico comparando iterações por tamanho de saída"
        >
          <path className="chart-grid" d="M60 40H760M60 100H760M60 160H760M60 220H760" />
          {comparison.map((entry, i) => {
            const barX = 120 + i * 230;
            const barWidth = 140;
            const barHeight = (entry.iterations / maxComparisonIterations) * 170;
            const barY = 230 - barHeight;
            const expectedHeight = (entry.expected / maxComparisonIterations) * 170;
            const expectedY = 230 - expectedHeight;
            return (
              <g key={`bar-${entry.bits}`}>
                <rect
                  className="bar-expected"
                  x={barX}
                  y={expectedY}
                  width={barWidth}
                  height={expectedHeight}
                  rx="2"
                />
                <rect
                  className="bar-actual"
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="2"
                />
                <text className="bar-label" x={barX + barWidth / 2} y="252" textAnchor="middle">
                  {entry.bits} bits
                </text>
                <text
                  className="bar-value"
                  x={barX + barWidth / 2}
                  y={barY - 8}
                  textAnchor="middle"
                >
                  {entry.iterations}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="comparison-legend">
        <span>
          <i className="legend-dot actual" /> iterações experimentais
        </span>
        <span>
          <i className="legend-dot expected" /> esperado teórico (2ⁿ/²)
        </span>
      </div>
    </>
  );
}
