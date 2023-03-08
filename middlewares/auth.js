const jwt = require('jsonwebtoken');
const ENV = require('../env/index').envSettings();
const CONSTANTS = require("../constants/constants");
const CATCH_MESSAGES = require('../constants/catchMessages');

// create authentication token using JWT
const createAuthentication = async (tokenDetails) => {
    const token = jwt.sign(
        tokenDetails,
        ENV.JWT_SECRET_KEY, {
            expiresIn: "2h",
        }
    );
    return token;
}

//validate user role and auth token using JWT
const validateAuth = (roleArr) => (req, res, next) => {
    try {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).send({
                    success: false,
                    message: CONSTANTS.MESSAGES.LOGIN_REQUIRED,
                });
            }
            try {
                const decoded = jwt.verify(token, ENV.JWT_SECRET_KEY);                              
                req.body.decoded = decoded;
                               
                if(roleArr.includes(req.body.decoded.role)) { 
                    return next();      
                } else {
                    const error = new Error(CONSTANTS.MESSAGES.INVALID_CREDENTIALS);
                    throw error;
                }           
            } catch (error) {
                console.log(CATCH_MESSAGES.VALIDATE_AUTH,error);
                return res.status(401).send({
                    success: false,
                    message: CONSTANTS.MESSAGES.LOGIN_REQUIRED
                });
            }
        } else {
            return res.status(401).send({
                success: false,
                message: CONSTANTS.MESSAGES.LOGIN_REQUIRED,
            });
        }
    } catch (error) {
        console.log(CATCH_MESSAGES.VALIDATE_AUTH,error);
        res.status(401).send({
            success: false,
            message: CONSTANTS.MESSAGES.LOGIN_REQUIRED
        });
    }
}


module.exports = {
    createAuthentication,
    validateAuth      
}