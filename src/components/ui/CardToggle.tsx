import Icon from './Icon';

interface CardToggleProps {
  collapsed: boolean;
  /** Name of the card, used in the accessible label ("Recolher painel de …"). */
  label: string;
  controls: string;
  onToggle: () => void;
}

export default function CardToggle({ collapsed, label, controls, onToggle }: CardToggleProps) {
  const action = `${collapsed ? 'Expandir' : 'Recolher'} painel de ${label}`;
  return (
    <button
      className={`card-toggle ${collapsed ? 'collapsed' : ''}`}
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-controls={collapsed ? undefined : controls}
      aria-label={action}
      title={action}
    >
      <Icon name="chevron" size={14} />
    </button>
  );
}
