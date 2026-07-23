import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportExcel(summary: any) {

  const worksheet = XLSX.utils.json_to_sheet([
    summary,
  ]);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Report"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob(
    [excelBuffer],
    {
      type: "application/octet-stream",
    }
  );

  saveAs(file, "InsightIQ_Report.xlsx");

}