// both the client and the server will do game logic
// the client side will have a game state it references that because they don't have access to the sql table
// the server will reference the sql table
// the client will submit a move, and the server will validate
    // the server will recieve a request, check for legality, and either acept or reject

// make the individual moves, then bundle them into a larger function

const {Board, Piece, Player, Square} = require("../models");

// needs the board it is on and the pawn's info (from the id given), and the move destination
// will return 2 sets of arrays, 1 with empty legal tiles and 1 with filled/empty legal tiles
    //this is for future cathedral purposes
        //this would be if it wanted all legal moves, this is just checking
        //return legal or illegal, 0 or 1
        //will return 2 if legal but the tile is filled by an enemy

async function pawnMove(boardId, pawnId, submittedMove){
    try{
        //technically don't need to find the board because I have the id and the pieces have the board id
        const board = await Board.findByPk(boardId);
        
        //the piece must be found with a search
        const pawn = await Piece.findByPk(pawnId);

        //the board can be used to get all pieces on the board
        const boardState = await Piece.findAll(
            {where: 
                {board_id : boardId}
            }
        )
        // I have a list of pieces, all with locations and colors
        // do the game logic
        //pawns can move foward, attack diagonal, and move 2 tiles on the first move
        //break into 2 functions, 1 for black 1 for white
        const pawnColor = pawn.color;
        const pawnLocation = [pawn.locationX, pawn.locationY];
        // console.log("In pawn move");
        // console.log(pawnLocation);
        // console.log(typeof(submittedMove));
        // console.log(submittedMove);
        // console.log([pawnLocation[0], pawnLocation[1]+1]);
        // if(pawnLocation[0] == submittedMove[0] &&  (pawnLocation[1]+1) == submittedMove[1]){
        //     console.log("if check");
        // }
        if(pawnColor == "white"){
            //white starts on 2 and moves up
            //I will defy normal computer numbering and have the board use chess numbering
                // 1a to 8h
            
                //if the attempted move is moving 2 forward
            if(pawnLocation[0] == submittedMove[0] && (pawnLocation[1]+2) == submittedMove[1]){
                if(pawn.notMoved){
                    //pawn can move 2 forwards
                    //piece location is [x,y]
                        //x is normally letters and y is numbers
                    //go through each piece and check if the location is [x, y+2]
                    //return legality
                    // let legal = 1;
                    //is there a piece in that spot
                    for(piece of boardState){
                        if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                            //change legal to false
                            return 0;
                        }
                    }
                    // need to put in the change of notMoved
                    return 1;
                }
            }

            //move 1 foward
            // if(submittedMove == [pawnLocation[0], pawnLocation[1]+1]){
            if(pawnLocation[0] == submittedMove[0] && (pawnLocation[1]+1) == submittedMove[1]){
                //is there a piece in that spot
                for(piece of boardState){
                    if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                        return 0;
                    }
                }
                return 1;
            }

            //take diagonal
            //has a left and right
            //left first
            if((pawnLocation[0]-1) == submittedMove[0] && (pawnLocation[1]+1) == submittedMove[1]){
                let legal = 1;
                //check if it moved off the board
                //0 is off the board
                if(pawnLocation[0]-1 <=0){
                    legal = 0;
                    return legal;
                }
                //check if piece is there
                for(piece of boardState){
                    if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                        //pawn is white, so check if piece is black
                        if(piece.color == "black"){
                            return 2;
                        }
                        else{
                            //change legal to false
                            legal = 0;
                            return legal;
                        }
                    }
                }
                // if there is no piece, there currently is no return
                //it is an illegal move
                legal = 0;
                return legal;
            }

            //right side
            if((pawnLocation[0]+1) == submittedMove[0] && (pawnLocation[1]+1) == submittedMove[1]){
                let legal = 1;
                //check if it moved off the board
                //9 is off the board
                if(pawnLocation[0]+1 >=9){
                    legal = 0;
                    return legal;
                }
                //check if piece is there
                for(piece of boardState){
                    if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                        //pawn is white, so check if piece is black
                        //instead check if colors DON'T match
                        if(piece.color != pawnColor){
                            return 2;
                        }
                        else{
                            //change legal to false
                            legal = 0;
                            return legal;
                        }
                    }
                }
                // if there is no piece, there currently is no return
                //it is an illegal move
                legal = 0;
                return legal;
            }

            //if we are here, then it was not a legal move
            return 0;            
        }

        //black side
        if(pawnColor == "black"){
            //white starts on 2 and moves up
            //I will defy normal computer numbering and have the board use chess numbering
                // 1a to 8h
            
                //if the attempted move is moving 2 forward
            if(pawnLocation[0] == submittedMove[0] && (pawnLocation[1]-2) == submittedMove[1]){
                if(pawn.notMoved){
                    //pawn can move 2 forwards
                    //piece location is [x,y]
                        //x is normally letters and y is numbers
                    //go through each piece and check if the location is [x, y+2]
                    //return legality
                    let legal = 1;
                    //is there a piece in that spot
                    for(piece of boardState){
                        if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                            //change legal to false
                            legal = 0;
                        }
                    }
                    return legal;
                }
            }

            //move 1 foward
            if(pawnLocation[0] == submittedMove[0] && (pawnLocation[1]-1) == submittedMove[1]){
                let legal = 1;
                //is there a piece in that spot
                for(piece of boardState){
                    if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                        //change legal to false
                        legal = 0;
                    }
                }
                return legal;
            }

            //take diagonal
            //has a left and right
            //left first
            if((pawnLocation[0]-1) == submittedMove[0] && (pawnLocation[1]-1) == submittedMove[1]){
                let legal = 1;
                //check if it moved off the board
                //0 is off the board
                if(pawnLocation[0]-1 <=0){
                    legal = 0;
                    return legal;
                }
                //check if piece is there
                for(piece of boardState){
                    if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                        //pawn is black, so check if piece is white
                        if(piece.color == "white"){
                            return 2;
                        }
                        else{
                            //change legal to false
                            legal = 0;
                            return legal;
                        }
                    }
                }
                // if there is no piece, there currently is no return
                //it is an illegal move
                legal = 0;
                return legal;
            }

            //right side
            if((pawnLocation[0]+1) == submittedMove[0] && (pawnLocation[1]-1) == submittedMove[1]){
                let legal = 1;
                //check if it moved off the board
                //9 is off the board
                if(pawnLocation[0]+1 >=9){
                    legal = 0;
                    return legal;
                }
                //check if piece is there
                for(piece of boardState){
                    if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                        //pawn is white, so check if piece is black
                        if(piece.color != pawnColor){
                            return 2;
                        }
                        else{
                            //change legal to false
                            legal = 0;
                            return legal;
                        }
                    }
                }
                // if there is no piece, there currently is no return
                //it is an illegal move
                legal = 0;
                return legal;
            }

            //if we are here, then it was not a legal move
            return 0;   
            
        }
    }
    catch (err){
        // all fails will return -1
            //for testing this will likely be an if statement that reads a variable to return different codes
        return -1;
    }
};

