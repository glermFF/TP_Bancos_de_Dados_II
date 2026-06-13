import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { closeDriver, run, verifyConnection } from '../config/neo4j';

interface CitySeed { name: string; region: string; lat: number; lon: number; }

const CITIES: CitySeed[] = [
  { name: 'Salinas', region: 'Norte de Minas', lat: -16.1703, lon: -42.2914 },
  { name: 'Januária', region: 'São Francisco', lat: -15.4894, lon: -44.3679 },
  { name: 'Diamantina', region: 'Espinhaço', lat: -18.2419, lon: -43.6027 },
  { name: 'Nova União', region: 'Central', lat: -19.6864, lon: -43.5807 },
  { name: 'Betim', region: 'Metropolitana', lat: -19.9668, lon: -44.1983 },
  { name: 'Ouro Preto', region: 'Inconfidentes', lat: -20.3856, lon: -43.5035 },
  { name: 'Tiradentes', region: 'Vertentes', lat: -21.1106, lon: -44.1771 },
  { name: 'Prados', region: 'Vertentes', lat: -21.0656, lon: -44.0764 },
  { name: 'Coronel Xavier Chaves', region: 'Vertentes', lat: -21.0292, lon: -44.2206 },
  { name: 'São Tiago', region: 'Vertentes', lat: -20.9111, lon: -44.5097 },
  { name: 'Perdões', region: 'Sul de Minas', lat: -21.0911, lon: -45.0911 },
  { name: 'São Roque de Minas', region: 'Canastra', lat: -20.2461, lon: -46.3653 },
  { name: 'Capitólio', region: 'Lago de Furnas', lat: -20.6153, lon: -46.0494 },
  { name: 'Mariana', region: 'Inconfidentes', lat: -20.3778, lon: -43.4165 },
  { name: 'Ouro Branco', region: 'Inconfidentes', lat: -20.5246, lon: -43.6919 },
  { name: 'Guaraciaba', region: 'Zona da Mata', lat: -20.5719, lon: -43.0117 },
  { name: 'Uberaba', region: 'Triângulo', lat: -19.7472, lon: -47.9381 },
  { name: 'Uberlândia', region: 'Triângulo', lat: -18.9188, lon: -48.2768 },
  { name: 'Monte Alegre de Minas', region: 'Triângulo', lat: -18.8703, lon: -48.8811 },
  { name: 'Prata', region: 'Triângulo', lat: -19.3087, lon: -48.9276 },
];

interface DistillerySeed {
  name: string;
  city: string;
  category: string;
  status?: 'VERIFIED' | 'IN_VALIDATION';
  rating: number;
  founded: number | null;
  signature: string | null;
  tags: string[];
  lat: number;
  lon: number;
  landmark?: boolean;
}

