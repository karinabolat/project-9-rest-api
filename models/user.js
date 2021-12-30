'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}
  User.init({
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'A firstname is required'
            },
            notEmpty: {
                msg: 'Please provide a firstname'
            }
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'A lastname is required'
            },
            notEmpty: {
                msg: 'Please provide a lastname'
            }
        }
    },
    emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Such email already exists"
        },
        validate: {
          notNull: {
            msg: "An email is required"
          },
          isEmail: {
            msg: "Please provide a valid email"
          }
        }    
    },
    password: {
        type: DataTypes.STRING,  
        allowNull: false,
        set(val) {
            if (val.length >= 8) {
                const hashedPassword = bcrypt.hashSync(val, 10);
                this.setDataValue('password', hashedPassword);
            }
        },
        validate: {
            notNull: {
                msg: 'A password is required. The password should be at least 8 characters in length'
            },
            notEmpty: {
                msg: 'Please provide a password. The password should be at least 8 characters in length'
            }
        }
    }
  }, { sequelize });

  // Define one-to-many Model Associations
  User.associate = (models) => {
    User.hasMany(models.Course, {
        foreignKey: 'userId'
    });
  }

  return User;
};