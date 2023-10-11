const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(express.static("public"));

/**
 * ________________________________________
 *        MIDDDLE WARE
 * __________________________________________
 */
const corsOptions = {
    origin: ['http://192.168.0.102:5173', 'http://localhost:5173', 'http://localhost:3000', 'https://bistro-boss-server-hossain-ahamed.vercel.app', 'https://bistro-boss-restaurant-by-zombie.firebaseapp.com', 'https://bistro-boss-restaurant-by-zombie.web.app'],
    credentials: true,
};



app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsOptions.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});




app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

/**
 * ______________________________________________________________________________
 *                          Token verify
 * ______________________________________________________________________________
 */

const verifyJWT = (req, res, next) => {
    // console.log(req.cookies)
    // console.log('header ',req.headers)
    const authorization = req.headers.authorization;
    // console.log('auth ',authorization)
    if (!authorization) {
        console.log("No Auth Data found for ", req.path)
        return res.status(401).send({ error: true, message: "Unauthorized Access" });
    }

    //bearer token
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log("Auth code was Invalid ")
            return res.status(403).send({ error: true, message: "Unauthorized Access || Invalid Token" });
        }
        // console.log("error hoyn")
        req.decoded = decoded;
        next();

    })

}


/**
 * _________________________________________________________________________________________________________________
 * _________________________________________________________________________________________________________________
 * _________________________________________________________________________________________________________________
 * _________________________________________________________________________________________________________________
 */

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@trial01.9ddajtx.mongodb.net/?retryWrites=true&w=majority`;
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

        await client.connect();




        // db initialize 
        const db = client.db('cinematic-arts-oasis');
        const allUserDataCollection = db.collection('all-user-data');


        app.post('/jwt', async (req, res) => {
            const user = req.body;

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.cookie("_at", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
            });
            res.send({ token })
        })




        /**
         * --------------------------------------------------------------------------------------
         *                                user Creation and maintain
         * --------------------------------------------------------------------------------------
         *   .post '/sign-in-upload-data'   ====>  Upload new profile to all-user-colection
         *   .get  '/get-profile/:email'    ====>  get the profile
         */



        // find the profile data 
        app.get('/get-profile/:email', async (req, res) => {
            const email = req.params.email;
            const user = await allUserDataCollection.findOne({ email: email });

            if (!user) {
                return  res.status(200).send({dataFound : false})
            }

           return res.status(200).send({...user,dataFound : true})

        })

        // Upload new profile to all-user-colection
        app.post('/sign-in-upload-data', async (req, res) => {
            const data = req.body;
            const {
                name,
                email,
                photoURL,
                phone,
                firebase_UID,
            } = data;
         

            const exist = await allUserDataCollection.findOne({ email: data?.email });

            if (exist) {
                return res.status(200).send("successful")
            }


            const uploadData = {
                name,
                email,
                photoURL,
                phone,
                firebase_UID,
                role: "Student"
            }

            const result = await allUserDataCollection.insertOne(uploadData);
            res.status(200).send(result);
        })


        // Update profile to all-user-colection
        app.patch('/update-user-profile/:email', async (req, res) => {
            const data = req.body;
         

            const result = await allUserDataCollection.updateOne({ email: req.params.email },{$set : data});

    
            res.status(200).send(result);
        })

    } finally {

        // await client.close();
    }
}
run().catch(console.dir);



/**
 * -------------------------------------------------------------------------------------------------------------------------
 * -------------------------------------------------------------------------------------------------------------------------
 * -------------------------------------------------------------------------------------------------------------------------
 */
app.get('/', (req, res) => {
    res.send("cinematric arts oasis")
})



app.listen(port, () => {
    console.log('pinged on  ', port)
})