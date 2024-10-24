const router = require('express').Router();

//this will handle all data requests
//mainly return boardstates, but will also give piece data

const {Board, Piece, Player, Square} = require("../../models");

//get boardstate
router.get('/board', async (res, req) => {
    //I need to get the boardstate and return that
    //that means each tile on the board the player is on
    //so I need to get the player, use that to get the board, then use that to get the tiles
        //the tiles then need to be used to get the pieces
    //this will eventually use json tokens, but until then it looks like this
    const user = req.body.user;
    try {
        const userData = await Player.finkByPk(user.id);
        //this should return a user with all the values
            //all this does is verify that the user exists
        //use the user.id to find boards
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
        if(boardData1){
            const boardData = boardData1;
        }
        else if(boardData2){
            const boardData = boardData2;
        }
        else{
            res.status(404).json("fail to find");
        }
        //i should have a board now, and if I don't I have left this function
        //now find every square, then every piece, and send that back
        const squareData = await Square.findAll({
            where: {
                board_id : boardData.id
            }
        });
        //square data should be a list
        const pieceData = [];
        for (tile of squareData){
            const piece = await Piece.findAll({
                where: {
                    square_id : tile.id
                }
            });
            if (piece){
                pieceData.push(piece);
            }
        };
        res.status(200).json(squareData, pieceData);

    }
    catch (err){
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/players', async (req, res) => {
    try{
        const userData = await Player.findAll();
        req.status(200).json(userData);
    }
    catch (err) {
        req.status(500).json(err);
    };
});


module.exports = router;