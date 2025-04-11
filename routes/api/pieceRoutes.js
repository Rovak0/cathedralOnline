const router = require('express').Router();

const {Board, Piece, Player} = require("../../models");
const {pawnMove, kingMove, rookMove, bishopMove, queenMove, knightMove} = require('../../utils/gameLogic');
const {attack} = require('../../utils/catLogic');
const {lightningBolt, fireball, iceWave, heal, blessedBolt, transfer} = require('../../utils/catLogic');

router.post('/move', async (req, res) => {
    //this will recieve a boardId, a pieceId, and a destination
    try{
        console.log("Hunting text");
        console.log(req.body);

        //look at the board and find out whose turn it is
        const board = await Board.findByPk(req.body.boardId);
        //board.currentTurn is either 0 or 1
        if(board.currentTurn == 0) {
            //board.player_id1 == req.body.playerId is a legal move, so don't stop it
            if(board.player_id1 != req.body.playerId){
                res.status(200).json("Not your turn");
                return;
            }
        }
        else{
            if(board.player_id2 != req.body.playerId){
                res.status(200).json("Not your turn");
                return;
            }
        };

        const boardState = await Piece.findAll(
            {
                where: 
                    {board_id : req.body.boardId}
            }
        );
        // console.log("past first find")
        let pieceData;
        for(piece of boardState){
            // console.log(piece.locationX);
            // console.log(piece.locationY);
            if((piece.locationX == req.body.startingMove[0]) && (piece.locationY == req.body.startingMove[1])){
                // console.log("in the if block");
                pieceData = piece;
            }
        }
        console.log(pieceData.id);
        // the move type of the piece is what I'm after
        let moveResult;
        //run through a switch case and return legality
        switch(pieceData.dataValues.moveType){
            case "pawn":
                // console.log("pawn stuff");
                moveResult = await pawnMove(req.body.boardId,  pieceData.id, req.body.submittedMove);
                // console.log(moveResult);
                break;
            case "rook":
                moveResult = await rookMove(req.body.boardId,  pieceData.id, req.body.submittedMove);
                break;
            case "knight":
                moveResult = await knightMove(req.body.boardId, pieceData.id, req.body.submittedMove);
                break;            
            case "bishop":
                moveResult = await bishopMove(req.body.boardId, pieceData.id, req.body.submittedMove);
                break;
            case "queen":
                moveResult = await queenMove(req.body.boardId, pieceData.id, req.body.submittedMove);
                break;
            case "king":
                moveResult = await kingMove(req.body.boardId, pieceData.id, req.body.submittedMove);
                break;
            default:
                moveResult = -1;
        }

        console.log(moveResult);
        //if the result is -1, there was an error
        if(moveResult == -1){
            res.status(500).json("move check error");
            return;
        }
        //return of 0, not a legal move
        if(moveResult == 0){
            res.status(200).json("Illegal move");
            return;
        }
        // return of 1, legal empty move
        // this will need to be modified for cathedral
        // let movedPiece;
        if(moveResult == 1){
            // need to save the move
            // movedPiece = await Piece.update()
            // console.log("Handling move");
            // console.log(pieceData.locationX);
            pieceData.locationX = req.body.submittedMove[0];
            // console.log(pieceData.locationX);
            pieceData.locationY = req.body.submittedMove[1];
            //the piece has moved, so save that 
            pieceData.notMoved = false;
            await pieceData.save();
            //switch the board turn
            if(board.currentTurn == 0){
                board.currentTurn = 1;
            }
            else{
                board.currentTurn = 0;
            }
            await board.save();
            res.status(200).json("Legal empty move");
            return;
        }
        // return of 2, take the piece
        if(moveResult == 2){
            // legal move, so find the taken piece and remove it
            const boardState = await Piece.findAll(
                {
                    where: 
                        {board_id : req.body.boardId}
                }
            );
            //find the piece that was taken
            for (piece of boardState){
                if(piece.locationX == req.body.submittedMove[0] && piece.locationY == req.body.submittedMove[1]){
                    //delete the piece
                    await piece.destroy();
                    break;
                }
            }
            //save the moved piece
            pieceData.locationX = req.body.submittedMove[0];
            pieceData.locationY = req.body.submittedMove[1];
            //the piece has moved, so save that 
            pieceData.notMoved = false;
            await pieceData.save();
            //switch the board turn
            if(board.currentTurn == 0){
                board.currentTurn = 1;
            }
            else{
                board.currentTurn = 0;
            }
            res.status(200).json("Piece taken");
            return;
        }

        console.log(moveResult);
        // if it completely misses
        res.status(500).json("complete miss");

    }
    catch(err){
        res.status(500).json(err);
    }
});

router.post('/attack', async (req,res) => {
    try{
        //needs to be given the attacker, the defender, and the board
        //req.body
        let damage = await attack(req.body.attackerId, req.body.blockerId, req.body.boardId);
        console.log(damage);
        res.status(200).json(damage);
    }
    catch(err){
        res.status(500).json(err);
    }
});

