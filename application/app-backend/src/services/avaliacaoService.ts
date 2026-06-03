const driver = require('../config/neo4j').default
const crypto = require('crypto')

const listAvaliacoes = async(
    userUsername: string
) => {
    const session = driver.session();

    const query = `
        MATCH
            (u:User {username: $username})-[r:CRIOU]->(n:Avaliacao)
        RETURN n
    `
    try {
        const result = await session.run(query, { username: userUsername })
        return result.records.map((record: any) => record.get('n').properties);
    } finally {
        await session.close()
    }
}

const createAvaliacao = async(
    userUsername: string, adegaName: string, properties: any
) => {
    const session = driver.session();

    const query = `
        MATCH
            (u:User {username: $userUsername}),
            (ade:Adega {name: $adegaName})
        CREATE (u)-[r:CRIA]->(ava: Avaliacao {
            id: $avaliacaoId,
            title: $title,
            comentario: $comentario,
            nota: $nota,
            createdAt: datetime()
        })-[AVALIA]->(ade)
        RETURN ava
        `

    try {
        const result = await session.run(query, {
            userUsername,
            adegaName,
            avaliacaoId: crypto.randomUUID(),
            title: properties.title,
            comentario: properties.comentario,
            nota: properties.nota
        })

        return result.records[0].get('ava').properties;
        
    } finally {
        await session.close();
    }
}

export = {
    listAvaliacoes,
    createAvaliacao,
}