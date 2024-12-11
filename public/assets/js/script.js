const gameId = document.querySelector('#gameHolder');
const gameBoard = document.querySelector('#gameBoard');
const submitButton = document.querySelector("#submitMoveButton");

const loginForm = document.querySelector("#loginForm");
const loginButton = document.querySelector("#loginSubmitButton");
const loginUsername = document.querySelector("#usernameBox");
const loginPassword = document.querySelector("#passwordBox");


// console.log(loginForm);
// console.log(loginButton);

// create my session variables
sessionStorage.setItem("logged_in", false);
sessionStorage.setItem("user_id", false);

let loggedIn = sessionStorage.getItem('logged_in');
console.log(loggedIn);

//process.env.PORT || 
const PORT = "http://localhost:3001";
//http://localhost:3001/api/board

// for each square, it will needs its own event listner

const selectedList = [];

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

let user;
let board;
user = 1;

// const tester = "abc";
// console.log(tester[0]);

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
            // console.log(chunk);
            let decodedString = new TextDecoder().decode(chunk);
            // console.log(decodedString);
            parsedString = JSON.parse(decodedString);
            // console.log(parsedString);

        }
        return parsedString;
        // return boardState;
    }
    else{
        return -1;
    }

};

// window.onload = getBoard();
let myBoard = getBoard();

//attach a listener to each tile of the board to handle selection
for (kid of gameBoard.children){
    // console.log(kid);
    for (child of kid.children){
        // console.log(child);
        // console.log(child.cells);
        for(square of child.cells){
            // console.log(square.id);
            const tile = document.querySelector(`#${square.id}`);
            // console.log(tile.id);
            // square.style.backgroundColor = "blue";
            tile.addEventListener('click', function () {
                // console.log(tile.style.backgroundColor);
                if(tile.style.backgroundColor == "lightblue"){
                    // console.log("Currently blue");
                    tile.style.backgroundColor = "white";
                    // if deselecting, remove the item from the select list
                    for (index in selectedList){
                        if(selectedList[index] == tile.id){
                            // console.log("hit");
                            selectedList.splice(index, 1);
                            // console.log(selectedList);
                        }

                    };
                }
                else{
                    tile.style.backgroundColor = "lightblue";
                    //add the item to the select list
                    selectedList.push(tile.id);
                    // check if there are more than 2 entries
                    if(selectedList.length > 2){
                        // console.log(selectedList.length);
                        //clear the first entry
                        //grab the tile based on it's stored id
                        const clearTile = document.querySelector(`#${selectedList[0]}`);
                        // console.log(clearTile);
                        clearTile.style.backgroundColor = "white";
                        selectedList.splice(0, 1);
                    }
                    console.log(selectedList);
                }
                // i have access to the square id value
            })
        }
    }
};

//load each piece into its tile
//make it a function because it will be used later
async function loadBoard () {
    let fullBoard = (await getBoard());
    // console.log(fullBoard.boardData.id);
    board = fullBoard.boardData.id;
    let boardState = fullBoard.returnBoardState;
    // console.log(boardState.returnBoardState);
    // console.log(boardState);
    let pieceX;
    let pieceY;
    let rowList;
    //for some reason, it only works in a for loop
    for(kid of gameBoard.children){
        rowList = kid.children;
    }
    // console.log(rowList);
    //reset the board
    //use the indexs to move through the resetList
    let indexX = 0;
    let indexY = 0;
    for(child of rowList){
        // console.log(child.children);
        for(kid of child.children){
            // console.log(kid);
            kid.textContent = resetList[indexX][indexY];
            indexY++;
        }
        indexY = 0;
        indexX++;
    }

    //declaring these variables outside of the for loop for memory
    let column;
    let tile;
    for(piece of boardState){
        // console.log(piece);
        // go through each piece and read there coords
        // then compare it to the tile id [4]/[5] to place them
        pieceX = piece.locationX;
        pieceY = piece.locationY;
        // if(8 == '8'){
        //     console.log("works");
        // }
        // these are ints, not strings
        //doesnt matter, 8 == "8"

        
        //instead of looking for the corrent child, find based off of x y coords
        //the coords are based off of chess cords, so 1-8 / 1-8
        // row = gameBoard.children[pieceX-1];
        // console.log(gameBoard.children);
        // console.log(row);
        // console.log((row[pieceY-1]).id);
        column = rowList[7- (pieceY-1)];
        tile = (column.children)[pieceX-1];
        // console.log(tile);
        
        //I have the tile and I have the piece
        // run the piece through a switch case to place the right thing into the tile
        switch(piece.name){
            case("pawn"):
                tile.textContent="P";
                break;
            case("rook"):
                tile.textContent="R";
                break;
            case("knight"):
                tile.textContent="Kn";
                break;
            case("bishop"):
                tile.textContent="B";
                break;
            case("queen"):
                tile.textContent="Q";
                break;
            case("king"):
                tile.textContent="Ki";
                break;
            default:
                break;        
        }


    }
}

loadBoard();

//run the board load every second
setInterval(function() {
    //comment out the loadboard call to stop sending requests during development
    // loadBoard();
}, 1000);

//handle the submit button
submitButton.addEventListener('click', async function() {
    // need to collect the data from the cells and bundle them into a json packet
    // need to then send the json packet 
    // then wait for a response
    console.log("submit");
    if(selectedList.length !=2){
        console.log("Not the right number of tiles");
        return;
    }
    const myRequest = PORT + "/api/board";
    // const boardRequest = await fetch(myRequest, {

    //make the submitted move and the piece id parts
    let submittedMove = [selectedList[1][4], selectedList[1][5]];
    let startingMove = [selectedList[0][4], selectedList[0][5]];
    // console.log(submittedMove);
    // console.log(startingMove);
    // the piece id cannot be saved on this side
    // the backend must find the piece based off of the submitted move

    const boardRequest = await fetch("/api/pieces/move", {
        method: 'POST',
        body: JSON.stringify({"boardId": board, "startingMove" : startingMove, "submittedMove": submittedMove}),
        headers: { 'Content-Type': 'application/json' }
    });
    if(boardRequest.ok) {
        console.log("WORKING");
    }
    else{
        console.log("fail");
    }
    // console.log(myRequest);
});

loginButton.addEventListener('click', async function () {
    event.preventDefault();
    // console.log(loginUsername.value.trim());
    let username = loginUsername.value.trim();
    let password = loginPassword.value.trim();
    //.trim removes any blank space that may ruin things

    if(username && password){
        console.log(username + password);
        const login = await fetch('/api/user/login', {
            method: 'Post',
            body: JSON.stringify({
                "username" : username,
                "password": password
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(login);
        if(login.ok){
            // console.log("Logged in");
            // console.log(login);
            let parsedString
            for await(const chunk of login.body){
                // console.log(chunk);
                let decodedString = new TextDecoder().decode(chunk);
                // console.log(decodedString);
                parsedString = JSON.parse(decodedString);
                // console.log(parsedString);
            }
            console.log(parsedString);
            user = parsedString;
        }
        else{
            console.log("Fail");
        }
    }
})