import type { LucideIcon } from "lucide-react";

export interface KPI {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: LucideIcon;
}

export interface QuickAction {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  color: string;
}

export interface Dataset {
  id: number;
  name: string;
  rows: string;
  uploaded: string;
  status: "Ready" | "Processing";
}

export interface Report {
  id: number;
  title: string;
  date: string;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
}

export interface AIInsight {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface StorageUsage {
  used: number;
  total: number;
}