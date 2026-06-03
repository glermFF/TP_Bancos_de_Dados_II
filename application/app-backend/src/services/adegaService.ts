const driver = require('../config/neo4j').default
const crypto = require('crypto')

const listAdegas = async () => {
    const session = driver.session()
    
    const query = `
        MATCH (n:Adega)
        RETURN n
    `
    
    try {
        const result = await session.run(query)
        return result.records.map((record: any) => record.get('n').properties);
    } finally {
        await session.close()
    }
}

const createAdega = async(
    properties: any
) => {
    const session = driver.session()

    const query = `
        CREATE (n:Adega {
            id: $id,
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

const updateAdega = async (id: string, properties: any) => { // Desmembrar em outros métodos
    const session = driver.session()
    
    const query = `
        MATCH (n:Adega {id: $id})
        SET n += $properties
        RETURN n
    `
    
    try {
        const result = await session.run(query, {
            id,
            properties
        })
        
        if (result.records.length === 0) {
            throw new Error("Adega não encontrada");
        }
        
        return result.records[0].get('n').properties;
    } finally {
        await session.close()
    }
}

export = {
    createAdega,
    listAdegas,
    updateAdega
}