async function kingMove(boardId, kingId, submittedMove){
    try{
        const board = await Board.findByPk(boardId);
        const king = await Piece.findByPk(kingId);
        const boardState = await Piece.findAll(
            {
                where: 
                    {board_id : boardId}
            }
        );
        const kingColor = king.color;
        const kingLocation = [king.locationX, king.locationY];
        //for all 8 surrounding tiles, check the tile
        // could do top row, bottom row, middle row
        // or could just do all 8 individualy 
        //I'm doing each 1 alone

        //top left
        if((submittedMove[0] == kingLocation[0]-1) && (submittedMove[1] == kingLocation[1]+1)){
            //check if it falls off the board
            if((kingLocation[0]-1 <=0) || (kingLocation[1]+1 >=9)){
                //0 is fail
                return 0;
            }
            //check if it hits a piece
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    if(piece.color != kingColor){
                        //2 is colides and can take
                        return 2;
                    }
                    else{
                        //if the king is the same color as the piece
                        return 0;
                    }
                }
            }

            //checked if legal, checked if collides, must be empty legal tiles
            return 1;
        }

        //top middle
        // if(submittedMove == [kingLocation[0], kingLocation[1]+1]){
        if((submittedMove[0] == kingLocation[0]) && (submittedMove[1] == kingLocation[1]+1)){
            //check if it falls off the board
            if((kingLocation[0]<=0) || (kingLocation[1]+1 >=9)){
                //0 is fail
                return 0;
            }
            //check if it hits a piece
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    if(piece.color != kingColor){
                        //2 is colides and can take
                        return 2;
                    }
                    else{
                        //if the king is the same color as the piece
                        return 0;
                    }
                }
            }

            //checked if legal, checked if collides, must be empty legal tiles
            return 1;
        }

        //top right
        // if(submittedMove == [kingLocation[0]+1, kingLocation[1]+1]){
        if((submittedMove[0] == kingLocation[0]+1) && (submittedMove[1] == kingLocation[1]+1)){
            //check if it falls off the board
            if((kingLocation[0]+1 >=9) || (kingLocation[1]+1 >=9)){
                //0 is fail
                return 0;
            }
            //check if it hits a piece
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    if(piece.color != kingColor){
                        //2 is colides and can take
                        return 2;
                    }
                    else{
                        //if the king is the same color as the piece
                        return 0;
                    }
                }
            }

            //checked if legal, checked if collides, must be empty legal tiles
            return 1;
        }

        //middle left
        // if(submittedMove == [kingLocation[0]-1, kingLocation[1]]){
        if((submittedMove[0] == kingLocation[0]-1) && (submittedMove[1] == kingLocation[1])){
            //check if it falls off the board
            if((kingLocation[0]-1 <=0)){
                //0 is fail
                return 0;
            }
            //check if it hits a piece
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    if(piece.color != kingColor){
                        //2 is colides and can take
                        return 2;
                    }
                    else{
                        //if the king is the same color as the piece
                        return 0;
                    }
                }
            }

            //checked if legal, checked if collides, must be empty legal tiles
            return 1;
        }

        //middle right
        // if(submittedMove == [kingLocation[0]+1, kingLocation[1]]){
        if((submittedMove[0] == kingLocation[0]+1) && (submittedMove[1] == kingLocation[1])){
            //check if it falls off the board
            if((kingLocation[0]+1 >=9)){
                //0 is fail
                return 0;
            }
            //check if it hits a piece
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    if(piece.color != kingColor){
                        //2 is colides and can take
                        return 2;
                    }
                    else{
                        //if the king is the same color as the piece
                        return 0;
                    }
                }
            }

            //checked if legal, checked if collides, must be empty legal tiles
            return 1;
        }

        //bottom left
        // if(submittedMove == [kingLocation[0]-1, kingLocation[1]-1]){
        if((submittedMove[0] == kingLocation[0]-1) && (submittedMove[1] == kingLocation[1]-1)){
            //check if it falls off the board
            if((kingLocation[0]-1 <=0) || (kingLocation[1]-1 <=0)){
                //0 is fail
                return 0;
            }
            //check if it hits a piece
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    if(piece.color != kingColor){
                        //2 is colides and can take
                        return 2;
                    }
                    else{
                        //if the king is the same color as the piece
                        return 0;
                    }
                }
            }

            //checked if legal, checked if collides, must be empty legal tiles
            return 1;
        }

        // bottom middle
        // if(submittedMove == [kingLocation[0], kingLocation[1]-1]){
        if((submittedMove[0] == kingLocation[0]) && (submittedMove[1] == kingLocation[1]-1)){
            //check if it falls off the board
            if((kingLocation[1]-1 <=0)){
                //0 is fail
                return 0;
            }
            //check if it hits a piece
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    if(piece.color != kingColor){
                        //2 is colides and can take
                        return 2;
                    }
                    else{
                        //if the king is the same color as the piece
                        return 0;
                    }
                }
            }

            //checked if legal, checked if collides, must be empty legal tiles
            return 1;
        }

        //bottom right
        // if(submittedMove == [kingLocation[0]+1, kingLocation[1]-1]){
        if((submittedMove[0] == kingLocation[0]+1) && (submittedMove[1] == kingLocation[1]-1)){
            //check if it falls off the board
            if((kingLocation[0]+1 >=9) || (kingLocation[1]-1 <=0)){
                //0 is fail
                return 0;
            }
            //check if it hits a piece
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    if(piece.color != kingColor){
                        //2 is colides and can take
                        return 2;
                    }
                    else{
                        //if the king is the same color as the piece
                        return 0;
                    }
                }
            }

            //checked if legal, checked if collides, must be empty legal tiles
            return 1;
        }

        //if we are here, after all possible legal moves, then it was not a legal move
        return 0;   
    }
    catch(err){
        return -1;
    }
};

