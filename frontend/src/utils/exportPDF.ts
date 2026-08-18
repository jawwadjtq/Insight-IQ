import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPDF(summary: any) {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ============================================================
  // COLORS
  // ============================================================

  const colors = {
    navy: [15, 23, 42],
    blue: [37, 99, 235],
    indigo: [79, 70, 229],
    white: [255, 255, 255],
    slate: [71, 85, 105],
    lightSlate: [100, 116, 139],
    border: [226, 232, 240],
    lightBlue: [239, 246, 255],
    lightGray: [248, 250, 252],
    green: [22, 163, 74],
    lightGreen: [240, 253, 244],
    red: [220, 38, 38],
    amber: [217, 119, 6],
  };

  // ============================================================
  // HELPERS
  // ============================================================

  function addHeader() {
    // Header background
    doc.setFillColor(
      colors.navy[0],
      colors.navy[1],
      colors.navy[2]
    );

    doc.rect(0, 0, pageWidth, 18, "F");

    // Logo square
    doc.setFillColor(
      colors.blue[0],
      colors.blue[1],
      colors.blue[2]
    );

    doc.roundedRect(14, 4, 10, 10, 2, 2, "F");

    // IQ
    doc.setTextColor(
      colors.white[0],
      colors.white[1],
      colors.white[2]
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("IQ", 19, 10.8, {
      align: "center",
    });

    // App name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text("InsightIQ", 29, 11);

    // Header subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.setTextColor(203, 213, 225);

    doc.text(
      "AI-Powered Business Intelligence Platform",
      29,
      14.5
    );
  }

  function addFooter() {
    const pageNumber = doc.getNumberOfPages();

    doc.setDrawColor(
      colors.border[0],
      colors.border[1],
      colors.border[2]
    );

    doc.line(
      15,
      pageHeight - 16,
      pageWidth - 15,
      pageHeight - 16
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.setTextColor(
      colors.lightSlate[0],
      colors.lightSlate[1],
      colors.lightSlate[2]
    );

    doc.text(
      "Generated automatically by InsightIQ",
      15,
      pageHeight - 9
    );

    doc.text(
      `Page ${pageNumber}`,
      pageWidth - 15,
      pageHeight - 9,
      {
        align: "right",
      }
    );
  }



  function getCurrentY() {
    const lastTable = (doc as any).lastAutoTable;

    if (lastTable?.finalY) {
      return lastTable.finalY + 12;
    }

    return 30;
  }

  function ensureSpace(requiredHeight: number) {
    const currentY = getCurrentY();

    if (currentY + requiredHeight > pageHeight - 25) {
      doc.addPage();
      addHeader();
      addFooter();

      return 30;
    }

    return currentY;
  }

  // ============================================================
  // HEADER / FOOTER
  // ============================================================

  addHeader();
  addFooter();

  // ============================================================
  // TITLE
  // ============================================================

  doc.setTextColor(
    colors.navy[0],
    colors.navy[1],
    colors.navy[2]
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);

  doc.text("AI Executive Report", 15, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.setTextColor(
    colors.lightSlate[0],
    colors.lightSlate[1],
    colors.lightSlate[2]
  );

  doc.text(
    "AI-generated business intelligence report",
    15,
    41
  );

  // ============================================================
  // REPORT META
  // ============================================================

  doc.setFillColor(
    colors.lightBlue[0],
    colors.lightBlue[1],
    colors.lightBlue[2]
  );

  doc.roundedRect(
    15,
    48,
    pageWidth - 30,
    24,
    4,
    4,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.setTextColor(
    colors.blue[0],
    colors.blue[1],
    colors.blue[2]
  );

  doc.text("DATASET", 22, 56);

  doc.setTextColor(
    colors.navy[0],
    colors.navy[1],
    colors.navy[2]
  );

  doc.setFontSize(10);

  doc.text(
    String(summary.dataset_name || "Uploaded Dataset"),
    22,
    63
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.setTextColor(
    colors.blue[0],
    colors.blue[1],
    colors.blue[2]
  );

  doc.text("GENERATED", pageWidth - 70, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.setTextColor(
    colors.navy[0],
    colors.navy[1],
    colors.navy[2]
  );

  doc.text(
    new Date().toLocaleDateString(),
    pageWidth - 70,
    63
  );

  // ============================================================
  // DATASET OVERVIEW
  // ============================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.setTextColor(
    colors.navy[0],
    colors.navy[1],
    colors.navy[2]
  );

  doc.text("Dataset Overview", 15, 85);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.setTextColor(
    colors.lightSlate[0],
    colors.lightSlate[1],
    colors.lightSlate[2]
  );

  doc.text(
    "High-level statistics and quality indicators.",
    15,
    91
  );

  // ============================================================
  // OVERVIEW TABLE
  // ============================================================

  autoTable(doc, {
    startY: 97,

    head: [["Metric", "Value"]],

    body: [
      ["Dataset", summary.dataset_name || "N/A"],
      ["Rows", summary.rows ?? "N/A"],
      ["Columns", summary.columns ?? "N/A"],
      [
        "Quality Score",
        summary.quality_score !== undefined
          ? `${summary.quality_score}%`
          : "N/A",
      ],
      [
        "Missing Values",
        summary.missing_values ?? "N/A",
      ],
      [
        "Duplicate Rows",
        summary.duplicate_rows ?? "N/A",
      ],
      [
        "Numeric Columns",
        summary.numeric_columns ?? "N/A",
      ],
      [
        "Categorical Columns",
        summary.categorical_columns ?? "N/A",
      ],
      [
        "Memory Usage",
        summary.memory_usage_mb !== undefined
          ? `${summary.memory_usage_mb} MB`
          : "N/A",
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [
        colors.navy[0],
        colors.navy[1],
        colors.navy[2],
      ],
      textColor: [
        colors.white[0],
        colors.white[1],
        colors.white[2],
      ],
      fontStyle: "bold",
      fontSize: 9,
    },

    bodyStyles: {
      fontSize: 8,
      textColor: [
        colors.slate[0],
        colors.slate[1],
        colors.slate[2],
      ],
    },

    alternateRowStyles: {
      fillColor: [
        colors.lightGray[0],
        colors.lightGray[1],
        colors.lightGray[2],
      ],
    },

    styles: {
      cellPadding: 4,
      lineColor: [
        colors.border[0],
        colors.border[1],
        colors.border[2],
      ],
      lineWidth: 0.2,
    },

    margin: {
      left: 15,
      right: 15,
    },

    didDrawPage: () => {
      addHeader();
      addFooter();
    },
  });

  // ============================================================
  // DATA QUALITY
  // ============================================================

  let y = ensureSpace(55);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.setTextColor(
    colors.navy[0],
    colors.navy[1],
    colors.navy[2]
  );

  doc.text("Data Quality Assessment", 15, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.setTextColor(
    colors.lightSlate[0],
    colors.lightSlate[1],
    colors.lightSlate[2]
  );

  doc.text(
    "Automated assessment of the uploaded dataset.",
    15,
    y + 6
  );

  // Quality score box

  const qualityScore = Number(
    summary.quality_score ?? 0
  );

  doc.setFillColor(
    colors.lightGreen[0],
    colors.lightGreen[1],
    colors.lightGreen[2]
  );

  doc.roundedRect(
    15,
    y + 14,
    pageWidth - 30,
    25,
    4,
    4,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.setTextColor(
    colors.green[0],
    colors.green[1],
    colors.green[2]
  );

  doc.text("DATA QUALITY SCORE", 22, y + 24);

  doc.setFontSize(20);

  doc.text(
    `${qualityScore}%`,
    pageWidth - 22,
    y + 28,
    {
      align: "right",
    }
  );

  // Quality details table

  autoTable(doc, {
    startY: y + 47,

    head: [["Quality Indicator", "Value"]],

    body: [
      [
        "Missing Values",
        summary.missing_values ?? "N/A",
      ],
      [
        "Duplicate Rows",
        summary.duplicate_rows ?? "N/A",
      ],
      [
        "Numeric Columns",
        summary.numeric_columns ?? "N/A",
      ],
      [
        "Categorical Columns",
        summary.categorical_columns ?? "N/A",
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [
        colors.blue[0],
        colors.blue[1],
        colors.blue[2],
      ],
      textColor: [
        colors.white[0],
        colors.white[1],
        colors.white[2],
      ],
      fontStyle: "bold",
      fontSize: 9,
    },

    bodyStyles: {
      fontSize: 8,
    },

    styles: {
      cellPadding: 4,
      lineColor: [
        colors.border[0],
        colors.border[1],
        colors.border[2],
      ],
      lineWidth: 0.2,
    },

    margin: {
      left: 15,
      right: 15,
    },

    didDrawPage: () => {
      addHeader();
      addFooter();
    },
  });

  // ============================================================
  // EXECUTIVE SUMMARY
  // ============================================================

  const executiveSummary =
    summary.executive_summary ||
    summary.executiveSummary ||
    summary.summary;

  if (executiveSummary) {
    y = ensureSpace(50);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);

    doc.setTextColor(
      colors.navy[0],
      colors.navy[1],
      colors.navy[2]
    );

    doc.text("Executive Summary", 15, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.setTextColor(
      colors.slate[0],
      colors.slate[1],
      colors.slate[2]
    );

    const summaryText = String(executiveSummary);

    const wrappedText = doc.splitTextToSize(
      summaryText,
      pageWidth - 30
    );

    doc.text(wrappedText, 15, y + 9, {
      lineHeightFactor: 1.6,
    });
  }

  // ============================================================
  // AI INSIGHTS
  // ============================================================

  const insights =
    summary.insights ||
    summary.ai_insights ||
    summary.aiInsights;

  if (
    insights &&
    Array.isArray(insights) &&
    insights.length > 0
  ) {
    y = ensureSpace(55);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);

    doc.setTextColor(
      colors.navy[0],
      colors.navy[1],
      colors.navy[2]
    );

    doc.text("AI Insights", 15, y);

    const insightRows = insights.map(
      (insight: any, index: number) => [
        `${index + 1}`,
        typeof insight === "string"
          ? insight
          : insight?.title ||
            insight?.description ||
            JSON.stringify(insight),
      ]
    );

    autoTable(doc, {
      startY: y + 8,

      head: [["#", "Insight"]],

      body: insightRows,

      theme: "grid",

      headStyles: {
        fillColor: [
          colors.indigo[0],
          colors.indigo[1],
          colors.indigo[2],
        ],
        textColor: [
          colors.white[0],
          colors.white[1],
          colors.white[2],
        ],
        fontStyle: "bold",
      },

      bodyStyles: {
        fontSize: 8,
      },

      styles: {
        cellPadding: 4,
        lineColor: [
          colors.border[0],
          colors.border[1],
          colors.border[2],
        ],
        lineWidth: 0.2,
      },

      margin: {
        left: 15,
        right: 15,
      },

      didDrawPage: () => {
        addHeader();
        addFooter();
      },
    });
  }

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================

  const recommendations =
    summary.recommendations ||
    summary.ai_recommendations ||
    summary.aiRecommendations;

  if (
    recommendations &&
    Array.isArray(recommendations) &&
    recommendations.length > 0
  ) {
    y = ensureSpace(55);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);

    doc.setTextColor(
      colors.navy[0],
      colors.navy[1],
      colors.navy[2]
    );

    doc.text("Business Recommendations", 15, y);

    const recommendationRows =
      recommendations.map(
        (recommendation: any, index: number) => [
          `${index + 1}`,
          typeof recommendation === "string"
            ? recommendation
            : recommendation?.title ||
              recommendation?.description ||
              JSON.stringify(recommendation),
        ]
      );

    autoTable(doc, {
      startY: y + 8,

      head: [["#", "Recommendation"]],

      body: recommendationRows,

      theme: "grid",

      headStyles: {
        fillColor: [
          colors.blue[0],
          colors.blue[1],
          colors.blue[2],
        ],
        textColor: [
          colors.white[0],
          colors.white[1],
          colors.white[2],
        ],
        fontStyle: "bold",
      },

      bodyStyles: {
        fontSize: 8,
      },

      styles: {
        cellPadding: 4,
        lineColor: [
          colors.border[0],
          colors.border[1],
          colors.border[2],
        ],
        lineWidth: 0.2,
      },

      margin: {
        left: 15,
        right: 15,
      },

      didDrawPage: () => {
        addHeader();
        addFooter();
      },
    });
  }

  // ============================================================
  // FINAL REPORT MESSAGE
  // ============================================================

  y = ensureSpace(45);

  doc.setFillColor(
    colors.navy[0],
    colors.navy[1],
    colors.navy[2]
  );

  doc.roundedRect(
    15,
    y,
    pageWidth - 30,
    28,
    4,
    4,
    "F"
  );

  doc.setTextColor(
    colors.white[0],
    colors.white[1],
    colors.white[2]
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(
    "InsightIQ — AI-Powered Business Intelligence",
    pageWidth / 2,
    y + 11,
    {
      align: "center",
    }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  doc.setTextColor(203, 213, 225);

  doc.text(
    "This report was generated automatically from your uploaded dataset.",
    pageWidth / 2,
    y + 18,
    {
      align: "center",
    }
  );

  // ============================================================
  // UPDATE ALL PAGE FOOTERS
  // ============================================================

  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    // Make sure footer exists on every page
    addFooter();
  }

  // ============================================================
  // DOWNLOAD
  // ============================================================

  const safeDatasetName = String(
    summary.dataset_name || "Dataset"
  )
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 50);

  doc.save(
    `InsightIQ_${safeDatasetName}_Executive_Report.pdf`
  );
}