const {Board, Piece, Player, Square} = require("../models");

//this will hold all the logic needed for cathedr'l pieces
//movement is handled already
//needs attacks and blocks

//attacks need to use the block mechanic, so blocks are first
//this function will return an int that will be damage taken
//the attack will manage the piece query and damage, so the block function doesn't need to be async

async function checkPieceKill(piece){
    if(piece.health <= 0){
        await piece.destroy();
        piece.save();
    }
}


function block(hits, blocker, modifiers){
    //modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock]
    console.log("blocking");
    //per point of damage, an ac check is made to prevent it
    let ac = blocker.ac;
    let dice = 0;
    let damage = 0;
    let critThresh = 19;
    let rerolls = 0;
    let crits = 0;

    console.log("Ac before: " + ac);
    if(modifiers[2]){
        ac--;
        critThresh--;
    }
    if(modifiers[4]){
        rerolls++;
    }

    console.log(ac);

    while(hits > 0){
        hits--;
        //get a random number 1-20
        dice = Math.ceil(Math.random() * 20);
        //if die does not beat the ac, add damage
        console.log("blocking dice: " + dice);
        if(dice <= ac){
            console.log("adding damage");
            damage++;
            console.log("after damage: " + damage);
        }
        else if(rerolls){
            rerolls--;
            dice = Math.ceil(Math.random() * 20);
            if(dice <= ac){
                damage++;
            }

        }
        //crits remove 2 hits
        if(dice >= critThresh){
            console.log("crit block");
            crits++
        }
    }
    console.log("hit damage: " + damage);

    //apply crit mod
    damage = damage-crits;
    if(damage < 0){
        damage = 0;
    }
    console.log("final damage: " + damage);
    //went through all damage
    return damage;
};

