import {
  Database,
  FileText,
  BrainCircuit,
  HardDrive,
  UploadCloud,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";

import type {
  KPI,
  QuickAction,
  Dataset,
  Report,
  ActivityItem,
  AIInsight,
  StorageUsage,
} from "../types/dashboard";

export const kpis: KPI[] = [
  {
    title: "Datasets",
    value: 12,
    subtitle: "Available datasets",
    icon: Database,
    trend: 18,
  },
  {
    title: "Reports",
    value: 36,
    subtitle: "Generated reports",
    icon: FileText,
    trend: 9,
  },
  {
    title: "AI Analyses",
    value: 148,
    subtitle: "Completed analyses",
    icon: BrainCircuit,
    trend: 27,
  },
  {
    title: "Storage",
    value: "2.8 GB",
    subtitle: "of 10 GB used",
    icon: HardDrive,
  },
];

export const quickActions: QuickAction[] = [
  {
    title: "Upload Dataset",
    description: "Import CSV, Excel and PDF files",
    to: "/upload",
    icon: UploadCloud,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "AI Analyst",
    description: "Ask questions about your data",
    to: "/ai",
    icon: BrainCircuit,
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    title: "Analytics",
    description: "Explore dashboards and visualizations",
    to: "/analytics",
    icon: BarChart3,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Reports",
    description: "Generate executive reports",
    to: "/reports",
    icon: FileText,
    color: "bg-amber-500/10 text-amber-500",
  },
];

export const datasets: Dataset[] = [
  {
    id: 1,
    name: "Sales_2026.csv",
    rows: "24,518 rows",
    uploaded: "2 hours ago",
    status: "Ready",
  },
  {
    id: 2,
    name: "Marketing.xlsx",
    rows: "8,340 rows",
    uploaded: "Yesterday",
    status: "Ready",
  },
  {
    id: 3,
    name: "Finance_Q2.csv",
    rows: "14,120 rows",
    uploaded: "3 days ago",
    status: "Processing",
  },
];

export const reports: Report[] = [
  {
    id: 1,
    title: "Executive Summary",
    date: "Today",
  },
  {
    id: 2,
    title: "Sales Performance",
    date: "Yesterday",
  },
  {
    id: 3,
    title: "Customer Insights",
    date: "3 days ago",
  },
];

export const activities: ActivityItem[] = [
  {
    id: 1,
    title: "Dataset Uploaded",
    description: "Sales_2026.csv uploaded successfully.",
    time: "10 minutes ago",
    icon: UploadCloud,
  },
  {
    id: 2,
    title: "AI Analysis Completed",
    description: "Business insights generated.",
    time: "32 minutes ago",
    icon: BrainCircuit,
  },
  {
    id: 3,
    title: "Executive Report Generated",
    description: "PDF report is ready.",
    time: "1 hour ago",
    icon: FileText,
  },
  {
    id: 4,
    title: "Data Quality Check",
    description: "Missing value analysis completed.",
    time: "Today",
    icon: CheckCircle2,
  },
];

export const aiInsights: AIInsight[] = [
  {
    title: "Sales increased by 18%",
    description: "Compared with the previous reporting period.",
    icon: TrendingUp,
  },
  {
    title: "Missing values detected",
    description: "One dataset contains incomplete records.",
    icon: AlertTriangle,
  },
  {
    title: "AI Recommendation",
    description: "Generate a quarterly executive report.",
    icon: Lightbulb,
  },
];

export const storageUsage: StorageUsage = {
  used: 2.8,
  total: 10,
};