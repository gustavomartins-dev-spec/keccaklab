import { BIT_OPTIONS } from '../../constants/experiments';
import type { OutputBits, SearchProgress } from '../../types/experiments';
import Icon from '../ui/Icon';
import SearchProgressBox from './SearchProgressBox';

interface ExperimentControlsProps {
  bits: OutputBits;
  seed: string;
  isSaving: boolean;
  job: 'search' | 'compare' | null;
  progress: SearchProgress | null;
  onBitsChange: (bits: OutputBits) => void;
  onSeedChange: (seed: string) => void;
  onRun: () => Promise<void>;
  onCancel: () => void;
}

export default function ExperimentControls({ bits, seed, isSaving, job, progress, onBitsChange, onSeedChange, onRun, onCancel }: ExperimentControlsProps) {
  const busy = !!job || isSaving;
  return (
    <div className="rho-toolbar">
      <div>
        <span className="control-label">Parâmetros da busca</span>
        <p className="control-description">Tamanho da saída truncada. Mais bits, mais trabalho.</p>
      </div>
      <div className="bits-options" role="group" aria-label="Tamanho da saída">
        {BIT_OPTIONS.map((option) => (
          <button
            className={bits === option ? 'bit-option selected' : 'bit-option'}
            key={option}
            aria-pressed={bits === option}
            disabled={busy}
            onClick={() => onBitsChange(option)}
          >
            {option}
            <small>bits</small>
          </button>
        ))}
      </div>
      <label className="seed-control">
        <span className="seed-label">Semente inicial</span>
        <input type="number" min="0" max={2 ** bits - 1} step="1" value={seed} disabled={busy} onChange={(event) => onSeedChange(event.target.value)} />
        <span className="seed-range">0 a {(2 ** bits - 1).toLocaleString('pt-BR')}</span>
      </label>
      <div className="search-actions">
        <button className="primary-button run-button" onClick={() => void onRun()} disabled={busy}>
          <Icon name="play" size={16} />
          {isSaving ? 'Salvando…' : job === 'search' ? 'Buscando…' : 'Executar busca'}
        </button>
        {job && (
          <button className="secondary-button" onClick={onCancel}>
            Cancelar cálculo
          </button>
        )}
      </div>
      {job && <SearchProgressBox job={job} progress={progress} />}
      <p className="control-description">Saídas de 32 a 40 bits podem levar mais tempo.</p>
    </div>
  );
}
