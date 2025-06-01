const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail({ to, subject, text, html }) {
  // Configura el transporte SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail", // puedes cambiarlo si usas otro servicio
    auth: {
      user: process.env.EMAIL_USER,     // tu email (desde .env)
      pass: process.env.EMAIL_PASS,     // tu contraseña o app password (desde .env)
    },
  });

  // Opciones del email
  const mailOptions = {
    from: `"KIA Waste Management" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,   // texto plano
    html,   // contenido html (opcional)
  };

  // Envía el email
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;