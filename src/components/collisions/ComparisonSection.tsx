import { COMPARISON_TRIALS } from '../../constants/experiments';
import type { ComparisonEntry, SearchProgress } from '../../types/experiments';
import Icon from '../ui/Icon';
import { formatCount } from '../../utils/format';
import ComparisonChart from './ComparisonChart';
import SearchProgressBox from './SearchProgressBox';

interface ComparisonSectionProps {
  comparison: ComparisonEntry[];
  onCompare: () => Promise<void>;
  onCancel: () => void;
  busy: boolean;
  job: 'search' | 'compare' | null;
  progress: SearchProgress | null;
}

/** One sentence with the takeaway, computed from the smallest and largest sizes. */
function takeaway(comparison: ComparisonEntry[]): string | null {
  if (comparison.length < 2) return null;
  const first = comparison[0];
  const last = comparison[comparison.length - 1];
  const valuesGrowth = 2 ** (last.bits - first.bits);
  const stepsGrowth = last.iterations / first.iterations;
  return `De ${first.bits} para ${last.bits} bits, os valores possíveis ficaram ${formatCount(valuesGrowth)}× mais numerosos, mas os passos até repetir só ${formatCount(stepsGrowth)}× (a teoria prevê ${formatCount(Math.sqrt(valuesGrowth))}×, a raiz quadrada).`;
}

export default function ComparisonSection({ comparison, onCompare, onCancel, busy, job, progress }: ComparisonSectionProps) {
  const insight = takeaway(comparison);
  return (
    <div className="compare-workspace">
      <div className="comparison-section">
        <div className="comparison-header">
          <div>
            <span className="panel-label">TAMANHO DA SAÍDA × TRABALHO</span>
            <h3>Quantos passos até um valor se repetir?</h3>
          </div>
          {job === 'compare' ? (
            <button className="secondary-button" onClick={onCancel}>
              Cancelar cálculo
            </button>
          ) : (
            <button className="primary-button run-button" onClick={() => void onCompare()} disabled={busy}>
              <Icon name="play" size={16} />
              {comparison.length ? 'Comparar novamente' : 'Executar comparação'}
            </button>
          )}
        </div>
        <p className="comparison-intro">
          Para cada tamanho de saída, a busca parte de {COMPARISON_TRIALS} sementes sorteadas e aplica h
          repetidamente até um valor aparecer pela segunda vez. A barra mostra a média de passos.
        </p>
        {job && <SearchProgressBox job={job} progress={progress} />}
        {comparison.length === 0 ? (
          <div className="comparison-empty">
            <Icon name="chart" size={28} />
            <p>Execute a comparação para ver os resultados de 8, 16 e 24 bits.</p>
          </div>
        ) : (
          <>
            {insight && <p className="comparison-insight">{insight}</p>}
            <ComparisonChart comparison={comparison} />
          </>
        )}
      </div>
      <aside className="comparison-side" aria-label="Resultados por tamanho de saída">
        {comparison.length === 0 ? (
          <p className="comparison-side-empty">Os resultados por tamanho aparecem aqui.</p>
        ) : (
          comparison.map((entry) => (
            <div className="comparison-row" key={entry.bits}>
              <span className="cmp-bits">
                {entry.bits} bits <small>{formatCount(2 ** entry.bits)} valores</small>
              </span>
              <span className="cmp-iter">
                <strong>{formatCount(entry.iterations)}</strong> passos em média até repetir
              </span>
              <dl className="cmp-stats">
                <div>
                  <dt>esperado pela teoria</dt>
                  <dd>≈ {formatCount(entry.expected)}</dd>
                </div>
                <div>
                  <dt>menor e maior busca</dt>
                  <dd>
                    {formatCount(entry.minIterations)} a {formatCount(entry.maxIterations)}
                  </dd>
                </div>
                <div>
                  <dt>cálculos de h por busca</dt>
                  <dd>{formatCount(entry.evaluations)}</dd>
                </div>
              </dl>
            </div>
          ))
        )}
        <div className="comparison-note">
          <span className="panel-label">POR QUE ISSO IMPORTA</span>
          <p>
            Um valor se repete bem antes de esgotar as possibilidades, por volta de √N passos (paradoxo
            do aniversário). Por isso n bits de saída valem só ~n/2 bits contra colisões.
          </p>
        </div>
      </aside>
    </div>
  );
}
