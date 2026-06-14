const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
  name: { type: String, maxLength: 200, required: true },
  description: { type: String, maxLength: 500 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { collection: "galleries" });

module.exports = mongoose.model("Gallery", GallerySchema);
