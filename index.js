const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.harcewd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unAuthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const userCollection = client.db("HSTUStudentPanel").collection("students");

        app.put('/user-login/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { userEmail: email };
            const options = { upsert: true };
            const updatedUser = {
                $set: { userEmail: email }
            }
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
            const result = await userCollection.updateOne(filter, updatedUser, options);
            res.send({ result, token });
        });

        app.get('/user/:studentId', async (req, res) => {
            const studentId = req.params.studentId;
            const query = { studentId };
            const result = await userCollection.findOne(query);
            if (result) {
                res.send(result);
            }
            else {
                res.status(404).send('user not found');
            }
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send('HSTU Student Panel Running');
});

app.listen(port, () => {
    console.log('Student Panel Running on port', 5000);
});
// require('crypto').randomBytes(64).toString('hex')