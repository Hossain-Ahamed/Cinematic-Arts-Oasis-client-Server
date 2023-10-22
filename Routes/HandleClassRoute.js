const express = require('express');

const { verifyJWT, veryifyByRole } = require('../Middleware/middlewares');
const { Add_A_New_Class, getallClasses } = require('../controller/ClassController');
const router = express.Router();

/**
* --------------------------------------------------------------------------------------
*                                Class Creation and maintain
* --------------------------------------------------------------------------------------
*   .post '/instructor/add-class'   ====>  Upload a class  ==>Insstructor
*    .get  /get-all-classes
*/



router.post('/instructor/add-class', verifyJWT, veryifyByRole(['Instructor']), Add_A_New_Class)



router.get('/get-all-classes',getallClasses)




module.exports = router;