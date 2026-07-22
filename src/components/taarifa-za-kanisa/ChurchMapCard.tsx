"use client";
import {
 FaMapMarkedAlt
} from "react-icons/fa";

interface Props {

    church:any;

}
export default function ChurchMapCard({
    church
}:Props){
if(!church?.map_url){

    return null;

}
return (
<div className="bg-white rounded-xl shadow border p-6 dark:bg-white/3 dark:border-gray-800">
<div className="flex items-center gap-3 mb-4">
<FaMapMarkedAlt
className="text-red-600"
size={22}
/>
<h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
Ramani na Mahali
</h2>
</div>
<div className="
w-full
h-72
rounded-lg
overflow-hidden
border
dark:border-gray-800
">
<iframe
src={church.map_url}
className="
w-full
h-full
"
loading="lazy"
allowFullScreen
/>
</div>
{
church.direction && (
<p className="mt-4 text-gray-600 dark:text-gray-400">
<strong>
Maelekezo:
</strong>
<br/>
{church.direction}
</p>

)
}
<a
href={church.map_url}
target="_blank"
className="
inline-block
mt-4
bg-blue-600
text-white
px-5
py-2
rounded-lg
"
>
Fungua Google Maps
</a>
</div>
);
}