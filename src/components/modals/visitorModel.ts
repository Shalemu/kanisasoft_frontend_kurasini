import { apiFetch } from '@/lib/api';

export const VisitorModel = {
  add: (form: any) =>
    apiFetch('/guests', {
      method: 'POST',
      body: JSON.stringify(form),
    }),

  delete: (id: number) =>
    apiFetch(`/guests/${id}`, {
      method: 'DELETE',
    }),
};