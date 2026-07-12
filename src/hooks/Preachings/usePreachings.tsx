"use client";

import { useCallback, useEffect, useState } from "react";
import { getPreachings } from "@/components/services/Preachings/PreachingService";
import { Preaching } from "@/components/types/Paymentaccounts/Preachings/preaching";

export function usePreachings() {
  const [preachings, setPreachings] = useState<Preaching[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPreachings = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getPreachings();

      console.log("API Response:", res);

      setPreachings(res.data ?? []);
    } catch (error: any) {
      console.error("=========== API ERROR ===========");
      console.error(error);

      console.log("Status:", error.status);
      console.log("Message:", error.message);
      console.log("Response:", error.data);
      console.log("Validation Errors:", error.errors);

      alert(JSON.stringify(error.data, null, 2));

      setPreachings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreachings();
  }, [fetchPreachings]);

  return {
    preachings,
    loading,
    refresh: fetchPreachings,
  };
}