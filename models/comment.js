const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: { type: String, maxLength: 1000, required: true },
  image: { type: mongoose.Schema.Types.ObjectId, ref: "Image", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now },
}, { collection: "comments" });

module.exports = mongoose.model("Comment", CommentSchema);
