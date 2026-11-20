import type { ComparisonEntry } from '../../types/experiments';
import { COMPARISON_TRIALS } from '../../constants/experiments';
import ComparisonChart from './ComparisonChart';

interface ComparisonSectionProps { comparison:ComparisonEntry[];onCompare:()=>Promise<void>;busy:boolean }
export default function ComparisonSection({comparison,onCompare,busy}: ComparisonSectionProps) {
  return (
    <div className="comparison-section">
      <div className="comparison-header">
        <div><span className="section-kicker">TAMANHO DA SAÍDA E TRABALHO</span><h3>Comprimento de ρ até a primeira repetição</h3></div>
        <button className="primary-button run-button" onClick={()=>void onCompare()} disabled={busy}>Comparar tamanhos</button>
      </div>
      {comparison.length===0 ? <p className="comparison-empty">Compare saídas de 8, 16 e 24 bits com {COMPARISON_TRIALS} sementes por tamanho. O gráfico mostra a média e a variação entre as buscas.</p> : (
        <>
          <ComparisonChart comparison={comparison}/>
          <div className="comparison-table">
            {comparison.map(entry=>(
              <div className="comparison-row" key={entry.bits}>
                <span className="cmp-bits">{entry.bits} bits · {entry.trials} sementes</span>
                <span className="cmp-iter"><strong>{entry.iterations.toLocaleString('pt-BR',{maximumFractionDigits:1})}</strong> estados em média (μ + λ)</span>
                <span className="cmp-expected">mín. {entry.minIterations} · máx. {entry.maxIterations}</span>
                <span className="cmp-expected">esperado ≈ {entry.expected.toLocaleString('pt-BR')}</span>
                <span className="cmp-expected">{Math.round(entry.evaluations).toLocaleString('pt-BR')} avaliações de h em média</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="comparison-note"><span className="panel-label">COMO INTERPRETAR</span><p>Para N = 2ⁿ estados, √(πN/2) aproxima a média teórica de μ + λ no modelo de função aleatória. As barras mostram o comprimento da trajetória até a primeira repetição; o custo de Floyd em avaliações de h aparece na tabela. As sementes de uma mesma função podem compartilhar trajetórias: esta amostra didática não garante coincidência com a média teórica nem valida, sozinha, o algoritmo. Aumentar n em 2 bits dobra a referência teórica. A escala é log₂: a altura das barras não é proporcional ao valor. No celular, deslize para explorar.</p></div>
    </div>
  );
}
