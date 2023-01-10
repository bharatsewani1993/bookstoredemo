const express = require('express');
const router = express.Router();
const {signUpValidations,signInValidations} = require('../validations/userValidations');
const {signUp,signIn} = require('../controller/userController');

const validate = require('../middlewares/validate');

//user signup  
router.post('/sign-up',validate(signUpValidations),signUp);

//user login  
router.post('/sign-in',validate(signInValidations),signIn);

module.exports = router;