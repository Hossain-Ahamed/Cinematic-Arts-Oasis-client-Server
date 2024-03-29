const process = require('process');
const { classCollection, classInfoCollection, allUserDataCollection, enrolledStudentOfClassCollection } = require('../Mongo/DataCollection');
const { ObjectId } = require('mongodb');

// add class by instructor 
const Add_A_New_Class = async (req, res) => {
    try {
        const data = req.body;

        // Check if the class already exists by email and className
        const exist = await classCollection.findOne({ email: data?.email, className: data?.className });
        if (exist) {
            return res.status(409).send({ message: "Class Already Exists by this name" });
        }
        data.status = "Pending"
        // Insert data into the class-data collection
        const classDataResult = await classCollection.insertOne(data);

        // Create an object to store in the classInfo collection
        const classInfo = {
            email: data.email,
            classId: [], // Initialize as an empty array
        };

        // Find existing classInfo by email
        const existingClassInfo = await classInfoCollection.findOne({ email: data.email });

        if (existingClassInfo) {
            // If there's existing data, copy it into the new object
            classInfo.classId = existingClassInfo.classId || [];
        }

        // Add the new classData _id to the classId array
        classInfo.classId.push(classDataResult.insertedId);

        // Update the classInfo in the classInfo collection
        if (existingClassInfo) {
            await classInfoCollection.updateOne({ email: data.email }, { $set: { classId: classInfo.classId } });
        } else {
            await classInfoCollection.insertOne(classInfo);
        }

        res.status(200).send(true);
    } catch (error) {
        console.error('Error while adding a new class:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}


// update a class 
const updateAClass = async (req, res) => {
    try {
        const classID = req.params.classID
        const data = req.body;

        // Check if the class already exists by email and className
        const exist = await classCollection.findOne({ email: data?.email, className: data?.className });
        if (exist) {
            return res.status(409).send({ message: "Class Already Exists by this name" });
        }

        await classCollection.updateOne({ _id: new ObjectId(classID) }, { $set: data })


        await enrolledStudentOfClassCollection.updateMany({ class_ID: classID }, {
            $set: { className: req?.body?.className }
        })
        res.status(200).send({message : "updated"})
    } catch (error) {
        console.error('Error while adding a new class:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}




const getallClasses = async (req, res) => {
    try {


        const data = await classCollection.find({ status: "Approved" }).sort({ _id: -1 }).toArray();


        res.status(200).send(data);
    } catch (error) {
        console.error('Error while getting the profile:', error);
        res.status(500).send({ error: 'Internal server error FindTheProfileData  || getallClasses' });
    }
}


//get specific class data controller for home page
const getClassDetailByClassID = async (req, res) => {
    try {
        const classID = req.params.classID;
        const classInfo = await classCollection.findOne({ _id: new ObjectId(classID), status: "Approved" }, { projection: { UID: 0 } });
        // console.log(72,classInfo)

        if (!classInfo) {
            // console.log(404)
            return res.status(404).send({ message: "No class with this ID" });
        }

        const InstructorInfo = await allUserDataCollection.findOne(
            { email: classInfo?.email, role: "Instructor" },
            { projection: { name: 1, photoURL: 1, phone: 1, _id: 1, gender: 1, institute: 1, email: 1 } }
        );
        if (!InstructorInfo) {
            return res.status(404).send({ message: "Instructor No Longer Available" });
        }

        res.status(200).send({ classInfo, InstructorInfo });
    } catch (error) {
        res.status(500).send({ message: "Internal server error  || getClassDetailByClassID" });
    }
};


//instructor detail 
const getInstructorDetailByInstructorID = async (req, res) => {
    try {
        const insID = req.params.insID;

        const InstructorInfo = await allUserDataCollection.findOne(
            {
                _id: new ObjectId(insID),
                role: "Instructor"
            },

            { projection: { name: 1, photoURL: 1, phone: 1, _id: 1, gender: 1, institute: 1, email: 1 } }
        );
        if (!InstructorInfo) {
            return res.status(404).send({ message: "Instructor No Longer Available" });
        }

        let classInfo = [];
        classInfo = await classCollection.find({ email: InstructorInfo?.email, status: "Approved" }).sort({ _id: -1 }).toArray();
        if (!classInfo) {
            console.log(404)
            return res.status(404).send({ message: "No class with this ID" });
        }

        res.status(200).send({ classInfo, InstructorInfo });
    } catch (error) {
        res.status(500).send({ message: "Internal server error  || getClassDetailByClassID" });
    }
};


//get class list for admin n instryctor
const getclassListForAdmin_n_Instructor = async (req, res) => {
    try {
        const { type, email, role } = req.query;
        // console.log(req.query)
        const userRole = req?.data?.role;
        const userEmail = req?.data?.email;

        if (userRole !== role || userEmail !== email) {
            return res.status(401).send({ message: "Forbidden || You tried to access others" });
        }

        let filters = {};

        if (role === "Instructor") {
            // Add the email filter for Instructors
            filters.email = email;
        }
        if (type !== "All") {

            filters.status = type;
        }


        const data = await classCollection.find(filters).sort({ _id: -1 }).toArray();
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({ message: "Internal server error || getclassListForAdmin_n_Instructor" });
    }
};


//get class detail for admin n instryctor
const getclassDetailForAdmin_n_Instructor = async (req, res) => {
    try {
        const classID = req.params.classID;

        const userRole = req?.data?.role;
        const userEmail = req?.data?.email;

        const classData = await classCollection.findOne({ _id: new ObjectId(classID) });

        if (userRole !== "Admin" && userEmail !== classData?.email) {
            return res.status(404).send({ message: "No data " });
        }

        let projection = {
            _id: 1,
            std_ID: 1,
            stdName: 1,
            stdEmail: 1,
            stdUID: 1,

            Joindate: 1,
        };

        if (userRole === "Admin") {
            projection = {
                _id: 1,
                std_ID: 1,
                stdName: 1,
                stdEmail: 1,
                stdUID: 1,

                Joindate: 1,
                transaction_method_email: 1,
                transaction_method_name: 1,
                transaction_method_phone: 1,
                transactionID: 1,
                intent_methodID: 1,
                methodID: 1,
                price: 1,
            }
        }

        const students = await enrolledStudentOfClassCollection
            .find({ class_ID: classData?._id.toString() })
            .sort({ _id: -1 })
            .project({ ...projection })
            .toArray();

        res.status(200).send({ classData, students });
    } catch (error) {
        console.error(203, error)
        res.status(500).send({ message: "Internal server error || getclassListForAdmin_n_Instructor" });
    }
};





//get class detail for  instryctor to edit
const getclassDetailForInstructorForedit = async (req, res) => {
    try {
        const classID = req.params.classID;


        const classData = await classCollection.findOne({ _id: new ObjectId(classID) });
        res.status(200).send(classData);
    } catch (error) {
        console.error(203, error)
        res.status(500).send({ message: "Internal server error || getclassListForAdmin_n_Instructor" });
    }
};

//get all the class as payment history for student
const get_Class_as_paymentHistory_ForSTUDENT = async (req, res) => {
    try {

        let projection = {
            _id: 1,
            className: 1,
            class_ID: 1,
            Joindate: 1,
            InstructorName: 1,
            transaction_method_email: 1,
            transaction_method_name: 1,
            transaction_method_phone: 1,
            transactionID: 1,
            intent_methodID: 1,
            methodID: 1,
            price: 1,
        };

        const classes = await enrolledStudentOfClassCollection
            .find({ stdEmail: req.data?.email })
            .sort({ _id: -1 })
            .project({ ...projection })
            .toArray();

        res.status(200).send(classes);
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: "Internal server error || get_Class_as_paymentHistory_ForSTUDENT" });
    }
};




//change status of class by admin
const changeClassStatus = async (req, res) => {
    try {
        const classID = req.params.classID;
        let { status } = req.body;
        const userRole = req?.data?.role;


        if (userRole !== "Admin") {
            return res.status(401).send({ message: "Unauthorized: Only Admin can change class status" });
        }
        if (!["Pending", "Denied", "Approved"].includes(status)) {
            status = "Pending";
        }

        const filter = { _id: new ObjectId(classID) };
        const update = { $set: { status: status } };

        const result = await classCollection.updateOne(filter, update);

        if (result.matchedCount === 1 && result.modifiedCount === 1) {
            res.status(200).send({ message: "Class status updated successfully" });
        } else {

            res.status(404).send({ message: "Class not found or status not updated" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error: Unable to change class status" });
    }
};


//kick out a student from class by admin
const handleKickOutFromClass = async (req, res) => {
    try {
        if (req.data?.role !== "Admin") {
            return res.status(401).send({ message: "unauthorized, not an Admin" })
        }
        const ID = req.params.dataID;
        const result = await enrolledStudentOfClassCollection.deleteOne({ _id: new ObjectId(ID) });
        if (result.deletedCount) {
            res.status(200).send({ message: "Removed From class" })
        } else {
            res.status(400).send({ message: "Failed" })
        }

    } catch (e) {
        console.log(e);
        // Bad Request: Server error or client sent an invalid request
        res.status(500).send({ message: "Bad Request: handleKickOutFromClass Server error or invalid request" });
    }
}

const getAllMyPurchasesClasses_For_Student = async (req, res) => {
    try {
        const studentEmail = req.data?.email;


        if (!studentEmail) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        // const pipeline = [
        //     {
        //         $match: { stdEmail: studentEmail }
        //     },
        //     {
        //         $project: {
        //             class_ID: { $toObjectId: "$class_ID" } ,// Convert class_ID to ObjectId
        //             stdEmail : 1,
        //             std_ID : 1,
        //             Joindate :1
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'class-data',
        //             localField: "class_ID",
        //             foreignField: "_id",
        //             as: "classData"
        //         },

        //     },
        //     {
        //         $sort: { _id: -1 }
        //     }
        // ];


        const pipeline = [
            {
                $match: { stdEmail: studentEmail }
            },
            {
                $project: {
                    class_ID: { $toObjectId: "$class_ID" }, // Convert class_ID to ObjectId
                    className: 1,
                    Joindate: 1,
                    InstructorName: 1,
                }
            },
            {
                $lookup: {
                    from: 'class-data',
                    let: { classId: "$class_ID" }, // Create a variable for the class_ID
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$classId"]
                                }
                            }
                        },
                        {
                            $project: {
                                videoURL: 1,// Include only className from the foreign collection
                                photoURL: 1, // Include only className from the foreign collection


                            }
                        }
                    ],
                    as: "classData"
                }
            },
            {
                $sort: { _id: -1 }
            }
        ];

        // Debug log: Output the pipeline to ensure it's correct
        // console.log("Aggregation Pipeline:", JSON.stringify(pipeline, null, 2));

        const classes = await enrolledStudentOfClassCollection.aggregate(pipeline).toArray();

        // Debug log: Output the result of the aggregation
        // console.log("Aggregation Result:", JSON.stringify(classes, null, 2));

        if (classes && classes.length > 0) {
            // You have retrieved the purchased classes with additional data from classCollection.
            res.status(200).send(classes);
        } else {
            console.log('No purchased classes found');
            // If no classes are found, you can send an appropriate message.
            res.status(404).send({ message: "No purchased classes found" });
        }



    } catch (e) {
        console.error(e);
        // Bad Request: Server error or client sent an invalid request
        res.status(500).send({ message: "Bad Request: getAllMyPurchasesClasses_For_Student Server error or invalid request" });
    }
}

module.exports = {
    Add_A_New_Class,
    getallClasses,
    getClassDetailByClassID,
    getInstructorDetailByInstructorID,
    getclassListForAdmin_n_Instructor,
    getclassDetailForAdmin_n_Instructor,
    changeClassStatus,
    handleKickOutFromClass,
    get_Class_as_paymentHistory_ForSTUDENT,
    getAllMyPurchasesClasses_For_Student,
    getclassDetailForInstructorForedit,
    updateAClass

}