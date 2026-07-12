import { getPaymentAccounts } from "@/components/services/PaymentAccounts/PaymentAccountService";
import { useEffect, useState } from "react";


export function usePaymentAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const res = await getPaymentAccounts();
     setAccounts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    refresh: fetchAccounts,
  };
}