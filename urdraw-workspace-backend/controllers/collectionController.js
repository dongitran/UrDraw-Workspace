const { models } = require("../models");
const { Collection, Drawing, CollectionShare } = models;
const CollectionLogs = require("../models/logs/collectionLogs");

exports.getUserCollections = async (req, res) => {
  let status = 200;
  try {
    const userId = req.user.id;

    const collections = await Collection.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Drawing,
          as: "drawings",
          attributes: ["id"],
        },
      ],
    });

    const collectionsWithCount = collections.map((collection) => {
      const plainCollection = collection.get({ plain: true });
      plainCollection.drawingCount = plainCollection.drawings.length;
      delete plainCollection.drawings;
      return plainCollection;
    });

    return res.status(status).json(collectionsWithCount);
  } catch (error) {
    console.error("Error fetching collections:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    if (status !== 200) {
      try {
        await CollectionLogs.create({
          action: "GET",
          userId: req.user.id,
          status,
          message: "Failed",
          error: { message: "Failed" },
        });
      } catch (logError) {
        console.error("Error logging collection action:", logError);
      }
    }
  }
};

exports.getCollection = async (req, res) => {
  let status = 200;
  let collectionId = null;
  try {
    collectionId = req.params.id;
    const userId = req.user.id;

    let collection = await Collection.findOne({
      where: { id: collectionId, userId },
      include: [
        {
          model: Drawing,
          as: "drawings",
          order: [["lastModified", "DESC"]],
        },
      ],
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
            include: [
              {
                model: Drawing,
                as: "drawings",
                order: [["lastModified", "DESC"]],
              },
            ],
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

    const response = collection.get({ plain: true });
    response.isShared = isShared;
    response.permission = sharePermission;

    return res.status(status).json(response);
  } catch (error) {
    console.error("Error fetching collection:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    if (status !== 200) {
      try {
        await CollectionLogs.create({
          action: "GET",
          userId: req.user.id,
          collectionId,
          status,
          message: "Failed",
          error: { message: "Failed" },
        });
      } catch (logError) {
        console.error("Error logging collection action:", logError);
      }
    }
  }
};

exports.createCollection = async (req, res) => {
  let status = 201;
  let collectionId = null;
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const collection = await Collection.create({
      userId,
      name,
    });

    collectionId = collection.id;
    return res.status(status).json(collection);
  } catch (error) {
    console.error("Error creating collection:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await CollectionLogs.create({
        action: "CREATE",
        userId: req.user.id,
        collectionId,
        status,
        message: status === 201 ? "Success" : "Failed",
        error: status !== 201 ? { message: "Failed" } : null,
        metadata: { name: req.body.name },
      });
    } catch (logError) {
      console.error("Error logging collection action:", logError);
    }
  }
};

exports.ensureDefaultCollection = async (userId) => {
  let status = true;
  let collectionId = null;
  let isCreated = false;
  try {
    const collectionsCount = await Collection.count({ where: { userId } });

    if (collectionsCount === 0) {
      const collection = await Collection.create({
        userId,
        name: "My Drawings",
      });
      collectionId = collection.id;
      isCreated = true;
    }
    return true;
  } catch (error) {
    console.error("Error creating default collection:", error);
    status = false;
    return false;
  } finally {
    if (isCreated) {
      try {
        await CollectionLogs.create({
          action: "CREATE",
          userId,
          collectionId,
          status: status ? 201 : 500,
          message: status ? "Success" : "Failed",
          error: !status ? { message: "Failed" } : null,
          metadata: { name: "My Drawings", isDefault: true },
        });
      } catch (logError) {
        console.error("Error logging collection action:", logError);
      }
    }
  }
};

exports.updateCollection = async (req, res) => {
  let status = 200;
  let collectionId = null;
  try {
    collectionId = req.params.id;
    const { name } = req.body;
    const userId = req.user.id;

    const collection = await Collection.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      status = 404;
      return res.status(status).json({ message: "Collection not found" });
    }

    collection.name = name || collection.name;
    await collection.save();

    return res.status(status).json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await CollectionLogs.create({
        action: "UPDATE",
        userId: req.user.id,
        collectionId,
        status,
        message: status === 200 ? "Success" : "Failed",
        error: status !== 200 ? { message: "Failed" } : null,
        metadata: { name: req.body.name },
      });
    } catch (logError) {
      console.error("Error logging collection action:", logError);
    }
  }
};

exports.deleteCollection = async (req, res) => {
  let status = 200;
  let collectionId = null;
  try {
    collectionId = req.params.id;
    const userId = req.user.id;

    const collection = await Collection.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      status = 404;
      return res.status(status).json({ message: "Collection not found" });
    }

    const collectionsCount = await Collection.count({ where: { userId } });

    if (collectionsCount <= 1) {
      status = 400;
      return res.status(status).json({
        message:
          "Cannot delete the only collection. Users must have at least one collection.",
      });
    }

    await collection.destroy();

    return res
      .status(status)
      .json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    try {
      await CollectionLogs.create({
        action: "DELETE",
        userId: req.user.id,
        collectionId,
        status,
        message: status === 200 ? "Success" : "Failed",
        error: status !== 200 ? { message: "Failed" } : null,
      });
    } catch (logError) {
      console.error("Error logging collection action:", logError);
    }
  }
};

exports.getAllCollectionsAndDrawings = async (req, res) => {
  let status = 200;
  try {
    const userId = req.user.id;

    const collections = await Collection.findAll({
      where: { userId },
      attributes: ["id", "name", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });

    const sharedCollections = await CollectionShare.findAll({
      where: { sharedWithId: userId, status: "accepted" },
      include: [
        {
          model: Collection,
          as: "collection",
          attributes: ["id", "name", "createdAt", "updatedAt"],
        },
      ],
    });

    const drawings = await Drawing.findAll({
      where: { userId },
      attributes: [
        "id",
        "name",
        "thumbnailUrl",
        "collectionId",
        "lastModified",
      ],
      order: [["lastModified", "DESC"]],
    });

    const formattedSharedCollections = sharedCollections.map((share) => {
      const collection = share.collection.get({ plain: true });
      return {
        ...collection,
        isShared: true,
        permission: share.permission,
      };
    });

    const allCollections = [
      ...collections.map((collection) => ({
        ...collection.get({ plain: true }),
        isShared: false,
      })),
      ...formattedSharedCollections,
    ];

    return res.status(status).json({
      collections: allCollections,
      drawings: drawings,
    });
  } catch (error) {
    console.error("Error fetching all collections and drawings:", error);
    status = 500;
    return res.status(status).json({ message: "Server error" });
  } finally {
    if (status !== 200) {
      try {
        await CollectionLogs.create({
          action: "GET_ALL",
          userId: req.user.id,
          status,
          message: "Failed",
          error: { message: "Failed" },
        });
      } catch (logError) {
        console.error("Error logging collection action:", logError);
      }
    }
  }
};
