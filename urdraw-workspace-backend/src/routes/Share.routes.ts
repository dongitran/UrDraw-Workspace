import db from "db/db";
import { Hono } from "hono";
import VerifyToken from "middlewares/VerifyToken";

const ShareRoute = new Hono();
ShareRoute.use(VerifyToken());

ShareRoute.get("/collections", async (ctx) => {
  const user = ctx.get("user");
  const shares = await db.query.CollectionShareTable.findMany({
    where: (column, { eq, and }) => and(eq(column.sharedWithId, user.id), eq(column.status, "accepted")),
    with: {
      collection: {
        with: {
          drawings: true,
        },
      },
    },
  });
  const sharedCollections = shares.map((share: { [key: string]: any }) => {
    const collection = share.collection;
    collection.permission = share.permission;
    collection.sharedBy = share.ownerId;
    collection.shareId = share.id;
    collection.drawingCount = collection.drawings.length;
    delete collection.drawings;
    return collection;
  });
  return ctx.json(sharedCollections);
});
export default ShareRoute;
