"use client";
import { useState } from "react";

export default function Home() {
  const [dbUrl, setDbUrl] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [emailTables, setEmailTables] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");

  const fetchTables = async () => {
    setError("");
    try {
      const res = await fetch("/api/fetch-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbUrl }),
      });
  
      const data = await res.json();

      if (res.ok) {
        setTables(data.allTables || []);
        setEmailTables(data.emailTables || {});
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Failed to fetch tables");
    }
  };
  

  const sendEmails = async (table: string, emailField: string) => {
    const subject = prompt("Enter email subject");
    const message = prompt("Enter email message");
    if (!subject || !message) return;

    try {
      const res = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbUrl, table, emailField, subject, message }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Emails sent to ${data.emailsSent} users`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to send emails");
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
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

      <h2 className="text-xl font-semibold mt-4">All Tables</h2>
      <ul className="mt-2">
        {tables?.map((table) => (
          <li key={table} className="border p-2 rounded mb-2">{table}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-4">Tables with Emails</h2>
      <ul className="mt-2">
        {Object.keys(emailTables).map((table) => (
          <li key={table} className="border p-2 rounded mb-2 flex justify-between">
            <span>{table}: {emailTables[table].join(", ")}</span>
            <button 
              className="bg-green-500 text-white p-2 rounded" 
              onClick={() => sendEmails(table, emailTables[table][0])}
            >
              Send Emails
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
