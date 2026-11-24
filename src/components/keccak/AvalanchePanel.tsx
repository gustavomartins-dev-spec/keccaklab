import { useEffect, useMemo, useRef, useState } from 'react';
import { KECCAK_STEPS } from '../../constants/keccak';
import {
  countBits,
  flipInputBit,
  getAvalancheDiff,
  getAvalancheProfile,
  getStateAtStep,
  type FlippedBit,
  type StepMode,
} from '../../lib/keccak';
import { formatByte } from '../../utils/format';

interface AvalanchePanelProps {
  round: number;
  step: number;
  mode?: StepMode;
  onSelectRound: (round: number) => void;
}

const TOTAL_BITS = 200;
const COORDS = [0, 1, 2, 3, 4];
const BITS = [0, 1, 2, 3, 4, 5, 6, 7];

/* Chart geometry in CSS pixels: the SVG is drawn at the container's real width, so
   text keeps its size on narrow screens instead of being scaled down. */
const H = 230;
const M = { top: 14, right: 8, bottom: 30, left: 34 };
const PLOT_H = H - M.top - M.bottom;
const Y_TICKS = [0, 50, 100, 150, 200];
const yOf = (bits: number) => M.top + PLOT_H - (bits / TOTAL_BITS) * PLOT_H;

function useElementWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Bar path with 4px rounded top corners, anchored flat on the baseline. */
function barPath(x: number, width: number, top: number, bottom: number): string {
  const r = Math.min(4, width / 2, bottom - top);
  if (r <= 0) return `M${x},${bottom}h${width}`;
  return `M${x},${bottom}V${top + r}Q${x},${top} ${x + r},${top}H${x + width - r}Q${x + width},${top} ${x + width},${top + r}V${bottom}Z`;
}

