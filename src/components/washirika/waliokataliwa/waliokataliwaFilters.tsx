"use client";

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedMonth: string;
  setSelectedMonth: (v: string) => void;
  selectedGroup: string;
  setSelectedGroup: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
}

export default function WaliokataliwaFilters(props: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-xl shadow">
      
      <input
        type="text"
        placeholder="Search name or phone..."
        value={props.searchTerm}
        onChange={(e) => props.setSearchTerm(e.target.value)}
        className="border p-2 rounded"
      />

      <input
        type="month"
        value={props.selectedMonth}
        onChange={(e) => props.setSelectedMonth(e.target.value)}
        className="border p-2 rounded"
      />

      <input
        type="date"
        value={props.fromDate}
        onChange={(e) => props.setFromDate(e.target.value)}
        className="border p-2 rounded"
      />

      <input
        type="date"
        value={props.toDate}
        onChange={(e) => props.setToDate(e.target.value)}
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Group"
        value={props.selectedGroup}
        onChange={(e) => props.setSelectedGroup(e.target.value)}
        className="border p-2 rounded"
      />
    </div>
  );
}