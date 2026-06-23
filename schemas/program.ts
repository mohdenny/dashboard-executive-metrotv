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
  periodeBulan: z.string().min(1, "Periode wajib diisi"),

  // Performa TV
  capaianTVR: z.number().min(0, "Tidak boleh minus"),
  capaianShare: z.number().min(0, "Tidak boleh minus"),
  targetTVR: z.number().min(0, "Tidak boleh minus"),
  targetShare: z.number().min(0, "Tidak boleh minus"),

  // Performa Digital
  digitalViews: z.number().min(0, "Tidak boleh minus"),
  digitalRevenue: z.number().min(0, "Tidak boleh minus"),

  // Cost/Modal
  costDirect: z.number().min(0, "Tidak boleh minus"),

  // Revenue
  revenueTarget: z.number().min(0, "Tidak boleh minus"),
  revenueCapaian: z.number().min(0, "Tidak boleh minus"),

  // PNL bebas angka berapa aja (bisa minus kalo emang programnya lagi rugi)
  pnl: z.number(),

  inventorySpot: z.number().min(0, "Tidak boleh minus"),
  rateIklan: z.number().min(0, "Tidak boleh minus"),
  keterangan: z.string().min(1, "Keterangan wajib diisi"),
});

// Otomatis ngekstrak/nge-generate tipe TypeScript (interface) dari skema Zod di atas
// Jadi ga usah cape-cape nulis tipe datanya dua kali
export type ProgramFormData = z.infer<typeof programFormSchema>;
