import { BIT_OPTIONS } from '../../constants/experiments';
import type { OutputBits, SearchProgress } from '../../types/experiments';
import Icon from '../ui/Icon';

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

const PHASE_LABELS = {detect:'Procurando o encontro dos ponteiros',locate:'Localizando a entrada do ciclo',measure:'Medindo o ciclo'};

export default function ExperimentControls({bits,seed,isSaving,job,progress,onBitsChange,onSeedChange,onRun,onCancel}: ExperimentControlsProps) {
  return (
    <div className="rho-toolbar">
      <div className="bits-control">
        <span className="control-label">Parâmetros da busca</span>
        <p className="control-description">Tamanho da saída truncada. Mais bits aumentam o trabalho esperado.</p>
        <div className="bits-options" role="group" aria-label="Tamanho da saída">
          {BIT_OPTIONS.map(option => (
            <button className={bits===option ? 'bit-option selected' : 'bit-option'} key={option}
              aria-pressed={bits===option} disabled={!!job || isSaving} onClick={() => onBitsChange(option)}>
              {option}<small>bits</small>{bits===option && <Icon name="check" size={14}/>}
            </button>
          ))}
        </div>
        <label className="seed-control">
          Semente inicial
          <input type="number" min="0" max={2 ** bits - 1} step="1" value={seed}
            disabled={!!job || isSaving} onChange={event => onSeedChange(event.target.value)} />
          <span>0 a {(2 ** bits - 1).toLocaleString('pt-BR')}</span>
        </label>
        <p className="control-description">Saídas de 32 a 40 bits podem levar mais tempo. O cálculo pode ser cancelado.</p>
      </div>
      <div className="search-actions">
        <button className="primary-button run-button" onClick={() => void onRun()} disabled={!!job || isSaving}>
          <Icon name="play" size={16}/>{isSaving ? 'Salvando…' : job==='search' ? 'Buscando…' : 'Executar busca'}
        </button>
        {job && <button className="secondary-button" onClick={onCancel}>Cancelar cálculo</button>}
      </div>
      {job && (
        <div className="search-progress" role="status" aria-live="polite">
          <strong>{job==='compare' ? 'Comparando tamanhos' : 'Busca em andamento'}</strong>
          <span>{progress ? PHASE_LABELS[progress.phase] : 'Preparando o cálculo…'}</span>
          {progress && <span>{progress.evaluations.toLocaleString('pt-BR')} avaliações · {progress.bits} bits · tentativa {progress.attempts}
            {progress.totalTrials ? ' · amostra '+((progress.completedTrials ?? 0)+1)+' de '+progress.totalTrials : ''}</span>}
        </div>
      )}
    </div>
  );
}
