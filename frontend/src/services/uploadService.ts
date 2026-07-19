import { api } from "./api";

export async function uploadDataset(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/upload/", formData);

  return response.data;
}