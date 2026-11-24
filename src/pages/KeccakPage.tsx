import { useCallback, useState } from 'react';
import AvalanchePanel from '../components/keccak/AvalanchePanel';
import RoundNavigator from '../components/keccak/RoundNavigator';
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
    round,
    step,
    matrix,
    hexState,
    detail,
    isPlaying,
    changedCells,
    cellChanges,
    selectStep,
    selectRound,
    goNext,
    goPrevious,
    isFirst,
    isLast,
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
        <h2>Rodadas e etapas</h2>
      </div>
      <RoundNavigator round={round} onSelectRound={selectRound} />
      <StepNavigator step={step} onSelectStep={selectStep} />
      <div className="keccak-layout">
        <StatePanel
          round={round}
          step={step}
          matrix={matrix}
          hexState={hexState}
          changedCells={changedCells}
          isPlaying={isPlaying}
          isFirst={isFirst}
          isLast={isLast}
          onSelectStep={selectStep}
          onNext={goNext}
          onPrevious={goPrevious}
        />
        <TransformationPanel
          round={round}
          step={step}
          detail={detail}
          isPlaying={isPlaying}
          cellChanges={cellChanges}
          onOpenDetails={openDetails}
          onTogglePlayback={togglePlayback}
        />
      </div>
      <AvalanchePanel round={round} step={step} onSelectRound={selectRound} />
      <div className="module-footnote">
        <span className="footnote-icon">
          <Icon name="book" size={21} />
        </span>
        <div>
          <strong>Representação do estado</strong>
          <p>
            A simulação utiliza uma matriz de 5 × 5 lanes de 8 bits. As etapas são aplicadas na
            ordem θ → ρ → π → χ → ι em cada uma das 18 rodadas de Keccak-f[200] (0 a 17); a saída de uma rodada é a entrada da seguinte. O módulo de colisões utiliza este mesmo núcleo de transformações.
          </p>
        </div>
        <span className="footnote-tag">25 lanes × 8 bits</span>
      </div>
      <footer className="page-footer">
        <span>KECCAK LAB</span>Visualização de estados e detecção de ciclos.
      </footer>
      {showDetails && (
        <TransformationModal
          detail={detail}
          round={round}
          step={step}
          matrix={matrix}
          onClose={closeDetails}
        />
      )}
    </section>
  );
}
