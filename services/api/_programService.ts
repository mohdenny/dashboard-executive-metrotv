import axios from "axios";
// Import tipe data program dari skema validasi
import { ProgramFormData, programFormSchema } from "@/schemas/program";

// Bikin instance khusus axios biar konfigurasinya rapi dan terpusat
const apiClient = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.backend-mtv.com",

  // Setel batas waktu request maksimal sepuluh detik
  timeout: 10000,
  // Pastiin header kiriman berformat json
  headers: {
    // Definisi tipe konten json
    "Content-Type": "application/json",
  },
});

// Bikin interface buat nangkep respons mentah dari json yang strukturnya beda
export interface RawDashboardResponse {
  // Properti master data buat relasi
  masterData: Record<string, unknown>;
  // Properti payload data buat rincian metrik
  payloadData: Record<string, unknown>;
}

// Bikin interface balasan yang dipake hook
export interface FetchProgramsResponse {
  // Array nampung data program asli siap pake
  data: ProgramFormData[];
  // Objek penampung parameter filter yang aktif digunakan saat fetch
  params: {
    // Properti opsional karena boleh bernilai undefined atau string
    startPeriod?: string;
    // Parameter bulan akhir batasan filter opsional
    endPeriod?: string;
    // Properti wajib bebentuk string (misal: "2026")
    year: string;
  };
  // Array nampung pesan error kalo ada
  errors: string[];
}

// Fungsi fetch list program buat ditarik ama react query
export const fetchProgramsByRange = async (
  // Parameter bulan awal filter filter opsional
  startPeriod?: string,
  // Parameter bulan akhir batasan filter opsional
  endPeriod?: string,
  // Parameter string tahun dokumen opsional
  year: string = "2026",
): Promise<FetchProgramsResponse> => {
  // Pas backend idup, ganti url "/data.json" jadi endpoint, misal "/api/v1/programs"
  const response = await apiClient.get<unknown>(
    // Tembak langsung file json di folder public
    `/data.json`,
  );

  // Ambil data mentahnya
  const rawData = response.data;
  const mappedData: ProgramFormData[] = [];
  const validationErrors: string[] = [];

  if (Array.isArray(rawData)) {
    rawData.forEach((item, index) => {
      const parsedData = programFormSchema.safeParse(item);

      if (parsedData.success) {
        mappedData.push(parsedData.data);
      } else {
        validationErrors.push(`Baris ${index + 1} gagal divalidasi`);
        console.error(
          `Baris ${index + 1} gagal divalidasi`,
          parsedData.error.format(),
        );
      }
    });
  }

  // Balikin hasil data bongkahan utuh yang udah dipetain
  return {
    // Isi data
    data: mappedData,
    params: {
      // Berikan nilai variabel aslinya secara langsung tanpa tanda tanya
      startPeriod: startPeriod,
      // Parameter bulan akhir batasan filter opsional
      endPeriod: endPeriod,
      year: year,
    },
    // Isi error kosong
    errors: validationErrors,
  };
};

// Fungsi buat nyuntik data program baru ke server
export const createProgram = async (
  // Parameter objek data utuh hasil ketikan form
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Kalo backend udah jadi, hapus promise timer
  await new Promise((resolve) => setTimeout(resolve, 800));

  // const response = await apiClient.post<ProgramFormData>(
  //   `/api/v1/programs`,
  //   data,
  // );
  // return response.data;

  // Balikin data bohongan sisa simulasi
  return { ...data, id: `PRG-NEW-${Date.now()}` };
};

// Fungsi buat nimpah atau ngedit data program lama
export const updateProgram = async (
  // Parameter string id unik sasaran update
  id: string,
  // Parameter objek data baru yang mau ditiban ke dalem database
  data: ProgramFormData,
): Promise<ProgramFormData> => {
  // Hapus timer pas backend asli udah ada
  await new Promise((resolve) => setTimeout(resolve, 800));

  // const response = await apiClient.put<ProgramFormData>(
  //   `/api/v1/programs/${id}`,
  //   data,
  // );
  // return response.data;

  // Balikin simulasi balasan
  return data;
};

// Fungsi sakti buat ngehapus data dari peredaran
export const deleteProgram = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // await apiClient.delete(`/api/v1/programs/${id}`);
};
