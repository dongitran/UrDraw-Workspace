const express = require("express");
const router = express.Router();
const drawingsRoutes = require("./drawings");
const collectionsRoutes = require("./collections");
const sharesRoutes = require("./shares");

router.use("/drawings", drawingsRoutes);
router.use("/collections", collectionsRoutes);
router.use("/shares", sharesRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = router;
