const Board = require('./board');
const Piece = require('./piece');
const Player = require('./player');
const Square = require('./square');

//need to set up a many to 1 for board to piece and player
//need to set up 1 to 1 for square to piece

module.exports = {Board, Piece, Player, Square};