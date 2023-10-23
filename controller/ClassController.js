const process = require('process');
const { classCollection, classInfoCollection, allUserDataCollection } = require('../Mongo/DataCollection');
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



const getallClasses = async (req, res) => {
    try {


        const data = await classCollection.find({ status: "Approved" }).sort({ _id: -1 }).toArray();


        res.status(200).send(data);
    } catch (error) {
        console.error('Error while getting the profile:', error);
        res.status(500).send({ error: 'Internal server error FindTheProfileData  || getallClasses' });
    }
}


//get specific class data controller
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
        res.status(200).send(classData);
    } catch (error) {
        res.status(500).send({ message: "Internal server error || getclassListForAdmin_n_Instructor" });
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



// todo: admin user detail to user /admin controller


// todo : isntructor and admin edit a course
// insturctor only name and detail ,   admin and also price

module.exports = {
    Add_A_New_Class,
    getallClasses,
    getClassDetailByClassID,
    getInstructorDetailByInstructorID,
    getclassListForAdmin_n_Instructor,
    getclassDetailForAdmin_n_Instructor,
    changeClassStatus

}