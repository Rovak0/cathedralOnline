const gameId = document.querySelector('#gameHolder');
const gameBoard = document.querySelector('#gameBoard');
const submitButton = document.querySelector("#submitMoveButton");

const loginForm = document.querySelector("#loginForm");
const loginButton = document.querySelector("#loginSubmitButton");
const loginUsername = document.querySelector("#usernameBox");
const loginPassword = document.querySelector("#passwordBox");

const signupForm = document.querySelector("#signupForm");
const signupButton = document.querySelector("#signupSubmitButton");
const signupUsername = document.querySelector("#signupName");
const signupPassword = document.querySelector("#signupPassword");

// console.log(loginForm);
// console.log(loginButton);

// create my session variables
sessionStorage.setItem("logged_in", false);
sessionStorage.setItem("user_id", false);

let loggedIn = sessionStorage.getItem('logged_in');
let user = sessionStorage.getItem('user_id');

// console.log(loggedIn);

//process.env.PORT || 
const PORT = "http://localhost:3001";
//http://localhost:3001/api/board

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
// user = 1;

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
// let myBoard = getBoard();

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
                    // console.log(tile.className);
                    if(tile.className == "white"){
                        tile.style.backgroundColor = "white";
                    }
                    else{
                        tile.style.backgroundColor = "rgb(72, 70, 70)";
                    }
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
                        // clearTile.style.backgroundColor = "white";
                        if(clearTile.className == "white"){
                            clearTile.style.backgroundColor = "white";
                        }
                        else{
                            clearTile.style.backgroundColor = "rgb(72, 70, 70)";
                        }
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
    let tileImage;
    for(child of rowList){
        // console.log(child.children);
        for(kid of child.children){
            // console.log(kid);
            // console.log(kid.children);
            kid.textContent = resetList[indexX][indexY];

            tileImage = document.querySelector(`#img${indexX}${indexY}`);
            // console.log(tileImage);
            if(tileImage){
                tileImage.parentElement.removeChild(tileImage);
            }
            tileImage = null;
            //if there is an image, clear it
            // tileImage = document.getElementById()

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
        // console.log(piece);
        // go through each piece and read there coords
        // then compare it to the tile id [4]/[5] to place them
        pieceX = piece.locationX;
        pieceY = piece.locationY;

        column = rowList[7- (pieceY-1)];
        tile = (column.children)[pieceX-1];
        // console.log(tile);
        
        //I have the tile and I have the piece
        // run the piece through a switch case to place the right thing into the tile

        //make the image element that will be attached to the tile
        //give the image an id that is its x/y coords
        imageId = `${pieceX-1}${pieceY-1}`;
        // console.log(typeof(imageId));
        let pieceImage = document.createElement("img");
        // pieceImage.setAttribute(id, `${imageId}`);
        pieceImage.id = `img${imageId}`;

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
        for(tile of selectedList){
            //tile is the id of the tile, not the tile itself
            // console.log(tile);
            // console.log(document.querySelector(`#${tile}`))
            // document.querySelector(`#${tile}`).style.backgroundColor = "white";
            if(document.querySelector(`#${tile}`).className == "white"){
                document.querySelector(`#${tile}`).style.backgroundColor = "white";
            }
            else{
                document.querySelector(`#${tile}`).style.backgroundColor = "rgb(72, 70, 70)";
            }
            // tile
        }
        selectedList = []
        loadBoard();
        // console.log("WORKING");
    }
    else{
        // console.log("fail");
    }
    // console.log(myRequest);
}

async function loginHandler(event){
    event.preventDefault();
    // console.log(loginUsername.value.trim());
    let username = loginUsername.value.trim();
    let password = loginPassword.value.trim();
    //.trim removes any blank space that may ruin things

    if(username && password){
        // console.log(username + password);
        const login = await fetch('/api/user/login', {
            method: 'Post',
            body: JSON.stringify({
                "username" : username,
                "password": password
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        // console.log(login);
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
            // console.log(parsedString);
            user = parsedString;
            sessionStorage.setItem('user_id', parsedString);
            sessionStorage.setItem('loggedIn', true);
            
            // console.log(user);
        }
        else{
            console.log("Fail");
        }
    }
}

async function signupHandler(event){
    event.preventDefault();

    let username = signupUsername.value.trim();
    let password = signupPassword.value.trim();

    if(username && password){
        // console.log(username + password);
        const login = await fetch('/api/user/create', {
            method: 'Post',
            body: JSON.stringify({
                "username" : username,
                "password": password
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        // console.log(login);
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
            // console.log(parsedString);
            user = parsedString;
        }
        else{
            console.log("Fail");
        }
    }
}

//handle the submit button
submitButton.addEventListener('click', submitButtonHandler);

loginButton.addEventListener('click',loginHandler);

signupButton.addEventListener('click', signupHandler);

//these are the things that run on load or continously
//user is a string
if(user != 'false'){
    loadBoard();
}

//run the board load every second
setInterval(function() {
    //comment out the loadboard call to stop sending requests during development
    // console.log(user);
    if(user != 'false'){
        loadBoard();
    }
}, 1000);