const jwt = require('jsonwebtoken');
const process = require('process'); 
const { allUserDataCollection } = require('../Mongo/allUserDataCollection');


// find the profile data 
const FindTheProfileData= async (req, res) => {
    try{
        const email = req.params.email;
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
const signInUploadDataController= async (req, res) => {
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


    const uploadData = {
        name,
        email,
        photoURL,
        phone,
        firebase_UID,
        role: "Student"
    }

    const result = await allUserDataCollection.insertOne(uploadData);
    res.status(200).send(result);
}



 // Update profile to all-user-colectio
const UpdateUserProfileController =async (req, res) => {
    try {
        console.log(req.email)
        if(req.email !== req.params.email){
            return  res.status(401).send({message : "Unauthorized    "});
        }
        const data = req.body;
        const result = await allUserDataCollection.updateOne({ email: req.params.email }, { $set: data });


        res.status(200).send(result);
    }catch{
        e=>{
            res.status(500).send({message : "internal server error UpdateUserProfileController"});
        }
    }
   
}




// ------- get jwt 
const getThe_at_JWT= async (req, res) => {
    const user = req.body;

    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.cookie("_at", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
    });
    res.send({ token })
}



module.exports ={
    FindTheProfileData,
    getThe_at_JWT,
    signInUploadDataController,
    UpdateUserProfileController
}