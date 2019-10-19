const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const MONGODB_URL = process.env.MONGODB_URL


module.exports = (async ()=> {
    const client = await MongoClient.connect(MONGODB_URL,{
        useNewUrlParser: true,
        useUnfiedTopology: true
    
    })

    return client
    
})()

