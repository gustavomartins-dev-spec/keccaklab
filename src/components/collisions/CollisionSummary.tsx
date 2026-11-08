import type { RhoResult } from '../../types/experiments';
import type { OutputBits } from '../../types/experiments';
import { formatHex } from '../../utils/format';

interface CollisionSummaryProps {
  result: RhoResult;
  bits: OutputBits;
}

export default function CollisionSummary({ result, bits }: CollisionSummaryProps) {
  return (
    <div className="rho-info">
      <div className="metric-card accent">
        <span>ITERAÇÕES</span>
        <strong>{result.points.length}</strong>
        <small>estados gerados</small>
      </div>
      <div className="metric-card">
        <span>INÍCIO DO CICLO</span>
        <strong>{result.cycleStart}</strong>
        <small>entrada do ciclo</small>
      </div>
      <div className="metric-card">
        <span>COLISÃO</span>
        <strong>{formatHex(result.collisionValue, bits)}</strong>
        <small>valor compartilhado</small>
      </div>
      <div className="method-note">
        <span className="panel-label">COMO LER</span>
        <p>
          O paradoxo do aniversário prevê colisões por volta de 2<sup>n/2</sup>. Reduzimos n para
          que o encontro apareça em poucos passos, sem perder a lógica do algoritmo.
        </p>
      </div>
    </div>
  );
}
