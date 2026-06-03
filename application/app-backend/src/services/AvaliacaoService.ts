const driver = require('../config/neo4j').default

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
    createAvaliacao
}