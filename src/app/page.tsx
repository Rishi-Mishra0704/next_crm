"use client";
import { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";

export default function Home() {
  const [dbUrl, setDbUrl] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, { columns: string[]; data: any[] }>>({});
  const [error, setError] = useState("");
  const [columns, setColumns] = useState<Record<string, TableColumn<any>[]>>({});

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
          newColumns[table] = data.data?.tableData[table]?.columns.map((col) => ({
            name: col,
            selector: (row) => (typeof row[col] === "object" ? JSON.stringify(row[col]) : row[col] ?? "-"),
            sortable: true,
          })) || [];
        });

        setColumns(newColumns);
      } else {
        setError(typeof data.error === "string" ? data.error : "Unknown error");
      }
    } catch (err) {
      setError("Failed to fetch tables");
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
      <button onClick={fetchTables} className="bg-blue-500 text-white p-2 rounded">
        Fetch Tables
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <h2 className="text-xl font-semibold mt-6">All Tables</h2>
      {tables.length > 0 ? (
        <div className="mt-4">
          {tables.map((table) => (
            <div key={table} className="w-full p-4">
              <h3 className="text-lg font-semibold mb-2">{table}</h3>
              {columns[table]?.length > 0 ? (
                <DataTable
                  columns={columns[table]}
                  data={tableData[table]?.data || []}
                  striped
                  highlightOnHover
                  pagination
                />
              ) : (
                <p>No columns found for this table.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-2">No tables found.</p>
      )}
    </main>
  );
}
