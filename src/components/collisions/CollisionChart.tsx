import type { RhoResult } from '../../types/experiments';
import type { OutputBits } from '../../types/experiments';
import { formatHex } from '../../utils/format';

interface CollisionChartProps {
  result: RhoResult;
  bits: OutputBits;
}

export default function CollisionChart({ result, bits }: CollisionChartProps) {
  const maxPoint = Math.max(...result.points, 1);

  return (
    <div className="rho-visual">
      <div className="panel-header">
        <div>
          <span className="panel-label">TRAJETÓRIA DO ESTADO</span>
          <h3>Comprimento do ciclo: {result.cycleLength} iterações</h3>
        </div>
        <span className="round-tag">saída {bits} bits</span>
      </div>
      <div className="cycle-chart">
        <div className="chart-axis">
          <span>valor do hash</span>
          <span>iterações →</span>
        </div>
        <svg viewBox="0 0 800 300" role="img" aria-label="Gráfico da trajetória até a colisão">
          <path className="chart-grid" d="M30 55H780M30 120H780M30 185H780M30 250H780" />
          {result.points.map((value: number, index: number) => {
            if (index === 0) return null;
            const x = 30 + (index / Math.max(result.points.length - 1, 1)) * 750;
            const y = 260 - (value / maxPoint) * 205;
            const previous = result.points[index - 1];
            const px = 30 + ((index - 1) / Math.max(result.points.length - 1, 1)) * 750;
            const py = 260 - (previous / maxPoint) * 205;
            return (
              <line
                key={`line-${index}`}
                className={index >= result.cycleStart ? 'chart-line cycle' : 'chart-line'}
                x1={px}
                y1={py}
                x2={x}
                y2={y}
              />
            );
          })}
          {result.points.map((value: number, index: number) => {
            const x = 30 + (index / Math.max(result.points.length - 1, 1)) * 750;
            const y = 260 - (value / maxPoint) * 205;
            const isCollision = index === result.collisionIndex || index === result.cycleStart;
            return (
              <circle
                key={`point-${index}`}
                className={isCollision ? 'chart-point collision' : 'chart-point'}
                cx={x}
                cy={y}
                r={isCollision ? 6 : 2.6}
              />
            );
          })}
        </svg>
        <div className="collision-callout">
          <span className="callout-line" />
          <div>
            <strong>colisão encontrada</strong>
            <small>
              x{result.cycleStart} = x{result.collisionIndex} ={' '}
              {formatHex(result.collisionValue, bits)}
            </small>
          </div>
        </div>
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-dot path" /> percurso
        </span>
        <span>
          <i className="legend-dot cycle" /> ciclo detectado
        </span>
      </div>
    </div>
  );
}
