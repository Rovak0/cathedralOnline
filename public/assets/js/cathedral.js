const gameId = document.querySelector('#gameHolder');
const gameBoard = document.querySelector('#gameBoard');
const submitButton = document.querySelector("#submitMoveButton");

//         <ul id="gameActionList">
{/* <li><button id="submitMoveButton">Submit Move</button></li>
<li><button id="turnButton">Submit Piece Turn</button></li>
<li><button id="attackButton">Submit Attack</button></li>
</ul> */}
const actionList = document.querySelector('#gameActionList');
const moveButton = document.querySelector('#submitMoveButton');
const turnButton = document.querySelector('#turnButton');
const meleeAttackButton = document.querySelector('#attackButton');

//objects on the list at all times will be submit move, turn, and melee attack
    //actions will be greyed out if the move is illegal


//some constants in case I ever change things away from 8*8
const boardHeight = 8;
const boardWidth = 8;

//imports are wrong on the front end
//these are copied from pieceRules.js
function pawnMove(pawn, boardState){
    tester();
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
};

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
};

//rooks
function rookMove(rook, boardState){
    const rookX = rook.locationX;
    const rookY = rook.locationY;
    let moveCap = rook.moveCap;

    const moveList = [];
    const takeList = [];

    //go in straight lines until collision or off the board
    let run = true;
    let tracker = 0;
    while(run){
        //tracker is how far the rook has moved
        tracker++;
        //use the tracker to check for move cap as well
        if(tracker > moveCap){
            break;
        }
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
        if(tracker > moveCap){
            break;
        }
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
        if(tracker > moveCap){
            break;
        }
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
        if(tracker > moveCap){
            break;
        }
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

    return [moveList, takeList];
};

//bishop move
function bishopMove(bishop, boardState){
    const bishX = bishop.locationX;
    const bishY = bishop.locationY;
    let moveCap = bishop.moveCap;

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
        //use the absolute value of trackers to check for move cap
        if(Math.abs(xTracker) > moveCap){
            break;
        }
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
        if(Math.abs(xTracker) > moveCap){
            break;
        }
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
        if(Math.abs(xTracker) > moveCap){
            break;
        }
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
        if(Math.abs(xTracker) > moveCap){
            break;
        }
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

    return [moveList, takeList];
};


//queen move
function queenMove(queen, boardState){
    const rookSide = rookMove(queen, boardState, queen.moveCap);
    const bishSide = bishopMove(queen, boardState, queen.moveCap);

    const moveList = rookSide[0].concat(bishSide[0]);
    const takeList = rookSide[1].concat(bishSide[1]);

    return [moveList, takeList];
};

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

    return [moveList, takeList];
};


//make a line of sight function to centralize all line of sight calculations
//line of sight does not handle facing, because it gives all 8 directions
    //it is up to the functions that use line of sight to handle facing
