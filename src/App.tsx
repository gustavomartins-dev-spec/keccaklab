import { useState } from 'react';
import RoundRail from './components/keccak/RoundRail';
import AppLayout from './components/layout/AppLayout';
import { useCollisionExperiment } from './hooks/useCollisionExperiment';
import { useKeccak } from './hooks/useKeccak';
import CollisionPage, { type CollisionView } from './pages/CollisionPage';
import KeccakPage from './pages/KeccakPage';
import type { PageId } from './types/navigation';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('keccak');
  const visualizer = useKeccak();
  const experiment = useCollisionExperiment();
  /* Kept here so the chosen collisions sub-screen survives a trip to the visualizer. */
  const [collisionView, setCollisionView] = useState<CollisionView>('search');

  const navigate = (page: PageId): void => {
    visualizer.pause();
    setActivePage(page);
  };

  const navigateToRound = (round: number): void => {
    visualizer.selectRound(round);
    setActivePage('keccak');
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={navigate}
      breadcrumbDetail={
        activePage === 'rho' && collisionView === 'compare' ? 'Comparar tamanhos' : undefined
      }
      sidebarContent={
        <RoundRail round={visualizer.round} onSelectRound={navigateToRound} />
      }
    >
      {activePage === 'keccak' ? (
        <KeccakPage visualizer={visualizer} />
      ) : (
        <CollisionPage experiment={experiment} view={collisionView} onViewChange={setCollisionView} />
      )}
    </AppLayout>
  );
}
