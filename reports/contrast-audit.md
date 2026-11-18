# Teste de contraste — Keccak Lab

## Revalidação após implementar Keccak-200 e Floyd

A versão de produção com o novo módulo foi verificada em **49 cenários**, sem contraste abaixo do mínimo, exceções de JavaScript ou rolagem horizontal da página. Os diagramas têm rolagem interna no celular para manter os rótulos legíveis.

| Largura | Cenários | Medições de texto | Medições de gráficos/foco | Falhas |
| --- | ---: | ---: | ---: | ---: |
| 1440 px | 17 | 2528 | 434 | 0 |
| 390 px | 16 | 2044 | 363 | 0 |
| 320 px | 16 | 2038 | 363 | 0 |

Total: **6610 medições de texto e 1160 de gráficos/foco**, com repetição dos elementos entre estados. A verificação abrangeu as cinco transformações e seus detalhes, a busca real em worker com 16 bits, a animação, a comparação com cinco sementes por tamanho, o método expandido e o cancelamento de uma busca de 40 bits.

As cores de texto nos ponteiros SVG foram comparadas às formas preenchidas atrás delas, e os contornos dos nós e as setas às superfícies adjacentes. Recursos externos ficaram bloqueados, incluindo fontes web e o banco remoto. Essa validação trata dos estados e critérios de contraste avaliados, sem certificar acessibilidade completa.

O restante deste relatório registra a auditoria de contraste inicial e sua primeira correção.

---

Data: 17/11/2026 (America/Fortaleza).

**Correções concluídas: as 56 combinações da auditoria estática atendem aos mínimos avaliados. A auditoria anterior apresentava 46 combinações abaixo do mínimo.**

**Validação em navegador: nenhum contraste insuficiente nos 54 cenários avaliados, em larguras de 1440, 390 e 320 px.**

## Alterações aplicadas

- Texto secundário e rótulos claros passaram a usar `--muted: #6c637b`, incluindo coordenadas, valores binários, contadores, legendas, navegação, indicadores e rodapés.
- O roxo principal passou a `--accent: #6e43cf`, com hover `#5d32bd`, para atender ao contraste também nos fundos lilás e nos estados selecionados.
- O verde passou a `--accent-2: #16745f`, compartilhado pelo diagrama Chi, pelas linhas do ciclo e pelo aviso da colisão.
- O foco do teclado usa o roxo principal. A seleção de texto recebeu cor explícita para manter a leitura sobre o destaque lilás.
- As linhas dos gráficos e as setas dos diagramas passaram a ter opacidade 1. Barras e marcadores de legenda usam as cores correspondentes do gráfico.
- As células alteradas e seu hover receberam bordas com contraste maior; o marcador de legenda de células estáveis também recebeu borda mais escura.

## Método e limites

A medição usa luminância relativa sRGB e a fórmula `(Lmais_clara + 0,05) / (Lmais_escura + 0,05)`. Foram aplicados os limites de 4,5:1 para texto comum, 3:1 para texto grande e 3:1 para foco e gráficos essenciais. A classificação considera a razão sem arredondamento; as tabelas mostram duas casas decimais. Controles desativados, a marca e bordas decorativas não foram classificados como falhas.

