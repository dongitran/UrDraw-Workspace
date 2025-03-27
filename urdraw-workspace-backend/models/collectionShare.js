module.exports = (sequelize, DataTypes) => {
  const CollectionShare = sequelize.define(
    "CollectionShare",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      collectionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      ownerId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Keycloak user ID of the collection owner",
      },
      sharedWithId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Keycloak user ID of user the collection is shared with",
      },
      inviteCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      permission: {
        type: DataTypes.ENUM("view", "edit"),
        allowNull: false,
        defaultValue: "view",
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted"),
        allowNull: false,
        defaultValue: "pending",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      paranoid: true,
    }
  );

  CollectionShare.associate = (models) => {
    CollectionShare.belongsTo(models.Collection, {
      foreignKey: "collectionId",
      as: "collection",
    });
  };

  return CollectionShare;
};
