// mongoConnect.js

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@trial01.9ddajtx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

async function getCollectionNames() {
    try {
        const db = client.db('cinematic-arts-oasis');
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((collection) => collection.name);
        return collectionNames;
    } catch (error) {
        console.error('Error fetching collection names from MongoDB:', error);
        return [];
    }
}

//db 
const DataBase_Name = process.env.DB_NAME;


// Get the  collection
function getCollection(collectionName) {
    const db = client.db(process.env.DB_NAME); // Use the database name from the environment variable
    const collection = db.collection(collectionName); // Pass the desired collection name as an argument
    return collection;
}


module.exports = {
    connectToMongoDB,
    client,
    getCollectionNames,
    getCollection, // Add the new function here,

};