Referências: [WCAG 2.2 — 1.4.3, contraste de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) e [WCAG 2.2 — 1.4.11, contraste não textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

A auditoria estática repetiu as mesmas 56 combinações de cores, resolvendo as variáveis CSS e compondo a opacidade das linhas SVG sobre o fundo. O fundo translúcido do cabeçalho foi aproximado para `#fdfdfe`, e o aviso de colisão para branco; essas aproximações não alteram os resultados. A verificação no navegador usou os estilos computados e a composição dos fundos reais, incluindo o cabeçalho transparente no celular.

A verificação local foi feita no Chrome 148 com uma sessão isolada. Recursos externos, incluindo fontes web, foram bloqueados; foram usadas as fontes de fallback. A verificação se limita aos critérios de contraste e estados descritos aqui, sem certificar a conformidade completa de acessibilidade.

## Auditoria estática: antes e depois

| Elemento / cenário | Antes | Depois | Mínimo | Frente / fundo atuais | Resultado | Origem |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Texto principal | 13.86:1 | 13.86:1 | 4.5:1 | `#29263d` / `#f8f9fc` | Aprovado | [src/styles/base.css:3](../src/styles/base.css#L3) |
| Texto secundário | 5.79:1 | 5.79:1 | 4.5:1 | `#666379` / `white` | Aprovado | [src/styles/base.css:3](../src/styles/base.css#L3) |
| Botão primário | 5.14:1 | 6.24:1 | 4.5:1 | `white` / `#6e43cf` | Aprovado | [src/styles/keccak.css:80](../src/styles/keccak.css#L80) |
| Navegação ativa | 4.37:1 | 5.30:1 | 4.5:1 | `#6e43cf` / `#f0eafa` | Aprovado | [src/styles/layout.css:14](../src/styles/layout.css#L14) |
| Texto de ação | 5.14:1 | 6.24:1 | 4.5:1 | `#6e43cf` / `white` | Aprovado | [src/styles/keccak.css:66](../src/styles/keccak.css#L66) |
| Descrição da página | 4.24:1 | 5.38:1 | 4.5:1 | `#6c637b` / `#f8f9fc` | Aprovado | [src/styles/layout.css:51](../src/styles/layout.css#L51) |
| Legenda e rótulos sobre branco | 4.47:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:39](../src/styles/keccak.css#L39) |
| Títulos da barra lateral | 3.01:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/layout.css:10](../src/styles/layout.css#L10) |
| Versão no rodapé lateral | 2.49:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/layout.css:36](../src/styles/layout.css#L36) |
| Letras gregas na navegação | 2.08:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/layout.css:33](../src/styles/layout.css#L33) |
| Caminho de navegação | 3.33:1 | 5.57:1 | 4.5:1 | `#6c637b` / `#fdfdfe` | Aprovado | [src/styles/layout.css:42](../src/styles/layout.css#L42) |
| Símbolos das etapas não selecionadas | 3.06:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:8](../src/styles/keccak.css#L8) |
| Legenda de etapa | 3.26:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:13](../src/styles/keccak.css#L13) |
| Legenda da etapa selecionada | 2.93:1 | 5.10:1 | 4.5:1 | `#6c637b` / `#f5f1fe` | Aprovado | [src/styles/keccak.css:13](../src/styles/keccak.css#L13) |
| Subtítulo do painel | 4.47:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:23](../src/styles/keccak.css#L23) |
| Etiqueta da rodada | 4.40:1 | 5.57:1 | 4.5:1 | `#6c637b` / `#fdfdff` | Aprovado | [src/styles/keccak.css:24](../src/styles/keccak.css#L24) |
| Eixo da matriz | 2.12:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:28](../src/styles/keccak.css#L28) |
| Coordenadas das colunas da matriz | 2.68:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:29](../src/styles/keccak.css#L29) |
| Coordenadas das linhas da matriz | 2.68:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:30](../src/styles/keccak.css#L30) |
| Valor hexadecimal da célula | 6.97:1 | 6.97:1 | 4.5:1 | `#58516f` / `#f7f7fc` | Aprovado | [src/styles/keccak.css:35](../src/styles/keccak.css#L35) |
| Valor hexadecimal da célula alterada | 4.35:1 | 5.28:1 | 4.5:1 | `#6e43cf` / `#f0e9fd` | Aprovado | [src/styles/keccak.css:36](../src/styles/keccak.css#L36) |
| Valor binário da célula | 2.65:1 | 5.30:1 | 4.5:1 | `#6c637b` / `#f7f7fc` | Aprovado | [src/styles/keccak.css:37](../src/styles/keccak.css#L37) |
| Valor binário da célula alterada | 2.40:1 | 4.79:1 | 4.5:1 | `#6c637b` / `#f0e9fd` | Aprovado | [src/styles/keccak.css:37](../src/styles/keccak.css#L37) |
| Identificador HEX / BIN | 2.72:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:45](../src/styles/keccak.css#L45) |
| Rótulo da saída hexadecimal | 2.84:1 | 5.35:1 | 4.5:1 | `#6c637b` / `#f8f8fc` | Aprovado | [src/styles/keccak.css:47](../src/styles/keccak.css#L47) |
| Saída hexadecimal | 4.56:1 | 4.56:1 | 4.5:1 | `#7a6a99` / `#f8f8fc` | Aprovado | [src/styles/keccak.css:48](../src/styles/keccak.css#L48) |
| Contador no controle de reprodução | 2.71:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:54](../src/styles/keccak.css#L54) |
| Contador da transformação | 2.37:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:59](../src/styles/keccak.css#L59) |
| Descrição da transformação | 4.47:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:62](../src/styles/keccak.css#L62) |
| Coordenadas de valores alterados | 2.65:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:75](../src/styles/keccak.css#L75) |
| Dica de reprodução | 2.67:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/keccak.css:83](../src/styles/keccak.css#L83) |
| Descrição da nota do módulo | 3.39:1 | 4.94:1 | 4.5:1 | `#6c637b` / `#f1eef9` | Aprovado | [src/styles/keccak.css:87](../src/styles/keccak.css#L87) |
| Etiqueta da nota do módulo | 3.71:1 | 5.38:1 | 4.5:1 | `#6c637b` / `#faf8ff` | Aprovado | [src/styles/keccak.css:88](../src/styles/keccak.css#L88) |
| Rodapé da página | 2.29:1 | 5.38:1 | 4.5:1 | `#6c637b` / `#f8f9fc` | Aprovado | [src/styles/keccak.css:89](../src/styles/keccak.css#L89) |
| Descrição dos controles de colisão | 4.47:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/collisions.css:5](../src/styles/collisions.css#L5) |
| Opção de tamanho da saída | 4.47:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/collisions.css:7](../src/styles/collisions.css#L7) |
| Eixos do gráfico do ciclo | 2.57:1 | 5.45:1 | 4.5:1 | `#6c637b` / `#fbfaff` | Aprovado | [src/styles/collisions.css:17](../src/styles/collisions.css#L17) |
| Título do aviso da colisão | 4.18:1 | 5.68:1 | 4.5:1 | `#16745f` / `#fff` | Aprovado | [src/styles/collisions.css:23](../src/styles/collisions.css#L23) |
| Valor do aviso da colisão | 3.17:1 | 5.68:1 | 4.5:1 | `#16745f` / `#fff` | Aprovado | [src/styles/collisions.css:26](../src/styles/collisions.css#L26) |
| Rótulo dos indicadores de colisão | 3.24:1 | 5.40:1 | 4.5:1 | `#6c637b` / `#faf9fd` | Aprovado | [src/styles/collisions.css:31](../src/styles/collisions.css#L31) |
| Valor grande do indicador | 5.12:1 | 5.12:1 | 3:1 | `#7c5ba7` / `#faf9fd` | Aprovado | [src/styles/collisions.css:32](../src/styles/collisions.css#L32) |
| Detalhes dos indicadores de colisão | 2.91:1 | 5.40:1 | 4.5:1 | `#6c637b` / `#faf9fd` | Aprovado | [src/styles/collisions.css:33](../src/styles/collisions.css#L33) |
| Comparação vazia | 3.02:1 | 5.46:1 | 4.5:1 | `#6c637b` / `#fcfaff` | Aprovado | [src/styles/collisions.css:41](../src/styles/collisions.css#L41) |
| Rótulo das barras da comparação | 4.31:1 | 5.46:1 | 4.5:1 | `#6c637b` / `#fcfaff` | Aprovado | [src/styles/collisions.css:45](../src/styles/collisions.css#L45) |
| Valor das barras da comparação | 4.96:1 | 6.02:1 | 4.5:1 | `#6e43cf` / `#fcfaff` | Aprovado | [src/styles/collisions.css:46](../src/styles/collisions.css#L46) |
| Subtítulo da janela de detalhes | 4.47:1 | 5.66:1 | 4.5:1 | `#6c637b` / `white` | Aprovado | [src/styles/modal.css:13](../src/styles/modal.css#L13) |
| Descrição da janela de detalhes | 5.79:1 | 5.79:1 | 4.5:1 | `#666379` / `white` | Aprovado | [src/styles/modal.css:17](../src/styles/modal.css#L17) |
| Fórmula na janela de detalhes | 5.06:1 | 5.06:1 | 4.5:1 | `#77618e` / `#f7f7fc` | Aprovado | [src/styles/modal.css:19](../src/styles/modal.css#L19) |
| Nota do diagrama | 4.18:1 | 5.30:1 | 4.5:1 | `#6c637b` / `#f7f7fc` | Aprovado | [src/styles/diagrams.css:16](../src/styles/diagrams.css#L16) |
| Valor verde no diagrama Chi | 2.97:1 | 5.68:1 | 4.5:1 | `#16745f` / `white` | Aprovado | [src/styles/diagrams.css:146](../src/styles/diagrams.css#L146) |
| Foco do teclado sobre branco | 2.39:1 | 6.24:1 | 3:1 | `#6e43cf` / `white` | Aprovado | [src/styles/base.css:32](../src/styles/base.css#L32) |
| Foco do teclado sobre fundo da página | 2.27:1 | 5.92:1 | 3:1 | `#6e43cf` / `#f8f9fc` | Aprovado | [src/styles/base.css:32](../src/styles/base.css#L32) |
| Linha do percurso no gráfico | 2.89:1 | 6.01:1 | 3:1 | `#6e43cf` / `#fbfaff` | Aprovado | [src/styles/collisions.css:19](../src/styles/collisions.css#L19) |
| Linha do ciclo no gráfico | 2.07:1 | 5.47:1 | 3:1 | `#16745f` / `#fbfaff` | Aprovado | [src/styles/collisions.css:20](../src/styles/collisions.css#L20) |
| Barra experimental | 2.85:1 | 6.02:1 | 3:1 | `#6e43cf` / `#fcfaff` | Aprovado | [src/styles/collisions.css:43](../src/styles/collisions.css#L43) |
| Contorno da barra teórica | 2.87:1 | 5.48:1 | 3:1 | `#16745f` / `#fcfaff` | Aprovado | [src/styles/collisions.css:44](../src/styles/collisions.css#L44) |

## Verificação em navegador

Foram verificadas as seis etapas do visualizador e suas seis janelas de detalhes, o estado inicial, o foco por teclado, uma célula alterada em hover, a página de colisões, a comparação preenchida e uma opção de saída em hover. São 18 cenários por largura de tela.

| Largura | Cenários | Medições de texto | Medições de gráficos/foco | Menor contraste de texto | Menor contraste de gráficos/foco | Falhas | Rolagem horizontal |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1440 px | 18 | 2290 | 256 | 4.56:1 | 5.22:1 | 0 | Não |
| 390 px | 18 | 1950 | 247 | 4.56:1 | 5.22:1 | 0 | Não |
| 320 px | 18 | 1941 | 247 | 4.56:1 | 5.22:1 | 0 | Não |

Total: 6181 medições de texto e 750 de gráficos/foco, sem falhas detectadas. Os mesmos elementos foram medidos em diferentes estados; esses totais não representam elementos únicos. Não houve exceções de JavaScript nos cenários avaliados.

## Validação do projeto

- `npm run build`: aprovado, incluindo a verificação de tipos TypeScript e a geração de produção pelo Vite.
- `npm test`: 77 testes aprovados em 10 arquivos.
- `git diff --check`: aprovado.

As alterações da aplicação se restringem às folhas de estilo. Nenhuma dependência foi adicionada.
