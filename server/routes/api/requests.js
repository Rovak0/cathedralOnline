const router = require('express').Router();

//this will handle all data requests
//mainly return boardstates, but will also give piece data

const {Board, Piece, Player, Square} = require("../../models");

module.exports = router;