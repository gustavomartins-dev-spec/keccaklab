import { KECCAK_STEPS } from '../../constants/keccak';
import Icon from '../ui/Icon';

interface StepNavigatorProps {
  step: number;
  /** In isolated mode the steps do not accumulate, so none is shown as done. */
  isolated?: boolean;
  onSelectStep: (step: number) => void;
}

export default function StepNavigator({ step, isolated = false, onSelectStep }: StepNavigatorProps) {
  return (
    <div className="stepper" aria-label="Etapas da rodada Keccak">
      {KECCAK_STEPS.map(({ label, symbol, caption }, index) => (
        <button
          key={label}
          className={`step-button ${step === index ? 'selected' : ''} ${!isolated && index < step ? 'done' : ''}`}
          aria-current={step === index ? 'step' : undefined}
          onClick={() => onSelectStep(index)}
        >
          <span className="step-node">
            {!isolated && index < step ? <Icon name="check" size={20} /> : symbol}
          </span>
          <strong>{label}</strong>
          <small>{caption}</small>
        </button>
      ))}
    </div>
  );
}
