const Image = require("../models/image");
const Gallery = require("../models/gallery");
const Comment = require("../models/comment");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

exports.upload = upload.single("image");

const generateThumbnail = async (filename) => {
  const src = path.join("public/uploads", filename);
  const dest = path.join("public/uploads/thumbnails", filename);
  await sharp(src).resize(300, 200, { fit: "cover" }).toFile(dest);
};

// GET - lista obrazków w galerii
exports.getImages = async (req, res) => {
  const gallery = await Gallery.findById(req.params.galleryId).populate("owner", "username");
  if (!gallery) return res.render("info", { title: "Info", messages: ["Nie znaleziono galerii!"] });
  const images = await Image.find({ gallery: req.params.galleryId }).populate("owner", "username");
  res.render("images", { title: gallery.name, gallery, images });
};

// GET - formularz dodawania obrazka
exports.getImageAdd = async (req, res) => {
  const gallery = await Gallery.findById(req.params.galleryId);
  if (!gallery) return res.render("info", { title: "Info", messages: ["Nie znaleziono galerii!"] });
  if (gallery.owner.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }
  res.render("image_form", { title: "Dodaj zdjęcie", gallery });
};

// POST - dodawanie obrazka
exports.postImageAdd = async (req, res) => {
  const gallery = await Gallery.findById(req.params.galleryId);
  if (!gallery) return res.render("info", { title: "Info", messages: ["Nie znaleziono galerii!"] });
  if (gallery.owner.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }
  if (!req.file) {
    return res.render("image_form", { title: "Dodaj zdjęcie", messages: ["Nie przesłano pliku!"] });
  }

  try {
    await generateThumbnail(req.file.filename);
    const image = new Image({
      title: req.body.title,
      description: req.body.description,
      filename: req.file.filename,
      gallery: req.params.galleryId,
      owner: req.user.id,
    });
    await image.save();
    res.redirect(`/galleries/${req.params.galleryId}/images`);
  } catch (err) {
    res.render("image_form", { title: "Dodaj zdjęcie", messages: [err.message] });
  }
};

// GET - szczegóły obrazka
exports.getImage = async (req, res) => {
  const image = await Image.findById(req.params.id).populate("owner", "username");
  if (!image) return res.render("info", { title: "Info", messages: ["Nie znaleziono zdjęcia!"] });
  const comments = await Comment.find({ image: req.params.id }).populate("author", "username");
  res.render("image", { title: image.title, image, comments });
};

// GET - formularz edycji obrazka
exports.getImageEdit = async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) return res.render("info", { title: "Info", messages: ["Nie znaleziono zdjęcia!"] });

  if (image.owner.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }

  res.render("image_form", { title: "Edytuj zdjęcie", image, gallery: { _id: image.gallery } });
};

// POST - edycja obrazka
exports.postImageEdit = async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) return res.render("info", { title: "Info", messages: ["Nie znaleziono zdjęcia!"] });

  if (image.owner.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }

  image.title = req.body.title;
  image.description = req.body.description;
  await image.save();
  res.redirect(`/galleries/${image.gallery}/images`);
};

// POST - usuwanie obrazka
exports.postImageDelete = async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) return res.render("info", { title: "Info", messages: ["Nie znaleziono zdjęcia!"] });

  if (image.owner.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }

  const galleryId = image.gallery;
  await Comment.deleteMany({ image: image._id });
  fs.unlink(path.join("public/uploads", image.filename), () => {});
  fs.unlink(path.join("public/uploads/thumbnails", image.filename), () => {});
  await image.deleteOne();
  res.redirect(`/galleries/${galleryId}/images`);
};
