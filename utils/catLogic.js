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
            hits--;
        }
    }
    //went through all damage
    return damage;
};

async function attackDam(attacker, blocker){ //, modifiers
    // let attacker = await Piece.findByPk(attackerId);
    // let blocker = await Piece.findByPk(blockerId);

    let dice = 0;
    let swings = attacker.attackHits;
    let hits = 0;
    while(swings > 0){
        swings--;
        dice = Math.ceil(Math.random() * 20);
        //if ac is at or above the die, add hit
        if(swings >= dice){
            hits++;
        }
        if(dice >= 19){
            //crits add an extra hit
            hits++;
        }
    }
    let damage = hits * attacker.attackDam;
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
};

//need to find legal attacks
//this will be how you initiate attacks
async function attack(attackerId, blockerId, boardId){
    //pieces know their own location
    //board id is still needed to figure out ranged attacks
    let attacker = await Piece.findByPk(attackerId);
    let blocker = await Piece.findByPk(blockerId);
    let board = await Board.findByPk(boardId);

    //if the range is 1, it's simple
        // ranged attacks can't be used in close combat
        // instead of looking at the attacks range, look at positions
    if(-1 <= (attacker.locationX - blocker.locationX) <=1){
        if(-1 <= (attacker.locationY - blocker.locationY) <=1){
            //if both the x and y are within 1, attack
            attackDam(attacker, blocker);
        }
        //after the attack is made, return
            //the following component handles ranged attacks
        return 1;
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
    //boardState is every piece on the board
    //look at the attacker and blocker positions to figure out which direction to shoot
    let range = 0;
    if(attacker.locationX > blocker.locationX){
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
                                attackDam(attacker, blocker);
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
                                attackDam(attacker, blocker);
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
                    if(piece.locationX == (attacker.locationX - range)){
                        if(piece.locationY == (attacker.locationY)){
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                attackDam(attacker, blocker);
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
            //Y's greater, shoot down to the right
            //track down and right until it hits
            while(range < attacker.attackRan){
                range++;
                for(piece of boardState){
                    if(piece.locationX == (attacker.locationX + range)){
                        if(piece.locationY == (attacker.locationY - range)){
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                attackDam(attacker, blocker);
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
                                attackDam(attacker, blocker);
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
            //straight right
            while(range < attacker.attackRan){
                range++;
                for(piece of boardState){
                    if(piece.locationX == (attacker.locationX + range)){
                        if(piece.locationY == (attacker.locationY)){
                            //check if it is the right piece
                            if(piece.id == blocker.id){
                                attackDam(attacker, blocker);
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
                            attackDam(attacker, blocker)
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
    else if(attacker.locationY < blocker.locationY){
        while(range < attacker.attackRan){
            range++;
            //check each piece straight down
            for(piece of boardState){
                if(piece.locationX == attacker.locationX){
                    if(piece.locationY == (attacker.locationY + range)){
                        if(piece.id == blocker.id){
                            attackDam(attacker, blocker)
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

    return -1;
}

module.exports = {attack};
