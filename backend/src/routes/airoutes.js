const express = require("express");
const aicontrollers = require("../controllers/aicontrollers");
const router = express.Router();

router.get("/get-response", aicontrollers);

module.exports = router;
