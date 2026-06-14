const Gallery = require("../models/gallery");
const Image = require("../models/image");
const Comment = require("../models/comment");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

// GET - lista galerii
exports.getGalleries = async (req, res) => {
  const galleries = await Gallery.find().populate("owner", "username");
  const previews = {};
  for (const g of galleries) {
    const img = await Image.findOne({ gallery: g._id });
    if (img) previews[g._id] = img.filename;
  }
  res.render("galleries", { title: "Galleries", galleries, previews });
};

// GET - formularz dodawania galerii
exports.getGalleryAdd = async (req, res) => {
  const users = req.loggedUser === "admin" ? await User.find() : [];
  res.render("gallery_form", { title: "Dodaj galerię", users });
};

// POST - dodawanie galerii
exports.postGalleryAdd = async (req, res) => {
  const { name, description } = req.body;
  let ownerId = req.user.id;

  if (req.loggedUser === "admin" && req.body.owner) {
    ownerId = req.body.owner;
  }

  try {
    const gallery = new Gallery({ name, description, owner: ownerId });
    await gallery.save();
    res.redirect("/galleries");
  } catch (err) {
    res.render("gallery_form", { title: "Dodaj galerię", messages: [err.message] });
  }
};

// GET - szczegóły galerii
exports.getGallery = async (req, res) => {
  const gallery = await Gallery.findById(req.params.id).populate("owner", "username");
  if (!gallery) return res.render("info", { title: "Info", messages: ["Nie znaleziono galerii!"] });
  res.render("gallery", { title: gallery.name, gallery });
};

// GET - formularz edycji galerii
exports.getGalleryEdit = async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  if (!gallery) return res.render("info", { title: "Info", messages: ["Nie znaleziono galerii!"] });

  if (gallery.owner.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }

  res.render("gallery_form", { title: "Edytuj galerię", gallery });
};

// POST - edycja galerii
exports.postGalleryEdit = async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  if (!gallery) return res.render("info", { title: "Info", messages: ["Nie znaleziono galerii!"] });

  if (gallery.owner.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }

  gallery.name = req.body.name;
  gallery.description = req.body.description;
  await gallery.save();
  res.redirect("/galleries");
};

// POST - usuwanie galerii
exports.postGalleryDelete = async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  if (!gallery) return res.render("info", { title: "Info", messages: ["Nie znaleziono galerii!"] });

  if (gallery.owner.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }

  const images = await Image.find({ gallery: gallery._id });
  for (const image of images) {
    await Comment.deleteMany({ image: image._id });
    fs.unlink(path.join("public/uploads", image.filename), () => {});
    fs.unlink(path.join("public/uploads/thumbnails", image.filename), () => {});
  }
  await Image.deleteMany({ gallery: gallery._id });
  await gallery.deleteOne();
  res.redirect("/galleries");
};
