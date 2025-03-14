import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";


export async function POST(req: NextRequest) {
  let pool;
  try {
    const { dbUrl } = await req.json();
    if (!dbUrl) {
      return NextResponse.json<GeneralAPIResponse>(
        { success: false, message: "Database URL is required", error: "Missing dbUrl" },
        { status: 400 }
      );
    }

    pool = new Pool({ connectionString: dbUrl });
    const db = drizzle(pool);

    // Fetch all table names
    const tables = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
    );

    if (!tables.rows.length) {
      return NextResponse.json<GeneralAPIResponse>(
        { success: false, message: "No tables found", error: "Database is empty" },
        { status: 404 }
      );
    }

    const allTables = tables.rows.map(row => row.table_name as string);
    const tableData: Record<string, { columns: string[]; data: any[] }> = {};

    for (const table of allTables) {
      // Fetch column names
      const columns = await db.execute(
        sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${table};`
      );
      const columnNames = columns.rows.map(col => col.column_name as string);

      // Fetch table data
      const data = await db.execute(sql`SELECT * FROM ${sql.raw(table)}`);

      tableData[table] = { columns: columnNames, data: data.rows };
    }

    return NextResponse.json<TableDataResponse>(
      {
        success: true,
        message: "Tables fetched successfully",
        data: { allTables, tableData },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tables/data:", error);
    return NextResponse.json<GeneralAPIResponse>(
      { success: false, message: "Failed to fetch tables/data", error },
      { status: 500 }
    );
  } finally {
    if (pool) await pool.end();
  }
}