const jwt = require("jsonwebtoken");

const JWT_SECRET = "gallery_secret_key";

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.mytoken;
    const decode = jwt.verify(token, JWT_SECRET);
    req.user = decode;
    req.loggedUser = decode.username;
    next();
  } catch (err) {
    res.render("info", { title: "Info", messages: ["Musisz być zalogowany!"] });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.loggedUser === "admin") return next();
  res.render("info", { title: "Info", messages: ["Wymagany dostęp administratora!"] });
};

module.exports = { authenticate, requireAdmin, JWT_SECRET };
