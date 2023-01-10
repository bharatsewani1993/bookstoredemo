const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');

const sequelize = require('../utils/database')

class orderItemsModel extends Model {}

orderItemsModel.init({
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    orderId:{
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    bookId:{
      type: DataTypes.INTEGER(),
      allowNull: false,
    },    
    qty:{
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
    tableName: 'orderItems',
    timestamps: true,
  }
);

orderItemsModel.associate = (db) => {
};

module.exports = orderItemsModel;