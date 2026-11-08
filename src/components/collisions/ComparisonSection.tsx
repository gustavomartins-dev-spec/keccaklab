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
          <span className="section-kicker">COMPARAÇÃO DE SAÍDAS</span>
          <h3>Iterações por tamanho de saída</h3>
        </div>
        <button className="primary-button run-button" onClick={onCompare}>
          Comparar tamanhos <Icon name="arrow-right" size={16} />
        </button>
      </div>
      {comparison.length === 0 ? (
        <p className="comparison-empty">
          A comparação executa a busca com saídas de 4, 6 e 8 bits usando a mesma função de hash
          e o mesmo estado inicial.
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
                <span className="cmp-expected">referência ≈ {entry.expected.toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="comparison-note">
            <span className="panel-label">MÉTODO DE COMPARAÇÃO</span>
            <p>
              As barras mostram o número de avaliações até o primeiro valor repetido. A referência
              2<sup>n/2</sup> indica a ordem de grandeza para saídas uniformes de n bits. A busca
              produz o mesmo resultado quando o tamanho da saída e o estado inicial são mantidos.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
