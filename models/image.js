const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  title: { type: String, maxLength: 200, required: true },
  description: { type: String, maxLength: 500 },
  filename: { type: String, required: true },
  gallery: { type: mongoose.Schema.Types.ObjectId, ref: "Gallery", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploaded_at: { type: Date, default: Date.now },
}, { collection: "images" });

module.exports = mongoose.model("Image", ImageSchema);
