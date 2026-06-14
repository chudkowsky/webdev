const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "Archive" });
});

router.get("/docs", function (req, res, next) {
  res.render("docs", { title: "Documentation" });
});

module.exports = router;
