# Validação do módulo Keccak-200 / Pollard Rho

Data: 17/11/2026 (America/Fortaleza).

Implementação concluída no projeto. O módulo agora usa uma esponja didática Keccak[r=120,c=80], baseada em Keccak-f[200], e Floyd para recuperar e verificar um par de entradas distintas em colisão. A metodologia e as escolhas de parâmetros estão em [metodologia-keccak-rho.md](../docs/metodologia-keccak-rho.md).

## Verificações automatizadas

- Compilação TypeScript e build de produção Vite: aprovados, incluindo o bundle separado do Web Worker.
- Suíte completa: 125 testes aprovados em 15 arquivos.
- Cobertura: 99,68% de linhas/instruções, 95,21% de ramificações e 97,82% de funções; os limites existentes foram mantidos.
- Após o último ajuste visual, os nove testes dos fluxos da aplicação e da animação passaram novamente, assim como a compilação.
- git diff --check: aprovado.

O núcleo foi conferido contra os dois vetores completos e os intermediários da rodada 1 do [XKCP](https://github.com/XKCP/XKCP/blob/master/tests/TestVectors/KeccakF-200-IntermediateValues.txt). A esponja foi comparada com uma referência Python independente nos tamanhos de mensagem 0, 1, 14, 15, 16 e 30 bytes, incluindo absorção, padding e squeeze.

Os testes de Floyd cobrem a recuperação do par, uma comparação com uma busca independente por tabela, sementes já no ciclo, pontos fixos, funções sem colisões no domínio, orçamento de avaliações, valores acima de 32 bits e progresso. A busca de produção não usa a tabela de visitados usada como oráculo nos testes.

## Interface e execução real

A versão de produção foi aberta no Chrome 148 em 1440, 390 e 320 px. Foram verificados busca real com 16 bits em worker, progresso e cancelamento com 40 bits, preservação do resultado anterior após cancelar, reprodução de Floyd, as 15 buscas reais da comparação e os detalhes das transformações do primeiro módulo. Iota alterou exatamente uma célula.

Os 49 cenários produziram 6610 medições de texto e 1160 de gráficos/foco sem falhas de contraste detectadas. O [relatório de contraste](contrast-audit.md) documenta o escopo. Os recursos externos ficaram bloqueados nessa sessão; o teste não gravou dados no Supabase remoto e usou fontes de fallback.

Além dos testes, foram concluídas buscas reais com saídas de 4, 6, 8, 16, 24, 32 e 40 bits no ambiente Node.js 24. A busca de 40 bits com semente 7 produziu 5936034 avaliações, cauda 600932, ciclo 1183542, entradas 78444920444 e 440671843965, e resumo comum 528653451738. O cálculo levou aproximadamente 42 segundos nessa execução local; o tempo depende do ambiente.

## Banco de dados

A cadeia completa das três migrations foi aplicada a um PostgreSQL 18 temporário, incluindo uma linha histórica antes da atualização e os novos seeds. Foram verificadas preservação do identificador legacy-toy, gravação do exemplo de 40 bits, rejeição de prova incompleta, rejeição de entradas iguais, rejeição de valores fora do domínio e manutenção das permissões SELECT/INSERT, sem UPDATE/DELETE para anon. O banco temporário foi encerrado após os testes.

**Pendente no ambiente remoto:** aplicar [20261117000000_keccak200_floyd_experiments.sql](../supabase/migrations/20261117000000_keccak200_floyd_experiments.sql) ao Supabase configurado. A aplicação apresenta o resultado local e informa eventual falha de gravação enquanto esse esquema não estiver atualizado. Nenhuma migration foi enviada ao banco remoto durante esta tarefa.
