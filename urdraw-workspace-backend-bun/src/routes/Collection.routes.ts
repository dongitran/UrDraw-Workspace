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
    where: (coll, { eq, and, isNull }) => and(eq(coll.userId, user.id), isNull(coll.deletedAt)),
    with: {
      drawings: {
        where: (drawing, { isNull }) => isNull(drawing.deletedAt),
      },
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
      where: (coll, { eq, and, isNull }) => and(eq(coll.userId, user.id), isNull(coll.deletedAt)),
      orderBy: (coll, { desc }) => desc(coll.createdAt),
      columns: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    const sharedCollections = await db.query.CollectionShareTable.findMany({
      where: (coll, { eq, and, isNull }) =>
        and(eq(coll.sharedWithId, user.id), eq(coll.status, "accepted"), isNull(coll.deletedAt)),
      with: {
        collection: {
          where: (coll, { isNull }) => isNull(coll.deletedAt),
        },
      },
    });
    const drawings = await db.query.DrawingTable.findMany({
      where: (column, { eq, and, isNull }) => and(eq(column.userId, user.id), isNull(column.deletedAt)),
      columns: {
        id: true,
        name: true,
        thumbnailUrl: true,
        collectionId: true,
        lastModified: true,
      },
      orderBy: (column, { desc }) => desc(column.lastModified),
    });
    const formattedSharedCollections = sharedCollections
      .filter((share) => share.collection)
      .map((share) => {
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
      where: (column, { eq, and, isNull }) => and(eq(column.id, id), isNull(column.deletedAt)),
      with: {
        drawings: {
          where: (drawing, { isNull }) => isNull(drawing.deletedAt),
          orderBy: (column, { desc }) => desc(column.lastModified),
        },
      },
    });
    let isShared = false;
    let sharePermission = null;
    if (!collection) {
      const share = await db.query.CollectionShareTable.findFirst({
        where: (column, { eq, and, isNull }) => {
          return and(
            eq(column.collectionId, id),
            eq(column.sharedWithId, user.id),
            eq(column.status, "accepted"),
            isNull(column.deletedAt)
          );
        },
        with: {
          collection: {
            where: (coll, { isNull }) => isNull(coll.deletedAt),
            with: {
              drawings: {
                where: (drawing, { isNull }) => isNull(drawing.deletedAt),
                orderBy: (clm, { desc }) => desc(clm.lastModified),
              },
            },
          },
        },
      });
      if (share && share.collection) {
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
      where: (clm, { eq, and, isNull }) =>
        and(eq(clm.id, collectionId), eq(clm.userId, user.id), isNull(clm.deletedAt)),
    });
    let isShared = false;
    let sharePermission = null;
    if (!collection) {
      const share = await db.query.CollectionShareTable.findFirst({
        where: (clm, { eq, and, isNull }) => {
          return and(
            eq(clm.collectionId, collectionId),
            eq(clm.sharedWithId, user.id),
            eq(clm.status, "accepted"),
            isNull(clm.deletedAt)
          );
        },
        with: {
          collection: {
            where: (coll, { isNull }) => isNull(coll.deletedAt),
          },
        },
      });
      if (share && share.collection) {
        collection = share.collection;
        isShared = true;
        sharePermission = share.permission;
      }
    }
    if (!collection) {
      return ctx.json({ message: "Collection not found" }, 404);
    }
    const drawings = await db.query.DrawingTable.findMany({
      where: (clm, { eq, and, isNull }) => and(eq(clm.collectionId, collectionId), isNull(clm.deletedAt)),
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
      workspaceId: z.string().ulid(),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user");
    const { name, workspaceId } = ctx.req.valid("json");
    const collections = await db
      .insert(CollectionTable)
      .values({
        userId: user.id,
        workspaceId,
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
      where: (clm, { eq, and, isNull }) => and(eq(clm.id, id), eq(clm.userId, user.id), isNull(clm.deletedAt)),
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
    where: (clm, { eq, and, isNull }) => and(eq(clm.id, id), eq(clm.userId, user.id), isNull(clm.deletedAt)),
  });
  if (!collection) return ctx.json({ message: "Collection not found" }, 404);

  await db
    .update(CollectionTable)
    .set({
      deletedAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    })
    .where(eq(CollectionTable.id, collection.id));

  return ctx.json({ message: "Collection deleted successfully" });
});
export default CollectionRoute;
