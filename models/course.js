'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {}
  Course.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '"Title" is required'
        },
        notEmpty: {
          msg: 'Please provide a title'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: '"Description" is required'
        },
        notEmpty: {
          msg: 'Please provide description'
        }
      }
    },
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING
  }, { sequelize });

  // Define one-to-one Model Associations
  Course.associate = (models) => {
    Course.belongsTo(models.User, {
        foreignKey: 'userId'
    });
  };

  return Course;
};