const { models } = require("../models");
const { Drawing, Collection, CollectionShare } = models;
const collectionController = require("./collectionController");
const { v4: uuidv4 } = require("uuid");
const DrawingLogs = require("../models/logs/drawingLogs");

exports.getUserDrawings = async (req, res) => {
  let status = 200;
  try {
    const userId = req.user.id;

    const drawings = await Drawing.findAll({
      where: { userId },
      order: [["lastModified", "DESC"]],
    });

    return res.status(status).json(drawings);
  } catch (error) {
    console.error("Error fetching drawings:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    if (status !== 200) {
      try {
        await DrawingLogs.create({
          action: "GET",
          userId: req.user.id,
          status,
          message: "Failed",
          error: { message: "Failed" },
        });
      } catch (logError) {
        console.error("Error logging drawing action:", logError);
      }
    }
  }
};

exports.getCollectionDrawings = async (req, res) => {
  let status = 200;
  let collectionId = null;
  try {
    collectionId = req.params.collectionId;
    const userId = req.user.id;

    let collection = await Collection.findOne({
      where: { id: collectionId, userId },
    });

    let isShared = false;
    let sharePermission = null;

    if (!collection) {
      const share = await CollectionShare.findOne({
        where: {
          collectionId,
          sharedWithId: userId,
          status: "accepted",
        },
        include: [
          {
            model: Collection,
            as: "collection",
          },
        ],
      });

      if (share) {
        collection = share.collection;
        isShared = true;
        sharePermission = share.permission;
      }
    }

    if (!collection) {
      status = 404;
      return res.status(status).json({ message: "Collection not found" });
    }

    const drawings = await Drawing.findAll({
      where: { collectionId },
      order: [["lastModified", "DESC"]],
    });

    const response = {
      drawings,
      isShared,
      permission: sharePermission,
    };

    return res.status(status).json(response);
  } catch (error) {
    console.error("Error fetching collection drawings:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    if (status !== 200) {
      try {
        await DrawingLogs.create({
          action: "GET",
          userId: req.user.id,
          collectionId,
          status,
          message: "Failed",
          error: { message: "Failed" },
        });
      } catch (logError) {
        console.error("Error logging drawing action:", logError);
      }
    }
  }
};

exports.getDrawing = async (req, res) => {
  let status = 200;
  let drawingId = null;
  try {
    drawingId = req.params.id;
    const userId = req.user.id;

    const drawing = await Drawing.findOne({
      where: { id: drawingId },
      include: [
        {
          model: Collection,
          as: "collection",
        },
      ],
    });

    if (!drawing) {
      status = 404;
      return res.status(status).json({ message: "Drawing not found" });
    }

    const isOwner = drawing.userId === userId;

    if (!isOwner) {
      const share = await CollectionShare.findOne({
        where: {
          collectionId: drawing.collectionId,
          sharedWithId: userId,
          status: "accepted",
        },
      });

      if (!share) {
        status = 403;
        return res.status(status).json({
          message: "You don't have permission to access this drawing",
        });
      }
    }

    return res.status(status).json(drawing);
  } catch (error) {
    console.error("Error fetching drawing:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    if (status !== 200) {
      try {
        await DrawingLogs.create({
          action: "GET",
          userId: req.user.id,
          drawingId,
          status,
          message: "Failed",
          error: { message: "Failed" },
        });
      } catch (logError) {
        console.error("Error logging drawing action:", logError);
      }
    }
  }
};

