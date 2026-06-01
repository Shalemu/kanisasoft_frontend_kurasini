import { useState } from "react";
import { apiFetch } from "@/lib/api";

export function useSendSms() {
  const [loading, setLoading] = useState(false);

  const sendSms = async (payload: {
    type: string;
    message: string;
    receiver: string;
  }) => {
    try {
      setLoading(true);

      const res = await apiFetch("/send-sms", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return res;
    } finally {
      setLoading(false);
    }
  };

  return { sendSms, loading };
}