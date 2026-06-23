import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ProgramFormData } from "@/schemas/program";

// Bikin interface baru buat data program yang udah masuk ke database
// Ini extends (numpang warisan) dari ProgramFormData, tapi ketambahan id sama timestamp
// export interface ProgramData extends ProgramFormData {
//   // id unik dari database
//   id: string;
//   // Kapan data ini dibikin (opsional pas narik data)
//   createdAt?: Date | string;
//   // Kapan data ini terakhir diedit (opsional)
//   updatedAt?: Date | string;
// }

// Kalo false = Pake data dummy lokal (MOCK_PROGRAMS)
// Kalo true = Langsung nembak ke API backend beneran
const USE_REAL_API = false;

// Fungsi asinkron buat ngambil list data program, bisa dipakein filter rentang waktu
export const fetchProgramsByRange = async (
  // Parameter filter bulan awal (opsional)
  startPeriod?: string,
  // Parameter filter bulan akhir (opsional)
  endPeriod?: string,
): Promise<ProgramFormData[]> => {
  // Kalo true, tembak endpoint API pake fetch, nanti kalo backend udah fix pake Axios
  if (USE_REAL_API) {
    const res = await fetch(
      `/api/programs?start=${startPeriod || ""}&end=${endPeriod || ""}`,
    );
    // Kalo response API-nya gagal/error (misal server mati), lempar error biar ditangkep sama React Query
    if (!res.ok) throw new Error("Network error");
    // Kalo sukses, convert data JSON-nya ke bentuk array yang bisa dibaca aplikasi
    return res.json();
  }

  // Copy semua isi data mock ke dalem variabel 'data'
  let data = [...MOCK_PROGRAMS] as ProgramFormData[];

  // Kalo user milih filter bulan awal DAN bulan akhir...
  if (startPeriod && endPeriod) {
    // Saring/filter datanya, ambil program yang bulannya ada di antara startPeriod dan endPeriod aja
    data = data.filter(
      (p) => p.periodeBulan >= startPeriod && p.periodeBulan <= endPeriod,
    );
  }

  // Balikin datanya ke komponen yang manggil fungsi ini
  return data;
};

// Fungsi asinkron buat nambah data program baru (Create)
export const createProgram = async (
  // Nerima data payload (isian form) dari user
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Mode nembak API beneran
  if (USE_REAL_API) {
    const res = await fetch("/api/programs", {
      // Method HTTP buat nambah data baru
      method: "POST",
      // Kasih tau server kalo ngirim JSON
      headers: { "Content-Type": "application/json" },
      // Ubah objek data javascript jadi string JSON biar bisa dikirim
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // Mode Data Bohongan: Bikin pura-pura loading nunggu 600 milidetik biar dapet feel transisinya
  await new Promise((r) => setTimeout(r, 600));

  // Balikin datanya ke UI seolah-olah sukses masuk DB, tambahin id bohongan pake timestamp saat ini
  return { id: `p-new-${Date.now()}`, ...data } as ProgramFormData;
};

// Fungsi asinkron buat nge-update data program yang udah ada (Update)
export const updateProgram = async (
  // id program mana yang mau diedit
  id: string,
  // Data barunya apa
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Mode nembak API beneran
  if (USE_REAL_API) {
    const res = await fetch(`/api/programs/${id}`, {
      // Method HTTP standar buat nimpa/update data utuh
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // Mode Data Bohongan: Pura-pura nunggu proses server 600ms lagi
  await new Promise((r) => setTimeout(r, 600));

  // Balikin gabungan id yang diedit sama data terbarunya
  return { id, ...data } as ProgramFormData;
};

// Fungsi asinkron buat ngapus data program (Delete)
export const deleteProgram = async (id: string): Promise<void> => {
  // Mode nembak API beneran
  if (USE_REAL_API) {
    // Cukup panggil method DELETE ke endpoint id yang bersangkutan, ga butuh kirim body payload
    await fetch(`/api/programs/${id}`, { method: "DELETE" });
    // Kalo sukses, fungsi langsung kelar
    return;
  }

  // Mode Data Bohongan: Ngasih delay 600ms doang buat simulasi proses ngapus
  await new Promise((r) => setTimeout(r, 600));
};