async function attackDam(attacker, blocker, ranged, modifiers){ //, modifiers
    console.log("attack damage");
    console.log(modifiers);
    //modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock]

    let dice = 0;
    let swings;
    let toHit;
    let critThresh = 19;
    if(ranged){
        toHit = attacker.toHitRan;
        swings = attacker.attackHitsRan;
    }
    else{
        toHit = attacker.toHit;
        swings = attacker.attackHits;
    }
    
    if(modifiers[0]){
        toHit = toHit - 2;
        critThresh = critThresh - 2;
    }
    //modifiers[1] is the queen buff, which lowers the dc to hit
    if(modifiers[1]){
        toHit--;
        critThresh--;
    }
    let reroll = 0;
    if(modifiers[3]){
        reroll = 1;
    }
    console.log("rerolls: " + reroll);

    let hits = 0;
    while(swings > 0){
        console.log("swing count: "+ swings);
        swings--;
        dice = Math.ceil(Math.random() * 20);
        console.log("roll result " + dice);
        console.log("toHit " + toHit);
        //if ac is at or above the die, add hit
        if(toHit <= dice){
            console.log("Adding to hits");
            hits++;
        }
        //burn the reroll if available
        else if(reroll){
            console.log("Rerolling")
            reroll--;
            dice = Math.ceil(Math.random() * 20);
            console.log("Reroll die: " + dice);
            if(toHit <= dice){
                console.log("Adding to hits");
                hits++;
            }
        }
        if(dice >= critThresh){
            //crits add an extra hit
            console.log("Crit hit");
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
    damage = block(damage, blocker, modifiers);
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
    let boardState = await Piece.findAll(
        {
        where: 
            {board_id : boardId}
        }
    );

    console.log("attackHere");

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

            //time to find out if it is backstabbing
            let backstab = false;
            switch(blocker.direction){
                //need to be hitting the back
                //the back is going to be the same direction they are facing (looking down, hitting down)
                    //the discontinuity is on 3 and 4
                case(3):
                    if(result == 0){
                        backstab = true;
                    }
                    else if((Math.abs(blocker.direction - result) <= 1)){
                        backstab = true;
                    }
                    break
                case(4):
                    if(result == 0 || result == 1){
                        backstab = true;
                    }
                    else if((Math.abs(blocker.direction - result) <= 1)){
                        backstab = true;
                    }
                    break
                default:
                    if((Math.abs(blocker.direction - result) <= 1)){
                        backstab = true;
                    }
                    break 
            };
            
            //check for royal modifiers
                //need to check for both sides
            let kingAttack = false;
            let kingBlock = false;            
            let queenAttack = false;
            let queenBlock = false;
            for(piece of boardState){
                if(piece.name == "king"){
                    if(piece.color == attacker.color){
                        if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                            if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                kingAttack = true;
                            }
                        }
                    }
                    else if(piece.color == blocker.color){
                        if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                            if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                kingBlock = true;
                            }
                        }
                    }
                }
                else if(piece.name == "queen"){
                    if(piece.color == attacker.color){
                        if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                            if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                queenAttack = true;
                            }
                        }
                    }
                    else if(piece.color == blocker.color){
                        if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                            if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                queenBlock = true;
                            }
                        }
                    }
                }
            }

            let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];

            damage = await attackDam(attacker, blocker, false, modifiers);
            console.log(damage);
            //after the attack is made, return
            //the following component handles ranged attacks
            return damage;
        }
    }

    //now for ranged
    //all of the piece movement is based off the piece class
        //this means that using queen movement isn't clean
    
    //check if there is an enemy in zone of control b/c you can't shoot with someone in your front arc
    //take the front arc, and check for enemies
    //this switch gives an array of tile modifiers to apply to the attacker's x/y to find tiles in arc
    let arcRan = [];
    switch(attacker.direction){
        case(0):
            arcRan = [[0, 1], [1, 1], [1, 0], [-1, 0], [-1, 1]];
            break;
        case(1):
            arcRan = [[0, 1], [1, 1], [1, 0], [1, -1], [-1, 1]];
            break;
        case(2):
            arcRan = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
            break;
        case(3):
            arcRan = [[1, -1], [1, 1], [1, 0], [0, -1], [-1, -1]];
            break;
        case(4):
            arcRan = [[0, -1], [-1, -1], [1, 0], [1, -1], [-1, 0]];
            break;
        case(5):
            arcRan = [[1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
            break;
        case(6):
            arcRan = [[0, -1], [-1, -1], [0, 1], [-1, 0], [-1, 1]];
            break;
        case(7):
            arcRan = [[0, 1], [1, 1], [-1, -1], [-1, 0], [-1, 1]];
            break;
        default:
            break;        
    }

    for(piece of boardState){
        if(piece.color != attacker.color){
            for(mod of arcRan){
                if(piece.locationX == (attacker.locationX + mod[0])){
                    if(piece.locationY == (attacker.locationY + mod[1])){
                        //if an enemy piece is found at this point, it is an illegal attack
                        return -1;
                    }
                }
            }
        }
    }

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

                                //time to find out if it is backstabbing
                                let backstab = false;
                                switch(blocker.direction){
                                    //need to be hitting the back
                                    //the back is going to be the same direction they are facing (looking down, hitting down)
                                        //the discontinuity is on 3 and 4
                                    case(3):
                                        if(result == 0){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    case(4):
                                        if(result == 0 || result == 1){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    default:
                                        if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break 
                                };
                                
                                //check for royal modifiers
                                    //need to check for both sides
                                let kingAttack = false;
                                let kingBlock = false;            
                                let queenAttack = false;
                                let queenBlock = false;
                                for(piece of boardState){
                                    if(piece.name == "king"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    kingAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    kingBlock = true;
                                                }
                                            }
                                        }
                                    }
                                    else if(piece.name == "queen"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    queenAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    queenBlock = true;
                                                }
                                            }
                                        }
                                    }
                                }

                                let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
                                let damage = await attackDam(attacker, blocker, modifiers);
                                return damage;
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

                                //time to find out if it is backstabbing
                                let backstab = false;
                                switch(blocker.direction){
                                    //need to be hitting the back
                                    //the back is going to be the same direction they are facing (looking down, hitting down)
                                        //the discontinuity is on 3 and 4
                                    case(3):
                                        if(result == 0){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    case(4):
                                        if(result == 0 || result == 1){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    default:
                                        if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break 
                                };
                                
                                //check for royal modifiers
                                    //need to check for both sides
                                let kingAttack = false;
                                let kingBlock = false;            
                                let queenAttack = false;
                                let queenBlock = false;
                                for(piece of boardState){
                                    if(piece.name == "king"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    kingAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    kingBlock = true;
                                                }
                                            }
                                        }
                                    }
                                    else if(piece.name == "queen"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    queenAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    queenBlock = true;
                                                }
                                            }
                                        }
                                    }
                                }

                                let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
                                let damage = await attackDam(attacker, blocker, modifiers);
                                return damage;
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

                                //time to find out if it is backstabbing
                                let backstab = false;
                                switch(blocker.direction){
                                    //need to be hitting the back
                                    //the back is going to be the same direction they are facing (looking down, hitting down)
                                        //the discontinuity is on 3 and 4
                                    case(3):
                                        if(result == 0){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    case(4):
                                        if(result == 0 || result == 1){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    default:
                                        if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break 
                                };
                                
                                //check for royal modifiers
                                    //need to check for both sides
                                let kingAttack = false;
                                let kingBlock = false;            
                                let queenAttack = false;
                                let queenBlock = false;
                                for(piece of boardState){
                                    if(piece.name == "king"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    kingAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    kingBlock = true;
                                                }
                                            }
                                        }
                                    }
                                    else if(piece.name == "queen"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    queenAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    queenBlock = true;
                                                }
                                            }
                                        }
                                    }
                                }

                                let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
                                let damage = await attackDam(attacker, blocker, modifiers);
                                return damage;
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

                                //time to find out if it is backstabbing
                                let backstab = false;
                                switch(blocker.direction){
                                    //need to be hitting the back
                                    //the back is going to be the same direction they are facing (looking down, hitting down)
                                        //the discontinuity is on 3 and 4
                                    case(3):
                                        if(result == 0){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    case(4):
                                        if(result == 0 || result == 1){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    default:
                                        if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break 
                                };
                                
                                //check for royal modifiers
                                    //need to check for both sides
                                let kingAttack = false;
                                let kingBlock = false;            
                                let queenAttack = false;
                                let queenBlock = false;
                                for(piece of boardState){
                                    if(piece.name == "king"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    kingAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    kingBlock = true;
                                                }
                                            }
                                        }
                                    }
                                    else if(piece.name == "queen"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    queenAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    queenBlock = true;
                                                }
                                            }
                                        }
                                    }
                                }

                                let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
                                let damage = await attackDam(attacker, blocker, modifiers);
                                return damage;
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

                                //time to find out if it is backstabbing
                                let backstab = false;
                                switch(blocker.direction){
                                    //need to be hitting the back
                                    //the back is going to be the same direction they are facing (looking down, hitting down)
                                        //the discontinuity is on 3 and 4
                                    case(3):
                                        if(result == 0){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    case(4):
                                        if(result == 0 || result == 1){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    default:
                                        if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break 
                                };
                                
                                //check for royal modifiers
                                    //need to check for both sides
                                let kingAttack = false;
                                let kingBlock = false;            
                                let queenAttack = false;
                                let queenBlock = false;
                                for(piece of boardState){
                                    if(piece.name == "king"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    kingAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    kingBlock = true;
                                                }
                                            }
                                        }
                                    }
                                    else if(piece.name == "queen"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    queenAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    queenBlock = true;
                                                }
                                            }
                                        }
                                    }
                                }

                                let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
                                let damage = await attackDam(attacker, blocker, modifiers);
                                return damage;;
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

                                //time to find out if it is backstabbing
                                let backstab = false;
                                switch(blocker.direction){
                                    //need to be hitting the back
                                    //the back is going to be the same direction they are facing (looking down, hitting down)
                                        //the discontinuity is on 3 and 4
                                    case(3):
                                        if(result == 0){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    case(4):
                                        if(result == 0 || result == 1){
                                            backstab = true;
                                        }
                                        else if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break
                                    default:
                                        if((Math.abs(blocker.direction - result) <= 1)){
                                            backstab = true;
                                        }
                                        break 
                                };
                                
                                //check for royal modifiers
                                    //need to check for both sides
                                let kingAttack = false;
                                let kingBlock = false;            
                                let queenAttack = false;
                                let queenBlock = false;
                                for(piece of boardState){
                                    if(piece.name == "king"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    kingAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    kingBlock = true;
                                                }
                                            }
                                        }
                                    }
                                    else if(piece.name == "queen"){
                                        if(piece.color == attacker.color){
                                            if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                    queenAttack = true;
                                                }
                                            }
                                        }
                                        else if(piece.color == blocker.color){
                                            if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                                if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                    queenBlock = true;
                                                }
                                            }
                                        }
                                    }
                                }

                                let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
                                let damage = await attackDam(attacker, blocker, modifiers);
                                return damage;
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

                            //time to find out if it is backstabbing
                            let backstab = false;
                            switch(blocker.direction){
                                //need to be hitting the back
                                //the back is going to be the same direction they are facing (looking down, hitting down)
                                    //the discontinuity is on 3 and 4
                                case(3):
                                    if(result == 0){
                                        backstab = true;
                                    }
                                    else if((Math.abs(blocker.direction - result) <= 1)){
                                        backstab = true;
                                    }
                                    break
                                case(4):
                                    if(result == 0 || result == 1){
                                        backstab = true;
                                    }
                                    else if((Math.abs(blocker.direction - result) <= 1)){
                                        backstab = true;
                                    }
                                    break
                                default:
                                    if((Math.abs(blocker.direction - result) <= 1)){
                                        backstab = true;
                                    }
                                    break 
                            };
                            
                            //check for royal modifiers
                                //need to check for both sides
                            let kingAttack = false;
                            let kingBlock = false;            
                            let queenAttack = false;
                            let queenBlock = false;
                            for(piece of boardState){
                                if(piece.name == "king"){
                                    if(piece.color == attacker.color){
                                        if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                            if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                kingAttack = true;
                                            }
                                        }
                                    }
                                    else if(piece.color == blocker.color){
                                        if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                            if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                kingBlock = true;
                                            }
                                        }
                                    }
                                }
                                else if(piece.name == "queen"){
                                    if(piece.color == attacker.color){
                                        if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                            if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                queenAttack = true;
                                            }
                                        }
                                    }
                                    else if(piece.color == blocker.color){
                                        if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                            if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                queenBlock = true;
                                            }
                                        }
                                    }
                                }
                            }

                            let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
                            let damage = await attackDam(attacker, blocker, modifiers);
                            return damage;
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

                            //time to find out if it is backstabbing
                            let backstab = false;
                            switch(blocker.direction){
                                //need to be hitting the back
                                //the back is going to be the same direction they are facing (looking down, hitting down)
                                    //the discontinuity is on 3 and 4
                                case(3):
                                    if(result == 0){
                                        backstab = true;
                                    }
                                    else if((Math.abs(blocker.direction - result) <= 1)){
                                        backstab = true;
                                    }
                                    break
                                case(4):
                                    if(result == 0 || result == 1){
                                        backstab = true;
                                    }
                                    else if((Math.abs(blocker.direction - result) <= 1)){
                                        backstab = true;
                                    }
                                    break
                                default:
                                    if((Math.abs(blocker.direction - result) <= 1)){
                                        backstab = true;
                                    }
                                    break 
                            };
                            
                            //check for royal modifiers
                                //need to check for both sides
                            let kingAttack = false;
                            let kingBlock = false;            
                            let queenAttack = false;
                            let queenBlock = false;
                            for(piece of boardState){
                                if(piece.name == "king"){
                                    if(piece.color == attacker.color){
                                        if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                            if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                kingAttack = true;
                                            }
                                        }
                                    }
                                    else if(piece.color == blocker.color){
                                        if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                            if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                kingBlock = true;
                                            }
                                        }
                                    }
                                }
                                else if(piece.name == "queen"){
                                    if(piece.color == attacker.color){
                                        if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                                            if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                                                queenAttack = true;
                                            }
                                        }
                                    }
                                    else if(piece.color == blocker.color){
                                        if(Math.abs(piece.locationX - blocker.locationX) <= 1){
                                            if(Math.abs(piece.locationY - blocker.locationY) <= 1){
                                                queenBlock = true;
                                            }
                                        }
                                    }
                                }
                            }

                            let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
                            let damage = await attackDam(attacker, blocker, modifiers);
                            return damage;
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

