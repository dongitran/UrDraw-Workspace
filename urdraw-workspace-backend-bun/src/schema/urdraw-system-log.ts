import MongoConfig from "../config/mongodb";

const UrDrawSystemSchema = new MongoConfig.mongoose.Schema({
  path: { type: String, required: true },
  method: { type: String, enum: ["GET", "POST", "PUT", "PATCH", "DELETE"], required: true },
  userId: { type: String, required: true },
  error: { type: Object },
  message: { type: String },
  content: { type: Object },
});
const UrDrawSystemLogs = MongoConfig.mongoose.model("urdraw-workspace-backend-bun", UrDrawSystemSchema);

export default UrDrawSystemLogs;
