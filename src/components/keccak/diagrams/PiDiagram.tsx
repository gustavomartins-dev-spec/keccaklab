import { getPiMap } from '../../../lib/keccak';

export default function PiDiagram() {
  const piMap = getPiMap();
  return (
    <div className="diagram pi-diagram">
      <span className="diagram-label">Mapeamento de posições: (x,y) → (y, (2x+3y) mod 5)</span>
      <div className="pi-map-list">
        {piMap.slice(0, 10).map((entry, i) => (
          <div className="pi-map-item" key={i}>
            <span className="pi-from">
              [{entry.from[0]},{entry.from[1]}]
            </span>
            <span className="pi-arrow">→</span>
            <span className="pi-to">
              [{entry.to[0]},{entry.to[1]}]
            </span>
          </div>
        ))}
        <span className="pi-more">+ 15 outras posições</span>
      </div>
      <div className="diagram-note">
        Nenhum bit é alterado — apenas reposicionado. A matriz é transposta e redistribuída.
      </div>
    </div>
  );
}