async function lineOfSight(distance, origin){
    //distance is how long the line is
    //origin will be fed in as [x,y] pair
    //return will be what it can hit
    // let fullBoard = (await getBoard());
    let fullBoard = pageBoard;
    board = fullBoard.returnBoardState;
    
    let hitList = [];
    let tracer = 0;
    //running is here to break out of the while loop
    let running = true;
    //straight line up
    while((origin[1] + tracer) <= boardHeight){
        tracer++;
        if(tracer > distance){
            break;
        }
        if(!running){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[1])){
                if(piece.locationY == (origin[0] + tracer)){
                    hitList.push(piece);
                    running = false;
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;
    running = true;
    //up and right
    while(((origin[0] + tracer) <= boardWidth) && ((origin[1] + tracer) <= boardHeight)){
        tracer++;
        if(tracer > distance){
            break;
        }
        if(!running){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] + tracer)){
                if(piece.locationY == (origin[1] + tracer)){
                    hitList.push(piece);
                    running = false;
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    running = true;
    tracer = 0;
    //right
    while(((origin[0] + tracer) <= boardWidth)){
        tracer++;
        if(tracer > distance){
            break;
        }
        if(!running){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] + tracer)){
                if(piece.locationY == (origin[1])){
                    hitList.push(piece);
                    running = false;
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    running = true;
    tracer = 0;
    //down and right
    while(((origin[0] + tracer) <= boardHeight) && ((origin[1] - tracer) > 0)){
        tracer++;
        if(tracer > distance){
            break;
        }
        if(!running){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] + tracer)){
                if(piece.locationY == (origin[1] - tracer)){
                    hitList.push(piece);
                    running = false;
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    running = true;
    tracer = 0;
    //down
    while(((origin[1] - tracer) > 0)){
        tracer++;
        if(tracer > distance){
            break;
        }
        if(!running){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0])){
                if(piece.locationY == (origin[1] - tracer)){
                    hitList.push(piece);
                    running = false;
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    running = true;
    tracer = 0;
    //down and left
    while(((origin[0] - tracer) > 0) && ((origin[1] - tracer) > 0)){
        tracer++;
        if(tracer > distance){
            break;
        }
        if(!running){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] - tracer)){
                if(piece.locationY == (origin[1] - tracer)){
                    hitList.push(piece);
                    running = false;
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    running = true;
    tracer = 0;
    //left
    while(((origin[0] - tracer) > 0)){
        tracer++;
        if(tracer > distance){
            break;
        }
        if(!running){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] - tracer)){
                if(piece.locationY == (origin[1])){
                    hitList.push(piece);
                    running = false;
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    running = true;
    tracer = 0;
    //left and up
    while(((origin[0] - tracer) > 0) && ((origin[1] + tracer) <= boardHeight)){
        tracer++;
        if(tracer > distance){
            break;
        }
        if(!running){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] - tracer)){
                if(piece.locationY == (origin[1] + tracer)){
                    hitList.push(piece);
                    running = false;
                    break;
                }
            }
        }
    }

    return hitList;
}

async function pierceLOS(distance, origin){
        //distance is how long the line is
    //origin will be fed in as [x,y] pair
    //return will be what it can hit
    // let fullBoard = (await getBoard());
    let fullBoard = pageBoard;
    board = fullBoard.returnBoardState;
    
    let hitList = [];
    tracer = 0;
    //straight line up
    while((origin[1] + tracer) <= boardHeight){
        tracer++;
        if(tracer > distance){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[1] + tracer)){
                if(piece.locationY == (origin[0])){
                    hitList.push(piece);
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;
    //up and right
    while(((origin[0] + tracer) <= boardWidth) && ((origin[1] + tracer) <= boardHeight)){
        tracer++;
        if(tracer > distance){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] + tracer)){
                if(piece.locationY == (origin[1] + tracer)){
                    hitList.push(piece);
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;
    //right
    while(((origin[0] + tracer) <= boardWidth)){
        tracer++;
        if(tracer > distance){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] + tracer)){
                if(piece.locationY == (origin[1])){
                    hitList.push(piece);
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;
    //down and right
    while(((origin[0] + tracer) <= boardHeight) && ((origin[1] - tracer) > 0)){
        tracer++;
        if(tracer > distance){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] + tracer)){
                if(piece.locationY == (origin[1] - tracer)){
                    hitList.push(piece);
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;
    //down
    while(((origin[1] - tracer) > 0)){
        tracer++;
        if(tracer > distance){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0])){
                if(piece.locationY == (origin[1] - tracer)){
                    hitList.push(piece);
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;
    //down and left
    while(((origin[0] - tracer) > 0) && ((origin[1] - tracer) > 0)){
        tracer++;
        if(tracer > distance){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] - tracer)){
                if(piece.locationY == (origin[1] - tracer)){
                    hitList.push(piece);
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;
    //left
    while(((origin[0] - tracer) > 0)){
        tracer++;
        if(tracer > distance){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] - tracer)){
                if(piece.locationY == (origin[1])){
                    hitList.push(piece);
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;
    //left and up
    while(((origin[0] - tracer) > 0) && ((origin[1] + tracer) <= boardHeight)){
        tracer++;
        if(tracer > distance){
            break;
        }
        for(piece of board){
            if(piece.locationX == (origin[0] - tracer)){
                if(piece.locationY == (origin[1] + tracer)){
                    hitList.push(piece);
                    break;
                }
            }
        }
    }
    //reset the tracer between lines
    tracer = 0;

    return hitList;
}

function findTile(target){
    //this function turns the locationX and locationY of a piece into the tile the piece is on
    //target is [x,y] coordinates from pieces
        //pieces are on tiles 1-8 because chess
    let rowList;
    //for some reason, it only works in a for loop
    // not really a for loop because there is 1 child
        // idk man
    for(kid of gameBoard.children){
        rowList = kid.children;
    }

    //the [x,y] is one more than the index
    let targetRow = rowList[target[0] -1];
    let targetTile = targetRow[target[1] -1];
    return targetTile;
}

//this function will find the content of the tile (if any)
function findContent(tile){
    //the function will be fed a tile
    //the tile can't just be asked if it has a piece on it
    //it does know its id
    //and all tile with pieces have an image attached to them
    //go find out if there is an image attached to them, and use x,y to find the piece
    let indexX = tile.id[4];
    let indexY = tile.id[5];
    let tileImage = document.querySelector(`#img${indexX}${indexY}`);
    if(!tileImage){
        return 0;
    }
    let fullBoard = pageBoard;
    board = fullBoard.returnBoardState;
    for(piece of board){
        if(piece.locationX == indexX){
            if(piece.locationY == indexY){
                return piece;
            }
        }
    }
    return -1;
}


function meleeAttack(attacker, blocker){
    //will be fed the attacker and blocker pieces
    //needs to resolve legality
    //will be part of the attackButtonHandler
    //needs to check if the pieces are within range, and if the attacker is facing the right direction

    //returns are 0, 1, 2 for illegal, normal, backstabbing

    //attacker - blocker means that positive is to the left, and negative is to the right
    let distanceX = attacker.locationX - blocker.locationX;
    if((distanceX < -1) || (distanceX > 1)){
        return 0;
    }
    let distanceY = attacker.locationY - blocker.locationY;
    if((distanceY < -1) || (distanceY > 1)){
        return 0;
    }

    //the pieces are next to each other, now to handle facing
    //just find out if it illegal
        //backstabbing means there is a step after this
    switch(distanceX){
        case(-1):
            switch(distanceY){
                case(-1):
                    switch(attacker.direction){
                        case(4):
                            return 0;
                            break;
                        case(5):
                            return 0;
                            break;
                        case(6):
                            return 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case(0):
                    switch(attacker.direction){
                        case(5):
                            return 0;
                            break;
                        case(6):
                            return 0;
                            break;
                        case(7):
                            return 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case(1):
                    switch(attacker.direction){
                        case(0):
                            return 0;
                            break;
                        case(6):
                            return 0;
                            break;
                        case(7):
                            return 0;
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            break;
            
        case(0):
            switch(distanceY){
                case(-1):
                    switch(attacker.direction){
                        case(3):
                            return 0;
                            break;
                        case(4):
                            return 0;
                            break;
                        case(5):
                            return 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case(1):
                    switch(attacker.direction){
                        case(0):
                            return 0;
                            break;
                        case(1):
                            return 0;
                            break;
                        case(7):
                            return 0;
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            break;
        
        case(1):
        switch(distanceY){
            case(-1):
                switch(attacker.direction){
                    case(2):
                        return 0;
                        break;
                    case(3):
                        return 0;
                        break;
                    case(4):
                        return 0;
                        break;
                    default:
                        break;
                }
                break;
            case(0):
                switch(attacker.direction){
                    case(1):
                        return 0;
                        break;
                    case(2):
                        return 0;
                        break;
                    case(3):
                        return 0;
                        break;
                    default:
                        break;
                }
                break;
            case(1):
                switch(attacker.direction){
                    case(0):
                        return 0;
                        break;
                    case(1):
                        return 0;
                        break;
                    case(2):
                        return 0;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        break;
    }

    //now for backstabbing
    //if the target and the attacker are within 1 direction point, backstab
    //also 0 and 7 backstab each other
    switch(attacker.direction){
        case(0):
            if(blocker.direction == 7){
                return 2;
            }
            else{
                if(Math.abs(attacker.direction - blocker.direction) <= 1){
                    return 2;
                }
                else{
                    return 1;
                }
            }
            break;
        case(7):
            if(blocker.direction == 0){
                return 2;
            }
            else{
                if(Math.abs(attacker.direction - blocker.direction) <= 1){
                    return 2;
                }
                else{
                    return 1;
                }
            }
            break;
        default:
            if(Math.abs(attacker.direction - blocker.direction) <= 1){
                return 2;
            }
            else{
                return 1;
            }
            break;
    }

}

function rangedAttack(attacker, blocker){
    let hitList = lineOfSight(attacker.attackRan, [attacker.locationX, attacker.locationY]);
    for(piece of hitList){
        if(piece.id == blocker.id){
            return 1;
        }
    }
    return 0;
}

//spell functions
async function fireBall(caster, target){
    //the cast gives distance and origin
        //origin from the caster itself, distance from the spell
    if(caster.name != "wizard"){
        //not legal
        return 0;
    };
    let hitList = lineOfSight(3, [caster.locationX, caster.locationY]);
    //the hitList gives full pieces, doesn't always work on matching with sql
        //meta data messes it up server side
    for(piece of hitList){
        if(piece.id == target.id){
            //target hits, it's legal.  Return 1
            return 1;
        }
    }
    //if no piece is the target, return illegal
    return 0;
}

async function blessedBolt(caster, target){
    //the cast gives distance and origin
        //origin from the caster itself, distance from the spell
    if(caster.name != "cleric"){
        //not legal
        return 0;
    };
    let hitList = lineOfSight(2, [caster.locationX, caster.locationY]);
    //the hitList gives full pieces, doesn't always work on matching with sql
        //meta data messes it up server side
    for(piece of hitList){
        if(piece.id == target.id){
            //target hits, it's legal.  Return 1
            return 1;
        }
    }
    //if no piece is the target, return illegal
    return 0;
}

async function heal(caster, target){
    //the cast gives distance and origin
        //origin from the caster itself, distance from the spell
    if(caster.name != "cleric"){
        //not legal
        return 0;
    };
    let hitList = lineOfSight(2, [caster.locationX, caster.locationY]);
    //the hitList gives full pieces, doesn't always work on matching with sql
        //meta data messes it up server side
    for(piece of hitList){
        if(piece.id == target.id){
            //target hits, it's legal.  Return 1
            return 1;
        }
    }
    //if no piece is the target, return illegal
    return 0;
}

async function trade(caster, target){
    //the cast gives distance and origin
        //origin from the caster itself, distance from the spell
    if(caster.name != "cleric"){
        //not legal
        return 0;
    };
    let hitList = lineOfSight(8, [caster.locationX, caster.locationY]);
    //the hitList gives full pieces, doesn't always work on matching with sql
        //meta data messes it up server side
    for(piece of hitList){
        if(piece.id == target.id){
            //target hits, it's legal.  Return 1
            return 1;
        }
    }
    //if no piece is the target, return illegal
    return 0;
}

// create my session variables
// sessionStorage.setItem("logged_in", false);
// sessionStorage.setItem("user_id", false);

let loggedIn = sessionStorage.getItem('logged_in');
let user = sessionStorage.getItem('user_id');


// for each square, it will needs its own event listner

let selectedList = [];

//make a list of lists to use during board reset
const resetList = [
    [
        "a8",
        "b8",
        "c8",
        "d8",
        "e8",
        "f8",
        "g8",
        "h8"
    ],
    [
        "a7",
        "b7",
        "c7",
        "d7",
        "e7",
        "f7",
        "g7",
        "h7"
    ],
    [
        "a6",
        "b6",
        "c6",
        "d6",
        "e6",
        "f6",
        "g6",
        "h6"
    ],
    [
        "a5",
        "b5",
        "c5",
        "d5",
        "e5",
        "f5",
        "g5",
        "h5"
    ],
    [
        "a4",
        "b4",
        "c4",
        "d4",
        "e4",
        "f4",
        "g4",
        "h4"
    ],
    [
        "a3",
        "b3",
        "c3",
        "d3",
        "e3",
        "f3",
        "g3",
        "h3"
    ],
    [
        "a2",
        "b2",
        "c2",
        "d2",
        "e2",
        "f2",
        "g2",
        "h2"
    ],
    [
        "a1",
        "b1",
        "c1",
        "d1",
        "e1",
        "f1",
        "g1",
        "h1"
    ],
]

let pageBoard;
let board;
let boardId;

//make a function that queries the server for the board state and returns 3 objects, boardData, boardState, and opponent
async function getBoard () {
    const boardState = await fetch("/api/board", {
        method: 'POST',
        body: JSON.stringify({"user": user}),
        headers: { 'Content-Type': 'application/json' }
    })

    if (boardState.ok){

        let parsedString
        for await(const chunk of boardState.body){
            let decodedString = new TextDecoder().decode(chunk);
            parsedString = JSON.parse(decodedString);

        }
        return parsedString;
        // return boardState;
    }
    else{
        return -1;
    }

};

// window.onload = getBoard();
// let myBoard = getBoard();

//attach a listener to each tile of the board to handle selection
for (kid of gameBoard.children){
    for (child of kid.children){
        for(square of child.cells){
            const tile = document.querySelector(`#${square.id}`);
            // square.style.backgroundColor = "blue";
            tile.addEventListener('click', function () {
                //removing from selection
                // let classes = [tile.classList];
                let selected = false;
                for(classCs of tile.classList){
                    if(classCs == "selected"){
                        //find out if the tile is selected
                        selected = true;
                    }
                }
                //if selected, reset to original color and remove from list
                if(selected){
                    if(tile.classList[0] == "white"){
                        tile.style.backgroundColor = "white";
                    }
                    else{
                        //this is the color code for my black tiles
                        tile.style.backgroundColor = "rgb(72, 70, 70)";
                    }
                    tile.classList.remove("selected");
                    // if deselecting, remove the item from the select list
                    for (index in selectedList){
                        if(selectedList[index] == tile){ //.id
                            selectedList.splice(index, 1);
                        }
                    };
                }
                //adding to selection
                else{
                    tile.classList.add("selected");
                    tile.style.backgroundColor = "lightblue";
                    //add the item to the select list
                    selectedList.push(tile); //.id
                    // check if there are more than 2 entries
                    if(selectedList.length > 2){
                        //clear the first entry
                        //grab the tile based on it's stored id
                        const clearTile = selectedList[0]; //document.querySelector(`#${selectedList[0]}`);
                        // clearTile.style.backgroundColor = "white";
                        if(clearTile.classList[0] == "white"){
                            clearTile.style.backgroundColor = "white";
                        }
                        else{
                            clearTile.style.backgroundColor = "rgb(72, 70, 70)";
                        }
                        selectedList.splice(0, 1);
                    }
                }
                // i have access to the square id value
                
                //find the piece in the selected list index 0
                if(selectedList.length > 0){
                    if(selectedList[0]){
                        //x and y are selcetedList[0][5] and selectedList[0][6]
                        // i know that there are either 2 or three entries on the classList
                        //if 2, then no piece
                        if(selectedList[0].classList.length >= 3){
                            // let pieceName;
                            let selectedPiece = findContent(selectedList[0]);
                            //TODO create the buttons and add the event listeners

                            //made redundent by findContent function
                            // for(piece of board){
                            //     if(piece.locationY == selectedList[0].id[5]){
                            //         //char ints and ints evaluate as equal
                            //         if(piece.locationX == selectedList[0].id[4]){
                            //             selectedPiece = piece;
                            //         }
                            //     }
                            // }

                            ////////
                            //run the piece through a switch case to give it the right function
                            if(selectedPiece){
                                let colorSet;
                                
                                switch(selectedPiece.moveType){
                                    case("bishop"):
                                        colorSet = bishopMove(selectedPiece, board);
                                        break;
                                    case("pawn"):
                                        colorSet = pawnMove(selectedPiece, board);
                                        break;
                                    case("rook"):
                                        colorSet = rookMove(selectedPiece, board);
                                        break;
                                    case("knight"):
                                        colorSet = knightMove(selectedPiece, board);
                                        break;
                                    case("king"):
                                        colorSet = kingMove(selectedPiece, board);
                                        break;
                                    case("queen"):
                                        colorSet = queenMove(selectedPiece, board);
                                        break;
                                    default:
                                        break;
                                }

                            }
                            

                        }
                    }
                }

            })
        }
    }
};

//load each piece into its tile
//make it a function because it will be used later
async function loadBoard () {
    // let fullBoard = (await getBoard());
    //full board was a variable at the start of creation, but has been removed to minimized server requests
    let fullBoard = pageBoard;
    board = fullBoard.returnBoardState;
    boardId = fullBoard.boardData.id;
    let boardState = fullBoard.returnBoardState;
    let pieceX;
    let pieceY;
    let rowList;
    //for some reason, it only works in a for loop
    for(kid of gameBoard.children){
        rowList = kid.children;
    }
    //reset the board
    //use the indexs to move through the resetList
    let indexX = 0;
    let indexY = 0;
    let tileImage;
    for(child of rowList){
        for(kid of child.children){
            kid.textContent = resetList[indexX][indexY];

            tileImage = document.querySelector(`#img${indexX}${indexY}`);
            if(tileImage){
                tileImage.parentElement.removeChild(tileImage);
            }
            tileImage = null;
            //if there is an image, clear it
            // tileImage = document.getElementById()

            //remove all piece classes
            //there can be 1, 2, or 3 classes
            //1 is always color of tile
            //2 can be either "selected" or a piece
            if(kid.classList.length > 1){
                //leave selected
                if(kid.classList[1] == "selected"){
                    if(kid.classList.length == 3){
                        //remove index 3
                        //classList remove takes a name, not an index
                        kid.classList.remove(kid.classList[2]);
                    }
                }
                else{
                    //if not selected, remove index 1
                    kid.classList.remove(kid.classList[1]);
                }
            }

            indexY++;
        }
        indexY = 0;
        indexX++;
    }

    //declaring these variables outside of the for loop for memory
    let column;
    let tile;
    let imageId;
    for(piece of boardState){
        // go through each piece and read there coords
        // then compare it to the tile id [4]/[5] to place them
        pieceX = piece.locationX;
        pieceY = piece.locationY;

        column = rowList[7- (pieceY-1)];
        tile = (column.children)[pieceX-1];
        
        //I have the tile and I have the piece
        // run the piece through a switch case to place the right thing into the tile

        //make the image element that will be attached to the tile
        //give the image an id that is its x/y coords
        imageId = `${pieceX-1}${pieceY-1}`;
        let pieceImage = document.createElement("img");
        // pieceImage.setAttribute(id, `${imageId}`);
        pieceImage.id = `img${imageId}`;
        pieceImage.classList.add("responsive");

        switch(piece.name){
            case("pawn"):
                if(piece.color == 'white'){
                    pieceImage.src = './assets/images/white-pawn.png';
                }
                else if(piece.color == 'black'){
                    pieceImage.src = './assets/images/black-pawn.png';
                }
                tile.textContent="";
                tile.appendChild(pieceImage);
                //giving the tile the class of piece name lets me reference it for movement
                tile.classList.add("pawn");
                break;
            case("rook"):
                if(piece.color == 'white'){
                    pieceImage.src = './assets/images/white-rook.png';
                }
                else if(piece.color == 'black'){
                    pieceImage.src = './assets/images/black-rook.png';
                }
                tile.textContent="";
                tile.appendChild(pieceImage);
                tile.classList.add("rook");
                break;
            case("knight"):
                if(piece.color == 'white'){
                    pieceImage.src = './assets/images/white-knight.png';
                }
                else if(piece.color == 'black'){
                    pieceImage.src = './assets/images/black-knight.png';
                }
                tile.textContent="";
                tile.appendChild(pieceImage);
                tile.classList.add("knight");
                break;
            case("bishop"):
                if(piece.color == 'white'){
                    pieceImage.src = './assets/images/white-bishop.png';
                }
                else if(piece.color == 'black'){
                    pieceImage.src = './assets/images/black-bishop.png';
                }
                tile.textContent="";
                tile.appendChild(pieceImage);
                tile.classList.add("bishop");
                break;
            case("queen"):
                if(piece.color == 'white'){
                    pieceImage.src = './assets/images/white-queen.png';
                }
                else if(piece.color == 'black'){
                    pieceImage.src = './assets/images/black-queen.png';
                }
                tile.textContent="";
                tile.appendChild(pieceImage);
                tile.classList.add("queen");
                break;
            case("king"):
                if(piece.color == 'white'){
                    pieceImage.src = './assets/images/white-king.png';
                }
                else if(piece.color == 'black'){
                    pieceImage.src = './assets/images/black-king.png';
                }
                tile.textContent="";
                tile.appendChild(pieceImage);
                tile.classList.add("king");
                break;
            case("warrior"):
                if(piece.color == 'white'){
                    pieceImage.src = './assets/images/white-warrior.png';
                }
                else if(piece.color == 'black'){
                    pieceImage.src = './assets/images/black-warrior.png';
                }
                tile.textContent="";
                tile.appendChild(pieceImage);
                tile.classList.add("warrior");
                break;
            case("ranger"):
                if(piece.color == 'white'){
                    pieceImage.src = './assets/images/white-ranger.png';
                }
                else if(piece.color == 'black'){
                    pieceImage.src = './assets/images/black-ranger.png';
                }
                tile.textContent="";
                tile.appendChild(pieceImage);
                tile.classList.add("ranger");
                break;
            default:
                break;        
        }


    }
}

//event handler functions
async function submitButtonHandler(event){
    // need to collect the data from the cells and bundle them into a json packet
    // need to then send the json packet 
    // then wait for a response
    event.preventDefault();
    if(selectedList.length !=2){
        console.log("Not the right number of tiles");
        return;
    }
    // const myRequest = PORT + "/api/board";
    // const boardRequest = await fetch(myRequest, {

    //make the submitted move and the piece id parts
    //selected list is a list holding strings, so to get the x/y grab the chars at index's 4/5
    let submittedMove = [selectedList[1].id[4], selectedList[1].id[5]];
    let startingMove = [selectedList[0].id[4], selectedList[0].id[5]];
    // the piece id cannot be saved on this side
    // the backend must find the piece based off of the submitted move

    const boardRequest = await fetch("/api/pieces/move", {
        method: 'POST',
        body: JSON.stringify({"boardId": boardId, "startingMove" : startingMove, "submittedMove": submittedMove, "playerId": user}),
        headers: { 'Content-Type': 'application/json' }
    });
    if(boardRequest.ok) {
        let color = true;
        for(tile of selectedList){
            //tile is the id of the tile, not the tile itself
            color = true;
            for(className of tile.classList){
                if(className == "white"){
                    color = false;
                    tile.style.backgroundColor = "white";
                }
            }
            if(color == true){
                tile.style.backgroundColor = "rgb(72, 70, 70)";
            }
            // tile
        }
        selectedList = []
        loadBoard();
    }
    else{
        console.log("fail move piece");
    }
}

async function fireballHandler(event){
    //the caster is the selectedList[0] and the target is selectedList[1]
    event.preventDefault();
    if(selectedList.length !=2){
        console.log("Not the right number of tiles");
        return;
    }
    if(findContent(selectedList[1]) == 0){
        console.log("Fireball must have a target");
        return;
    }

    const boardRequest = await fetch("/api/pieces/fireball", {
        method: 'POST',
        body: JSON.stringify({"boardId": boardId, "attackerId" : selectedList[0].id, "blockerId": selectedList[1].id, "playerId": user}),
        headers: { 'Content-Type': 'application/json' }
    });
    if(boardRequest.ok) {
        let color = true;
        for(tile of selectedList){
            //tile is the id of the tile, not the tile itself
            color = true;
            for(className of tile.classList){
                if(className == "white"){
                    color = false;
                    tile.style.backgroundColor = "white";
                }
            }
            if(color == true){
                tile.style.backgroundColor = "rgb(72, 70, 70)";
            }
            // tile
        }
        selectedList = []
        loadBoard();
    }
    else{
        console.log("fail fireball");
    }

}

async function lightningBoltHandler(event){
    //the caster is the selectedList[0] and the target is selectedList[1]
    event.preventDefault();
    if(selectedList.length !=2){
        console.log("Not the right number of tiles");
        return;
    }
    if(findContent(selectedList[1]) == 0){
        console.log("Spell must have a target");
        return;
    }

    const boardRequest = await fetch("/api/pieces/lightningBolt", {
        method: 'POST',
        body: JSON.stringify({"boardId": boardId, "attackerId" : selectedList[0].id, "blockerId": selectedList[1].id, "playerId": user}),
        headers: { 'Content-Type': 'application/json' }
    });
    if(boardRequest.ok) {
        let color = true;
        for(tile of selectedList){
            //tile is the id of the tile, not the tile itself
            color = true;
            for(className of tile.classList){
                if(className == "white"){
                    color = false;
                    tile.style.backgroundColor = "white";
                }
            }
            if(color == true){
                tile.style.backgroundColor = "rgb(72, 70, 70)";
            }
            // tile
        }
        selectedList = []
        loadBoard();
    }
    else{
        console.log("fail to magic");
    }

}

async function healHandler(event){
    //the caster is the selectedList[0] and the target is selectedList[1]
    event.preventDefault();
    if(selectedList.length !=2){
        console.log("Not the right number of tiles");
        return;
    }
    if(findContent(selectedList[1]) == 0){
        console.log("Spell must have a target");
        return;
    }

    const boardRequest = await fetch("/api/pieces/heal", {
        method: 'POST',
        body: JSON.stringify({"boardId": boardId, "attackerId" : selectedList[0].id, "blockerId": selectedList[1].id, "playerId": user}),
        headers: { 'Content-Type': 'application/json' }
    });
    if(boardRequest.ok) {
        let color = true;
        for(tile of selectedList){
            //tile is the id of the tile, not the tile itself
            color = true;
            for(className of tile.classList){
                if(className == "white"){
                    color = false;
                    tile.style.backgroundColor = "white";
                }
            }
            if(color == true){
                tile.style.backgroundColor = "rgb(72, 70, 70)";
            }
            // tile
        }
        selectedList = []
        loadBoard();
    }
    else{
        console.log("fail to magic");
    }

}

async function blessedBoltHandler(event){
    //the caster is the selectedList[0] and the target is selectedList[1]
    event.preventDefault();
    if(selectedList.length !=2){
        console.log("Not the right number of tiles");
        return;
    }
    if(findContent(selectedList[1]) == 0){
        console.log("Spell must have a target");
        return;
    }

    const boardRequest = await fetch("/api/pieces/blessedBolt", {
        method: 'POST',
        body: JSON.stringify({"boardId": boardId, "attackerId" : selectedList[0].id, "blockerId": selectedList[1].id, "playerId": user}),
        headers: { 'Content-Type': 'application/json' }
    });
    if(boardRequest.ok) {
        let color = true;
        for(tile of selectedList){
            //tile is the id of the tile, not the tile itself
            color = true;
            for(className of tile.classList){
                if(className == "white"){
                    color = false;
                    tile.style.backgroundColor = "white";
                }
            }
            if(color == true){
                tile.style.backgroundColor = "rgb(72, 70, 70)";
            }
            // tile
        }
        selectedList = []
        loadBoard();
    }
    else{
        console.log("fail to magic");
    }

}

async function transferHandler(event){
    //the caster is the selectedList[0] and the target is selectedList[1]
    event.preventDefault();
    if(selectedList.length !=2){
        console.log("Not the right number of tiles");
        return;
    }
    if(findContent(selectedList[1]) == 0){
        console.log("Spell must have a target");
        return;
    }

    const boardRequest = await fetch("/api/pieces/transfer", {
        method: 'POST',
        body: JSON.stringify({"boardId": boardId, "attackerId" : selectedList[0].id, "blockerId": selectedList[1].id, "playerId": user}),
        headers: { 'Content-Type': 'application/json' }
    });
    if(boardRequest.ok) {
        let color = true;
        for(tile of selectedList){
            //tile is the id of the tile, not the tile itself
            color = true;
            for(className of tile.classList){
                if(className == "white"){
                    color = false;
                    tile.style.backgroundColor = "white";
                }
            }
            if(color == true){
                tile.style.backgroundColor = "rgb(72, 70, 70)";
            }
            // tile
        }
        selectedList = []
        loadBoard();
    }
    else{
        console.log("fail to magic");
    }

}

async function iceWaveHandler(event){
    //the caster is the selectedList[0] and the target is selectedList[1]
    event.preventDefault();
    if(selectedList.length !=2){
        console.log("Not the right number of tiles");
        return;
    }
    if(findContent(selectedList[1]) == 0){
        console.log("Spell must have a target");
        return;
    }

    const boardRequest = await fetch("/api/pieces/iceWave", {
        method: 'POST',
        body: JSON.stringify({"boardId": boardId, "attackerId" : selectedList[0].id, "blockerId": selectedList[1].id, "playerId": user}),
        headers: { 'Content-Type': 'application/json' }
    });
    if(boardRequest.ok) {
        let color = true;
        for(tile of selectedList){
            //tile is the id of the tile, not the tile itself
            color = true;
            for(className of tile.classList){
                if(className == "white"){
                    color = false;
                    tile.style.backgroundColor = "white";
                }
            }
            if(color == true){
                tile.style.backgroundColor = "rgb(72, 70, 70)";
            }
            // tile
        }
        selectedList = []
        loadBoard();
    }
    else{
        console.log("fail to magic");
    }

}

//handle the submit button
submitButton.addEventListener('click', submitButtonHandler);


//these are the things that run on load or continously
//user is a string
if(user != 'false'){
    loadBoard();
}

//run the board load every second
setInterval(async function() {
    //comment out the loadboard call to stop sending requests during development
    if(user != 'false'){
        pageBoard = (await getBoard());
        loadBoard();
    }
}, 1000);