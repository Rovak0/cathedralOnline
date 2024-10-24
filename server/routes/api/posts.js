const router = require('express').Router();

//this will handle all updates and creates

const {Board, Piece, Player, Square} = require("../../models");

//need a general create board function

//needs a create player first
router.post("/player", async (req,res) => {
    try{
        const userData = await Player.create(req.body);
        res.status(200).json(userData);
    }
    catch (err){
        res.status(400).json(err);
    }
});

router.post("/board", async (req, res) => {
    try{
        //the req.body needs to have a player_id1 and player_id2
        //make sure there are no ongoing games with the player id
        //this needs to be fed the ids, not the usernames
        const user1id = req.body.player_id1;
        const user2id = req.body.player_id2;
        if (!(user1id && user2id)){
            res.json("please enter 2 users");
            return;
        }

        console.log("check for board");
        //check for boards for both users
        const boardData1 = await Board.findAll({
            where : {
                player_id1 : user1id,
                complete : false
            }
        });
        const boardData2 = await Board.findAll({
            where : {
                player_id2 : user1id,
                complete : false
            }
        });

        //check user 2
        const boardData3 = await Board.findAll({
            where : {
                player_id1 : user2id,
                complete : false
            }
        });
        const boardData4 = await Board.findAll({
            where : {
                player_id2 : user2id,
                complete : false
            }
        });

        //close all found boards
        if (boardData1){
            for (board of boardData1){
                board.complete = true;
                await board.save();
            }
        };
        if (boardData2){
            for (board of boardData2){
                board.complete = true;
                await board.save();
            }
        };
        if (boardData3){
            for (board of boardData3){
                board.complete = true;
                await board.save();
            }
        };
        if (boardData4){
            for (board of boardData4){
                board.complete = true;
                await board.save();
            }
        };
        //create the new board 
        const newBoard = await Board.create(req.body);
        //then create the squares, then the pieces
        const newBoardId = newBoard.id;
        const squareHolder = [];
        // let tracer = 0;
        //make 8 rows
        for (let xTacker = 0; xTacker<8; xTacker++){
            //make an empty row and set the y count to 0
            let rowHolder = [];
            let yTracker = 0;
            //make the y row
            while(yTracker<8){
                const newSquare = await Square.create(
                    {
                        board_id: newBoardId, 
                        postitionX: xTacker, 
                        postitionY: yTracker}
                );
                //add the new square to the x list
                rowHolder.push(newSquare);
                yTracker++;
            };
            //add the full x list to the full list
            squareHolder.push(rowHolder);
        };
        res.status(200).json(squareHolder);
    }
    catch (err) {
        res.status(400).json(err);
    }
});

//need ways to move pieces
    //needs the logic to check for legal moves

module.exports = router;
