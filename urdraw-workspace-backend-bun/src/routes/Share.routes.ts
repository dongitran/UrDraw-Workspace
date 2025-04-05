import { zValidator } from "@hono/zod-validator";
import db from "db/db";
import { Hono } from "hono";
import VerifyToken from "middlewares/VerifyToken";
import { z } from "zod";
import crypto from "crypto";
import { CollectionShareTable } from "db/schema";
import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";

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
  "/invite",
  zValidator(
    "json",
    z.object({
      collectionId: z.string(),
      permission: z.enum(["view", "edit"]),
      expriedIn: z.string(),
    })
  ),
  async (ctx) => {
    const { collectionId, expriedIn, permission } = ctx.req.valid("json");
    const user = ctx.get("user");

    const collection = await db.query.CollectionTable.findFirst({
      where: (clm, { eq, and }) => and(eq(clm.id, collectionId), eq(clm.userId, user.id)),
    });
    if (!collection) return ctx.json({ message: "Collection not found" }, 404);
    const share = await db.query.CollectionShareTable.findFirst({
      where: (clm, { and, eq, isNull }) => {
        return and(isNull(clm.deletedAt), eq(clm.collectionId, collection.id), eq(clm.ownerId, user.id));
      },

      orderBy: (clm, { desc }) => desc(clm.createdAt),
    });
    if (share && dayjs(share.expiresAt).isAfter(dayjs())) {
      return ctx.json({
        inviteCode: share.inviteCode,
        permission: share.permission,
        expiresAt: share.expiresAt,
      });
    }
    await db
      .update(CollectionShareTable)
      .set({
        deletedAt: dayjs().toISOString(),
      })
      .where(and(eq(CollectionShareTable.collectionId, collection.id), eq(CollectionShareTable.ownerId, user.id)));

    const inviteCode = crypto.randomBytes(6).toString("hex");

    let expiresAt = null;
    if (expriedIn) {
      const [value, type] = expriedIn.split("-");
      expiresAt = dayjs().add(+value, type as any);
    }
    if (!expiresAt) {
      return ctx.json({ message: "Không tạo được thời gian hết hạn của Invite code" }, 404);
    }
    const newShare = await db
      .insert(CollectionShareTable)
      .values({
        id: Bun.randomUUIDv7(),
        collectionId: collection.id,
        ownerId: user.id,
        inviteCode,
        permission: permission || "view",
        status: "pending",
        expiresAt: expiresAt.toISOString(),
        createdAt: dayjs().toISOString(),
        updatedAt: dayjs().toISOString(),
      })
      .returning()
      .then((res) => res[0]);

    return ctx.json({
      inviteCode: newShare.inviteCode,
      permission: newShare.permission,
      expiresAt: newShare.expiresAt,
    });
  }
).post(
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
    const share = await db.query.CollectionShareTable.findFirst({
      where: (clm, { eq }) => eq(clm.inviteCode, inviteCode),
      with: { collection: true },
    });
    if (!share) return ctx.json({ message: "Invaild invite code" }, 404);
    if (share.expiresAt && dayjs(share.expiresAt) < dayjs()) {
      return ctx.json({ message: "Invite code has expired" }, 400);
    }
    if (share.ownerId === user.id) {
      return ctx.json({ message: "You cannot join your own collection" }, 403);
    }
    if (share.sharedWithId === user.id && share.status === "accepted") {
      return ctx.json({ message: "You already have access to this collection" }, 400);
    }
    await db
      .update(CollectionShareTable)
      .set({ sharedWithId: user.id, status: "accepted" })
      .where(eq(CollectionShareTable.id, share.id));
    return ctx.json({
      message: "Successfully joined collection",
      collection: share.collection,
    });
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
