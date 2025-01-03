//this will be fed the data from the script's query
    //this means it will have x/y coords

//these functions will return all legal moves as coords so the gameboard can highlight them
    //there will be 2 lists, a move list and a take list
    //the board will look at both to color the 2 lists differently

//I can give the whole boardstate, but no the piece itself
    //the tiles don't know what sql piece it holds, just the type
    //the board is stored and can be passed

//I may be able to pass the piece if I store the piece id as part of the type

//I can find the piece based off of x/y going to locationX/locationY

function pawnMove(pawn, boardState){
    //pawn's x,y and can it cap a piece
    const pawnX = pawn.locationX;
    const pawnY = pawn.locationY;
    const pawnTake = pawn.canTake;

    //boardState is a list of all pieces
    //go through each possible pawn move and put it in a list
    const moveList = [];
    //add a list for move and take
    const takeList = [];

    //white side
    //check tile right in front of white pawn
    //emptyTile is declared here for optimizing
    let emptyTile = true;
    if(pawn.color == "white"){
        if(!(pawnY >= 8)){
            for(piece of boardState){
                if((piece.locationX == pawnX) && (piece.locationY == pawnY + 1)){
                    emptyTile = false;
                }
            }
            //left the for loop to check if the tile directly in front is empty
            if(emptyTile){
                moveList.push([pawnX, pawnY + 1]);
            }
        }
        if(!(pawnY >= 7)){
            if(emptyTile){
                for(piece of boardState){
                    if((piece.locationX == pawnX) && (piece.locationY == pawnY + 2)){
                        emptyTile = false;
                    }
                }
                //if the 2nd tile is ALSO empty, add to list
                if(emptyTile){
                    moveList.push([pawnX, pawnY + 2]);
                }
            }
        }
        //get the jump move now

        //takes
        if(pawnTake){
            //right
            if(!(pawnY >= 8) || !(pawnX >= 8)){
                for(piece of boardState){
                    if((piece.locationX == pawnX+1) && (piece.locationY == pawnY + 1)){
                        if(piece.color != pawn.color){
                            takeList.push([pawnX+1, pawnY+1]);
                        }
                    }
                }
            }
            //left
            if(!(pawnY >= 8) || !(pawnX <= 0)){
                for(piece of boardState){
                    if((piece.locationX == pawnX-1) && (piece.locationY == pawnY + 1)){
                        if(piece.color != pawn.color){
                            takeList.push([pawnX-1, pawnY+1]);
                        }
                    }
                }
            }
        }
    }

    if(pawn.color == "black"){
        if(!(pawnY <= 0)){
            for(piece of boardState){
                if((piece.locationX == pawnX) && (piece.locationY == pawnY - 1)){
                    emptyTile = false;
                }
            }
            //left the for loop to check if the tile directly in front is empty
            if(emptyTile){
                moveList.push([pawnX, pawnY - 1]);
            }
        }
        //get the jump move now
        if(!(pawnY <= 1)){
            if(emptyTile){
                for(piece of boardState){
                    if((piece.locationX == pawnX) && (piece.locationY == pawnY - 2)){
                        emptyTile = false;
                    }
                }
                //if the 2nd tile is ALSO empty, add to list
                if(emptyTile){
                    moveList.push([pawnX, pawnY - 2]);
                }
            }
        }

        //takes
        if(pawnTake){
            //right
            if(!(pawnY <= 0) || !(pawnX >= 8)){
                for(piece of boardState){
                    if((piece.locationX == pawnX+1) && (piece.locationY == pawnY - 1)){
                        if(piece.color != pawn.color){
                            takeList.push([pawnX+1, pawnY-1]);
                        }
                    }
                }
            }
            //left
            if(!(pawnY <= 0) || !(pawnX <= 0)){
                for(piece of boardState){
                    if((piece.locationX == pawnX-1) && (piece.locationY == pawnY - 1)){
                        if(piece.color != pawn.color){
                            takeList.push([pawnX-1, pawnY-1]);
                        }
                    }
                }
            }
        }
    }

    return [moveList, takeList];
}

