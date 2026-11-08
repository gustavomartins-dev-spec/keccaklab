# Keccak Lab

Laboratório interativo de criptografia feito com React, TypeScript e Vite.

## Desenvolvimento

Use Node.js 22 ou superior. O arquivo `.nvmrc` padroniza o desenvolvimento em Node.js 24; com NVM instalado, execute `nvm install` e `nvm use` na raiz do projeto.

```sh
npm ci
npm run dev
```

Para gerar a versão de produção, execute `npm run build`. Para conferir essa versão localmente, execute `npm run preview`.

O histórico usa as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Sem elas, os experimentos continuam disponíveis, mas o histórico não é salvo no banco. O arquivo `.env.example` documenta as variáveis necessárias.

## Banco local com Docker

O projeto usa o Supabase CLI 3.0.0, fixado como dependência de desenvolvimento. O CLI gerencia os containers com PostgreSQL, API, Auth e Studio. Realtime, Storage, servidor de e-mail, Edge Functions e Analytics ficam desativados porque não são utilizados pelo laboratório. Veja o [fluxo oficial de desenvolvimento local](https://supabase.com/docs/guides/local-development).

Com o Docker instalado, em execução e acessível ao seu usuário, rode na raiz:

```sh
npm ci
npm run db:start
```

A primeira inicialização baixa as imagens e cria o banco com as migrations e os três experimentos de exemplo de `supabase/seed.sql`. Nas próximas inicializações, o histórico local é preservado.

Para conectar o frontend, copie `.env.example` para `.env.local`, mantendo um eventual arquivo `.env` existente. Se `.env.local` já existir, edite apenas as duas variáveis necessárias. Consulte as credenciais locais:

```sh
npm run db:status
```

Em `.env.local`, mantenha `VITE_SUPABASE_URL=http://127.0.0.1:54321` e preencha `VITE_SUPABASE_ANON_KEY` com a chave pública `Publishable` ou `anon` exibida pelo comando. A variável mantém o nome `ANON_KEY` por compatibilidade com a configuração existente. As chaves `Secret` e `service_role` não pertencem ao frontend.

```sh
npm run dev
```

O Vite dá prioridade a `.env.local` sobre `.env`; reinicie o servidor de desenvolvimento após alterar as variáveis.

| Serviço | Endereço local |
| --- | --- |
| API do Supabase | `http://127.0.0.1:54321` |
| Studio | `http://127.0.0.1:54323` |
| PostgreSQL | `127.0.0.1:54322` |

Comandos de manutenção:

| Comando | Efeito |
| --- | --- |
| `npm run db:stop` | Para os containers, preservando os dados locais. |
| `npm run db:start` | Inicia novamente o ambiente. |
| `npm run db:status` | Exibe os serviços e as credenciais locais. |
| `npm run db:migrate` | Aplica migrations pendentes no banco local. |
| `npm run db:lint` | Analisa os objetos SQL do banco local em execução. |
| `npm run db:reset` | Apaga os dados do banco local e reaplica todas as migrations e o seed. |

O histórico é compartilhado e não exige login. A migration `20261107000000_restrict_experiment_runs_permissions.sql` remove as políticas de alteração e exclusão e concede apenas `SELECT` e `INSERT` a `anon` e `authenticated`. A migration original foi preservada para manter o histórico de bancos que já a aplicaram. Execute `npm run db:migrate` em um ambiente local existente para aplicar a restrição sem apagar seus registros. Esses scripts usam o ambiente local; não aplicam mudanças em um projeto hospedado.

Se o Docker retornar `permission denied` para o socket, o usuário precisa ter acesso ao Docker Engine antes de executar `db:start`. Confira a instalação em [Docker Engine para Linux](https://docs.docker.com/engine/install/linux-postinstall/).

No GitHub, versione `supabase/config.toml`, `supabase/migrations/`, `supabase/seed.sql`, os arquivos de dependências e `.env.example`. Os arquivos `.env`, `.env.local`, o estado temporário do CLI e os dados dos containers ficam fora do repositório.

## Testes

```sh
npm test
npm run test:watch
npm run test:coverage
```

`npm test` executa a suíte uma vez. O modo watch acompanha alterações nos arquivos. O comando de cobertura gera o resumo no terminal e o relatório navegável em `coverage/index.html`.

A suíte usa Vitest, React Testing Library, jest-dom e user-event. Os testes ficam ao lado dos módulos, em arquivos `.test.ts` e `.test.tsx`; `src/test/` contém a configuração compartilhada e as fixtures. O Vitest 3 integra os testes à configuração do Vite 5 ([documentação](https://v3.vitest.dev/guide/)).

Os testes cobrem as propriedades das transformações da implementação didática, a busca de colisões, os temporizadores dos hooks, o histórico, o modo local sem credenciais, a navegação entre telas e o foco dos modais. O Supabase é simulado; a suíte não precisa do `.env` nem de um banco disponível. Os testes de interface usam jsdom e verificam interações e conteúdo; a aparência e a responsividade visual são verificadas no navegador.

A cobertura exige pelo menos 85% de linhas, instruções e funções e 80% de ramificações. O ponto de inicialização do React, os tipos, os próprios testes e o mapa estático dos ícones ficam fora da medição.

## Organização

```text
src/
├── App.tsx                 # Composição da aplicação e navegação entre telas
├── main.tsx                # Inicialização do React
├── index.css               # Entrada dos estilos
├── pages/                  # Telas: visualizador Keccak e busca de colisões
├── components/
│   ├── ui/                 # Elementos reutilizáveis: Icon e Modal
│   ├── layout/             # Estrutura da aplicação, Sidebar e Topbar
│   ├── keccak/             # Matriz, etapas e painel de transformação
│   │   └── diagrams/       # Um componente para cada diagrama didático
│   └── collisions/         # Controles, gráficos, resumo e histórico
├── modals/                 # Conteúdo dos modais específicos da aplicação
├── hooks/                  # Estado e ações dos módulos
├── services/               # Leitura, gravação e mapeamento de dados do Supabase
├── lib/                    # Algoritmos e configuração do cliente Supabase
├── types/                  # Contratos de navegação, Keccak e experimentos
├── constants/              # Etapas, conteúdo didático e opções dos módulos
├── utils/                  # Funções de formatação
├── test/                   # Configuração e fixtures compartilhadas dos testes
└── styles/                 # Estilos separados por responsabilidade
```

As telas compõem os componentes e recebem os controladores dos hooks. Os componentes recebem dados e callbacks por props. O acesso ao banco fica em `services/experimentRuns.ts`; as funções de cálculo ficam em `lib/keccak.ts` e `lib/pollardRho.ts`.

Os hooks são instanciados no `App` para preservar a etapa selecionada, os resultados, a comparação e o histórico ao trocar de tela. A abertura do modal pertence à tela Keccak. O componente `ui/Modal` cuida do foco, da tecla Escape e do bloqueio de rolagem; `modals/TransformationModal` fornece o conteúdo da transformação.

Os estilos são importados por `index.css`. As regras de responsividade ficam em `styles/responsive.css`, após os estilos dos módulos para manter a ordem da cascata.
