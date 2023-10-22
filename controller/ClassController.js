const process = require('process');
const { classCollection ,classInfoCollection} = require('../Mongo/DataCollection');

// add class by instructor 
const Add_A_New_Class = async (req, res) => {
    try {
        const data = req.body;

        // Check if the class already exists by email and className
        const exist = await classCollection.findOne({ email: data?.email, className: data?.className });
        if (exist) {
            return res.status(409).send({ message: "Class Already Exists by this name" });
        }

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


        const data = await classCollection.find().sort({ _id: -1 }).toArray();


        res.status(200).send(data);
    } catch (error) {
        console.error('Error while getting the profile:', error);
        res.status(500).send({ error: 'Internal server error FindTheProfileData' });
    }
}

module.exports = {
    Add_A_New_Class,
    getallClasses
}