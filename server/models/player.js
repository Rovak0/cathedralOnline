const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Player extends Model {};

// define what goes into a board
// needs an id, squares, and the 2 users
    //2 users will be a player1 (host) and player2 (clients)
    Player.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true 
        },
        username: {
            type: DataTypes.STRING,
            unique: true
        }
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'player'
      }
);

module.exports = Player;