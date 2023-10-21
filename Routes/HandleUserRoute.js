const express = require('express');
const { FindTheProfileData, getThe_at_JWT, signInUploadDataController, UpdateUserProfileController, getAllUser } = require('../controller/UserHandle');
const { verifyJWT, veryifyByRole } = require('../Middleware/middlewares');
const router = express.Router();

/**
* --------------------------------------------------------------------------------------
*                                user Creation and maintain
* --------------------------------------------------------------------------------------
*   .post '/sign-in-upload-data'   ====>  Upload new profile to all-user-colection  ==>deprecated
*   .get  '/get-profile/:email'    ====>  get the profile
*   patch  '/update-user-profile/:email' => update profile
*    get   /all-users                    => get all users
*/



// get the profile
router.get('/get-profile/:email', verifyJWT, FindTheProfileData);

// Upload new profile to all-user-colection    
router.post('/sign-in-upload-data', signInUploadDataController)//==>deprecated

// Update profile to all-user-colectio
router.patch('/update-user-profile/:email', verifyJWT,UpdateUserProfileController)


// admin -> get all users
router.get('/all-users', verifyJWT,veryifyByRole(["Admin"]),getAllUser)

//------------------------ get the jwt ---------------------------
router.post('/jwt', getThe_at_JWT)


module.exports = router;