//rook is done
async function rookMove(boardId, rookId, submittedMove){
    //this will move fowards in a straight line, one at a time, until it hits a stop
    try{
        const board = await Board.findByPk(boardId);
        const rook = await Piece.findByPk(rookId);
        const boardState = await Piece.findAll(
            {
                where: 
                    {board_id : boardId}
            }
        );

        const rookColor = rook.color;
        const rookLocation = [rook.locationX, rook.locationY];

        //needs a while loop
        //if the rook is moving right
        if(submittedMove[0] > rookLocation[0]){
            let run = true;
            //counter tracks how far the rook has moved
            let counter = 0;
            while(run){
                //increment the counter and break before checking if there is a piece
                counter++;
                if(rookLocation[0]+counter > 8){
                    run = false;
                    return 0;
                }
                // for loop to look through the board pieces
                for(piece of boardState){
                    if((piece.locationX == rookLocation[0]+counter) && (piece.locationY == rookLocation[1])){
                        //if colision, check if it is the destination
                        // console.log("collide");
                        // if((rookLocation[0]+counter == submittedMove[0]) && (rookLocation[1] == submittedMove[1])){
                        if(piece.color != rookColor){
                            //return takable piece
                            run = false;
                            if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                                return 2;
                            }
                            else{
                                return 0;
                            }
                        }
                        else{
                            //return illegal
                            // console.log("friendly fire");
                            run = false;
                            return 0;
                        }
                        // }
                    }
                        // // if the colision isn't the destination, the move is illegal
                        // run = false;
                        // return 0;
                    // }
                }
                //check if the destination is empty
                //already checked if there is a piece
                // if([rookLocation[0]+counter, rookLocation[1]] == submittedMove){
                if((rookLocation[0]+counter == submittedMove[0]) && (rookLocation[1] == submittedMove[1])){
                    run = false;
                    return 1;
                }
            }
        }

        //repeat for the other directions
        //left
        counter = 0;
        run = true;
        if(submittedMove[0] < rookLocation[0]){
            let run = true;
            //counter tracks how far the rook has moved
            let counter = 0;
            while(run){
                //increment the counter and break before checking if there is a piece
                counter++;
                if(rookLocation[0]-counter <= 0){
                    run = false;
                    return 0;
                }
                // for loop to look through the board pieces
                for(piece of boardState){
                    if((piece.locationX == rookLocation[0]-counter) && (piece.locationY == rookLocation[1])){
                        //if colision, check if it is the destination
                        if(piece.color != rookColor){
                            //return takable piece
                            run = false;
                            if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                                return 2;
                            }
                            else{
                                return 0;
                            }
                        }
                        else{
                            //return illegal
                            // console.log("friendly fire");
                            run = false;
                            return 0;
                        }
                    }
                }
                //check if the destination is empty
                //already checked if there is a piece
                // if([rookLocation[0]-counter, rookLocation[1]] == submittedMove){
                if((rookLocation[0]-counter == submittedMove[0]) && (rookLocation[1] == submittedMove[1])){
                    run = false;
                    return 1;
                }
            }
        }

        //down
        counter = 0;
        run = true;
        if(submittedMove[1] < rookLocation[1]){
            let run = true;
            //counter tracks how far the rook has moved
            let counter = 0;
            while(run){
                //increment the counter and break before checking if there is a piece
                counter++;
                if(rookLocation[1]-counter <= 0){
                    run = false;
                    return 0;
                }
                // for loop to look through the board pieces
                for(piece of boardState){
                    if((piece.locationX == rookLocation[0]) && (piece.locationY == rookLocation[1]-counter)){
                        //if colision, check if it is the destination
                        if(piece.color != rookColor){
                            //return takable piece
                            run = false;
                            if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                                return 2;
                            }
                            else{
                                return 0;
                            }
                        }
                        else{
                            //return illegal
                            // console.log("friendly fire");
                            run = false;
                            return 0;
                        }
                    }
                }
                //check if the destination is empty
                //already checked if there is a piece
                // if([rookLocation[0], rookLocation[1]-counter] == submittedMove){
                if((rookLocation[0] == submittedMove[0]) && (rookLocation[1]-counter == submittedMove[1])){
                    run = false;
                    return 1;
                }
            }
        }


        /////////////////////////////
        //up
        counter = 0;
        run = true;
        if(submittedMove[1] > rookLocation[1]){
            let run = true;
            //counter tracks how far the rook has moved
            let counter = 0;
            while(run){
                //increment the counter and break before checking if there is a piece
                counter++;
                if(rookLocation[1]+counter > 8){
                    run = false;
                    return 0;
                }
                // for loop to look through the board pieces
                for(piece of boardState){
                    if((piece.locationX == rookLocation[0]) && (piece.locationY == rookLocation[1]+counter)){
                        //if colision, check if it is the destination
                        if(piece.color != rookColor){
                            //return takable piece
                            run = false;
                            if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                                return 2;
                            }
                            else{
                                return 0;
                            }
                        }
                        else{
                            //return illegal
                            // console.log("friendly fire");
                            run = false;
                            return 0;
                        }
                    }
                }
                //check if the destination is empty
                //already checked if there is a piece
                // if([rookLocation[0], rookLocation[1]+counter] == submittedMove){
                if((rookLocation[0] == submittedMove[0]) && (rookLocation[1]+counter == submittedMove[1])){
                    run = false;
                    return 1;
                }
            }
        }

        //if we are here, after all possible legal moves, then it was not a legal move
        return 0;  

    }
    catch(err){
        console.log(err);
        return -1;
    }
};

