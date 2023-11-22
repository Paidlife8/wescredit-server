const { Schema, default: mongoose } = require("mongoose");

const AdminSchema = new Schema({
  email: {
    required: true,
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
