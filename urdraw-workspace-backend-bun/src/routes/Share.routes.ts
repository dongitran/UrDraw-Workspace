import { zValidator } from "@hono/zod-validator";
import db from "db/db";
import { Hono } from "hono";
import VerifyToken from "middlewares/VerifyToken";
import { z } from "zod";
import crypto from "crypto";
import { CollectionShareTable, InviteCodeTable } from "db/schema";
import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { get } from "lodash";

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
}).get("/collection/:collectionId", async (ctx) => {
  const collectionId = ctx.req.param("collectionId");
  const user = ctx.get("user");
  const collection = await db.query.CollectionTable.findFirst({
    where: (clm, { eq, and }) => and(eq(clm.id, collectionId), eq(clm.userId, user.id)),
  });
  if (!collection) return ctx.json({ message: "Collection not found" }, 404);

  const shareList = await db.query.CollectionShareTable.findMany({
    where: (clm, { eq, and }) => {
      return and(eq(clm.collectionId, collectionId), eq(clm.ownerId, user.id), eq(clm.status, "accepted"));
    },
  });
  return ctx.json(shareList);
});

ShareRoute.post(
  "/join",
  zValidator(
    "json",
    z.object({
      inviteCode: z.string(),
    })
  ),
  async (ctx) => {
    const user = ctx.get("user");
    const { inviteCode } = ctx.req.valid("json");
    const record = await db.query.InviteCodeTable.findFirst({
      where: (clm, { eq }) => eq(clm.id, inviteCode),
    });
    if (!record) return ctx.json({ message: "Invaild invite code" }, 404);
    if (record.expiresAt && dayjs(record.expiresAt) < dayjs()) {
      return ctx.json({ message: "Invite code has expired" }, 400);
    }
    if (record.userId === user.id) {
      return ctx.json({ message: "You cannot join your own collection" }, 403);
    }
    if (record.type === "collection") {
      const share = await db.query.CollectionShareTable.findFirst({
        where: (clm, { eq, and, isNull }) =>
          and(
            eq(clm.collectionId, record.relatedId),
            eq(clm.sharedWithId, user.id),
            eq(clm.ownerId, record.userId),
            isNull(clm.deletedAt)
          ),
      });
      if (share) {
        return ctx.json({ message: "You already have access to this collection" }, 400);
      }
      await db.insert(CollectionShareTable).values({
        collectionId: record.relatedId,
        createdAt: dayjs().toISOString(),
        inviteCode,
        ownerId: record.userId,
        expiresAt: record.expiresAt,
        permission: get(record, "params.permission"),
        sharedWithId: user.id,
        status: "accepted",
        id: Bun.randomUUIDv7(),
        updatedAt: dayjs().toISOString(),
      });
      return ctx.json({ message: "Successfully joined collection" });
    } else if (record.type === "workspace") {
      return ctx.json({ message: "Successfully joined workspace" });
    }
    return ctx.json({ message: "Type invalid" }, 400);
  }
)
  .post(
    "/:collectionId/unlink",
    zValidator(
      "param",
      z.object({
        collectionId: z.string().uuid(),
      })
    ),
    zValidator(
      "json",
      z.object({
        type: z.enum(["collection"]),
        inviteCode: z.string(),
      })
    ),
    async (ctx) => {
      const user = ctx.get("user");
      const { type, inviteCode } = ctx.req.valid("json");
      const { collectionId } = ctx.req.valid("param");
      if (type === "collection") {
        const record = await db.query.CollectionShareTable.findFirst({
          where: (clm, { eq, and }) =>
            and(eq(clm.inviteCode, inviteCode), eq(clm.collectionId, collectionId), eq(clm.sharedWithId, user.id)),
        });
        if (!record) return ctx.json({ message: "Không tìm thấy thông tin" }, 404);
        await db.delete(CollectionShareTable).where(eq(CollectionShareTable.id, record.id));
      }
      return ctx.json({ message: "success" });
    }
  )
  .post(
    "/create-invite-code",
    zValidator(
      "json",
      z.object({
        type: z.enum(["collection", "workspace"]),
        permission: z.enum(["edit", "view"]),
        expiresIn: z.string(),
        relatedId: z.string(),
      })
    ),
    async (ctx) => {
      const user = ctx.get("user");
      const { expiresIn, permission, type, relatedId } = ctx.req.valid("json");
      let expiresAt = null;
      if (expiresIn) {
        const [value, type] = expiresIn.split("-");
        expiresAt = dayjs().add(+value, type as any);
      }
      if (!expiresAt) return ctx.json({ message: "Không thể tạo ngày hết hạn" }, 400);

      const record = await db
        .insert(InviteCodeTable)
        .values({
          createdAt: dayjs().toISOString(),
          expiresAt: expiresAt.toISOString(),
          relatedId,
          type,
          userId: user.id,
          createdBy: user.id,
          params: {
            permission,
            expiresIn,
          },
          id: ulid(),
        })
        .returning()
        .then((res) => res[0]);
      return ctx.json({ code: record.id });
    }
  );

ShareRoute.put(
  "/:shareId",
  zValidator(
    "json",
    z.object({
      permission: z.enum(["view", "edit"]),
    })
  ),
  async (ctx) => {
    const shareId = ctx.req.param("shareId");
    const { permission } = ctx.req.valid("json");
    const user = ctx.get("user");
    const share = await db.query.CollectionShareTable.findFirst({
      where: (clm, { eq, and }) => and(eq(clm.id, shareId), eq(clm.ownerId, user.id)),
    });
    if (!share) return ctx.json({ message: "Share not found" }, 404);
    const newShare = await db
      .update(CollectionShareTable)
      .set({ permission })
      .where(eq(CollectionShareTable.id, share.id))
      .returning()
      .then((res) => res[0]);
    return ctx.json(newShare);
  }
);

ShareRoute.delete("/:shareId", async (ctx) => {
  const shareId = ctx.req.param("shareId");
  const user = ctx.get("user");
  const share = await db.query.CollectionShareTable.findFirst({
    where: (clm, { eq, and }) => and(eq(clm.id, shareId), eq(clm.ownerId, user.id)),
  });
  if (!share) return ctx.json({ message: "Share not found" }, 404);

  if (share.ownerId !== user.id && share.sharedWithId !== user.id) {
    return ctx.json({ message: "Unauthorized" }, 403);
  }
  await db.delete(CollectionShareTable).where(eq(CollectionShareTable.id, share.id));
  return ctx.json({ message: "Collection access removed successfully" });
});

export default ShareRoute;
