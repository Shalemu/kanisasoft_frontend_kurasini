'use client';

import { FaEdit } from 'react-icons/fa';

export default function ViongoziTable({
  leaders,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  onEdit,
  onRowClick,
}: any) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

      {/* TABLE WRAPPER */}
      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">
                <input type="checkbox" onChange={toggleSelectAll} />
              </th>

              <th className="text-left p-3">Jina</th>
              <th className="text-left p-3">Simu</th>
              <th className="text-left p-3">Nafasi</th>
              <th className="text-center p-3">Hatua</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>

            {leaders.map((row: any) => {
              const isSelected = selectedIds.includes(row.id);

              return (
                <tr
                  key={row.id}
                  onClick={() => row.user_id && onRowClick(row.user_id)}
                  className={`
                    cursor-pointer border-t
                    hover:bg-gray-50 transition
                    ${isSelected ? 'bg-blue-50' : ''}
                  `}
                >

                  {/* CHECKBOX */}
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </td>

                  {/* NAME */}
                  <td className="p-3">
                    <div className="font-medium text-gray-800">
                      {row.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {row.email}
                    </div>
                  </td>

                  {/* PHONE */}
                  <td className="p-3 text-gray-700">
                    {row.phone}
                  </td>

                  {/* ROLES */}
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {row.roles?.length ? (
                        row.roles.map((r: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                          >
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          Hakuna Nafasi
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="p-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onEdit(row.id)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <FaEdit />
                    </button>
                  </td>

                </tr>
              );
            })}

            {/* EMPTY STATE */}
            {leaders.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Hakuna viongozi waliopo
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}