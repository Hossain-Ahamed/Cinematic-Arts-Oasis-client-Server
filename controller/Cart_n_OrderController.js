const process = require('process');
const { cartCollection, classCollection, enrolledStudentOfClassCollection } = require('../Mongo/DataCollection');
const { ObjectId } = require('mongodb');


// This is your test secret API key.
const stripe = require("stripe")(process.env.PK_KEY);

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
            // Filter out classes that the user has already enrolled in
            const filteredItems = await Promise.all(cart.items.filter(async (classId) => {
                const isEnrolled = await enrolledStudentOfClassCollection.findOne({ stdEmail: requestedEmail, class_ID: classId });
                if (isEnrolled) {
                    // Remove the class from the cart
                    await cartCollection.updateOne({ email: requestedEmail }, { $pull: { items: classId } });
                    return false;
                }
                return true;
            }));

            // Map the array of class _id values to class details
            const itemDetails = await Promise.all(filteredItems.map(async (classId) => {
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
        // console.log(req.body)
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


// individual detail of a cart 
const detailOfTheItemOfIndividialItem = async (req, res) => {
    try {

        const { cartItemID, RequsetedEmail } = req.params;

        if (req.data?.email !== RequsetedEmail) {
            return res.status(401).send({ message: "unauthorized, email not same with token and request" })
        }


        //checking the requested cart id is in his cart data 
        const existsInCart = await cartCollection.findOne(
            {
                email: RequsetedEmail,
                items: { $in: [cartItemID] }
            },
            { projection: { _id: 1, items: 0, email: 0 } }// Fetch only the _id if the item exists
        );

        if (!existsInCart) {
            return res.status(404).send({ message: "This is not found in your cart" })
        }


        const exist = await enrolledStudentOfClassCollection.findOne({ stdEmail: RequsetedEmail, class_ID: cartItemID });
        if (exist) {
            return res.status(409).send({ message: "You are already enrolled in this class" });
        }


        // if exists then fetch the data 
        const classDetailByID = await classCollection.findOne(
            {
                _id: new ObjectId(cartItemID),
                availableSeats: { $gt: 0 },
                status: "Approved"
            },
            {
                _id: 1,
                email: 1,
                name: 1,
                UID: 1,
                className: 1,
                CoursePrice: 1,
                availableSeats: 1
            }
        );

        if (classDetailByID) {
            // The document meets the criteria
            res.status(200).send({ Details: classDetailByID, price: parseFloat(classDetailByID?.CoursePrice.toFixed(2)) });
        } else {
            // The document doesn't meet the criteria
            res.status(404).send({ message: "Class not available to purchase" });
        }


    } catch (e) {
        console.log(e);
        res.status(500).send({ message: "detailOfTheItemOfIndividialItem server error" })
    }
}


// payment gateway 
const CreatePaymentIntent = async (req, res) => {
    try {


        const { price } = req.body;

        const ammount = parseInt(price * 100);


        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: ammount,
            currency: "usd",

            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        console.log(e);
        // Bad Request: Server error or client sent an invalid request
        res.status(500).send({ message: "Bad Request: Server error or invalid request" });
    }
};


//enroll to new clss
const EnrollToClass = async (req, res) => {
    try {
        const {
            std_ID,
            stdName,
            stdEmail,
            stdUID,
            InstructorName,
            InstructorEmail,
            InstructorUID,
            clssName,
            class_ID,
            transaction_method_email,
            transaction_method_name,
            transaction_method_phone,
            transactionID,
            intent_methodID,
            methodID,
            price,
            Joindate,
        } = req.body;

        const exist = await enrolledStudentOfClassCollection.findOne({ stdEmail: stdEmail, class_ID: class_ID });

        if (exist) {
            return res.status(409).send({ message: "You are already enrolled in this class" });
        }

        const data = {
            std_ID,
            stdName,
            stdEmail,
            stdUID,
            InstructorName,
            InstructorEmail,
            InstructorUID,
            clssName,
            class_ID,
            transaction_method_email,
            transaction_method_name,
            transaction_method_phone,
            transactionID,
            intent_methodID,
            methodID,
            price,
            Joindate,
        };

        const result = await enrolledStudentOfClassCollection.insertOne(data);



        if (result.insertedId) {
            // Document inserted successfully
            await cartCollection.updateOne(
                { email: stdEmail },
                {
                    $pull: { items: class_ID }
                });

            await classCollection.updateOne({ _id: new ObjectId(class_ID) },
                { $inc: { availableSeats: -1 } });

            return res.status(200).send({ message: "Document inserted successfully" });
        } else {
            // Conflict: Insertion failed due to a client-related issue (e.g., duplicate data)
            return res.status(400).send({ message: " Failed to insert the document" });
        }
    } catch (e) {
        console.log(e);
        // Bad Request: Server error or client sent an invalid request
        res.status(500).send({ message: "Bad Request: Server error or invalid request" });
    }
};




module.exports = {
    getCart,
    getDetailCart,
    addTocart,
    RemoveFromCart,
    detailOfTheItemOfIndividialItem,


    CreatePaymentIntent,
    EnrollToClass
}