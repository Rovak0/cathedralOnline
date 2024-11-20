const {Board, Piece, Player, Square} = require("../models");


//needs to be through a function because the pieces must be given a board_id

//this will just be the normal starting board state
async function normalBoard(boardId){
    const boardState = [];

    // pawns are through a for loop
    //white side
    for(i=1; i <= 8; i++){
        const pawn = await Piece.create({
            board_id: boardId,
            location: [i, 2],
            name: "pawn",
            moveType: "pawn",
            color : "white"
        });
        boardState.push(pawn);
    };
    // black side
    for(i=1; i <= 8; i++){
        const pawn = await Piece.create({
            board_id: boardId,
            location: [i, 2],
            name: "pawn",
            moveType: "pawn",
            color : "black"
        });
        boardState.push(pawn);
    };

    //rooks
    const whiteRook1 = await Piece.create({
        board_id: boardId,
        location: [1, 1],
        name: "rook",
        moveType: "rook",
        color : "white"
    });
    const whiteRook2 = await Piece.create({
        board_id: boardId,
        location: [8, 1],
        name: "rook",
        moveType: "rook",
        color : "white"
    });
    //black side
    const blackRook1 = await Piece.create({
        board_id: boardId,
        location: [1, 8],
        name: "rook",
        moveType: "rook",
        color : "black"
    });
    const blackRook2 = await Piece.create({
        board_id: boardId,
        location: [8, 8],
        name: "rook",
        moveType: "rook",
        color : "black"
    });
    boardState.push(whiteRook1);
    boardState.push(whiteRook2);
    boardState.push(blackRook1);
    boardState.push(blackRook2);

    // knights
    const whiteKnight1 = await Piece.create({
        board_id: boardId,
        location: [2, 1],
        name: "knight",
        moveType: "knight",
        color : "white"
    });
    const whiteKnight2 = await Piece.create({
        board_id: boardId,
        location: [7, 1],
        name: "knight",
        moveType: "knight",
        color : "white"
    });
    //black side
    const blackKnight1 = await Piece.create({
        board_id: boardId,
        location: [2, 8],
        name: "knight",
        moveType: "knight",
        color : "black"
    });
    const blackKnight2 = await Piece.create({
        board_id: boardId,
        location: [7, 8],
        name: "knight",
        moveType: "knight",
        color : "black"
    });
    boardState.push(whiteKnight1);
    boardState.push(whiteKnight2);
    boardState.push(blackKnight1);
    boardState.push(blackKnight2);


    //bishops
    const whiteBishop1 = await Piece.create({
        board_id: boardId,
        location: [3, 1],
        name: "bishop",
        moveType: "bishop",
        color : "white"
    });
    const whiteBishop2 = await Piece.create({
        board_id: boardId,
        location: [6, 1],
        name: "bishop",
        moveType: "bishop",
        color : "white"
    });
    //black side
    const blackBishop1 = await Piece.create({
        board_id: boardId,
        location: [3, 8],
        name: "bishop",
        moveType: "bishop",
        color : "black"
    });
    const blackBishop2 = await Piece.create({
        board_id: boardId,
        location: [6, 8],
        name: "bishop",
        moveType: "bishop",
        color : "black"
    });
    boardState.push(whiteBishop1);
    boardState.push(whiteBishop2);
    boardState.push(blackBishop1);
    boardState.push(blackBishop2);

    // queens
    const whiteQueen = await Piece.create({
        board_id: boardId,
        location: [4, 1],
        name: "queen",
        moveType: "queen",
        color : "white"
    });
    const blackQueen = await Piece.create({
        board_id: boardId,
        location: [4, 8],
        name: "queen",
        moveType: "queen",
        color : "black"
    });
    boardState.push(whiteQueen);
    boardState.push(blackQueen);

    // kings
    const whiteKing = await Piece.create({
        board_id: boardId,
        location: [5, 1],
        name: "king",
        moveType: "king",
        color : "white"
    });
    const blackKing = await Piece.create({
        board_id: boardId,
        location: [5, 8],
        name: "king",
        moveType: "king",
        color : "black"
    });
    boardState.push(whiteKing);
    boardState.push(blackKing);

    return boardState;
}

module.exports = {normalBoard};