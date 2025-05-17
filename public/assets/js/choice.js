const chessQueue = document.querySelector("#normalChess");
const catQueue = document.querySelector("#cathedralChess");


async function queueButtonHandlerChess(event){
    event.preventDefault();
    //check for user id
    if(localStorage.getItem("user_id")){
        const queue = await fetch('/api/board/normal', {
            method: 'Post',
            body: JSON.stringify({
                "user" : localStorage.getItem("user_id")
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if(queue.ok){
            //nothing currently changes when in the queue
            console.log("entered queue");
        }
    }
    else{
        console.log("Can't join queue as no one");
    }
}

async function queueButtonHandlerCat(event){
    event.preventDefault();
    //check for user id
    if(localStorage.getItem("user_id")){
        const queue = await fetch('/api/board/cathedral', {
            method: 'Post',
            body: JSON.stringify({
                "user" : localStorage.getItem("user_id")
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if(queue.ok){
            //nothing currently changes when in the queue
            console.log("entered queue");
        }
    }
    else{
        console.log("Can't join queue as no one");
    }
}

chessQueue.addEventListener("click", queueButtonHandlerChess);
catQueue.addEventListener("click", queueButtonHandlerCat);