const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const drawingController = require("../controllers/drawingController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.get("/", collectionController.getUserCollections);

router.get("/:id", collectionController.getCollection);

router.get("/:collectionId/drawings", drawingController.getCollectionDrawings);

router.post("/", collectionController.createCollection);

router.put("/:id", collectionController.updateCollection);

router.delete("/:id", collectionController.deleteCollection);

router.get("/all/data", collectionController.getAllCollectionsAndDrawings);

module.exports = router;
