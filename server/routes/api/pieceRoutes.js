const router = require('express').Router();

const {Board, Piece, Player} = require("../../models");
const {pawnMove, kingMove, rookMove, bishopMove, queenMove, knightMove} = require('../../utils/gameLogic');

router.post('/move', async (req, res) => {
    //this will recieve a boardId, a pieceId, and a destination
    try{
        const pieceData = await Piece.findByPk(req.body.pieceId); 
        // the move type of the piece is what I'm after
        let moveResult;
        //run through a switch case and return legality
        switch(pieceData.moveType){
            case "pawn":
                moveResult = pawnMove(req.body.boardId, req.body.pieceId, req.body.submittedMove);
                break;
            case "rook":
                moveResult = rookMove(req.body.boardId, req.body.pieceId, req.body.submittedMove);
                break;
            case "knight":
                moveResult = knightMove(req.body.boardId, req.body.pieceId, req.body.submittedMove);
                break;            
            case "bishop":
                moveResult = bishopMove(req.body.boardId, req.body.pieceId, req.body.submittedMove);
                break;
            case "queen":
                moveResult = queenMove(req.body.boardId, req.body.pieceId, req.body.submittedMove);
                break;
            case "king":
                moveResult = kingMove(req.body.boardId, req.body.pieceId, req.body.submittedMove);
                break;
            default:
                moveResult = -1;
        }

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
        if(moveResult == 1){
            res.status(200).json("Legal empty move");
            return;
        }
        // return of 2, take the piece
        if(moveResult == 2){
            res.status(200).json("Piece taken");
            return;
        }

    }
    catch(err){
        res.status(500).json(err);
    }
});


module.exports = router;