import type { Matrix } from '../../types/keccak';
import { formatByte } from '../../utils/format';

export default function MatrixView({
  matrix,
  activeStep,
  changedCells,
}: {
  matrix: Matrix;
  activeStep: number;
  changedCells: Set<string>;
}) {
  return (
    <div className="matrix-frame">
      <div className="matrix-axis-label">x →</div>
      <div className="matrix-column-labels" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
      <div className="matrix-row-labels" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((y) => (
          <span key={y}>{y}</span>
        ))}
      </div>
      <div className="state-grid" aria-label="Estado interno em matriz 5 por 5">
        {matrix.flatMap((row: number[], y: number) =>
          row.map((value: number, x: number) => {
            const key = `${x},${y}`;
            const isChanged = activeStep > 0 && changedCells.has(key);
            return (
              <div
                className={`state-cell ${isChanged ? 'changed' : ''}`}
                key={key}
                title={`Posição [${x},${y}]: ${formatByte(value)}${isChanged ? ' · célula alterada' : ''}`}
              >
                <strong>{formatByte(value)}</strong>
                <span className="cell-binary">{value.toString(2).padStart(8, '0')}</span>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