//magic
//magic cannot be blocked
async function lightningBolt(attackerId, blockerId, boardId){
    let attacker = await Piece.findByPk(attackerId);
    let blocker = await Piece.findByPk(blockerId);
    // let board = await Piece.findByPk(boardId);
    let boardState = await Piece.findAll({
        where:
            {board_id : boardId}
    });

    console.log("BoltFunction");

    if(attacker.name != "wizard"){
        console.log("bolt is for wizards!");
        return -1;
    }
    
    //can't cast spells when there is an enemy is in your arc
        //the enemy must also be facing you
    let arcRan = [];
    switch(attacker.direction){
        case(0):
            arcRan = [[0, 1], [1, 1], [1, 0], [-1, 0], [-1, 1]];
            break;
        case(1):
            arcRan = [[0, 1], [1, 1], [1, 0], [1, -1], [-1, 1]];
            break;
        case(2):
            arcRan = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
            break;
        case(3):
            arcRan = [[1, -1], [1, 1], [1, 0], [0, -1], [-1, -1]];
            break;
        case(4):
            arcRan = [[0, -1], [-1, -1], [1, 0], [1, -1], [-1, 0]];
            break;
        case(5):
            arcRan = [[1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
            break;
        case(6):
            arcRan = [[0, -1], [-1, -1], [0, 1], [-1, 0], [-1, 1]];
            break;
        case(7):
            arcRan = [[0, 1], [1, 1], [-1, -1], [-1, 0], [-1, 1]];
            break;
        default:
            break;        
    }

    for(piece of boardState){
        if(piece.color != attacker.color){
            for(mod of arcRan){
                if(piece.locationX == (attacker.locationX + mod[0])){
                    if(piece.locationY == (attacker.locationY + mod[1])){
                        //check if the enemy is facing you
                        switch(attacker.direction){
                            //to be facing each other, the attacker and piece direction must be opposite
                            //the discontinuity is 2, 3, 4, 5
                            case(0):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(3):
                                        break;
                                    case(4):
                                        break;
                                    case(5):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(1):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(4):
                                        break;
                                    case(5):
                                        break;
                                    case(6):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(2):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(5):
                                        break;
                                    case(6):
                                        break;
                                    case(7):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(3):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(6):
                                        break;
                                    case(7):
                                        break;
                                    case(0):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(4):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(7):
                                        break;
                                    case(0):
                                        break;
                                    case(1):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(5):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(0):
                                        break;
                                    case(1):
                                        break;
                                    case(2):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(6):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(1):
                                        break;
                                    case(2):
                                        break;
                                    case(3):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(7):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(2):
                                        break;
                                    case(3):
                                        break;
                                    case(4):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                        }
                    }
                }
            }
        }
    }    

    //legal spell at this point
    let legal = false;
    let hitList = [];
    let boltLine;
    //the bolt runs 8 tiles in a straight line
    //find out which direction the bolt runs
    if(attacker.locationX == blocker.locationX){
        if(attacker.locationY > blocker.locationY){
            boltLine = [0, -1];
        }
        else{
            boltLine = [0, 1];
        }
    }
    else if(attacker.locationX > blocker.locationX){
        //shooting left
        if(attacker.locationY > blocker.locationY){
            boltLine = [-1, -1];
        }
        else if(attacker.locationY < blocker.locationY){
            boltLine = [-1, 1];
        }
        else{
            boltLine = [-1, 0];
        }
    }
    else{
        if(attacker.locationY > blocker.locationY){
            boltLine = [1, -1];
        }
        else if(attacker.locationY < blocker.locationY){
            boltLine = [1, 1];
        }
        else{
            boltLine = [1, 0];
        }
    }
    // it must hit the blocker
    let paladinHit = false;
    for(i=1; i <= 8; i++){
        if(paladinHit){
            break;
        }
        for(piece of boardState){
            if(piece.locationX == (attacker.locationX + i*boltLine[0])){
                if(piece.locationY == (attacker.locationY + i*boltLine[1])){
                    if(piece.id == blockerId){
                        legal = true;
                    }
                    if(piece.name == "paladin"){
                        paladinHit = true;
                        //this will break out of the nearest for loop, which is the piece loop not the line
                    }
                    hitList.push(piece);
                }
            }
        }
    }

    if(!legal){
        console.log("failed to hit target");
        return -1;
    }

    console.log("Rolling to hit");

    //check for bonuses
    let kingAttack = false;
    let queenAttack = false;
    for(piece of boardState){
        if(piece.name == "king"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        kingAttack = true;
                    }
                }
            }
        }
        else if(piece.name == "queen"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        queenAttack = true;
                    }
                }
            }
        }
    }
    // let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
    let hit = [false, false];
    let crit = [false, false];
    let critFail = [false, false];
    let dice;
    for(i = 0; i<2; i++){
        dice = Math.ceil(Math.random() * 20);
        if(dice >= 19){
            hit[i] = true;
            crit[i] = true;
            break;
        }
        if(dice >= attacker.spellDc){
            hit[i] = true;
        }
        if(queenAttack){
            if(dice == 18){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if((dice+1) >= attacker.spellDc){
                hit[i] = true;
                break;
            }
        }
        //at this point, normal hits and queen hits have been done
            //king reroll
        if(!hit[i] && kingAttack){
            kingAttack = false;
            dice = Math.ceil(Math.random() * 20);
            if(dice >= 19){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if(dice >= attacker.spellDc){
                hit[i] = true;
            }
            if(queenAttack){
                if(dice == 18){
                    crit[i] = true;
                    hit[i] = true;
                    break;
                }
                if((dice+1) >= attacker.spellDc){
                    hit[i] = true;
                    break;
                }
            }
        }
        if(dice == 1){
            critFail[i] = true;
        }
    }

    if(critFail[0]){
        //double crit fails kill the user
        if(critFail[1]){
            attacker.destroy();
            await attacker.save();
            return 0;
        }
        //single crit fails the spell
        return 1;
    }
    else if(critFail[1]){
        return 1;
    }
    else if(!hit[0]){
        if(!hit[1]){
            return 1;
        }
    }

    //have hit and crit arrays
    if(crit[0]){
        if(crit[1]){
            for(piece of hitList){
                piece.currentHealth = piece.currentHealth - 6;
                await piece.save();
                await checkPieceKill(piece);
            }
            blocker.destroy();
            await blocker.save();
            return 4;
        }
        for(piece of hitList){
            piece.currentHealth= piece.currentHealth - 6;
            await piece.save();
            await checkPieceKill(piece);
        }
        return 3;
    }
    else if(crit[1]){
        for(piece of hitList){
            piece.currentHealth= piece.currentHealth - 6;
            await piece.save();
            await checkPieceKill(piece);
        }
        return 3;
    }
    else{
        for(piece of hitList){
            piece.currentHealth= piece.currentHealth - 3;
            await piece.save();
            await checkPieceKill(piece);
        }
        return 2;
    }
};

async function fireball(attackerId, blockerId, boardId){
    let attacker = await Piece.findByPk(attackerId);
    let blocker = await Piece.findByPk(blockerId);
    let boardState = await Piece.findAll({
        where:
            {board_id: boardId}
    });

    if(attacker.name != "wizard"){
        console.log("bolt is for wizards!");
        return -1;
    }
    
    //can't cast spells when there is an enemy is in your arc
        //the enemy must also be facing you
    let arcRan = [];
    switch(attacker.direction){
        case(0):
            arcRan = [[0, 1], [1, 1], [1, 0], [-1, 0], [-1, 1]];
            break;
        case(1):
            arcRan = [[0, 1], [1, 1], [1, 0], [1, -1], [-1, 1]];
            break;
        case(2):
            arcRan = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
            break;
        case(3):
            arcRan = [[1, -1], [1, 1], [1, 0], [0, -1], [-1, -1]];
            break;
        case(4):
            arcRan = [[0, -1], [-1, -1], [1, 0], [1, -1], [-1, 0]];
            break;
        case(5):
            arcRan = [[1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
            break;
        case(6):
            arcRan = [[0, -1], [-1, -1], [0, 1], [-1, 0], [-1, 1]];
            break;
        case(7):
            arcRan = [[0, 1], [1, 1], [-1, -1], [-1, 0], [-1, 1]];
            break;
        default:
            break;        
    }

    for(piece of boardState){
        if(piece.color != attacker.color){
            for(mod of arcRan){
                if(piece.locationX == (attacker.locationX + mod[0])){
                    if(piece.locationY == (attacker.locationY + mod[1])){
                        //check if the enemy is facing you
                        switch(attacker.direction){
                            //to be facing each other, the attacker and piece direction must be opposite
                            //the discontinuity is 2, 3, 4, 5
                            case(0):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(3):
                                        break;
                                    case(4):
                                        break;
                                    case(5):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(1):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(4):
                                        break;
                                    case(5):
                                        break;
                                    case(6):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(2):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(5):
                                        break;
                                    case(6):
                                        break;
                                    case(7):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(3):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(6):
                                        break;
                                    case(7):
                                        break;
                                    case(0):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(4):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(7):
                                        break;
                                    case(0):
                                        break;
                                    case(1):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(5):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(0):
                                        break;
                                    case(1):
                                        break;
                                    case(2):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(6):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(1):
                                        break;
                                    case(2):
                                        break;
                                    case(3):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                            case(7):
                                switch(piece.direction){
                                    //each case has 3 legal outcomes and the rest are illegal
                                    case(2):
                                        break;
                                    case(3):
                                        break;
                                    case(4):
                                        break;
                                    //default means that it is illegal, so fail the attack
                                    default:
                                        return -1;
                                }
                                break;
                        }
                    }
                }
            }
        }
    }    

    //legal spell at this point
    let fireLine;
    //the bolt runs 8 tiles in a straight line
    //find out which direction the bolt runs
    if(attacker.locationX == blocker.locationX){
        if(attacker.locationY > blocker.locationY){
            fireLine = [0, -1];
        }
        else{
            fireLine = [0, 1];
        }
    }
    else if(attacker.locationX > blocker.locationX){
        //shooting left
        if(attacker.locationY > blocker.locationY){
            fireLine = [-1, -1];
        }
        else if(attacker.locationY < blocker.locationY){
            fireLine = [-1, 1];
        }
        else{
            fireLine = [-1, 0];
        }
    }
    else{
        if(attacker.locationY > blocker.locationY){
            fireLine = [1, -1];
        }
        else if(attacker.locationY < blocker.locationY){
            fireLine = [1, 1];
        }
        else{
            fireLine = [1, 0];
        }
    }

    //go find the target
    for(i=1; i <=3; i++){
        for(piece of boardState){
            if(piece.locationX == (attacker.locationX + i*fireLine[0])){
                if(piece.locationY == (attacker.locationY + i*fireLine[1])){
                    if(piece.id != blockerId){
                        return -1;
                    }
                }
            }
        }
    }

    //paladins block wizard magic, for reasons
    if(blocker.name == "paladin"){
        return 0;
    }

    //check for bonuses
    let kingAttack = false;
    let queenAttack = false;
    for(piece of boardState){
        if(piece.name == "king"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        kingAttack = true;
                    }
                }
            }
        }
        else if(piece.name == "queen"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        queenAttack = true;
                    }
                }
            }
        }
    }
    // let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
    let hit = [false, false];
    let crit = [false, false];
    let critFail = [false, false];
    let dice;
    for(i = 0; i<2; i++){
        dice = Math.ceil(Math.random() * 20);
        if(dice >= 19){
            hit[i] = true;
            crit[i] = true;
            break;
        }
        if(dice >= attacker.spellDc){
            hit[i] = true;
        }
        if(queenAttack){
            if(dice == 18){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if((dice+1) >= attacker.spellDc){
                hit[i] = true;
                break;
            }
        }
        //at this point, normal hits and queen hits have been done
            //king reroll
        if(!hit[i] && kingAttack){
            kingAttack = false;
            dice = Math.ceil(Math.random() * 20);
            if(dice >= 19){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if(dice >= attacker.spellDc){
                hit[i] = true;
            }
            if(queenAttack){
                if(dice == 18){
                    crit[i] = true;
                    hit[i] = true;
                    break;
                }
                if((dice+1) >= attacker.spellDc){
                    hit[i] = true;
                    break;
                }
            }
        }
        if(dice == 1){
            critFail[i] = true;
        }
    }

    if(critFail[0]){
        //double crit fails kill the user
        if(critFail[1]){
            attacker.destroy();
            await attacker.save();
            return 0;
        }
        //single crit fails the spell
        return 1;
    }
    else if(critFail[1]){
        return 1;
    }
    else if(!hit[0]){
        if(!hit[1]){
            return 1;
        }
    }

    
    //check each of the target's 4 adjacent tiles to splash damage
    let hitList = [blocker];
    for(piece of boardState){
        if(piece.locationX == (blocker.locationX + 1)){
            if(piece.locationY == blocker.locationY){
                hitList.push(piece);
                continue;
            }
        }
        if(piece.locationX == (blocker.locationX - 1)){
            if(piece.locationY == blocker.locationY){
                hitList.push(piece);
                continue;
            }
        }
        if(piece.locationX == (blocker.locationX)){
            if(piece.locationY == (blocker.locationY + 1)){
                hitList.push(piece);
                continue;
            }
        }
        if(piece.locationX == (blocker.locationX)){
            if(piece.locationY == (blocker.locationY - 1)){
                hitList.push(piece);
                continue;
            }
        }
    }

    //manage damage / crits
    if(crit[0]){
        if(crit[1]){
            blocker.destroy();
            await blocker.save();
            for(piece of hitList){
                piece.currentHealth = piece.currentHealth - 4;
                await piece.save();
                await checkPieceKill(piece);
                return 4;
            }
        }
        //normal crit
        blocker.currentHealth = blocker.currentHealth - 6;
        await blocker.save();
        await checkPieceKill(blocker);
        for(piece of hitList){
            piece.currentHealth = piece.currentHealth - 4;
            await piece.save();
            await checkPieceKill(piece);
            return 3;
        }
    }
    if(crit[1]){
        blocker.currentHealth = blocker.currentHealth - 6;
        await blocker.save();
        await checkPieceKill(blocker);
        for(piece of hitList){
            piece.currentHealth = piece.currentHealth - 4;
            await piece.save();
            await checkPieceKill(piece);
            return 3;
        }
    }
    else{
        blocker.currentHealth = blocker.currentHealth - 3;
        await blocker.save();
        await checkPieceKill(blocker);
        for(piece of hitList){
            piece.currentHealth = piece.currentHealth - 2;
            await piece.save();
            await checkPieceKill(piece);
            return 2;
        }
    }
}

async function iceWave(attackerId, boardId){
    let attacker = await Piece.findByPk(attackerId);
    //there is no blocker for ice wave
    let boardState = await Piece.findAll({
        where:
            {board_id: boardId}
    });

    if(attacker.name != "wizard"){
        console.log("bolt is for wizards!");
        return -1;
    }

    //check for bonuses
    let kingAttack = false;
    let queenAttack = false;
    for(piece of boardState){
        if(piece.name == "king"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        kingAttack = true;
                    }
                }
            }
        }
        else if(piece.name == "queen"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        queenAttack = true;
                    }
                }
            }
        }
    }
    // let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
    let hit = [false, false];
    let crit = [false, false];
    let critFail = [false, false];
    let dice;
    for(i = 0; i<2; i++){
        dice = Math.ceil(Math.random() * 20);
        if(dice >= 19){
            hit[i] = true;
            crit[i] = true;
            break;
        }
        if(dice >= attacker.spellDc){
            hit[i] = true;
        }
        if(queenAttack){
            if(dice == 18){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if((dice+1) >= attacker.spellDc){
                hit[i] = true;
                break;
            }
        }
        //at this point, normal hits and queen hits have been done
            //king reroll
        if(!hit[i] && kingAttack){
            kingAttack = false;
            dice = Math.ceil(Math.random() * 20);
            if(dice >= 19){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if(dice >= attacker.spellDc){
                hit[i] = true;
            }
            if(queenAttack){
                if(dice == 18){
                    crit[i] = true;
                    hit[i] = true;
                    break;
                }
                if((dice+1) >= attacker.spellDc){
                    hit[i] = true;
                    break;
                }
            }
        }
        if(dice == 1){
            critFail[i] = true;
        }
    }

    if(critFail[0]){
        //double crit fails kill the user
        if(critFail[1]){
            attacker.destroy();
            await attacker.save();
            return 0;
        }
        //single crit fails the spell
        return 1;
    }
    else if(critFail[1]){
        return 1;
    }
    else if(!hit[0]){
        if(!hit[1]){
            return 1;
        }
    }


        //can always use ice wave, even when in combat
    let hitList = [];
    for(piece of boardState){
        if(Math.abs(piece.locationX - attacker.locationX) <= 1){
            if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                hitList.push(piece);
            }
        }
    }

    //we know it hits, but does it crit/super crit?
    if(crit[0]){
        if(crit[1]){
            for(piece of hitList){
                piece.destroy();
                await piece.save();
            }
            return 4;
        }
        //single crit
        for(piece of hitList){
            piece.currentHealth = 1;
            piece.standing = false;
            piece.frozen = true;
            await checkPieceKill(piece);
            await piece.save();
        }
        return 3;
    }
    else if(crit[1]){
        for(piece of hitList){
            piece.currentHealth = 1;
            piece.standing = false;
            piece.frozen = true;
            await piece.save();
            await checkPieceKill(piece);
        }
        return 3;
    }
    //normal hit now
    else{
        for(piece of hitList){
            if(piece.name != "paladin"){
                piece.currentHealth = piece.currentHealth - 3;
                await piece.save();
                await checkPieceKill(piece);
            }
        }
        return 2;
    }

}

