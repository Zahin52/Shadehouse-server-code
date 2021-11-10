const express = require('express')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const admin = require('firebase-admin')

const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

var serviceAccount = require('./destino-7072b-firebase-adminsdk-j4kwp-656e6a0ac6.json')

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
      const database = client.db('destinoDB')
      const destinoCollection = database.collection('services')
      const destinoGallaryCollection = database.collection('gallary')
      const destinoTestimonyCollection = database.collection('testimony')
      const destinoBookingCollection = database.collection('bookings')
      const destinoOrdersCollection = database.collection('orders')
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
      app.get('/services', async (req, res) => {
         const cursor = destinoCollection.find({})
         const services = await cursor.toArray()
         res.send(services)
      })
      app.get('/gallary', async (req, res) => {
         const cursor = destinoGallaryCollection.find({})
         const images = await cursor.toArray()
         res.send(images)
      })
      app.get('/testimony', async (req, res) => {
         const cursor = destinoTestimonyCollection.find({})
         const testimony = await cursor.toArray()
         res.send(testimony)
      })
      app.get('/myBookings', async (req, res) => {
         const cursor = destinoBookingCollection.find({})
         const mybookings = await cursor.toArray()
         res.send(mybookings)
      })
      app.get('/orders', VerifyToken, async (req, res) => {
         const email = req.query.email
         console.log(email, req.decodedUserEmail)
         if (req.decodedUserEmail === email) {
            const query = { email: email }
            const cursor = destinoOrdersCollection.find(query)
            const myOrders = await cursor.toArray()
            res.send(myOrders)
         } else {
            res.status(401).json({ message: 'user not authorized' })
            console.log('sorry')
         }
      })

      // GET Single Service
      app.get('/services/:id', async (req, res) => {
         const id = req.params.id
         console.log('getting specific service', id)
         const query = { _id: ObjectId(id) }
         const service = await destinoCollection.findOne(query)
         res.json(service)
      })

      // All POST API
      app.post('/services', async (req, res) => {
         const service = req.body
         console.log('hit the post api', service)

         const result = await destinoCollection.insertOne(service)
         console.log(result)
         res.json(result)
      })
      app.post('/gallary', async (req, res) => {
         const gallary = req.body
         console.log('hit the post api', gallary)

         const result = await destinoGallaryCollection.insertOne(gallary)
         console.log(result)
         res.json(result)
      })
      app.post('/testimony', async (req, res) => {
         const testimony = req.body
         console.log('hit the post api', testimony)

         const result = await destinoTestimonyCollection.insertOne(testimony)
         console.log(result)
         res.json(result)
      })
      app.post('/bookings', async (req, res) => {
         const bookings = req.body
         console.log('hit the post api', bookings)

         const result = await destinoBookingCollection.insertOne(bookings)
         console.log(result)
         res.json(result)
      })
      app.post('/orders', async (req, res) => {
         const order = req.body
         console.log('hit the post api', order)
         const result = await destinoOrdersCollection.insertOne(orders)
         console.log(result)
         res.json(result)
      })

      //All PUT API
      app.put('/bookings/:id', async (req, res) => {
         const id = req.params.id
         const query = { _id: ObjectId(id) }
         const result = await destinoBookingCollection.updateOne(query, {
            $set: { status: 'Accepted' },
         })
         res.json(result)
      })

      //All DELETE API
      app.delete('/services/:id', async (req, res) => {
         const id = req.params.id
         const query = { _id: ObjectId(id) }
         const result = await destinoCollection.deleteOne(query)
         res.json(result)
      })
      app.delete('/bookings/:id', async (req, res) => {
         const id = req.params.id
         const query = { _id: ObjectId(id) }
         const result = await destinoBookingCollection.deleteOne(query)
         res.json(result)
      })
   } finally {
      // await client.close();
   }
}

run().catch(console.dir)

// Server checking

app.get('/', (req, res) => {
   res.send('Running Destino Server')
})

app.listen(port, () => {
   console.log('Running destino Server on port', port)
})
