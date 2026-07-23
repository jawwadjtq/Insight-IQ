import { api } from "./api";

export async function getAIInsights() {
  const response = await api.get("/ai/insights");
  return response.data;
}