"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import AssignGroupModal from "@/components/modals/AssignGroupModal";
import LeaderModal from "@/components/modals/LeaderModal";
import  ReasonModal from "@/components/modals/ReasonModal";
import Link from "next/link";

import {
  FaUserPlus,
  FaFilter,
  FaSms,
  FaCheck,
  FaTimes,
  FaUsers, 
} from "react-icons/fa";
import { useWashirikaExport } from "@/hooks/useWashirikaExport";


interface Group {
  id: number;
  name: string;
}

interface User {
  id: number;
  user_id: number;
  full_name: string;
    email: string | null;  
  residential_zone: string;
  phone: string | null;
  role: string | null;
  membership_number?: string | null;
  membership_status?: string | null;
  created_at: string;
  groups?: Group[];
}

interface Role {
  id: number;
  title: string;
}



interface Props {
  searchTerm: string;
  selectedMonth?: string;
  selectedGroup?: string;
  fromDate?: string;
  toDate?: string;
}

export default function WashirikaList({ searchTerm }: Props) {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [roles, setRoles] = useState<Role[]>([]); 

  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [selectedMemberForLeader, setSelectedMemberForLeader] =
    useState<User | null>(null);

  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [selectedActionUser, setSelectedActionUser] = useState<number | null>(null);
  const [actionType, setActionType] =
  useState<"reject" | "deactivate" | null>(null);

  //export
  const { exportToExcel, exportToPDF } = useWashirikaExport();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const MEMBERSHIP_STATUS = {
    ACTIVE: "active",
    PENDING: "pending",
  };



  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
  fetchRoles();
}, []);

useEffect(() => {
  fetchGroups();
}, []);

const fetchRoles = async () => {
  try {
    const data: { roles: any[] } = await apiFetch(
      '/leadership-roles'
    );

    if (data?.roles) {
      setRoles(data.roles);
    }
  } catch (err) {
    console.error('Error fetching roles:', err);
  }
};

const fetchGroups = async () => {
  try {
    const data: { groups: any[] } = await apiFetch(
      '/groups'
    );

    if (data?.groups) {
      setGroups(data.groups);
    }
  } catch (err) {
    console.error('Error fetching groups:', err);
  }
};

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/users");

      const users: User[] = data.users.map((u: any) => ({
        id: u.id,
        user_id: u.id,
        full_name: u.full_name,
        email: u.email ?? null,
        residential_zone: u.residential_zone ?? "",
        phone: u.phone ?? null,
        role: u.role ?? null,
        membership_number: u.membership_number ?? null,
        membership_status: u.membership_status ?? "pending",
        created_at: u.created_at,
        groups: u.groups ?? [],
      }));

      // Filter washirika
      const washirika = users.filter(
        (u) =>
          u.role !== "mchungaji" &&
          (u.membership_status === MEMBERSHIP_STATUS.ACTIVE ||
            u.membership_status === MEMBERSHIP_STATUS.PENDING ||
            u.membership_status === null)
      );

      setMembers(washirika);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const filteredMembers = useMemo(() => {
  const filtered = members.filter((m) => {
    const matchesSearch =
      m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone?.includes(searchTerm);

    return matchesSearch;
  });

  // SORT: pending first
  const sorted = filtered.sort((a, b) => {
    if (a.membership_status === "pending" && b.membership_status !== "pending") return -1;
    if (a.membership_status !== "pending" && b.membership_status === "pending") return 1;
    return 0;
  });

  return sorted;
}, [members, searchTerm]);

  // PAGINATION
  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // SELECT
const toggleSelect = (id: number) => {
  const user = members.find(m => m.id === id);

  if (user?.membership_status !== "active") return;

  setSelectedMembers(prev =>
    prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]
  );
};

