const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
const userRoutes = require("./routes/user.routes");
app.use("/api/users", userRoutes);

const dashboardRoutes = require("./routes/dashboard.routes");
app.use("/api", dashboardRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});