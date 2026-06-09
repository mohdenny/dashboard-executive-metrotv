export interface ProgramData {
  id: string;
  category: "A" | "B" | "C";
  name: string;
  // Target performa yang pengen dicapai
  performaTarget: number;
  // Hasil performa asli yang beneran didapet di lapangan
  performaCapaian: number;
  // Biaya modal utama yang langsung keluar buat bikin program ini
  costDirect: number;
  // Target dapet duit (omset) yang dipasang dari awal
  revenueTarget: number;
  // Duit/omset asli yang beneran masuk kantong
  revenueCapaian: number;
  // Keuntungan bersih atao kerugian (Sisa duit setelah omset dikurang biaya modal)
  pnl: number;
  // Sisa slot atau sisa kuota iklan yang masih kosong dan bisa dijual
  inventorySpot: number;
  // Harga pasaran buat pasang satu iklan di program ini
  rateIklan: number;
  // Catatan tambahan atau info ekstra kalau ada yang perlu dijelasin
  keterangan: string;
}

export const MOCK_PROGRAMS: ProgramData[] = [
  // Kategori A
  {
    id: "p1",
    category: "A",
    name: "Metro Hari Ini",
    performaTarget: 80,
    performaCapaian: 85,
    costDirect: 50000000,
    revenueTarget: 150000000,
    revenueCapaian: 160000000,
    pnl: 110000000,
    inventorySpot: 20,
    rateIklan: 5000000,
    keterangan: "Sesuai Target",
  },
  {
    id: "p2",
    category: "A",
    name: "Prime Time News",
    performaTarget: 90,
    performaCapaian: 92,
    costDirect: 75000000,
    revenueTarget: 200000000,
    revenueCapaian: 210000000,
    pnl: 135000000,
    inventorySpot: 25,
    rateIklan: 8000000,
    keterangan: "Sesuai Target",
  },
  {
    id: "p3",
    category: "A",
    name: "Top News",
    performaTarget: 75,
    performaCapaian: 70,
    costDirect: 45000000,
    revenueTarget: 100000000,
    revenueCapaian: 90000000,
    pnl: 45000000,
    inventorySpot: 15,
    rateIklan: 4000000,
    keterangan: "Underperform",
  },
  {
    id: "p4",
    category: "A",
    name: "Kick Andy",
    performaTarget: 95,
    performaCapaian: 98,
    costDirect: 60000000,
    revenueTarget: 250000000,
    revenueCapaian: 300000000,
    pnl: 240000000,
    inventorySpot: 30,
    rateIklan: 10000000,
    keterangan: "Overachieve",
  },

  // Kategori B
  {
    id: "p6",
    category: "B",
    name: "Editorial MI",
    performaTarget: 70,
    performaCapaian: 65,
    costDirect: 30000000,
    revenueTarget: 80000000,
    revenueCapaian: 60000000,
    pnl: 30000000,
    inventorySpot: 12,
    rateIklan: 3500000,
    keterangan: "Perlu Evaluasi",
  },
  {
    id: "p7",
    category: "B",
    name: "Metro Sports",
    performaTarget: 75,
    performaCapaian: 80,
    costDirect: 40000000,
    revenueTarget: 90000000,
    revenueCapaian: 110000000,
    pnl: 70000000,
    inventorySpot: 15,
    rateIklan: 4000000,
    keterangan: "Baik",
  },
  {
    id: "p9",
    category: "B",
    name: "Newsline",
    performaTarget: 80,
    performaCapaian: 72,
    costDirect: 45000000,
    revenueTarget: 110000000,
    revenueCapaian: 40000000,
    pnl: -5000000,
    inventorySpot: 18,
    rateIklan: 5000000,
    keterangan: "Rugi",
  },

  // Kategori C
  {
    id: "p11",
    category: "C",
    name: "Metro Pagi Primetime",
    performaTarget: 60,
    performaCapaian: 55,
    costDirect: 25000000,
    revenueTarget: 50000000,
    revenueCapaian: 45000000,
    pnl: 20000000,
    inventorySpot: 10,
    rateIklan: 2000000,
    keterangan: "Stabil",
  },
  {
    id: "p12",
    category: "C",
    name: "Euromaxx",
    performaTarget: 50,
    performaCapaian: 45,
    costDirect: 30000000,
    revenueTarget: 40000000,
    revenueCapaian: 20000000,
    pnl: -10000000,
    inventorySpot: 8,
    rateIklan: 1500000,
    keterangan: "Rugi",
  },
];
