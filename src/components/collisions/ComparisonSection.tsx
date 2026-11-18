import type { ComparisonEntry } from '../../types/experiments';
import { COMPARISON_TRIALS } from '../../constants/experiments';
import ComparisonChart from './ComparisonChart';

interface ComparisonSectionProps { comparison:ComparisonEntry[];onCompare:()=>Promise<void>;busy:boolean }
export default function ComparisonSection({comparison,onCompare,busy}: ComparisonSectionProps) {
  return (
    <div className="comparison-section">
      <div className="comparison-header">
        <div><span className="section-kicker">TAMANHO DA SAÍDA E TRABALHO</span><h3>Passos até a primeira repetição</h3></div>
        <button className="primary-button run-button" onClick={()=>void onCompare()} disabled={busy}>Comparar tamanhos</button>
      </div>
      {comparison.length===0 ? <p className="comparison-empty">Compare saídas de 8, 16 e 24 bits com {COMPARISON_TRIALS} sementes por tamanho. O gráfico mostra a média e a variação entre as buscas.</p> : (
        <>
          <ComparisonChart comparison={comparison}/>
          <div className="comparison-table">
            {comparison.map(entry=>(
              <div className="comparison-row" key={entry.bits}>
                <span className="cmp-bits">{entry.bits} bits · {entry.trials} sementes</span>
                <span className="cmp-iter"><strong>{entry.iterations.toLocaleString('pt-BR',{maximumFractionDigits:1})}</strong> passos em média</span>
                <span className="cmp-expected">mín. {entry.minIterations} · máx. {entry.maxIterations}</span>
                <span className="cmp-expected">referência ≈ {entry.expected.toLocaleString('pt-BR')}</span>
                <span className="cmp-expected">{Math.round(entry.evaluations).toLocaleString('pt-BR')} avaliações de h em média</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="comparison-note"><span className="panel-label">COMO INTERPRETAR</span><p>2<sup>n/2</sup> é uma referência de ordem de grandeza para uma função com saídas uniformes. As barras contam μ + λ passos da trajetória; Floyd avalia h mais vezes para detectar e recuperar a colisão. Cinco sementes são uma amostra didática: uma execução isolada não precisa crescer de forma monotônica. Aumentar n em 2 bits dobra a referência teórica. O gráfico usa escala log₂; no celular, deslize para explorar.</p></div>
    </div>
  );
}
