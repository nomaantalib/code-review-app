const express = require("express");
const aicontrollers = require("../controllers/aicontrollers");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
const cors = require("cors");
router.use(cors());

// Conditional auth middleware - only require auth for non-default code
const conditionalAuth = (req, res, next) => {
  const { code } = req.body;
  const defaultCode = ` function sum() {
  return 1 + 1
}`;
  const isDefaultCode = code && code.trim() === defaultCode.trim();

  // Skip auth for default code
  if (isDefaultCode) {
    return next();
  }

  // Require auth for custom code
  return authMiddleware(req, res, next);
};

router.post("/get-review", conditionalAuth, aicontrollers);
module.exports = router;
