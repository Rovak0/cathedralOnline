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
            locationX: i,
            locationY: 2,
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
            locationX: i,
            locationY: 7,
            name: "pawn",
            moveType: "pawn",
            color : "black"
        });
        boardState.push(pawn);
    };

    //rooks
    const whiteRook1 = await Piece.create({
        board_id: boardId,
        locationX: 1,
        locationY: 1,
        name: "rook",
        moveType: "rook",
        color : "white"
    });
    const whiteRook2 = await Piece.create({
        board_id: boardId,
        locationX: 8,
        locationY: 1,
        name: "rook",
        moveType: "rook",
        color : "white"
    });
    //black side
    const blackRook1 = await Piece.create({
        board_id: boardId,
        locationX: 1,
        locationY: 8,
        name: "rook",
        moveType: "rook",
        color : "black"
    });
    const blackRook2 = await Piece.create({
        board_id: boardId,
        locationX: 8,
        locationY: 8,
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
        locationX: 2,
        locationY: 1,
        name: "knight",
        moveType: "knight",
        color : "white"
    });
    const whiteKnight2 = await Piece.create({
        board_id: boardId,
        locationX: 7,
        locationY: 1,
        name: "knight",
        moveType: "knight",
        color : "white"
    });
    //black side
    const blackKnight1 = await Piece.create({
        board_id: boardId,
        locationX: 2,
        locationY: 8,
        name: "knight",
        moveType: "knight",
        color : "black"
    });
    const blackKnight2 = await Piece.create({
        board_id: boardId,
        locationX: 7,
        locationY: 8,
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
        locationX: 3,
        locationY: 1,
        name: "bishop",
        moveType: "bishop",
        color : "white"
    });
    const whiteBishop2 = await Piece.create({
        board_id: boardId,
        locationX: 6,
        locationY: 1,
        name: "bishop",
        moveType: "bishop",
        color : "white"
    });
    //black side
    const blackBishop1 = await Piece.create({
        board_id: boardId,
        locationX: 3,
        locationY: 8,
        name: "bishop",
        moveType: "bishop",
        color : "black"
    });
    const blackBishop2 = await Piece.create({
        board_id: boardId,
        locationX: 6,
        locationY: 8,
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
        locationX: 4,
        locationY: 1,
        name: "queen",
        moveType: "queen",
        color : "white"
    });
    const blackQueen = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 8,
        name: "queen",
        moveType: "queen",
        color : "black"
    });
    boardState.push(whiteQueen);
    boardState.push(blackQueen);

    // kings
    const whiteKing = await Piece.create({
        board_id: boardId,
        locationX: 5,
        locationY: 1,
        name: "king",
        moveType: "king",
        color : "white"
    });
    const blackKing = await Piece.create({
        board_id: boardId,
        locationX: 5,
        locationY: 8,
        name: "king",
        moveType: "king",
        color : "black"
    });
    boardState.push(whiteKing);
    boardState.push(blackKing);

    return boardState;
}

