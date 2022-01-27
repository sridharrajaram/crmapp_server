const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const leadsRoute = require("./routes/leads");
const contactsRoute = require("./routes/contacts");
const serviceRequestsRoute = require("./routes/serviceRequests");
const statsRoute = require("./routes/stats");

const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN;
const DB_HOST = process.env.DB_HOST;

mongoose.connect(
  DB_HOST,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to DB");
  }
);

const corsOptions = {
  origin: ORIGIN,
  optionsSuccessStatus: 200, // for some legacy browsers
};

// configure express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(cors(corsOptions));
app.use(helmet());
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/leads", leadsRoute);
app.use("/api/contacts", contactsRoute);
app.use("/api/serviceRequests", serviceRequestsRoute);
app.use("/api/stats", statsRoute);

app.get("/", (req, res) => {
  res.send("Welcome to CRM Application!!!");
});

app.listen(PORT, () => {
  console.log("Server up and listening on port " + PORT);
});
