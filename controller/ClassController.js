const process = require('process');
const { classCollection } = require('../Mongo/DataCollection');

// add class by instructor 
const Add_A_New_Class = async (req,res)=>{
    try {
        const data = req.body;
    
        const exist = await classCollection.findOne({email: data?.email, className : data?.className});
        if(exist){
            return res.status(409).send({message:"Class Already Exist by this name"})
        }
        await classCollection.insertOne(data);
        res.status(200).send(true);
    } catch (error) {
        console.error('Error while getting the profile:', error);
        res.status(500).send({ error: 'Internal server error FindTheProfileData' });
    }
}

module.exports ={
    Add_A_New_Class,
}