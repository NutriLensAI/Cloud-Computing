const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Breakfast = sequelize.define('Breakfast', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users', // Name of the referenced table
            key: 'id' // Key in the referenced table
        }
    },
    food_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    calories: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    proteins: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    fat: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    carbohydrate: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    food_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'breakfasts', // Name of the table in the database
    timestamps: true // Disable timestamps (createdAt, updatedAt)
});

module.exports = Breakfast;
