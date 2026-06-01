import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className="
        mx-auto mb-10 w-full max-w-60 rounded-2xl
        bg-[#1e293b] px-4 py-5 text-center
        border border-slate-700 shadow-lg
      "
    >
      <h3 className="mb-2 font-semibold text-white">
        KanisaSoft Dashboard
      </h3>

      <p className="mb-4 text-sm text-slate-300">
        Mfumo bora wa usimamizi wa kanisa kwa taarifa,
        washirika, fedha na viongozi.
      </p>

      <button
        className="
          w-full rounded-lg bg-[#f0ce32]
          px-3 py-3 font-semibold text-[#1e293b]
          hover:opacity-90 transition
        "
      >
        Mfumo Hai
      </button>
    </div>
  );
}