import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export async function getSchemaInfo(
  db: NodePgDatabase<Record<string, never>> & { $client: Pool }
): Promise<string | null> {
  const schemaQuery = `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

  const result: QueryResult<SchemaRow> = await db.execute(sql.raw(schemaQuery));

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  // Structure schema information in a readable format
  const schemaInfo: Record<string, string[]> = {};

  result.rows.forEach((row: SchemaRow) => {
    const { table_name, column_name } = row;
    if (!schemaInfo[table_name]) {
      schemaInfo[table_name] = [];
    }
    schemaInfo[table_name].push(column_name);
  });

  return Object.entries(schemaInfo)
    .map(([table, columns]) => `${table}(${columns.join(", ")})`)
    .join("; ");
}
