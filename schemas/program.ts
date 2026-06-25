import { z } from "zod";

// Bikin skema aturan validasi buat form nambah/edit program pake Zod
// Kalo ada field yang kosong atau isinya ga sesuai aturan, pesannya bakal langsung muncul
export const programFormSchema = z.object({
  id: z.string().optional(),
  createdById: z.string().optional(),
  updatedById: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),

  // Info program
  name: z.string().min(1, "Nama program wajib diisi"),
  broadcastTime: z.string().min(1, "Jam tayang wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  descriptionCategory: z.string().min(1, "Deskripsi wajib diisi"),

  periods: z.array(
    z.object({
      id: z.string().optional(),
      month: z.string().min(1, "Periode wajib diisi"),

      // Performa TV
      performanceTV: z.object({
        targetTVR: z.number().min(0, "Tidak boleh minus"),
        targetShare: z.number().min(0, "Tidak boleh minus"),
        actualTVR: z.number().min(0, "Tidak boleh minus"),
        actualShare: z.number().min(0, "Tidak boleh minus"),
      }),

      // Performa Digital
      performanceDigital: z.object({
        views: z.number().min(0, "Tidak boleh minus"),
        revenue: z.number().min(0, "Tidak boleh minus"),
      }),

      financials: z.object({
        // Cost/Modal
        costDirect: z.number().min(0, "Tidak boleh minus"),

        // Revenue
        revenueTarget: z.number().min(0, "Tidak boleh minus"),
        revenueActual: z.number().min(0, "Tidak boleh minus"),

        // PNL bebas angka berapa aja (bisa minus kalo emang programnya lagi rugi)
        pnl: z.number(),
      }),

      inventory: z.object({
        spot: z.number().min(0, "Tidak boleh minus"),
        adRate: z.number().min(0, "Tidak boleh minus"),
      }),

      status: z.string().min(1, "Keterangan wajib diisi"),
    }),
  ),
});

// Otomatis ngekstrak/nge-generate tipe TypeScript (interface) dari skema Zod di atas
// Jadi ga usah cape-cape nulis tipe datanya dua kali
export type ProgramFormData = z.infer<typeof programFormSchema>;
