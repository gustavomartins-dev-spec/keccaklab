import CollisionChart from '../components/collisions/CollisionChart';
import CollisionSummary from '../components/collisions/CollisionSummary';
import ComparisonSection from '../components/collisions/ComparisonSection';
import ExperimentControls from '../components/collisions/ExperimentControls';
import RunHistory from '../components/collisions/RunHistory';
import type { CollisionExperimentController } from '../hooks/useCollisionExperiment';

interface CollisionPageProps {
  experiment: CollisionExperimentController;
}

export default function CollisionPage({ experiment }: CollisionPageProps) {
  const { bits, setBits, result, resultBits, runs, isSaving, comparison, execute, compare } =
    experiment;

  return (
    <section className="page module-page rho-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            <span /> DESCUBRA EXPERIMENTANDO
          </span>
          <h1>
            Encontre o <em>ponto de retorno.</em>
          </h1>
          <p className="heading-description">
            Caminhos diferentes. Um mesmo destino.
            <br className="desktop-break" /> Explore ciclos e colisões com uma simulação de
            Pollard's Rho.
          </p>
        </div>
      </div>
      <ExperimentControls bits={bits} isSaving={isSaving} onBitsChange={setBits} onRun={execute} />
      <div className="rho-layout">
        <CollisionChart result={result} bits={resultBits} />
        <CollisionSummary result={result} bits={resultBits} />
      </div>
      <ComparisonSection comparison={comparison} onCompare={compare} />
      <RunHistory runs={runs} />
    </section>
  );
}
