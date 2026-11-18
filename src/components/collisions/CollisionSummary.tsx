import type { OutputBits, RhoResult } from '../../types/experiments';
import { formatHex } from '../../utils/format';

export default function CollisionSummary({result,bits,elapsedMs}: {result:RhoResult;bits:OutputBits;elapsedMs:number|null}) {
  return (
    <div className="rho-info">
      <div className="metric-card accent"><span>AVALIAÇÕES DE h</span><strong>{result.evaluations.toLocaleString('pt-BR')}</strong><small>Floyd + recuperação + verificação</small></div>
      <div className="metric-card"><span>CAUDA / CICLO</span><strong>{result.cycleStart.toLocaleString('pt-BR')} / {result.cycleLength.toLocaleString('pt-BR')}</strong><small>μ / λ · primeira repetição em {result.collisionIndex.toLocaleString('pt-BR')} passos</small></div>
      <div className="metric-card"><span>RESUMO EM COLISÃO</span><strong>0x{formatHex(result.collisionValue,bits)}</strong><small>semente usada: {result.seed} · {result.attempts} tentativa(s)</small></div>
      {elapsedMs!==null && <div className="metric-card"><span>TEMPO DE CÁLCULO</span><strong>{(elapsedMs/1000).toFixed(2)} s</strong><small>sem gravação e sem reprodução visual</small></div>}
      <div className="method-note"><span className="panel-label">MEMÓRIA DA BUSCA</span><p>Floyd mantém um número constante de estados. O desenho é gerado separadamente e limitado a 24 nós e 49 quadros.</p></div>
    </div>
  );
}
