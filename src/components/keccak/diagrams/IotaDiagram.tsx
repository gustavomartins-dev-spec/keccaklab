import { getRoundConstant } from '../../../lib/keccak';
import { formatByte as toHex } from '../../../utils/format';

export default function IotaDiagram() {
  const rc = getRoundConstant(0);
  return (
    <div className="diagram iota-diagram">
      <span className="diagram-label">Constante de rodada RC[0]</span>
      <div className="iota-flow">
        <div className="iota-cell">
          <span className="iota-label">A[0,0] antes</span>
          <strong>?</strong>
        </div>
        <div className="iota-op">⊕</div>
        <div className="iota-cell rc-cell">
          <span className="iota-label">RC[0]</span>
          <strong>{toHex(rc)}</strong>
        </div>
        <div className="iota-op">=</div>
        <div className="iota-cell">
          <span className="iota-label">A[0,0] depois</span>
          <strong>?</strong>
        </div>
      </div>
      <div className="diagram-note">
        Apenas a lane (0,0) é modificada diretamente. As próximas rodadas propagam essa diferença
        pelo estado.
      </div>
      <div className="iota-constants">
        <span className="diagram-label">Próximas constantes:</span>
        <div className="rc-list">
          {[1, 2, 3, 4].map((round) => (
            <span className="rc-item" key={round}>
              RC[{round}] = {toHex(getRoundConstant(round))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
