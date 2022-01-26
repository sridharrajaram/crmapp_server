const jwt = require("jsonwebtoken");

const User = require("../../models/User");

// Format of token
// Authorization: Bearer <token>

async function auth(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers.authorization;
  if (bearerHeader != undefined) {
    try {
      const token = bearerHeader.split(" ")[1];
      const verified = jwt.verify(token, process.env.TOKEN_SECRET);
      // Check if user exists in DB
      const userMatch = await User.findOne({ _id: verified._id });
      if (!userMatch) {
        return res.status(403).send("Access Denied");
      }
      req.user = userMatch;
      next();
    } catch (error) {
      res.status(403).send("Access Denied");
    }
  } else {
    res.status(403).send("Access Denied");
  }
}

module.exports = auth;
