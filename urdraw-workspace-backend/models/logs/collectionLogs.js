const mongoose = require("mongoose");

const collectionLogsSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["GET", "CREATE", "UPDATE", "DELETE", "GET_ALL"],
    },
    userId: {
      type: String,
      required: true,
    },
    collectionId: {
      type: String,
      required: false,
    },
    status: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    error: {
      type: Object,
      required: false,
    },
    metadata: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const CollectionLogs = mongoose.model(
  "workspace-collection-logs",
  collectionLogsSchema
);

module.exports = CollectionLogs;
