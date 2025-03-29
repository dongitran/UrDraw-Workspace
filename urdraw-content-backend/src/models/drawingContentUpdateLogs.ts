import mongoose, { Schema, Document } from "mongoose";

export interface IDrawingContentUpdateLogs extends Document {
  drawingId: string;
  userId: string;
  content: string;
  title?: string;
  createdAt: Date;
}

const DrawingContentUpdateLogsSchema: Schema = new Schema({
  drawingId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  title: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const DrawingContentUpdateLogs = mongoose.model<IDrawingContentUpdateLogs>(
  "DrawingContentUpdateLogs",
  DrawingContentUpdateLogsSchema,
  "drawing-content-updates"
);

export default DrawingContentUpdateLogs;
