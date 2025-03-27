const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.post("/invite", shareController.createInviteCode);
router.post("/join", shareController.joinCollection);
router.get("/collections", shareController.getSharedCollections);
router.get("/collection/:collectionId", shareController.getCollectionShares);
router.put("/:shareId", shareController.updateSharePermission);
router.delete("/:shareId", shareController.removeShare);

module.exports = router;
