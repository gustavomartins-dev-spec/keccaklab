import { useState } from 'react';
import { KECCAK_STEPS, LAST_KECCAK_ROUND, LAST_KECCAK_STEP } from '../../constants/keccak';
import type { StepMode } from '../../lib/keccak';
import type { Matrix } from '../../types/keccak';
import Icon from '../ui/Icon';
import MatrixView from './MatrixView';

interface StatePanelProps {
  round: number;
  step: number;
  matrix: Matrix;
  previousMatrix: Matrix;
  mode: StepMode;
  hexState: string;
  changedCells: Set<string>;
  isPlaying: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelectStep: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ANIMATION_CAPTIONS = [
  'Estado de entrada. Avance para ver cada transformação animada bit a bit.',
  'θ: os bits que piscam foram invertidos pelo XOR com a paridade das colunas vizinhas.',
  'ρ: os bits deslizam dentro de cada lane, rotacionados pelo deslocamento da posição (x, y).',
  'π: as lanes viajam da posição (x, y) para (y, 2x + 3y mod 5); os bits não mudam.',
  'χ: os bits que piscam foram invertidos por (¬b ∧ c), combinando lanes da mesma linha.',
  'ι: os bits que piscam na lane [0,0] são os bits 1 da constante de rodada.',
];

export default function StatePanel({
  round,
  step,
  matrix,
  previousMatrix,
  mode,
  hexState,
  changedCells,
  isPlaying,
  isFirst,
  isLast,
  onSelectStep,
  onNext,
  onPrevious,
}: StatePanelProps) {
  const [replay, setReplay] = useState(0);
  const isFinal = round === LAST_KECCAK_ROUND && step === LAST_KECCAK_STEP;
  return (
    <div className="state-panel">
      <div className="panel-header">
        <h3>Matriz do estado</h3>
        <div className="legend">
          <span>
            <i className="legend-dot stable" /> Sem mudança
          </span>
          <span>
            <i className="legend-dot changed" /> Alterada
          </span>
          <span>
            <b className="legend-bit" aria-hidden="true">1</b> Bit invertido
          </span>
        </div>
        <span className="round-tag">
          R{round} · A<sub>{step}</sub>
          <span />
          5 × 5 · 8 bits
        </span>
      </div>
      <MatrixView
        matrix={matrix}
        previous={previousMatrix}
        activeStep={step}
        changedCells={changedCells}
        animationKey={`${round}-${step}-${mode}-${replay}`}
      />
      {isFinal ? (
        <p className="final-output-note" role="status">
          <Icon name="check" size={16} />
          Fim da rodada {LAST_KECCAK_ROUND}: este é o resultado completo de Keccak-f[200] sobre a
          matriz inicial.
        </p>
      ) : (
        <div className="animation-caption">
          <p>{ANIMATION_CAPTIONS[step]}</p>
          {step > 0 && (
            <button className="text-button" onClick={() => setReplay((n) => n + 1)}>
              <Icon name="reset" size={14} /> Animar novamente
            </button>
          )}
        </div>
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
            R{round} · etapa {step}/{LAST_KECCAK_STEP}
          </span>
        </div>
        <code className="state-hex" title={`Estado em hexadecimal: 0x${hexState}`}>
          0x{hexState}
        </code>
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
