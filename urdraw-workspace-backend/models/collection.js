module.exports = (sequelize, DataTypes) => {
  const Collection = sequelize.define(
    "collection",
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
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );

  Collection.associate = (models) => {
    Collection.hasMany(models.Drawing, {
      foreignKey: "collectionId",
      as: "drawings",
    });

    Collection.hasMany(models.CollectionShare, {
      foreignKey: "collectionId",
      as: "shares",
    });
  };

  return Collection;
};
