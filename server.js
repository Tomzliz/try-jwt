const express = require('express')
const mongodb = require('mongodb')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {port,jwtkey} = require('./config')
const auth = require('./auth')

const app = express()
//const port = process.env.PORT
//const jwtkey = process.env.JWT_KEY





app.use(express.json())

app.post('/register', async (req,res) =>{
    let name = req.body.name
    let email = req.body.email
    let studentId = req.body.studentId
    let encryptedPwd = await bcrypt.hash(req.body.password, 8)

    const o = {
            name: name,
            email: email,
            studentId: studentId,
            password: encryptedPwd

    }
    const client = await require('./db')
   // const client = await MongoClient.connect(MONGODB_URL,{
    //    useNewUrlParser: true,
    //    useUnfiedTopology: true
    
    //}).catch((err) =>{
     //   console.error(`Cannot connect to MongoDB: ${err}`)
     //   res.status(500).json({error: err})
     //   return
    //})

    
    const db = client.db('buu')
    const r = await db.collection('users')
                .insertOne(o)
                .catch((err)=>{
                    console.error(`Cannot insert data to users collection: ${err}`)
                    res.status(500).json({error: err})
                    return
                })


    let result = {_id: o._id,name : o.name,email:o.email,studentId: o.studentId}            
    res.status(201).json(result)
})


app.post('/sign-in', async(req, res)=> {

    let email = req.body.email
    let password = req.body.password

    const client = await require('./db')
    let db = client.db('buu')
    let user = await db.collection('users').findOne({email : email})
                .catch((err)=>{
                    console.error(`Cannot find user with email: ${err}`)
                    res.status(500).json({error: err})
                })
            if(!user){
                res.status(401).json({error: `Your given email has not been found`})
                return
            }       


            let passwordIsValid = await bcrypt.compare(password, user.password)
            if(!passwordIsValid){
                res.status(401).json({error: `Username/password is not match`})
                return
            }

            // payload = {email: user.email, id: user , _id}
            let token = await jwt.sign({email: user.email, id: user._id},jwtkey,{expiresIn: 1})
            res.status(200).json({token: token})
})

app.get('/me',auth, async (req, res) => {
    //let token = req.header('Authorization')
    //let decoded = await jwt.verify(token,jwtkey)


    let decoded = req.decoded
    const client = await require('./db')
    let db = client.db('buu')
    let user = await db.collection('users').findOne({_id: mongodb.ObjectID(decoded.id)}).catch((err)=>{
        console.error(`Cannot get user by id in /me ${err}`)
        res.status(500).send({error: err})
    })
    if(!user){
        res.status(401).json({error: 'User was not found'})
        return
    }
    delete user.password

    res.json(user)

})

app.put('/me',auth, async(req, res)=>{
    let decoded = req.decoded
    let NewEmail = req.body.email
    

    const client = await require('./db')
    let db = client.db('buu')
    let r = await db.collection('users').updateOne({_id: mongodb.ObjectID(decoded.id)},{$set: {email : NewEmail}})
            .catch((err)=>{
                console.error(`Cannot update profile: ${err}`)
                res.status(500).json({error:err})
                return
            })

        res.sendStatus(204)        
        


})


app.listen(port,() => {
    console.log(`start 3000 ${port}`)
})