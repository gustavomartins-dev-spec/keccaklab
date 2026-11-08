import type { Matrix } from '../../../types/keccak';
import { formatByte as toHex } from '../../../utils/format';

export default function ChiDiagram({ matrix }: { matrix: Matrix }) {
  const row = matrix[0];
  return (
    <div className="diagram chi-diagram">
      <span className="diagram-label">Exemplo com a linha y=0</span>
      <div className="chi-flow">
        {row.map((lane, x) => {
          const next = row[(x + 1) % 5];
          const after = row[(x + 2) % 5];
          const notNext = ~next & 0xff;
          const andResult = notNext & after;
          const result = lane ^ andResult;
          return (
            <div className="chi-lane-group" key={x}>
              <div className="chi-lane-row">
                <div className="chi-lane current">
                  <span>A[{x},0]</span>
                  <strong>{toHex(lane)}</strong>
                </div>
                <div className="chi-lane next">
                  <span>¬A[{(x + 1) % 5},0]</span>
                  <strong>{toHex(notNext)}</strong>
                </div>
                <div className="chi-lane after">
                  <span>A[{(x + 2) % 5},0]</span>
                  <strong>{toHex(after)}</strong>
                </div>
              </div>
              <div className="chi-ops">
                <span className="chi-op">NOT ∧ AND = {toHex(andResult)}</span>
                <span className="chi-op">XOR → {toHex(result)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="diagram-note">
        O AND atua como "condição": só coloca 1 onde a próxima lane tem 0 E a seguinte tem 1. Isso
        cria não-linearidade.
      </div>
    </div>
  );
}
