const router = require("express").Router();

const User = require("../models/User");
const verifyToken = require("../middlewares/ProtectedRoutes/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
