"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import UserDetailsClient from "@/components/washirika/UserDetailsClient";

export default function DetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiFetch(`/members/by-user/${id}`);
        setUser(data.member);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="p-6">Inapakia...</div>;
  }

  if (!id) {
    return <div className="p-6 text-red-500">ID haijapatikana</div>;
  }

  if (!user) {
    return <div className="p-6 text-red-500">Mshirika hakupatikana</div>;
  }

  return <UserDetailsClient user={user} />;
}