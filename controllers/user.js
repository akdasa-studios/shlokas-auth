
function useUserController(connectionString) {
    const nano = require('nano')({
        url: connectionString,
        parseUrl: false
    })
    const users = nano.use('_users');

    async function isRegistered(email) {
        try {
            await users.get(`org.couchdb.user:${email}`)
            return true
        } catch {
            return false
        }
    }

    /**
     * Register a new user
     * @param {string} name Name of the user
     * @param {string} email Email address of the user
     * @param {string} password Password of the user
     */
    async function register(
        name,
        email,
        password,
    ) {
        const result = await users.insert({
            _id: `org.couchdb.user:${email}`,
            name: name,
            email: email,
            password: password,
            type: 'user',
            roles: [],
        })
        if (result.ok) {
            console.log(result)
        } else {
            console.log(result)
        }
    }

    return { isRegistered, register }
}

module.exports = { useUserController }