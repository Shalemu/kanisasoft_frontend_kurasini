"use client";

import { FaWhatsapp, FaFacebook, FaCopy } from "react-icons/fa";
import Swal from "sweetalert2";

type Props = {
  church: {
    slug?: string;
  };
};

export default function ChurchShareButtons({ church }: Props) {
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/church/${church?.slug}`
      : "";

  const whatsapp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(link)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const facebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);

      Swal.fire({
        icon: "success",
        title: "Link imenakiliwa",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Imeshindikana",
        text: "Browser hairuhusu kunakili link.",
      });
    }
  };

  return (
    <div
      className="
        bg-white
        dark:bg-white/5
        border
        dark:border-gray-800
        rounded-xl
        shadow-sm
        p-6
      "
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        Shirikisha Wengine
      </h2>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={whatsapp}
          className="
            flex items-center gap-2
            rounded-lg
            bg-green-600
            px-4 py-2
            text-white
            transition
            hover:bg-green-700
          "
        >
          <FaWhatsapp size={18} />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={facebook}
          className="
            flex items-center gap-2
            rounded-lg
            bg-blue-600
            px-4 py-2
            text-white
            transition
            hover:bg-blue-700
          "
        >
          <FaFacebook size={18} />
          <span>Facebook</span>
        </button>

        <button
          onClick={copyLink}
          className="
            flex items-center gap-2
            rounded-lg
            border
            border-gray-300
            dark:border-gray-700
            px-4 py-2
            text-gray-700
            dark:text-white
            transition
            hover:bg-gray-100
            dark:hover:bg-white/10
          "
        >
          <FaCopy size={16} />
          <span>Copy Link</span>
        </button>
      </div>
    </div>
  );
}