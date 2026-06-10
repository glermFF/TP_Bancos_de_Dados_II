# Modelagem do Banco de Dados

### Nós

(:User {
    id: UUID,
    nome: String,
    username: String,
    email: String,
    senha: Hash,
    reputação: Float,
    createdAt: DateTime,
    updatedAt: DateTime
})

(:Adega {
    id: UUID,
    nome: String,
    tipo: String,
    status: String,
    nota: Float,
    localizacao: coord(latitude: Float, longitude: Float),
    createdAt: DateTime,
    updatedAt: DateTime
})

(:Avaliacao {
    id: UUID,
    titulo: String,
    comentario: String,
    nota: Float,
    createdAt: DateTime
})

### Relacionamentos

| (User) - `[:SUGERIU]` -> (Adega) | Registra nova Adega esperando por validação.

| (User) - `[:VISITOU]` -> (Adega) | Registra visita feita por usuário.

| (User) - `[:CRIOU]` -> (Avaliacao) | Registra avaliação feita por usuário.

| (Avaliacao) - `[:SOBRE]` -> (Adega) | Registra avaliação feita em adega.

| (User) - [:VALIDOU] -> (Adega) | Usuário valida adega sugerida.

### Queries

1. Criar novo usuário

```cypher
CREATE (u:User {
    id: randomUUID(),
    nome: $nome,
    username: $username,
    email: $email,
    senha: $senha,
    reputação: 0,
    createdAt: datetime(),
    updatedAt: datetime()
})
```

2. Criar nova adega

```cypher
CREATE (a:Adega {
    id: randomUUID(),
    nome: $nome,
    tipo: $tipo,
    status: 'pending',
    nota: 0,
    localizacao: point({latitude: $latitude, longitude: $longitude}),
    createdAt: datetime(),
    updatedAt: datetime()
})
```

3. Criar nova avaliação

```cypher
CREATE (a:Avaliacao {
    id: randomUUID(),
    titulo: $titulo,
    comentario: $comentario,
    nota: $nota,
    createdAt: datetime()
})
```

4. Validar adega sugerida

```cypher
MATCH (u:User {id: $userId}), (a:Adega {id: $adegaId})
CREATE (u)-[:VALIDOU]->(a)
```

5. Lista de adegas visitadas por um usuário

```cypher
MATCH (u:User {id: $userId})-[v:VISITOU]->(a:Adega)
RETURN a.id AS id, 
       a.nome AS nome, 
       a.tipo AS tipo, 
       v.data AS dataVisita
ORDER BY v.data DESC
```