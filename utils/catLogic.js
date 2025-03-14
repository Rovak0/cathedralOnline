const {Board, Piece, Player, Square} = require("../models");

//this will hold all the logic needed for cathedr'l pieces
//movement is handled already
//needs attacks and blocks

//attacks need to use the block mechanic, so blocks are first
//this function will return an int that will be damage taken
//the attack will manage the piece query and damage, so the block function doesn't need to be async
function block(hits, blocker){
    //per point of damage, an ac check is made to prevent it
    let ac = blocker.ac;
    let dice = 0;
    let damage = 0;
    let crits = 0;
    while(hits > 0){
        hits--;
        //get a random number 1-20
        dice = Math.ceil(Math.random() * 20);
        //if ac is below the die, add damage
        if(ac < dice){
            damage++;
        }
        //crits remove 2 hits
        if(dice >= 19){
            crits--;
        }
    }
    //apply crit mod
    damage = damage-crits;
    if(damage < 0){
        damage = 0;
    }
    //went through all damage
    return damage;
};

async function attackDam(attacker, blocker, ranged){ //, modifiers
    // let attacker = await Piece.findByPk(attackerId);
    // let blocker = await Piece.findByPk(blockerId);

    let dice = 0;
    let swings;
    let toHit;
    if(ranged){
        toHit = attacker.toHitRan;
        swings = attacker.attackHitsRan;
    }
    else{
        toHit = attacker.toHit;
        swings = attacker.attackHits;
    }
    let hits = 0;
    while(swings > 0){
        console.log("swing count: "+ swings);
        swings--;
        dice = Math.ceil(Math.random() * 20);
        //if ac is at or above the die, add hit
        if(toHit <= dice){
            hits++;
        }
        if(dice >= 19){
            //crits add an extra hit
            hits++;
        }
    }
    let damage;
    if(ranged){
        damage = hits * attacker.attackDamRan;
    }
    else{
        damage = hits * attacker.attackDam;
    }
    let blocked = block(damage, blocker);
    damage = damage - blocked;
    if(damage > 0){
        let health = blocker.currentHealth - damage;
        if(health <= 0){
            //delete the piece if it has 0 health
            // await piece.destroy();
            await blocker.destroy();
        }
        else{
            blocker.currentHealth = health;
            await blocker.save();
        }
    }
    return damage;
};

