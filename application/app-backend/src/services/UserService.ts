const driver = require('../config/neo4j').default
const crypto = require('crypto')

const createUser = async(
    properties: any
) => {
    const session = driver.session()

    const query = `
        CREATE (n:User {name: $name, 
            username: $username,
            email: $email,
            password: $userHashedPassword,
            avaliacoes: 0,
            confianca: 0.0,
            createdAt: datetime()
            })
        RETURN n
    `

    try {
        const result = await session.run(query, {
            id: crypto.randomUUID(),
            name: properties.name,
            username: properties.username,
            email: properties.email,
            userHashedPassword: crypto.createHash('sha256').update(properties.password).digest('hex')
        })

        return result.records[0].get('n').properties;
    } finally {
        await session.close()
    }
}

export = {
    createUser
}