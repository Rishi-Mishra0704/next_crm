"use client";
import { useState } from "react";

export default function Home() {
  const [dbUrl, setDbUrl] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, { columns: string[]; data: any[] }>>({});
  const [error, setError] = useState("");

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
            <div key={table} className="w-full p-4 ">
              <h3 className="text-lg font-semibold mb-2">{table}</h3>
              {tableData[table]?.columns.length ? (
                <table className="w-full border-collapse border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      {tableData[table].columns.map((col) => (
                        <th key={col} className="border border-gray-300 px-4 py-2 text-left">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData[table].data.length ? (
                      tableData[table].data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border border-gray-300">
                          {tableData[table].columns.map((col) => (
                            <td key={col} className="border border-gray-300 px-4 py-2">
                            {typeof row[col] === "object" ? JSON.stringify(row[col]) : row[col] ?? "-"}
                          </td>
                          
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={tableData[table].columns.length} className="text-center p-4">
                          No Data Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
