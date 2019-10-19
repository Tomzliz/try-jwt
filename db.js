const mongodb = require('mongodb')
const{mongoUrl} = require('./config')
const MongoClient = mongodb.MongoClient
//const MONGODB_URL = process.env.MONGODB_URL


module.exports = (async ()=> {
    const client = await MongoClient.connect(mongoUrl,{
        useNewUrlParser: true,
        useUnfiedTopology: true
    
    })

    return client
    
})()

