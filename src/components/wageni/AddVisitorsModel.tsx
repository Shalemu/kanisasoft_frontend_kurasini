'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
}

const initialForm = {
  full_name: '',
  phone: '',
  church_origin: '',
  visit_date: new Date().toISOString().split('T')[0],
  prayer: false,
  salvation: false,
  joining: false,
  travel: false,
  other: '',
};

function Checkbox({
  label,
  checked,
  onChange,
}:{
  label:string;
  checked:boolean;
  onChange:()=>void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

export default function AddVisitorModal({
  open,
  onClose,
  onSubmit
}: Props) {

  const [form,setForm]=useState(initialForm);

  if (!open) return null;

  const handleSave = async () => {

    if (
      !form.full_name ||
      !form.phone ||
      !form.church_origin
    ) {
      Swal.fire({
        icon:'warning',
        title:'Taarifa Hazijakamilika',
        text:'Jaza jina, simu na kanisa.',
      });

      return;
    }

    try {

  await onSubmit(form);

  await Swal.fire({
    icon: 'success',
    title: 'Imehifadhiwa',
    text: 'Mgeni ameongezwa kikamilifu.',
    confirmButtonText: 'Sawa'
  });

  setForm(initialForm);

  onClose();

} catch (error) {

  Swal.fire({
    icon: 'error',
    title: 'Hitilafu',
    text: 'Imeshindikana kuhifadhi taarifa.',
    confirmButtonText: 'Sawa'
  });

  console.error(error);
}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl text-gray-800 dark:bg-gray-900 dark:text-white/90">

        <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white/90">
          Ongeza Taarifa za Mgeni
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Jina Kamili"
            value={form.full_name}
            onChange={(e)=>
              setForm({
                ...form,
                full_name:e.target.value
              })
            }
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
          />

          <input
            type="text"
            placeholder="Namba ya Simu"
            value={form.phone}
            onChange={(e)=>
              setForm({
                ...form,
                phone:e.target.value
              })
            }
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
          />

          <input
            type="text"
            placeholder="Kanisa Alikotoka"
            value={form.church_origin}
            onChange={(e)=>
              setForm({
                ...form,
                church_origin:e.target.value
              })
            }
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
          />

          <input
            type="date"
            value={form.visit_date}
            onChange={(e)=>
              setForm({
                ...form,
                visit_date:e.target.value
              })
            }
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          />

          <textarea
            placeholder="Sababu nyingine..."
            value={form.other}
            onChange={(e)=>
              setForm({
                ...form,
                other:e.target.value
              })
            }
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500 md:col-span-2"
          />

          <div className="md:col-span-2 flex flex-wrap gap-4">

            <Checkbox
              label="Maombi"
              checked={form.prayer}
              onChange={()=>
                setForm({
                  ...form,
                  prayer:!form.prayer
                })
              }
            />

            <Checkbox
              label="Kuokoka"
              checked={form.salvation}
              onChange={()=>
                setForm({
                  ...form,
                  salvation:!form.salvation
                })
              }
            />

            <Checkbox
              label="Kujiunga"
              checked={form.joining}
              onChange={()=>
                setForm({
                  ...form,
                  joining:!form.joining
                })
              }
            />

            <Checkbox
              label="Safari"
              checked={form.travel}
              onChange={()=>
                setForm({
                  ...form,
                  travel:!form.travel
                })
              }
            />

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Ghairi
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Hifadhi
          </button>

        </div>

      </div>

    </div>
  );
}
