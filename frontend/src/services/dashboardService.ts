import { api } from "./api";

export async function getDatasetSummary() {
  const response = await api.get("/dashboard/summary");
  return response.data;
}