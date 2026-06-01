import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Visitor {
  visit_date: string;
  full_name: string;
  phone: string;
  church_origin: string;
  prayer: boolean;
  salvation: boolean;
  joining: boolean;
  travel: boolean;
  other: string;
}

function getReasons(v: Visitor) {
  return [
    v.prayer && 'Maombi',
    v.salvation && 'Kuokoka',
    v.joining && 'Kujiunga',
    v.travel && 'Safari',
    v.other
  ]
    .filter(Boolean)
    .join(', ');
}

export const exportVisitorsExcel = (
  visitors: Visitor[]
) => {

  const rows = visitors.map((v) => ({
    Tarehe: new Date(
      v.visit_date
    ).toLocaleDateString(),

    Jina: v.full_name,

    Simu: v.phone,

    Kanisa: v.church_origin,

    Sababu: getReasons(v),
  }));

  const ws =
    XLSX.utils.json_to_sheet(rows);

  const wb =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    'Wageni'
  );

  XLSX.writeFile(
    wb,
    'wageni.xlsx'
  );
};

export const exportVisitorsPDF = (
  visitors: Visitor[]
) => {

  const doc = new jsPDF();

  doc.text(
    'Ripoti ya Wageni',
    14,
    15
  );

  autoTable(doc,{
    startY:25,

    head:[[
      'Tarehe',
      'Jina',
      'Simu',
      'Kanisa',
      'Sababu'
    ]],

    body: visitors.map(v=>[
      new Date(
        v.visit_date
      ).toLocaleDateString(),

      v.full_name,

      v.phone,

      v.church_origin,

      getReasons(v)
    ])
  });

  doc.save(
    'wageni.pdf'
  );
};