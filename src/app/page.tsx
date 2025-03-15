"use client";
import DbTable from "@/lib/components/DbTable";
import { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Primitive } from "react-data-table-component/dist/DataTable/types";

export default function Home() {
  const [dbUrl, setDbUrl] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [tableData, setTableData] = useState<
    Record<string, { columns: string[]; data: Record<string, unknown>[] }>
  >({});
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [columns, setColumns] = useState<Record<string, TableColumn<any>[]>>(
    {}
  );
  const [queryResult, setQueryResult] = useState<Record<string, unknown>[]>([]);
  const [queryColumns, setQueryColumns] = useState<
    TableColumn<Record<string, unknown>>[]
  >([]);

  const fetchTables = async () => {
    setError("");
    try {
      const res = await fetch("/api/fetch-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbUrl }),
      });

      const data: TableDataResponse = await res.json();

      if (res.ok && data.success) {
        setTables(data.data?.allTables || []);
        setTableData(data.data?.tableData || {});

        // Generate columns once instead of inside map()
        const newColumns: Record<string, TableColumn<any>[]> = {};
        data.data?.allTables.forEach((table) => {
          newColumns[table] =
            data.data?.tableData[table]?.columns.map((col) => ({
              name: col,
              selector: (row) =>
                typeof row[col] === "object"
                  ? JSON.stringify(row[col])
                  : row[col] ?? "-",
              sortable: true,
            })) || [];
        });

        setColumns(newColumns);
      } else {
        setError(data.message ?? "Unknown error");
      }
    } catch (err) {
      setError("Failed to fetch tables");
    }
  };
  const onSubmitPrompt = async () => {
    if (!prompt) return;

    setError("");
    try {
      const res = await fetch("/prompt-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbUrl, prompt }),
      });

      const data: QueryResponse<Record<string, unknown>> = await res.json();

      if (res.ok && data.success && data.data) {
        setQueryResult(data.data);
        setQueryColumns(
          Object.keys(data.data[0] || {}).map((key) => ({
            name: key,
            selector: (row) =>
              typeof row[key] === "object"
                ? JSON.stringify(row[key])
                : (row[key] as Primitive) ?? "-",
            sortable: true,
          }))
        );
      } else {
        setError(data.message ?? "Unknown error");
      }
    } catch {
      setError("Failed to process prompt");
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Connect Your Database</h1>
      <input
        type="text"
        value={dbUrl}
        onChange={(e) => setDbUrl(e.target.value)}
        placeholder="Enter database URL"
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={fetchTables}
        className="bg-blue-500 text-white p-2 rounded cursor-pointer"
      >
        Fetch Tables
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <h2 className="text-xl font-semibold mt-6">All Tables</h2>
      {tables.length > 0 ? (
        <div className="mt-4">
          {tables.map((table) => (
            <DbTable
              key={table}
              tableName={table}
              columns={columns[table]}
              data={tableData[table]?.data || []}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-2">No tables found.</p>
      )}
      <label className="text-xl font-semibold mt-6" htmlFor="prompt">
        Get required data
      </label>
      <input
        type="text"
        className="w-full p-2 border rounded mt-4"
        id="prompt"
        placeholder="Enter your prompt here"
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={onSubmitPrompt}
        className="bg-blue-500 text-white p-2 rounded cursor-pointer mt-4"
      >
        Submit
      </button>
      {queryResult.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Query Results</h2>
          <DataTable columns={queryColumns} data={queryResult} pagination />
        </div>
      )}
    </main>
  );
}
