const mongoose = require("mongoose");

const drawingLogsSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["GET", "CREATE", "UPDATE", "DELETE"],
    },
    userId: {
      type: String,
      required: true,
    },
    drawingId: {
      type: String,
      required: false,
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

const DrawingLogs = mongoose.model("workspace-drawing-logs", drawingLogsSchema);

module.exports = DrawingLogs;
