const router = require('express').Router();

const requestsRoutes = require("./requests");
router.use("/requests", requestsRoutes);

const postRoutes = require("./posts");
router.use("/posts", postRoutes);

const pieceRoutes = require('./pieceRoutes');
router.use('/pieces', pieceRoutes);

module.exports = router;