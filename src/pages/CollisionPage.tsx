import CollisionChart from '../components/collisions/CollisionChart';
import CollisionSummary from '../components/collisions/CollisionSummary';
import ComparisonSection from '../components/collisions/ComparisonSection';
import ExperimentControls from '../components/collisions/ExperimentControls';
import type { CollisionExperimentController } from '../hooks/useCollisionExperiment';

export default function CollisionPage({experiment}: {experiment:CollisionExperimentController}) {
  const {bits,setBits,seed,setSeed,result,resultBits,isSaving,job,progress,error,elapsedMs,comparison,execute,compare,cancel}=experiment;
  return (
    <section className="page module-page rho-page">
      <div className="page-heading"><div><span className="section-kicker"><span/>POLLARD RHO PARA COLISÕES</span><h1>Busca de colisões</h1><p className="heading-description">Keccak-f[200] com saída truncada de 4 a 40 bits e detecção de ciclos por Floyd.</p></div></div>
      <ExperimentControls bits={bits} seed={seed} isSaving={isSaving} job={job} progress={progress} onBitsChange={setBits} onSeedChange={setSeed} onRun={execute} onCancel={cancel}/>
      {error && <p className="experiment-message" role="status">{error}</p>}
      <div className="rho-layout"><CollisionChart result={result}/><CollisionSummary result={result} bits={resultBits} elapsedMs={elapsedMs}/></div>
      <ComparisonSection comparison={comparison} onCompare={compare} busy={!!job || isSaving}/>
      <details className="method-details">
        <summary>Entenda o método e a ligação com o visualizador Keccak</summary>
        <p>h(x) aplica uma esponja Keccak com estado de 200 bits, taxa de 120 bits, capacidade de 80 bits e 18 rodadas, usando as mesmas transformações θ, ρ, π, χ e ι do primeiro módulo. Esta instância didática não é uma função SHA-3 padronizada.</p>
        <p>A iteração é xᵢ₊₁ = h(xᵢ). Cada valor é codificado em ⌈n/8⌉ bytes, do menos significativo para o mais significativo (little-endian). Aplica-se o preenchimento pad10*1, com sufixo 0x01, e conservam-se os primeiros n bits da saída. Assim, o resumo pode ser usado como a próxima entrada.</p>
        <p>Na fase de detecção, a tartaruga avança uma aplicação de h e a lebre duas. Depois do encontro, um ponteiro volta à semente; ambos avançam um passo até a entrada do ciclo. Seus predecessores distintos formam a colisão a ≠ b, h(a) = h(b). Se a semente já estiver no ciclo, a busca reinicia com outra semente.</p>
        <p>O método de Pollard foi proposto originalmente para fatoração; aqui é adaptado à busca de colisões. O nome vem da forma de cauda e ciclo, semelhante à letra ρ. A transformação Rho do Keccak é outra operação: ela apenas rotaciona bits dentro das lanes.</p>
        <p>A busca usa memória constante. O desenho é uma amostra limitada, produzida após o cálculo; não armazena a trajetória completa. Há um limite de 20 milhões de avaliações por busca e até 64 sementes por tentativa completa.</p>
      </details>
    </section>
  );
}
