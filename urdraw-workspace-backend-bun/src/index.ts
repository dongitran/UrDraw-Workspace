import { Hono } from "hono";
import CollectionRoute from "@route/Collection.routes";
import ShareRoute from "@route/Share.routes";
import WorkspaceRoute from "@route/Workspace.routes";
import DrawingRoutes from "@route/Drawings.routes";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { customLogger } from "@middlewars/index";
import ErrorLog from "@middlewars/ErrorLog";
import MongoConfig from "./config/mongodb";
import InitDataRoute from "@route/InitData.routes";
const app = new Hono();

MongoConfig.connectToMongoDB();

app.use(cors());
app.use(logger(customLogger));

app.route("/drawings", DrawingRoutes);
app.route("/collections", CollectionRoute);
app.route("/shares", ShareRoute);
app.route("/workspaces", WorkspaceRoute);
app.route("/init-data", InitDataRoute);
app.onError(ErrorLog);

export default app;
