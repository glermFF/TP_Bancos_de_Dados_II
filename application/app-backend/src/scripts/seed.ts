import neo4j = require('neo4j-driver');
import dotenv = require('dotenv');

dotenv.config();

// Configura o Driver (Puxando as credenciais do seu arquivo .env)
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'senha')
);

// Dados fictícios da sua cidade piloto para testar as regras de negócio
const CIDADE_PILOTO = { nome: 'Piracicaba', estado: 'SP' };

const ADEGAS_INICIAIS = [
  { nome: 'Adega Central', lat: -22.7251, lon: -47.6476, nota: 4.8, status: 'VERIFICADA' },
  { nome: 'Distribuidora do Zé', lat: -22.7312, lon: -47.6512, nota: 4.2, status: 'VERIFICADA' },
  { nome: 'Bar do Copo Cheio', lat: -22.7205, lon: -47.6410, nota: 3.9, status: 'VERIFICADA' },
  { nome: 'Adega Nova (Em Teste)', lat: -22.7280, lon: -47.6440, nota: 5.0, status: 'EM_VALIDACAO' } // Testa a RN05/RN06
];

async function popularBanco() {
  const session = driver.session();
  console.log('Iniciando payload para o Neo4j...');

  try {
    // 1. Cria ou limpa o nó da Cidade Piloto
    await session.run(
      `MERGE (c:Cidade {nome: $nome, estado: $estado})`,
      CIDADE_PILOTO
    );
    console.log(`Cidade [${CIDADE_PILOTO.nome}] garantida no grafo.`);

    for (const adega of ADEGAS_INICIAIS) {
      await session.run(
        `MATCH (c:Cidade {nome: $cidadeNome})
         MERGE (a:Adega {nome: $nome})
         ON CREATE SET a.lat = $lat, 
                       a.lon = $lon, 
                       a.nota = $nota, 
                       a.status = $status
         MERGE (a)-[:LOCALIZADA_EM]->(c)`,
        {
          cidadeNome: CIDADE_PILOTO.nome,
          ...adega
        }
      );
      console.log(`📌 Adega "${adega.nome}" injetada e conectada a ${CIDADE_PILOTO.nome}.`);
    }

    console.log('Grafo populado com sucesso para os testes iniciais!');
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

popularBanco();