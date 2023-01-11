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
        let availableStock = await bookModel.findAll({
            where: {
                id:bookIdArr,
                active:1,
                quantity:{
                    [Op.gt]:0,
                }
            },
            order: [
                ['id', 'ASC'],
            ],    
            raw:true
        })

        //verify all book ids are valid
        if(bookIdArr.length != availableStock.length){
            const error = new Error(CONSTANTS.MESSAGES.INVALID_ORDER_ITEMS);
            throw error;
        } else {
            //verify quantity of each book if available in stock...
            orderDetails.sort((a,b)=>{
                return a.bookId - b.bookId
            });

            for(let i = 0; i<availableStock.length; i++){
                if(availableStock[i].quantity >= orderDetails[i].bookQty){
                    continue;
                } else {
                    const error = new Error(CONSTANTS.MESSAGES.INVALID_ORDER_ITEMS);
                    throw error; 
                }
            }          
        }

        let orderObj = {
            customerId: customerId
        };

        order = await orderModel.create(orderObj);
       
        //insert details in orderItem table...
        let insertArr = [];
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

        //update the remaining quantity of books in stock.
        let remainingQty = [];

        //calculate remaining book quantity.
        for(let i = 0; i<availableStock.length; i++){
            let tempRemaining = availableStock[i].quantity - orderDetails[i].bookQty
            remainingQty.push({id:orderDetails[i].bookId, quantity:tempRemaining });
        }   
        
        let promiseArr = [];
        
        //update database with new quantity.
        for (let i = 0; i < remainingQty.length; i++) {
            promiseArr.push(bookModel.update({quantity:remainingQty[i].quantity},
            {where:{
                id:remainingQty[i].id
            }}));
        }

        await Promise.all(promiseArr);

        res.status(200).send({
            success: true,
            data: orderItems,
            message: CONSTANTS.MESSAGES.ORDER_CREATED
        });

    } catch (err){
        console.log(CATCH_MESSAGES.CREATE_ORDER, err);
        res.status(400).send({
            success:false,
            message:CONSTANTS.MESSAGES.INVALID_ORDER_ITEMS
        });
    }
}

const deleteOrder = async (req,res,next) => {
    try {
        const customerId = req.body.id;
        const orderId = req.body.orderId;

        //verify if order belongs to loggedIN customer or not.
        const verifiedOrder = orderModel.findAll({
            where:{
                customerId:customerId,
                id:orderId,
                active:1
            },
            raw:true
        });

        if(!verifiedOrder){
            const error = new Error(CONSTANTS.MESSAGES.INVALID_ORDER_ID);
            throw error; 
        }

        //select all order Items from DB and do a soft delete for them.
                
        const orderItems = await orderItemsModel.findAll({
            where:{
                orderId:orderId,
                active:1,
            },
            order:[
                ['bookId','asc']
            ],
            raw:true
        });
        
        //delete order items
        await orderItemsModel.update({
            active:0
        },{
            where:{
                orderId:orderId,
                active:1
            }
        });  

        //update the stock

        //fetch available stock...
        let bookIdArr = [];

        for (var i = 0; i < orderItems.length; i++) {
            bookIdArr.push(orderItems[i].bookId);
        }

        let availableStock = await bookModel.findAll({
            where: {
                id:bookIdArr,
                active:1,
            },
            order: [
                ['id', 'ASC'],
            ],    
            raw:true
        });


         //update the remaining quantity of books in stock.
         let remainingQty = [];

         //calculate new updated book quantity.
         for(let i = 0; i<availableStock.length; i++){
             let newRemaining = availableStock[i].quantity + orderItems[i].qty;
             remainingQty.push({id:availableStock[i].id, quantity:newRemaining });
         }   
         
         let promiseArr = [];
         
         //update database with new quantity.
         for (let i = 0; i < remainingQty.length; i++) {
             promiseArr.push(bookModel.update({quantity:remainingQty[i].quantity},
             {where:{
                 id:remainingQty[i].id
             }}));
         }
 
         await Promise.all(promiseArr);   

         //soft delete the order in order table.
         await orderModel.update({
            active:0
         },{
            where:{
                active:1,
                id:orderId,
                customerId:customerId
            }
         });
         
         res.status(200).send({
            success: true,
            data: orderItems,
            message: CONSTANTS.MESSAGES.ORDER_DELETED
        });

    } catch(err) {
        console.log(CATCH_MESSAGES.DELETE_ORDER, err);
        res.status(400).send({
            success:false,
            message:CONSTANTS.MESSAGES.INVALID_ORDER_ID
        });
    }
}

module.exports = {
    uploadBook,
    listSellerBooks,
    listAllBooks,
    createOrder,
    deleteOrder
}