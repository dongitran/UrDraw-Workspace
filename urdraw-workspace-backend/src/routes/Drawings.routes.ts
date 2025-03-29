import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";
import db from "db/db";
import { DrawingTable } from "db/schema";
import { Hono } from "hono";
import VerifyToken from "middlewares/VerifyToken";
import { z } from "zod";

const DrawingRoutes = new Hono();
DrawingRoutes.use(VerifyToken());

DrawingRoutes.get("/", (ctx) => {
  return ctx.json({ message: "ok" });
});

DrawingRoutes.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      collectionId: z.string().uuid(),
      thumbnailUrl: z.string(),
      content: z.string(),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user");
    const { collectionId, content, name, thumbnailUrl } = ctx.req.valid("json");
    const collection = await db.query.CollectionTable.findFirst({
      where: (clm, { and, eq }) => and(eq(clm.userId, user.id), eq(clm.id, collectionId)),
    });
    if (!collection) return ctx.json({ message: "Collection not found" }, 404);
    const draw = await db
      .insert(DrawingTable)
      .values({
        createdAt: dayjs().toISOString(),
        id: Bun.randomUUIDv7(),
        name,
        updatedAt: dayjs().toISOString(),
        userId: user.id,
        collectionId: collection.id,
        content,
        thumbnailUrl,
        lastModified: dayjs().toISOString(),
      })
      .returning()
      .then((res) => res[0]);
    return ctx.json(draw);
  }
);
export default DrawingRoutes;