//kings
function kingMove(king, boardState){
    const kingX = king.locationX;
    const kingY = king.locationY;
    //don't actually need to track if the king can take because it will be naturally in 2 seperate lists
    const moveList = [];
    const takeList = [];

    //just go across each row
    let emptyTile = true;
    if(!(kingY >= 8)){
        //top left
        if(!(kingX <= 0)){
            for(piece of boardState){
                if((piece.locationX == kingX - 1) && (piece.locationY == kingY + 1)){
                    emptyTile = false;
                    if(piece.color != king.color){
                        takeList.push([kingX - 1, kingY + 1]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([kingX - 1, kingY + 1]);
            }
        }
        ////////
        //top middle
        emptyTile = true;
        for(piece of boardState){
            if((piece.locationX == kingX ) && (piece.locationY == kingY + 1)){
                emptyTile = false;
                if(piece.color != king.color){
                    takeList.push([kingX, kingY + 1]);
                }
            }
        }
        if(emptyTile){
            moveList.push([kingX, kingY + 1]);
        }

        /////
        //top right
        emptyTile = true;
        if(!(kingX >= 8)){
            for(piece of boardState){
                if((piece.locationX == kingX + 1) && (piece.locationY == kingY + 1)){
                    emptyTile = false;
                    if(piece.color != king.color){
                        takeList.push([kingX + 1, kingY + 1]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([kingX + 1, kingY + 1]);
            }
        }
    }

    //middle
    //left
    emptyTile = true;
    if(!(kingX <= 0)){
        for(piece of boardState){
            if((piece.locationX == kingX - 1) && (piece.locationY == kingY)){
                emptyTile = false;
                if(piece.color != king.color){
                    takeList.push([kingX - 1, kingY]);
                }
            }
        }
        if(emptyTile){
            moveList.push([kingX - 1, kingY]);
        }
    }

    /////
    //right
    emptyTile = true;
    if(!(kingX >= 8)){
        for(piece of boardState){
            if((piece.locationX == kingX + 1) && (piece.locationY == kingY)){
                emptyTile = false;
                if(piece.color != king.color){
                    takeList.push([kingX + 1, kingY]);
                }
            }
        }
        if(emptyTile){
            moveList.push([kingX + 1, kingY]);
        }
    }

    //bottom
    emptyTile = true;
    if(!(kingY <= 0)){
        //bottom left
        if(!(kingX <= 0)){
            for(piece of boardState){
                if((piece.locationX == kingX - 1) && (piece.locationY == kingY - 1)){
                    emptyTile = false;
                    if(piece.color != king.color){
                        takeList.push([kingX - 1, kingY - 1]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([kingX - 1, kingY - 1]);
            }
        }
        ////////
        //bottom middle
        emptyTile = true;
        for(piece of boardState){
            if((piece.locationX == kingX ) && (piece.locationY == kingY - 1)){
                emptyTile = false;
                if(piece.color != king.color){
                    takeList.push([kingX, kingY - 1]);
                }
            }
        }
        if(emptyTile){
            moveList.push([kingX, kingY - 1]);
        }

        /////
        //bottom right
        emptyTile = true;
        if(!(kingX >= 8)){
            for(piece of boardState){
                if((piece.locationX == kingX + 1) && (piece.locationY == kingY - 1)){
                    emptyTile = false;
                    if(piece.color != king.color){
                        takeList.push([kingX + 1, kingY - 1]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([kingX + 1, kingY - 1]);
            }
        }
    }

    return [moveList, takeList];
}

//rooks
function rookMove(rook, boardState){
    const rookX = rook.locationX;
    const rookY = rook.locationY;

    const moveList = [];
    const takeList = [];

    //go in straight lines until collision or off the board
    let run = true;
    let tracker = 0;
    while(run){
        //tracker is how far the rook has moved
        tracker++;
        //set up bounds
        if((rookX + tracker) > 8){
            run = false;
            break;
        }
        //check for collision
        for(piece of boardState){
            if((piece.locationX == rookX+tracker) && (piece.locationY == rookY)){
                if(piece.color != rook.color){
                    takeList.push([rookX+tracker, rookY]);
                }
                run = false;
            }
        }
        //add empty tiles to the moveList
            //run is true unless collide or fall off board
        if(run){
            moveList.push([rookX+tracker, rookY]);
        }
    }
    tracker = 0;
    run = true;

    ///////
    //left
    while(run){
        //tracker is how far the rook has moved
        tracker++;
        //set up bounds
        if((rookX - tracker) <= 0){
            run = false;
            break;
        }
        //check for collision
        for(piece of boardState){
            if((piece.locationX == rookX-tracker) && (piece.locationY == rookY)){
                if(piece.color != rook.color){
                    takeList.push([rookX-tracker, rookY]);
                }
                run = false;
            }
        }
        //add empty tiles to the moveList
            //run is true unless collide or fall off board
        if(run){
            moveList.push([rookX-tracker, rookY]);
        }
    }
    tracker = 0;
    run = true;

    //up
    while(run){
        //tracker is how far the rook has moved
        tracker++;
        //set up bounds
        if((rookY + tracker) > 8){
            run = false;
            break;
        }
        //check for collision
        for(piece of boardState){
            if((piece.locationX == rookY+tracker) && (piece.locationY == rookY)){
                if(piece.color != rook.color){
                    takeList.push([rookY+tracker, rookY]);
                }
                run = false;
            }
        }
        //add empty tiles to the moveList
            //run is true unless collide or fall off board
        if(run){
            moveList.push([rookY+tracker, rookY]);
        }
    }

    ////////
    //down
    tracker = 0;
    run = true;
    while(run){
        //tracker is how far the rook has moved
        tracker++;
        //set up bounds
        if((rookY - tracker) <= 0){
            run = false;
            break;
        }
        //check for collision
        for(piece of boardState){
            if((piece.locationX == rookX) && (piece.locationY == rookY-tracker)){
                if(piece.color != rook.color){
                    takeList.push([rookX, rookY-tracker]);
                }
                run = false;
            }
        }
        //add empty tiles to the moveList
            //run is true unless collide or fall off board
        if(run){
            moveList.push([rookX, rookY-tracker]);
        }
    }
    tracker = 0;
    run = true;
}

//bishop move
function bishopMove(bishop, boardState){
    const bishX = bishop.locationX;
    const bishY = bishop.locationY;

    const moveList = [];
    const takeList = [];

    //while loops until collision
    let run = true;
    let xTracker = 0;
    let yTracker = 0;

    //up right
    while(run){
        xTracker++;
        yTracker++;
        if((bishX + xTracker >8) || (bishY + yTracker >8)){
            run = false;
            break;
        }
        //check for collision
        for(piece of boardState){
            if((piece.locationX == bishX + xTracker) && (piece.locationY == bishY + yTracker)){
                if(piece.color != bishop.color){
                    takeList.push([bishX+xTracker, bishY + yTracker]);
                }
                //even if you can't take them, they block movement
                run = false;
            }
        }

        if(run){
            moveList.push([bishX+xTracker, bishY + yTracker]);
        }
    }

    ///////
    //down right
    run = true;
    xTracker = 0;
    yTracker = 0;
    while(run){
        xTracker++;
        yTracker++;
        if((bishX + xTracker >8) || (bishY - yTracker <= 0)){
            run = false;
            break;
        }
        //check for collision
        for(piece of boardState){
            if((piece.locationX == bishX + xTracker) && (piece.locationY == bishY - yTracker)){
                if(piece.color != bishop.color){
                    takeList.push([bishX+xTracker, bishY - yTracker]);
                }
                //even if you can't take them, they block movement
                run = false;
            }
        }

        if(run){
            moveList.push([bishX+xTracker, bishY - yTracker]);
        }
    }

    ///////
    //down left
    run = true;
    xTracker = 0;
    yTracker = 0;
    while(run){
        xTracker++;
        yTracker++;
        if((bishX - xTracker <= 0) || (bishY - yTracker <= 0)){
            run = false;
            break;
        }
        //check for collision
        for(piece of boardState){
            if((piece.locationX == bishX - xTracker) && (piece.locationY == bishY - yTracker)){
                if(piece.color != bishop.color){
                    takeList.push([bishX-xTracker, bishY - yTracker]);
                }
                //even if you can't take them, they block movement
                run = false;
            }
        }

        if(run){
            moveList.push([bishX-xTracker, bishY - yTracker]);
        }
    }

    /////////
    //up left
    run = true;
    xTracker = 0;
    yTracker = 0;
    while(run){
        xTracker++;
        yTracker++;
        if((bishX - xTracker <= 0) || (bishY + yTracker > 8)){
            run = false;
            break;
        }
        //check for collision
        for(piece of boardState){
            if((piece.locationX == bishX - xTracker) && (piece.locationY == bishY + yTracker)){
                if(piece.color != bishop.color){
                    takeList.push([bishX-xTracker, bishY + yTracker]);
                }
                //even if you can't take them, they block movement
                run = false;
            }
        }

        if(run){
            moveList.push([bishX-xTracker, bishY + yTracker]);
        }
    }
}

//queen move
function queenMove(queen, boardState){
    const rookSide = rookMove(queen, boardState);
    const bishSide = bishopMove(queen, boardState);

    const moveList = rookSide[0].concat(bishSide[0]);
    const takeList = rookSide[1].concat(bishSide[1]);

    return [moveList, takeList];
}

//knights
function knightMove(knight, boardState){
    const knightX = knight.locationX;
    const knightY = knight.locationY;

    const moveList = [];
    const takeList = [];

    let emptyTile = true;

    //up left/right
    if((knightY + 2) <= 8){
        //right
        if((knightX + 1) <= 8){
            for(piece of boardState){
                if((piece.locationX == knightX + 1) && (piece.locationY == knightY + 2)){
                    emptyTile = false;
                    if(piece.color != knight.color){
                        takeList.push([knightX+1, knightY+2]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([knightX+1, knightY+2]);
            }
        };

        if((knightX - 1) >=1){
            for(piece of boardState){
                if((piece.locationX == knightX - 1) && (piece.locationY == knightY + 2)){
                    emptyTile = false;
                    if(piece.color != knight.color){
                        takeList.push([knightX-1, knightY+2]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([knightX-1, knightY+2]);
            }
        }
    };

    //right up/down
    if((knightX + 2) <= 8){
        //right
        if((knightY + 1) <= 8){
            for(piece of boardState){
                if((piece.locationX == knightX + 2) && (piece.locationY == knightY + 1)){
                    emptyTile = false;
                    if(piece.color != knight.color){
                        takeList.push([knightX+2, knightY+1]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([knightX+2, knightY+1]);
            }
        };

        if((knightY - 1) >=1){
            for(piece of boardState){
                if((piece.locationX == knightX + 2) && (piece.locationY == knightY - 1)){
                    emptyTile = false;
                    if(piece.color != knight.color){
                        takeList.push([knightX+2, knightY-1]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([knightX+2, knightY-1]);
            }
        }
    };

    //down left/right
    if((knightY -2) >=1){
        //right
        if((knightX + 1) <= 8){
            for(piece of boardState){
                if((piece.locationX == knightX + 1) && (piece.locationY == knightY - 2)){
                    emptyTile = false;
                    if(piece.color != knight.color){
                        takeList.push([knightX+1, knightY-2]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([knightX+1, knightY-2]);
            }
        };

        if((knightX - 1) >=1){
            for(piece of boardState){
                if((piece.locationX == knightX - 1) && (piece.locationY == knightY - 2)){
                    emptyTile = false;
                    if(piece.color != knight.color){
                        takeList.push([knightX-1, knightY-2]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([knightX-1, knightY-2]);
            }
        }
    };

    //left up/down
    if((knightX - 2) >=1){
        //right
        if((knightY + 1) <= 8){
            for(piece of boardState){
                if((piece.locationX == knightX - 2) && (piece.locationY == knightY + 1)){
                    emptyTile = false;
                    if(piece.color != knight.color){
                        takeList.push([knightX-2, knightY+1]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([knightX-2, knightY+1]);
            }
        };

        if((knightY - 1) >=1){
            for(piece of boardState){
                if((piece.locationX == knightX - 2) && (piece.locationY == knightY - 1)){
                    emptyTile = false;
                    if(piece.color != knight.color){
                        takeList.push([knightX-2, knightY-1]);
                    }
                }
            }
            if(emptyTile){
                moveList.push([knightX-2, knightY-1]);
            }
        }
    };

}

// export {pawnMove, kingMove, rookMove, bishopMove, queenMove, knightMove};