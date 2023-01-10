const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');

const sequelize = require('../utils/database')

class orderModel extends Model {}

orderModel.init({
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.INTEGER(),
      allowNull: true
    },    
    active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
  }
);

orderModel.associate = (db) => {
};

module.exports = orderModel;