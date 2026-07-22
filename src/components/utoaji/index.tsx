"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Plus } from "lucide-react";
import AccountZetu from "./AccountZetu";
import PaymentAccountForm from "./PaymentAccountForm";
import { PaymentAccount } from "../types/Paymentaccounts/paymentAccount";
import { usePermission } from "@/hooks/usePermission";


export default function Utoaji() {

  const { canManagePaymentAccounts } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAccount, setEditingAccount] =
  useState<PaymentAccount | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleSuccess = () => {
    setRefreshKey(v => v + 1);
    setShowForm(false);
    setEditingAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Search + Add */}
      <div className="
        bg-white
        rounded-xl
        shadow
        border
        p-5
        flex
        items-center
        gap-4
        dark:bg-white/3
        dark:border-gray-800
      ">
        <div className="relative flex-1">
          <FaSearch
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />
          <input
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            placeholder="Tafuta account..."
            className="
              w-full
              pl-10
              py-3
              border
              rounded-lg
              outline-none
              bg-white
              text-gray-900
              focus:ring-2
              focus:ring-blue-500
              dark:bg-gray-900
              dark:text-white/90
              dark:border-gray-700
              dark:placeholder-gray-500
            "
          />
        </div>

        {
          canManagePaymentAccounts && (

            <button
              onClick={()=>{
                setEditingAccount(null);
                setShowForm(true);
              }}
              className="
                flex
                items-center
                gap-2
                bg-[#334155]
                hover:bg-blue-700
                text-white
                px-5
                py-3
                rounded-lg
              "
            >

              <Plus size={18}/>

              Ongeza Account

            </button>
          )
        }

      </div>
      {
        showForm && (

          <PaymentAccountForm
            account={editingAccount}
            onSuccess={handleSuccess}
            onCancel={()=>{
              setShowForm(false);
              setEditingAccount(null);
            }}
          />

        )
      }
      <AccountZetu
        key={refreshKey}
        canManage={canManagePaymentAccounts}
        onEdit={(account)=>{
          setEditingAccount(account);
          setShowForm(true);
        }}
      />

    </div>
  );
}