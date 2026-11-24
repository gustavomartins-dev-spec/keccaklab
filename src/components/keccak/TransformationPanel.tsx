import { KECCAK_STEPS, LAST_KECCAK_STEP } from '../../constants/keccak';
import type { StepMode } from '../../lib/keccak';
import type { CellChange, StepDetail } from '../../types/keccak';
import { formatByte } from '../../utils/format';
import { usePersistentToggle } from '../../hooks/usePersistentToggle';
import Icon from '../ui/Icon';
import CardToggle from '../ui/CardToggle';

interface TransformationPanelProps {
  mode: StepMode;
  round: number;
  step: number;
  detail: StepDetail;
  cellChanges: CellChange[];
  onOpenDetails: () => void;
}

export default function TransformationPanel({
  mode,
  round,
  step,
  detail,
  cellChanges,
  onOpenDetails,
}: TransformationPanelProps) {
  const [collapsed, toggle] = usePersistentToggle('keccaklab:transformation-collapsed');
  return (
    <div className={`explain-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="explain-label">
        <span className="section-kicker">
          {step === 0
            ? round === 0
              ? 'ESTADO INICIAL'
              : `ENTRADA · RODADA ${round}`
            : `RODADA ${round} · ETAPA ${step} DE ${LAST_KECCAK_STEP}`}
        </span>
        <span className="step-count">{String(step + 1).padStart(2, '0')} / 06</span>
        <CardToggle
          collapsed={collapsed}
          label="transformação"
          controls="transformation-body"
          onToggle={toggle}
        />
      </div>
      <div className="explain-title">
        <div className="transform-symbol" aria-hidden="true">
          {KECCAK_STEPS[step].symbol}
        </div>
        <h3>{detail.title}</h3>
      </div>
      {!collapsed && (
        <div className="card-body" id="transformation-body">
          <p className="detail-description">{detail.shortDescription}</p>
          <div className="formula-box">
            <span className="panel-label">FÓRMULA</span>
            <code>{detail.formula}</code>
          </div>
          {cellChanges.length === 0 ? (
            <div className="initial-insight">
              <Icon name="info" size={16} />
              <p>
                {round === 0 ? (
                  <>
                    Estado anterior à aplicação de <strong>Theta</strong>. Nenhuma transformação foi
                    aplicada.
                  </>
                ) : (
                  <>
                    Saída da rodada {round - 1}. A rodada {round} aplica <strong>Theta</strong> a
                    seguir.
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="changes-box">
              <span className="panel-label">
                CÉLULAS ALTERADAS ({cellChanges.length})
                {mode === 'isolated' ? ' · EM RELAÇÃO À ENTRADA' : ''}
              </span>
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
          <button className="detail-button" onClick={onOpenDetails}>
            Detalhes da transformação <Icon name="arrow-right" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
