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
        <small>índice da primeira ocorrência</small>
      </div>
      <div className="metric-card">
        <span>COLISÃO</span>
        <strong>{formatHex(result.collisionValue, bits)}</strong>
        <small>valor repetido</small>
      </div>
      <div className="method-note">
        <span className="panel-label">REFERÊNCIA TEÓRICA</span>
        <p>
          Para saídas uniformes de n bits, o limite do aniversário estima a ordem de grandeza de
          avaliações até uma colisão em 2<sup>n/2</sup>.
        </p>
      </div>
    </div>
  );
}
