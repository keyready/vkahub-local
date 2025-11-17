const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const { sequelize } = require("./db.js");
const notificationRoutes = require("./routes.js");
const { SystemNotification } = require("./models.js");

const app = express();
app.use(express.json());

async function start() {
  try {
    await sequelize.authenticate();
    await SystemNotification.sync();
    console.log("DB connected and model synced");
  } catch (err) {
    console.error("DB error", err);
    process.exit(1);
  }
  app.use(notificationRoutes);
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.listen(process.env.PORT || 3001, () => {
    console.log(`Notification service listening on port ${process.env.PORT || 3001}`);
  });
}
start();
