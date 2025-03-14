type GeneralAPIResponse = {
    success: boolean;
    message: string;
    error?: unknown;
  };


  type TableDataResponse = GeneralAPIResponse & {
    data: {
      allTables: string[];
      tableData: Record<string, { columns: string[]; data: any[] }>;
    } | null;
  };
  