router.post('/turn', async (req, res) => {
    try{
        //needs boardId (takes your turn)
        //needs pieceId and direction
        let piece = await Piece.findByPk(req.body.pieceId);
        piece.direction = req.body.direction;
        await piece.save();
        res.status(200).json(piece.direction);
    }
    catch(err){
        res.status(500).json(err);
    }
});

//the spells
router.post('/lightningBolt', async (req, res) => {
    console.log("bolt");
    try{
        //needs req.body.attackerId , req.body.blockerId , req.body.boardId
        let boltResult = await lightningBolt(req.body.attackerId, req.body.blockerId, req.body.boardId);
        //this should return -1, 0, 1, 2, 3, 4
        switch(boltResult){
            case(-1):
                res.status(400).json("Illegal move");
                break;
            case(0):
                res.status(200).json("Critical fail");
                break;
            case(1):
                res.status(200).json("Fail");
                break;
            case(2):
                res.status(200).json("Success");
                break;
            case(3):
                res.status(200).json("Critical Success");
                break;
            case(4):
                res.status(200).json("Double Crit!");
                break;
            default:
                res.status(500).json("Switch break");
                break;
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

router.post('/fireball', async (req, res) => {
    try{
        //needs req.body.attackerId , req.body.blockerId , req.body.boardId
        let boltResult = await fireball(req.body.attackerId, req.body.blockerId, req.body.boardId);
        //this should return -1, 0, 1, 2, 3, 4
        switch(boltResult){
            case(-1):
                res.status(400).json("Illegal move");
                break;
            case(0):
                res.status(200).json("Critical fail");
                break;
            case(1):
                res.status(200).json("Fail");
                break;
            case(2):
                res.status(200).json("Success");
                break;
            case(3):
                res.status(200).json("Critical Success");
                break;
            case(4):
                res.status(200).json("Double Crit!");
                break;
            default:
                res.status(500).json("Switch break");
                break;
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

router.post('/iceWave', async (req, res) => {
    try{
        //needs req.body.attackerId , req.body.blockerId , req.body.boardId
        let boltResult = await iceWave(req.body.attackerId, req.body.blockerId, req.body.boardId);
        //this should return -1, 0, 1, 2, 3, 4
        switch(boltResult){
            case(-1):
                res.status(400).json("Illegal move");
                break;
            case(0):
                res.status(200).json("Critical fail");
                break;
            case(1):
                res.status(200).json("Fail");
                break;
            case(2):
                res.status(200).json("Success");
                break;
            case(3):
                res.status(200).json("Critical Success");
                break;
            case(4):
                res.status(200).json("Double Crit!");
                break;
            default:
                res.status(500).json("Switch break");
                break;
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

router.post('/heal', async (req, res) => {
    try{
        //needs req.body.attackerId , req.body.blockerId , req.body.boardId
        let boltResult = await heal(req.body.attackerId, req.body.blockerId, req.body.boardId);
        //this should return -1, 0, 1, 2, 3, 4
        console.log("Bolt result: " + boltResult);
        switch(boltResult){
            case(-1):
                res.status(400).json("Illegal move");
                break;
            case(0):
                res.status(200).json("Critical fail");
                break;
            case(1):
                res.status(200).json("Fail");
                break;
            case(2):
                res.status(200).json("Success");
                break;
            case(3):
                res.status(200).json("Critical Success");
                break;
            case(4):
                res.status(200).json("Double Crit!");
                break;
            default:
                res.status(500).json("Switch break");
                break;
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

router.post('/blessedBolt', async (req, res) => {
    try{
        //needs req.body.attackerId , req.body.blockerId , req.body.boardId
        let boltResult = await blessedBolt(req.body.attackerId, req.body.blockerId, req.body.boardId);
        //this should return -1, 0, 1, 2, 3, 4
        switch(boltResult){
            case(-1):
                res.status(400).json("Illegal move");
                break;
            case(0):
                res.status(200).json("Critical fail");
                break;
            case(1):
                res.status(200).json("Fail");
                break;
            case(2):
                res.status(200).json("Success");
                break;
            case(3):
                res.status(200).json("Critical Success");
                break;
            case(4):
                res.status(200).json("Double Crit!");
                break;
            default:
                res.status(500).json("Switch break");
                break;
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

router.post('/transfer', async (req, res) => {
    try{
        //needs req.body.attackerId , req.body.blockerId , req.body.boardId
        let boltResult = await transfer(req.body.attackerId, req.body.blockerId, req.body.boardId, req.body.attackerDir, req.body.blockerDir);
        //this should return -1, 0, 1, 2, 3, 4
        switch(boltResult){
            case(-1):
                res.status(400).json("Illegal move");
                break;
            case(0):
                res.status(200).json("Critical fail");
                break;
            case(1):
                res.status(200).json("Fail");
                break;
            case(2):
                res.status(200).json("Success");
                break;
            case(3):
                res.status(200).json("Critical Success");
                break;
            case(4):
                res.status(200).json("Double Crit!");
                break;
            default:
                res.status(500).json("Switch break");
                break;
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

module.exports = router;