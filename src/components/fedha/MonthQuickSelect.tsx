"use client";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Ago", "Sep", "Okt", "Nov", "Des",
];

interface Props {
  onSelect: (fromDate: string, toDate: string) => void;
  year?: number;
  onYearChange?: (year: number) => void;
}

export default function MonthQuickSelect({ onSelect, year, onYearChange }: Props) {
  const currentYear = year ?? new Date().getFullYear();

  const handleMonth = (monthIndex: number) => {
    const from = new Date(currentYear, monthIndex, 1);
    const to = new Date(currentYear, monthIndex + 1, 0);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    onSelect(fmt(from), fmt(to));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onYearChange && (
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => onYearChange(currentYear - 1)}
            className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ‹
          </button>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-10 text-center">
            {currentYear}
          </span>
          <button
            type="button"
            onClick={() => onYearChange(currentYear + 1)}
            className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ›
          </button>
        </div>
      )}
      {MONTHS.map((name, i) => (
        <button
          key={name}
          type="button"
          onClick={() => handleMonth(i)}
          className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#1e293b] hover:text-white transition-colors"
        >
          {name}
        </button>
      ))}
    </div>
  );
}
