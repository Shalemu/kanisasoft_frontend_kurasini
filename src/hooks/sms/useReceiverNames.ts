import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface User {
  id:number;
  full_name:string;
}

interface Group {
  id:number;
  name:string;
}


export function useReceiverNames(){

  const [users,setUsers] = useState<User[]>([]);
  const [groups,setGroups] = useState<Group[]>([]);


  useEffect(()=>{

    async function load(){

      try {

        const [usersRes, groupsRes] = await Promise.all([
          apiFetch("/users"),
          apiFetch("/groups")
        ]);


        setUsers(
          usersRes?.users ??
          usersRes?.data?.users ??
          []
        );


        setGroups(
          groupsRes?.groups ??
          groupsRes?.data?.groups ??
          []
        );


      } catch(error){
        console.error(error);
      }

    }


    load();

  },[]);



  const getReceiverName = (id:string)=>{

    const user = users.find(
      u => String(u.id) === id
    );


    if(user){
      return user.full_name;
    }


    const group = groups.find(
      g => String(g.id) === id
    );


    if(group){
      return group.name;
    }


    if(id === "all"){
      return "Wote";
    }


    return id || "—";
  };


  return {
    getReceiverName
  };

}