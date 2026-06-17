"use client";

import React, { useEffect, useRef } from "react";
import { FaTimes, FaPrint, FaDownload } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  downloadUrl?: string | null;
  fileName?: string;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  url,
  title,
  downloadUrl,
  fileName,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex flex-col w-[95vw] h-[90vh] max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white truncate">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-950">
          <iframe
            ref={iframeRef}
            src={url}
            title={title}
            className="w-full h-full border-0"
          />
        </div>

        {/* Footer with Print + Download */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaPrint /> Print
          </button>

          {(downloadUrl || url) && (
            <a
              href={downloadUrl || url}
              download={fileName || title}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-medium transition-colors"
            >
              <FaDownload /> Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
