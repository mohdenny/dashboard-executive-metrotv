import * as XLSX from "xlsx";

// Setup interface buat tipe data biar kaga dimarahin typescript
export interface ExportPeriodData {
  month: string;
  status?: string;
  performanceTV?: {
    targetTVR?: number;
    actualTVR?: number;
    targetShare?: number;
    actualShare?: number;
  };
  performanceDigital?: {
    views?: number;
    revenue?: number;
  };
  financials?: {
    costDirect?: number;
    revenueTarget?: number;
    revenueActual?: number;
    pnl?: number;
  };
  inventory?: {
    spot?: number;
    adRate?: number;
  };
}

export interface ExportProgramData {
  name: string;
  category: string;
  broadcastTime?: string;
  periods?: ExportPeriodData[];
}

export interface ExportRow {
  "Nama Program": string;
  Kategori: string;
  "Jam Tayang": string;
  Periode: string;
  "Target TVR": number;
  "Actual TVR": number;
  "Target Share": number;
  "Actual Share": number;
  "Digital Views": number;
  "Digital Revenue": number;
  "Cost Direct": number;
  "Revenue Target": number;
  "Revenue Actual": number;
  "Net PNL": number;
  "Inventory Spot": number;
  "Ad Rate": number;
  Status: string;
}

export function useExportExcel() {
  // Fungsi helper nyelam nyari periode aktif pas export
  const getActivePeriodForExport = (
    item: ExportProgramData,
    targetPeriod: string | null,
  ): ExportPeriodData | null => {
    if (!item || !item.periods || item.periods.length === 0) return null;
    if (targetPeriod) {
      const found = item.periods.find((p) => p.month === targetPeriod);
      if (found) return found;
    }
    const sorted = [...item.periods].sort((a, b) =>
      b.month.localeCompare(a.month),
    );
    return sorted[0] ?? null;
  };

  // Fungsi sakti buat nge-export data tabel ke excel sesuai schema
  const exportToExcel = (
    programs: ExportProgramData[],
    filename: string,
    selectedPeriod: string | null,
  ) => {
    if (!programs || programs.length === 0) return;

    // Rakit data mentah jadi barisan flat sesuai struktur schema
    const exportData: ExportRow[] = programs.map((prog) => {
      // Intip data bulan aktifnya
      const activePeriod = getActivePeriodForExport(prog, selectedPeriod);

      // Balikin wujud flat object buat tiap baris excel
      return {
        "Nama Program": prog.name || "-",
        Kategori: prog.category || "-",
        "Jam Tayang": prog.broadcastTime || "-",
        Periode: activePeriod?.month || "-",
        "Target TVR": activePeriod?.performanceTV?.targetTVR || 0,
        "Actual TVR": activePeriod?.performanceTV?.actualTVR || 0,
        "Target Share": activePeriod?.performanceTV?.targetShare || 0,
        "Actual Share": activePeriod?.performanceTV?.actualShare || 0,
        "Digital Views": activePeriod?.performanceDigital?.views || 0,
        "Digital Revenue": activePeriod?.performanceDigital?.revenue || 0,
        "Cost Direct": activePeriod?.financials?.costDirect || 0,
        "Revenue Target": activePeriod?.financials?.revenueTarget || 0,
        "Revenue Actual": activePeriod?.financials?.revenueActual || 0,
        "Net PNL": activePeriod?.financials?.pnl || 0,
        "Inventory Spot": activePeriod?.inventory?.spot || 0,
        "Ad Rate": activePeriod?.inventory?.adRate || 0,
        Status: activePeriod?.status || "-",
      };
    });

    // Sulap array of object jadi lembaran worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // Bikin buku kerja excel baru
    const workbook = XLSX.utils.book_new();
    // Tempelin lembaran ke buku
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Program");
    // Perintah unduh filenya
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  // Balikin helper export
  return { exportToExcel };
}
