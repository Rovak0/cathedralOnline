const router = require('express').Router();

const {Board, Piece, Player} = require("../../models");
const {pawnMove, kingMove, rookMove, bishopMove, queenMove, knightMove} = require('../../utils/gameLogic');

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


module.exports = router;