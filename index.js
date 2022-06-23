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
        const userCollection = client.db("HSTUStudentPanel").collection("user");
        const adminCollection = client.db("HSTUStudentPanel").collection("admin");
        const resultCollection_Level_1_Semester_I = client.db("studentResults").collection("level-1-semester-I");
        const resultCollection_Level_1_Semester_II = client.db("studentResults").collection("level-1-semester-II");
        const resultCollection_Level_2_Semester_I = client.db("studentResults").collection("level-2-semester-I");
        const resultCollection_Level_2_Semester_II = client.db("studentResults").collection("level-2-semester-II");
        const resultCollection_Level_3_Semester_I = client.db("studentResults").collection("level-3-semester-I");
        const resultCollection_Level_3_Semester_II = client.db("studentResults").collection("level-3-semester-II");
        const resultCollection_Level_4_Semester_I = client.db("studentResults").collection("level-4-semester-I");
        const resultCollection_Level_4_Semester_II = client.db("studentResults").collection("level-4-semester-II");

        app.put('/user-login/:emailAndRole', async (req, res) => {
            const emailAndRole = req.params.emailAndRole;
            const email = emailAndRole.split('&')[0];
            const role = emailAndRole.split('&')[1];
            console.log(email, role);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
            let user;
            if (role === '73747564656E74') {
                user = await userCollection.findOne({ userEmail: email });
            }
            else if (role === '61646D696E') {
                user = await adminCollection.findOne({ userEmail: email });
            }
            else {
                return res.status(401).send('unAuthorized Access')
            }
            res.send({ token, user });
        });

        app.get('/updateUser/:studentId', verifyJWT, async (req, res) => {
            const studentId = req.params.studentId;
            const result = await userCollection.findOne({ studentId });
            if (result) {
                if (result.userEmail) {
                    return res.status(403).send('Forbidden Access');
                }
                else {
                    return res.send(result);
                }
            }
            res.status(404).send('user not found');
        });

        app.get('/userInfo/:userEmail', verifyJWT, async (req, res) => {
            const userEmail = req.params.userEmail;
            const result = await userCollection.findOne({ userEmail });
            res.send(result);
        });

        app.get('/isAdmin/:userEmailAndAdminSecretKey', async (req, res) => {
            const userEmailAndAdminSecretKey = req.params.userEmailAndAdminSecretKey;
            const userEmail = userEmailAndAdminSecretKey.split('&')[0];
            const adminSecretKey = userEmailAndAdminSecretKey.split('&')[1];
            const result = await adminCollection.findOne({ userEmail });
            if (result.adminSecretKey === adminSecretKey) {
                res.send('1');
            }
            else {
                res.send('0');
            }
        });

        app.put('/updateUser/:studentId', verifyJWT, async (req, res) => {
            const studentId = req.params.studentId;
            const updatedUser = req.body;
            const filter = { studentId };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    userName: updatedUser.userName,
                    userEmail: updatedUser.userEmail,
                    faculty: updatedUser.faculty,
                    department: updatedUser.department,
                    phone: updatedUser.phone,
                    studentIdCardURL: updatedUser.studentIdCardURL
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.get('/results/:studentIdLevelSemester', verifyJWT, async (req, res) => {
            const studentIdLevelSemester = req.params.studentIdLevelSemester;
            const studentId = studentIdLevelSemester.split('&')[1];
            const level = studentIdLevelSemester.split('&')[2];
            const semester = studentIdLevelSemester.split('&')[3];
            let result;
            if (level === '1' && semester === 'I') {
                result = await resultCollection_Level_1_Semester_I.findOne({ studentId });
            }
            else if (level === '1' && semester === 'II') {
                result = await resultCollection_Level_1_Semester_II.findOne({ studentId });
            }
            else if (level === '2' && semester === 'I') {
                result = await resultCollection_Level_2_Semester_I.findOne({ studentId });
            }
            else if (level === '2' && semester === 'II') {
                result = await resultCollection_Level_2_Semester_II.findOne({ studentId });
            }
            else if (level === '3' && semester === 'I') {
                result = await resultCollection_Level_3_Semester_I.findOne({ studentId });
            }
            else if (level === '3' && semester === 'II') {
                result = await resultCollection_Level_3_Semester_II.findOne({ studentId });
            }
            else if (level === '4' && semester === 'I') {
                result = await resultCollection_Level_4_Semester_I.findOne({ studentId });
            }
            else if (level === '4' && semester === 'II') {
                result = await resultCollection_Level_4_Semester_II.findOne({ studentId });
            }
            res.send(result);
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