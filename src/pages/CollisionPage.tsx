import { useCallback, useState } from 'react';
import CollisionChart from '../components/collisions/CollisionChart';
import CollisionSummary from '../components/collisions/CollisionSummary';
import ComparisonSection from '../components/collisions/ComparisonSection';
import ExperimentControls from '../components/collisions/ExperimentControls';
import Icon from '../components/ui/Icon';
import type { CollisionExperimentController } from '../hooks/useCollisionExperiment';
import MethodModal from '../modals/MethodModal';

export type CollisionView = 'search' | 'compare';

interface CollisionPageProps {
  experiment: CollisionExperimentController;
  view: CollisionView;
  onViewChange: (view: CollisionView) => void;
}

const VIEWS: { id: CollisionView; label: string; icon: 'route' | 'chart' }[] = [
  { id: 'search', label: 'Busca única', icon: 'route' },
  { id: 'compare', label: 'Comparar tamanhos', icon: 'chart' },
];

export default function CollisionPage({ experiment, view, onViewChange }: CollisionPageProps) {
  const [showMethod, setShowMethod] = useState(false);
  const closeMethod = useCallback(() => setShowMethod(false), []);
  const { bits, setBits, seed, setSeed, result, resultBits, isSaving, job, progress, error, elapsedMs, comparison, execute, compare, cancel } = experiment;

  return (
    <section className="page fit-page rho-page">
      <div className="fit-toolbar">
        <h1>Busca de colisões</h1>
        <nav className="view-switch" aria-label="Telas da busca de colisões">
          {VIEWS.map(({ id, label, icon }) => (
            <button key={id} className={view === id ? 'selected' : ''} aria-current={view === id ? 'page' : undefined} onClick={() => onViewChange(id)}>
              <Icon name={icon} size={15} />
              {label}
            </button>
          ))}
        </nav>
        <button className="secondary-button method-button" onClick={() => setShowMethod(true)}>
          <Icon name="info" size={15} /> Como funciona
        </button>
      </div>
      {error && (
        <p className="experiment-message" role="status">
          {error}
        </p>
      )}
      {view === 'search' ? (
        <div className="rho-workspace">
          <ExperimentControls bits={bits} seed={seed} isSaving={isSaving} job={job} progress={progress} onBitsChange={setBits} onSeedChange={setSeed} onRun={execute} onCancel={cancel} />
          <CollisionChart result={result} />
          <CollisionSummary result={result} bits={resultBits} elapsedMs={elapsedMs} />
        </div>
      ) : (
        <ComparisonSection comparison={comparison} onCompare={compare} onCancel={cancel} busy={!!job || isSaving} job={job} progress={progress} />
      )}
      {showMethod && <MethodModal onClose={closeMethod} initialTopic={view === 'compare' ? 4 : 0} />}
    </section>
  );
}