const DISTILLERIES: DistillerySeed[] = [
  { name: 'Cachaça Havana — Anísio Santiago', city: 'Salinas', category: 'Envelhecida', rating: 5.0, founded: 1943, signature: 'Anísio Santiago 12 anos', tags: ['barris de bálsamo', 'lotes limitados', 'garrafa cult'], lat: -16.1547, lon: -42.3010 },
  { name: 'Cachaça Seleta', city: 'Salinas', category: 'Envelhecida', rating: 4.8, founded: 1953, signature: 'Seleta Ouro', tags: ['barris de bálsamo', 'visita guiada', 'loja própria'], lat: -16.1779, lon: -42.2856 },
  { name: 'Cachaça Boazinha', city: 'Salinas', category: 'Envelhecida', rating: 4.7, founded: 1948, signature: 'Boazinha Tradicional', tags: ['fazenda de família', 'sala de degustação'], lat: -16.1622, lon: -42.2790 },
  { name: 'Cachaça Canarinha', city: 'Salinas', category: 'Envelhecida', rating: 4.6, founded: 1959, signature: 'Canarinha Extra Premium', tags: ['alambiques de cobre', 'canaviais próprios'], lat: -16.1840, lon: -42.3047 },
  { name: 'Cachaça Germana', city: 'Nova União', category: 'Premium', rating: 4.8, founded: 1912, signature: 'Germana Heritage 10 anos', tags: ['garrafa de palha', 'carvalho e bálsamo', 'visita à fazenda'], lat: -19.6940, lon: -43.5874 },
  { name: 'Cachaça Vale Verde', city: 'Betim', category: 'Premium', rating: 4.7, founded: 1973, signature: 'Vale Verde 12 anos', tags: ['parque ecológico', 'museu da cachaça', 'restaurante'], lat: -19.9981, lon: -44.0917 },
  { name: 'Cachaça Milagre de Minas', city: 'Ouro Preto', category: 'Histórica', rating: 4.6, founded: 1985, signature: 'Milagre de Minas Umburana', tags: ['distrito de São Bartolomeu', 'estrada colonial'], lat: -20.2986, lon: -43.5856 },
  { name: 'Cachaça Coronel Xavier Chaves', city: 'Coronel Xavier Chaves', category: 'Histórica', rating: 4.7, founded: 1946, signature: 'CXC Premium', tags: ['fazenda do séc. XVIII', "roda d'água"], lat: -21.0292, lon: -44.2206 },
  { name: 'Cachaça Espírito de Minas', city: 'São Tiago', category: 'Premium', rating: 4.8, founded: 1996, signature: 'Espírito de Minas Single Cask', tags: ['terra do biscoito', 'dornas de jequitibá'], lat: -20.9111, lon: -44.5097 },
  { name: 'Cachaça Tabaroa', city: 'Prados', category: 'Branca', rating: 4.5, founded: 1973, signature: 'Tabaroa Prata', tags: ['vila do Bichinho', 'cooperativa artesã'], lat: -21.0599, lon: -44.0888 },
  { name: 'Cachaça João Mendes', city: 'Perdões', category: 'Envelhecida', rating: 4.6, founded: 1934, signature: 'João Mendes Bálsamo', tags: ['armazém de beira de estrada', 'degustação vertical'], lat: -21.0911, lon: -45.0911 },
  { name: 'Engenho de Januária', city: 'Januária', category: 'Branca', rating: 4.5, founded: null, signature: 'Branca descansada de Januária', tags: ['rio São Francisco', 'descanso em pote de barro'], lat: -15.4894, lon: -44.3679, landmark: true },
  { name: 'Alambique do Tropeiro', city: 'Diamantina', category: 'Branca', rating: 4.3, founded: null, signature: 'Tropeiro do Espinhaço', tags: ['estrada dos diamantes', 'adega de pedra'], lat: -18.2419, lon: -43.6027, landmark: true },
  { name: 'Alambique da Canastra', city: 'São Roque de Minas', category: 'Orgânica', rating: 4.6, founded: null, signature: 'Canastra Orgânica', tags: ['altitude 1.200 m', 'harmonização com queijo'], lat: -20.2461, lon: -46.3653, landmark: true },
  { name: 'Engenho Ponte do Rosário', city: 'Tiradentes', category: 'Histórica', rating: 4.4, founded: null, signature: 'Rosário Colonial', tags: ['pátio de pedra', 'engenho de almanjarra'], lat: -21.1106, lon: -44.1771, landmark: true, status: 'IN_VALIDATION' },
  { name: 'Cachaça Sossegada', city: 'Capitólio', category: 'Envelhecida', rating: 4.6, founded: null, signature: 'Sossegada Carvalho', tags: ['mar de Minas', 'vista do canyon'], lat: -20.6153, lon: -46.0494 },
  { name: 'Cachaça Mazuma', city: 'Tiradentes', category: 'Premium', rating: 4.7, founded: null, signature: 'Mazuma Single Barrel', tags: ['destilaria turística', 'degustação guiada'], lat: -21.1080, lon: -44.1693 },
  { name: 'Cachaça Alambique de Minas', city: 'Ouro Branco', category: 'Envelhecida', rating: 4.5, founded: null, signature: 'Alambique de Minas Ouro', tags: ['Engenho da Cana', 'cinco rótulos próprios'], lat: -20.5246, lon: -43.6919 },
  { name: 'Cachaça Guaraciaba', city: 'Guaraciaba', category: 'Envelhecida', rating: 4.6, founded: 1979, signature: 'Guaraciaba Umburana', tags: ['Zona da Mata', 'tradição familiar'], lat: -20.5719, lon: -43.0117 },
  { name: 'Cachaça Terra do Zebu', city: 'Uberaba', category: 'Envelhecida', rating: 4.5, founded: 2010, signature: 'Terra do Zebu Carvalho', tags: ['Engenho Chapadão', 'terra do zebu'], lat: -19.7472, lon: -47.9381 },
  { name: 'Cachaça Néctar do Cerrado', city: 'Monte Alegre de Minas', category: 'Branca', rating: 4.4, founded: null, signature: 'Néctar do Cerrado Prata', tags: ['rigor de laboratório', 'cerrado mineiro'], lat: -18.8703, lon: -48.8811 },
  { name: 'Cachaça Retiro Velho', city: 'Prata', category: 'Envelhecida', rating: 4.5, founded: null, signature: 'Retiro Velho Premiada', tags: ['triângulo mineiro', 'premiada'], lat: -19.3087, lon: -48.9276 },
  { name: 'Alambique de Furquim', city: 'Mariana', category: 'Branca', rating: 4.3, founded: null, signature: 'Branca de Furquim', tags: ['distrito histórico', 'beira do Gualaxo'], lat: -20.3631, lon: -43.2811, landmark: true },
  { name: 'Alambique do Cerrado', city: 'Uberlândia', category: 'Branca', rating: 4.2, founded: null, signature: 'Prata do Cerrado', tags: ['ipês amarelos', 'cana de sequeiro'], lat: -18.9188, lon: -48.2768, landmark: true },
];