//bishop is done
async function bishopMove(boardId, bishopId, submittedMove){
    //this will move fowards in a straight line, one at a time, until it hits a stop
    try{
        // const board = await Board.findByPk(boardId);
        const bishop = await Piece.findByPk(bishopId);
        const boardState = await Piece.findAll(
            {
                where: 
                    {board_id : boardId}
            }
        );

        const bishopColor = bishop.color;
        const bishopLocation = [bishop.locationX, bishop.locationY];

        //needs a while loop
        //if the bishop is moving right and up
        // if((submittedMove[0] > bishopLocation[0]) && (submittedMove[1] > bishopLocation[1])){
        if((submittedMove[0] > bishopLocation[0]) && (submittedMove[1] > bishopLocation[1])){
            let run = true;
            //counter tracks how far the bishop has moved
            let counter = 0;
            while(run){
                //increment the counter and break before checking if there is a piece
                counter++;
                if((bishopLocation[0]+counter > 8) || (bishopLocation[1]+counter > 8)){
                    run = false;
                    return 0;
                }
                // for loop to look through the board pieces
                for(piece of boardState){
                    // if([piece.locationX, piece.locationY] == [bishopLocation[0]+counter, bishopLocation[1]+counter]){
                    if((piece.locationX == bishopLocation[0]+counter) && (piece.locationY == bishopLocation[1]+counter)){
                        // (piece.locationX == rookLocation[0]+counter) && (piece.locationY == rookLocation[1])
                        //if colision, check if it is the destination
                        // if([bishopLocation[0]+counter, bishopLocation[1]+counter] == submittedMove){
                        if((bishopLocation[0]+counter == submittedMove[0]) && (bishopLocation[1]+counter == submittedMove[1])){
                            if(piece.color != bishopColor){
                                //return takable piece
                                run = false;
                                return 2;
                            }
                            else{
                                //return illegal
                                run = false;
                                return 0;
                            }
                        }
                        // if the colision isn't the destination, the move is illegal
                        run = false;
                        return 0;
                    }
                }
                //check if the destination is empty
                //already checked if there is a piece
                // if([bishopLocation[0]+counter, bishopLocation[1]+counter] == submittedMove){
                if((bishopLocation[0]+counter == submittedMove[0]) && (bishopLocation[1]+counter == submittedMove[1])){
                    // console.log("reached")
                    run = false;
                    return 1;
                }
            }
        }

        //repeat for the other directions
        //left and up
        counter = 0;
        run = true;
        if((submittedMove[0] < bishopLocation[0]) && (submittedMove[1] > bishopLocation[1])){
            let run = true;
            //counter tracks how far the bishop has moved
            let counter = 0;
            while(run){
                //increment the counter and break before checking if there is a piece
                counter++;
                if((bishopLocation[0]-counter <= 0) || (bishopLocation[1]+counter > 8)){
                    run = false;
                    return 0;
                }
                // for loop to look through the board pieces
                for(piece of boardState){
                    // if([piece.locationX, piece.locationY] == [bishopLocation[0]-counter, bishopLocation[1]+counter]){
                    if((piece.locationX == bishopLocation[0]-counter) && (piece.locationY == bishopLocation[1]+counter)){
                        // console.log("collide");
                        //if colision, check if it is the destination
                        // if([bishopLocation[0]-counter, bishopLocation[1]+counter] == submittedMove){
                        if((bishopLocation[0]-counter == submittedMove[0]) && (bishopLocation[1]+counter == submittedMove[1])){
                            if(piece.color != bishopColor){
                                //return takable piece
                                run = false;
                                return 2;
                            }
                            else{
                                //return illegal
                                run = false;
                                return 0;
                            }
                        }
                        // if the colision isn't the destination, the move is illegal
                        else{
                            run = false;
                            return 0;
                        }
                    }
                }
                //check if the destination is empty
                //already checked if there is a piece
                // if([bishopLocation[0]-counter, bishopLocation[1]+counter] == submittedMove){
                if((bishopLocation[0]-counter == submittedMove[0]) && (bishopLocation[1]+counter == submittedMove[1])){
                    // console.log("destination");
                    run = false;
                    return 1;
                }
            }
        }

        //down and left
        counter = 0;
        run = true;
        if((submittedMove[0] < bishopLocation[0]) && (submittedMove[1] < bishopLocation[1])){
            let run = true;
            //counter tracks how far the bishop has moved
            let counter = 0;
            while(run){
                //increment the counter and break before checking if there is a piece
                counter++;
                if((bishopLocation[0]-counter <= 0) || (bishopLocation[1]-counter <= 0)){
                    run = false;
                    return 0;
                }
                // for loop to look through the board pieces
                for(piece of boardState){
                    // if([piece.locationX, piece.locationY] == [bishopLocation[0]-counter, bishopLocation[1]-counter]){
                    if((piece.locationX == bishopLocation[0]-counter) && (piece.locationY == bishopLocation[1]-counter)){
                        //if colision, check if it is the destination
                        if((bishopLocation[0]-counter == submittedMove[0]) && (bishopLocation[1]-counter == submittedMove[1])){
                            if(piece.color != bishopColor){
                                //return takable piece
                                run = false;
                                return 2;
                            }
                            else{
                                //return illegal
                                run = false;
                                return 0;
                            }
                        }
                        // if the colision isn't the destination, the move is illegal
                        run = false;
                        return 0;
                    }
                }
                //check if the destination is empty
                //already checked if there is a piece
                // if([bishopLocation[0]+counter, bishopLocation[1]-counter] == submittedMove){
                if((bishopLocation[0]-counter == submittedMove[0]) && (bishopLocation[1]-counter == submittedMove[1])){
                    run = false;
                    return 1;
                }
            }
        }


        /////////////////////////////
        //right and down
        counter = 0;
        run = true;
        if((submittedMove[0] > bishopLocation[0]) && submittedMove[1] < bishopLocation[1]){
            let run = true;
            //counter tracks how far the bishop has moved
            let counter = 0;
            while(run){
                //increment the counter and break before checking if there is a piece
                counter++;
                if((bishopLocation[0]+counter > 8) || (bishopLocation[1]-counter <= 0)){
                    run = false;
                    return 0;
                }
                // for loop to look through the board pieces
                for(piece of boardState){
                    if((piece.locationX == bishopLocation[0]+counter) && (piece.locationY == bishopLocation[1]-counter)){
                        // if([piece.locationX, piece.locationY] == [bishopLocation[0]+counter, bishopLocation[1]-counter]){
                        
                        //if colision, check if it is the destination
                        if((bishopLocation[0]+counter == submittedMove[0]) && (bishopLocation[1]-counter == submittedMove[1])){
                            // if([bishopLocation[0]+counter, bishopLocation[1]-counter] == submittedMove){
                            if(piece.color != bishopColor){
                                //return takable piece
                                run = false;
                                return 2;
                            }
                            else{
                                //return illegal
                                run = false;
                                return 0;
                            }
                        }
                        // if the colision isn't the destination, the move is illegal
                        run = false;
                        return 0;
                    }
                }
                //check if the destination is empty
                //already checked if there is a piece
                // if([bishopLocation[0]+counter, bishopLocation[1]-counter] == submittedMove){
                if((bishopLocation[0]+counter == submittedMove[0]) && (bishopLocation[1]-counter == submittedMove[1])){
                    run = false;
                    return 1;
                }
            }
        }

        //if we are here, after all possible legal moves, then it was not a legal move
        return 0;  

    }
    catch(err){
        console.log(err);
        return -1;
    }
};

