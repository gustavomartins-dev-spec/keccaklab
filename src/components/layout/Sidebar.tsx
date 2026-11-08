import { KECCAK_STEPS, LAST_KECCAK_STEP } from '../../constants/keccak';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import type { PageId } from '../../types/navigation';
import Icon from '../ui/Icon';

interface SidebarProps {
  activePage: PageId;
  step: number;
  onNavigate: (page: PageId) => void;
  onSelectStep: (step: number) => void;
}

export default function Sidebar({ activePage, step, onNavigate, onSelectStep }: SidebarProps) {
  const progress = (step / LAST_KECCAK_STEP) * 100;

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">
          <Icon name="flask" size={24} />
        </div>
        <div>
          <strong>
            keccak<span>lab</span>
            <i />
          </strong>
          <small>Criptografia na prática</small>
        </div>
      </div>
      <div className="sidebar-section-label">SEU LABORATÓRIO</div>
      <nav className="main-nav" aria-label="Navegação principal">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            className={activePage === item.id ? 'nav-item active' : 'nav-item'}
            key={item.id}
            aria-current={activePage === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
            <Icon name="chevron" size={14} className="nav-arrow" />
          </button>
        ))}
      </nav>
      <div className="sidebar-journey">
        <div className="sidebar-section-label">PASSO A PASSO</div>
        <div className="journey-heading">
          <Icon name="book" size={17} />
          <span>Uma rodada de Keccak</span>
        </div>
        <div
          className="journey-progress"
          role="progressbar"
          aria-label="Etapa da rodada"
          aria-valuemin={0}
          aria-valuemax={LAST_KECCAK_STEP}
          aria-valuenow={step}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="journey-caption">
          <span>
            {step} de {LAST_KECCAK_STEP} transformações
          </span>
          <strong>{progress}%</strong>
        </div>
        <div className="journey-steps">
          {KECCAK_STEPS.slice(1).map(({ label, symbol }, index) => (
            <button
              key={label}
              className={`journey-step ${step > index ? 'visited' : ''}`}
              aria-current={activePage === 'keccak' && step === index + 1 ? 'step' : undefined}
              onClick={() => onSelectStep(index + 1)}
            >
              <span className="journey-dot">
                {step > index ? <Icon name="check" size={11} /> : index + 1}
              </span>
              {label}
              <span className="journey-greek">{symbol}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <span className="tip-icon">
            <Icon name="sparkles" size={21} />
          </span>
          <strong>Aprenda experimentando.</strong>
          <p>Grandes ideias ficam mais simples quando você pode vê-las acontecer.</p>
          <span className="tip-tag">Um bit de cada vez.</span>
        </div>
        <div className="sidebar-footer">
          <span className="pulse-dot" /> Laboratório interativo <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
}
