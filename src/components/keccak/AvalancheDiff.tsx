import { useMemo } from 'react';
import { KECCAK_STEPS } from '../../constants/keccak';
import { usePersistentToggle } from '../../hooks/usePersistentToggle';
import CardToggle from '../ui/CardToggle';
import {
  formatPercent,
  getDefaultAvalancheProfile,
  TOTAL_STATE_BITS,
} from '../../lib/avalancheView';
import { countBits, getAvalancheDiff, type StepMode } from '../../lib/keccak';

interface AvalancheDiffProps {
  round: number;
  step: number;
  mode?: StepMode;
}

const BITS = [0, 1, 2, 3, 4, 5, 6, 7];

/** Bit-level difference between the two executions at the selected round and step. */
export default function AvalancheDiff({ round, step, mode = 'sequential' }: AvalancheDiffProps) {
  const profile = getDefaultAvalancheProfile();
  const [collapsed, toggle] = usePersistentToggle('keccaklab:avalanche-collapsed');
  const diff = useMemo(
    () => getAvalancheDiff(profile, round, step, mode),
    [profile, round, step, mode],
  );
  const diffBits = countBits(diff);
  const stepCounts = useMemo(
    () =>
      mode === 'sequential'
        ? profile.counts[round]
        : KECCAK_STEPS.map((_, index) => countBits(getAvalancheDiff(profile, round, index, mode))),
    [profile, round, mode],
  );

  return (
    <section
      className={`avalanche-diff ${collapsed ? 'collapsed' : ''}`}
      aria-labelledby="avalanche-diff-title"
    >
      <div className="avalanche-diff-head">
        <h3 id="avalanche-diff-title">Efeito avalanche</h3>
        <span>
          R{round} · {KECCAK_STEPS[step].label}
          {mode === 'isolated' && step > 0 ? ' isolado' : ''}
        </span>
        <CardToggle
          collapsed={collapsed}
          label="efeito avalanche"
          controls="avalanche-body"
          onToggle={toggle}
        />
      </div>
      <div className="avalanche-count" aria-live="polite">
        <strong>{diffBits}</strong> de {TOTAL_STATE_BITS} bits diferentes{' '}
        <span>({formatPercent(diffBits)})</span>
      </div>
      {!collapsed && (
        <div className="card-body" id="avalanche-body">
          <div
            className="diff-grid"
            aria-label="Bits que diferem entre as duas execuções, matriz 5 por 5"
          >
            {diff.flatMap((row, y) =>
              row.map((value, x) => (
                <div
                  className="diff-cell"
                  key={`${x},${y}`}
                  title={`A[${x},${y}]: ${value.toString(2).padStart(8, '0')} (XOR)`}
                >
                  <div className="diff-bits">
                    {BITS.map((i) => {
                      const bit = 7 - i; /* most significant first, as in the state matrix */
                      return <i key={bit} className={(value >> bit) & 1 ? 'on' : ''} />;
                    })}
                  </div>
                </div>
              )),
            )}
          </div>
          <div
            className="round-strip"
            aria-label={`Bits diferentes em cada etapa da rodada ${round}`}
          >
            {KECCAK_STEPS.map(({ symbol, label }, index) => (
              <div
                className={`round-strip-item ${index === step ? 'selected' : ''}`}
                key={label}
                title={label}
              >
                <span>{symbol}</span>
                <strong>{stepCounts[index]}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
