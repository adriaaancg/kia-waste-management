const db = require("../database/db");

exports.findByUsernameOrEmail = async (username, email) => {
  const result = await db.query(
    "SELECT * FROM users WHERE username = $1 OR email = $2",
    [username, email]
  );
  return result.rows[0];
};

exports.createUser = async ({ name, firstSurname, secondSurname, username, email, password }) => {
  const result = await db.query(
    `INSERT INTO users (name, first_surname, second_surname, username, email, password)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, username, email, created_at`,
    [name, firstSurname, secondSurname, username, email, password]
  );
  return result.rows[0];
};

exports.findByUsername = async (username) => {
  const result = await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0];
};

// NUEVAS FUNCIONES PARA FORGOT PASSWORD

// Buscar usuario por email
exports.findByEmail = async (email) => {
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

// Guardar token y fecha de expiración para recuperación
exports.saveResetToken = async (userId, token, expiration) => {
  await db.query(
    "UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE id = $3",
    [token, expiration, userId]
  );
};

// Buscar usuario por token de reset
exports.findByResetToken = async (token) => {
  const result = await db.query(
    "SELECT * FROM users WHERE reset_token = $1",
    [token]
  );
  return result.rows[0];
};

// Actualizar contraseña del usuario
exports.updatePassword = async (userId, hashedPassword) => {
  await db.query(
    "UPDATE users SET password = $1 WHERE id = $2",
    [hashedPassword, userId]
  );
};

// Limpiar token y expiración después de resetear contraseña
exports.clearResetToken = async (userId) => {
  await db.query(
    "UPDATE users SET reset_token = NULL, reset_token_expiration = NULL WHERE id = $1",
    [userId]
  );
};