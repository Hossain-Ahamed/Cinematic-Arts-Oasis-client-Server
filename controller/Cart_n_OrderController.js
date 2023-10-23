const process = require('process');
const { cartCollection, classCollection } = require('../Mongo/DataCollection');
const { ObjectId } = require('mongodb');



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

const getDetailCart = async (req, res) => {
    try {
        const requestedEmail = req.params.email;
        const authenticatedEmail = req.data?.email;

        if (!authenticatedEmail || authenticatedEmail !== requestedEmail) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const cart = await cartCollection.findOne({ email: requestedEmail });

        if (cart) {
            // Map the array of class _id values to class details
            const itemDetails = await Promise.all(cart.items.map(async (classId) => {
                const classDetail = await classCollection.findOne({ _id: new ObjectId(classId) });
                return classDetail;
            }));
     

            // Update the cart object to include the detailed item information
            const cartWithItemDetails = {
                ...cart,
                items: itemDetails,
            };

            res.status(200).send(cartWithItemDetails);
        } else {
            res.status(404).send({ message: "Cart not found" });
        }
    } catch (error) {
        console.error("Error in getCart:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};


// add in cart
const addTocart = async (req, res) => {
    try {
        const { classID } = req.body;
        console.log(req.body)
        if (req.data?.email !== req.params.email) {
            return res.status(401).send("unauthorized")
        }

        const clasinfo = await classCollection.findOne(
            { _id: new ObjectId(classID) },
            { projection: { className: 1, availableSeats: 1 } }
        );
        if (!clasinfo || !clasinfo?.availableSeats || clasinfo?.availableSeats <= 0) {
            return res.status(404).send({ message: "No seat available" });
        }
        const result = await cartCollection.updateOne(
            { email: req.params.email },
            {
                $push: { items: classID }
            });
        if (result.matchedCount === 1 && result.modifiedCount === 1) {
            res.status(200).send({ message: "Added successfully" });
        } else {

            res.status(404).send({ message: " not found " });
        }
    } catch (e) {

        console.log(e)
        res.status(500).send("getcart server error")

    }

}


const RemoveFromCart = async (req, res) => {
    try {
        const { classID } = req.body;
        if (req.data?.email !== req.params.email) {
            return res.status(401).send("unauthorized")
        }


        const result = await cartCollection.updateOne(
            { email: req.params.email },
            {
                $pull: { items: classID }
            });
        if (result.matchedCount === 1 && result.modifiedCount === 1) {
            res.status(200).send({ message: "Deleted" });
        } else {

            res.status(404).send({ message: " not found " });
        }
    } catch (e) {
        console.log(e)
        res.status(500).send("getcart server error")
    }


}

module.exports = {
    getCart,
    getDetailCart,
    addTocart,
    RemoveFromCart
}