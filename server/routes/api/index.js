const router = require('express').Router();

const requestsRoutes = require("./requests");
router.use("/requests", requestsRoutes);

const postRoutes = require("./posts");
router.use("/posts", postRoutes);

module.exports = router;