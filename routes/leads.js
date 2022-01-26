const router = require("express").Router();

const Lead = require("../models/Lead");
const verifyToken = require("../middlewares/ProtectedRoutes/verifyToken");

// GET ALL LEADS
router.get("/", verifyToken, async (req, res) => {
  try {
    const leads = await Lead.find();
    res.json(leads);
  } catch (error) {
    res.json(error);
  }
});

// ADD NEW LEAD
router.post("/", verifyToken, async (req, res) => {
  try {
    const lead = new Lead({
      company: req.body.company,
      location: req.body.location,
      date: new Date(req.body.date),
      status: req.body.status,
    });
    await lead.save();
    res.status(201).json({ message: "Lead added successfully" });
  } catch (error) {
    res.json(error);
  }
});

// GET SINGLE LEAD
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    const lead = await Lead.findById(id);
    if (!lead) res.sendStatus(400);
    res.json(lead);
  } catch (error) {
    res.json(error);
  }
});

// UPDATE SINGLE LEAD
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    await Lead.findByIdAndUpdate(id, req.body);
    res.json({ message: "Lead updated successfully" });
  } catch (error) {
    res.json(error);
  }
});

// DELETE SINGLE LEAD
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    await Lead.findByIdAndDelete(id);
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
