const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Piece extends Model {};

// define what goes into a board
// needs an id, squares, and the 2 users
    //2 users will be a player1 (host) and player2 (clients)
    Piece.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true 
        },
        board_id:{
            type: DataTypes.INTEGER,
            references: {
                model: 'board',
                key: 'id',
            }
        },
        location:{
            type: [DataTypes.INTEGER]
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        moveType: {
            type: [DataTypes.INTEGER],
            // allowNull: false
        },
        color : {
            type: DataTypes.STRING,
        },
        notMoved: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        attack: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        toHit: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        health: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        currentHealth : {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        ac: {
            type: DataTypes.INTEGER,
            // allowNull: true
        }
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'piece'
      }
);

module.exports = Piece;