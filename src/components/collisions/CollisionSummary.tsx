import type { OutputBits, RhoResult } from '../../types/experiments';
import { formatHex } from '../../utils/format';

interface CollisionSummaryProps {
  result: RhoResult;
  bits: OutputBits;
  elapsedMs: number | null;
}

export default function CollisionSummary({ result, bits, elapsedMs }: CollisionSummaryProps) {
  return (
    <div className="rho-info">
      <div className="collision-proof" aria-label="Verificação da colisão">
        <strong>Colisão verificada: a ≠ b e h(a) = h(b)</strong>
        <code>a = 0x{formatHex(result.collisionInputs[0], bits)}</code>
        <code>b = 0x{formatHex(result.collisionInputs[1], bits)}</code>
        <code>h(a) = h(b) = 0x{formatHex(result.collisionValue, bits)}</code>
        <small>a e b aparecem no diagrama com anéis tracejados.</small>
      </div>
      <div className="metric-grid">
        <div className="metric-card accent">
          <span>AVALIAÇÕES DE h</span>
          <strong>{result.evaluations.toLocaleString('pt-BR')}</strong>
          <small>Floyd + recuperação + verificação</small>
        </div>
        <div className="metric-card">
          <span>CAUDA / CICLO</span>
          <strong>
            {result.cycleStart.toLocaleString('pt-BR')} / {result.cycleLength.toLocaleString('pt-BR')}
          </strong>
          <small>μ / λ · 1ª repetição em {result.collisionIndex.toLocaleString('pt-BR')} passos</small>
        </div>
        <div className="metric-card">
          <span>RESUMO EM COLISÃO</span>
          <strong>0x{formatHex(result.collisionValue, bits)}</strong>
          <small>
            semente {result.seed} · {result.attempts} tentativa(s)
          </small>
        </div>
        <div className="metric-card">
          <span>TEMPO DE CÁLCULO</span>
          <strong>{elapsedMs === null ? '—' : `${(elapsedMs / 1000).toFixed(2)} s`}</strong>
          <small>{elapsedMs === null ? 'execute uma busca para medir' : 'sem gravação nem animação'}</small>
        </div>
      </div>
    </div>
  );
}
