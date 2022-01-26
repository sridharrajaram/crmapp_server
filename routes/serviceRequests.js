const router = require("express").Router();

const ServiceRequest = require("../models/ServiceRequest");
const verifyToken = require("../middlewares/ProtectedRoutes/verifyToken");

// GET ALL SERVICE REQUESTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find();
    res.json(serviceRequests);
  } catch (error) {
    res.json(error);
  }
});

// ADD NEW SERVICE REQUEST
router.post("/", verifyToken, async (req, res) => {
  try {
    const serviceRequest = new ServiceRequest({
      requestedBy: req.body.requestedBy,
      subject: req.body.subject,
      assigned: req.body.assigned,
      priority: req.body.priority,
      status: req.body.status,
      createdAt: new Date(req.body.createdAt),
      dueDate: new Date(req.body.dueDate),
    });
    await serviceRequest.save();
    res.status(201).json({ message: "Service Request added successfully" });
  } catch (error) {
    res.json(error);
  }
});

// GET SINGLE SERVICE REQUEST
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) res.sendStatus(400);
    res.json(serviceRequest);
  } catch (error) {
    res.json(error);
  }
});

// UPDATE SINGLE SERVICE REQUEST
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    await ServiceRequest.findByIdAndUpdate(id, req.body);
    res.json({ message: "Service Request updated successfully" });
  } catch (error) {
    res.json(error);
  }
});

// DELETE SINGLE SERVICE REQUEST
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendStatus(400);
    }
    await ServiceRequest.findByIdAndDelete(id);
    res.json({ message: "Service Request deleted successfully" });
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