const percent = (bits: number) => `${((bits / TOTAL_BITS) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export default function AvalanchePanel({ round, step, mode = 'sequential', onSelectRound }: AvalanchePanelProps) {
  const [flipped, setFlipped] = useState<FlippedBit>({ x: 0, y: 0, bit: 0 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [chartRef, W] = useElementWidth<HTMLDivElement>(640);
  const PLOT_W = W - M.left - M.right;

  const profile = useMemo(() => getAvalancheProfile(flipped), [flipped]);
  const original = getStateAtStep(0)[flipped.y][flipped.x];
  const modified = flipInputBit(flipped)[flipped.x + 5 * flipped.y];

  /* Column 0 is the input (1 bit); column r + 1 is the output of round r. */
  const columns = useMemo(
    () => [
      { label: 'E', round: null as number | null, bits: profile.counts[0][0] },
      ...profile.counts.map((steps, r) => ({ label: String(r), round: r as number | null, bits: steps[5] })),
    ],
    [profile],
  );
  const slot = PLOT_W / columns.length;
  const barWidth = Math.max(4, slot - Math.min(8, slot * 0.3));
  /* Below ~22px per column, label every other column to avoid collisions. */
  const showLabel = (i: number) => slot >= 22 || i % 2 === 1;

  const diff = useMemo(() => getAvalancheDiff(profile, round, step, mode), [profile, round, step, mode]);
  const diffBits = countBits(diff);
  const roundCounts = useMemo(
    () =>
      mode === 'sequential'
        ? profile.counts[round]
        : KECCAK_STEPS.map((_, index) => countBits(getAvalancheDiff(profile, round, index, mode))),
    [profile, round, mode],
  );
  const hoveredColumn = hovered === null ? null : columns[hovered];

  const update = (field: keyof FlippedBit) => (event: React.ChangeEvent<HTMLSelectElement>) =>
    setFlipped((current) => ({ ...current, [field]: Number(event.target.value) }));

  return (
    <section className="avalanche-panel" aria-labelledby="avalanche-title">
      <div className="avalanche-heading">
        <div>
          <span className="panel-label">EFEITO AVALANCHE · POR QUE 18 RODADAS</span>
          <h3 id="avalanche-title">Quanto um único bit altera o estado?</h3>
          <p>
            Inverta 1 bit da entrada e compare as duas execuções de Keccak-f[200]. Uma boa
            permutação faz a diferença chegar a cerca de metade dos 200 bits (≈ 100) e permanecer
            ali, de modo que a saída não revela qual bit foi alterado.
          </p>
        </div>
        <div className="avalanche-controls" role="group" aria-label="Bit invertido na entrada">
          <label>
            Lane x
            <select value={flipped.x} onChange={update('x')}>
              {COORDS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label>
            Lane y
            <select value={flipped.y} onChange={update('y')}>
              {COORDS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label>
            Bit
            <select value={flipped.bit} onChange={update('bit')}>
              {BITS.map((v) => <option key={v} value={v}>{v}{v === 0 ? ' (menos sig.)' : v === 7 ? ' (mais sig.)' : ''}</option>)}
            </select>
          </label>
          <code className="avalanche-flip" aria-live="polite">
            A[{flipped.x},{flipped.y}]: {formatByte(original)} → {formatByte(modified)}
          </code>
        </div>
      </div>

      <div className="avalanche-layout">
        <div className="avalanche-card">
          <div className="avalanche-card-title">
            <strong>Bits diferentes ao fim de cada rodada</strong>
            <span>Clique em uma barra para abrir a rodada</span>
          </div>
          <div className="avalanche-chart" ref={chartRef} onMouseLeave={() => setHovered(null)}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bits diferentes por rodada: entrada 1 bit; após a rodada 17, ${columns[columns.length - 1].bits} bits.`}>
              {Y_TICKS.map((tick) => (
                <g key={tick}>
                  <line className="av-grid" x1={M.left} x2={W - M.right} y1={yOf(tick)} y2={yOf(tick)} />
                  <text className="av-axis" x={M.left - 8} y={yOf(tick)} dy="0.32em" textAnchor="end">{tick}</text>
                </g>
              ))}
              {columns.map((column, i) => {
                const x = M.left + i * slot + (slot - barWidth) / 2;
                const top = yOf(column.bits);
                const selected = column.round === round;
                const select = () => column.round !== null && onSelectRound(column.round);
                return (
                  <g
                    key={column.label}
                    className={`av-column ${selected ? 'selected' : ''} ${column.round === null ? 'input' : ''}`}
                    onMouseEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    onClick={select}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        select();
                      }
                    }}
                    role={column.round === null ? undefined : 'button'}
                    tabIndex={column.round === null ? undefined : 0}
                    aria-label={column.round === null ? undefined : `Rodada ${column.round}: ${column.bits} de 200 bits diferentes`}
                    aria-pressed={column.round === null ? undefined : selected}
                  >
                    <rect className="av-hit" x={M.left + i * slot} y={M.top} width={slot} height={PLOT_H} />
                    <path className="av-bar" d={barPath(x, barWidth, top, yOf(0))} />
                    {showLabel(i) && (
                      <text className="av-axis" x={x + barWidth / 2} y={H - M.bottom + 16} textAnchor="middle">{column.label}</text>
                    )}
                  </g>
                );
              })}
              <line className="av-ideal" x1={M.left} x2={W - M.right} y1={yOf(100)} y2={yOf(100)} />
              <text className="av-ideal-label" x={M.left + 6} y={yOf(100) - 6}>50% · ideal</text>
              <line className="av-baseline" x1={M.left} x2={W - M.right} y1={yOf(0)} y2={yOf(0)} />
            </svg>
            {hoveredColumn && hovered !== null && (
              <div
                className="av-tooltip"
                style={{ left: Math.min(Math.max(M.left + (hovered + 0.5) * slot, 70), W - 70), top: yOf(hoveredColumn.bits) }}
                role="presentation"
              >
                <strong>{hoveredColumn.round === null ? 'Entrada' : `Após a rodada ${hoveredColumn.round}`}</strong>
                <span>{hoveredColumn.bits} de 200 bits · {percent(hoveredColumn.bits)}</span>
              </div>
            )}
          </div>
          <div className="chart-legend">
            <span><i className="legend-dot changed" /> bits diferentes (E = entrada)</span>
            <span><i className="legend-line-dashed" /> 100 bits = metade do estado</span>
          </div>
          <details className="avalanche-table">
            <summary>Ver como tabela</summary>
            <table>
              <thead>
                <tr><th scope="col">Ponto</th><th scope="col">Bits diferentes</th><th scope="col">% do estado</th></tr>
              </thead>
              <tbody>
                {columns.map((column) => (
                  <tr key={column.label}>
                    <th scope="row">{column.round === null ? 'Entrada' : `Rodada ${column.round}`}</th>
                    <td>{column.bits}</td>
                    <td>{percent(column.bits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>

        <div className="avalanche-card">
          <div className="avalanche-card-title">
            <strong>
              Diferença bit a bit · rodada {round}, {KECCAK_STEPS[step].label}
              {mode === 'isolated' && step > 0 ? ' isolado' : ''}
            </strong>
            <span>
              {mode === 'isolated'
                ? 'Modo isolado: só a etapa escolhida, aplicada à entrada da rodada'
                : 'Acompanha a rodada e a etapa selecionadas acima'}
            </span>
          </div>
          <div className="avalanche-count" aria-live="polite">
            <strong>{diffBits}</strong> de {TOTAL_BITS} bits diferentes <span>({percent(diffBits)})</span>
          </div>
          <div className="diff-grid" aria-label="Bits que diferem entre as duas execuções, matriz 5 por 5">
            {diff.flatMap((row, y) =>
              row.map((value, x) => (
                <div className="diff-cell" key={`${x},${y}`} title={`A[${x},${y}]: ${value.toString(2).padStart(8, '0')} (XOR)`}>
                  <div className="diff-bits">
                    {BITS.map((i) => {
                      const bit = 7 - i; /* most significant first, as in the state matrix */
                      return <i key={bit} className={(value >> bit) & 1 ? 'on' : ''} />;
                    })}
                  </div>
                </div>
              )),
            )}
          </div>
          <div className="chart-legend">
            <span><i className="legend-dot changed" /> bit diferente</span>
            <span><i className="legend-dot stable" /> bit igual</span>
          </div>
          <div className="round-strip" aria-label={`Bits diferentes em cada etapa da rodada ${round}`}>
            {KECCAK_STEPS.map(({ symbol, label }, index) => (
              <div className={`round-strip-item ${index === step ? 'selected' : ''}`} key={label}>
                <span>{symbol}</span>
                <strong>{roundCounts[index]}</strong>
              </div>
            ))}
          </div>
          <p className="avalanche-note">
            θ espalha a diferença por colunas inteiras; ρ e π apenas mudam os bits de lugar, sem
            alterar a contagem; χ é a única etapa não linear. Depois de poucas rodadas a diferença se
            estabiliza perto de 50%: as rodadas restantes formam a margem de segurança contra
            ataques que exploram a difusão ainda incompleta.
          </p>
        </div>
      </div>
    </section>
  );
}