interface UserSeed { name: string; username: string; email: string; }

const USERS: UserSeed[] = [
  { name: 'Viajante Demo', username: 'demo', email: 'demo@cachaceiro.app' },
  { name: 'Joana Tropeira', username: 'joana', email: 'joana@cachaceiro.app' },
  { name: 'Tião do Carmo', username: 'tiao', email: 'tiao@cachaceiro.app' },
];

const seedPassword = process.env.SEED_USER_PASSWORD || randomUUID().slice(0, 12);

interface ReviewSeed { username: string; distillery: string; title: string; body: string; rating: number; daysAgo: number; }

const REVIEWS: ReviewSeed[] = [
  { username: 'demo', distillery: 'Cachaça Havana — Anísio Santiago', title: 'A garrafa que toda estante sonha', body: 'Doze anos de bálsamo e dá pra sentir: damasco seco, cedro e um final que dura a prosa inteira. O número do lote é escrito à mão. Só ela já vale a viagem até Salinas.', rating: 5, daysAgo: 3 },
  { username: 'joana', distillery: 'Cachaça Seleta', title: 'O padrão-ouro do Norte', body: 'O tour leva do canavial à sala dos barris. A Seleta Ouro é redonda e amelada sem perder a alma de capim da cana. O pessoal da degustação entende do ofício.', rating: 5, daysAgo: 6 },
  { username: 'tiao', distillery: 'Cachaça Germana', title: 'Um século vestido de palha', body: 'A garrafa de palha não é marketing — a Heritage 10 anos ali dentro é profunda, especiada e longa. Só a fazenda antiga já vale o desvio saindo de BH.', rating: 5, daysAgo: 9 },
  { username: 'joana', distillery: 'Cachaça Vale Verde', title: 'Parque, museu e uma 12 anos séria', body: 'Leve a família: jardins, museu da cachaça e restaurante de verdade. A dose de 12 anos no final amarra tudo. Operação impecável.', rating: 4.5, daysAgo: 12 },
  { username: 'demo', distillery: 'Cachaça Espírito de Minas', title: 'Biscoito e dorna única', body: 'São Tiago cheira a biscoito de manteiga e aguardente de cana. O rótulo single cask é preciso, mineral, quase austero — no melhor sentido.', rating: 5, daysAgo: 15 },
  { username: 'tiao', distillery: 'Cachaça Coronel Xavier Chaves', title: 'História que se bebe em gole', body: "Fazenda do século XVIII com a roda d'água ainda girando. A Premium é honesta, limpa de cobre, com doçura suave de cana. Pareceu viagem no tempo.", rating: 4.5, daysAgo: 18 },
  { username: 'joana', distillery: 'Cachaça Milagre de Minas', title: 'A estrada colonial faz jus ao nome', body: 'Escondida em São Bartolomeu, tudo pedra e bananeira. O rótulo de umburana é perfumado e corajoso. Ligue antes — os lotes pequenos esgotam.', rating: 4.5, daysAgo: 21 },
  { username: 'demo', distillery: 'Cachaça Tabaroa', title: 'O Bichinho joga limpo', body: 'Uma prata cristalina com gosto de caldo de cana fresco. Combina absurdamente com as compras de cerâmica da vila. Barata, alegre, cheia de personalidade.', rating: 4, daysAgo: 25 },
];

