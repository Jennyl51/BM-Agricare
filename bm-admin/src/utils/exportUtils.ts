export function downloadCsv(filename: string, rows: Record<string, any>[]) {
    if (!rows.length) {
      alert("No data available to export.");
      return;
    }
  
    const headers = Object.keys(rows[0]);
  
    const escapeCsvValue = (value: any) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };
  
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => escapeCsvValue(row[header])).join(",")
      ),
    ].join("\n");
  
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
  
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
  
    link.href = url;
    link.download = filename;
    link.click();
  
    URL.revokeObjectURL(url);
  }
  
  export function printPage() {
    window.print();
  }