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

        req.data = decoded;
        next();

    })

}
const veryifyByRole = (allowedRoles) => {
    return (req, res, next) => {
        const {email,role} = req.data;
  
        if(!email || !allowedRoles.includes(role)){
            res.status(403).send({data: "unauthorized access || veryifyByRole "})
        }
        next();
    }
}


module.exports = {
    verifyJWT,
    veryifyByRole

}