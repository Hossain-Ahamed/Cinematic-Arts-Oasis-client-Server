const express = require('express');

const { verifyJWT, veryifyByRole } = require('../Middleware/middlewares');
const { Add_A_New_Class, getallClasses, getClassDetailByClassID, getclassListForAdmin_n_Instructor, getclassDetailForAdmin_n_Instructor, changeClassStatus, handleKickOutFromClass, get_Class_as_paymentHistory_ForSTUDENT, getAllMyPurchasesClasses_For_Student, getclassDetailForInstructorForedit, updateAClass } = require('../controller/ClassController');
const router = express.Router();

/**
* --------------------------------------------------------------------------------------
*                                Class Creation and maintain
* --------------------------------------------------------------------------------------
*   .post '/instructor/add-class'   ====>  Upload a class  ==>Insstructor
*    .get  /get-all-classes          
*/



router.post('/instructor/add-class', verifyJWT, veryifyByRole(['Instructor']), Add_A_New_Class)


//get all classes
router.get('/get-all-classes', getallClasses);

//get class by classID
router.get('/get-all-classes/:classID', getClassDetailByClassID);


// classlist 
router.get('/manage-classes/class-list', verifyJWT, veryifyByRole(["Admin", "Instructor"]), getclassListForAdmin_n_Instructor)

// class detail 
router.get('/manage-classes/class-list/:classID', verifyJWT, veryifyByRole(["Admin", "Instructor"]), getclassDetailForAdmin_n_Instructor)

//get data for edit a class for instructor
router.get('/my-classes/:classID/edit', verifyJWT, veryifyByRole(["Instructor"]), getclassDetailForInstructorForedit);
router.patch('/my-classes/:classID/edit', verifyJWT, veryifyByRole(["Instructor"]), updateAClass);


// chnage status of class 
router.patch('/manage-classes/class-list/change-status/:classID', verifyJWT, veryifyByRole(["Admin"]), changeClassStatus);


//kick out from class
router.delete('/kick-out-from-class/:dataID', verifyJWT, veryifyByRole(['Admin']), handleKickOutFromClass)


//student visit his payment history
router.get('/get-my-payment-history', verifyJWT, veryifyByRole(["Student"]), get_Class_as_paymentHistory_ForSTUDENT);

//get all my purchased class list 
router.get('/student-panel/my-class-list', verifyJWT, veryifyByRole(["Student"]), getAllMyPurchasesClasses_For_Student);


module.exports = router;