# Metodologia dos módulos Keccak e Pollard Rho

A aplicação usa uma construção didática de hash baseada na permutação oficial Keccak-f[200]. Ela permite observar colisões com saída reduzida. Os resultados não são colisões contra SHA3-256 ou contra outra instância padronizada de SHA-3.

## Núcleo compartilhado

O estado contém 25 lanes de 8 bits, organizadas como A[x,y]. Na memória e na serialização, a lane ocupa o índice x + 5y; as matrizes da interface são acessadas como matriz[y][x].

Keccak-f[200] executa 18 rodadas. Cada rodada aplica θ, ρ, π, χ e ι. Os deslocamentos de ρ são os oficiais, reduzidos módulo 8; π envia (x,y) para (y,(2x+3y) mod 5); ι altera somente A[0,0], usando a constante da rodada. O primeiro módulo mostra as cinco etapas da primeira rodada sobre um estado fixo. O segundo usa as mesmas funções dentro de cada avaliação do hash.

A implementação completa e os intermediários são conferidos contra os [vetores oficiais do XKCP](https://github.com/XKCP/XKCP/blob/master/tests/TestVectors/KeccakF-200-IntermediateValues.txt). A estrutura da permutação e da esponja segue a [especificação resumida da equipe Keccak](https://keccak.team/keccak_specs_summary.html).

## Definição de h e realimentação

A instância escolhida é Keccak[r=120,c=80], usando Keccak-f[200], com:

| Parâmetro | Valor |
| --- | --- |
| Estado | 200 bits |
| Lanes | 8 bits |
| Rodadas | 18 |
| Taxa r | 120 bits, 15 bytes |
| Capacidade c | 80 bits |
| Padding | pad10*1, sufixo delimitado 0x01 |
| Saída da experiência | 4, 6, 8, 12, 16, 20, 24, 28, 32, 36 ou 40 bits |

Para uma saída de n bits, um estado inteiro x no intervalo [0,2ⁿ) é representado em exatamente ⌈n/8⌉ bytes little-endian, incluindo zeros à esquerda na representação numérica quando necessário. O padding é aplicado depois desses bytes. Extraem-se ⌈n/8⌉ bytes da esponja e conservam-se os primeiros n bits, seguindo a convenção de bits menos significativos primeiro do Keccak.

Essa codificação é injetiva para o domínio escolhido. Define-se, assim, hₙ:[0,2ⁿ)→[0,2ⁿ), e cada saída volta a ser uma entrada válida: xᵢ₊₁=hₙ(xᵢ). A implementação usa aritmética de inteiros exatos de JavaScript para valores até 40 bits; não usa máscaras de 32 bits para truncar o estado completo.

Ao mudar n, a largura da codificação da entrada também pode mudar. A comparação, portanto, reúne instâncias hₙ com o mesmo núcleo e parâmetros de esponja, cada uma com sua codificação documentada. Não se pretende comparar mensagens textuais iguais entre todas as larguras.

## Detecção e recuperação da colisão

O método de Pollard foi originalmente apresentado para fatoração; a aplicação aqui adapta a ideia de caminhadas e detecção de ciclos à busca de colisões em hash. A abordagem de colisões sem uma tabela de visitados é discutida no [Handbook of Applied Cryptography, seção 9.7.1(ii)](https://cacr.uwaterloo.ca/hac/about/chap9.pdf). O trabalho original é [Pollard, A Monte Carlo Method for Factorization, 1975](https://www.cs.cmu.edu/afs/cs/academic/class/15451-f11/www/lectures/lect1122_Pollard.pdf).

Pseudocódigo da busca implementada:

```text
para cada semente candidata, até o limite:
    tartaruga ← h(semente)
    lebre ← h(h(semente))
    enquanto tartaruga ≠ lebre:
        tartaruga ← h(tartaruga)
        lebre ← h(h(lebre))

    guardar o passo e o valor desse encontro
    tartaruga ← semente
    μ ← 0

    enquanto tartaruga ≠ lebre:
        a ← tartaruga
        b ← lebre
        tartaruga ← h(tartaruga)
        lebre ← h(lebre)
        μ ← μ + 1

    se μ = 0:
        tentar outra semente
        # Não há dois predecessores distintos observados nessa caminhada.

    resumo ← tartaruga
    percorrer o ciclo uma vez para medir λ

    verificar a ≠ b
    verificar h(a) = resumo e h(b) = resumo
    devolver a, b, resumo, μ, λ e os contadores
```

O encontro de Floyd identifica um ciclo; não basta, sozinho, para provar uma colisão entre entradas distintas. A fase seguinte recupera os predecessores da entrada do ciclo, um vindo da cauda e outro do próprio ciclo. O resultado só é apresentado depois da verificação explícita.

Se a semente já estiver no ciclo, tenta-se a próxima semente, módulo 2ⁿ. O resultado registra a semente solicitada, a semente efetivamente usada e o número de tentativas. São permitidas até 64 sementes, respeitando um orçamento total de 20 milhões de avaliações por busca. Falhas e limites não produzem uma colisão fictícia.

## Contadores e comparação

O primeiro estado é x₀=semente. A cauda tem comprimento μ e o ciclo tem comprimento λ. A primeira repetição ocorre em x[μ+λ]=x[μ]. O número de passos dessa trajetória é μ+λ.

O contador de avaliações inclui todas as aplicações de h feitas por Floyd: detecção, recuperação, medição do ciclo, tentativas anteriores e verificação do par. Ele é maior que a quantidade de passos da trajetória e não inclui a geração posterior do desenho.

A comparação executa cinco sementes determinísticas por tamanho, nas saídas de 8, 16 e 24 bits. Para cada tamanho, apresenta média, mínimo e máximo de μ+λ e a média de avaliações efetivas. A referência 2^(n/2) indica ordem de grandeza para saídas aproximadamente uniformes; ela não é uma previsão exata nem exige crescimento monotônico entre execuções individuais. O gráfico usa escala logarítmica base 2, indicada no eixo, para tornar visíveis as três ordens de grandeza.

Essas cinco sementes são uma amostra pedagógica, não um experimento estatístico conclusivo nem uma estimativa formal da segurança desta instância.

## Memória e visualização

A busca guarda apenas uma quantidade fixa de estados, contadores e buffers do Keccak. Ela não retém uma tabela de visitados nem a trajetória completa. Para uma largura fixa, o custo de memória da busca é constante em relação ao número de passos.

O desenho é produzido separadamente com no máximo 24 nós e 49 quadros. Trajetórias curtas aparecem completas; trajetórias longas mostram um trecho inicial da cauda, um trecho do ciclo e seus predecessores, sinalizando as omissões por reticências. A reprodução apresenta até 48 passos iniciais de Floyd e, quando necessário, um salto identificado para o encontro final. Os ponteiros são posicionados pelo índice canônico dentro da cauda ou do ciclo; estados não desenhados aparecem no trecho resumido.

D3 gera as curvas do ciclo, as linhas da cauda e a escala da comparação; React mantém os controles e os elementos SVG. O cálculo pesado ocorre em Web Worker, que pode ser encerrado pelo usuário. O tempo de cálculo mostrado não inclui o salvamento no banco nem a reprodução visual.

A transformação ρ do Keccak rotaciona bits dentro das lanes. O nome rho do método de Pollard se refere ao formato de cauda e ciclo. São conceitos diferentes.

## Persistência e compatibilidade

A migration 20261117000000_keccak200_floyd_experiments.sql amplia os tamanhos de saída permitidos e acrescenta semente, par de entradas, resumo, avaliações e identificador do método. Registros anteriores são preservados com o identificador legacy-toy; novas execuções usam keccak-f200-floyd-v1. Os novos valores usam bigint no banco, suficientes para 40 bits.

O campo histórico iterations passa a armazenar μ+λ nos novos registros; hash_evaluations armazena o total de avaliações de h. Os campos não devem ser tratados como equivalentes ao analisar dados de métodos diferentes. A aplicação continua operando localmente quando não existe configuração de banco. Se uma gravação configurada falha, o resultado fica visível e a interface informa que o histórico não pôde ser salvo.

## Evidências de execução

Uma execução local com semente solicitada 7 produziu:

| Saída | Semente usada | μ | λ | Avaliações de h | Entradas distintas | Resumo |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| 4 bits | 7 | 1 | 4 | 20 | 7 e 6 | 10 |
| 8 bits | 8 | 3 | 12 | 92 | 98 e 80 | 84 |
| 16 bits | 7 | 17 | 356 | 1460 | 41983 e 23879 | 44562 |
| 24 bits | 7 | 3263 | 2016 | 20640 | 7849305 e 9669919 | 697931 |
| 32 bits | 7 | 28539 | 1798 | 145182 | 2861815629 e 2880245967 | 3650584126 |
| 40 bits | 7 | 600932 | 1183542 | 5936034 | 78444920444 e 440671843965 | 528653451738 |

Os números da tabela estão em decimal. Todos os pares foram verificados pela própria função hₙ. Esses dados são reproduzíveis com os parâmetros e a codificação descritos acima.
