import { useCallback, useState } from 'react';
import StatePanel from '../components/keccak/StatePanel';
import StepNavigator from '../components/keccak/StepNavigator';
import TransformationPanel from '../components/keccak/TransformationPanel';
import Icon from '../components/ui/Icon';
import type { KeccakController } from '../hooks/useKeccak';
import TransformationModal from '../modals/TransformationModal';

interface KeccakPageProps {
  visualizer: KeccakController;
}

export default function KeccakPage({ visualizer }: KeccakPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const {
    step,
    matrix,
    hexState,
    detail,
    isPlaying,
    changedCells,
    cellChanges,
    selectStep,
    pause,
    togglePlayback,
  } = visualizer;

  const openDetails = (): void => {
    pause();
    setShowDetails(true);
  };
  const closeDetails = useCallback((): void => setShowDetails(false), []);

  return (
    <section className="page module-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            <span /> VISUALIZAÇÃO DE ESTADO
          </span>
          <h1>
            Visualizar <em>Keccak</em>
          </h1>
          <p className="heading-description">
            Estados intermediários das etapas θ, ρ, π, χ e ι em uma matriz de 200 bits.
          </p>
        </div>
      </div>
      <div className="section-heading">
        <h2>Etapas da rodada</h2>
      </div>
      <StepNavigator step={step} onSelectStep={selectStep} />
      <div className="keccak-layout">
        <StatePanel
          step={step}
          matrix={matrix}
          hexState={hexState}
          changedCells={changedCells}
          isPlaying={isPlaying}
          onSelectStep={selectStep}
        />
        <TransformationPanel
          step={step}
          detail={detail}
          isPlaying={isPlaying}
          cellChanges={cellChanges}
          onOpenDetails={openDetails}
          onTogglePlayback={togglePlayback}
        />
      </div>
      <div className="module-footnote">
        <span className="footnote-icon">
          <Icon name="book" size={21} />
        </span>
        <div>
          <strong>Representação do estado</strong>
          <p>
            A simulação utiliza uma matriz de 5 × 5 lanes de 8 bits. As etapas são aplicadas na
            ordem θ → ρ → π → χ → ι.
          </p>
        </div>
        <span className="footnote-tag">25 lanes × 8 bits</span>
      </div>
      <footer className="page-footer">
        <span>KECCAK LAB</span>Visualização de estados e detecção de ciclos.
      </footer>
      {showDetails && (
        <TransformationModal detail={detail} step={step} matrix={matrix} onClose={closeDetails} />
      )}
    </section>
  );
}
