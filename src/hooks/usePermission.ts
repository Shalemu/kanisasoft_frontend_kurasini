"use client";

import { useEffect, useState } from "react";

export function usePermission() {
  const [role, setRole] = useState<string | null>(null);


  useEffect(() => {

    const user = localStorage.getItem("user");

    if (!user) return;


    try {

      const parsed = JSON.parse(user);


      if (parsed.role) {
        setRole(parsed.role);
      }

      else if (parsed.roles?.length) {
        setRole(parsed.roles[0]?.name);
      }


    } catch(error){

      console.error(
        "Failed parsing user",
        error
      );

    }


  }, []);



  const canManagePaymentAccounts =
    role === "admin" ||
    role === "mhazini";


  const canManagePreachings =
    role === "admin";
    
  const    canManageChurchInformation =
    role === "admin";


  return {
    role,
    canManagePaymentAccounts,
    canManagePreachings,
    canManageChurchInformation
  };
}