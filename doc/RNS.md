### Regras de Negócio

- **RN01 - Raio de Busca Limitado:** O sistema só deve recomendar e incluir no cálculo de rotas adegas que estejam num raio máximo de X quilômetros da localização atual do usuário.

- **RN02 - Requisito de Avaliação Mínima para Destaque:** Para que uma adega seja recomendada dentre as melhores, ela precisa ter um número mínimo de N avaliações, evitando que locais com apenas um voto nota 5 distorçam o algoritmo.

- **RN03 - Dependência de Localização Ativa:** O aplicativo só traçará rotas em tempo real se a permissão de GPS do dispositivo estiver ativa. Caso contrário, o sistema exibirá apenas listagens estáticas baseadas no centro da cidade selecionada.

- **RN04 - Cadastro de Nova Adega:** Um usuário poderá cadastrar uma nova adega caso pela localização em tempo real do seu GPS ou por *pinpoint*, podendo escolher no mapa o local da nova adega.

- **RN05 - Ciclo de Vida da Validação (Quarentena):** Toda nova adega cadastrada por usuários inicia com o status `EM_VALIDACAO`. Ela só mudará para `VERIFICADA` após receber um número mínimo de confirmações de usuários diferentes ou aprovação manual de um administrador.

- **RN06 - Filtro de Confiança no Mapa:** O usuário final terá um botão de filtro no mapa para escolher se deseja visualizar apenas adegas `VERIFICADAS` ou se quer incluir também aquelas que estão `EM_VALIDACAO`.

- **RN07 - Recálculo Dinâmico do Peso das Arestas:** O peso da aresta (relação distância vs. avaliação) entre o Usuário e a Adega deve ser recalculado pela API sempre que o usuário se mover significativamente ou quando a adega receber uma nova avaliação.

- **RN08 - Prevenção de Nós Isolados:** Uma adega só estará visível e ativa para cálculo de rotas se possuir um relacionamento válido de localização com uma cidade ativa `(:Adega)-[:LOCALIZADA_EM]->(:Cidade)` e seu status não estiver como `BLOQUEADO`.

- **RN09 - Reputação do Usuário (Peso do Voto):** No Neo4j, usuários que costumam avaliar e cadastrar locais corretos ganham um atributo `reputacao: "alta"`. O voto de validação (RN05) de um usuário com reputação alta tem peso maior do que o de um usuário recém-criado.

- **RN10 - Personalizar Experiência:** As recomendações funcionaram de acordo com as preferências de tipo de adega o usuário quer visitar. Ex: adega, bar copo sujo, distribuidora.