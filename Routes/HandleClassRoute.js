const express = require('express');

const { verifyJWT, veryifyByRole } = require('../Middleware/middlewares');
const { Add_A_New_Class } = require('../controller/ClassController');
const router = express.Router();

/**
* --------------------------------------------------------------------------------------
*                                Class Creation and maintain
* --------------------------------------------------------------------------------------
*   .post '/instructor/add-class'   ====>  Upload a class  ==>Insstructor
*/



router.post('/instructor/add-class', verifyJWT, veryifyByRole(['Instructor']), Add_A_New_Class)





module.exports = router;