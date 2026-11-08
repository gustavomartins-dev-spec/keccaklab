import { useId } from 'react';
import StepDiagram from '../components/keccak/diagrams/StepDiagram';
import Modal from '../components/ui/Modal';
import type { Matrix, StepDetail } from '../types/keccak';

interface TransformationModalProps {
  detail: StepDetail;
  step: number;
  matrix: Matrix;
  onClose: () => void;
}

export default function TransformationModal({
  detail,
  step,
  matrix,
  onClose,
}: TransformationModalProps) {
  const titleId = useId();

  return (
    <Modal
      titleId={titleId}
      onClose={onClose}
      header={
        <div className="modal-header-left">
          <span className="panel-label">TRANSFORMAÇÃO {String(step).padStart(2, '0')}</span>
          <div className="modal-title-row">
            <span className="transform-symbol modal-symbol">{detail.symbol}</span>
            <div>
              <h2 id={titleId}>{detail.title}</h2>
              <span className="modal-subtitle">{detail.name}</span>
            </div>
          </div>
        </div>
      }
    >
      <p className="modal-description">{detail.description}</p>
      <StepDiagram step={step} matrix={matrix} />
      <div className="modal-formula">
        <span className="panel-label">FÓRMULA</span>
        <code>{detail.formula}</code>
      </div>
      <div className="modal-effect">
        <span className="panel-label">EFEITO</span>
        <p>{detail.effect}</p>
      </div>
      {detail.steps.length > 0 && (
        <div className="modal-steps">
          <span className="panel-label">PASSO A PASSO</span>
          <ol className="steps-list">
            {detail.steps.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ol>
        </div>
      )}
    </Modal>
  );
}
