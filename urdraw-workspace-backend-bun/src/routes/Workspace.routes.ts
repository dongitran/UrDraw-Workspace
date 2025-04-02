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
  return ctx.json({ workspaces });
});
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
