import { LAST_KECCAK_ROUND } from '../../../constants/keccak';
import { getRoundConstant } from '../../../lib/keccak';
import type { Matrix } from '../../../types/keccak';
import { formatByte as toHex } from '../../../utils/format';

export default function IotaDiagram({ matrix, round = 0 }: { matrix: Matrix; round?: number }) {
  const rc = getRoundConstant(round);
  const nextRounds = Array.from({ length: 4 }, (_, i) => round + 1 + i).filter(
    (next) => next <= LAST_KECCAK_ROUND,
  );
  return (
    <div className="diagram iota-diagram">
      <span className="diagram-label">Constante de rodada RC[{round}]</span>
      <div className="iota-flow">
        <div className="iota-cell">
          <span className="iota-label">A[0,0] antes</span>
          <strong>{toHex(matrix[0][0])}</strong>
        </div>
        <div className="iota-op">⊕</div>
        <div className="iota-cell rc-cell">
          <span className="iota-label">RC[{round}]</span>
          <strong>{toHex(rc)}</strong>
        </div>
        <div className="iota-op">=</div>
        <div className="iota-cell">
          <span className="iota-label">A[0,0] depois</span>
          <strong>{toHex(matrix[0][0] ^ rc)}</strong>
        </div>
      </div>
      <div className="diagram-note">
        Apenas a lane (0,0) é modificada diretamente. As próximas rodadas propagam essa diferença
        pelo estado.
      </div>
      {nextRounds.length > 0 ? (
        <div className="iota-constants">
          <span className="diagram-label">Próximas constantes:</span>
          <div className="rc-list">
            {nextRounds.map((next) => (
              <span className="rc-item" key={next}>
                RC[{next}] = {toHex(getRoundConstant(next))}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="diagram-note">Esta é a última constante: RC[17] encerra Keccak-f[200].</div>
      )}
    </div>
  );
}
