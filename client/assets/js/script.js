const gameId = document.querySelector('#gameHolder');
const gameBoard = document.querySelector('#gameBoard');
const submitButton = document.querySelector("#submitButton");

//process.env.PORT || 
const PORT = "http://localhost:3001";
//http://localhost:3001/api/board

// for each square, it will needs its own event listner

const selectedList = [];

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


submitButton.addEventListener('click', async function() {
    // need to collect the data from the cells and bundle them into a json packet
    // need to then send the json packet 
    // then wait for a response
    console.log("submit");
    const myRequest = PORT + "/api/board";
    const boardRequest = await fetch(myRequest, {
        method: 'POST',
        body: JSON.stringify({"user": 1}),
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
