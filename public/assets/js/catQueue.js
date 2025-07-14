// if the player is here, they are in the chess queue
// I can use that as something to check to know when to move on
// set an interval to query the sever every few seconds and have the server check

async function runQueueCheck(){
    let queue = await fetch('/api/user/getCatQueue', {
        method: 'Post',
        body: JSON.stringify({
            "user" : localStorage.getItem("user_id")
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    console.log(queue);
    if(queue.ok){
        // if(queue.bodyUsed);
        console.log("moving forwards");
        console.log(queue.body);
        // let reader = queue.body.getReader();
        let parsedString
        for await(const chunk of queue.body){
            let decodedString = new TextDecoder().decode(chunk);
            parsedString = JSON.parse(decodedString);

        }
        if(parsedString == 0){
            localStorage.setItem("user_id", localStorage.getItem("user_id"));
            window.location.href = "/cathedral.html";
        }
    }
    // if(queue == false){
    //     //direct the user to the chess page
    //     //make the chess page
    //     window.location.href = "/cathedral.html";
    // }
}

setInterval(runQueueCheck(), 1000);
