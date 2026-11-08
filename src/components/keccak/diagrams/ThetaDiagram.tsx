import { getColumnParities, getDValues } from '../../../lib/keccak';
import type { Matrix } from '../../../types/keccak';
import { formatByte as toHex } from '../../../utils/format';

export default function ThetaDiagram({ matrix }: { matrix: Matrix }) {
  const parities = getColumnParities(matrix);
  const dValues = getDValues(matrix);
  return (
    <div className="diagram theta-diagram">
      <div className="diagram-section">
        <span className="diagram-label">1. Paridade de cada coluna C[x]</span>
        <div className="parity-row">
          {parities.map((parity, x) => (
            <div className="parity-cell" key={x}>
              <span className="parity-index">C[{x}]</span>
              <strong>{toHex(parity)}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="diagram-arrow">↓</div>
      <div className="diagram-section">
        <span className="diagram-label">2. D[x] = C[x−1] ⊕ ROT(C[x+1], 1)</span>
        <div className="parity-row">
          {dValues.map((d, x) => (
            <div className="parity-cell d-cell" key={x}>
              <span className="parity-index">D[{x}]</span>
              <strong>{toHex(d)}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="diagram-arrow">↓</div>
      <div className="diagram-section">
        <span className="diagram-label">3. A′[x,y] = A[x,y] ⊕ D[x] aplicado a toda coluna</span>
        <div className="diagram-note">O mesmo D[x] é XORado com os 5 elementos da coluna x</div>
      </div>
    </div>
  );
}
