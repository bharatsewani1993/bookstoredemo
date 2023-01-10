const { Op,Sequelize } = require('sequelize');
const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const orderItemsModel = require('../models/orderItemsModel');
const CONSTANTS = require("../constants/constants");
const CATCH_MESSAGES = require('../constants/catchMessages');

//upload book
const uploadBook = async (req, res, next) => {
    try {
        const sellerId = req.body.id; 
        const bookTitle = req.body.bookTitle;
        const bookAuthor = req.body.bookAuthor;
        const bookPrice = req.body.bookPrice;
        const category = req.body.category;
        const bookISBN = req.body.bookISBN; 
        const bookImage = req.body.bookImage;
        const quantity = req.body.quantity;

        const bookObj = {
            sellerId:sellerId,
            bookTitle:bookTitle,
            bookAuthor:bookAuthor,
            bookPrice:bookPrice,
            category:category,
            bookISBN:bookISBN,
            bookImage:bookImage,
            quantity:quantity
        }

        const results = await bookModel.create(bookObj);

        res.status(200).send({
            success:true,
            message:CONSTANTS.MESSAGES.BOOK_UPLOADED,
            data:results
        });
    } catch(err){
        console.log(CATCH_MESSAGES.BOOK_UPLOAD, err);
        res.status(400).send({
            success:false,
            message:CONSTANTS.MESSAGES.BOOK_UPLOADING_FAILED
        })
    }
}

//list books of seller
const listSellerBooks = async (req,res,next) =>{
    try {
        const sellerId = req.body.id; 
        let allBooks = await bookModel.findAll({
            where:{
                sellerId: sellerId,
                active:1,
                quantity:{
                    [Op.gt]:0,
                }
            },
            raw: true,
            logging:console.log
        });

        let remainingQuantity = async function(allBooks, quantity){
            return allBooks.reduce( function(total, current){
                return total + current[quantity];
            }, 0);
        };
        
        const remainingQty =  await remainingQuantity(allBooks,'quantity');

        res.status(200).send({
            success:true,
            message:CONSTANTS.MESSAGES.BOOKS_LISTED,
            data:allBooks,
            remainingQty:remainingQty
        });

    } catch(err) {
        console.log(CATCH_MESSAGES.LIST_SELLER_BOOKS, err);
        res.status(400).send({
            success:false,
            message:CONSTANTS.MESSAGES.BOOK_LISTING_FAILED
        })
    }
}

//list all books of store
const listAllBooks = async (req,res,next) =>{
    try {
        userModel.hasMany(bookModel, {foreignKey: 'sellerId'})
        bookModel.belongsTo(userModel, {foreignKey: 'id'})

        const page = req.query.page || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const active = 1; 

        const allBooks = await bookModel.findAndCountAll({
            where: {
                active: active,             
            },
            offset: offset,
            limit: limit,
            raw:false,
            include: {
                model: userModel,
                required:false,
                attributes:{
                    exclude:[ 'createdAt', 'updatedAt','active','password','role'],
                },
                order: [['id', 'asc']]
            }
        });

        res.status(200).send({
            success: true,
            data: allBooks,
            message: CONSTANTS.MESSAGES.BOOKS_LISTED
        });
    } catch(err){
        console.log(CATCH_MESSAGES.LIST_ALL_BOOKS, err);
        res.status(400).send({
            success:false,
            message:CONSTANTS.MESSAGES.ALL_BOOK_LISTING_FAILED
        })
    } 
}

//create order
const createOrder = async (req,res,next) =>{
    try{
        const customerId = req.body.id;
        const orderDetails = req.body.orderDetails;

        let bookIdArr = [];

        for (var i = 0; i < orderDetails.length; i++) {
            bookIdArr.push(orderDetails[i].bookId);
        }

        //validate if all book ids are valid..
        let resultCount = await bookModel.count({
            where: {
                id:bookIdArr,
                active:1,
                quantity:{
                    [Op.gt]:0,
                }
            }
        })

        if(bookIdArr.length != resultCount){
            const error = new Error(CONSTANTS.MESSAGES.INVALID_ORDER_ITEMS);
            throw error;
        }

        let orderObj = {
            customerId: customerId
        };

        order = await orderModel.create(orderObj);
       
        //insert details in orderItem table...
        let insertArr = [];
        let responseArr = [];
        for (var i = 0; i < orderDetails.length; i++) {

            let tempObj = {
                orderId:order.id,
                bookId:orderDetails[i].bookId,
                qty:orderDetails[i].bookQty
            }

            insertArr.push(tempObj);            
        }

        //save all items related to specific order.
        let orderItems = await orderItemsModel.bulkCreate(insertArr);
        
        res.status(200).send({
            success: true,
            data: orderItems,
            message: CONSTANTS.MESSAGES.ORDER_CREATED
        });

    } catch (err){
        console.log(CATCH_MESSAGES.CREATE_ORDER, err);
        res.status(400).send({
            success:false,
            message:CONSTANTS.MESSAGES.ORDER_CREATION_FAILED
        });
    }
}

module.exports = {
    uploadBook,
    listSellerBooks,
    listAllBooks,
    createOrder
}