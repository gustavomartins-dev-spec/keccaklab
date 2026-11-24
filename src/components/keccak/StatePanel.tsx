import { KECCAK_STEPS, LAST_KECCAK_ROUND, LAST_KECCAK_STEP } from '../../constants/keccak';
import type { Matrix } from '../../types/keccak';
import Icon from '../ui/Icon';
import MatrixView from './MatrixView';

interface StatePanelProps {
  round: number;
  step: number;
  matrix: Matrix;
  hexState: string;
  changedCells: Set<string>;
  isPlaying: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelectStep: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function StatePanel({
  round,
  step,
  matrix,
  hexState,
  changedCells,
  isPlaying,
  isFirst,
  isLast,
  onSelectStep,
  onNext,
  onPrevious,
}: StatePanelProps) {
  return (
    <div className="state-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">
            <Icon name="grid" size={19} />
          </span>
          <div>
            <h3>Matriz do estado</h3>
            <span className="panel-subtitle">5 × 5 lanes · 8 bits por célula</span>
          </div>
        </div>
        <span className="round-tag">
          R{round} · A<sub>{step}</sub>
          <span />
          200 bits
        </span>
      </div>
      <MatrixView matrix={matrix} activeStep={step} changedCells={changedCells} />
      <div className="matrix-footer">
        <div className="legend">
          <span>
            <i className="legend-dot stable" /> Sem mudança
          </span>
          <span>
            <i className="legend-dot changed" /> Célula alterada
          </span>
        </div>
        <span className="matrix-format">HEX / BIN</span>
      </div>
      <div className="state-output">
        <span>ESTADO EM HEXADECIMAL</span>
        <code title={`0x${hexState}`}>0x{hexState}</code>
      </div>
      {round === LAST_KECCAK_ROUND && step === LAST_KECCAK_STEP && (
        <p className="final-output-note" role="status">
          <Icon name="check" size={16} />
          Fim da rodada {LAST_KECCAK_ROUND}: este é o resultado completo de Keccak-f[200] sobre a
          matriz inicial.
        </p>
      )}
      <div className="player-controls">
        <button
          className="icon-button"
          onClick={() => onSelectStep(0)}
          disabled={step === 0 && !isPlaying}
          aria-label="Reiniciar rodada"
          title="Reiniciar rodada"
        >
          <Icon name="reset" size={17} />
        </button>
        <div className="player-step" aria-live="polite">
          <strong>{KECCAK_STEPS[step].label}</strong>
          <span>
            Rodada {round} · etapa {step} de {LAST_KECCAK_STEP}
          </span>
        </div>
        <div className="player-arrows">
          <button
            className="icon-button"
            onClick={onPrevious}
            disabled={isFirst}
            aria-label="Etapa anterior"
          >
            <Icon name="arrow-left" size={17} />
          </button>
          <button
            className="icon-button"
            onClick={onNext}
            disabled={isLast}
            aria-label="Próxima etapa"
          >
            <Icon name="arrow-right" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
