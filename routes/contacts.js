const router = require("express").Router();

const Contact = require("../models/Contact");
const verifyToken = require("../middlewares/ProtectedRoutes/verifyToken");

// GET ALL CONTACT
router.get("/", verifyToken, async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.json(error);
  }
});

// ADD NEW CONTACT
router.post("/", verifyToken, async (req, res) => {
  try {
    const contact = new Contact({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
    });
    await contact.save();
    res.status(201).json({ message: "Contact added successfully" });
  } catch (error) {
    res.json(error);
  }
});

// GET SINGLE CONTACT
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    const contact = await Contact.findById(id);
    if (!contact) res.sendStatus(400);
    res.json(contact);
  } catch (error) {
    res.json(error);
  }
});

// UPDATE SINGLE CONTACT
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    await Contact.findByIdAndUpdate(id, req.body);
    res.json({ message: "Contact updated successfully" });
  } catch (error) {
    res.json(error);
  }
});

// DELETE SINGLE CONTACT
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    await Contact.findByIdAndDelete(id);
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
