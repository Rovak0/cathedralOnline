const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Board extends Model {};

// define what goes into a board
// needs an id, squares, and the 2 users
    //2 users will be a player1 (host) and player2 (clients)
Board.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true 
        },
        //I need to have 2 players for searching purposes
        player_id1: {
            type: DataTypes.INTEGER,
            references: {
              model: 'player',
              key: 'id',
              unique: false
            }
        },
        player_id2: {
          type: DataTypes.INTEGER,
          references: {
            model: 'player',
            key: 'id',
            unique: false
          }
        },
        complete : {
          type: DataTypes.BOOLEAN,
          defaultValue : false
          //this will be referenced to decide which board to show a user
        }
        // player_id: {
        //     type: DataTypes.INTEGER,
        //     references: {
        //       model: 'player',
        //       key: 'id',
        //       unique: false
        //     }
        // },
        // tiles: {
        //     type: [DataTypes.INTEGER], //it is an array of squares
        //     references: {
        //       model: 'square',
        //       key: 'id',
        //       unique: false
        //     }
        // }
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'board'
      }
);

module.exports = Board;