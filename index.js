const express = require('express')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const admin = require('firebase-admin')

const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000



var serviceAccount = require("./shadehouse-d69c2-firebase-adminsdk.json")

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
})

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tccbv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
})

async function run() {
   try {
      await client.connect()
      const database = client.db('shadehouseDB')
      const shadehouseCollection = database.collection('products')
      const shadehouseGallaryCollection = database.collection('gallary')
      const shadehousereviewsCollection = database.collection('reviews')
      const shadehousePurchaseCollection = database.collection('purchase')
      const shadehouseOrdersCollection = database.collection('orders')
      const shadehouseUsersCollection = database.collection('users')
      //    Token varification
      const VerifyToken = async (req, res, next) => {
         //    console.log(req.headers.authorization)
         if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
         ) {
            const token = req.headers.authorization.split('Bearer ')[1]
            //   console.log('verifying token', token)
            try {
               const decodedUser = await admin.auth().verifyIdToken(token)
               req.decodedUserEmail = decodedUser.email
            } catch (error) {}
         }
         next()
      }

      // All GET API
      app.get('/products', async (req, res) => {
         const cursor = shadehouseCollection.find({})
         const products = await cursor.toArray()
         res.send(products)
      })
      app.get('/gallary', async (req, res) => {
         const cursor = shadehouseGallaryCollection.find({})
         const images = await cursor.toArray()
         res.send(images)
      })
      app.get('/reviews', async (req, res) => {
         const cursor = shadehousereviewsCollection.find({})
         const reviews = await cursor.toArray()
         res.send(reviews)
      })
      app.get('/purchase', async (req, res) => {
         const cursor = shadehousePurchaseCollection.find({})
         const mypurchase = await cursor.toArray()
         res.send(mypurchase)
      })

      // GET Single Service
      app.get('/products/:id', async (req, res) => {
         const id = req.params.id
         console.log('getting specific service', id)
         const query = { _id: ObjectId(id) }
         const service = await shadehouseCollection.findOne(query)
         res.json(service)
      })
      app.get('/user/:email', async (req, res) => {
         const email = req.params.email
         console.log('getting specific service', email)
         const query = { email: email }
         const user = await shadehouseUsersCollection.findOne(query)
         let isAdmin = false
         console.log(user)
         if (user && user.role == 'admin') {
            isAdmin = true
         }
         res.json({ admin: isAdmin })
      })

      // All POST API
      app.post('/user', async (req, res) => {
         const user = req.body
         console.log('hit the post api', user)

         const result = await shadehouseUsersCollection.insertOne(user)
         console.log(result)
         res.json(result)
      })
      app.post('/products', async (req, res) => {
         const product = req.body
         console.log('hit the post api', product)

         const result = await shadehouseCollection.insertOne(product)
         console.log(result)
         res.json(result)
      })
      app.post('/gallary', async (req, res) => {
         const gallary = req.body
         console.log('hit the post api', gallary)

         const result = await shadehouseGallaryCollection.insertOne(gallary)
         console.log(result)
         res.json(result)
      })
      app.post('/reviews', async (req, res) => {
         const reviews = req.body
         console.log('hit the post api', reviews)

         const result = await shadehousereviewsCollection.insertOne(reviews)
         console.log(result)
         res.json(result)
      })
      app.post('/purchase', async (req, res) => {
         const purchase = req.body
         console.log('hit the post api', purchase)

         const result = await shadehousePurchaseCollection.insertOne(purchase)
         console.log(result)
         res.json(result)
      })
      app.post('/orders', async (req, res) => {
         const order = req.body
         console.log('hit the post api', order)
         const result = await shadehouseOrdersCollection.insertOne(orders)
         console.log(result)
         res.json(result)
      })

      //All PUT API
      app.put('/purchase/:id', async (req, res) => {
         const id = req.params.id
         const query = { _id: ObjectId(id) }
         const result = await shadehousePurchaseCollection.updateOne(query, {
            $set: { status: 'Shipped' },
         })
         res.json(result)
      })
      app.put('/user', async (req, res) => {
         const user = req.body
         console.log('hit the post api', user)
         const filter = { email: user.email }
         const option = { upsert: true }
         const updateDoc = {
            $set: user,
         }
         const result = await shadehouseUsersCollection.updateOne(
            filter,
            updateDoc,
            option,
         )
         console.log(result)
         res.json(result)
      })
      app.put('/user/admin', VerifyToken, async (req, res) => {
         const user = req.body
         const requester = req.decodedUserEmail
         console.log('hit the post api', user)
         if (requester) {
            const AccountInfo = await shadehouseUsersCollection.findOne({
               email: requester,
            })
            if (AccountInfo.role === 'admin') {
               const filter = { email: user.email }
               const updateDoc = {
                  $set: { role: 'admin' },
               }
               const result = await shadehouseUsersCollection.updateOne(
                  filter,
                  updateDoc,
               )
               console.log(result)
               res.json(result)
            }
         } else {
            res.status(403).json({
               message: "you don't have access to make a admin",
            })
         }
      })

      //All DELETE API
      app.delete('/products/:id', async (req, res) => {
         const id = req.params.id
         const query = { _id: ObjectId(id) }
         const result = await shadehouseCollection.deleteOne(query)
         res.json(result)
      })
      app.delete('/purchase/:id', async (req, res) => {
         const id = req.params.id
         const query = { _id: ObjectId(id) }
         const result = await shadehousePurchaseCollection.deleteOne(query)
         res.json(result)
      })
   } finally {
      // await client.close();
   }
}

run().catch(console.dir)

// Server checking

app.get('/', (req, res) => {
   res.send('Running shadehouse Server')
})

app.listen(port, () => {
   console.log('Running shadehouse Server on port', port)
})
