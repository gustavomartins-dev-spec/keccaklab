import type { StepDetail } from '../types/keccak';

export const STEP_DETAILS: StepDetail[] = [
  {
    symbol: '∎',
    name: 'Entrada',
    title: 'Estado inicial',
    shortDescription:
      'A mensagem é absorvida em uma matriz 5×5 de lanes de 8 bits. Ponto de partida — nenhuma transformação aplicada.',
    description:
      'A mensagem é absorvida e disposta em uma matriz 5×5 de lanes. No Keccak-200, cada lane contém 8 bits (200 bits ÷ 25 posições = 8). Este é o ponto de partida — nenhuma transformação foi aplicada ainda.',
    formula: 'A[x][y] ← mensagem absorvida',
    effect: 'Nenhuma alteração. O estado reflete a entrada original antes de iniciar a rodada.',
    steps: [
      'A mensagem é dividida em blocos de 8 bits.',
      'Cada bloco é colocado em uma posição (x, y) da matriz 5×5.',
      'O estado agora tem 25 lanes × 8 bits = 200 bits totais.',
    ],
  },
  {
    symbol: 'θ',
    name: 'Theta',
    title: 'Difusão por paridade de colunas',
    shortDescription:
      'Calcula a paridade de cada coluna e combina com as vizinhas. Uma mudança em um bit se espalha por várias posições.',
    description:
      'O Theta primeiro calcula o XOR (paridade) dos 5 elementos de cada uma das 5 colunas, produzindo C[x]. Em seguida combina a paridade da coluna anterior com uma versão rotacionada em 1 bit da paridade da coluna seguinte, produzindo D[x]. Esse valor D[x] é então aplicado por XOR a todos os 5 elementos da própria coluna. Assim, uma alteração em um único bit influencia as paridades e, consequentemente, várias posições do estado.',
    formula:
      'C[x] = A[x,0] ⊕ A[x,1] ⊕ A[x,2] ⊕ A[x,3] ⊕ A[x,4]\nD[x] = C[x−1] ⊕ ROT(C[x+1], 1)\nA′[x,y] = A[x,y] ⊕ D[x]',
    effect:
      'Propaga diferenças entre colunas: uma mudança em um único bit afeta a paridade de sua coluna, que por sua vez modifica os valores de D das colunas vizinhas, e esses valores são aplicados a todas as 5 posições de cada coluna.',
    steps: [
      'Calcula a paridade C[x] de cada coluna (XOR dos 5 elementos).',
      'Combina C[x−1] com ROT(C[x+1], 1) para obter D[x].',
      'Aplica D[x] via XOR a todos os 5 elementos da coluna x.',
    ],
  },
  {
    symbol: 'ρ',
    name: 'Rho',
    title: 'Rotação de bits dentro de cada lane',
    shortDescription:
      'Cada lane é rotacionada por um deslocamento que depende de sua posição (x, y). Bits que saem reentram do outro lado.',
    description:
      'Cada lane é rotacionada por um deslocamento que depende de sua posição (x, y). O deslocamento segue uma tabela fixa definida na especificação do Keccak: r = (x + 2y) mod 7. Bits que saem pela esquerda reentram pela direita, preservando o número total de bits em cada lane.',
    formula: 'A′[x,y] = ROT(A[x,y], r[x,y])\nonde r[x,y] = (x + 2y) mod 7',
    effect:
      'Espalha bits dentro de cada lane em magnitudes diferentes, quebrando alinhamentos entre colunas e aumentando a difusão iniciada por θ.',
    steps: [
      'Cada lane A[x,y] é rotacionada em r[x,y] bits.',
      'O deslocamento r depende da posição: r = (x + 2y) mod 7.',
      'A rotação é circular: bits que saem de um lado reentram pelo outro.',
    ],
  },
  {
    symbol: 'π',
    name: 'Pi',
    title: 'Permutação de posições das lanes',
    shortDescription:
      'Reposiciona as lanes dentro da matriz. Nenhum bit é alterado — apenas movido de lugar.',
    description:
      'Reposiciona as lanes dentro da matriz. A lane na posição (x, y) move para a posição (y, (2x + 3y) mod 5). Esta transposição troca linhas por colunas e vice-versa, redistribuindo bits que estavam alinhados em direções diferentes.',
    formula: 'A′[y][(2x + 3y) mod 5] = A[x][y]',
    effect:
      'Garante que bits que estavam na mesma linha ou coluna sejam redistribuídos em direções diferentes, completando a difusão iniciada por θ e ρ.',
    steps: [
      'A lane em (x, y) move para a posição (y, (2x + 3y) mod 5).',
      'A matriz é efetivamente transposta e redistribuída.',
      'Nenhum bit é alterado — apenas reposicionado.',
    ],
  },
  {
    symbol: 'χ',
    name: 'Chi',
    title: 'Substituição não-linear entre vizinhos',
    shortDescription:
      'A única etapa não-linear. Combina cada lane com as duas próximas usando NOT e AND, criando confusão.',
    description:
      'É a única operação não-linear da rodada. Processa cada uma das 5 linhas da matriz: cada lane de saída é calculada combinando a lane atual com as duas próximas lanes da mesma linha, usando XOR, NOT e AND. O AND introduz uma interação multiplicativa entre bits, criando não-linearidade. Sem esta etapa, a função de rodada seria inteiramente linear e trivialmente reversível.',
    formula: 'A′[x,y] = A[x,y] ⊕ (¬A[x+1,y] ∧ A[x+2,y])',
    effect:
      'Introduz não-linearidade (grau algébrico 2) na rodada. O AND atua como uma "condição": o resultado só é 1 se a próxima lane tiver 0 E a lane seguinte tiver 1. É o ingrediente que impede a rodada inteira de ser uma transformação linear.',
    steps: [
      'Para cada lane, pega as duas próximas lanes da mesma linha.',
      'Calcula (NOT próxima) AND (seguinte).',
      'Faz XOR do resultado com a lane atual.',
      'Repete para todas as 5 lanes de cada linha (índices módulo 5).',
    ],
  },
  {
    symbol: 'ι',
    name: 'Iota',
    title: 'Quebra de simetria com constante de rodada',
    shortDescription:
      'Faz XOR da lane A[0,0] com uma constante única por rodada. Impede que todas as rodadas sejam idênticas.',
    description:
      'É a última etapa de cada rodada. Faz XOR entre a lane A[0,0] e uma constante de rodada RC[i] específica daquela rodada. No Keccak-200, como cada lane possui 8 bits, a constante é truncada para 8 bits. Como cada rodada utiliza uma constante diferente, o Iota impede que todas as rodadas tenham exatamente o mesmo comportamento, quebrando simetrias que poderiam existir na permutação.',
    formula: 'A′[0][0] = A[0][0] ⊕ RC[i]',
    effect:
      'Quebra a simetria entre rodadas. Sem o Iota, todas as rodadas executariam exatamente as mesmas operações (θ→ρ→π→χ), criando uma estrutura simétrica explorável por atacantes. As constantes vêm de um LFSR e são predefinidas.',
    steps: [
      'Seleciona a constante de rodada RC[i] para a rodada atual.',
      'Faz XOR apenas com a lane A[0,0] (as demais não são alteradas diretamente).',
      'As próximas rodadas (θ, ρ, π, χ) propagam essa diferença pelo estado.',
    ],
  },
];
