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
        locationX:{
            type: DataTypes.INTEGER
        },
        locationY:{
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        moveType: {
            type: DataTypes.STRING,
            // allowNull: false
        },
        color : {
            type: DataTypes.STRING,
        },
        notMoved: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        //start of cathedral stuff
        canTake: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        //give the default move cap of 100, so I don't need to worry about a large board
        moveCap: {
            type: DataTypes.INTEGER,
            defaultValue: 100
        },
        attackRan: {
            type: DataTypes.INTEGER
        },        
        toHit: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        attackHits: {
            type: DataTypes.INTEGER
        },
        attackDam: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        magicDam: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        armorPierce: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },  
        attackHitsRan: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        attackDamRan: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        magicDamRan: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true
        },
        armorPierceRan: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },  
        toHitRan: {
            type: DataTypes.INTEGER,
            allowNull: true
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
        },
        sted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        direction: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        side: {
            type: DataTypes.STRING,
        },
        frozen: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        magicResistArcane: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        standing: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        spellDc:{
            type: DataTypes.INTEGER
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