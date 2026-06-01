'use client';

import { FaCheckCircle } from 'react-icons/fa';

interface SummaryCardProps {
  title: string;
  value: number;
}

export default function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">

      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
        <FaCheckCircle className="text-blue-600 text-sm" />
      </div>

      <p className="text-sm text-gray-500 mb-1">
        {title}
      </p>

      <h3 className="text-2xl font-bold text-gray-800">
        {value}
      </h3>

    </div>
  );
}