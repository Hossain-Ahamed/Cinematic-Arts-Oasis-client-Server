const express = require('express');
const { getCarouselImage } = require('../controller/HandleCarousel');
const router = express.Router();

/**
* --------------------------------------------------------------------------------------
*                          Carousel
* --------------------------------------------------------------------------------------
*   .get  '/get-home-carouel'    ====>  get the carosuel
*/



// get the carousel
router.get('/get-home-carouel', getCarouselImage);




module.exports = router;