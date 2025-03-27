const crypto = require("crypto");
const { models } = require("../models");
const { Collection, Drawing, CollectionShare } = models;

const generateInviteCode = () => {
  return crypto.randomBytes(6).toString("hex");
};

exports.createInviteCode = async (req, res) => {
  try {
    const { collectionId, permission, expiresInDays } = req.body;
    const userId = req.user.id;

    const collection = await Collection.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const inviteCode = generateInviteCode();

    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    const share = await CollectionShare.create({
      collectionId,
      ownerId: userId,
      inviteCode,
      permission: permission || "view",
      status: "pending",
      expiresAt,
    });

    return res.status(201).json({
      inviteCode: share.inviteCode,
      permission: share.permission,
      expiresAt: share.expiresAt,
    });
  } catch (error) {
    console.error("Error creating invite code:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.joinCollection = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    const share = await CollectionShare.findOne({
      where: { inviteCode },
      include: [
        {
          model: Collection,
          as: "collection",
        },
      ],
    });

    if (!share) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Invite code has expired" });
    }

    if (share.ownerId === userId) {
      return res
        .status(400)
        .json({ message: "You cannot join your own collection" });
    }

    if (share.sharedWithId === userId && share.status === "accepted") {
      return res
        .status(400)
        .json({ message: "You already have access to this collection" });
    }

    share.sharedWithId = userId;
    share.status = "accepted";
    await share.save();

    return res.status(200).json({
      message: "Successfully joined collection",
      collection: share.collection,
    });
  } catch (error) {
    console.error("Error joining collection:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSharedCollections = async (req, res) => {
  try {
    const userId = req.user.id;

    const shares = await CollectionShare.findAll({
      where: { sharedWithId: userId, status: "accepted" },
      include: [
        {
          model: Collection,
          as: "collection",
          include: [
            {
              model: Drawing,
              as: "drawings",
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    const sharedCollections = shares.map((share) => {
      const collection = share.collection.get({ plain: true });
      collection.permission = share.permission;
      collection.sharedBy = share.ownerId;
      collection.shareId = share.id;
      collection.drawingCount = collection.drawings.length;
      delete collection.drawings;
      return collection;
    });

    return res.status(200).json(sharedCollections);
  } catch (error) {
    console.error("Error fetching shared collections:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCollectionShares = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user.id;

    const collection = await Collection.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const shares = await CollectionShare.findAll({
      where: { collectionId, ownerId: userId, status: "accepted" },
      attributes: [
        "id",
        "sharedWithId",
        "permission",
        "createdAt",
        "updatedAt",
      ],
    });

    return res.status(200).json(shares);
  } catch (error) {
    console.error("Error fetching collection shares:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateSharePermission = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { permission } = req.body;
    const userId = req.user.id;

    const share = await CollectionShare.findOne({
      where: { id: shareId, ownerId: userId },
    });

    if (!share) {
      return res.status(404).json({ message: "Share not found" });
    }

    share.permission = permission;
    await share.save();

    return res.status(200).json(share);
  } catch (error) {
    console.error("Error updating share permission:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.removeShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id;

    const share = await CollectionShare.findOne({
      where: { id: shareId },
    });

    if (!share) {
      return res.status(404).json({ message: "Share not found" });
    }

    if (share.ownerId !== userId && share.sharedWithId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await share.destroy();

    return res
      .status(200)
      .json({ message: "Collection access removed successfully" });
  } catch (error) {
    console.error("Error removing share:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
