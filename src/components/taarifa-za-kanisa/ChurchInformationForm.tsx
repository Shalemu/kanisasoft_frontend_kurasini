"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import {
  createChurchInformation,
  updateChurchInformation,
} from "@/components/services/ChurchInformation/ChurchInformationService";

interface Props {
  church: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ChurchInformationForm({
  church,
  onSuccess,
  onCancel
}: Props) {

  const [loading, setLoading] = useState(false);
  const initialForm = {

    church_name: "",
    about: "",
    history: "",
    phone: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    youtube: "",
    whatsapp: "",
    address: "",
    latitude: "",
    longitude: "",
    map_link: "",

  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {

    if (church) {

      setForm({

        church_name: church.church_name ?? "",
        about: church.about ?? "",
        history: church.history ?? "",
        phone: church.phone ?? "",
        email: church.email ?? "",
        website: church.website ?? "",
        facebook: church.facebook ?? "",
        instagram: church.instagram ?? "",
        youtube: church.youtube ?? "",
        whatsapp: church.whatsapp ?? "",
        address: church.address ?? "",
        latitude: church.latitude ?? "",
        longitude: church.longitude ?? "",

        map_link: church.map_link ?? "",

      });


    } else {

      setForm(initialForm);


    }

  }, [church]);

  const handleChange = (
    field: string,
    value: string
  ) => {


    setForm(prev => ({

      ...prev,

      [field]: value

    }));

  };

  const handleSubmit = async(
    e: React.FormEvent
  ) => {


    e.preventDefault();

    if(
      !form.church_name ||
      !form.about
    ){

      await Swal.fire({
        icon:"warning",
        title:"Taarifa hazijakamilika",
        text:"Jina la kanisa na maelezo vinahitajika"

      });

      return;

    }

    try {

      setLoading(true);
      const data = new FormData();

      Object.entries(form).forEach(
        ([key,value])=>{


          data.append(
            key,
            value
          );

        }
      );

      if(church){

        await updateChurchInformation(

          church.id,

          data

        );


      }else{

        await createChurchInformation(

          data

        );

      }
      await Swal.fire({

        icon:"success",
        title:"Imefanikiwa",
        text: church
        ? "Taarifa za kanisa zimebadilishwa"
        : "Taarifa za kanisa zimehifadhiwa",
        timer:2000,
        showConfirmButton:false

      });

      onSuccess();

    }catch(error:any){

      console.error(
        "Church information error:",
        error
      );
      Swal.fire({

        icon:"error",

        title:"Imeshindikana",

        text:
        error?.message ??
        "Tatizo limetokea wakati wa kuhifadhi"

      });

    }finally{

      setLoading(false);

    }
  };

return (

<div className="
bg-white
rounded-xl
shadow
border
p-6
dark:bg-white/3
dark:border-gray-800
">

<div className="mb-6">
<h2 className="text-xl font-bold text-gray-800 dark:text-white/90">

{
church
?
"Hariri Taarifa za Kanisa"
:
"Ongeza Taarifa za Kanisa"
}

</h2>
<p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
Taarifa hizi zitaonekana kwa wageni wanaosharewa link ya kanisa
</p>
</div>
<form
onSubmit={handleSubmit}
className="space-y-5"
>
<div className="
grid
grid-cols-1
md:grid-cols-2
gap-5
">
<div>
<label className="block text-sm font-medium mb-2">
Jina la Kanisa *
</label>

<input
className="input"
placeholder="Mfano: AICT"
value={form.church_name}
onChange={
e=>handleChange(
"church_name",
e.target.value
)
}
/>
</div>
<div>
<label className="block text-sm font-medium mb-2">
Simu
</label>
<input
className="input"
placeholder="+255..."
value={form.phone}

onChange={
e=>handleChange(
"phone",
e.target.value
)
}
/>
</div>
<div>
<label className="block text-sm font-medium mb-2">
Email
</label>
<input
type="email"
className="input"
placeholder="info@church.com"
value={form.email}
onChange={
e=>handleChange(
"email",
e.target.value
)
}
/>
</div>
<div>
<label className="block text-sm font-medium mb-2">
WhatsApp
</label>
<input
className="input"
placeholder="2557XXXXXXXX"
value={form.whatsapp}
onChange={
e=>handleChange(
"whatsapp",
e.target.value
)
}

/>
</div>
</div>
<div>

<label className="block text-sm font-medium mb-2">
Kuhusu Kanisa *
</label>
<textarea
rows={5}
className="input"
placeholder="Elezea kuhusu kanisa..."
value={form.about}
onChange={
e=>handleChange(
"about",
e.target.value
)
}
/>
</div>
<div>
<label className="block text-sm font-medium mb-2">
Historia ya Kanisa
</label>
<textarea
rows={4}
className="input"
placeholder="Historia ya kanisa..."
value={form.history}

onChange={
e=>handleChange(
"history",
e.target.value
)
}

/>
</div>
<div>
<label className="block text-sm font-medium mb-2">
Anwani ya Kanisa
</label>
<input
className="input"
placeholder="Mfano: Dar es Salaam Tanzania"
value={form.address}
onChange={
e=>handleChange(
"address",
e.target.value
)
}
/>
</div>
<div className="
grid
grid-cols-1
md:grid-cols-2
gap-5
">
<div>
<label>
Latitude
</label>
<input
className="input"
placeholder="-6.7924"
value={form.latitude}
onChange={
e=>handleChange(
"latitude",
e.target.value
)
}
/>
</div>
<div>
<label>
Longitude
</label>
<input
className="input"
placeholder="39.2083"
value={form.longitude}
onChange={
e=>handleChange(
"longitude",
e.target.value
)
}
/>
</div>
</div>
<div>
<label className="block text-sm font-medium mb-2">
Google Map Link
</label>
<input
className="input"
placeholder="https://maps.google.com/..."
value={form.map_link}
onChange={
e=>handleChange(
"map_link",
e.target.value
)
}
/>
</div>
<div className="
grid
grid-cols-1
md:grid-cols-2
gap-5
">
<input
className="input"
placeholder="Website"
value={form.website}
onChange={
e=>handleChange(
"website",
e.target.value
)
}
/>
<input
className="input"
placeholder="Facebook"
value={form.facebook}

onChange={
e=>handleChange(
"facebook",
e.target.value
)
}
/>
<input
className="input"
placeholder="Instagram"
value={form.instagram}
onChange={
e=>handleChange(
"instagram",
e.target.value
)
}
/>
<input
className="input"
placeholder="Youtube"
value={form.youtube}
onChange={
e=>handleChange(
"youtube",
e.target.value
)
}

/>
</div>
<div className="
flex
justify-end
gap-3
pt-5
border-t
dark:border-gray-800
">
<button
type="button"
onClick={onCancel}
disabled={loading}
className="
px-5
py-2.5
border
rounded-lg
dark:border-gray-700
"
>
Ghairi
</button>
<button
disabled={loading}
className="
px-6
py-2.5
bg-blue-600
text-white
rounded-lg
"
>
{
loading
?
"Inahifadhi..."
:
church
?
"Hifadhi Mabadiliko"
:
"Hifadhi"
}
</button>
</div>
</form>
</div>
);
}