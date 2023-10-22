const jwt = require('jsonwebtoken');
const process = require('process');
const { allUserDataCollection, cartCollection } = require('../Mongo/DataCollection');


// find the profile data 
const FindTheProfileData = async (req, res) => {
    try {
        const email = req.params.email;
        // console.log(req.params)
        const user = await allUserDataCollection.findOne({ email: email });

        if (!user) {
            return res.status(200).send({ dataFound: false })
        }

        return res.status(200).send({ ...user, dataFound: true })
    } catch (error) {
        console.error('Error while getting the profile:', error);
        res.status(500).send({ error: 'Internal server error FindTheProfileData' });
    }


}


// Upload new profile to all-user-colection
const signInUploadDataController = async (req, res) => {
    const data = req.body;
    const {
        name,
        email,
        photoURL,
        phone,
        firebase_UID,
    } = data;


    const exist = await allUserDataCollection.findOne({ email: data?.email });

    if (exist) {
        return res.status(200).send("successful")
    }


    const cartDoc = {
        email: email,
        items: [],
    };
    const cartInsertResult = await cartCollection.insertOne(cartDoc);

    // Get the generated _id of the newly inserted cart document
    const newCartID = cartInsertResult.insertedId;

    const uploadData = {
        name,
        email,
        photoURL,
        phone,
        firebase_UID,
        role: "Student",
        cartID: newCartID,
        following: []
    }

    const result = await allUserDataCollection.insertOne(uploadData);
    res.status(200).send(result);
}



// Update profile to all-user-colectio
const UpdateUserProfileController = async (req, res) => {
    try {

        if (req.data?.email !== req.params.email) {
            return res.status(401).send({ message: "Unauthorized    ||  from UpdateUserProfileController" });
        }
        const data = req.body;
        const result = await allUserDataCollection.updateOne({ email: req.params.email }, { $set: data });


        res.status(200).send(result);
    } catch {
        e => {
            res.status(500).send({ message: "internal server error UpdateUserProfileController" });
        }
    }

}


const UpdateUserProfileControllerByAdmin = async (req, res) => {
    try {

        const email = req.params.email
        if (!email) {
            return res.status(404).send({ message: "Unauthorized" });
        }

        const data = req.body;

        const prevData = await allUserDataCollection.findOne({email : email});

console.log(data.role,prevData?.role)
        if(data.role !==prevData?.role){
            if (data.role === 'Admin' || data.role === 'Instructor') {
                // If the role is 'Admin' or 'Instructor', remove 'following' and 'cartID' from the user's document
                const update = {
                    $set: data,
                    $unset: { following: "", cartID: "" }
                };
                await cartCollection.deleteOne({email : email});
                await allUserDataCollection.updateOne({ email: req.params.email }, update);
            } else {
    
                const cartDoc = {
                    email: email,
                    items: [],
                };
                const cartInsertResult = await cartCollection.insertOne(cartDoc);
    
                // Get the generated _id of the newly inserted cart document
                const newCartID = cartInsertResult.insertedId;
    
                data.following= [];
                data.cartID = newCartID
    
                // If the role is not 'Admin' or 'Instructor, update the user's profile without removing fields
                await allUserDataCollection.updateOne({ email: req.params.email }, { $set: data });
            }
        }else{
            await allUserDataCollection.updateOne({ email: req.params.email }, { $set: data });
        }
       

        res.status(200).send({ message: "Profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal Server Error" });
    }
};


//get all user
const getAllUser = async (req, res) => {
    try {
        const { search, currentPage, numberOfSizeInTableData } = req.query;

        let filters = {};



        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firebase_UID: { $regex: search, $options: 'i' } },
                { institute: { $regex: search, $options: 'i' } },
                { gender: { $regex: search, $options: 'i' } },
            ];
        }

        const page = parseInt(currentPage) || 0;
        const size = parseInt(numberOfSizeInTableData) || 15;
        const skipCount = page * size;

        let users = await allUserDataCollection
            .find(filters)
            .sort({ _id: -1 })
            .skip(skipCount)
            .limit(size)
            .toArray();

        let totalCount = await allUserDataCollection.countDocuments(filters); // Use filters here, not dateFilter

        if (!users) {
            users = [];
            totalCount = 0;
        }

        res.status(200).send({ dataList: users, totalCount: totalCount });

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Internal server error: get all user" });
    }
};



// ------- get jwt 
const getThe_at_JWT = async (req, res) => {
    const { name, email, photoURL, phone, firebase_UID } = req.body;
    // console.log("jwt", req.body);
    let userDataForJWT = await allUserDataCollection.findOne({ email: email });

    if (!userDataForJWT) {


        const cartDoc = {
            email: email,
            items: [],
        };
        const cartInsertResult = await cartCollection.insertOne(cartDoc);

        // Get the generated _id of the newly inserted cart document
        const newCartID = cartInsertResult.insertedId;
        userDataForJWT = {
            name,
            email,
            photoURL,
            phone,
            firebase_UID,
            role: "Student",
            cartID: newCartID,
            following: []
        }
        await allUserDataCollection.insertOne(userDataForJWT);

    }

    const token = jwt.sign(userDataForJWT, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    res.cookie("_at", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        // expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
    });
    res.send({ token })
}





const temp = async (req, res) => {
    try {
        // Fetch all user data from the userCollection
        const users = await allUserDataCollection.find().toArray();

        // Create an array of promises to process user data
        const promises = users.map(async (user) => {
            if (user.role !== 'Admin' && user.role !== 'Instructor') {
                // Create a new document in the cart collection
                const cartDoc = {
                    email: user.email,
                    items: [],
                };
                const cartInsertResult = await cartCollection.insertOne(cartDoc);

                // Get the generated _id of the newly inserted cart document
                const newCartID = cartInsertResult.insertedId;

                // Update the userCollection with the new cartID and an empty following array
                const update = {
                    $set: {
                        cartID: newCartID,
                        following: [],
                    },
                };
                await allUserDataCollection.updateOne({ _id: user._id }, update);
            }
        });

        // Wait for all promises to complete
        await Promise.all(promises);

        console.log('Process completed.');
        res.send("hdsjafhhsd")
    } catch (err) {
        console.error('Error:', err);
    }
};



module.exports = {
    getAllUser,
    FindTheProfileData,
    getThe_at_JWT,
    signInUploadDataController,
    UpdateUserProfileController,
    UpdateUserProfileControllerByAdmin,
    temp
}