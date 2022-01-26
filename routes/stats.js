const router = require("express").Router();

const User = require("../models/User");
const Lead = require("../models/Lead");
const Contact = require("../models/Contact");
const ServiceRequest = require("../models/ServiceRequest");

const verifyToken = require("../middlewares/ProtectedRoutes/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const stats = [];

    // GET USERS COUNT
    const users = await User.countDocuments({});
    stats.push({ title: "Users", count: users });

    // GET LEADS COUNT
    const leads = await Lead.countDocuments({});
    stats.push({ title: "Leads", count: leads });

    // GET CONTACTS COUNT
    const contacts = await Contact.countDocuments({});
    stats.push({ title: "Contacts", count: contacts });

    // GET SERVICE REQUESTS COUNT
    const serviceRequests = await ServiceRequest.countDocuments({});
    stats.push({ title: "Service Requests", count: serviceRequests });

    res.json(stats);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