//cleric spells
async function heal(attackerId, blockerId, boardId){
    let attacker = await Piece.findByPk(attackerId);
    let blocker = await Piece.findByPk(blockerId);
    let boardState = await Piece.findAll({
        where:
            {board_id: boardId}
    });

    if(attacker.name != "cleric"){
        console.log("Heal is for clerics.")
        return -1;
    }

    if(!attacker.magical){
        console.log("Cleric lost their magic already");
        return -1;
    }


    //you can heal yourself
    //if not healing self, check legality
    if(attackerId != blockerId){ 
        //heal range is 2
        //check line of sight
        //get vector and then check facing
        let healLine = [];
        let healDir;
        if(attacker.locationX > blocker.locationX){
            // [-1, x]
            if(attacker.locationY > blocker.locationY){
                healLine = [-1, -1];
                healDir = 5;
            }
            else if(attacker.locationY < blocker.locationY){
                healLine = [-1, 1];
                healDir = 7;
            }
            else{
                healDir = 6;
                healLine = [-1, 0];
            }
        }
        else if(attacker.locationX < blocker.locationX){
            // [1, x]
            if(attacker.locationY > blocker.locationY){
                healDir = 3;
                healLine = [1, -1];
            }
            else if(attacker.locationY < blocker.locationY){
                healDir = 1;
                healLine = [1, 1];
            }
            else{
                healDir = 2;
                healLine = [1, 0];
            }
        }
        else{
            if(attacker.locationY > blocker.locationY){
                healDir = 4;
                healLine = [0, -1];
            }
            else {
                healDir = 0;
                healLine = [0, 1];
            }
        }

        //check for legal facing
        let facingLegal = false;
        //switch based off of attacker direction
            //if the attacker direction is withing 2 of bolt dir, it is legal
            //there is a discontinuity at 7/0, so 0,1,6,7 need edge rules

        switch(attacker.direction){
            case(0):
                switch(healDir){
                    case(6):
                        facingLegal = true;
                        break;
                    case(7):
                        facingLegal = true;
                        break;
                    default:
                        if(Math.abs(attacker.direction - healDir) <= 2){
                            facingLegal = true;
                        }
                        break;
                }
                break;
            case(1):
                switch(healDir){
                    case(7):
                        facingLegal = true;
                        break;
                    default:
                        if(Math.abs(attacker.direction - healDir) <= 2){
                            facingLegal = true;
                        }
                        break;
                }
                break;
            case(6):
                switch(healDir){
                    case(0):
                        facingLegal = true;
                        break;
                    default:
                        if(Math.abs(attacker.direction - healDir) <= 2){
                            facingLegal = true;
                        }
                        break;
                }
                break;
            case(7):
                switch(healDir){
                    case(0):
                        facingLegal = true;
                        break;
                    case(1):
                        facingLegal = true;
                        break;
                    default:
                        if(Math.abs(attacker.direction - healDir) <= 2){
                            facingLegal = true;
                        }
                        break;
                }
                break;
            default:
                if(Math.abs(attacker.direction - healDir) <= 2){
                    facingLegal = true;
                }
                break;
        }
        
        if(!facingLegal){
            return -1;
        }

        //get line of sight
        for(i = 1; i < 3; i++){
            for(piece of boardState){
                if(piece.locationX == (attacker.locationX + i*healLine[0])){
                    if(piece.locationY == (attacker.locationY + i*healLine[1])){
                        if(piece.id != blockerId){
                            return -1;
                        }
                    }
                }
            }
        }

        //check for bonuses
        let kingAttack = false;
        let queenAttack = false;
        for(piece of boardState){
            if(piece.name == "king"){
                if(piece.color == attacker.color){
                    if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                        if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                            kingAttack = true;
                        }
                    }
                }
            }
            else if(piece.name == "queen"){
                if(piece.color == attacker.color){
                    if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                        if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                            queenAttack = true;
                        }
                    }
                }
            }
        }
    }

    // let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
        //check for bonuses
    let kingAttack = false;
    let queenAttack = false;
    for(piece of boardState){
        if(piece.name == "king"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        kingAttack = true;
                    }
                }
            }
        }
        else if(piece.name == "queen"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        queenAttack = true;
                    }
                }
            }
        }
    }
    let hit = [false, false];
    let crit = [false, false];
    let critFail = [false, false];
    let dice;
    for(i = 0; i<2; i++){
        dice = Math.ceil(Math.random() * 20);
        if(dice >= 19){
            hit[i] = true;
            crit[i] = true;
            break;
        }
        if(dice >= attacker.spellDc){
            hit[i] = true;
        }
        if(queenAttack){
            if(dice == 18){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if((dice+1) >= attacker.spellDc){
                hit[i] = true;
                break;
            }
        }

        //at this point, normal hits and queen hits have been done
            //king reroll
        if(!hit[i] && kingAttack){
            kingAttack = false;
            dice = Math.ceil(Math.random() * 20);
            if(dice >= 19){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if(dice >= attacker.spellDc){
                hit[i] = true;
            }
            if(queenAttack){
                if(dice == 18){
                    crit[i] = true;
                    hit[i] = true;
                    break;
                }
                if((dice+1) >= attacker.spellDc){
                    hit[i] = true;
                    break;
                }
            }
        }
        if(dice == 1){
            critFail[i] = true;
        }
    }

    if(critFail[0]){
        //double crit fails kill the user
        if(critFail[1]){
            attacker.magical = false;
            await attacker.save();
            return 0;
        }
        //single crit fails the spell
        return 1;
    }
    else if(critFail[1]){
        return 1;
    }
    else if(!hit[0]){
        if(!hit[1]){
            return 1;
        }
    }

    if(crit[0]){
        if(crit[1]){
            blocker.currentHealth = blocker.health;
            await blocker.save();
            return 4;
        }
        else{
            blocker.currentHealth = blocker.currentHealth + 8;
            if(blocker.currentHealth > blocker.health){
                blocker.currentHealth = blocker.health;
            }
            await blocker.save();
            return 3;
        }
    }
    else if(crit[1]){
        blocker.currentHealth = blocker.currentHealth + 8;
        if(blocker.currentHealth > blocker.health){
            blocker.currentHealth = blocker.health;
        }
        await blocker.save();
        return 3;
    }
    else{
        blocker.currentHealth = blocker.currentHealth + 4;
        if(blocker.currentHealth > blocker.health){
            blocker.currentHealth = blocker.health;
        }
        await blocker.save();
        return 2;
    }

}

async function blessedBolt(attackerId, blockerId, boardId){
    let attacker = await Piece.findByPk(attackerId);
    let blocker = await Piece.findByPk(blockerId);
    let boardState = await Piece.findAll({
        where:
            {board_id: boardId}
    });

    if(attacker.name != "cleric"){
        console.log("Heal is for clerics.")
        return -1;
    }
    
    if(!attacker.magical){
        console.log("Cleric lost their magic already");
        return -1;
    }
    
    //bolt range is 2
    //check line of sight
    //get vector and then check facing
    let boltLine = [];
    let boltDir;
    if(attacker.locationX > blocker.locationX){
        // [-1, x]
        if(attacker.locationY > blocker.locationY){
            boltLine = [-1, -1];
            boltDir = 5;
        }
        else if(attacker.locationY < blocker.locationY){
            boltLine = [-1, 1];
            boltDir = 7;
        }
        else{
            boltDir = 6;
            boltLine = [-1, 0];
        }
    }
    else if(attacker.locationX < blocker.locationX){
        // [1, x]
        if(attacker.locationY > blocker.locationY){
            boltDir = 3;
            boltLine = [1, -1];
        }
        else if(attacker.locationY < blocker.locationY){
            boltDir = 1;
            boltLine = [1, 1];
        }
        else{
            boltDir = 2;
            boltLine = [1, 0];
        }
    }
    else{
        if(attacker.locationY > blocker.locationY){
            boltDir = 4;
            boltLine = [0, -1];
        }
        else {
            boltDir = 0;
            boltLine = [0, 1];
        }
    }
    
    //check for legal facing
    let facingLegal = false;
    //switch based off of attacker direction
        //if the attacker direction is withing 2 of bolt dir, it is legal
        //there is a discontinuity at 7/0, so 0,1,6,7 need edge rules
    switch(attacker.direction){
        case(0):
            switch(boltDir){
                case(6):
                    facingLegal = true;
                    break;
                case(7):
                    facingLegal = true;
                    break;
                default:
                    if(Math.abs(attacker.direction - boltDir) <= 2){
                        facingLegal = true;
                    }
                    break;
            }
            break;
        case(1):
            switch(boltDir){
                case(7):
                    facingLegal = true;
                    break;
                default:
                    if(Math.abs(attacker.direction - boltDir) <= 2){
                        facingLegal = true;
                    }
                    break;
            }
            break;
        case(6):
            switch(boltDir){
                case(0):
                    facingLegal = true;
                    break;
                default:
                    if(Math.abs(attacker.direction - boltDir) <= 2){
                        facingLegal = true;
                    }
                    break;
            }
            break;
        case(7):
            switch(boltDir){
                case(0):
                    facingLegal = true;
                    break;
                case(1):
                    facingLegal = true;
                    break;
                default:
                    if(Math.abs(attacker.direction - boltDir) <= 2){
                        facingLegal = true;
                    }
                    break;
            }
            break;
        default:
            if(Math.abs(attacker.direction - boltDir) <= 2){
                facingLegal = true;
            }
            break;
    }
    
    if(!facingLegal){
        return -1;
    }
    
    //get line of sight
    for(i = 1; i < 3; i++){
        for(piece of boardState){
            if(piece.locationX == (attacker.locationX + i*boltLine[0])){
                if(piece.locationY == (attacker.locationY + i*boltLine[1])){
                    if(piece.id != blockerId){
                        return -1;
                    }
                }
            }
        }
    }
    //check for bonuses
    let kingAttack = false;
    let queenAttack = false;
    for(piece of boardState){
        if(piece.name == "king"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        kingAttack = true;
                    }
                }
            }
        }
        else if(piece.name == "queen"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        queenAttack = true;
                    }
                }
            }
        }
    }
    // let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
    let hit = [false, false];
    let crit = [false, false];
    let critFail = [false, false];
    let dice;
    for(i = 0; i<2; i++){
        dice = Math.ceil(Math.random() * 20);
        if(dice >= 19){
            hit[i] = true;
            crit[i] = true;
            break;
        }
        if(dice >= attacker.spellDc){
            hit[i] = true;
        }
        if(queenAttack){
            if(dice == 18){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if((dice+1) >= attacker.spellDc){
                hit[i] = true;
                break;
            }
        }
        //at this point, normal hits and queen hits have been done
            //king reroll
        if(!hit[i] && kingAttack){
            kingAttack = false;
            dice = Math.ceil(Math.random() * 20);
            if(dice >= 19){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if(dice >= attacker.spellDc){
                hit[i] = true;
            }
            if(queenAttack){
                if(dice == 18){
                    crit[i] = true;
                    hit[i] = true;
                    break;
                }
                if((dice+1) >= attacker.spellDc){
                    hit[i] = true;
                    break;
                }
            }
        }
        if(dice == 1){
            critFail[i] = true;
        }
    }

    if(critFail[0]){
        console.log("Crit Fail 0");
        //double crit fails kill the user
        if(critFail[1]){
            console.log("Crit Fail No way!");
            attacker.magical = false;
            await attacker.save();
            return 0;
        }
        //single crit fails the spell
        return 1;
    }
    else if(critFail[1]){
        return 1;
    }
    else if(!hit[0]){
        if(!hit[1]){
            return 1;
        }
    }

    if(crit[0]){
        if(crit[1]){
            blocker.destroy();
            await blocker.save();
            return 4;
        }
        else{
            blocker.currentHealth = blocker.currentHealth - 8;
            await blocker.save();
            await checkPieceKill(piece);
            return 3;
        }
    }
    else if(crit[1]){
        blocker.currentHealth = blocker.currentHealth - 8;
        await blocker.save();
        await checkPieceKill(piece);
        return 3;
    }
    else{
        blocker.currentHealth = blocker.currentHealth - 4;
        await checkPieceKill(piece);
        await blocker.save();
        return 2;
    }  
}

async function transfer(attackerId, blockerId, boardId, attackerFacing, blockerFacing){
    let attacker = await Piece.findByPk(attackerId);
    let blocker = await Piece.findByPk(blockerId);
    let boardState = await Piece.findAll({
        where: {board_id : boardId}
    });

    if(attacker.name != "cleric"){
        console.log("Transfer is for clerics.")
        return -1;
    }

    if(!attacker.magical){
        console.log("Cleric lost their magic already");
        return -1;
    }

    let warpLine = [];
    let warpDir;
    if(attacker.locationX > blocker.locationX){
        // [-1, x]
        if(attacker.locationY > blocker.locationY){
            warpLine = [-1, -1];
            warpDir = 5;
        }
        else if(attacker.locationY < blocker.locationY){
            warpLine = [-1, 1];
            warpDir = 7;
        }
        else{
            warpDir = 6;
            warpLine = [-1, 0];
        }
    }
    else if(attacker.locationX < blocker.locationX){
        // [1, x]
        if(attacker.locationY > blocker.locationY){
            warpDir = 3;
            warpLine = [1, -1];
        }
        else if(attacker.locationY < blocker.locationY){
            warpDir = 1;
            warpLine = [1, 1];
        }
        else{
            warpDir = 2;
            warpLine = [1, 0];
        }
    }
    else{
        if(attacker.locationY > blocker.locationY){
            warpDir = 4;
            warpLine = [0, -1];
        }
        else {
            warpDir = 0;
            warpLine = [0, 1];
        }
    }

    //check for legal facing
    let facingLegal = false;
    //switch based off of attacker direction
        //if the attacker direction is withing 2 of bolt dir, it is legal
        //there is a discontinuity at 7/0, so 0,1,6,7 need edge rules
    switch(attacker.direction){
        case(0):
            switch(warpDir){
                case(6):
                    facingLegal = true;
                    break;
                case(7):
                    facingLegal = true;
                    break;
                default:
                    if(Math.abs(attacker.direction - warpDir) <= 2){
                        facingLegal = true;
                    }
                    break;
            }
            break;
        case(1):
            switch(warpDir){
                case(7):
                    facingLegal = true;
                    break;
                default:
                    if(Math.abs(attacker.direction - warpDir) <= 2){
                        facingLegal = true;
                    }
                    break;
            }
            break;
        case(6):
            switch(warpDir){
                case(0):
                    facingLegal = true;
                    break;
                default:
                    if(Math.abs(attacker.direction - warpDir) <= 2){
                        facingLegal = true;
                    }
                    break;
            }
            break;
        case(7):
            switch(warpDir){
                case(0):
                    facingLegal = true;
                    break;
                case(1):
                    facingLegal = true;
                    break;
                default:
                    if(Math.abs(attacker.direction - warpDir) <= 2){
                        facingLegal = true;
                    }
                    break;
            }
            break;
        default:
            if(Math.abs(attacker.direction - warpDir) <= 2){
                facingLegal = true;
            }
            break;
    }
    

    if(!facingLegal){
        return -1;
    }

    //get line of sight
    for(i = 1; i < 8; i++){
        for(piece of boardState){
            if(piece.locationX == (attacker.locationX + i*warpLine[0])){
                if(piece.locationY == (attacker.locationY + i*warpLine[1])){
                    if(piece.id != blockerId){
                        return 0;
                    }
                }
            }
        }
    }

    //check for bonuses
    let kingAttack = false;
    let queenAttack = false;
    for(piece of boardState){
        if(piece.name == "king"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        kingAttack = true;
                    }
                }
            }
        }
        else if(piece.name == "queen"){
            if(piece.color == attacker.color){
                if(Math.abs(piece.locationX - attacker.locationX) <= 1){
                    if(Math.abs(piece.locationY - attacker.locationY) <= 1){
                        queenAttack = true;
                    }
                }
            }
        }
    }
    // let modifiers = [backstab, queenAttack, queenBlock, kingAttack, kingBlock];
    let hit = [false, false];
    let crit = [false, false];
    let critFail = [false, false];
    let dice;
    for(i = 0; i<2; i++){
        dice = Math.ceil(Math.random() * 20);
        if(dice >= 19){
            hit[i] = true;
            crit[i] = true;
            break;
        }
        if(dice >= attacker.spellDc){
            hit[i] = true;
        }
        if(queenAttack){
            if(dice == 18){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if((dice+1) >= attacker.spellDc){
                hit[i] = true;
                break;
            }
        }
        //at this point, normal hits and queen hits have been done
            //king reroll
        if(!hit[i] && kingAttack){
            kingAttack = false;
            dice = Math.ceil(Math.random() * 20);
            if(dice >= 19){
                crit[i] = true;
                hit[i] = true;
                break;
            }
            if(dice >= attacker.spellDc){
                hit[i] = true;
            }
            if(queenAttack){
                if(dice == 18){
                    crit[i] = true;
                    hit[i] = true;
                    break;
                }
                if((dice+1) >= attacker.spellDc){
                    hit[i] = true;
                    break;
                }
            }
        }
        if(dice == 1){
            critFail[i] = true;
        }
    }

    if(critFail[0]){
        //double crit fails kill the user
        if(critFail[1]){
            attacker.magical = false;
            await attacker.save();
            return 0;
        }
        //single crit fails the spell
        return 1;
    }
    else if(critFail[1]){
        return 1;
    }
    else if(!hit[0]){
        if(!hit[1]){
            return 1;
        }
    }

    //placeholder to store locations in the swap
    let placeholder = [];
    if(crit[0]){
        if(crit[1]){
            //swap the tiles and change their directions
            placeholder[0] = blocker.locationX;
            placeholder[1] = blocker.locationY;
            blocker.locationX = attacker.locationX;
            blocker.locationY = attacker.locationY;
            attacker.locationX = placeholder[0];
            attacker.locationY = placeholder[1];
            attacker.direction = attackerFacing;
            blocker.direction = blockerFacing;

            if(attacker.color == blocker.color){
                blocker.currentHealth = blocker.health;
            }
            else{
                blocker.destroy();
            }
            await attacker.save();
            await blocker.save();
            return 4;
        }
        else{
            placeholder[0] = blocker.locationX;
            placeholder[1] = blocker.locationY;
            blocker.locationX = attacker.locationX;
            blocker.locationY = attacker.locationY;
            attacker.locationX = placeholder[0];
            attacker.locationY = placeholder[1];
            attacker.direction = attackerFacing;
            blocker.direction = blockerFacing;

            if(attacker.color == blocker.color){
                blocker.currentHealth = blocker.currentHealth + 4;
                if(blocker.currentHealth > blocker.health){
                    blocker.currentHealth = blocker.health
                }
            }
            else{
                blocker.currentHealth = blocker.currentHealth - 4;
            }
            await attacker.save();
            await blocker.save();
            return 3;
        }
    }
    else if(crit[1]){
        placeholder[0] = blocker.locationX;
        placeholder[1] = blocker.locationY;
        blocker.locationX = attacker.locationX;
        blocker.locationY = attacker.locationY;
        attacker.locationX = placeholder[0];
        attacker.locationY = placeholder[1];
        attacker.direction = attackerFacing;
        blocker.direction = blockerFacing;

        if(attacker.color == blocker.color){
            blocker.currentHealth = blocker.currentHealth + 4;
            if(blocker.currentHealth > blocker.health){
                blocker.currentHealth = blocker.health
            }
        }
        else{
            blocker.currentHealth = blocker.currentHealth - 4;
        }

        await attacker.save();
        await blocker.save();
        return 3;
    }
    else{
        placeholder[0] = blocker.locationX;
        placeholder[1] = blocker.locationY;
        blocker.locationX = attacker.locationX;
        blocker.locationY = attacker.locationY;
        attacker.locationX = placeholder[0];
        attacker.locationY = placeholder[1];
        attacker.direction = attackerFacing;
        blocker.direction = blockerFacing;

        await attacker.save();
        await blocker.save();
        return 2;
    }  
    
}

module.exports = {attack, lightningBolt, fireball, iceWave, heal, blessedBolt, transfer};
