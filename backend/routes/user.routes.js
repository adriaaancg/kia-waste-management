const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");

// Rate limiter para endpoints sensibles
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 peticiones por IP
  message: { message: "Too many requests, please try again later." },
});

// Validaciones para signup
const signupValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("firstSurname").notEmpty().withMessage("First surname is required"),
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

// Middleware para manejar errores de validación
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
}

// Rutas con validación y rate limit
router.post("/signup", limiter, signupValidation, validate, userController.signup);
router.post("/login", limiter, userController.login);
router.post("/forgot-password", limiter, userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;