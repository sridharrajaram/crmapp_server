const jwt = require("jsonwebtoken");

const User = require("../../models/User");

async function verifyToken(req, res, next) {
  const id = req.params.id;
  const token = req.params.token;

  if (!id || !token) {
    res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    // Check if user exists in DB
    const userMatch = await User.findOne({ _id: id });
    if (!userMatch) {
      return res.status(401).send("Access Denied");
    }

    req.user = userMatch;
    next();
  } catch (error) {
    res.status(401).send("Access Denied");
  }
}

module.exports = verifyToken;
