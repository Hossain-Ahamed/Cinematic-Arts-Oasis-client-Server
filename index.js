const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const port = process.env.PORT || 5000;



/**
 * ________________________________________
 *        MIDDDLE WARE
 * __________________________________________
 */

app.use(express.static("public"));



app.use(express.json());
app.use(cookieParser());

// CORS options
const corsOptions = {
    origin: [
        'http://192.168.0.102:5173',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://bistro-boss-server-hossain-ahamed.vercel.app',
        'https://bistro-boss-restaurant-by-zombie.firebaseapp.com',
        'https://bistro-boss-restaurant-by-zombie.web.app',
    ],
    credentials: true,
};

// Set CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsOptions.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Use the CORS middleware
app.use(cors(corsOptions));







//---------------------routes import---------------------------------------------------
const UserHandle_Route = require('./Routes/HandleUserRoute');
const Carousel_Route = require('./Routes/HandleCaoruselRoute');
const class_Route = require('./Routes/HandleClassRoute');
const order_n_CartRoute = require('./Routes/HandleCart_n_OrdersRoute')


// Use the route modules
app.use('/oasis', UserHandle_Route); // routes for authentication
app.use('/oasis', Carousel_Route); // routes for authentication
app.use('/oasis', class_Route); // routes for clases
app.use('/oasis', order_n_CartRoute); // routes for order and cart










app.get('/', (req, res) => {
    res.send('Cinematic Arts Oasis');
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error err req res next');
});


app.listen(port, () => {
    console.log('oasis Server is running on port', port);
});