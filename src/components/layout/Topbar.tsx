import { NAVIGATION_ITEMS } from '../../constants/navigation';
import type { PageId } from '../../types/navigation';
import Icon from '../ui/Icon';

interface TopbarProps {
  activePage: PageId;
}

export default function Topbar({ activePage }: TopbarProps) {
  const title = NAVIGATION_ITEMS.find((item) => item.id === activePage)?.label;

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <Icon name="flask" size={17} />
        <span>Laboratório</span>
        <Icon name="chevron" size={13} />
        <strong>{title}</strong>
      </div>
      <div className="topbar-meta">
        <span className="algorithm-badge">
          <span className="pulse-dot" /> Keccak-200
        </span>
        <span className="theme-label">
          <Icon name="sun" size={17} /> Tema claro
        </span>
      </div>
    </header>
  );
}
