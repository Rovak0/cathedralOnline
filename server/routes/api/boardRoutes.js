const router = require('express').Router();

const {Board, Piece, Player} = require("../../models");
const {normalBoard} = require('../../utils/openingBoards');

//get board
router.get('/', async (req, res) => {
    //the req.body.user will fetch the board based off of user id
    const user = req.body.user;
    if(!user){
        res.status(400).json("No user found on request");
    }
    try{
        //find the user
        const userData = await Player.findByPk(user.id);
        if(!userData){
            res.status(404).json("No user found on server");
        }

        //find the board
        const boardData1 = await Board.findAll({
            where : {
                player_id1 : user.id,
                complete : false
            }
        });
        const boardData2 = await Board.findAll({
            where : {
                player_id2 : user.id,
                complete : false
            }
        });
        //there should only be 1 game live at a time, so the player cannot have both
        let boardData;
        // grab the other player while I am here
        let otherPlayer;
        if(boardData1){
            boardData = boardData1;
            otherPlayer = boardData.player_id2;
        }
        else if(boardData2){
            boardData = boardData2;
            otherPlayer = boardData.player_id1;
        }
        else{
            res.status(404).json("fail to find");
        }

        // return the board and all pieces on it
        const boardState = await Piece.findAll(
            {
                where: 
                    {board_id : boardData.id}
            }
        );
        // need to send the board so that the other player is sent
        // actually, just send the other player's name
        const otherName = await Player.findByPk(otherPlayer);
        const returnItem = {
            returnBoardState: boardState,
            opponent: otherName
        }
        res.status(200).json(returnItem)
    }
    catch(err){
        res.status(500).json(err);
    }
});


//make a generic board
router.post('/normal', async (req, res) => {
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

        // console.log("check for board");
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

        //create the board
        const newBoard = await Board.create(req.body);
        //normalBoard is a function that take in a board id
        const boardState = normalBoard(newBoard.id);
        res.status(200).json([newBoard, boardState]);

    }
    catch(err){
        res.status(500).json(err);
    }
});

module.exports = router;