// scripts/generateResetTokens.js
const crypto = require("crypto");
const db = require("../database/db"); // Ajusta ruta si necesario

async function generateAndSaveTokenForUser(email) {
  try {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hora

    // Guarda en la DB
    await db.query(
      "UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3",
      [resetToken, resetTokenExpiration, email]
    );

    console.log(`Token generado para ${email}: ${resetToken}`);
  } catch (err) {
    console.error("Error generando token:", err);
  }
}

// Ejemplo: generar para varios usuarios
async function main() {
  const users = [
    "a01234644@gmail.com",
  ];

  for (const email of users) {
    await generateAndSaveTokenForUser(email);
  }

  process.exit();
}

main();