export default function EntryDiagram() {
  return (
    <div className="diagram entry-diagram">
      <span className="diagram-label">Estrutura do estado</span>
      <div className="entry-structure">
        <div className="entry-grid">
          {Array.from({ length: 25 }).map((_, i) => (
            <div className="entry-cell" key={i}>
              <span>8 bits</span>
            </div>
          ))}
        </div>
        <div className="entry-info">
          <div>
            <strong>5 × 5</strong> posições
          </div>
          <div>
            <strong>8 bits</strong> por lane
          </div>
          <div>
            <strong>200 bits</strong> total
          </div>
        </div>
      </div>
    </div>
  );
}