exports.createDrawing = async (req, res) => {
  let status = 201;
  let drawingId = null;
  let collectionId = null;
  try {
    const { name, thumbnailUrl, collectionId: reqCollectionId } = req.body;
    const userId = req.user.id;

    await collectionController.ensureDefaultCollection(userId);

    let targetCollectionId = reqCollectionId;
    if (!targetCollectionId) {
      const defaultCollection = await Collection.findOne({
        where: { userId },
        order: [["createdAt", "ASC"]],
      });

      if (defaultCollection) {
        targetCollectionId = defaultCollection.id;
      }
    }

    collectionId = targetCollectionId;
    drawingId = uuidv4();

    const drawing = await Drawing.create({
      id: drawingId,
      userId,
      name,
      thumbnailUrl,
      collectionId: targetCollectionId,
      lastModified: new Date(),
    });

    return res.status(status).json(drawing);
  } catch (error) {
    console.error("Error creating drawing:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await DrawingLogs.create({
        action: "CREATE",
        userId: req.user.id,
        drawingId,
        collectionId,
        status,
        message: status === 201 ? "Success" : "Failed",
        error: status !== 201 ? { message: "Failed" } : null,
        metadata: { name: req.body.name },
      });
    } catch (logError) {
      console.error("Error logging drawing action:", logError);
    }
  }
};

exports.updateDrawing = async (req, res) => {
  let status = 200;
  let drawingId = null;
  let collectionId = null;
  try {
    drawingId = req.params.id;
    const {
      name,
      content,
      thumbnailUrl,
      collectionId: reqCollectionId,
    } = req.body;
    const userId = req.user.id;

    const drawing = await Drawing.findOne({
      where: { id: drawingId },
      include: [
        {
          model: Collection,
          as: "collection",
        },
      ],
    });

    if (!drawing) {
      status = 404;
      return res.status(status).json({ message: "Drawing not found" });
    }

    collectionId = drawing.collectionId;
    const isOwner = drawing.userId === userId;

    if (!isOwner) {
      const share = await CollectionShare.findOne({
        where: {
          collectionId: drawing.collectionId,
          sharedWithId: userId,
          status: "accepted",
          permission: "edit",
        },
      });

      if (!share) {
        status = 403;
        return res.status(status).json({
          message: "You don't have permission to edit this drawing",
        });
      }
    }

    if (reqCollectionId && reqCollectionId !== drawing.collectionId) {
      if (!isOwner) {
        status = 403;
        return res.status(status).json({
          message: "Only the owner can move drawings between collections",
        });
      }

      const targetCollection = await Collection.findOne({
        where: { id: reqCollectionId, userId },
      });

      if (!targetCollection) {
        status = 404;
        return res
          .status(status)
          .json({ message: "Target collection not found" });
      }

      collectionId = reqCollectionId;
    }

    drawing.name = name || drawing.name;
    if (content) drawing.content = content;
    if (thumbnailUrl) drawing.thumbnailUrl = thumbnailUrl;
    if (reqCollectionId && isOwner) drawing.collectionId = reqCollectionId;
    drawing.lastModified = new Date();

    await drawing.save();

    return res.status(status).json(drawing);
  } catch (error) {
    console.error("Error updating drawing:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await DrawingLogs.create({
        action: "UPDATE",
        userId: req.user.id,
        drawingId,
        collectionId,
        status,
        message: status === 200 ? "Success" : "Failed",
        error: status !== 200 ? { message: "Failed" } : null,
        metadata: {
          name: req.body.name,
          hasContent: !!req.body.content,
          hasThumbnail: !!req.body.thumbnailUrl,
          collectionChanged:
            req.body.collectionId && req.body.collectionId !== collectionId,
        },
      });
    } catch (logError) {
      console.error("Error logging drawing action:", logError);
    }
  }
};

exports.deleteDrawing = async (req, res) => {
  let status = 200;
  let drawingId = null;
  let collectionId = null;
  try {
    drawingId = req.params.id;
    const userId = req.user.id;

    const drawing = await Drawing.findOne({
      where: { id: drawingId, userId },
    });

    if (!drawing) {
      status = 404;
      return res.status(status).json({ message: "Drawing not found" });
    }

    collectionId = drawing.collectionId;
    await drawing.destroy();

    return res.status(status).json({ message: "Drawing deleted successfully" });
  } catch (error) {
    console.error("Error deleting drawing:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await DrawingLogs.create({
        action: "DELETE",
        userId: req.user.id,
        drawingId,
        collectionId,
        status,
        message: status === 200 ? "Success" : "Failed",
        error: status !== 200 ? { message: "Failed" } : null,
      });
    } catch (logError) {
      console.error("Error logging drawing action:", logError);
    }
  }
};
