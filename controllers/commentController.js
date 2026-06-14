const Comment = require("../models/comment");
const Image = require("../models/image");

// POST - dodawanie komentarza
exports.postCommentAdd = async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) return res.render("info", { title: "Info", messages: ["Nie znaleziono zdjęcia!"] });

    const comment = new Comment({
      text: req.body.text,
      image: req.params.imageId,
      author: req.user.id,
    });
    await comment.save();
    res.redirect(`/galleries/${image.gallery}/images/${req.params.imageId}`);
  } catch (err) {
    res.render("info", { title: "Info", messages: [err.message] });
  }
};

// POST - usuwanie komentarza
exports.postCommentDelete = async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate("image");
  if (!comment) return res.render("info", { title: "Info", messages: ["Nie znaleziono komentarza!"] });

  if (comment.author.toString() !== req.user.id && req.loggedUser !== "admin") {
    return res.render("info", { title: "Info", messages: ["Brak uprawnień!"] });
  }

  const galleryId = comment.image.gallery;
  const imageId = comment.image._id;
  await comment.deleteOne();
  res.redirect(`/galleries/${galleryId}/images/${imageId}`);
};
