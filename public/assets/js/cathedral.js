const gameId = document.querySelector('#gameHolder');
const gameBoard = document.querySelector('#gameBoard');
const submitButton = document.querySelector("#submitMoveButton");

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

    return [moveList, takeList];
};

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

    return [moveList, takeList];
};


//queen move
function queenMove(queen, boardState){
    const rookSide = rookMove(queen, boardState);
    const bishSide = bishopMove(queen, boardState);

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

let board;
let boardId;
// user = 1;

// const tester = "abc";

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
                        selected = true;
                    }
                }
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
                        if(selectedList[0].classList.length == 3){
                            // let pieceName;
                            let selectedPiece;
                            // if(selectedList[0].classList[1] == "selected"){
                            //     pieceName = selectedList[0].classList[2];
                            // }
                            // else{
                            //     pieceName = selectedList[0].classList[1];
                            // }
                            //now to find the piece based off of x and y


                            for(piece of board){
                                if(piece.locationY == selectedList[0].id[5]){
                                    //char ints and ints evaluate as equal
                                    if(piece.locationX == selectedList[0].id[4]){
                                        selectedPiece = piece;
                                    }
                                }
                            }

                            ////////
                            //run the piece through a switch case to give it the right function
                            if(selectedPiece){
                                
                                // if(selectedPiece.name == "bishop"){
                                    //     colorSet = bishopMove(selectedPiece, board);
                                    // }
                                    // else if(selectedPiece.name == "pawn"){
                                        //     colorSet = pawnMove(selectedPiece, board);
                                        // }
                                        // else if(selectedPiece.name == "rook"){
                                            //     colorSet = rookMove(selectedPiece, board);
                                            // }
                                            // else if(selectedPiece.name == "knight"){
                                                //     colorSet = knightMove(selectedPiece, board);
                                                // }
                                                // else if(selectedPiece.name == "queen"){
                                //     colorSet = queenMove(selectedPiece, board);
                                // }
                                // else if(selectedPiece.name == "king"){
                                    //     colorSet = kingMove(selectedPiece, board);
                                    // }

                                let colorSet;
                                
                                switch(selectedPiece.name){
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

                                console.log(colorSet);

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
    let fullBoard = (await getBoard());
    board = fullBoard.returnBoardState;
    boardId = fullBoard.boardData.id;
    // console.log(fullBoard.boardData);
    // console.log(fullBoard.boardData.player_id1);
    // console.log(user);
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


//handle the submit button
submitButton.addEventListener('click', submitButtonHandler);


//these are the things that run on load or continously
//user is a string
if(user != 'false'){
    loadBoard();
}

//run the board load every second
setInterval(function() {
    //comment out the loadboard call to stop sending requests during development
    if(user != 'false'){
        loadBoard();
    }
}, 1000);