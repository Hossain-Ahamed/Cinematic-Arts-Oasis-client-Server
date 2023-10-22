const express = require('express');
const { FindTheProfileData, getThe_at_JWT, signInUploadDataController, UpdateUserProfileController, getAllUser, UpdateUserProfileControllerByAdmin, temp } = require('../controller/UserHandle');
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

//getprofile by admin
router.get('/get-user-profile/:email', verifyJWT,veryifyByRole(["Admin"]),FindTheProfileData);

// Upload new profile to all-user-colection    
router.post('/sign-in-upload-data', signInUploadDataController)//==>deprecated

// Update profile to all-user-colectio
router.patch('/update-user-profile/:email', verifyJWT,UpdateUserProfileController)


// Update profile to all-user-colection by admin
router.patch('/update-user-profile-by-admin/:email', verifyJWT,veryifyByRole(["Admin"]),UpdateUserProfileControllerByAdmin)


// admin -> get all users
router.get('/all-users', verifyJWT,veryifyByRole(["Admin"]),getAllUser)

// router.get('/bal',temp)

//------------------------ get the jwt ---------------------------
router.post('/jwt', getThe_at_JWT)


module.exports = router;