import type { ReactNode } from 'react';
import type { PageId } from '../../types/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: ReactNode;
  activePage: PageId;
  step: number;
  onNavigate: (page: PageId) => void;
  onSelectStep: (step: number) => void;
}

export default function AppLayout({
  children,
  activePage,
  step,
  onNavigate,
  onSelectStep,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      <Sidebar
        activePage={activePage}
        step={step}
        onNavigate={onNavigate}
        onSelectStep={onSelectStep}
      />
      <main className="main-content" id="main-content" tabIndex={-1}>
        <Topbar activePage={activePage} />
        {children}
      </main>
    </div>
  );
}