const toggleSelectAll = () => {
  const activeIds = paginatedMembers
    .filter(m => m.membership_status === "active")
    .map(m => m.id);

  const allActiveSelected = activeIds.every(id =>
    selectedMembers.includes(id)
  );

  if (allActiveSelected) {
    setSelectedMembers(prev =>
      prev.filter(id => !activeIds.includes(id))
    );
  } else {
    setSelectedMembers(prev => [
      ...prev,
      ...activeIds.filter(id => !prev.includes(id))
    ]);
  }
};

  const allSelected =
    paginatedMembers.length > 0 &&
    selectedMembers.length === paginatedMembers.length;

  // APPROVE
  const handleApprove = async (userId: number) => {
    const response = await apiFetch("/authorize-user", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });

    if (response.status === "success") {
      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === userId
            ? {
                ...m,
                role: "mshirika",
                membership_number: response.member.membership_number,
              }
            : m
        )
      );

      Swal.fire("Imefanikiwa", "Mshirika ameidhinishwa", "success");
    } else {
      Swal.fire("Error", response.message || "Imeshindikana", "error");
    }
  };

  //  REJECT
const handleReject = (userId: number) => {
  setSelectedActionUser(userId);
  setActionType("reject");
  setReasonModalOpen(true);
};
const isAdminSelected = selectedMembers.some((memberId) => {
  const user = members.find((m) => m.id === memberId);
  return user?.role === "admin";
});

const handleDeactivate = () => {
  if (isAdminSelected) return;

  setActionType("deactivate");
  setReasonModalOpen(true);
};