//need to find legal attacks
//this will be how you initiate attacks
async function attack(attackerId, blockerId, boardId){
    //pieces know their own location
    //board id is still needed to figure out ranged attacks
    let attacker = await Piece.findByPk(attackerId);
    let blocker = await Piece.findByPk(blockerId);
    let board = await Board.findByPk(boardId);
    console.log("huntHere");

    //make sure the attack is color legal
    if(attacker.color == blocker.color){
        return -1;
    }

    //if the range is 1, it's simple
    // ranged attacks can't be used in close combat
    // instead of looking at the attacks range, look at positions
    let damage;
    //if both the x and y are within 1, attack
    if(-1 <= (attacker.locationX - blocker.locationX) && (attacker.locationX - blocker.locationX) <=1){
        if(-1 <= (attacker.locationY - blocker.locationY) && (attacker.locationY - blocker.locationY) <=1){
            //check if the attacker is facing the right direction
            //facings run 0-7
            //turn the dirX/dirY into 8 cases
            //blocker - attacker so that positive is right and up
            let dirX = blocker.locationX - attacker.locationX;
            let dirY = blocker.locationY - attacker.locationY;
            let result;
            switch(dirX){
                case(0):
                    //2 options, above or below
                        //or miss
                    switch(dirY){
                        case(1):
                            result = 0;
                            break;
                        case(-1):
                            result = 4;
                            break;
                        default:
                            result = -1;
                            break;
                    }
                    break;
                case(1):
                    switch(dirY){
                        case(1):
                            result = 1;
                            break;
                        case(0):
                            result = 2;
                            break;
                        case(-1):
                            result = 3;
                            break;
                        default:
                            result = -1;
                            break;
                    }
                    break;
                case(-1):
                    switch(dirY){
                        case(1):
                            result = 7;
                            break;
                        case(0):
                            result = 6;
                            break;
                        case(-1):
                            result = 5;
                            break;
                        default:
                            result = -1;
                            break;
                    }
                    break;
            }
            if(result == -1){
                return -1;
            }
            //result is now a number 0-7 depending on the direction to the blocker
            //run a switch case to handle 0/1 being within 2 away from 6/7, and vice verca
            //only need to do something if the attack is illegal, so lots of nots
            let legal = 1;
            switch(attacker.direction){
                case(0):
                    if((result != 6) || (result != 7)){
                        //result is not 6 or 7
                        if(!(Math.abs(attacker.direction - result) <= 2)){
                            legal = 0;
                        }
                    }
                    break;
                case(1):
                    if(result != 7){
                        //result is not 7
                        if(!(Math.abs(attacker.direction - result) <= 2)){
                            legal = 0;
                        }
                    }
                    break;
                case(6):
                    if(result != 0){
                        //result is not 0
                        if(!(Math.abs(attacker.direction - result) <= 2)){
                            legal = 0;
                        }
                    }
                    break;
                case(7):
                    if((result != 0) || (result != 1)){
                        //result is not 0 or 1
                        if(!(Math.abs(attacker.direction - result) <= 2)){
                            legal = 0;
                        }
                    }
                    break;
                default:
                    if(!(Math.abs(attacker.direction - result) <= 2)){
                        legal = 0;
                    }
            }

            if(!legal){
                return -1;
            }

            damage = await attackDam(attacker, blocker, false);
            console.log(damage);
            //after the attack is made, return
            //the following component handles ranged attacks
            return damage;
        }
    }

    //now for ranged
    //all of the piece movement is based off the piece class
        //this means that using queen movement isn't clean
    
    let boardState = await Piece.findAll(
        {
        where: 
            {board_id : boardId}
        }
    );
    // console.log(boardState);
    for(piece of boardState){
        console.log(piece.dataValues);
    }
    //boardState is every piece on the board
    //look at the attacker and blocker positions to figure out which direction to shoot
    let range = 0;
    if(attacker.locationX > blocker.locationX){
        console.log("left shot");
        //if attacker's X is greater, shoot left
        //check if it is also up or down
        if(attacker.locationY > blocker.locationY){
            //Y's greater, shoot down to the left
            //track down and left until it hits
            while(range < attacker.attackRan){
                range++;
                for(piece of boardState){
                    if(piece.locationX == (attacker.locationX - range)){
                        if(piece.locationY == (attacker.locationY - range)){
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                await attackDam(attacker, blocker, true);
                                return 1;
                            }
                            else{
                                //the id's don't match and the shot colided
                                return 0;
                            }
                        }
                    }
                }
                //check if the shot has left the board
                if(0 >= (attacker.locationX - range)){
                    return 0;
                }
                else if(0 >= (attacker.locationY - range)){
                    return 0;
                }
            }
        }
        else if(attacker.locationY < blocker.locationY){
            //Y's lesser, shoot up to the left
            while(range < attacker.attackRan){
                range++;
                for(piece of boardState){
                    if(piece.locationX == (attacker.locationX - range)){
                        if(piece.locationY == (attacker.locationY + range)){
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                await attackDam(attacker, blocker, true);
                                return 1;
                            }
                            else{
                                //the id's don't match and the shot colided
                                return 0;
                            }
                        }
                    }
                }
                if(0 >= (attacker.locationX - range)){
                    return 0;
                }
                else if(8 >= (attacker.locationY + range)){
                    return 0;
                }
            }
        }
        else{
            //straight left
            while(range < attacker.attackRan){
                range++;
                for(piece of boardState){
                    // console.log("piece");
                    // console.log(piece.dataValues);
                    // console.log("END OF PIECE");
                    if(piece.locationX == (attacker.locationX - range)){
                        // console.log("dead left for loop x");
                        // console.log(piece.name);
                        // console.log(piece.locationX);
                        // console.log(piece.locationY);
                        // console.log(attacker.locationX);
                        // console.log(attacker.locationY);
                        if(piece.locationY == (attacker.locationY)){
                            console.log("dead left for loop y");
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                await attackDam(attacker, blocker, true);
                                return 1;
                            }
                            else{
                                //the id's don't match and the shot colided
                                return 0;
                            }
                        }
                    }
                }
                if(0 >= (attacker.locationX - range)){
                    return 0;
                }
            }
        }
    }

    //range doesn't need to be reset b/c it only changes if it enters an if loop, and if it does the function's over
    //right and directions
    if(attacker.locationX < blocker.locationX){
        //if attacker's X is less, shoot right
        //check if it is also up or down
        if(attacker.locationY > blocker.locationY){
            console.log("right down");
            //Y's greater, shoot down to the right
            //track down and right until it hits
            while(range < attacker.attackRan){
                range++;
                for(piece of boardState){
                    if(piece.locationX == (attacker.locationX + range)){
                        if(piece.locationY == (attacker.locationY - range)){
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                await attackDam(attacker, blocker, true);
                                return 1;
                            }
                            else{
                                //the id's don't match and the shot colided
                                return 0;
                            }
                        }
                    }
                }
                if(0 >= (attacker.locationX + range)){
                    return 0;
                }
                else if(8 >= (attacker.locationY - range)){
                    return 0;
                }
            }
        }
        else if(attacker.locationY < blocker.locationY){
            //Y's lesser, shoot up to the right
            while(range < attacker.attackRan){
                range++;
                for(piece of boardState){
                    if(piece.locationX == (attacker.locationX + range)){
                        if(piece.locationY == (attacker.locationY + range)){
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                await attackDam(attacker, blocker, true);
                                return 1;
                            }
                            else{
                                //the id's don't match and the shot colided
                                return 0;
                            }
                        }
                    }
                }
                if(0 >= (attacker.locationX + range)){
                    return 0;
                }
                else if(8 >= (attacker.locationY + range)){
                    return 0;
                }
            }
        }
        else{
            console.log("dead right");
            console.log(attacker.attackRan);
            //straight right
            while(range < attacker.attackRan){
                console.log(range);
                range++;
                for(piece of boardState){
                    if(piece.locationX == (attacker.locationX + range)){
                        if(piece.locationY == (attacker.locationY)){
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                await attackDam(attacker, blocker, true);
                                return 1;
                            }
                            else{
                                //the id's don't match and the shot colided
                                return 0;
                            }
                        }
                    }
                }
                if(8 < (attacker.locationX + range)){
                    return 0;
                }
            }
        }
    }

    //straight up and down
    if(attacker.locationY > blocker.locationY){
        while(range < attacker.attackRan){
            range++;
            //check each piece straight down
            for(piece of boardState){
                if(piece.locationX == attacker.locationX){
                    if(piece.locationY == (attacker.locationY - range)){
                        if(piece.id == blocker.id){
                            await attackDam(attacker, blocker, true)
                            return 1;
                        }
                        else{
                            return 0;
                        }
                    }
                }
            }
            if(0 >= (attacker.locationY - range)){
                return 0;
            }
        }
    }
    if(attacker.locationY < blocker.locationY){
        while(range < attacker.attackRan){
            range++;
            //check each piece straight down
            for(piece of boardState){
                if(piece.locationX == attacker.locationX){
                    if(piece.locationY == (attacker.locationY + range)){
                        if(piece.id == blocker.id){
                            await attackDam(attacker, blocker, true)
                            return 1;
                        }
                        else{
                            return 0;
                        }
                    }
                }
            }
            if(0 >= (attacker.locationY + range)){
                return 0;
            }
        }
    }
    console.log("Shouldn't be here");
    return -1;
}

module.exports = {attack};
