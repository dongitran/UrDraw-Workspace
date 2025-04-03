import { relations } from "drizzle-orm/relations";
import { CollectionTable, DrawingTable, CollectionShareTable, WorkspaceTable } from "./schema";

export const drawingsRelations = relations(DrawingTable, ({ one }) => ({
  collection: one(CollectionTable, {
    fields: [DrawingTable.collectionId],
    references: [CollectionTable.id],
  }),
}));

export const WorkspaceRelations = relations(WorkspaceTable, ({ many }) => ({
  collections: many(CollectionTable),
}));
export const collectionsRelations = relations(CollectionTable, ({ many, one }) => ({
  drawings: many(DrawingTable),
  collectionShares: many(CollectionShareTable),
  workspace: one(WorkspaceTable, {
    fields: [CollectionTable.workspaceId],
    references: [WorkspaceTable.id],
  }),
}));

export const collectionSharesRelations = relations(CollectionShareTable, ({ one }) => ({
  collection: one(CollectionTable, {
    fields: [CollectionShareTable.collectionId],
    references: [CollectionTable.id],
  }),
}));