//cathedr'l board
async function cathedralBoard(boardId){
    let boardState = [];

    const whiteWiz = await Piece.create({
        board_id: boardId,
        locationX: 1,
        locationY: 1,
        name: "cleric",
        moveType: "king",
        color : "white",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 2,
        attackDam: 2,
        toHit: 13,
        health: 8,
        currentHealth: 8,
        ac: 19,
        side: "king"
    });

    const blackWiz = await Piece.create({
        board_id: boardId,
        locationX: 8,
        locationY: 8,
        name: "cleric",
        moveType: "king",
        color : "black",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 2,
        attackDam: 2,
        toHit: 13,
        health: 8,
        currentHealth: 8,
        ac: 19,
        side: "king"
    });

    boardState.push(whiteWiz);
    boardState.push(blackWiz);

    const whiteKnight = await Piece.create({
        board_id: boardId,
        locationX: 3,
        locationY: 1,
        name: "knight",
        moveType: "knight",
        color : "white",
        canTake: false,
        moveCap: 3,
        attackRan: 1,
        attackHits: 1,
        attackDam: 6,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 14,
        side: "king"
    });

    const blackKnight = await Piece.create({
        board_id: boardId,
        locationX: 6,
        locationY: 8,
        name: "knight",
        moveType: "knight",
        color : "black",
        canTake: false,
        moveCap: 3,
        attackRan: 1,
        attackHits: 1,
        attackDam: 6,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 14,
        side: "king"
    });

    boardState.push(whiteKnight);
    boardState.push(blackKnight);

    const whiteKing = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 1,
        name: "king",
        moveType: "king",
        color : "white",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 1,
        attackDam: 4,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 16,
        side: "king"
    });

    const blackKing = await Piece.create({
        board_id: boardId,
        locationX: 5,
        locationY: 8,
        name: "king",
        moveType: "king",
        color : "black",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 1,
        attackDam: 4,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 16,
        side: "king"
    });

    boardState.push(whiteKing);
    boardState.push(blackKing);

    const whiteQueen = await Piece.create({
        board_id: boardId,
        locationX: 5,
        locationY: 1,
        name: "queen",
        moveType: "king",
        color : "white",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 3,
        attackDam: 1,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 19,
        side: "queen"
    });

    const blackQueen = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 8,
        name: "queen",
        moveType: "king",
        color : "black",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 3,
        attackDam: 1,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 19,
        side: "queen"
    });

    boardState.push(whiteQueen);
    boardState.push(blackQueen);

    const whitePally = await Piece.create({
        board_id: boardId,
        locationX: 6,
        locationY: 1,
        name: "paladin",
        moveType: "rook",
        color : "white",
        canTake: false,
        moveCap: 2,
        attackRan: 1,
        attackHits: 2,
        attackDam: 3,
        magicDam: 1,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 15,
        sted: true,
        side: "queen"
    });

    const blackPally = await Piece.create({
        board_id: boardId,
        locationX: 3,
        locationY: 8,
        name: "paladin",
        moveType: "rook",
        color : "black",
        canTake: false,
        moveCap: 2,
        attackRan: 1,
        attackHits: 2,
        attackDam: 3,
        magicDam: 1,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 15,
        sted: true,
        side: "queen"
    });

    boardState.push(whitePally);
    boardState.push(blackPally);

    const whiteCleric = await Piece.create({
        board_id: boardId,
        locationX: 8,
        locationY: 1,
        name: "cleric",
        moveType: "king",
        color : "white",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 1,
        attackDam: 4,
        toHit: 13,
        health: 8,
        currentHealth: 8,
        ac: 19,
        side: "queen"
    });

    const blackCleric = await Piece.create({
        board_id: boardId,
        locationX: 1,
        locationY: 8,
        name: "cleric",
        moveType: "king",
        color : "black",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 1,
        attackDam: 4,
        toHit: 13,
        health: 8,
        currentHealth: 8,
        ac: 19,
        side: "queen"
    });

    boardState.push(whiteCleric);
    boardState.push(blackCleric);

    const whiteAssassin = await Piece.create({
        board_id: boardId,
        locationX: 2,
        locationY: 2,
        name: "assassin",
        moveType: "queen",
        color : "white",
        canTake: false,
        moveCap: 2,
        attackRan: 1,
        attackHits: 1,
        attackDam: 3,
        armorPierce: true,
        toHit: 9,
        health: 10,
        currentHealth: 10,
        ac: 18,
        side: "king"
    });

    const blackAssassin = await Piece.create({
        board_id: boardId,
        locationX: 7,
        locationY: 7,
        name: "assassin",
        moveType: "queen",
        color : "black",
        canTake: false,
        moveCap: 2,
        attackRan: 1,
        attackHits: 1,
        attackDam: 3,
        armorPierce: true,
        toHit: 9,
        health: 10,
        currentHealth: 10,
        ac: 18,
        side: "king"
    });

    boardState.push(whiteAssassin);
    boardState.push(blackAssassin);

    const whiteRanger1 = await Piece.create({
        board_id: boardId,
        locationX: 3,
        locationY: 2,
        name: "ranger",
        moveType: "bishop",
        color : "white",
        canTake: false,
        moveCap: 8,
        attackRan: 3,
        attackHits: 4,
        attackDam: 1,
        toHit: 11,
        attackHitsRan: 3,
        attackDamRan: 2,
        toHitRan: 9,
        health: 10,
        currentHealth: 10,
        ac: 18,
        side: "king"
    });


    const whiteRanger2 = await Piece.create({
        board_id: boardId,
        locationX: 6,
        locationY: 2,
        name: "ranger",
        moveType: "bishop",
        color : "white",
        canTake: false,
        moveCap: 8,
        attackRan: 3,
        attackHits: 4,
        attackDam: 1,
        toHit: 11,
        attackHitsRan: 3,
        attackDamRan: 2,
        toHitRan: 9,
        health: 10,
        currentHealth: 10,
        ac: 18,
        side: "queen"
    });

    const blackRanger1 = await Piece.create({
        board_id: boardId,
        locationX: 3,
        locationY: 7,
        name: "ranger",
        moveType: "bishop",
        color : "black",
        canTake: false,
        moveCap: 8,
        attackRan: 3,
        attackHits: 4,
        attackDam: 1,
        toHit: 11,
        attackHitsRan: 3,
        attackDamRan: 2,
        toHitRan: 9,
        health: 10,
        currentHealth: 10,
        ac: 18,
        side: "king"
    });

    const blackRanger2 = await Piece.create({
        board_id: boardId,
        locationX: 6,
        locationY: 7,
        name: "ranger",
        moveType: "bishop",
        color : "black",
        canTake: false,
        moveCap: 8,
        attackRan: 3,
        attackHits: 4,
        attackDam: 1,
        toHit: 11,
        attackHitsRan: 3,
        attackDamRan: 2,
        toHitRan: 9,
        health: 10,
        currentHealth: 10,
        ac: 18,
        side: "queen"
    });

    boardState.push(whiteRanger1);
    boardState.push(whiteRanger2);
    boardState.push(blackRanger1);
    boardState.push(blackRanger2);

    const whiteWarrior1 = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 2,
        name: "warrior",
        moveType: "king",
        color : "white",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 2,
        attackDam: 3,
        toHit: 11,
        health: 14,
        currentHealth: 14,
        ac: 16,
        side: "king"
    });

    const whiteWarrior2 = await Piece.create({
        board_id: boardId,
        locationX: 5,
        locationY: 2,
        name: "warrior",
        moveType: "king",
        color : "white",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 2,
        attackDam: 3,
        toHit: 11,
        health: 14,
        currentHealth: 14,
        ac: 16,
        side: "queen"
    });

    const blackWarrior1 = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 7,
        name: "warrior",
        moveType: "king",
        color : "black",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 2,
        attackDam: 3,
        toHit: 11,
        health: 14,
        currentHealth: 14,
        ac: 16,
        side: "king"
    });

    const blackWarrior2 = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 7,
        name: "warrior",
        moveType: "king",
        color : "black",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 2,
        attackDam: 3,
        toHit: 11,
        health: 14,
        currentHealth: 14,
        ac: 16,
        side: "queen"
    });

    boardState.push(whiteWarrior1);
    boardState.push(whiteWarrior2);
    boardState.push(blackWarrior1);
    boardState.push(blackWarrior2);

    const whiteCrusader = await Piece.create({
        board_id: boardId,
        locationX: 7,
        locationY: 2,
        name: "crusader",
        moveType: "bishop",
        color : "white",
        canTake: false,
        moveCap: 2,
        attackRan: 1,
        attackHits: 6,
        attackDam: 1,
        toHit: 10,
        health: 12,
        currentHealth: 12,
        ac: 17,
        side: "queen"
    });

    const blackCrusader = await Piece.create({
        board_id: boardId,
        locationX: 2,
        locationY: 7,
        name: "crusader",
        moveType: "bishop",
        color : "black",
        canTake: false,
        moveCap: 2,
        attackRan: 1,
        attackHits: 6,
        attackDam: 1,
        toHit: 10,
        health: 12,
        currentHealth: 12,
        ac: 17,
        side: "queen"
    });

    boardState.push(whiteCrusader);
    boardState.push(blackCrusader);

    return boardState;
}

