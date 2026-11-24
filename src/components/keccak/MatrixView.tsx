import type { CSSProperties } from 'react';
import { getPiOrigin } from '../../lib/keccak';
import { RHO_OFFSETS, rotateByte } from '../../lib/keccak200';
import type { Matrix } from '../../types/keccak';
import { formatByte } from '../../utils/format';

/** Display order of the bits: most significant first, as in the binary text. */
const DISPLAY = [7, 6, 5, 4, 3, 2, 1, 0];

interface MatrixViewProps {
  matrix: Matrix;
  /** State the current step was applied to; the animation goes from it to `matrix`. */
  previous?: Matrix;
  activeStep: number;
  changedCells: Set<string>;
  /** Changing this key restarts the animation. */
  animationKey?: string;
}

interface CellAnimation {
  /** π: offset, in cells, from the origin of the lane to its new position. */
  move?: { dx: number; dy: number };
  /** ρ: rotation offset of the lane (bits slide this many positions to the left). */
  rotation?: number;
  /** θ, χ, ι: bits whose value changed (mask). */
  flips: number;
}

/**
 * Describes how a lane was produced by the step, so the view can animate it:
 * π moves whole lanes, ρ rotates bits inside a lane, and θ, χ and ι flip bits in place.
 */
export function describeCellAnimation(step: number, previous: Matrix, matrix: Matrix, x: number, y: number): CellAnimation {
  const value = matrix[y][x];
  if (step === 3) {
    const [ox, oy] = getPiOrigin(x, y);
    const moved = ox !== x || oy !== y;
    return { move: moved ? { dx: ox - x, dy: oy - y } : undefined, flips: value ^ previous[oy][ox] };
  }
  if (step === 2) {
    const offset = RHO_OFFSETS[x + 5 * y];
    return { rotation: offset === 0 ? undefined : offset, flips: value ^ rotateByte(previous[y][x], offset) };
  }
  return { flips: step === 0 ? 0 : value ^ previous[y][x] };
}

export default function MatrixView({ matrix, previous, activeStep, changedCells, animationKey }: MatrixViewProps) {
  const animate = activeStep > 0 && previous !== undefined;
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
      <div
        className={`state-grid ${animate ? 'animated' : ''}`}
        aria-label="Estado interno em matriz 5 por 5"
        key={animationKey}
        data-step={activeStep}
      >
        {matrix.flatMap((row: number[], y: number) =>
          row.map((value: number, x: number) => {
            const key = `${x},${y}`;
            const isChanged = activeStep > 0 && changedCells.has(key);
            const anim = animate ? describeCellAnimation(activeStep, previous, matrix, x, y) : { flips: 0 };
            const style = anim.move
              ? ({ '--dx': anim.move.dx, '--dy': anim.move.dy } as CSSProperties)
              : undefined;
            return (
              <div
                className={`state-cell ${isChanged ? 'changed' : ''} ${anim.move ? 'moving' : ''}`}
                key={key}
                style={style}
                title={`Posição [${x},${y}]: ${formatByte(value)}${isChanged ? ' · célula alterada' : ''}`}
              >
                <strong>{formatByte(value)}</strong>
                <span className="sr-only">{value.toString(2).padStart(8, '0')}</span>
                <span className="cell-binary" aria-hidden="true">
                  {DISPLAY.map((bit, d) => {
                    const flipped = (anim.flips >> bit) & 1;
                    /* Left rotation by r: the whole lane slides r positions like a conveyor
                       belt; the r rightmost bits are the ones that wrapped around and fade in. */
                    const r = anim.rotation;
                    const wrapped = r !== undefined && d >= 8 - r;
                    return (
                      <span
                        key={bit}
                        className={`bit ${flipped ? 'flip' : ''} ${r ? 'shift' : ''} ${wrapped ? 'wrapped' : ''}`}
                        style={r ? ({ '--shift': r } as CSSProperties) : undefined}
                      >
                        {(value >> bit) & 1}
                      </span>
                    );
                  })}
                </span>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
