"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface LeadershipRole {
  id: number;
  title: string;
  protected?: boolean;
}

export default function useLeadershipRoles() {
  const [roles, setRoles] = useState<LeadershipRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // GET ALL ROLES
  const fetchRoles = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/leadership-roles");

      console.log("ROLES RESPONSE:", res);

      setRoles(res.roles || []);
    } catch (error) {
      console.error("FETCH ROLES ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE ROLE
  const createRole = async (title: string) => {
    try {
      await apiFetch("/leadership-roles", {
        method: "POST",
        body: JSON.stringify({ title }),
      });

      await fetchRoles();
    } catch (error) {
      console.error("CREATE ROLE ERROR:", error);
      throw error;
    }
  };

  // UPDATE ROLE
  const updateRole = async (id: number, title: string) => {
    try {
      await apiFetch(`/leadership-roles/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      });

      await fetchRoles();
    } catch (error) {
      console.error("UPDATE ROLE ERROR:", error);
      throw error;
    }
  };

  // DELETE ROLE
  const deleteRole = async (id: number) => {
    try {
      await apiFetch(`/leadership-roles/${id}`, {
        method: "DELETE",
      });

      await fetchRoles();
    } catch (error) {
      console.error("DELETE ROLE ERROR:", error);
    }
  };

  // BULK DELETE
  const deleteSelectedRoles = async () => {
    try {
      for (const id of selectedRoleIds) {
        await deleteRole(id);
      }

      setSelectedRoleIds([]);
    } catch (error) {
      console.error("BULK DELETE ERROR:", error);
    }
  };

  // SELECT ONE
  const toggleRoleSelect = (id: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // SELECT ALL
  const toggleSelectAllRoles = () => {
    if (selectedRoleIds.length === roles.length) {
      setSelectedRoleIds([]);
    } else {
      setSelectedRoleIds(roles.map((r) => r.id));
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    selectedRoleIds,

    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    deleteSelectedRoles,

    toggleRoleSelect,
    toggleSelectAllRoles,
  };
}