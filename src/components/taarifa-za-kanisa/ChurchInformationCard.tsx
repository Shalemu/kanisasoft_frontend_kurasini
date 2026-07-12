"use client";

import {
  FaChurch,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaMapMarkedAlt
} from "react-icons/fa";

interface Props {
  church:any;
}

export default function ChurchInformationCard({
  church
}:Props){
if(!church){
return (
<div className="bg-white rounded-xl shadow p-6 text-gray-500">
Hakuna taarifa za kanisa zilizowekwa.
</div>
);

}

return (

<div className="
bg-white
rounded-xl
shadow
border
p-6
space-y-8
">
{/* Header */}

<div className="
flex
items-center
gap-4
border-b
pb-5
">

<div className="
h-14
w-14
rounded-full
bg-blue-100
flex
items-center
justify-center
text-blue-600
">
<FaChurch size={26}/>
</div>
<div>

<h2 className="
text-2xl
font-bold
text-gray-900
">

{church.church_name}
</h2>

<p className="text-gray-500">
Taarifa za Kanisa
</p>

</div>

</div>

{/* About & History */}
<div
  className="
    grid
    grid-cols-1
    md:grid-cols-2
    gap-6
  "
>

  {/* About */}
  <div
    className="
      bg-gray-50
      rounded-lg
      p-5
    "
  >

    <h3
      className="
        text-lg
        font-semibold
        mb-2
        text-gray-800
      "
    >
      Kuhusu Kanisa
    </h3>


    <p
      className="
        text-gray-600
        leading-7
      "
    >
      {church.about || "Hakuna maelezo"}
    </p>

  </div>
  {/* History */}
  {
    church.history && (

      <div
        className="
          bg-gray-50
          rounded-lg
          p-5
        "
      >

        <h3
          className="
            text-lg
            font-semibold
            mb-2
            text-gray-800
          "
        >
          Historia
        </h3>
        <p
          className="
            text-gray-600
            leading-7
          "
        >
          {church.history}
        </p>
      </div>
    )
  }

</div>
{/* Contact Information */}

<div>
<h3 className="
text-lg
font-semibold
mb-4
text-gray-800
">
Mawasiliano
</h3>
<div className="
grid
grid-cols-1
md:grid-cols-2
gap-4
">
{
church.address && (
<div className="
flex
items-center
gap-3
bg-gray-50
rounded-lg
p-4
">
<FaMapMarkerAlt className="text-red-500"/>
<div>
<p className="text-xs text-gray-400">
Anwani
</p>
<p className="text-gray-700">
{church.address}
</p>
</div>
</div>
)
}

{
church.phone && (
<div className="
flex
items-center
gap-3
bg-gray-50
rounded-lg
p-4
">
<FaPhone className="text-green-600"/>
<div>
<p className="text-xs text-gray-400">
Simu
</p>
<p className="text-gray-700">
{church.phone}
</p>
</div>
</div>
)
}
{
church.email && (
<div className="
flex
items-center
gap-3
bg-gray-50
rounded-lg
p-4
">
<FaEnvelope className="text-blue-600"/>
<div>
<p className="text-xs text-gray-400">
Email
</p>
<p className="text-gray-700 break-all">
{church.email}
</p>
</div>
</div>
)
}

{
church.whatsapp && (
<div className="
flex
items-center
gap-3
bg-gray-50
rounded-lg
p-4
">
<FaWhatsapp className="text-green-500"/>
<div>
<p className="text-xs text-gray-400">
WhatsApp
</p>
<p className="text-gray-700">
{church.whatsapp}
</p>
</div>
</div>
)

}

</div>
</div>

{/* Social Links */}

<div className="
flex
flex-wrap
gap-3
pt-3
">

{
church.map_link && (

<a
href={church.map_link}
target="_blank"
rel="noopener noreferrer"
className="
flex
items-center
gap-2
px-4
py-2.5
rounded-lg
bg-blue-600
hover:bg-blue-700
text-white
text-sm
transition
"
>
<FaMapMarkedAlt size={16}/>
<span>
Fungua Ramani
</span>

</a>

)

}

{
church.website && (
<a
href={church.website}
target="_blank"
rel="noopener noreferrer"
className="
flex
items-center
gap-2
px-4
py-2.5
rounded-lg
bg-gray-800
hover:bg-gray-900
text-white
text-sm
transition
"
>
<FaGlobe size={16}/>

<span>
Website
</span>

</a>

)

}

{
church.whatsapp && (

<a
href={`https://wa.me/${church.whatsapp}`}
target="_blank"
rel="noopener noreferrer"
className="
flex
items-center
gap-2
px-4
py-2.5
rounded-lg
bg-green-600
hover:bg-green-700
text-white
text-sm
transition
"
>

<FaWhatsapp size={16}/>

<span>
WhatsApp
</span>

</a>

)

}

{
church.facebook && (

<a
href={church.facebook}
target="_blank"
rel="noopener noreferrer"
className="
flex
items-center
gap-2
px-4
py-2.5
rounded-lg
bg-blue-500
hover:bg-blue-600
text-white
text-sm
transition
"
>

<FaFacebook size={16}/>

<span>
Facebook
</span>

</a>

)

}

{
church.instagram && (

<a
href={church.instagram}
target="_blank"
rel="noopener noreferrer"
className="
flex
items-center
gap-2
px-4
py-2.5
rounded-lg
bg-pink-500
hover:bg-pink-600
text-white
text-sm
transition
"
>
<FaInstagram size={16}/>

<span>
Instagram
</span>

</a>

)
}

{
church.youtube && (

<a
href={church.youtube}
target="_blank"
rel="noopener noreferrer"
className="
flex
items-center
gap-2
px-4
py-2.5
rounded-lg
bg-red-600
hover:bg-red-700
text-white
text-sm
transition
"
>
<FaYoutube size={16}/>
<span>
YouTube
</span>

</a>

)

}

</div>

{
church.youtube && (
<a
href={church.youtube}
target="_blank"
className="
px-4
py-2
rounded-lg
bg-red-600
text-white
text-sm
"
>
<FaYoutube/>
</a>

)
}
</div>
);

}