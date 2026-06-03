const driver = require('../config/neo4j').default

const createAdega = async(
    properties: any
) => {
    const session = driver.session()

    const query = `
        CREATE (n:Adega {
            id: $id
            name: $name, 
            type: $type,
            localizacao: point({latitude: $latValue, longitude: $longValue}), 
            nota: 0.0, 
            status: "EM_VALIDACAO",
            createdAt: datetime()
            })
        RETURN n
    `

    try {
        const result = await session.run(query, {
            id: crypto.randomUUID(),
            name: properties.name,
            type: properties.type,
            latValue: properties.lat,
            longValue: properties.long,
        })

        return result.records[0].get('n').properties;
    } finally {
        await session.close()
    }
}

export = {
    createAdega
}