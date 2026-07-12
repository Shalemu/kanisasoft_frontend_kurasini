import { apiFetch } from "@/lib/api";

export const getChurchInformation = () =>
    apiFetch("/church-information");

export const createChurchInformation = (
    data:FormData
)=>
    apiFetch("/church-information",{
        method:"POST",
        body:data
    });
export const updateChurchInformation = (
    id:number,
    data:FormData
)=>
    apiFetch(`/church-information/${id}`,{
        method:"POST",
        body:(
            ()=>{
                data.append("_method","PUT");
                return data;
            }
        )()
    });

export const deleteChurchInformation = (
    id:number
)=>
    apiFetch(`/church-information/${id}`,{
        method:"DELETE"
    });