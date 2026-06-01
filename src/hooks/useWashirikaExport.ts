import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const useWashirikaExport = () => {

  const exportToExcel = (
  members: any[],
  fileName: string = "washirika"
) => {
  const data = members.map((m, index) => ({
    "#": index + 1,
    Jina: m.full_name,
    Namba: m.membership_number || "—",
    Simu: m.phone || "—",
    Email: m.email || "—",
    Zone: m.residential_zone || "—",
    Tarehe: new Date(m.created_at).toLocaleDateString(),
    Sababu: m.deactivation_reason || "—",
    Status: m.membership_status || "—",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

  const exportToPDF = (
  members: any[],
  fileName: string = "washirika"
) => {
  const doc = new jsPDF();

  doc.text("Ripoti ya Washirika", 14, 15);

  const tableData = members.map((m, index) => [
    index + 1,
    m.full_name,
    m.membership_number || "—",
    m.phone || "—",
    m.residential_zone || "—",
    m.deactivation_reason || "—",
    m.membership_status || "—",
  ]);

  autoTable(doc, {
    startY: 25,
    head: [["#", "Jina", "Namba", "Simu", "Zone", "Sababu", "Status"]],
    body: tableData,
  });

  doc.save(`${fileName}.pdf`);
};
  return {
    exportToExcel,
    exportToPDF,
  };
};