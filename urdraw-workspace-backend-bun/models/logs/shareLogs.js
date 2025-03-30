const mongoose = require("mongoose");

const shareLogsSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE_INVITE",
        "JOIN",
        "GET_SHARED",
        "GET_SHARES",
        "UPDATE",
        "DELETE",
      ],
    },
    userId: {
      type: String,
      required: true,
    },
    collectionId: {
      type: String,
      required: false,
    },
    shareId: {
      type: String,
      required: false,
    },
    inviteCode: {
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

const ShareLogs = mongoose.model("workspace-share-logs", shareLogsSchema);

module.exports = ShareLogs;
