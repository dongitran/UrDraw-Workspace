const { models } = require("../models");
const { Collection, Drawing, CollectionShare } = models;

exports.getUserCollections = async (req, res) => {
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

    return res.status(200).json(collectionsWithCount);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let collection = await Collection.findOne({
      where: { id, userId },
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
          collectionId: id,
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
      return res.status(404).json({ message: "Collection not found" });
    }

    const response = collection.get({ plain: true });
    response.isShared = isShared;
    response.permission = sharePermission;

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const collection = await Collection.create({
      userId,
      name,
    });

    return res.status(201).json(collection);
  } catch (error) {
    console.error("Error creating collection:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.ensureDefaultCollection = async (userId) => {
  try {
    const collectionsCount = await Collection.count({ where: { userId } });

    if (collectionsCount === 0) {
      await Collection.create({
        userId,
        name: "My Drawings",
      });
    }
    return true;
  } catch (error) {
    console.error("Error creating default collection:", error);
    return false;
  }
};

exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    const collection = await Collection.findOne({
      where: { id, userId },
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    collection.name = name || collection.name;
    await collection.save();

    return res.status(200).json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const collection = await Collection.findOne({
      where: { id, userId },
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const collectionsCount = await Collection.count({ where: { userId } });

    if (collectionsCount <= 1) {
      return res.status(400).json({
        message:
          "Cannot delete the only collection. Users must have at least one collection.",
      });
    }

    await collection.destroy();

    return res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
