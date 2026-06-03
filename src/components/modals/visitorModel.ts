import { apiFetch } from '@/lib/api';

interface VisitorFormData {
  full_name: string;
  phone: string;
  church_origin: string;
  visit_date: string;
  prayer: boolean;
  salvation: boolean;
  joining: boolean;
  travel: boolean;
  other: string;
}

function toIsoDate(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return value;
}

export const VisitorModel = {
  add: (form: VisitorFormData) =>
    apiFetch('/guests', {
      method: 'POST',
      body: {
        ...form,
        visit_date: toIsoDate(form.visit_date),
      },
    }),

  delete: (id: number) =>
    apiFetch(`/guests/${id}`, {
      method: 'DELETE',
    }),
};
