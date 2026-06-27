// Import data mock program
import { MOCK_PROGRAMS } from "@/constants/programMockData";
// Import tipe data program
import { ProgramFormData } from "@/schemas/program";

// Toggle buat pake api asli atau mock
const USE_REAL_API = false;

// Fungsi fetch list program
export const fetchProgramsByRange = async (
  // Periode awal
  startPeriod?: string,
  // Periode akhir
  endPeriod?: string,
): Promise<ProgramFormData[]> => {
  // Kalo pake api asli fetch ke endpoint
  if (USE_REAL_API) {
    const res = await fetch(
      `/api/programs?start=${startPeriod || ""}&end=${endPeriod || ""}`,
    );
    // Kalo gagal lempar error
    if (!res.ok) throw new Error("Network error");
    // Balikin json
    return res.json();
  }

  // Copy data mock
  let data = [...MOCK_PROGRAMS] as ProgramFormData[];

  // Kalo ada filter periode saring datanya
  if (startPeriod && endPeriod) {
    data = data.filter((p) => {
      const month = p.periods?.[0]?.month ?? "";
      return month >= startPeriod && month <= endPeriod;
    });
  }

  // Balikin data
  return data;
};

// Fungsi buat bikin program baru
export const createProgram = async (
  // Data program baru
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Mode api asli
  if (USE_REAL_API) {
    const res = await fetch("/api/programs", {
      // Method post buat tambah data
      method: "POST",
      // Header json
      headers: { "Content-Type": "application/json" },
      // Stringify data
      body: JSON.stringify(data),
    });
    // Balikin json
    return res.json();
  }

  // Simulasi delay
  await new Promise((r) => setTimeout(r, 600));

  // Balikin objek dengan id dummy
  return { id: `p-new-${Date.now()}`, ...data } as ProgramFormData;
};

// Fungsi update data program
export const updateProgram = async (
  // Id program
  id: string,
  // Data baru
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Mode api asli
  if (USE_REAL_API) {
    const res = await fetch(`/api/programs/${id}`, {
      // Method put buat update
      method: "PUT",
      // Header json
      headers: { "Content-Type": "application/json" },
      // Stringify data
      body: JSON.stringify(data),
    });
    // Balikin json
    return res.json();
  }

  // Simulasi delay
  await new Promise((r) => setTimeout(r, 600));

  // Balikin data terupdate
  return { id, ...data } as ProgramFormData;
};

// Fungsi hapus data program
export const deleteProgram = async (
  // Id program
  id: string,
): Promise<void> => {
  // Mode api asli
  if (USE_REAL_API) {
    // Panggil api delete
    await fetch(`/api/programs/${id}`, { method: "DELETE" });
    // Balikin void
    return;
  }

  // Simulasi delay
  await new Promise((r) => setTimeout(r, 600));
};
