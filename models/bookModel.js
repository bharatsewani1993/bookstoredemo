const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');

const sequelize = require('../utils/database');

class bookModel extends Model {}

bookModel.init({
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    sellerId:{
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    bookTitle: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    bookAuthor: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    bookPrice: {
      type: DataTypes.STRING(500),
      allowNull: true
    }, 
    category: {
      type: DataTypes.STRING(500),
      allowNull: true
    }, 
    bookISBN: {
      type: DataTypes.STRING(500),
      allowNull: true
    },   
    bookImage:{
      type: DataTypes.STRING(5000),
      allowNull: true
    },   
    quantity:{
      type: DataTypes.INTEGER(),
      allowNull: false,
    },    
    active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'books',
    timestamps: true,
    underscored: false
  }
);

bookModel.associate = (db) => {
};
module.exports = bookModel;