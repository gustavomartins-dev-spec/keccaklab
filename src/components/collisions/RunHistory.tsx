import type { RunRecord } from '../../types/experiments';

interface RunHistoryProps {
  runs: RunRecord[];
}

export default function RunHistory({ runs }: RunHistoryProps) {
  return (
    <div className="history-strip">
      <div>
        <span className="section-kicker">Execuções recentes</span>
        <h3>Seu caderno de laboratório</h3>
      </div>
      <div className="history-list">
        {runs.length === 0 ? (
          <span className="empty-history">
            Execute uma busca para registrar o primeiro experimento.
          </span>
        ) : (
          runs.map((run: RunRecord) => (
            <div className="history-item" key={run.id}>
              <span>{run.bits} bits</span>
              <strong>{run.cycleLength} passos</strong>
              <small>
                {new Date(run.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
