import type { SearchProgress } from '../../types/experiments';

const PHASE_LABELS = {
  detect: 'Procurando o encontro dos ponteiros',
  locate: 'Localizando a entrada do ciclo',
  measure: 'Medindo o ciclo',
};

interface SearchProgressBoxProps {
  job: 'search' | 'compare';
  progress: SearchProgress | null;
}

export default function SearchProgressBox({ job, progress }: SearchProgressBoxProps) {
  return (
    <div className="search-progress" role="status" aria-live="polite">
      <strong>{job === 'compare' ? 'Comparando tamanhos' : 'Busca em andamento'}</strong>
      <span>{progress ? PHASE_LABELS[progress.phase] : 'Preparando o cálculo…'}</span>
      {progress && (
        <span>
          {progress.evaluations.toLocaleString('pt-BR')} avaliações · {progress.bits} bits · tentativa{' '}
          {progress.attempts}
          {progress.totalTrials
            ? ' · amostra ' + ((progress.completedTrials ?? 0) + 1) + ' de ' + progress.totalTrials
            : ''}
        </span>
      )}
    </div>
  );
}
