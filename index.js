const express = require('express')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const admin = require('firebase-admin')

const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

var serviceAccount = require('./shadehouse-d69c2-firebase-adminsdk.json')

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
//    Token varification

async function run() {
   try {
      await client.connect()
      const database = client.db('shadehouseDB')
      const shadehouseCollection = database.collection('products')
      const shadehouseGallaryCollection = database.collection('gallary')
      const shadehousereviewsCollection = database.collection('reviews')
      const shadehousePurchaseCollection = database.collection('purchase')
      const shadehouseOrdersCollection = database.collection('orders')
      const VerifyToken = async (req, res, next) => {
         //    console.log(req.headers.authorization)
         if (
            req.headers.authorization && req.headers.authorization.startsWith(
               'Bearer ',
            )
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
      app.get('/mypurchase', async (req, res) => {
         const cursor = shadehousePurchaseCollection.find({})
         const mypurchase = await cursor.toArray()
         res.send(mypurchase)
      })
      app.get('/orders', VerifyToken, async (req, res) => {
         const email = req.query.email
         console.log(email, req.decodedUserEmail)
         if (req.decodedUserEmail === email) {
            const query = { email: email }
            const cursor = shadehouseOrdersCollection.find(query)
            const myOrders = await cursor.toArray()
            res.send(myOrders)
         } else {
            res.status(401).json({ message: 'user not authorized' })
            console.log('sorry')
         }
      })

      // GET Single Service
      app.get('/products/:id', async (req, res) => {
         const id = req.params.id
         console.log('getting specific service', id)
         const query = { _id: ObjectId(id) }
         const service = await shadehouseCollection.findOne(query)
         res.json(service)
      })

      // All POST API
      app.post('/products', async (req, res) => {
         const service = req.body
         console.log('hit the post api', service)

         const result = await shadehouseCollection.insertOne(service)
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
            $set: { status: 'Accepted' },
         })
         res.json(result)
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
