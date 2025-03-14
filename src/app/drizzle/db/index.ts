import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export const getDbClient = (dbUrl: string) => {
  const client = new Client({ connectionString: dbUrl });
  return drizzle(client);
};
