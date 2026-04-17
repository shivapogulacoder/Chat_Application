const mongoose = require("mongoose");

// Schema define
const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

// Model create
module.exports = mongoose.model("Message", messageSchema);