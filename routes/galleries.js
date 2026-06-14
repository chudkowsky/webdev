const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/galleryController");
const { authenticate } = require("../middleware/authenticate");

/**
 * @swagger
 * /galleries:
 *   get:
 *     summary: Lista wszystkich galerii
 *     tags: [Galleries]
 *     responses:
 *       200:
 *         description: Strona z listą galerii
 */
router.get("/", galleryController.getGalleries);

/**
 * @swagger
 * /galleries/gallery_add:
 *   get:
 *     summary: Formularz dodawania galerii
 *     tags: [Galleries]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Formularz dodawania galerii
 *   post:
 *     summary: Dodanie nowej galerii
 *     tags: [Galleries]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               owner:
 *                 type: string
 *                 description: ID właściciela (tylko admin)
 *     responses:
 *       302:
 *         description: Przekierowanie do listy galerii
 */
router.get("/gallery_add", authenticate, galleryController.getGalleryAdd);
router.post("/gallery_add", authenticate, galleryController.postGalleryAdd);

/**
 * @swagger
 * /galleries/{id}:
 *   get:
 *     summary: Szczegóły galerii
 *     tags: [Galleries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Strona ze szczegółami galerii
 */
router.get("/:id", galleryController.getGallery);

/**
 * @swagger
 * /galleries/{id}/edit:
 *   get:
 *     summary: Formularz edycji galerii
 *     tags: [Galleries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Formularz edycji galerii
 *   post:
 *     summary: Aktualizacja galerii
 *     tags: [Galleries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Przekierowanie do listy galerii
 */
router.get("/:id/edit", authenticate, galleryController.getGalleryEdit);
router.post("/:id/edit", authenticate, galleryController.postGalleryEdit);

/**
 * @swagger
 * /galleries/{id}/delete:
 *   post:
 *     summary: Usunięcie galerii
 *     tags: [Galleries]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Przekierowanie do listy galerii
 */
router.post("/:id/delete", authenticate, galleryController.postGalleryDelete);

module.exports = router;
