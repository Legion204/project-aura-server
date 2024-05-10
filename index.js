const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.tba2ihq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // database collections
    const foodCollection = client.db("foodDB").collection("foods");

    // post added food data to database
    app.post('/add_food', async (req, res) => {
      const addedFood = req.body
      const result = await foodCollection.insertOne(addedFood);
      res.send(result);
    });


    // get foods for home page with highest  quantity
    app.get('/featured_foods', async (req, res) => {
      const result = await foodCollection.aggregate([{ $addFields: { quantityInt: { $toInt: "$quantity" } } }, { $sort: { quantityInt: -1 } }]).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("project-aura server is running")
});

app.listen(port, () => {
  console.log(`project-aura server is running on port ${port}`);
})