"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  Copy,
  Check,
  Building2,
  CreditCard,
  Wallet,
} from "lucide-react";

import { usePaymentAccounts } from "@/hooks/Paymentaccount/usePaymentAccounts";
import { deletePaymentAccount } from "@/components/services/PaymentAccounts/PaymentAccountService";
import { PaymentAccount } from "../types/Paymentaccounts/paymentAccount";

interface Props {
   onEdit: (account: PaymentAccount)=>void;
  canManage: boolean;
}

export default function AccountZetu({ 
  onEdit,
  canManage
 }: Props) {
  const { accounts, loading, refresh } = usePaymentAccounts();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const copyAccountNumber = async (
    id: number,
    accountNumber: string
  ) => {
    try {
      await navigator.clipboard.writeText(accountNumber);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Una uhakika unataka kufuta account hii?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deletePaymentAccount(id);

      refresh();
    } catch (error) {
      console.error(error);
      alert("Imeshindikana kufuta account.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center dark:bg-white/3 dark:text-gray-300">
        Inapakia account...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow dark:bg-white/3">
      {/* Header */}
      <div className="border-b px-6 py-5 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Account Zetu
        </h2>

        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
          Simamia akaunti zote zinazotumika kupokea malipo.
        </p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {accounts.length === 0 ? (
          <div className="border rounded-xl py-12 text-center text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Hakuna account zilizopo.
          </div>
        ) : (
          accounts.map((account: PaymentAccount) => (
            <div
              key={account.id}
              className="border rounded-xl p-5 hover:border-blue-500 hover:shadow-sm transition dark:border-gray-800"
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden dark:border-gray-800 dark:bg-white/5">
                    {account.logo_url ? (
                      <Image
                        src={account.logo_url}
                        alt={account.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <Building2
                        size={28}
                        className="text-gray-400"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                      {account.name}
                    </h3>

                    <p className="text-sm text-gray-500 capitalize dark:text-gray-400">
                      {account.type.replace("_", " ")}
                    </p>
                  </div>
                </div>

               {canManage && (
                <div className="flex gap-2">

                  <button
                    onClick={() => onEdit?.(account)}
                    className="
                      h-10 w-10
                      rounded-lg
                      border
                      hover:bg-blue-50
                      text-blue-600
                      flex
                      items-center
                      justify-center
                      transition
                      dark:border-gray-800
                      dark:hover:bg-blue-500/10
                    "
                    title="Edit Account"
                  >
                    <Pencil size={18} />
                  </button>


                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingId === account.id}
                    className="
                      h-10 w-10
                      rounded-lg
                      border
                      hover:bg-red-50
                      text-red-600
                      flex
                      items-center
                      justify-center
                      transition
                      disabled:opacity-50
                      dark:border-gray-800
                      dark:hover:bg-red-500/10
                    "
                    title="Delete Account"
                  >
                    {deletingId === account.id ? (
                      <span className="text-xs">
                        ...
                      </span>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>

                </div>
              )}
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-5 mt-6">
                {/* Account Name */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Account Name
                  </p>

                  <div className="flex items-center gap-2">
                    <Building2
                      size={16}
                      className="text-gray-400"
                    />

                    <span className="font-medium">
                      {account.account_name}
                    </span>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Payment Type
                  </p>

                  <div className="flex items-center gap-2">
                    <Wallet
                      size={16}
                      className="text-gray-400"
                    />

                    <span className="capitalize font-medium">
                      {account.type.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Account Number
                  </p>

                  <div className="flex items-center justify-between gap-3 border rounded-lg px-4 py-2 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <CreditCard
                        size={16}
                        className="text-gray-400"
                      />

                      <span className="font-semibold text-blue-600 tracking-wide dark:text-blue-400">
                        {account.account_number}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        copyAccountNumber(
                          account.id,
                          account.account_number
                        )
                      }
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {copiedId === account.id ? (
                        <>
                          <Check size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Status
                  </p>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      account.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                    }`}
                  >
                    {account.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              {account.instructions && (
                <div className="mt-5 border-t pt-4 dark:border-gray-800">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                    Instructions
                  </p>

                  <p className="text-sm text-gray-600 leading-6 dark:text-gray-400">
                    {account.instructions}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}