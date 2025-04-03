import { pgTable, uuid, varchar, timestamp, foreignKey, text, unique, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const enumCollectionSharesPermission = pgEnum("enum_collection_shares_permission", ["view", "edit"]);
export const enumCollectionSharesStatus = pgEnum("enum_collection_shares_status", ["pending", "accepted"]);
const commonTable = {
  id: varchar({ length: 255 }).primaryKey().unique().notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  params: jsonb(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  updatedBy: varchar("updated_by", { length: 255 }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  deletedBy: varchar("deleted_by", { length: 255 }),
};
export const WorkspaceTable = pgTable("workspaces", {
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  ...commonTable,
});
export const enumDrawingType = pgEnum("enum_drawing_type", ["excalidraw", "mermaid"]);

export const CollectionTable = pgTable("collections", {
  id: uuid().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  userId: varchar({ length: 255 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 255 }).notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  deletedAt: timestamp({ withTimezone: true, mode: "string" }),
});

export const DrawingTable = pgTable(
  "drawings",
  {
    id: uuid().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    content: text(),
    thumbnailUrl: text(),
    userId: varchar({ length: 255 }).notNull(),
    workspaceId: varchar("workspace_id", { length: 255 }).notNull(),
    lastModified: timestamp({ withTimezone: true, mode: "string" }),
    collectionId: uuid(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    deletedAt: timestamp({ withTimezone: true, mode: "string" }),
    type: enumDrawingType().default("excalidraw").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.collectionId],
      foreignColumns: [CollectionTable.id],
      name: "drawings_collectionId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ]
);

export const CollectionShareTable = pgTable(
  "collection_shares",
  {
    id: uuid().primaryKey().notNull(),
    collectionId: uuid().notNull(),
    ownerId: varchar({ length: 255 }).notNull(),
    sharedWithId: varchar({ length: 255 }),
    inviteCode: varchar({ length: 255 }).notNull(),
    permission: enumCollectionSharesPermission().default("view").notNull(),
    status: enumCollectionSharesStatus().default("pending").notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "string" }),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    deletedAt: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.collectionId],
      foreignColumns: [CollectionTable.id],
      name: "collection_shares_collectionId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    unique("collection_shares_inviteCode_key22").on(table.inviteCode),
    unique("collection_shares_inviteCode_key").on(table.inviteCode),
    unique("collection_shares_inviteCode_key1").on(table.inviteCode),
    unique("collection_shares_inviteCode_key2").on(table.inviteCode),
    unique("collection_shares_inviteCode_key3").on(table.inviteCode),
    unique("collection_shares_inviteCode_key4").on(table.inviteCode),
    unique("collection_shares_inviteCode_key5").on(table.inviteCode),
    unique("collection_shares_inviteCode_key6").on(table.inviteCode),
    unique("collection_shares_inviteCode_key7").on(table.inviteCode),
    unique("collection_shares_inviteCode_key8").on(table.inviteCode),
    unique("collection_shares_inviteCode_key9").on(table.inviteCode),
    unique("collection_shares_inviteCode_key10").on(table.inviteCode),
    unique("collection_shares_inviteCode_key11").on(table.inviteCode),
    unique("collection_shares_inviteCode_key12").on(table.inviteCode),
    unique("collection_shares_inviteCode_key13").on(table.inviteCode),
    unique("collection_shares_inviteCode_key14").on(table.inviteCode),
    unique("collection_shares_inviteCode_key15").on(table.inviteCode),
    unique("collection_shares_inviteCode_key16").on(table.inviteCode),
    unique("collection_shares_inviteCode_key17").on(table.inviteCode),
    unique("collection_shares_inviteCode_key18").on(table.inviteCode),
    unique("collection_shares_inviteCode_key19").on(table.inviteCode),
    unique("collection_shares_inviteCode_key20").on(table.inviteCode),
    unique("collection_shares_inviteCode_key21").on(table.inviteCode),
  ]
);
