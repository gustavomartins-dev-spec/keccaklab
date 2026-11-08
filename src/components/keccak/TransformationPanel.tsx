import { KECCAK_STEPS, LAST_KECCAK_STEP } from '../../constants/keccak';
import type { CellChange, StepDetail } from '../../types/keccak';
import { formatByte } from '../../utils/format';
import Icon from '../ui/Icon';

interface TransformationPanelProps {
  step: number;
  detail: StepDetail;
  isPlaying: boolean;
  cellChanges: CellChange[];
  onOpenDetails: () => void;
  onTogglePlayback: () => void;
}

export default function TransformationPanel({
  step,
  detail,
  isPlaying,
  cellChanges,
  onOpenDetails,
  onTogglePlayback,
}: TransformationPanelProps) {
  return (
    <div className="explain-panel">
      <div className="explain-top">
        <div className="explain-label">
          <span className="section-kicker">
            {step === 0 ? 'ESTADO INICIAL' : `TRANSFORMAÇÃO ${String(step).padStart(2, '0')}`}
          </span>
          <span className="step-count">{String(step + 1).padStart(2, '0')} / 06</span>
        </div>
        <div className="transform-symbol">{KECCAK_STEPS[step].symbol}</div>
        <h3>{detail.title}</h3>
        <p className="detail-description">{detail.shortDescription}</p>
        <div className="formula-box">
          <span className="panel-label">FÓRMULA</span>
          <code>{detail.formula}</code>
        </div>
        <button className="detail-button" onClick={onOpenDetails}>
          Detalhes da transformação <Icon name="arrow-right" size={16} />
        </button>
      </div>
      {cellChanges.length === 0 ? (
        <div className="initial-insight">
          <Icon name="info" size={18} />
          <p>
            Estado anterior à aplicação de <strong>Theta</strong>. Nenhuma transformação foi
            aplicada.
          </p>
        </div>
      ) : (
        <div className="changes-box">
          <span className="panel-label">CÉLULAS ALTERADAS ({cellChanges.length})</span>
          <div className="changes-list">
            {cellChanges.slice(0, 4).map((change) => (
              <div className="change-item" key={`${change.x},${change.y}`}>
                <span className="change-coord">
                  [{change.x},{change.y}]
                </span>
                <span className="change-before">{formatByte(change.before)}</span>
                <span className="change-arrow">→</span>
                <span className="change-after">{formatByte(change.after)}</span>
              </div>
            ))}
            {cellChanges.length > 4 && (
              <span className="change-more">
                +{cellChanges.length - 4} outras células alteradas
              </span>
            )}
          </div>
        </div>
      )}
      <div className="explain-bottom">
        <button className="primary-button play-button" onClick={onTogglePlayback}>
          <Icon
            name={isPlaying ? 'pause' : step === LAST_KECCAK_STEP ? 'reset' : 'play'}
            size={17}
          />
          {isPlaying
            ? 'Pausar reprodução'
            : step === LAST_KECCAK_STEP
              ? 'Reproduzir novamente'
              : 'Reproduzir rodada'}
        </button>
        <span className="player-hint">Ordem: θ → ρ → π → χ → ι.</span>
      </div>
    </div>
  );
}
