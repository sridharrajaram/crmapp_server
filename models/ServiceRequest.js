const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  assigned: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
