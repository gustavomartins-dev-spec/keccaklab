import { KECCAK_ROUND_COUNT, LAST_KECCAK_ROUND } from '../../constants/keccak';
import { getRoundConstant } from '../../lib/keccak';
import { formatByte } from '../../utils/format';
import Icon from '../ui/Icon';

interface RoundNavigatorProps {
  round: number;
  onSelectRound: (round: number) => void;
}

const ROUNDS = Array.from({ length: KECCAK_ROUND_COUNT }, (_, round) => round);

export default function RoundNavigator({ round, onSelectRound }: RoundNavigatorProps) {
  return (
    <div className="round-navigator">
      <div className="round-navigator-header">
        <div>
          <span className="panel-label">RODADA ATUAL</span>
          <strong className="round-current">
            Rodada {round} <span>de 0 a {LAST_KECCAK_ROUND}</span>
          </strong>
        </div>
        <span className="round-constant" title="Constante de rodada usada por ι">
          RC[{round}] = 0x{formatByte(getRoundConstant(round))}
        </span>
        <div className="player-arrows">
          <button
            className="icon-button"
            onClick={() => onSelectRound(round - 1)}
            disabled={round === 0}
            aria-label="Rodada anterior"
            title="Rodada anterior"
          >
            <Icon name="arrow-left" size={17} />
          </button>
          <button
            className="icon-button"
            onClick={() => onSelectRound(round + 1)}
            disabled={round === LAST_KECCAK_ROUND}
            aria-label="Próxima rodada"
            title="Próxima rodada"
          >
            <Icon name="arrow-right" size={17} />
          </button>
        </div>
      </div>
      <div className="round-track" role="group" aria-label="Rodadas de Keccak-f[200]">
        {ROUNDS.map((index) => (
          <button
            key={index}
            className={`round-chip ${index === round ? 'selected' : ''} ${index < round ? 'done' : ''}`}
            aria-current={index === round ? 'step' : undefined}
            aria-label={`Rodada ${index}`}
            onClick={() => onSelectRound(index)}
          >
            {index}
          </button>
        ))}
      </div>
    </div>
  );
}
