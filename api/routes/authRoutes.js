const {
  register,
  login,
  activate,
  protect,
  getProfile,
} = require("../controllers/authController");

const router = require("express").Router();

router.post("/register", register);
// router.get("/activate/:token", activate);
router.post("/login", login);
router.get("/profile", protect, getProfile);

module.exports = router;
