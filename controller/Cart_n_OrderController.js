const process = require('process');
const { cartCollection } = require('../Mongo/DataCollection');



const getCart = async (req, res) => {
    try {
        if (req.data?.email !== req.params.email) {
            return res.status(401).send("unauthorized")
        }


    const carts = await cartCollection.findOne({ email: req.params.email });
        res.status(200).send(carts)
    } catch {
        e => {
            res.status(500).send("getcart server error")
        }
    }

}

module.exports ={
    getCart
}