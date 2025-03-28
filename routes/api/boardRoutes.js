const router = require('express').Router();

const {Board, Piece, Player} = require("../../models");
const {normalBoard, cathedralBoard, catBoardTest} = require('../../utils/openingBoards');

const {joinQueue, joinQueueCat, testerQueue} = require('../../utils/queue');

//get board
router.post('/', async (req, res) => {
    //the req.body.user will fetch the board based off of user id
    const user = req.body.user;
    if(!user){
        res.status(400).json("No user found on request");
        return;
    }
    try{
        //find the user
        const userData = await Player.findByPk(user);
        // console.log(userData);
        if(!userData){
            res.status(404).json("No user found on server");
            return;
        }

        //find the board
        const boardData1 = await Board.findAll({
            where : {
                player_id1 : user,
                complete : false
            }
        });
        const boardData2 = await Board.findAll({
            where : {
                player_id2 : user,
                complete : false
            }
        });
        //there should only be 1 game live at a time, so the player cannot have both
        let boardData;
        // console.log("checking for board");
        // grab the other player while I am here
        let otherPlayer;
        // console.log("Before if blocks");
        // console.log(boardData1);
        if(boardData1[0]){
            // console.log("In if blocks");
            boardData = boardData1[0];
            otherPlayer = boardData.player_id2;
        }
        else if(boardData2[0]){
            // console.log("Middle if blocks");
            boardData = boardData2[0];
            otherPlayer = boardData.player_id1;
        }
        else{
            // console.log("Nothing found");
            res.status(404).json("fail to find");
            return;
        }
        // console.log("cleaning board");
        // return the board and all pieces on it
        let boardState;
        console.log(boardData);
        console.log(boardData.dataValues.id);
        // if there are multiple board states found, bad things happen
        if(boardData){
            // console.log("Board data");
            boardState = await Piece.findAll(
                {
                    where: 
                        {board_id : boardData.dataValues.id}
                }
            );
            // console.log("Board data after");

        }
        else{
            boardState = "No board state";
        }
        // console.log(boardState);
        // console.log("piece stuff");
        // need to send the board so that the other player is sent
        // actually, just send the other player's name
        const otherName = await Player.findByPk(otherPlayer);
        const returnItem = {
            boardData: boardData,
            returnBoardState: boardState,
            opponent: otherName
        };
        console.log(returnItem);
        console.log("returnItem");

        res.status(200).json(returnItem);
        return;
    }
    catch(err){
        res.status(500).json(err);
        return;
    }
});


//make a generic board with the queue
router.post('/normal', async (req, res) => {
    try{
        //the req.body needs to have a player_id1 and player_id2
        //make sure there are no ongoing games with the player id
        //this needs to be fed the ids, not the usernames

        //req.body.user is the joining user
        let joinAttempt = await joinQueue(req.body.user);
        console.log("After joinqueue");
        //the breaks
        if(joinAttempt == -1){
            res.status(500).json("pair error");
            return;
        }
        if(joinAttempt == 1){
            res.status(200).json("Waiting for second player");
            return;
        }

        // boards can be made like this or by queue jumping
            //I have to check for boards
        
        const user1id = joinAttempt[0].id;
        const user2id = joinAttempt[1].id;

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

        //close all found boards and delete all their pieces
        let boardPieces;
        if (boardData1){
            for (board of boardData1){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData2){
            for (board of boardData2){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData3){
            for (board of boardData3){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData4){
            for (board of boardData4){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };

        //create the board
        //need to randomize who is player 1 and 2 because that is white and black
        let randomizer = Math.random();
        let newBoard;
        if(randomizer >= 0.5){
            newBoard = await Board.create({
                player_id1: user1id,
                player_id2: user2id,
                currentTurn: 0
            });
        }
        else{
            newBoard = await Board.create({
                player_id1: user2id,
                player_id2: user1id,
                currentTurn: 0
            });
        }
        console.log(newBoard);

        //normalBoard is a function that take in a board id
        const boardState = normalBoard(newBoard.id);
        res.status(200).json([newBoard, boardState]);

    }
    catch(err){
        res.status(500).json(err);
    }
});

//make a cathedral game
router.post('/cathedral', async (req, res) => {
    try{
        //the req.body needs to have a player_id1 and player_id2
        //make sure there are no ongoing games with the player id
        //this needs to be fed the ids, not the usernames

        //req.body.user is the joining user
        let joinAttempt = await joinQueueCat(req.body.user);
        console.log("After joinqueue");
        //the breaks
        if(joinAttempt == -1){
            res.status(500).json("pair error");
            return;
        }
        if(joinAttempt == 1){
            res.status(200).json("Waiting for second player");
            return;
        }

        // boards can be made like this or by queue jumping
            //I have to check for boards
        
        const user1id = joinAttempt[0].id;
        const user2id = joinAttempt[1].id;

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
        let boardPieces;
        if (boardData1){
            for (board of boardData1){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData2){
            for (board of boardData2){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData3){
            for (board of boardData3){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData4){
            for (board of boardData4){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };

        //create the board
        //need to randomize who is player 1 and 2 because that is white and black
        let randomizer = Math.random();
        let newBoard;
        if(randomizer >= 0.5){
            newBoard = await Board.create({
                player_id1: user1id,
                player_id2: user2id,
                currentTurn: 0
            });
        }
        else{
            newBoard = await Board.create({
                player_id1: user2id,
                player_id2: user1id,
                currentTurn: 0
            });
        }
        console.log(newBoard);

        //normalBoard is a function that take in a board id
        const boardState = cathedralBoard(newBoard.id);
        res.status(200).json([newBoard, boardState]);

    }
    catch(err){
        res.status(500).json(err);
    }
});

//tester queue
router.post('/testing', async (req, res) => {
    try{
        //the req.body needs to have a player_id1 and player_id2
        //make sure there are no ongoing games with the player id
        //this needs to be fed the ids, not the usernames

        //req.body.user is the joining user
        let joinAttempt = await testerQueue(req.body.user);
        console.log("After joinqueue");
        //the breaks
        if(joinAttempt == -1){
            res.status(500).json("pair error");
            return;
        }
        if(joinAttempt == 1){
            res.status(200).json("Waiting for second player");
            return;
        }

        // boards can be made like this or by queue jumping
            //I have to check for boards
        
        const user1id = joinAttempt[0].id;
        const user2id = joinAttempt[1].id;

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
        let boardPieces;
        if (boardData1){
            for (board of boardData1){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData2){
            for (board of boardData2){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData3){
            for (board of boardData3){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };
        if (boardData4){
            for (board of boardData4){
                boardPieces = await Piece.findAll({
                    where: {
                        board_id : board.id
                    }
                });
                board.complete = true;
                await board.save();
            }
        };

        //create the board
        //need to randomize who is player 1 and 2 because that is white and black
        let randomizer = Math.random();
        let newBoard;
        if(randomizer >= 0.5){
            newBoard = await Board.create({
                player_id1: user1id,
                player_id2: user2id,
                currentTurn: 0
            });
        }
        else{
            newBoard = await Board.create({
                player_id1: user2id,
                player_id2: user1id,
                currentTurn: 0
            });
        }
        console.log(newBoard);

        //normalBoard is a function that take in a board id
        const boardState = catBoardTest(newBoard.id);
        res.status(200).json([newBoard, boardState]);

    }
    catch(err){
        res.status(500).json(err);
    }
});

//make a generic board with 2 specific players
router.post('/jumpQueue', async (req, res) => {
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