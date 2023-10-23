const express = require('express');
const { verifyJWT } = require('../Middleware/middlewares');
const { getCart, RemoveFromCart, addTocart, getDetailCart } = require('../controller/Cart_n_OrderController');
const router = express.Router();


//get the cart
router.get('/get-cart/:email',verifyJWT,getCart);
router.get('/get-detail-cart/:email',verifyJWT,getDetailCart);

//add to cart
router.patch('/get-cart/add/:email',verifyJWT,addTocart);


// delete from cart 
router.patch('/get-cart/delete/:email',verifyJWT,RemoveFromCart);




module.exports = router