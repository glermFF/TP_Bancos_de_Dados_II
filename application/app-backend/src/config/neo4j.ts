import neo4j = require('neo4j-driver');
import dotenv = require('dotenv');

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'senha')
);

// Testar resposta do banco
const verificarConexaoNeo4j = async (): Promise<void> => {
  const session = driver.session();
  try {
    // Query Para checar Status da database
    await session.run('RETURN 1');
    console.log('Conexão com o Neo4j estabelecida com sucesso!');
  } catch (error) {
    console.error('Erro crítico: Não foi possível conectar ao Neo4j.');
    console.error(error);
    process.exit(1);
  } finally {
    await session.close();
  }
};

module.exports = {
  driver,
  verificarConexaoNeo4j,
};