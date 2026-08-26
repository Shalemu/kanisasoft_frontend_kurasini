"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
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
import {
  getMembershipStatusLabel,
  type MembershipStatusLabels,
} from "@/lib/memberLabels";
import { useWanaosubiriExport } from "@/hooks/useWanaosubiriExport";




interface User {
  id: number;
  user_id: number;
  member_id?: number | null;
  full_name: string;
    email: string | null;  
  residential_zone: string;
  phone: string | null;
  role: string | null;
  membership_number?: string | null;
  membership_status?: string | null;
  created_at: string;
 
}

interface Role {
  id: number;
  title: string;
}



interface Props {
  searchTerm: string;
  selectedMonth?: string;
  fromDate?: string;
  toDate?: string;
  statusFilter?: string;
}

export default function WanaosubiriList({
  searchTerm,
  selectedMonth = "",
  fromDate = "",
  toDate = "",
  statusFilter = "",
}: Props) {
  const [members, setMembers] = useState<User[]>([]);
  const [statusLabels, setStatusLabels] = useState<MembershipStatusLabels | null>(null);
  const [loading, setLoading] = useState(true);


  const [roles, setRoles] = useState<Role[]>([]); 

  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);


  //export
  const { exportToExcel, exportToPDF } = useWanaosubiriExport();

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


function normalizeDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/users");
      setStatusLabels(data.membership_status_labels ?? null);

      const users: User[] = data.users.map((u: any) => ({
        id: u.user_id ?? u.id,
        user_id: u.user_id ?? u.id,
        member_id: u.member_id ?? null,
        full_name: u.full_name,
        email: u.email ?? null,
        residential_zone: u.residential_zone ?? "",
        phone: u.phone ?? null,
        role: u.role ?? null,
        membership_number:
          u.membership_number !== null && u.membership_number !== undefined
            ? String(u.membership_number).padStart(4, "0")
            : null,
        membership_status: u.membership_status ?? "pending",
        created_at: u.created_at,
      }));

      // Filter washirika
      const washirika = users.filter(
        (u) =>
          // u.membership_status === MEMBERSHIP_STATUS.ACTIVE ||
          u.membership_status === MEMBERSHIP_STATUS.PENDING ||
          u.membership_status === null
      );

      setMembers(washirika);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const filteredMembers = useMemo(() => {
  const query = searchTerm.trim().toLowerCase();
 

  const normalizeNumber = (value?: string | null) => {
    if (!value) return "";

    return String(value)
      .replace(/\D/g, "") // keep only numbers
      .replace(/^0+/, ""); // remove leading zeros
  };

  const filtered = members.filter((m) => {
    const createdDate = normalizeDate(m.created_at);
    const createdMonth = createdDate.slice(0, 7);



    const membershipNumber = String(m.membership_number ?? "");

    const cleanMembershipNumber = normalizeNumber(membershipNumber);
    const cleanQuery = normalizeNumber(query);

    const matchesSearch =
      !query ||
      Boolean(
        m.full_name?.toLowerCase().includes(query) ||
        m.phone?.includes(query) ||
        membershipNumber.includes(query) ||
        (cleanQuery && cleanMembershipNumber.includes(cleanQuery))
      );

    const matchesMonth =
      !selectedMonth || createdMonth === selectedMonth;

    const matchesDateFrom =
      !fromDate || createdDate >= fromDate;

    const matchesDateTo =
      !toDate || createdDate <= toDate;


    const matchesStatus =
      !statusFilter ||
      m.membership_status === statusFilter;

    return (
      matchesSearch &&
      matchesMonth &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesStatus
    );
  });


  const sorted = filtered.sort((a, b) => {
    const aNumber = a.membership_number?.trim();
    const bNumber = b.membership_number?.trim();

    if (!aNumber && !bNumber) {
      return a.full_name.localeCompare(b.full_name);
    }

    if (!aNumber) return 1;
    if (!bNumber) return -1;

    return aNumber.localeCompare(bNumber, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return sorted;

}, [
  members,
  searchTerm,
  selectedMonth,
  fromDate,
  toDate,
  statusFilter,
]);

useEffect(() => {
  setCurrentPage(1);
  setSelectedMembers([]);
}, [searchTerm, selectedMonth,fromDate, toDate, statusFilter]);

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

  const activePaginatedMembers = paginatedMembers.filter(
    (member) => member.membership_status === MEMBERSHIP_STATUS.ACTIVE
  );

  const allSelected =
    activePaginatedMembers.length > 0 &&
    activePaginatedMembers.every((member) => selectedMembers.includes(member.id));

  // APPROVE
  const handleApprove = async (userId: number) => {
    try {
      const response = await apiFetch("/authorize-user", {
        method: "POST",
        body: { user_id: userId },
      });

      if (response.status === "success" || response.member || response.data?.member) {
        const member = response.member ?? response.data?.member ?? {};

        setMembers((prev) =>
          prev.map((m) =>
            m.user_id === userId
              ? {
                  ...m,
                  role: "mshirika",
                  member_id: member.id ?? member.member_id ?? m.member_id,
                  membership_number:
                    member.membership_number ?? m.membership_number,
                  membership_status: member.membership_status ?? "active",
                }
              : m
          )
        );

        Swal.fire("Imefanikiwa", "Mshirika ameidhinishwa", "success");
      } else {
        Swal.fire("Error", response.message || "Imeshindikana", "error");
      }
    } catch (error) {
      Swal.fire(
        "Hitilafu",
        error instanceof Error ? error.message : "Imeshindikana kuidhinisha mshirika.",
        "error"
      );
    }
  };

  //  REJECT
const handleReject = (userId: number) => {

};
const isAdminSelected = selectedMembers.some((memberId) => {
  const user = members.find((m) => m.id === memberId);
  return user?.role === "admin";
});

const handleDeactivate = () => {
  if (isAdminSelected) return;

  if (selectedMembers.length === 0) {
    Swal.fire("Tahadhari", "Chagua mshirika kwanza", "warning");
    return;
  }


};

const getMemberId = async (userId: number) => {
  const user = members.find((member) => member.id === userId);

  if (user?.member_id) return user.member_id;

  const data = await apiFetch(`/members/by-user/${userId}`);
  return data?.member?.id ?? data?.member?.member_id;
};




  const totalMembers = filteredMembers.length;

const totalApproved = filteredMembers.filter(
  (m) => m.membership_status === MEMBERSHIP_STATUS.ACTIVE
).length;

const totalPending = filteredMembers.filter(
  (m) => m.membership_status === MEMBERSHIP_STATUS.PENDING
).length;

  return (

    <div className="space-y-5">

    <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">

     {/* HEADER */}
   <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
  
   <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Orodha ya Washirika</h2>

   <div className="flex gap-3">
      <span className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm font-medium dark:bg-yellow-500/10 dark:text-yellow-300">
      {totalPending} Wanasubiri
      </span>
    
    <button
      onClick={() => exportToExcel(filteredMembers, "washirika")}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
    >
      Pakua Excel
    </button>

    <button
      onClick={() => exportToPDF(filteredMembers, "washirika")}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
    >
      Pakua PDF
    </button>

  </div>
</div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700 dark:text-gray-300">
          <thead>
            <tr className="bg-[#1e293b] text-white">
              <th className="px-4 py-3 text-left">Na.</th>
              <th className="px-4 py-3 text-left">Jina</th>
              <th className="px-4 py-3 text-left">Simu</th>
              <th className="px-4 py-3 text-left">Zone</th>
              <th className="px-4 py-3 text-left">Tarehe</th>
              <th className="px-4 py-3 text-left">Nafasi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">
                  Inapakia...
                </td>
              </tr>
            ) : paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">
                  Hakuna data
                </td>
              </tr>
            ) : (
              paginatedMembers.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]">
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
            className="font-medium text-gray-900 hover:text-blue-600 transition dark:text-white/90 dark:hover:text-blue-400"
          >
         {m.full_name?.toUpperCase()}
          </Link>

              <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
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
                    {m.membership_status !== MEMBERSHIP_STATUS.ACTIVE ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(m.user_id)}
                          className="text-green-600 border border-green-200 px-2 py-1 rounded hover:bg-green-50 dark:border-green-500/30 dark:text-green-300 dark:hover:bg-green-500/10"
                        >
                          Idhinisha
                        </button>

                        <button
                          onClick={() => handleReject(m.user_id)}
                          className="text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          Kataa
                        </button>
                      </div>
                    ) : (
                  
                  <div className="flex flex-col gap-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium w-fit ${
                        m.role === "admin"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : m.role === "mchungaji"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : m.role === "mshirika"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {m.role}
                    </span>
           
                  </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center p-4 text-gray-700 dark:text-gray-300">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 dark:border-gray-700"
        >
          Prev
        </button>

        <span>
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 dark:border-gray-700"
        >
          Next
        </button>
      </div>
    </div>
    </div>
  );
}
