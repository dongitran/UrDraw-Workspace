import { zValidator } from "@hono/zod-validator";
import VerifyToken from "@middlewars/VerifyToken";
import dayjs from "dayjs";
import db from "db/db";
import { WorkspaceTable } from "db/schema";
import { Hono } from "hono";
import { ulid } from "ulid";
import { z } from "zod";

const WorkspaceRoute = new Hono();
WorkspaceRoute.use(VerifyToken());
WorkspaceRoute.get("/", async (ctx) => {
  const workspaces = await db.query.WorkspaceTable.findMany({
    columns: { id: true, name: true, description: true },
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
          with: { drawings: true },
          orderBy: (clm, { desc }) => desc(clm.id),
          where: (clm, { isNull }) => isNull(clm.deletedAt),
        },
      },
    });
    if (!workspace) return ctx.json({ message: "Workspace not found" }, 404);
    const collections: any[] = workspace.collections;
    return ctx.json({
      id: workspace.id,
      collections: collections.map((item) => {
        item.drawingCount = item.drawings.length;
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
export default WorkspaceRoute;
