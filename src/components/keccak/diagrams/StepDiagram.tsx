import type { Matrix } from '../../../types/keccak';
import ChiDiagram from './ChiDiagram';
import EntryDiagram from './EntryDiagram';
import IotaDiagram from './IotaDiagram';
import PiDiagram from './PiDiagram';
import RhoDiagram from './RhoDiagram';
import ThetaDiagram from './ThetaDiagram';

interface StepDiagramProps {
  step: number;
  matrix: Matrix;
}

export default function StepDiagram({ step, matrix }: StepDiagramProps) {
  switch (step) {
    case 0:
      return <EntryDiagram />;
    case 1:
      return <ThetaDiagram matrix={matrix} />;
    case 2:
      return <RhoDiagram />;
    case 3:
      return <PiDiagram />;
    case 4:
      return <ChiDiagram matrix={matrix} />;
    case 5:
      return <IotaDiagram />;
    default:
      return null;
  }
}
