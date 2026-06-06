"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function useDashboard() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);
  const [leaderCount, setLeaderCount] = useState(0);
  const [monthlyContributions, setMonthlyContributions] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);
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

  async function fetchContributions() {
    const res = await apiFetch("/contributions");
    const reports = res?.reports ?? res?.contributions ?? res?.data?.reports ?? [];
    const now = new Date();

    if (!Array.isArray(reports)) return;

    const totals = reports.reduce(
      (acc: { total: number; month: number }, contribution: any) => {
        const amount = Number(
          contribution.amount ??
            contribution.total_amount ??
            contribution.total ??
            contribution.value ??
            0
        );
        const date = new Date(
          contribution.date ??
            contribution.created_at ??
            contribution.contribution_date ??
            ""
        );

        if (!Number.isNaN(amount)) {
          acc.total += amount;
        }

        if (
          !Number.isNaN(amount) &&
          !Number.isNaN(date.getTime()) &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        ) {
          acc.month += amount;
        }

        return acc;
      },
      { total: 0, month: 0 }
    );

    setTotalContributions(totals.total);
    setMonthlyContributions(totals.month);
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      await Promise.all([
        fetchMembers(),
        fetchGroups(),
        fetchVisitors(),
        fetchLeaders(),
        fetchContributions(),
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
    monthlyContributions,
    totalContributions,
    loading,
  };
}
