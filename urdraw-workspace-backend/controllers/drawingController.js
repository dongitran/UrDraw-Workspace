const { models } = require("../models");
const { Drawing, Collection, CollectionShare } = models;
const collectionController = require("./collectionController");
const { v4: uuidv4 } = require("uuid");

exports.getUserDrawings = async (req, res) => {
  try {
    const userId = req.user.id;

    const drawings = await Drawing.findAll({
      where: { userId },
      order: [["lastModified", "DESC"]],
    });

    return res.status(200).json(drawings);
  } catch (error) {
    console.error("Error fetching drawings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCollectionDrawings = async (req, res) => {
  try {
    const { collectionId } = req.params;
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
      return res.status(404).json({ message: "Collection not found" });
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

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching collection drawings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getDrawing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const drawing = await Drawing.findOne({
      where: { id },
      include: [
        {
          model: Collection,
          as: "collection",
        },
      ],
    });

    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
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
        return res.status(403).json({
          message: "You don't have permission to access this drawing",
        });
      }
    }

    return res.status(200).json(drawing);
  } catch (error) {
    console.error("Error fetching drawing:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createDrawing = async (req, res) => {
  try {
    const { name, thumbnailUrl, collectionId } = req.body;
    const userId = req.user.id;
    //! Không cần thiết phải mặc định như này
    await collectionController.ensureDefaultCollection(userId);

    let targetCollectionId = collectionId;
    if (!targetCollectionId) {
      const defaultCollection = await Collection.findOne({
        where: { userId },
        order: [["createdAt", "ASC"]],
      });

      if (defaultCollection) {
        targetCollectionId = defaultCollection.id;
      }
    }

    const drawingId = uuidv4();

    const drawing = await Drawing.create({
      id: drawingId,
      userId,
      name,
      thumbnailUrl,
      collectionId: targetCollectionId,
      lastModified: new Date(),
    });

    return res.status(201).json(drawing);
  } catch (error) {
    console.error("Error creating drawing:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateDrawing = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, thumbnailUrl, collectionId } = req.body;
    const userId = req.user.id;

    const drawing = await Drawing.findOne({
      where: { id },
      include: [
        {
          model: Collection,
          as: "collection",
        },
      ],
    });

    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
    }

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
        return res.status(403).json({ message: "You don't have permission to edit this drawing" });
      }
    }

    if (collectionId && collectionId !== drawing.collectionId) {
      if (!isOwner) {
        return res.status(403).json({
          message: "Only the owner can move drawings between collections",
        });
      }

      const targetCollection = await Collection.findOne({
        where: { id: collectionId, userId },
      });

      if (!targetCollection) {
        return res.status(404).json({ message: "Target collection not found" });
      }
    }

    drawing.name = name || drawing.name;
    if (content) drawing.content = content;
    if (thumbnailUrl) drawing.thumbnailUrl = thumbnailUrl;
    if (collectionId && isOwner) drawing.collectionId = collectionId;
    drawing.lastModified = new Date();

    await drawing.save();

    return res.status(200).json(drawing);
  } catch (error) {
    console.error("Error updating drawing:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteDrawing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const drawing = await Drawing.findOne({
      where: { id, userId },
    });

    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
    }

    await drawing.destroy();

    return res.status(200).json({ message: "Drawing deleted successfully" });
  } catch (error) {
    console.error("Error deleting drawing:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
