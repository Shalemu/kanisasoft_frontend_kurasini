import { FaEdit } from 'react-icons/fa';

export default function RolesSection({
  roles,
  selectedRoleIds,
  toggleRoleSelect,
  toggleSelectAllRoles,
  deleteSelectedRoles,
  setEditRole,
}: any) {
  return (
    <div className="mt-6 bg-white border rounded">

      <div className="flex justify-between p-3 border-b">
        <h2>Nafasi</h2>

        {selectedRoleIds.length > 0 && (
          <button
            onClick={deleteSelectedRoles}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Futa ({selectedRoleIds.length})
          </button>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>
              <input onChange={toggleSelectAllRoles} type="checkbox" />
            </th>
            <th>Nafasi</th>
            <th>Hatua</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((r: any) => (
            <tr key={r.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(r.id)}
                  onChange={() => toggleRoleSelect(r.id)}
                />
              </td>

              <td>{r.title}</td>

              <td>
                <button onClick={() => setEditRole(r)}>
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}