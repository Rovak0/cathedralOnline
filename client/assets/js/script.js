const gameId = document.querySelector('#gameHolder');
const gameBoard = document.querySelector('#gameBoard');

// for each square, it will needs its own event listner

for (kid of gameBoard.children){
    console.log(kid);
    for (child of kid.children){
        // console.log(child);
        // console.log(child.cells);
        for(square of child.cells){
            // console.log(square.id);
            const tile = document.querySelector(`#${square.id}`);
            // console.log(tile);
            // square.style.backgroundColor = "blue";
            tile.addEventListener('click', function () {
                tile.style.backgroundColor = "lightBlue";
            })
        }
    }
};