const handleConfirmReason = async (reason: string) => {
  if (!selectedActionUser && actionType === "reject") return;

  try {
    let status = "lost";

    if (reason === "Amehama") status = "left";
    if (reason === "Amefariki") status = "deceased";
    if (reason === "Ametegwa ushirika") status = "detained";
    if (reason === "Amepotea") status = "lost";
    if (reason === "Amejisajiri kimakosa") status = "lost";

    if (actionType === "reject") {
      const response = await apiFetch(`/users/${selectedActionUser}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason, status }),
      });

      if (response.status === "success") {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === selectedActionUser
              ? { ...m, membership_status: status, deactivation_reason: reason }
              : m
          )
        );

        Swal.fire("Imekataliwa", "Mshirika amekataliwa", "warning");
      }
    }

    if (actionType === "deactivate") {
      let successCount = 0;

      for (const id of selectedMembers) {
        const response = await apiFetch(`/users/${id}/reject`, {
          method: "POST",
          body: JSON.stringify({ reason, status }),
        });

        if (response.status === "success") {
          successCount++;

          setMembers((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    membership_status: status,
                    deactivation_reason: reason,
                  }
                : m
            )
          );
        }
      }

      Swal.fire({
        title: "Imefanikiwa",
        text: `${successCount} washirika wameondolewa`,
        icon: "success",
        confirmButtonColor: "#f0ce32",
      });

      setSelectedMembers([]);
    }
  } catch (error: any) {
    Swal.fire("Error", error?.message || "Hitilafu imetokea", "error");
  } finally {
    setReasonModalOpen(false);
    setSelectedActionUser(null);
    setActionType(null);
  }
};
 

  const totalMembers = filteredMembers.length;

const totalApproved = filteredMembers.filter(
  (m) => m.membership_status === MEMBERSHIP_STATUS.ACTIVE
).length;

const totalPending = filteredMembers.filter(
  (m) => m.membership_status === MEMBERSHIP_STATUS.PENDING
).length;

const activeMembers = filteredMembers.filter(
  (m) => m.membership_status === MEMBERSHIP_STATUS.ACTIVE
);





  return (

    <div className="space-y-5">

    {/*  SUMMARY CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* TOTAL */}
      <div className="bg-white border rounded-md shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Jumla ya Washirika</p>
            <h2 className="text-2xl font-bold mt-1">
              {loading ? "..." : totalMembers}
            </h2>
          </div>
          <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded">
            <FaUsers />
          </div>
        </div>
      </div>

      {/* APPROVED */}
      <div className="bg-white border rounded-md shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Walioidhinishwa</p>
            <h2 className="text-2xl font-bold mt-1">
              {loading ? "..." : totalApproved}
            </h2>
          </div>
          <div className="w-12 h-12 bg-green-50 flex items-center justify-center rounded">
            <FaUsers />
          </div>
        </div>
      </div>

      {/* PENDING */}
      <div className="bg-white border rounded-md shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Wanaosubiri</p>
            <h2 className="text-2xl font-bold mt-1">
              {loading ? "..." : totalPending}
            </h2>
          </div>
          <div className="w-12 h-12 bg-yellow-50 flex items-center justify-center rounded">
            <FaUsers />
          </div>
        </div>
      </div>

    </div>

        {/*  BULK ACTION BAR */}
    {selectedMembers.length > 0 && (
      <div className="bg-white border border-blue-200 px-4 sm:px-6 py-3 rounded shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-gray-600">
          {selectedMembers.length} washirika wamechaguliwa
        </p>

        <div className="flex flex-wrap gap-3">

          {/* ➕ Ongeza Kiongozi */}
          <button
            onClick={() => {
          if (selectedMembers.length !== 1) {
            Swal.fire("Tahadhari", "Chagua mshirika mmoja tu", "warning");
            return;
          }

          const member = members.find(m => m.id === selectedMembers[0]);
          if (!member) return;

          setSelectedMemberForLeader(member);
          setIsLeaderModalOpen(true);
        }}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaUserPlus /> Ongeza Kiongozi
          </button>

          {/* 👥 Weka Kundi */}
          <button
            onClick={() => setGroupDialogOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaUsers /> Weka Kundi
          </button>

          {/* SMS */}
          <button className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <FaSms /> Tuma SMS
          </button>

          {/* Deactivate */}
          <button
            onClick={handleDeactivate}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            Deactivate
          </button>

        </div>
      </div>
    )}

    <div className="bg-white border rounded-md shadow-sm overflow-hidden">

     {/* HEADER */}
<div className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
  
  <h2 className="text-xl font-bold">Orodha ya Washirika</h2>

  <div className="flex gap-3">
    
    <button
      onClick={() => exportToExcel(filteredMembers)}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
    >
      Pakua Excel
    </button>

    <button
      onClick={() => exportToPDF(filteredMembers)}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
    >
      Pakua PDF
    </button>

  </div>
</div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e293b] text-white">
              <th className="px-4 py-3">
              <input
                type="checkbox"
                checked={
                  paginatedMembers.length > 0 &&
                  selectedMembers.length === paginatedMembers.length
                }
                onChange={toggleSelectAll}
              />
              </th>
              <th className="px-4 py-3 text-left">Jina</th>
              <th className="px-4 py-3 text-left">Simu</th>
              <th className="px-4 py-3 text-left">Zone</th>
              <th className="px-4 py-3 text-left">Tarehe</th>
              <th className="px-4 py-3 text-left">Hatua</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  Inapakia...
                </td>
              </tr>
            ) : paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  Hakuna data
                </td>
              </tr>
            ) : (
              paginatedMembers.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m.id)}
                      onChange={() => toggleSelect(m.id)}
                    />
                  </td>

               <td className="px-4 py-3">
           <Link
            href={`/washirika/detail?id=${m.id}`}
            className="font-medium text-gray-900 hover:text-blue-600 transition"
          >
            {m.full_name}
          </Link>

              <div className="text-xs text-gray-500 mt-0.5">
                {m.membership_number || "—"}
              </div>
            </td>

                  <td className="px-4 py-3">{m.phone || "—"}</td>
                  <td className="px-4 py-3">
                    {m.residential_zone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {m.role === null ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(m.user_id)}
                          className="text-green-600 border px-2 py-1 rounded"
                        >
                          Idhinisha
                        </button>

                        <button
                          onClick={() => handleReject(m.user_id)}
                          className="text-red-600 border px-2 py-1 rounded"
                        >
                          Kataa
                        </button>
                      </div>
                    ) : (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        Ameidhinishwa
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center p-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        <span>
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>


<AssignGroupModal
  isOpen={groupDialogOpen}
  onClose={() => setGroupDialogOpen(false)}
  groups={groups}
  selectedMembers={selectedMembers}
  members={members}
  onSuccess={() => {
    setSelectedMembers([]);
  }}
/>

<LeaderModal
  isOpen={isLeaderModalOpen}
  setIsOpen={setIsLeaderModalOpen}
  roles={roles}
  members={members}
  selectedMember={selectedMemberForLeader}
  onSaved={async () => {
    Swal.fire("Success", "Kiongozi ameongezwa", "success");
    setIsLeaderModalOpen(false);
    setSelectedMemberForLeader(null);
  }}
/>

<ReasonModal
  isOpen={reasonModalOpen}
  onClose={() => setReasonModalOpen(false)}
  onConfirm={handleConfirmReason}
/>

    </div>
    </div>

  
    
  );

  
}