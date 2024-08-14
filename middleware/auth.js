const jwt = require('jsonwebtoken');
const config = process.env;

//importing models
const Blacklist = require("../models/blacklist");

const verifyToken = async (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers["authorization"]

    if (!token) {
        return res.status(403).json({
            success: false,
            msg: 'Token not found'
        });

    }

    try {
        //spliting token after bearer (bearer Token_Value)
        const bearer = token.split(' ');
        //after spliting [bearer] [Token_Value]

        //storing splitied token value
        const bearerToken = bearer[1];

        //Checking blacklist toke
        const blacklistedToken = await Blacklist.findOne({ token: bearerToken })

        if (blacklistedToken) {
            return res.status(403).json({
                success: false,
                msg: 'Session Expired Please Login Again'
            });

        }

        const decodedData = jwt.verify(bearerToken, config.JWT_SECRET)
        req.user = decodedData;

    }
    catch (error) {
        return res.status(401).json({
            success: false,
            msg: 'Invalid Token'
        });
    }

    return next();

}

module.exports = verifyToken