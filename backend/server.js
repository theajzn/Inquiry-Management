const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = "mongodb+srv://theaszn93:inquiries@inquiries.rxvp9tn.mongodb.net/?retryWrites=true&w=majority";

//Create a MongoClient with a MongoClientOptions object to set the stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const port = 3000;


//enable express and cors

app.use(express.json());

app.use(cors());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admissionDB").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

//API route to get

app.get("/api/inquiries", async function (req, res) {
    await client.connect();
    const db = client.db("admissionDB");
    const collection = db.collection("inquiries");
  
    const students = await collection.find({}).toArray();
    return res.json(students).status(200);
  });



//API route to create inquiry

app.post("/api/inquiries", async function (req, res) {
  try {
    await client.connect(); // connect to the MongoDB cluster
    const db = client.db("admissionDB"); // specify the DB's name
    const collection = db.collection("inquiries");

    await collection.insertOne(req.body);

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'theaszn93@gmail.com',
        pass: 'rtwhmeadvesfppwg' // Update with your actual email password
      }
    });

    const mailOptions = {
      from: 'theaszn93@gmail.com',
      to: req.body.email, // Use the email from the request body
      subject: "Request Info Confirmation",
      html: "<p>Thank you for your interest in our workshops! A member of our team will reach out soon.</p>",
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(201).json({ message: 'Inquiry created successfully' });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Sorry, an error occurred" });
  }
});

 // api route to get inquiry by id
 app.get("/api/inquiries/:id", async function (req, res) {
  try {
    await client.connect();
    const db = client.db("admissionDB");
    const collection = db.collection("inquiries");

    const student = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });
    return res.json(student).status(200);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Sorry an error occurred" });
  }
});

// api route to update an inquiry by id
app.put("/api/inquiries/:id", async (req, res) => {
  try {
    await client.connect(); // connect to the MongoDB cluster
    const db = client.db("admissionDB"); // specify the DB's name
    const collection = db.collection("inquiries");

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student updated successfully" }).status(200);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Sorry an error occurred while updating the student" });
  }
});

//API route to delete by ID

  app.delete("/api/inquiries/:id", async (req, res) => {
    try {
      await client.connect(); // connect to the MongoDB cluster
      const db = client.db("admissionDB"); // specify the DB's name
      const collection = db.collection("inquiries");
  
      const result = await collection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      res.json({ message: "Student deleted successfully" }).status(200);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Sorry an error occurred" });
    }
  });


//route handler
app.get('/', (req, res) => {
    res.send("hello world")
})

//port listener

app.listen(port, function () {
    console.log(`Example app listening on port http://localhost:${port}`);
});
