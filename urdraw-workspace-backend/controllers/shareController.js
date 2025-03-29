const crypto = require("crypto");
const { models } = require("../models");
const { Collection, Drawing, CollectionShare } = models;
const ShareLogs = require("../models/logs/shareLogs");

const generateInviteCode = () => {
  return crypto.randomBytes(6).toString("hex");
};

exports.createInviteCode = async (req, res) => {
  let status = 201;
  let collectionId = null;
  let inviteCode = null;
  try {
    collectionId = req.body.collectionId;
    const { permission, expiresInDays } = req.body;
    const userId = req.user.id;

    const collection = await Collection.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      status = 404;
      return res.status(status).json({ message: "Collection not found" });
    }

    inviteCode = generateInviteCode();

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

    return res.status(status).json({
      inviteCode: share.inviteCode,
      permission: share.permission,
      expiresAt: share.expiresAt,
    });
  } catch (error) {
    console.error("Error creating invite code:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await ShareLogs.create({
        action: "CREATE_INVITE",
        userId: req.user.id,
        collectionId,
        inviteCode,
        status,
        message: status === 201 ? "Success" : "Failed",
        error: status !== 201 ? { message: "Failed" } : null,
        metadata: {
          permission: req.body.permission || "view",
          expiresInDays: req.body.expiresInDays,
        },
      });
    } catch (logError) {
      console.error("Error logging share action:", logError);
    }
  }
};

exports.joinCollection = async (req, res) => {
  let status = 200;
  let collectionId = null;
  let inviteCode = null;
  let shareId = null;
  try {
    inviteCode = req.body.inviteCode;
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
      status = 404;
      return res.status(status).json({ message: "Invalid invite code" });
    }

    shareId = share.id;
    collectionId = share.collectionId;

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      status = 400;
      return res.status(status).json({ message: "Invite code has expired" });
    }

    if (share.ownerId === userId) {
      status = 400;
      return res
        .status(status)
        .json({ message: "You cannot join your own collection" });
    }

    if (share.sharedWithId === userId && share.status === "accepted") {
      status = 400;
      return res
        .status(status)
        .json({ message: "You already have access to this collection" });
    }

    share.sharedWithId = userId;
    share.status = "accepted";
    await share.save();

    return res.status(status).json({
      message: "Successfully joined collection",
      collection: share.collection,
    });
  } catch (error) {
    console.error("Error joining collection:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await ShareLogs.create({
        action: "JOIN",
        userId: req.user.id,
        collectionId,
        shareId,
        inviteCode,
        status,
        message: status === 200 ? "Success" : "Failed",
        error: status !== 200 ? { message: "Failed" } : null,
      });
    } catch (logError) {
      console.error("Error logging share action:", logError);
    }
  }
};

exports.getSharedCollections = async (req, res) => {
  let status = 200;
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

    return res.status(status).json(sharedCollections);
  } catch (error) {
    console.error("Error fetching shared collections:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    if (status !== 200) {
      try {
        await ShareLogs.create({
          action: "GET_SHARED",
          userId: req.user.id,
          status,
          message: "Failed",
          error: { message: "Failed" },
        });
      } catch (logError) {
        console.error("Error logging share action:", logError);
      }
    }
  }
};

exports.getCollectionShares = async (req, res) => {
  let status = 200;
  let collectionId = null;
  try {
    collectionId = req.params.collectionId;
    const userId = req.user.id;

    const collection = await Collection.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      status = 404;
      return res.status(status).json({ message: "Collection not found" });
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

    return res.status(status).json(shares);
  } catch (error) {
    console.error("Error fetching collection shares:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    if (status !== 200) {
      try {
        await ShareLogs.create({
          action: "GET_SHARES",
          userId: req.user.id,
          collectionId,
          status,
          message: "Failed",
          error: { message: "Failed" },
        });
      } catch (logError) {
        console.error("Error logging share action:", logError);
      }
    }
  }
};

exports.updateSharePermission = async (req, res) => {
  let status = 200;
  let shareId = null;
  let collectionId = null;
  try {
    shareId = req.params.shareId;
    const { permission } = req.body;
    const userId = req.user.id;

    const share = await CollectionShare.findOne({
      where: { id: shareId, ownerId: userId },
    });

    if (!share) {
      status = 404;
      return res.status(status).json({ message: "Share not found" });
    }

    collectionId = share.collectionId;
    share.permission = permission;
    await share.save();

    return res.status(status).json(share);
  } catch (error) {
    console.error("Error updating share permission:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await ShareLogs.create({
        action: "UPDATE",
        userId: req.user.id,
        shareId,
        collectionId,
        status,
        message: status === 200 ? "Success" : "Failed",
        error: status !== 200 ? { message: "Failed" } : null,
        metadata: { permission: req.body.permission },
      });
    } catch (logError) {
      console.error("Error logging share action:", logError);
    }
  }
};

exports.removeShare = async (req, res) => {
  let status = 200;
  let shareId = null;
  let collectionId = null;
  try {
    shareId = req.params.shareId;
    const userId = req.user.id;

    const share = await CollectionShare.findOne({
      where: { id: shareId },
    });

    if (!share) {
      status = 404;
      return res.status(status).json({ message: "Share not found" });
    }

    collectionId = share.collectionId;

    if (share.ownerId !== userId && share.sharedWithId !== userId) {
      status = 403;
      return res.status(status).json({ message: "Unauthorized" });
    }

    await share.destroy();

    return res
      .status(status)
      .json({ message: "Collection access removed successfully" });
  } catch (error) {
    console.error("Error removing share:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await ShareLogs.create({
        action: "DELETE",
        userId: req.user.id,
        shareId,
        collectionId,
        status,
        message: status === 200 ? "Success" : "Failed",
        error: status !== 200 ? { message: "Failed" } : null,
      });
    } catch (logError) {
      console.error("Error logging share action:", logError);
    }
  }
};
