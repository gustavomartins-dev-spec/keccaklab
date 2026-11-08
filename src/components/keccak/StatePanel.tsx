import { KECCAK_STEPS, LAST_KECCAK_STEP } from '../../constants/keccak';
import type { Matrix } from '../../types/keccak';
import Icon from '../ui/Icon';
import MatrixView from './MatrixView';

interface StatePanelProps {
  step: number;
  matrix: Matrix;
  hexState: string;
  changedCells: Set<string>;
  isPlaying: boolean;
  onSelectStep: (step: number) => void;
}

export default function StatePanel({
  step,
  matrix,
  hexState,
  changedCells,
  isPlaying,
  onSelectStep,
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
          A<sub>{step}</sub>
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
            Etapa {step} de {LAST_KECCAK_STEP}
          </span>
        </div>
        <div className="player-arrows">
          <button
            className="icon-button"
            onClick={() => onSelectStep(step - 1)}
            disabled={step === 0}
            aria-label="Etapa anterior"
          >
            <Icon name="arrow-left" size={17} />
          </button>
          <button
            className="icon-button"
            onClick={() => onSelectStep(step + 1)}
            disabled={step === LAST_KECCAK_STEP}
            aria-label="Próxima etapa"
          >
            <Icon name="arrow-right" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
