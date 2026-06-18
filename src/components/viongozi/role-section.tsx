"use client";

import { FaEdit, FaTrash, FaPlus, FaFilePdf, FaFileExcel } from "react-icons/fa";
import Swal from "sweetalert2";
import { useMemo, useState } from "react";

interface Props {
  roles: any[];
  selectedRoleIds: number[];
  toggleRoleSelect: (id: number) => void;
  toggleSelectAllRoles: () => void;
  deleteSelectedRoles: () => void;
  deleteRole: (id: number) => void;
  setEditRole: (role: any) => void;
  setAddRole?: () => void;
  exportPDF?: () => void;
  exportExcel?: () => void;
}

export default function RolesSection({
  roles = [],
  selectedRoleIds = [],
  toggleRoleSelect,
  toggleSelectAllRoles,
  deleteSelectedRoles,
  deleteRole,
  setEditRole,
  setAddRole,
  exportPDF,
  exportExcel,
}: Props) {


  const [page, setPage] = useState(1);
  const perPage = 5;

  const totalPages = Math.ceil(roles.length / perPage);

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * perPage;
    return roles.slice(start, start + perPage);
  }, [roles, page]);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

 
  const confirmDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Una uhakika?",
      text: "Nafasi hii itafutwa kabisa!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ndiyo, futa",
      cancelButtonText: "Ghairi",
      confirmButtonColor: "#1e293b",
    });

    if (result.isConfirmed) {
      await deleteRole(id);

      Swal.fire({
        icon: "success",
        title: "Imefutwa",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  const confirmBulkDelete = async () => {
    const result = await Swal.fire({
      title: "Futa nafasi zilizochaguliwa?",
      text: `Umechagua ${selectedRoleIds.length} nafasi`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ndiyo Futa",
      cancelButtonText: "Ghairi",
      confirmButtonColor: "#1e293b",
    });

    if (result.isConfirmed) {
      await deleteSelectedRoles();
    }
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">

      {/*  HEADER */}
      <div className="flex items-center justify-between p-5 border-b dark:border-gray-800">

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Nafasi za Uongozi
          </h2>
          <p className="text-sm text-gray-500">
            Jumla ya nafasi: {roles.length}
          </p>
        </div>

        

        <div className="flex gap-3">

                  {/* EXPORTS */}
          <div className="flex gap-2 p-2 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition dark:border-red-500/30 dark:hover:bg-red-500/10"
            >
              <FaFilePdf />
              Pakua PDF
            </button>

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition dark:border-green-500/30 dark:hover:bg-green-500/10"
            >
              <FaFileExcel />
              Pakua Excel
            </button>

          </div>

          {selectedRoleIds.length > 0 && (
            <button
              onClick={confirmBulkDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
            >
              <FaTrash />
              Futa Zilizochaguliwa ({selectedRoleIds.length})
            </button>
          )}

          {setAddRole && (
            <button
              onClick={setAddRole}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e293b] text-white hover:bg-[#0f172a] transition"
            >
              <FaPlus />
              Ongeza Nafasi
            </button>
          )}

        </div>
      </div>

      {/* EXPORT  */}
      {(exportPDF || exportExcel) && (
        <div className="flex justify-end p-4">
          <div className="flex gap-3 p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

            {exportPDF && (
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                <FaFilePdf />
                Pakua PDF
              </button>
            )}

            {exportExcel && (
              <button
                onClick={exportExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition"
              >
                <FaFileExcel />
                Pakua Excel
              </button>
            )}

          </div>
        </div>
      )}

      {/*  TABLE  */}
      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="bg-[#1e293b] text-white">

              <th className="p-4">
                <input
                  type="checkbox"
                  checked={
                    roles.length > 0 &&
                    selectedRoleIds.length === roles.length
                  }
                  onChange={toggleSelectAllRoles}
                />
              </th>

              <th className="p-4 text-left">Nafasi</th>
              <th className="p-4 text-center">Vitendo</th>

            </tr>
          </thead>

          <tbody>

            {paginatedRoles.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-10 text-center text-gray-500">
                  Hakuna nafasi zilizopatikana
                </td>
              </tr>
            ) : (
              paginatedRoles.map((role) => (
                <tr
                  key={role.id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >

                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRoleSelect(role.id)}
                    />
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {role.title}
                    </div>

                    {role.protected === 1 && (
                      <span className="text-xs text-yellow-500">
                        Imelindwa
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() => setEditRole(role)}
                        className="p-2 rounded-lg bg-[#1e293b] text-white hover:bg-[#0f172a] transition"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => confirmDelete(role.id)}
                        className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        <FaTrash />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {roles.length > perPage && (
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-800">

          <p className="text-sm text-gray-500">
            Ukurasa {page} kati ya {totalPages}
          </p>

          <div className="flex gap-2">

            <button
              onClick={prevPage}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
            >
              Nyuma
            </button>

            <button
              onClick={nextPage}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
            >
              Mbele
            </button>

          </div>
        </div>
      )}

    </div>
  );
}