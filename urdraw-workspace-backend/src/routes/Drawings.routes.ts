import { Hono } from "hono";

const DrawingRoutes = new Hono();
DrawingRoutes.get("/", (ctx) => {
  return ctx.json({ message: "ok" });
});
export default DrawingRoutes;
