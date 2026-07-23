import axios from "axios";

export const api = axios.create({
  baseURL: "https://designers-realize-builds-luggage.trycloudflare.com",
});