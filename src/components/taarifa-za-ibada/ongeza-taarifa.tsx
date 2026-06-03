'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '@/lib/api';

import Label from '@/components/form/Label';
import InputField from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import { Calendar } from "lucide-react";

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

export default function OngezaTaarifaZaIbada() {
  const serviceTypes = [
    'Ibada ya kimataifa',
    'Ibada ya Pili',
    'Ibada ya Tatu',
    'Ibada ya Vijana',
    'Ibada ya wanawake',
    'Ibada ya Neno la Mungu',
  ];

  const [formData, setFormData] = useState({
    date: '',
    service_name: '',
    preacher: '',
    preacher_description: '',
    message: '',
    attendance_children: 0,
    attendance_women: 0,
    attendance_men: 0,
    total_attendance: 0,
    total_offerings: 0,
    leaders_on_duty: '',
    duty_leader: '',
  });
  const dateRef = useRef<HTMLInputElement>(null);


 const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    let cleanedValue: string | number = value;

    const numericFields = [
      'attendance_children',
      'attendance_women',
      'attendance_men',
      'total_offerings',
    ];

    if (numericFields.includes(name)) {
      // remove leading zeros
      cleanedValue = value.replace(/^0+/, '');

      // if only "0"
      if (value === '0') {
        cleanedValue = '';
      }

      // fallback to 0 if empty
      cleanedValue = cleanedValue === '' ? 0 : cleanedValue;
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: cleanedValue,
      };

      // auto total attendance
      updated.total_attendance =
        Number(updated.attendance_children || 0) +
        Number(updated.attendance_women || 0) +
        Number(updated.attendance_men || 0);

      return updated;
    });
  };


  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : 'Tatizo la mtandao';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const { service_name } = formData;

      const res = await apiFetch('/service-events', {
        method: 'POST',
        body: {
          date: toIsoDate(formData.date),
          service_name,
          title: service_name,
          preacher: formData.preacher,
          preacher_description: formData.preacher_description,
          leaders_on_duty: formData.leaders_on_duty,
          attendance_children: Number(formData.attendance_children || 0),
          attendance_women: Number(formData.attendance_women || 0),
          attendance_men: Number(formData.attendance_men || 0),
          total_offerings: Number(formData.total_offerings || 0),
          message: formData.message,
        },
      });

      if (res.service_event || res.status === 'success') {
        Swal.fire('Success', 'Taarifa imehifadhiwa!', 'success');

        setFormData({
          date: '',
          service_name: '',
          preacher: '',
          preacher_description: '',
          message: '',
          attendance_children: 0,
          attendance_women: 0,
          attendance_men: 0,
          total_attendance: 0,
          total_offerings: 0,
          leaders_on_duty: '',
          duty_leader: '',
        });
      } else {
        Swal.fire('Error', res.message || 'Imeshindikana', 'error');
      }
    } catch (err: unknown) {
      Swal.fire('Error', getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-800 shadow dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white/90">
        Ongeza Taarifa za Ibada
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

{/* DATE */}
<div className="relative">
  <Label>Tarehe</Label>

  <InputField
    ref={dateRef}
    name="date"
    type="date"
    value={formData.date}
    onChange={handleChange}
    className="pr-10"
  />

  <button
    type="button"
    onClick={() => {
      dateRef.current?.showPicker?.();
      dateRef.current?.focus();
    }}
    className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
  >
    <Calendar size={18} />
  </button>
</div>

        {/* SERVICE */}
        <div>
          <Label>Aina ya Ibada</Label>
          <select
            name="service_name"
            value={formData.service_name}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">Chagua Huduma</option>
            {serviceTypes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* PREACHER */}
        <div>
          <Label>Mhubiri</Label>
          <InputField
            name="preacher"
             placeholder="Andika Jina la mhubiri"
            type="text"
            value={formData.preacher}
            onChange={handleChange}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <Label>Mahubiri</Label>
          <InputField
            name="preacher_description"
             placeholder="Andika maelezo mafupi ya mhubiri"
            type="text"
            value={formData.preacher_description}
            onChange={handleChange}
          />
        </div>

        {/* LEADER */}
        <div>
          <Label>Kiongozi wa Ibada</Label>
          <InputField
            name="leaders_on_duty"
             placeholder="Andika Jina la Kiongozi wa Ibada"
            type="text"
            value={formData.leaders_on_duty}
            onChange={handleChange}
          />
          </div>
   <div>
    <Label>Kiongozi wa Zamu</Label>
    <InputField
      name="duty_leader"
      placeholder="Andika Jina la Kiongozi wa Zamu"
      type="text"
      value={formData.duty_leader}
      onChange={handleChange}
    />
  </div>
        

        {/* CHILDREN */}
        <div>
          <Label>Watoto waliohudhuria</Label>
          <InputField
            name="attendance_children"
            type="number"
            inputMode="numeric"
            value={formData.attendance_children}
            onChange={handleChange}
          />
        </div>

        {/* WOMEN */}
        <div>
          <Label>Wanawake waliohudhuria</Label>
          <InputField
            name="attendance_women"
            type="number"
            inputMode="numeric"
            value={formData.attendance_women}
            onChange={handleChange}
          />
        </div>

        {/* MEN */}
        <div>
          <Label>Wanaume waliohudhuria</Label>
          <InputField
            name="attendance_men"
            type="number"
            inputMode="numeric"
            value={formData.attendance_men}
            onChange={handleChange}
          />
        </div>

        {/* TOTAL */}
        <div>
          <Label>Jumla ya Mahudhurio</Label>
          <InputField
            name="total_attendance"
            type="number"
            value={formData.total_attendance}
            disabled
            onChange={() => {}}
          />
        </div>

        {/* OFFERINGS */}
        <div>
          <Label>Jumla ya Sadaka zilitolewa(Tsh)</Label>
          <InputField
            name="total_offerings"
            type="number"
            value={formData.total_offerings}
            onChange={handleChange}
          />
        </div>

        {/* MESSAGE */}
        <div className="md:col-span-2">
          <Label>Ujumbe</Label>
          <TextArea
            name="message"
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        {/* SUBMIT */}
        <div className="md:col-span-2">
     <button
        type="submit"
        className="w-full rounded bg-[#334155] py-3 text-white transition-colors hover:bg-[#1e293b] dark:bg-brand-600 dark:hover:bg-brand-700"
        >
        Hifadhi Taarifa
        </button>
        </div>

      </form>
    </div>
  );
}
