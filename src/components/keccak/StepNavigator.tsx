import { KECCAK_STEPS } from '../../constants/keccak';
import Icon from '../ui/Icon';

interface StepNavigatorProps {
  step: number;
  onSelectStep: (step: number) => void;
}

export default function StepNavigator({ step, onSelectStep }: StepNavigatorProps) {
  return (
    <div className="stepper" aria-label="Etapas da rodada Keccak">
      {KECCAK_STEPS.map(({ label, symbol, caption }, index) => (
        <button
          key={label}
          className={`step-button ${step === index ? 'selected' : ''} ${index < step ? 'done' : ''}`}
          aria-current={step === index ? 'step' : undefined}
          onClick={() => onSelectStep(index)}
        >
          <span className="step-node">
            {index < step ? <Icon name="check" size={20} /> : symbol}
          </span>
          <strong>{label}</strong>
          <small>{caption}</small>
        </button>
      ))}
    </div>
  );
}
