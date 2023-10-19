const express = require('express');
const { FindTheProfileData, getThe_at_JWT, signInUploadDataController, UpdateUserProfileController } = require('../controller/UserHandle');
const { verifyJWT } = require('../Middleware/middlewares');
const router = express.Router();

/**
* --------------------------------------------------------------------------------------
*                                user Creation and maintain
* --------------------------------------------------------------------------------------
*   .post '/sign-in-upload-data'   ====>  Upload new profile to all-user-colection
*   .get  '/get-profile/:email'    ====>  get the profile
*   patch  '/update-user-profile/:email' => update profile
*/



// get the profile
router.get('/get-profile/:email', verifyJWT, FindTheProfileData);

// Upload new profile to all-user-colection
router.post('/sign-in-upload-data', signInUploadDataController)

// Update profile to all-user-colectio
router.patch('/update-user-profile/:email', verifyJWT,UpdateUserProfileController)

//------------------------ get the jwt ---------------------------
router.post('/jwt', getThe_at_JWT)


module.exports = router;