const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userModel = require("../models/user.model");
const sendEmail = require("../utils/sendEmail"); // Función para enviar emails (debes implementarla)

exports.signup = async (req, res) => {
  console.log("Signup request body:", req.body);

  const {
    name,
    firstSurname,
    secondSurname,
    username,
    email,
    password,
    confirmPassword
  } = req.body;

  try {
    // Verificar campos requeridos
    if (!name || !firstSurname || !username || !email || !password || !confirmPassword) {
      console.log("Validation failed: missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Confirmar contraseña
    if (password !== confirmPassword) {
      console.log("Validation failed: passwords do not match");
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validar longitud mínima
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validar si username o email ya existen
    const existingUser = await userModel.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.createUser({
      name,
      firstSurname,
      secondSurname,
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// NUEVO: Solicitar reset password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "If this email exists in our system, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hora

    await userModel.saveResetToken(user.id, resetToken, resetTokenExpiration);

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${resetUrl}`,
    });

    res.json({ message: "Reset password email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// NUEVO: Resetear contraseña
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await userModel.findByResetToken(token);
    if (!user || user.reset_token_expiration < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.updatePassword(user.id, hashedPassword);
    await userModel.clearResetToken(user.id);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};