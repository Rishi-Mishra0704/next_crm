import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";

type DbTableProps = {
  tableName: string;
  columns: TableColumn<object>[];
  data: object[];
};

const DbTable: React.FC<DbTableProps> = ({ tableName, columns, data }) => {
  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-semibold mb-2">{tableName}</h3>
      {columns.length > 0 ? (
        <DataTable columns={columns} data={data} striped highlightOnHover pagination />
      ) : (
        <p>No columns found for this table.</p>
      )}
    </div>
  );
};

export default DbTable;