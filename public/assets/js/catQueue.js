// if the player is here, they are in the chess queue
// I can use that as something to check to know when to move on
// set an interval to query the sever every few seconds and have the server check

setInterval(async function() {
    let queue = await fetch('/api/user/getChessQueue', {
        method: 'Post',
        body: JSON.stringify({
            "user" : localStorage.getItem("user_id")
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    if(queue == false){
        //direct the user to the chess page
        //make the chess page
        window.location.href = "/cathedral.html";
    }
});
