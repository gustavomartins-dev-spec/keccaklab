import type { ComparisonEntry } from '../../types/experiments';
import Icon from '../ui/Icon';
import ComparisonChart from './ComparisonChart';

interface ComparisonSectionProps {
  comparison: ComparisonEntry[];
  onCompare: () => void;
}

export default function ComparisonSection({ comparison, onCompare }: ComparisonSectionProps) {
  return (
    <div className="comparison-section">
      <div className="comparison-header">
        <div>
          <span className="section-kicker">VÁ UM POUCO ALÉM</span>
          <h3>Tamanho da saída × esforço de colisão</h3>
        </div>
        <button className="primary-button run-button" onClick={onCompare}>
          Comparar tamanhos <Icon name="arrow-right" size={16} />
        </button>
      </div>
      {comparison.length === 0 ? (
        <p className="comparison-empty">
          Execute a comparação para ver o resultado de 4, 6 e 8 bits lado a lado, com a mesma
          implementação do Keccak-200.
        </p>
      ) : (
        <>
          <ComparisonChart comparison={comparison} />
          <div className="comparison-table">
            {comparison.map((entry) => (
              <div className="comparison-row" key={entry.bits}>
                <span className="cmp-bits">{entry.bits} bits</span>
                <span className="cmp-iter">
                  <strong>{entry.iterations}</strong> iterações
                </span>
                <span className="cmp-expected">esperado ≈ {entry.expected.toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="comparison-note">
            <span className="panel-label">COMO LER</span>
            <p>
              O paradoxo do aniversário prevê que uma colisão para uma saída de n bits ocorre após
              aproximadamente 2<sup>n/2</sup> avaliações. Os valores acima são resultados
              experimentais reais e podem variar entre execuções — a tendência, porém, é clara:
              quanto maior a saída, maior o esforço necessário.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
