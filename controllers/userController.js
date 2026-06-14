const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Gallery = require("../models/gallery");
const Image = require("../models/image");
const Comment = require("../models/comment");
const { JWT_SECRET } = require("../middleware/authenticate");

// GET - formularz rejestracji
exports.getUserRegister = (req, res) => {
  res.render("user_register_form", { title: "Rejestracja" });
};

// POST - obsługa rejestracji
exports.postUserRegister = async (req, res) => {
  try {
    const { first_name, last_name, username, password } = req.body;

    const userCount = await User.countDocuments();
    if (userCount === 0 && username !== "admin") {
      return res.render("user_register_form", {
        title: "Rejestracja",
        messages: ["Pierwszy zarejestrowany użytkownik musi mieć nazwę 'admin'!"],
      });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.render("user_register_form", {
        title: "Rejestracja",
        messages: ["Nazwa użytkownika jest już zajęta!"],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ first_name, last_name, username, password: passwordHash });
    await user.save();

    res.redirect("/users/user_login");
  } catch (err) {
    res.render("user_register_form", { title: "Rejestracja", messages: [err.message] });
  }
};

// GET - formularz logowania
exports.getUserLogin = (req, res) => {
  res.render("user_login_form", { title: "Logowanie" });
};

// POST - obsługa logowania
exports.postUserLogin = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.render("user_login_form", {
      title: "Logowanie",
      messages: ["Nie znaleziono użytkownika!"],
    });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.render("user_login_form", {
        title: "Logowanie",
        messages: ["Błąd weryfikacji hasła!"],
      });
    }
    if (result) {
      const token = jwt.sign({ username: user.username, id: user._id }, JWT_SECRET, { expiresIn: "10m" });
      res.cookie("mytoken", token, { maxAge: 600000 });
      res.redirect("/");
    } else {
      res.render("user_login_form", { title: "Logowanie", messages: ["Nieprawidłowe hasło!"] });
    }
  });
};

// GET - wylogowanie
exports.getUserLogout = (req, res) => {
  res.clearCookie("mytoken");
  res.redirect("/");
};

// GET - lista użytkowników (admin)
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.render("users", { title: "Zarządzanie użytkownikami", users });
};

// GET - formularz dodawania użytkownika przez admina
exports.getAdminUserAdd = (req, res) => {
  res.render("user_register_form", { title: "Dodaj użytkownika", adminMode: true });
};

// POST - dodawanie użytkownika przez admina
exports.postAdminUserAdd = async (req, res) => {
  try {
    const { first_name, last_name, username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      return res.render("user_register_form", {
        title: "Dodaj użytkownika",
        adminMode: true,
        messages: ["Nazwa użytkownika jest już zajęta!"],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ first_name, last_name, username, password: passwordHash });
    await user.save();
    res.redirect("/users");
  } catch (err) {
    res.render("user_register_form", { title: "Dodaj użytkownika", adminMode: true, messages: [err.message] });
  }
};

// POST - usuwanie użytkownika przez admina (kaskadowo)
exports.postAdminUserDelete = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.render("info", { title: "Info", messages: ["Nie znaleziono użytkownika!"] });
  if (user.username === "admin") {
    return res.render("info", { title: "Info", messages: ["Nie można usunąć administratora!"] });
  }

  const galleries = await Gallery.find({ owner: user._id });
  for (const gallery of galleries) {
    const images = await Image.find({ gallery: gallery._id });
    for (const image of images) {
      await Comment.deleteMany({ image: image._id });
    }
    await Image.deleteMany({ gallery: gallery._id });
    await gallery.deleteOne();
  }
  await Comment.deleteMany({ author: user._id });
  await user.deleteOne();
  res.redirect("/users");
};
