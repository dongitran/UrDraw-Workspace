import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as FullSchema from "./schema";
import * as FullRelation from "./relations";
const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    ...FullSchema,
    ...FullRelation,
  },
});
type WriteSystemInsert = typeof FullSchema.SystemLogTable.$inferInsert;
export const WriteSystemLog = (values: WriteSystemInsert) => {
  db.insert(FullSchema.SystemLogTable)
    .values(values)
    .then(() => {
      console.log("Write system log done");
    });
};
export default db;
