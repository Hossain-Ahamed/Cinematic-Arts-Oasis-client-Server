const express = require('express');
const { verifyJWT } = require('../Middleware/middlewares');
const { getCart } = require('../controller/Cart_n_OrderController');
const router = express.Router();


//get the cart
router.get('/get-cart/:email',verifyJWT,getCart);




module.exports = router