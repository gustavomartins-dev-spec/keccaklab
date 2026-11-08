import { getRhoOffsets } from '../../../lib/keccak';

export default function RhoDiagram() {
  const offsets = getRhoOffsets();
  return (
    <div className="diagram rho-diagram">
      <span className="diagram-label">Tabela de deslocamentos r[x,y] = (x + 2y) mod 7</span>
      <div className="offset-grid">
        {offsets.map((row, y) =>
          row.map((offset, x) => (
            <div className="offset-cell" key={`${x}-${y}`}>
              <span className="offset-coord">
                [{x},{y}]
              </span>
              <strong>↻ {offset}</strong>
            </div>
          )),
        )}
      </div>
      <div className="diagram-note">
        Cada lane é rotacionada circularmente pelo valor indicado. Bits que saem de um lado reentram
        pelo outro.
      </div>
    </div>
  );
}
