module.exports = (sequelize, DataTypes) => {
  const Drawing = sequelize.define(
    "drawing",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      thumbnailUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastModified: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      collectionId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      paranoid: true,
    }
  );

  Drawing.associate = (models) => {
    Drawing.belongsTo(models.Collection, {
      foreignKey: "collectionId",
      as: "collection",
    });
  };

  return Drawing;
};
