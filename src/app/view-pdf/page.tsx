"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PdfViewer() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";
  const title = searchParams.get("title") || "Ankara";

  useEffect(() => {
    document.title = title;
    const interval = setInterval(() => {
      if (document.title !== title) {
        document.title = title;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [title]);

  if (!url) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Hakuna faili ya kuonyesha.
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title={title}
      className="w-full h-screen border-0"
    />
  );
}

export default function ViewPdfPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-500">Inapakia...</div>}>
      <PdfViewer />
    </Suspense>
  );
}
