import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize";

class DrawingContent extends Model {
  public id!: string;
  public userId!: string;
  public title!: string | null;
  public content!: string | null;
  public type!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DrawingContent.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'excalidraw',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "drawing_contents",
  }
);

export default DrawingContent;
