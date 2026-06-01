# Arquitetura

- Monolítico Modular se baseando no modelo MSC(Model Service Controller) para possível escalabilidade do projeto.

- **Tecnologias:** Reactive Native(F), TypeScript(F/B), Node.js(B), Neo4j(DB), AuraDB(Cloud), FireBase(Auth).

- **Estrutura do Projeto**:
```bash
app-backend/
├── src/
│   ├── config/   # Configurações globais (Banco de dados, Variáveis de ambiente)
│   │   ├── neo4j.ts   # Inicialização e exportação do Driver do Neo4j
│   │   └── database/   # Banco de dados Neo4J
│   │       └── dockerfile   # Imagem personalizada para inicializar neo4J
│   │
│   ├── controllers/  # Recebe HTTP req, chama o Service e cospe JSON
│   │   ├── adegaController.ts  # Busca, detalhes, filtros de adegas
│   │   └── userController.ts   # Cadastro, login, reputação do usuário
│   │
│   ├── services/   # O coração do app (Regras de Negócio e Algoritmos)
│   │   ├── adegaService.ts # Lógica de proximidade, quarentena, etc.
│   │   └── recomendacaoService.ts # Cálculo do peso das arestas e rota no grafo
│   │
│   ├── models/     # Mapeamento de dados e consultas Cypher puras
│   │   ├── adegaModel.ts # Queries de inserção e busca de nós do tipo (:Adega)
│   │   └── userModel.ts  # Queries para nós do tipo (:User)
│   │
│   ├── routes/     # Definição dos Endpoints que o Insomnia vai chamar
│   │   ├── index.ts      # Agrupador central de rotas
│   │   └── adegaRoutes.ts # Rotas tipo GET /adegas/proximas, POST /adegas
│   │
│   ├── middlewares/ # Filtros intermediários (Autenticação, Tratamento de Erros)
│   │   └── errorMiddleware.ts  # Captura erros dos Services
│   │
│   ├── scripts/    # Scripts utilitários de automação e carga de dados
│   │   └── seed.ts   # O script de carga inicial que você pediu!
│   │
│   ├── app.ts      # Configuração do Express (cors, json, middlewares)
│   └── server.ts     # Ponto de entrada (Dá o app.listen na porta 3000)
│
├── .env            # Senhas e portas (NUNCA suba para o GitHub)
├── package.json    # Dependências do Node.js
└── tsconfig.json   # Configurações do compilador TypeScript
```

```bash
app-frontend/
├── src/
│   ├── assets/      # Imagens, ícones, logos e fontes customizadas
│   │
│   ├── components/          # Componentes menores e reutilizáveis
│   │   ├── Botao.tsx        # Botão padrão do app
│   │   ├── CardAdega.tsx    # O "balão" ou card que sobe ao clicar numa adega
│   │   └── InputBusca.tsx   # Barra de pesquisa de adegas
│   │
│   ├── screens/         # As telas completas do aplicativo
│   │   ├── HomeMapa/    # Tela principal com o mapa interativo
│   │   │   └── index.tsx
│   │   ├── Onboarding/  # Tela de seleção de preferências (Copo sujo, adegas...)
│   │   │   └── index.tsx
│   │   └── CadastroAdega/      # Formulário de cadastro de novo ponto
│   │       └── index.tsx
│   │
│   ├── navigation/     # Configuração de rotas e abas (React Navigation)
│   │   ├── index.tsx   # Direciona: se logado vai para App, se não vai para Auth
│   │   ├── AppNavigator.tsx    # Fluxo do Mapa e Detalhes
│   │   └── AuthNavigator.tsx   # Fluxo de Login / Cadastro
│   │
│   ├── services/      # Conexões com o mundo exterior
│   │   └── api.ts    # Configuração do Axios apontando para a API Express
│   │
│   ├── context/                # Estados globais da aplicação (Context API)
│   │   ├── AuthContext.tsx     # Guarda dados do usuário logado e reputação
│   │   └── FiltroContext.tsx   # Guarda os filtros ativos (exibir apenas verificado)
│   │
│   ├── hooks/           # Custom Hooks para limpar a lógica das telas
│   │   └── useLocation.ts  # Centraliza a captura do GPS do celular (Método 1)
│   │
│   └── utils/     # Funções utilitárias e constantes
│       └── formatadores.ts # Formatar distância de metros para km (1000m -> 1km)
│
├── App.tsx     # Componente raiz que envelopa os Contexts e Navigation
├── index.js    # Ponto de entrada nativo do React Native
├── package.json
└── tsconfig.json