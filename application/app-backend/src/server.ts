const app = require('./app');
const { verificarConexaoNeo4j } = require('./config/neo4j');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  console.log('⏳ Inicializando sistemas...');

  // 1. Garante que o banco de grafos está ativo antes de aceitar requisições
  await verificarConexaoNeo4j();

  // 2. Levanta o servidor Express na porta desejada
  app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta http://localhost:${PORT}`);
    console.log(`Rota de teste disponível em: http://localhost:${PORT}/health`);
  });
};

iniciarServidor();