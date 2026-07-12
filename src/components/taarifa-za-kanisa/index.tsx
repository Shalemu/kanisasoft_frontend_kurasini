"use client";

import { useState } from "react";

import ChurchInformationCard from "./ChurchInformationCard";
import ChurchInformationForm from "./ChurchInformationForm";
import ChurchMapCard from "./ChurchMapCard";
import ChurchShareButtons from "./ChurchShareButtons";
import { useChurchInformation } from "@/hooks/ChurchInformations/useChurchInformation";
import { usePermission } from "@/hooks/usePermission";


export default function TaarifaZaKanisa() {


    const {
        church,
        loading,
        refresh
    } = useChurchInformation();



    const {
        canManageChurchInformation
    } = usePermission();



    const [showForm,setShowForm] = useState(false);



    if(loading){

        return (
            <div className="bg-white rounded-xl shadow p-8 text-center">
                Inapakia taarifa za kanisa...
            </div>
        );

    }



    return (

        <div className="space-y-6">


            {/* Header */}

            <div className="flex justify-between items-center">

                <div>

                 

                    <p className="text-gray-500">
                        Kuhusu kanisa, eneo na mawasiliano
                    </p>

                </div>



                {
                    canManageChurchInformation && (

                        <button
                            onClick={()=>setShowForm(true)}
                            className="
                           bg-[#334155]
                            text-white
                            px-5
                            py-2.5
                            rounded-lg
                            "
                        >
                            Hariri Taarifa
                        </button>

                    )
                }


            </div>





            {
                showForm && (

                    <ChurchInformationForm

                        church={church}

                        onSuccess={()=>{

                            refresh();

                            setShowForm(false);

                        }}

                        onCancel={()=>setShowForm(false)}

                    />

                )
            }







            <ChurchInformationCard
                church={church}
            />



            <ChurchMapCard
                church={church}
            />



            <ChurchShareButtons
                church={church}
            />



        </div>

    );

}