async function seed(force: boolean): Promise<void> {
  if (!force) {
    const existing = await run<{ total: number }>('MATCH (d:Distillery) RETURN count(d) AS total');
    if ((existing[0]?.total ?? 0) > 0) {
      console.log('Graph already seeded — skipping (use `npm run seed` to force a reload).');
      return;
    }
  }
  console.log('Seeding Neo4j with the Minas Gerais cachaça graph...');
  const constraints = [
    'CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE',
    'CREATE CONSTRAINT user_username IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE',
    'CREATE CONSTRAINT distillery_id IF NOT EXISTS FOR (d:Distillery) REQUIRE d.id IS UNIQUE',
    'CREATE CONSTRAINT distillery_name IF NOT EXISTS FOR (d:Distillery) REQUIRE d.name IS UNIQUE',
    'CREATE CONSTRAINT city_name IF NOT EXISTS FOR (c:City) REQUIRE c.name IS UNIQUE',
    'CREATE CONSTRAINT review_id IF NOT EXISTS FOR (r:Review) REQUIRE r.id IS UNIQUE',
  ];
  for (const c of constraints) await run(c);
  await run('MATCH (n) DETACH DELETE n');
  console.log('Cleared previous data.');
  for (const city of CITIES) {
    await run(
      `CREATE (c:City {
         name: $name, region: $region,
         location: point({latitude: $lat, longitude: $lon})
       })`,
      { ...city },
    );
  }
  console.log(`Created ${CITIES.length} cities.`);
  for (const d of DISTILLERIES) {
    await run(
      `MATCH (c:City {name: $city})
       CREATE (d:Distillery {
         id: $id,
         name: $name,
         category: $category,
         status: $status,
         rating: $rating,
         reviewCount: 0,
         founded: $founded,
         signature: $signature,
         tags: $tags,
         landmark: $landmark,
         location: point({latitude: $lat, longitude: $lon}),
         createdAt: toString(datetime()),
         updatedAt: toString(datetime())
       })
       CREATE (d)-[:LOCATED_IN]->(c)`,
      { ...d, id: randomUUID(), status: d.status ?? 'VERIFIED', landmark: d.landmark ?? false },
    );
  }
  console.log(`Created ${DISTILLERIES.length} distilleries.`);
  await run(
    `MATCH (a:City), (b:City)
     WHERE a.name <> b.name
     WITH a, b, point.distance(a.location, b.location) / 1000.0 * 1.27 AS km
     ORDER BY a.name, km
     WITH a, collect({city: b, km: km})[..3] AS nearest
     UNWIND nearest AS n
     WITH a, n.city AS b, n.km AS km
     MERGE (a)-[r:ROAD]-(b)
     SET r.km = round(km)`,
  );
  const roads = await run<{ roads: number }>('MATCH ()-[r:ROAD]->() RETURN count(r) AS roads');
  console.log(`Created ${roads[0]?.roads ?? 0} ROAD links between cities.`);
  const passwordHash = await bcrypt.hash(seedPassword, 10);
  for (const user of USERS) {
    await run(
      `CREATE (u:User {
         id: $id, name: $name, username: $username, email: $email,
         passwordHash: $passwordHash, reputation: $reputation,
         createdAt: toString(datetime()), updatedAt: toString(datetime())
       })`,
      { id: randomUUID(), ...user, passwordHash, reputation: user.username === 'demo' ? 4.2 : 3.1 },
    );
  }
  console.log(`Created ${USERS.length} travelers (demo@cachaceiro.app / ${seedPassword}).`);
  for (const review of REVIEWS) {
    await run(
      `MATCH (u:User {username: $username}), (d:Distillery {name: $distillery})
       CREATE (u)-[:WROTE]->(r:Review {
         id: $id, title: $title, body: $body, rating: $rating,
         createdAt: toString(datetime() - duration({days: $daysAgo}))
       })-[:ABOUT]->(d)`,
      { id: randomUUID(), ...review },
    );
  }
  await run(
    `MATCH (d:Distillery)<-[:ABOUT]-(r:Review)
     WITH d, avg(r.rating) AS avgRating, count(r) AS total
     SET d.rating = round(avgRating * 10) / 10.0, d.reviewCount = total`,
  );
  console.log(`Created ${REVIEWS.length} field notes (reviews).`);
  const summary = await run<{ label: string; total: number }>(
    `MATCH (n)
     UNWIND labels(n) AS label
     RETURN label, count(*) AS total
     ORDER BY label`,
  );
  console.log('Graph summary:', summary.map((s) => `${s.label}=${s.total}`).join(' '));
  console.log('Seed complete.');
}

async function main(): Promise<void> {
  await verifyConnection();
  try {
    await seed(process.argv.includes('--force'));
  } finally {
    await closeDriver();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
