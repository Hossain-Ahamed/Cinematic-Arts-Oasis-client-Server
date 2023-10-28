const express = require('express');
const { FindTheProfileData, getThe_at_JWT, signInUploadDataController, UpdateUserProfileController, getAllUser, UpdateUserProfileControllerByAdmin, temp, getAllInstructor, followInstructor, getAllFollowedInstructor, userDetailViewForAdmin, getAllFollowers_Of_Instructor } = require('../controller/UserHandle');
const { verifyJWT, veryifyByRole } = require('../Middleware/middlewares');
const { getInstructorDetailByInstructorID } = require('../controller/ClassController');
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
//admin --> user detail data
router.get('/all-users/:userID', verifyJWT,veryifyByRole(["Admin"]),userDetailViewForAdmin)

// get all instructor for all 
router.get('/get-all-instructors',getAllInstructor);



// get instructor  detail for all 
router.get('/get-all-instructors/:insID',getInstructorDetailByInstructorID);


// follow unfollow 
router.patch('/followings',verifyJWT,veryifyByRole(['Student']),followInstructor);


// get all followed instructor 
router.get('/get-all-followed-instructors',verifyJWT,veryifyByRole(['Student']),getAllFollowedInstructor)


// get all follower of an  instructor 
router.get('/get-my-followers/:_id',verifyJWT,veryifyByRole(['Instructor']),getAllFollowers_Of_Instructor)


//------------------------ get the jwt ---------------------------
router.post('/jwt', getThe_at_JWT)


module.exports = router;