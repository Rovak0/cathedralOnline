const router = require('express').Router();

const requestsRoutes = require("./requests");
router.use("/requests", requestsRoutes);

module.exports = router;