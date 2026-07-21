// Import zod buat validasi
import { z } from "zod";

// Skema validasi data program pake Zod
export const programFormSchema = z.object({
  // Id program optional
  id: z.string().optional(),
  // Id pembuat
  createdById: z.string().optional(),
  // Id editor
  updatedById: z.string().optional(),
  // Tanggal buat
  createdAt: z.string().optional(),
  // Tanggal update
  updatedAt: z.string().optional(),

  // Nama program wajib ada
  name: z.string().min(1, "Nama program wajib diisi"),
  // Jam tayang wajib ada
  // broadcastTime: z.string().min(1, "Jam tayang wajib diisi"),
  broadcastTime: z.string().optional(),
  // Kategori wajib ada
  category: z.string().min(1, "Kategori wajib dipilih"),
  //Jenis program tidak wajib
  Bulletin: z.string().optional(),
  // Deskripsi wajib ada
  // descriptionCategory: z.string().min(1, "Deskripsi wajib diisi"),
  descriptionCategory: z.string().optional(),

  // Array data periode
  periods: z.array(
    z.object({
      // Id periode optional
      id: z.string().optional(),
      // Nama bulan wajib ada
      month: z.string().min(1, "Periode wajib diisi"),

      // Performa TV
      performanceTV: z.object({
        // Target tvr ga boleh minus
        targetTVR: z.number().min(0, "Tidak boleh minus"),
        // Target share ga boleh minus
        targetShare: z.number().min(0, "Tidak boleh minus"),
        // Capaian tvr ga boleh minus
        actualTVR: z.number().min(0, "Tidak boleh minus"),
        // Capaian share ga boleh minus
        actualShare: z.number().min(0, "Tidak boleh minus"),
      }),

      // Performa Digital
      performanceDigital: z.object({
        // Views ga boleh minus
        views: z.number().min(0, "Tidak boleh minus"),
        // Revenue digital ga boleh minus
        revenue: z.number().min(0, "Tidak boleh minus"),
      }),

      // Data finansial
      financials: z.object({
        // Modal langsung
        costDirect: z.number().min(0, "Tidak boleh minus"),

        // Target revenue
        revenueTarget: z.number().min(0, "Tidak boleh minus"),
        // Revenue aktual
        revenueActual: z.number().min(0, "Tidak boleh minus"),

        // Pnl bebas angka
        pnl: z.number(),
      }),

      // Inventori spot
      inventory: z.object({
        // Spot tersedia
        // spot: z.number().min(0, "Tidak boleh minus"),
        spot: z.number().optional(),
        // Harga iklan
        // adRate: z.number().min(0, "Tidak boleh minus"),
        adRate: z.number().optional(),
      }),

      // Status periode
      // status: z.string().min(1, "Keterangan wajib diisi"),
      status: z.string().optional(),
    }),
  ),
});

// Tipe typescript dari skema zod
export type ProgramFormData = z.infer<typeof programFormSchema>;
