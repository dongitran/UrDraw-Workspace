import { Hono } from "hono";
import CollectionRoute from "@route/Collection.routes";
import ShareRoute from "@route/Share.routes";
import DrawingRoutes from "@route/Drawings.routes";
import { cors } from "hono/cors";

const app = new Hono();
app.use(cors());

app.route("/drawings", DrawingRoutes);
app.route("/collections", CollectionRoute);
app.route("/shares", ShareRoute);

export default app;
