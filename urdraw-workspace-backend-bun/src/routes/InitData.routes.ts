import VerifyToken from "@middlewars/VerifyToken";
import db from "db/db";
import { Hono } from "hono";

const InitDataRoute = new Hono();
InitDataRoute.use(VerifyToken());

InitDataRoute.get("/", async (ctx) => {
  const user = ctx.get("user");
  const workspaces = await db.query.WorkspaceTable.findMany({
    where: (clm, { eq }) => eq(clm.userId, user.id),
    columns: { id: true, name: true, description: true },
    orderBy: (clm, { asc }) => asc(clm.id),
  });
  const shareList = await db.query.CollectionShareTable.findMany({
    where: (clm, { eq, and, isNull }) => and(eq(clm.sharedWithId, user.id), isNull(clm.deletedAt)),
    with: { collection: true },
  });
  return ctx.json({
    workspaces,
    shareWithMe: [
      ...shareList.map((item) => {
        return {
          collectionId: item.collection.id,
          collectionName: item.collection.name,
          permission: item.permission,
          expiresAt: item.expiresAt,
          type: "collection",
        };
      }),
    ],
  });
});
export default InitDataRoute;
