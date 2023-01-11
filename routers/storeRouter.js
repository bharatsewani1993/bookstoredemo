const express = require('express');
const router = express.Router();
const {bookValidations} = require('../validations/bookValidations');
const {deleteOrderValidations} = require('../validations/orderValidations');
const {uploadBook,listSellerBooks,listAllBooks,createOrder,deleteOrder} = require('../controller/storeController');
const {validateAuth} = require('../middlewares/auth');
const CONSTANTS = require("../constants/constants");
const validate = require('../middlewares/validate');

//upload book  
router.post('/upload-book',validateAuth([CONSTANTS.ROLE.SELLER]),validate(bookValidations),uploadBook)

//get books uploaded by seller
router.get('/list',validateAuth([CONSTANTS.ROLE.SELLER]),listSellerBooks);

//get all books of all sellers...
router.get('/',listAllBooks);

//Create order
router.post('/order',validateAuth([CONSTANTS.ROLE.CUSTOMER]),createOrder);

//Delete order
router.delete('/order',validateAuth([CONSTANTS.ROLE.CUSTOMER]),validate(deleteOrderValidations),deleteOrder);


module.exports = router;