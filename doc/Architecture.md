# Arquitetura

## Padrão Arquitetural: Monólito Modular (MSC)

O backend do projeto foi desenhado sob o padrão de Monólito Modular, utilizando a arquitetura de camadas MSC (Model-Service-Controller). Esta divisão de responsabilidades garante acoplamento fraco e alta coesão, facilitando a escalabilidade, manutenção e o desenvolvimento de testes automatizados.

### Camadas do Backend

1. **Rotas (Routes):**
   * Ponto de entrada das requisições HTTP da aplicação.
   * Mapeia as URLs e métodos HTTP (GET, POST, etc.) direcionando-os aos respectivos Controllers.

2. **Controladores (Controllers):**
   * Responsáveis pela interface com o protocolo HTTP.
   * Recebem os dados da requisição (`req.params`, `req.query`, `req.body`), realizam validações preliminares (formatos, tipos) e formatam a resposta que será enviada ao cliente em formato JSON.
   * Não contêm regras de negócio; eles delegam o processamento pesado para a camada de Service.

3. **Serviços (Services):**
   * Estão aqui contidas as regras de negócio, algoritmos de cálculo de rotas, lógicas de quarentena de adegas, filtragem geográfica por raio e regras de reputação de usuários (RN01 a RN10).

4. **Modelos (Models):**
   * Responsáveis exclusivamente pela persistência e acesso aos dados.
   * Isolam a complexidade do banco de dados, encapsulando as consultas escritas em Cypher.
   * Mapeiam os resultados do grafo para estruturas de dados TypeScript consumidas pelos Services.

### Benefícios da Arquitetura Escolhida

* **Testabilidade Clara:** Como as regras de negócio estão concentradas na camada de Service, é possível criar testes unitários robustos e isolados.
* **Isolamento da Persistência:** Qualquer alteração na modelagem do banco ou nas queries Cypher é contida na camada de Model, evitando que a complexidade de persistência contamine as regras de negócio ou as rotas.
* **Escalabilidade (Decomposição para Microsserviços):** Embora o sistema seja inicialmente implantado como um monólito para facilitar o desenvolvimento, a separação modular por domínios (`adega`, `user`, `recomendacao`) permite que, se o cálculo de rotas e recomendações se tornar um gargalo de desempenho, esse módulo possa ser facilmente extraído para um microsserviço isolado sem a necessidade de reescrever outras partes do sistema.

- **Tecnologias:** React Native (F), TypeScript (F/B), Node.js (B), Neo4j (DB), AuraDB (Cloud), Firebase (Auth).


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