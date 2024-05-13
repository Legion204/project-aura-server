const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const requestedFoodCollection = client.db("foodDB").collection("requestedFoods");

    // service related API's

    // get foods for home page with highest  quantity
    app.get('/featured_foods', async (req, res) => {
      const result = await foodCollection.aggregate([{ $match: { foodStatus: "Available" } },{ $addFields: { quantityInt: { $toInt: "$quantity" } } }, { $sort: { quantityInt: -1 } }]).toArray();
      res.send(result);
    });


    // post added food data to database
    app.post('/add_food', async (req, res) => {
      const addedFood = req.body
      const result = await foodCollection.insertOne(addedFood);
      res.send(result);
    });



    // get data for available Foods page
    app.get("/available_foods", async (req, res) => {
      const query = { foodStatus: "Available" }
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });


    // get single food data for food details page
    app.get("/food_details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    // update single food status in data base
    app.put("/update_status/:id", async (req, res) => {
      const id = req.params.id
      const query= { _id: new ObjectId(id) }
      const options = {upsert:true}
      const updatedFoodStatus = req.body
      const doc ={$set:{foodStatus:updatedFoodStatus.changedFoodStatus}}
      const result=await foodCollection.updateOne(query,doc,options);
      res.send(result);
    });

    // post requested food data in database
    app.post("/requested_foods",async(req,res)=>{
      const requestedFood=req.body
      const result =await requestedFoodCollection.insertOne(requestedFood);
      res.send(result)
    });

    // get data of users food requests
    app.get("/requested_foods",async(req,res)=>{
      const email= req.query.email
      const query= {userEmail:email}
      const result= await requestedFoodCollection.find(query).toArray();
      res.send(result)
    });

    // get data for my added foods from database
    app.get("/my_added_foods",async(req,res)=>{
      const email= req.query.email
      const query = {donatorEmail:email}
      const result = await foodCollection.find(query).toArray();
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