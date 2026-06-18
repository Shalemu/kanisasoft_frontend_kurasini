"use client";

import { useState } from "react";
import Swal from "sweetalert2";

import RolesSection from "./role-section";
import useLeadershipRoles from "./hooks/useLeadershipRoles";
import RoleModal from "@/components/viongozi/model/RoleModal";

export default function Nafasi() {
  const [editRole, setEditRole] = useState<any>(null);
  const [addRole, setAddRole] = useState(false);

  const {
    roles,
    selectedRoleIds,
    toggleRoleSelect,
    toggleSelectAllRoles,
    deleteSelectedRoles,
    deleteRole,
    createRole,
    updateRole,
  } = useLeadershipRoles();

  // CREATE ROLE
  const handleCreate = async (data: { title: string }) => {
    try {
      await createRole(data.title);

      Swal.fire({
        icon: "success",
        title: "Nafasi imeongezwa",
        timer: 1500,
        showConfirmButton: false,
      });

      setAddRole(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Imeshindikana kuongeza nafasi",
      });
    }
  };

  // UPDATE ROLE
  const handleUpdate = async (data: { title: string }) => {
    try {
      await updateRole(editRole.id, data.title);

      Swal.fire({
        icon: "success",
        title: "Nafasi imesasishwa",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditRole(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Imeshindikana kusasisha nafasi",
      });
    }
  };

  return (
    <>
      <RolesSection
        roles={roles}
        selectedRoleIds={selectedRoleIds}
        toggleRoleSelect={toggleRoleSelect}
        toggleSelectAllRoles={toggleSelectAllRoles}
        deleteSelectedRoles={deleteSelectedRoles}
        deleteRole={deleteRole}
        setEditRole={setEditRole}
        setAddRole={() => setAddRole(true)}
      />

      {/* ADD MODAL */}
      <RoleModal
        isOpen={addRole}
        onClose={() => setAddRole(false)}
        onSave={handleCreate}
      />

      {/* EDIT MODAL */}
      <RoleModal
        isOpen={!!editRole}
        role={editRole}
        onClose={() => setEditRole(null)}
        onSave={handleUpdate}
      />
    </>
  );
}