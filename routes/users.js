const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, requireAdmin } = require("../middleware/authenticate");

/**
 * @swagger
 * /users/user_register:
 *   get:
 *     summary: Formularz rejestracji
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Strona z formularzem rejestracji
 *   post:
 *     summary: Rejestracja nowego użytkownika
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie do strony logowania
 */
router.get("/user_register", userController.getUserRegister);
router.post("/user_register", userController.postUserRegister);

/**
 * @swagger
 * /users/user_login:
 *   get:
 *     summary: Formularz logowania
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Strona z formularzem logowania
 *   post:
 *     summary: Logowanie użytkownika
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie do strony głównej po pomyślnym logowaniu
 */
router.get("/user_login", userController.getUserLogin);
router.post("/user_login", userController.postUserLogin);

/**
 * @swagger
 * /users/user_logout:
 *   get:
 *     summary: Wylogowanie użytkownika
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Przekierowanie do strony głównej
 */
router.get("/user_logout", userController.getUserLogout);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista użytkowników (tylko admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Strona z listą użytkowników
 */
router.get("/", authenticate, requireAdmin, userController.getUsers);

/**
 * @swagger
 * /users/user_add:
 *   get:
 *     summary: Formularz dodawania użytkownika (tylko admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Formularz dodawania użytkownika
 *   post:
 *     summary: Dodanie nowego użytkownika (tylko admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie do listy użytkowników
 */
router.get("/user_add", authenticate, requireAdmin, userController.getAdminUserAdd);
router.post("/user_add", authenticate, requireAdmin, userController.postAdminUserAdd);

/**
 * @swagger
 * /users/{id}/delete:
 *   post:
 *     summary: Usunięcie użytkownika (tylko admin)
 *     tags: [Users]
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
 *         description: Przekierowanie do listy użytkowników
 */
router.post("/:id/delete", authenticate, requireAdmin, userController.postAdminUserDelete);

module.exports = router;
