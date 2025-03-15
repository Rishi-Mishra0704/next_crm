import { askAi } from "@/lib/util/ai";
import { getSchemaInfo } from "@/lib/util/db";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function POST(req: NextRequest) {
  let pool: Pool | null = null;
  try {
    const { dbUrl, prompt } = await req.json();
    if (!dbUrl || !prompt) {
      return NextResponse.json<QueryResponse<null>>(
        { success: false, message: "Database URL and prompt are required", data: null },
        { status: 400 }
      );
    }

    pool = new Pool({ connectionString: dbUrl });
    const db = drizzle(pool);

    const schemaInfo = await getSchemaInfo(db);
    if (!schemaInfo) {
      return NextResponse.json<QueryResponse<null>>(
        { success: false, message: "Failed to retrieve schema info", data: null },
        { status: 500 }
      );
    }

    console.log("Schema Info:", schemaInfo);
    

    const query = await askAi(schemaInfo, prompt);

    if (!query || query.startsWith("AI did not")) {
      return NextResponse.json<QueryResponse<null>>(
        { success: false, message: "Failed to generate a valid SQL query", data: null },
        { status: 500 }
      );
    }

    console.log("Generated SQL Query:", query);

    const result = await db.execute<SchemaRow>(sql.raw(query));

    return NextResponse.json<QueryResponse<SchemaRow>>(
      { success: true, data: result.rows, message: "Query executed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error executing AI-generated query:", error);
    return NextResponse.json<QueryResponse<null>>(
      { success: false, message: "Query execution failed", data: null, error },
      { status: 500 }
    );
  } finally {
    if (pool) await pool.end();
  }
}
