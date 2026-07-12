"use client";

import {
  FaWhatsapp,
  FaFacebook,
  FaCopy
} from "react-icons/fa";

import Swal from "sweetalert2";


export default function ChurchShareButtons({
  church
}:any){


const link = 
typeof window !== "undefined"
? `${window.location.origin}/church/${church?.slug}`
: "";



const whatsapp = ()=>{

window.open(
`https://wa.me/?text=${encodeURIComponent(link)}`,
"_blank"
);

};



const facebook = ()=>{

window.open(
`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
"_blank"
);

};



const copyLink = async()=>{

try{

await navigator.clipboard.writeText(link);


Swal.fire({

icon:"success",
title:"Link imenakiliwa",
timer:1500,
showConfirmButton:false

});


}catch(error){

console.error(error);


Swal.fire({

icon:"error",
title:"Imeshindikana",
text:"Browser hairuhusu kunakili link"

});

}

};



return (

<div className="
bg-white
rounded-xl
shadow
border
p-6
">


<h2 className="font-semibold mb-4">
Shirikisha Wengine
</h2>



<div className="
flex
flex-wrap
gap-3
">


<button
onClick={whatsapp}
className="
bg-green-600
text-white
px-4
py-2
rounded-lg
flex
items-center
gap-2
"
>

<FaWhatsapp size={18}/>
WhatsApp

</button>





<button
onClick={facebook}
className="
bg-blue-600
text-white
px-4
py-2
rounded-lg
flex
items-center
gap-2
"
>

<FaFacebook size={18}/>
Facebook

</button>





<button
onClick={copyLink}
className="
border
px-4
py-2
rounded-lg
flex
items-center
gap-2
hover:bg-gray-50
"
>

<FaCopy/>
Copy Link

</button>



</div>


</div>

);

}