# Modelagem do Banco (Neo4j)

## Nós

```cypher
(:User {
  id: UUID,
  name: String,
  username: String,      // único
  email: String,         // único
  passwordHash: String,  // bcrypt
  reputation: Float,
  createdAt: String, updatedAt: String
})

(:Distillery {
  id: UUID,              // único
  name: String,          // único
  category: String,      // Branca | Envelhecida | Premium | Orgânica | Histórica
  status: String,        // VERIFIED | IN_VALIDATION | BLOCKED
  rating: Float,         // média denormalizada das avaliações
  reviewCount: Integer,  // contagem denormalizada
  founded: Integer?,
  signature: String?,    // rótulo de referência
  tags: [String],
  landmark: Boolean,     // parada emblemática da tradição local
  location: point({latitude, longitude}),  // coordenadas WGS-84 reais
  createdAt: String, updatedAt: String
})

(:City {
  name: String,          // único — cidades reais de Minas Gerais
  region: String,
  location: point({latitude, longitude})
})

(:Review {
  id: UUID,
  title: String,
  body: String,
  rating: Float,         // 0..5
  createdAt: String
})
```

![Diagrama de classes do modelo de dados](diagrams/data-model.svg)

## Relacionamentos

| Padrão | Significado |
|---|---|
| `(:Distillery)-[:LOCATED_IN]->(:City)` | todo alambique pertence a uma cidade real |
| `(:City)-[:ROAD {km}]-(:City)` | malha viária: cada cidade ligada às 3 vizinhas mais próximas |
| `(:User)-[:WROTE]->(:Review)-[:ABOUT]->(:Distillery)` | notas de campo |
| `(:User)-[:SUGGESTED]->(:Distillery)` | parada indicada por usuário (nasce IN_VALIDATION) |

## Constraints

Criadas de forma idempotente pelo script de seed:

```cypher
CREATE CONSTRAINT user_email       IF NOT EXISTS FOR (u:User)       REQUIRE u.email IS UNIQUE;
CREATE CONSTRAINT user_username    IF NOT EXISTS FOR (u:User)       REQUIRE u.username IS UNIQUE;
CREATE CONSTRAINT distillery_id    IF NOT EXISTS FOR (d:Distillery) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT distillery_name  IF NOT EXISTS FOR (d:Distillery) REQUIRE d.name IS UNIQUE;
CREATE CONSTRAINT city_name        IF NOT EXISTS FOR (c:City)       REQUIRE c.name IS UNIQUE;
CREATE CONSTRAINT review_id        IF NOT EXISTS FOR (r:Review)     REQUIRE r.id IS UNIQUE;
```

## Queries principais

1. **Matriz de distâncias para o solver de rotas** — o banco faz a matemática
   espacial; o service roda o TSP sobre o resultado:

```cypher
MATCH (a:Distillery), (b:Distillery)
WHERE a.id IN $ids AND b.id IN $ids AND a.id < b.id
RETURN a.id AS aId, b.id AS bId,
       point.distance(a.location, b.location) AS meters
```

2. **Catálogo com cidade/região**:

```cypher
MATCH (d:Distillery)
WHERE d.status <> 'BLOCKED'
OPTIONAL MATCH (d)-[:LOCATED_IN]->(c:City)
RETURN d, c.name AS city, c.region AS region
ORDER BY d.rating DESC, d.reviewCount DESC
```

3. **Criar avaliação e atualizar a nota denormalizada na mesma instrução**:

```cypher
MATCH (u:User {id: $userId}), (d:Distillery {id: $distilleryId})
CREATE (u)-[:WROTE]->(r:Review {id: $id, title: $title, body: $body,
        rating: $rating, createdAt: toString(datetime())})-[:ABOUT]->(d)
WITH u, r, d
CALL {
  WITH d
  MATCH (:User)-[:WROTE]->(other:Review)-[:ABOUT]->(d)
  RETURN avg(other.rating) AS newRating, count(other) AS newCount
}
SET d.rating = round(newRating * 10) / 10.0, d.reviewCount = newCount
RETURN r
```

4. **Construção da malha ROAD (seed)** — 3 cidades mais próximas por cidade:

```cypher
MATCH (a:City), (b:City) WHERE a.name <> b.name
WITH a, b, point.distance(a.location, b.location) / 1000.0 * 1.27 AS km
ORDER BY a.name, km
WITH a, collect({city: b, km: km})[..3] AS nearest
UNWIND nearest AS n
MERGE (a)-[r:ROAD]-(n.city)
SET r.km = round(n.km)
```

5. **Indicar alambique (quarentena, RN05)**:

```cypher
MATCH (u:User {id: $userId})
MERGE (c:City {name: $city})
CREATE (d:Distillery {id: $id, name: $name, status: 'IN_VALIDATION', ...})
CREATE (u)-[:SUGGESTED {at: datetime()}]->(d)
CREATE (d)-[:LOCATED_IN]->(c)
```

## Dataset do seed

20 cidades reais de Minas Gerais, cobrindo Norte de Minas, São Francisco,
Espinhaço, Central, Metropolitana, Inconfidentes, Vertentes, Sul de Minas,
Canastra, Lago de Furnas, Zona da Mata e Triângulo — e 24 alambiques com
coordenadas reais em nível de cidade, incluindo produtores renomados como
Havana/Anísio Santiago, Seleta, Boazinha e Canarinha (Salinas), Germana (Nova
União), Vale Verde (Betim) e Espírito de Minas (São Tiago). Entradas marcadas
com `landmark: true` são paradas representativas batizadas pela tradição
alambiqueira da cidade; uma delas (Engenho Ponte do Rosário, Tiradentes) nasce
com status `IN_VALIDATION` para exercitar a quarentena (RN05) já no seed.
Três viajantes demo e oito avaliações completam o grafo (login
`demo@cachaceiro.app`, senha definida por `SEED_USER_PASSWORD` no seed).
