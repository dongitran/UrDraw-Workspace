import db from "db/db";
import { Hono } from "hono";
import VerifyToken from "middlewares/VerifyToken";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CollectionTable } from "db/schema";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";

const CollectionRoute = new Hono();
CollectionRoute.use(VerifyToken());

CollectionRoute.get("/", async (ctx) => {
  const user = ctx.get("user");
  const collections = await db.query.CollectionTable.findMany({
    where: (coll, { eq }) => eq(coll.userId, user.id),
    with: {
      drawings: true,
    },
    orderBy: (clm, { desc }) => desc(clm.createdAt),
  });
  return ctx.json(
    collections.map((item: Record<string, any>) => {
      item.drawingCount = item.drawings.length;
      delete item.drawings;
      return item;
    })
  );
})
  .get("/all/data", async (ctx) => {
    const user = ctx.get("user");
    const collections = await db.query.CollectionTable.findMany({
      where: (coll, { eq }) => eq(coll.userId, user.id),
      orderBy: (coll, { desc }) => desc(coll.createdAt),
      columns: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    const sharedCollections = await db.query.CollectionShareTable.findMany({
      where: (coll, { eq, and }) => and(eq(coll.sharedWithId, user.id), eq(coll.status, "accepted")),
      with: { collection: true },
    });
    const drawings = await db.query.DrawingTable.findMany({
      where: (column, { eq }) => eq(column.userId, user.id),
      columns: { id: true, name: true, thumbnailUrl: true, collectionId: true, lastModified: true },
      orderBy: (column, { desc }) => desc(column.lastModified),
    });
    const formattedSharedCollections = sharedCollections.map((share) => {
      const collection = share.collection;
      return { ...collection, isShared: true, permission: share.permission };
    });
    const allCollections = [
      ...collections.map((item) => ({
        ...item,
        isShared: false,
      })),
      ...formattedSharedCollections,
    ];
    return ctx.json({
      collections: allCollections,
      drawings,
    });
  })
  .get("/:id", async (ctx) => {
    const user = ctx.get("user");
    const id = ctx.req.param("id");
    let collection = await db.query.CollectionTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
      with: {
        drawings: {
          orderBy: (column, { desc }) => desc(column.lastModified),
        },
      },
    });
    let isShared = false;
    let sharePermission = null;
    if (!collection) {
      const share = await db.query.CollectionShareTable.findFirst({
        where: (column, { eq, and }) => {
          return and(eq(column.collectionId, id), eq(column.sharedWithId, user.id), eq(column.status, "accepted"));
        },
        with: {
          collection: {
            with: {
              drawings: {
                orderBy: (clm, { desc }) => desc(clm.lastModified),
              },
            },
          },
        },
      });
      if (share) {
        collection = share.collection;
        isShared = true;
        sharePermission = share.permission;
      }
    }
    if (!collection) {
      return ctx.json({ message: "Collection not found" }, 404);
    }
    return ctx.json({ ...collection, isShared, permission: sharePermission });
  })
  .get("/:collectionId/drawings", async (ctx) => {
    const collectionId = ctx.req.param("collectionId");
    const user = ctx.get("user");
    let collection = await db.query.CollectionTable.findFirst({
      where: (clm, { eq, and }) => and(eq(clm.id, collectionId), eq(clm.userId, user.id)),
    });
    let isShared = false;
    let sharePermission = null;
    if (!collection) {
      const share = await db.query.CollectionShareTable.findFirst({
        where: (clm, { eq, and }) => {
          return and(eq(clm.collectionId, collectionId), eq(clm.sharedWithId, user.id), eq(clm.status, "accepted"));
        },
        with: {
          collection: true,
        },
      });
      if (share) {
        collection = share.collection;
        isShared = true;
        sharePermission = share.permission;
      }
    }
    if (!collection) {
      return ctx.json({ message: "Collection not found" }, 404);
    }
    const drawings = await db.query.DrawingTable.findMany({
      where: (clm, { eq }) => eq(clm.collectionId, collectionId),
      orderBy: (clm, { desc }) => desc(clm.lastModified),
    });
    const response = {
      drawings,
      isShared,
      permission: sharePermission,
    };
    return ctx.json(response);
  });

CollectionRoute.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(3, "Ít nhất phải 3 ký tự"),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user");
    const { name } = ctx.req.valid("json");
    const collections = await db
      .insert(CollectionTable)
      .values({
        userId: user.id,
        name,
        id: Bun.randomUUIDv7(),
        createdAt: dayjs().toISOString(),
        updatedAt: dayjs().toISOString(),
      })
      .returning()
      .then((res) => res[0]);
    return ctx.json(collections);
  }
);
CollectionRoute.put(
  "/:id",
  zValidator(
    "json",
    z.object({
      name: z.string().min(3, "Ít nhất 3 ký tự"),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user"),
      id = ctx.req.param("id");
    const { name } = ctx.req.valid("json");
    const collection = await db.query.CollectionTable.findFirst({
      where: (clm, { eq, and }) => and(eq(clm.id, id), eq(clm.userId, user.id)),
    });
    if (!collection) return ctx.json({ message: "Collection not found" }, 404);
    const newCollection = await db
      .update(CollectionTable)
      .set({ name, updatedAt: dayjs().toISOString() })
      .where(eq(CollectionTable.id, collection.id))
      .returning()
      .then((res) => res[0]);
    return ctx.json(newCollection);
  }
);
CollectionRoute.delete("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const user = ctx.get("user");
  const collection = await db.query.CollectionTable.findFirst({
    where: (clm, { eq, and }) => and(eq(clm.id, id), eq(clm.userId, user.id)),
  });
  if (!collection) return ctx.json({ message: "Collection not found" }, 404);

  await db.delete(CollectionTable).where(eq(CollectionTable.id, collection.id));

  return ctx.json({ message: "Collection deleted successfully" });
});
export default CollectionRoute;
