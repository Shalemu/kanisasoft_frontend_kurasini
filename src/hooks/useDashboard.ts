"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function useDashboard() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);
  const [leaderCount, setLeaderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const ACTIVE_STATUS = "active";

  async function fetchMembers() {
    const data = await apiFetch("/users");

    if (data?.users) {
      const users = data.users;

      const activeMembers = users.filter(
        (u: any) =>
          u.role !== "mchungaji" &&
          (u.membership_status === ACTIVE_STATUS ||
            u.membership_status === null)
      );

      setTotalMembers(activeMembers.length);
    }
  }

  async function fetchGroups() {
    const res = await apiFetch("/groups");
    if (res?.groups) {
      setGroupsCount(res.groups.length);
    }
  }

  async function fetchVisitors() {
    const res = await apiFetch("/guests");
    const guests = res?.data?.guests ?? res?.guests ?? [];
    setVisitorCount(Array.isArray(guests) ? guests.length : 0);
  }

  async function fetchLeaders() {
    const res = await apiFetch("/leaders");

    if (res?.leaders) {
      setLeaderCount(res.leaders.length);
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      await Promise.all([
        fetchMembers(),
        fetchGroups(),
        fetchVisitors(),
        fetchLeaders(),
      ]);

      setLoading(false);
    };

    load();
  }, []);

  return {
    totalMembers,
    groupsCount,
    visitorCount,
    leaderCount,
    loading,
  };
}
