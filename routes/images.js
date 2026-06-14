const express = require("express");
const router = express.Router({ mergeParams: true });
const imageController = require("../controllers/imageController");
const { authenticate } = require("../middleware/authenticate");

/**
 * @swagger
 * /galleries/{galleryId}/images:
 *   get:
 *     summary: Lista obrazków w galerii
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Strona z listą obrazków
 */
router.get("/", imageController.getImages);

/**
 * @swagger
 * /galleries/{galleryId}/images/image_add:
 *   get:
 *     summary: Formularz dodawania obrazka
 *     tags: [Images]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Formularz dodawania obrazka
 *   post:
 *     summary: Upload obrazka do galerii
 *     tags: [Images]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       302:
 *         description: Przekierowanie do listy obrazków
 */
router.get("/image_add", authenticate, imageController.getImageAdd);
router.post("/image_add", authenticate, imageController.upload, imageController.postImageAdd);

/**
 * @swagger
 * /galleries/{galleryId}/images/{id}:
 *   get:
 *     summary: Szczegóły obrazka z komentarzami
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Strona ze szczegółami obrazka
 */
router.get("/:id", imageController.getImage);
router.get("/:id/edit", authenticate, imageController.getImageEdit);
router.post("/:id/edit", authenticate, imageController.postImageEdit);
router.post("/:id/delete", authenticate, imageController.postImageDelete);

module.exports = router;
