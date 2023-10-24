const express = require('express');
const { verifyJWT } = require('../Middleware/middlewares');
const { getCart, RemoveFromCart, addTocart, getDetailCart, CreatePaymentIntent, detailOfTheItemOfIndividialItem, EnrollToClass } = require('../controller/Cart_n_OrderController');
const router = express.Router();


//get the cart
router.get('/get-cart/:email', verifyJWT, getCart);


//detailed with product
router.get('/get-detail-cart/:email', verifyJWT, getDetailCart);

//individual class detail data from cart
router.get('/cart-data/detail/individucal/:RequsetedEmail/:cartItemID',verifyJWT,detailOfTheItemOfIndividialItem)

//add to cart
router.patch('/get-cart/add/:email', verifyJWT, addTocart);


// delete from cart 
router.patch('/get-cart/delete/:email', verifyJWT, RemoveFromCart);

//create payment intent
router.post("/create-payment-intent", verifyJWT, CreatePaymentIntent);

router.post("/enroll-in-class",verifyJWT,EnrollToClass);



module.exports = router