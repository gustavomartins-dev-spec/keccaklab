import { BIT_OPTIONS } from '../../constants/experiments';
import type { OutputBits } from '../../types/experiments';
import Icon from '../ui/Icon';

interface ExperimentControlsProps {
  bits: OutputBits;
  isSaving: boolean;
  onBitsChange: (bits: OutputBits) => void;
  onRun: () => Promise<void>;
}

export default function ExperimentControls({
  bits,
  isSaving,
  onBitsChange,
  onRun,
}: ExperimentControlsProps) {
  return (
    <div className="rho-toolbar">
      <div className="bits-control">
        <span className="control-label">Configure seu experimento</span>
        <p className="control-description">Escolha o tamanho da saída do hash.</p>
        <div className="bits-options">
          {BIT_OPTIONS.map((option) => (
            <button
              className={bits === option ? 'bit-option selected' : 'bit-option'}
              key={option}
              aria-pressed={bits === option}
              onClick={() => onBitsChange(option)}
            >
              {option}
              <small>bits</small>
              {bits === option && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      </div>
      <button className="primary-button run-button" onClick={onRun} disabled={isSaving}>
        <Icon name="play" size={16} />
        {isSaving ? 'Salvando…' : 'Executar busca'}
      </button>
    </div>
  );
}
