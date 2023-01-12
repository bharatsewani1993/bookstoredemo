const express = require('express');
const router = express.Router();
const {signUpValidations,signInValidations} = require('../validations/userValidations');
const {signUp,signIn,getOrders} = require('../controller/userController');
const CONSTANTS = require("../constants/constants");
const validate = require('../middlewares/validate');
const {validateAuth} = require('../middlewares/auth');


//user signup  
router.post('/sign-up',validate(signUpValidations),signUp);

//user login  
router.post('/sign-in',validate(signInValidations),signIn);

//list all orders of user.
router.get('/orders',validateAuth([CONSTANTS.ROLE.CUSTOMER]),getOrders);

module.exports = router;