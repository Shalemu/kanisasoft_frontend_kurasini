import { apiFetch } from "@/lib/api";

export const getPreachings = () =>
  apiFetch("/preachings");

export const getPreaching = (id: number) =>
  apiFetch(`/preachings/${id}`);

export const createPreaching = (data: FormData) =>
  apiFetch("/preachings", {
    method: "POST",
    body: data,
  });

export const updatePreaching = (
  id: number,
  data: FormData
) =>
  apiFetch(`/preachings/${id}`, {
    method: "POST", // Laravel + FormData
    body: (() => {
      data.append("_method", "PUT");
      return data;
    })(),
  });

export const deletePreaching = (id: number) =>
  apiFetch(`/preachings/${id}`, {
    method: "DELETE",
  });