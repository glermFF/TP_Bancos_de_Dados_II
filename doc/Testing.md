# Testes

### Imagem docker

Executar banco de dados localmente

```bash
# Emcaminhar para o seguinte diretório
cd /application/app-backend/src/config/database

docker-compose up -d 
```

### Dependências npm

Instalar as dependências necessaŕias e testar a aplicação

**Backend**

```bash
cd /application/app-backend
npm install 
```

**Frontend**

```bash
cd /application/app-frontend
npm install 
```

### Teste Backend

**!! Importante !!**
Crie o arquivo .env em */applications/app-backend* com as seguintes informações para o build da imagem funcionar:

- PORT
- NEO4J_URI
- NEO4J_USER
- NEO4J_PASSWORD

```bash
cd /application/app-backend
npm run backend # Inicia backend na porta 3000 conectando com o Neo4j 
```

### Test Frontend (Desktop)

```bash
cd /application/app-frontend
npm run web # Inicia protótipo para testes do front na porta padrão 
```

### Test Frontend (Mobile)

Para facilitar testes de usabilidade foi escolhido o Expo Go. Instale no celular e escaneie o QR Code gerado assim que executado o seguinte comando:

```bash
cd /application/app-frontend
npx expo start # Inicia protótipo mobile com Expo Go
```