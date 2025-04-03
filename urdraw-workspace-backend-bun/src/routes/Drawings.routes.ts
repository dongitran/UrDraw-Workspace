import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";
import db from "db/db";
import { DrawingTable } from "db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { isEmpty } from "lodash";
import VerifyToken from "middlewares/VerifyToken";
import { z } from "zod";

const DrawingRoutes = new Hono();
DrawingRoutes.use(VerifyToken());

DrawingRoutes.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const user = ctx.get("user");
  const drawing = await db.query.DrawingTable.findFirst({
    where: (clm, { eq, and }) => and(eq(clm.id, id)),
  });
  if (!drawing) return ctx.json({ message: "Drawing not found" }, 404);
  const isOwner = drawing.userId === user.id;
  if (!isOwner) {
    const share = await db.query.CollectionShareTable.findFirst({
      where: (clm, { eq, and }) =>
        and(
          eq(clm.collectionId, drawing.collectionId!),
          eq(clm.sharedWithId, user.id),
          eq(clm.status, "accepted")
        ),
    });
    if (!share) {
      return ctx.json(
        { message: "You don't have permission to access this drawing" },
        403
      );
    }
  }
  return ctx.json(drawing);
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
      type: z.enum(["excalidraw", "mermaid"]).default("excalidraw"),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user");
    const { collectionId, content, name, thumbnailUrl, type } =
      ctx.req.valid("json");
    const collection = await db.query.CollectionTable.findFirst({
      where: (clm, { and, eq }) =>
        and(eq(clm.userId, user.id), eq(clm.id, collectionId)),
    });
    if (!collection) return ctx.json({ message: "Collection not found" }, 404);
    const draw = await db
      .insert(DrawingTable)
      .values({
        createdAt: dayjs().toISOString(),
        id: Bun.randomUUIDv7(),
        name,
        workspaceId: collection.workspaceId,
        updatedAt: dayjs().toISOString(),
        userId: user.id,
        collectionId: collection.id,
        content,
        thumbnailUrl,
        lastModified: dayjs().toISOString(),
        type: type || "excalidraw",
      })
      .returning()
      .then((res) => res[0]);
    return ctx.json(draw);
  }
);

DrawingRoutes.put(
  "/:id",
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      collectionId: z.string().uuid().optional(),
      thumbnailUrl: z.string().optional(),
      content: z.string().optional(),
      type: z.enum(["excalidraw", "mermaid"]).optional(),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user");
    const id = ctx.req.param("id");
    const { name, collectionId, content, thumbnailUrl, type } =
      ctx.req.valid("json");
    const drawing = await db.query.DrawingTable.findFirst({
      where: (clm, { eq }) => eq(clm.id, id),
      with: { collection: true },
    });
    if (!drawing) return ctx.json({ message: "Drawing not found" }, 404);

    if (isEmpty(ctx.req.valid("json"))) {
      return ctx.json(drawing);
    }

    const isOwner = drawing.userId === user.id;
    if (!isOwner) {
      const share = await db.query.CollectionShareTable.findFirst({
        where: (clm, { eq, and }) => {
          return and(
            eq(clm.collectionId, drawing.collectionId!),
            eq(clm.sharedWithId, user.id),
            eq(clm.status, "accepted"),
            eq(clm.permission, "edit")
          );
        },
      });
      if (!share)
        return ctx.json(
          { message: "You don't have permission to edit this drawing" },
          403
        );
    }

    if (collectionId && collectionId !== drawing.collectionId) {
      if (!isOwner) {
        return ctx.json(
          { message: "Only the owner can move drawings between collections" },
          403
        );
      }
      const targetCollection = await db.query.CollectionTable.findFirst({
        where: (clm, { and, eq }) =>
          and(eq(clm.id, collectionId), eq(clm.userId, user.id)),
      });
      if (targetCollection) {
        return ctx.json({ message: "Target collection not found" }, 404);
      }
    }

    const bodyUpdate = {
      name,
      updatedAt: dayjs().toISOString(),
      lastModified: dayjs().toISOString(),
      thumbnailUrl,
      content,
      type,
    };
    const newDrawing = await db
      .update(DrawingTable)
      .set(bodyUpdate)
      .where(eq(DrawingTable.id, drawing.id))
      .returning()
      .then((res) => res[0]);

    return ctx.json(newDrawing);
  }
);

DrawingRoutes.delete("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const userId = ctx.get("user");
  const drawing = await db.query.DrawingTable.findFirst({
    where: (clm, { eq, and }) => and(eq(clm.id, id), eq(clm.userId, userId.id)),
  });
  if (!drawing) return ctx.json({ message: "Drawing not found" }, 404);

  await db.delete(DrawingTable).where(eq(DrawingTable.id, drawing.id));

  return ctx.json({ message: "Drawing deleted successfully" });
});
export default DrawingRoutes;
