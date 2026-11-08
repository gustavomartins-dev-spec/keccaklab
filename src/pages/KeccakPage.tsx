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
            <span /> APRENDA EXPLORANDO
          </span>
          <h1>
            Por dentro do <em>Keccak.</em>
          </h1>
          <p className="heading-description">
            Uma mensagem. Cinco transformações. Inúmeras descobertas.
            <br className="desktop-break" /> Explore uma rodada do algoritmo por trás do SHA-3,
            passo a passo.
          </p>
        </div>
        <div className="lesson-badge">
          <span className="lesson-badge-icon">
            <Icon name="grid" size={25} />
          </span>
          <div>
            <strong>Visualize cada bit.</strong>
            <span>Entenda cada transformação.</span>
          </div>
        </div>
      </div>
      <div className="section-heading">
        <h2>Sua jornada pela rodada</h2>
        <span>
          Clique em uma etapa para explorar <Icon name="arrow-right" size={14} />
        </span>
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
          <strong>Pequeno no tamanho. Grande na ideia.</strong>
          <p>
            Usamos uma versão didática de 200 bits para tornar cada movimento visível. Uma rodada
            percorre θ → ρ → π → χ → ι.
          </p>
        </div>
        <span className="footnote-tag">Feito para aprender</span>
      </div>
      <footer className="page-footer">
        <span>KECCAK LAB</span>Explore com curiosidade. Aprenda na prática.
      </footer>
      {showDetails && (
        <TransformationModal detail={detail} step={step} matrix={matrix} onClose={closeDetails} />
      )}
    </section>
  );
}
