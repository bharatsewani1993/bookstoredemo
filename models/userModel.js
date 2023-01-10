const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');

const sequelize = require('../utils/database')

class userModel extends Model {}

userModel.init({
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    email:{
      type: DataTypes.STRING(500),
      allowNull: true
    },
    password:{
      type: DataTypes.STRING(500),
      allowNull: true 
    }, 
    role:{
      type: DataTypes.STRING(500),
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
    tableName: 'users',
    timestamps: true,
  }
);

userModel.associate = (db) => {
};

module.exports = userModel;