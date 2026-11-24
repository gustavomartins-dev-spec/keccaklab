import type { ReactNode } from 'react';
import type { PageId } from '../../types/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: ReactNode;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  /** Extra breadcrumb level after the page name (a sub-screen). */
  breadcrumbDetail?: string;
  /** Page-specific navigation shown below the modules (the rounds rail). */
  sidebarContent?: ReactNode;
}

export default function AppLayout({
  children,
  activePage,
  onNavigate,
  breadcrumbDetail,
  sidebarContent,
}: AppLayoutProps) {
  return (
    <div className={`app-shell page-${activePage}`}>
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
      >
        {sidebarContent}
      </Sidebar>
      <main className="main-content" id="main-content" tabIndex={-1}>
        <Topbar activePage={activePage} detail={breadcrumbDetail} />
        {children}
      </main>
    </div>
  );
}
