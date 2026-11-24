import { COMPARISON_TRIALS } from '../../constants/experiments';
import type { ComparisonEntry, SearchProgress } from '../../types/experiments';
import Icon from '../ui/Icon';
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

const fmt = (value: number, digits = 0): string =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: digits });

export default function ComparisonSection({ comparison, onCompare, onCancel, busy, job, progress }: ComparisonSectionProps) {
  return (
    <div className="compare-workspace">
      <div className="comparison-section">
        <div className="comparison-header">
          <div>
            <span className="panel-label">TAMANHO DA SAÍDA E TRABALHO</span>
            <h3>Comprimento de ρ até a primeira repetição</h3>
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
        {job && <SearchProgressBox job={job} progress={progress} />}
        {comparison.length === 0 ? (
          <div className="comparison-empty">
            <Icon name="chart" size={28} />
            <p>
              Compare saídas de 8, 16 e 24 bits com {COMPARISON_TRIALS} sementes sorteadas por tamanho.
              O gráfico mostra a média e a variação entre as buscas. Cada execução sorteia novas
              sementes, então os números mudam um pouco de uma vez para outra.
            </p>
          </div>
        ) : (
          <ComparisonChart comparison={comparison} />
        )}
      </div>
      <aside className="comparison-side" aria-label="Resultados por tamanho de saída">
        {comparison.length === 0 ? (
          <p className="comparison-side-empty">Os resultados por tamanho aparecem aqui.</p>
        ) : (
          comparison.map((entry) => (
            <div className="comparison-row" key={entry.bits}>
              <span className="cmp-bits">
                {entry.bits} bits · {entry.trials} sementes
              </span>
              <span className="cmp-iter">
                <strong>{fmt(entry.iterations, 1)}</strong> estados em média (μ + λ)
              </span>
              <dl className="cmp-stats">
                <div><dt>mín · máx</dt><dd>{entry.minIterations} · {entry.maxIterations}</dd></div>
                <div><dt>esperado</dt><dd>≈ {fmt(entry.expected)}</dd></div>
                <div><dt>avaliações de h</dt><dd>{fmt(Math.round(entry.evaluations))}</dd></div>
              </dl>
            </div>
          ))
        )}
        <div className="comparison-note">
          <span className="panel-label">COMO INTERPRETAR</span>
          <p>
            O tracejado é a média teórica √(πN/2) para N = 2ⁿ: cada 2 bits a mais dobram a referência.
            A escala é log₂, então a altura das barras não é proporcional ao valor. Compare novamente
            para ver quanto a média oscila com outras sementes.
          </p>
        </div>
      </aside>
    </div>
  );
}
