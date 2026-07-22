"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Plus } from "lucide-react";

import PreachingForm from "./PreachingForm";
import PreachingList from "./PreachingList";
import { Preaching } from "../types/Paymentaccounts/Preachings/preaching";
import { usePermission } from "@/hooks/usePermission";

export default function Mahubiri() {

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPreaching, setSelectedPreaching] =
    useState<Preaching | null>(null);

  const { canManagePreachings } = usePermission();


  const handleSuccess = () => {
    setRefreshKey(v => v + 1);
    setShowForm(false);
    setSelectedPreaching(null);
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
        gap-4
        items-center
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
            placeholder="Tafuta mahubiri..."
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
        {canManagePreachings && (

          <button
            onClick={()=>{
              setSelectedPreaching(null);
              setShowForm(true);
            }}
            className="
              flex
              items-center
              gap-2
              bg-[#334155]
              text-white
              px-5
              py-3
              rounded-lg
              hover:bg-blue-700
            "
          >
            <Plus size={18}/>
            Ongeza

          </button>
        )}

      </div>

      {showForm && (
        <PreachingForm
          preaching={selectedPreaching}
          onSuccess={handleSuccess}
          onCancel={()=>{
            setShowForm(false);
            setSelectedPreaching(null);
          }}
        />

      )}

      <PreachingList
        key={refreshKey}
        search={searchTerm}
        canManage={canManagePreachings}
        onEdit={(item)=>{
          setSelectedPreaching(item);
          setShowForm(true);
        }}
      />
    </div>
  );
}