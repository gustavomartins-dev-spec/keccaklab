import type { ReactNode } from 'react';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { usePersistentToggle } from '../../hooks/usePersistentToggle';
import type { PageId } from '../../types/navigation';
import Icon from '../ui/Icon';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  children?: ReactNode;
}

export default function Sidebar({ activePage, onNavigate, children }: SidebarProps) {
  const [collapsed, toggleCollapsed] = usePersistentToggle('keccaklab:sidebar-collapsed');

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand-lockup">
        <button
          className="brand-mark"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          <Icon name="flask" size={24} />
          <span className="brand-toggle-badge" aria-hidden="true">
            <Icon name="chevron" size={11} />
          </span>
        </button>
        <div>
          <strong>
            keccak<span>lab</span>
            <i />
          </strong>
          <small>Keccak e colisões</small>
        </div>
      </div>
      <div className="sidebar-section-label">MÓDULOS</div>
      <nav className="main-nav" aria-label="Navegação principal">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            className={activePage === item.id ? 'nav-item active' : 'nav-item'}
            key={item.id}
            aria-current={activePage === item.id ? 'page' : undefined}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
            <Icon name="chevron" size={14} className="nav-arrow" />
          </button>
        ))}
      </nav>
      {children}
      <div className="sidebar-bottom">
        <div className="sidebar-footer">
          <span className="pulse-dot" /> Laboratório interativo <span>v1.0</span>
        </div>
        <a
          className="sidebar-source"
          href="https://github.com/gustavomartins-dev-spec/keccaklab"
          target="_blank"
          rel="noreferrer"
        >
          Código-fonte aberto · licença MIT
        </a>
      </div>
    </aside>
  );
}
