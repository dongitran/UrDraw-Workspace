import { zValidator } from "@hono/zod-validator";
import VerifyToken from "@middlewars/VerifyToken";
import dayjs from "dayjs";
import db from "db/db";
import { CollectionTable, DrawingTable, WorkspaceTable } from "db/schema";
import { eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { keyBy } from "lodash";
import { ulid } from "ulid";
import { z } from "zod";

const WorkspaceRoute = new Hono();
WorkspaceRoute.use(VerifyToken());
WorkspaceRoute.get("/", async (ctx) => {
  const workspaces = await db.query.WorkspaceTable.findMany({
    columns: { id: true, name: true, description: true },
    orderBy: (clm, { asc }) => asc(clm.id),
  });
  return ctx.json(workspaces);
}).get(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().ulid(),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user");
    const id = ctx.req.param("id");
    const workspace = await db.query.WorkspaceTable.findFirst({
      where: (clm, { eq, and }) => and(eq(clm.userId, user.id), eq(clm.id, id)),
      with: {
        collections: {
          with: {
            drawings: true,
          },
          orderBy: (clm, { desc }) => desc(clm.id),
          where: (clm, { isNull }) => isNull(clm.deletedAt),
        },
      },
    });
    if (!workspace) return ctx.json({ message: "Workspace not found" }, 404);
    const collections: any[] = workspace.collections;
    const shares = await db.query.CollectionShareTable.findMany({
      where: (clm, { isNull, eq, and, inArray }) => {
        return and(
          isNull(clm.deletedAt),
          inArray(
            clm.collectionId,
            collections.map((item) => item.id)
          )
        );
      },
    });
    const keyCollectionIdByShare = keyBy(shares, "collectionId");
    return ctx.json({
      id: workspace.id,
      collections: collections.map((item) => {
        item.drawingCount = item.drawings.length;
        item.inviteCode = keyCollectionIdByShare[item.id]?.inviteCode || null;
        item.expiresAt = keyCollectionIdByShare[item.id]?.expiresAt || null;
        delete item.drawings;
        return item;
      }),
    });
  }
);
WorkspaceRoute.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user");
    const { name, description } = ctx.req.valid("json");
    console.log("user :>> ", user);
    await db.insert(WorkspaceTable).values({
      createdAt: dayjs().toISOString(),
      id: ulid(),
      name,
      userId: user.id,
      createdBy: user.id,
      description,
    });
    return ctx.json({ message: "ok" });
  }
);

WorkspaceRoute.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  ),
  zValidator("param", z.object({ id: z.string().ulid() })),
  async (ctx) => {
    const user = ctx.get("user");
    const id = ctx.req.param("id");
    const { name, description } = ctx.req.valid("json");
    const workspace = await db.query.WorkspaceTable.findFirst({
      where: (clm, { eq, and }) => and(eq(clm.id, id), eq(clm.userId, user.id)),
    });
    if (!workspace) return ctx.json({ message: "Workspace not found" }, 404);
    await db
      .update(WorkspaceTable)
      .set({
        name,
        description,
        updatedAt: dayjs().toISOString(),
        updatedBy: user.id,
      })
      .where(eq(WorkspaceTable.id, workspace.id));
    return ctx.json({ message: "ok" });
  }
);

WorkspaceRoute.delete(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().ulid(),
    })
  ),
  async (ctx) => {
    const id = ctx.req.param("id");
    const user = ctx.get("user");
    const workspace = await db.query.WorkspaceTable.findFirst({
      where: (clm, { eq, and }) => and(eq(clm.id, id), eq(clm.userId, user.id)),
      with: {
        collections: {
          where: (clm, { isNull }) => isNull(clm.deletedAt),
          columns: { id: true },
          with: { drawings: true },
        },
      },
    });
    if (!workspace) return ctx.json({ message: "Workspace not found" }, 404);
    const drawingIds: string[] = [],
      collectionIds: string[] = [];
    for (const collection of workspace.collections) {
      collectionIds.push(collection.id);
      if (collection.drawings.length > 0) {
        drawingIds.push(...collection.drawings.map((drawing) => drawing.id));
      }
    }
    await db.transaction(async (tx) => {
      await tx.delete(DrawingTable).where(inArray(DrawingTable.id, drawingIds));
      await tx.delete(CollectionTable).where(inArray(CollectionTable.id, collectionIds));
      await tx.delete(WorkspaceTable).where(eq(WorkspaceTable.id, workspace.id));
    });
    return ctx.json({ message: "ok" });
  }
);
export default WorkspaceRoute;
