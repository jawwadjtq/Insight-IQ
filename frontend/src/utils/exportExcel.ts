import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportExcel(summary: any) {
  const workbook = XLSX.utils.book_new();

  // ============================================================
  // COLORS
  // ============================================================

  const NAVY = "0F172A";
  const BLUE = "2563EB";
  const INDIGO = "4F46E5";
  const WHITE = "FFFFFF";
  const SLATE = "475569";
  const LIGHT_BLUE = "EFF6FF";
 

  // ============================================================
  // HELPERS
  // ============================================================

  function applyStyle(
    worksheet: XLSX.WorkSheet,
    cell: string,
    style: any
  ) {
    if (worksheet[cell]) {
      worksheet[cell].s = style;
    }
  }

  function styleTitle(
    worksheet: XLSX.WorkSheet,
    cell: string
  ) {
    applyStyle(worksheet, cell, {
      fill: {
        patternType: "solid",
        fgColor: {
          rgb: NAVY,
        },
      },
      font: {
        bold: true,
        color: WHITE,
        sz: 20,
      },
      alignment: {
        vertical: "center",
        horizontal: "left",
      },
    });
  }

  function styleSubtitle(
    worksheet: XLSX.WorkSheet,
    cell: string
  ) {
    applyStyle(worksheet, cell, {
      fill: {
        patternType: "solid",
        fgColor: {
          rgb: NAVY,
        },
      },
      font: {
        color: "CBD5E1",
        sz: 10,
      },
      alignment: {
        vertical: "center",
      },
    });
  }

  function styleSection(
    worksheet: XLSX.WorkSheet,
    range: string,
    color = BLUE
  ) {
    const decoded = XLSX.utils.decode_range(range);

    for (
      let row = decoded.s.r;
      row <= decoded.e.r;
      row++
    ) {
      for (
        let col = decoded.s.c;
        col <= decoded.e.c;
        col++
      ) {
        const address = XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

        if (!worksheet[address]) continue;

        worksheet[address].s = {
          fill: {
            patternType: "solid",
            fgColor: {
              rgb: color,
            },
          },
          font: {
            bold: true,
            color: WHITE,
            sz: 11,
          },
          alignment: {
            vertical: "center",
          },
        };
      }
    }
  }

  function setWidths(
    worksheet: XLSX.WorkSheet,
    widths: number[]
  ) {
    worksheet["!cols"] = widths.map((width) => ({
      wch: width,
    }));
  }

  // ============================================================
  // SHEET 1 — EXECUTIVE REPORT
  // ============================================================

  const executiveData = [
    ["INSIGHTIQ"],
    ["AI-Powered Business Intelligence Platform"],
    [],
    ["AI EXECUTIVE REPORT"],
    [],
    ["Dataset", summary.dataset_name ?? "N/A"],
    ["Generated", new Date().toLocaleDateString()],
    [],
    ["DATASET OVERVIEW"],
    ["Metric", "Value"],
    ["Dataset Name", summary.dataset_name ?? "N/A"],
    ["Rows", summary.rows ?? 0],
    ["Columns", summary.columns ?? 0],
    [
      "Quality Score",
      `${summary.quality_score ?? 0}%`,
    ],
    [
      "Missing Values",
      summary.missing_values ?? 0,
    ],
    [
      "Duplicate Rows",
      summary.duplicate_rows ?? 0,
    ],
    [
      "Numeric Columns",
      summary.numeric_columns ?? 0,
    ],
    [
      "Categorical Columns",
      summary.categorical_columns ?? 0,
    ],
    [
      "Memory Usage",
      `${summary.memory_usage_mb ?? 0} MB`,
    ],
  ];

  const executiveSheet =
    XLSX.utils.aoa_to_sheet(executiveData);

  executiveSheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 1 },
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 1 },
    },
    {
      s: { r: 3, c: 0 },
      e: { r: 3, c: 1 },
    },
  ];

  styleTitle(executiveSheet, "A1");
  styleSubtitle(executiveSheet, "A2");

  applyStyle(executiveSheet, "A4", {
    font: {
      bold: true,
      color: BLUE,
      sz: 16,
    },
  });

  styleSection(
    executiveSheet,
    "A9:B9",
    BLUE
  );

  styleSection(
    executiveSheet,
    "A10:B10",
    NAVY
  );

  // Metadata styling

  applyStyle(executiveSheet, "A6", {
    fill: {
      patternType: "solid",
      fgColor: {
        rgb: LIGHT_BLUE,
      },
    },
    font: {
      bold: true,
      color: SLATE,
    },
  });

  applyStyle(executiveSheet, "A7", {
    fill: {
      patternType: "solid",
      fgColor: {
        rgb: LIGHT_BLUE,
      },
    },
    font: {
      bold: true,
      color: SLATE,
    },
  });

  applyStyle(executiveSheet, "B6", {
    fill: {
      patternType: "solid",
      fgColor: {
        rgb: LIGHT_BLUE,
      },
    },
  });

  applyStyle(executiveSheet, "B7", {
    fill: {
      patternType: "solid",
      fgColor: {
        rgb: LIGHT_BLUE,
      },
    },
  });

  setWidths(
    executiveSheet,
    [30, 40]
  );

  executiveSheet["!rows"] = [
    { hpt: 32 },
    { hpt: 22 },
    {},
    { hpt: 28 },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    executiveSheet,
    "Executive Report"
  );

  // ============================================================
  // SHEET 2 — DATA QUALITY
  // ============================================================

  const qualityData = [
    ["INSIGHTIQ"],
    ["Data Quality Assessment"],
    [],
    ["Quality Metric", "Value", "Status"],
    [
      "Overall Quality Score",
      `${summary.quality_score ?? 0}%`,
      getQualityStatus(summary.quality_score),
    ],
    [
      "Missing Values",
      summary.missing_values ?? 0,
      summary.missing_values > 0
        ? "Review Required"
        : "Good",
    ],
    [
      "Duplicate Rows",
      summary.duplicate_rows ?? 0,
      summary.duplicate_rows > 0
        ? "Review Required"
        : "Good",
    ],
    [
      "Numeric Columns",
      summary.numeric_columns ?? 0,
      "Informational",
    ],
    [
      "Categorical Columns",
      summary.categorical_columns ?? 0,
      "Informational",
    ],
  ];

  const qualitySheet =
    XLSX.utils.aoa_to_sheet(qualityData);

  qualitySheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 2 },
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 2 },
    },
  ];

  styleTitle(qualitySheet, "A1");

  applyStyle(qualitySheet, "A2", {
    fill: {
      patternType: "solid",
      fgColor: {
        rgb: NAVY,
      },
    },
    font: {
      color: "CBD5E1",
      sz: 10,
    },
  });

  styleSection(
    qualitySheet,
    "A4:C4",
    BLUE
  );

  setWidths(
    qualitySheet,
    [32, 22, 25]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    qualitySheet,
    "Data Quality"
  );

  // ============================================================
  // SHEET 3 — AI INSIGHTS
  // ============================================================

  const insights =
    summary.insights ??
    summary.ai_insights ??
    summary.aiInsights ??
    [];

  const insightData: any[][] = [
    ["INSIGHTIQ"],
    ["AI-Generated Business Insights"],
    [],
    ["#", "Insight"],
  ];

  if (
    Array.isArray(insights) &&
    insights.length > 0
  ) {
    insights.forEach(
      (insight: any, index: number) => {
        insightData.push([
          index + 1,
          typeof insight === "string"
            ? insight
            : insight?.title ??
              insight?.description ??
              JSON.stringify(insight),
        ]);
      }
    );
  } else {
    insightData.push([
      "",
      "No AI insights available.",
    ]);
  }

  const insightSheet =
    XLSX.utils.aoa_to_sheet(insightData);

  insightSheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 1 },
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 1 },
    },
  ];

  styleTitle(insightSheet, "A1");

  applyStyle(insightSheet, "A2", {
    fill: {
      patternType: "solid",
      fgColor: {
        rgb: NAVY,
      },
    },
    font: {
      color: "CBD5E1",
      sz: 10,
    },
  });

  styleSection(
    insightSheet,
    "A4:B4",
    INDIGO
  );

  setWidths(
    insightSheet,
    [8, 100]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    insightSheet,
    "AI Insights"
  );

  // ============================================================
  // SHEET 4 — RECOMMENDATIONS
  // ============================================================

  const recommendations =
    summary.recommendations ??
    summary.ai_recommendations ??
    summary.aiRecommendations ??
    [];

  const recommendationData: any[][] = [
    ["INSIGHTIQ"],
    ["Business Recommendations"],
    [],
    ["#", "Recommendation"],
  ];

  if (
    Array.isArray(recommendations) &&
    recommendations.length > 0
  ) {
    recommendations.forEach(
      (
        recommendation: any,
        index: number
      ) => {
        recommendationData.push([
          index + 1,
          typeof recommendation === "string"
            ? recommendation
            : recommendation?.title ??
              recommendation?.description ??
              JSON.stringify(recommendation),
        ]);
      }
    );
  } else {
    recommendationData.push([
      "",
      "No recommendations available.",
    ]);
  }

  const recommendationSheet =
    XLSX.utils.aoa_to_sheet(
      recommendationData
    );

  recommendationSheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 1 },
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 1 },
    },
  ];

  styleTitle(
    recommendationSheet,
    "A1"
  );

  applyStyle(
    recommendationSheet,
    "A2",
    {
      fill: {
        patternType: "solid",
        fgColor: {
          rgb: NAVY,
        },
      },
      font: {
        color: "CBD5E1",
        sz: 10,
      },
    }
  );

  styleSection(
    recommendationSheet,
    "A4:B4",
    BLUE
  );

  setWidths(
    recommendationSheet,
    [8, 100]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    recommendationSheet,
    "Recommendations"
  );

  // ============================================================
  // SHEET 5 — RAW SUMMARY
  // ============================================================

  const rawData: any[][] = [
    ["INSIGHTIQ"],
    ["Complete Dataset Summary"],
    [],
    ["Property", "Value"],
  ];

  Object.entries(summary).forEach(
    ([key, value]) => {
      let formattedValue: any = value;

      if (
        typeof value === "object" &&
        value !== null
      ) {
        formattedValue = JSON.stringify(
          value,
          null,
          2
        );
      }

      rawData.push([
        key,
        formattedValue,
      ]);
    }
  );

  const rawSheet =
    XLSX.utils.aoa_to_sheet(rawData);

  rawSheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 1 },
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 1 },
    },
  ];

  styleTitle(rawSheet, "A1");

  applyStyle(rawSheet, "A2", {
    fill: {
      patternType: "solid",
      fgColor: {
        rgb: NAVY,
      },
    },
    font: {
      color: "CBD5E1",
      sz: 10,
    },
  });

  styleSection(
    rawSheet,
    "A4:B4",
    NAVY
  );

  setWidths(
    rawSheet,
    [35, 100]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    rawSheet,
    "Raw Summary"
  );

  // ============================================================
  // EXPORT
  // ============================================================

  const excelBuffer = XLSX.write(
    workbook,
    {
      bookType: "xlsx",
      type: "array",
    }
  );

  const file = new Blob(
    [excelBuffer],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  const datasetName = String(
    summary.dataset_name ?? "Dataset"
  )
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 50);

  saveAs(
    file,
    `InsightIQ_${datasetName}_Executive_Report.xlsx`
  );
}

// ============================================================
// QUALITY STATUS
// ============================================================

function getQualityStatus(
  score: any
): string {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return "Not Available";
  }

  if (numericScore >= 90) {
    return "Excellent";
  }

  if (numericScore >= 75) {
    return "Good";
  }

  if (numericScore >= 50) {
    return "Needs Review";
  }

  return "Poor";
}