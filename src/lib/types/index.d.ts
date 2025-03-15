type GeneralAPIResponse = {
  success: boolean;
  message: string;
  error?: unknown;
};

type TableDataResponse = GeneralAPIResponse & {
  data?: {
    allTables: string[];
    tableData: Record<string, { columns: string[]; data: Record<string, unknown>[] }>;
  };
}


type SchemaRow = { table_name: string; column_name: string };
type SchemaInfo = SchemaRow[];

type QueryResult<T> = {
  rows: T[];
};

type QueryResponse<T> =  GeneralAPIResponse & {
  data: T[] | null;
}