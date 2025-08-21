const express = require("express");
const aicontrollers = require("../controllers/aicontrollers");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
const cors = require("cors");
router.use(cors());

//router.get("/get-response", aicontrollers);
router.post("/get-review", authMiddleware, aicontrollers);
module.exports = router;