async function catBoardTest(boardId){
    let boardState = [];
    const whiteWarrior = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 4,
        name: "warrior",
        moveType: "king",
        color : "white",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 2,
        attackDam: 3,
        toHit: 11,
        health: 14,
        currentHealth: 14,
        ac: 16,
        side: "king"
    });
    const blackWarrior = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 5,
        name: "warrior",
        moveType: "king",
        color : "black",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 2,
        attackDam: 3,
        toHit: 11,
        health: 14,
        currentHealth: 14,
        ac: 16,
        side: "king"
    });

    const whiteRanger = await Piece.create({
        board_id: boardId,
        locationX: 7,
        locationY: 2,
        name: "ranger",
        moveType: "bishop",
        color : "white",
        canTake: false,
        moveCap: 8,
        attackRan: 3,
        attackHits: 4,
        attackDam: 1,
        toHit: 11,
        attackHitsRan: 3,
        attackDamRan: 2,
        toHitRan: 9,
        health: 10,
        currentHealth: 10,
        ac: 18,
        side: "queen"
    });

    const blackRanger = await Piece.create({
        board_id: boardId,
        locationX: 7,
        locationY: 7,
        name: "ranger",
        moveType: "bishop",
        color : "black",
        canTake: false,
        moveCap: 8,
        attackRan: 3,
        attackHits: 4,
        attackDam: 1,
        toHit: 11,
        attackHitsRan: 3,
        attackDamRan: 2,
        toHitRan: 9,
        health: 10,
        currentHealth: 10,
        ac: 18,
        side: "queen"
    });

    const whiteKing = await Piece.create({
        board_id: boardId,
        locationX: 4,
        locationY: 1,
        name: "king",
        moveType: "king",
        color : "white",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 1,
        attackDam: 4,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 16,
        side: "king"
    });

    const blackKing = await Piece.create({
        board_id: boardId,
        locationX: 5,
        locationY: 8,
        name: "king",
        moveType: "king",
        color : "black",
        canTake: false,
        moveCap: 1,
        attackRan: 1,
        attackHits: 1,
        attackDam: 4,
        toHit: 12,
        health: 12,
        currentHealth: 12,
        ac: 16,
        side: "king"
    });

    boardState.push(whiteKing);
    boardState.push(blackKing);

    boardState.push(whiteWarrior);
    boardState.push(blackWarrior);
    boardState.push(whiteRanger);
    boardState.push(blackRanger);
    return boardState;
}

module.exports = {normalBoard, cathedralBoard, catBoardTest};