async function queenMove(boardId, queenId, submittedMove){
    //this will return 0, 1, or 2
    const rookSide = rookMove(boardId, queenId, submittedMove);
    const bishopSide = bishopMove(boardId, queenId, submittedMove);

    //if either, find out which one and return it
    if(rookSide || bishopSide){
        if(rookSide){
            return rookSide;
        }
        if(bishopSide){
            return bishopSide;
        }
    }
    else{
        //if neither, return fail
        return 0;
    }
};

//knight just works
async function knightMove(boardId, knightId, submittedMove){
    try{
        const board = await Board.findByPk(boardId);
        const knight = await Piece.findByPk(knightId);
        const boardState = await Piece.findAll(
            {
                where: 
                    {board_id : boardId}
            }
        );
        const knightColor = knight.color;
        const knightLocation = [knight.locationX, knight.locationY];

        //going clockwise, starting at 12:00
        //top right, left
        // if([knightLocation[0] + 1, knightLocation[1] + 2] == submittedMove){
        if((knightLocation[0] + 1 == submittedMove[0]) && (knightLocation[1] + 2 == submittedMove[1])){
            //fall off the board
            if((knightLocation[0] + 1) > 8 || (knightLocation[1] + 2) > 8){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                // piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }

        //top right, right
        // if([knightLocation[0] + 2, knightLocation[1] + 1] == submittedMove){
        if((knightLocation[0] + 2 == submittedMove[0]) && (knightLocation[1] + 1 == submittedMove[1])){
            //fall off the board
            if((knightLocation[0] + 2) > 8 || (knightLocation[1] + 1) > 8){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }

        //bottom right, right
        if((knightLocation[0] + 2 == submittedMove[0]) && (knightLocation[1]-+ 2 == submittedMove[1])){
        // if([knightLocation[0] + 2, knightLocation[1] -1] == submittedMove){
            //fall off the board
            if((knightLocation[0] + 2) > 8 || (knightLocation[1] -1) <=0){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }

        //bottom right, left
        // if([knightLocation[0] + 1, knightLocation[1] -2] == submittedMove){
        if((knightLocation[0] + 1 == submittedMove[0]) && (knightLocation[1] - 2 == submittedMove[1])){
            //fall off the board
            if((knightLocation[0] + 1) > 8 || (knightLocation[1] -2) <=0){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }


        //bottom right, right
        // if([knightLocation[0] + 2, knightLocation[1] -1] == submittedMove){
        if((knightLocation[0] + 2 == submittedMove[0]) && (knightLocation[1] - 1 == submittedMove[1])){
            //fall off the board
            if((knightLocation[0] + 2) > 8 || (knightLocation[1] -1) <=0){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }

        //bottom left, left
        if((knightLocation[0] - 2 == submittedMove[0]) && (knightLocation[1] - 1 == submittedMove[1])){
        // if([knightLocation[0] - 2, knightLocation[1] -1] == submittedMove){
            //fall off the board
            if((knightLocation[0] - 2) <=0 || (knightLocation[1] -1) <=0){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }

        //bottom left, right
        // if([knightLocation[0] - 1, knightLocation[1] -2] == submittedMove){
        if((knightLocation[0] - 1 == submittedMove[0]) && (knightLocation[1] - 2 == submittedMove[1])){
            //fall off the board
            if((knightLocation[0] - 1) <=0 || (knightLocation[1] -2) <=0){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }

        //top left, left
        // if([knightLocation[0] - 2, knightLocation[1] +1] == submittedMove){
        if((knightLocation[0] - 2 == submittedMove[0]) && (knightLocation[1] + 1 == submittedMove[1])){
            //fall off the board
            if((knightLocation[0] - 2) <=0 || (knightLocation[1] +1) > 8){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }

        //top left, right
        // if([knightLocation[0] -1, knightLocation[1] +2] == submittedMove){
        if((knightLocation[0] - 1 == submittedMove[0]) && (knightLocation[1] + 2 == submittedMove[1])){
            //fall off the board
            if((knightLocation[0] - 1) <=0 || (knightLocation[1] +2) > 8){
                return 0;
            };
            //check if the tile is occupied
            //submitted move is the same as the knight's position
            for(piece of boardState){
                if(piece.locationX == submittedMove[0] && piece.locationY == submittedMove[1]){
                    //legal take
                    if(piece.color != knightColor){
                        return 2;
                    }
                    //friendly fire
                    else{
                        return 0;
                    }
                }
            };
            // if there are no pieces in the way and on the board
            return 1;
        }


        //if the move wasn't caught by the above if blocks, it wasn't a legal knight move
        return 0;

    }
    catch(err){
        console.log(err);
        return -1;
    }
}

module.exports = {pawnMove, kingMove, rookMove, bishopMove, queenMove, knightMove};

// take these functions to the routes, and read the piece id of the requested move to find out which to use