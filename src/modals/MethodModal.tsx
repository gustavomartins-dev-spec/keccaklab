import { useEffect, useState } from 'react';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';

interface MethodModalProps {
  onClose: () => void;
  /** Topic shown first (e.g. the comparison topic when opened from that screen). */
  initialTopic?: number;
}

interface Topic {
  /** Short label for the topic tabs. */
  tab: string;
  title: string;
  paragraphs: string[];
}

const METHOD_TOPICS: Topic[] = [
  {
    tab: 'Função h',
    title: 'A função h',
    paragraphs: [
      'h(x) aplica uma esponja Keccak com estado de 200 bits, taxa de 120 bits, capacidade de 80 bits e 18 rodadas, usando as mesmas transformações θ, ρ, π, χ e ι do visualizador. Esta instância didática não é uma função SHA-3 padronizada.',
      'A iteração é xᵢ₊₁ = h(xᵢ). Cada valor é codificado em ⌈n/8⌉ bytes, do menos significativo para o mais significativo (little-endian). Aplica-se o preenchimento pad10*1, com sufixo 0x01, e conservam-se os primeiros n bits da saída. Assim, o resumo pode ser usado como a próxima entrada.',
    ],
  },
  {
    tab: 'Floyd',
    title: 'Floyd: tartaruga e lebre',
    paragraphs: [
      'Na fase de detecção, a tartaruga (T) avança uma aplicação de h e a lebre (L) duas. Depois do encontro, um ponteiro volta à semente; ambos avançam um passo até a entrada do ciclo. Seus predecessores distintos formam a colisão a ≠ b, h(a) = h(b). Se a semente já estiver no ciclo, a busca reinicia com outra semente.',
      'A animação mostra somente a fase de detecção: o encontro dos ponteiros. A colisão é recuperada depois, pelas duas entradas distintas que chegam à entrada do ciclo.',
    ],
  },
  {
    tab: 'Diagrama',
    title: 'Como ler o diagrama',
    paragraphs: [
      'a e b são as entradas distintas da colisão, marcadas com anéis tracejados. Na cauda, os números são índices absolutos; no ciclo, são deslocamentos a partir de xμ. Selecione um nó para consultar seu índice absoluto e valor. No celular, deslize o diagrama para explorar.',
    ],
  },
  {
    tab: 'Limites',
    title: 'Memória e limites',
    paragraphs: [
      'Floyd mantém um número constante de estados. O desenho é uma amostra produzida após o cálculo, limitada a 24 nós e 49 quadros; não armazena a trajetória completa. Há um limite de 20 milhões de avaliações por busca e até 64 sementes por tentativa completa.',
    ],
  },
  {
    tab: 'Comparação',
    title: 'Comparar tamanhos',
    paragraphs: [
      'Para N = 2ⁿ estados, √(πN/2) aproxima a média teórica de μ + λ no modelo de função aleatória. Aumentar n em 2 bits dobra essa referência. As sementes de uma mesma função podem compartilhar trajetórias: a amostra didática não garante coincidência com a média teórica nem valida, sozinha, o algoritmo.',
      'Cada execução sorteia 30 sementes novas por tamanho. Como todas usam a mesma função h, a maioria das trajetórias cai no mesmo ciclo principal: o λ se repete entre as amostras e a média reflete essa função em particular. Por isso ela pode ficar 20–40% longe da referência mesmo com 30 sementes; repetir a comparação mostra quanto ela oscila.',
    ],
  },
  {
    tab: 'O nome',
    title: 'Sobre o nome',
    paragraphs: [
      'O método de Pollard foi proposto originalmente para fatoração; aqui é adaptado à busca de colisões. O nome vem da forma de cauda e ciclo, semelhante à letra ρ. A transformação Rho do Keccak é outra operação: ela apenas rotaciona bits dentro das lanes.',
    ],
  },
];

/** Background on the collision search, one topic at a time, kept out of the main screens. */
export default function MethodModal({ onClose, initialTopic = 0 }: MethodModalProps) {
  const [index, setIndex] = useState(initialTopic);
  const topic = METHOD_TOPICS[index];
  const last = METHOD_TOPICS.length - 1;
  const go = (next: number): void => setIndex(Math.max(0, Math.min(last, next)));

  useEffect(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(last, i + 1));
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [last]);

  return (
    <Modal
      titleId="method-modal-title"
      onClose={onClose}
      header={
        <div>
          <span className="section-kicker">POLLARD RHO · FLOYD</span>
          <h2 id="method-modal-title">Como funciona a busca de colisões</h2>
        </div>
      }
    >
      <div className="method-carousel">
        <nav className="method-tabs" aria-label="Tópicos">
          {METHOD_TOPICS.map((item, i) => (
            <button
              key={item.tab}
              className={i === index ? 'selected' : ''}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => go(i)}
            >
              <span className="method-tab-number">{i + 1}</span>
              {item.tab}
            </button>
          ))}
        </nav>
        <section className="method-slide" aria-live="polite" key={index}>
          <h3>{topic.title}</h3>
          {topic.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </section>
        <div className="method-nav">
          <button className="secondary-button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Tópico anterior">
            <Icon name="arrow-left" size={16} />
          </button>
          <div className="method-dots" aria-hidden="true">
            {METHOD_TOPICS.map((item, i) => (
              <i key={item.tab} className={i === index ? 'on' : ''} />
            ))}
          </div>
          <span className="method-count">
            {index + 1} / {METHOD_TOPICS.length}
          </span>
          <button className="secondary-button" onClick={() => go(index + 1)} disabled={index === last} aria-label="Próximo tópico">
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
