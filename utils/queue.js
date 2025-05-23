//this is to manage the player queues to match players together
//it will just be a normal queue, based on first come first served
    //no matchmaking logic

//players have a trait called in queue
//when players enter the queue, that will be set to true
//find all players in queue, then choose one at random to pair with

const {Board, Piece, Player} = require("../models");

async function joinQueue(joinPlayer){
    //joinPlayer is the player entering the queue
    //function will actually return both players to match them in the routes
        //this function shouldn't return anything, just match players
        //therefore return status codes
    let playerList;
    try{
        joinPlayer = await Player.findByPk(joinPlayer);
        playerList = await Player.findAll(
            {
                where:
                    {inQueue : true}
            }
        );
    }
    catch (err){
        // 
        return -1;
    }
    // console.log(playerList);
    //playerList is now every player in the queue
    if(playerList.length == 0){
        //there are no players in the queue
        //put the new player in the queue
        console.log("all alone");
        try{
            joinPlayer.inQueue = true;
            await joinPlayer.save();
            return 1;
        }
        catch(err){
            console.log(err);
            return -1;
        }
    }

    //there are players in the queue
    // console.log("matching players");
    let randomizer = Math.random();
    //this gives a random index
    randomizer = Math.floor(randomizer*playerList.length);
    pairedPlayer = playerList[randomizer];
    //now remove the second player from the queue, and start a game with the two players
        //the game is started on the routes
    try{
        pairedPlayer.inQueue = false;
        await pairedPlayer.save();
    }
    catch(err){
        return -1;
    }

    //returns are -1, 0, and [players]
    // console.log("2 players");
    // console.log(joinPlayer, pairedPlayer);
    return [joinPlayer, pairedPlayer];
}

async function joinQueueCat(joinPlayer){
    //joinPlayer is the player entering the queue
    //function will actually return both players to match them in the routes
        //this function shouldn't return anything, just match players
        //therefore return status codes
    let playerList;
    try{
        joinPlayer = await Player.findByPk(joinPlayer);
        playerList = await Player.findAll(
            {
                where:
                    {inQueueCat : true}
            }
        );
    }
    catch (err){
        // 
        return -1;
    }
    // console.log(playerList);
    //playerList is now every player in the queue
    if(playerList.length == 0){
        //there are no players in the queue
        //put the new player in the queue
        console.log("all alone");
        try{
            joinPlayer.inQueueCat = true;
            await joinPlayer.save();
            return 1;
        }
        catch(err){
            console.log(err);
            return -1;
        }
    }

    //there are players in the queue
    // console.log("matching players");
    let randomizer = Math.random();
    //this gives a random index
    randomizer = Math.floor(randomizer*playerList.length);
    pairedPlayer = playerList[randomizer];
    //now remove the second player from the queue, and start a game with the two players
        //the game is started on the routes
    try{
        pairedPlayer.inQueueCat = false;
        await pairedPlayer.save();
    }
    catch(err){
        return -1;
    }

    //returns are -1, 0, and [players]
    // console.log("2 players");
    // console.log(joinPlayer, pairedPlayer);
    return [joinPlayer, pairedPlayer];
}

async function testerQueue(joinPlayer){
    //joinPlayer is the player entering the queue
    //function will actually return both players to match them in the routes
        //this function shouldn't return anything, just match players
        //therefore return status codes
    let playerList;
    try{
        joinPlayer = await Player.findByPk(joinPlayer);
        playerList = await Player.findAll(
            {
                where:
                    {testerQueue : true}
            }
        );
    }
    catch (err){
        // 
        return -1;
    }
    // console.log(playerList);
    //playerList is now every player in the queue
    if(playerList.length == 0){
        //there are no players in the queue
        //put the new player in the queue
        console.log("all alone");
        try{
            joinPlayer.testerQueue = true;
            await joinPlayer.save();
            return 1;
        }
        catch(err){
            console.log(err);
            return -1;
        }
    }

    //there are players in the queue
    // console.log("matching players");
    let randomizer = Math.random();
    //this gives a random index
    randomizer = Math.floor(randomizer*playerList.length);
    pairedPlayer = playerList[randomizer];
    //now remove the second player from the queue, and start a game with the two players
        //the game is started on the routes
    try{
        pairedPlayer.testerQueue = false;
        await pairedPlayer.save();
    }
    catch(err){
        return -1;
    }

    //returns are -1, 0, and [players]
    // console.log("2 players");
    // console.log(joinPlayer, pairedPlayer);
    return [joinPlayer, pairedPlayer];
}

module.exports = {joinQueue, joinQueueCat, testerQueue};