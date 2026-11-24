import type { CSSProperties } from 'react';
import { LAST_KECCAK_ROUND, LAST_KECCAK_STEP } from '../../constants/keccak';
import { formatPercent, getDefaultAvalancheProfile, TOTAL_STATE_BITS } from '../../lib/avalancheView';
import { getRoundConstant } from '../../lib/keccak';
import { formatByte } from '../../utils/format';
import Icon from '../ui/Icon';

interface RoundRailProps {
  round: number;
  onSelectRound: (round: number) => void;
}

const barStyle = (bits: number): CSSProperties => ({ '--fill': `${(bits / TOTAL_STATE_BITS) * 100}%` }) as CSSProperties;

/**
 * Navigation through the 18 rounds of Keccak-f[200]. Each row also shows how many of the
 * 200 bits differ, after that round, from a run whose input has bit 0 of A[0,0] flipped.
 */
export default function RoundRail({ round, onSelectRound }: RoundRailProps) {
  const profile = getDefaultAvalancheProfile();
  const inputBits = profile.counts[0][0];

  return (
    <section className="round-rail" aria-labelledby="round-rail-title">
      <div className="rail-header">
        <div>
          <span className="panel-label" id="round-rail-title">RODADAS</span>
          <span
            className="rail-sub"
            title="Efeito avalanche: o Keccak roda de novo com 1 bit da entrada trocado (bit 0 de A[0,0]). Cada barra mostra quantos dos 200 bits ficaram diferentes ao fim da rodada; o ideal é ficar perto de 50%."
          >
            bits ≠ com 1 bit trocado <Icon name="info" size={12} />
          </span>
        </div>
        <div className="player-arrows">
          <button
            className="icon-button small"
            onClick={() => onSelectRound(round - 1)}
            disabled={round === 0}
            aria-label="Rodada anterior"
            title="Rodada anterior"
          >
            <Icon name="arrow-left" size={15} />
          </button>
          <span className="rail-current" aria-hidden="true">R{round}</span>
          <button
            className="icon-button small"
            onClick={() => onSelectRound(round + 1)}
            disabled={round === LAST_KECCAK_ROUND}
            aria-label="Próxima rodada"
            title="Próxima rodada"
          >
            <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </div>

      <div className="rail-row rail-input" style={barStyle(inputBits)}>
        <span className="rail-label">Ent</span>
        <span className="rail-bar" aria-hidden="true"><i /></span>
        <span className="rail-count">{inputBits}</span>
      </div>
      <div className="rail-list" role="group" aria-label="Rodadas de Keccak-f[200]">
        {profile.counts.map((steps, index) => {
          const bits = steps[LAST_KECCAK_STEP];
          const selected = index === round;
          return (
            <button
              key={index}
              className={`rail-row ${selected ? 'selected' : ''} ${index < round ? 'done' : ''}`}
              style={barStyle(bits)}
              aria-current={selected ? 'step' : undefined}
              aria-label={`Rodada ${index}`}
              aria-describedby={`rail-count-${index}`}
              title={`Após a rodada ${index}: ${bits} de 200 bits diferentes (${formatPercent(bits)})`}
              onClick={() => onSelectRound(index)}
            >
              <span className="rail-label">R{index}</span>
              <span className="rail-bar" aria-hidden="true"><i /></span>
              <span className="rail-count" id={`rail-count-${index}`}>
                {bits}<span className="sr-only"> de 200 bits diferentes</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="rail-footer">
        <span title="Metade dos 200 bits: o ideal para uma boa permutação"><i className="legend-line-dashed" /> 50% ideal</span>
        <span className="round-constant" title="Constante de rodada usada por ι">
          RC[{round}] = 0x{formatByte(getRoundConstant(round))}
        </span>
      </div>
    </section>
  );
}
