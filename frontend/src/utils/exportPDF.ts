import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPDF(summary: any) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("InsightIQ Executive Report", 20, 20);

  autoTable(doc, {
    startY: 35,
    head: [["Metric", "Value"]],
    body: [
      ["Dataset", summary.dataset_name],
      ["Rows", summary.rows],
      ["Columns", summary.columns],
      ["Quality Score", `${summary.quality_score}%`],
      ["Missing Values", summary.missing_values],
      ["Duplicate Rows", summary.duplicate_rows],
      ["Numeric Columns", summary.numeric_columns],
      ["Categorical Columns", summary.categorical_columns],
      ["Memory Usage", `${summary.memory_usage_mb} MB`],
    ],
  });

  doc.save("InsightIQ_Report.pdf");
}