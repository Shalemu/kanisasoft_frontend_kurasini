import { apiFetch } from "@/lib/api";

export const getPaymentAccounts = () =>
  apiFetch("/payment-accounts");

export const createPaymentAccount = (data: FormData) =>
  apiFetch("/payment-accounts", {
    method: "POST",
    body: data,
  });

export const updatePaymentAccount = (
  id: number,
  data: FormData
) =>
  apiFetch(`/payment-accounts/${id}`, {
    method: "PUT",
    body: data,
  });

export const deletePaymentAccount = (id: number) =>
  apiFetch(`/payment-accounts/${id}`, {
    method: "DELETE",
  });