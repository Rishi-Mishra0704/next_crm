import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  let pool;
  try {
    const { dbUrl } = await req.json();
    if (!dbUrl) return NextResponse.json({ error: "Database URL is required" }, { status: 400 });

    // Ensure the connection is established
    pool = new Pool({ connectionString: dbUrl, database: "Dev" });
    const db = drizzle(pool);

    // Fetch all table names
    const tables = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
    );

    if (!tables.rows.length) {
      return NextResponse.json({ error: "No tables found" }, { status: 404 });
    }

    const allTables = tables.rows.map(row => row.table_name as string);
    const emailTables: string[] = [];

    // Check which tables contain an 'email' column
    const emailData: Record<string, string[]> = {};

    for (const table of allTables) {
      const columns = await db.execute(
        sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${table};`
      );

      const hasEmail = columns.rows.some(col => col.column_name === "email");

      if (hasEmail) {
        emailTables.push(table);

        // Fetch emails
        const emails = await db.execute(sql`SELECT email FROM ${sql.raw(table)}`);
        emailData[table] = emails.rows.map(row => row.email) as string[];
      }
    }

    return NextResponse.json({ allTables, emailTables, emailData }, { status: 200 });

  } catch (error) {
    console.error("Error fetching tables/emails:", error);
    return NextResponse.json({ message: "Failed to fetch tables/emails", error }, { status: 500 });

  } finally {
    if (pool) await pool.end(); // Close database connection properly
  }
}
