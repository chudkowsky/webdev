const express = require("express");
const router = express.Router({ mergeParams: true });
const commentController = require("../controllers/commentController");
const { authenticate } = require("../middleware/authenticate");

/**
 * @swagger
 * /galleries/{galleryId}/images/{imageId}/comments:
 *   post:
 *     summary: Dodanie komentarza do obrazka
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie do strony obrazka
 */
router.post("/", authenticate, commentController.postCommentAdd);

/**
 * @swagger
 * /galleries/{galleryId}/images/{imageId}/comments/{id}/delete:
 *   post:
 *     summary: Usunięcie komentarza
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Przekierowanie do strony obrazka
 */
router.post("/:id/delete", authenticate, commentController.postCommentDelete);

module.exports = router;
