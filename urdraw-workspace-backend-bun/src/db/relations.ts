import { relations } from "drizzle-orm/relations";
import { CollectionTable, DrawingTable, CollectionShareTable } from "./schema";

export const drawingsRelations = relations(DrawingTable, ({one}) => ({
	collection: one(CollectionTable, {
		fields: [DrawingTable.collectionId],
		references: [CollectionTable.id]
	}),
}));

export const collectionsRelations = relations(CollectionTable, ({many}) => ({
	drawings: many(DrawingTable),
	collectionShares: many(CollectionShareTable),
}));

export const collectionSharesRelations = relations(CollectionShareTable, ({one}) => ({
	collection: one(CollectionTable, {
		fields: [CollectionShareTable.collectionId],
		references: [CollectionTable.id]
	}),
}));
