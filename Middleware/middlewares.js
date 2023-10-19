const jwt = require('jsonwebtoken');
const process = require('process'); // Make sure to import process to access environment variables

const verifyJWT = (req, res, next) => {
    // console.log(req.cookies)
    // console.log('header ',req.headers)
    const authorization = req.headers.authorization;
    // console.log('auth ',authorization)
    if (!authorization) {
        console.log("No Auth Data found for ", req.path)
        return res.status(401).send({ error: true, message: "Unauthorized Access" });
    }

    //bearer token
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log("Auth code was Invalid ")
            return res.status(403).send({ error: true, message: "Unauthorized Access || Invalid Token" });
        }

        req.email = decoded?.email;
        next();

    })

}



module.exports ={
    verifyJWT,
    
}