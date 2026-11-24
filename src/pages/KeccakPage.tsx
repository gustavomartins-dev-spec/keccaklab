import { useCallback, useState } from 'react';
import AvalancheDiff from '../components/keccak/AvalancheDiff';
import StatePanel from '../components/keccak/StatePanel';
import StepNavigator from '../components/keccak/StepNavigator';
import TransformationPanel from '../components/keccak/TransformationPanel';
import Icon from '../components/ui/Icon';
import { LAST_KECCAK_STEP } from '../constants/keccak';
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
    mode,
    setMode,
    previousMatrix,
    matrix,
    hexState,
    detail,
    isPlaying,
    changedCells,
    cellChanges,
    selectStep,
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
    <section className="page keccak-page">
      <div className="keccak-toolbar">
        <div className="keccak-title">
          <h1>
            Visualizar <em>Keccak</em>
          </h1>
        </div>
        <div className="mode-toggle" role="radiogroup" aria-label="Modo de aplicação das transformações">
          <button
            role="radio"
            aria-checked={mode === 'sequential'}
            className={mode === 'sequential' ? 'selected' : ''}
            title="Cada etapa recebe o resultado da anterior: θ → ρ → π → χ → ι."
            onClick={() => setMode('sequential')}
          >
            Sequencial
          </button>
          <button
            role="radio"
            aria-checked={mode === 'isolated'}
            className={mode === 'isolated' ? 'selected' : ''}
            title={`A etapa escolhida é aplicada sozinha à entrada da rodada ${round}, sem as demais.`}
            onClick={() => setMode('isolated')}
          >
            Isolado
          </button>
        </div>
        <button className="primary-button play-button" onClick={togglePlayback}>
          <Icon
            name={isPlaying ? 'pause' : step === LAST_KECCAK_STEP ? 'reset' : 'play'}
            size={16}
          />
          {isPlaying
            ? 'Pausar reprodução'
            : step === LAST_KECCAK_STEP
              ? 'Reproduzir novamente'
              : `Reproduzir rodada ${round}`}
        </button>
      </div>
      <div className="keccak-workspace">
        <div className="keccak-center">
          <StepNavigator step={step} isolated={mode === 'isolated'} onSelectStep={selectStep} />
          <StatePanel
            round={round}
            step={step}
            matrix={matrix}
            previousMatrix={previousMatrix}
            mode={mode}
            hexState={hexState}
            changedCells={changedCells}
            isPlaying={isPlaying}
            isFirst={isFirst}
            isLast={isLast}
            onSelectStep={selectStep}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        </div>
        <div className="keccak-inspector">
          <TransformationPanel
            mode={mode}
            round={round}
            step={step}
            detail={detail}
            cellChanges={cellChanges}
            onOpenDetails={openDetails}
          />
          <AvalancheDiff round={round} step={step} mode={mode} />
        </div>
      </div>
      {showDetails && (
        <TransformationModal
          detail={detail}
          round={round}
          step={step}
          matrix={matrix}
          previousMatrix={previousMatrix}
          onClose={closeDetails}
        />
      )}
    </section>
  );
}
