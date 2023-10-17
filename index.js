const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wpyzknn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    
    const coffeeCollection = client.db("coffeeDB").collection('coffee');
    const userCollection = client.db("coffeeDB").collection('user');

    //get data 
    app.get('/coffee', async(req, res)=>{
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray();
        res.send(result);

    })

    //get users data 
    app.get('/user', async(req, res)=>{
        const cursor = userCollection.find();
        const users = await cursor.toArray();
        res.send(users);

    })

    //get data for specific id
    app.get('/coffee/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await coffeeCollection.findOne(query);
        res.send(result);
    })

    //create data
    app.post('/coffee', async(req, res)=>{
        const newCoffee = req.body;
        console.log(newCoffee);
        const result = await coffeeCollection.insertOne(newCoffee)
        res.send(result);
    })

    //create user data
    app.post('/user', async(req, res)=>{
        const newUser = req.body;
        console.log(newUser);
        const result = await userCollection.insertOne(newUser)
        res.send(result); 
    })

    //update data
    app.put('/coffee/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const options = {upsert: true}
        const updatedCoffee = req.body;
        const coffee = {
            $set:{
                name: updatedCoffee.name, 
                chef: updatedCoffee.chef, 
                supplier: updatedCoffee.supplier, 
                taste: updatedCoffee.taste, 
                category: updatedCoffee.category,  
                details: updatedCoffee.details, 
                photo: updatedCoffee.photo,
            }
        }
        const result = await coffeeCollection.updateOne(filter, coffee, options);
        res.send(result);
    })

    //update user data
    app.patch('/user', async(req, res)=>{
       const user = req.body;
       const filter = {email : user.email}
       const updatedDoc ={
        $set: {
          lastLoggedAt : user.lastLoggedAt,
          displayName : user.name
        }
       }
       const result = await userCollection.updateOne(filter, updatedDoc)
       res.send(result);
    })

    //delete data
    app.delete('/coffee/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await coffeeCollection.deleteOne(query);
        res.send(result);
    })

    //delete user data
    app.delete('/user/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const user = await userCollection.deleteOne(query);
        res.send(user);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('Coffee Shop is open now!')
})
app.listen(port, ()=>{
    console.log('Coffee shop in open on port: ', port);
})