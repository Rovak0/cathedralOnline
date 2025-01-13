const router = require('express').Router();

const {Board, Piece, Player} = require("../../models");

router.post("/create", async (req,res) => {
    try{
        if((!req.body.username) || (!req.body.password)){
            res.status(400).json('Missing data'); //code 206 is missing data
            return;
        }
        console.log("creating");
        const userData = await Player.create(req.body);
        console.log("Player made");
        res.status(200).json(userData);
        return;
    }
    catch (err){
        res.status(500).json("Testing end routes");
    }
});

//make a login function
router.post("/login", async (req, res) => { 
    try{
        // console.log('login stuff');
        // console.log(req.body);
        //will have a username and a password
        const searchUser = await Player.findOne(
            {
                where: {
                    username : req.body.username
                }
            }
        );
        const passCheck = searchUser.checkPassword(req.body.password);
        // console.log(passCheck);
        if ((searchUser.name === req.body.name)&&passCheck){
            //put the loginedIn = true here
            // console.log("Hi");
            // console.log(req.session.logged_in);
            // req.session.logged_in = true;
            // console.log('logged in');
            // req.session.user_id = searchUser.id;
            // console.log('session id');
            // req.session.save(() => {});
            // console.log('session save');
            // res.json({answer : 'pass'});

            //I need to send back the user info, and the client side saves it
            //I just need to send back the user id
            res.status(200).json(searchUser.id);
            return;
        }
        else{
            res('false');
        }
    }
    catch (err){
        res.status(400).json(err);
    }
});

router.post("/dropQueue", async (req, res) => {
    let user = req.body.user;
    try{
        user = await Player.findByPk(user);
        user.inQueue = false;
        await user.save();
        res.status(200).json("Dropped from queue");
    }
    catch(err){
        console.log(err);
        res.status(500).json(err);
        return;
    }
});

module.exports = router;