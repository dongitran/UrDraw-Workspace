import db from "db/db";
import { Hono } from "hono";
import VerifyToken from "middlewares/VerifyToken";

const CollectionRoute = new Hono();
CollectionRoute.use(VerifyToken());

CollectionRoute.get("/", async (ctx) => {
  const user = ctx.get("user");
  const collections = await db.query.CollectionTable.findMany({
    where: (coll, { eq }) => eq(coll.userId, user.id),
    with: {
      drawings: true,
    },
  });
  return ctx.json(
    collections.map((item: Record<string, any>) => {
      item.drawingCount = item.drawings.length;
      delete item.drawings;
      return item;
    })
  );
}).get("/all/data", async (ctx) => {
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
});
export default CollectionRoute;
