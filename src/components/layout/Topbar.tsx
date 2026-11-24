import { NAVIGATION_ITEMS } from '../../constants/navigation';
import type { PageId } from '../../types/navigation';
import Icon from '../ui/Icon';

interface TopbarProps {
  activePage: PageId;
  detail?: string;
}

export default function Topbar({ activePage, detail }: TopbarProps) {
  const title = NAVIGATION_ITEMS.find((item) => item.id === activePage)?.label;

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <Icon name="flask" size={17} />
        <span>Laboratório</span>
        <Icon name="chevron" size={13} />
        {detail ? (
          <>
            <span>{title}</span>
            <Icon name="chevron" size={13} />
            <strong>{detail}</strong>
          </>
        ) : (
          <strong>{title}</strong>
        )}
      </div>
    </header>
  );
}
