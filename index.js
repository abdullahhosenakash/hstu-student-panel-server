const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

async function run() {
    try {

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
})