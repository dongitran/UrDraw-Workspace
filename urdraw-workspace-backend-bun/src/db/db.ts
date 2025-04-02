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

export default db;
