import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import { useCollisionExperiment } from './hooks/useCollisionExperiment';
import { useKeccak } from './hooks/useKeccak';
import CollisionPage from './pages/CollisionPage';
import KeccakPage from './pages/KeccakPage';
import type { PageId } from './types/navigation';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('keccak');
  const visualizer = useKeccak();
  const experiment = useCollisionExperiment();

  const navigate = (page: PageId): void => {
    visualizer.pause();
    setActivePage(page);
  };

  const navigateToStep = (step: number): void => {
    visualizer.selectStep(step);
    setActivePage('keccak');
  };

  return (
    <AppLayout
      activePage={activePage}
      step={visualizer.step}
      onNavigate={navigate}
      onSelectStep={navigateToStep}
    >
      {activePage === 'keccak' ? (
        <KeccakPage visualizer={visualizer} />
      ) : (
        <CollisionPage experiment={experiment} />
      )}
    </AppLayout>
  );
}
