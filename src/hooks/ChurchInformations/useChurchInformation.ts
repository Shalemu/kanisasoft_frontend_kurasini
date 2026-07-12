"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getChurchInformation,
} from "@/components/services/ChurchInformation/ChurchInformationService";

export interface ChurchInformation {
  id: number;
  church_name: string;
  about: string;
  location?: string;
  map_url?: string;
  direction?: string;
  phone?: string;
  email?: string;
  slug?: string;
}

export function useChurchInformation() {
  const [church, setChurch] = useState<ChurchInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchChurchInformation = useCallback(async()=>{

    try {

      setLoading(true);
      const res = await getChurchInformation();

      console.log(
        "Church Information:",
        res
      );
      setChurch(
        res.data ?? null
      );
    } catch(error:any){

      console.error(
        "Church information error:",
        error
      );
      setChurch(null);
    } finally {

      setLoading(false);

    }


  },[]);
  useEffect(()=>{

    fetchChurchInformation();

  },[
    fetchChurchInformation
  ]);
  return {

    church,
    loading,
    refresh: fetchChurchInformation

  };

}