const express = require("express");
const { SystemNotification } = require("./models.js");

const router = express.Router();

// POST /notification — создание уведомления
router.post("/notification", async (req, res) => {
  try {
    const { message, show_from, show_to } = req.body;
    if (!message || !show_from) {
      return res.status(400).json({ error: "message и show_from обязательны" });
    }
    const notif = await SystemNotification.create({
      message,
      show_from,
      show_to: show_to || null,
    });
    res.status(201).json(notif);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /notification/system_notification — получить актуальные в данный момент уведомления
router.get("/notification/system_notification", async (req, res) => {
  try {
    const now = new Date();
    const notifications = await SystemNotification.findAll({
      where: {
        show_from: { $lte: now },
        $or: [
          { show_to: null },
          { show_to: { $gte: now } },
        ],
      },
      order: [["show_from", "DESC"]],
    });
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
