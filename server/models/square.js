const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Square extends Model {};

// define what goes into a board
// needs an id, squares, and the 2 users
    //2 users will be a player1 (host) and player2 (clients)
    Square.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true 
        },
        postitionX: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        postitionY: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // I belive content will have to manage itself
        // content: {
        //     type: DataTypes.INTEGER,
        //     allowNull: true,
        //     references: {
        //       model: 'pieces',
        //       key: 'id', //will likely be keyed off of name
        //       unique: false
        //     }
        // },
        board_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'board',
                key: 'id',
            }
        }

    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'square'
      }
);

module.exports = Square;