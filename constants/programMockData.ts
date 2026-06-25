// import { ProgramData } from "@/services/api/programService";
import { ProgramFormData } from "@/schemas/program";

export const MOCK_PROGRAMS: ProgramFormData[] = [
  // {
  //   id: "p1",
  //   name: "Metro Hari Ini",
  //   category: "A",
  //   descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
  //   broadcastTime: "16:30",
  //   periods: [
  //     {
  //       id: "d1",
  //       month: "2026-04",
  //       performanceTV: {
  //         targetTVR: 0.4,
  //         targetShare: 3.5,
  //         actualTVR: 0.2,
  //         actualShare: 2.5,
  //       },
  //       performanceDigital: {
  //         views: 9950769,
  //         revenue: 15845743,
  //       },
  //       financials: {
  //         costDirect: 601782000,
  //         revenueTarget: 1500000000,
  //         revenueActual: 1192740727,
  //         pnl: 606804470,
  //       },
  //       inventory: {
  //         spot: 20,
  //         adRate: 5000000,
  //       },
  //       status: "Sesuai Target",
  //     },
  //   ],
  // },import { ProgramFormData } from "@/schemas/program";
  {
    id: "p1",
    name: "Metro Hari Ini",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "16:30",
    periods: [
      {
        id: "d1-05",
        month: "2025-05",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.3,
          actualShare: 2.8,
        },
        performanceDigital: { views: 8500000, revenue: 12000000 },
        financials: {
          costDirect: 580000000,
          revenueTarget: 1500000000,
          revenueActual: 1050000000,
          pnl: 482000000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Normal",
      },
      {
        id: "d1-06",
        month: "2025-06",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.35,
          actualShare: 3.0,
        },
        performanceDigital: { views: 8900000, revenue: 13500000 },
        financials: {
          costDirect: 590000000,
          revenueTarget: 1500000000,
          revenueActual: 1100000000,
          pnl: 523500000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Normal",
      },
      {
        id: "d1-07",
        month: "2025-07",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.42,
          actualShare: 3.6,
        },
        performanceDigital: { views: 9200000, revenue: 14000000 },
        financials: {
          costDirect: 600000000,
          revenueTarget: 1500000000,
          revenueActual: 1550000000,
          pnl: 964000000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Overachieve",
      },
      {
        id: "d1-08",
        month: "2025-08",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.5,
          actualShare: 4.1,
        },
        performanceDigital: { views: 10500000, revenue: 16500000 },
        financials: {
          costDirect: 610000000,
          revenueTarget: 1500000000,
          revenueActual: 1800000000,
          pnl: 1206500000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Overachieve",
      },
      {
        id: "d1-09",
        month: "2025-09",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.38,
          actualShare: 3.2,
        },
        performanceDigital: { views: 9800000, revenue: 15000000 },
        financials: {
          costDirect: 595000000,
          revenueTarget: 1500000000,
          revenueActual: 1400000000,
          pnl: 820000000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Normal",
      },
      {
        id: "d1-10",
        month: "2025-10",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.25,
          actualShare: 2.1,
        },
        performanceDigital: { views: 7500000, revenue: 11000000 },
        financials: {
          costDirect: 605000000,
          revenueTarget: 1500000000,
          revenueActual: 900000000,
          pnl: 306000000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Underperform",
      },
      {
        id: "d1-11",
        month: "2025-11",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.2,
          actualShare: 1.8,
        },
        performanceDigital: { views: 7000000, revenue: 10000000 },
        financials: {
          costDirect: 600000000,
          revenueTarget: 1500000000,
          revenueActual: 850000000,
          pnl: 260000000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Underperform",
      },
      {
        id: "d1-12",
        month: "2025-12",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.45,
          actualShare: 3.8,
        },
        performanceDigital: { views: 11000000, revenue: 18000000 },
        financials: {
          costDirect: 620000000,
          revenueTarget: 1500000000,
          revenueActual: 1700000000,
          pnl: 1098000000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Overachieve",
      },
      {
        id: "d1-01",
        month: "2026-01",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.35,
          actualShare: 3.1,
        },
        performanceDigital: { views: 9500000, revenue: 14500000 },
        financials: {
          costDirect: 600000000,
          revenueTarget: 1500000000,
          revenueActual: 1300000000,
          pnl: 714500000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Normal",
      },
      {
        id: "d1-02",
        month: "2026-02",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.28,
          actualShare: 2.6,
        },
        performanceDigital: { views: 8800000, revenue: 13000000 },
        financials: {
          costDirect: 590000000,
          revenueTarget: 1500000000,
          revenueActual: 1150000000,
          pnl: 573000000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Normal",
      },
      {
        id: "d1-03",
        month: "2026-03",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.22,
          actualShare: 2.2,
        },
        performanceDigital: { views: 9000000, revenue: 13500000 },
        financials: {
          costDirect: 600000000,
          revenueTarget: 1500000000,
          revenueActual: 1050000000,
          pnl: 463500000,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Underperform",
      },
      {
        id: "d1-04",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 3.5,
          actualTVR: 0.2,
          actualShare: 2.5,
        },
        performanceDigital: { views: 9950769, revenue: 15845743 },
        financials: {
          costDirect: 601782000,
          revenueTarget: 1500000000,
          revenueActual: 1192740727,
          pnl: 606804470,
        },
        inventory: { spot: 20, adRate: 5000000 },
        status: "Sesuai Target",
      },
    ],
  },
  {
    id: "p2",
    name: "Prime Time News",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "18:00",
    periods: [
      {
        id: "d2",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.4,
          actualShare: 2.7,
        },
        performanceDigital: {
          views: 19036999,
          revenue: 53393177,
        },
        financials: {
          costDirect: 205821000,
          revenueTarget: 4000000000,
          revenueActual: 4809003824,
          pnl: 4656576001,
        },
        inventory: {
          spot: 25,
          adRate: 8000000,
        },
        status: "Overachieve",
      },
    ],
  },
  {
    id: "p3",
    name: "Top News",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "19:30",
    periods: [
      {
        id: "d3",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.7,
          targetShare: 3.5,
          actualTVR: 0.4,
          actualShare: 2.1,
        },
        performanceDigital: {
          views: 4009890,
          revenue: 9017274,
        },
        financials: {
          costDirect: 695978400,
          revenueTarget: 1907200000,
          revenueActual: 1545077476,
          pnl: 858116350,
        },
        inventory: {
          spot: 20,
          adRate: 6500000,
        },
        status: "Stabil",
      },
    ],
  },
  {
    id: "p4",
    name: "Realitas",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "20:30",
    periods: [
      {
        id: "d4",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.1,
          actualShare: 0.9,
        },
        performanceDigital: {
          views: 380704,
          revenue: 1977828,
        },
        financials: {
          costDirect: 129996701,
          revenueTarget: 70000000,
          revenueActual: 40789038,
          pnl: -87229835,
        },
        inventory: {
          spot: 15,
          adRate: 4000000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p5",
    name: "Metro This Week",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "15:00",
    periods: [
      {
        id: "d5",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.4,
          actualShare: 2.0,
        },
        performanceDigital: {
          views: 651353,
          revenue: 1490159,
        },
        financials: {
          costDirect: 129996701,
          revenueTarget: 100000000,
          revenueActual: 89928436,
          pnl: -38578106,
        },
        inventory: {
          spot: 15,
          adRate: 3500000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p6",
    name: "Hot Room",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "21:30",
    periods: [
      {
        id: "d6",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.2,
          actualShare: 1.7,
        },
        performanceDigital: {
          views: 3248884,
          revenue: 11209535,
        },
        financials: {
          costDirect: 356064000,
          revenueTarget: 480000000,
          revenueActual: 311374572,
          pnl: -33479893,
        },
        inventory: {
          spot: 18,
          adRate: 5000000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p7",
    name: "Kontroversi",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "22:30",
    periods: [
      {
        id: "d7",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.5,
          actualShare: 3.1,
        },
        performanceDigital: {
          views: 6053172,
          revenue: 4997677,
        },
        financials: {
          costDirect: 142308000,
          revenueTarget: 160000000,
          revenueActual: 72277307,
          pnl: -65033016,
        },
        inventory: {
          spot: 15,
          adRate: 4000000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p8",
    name: "Q & A",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "19:00",
    periods: [
      {
        id: "d8",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.2,
          actualShare: 1.6,
        },
        performanceDigital: {
          views: 2298020,
          revenue: 6426061,
        },
        financials: {
          costDirect: 146879308,
          revenueTarget: 160000000,
          revenueActual: 61854943,
          pnl: -78598304,
        },
        inventory: {
          spot: 15,
          adRate: 4500000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p9",
    name: "Kick Andy",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "21:05",
    periods: [
      {
        id: "d9",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.5,
          actualShare: 3.0,
        },
        performanceDigital: {
          views: 964842,
          revenue: 8089914,
        },
        financials: {
          costDirect: 150000000,
          revenueTarget: 250000000,
          revenueActual: 200000000,
          pnl: 58089914,
        },
        inventory: {
          spot: 25,
          adRate: 8000000,
        },
        status: "Stabil",
      },
    ],
  },
  {
    id: "p10",
    name: "JJN",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "10:00",
    periods: [
      {
        id: "d10",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.1,
          actualShare: 0.6,
        },
        performanceDigital: {
          views: 12302,
          revenue: 29665,
        },
        financials: {
          costDirect: 63953400,
          revenueTarget: 150000000,
          revenueActual: 316978115,
          pnl: 253054380,
        },
        inventory: {
          spot: 10,
          adRate: 3000000,
        },
        status: "Overachieve",
      },
    ],
  },
  {
    id: "p11",
    name: "Meet Nite Live",
    category: "A",
    descriptionCategory: "16.05-22.05 dan Rerun/Cane Program",
    broadcastTime: "23:00",
    periods: [
      {
        id: "d11",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.6,
          targetShare: 3.5,
          actualTVR: 0.3,
          actualShare: 2.5,
        },
        performanceDigital: {
          views: 1823233,
          revenue: 9272440,
        },
        financials: {
          costDirect: 267964800,
          revenueTarget: 300000000,
          revenueActual: 280000000,
          pnl: 21307640,
        },
        inventory: {
          spot: 15,
          adRate: 5000000,
        },
        status: "Stabil",
      },
    ],
  },
  {
    id: "p12",
    name: "Editorial Media Indonesia",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "08:00",
    periods: [
      {
        id: "d12",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.3,
          targetShare: 3.5,
          actualTVR: 0.1,
          actualShare: 2.0,
        },
        performanceDigital: {
          views: 91145,
          revenue: 401224,
        },
        financials: {
          costDirect: 130000000,
          revenueTarget: 200000000,
          revenueActual: 233596128,
          pnl: 103997352,
        },
        inventory: {
          spot: 12,
          adRate: 3500000,
        },
        status: "Overachieve",
      },
    ],
  },
  {
    id: "p13",
    name: "Metro Sports",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "23:30",
    periods: [
      {
        id: "d13",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.2,
          targetShare: 3.5,
          actualTVR: 0.1,
          actualShare: 1.9,
        },
        performanceDigital: {
          views: 151567,
          revenue: 297088,
        },
        financials: {
          costDirect: 196886400,
          revenueTarget: 450000000,
          revenueActual: 82273824,
          pnl: -114315488,
        },
        inventory: {
          spot: 15,
          adRate: 4000000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p14",
    name: "Selamat Pagi Indonesia",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "07:30",
    periods: [
      {
        id: "d14",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.3,
          targetShare: 3.5,
          actualTVR: 0.1,
          actualShare: 1.9,
        },
        performanceDigital: {
          views: 2901473,
          revenue: 6989246,
        },
        financials: {
          costDirect: 607945200,
          revenueTarget: 1300000000,
          revenueActual: 1419181268,
          pnl: 818225314,
        },
        inventory: {
          spot: 20,
          adRate: 5500000,
        },
        status: "Overachieve",
      },
    ],
  },
  {
    id: "p15",
    name: "Zona Bisnis",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "09:30",
    periods: [
      {
        id: "d15",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.3,
          targetShare: 3.5,
          actualTVR: 0.1,
          actualShare: 2.1,
        },
        performanceDigital: {
          views: 1029947,
          revenue: 2242178,
        },
        financials: {
          costDirect: 255702000,
          revenueTarget: 350000000,
          revenueActual: 251938261,
          pnl: -1521561,
        },
        inventory: {
          spot: 15,
          adRate: 4000000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p16",
    name: "Metro Siang",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "11:00",
    periods: [
      {
        id: "d16",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.3,
          targetShare: 3.5,
          actualTVR: 0.2,
          actualShare: 2.1,
        },
        performanceDigital: {
          views: 4583488,
          revenue: 11175919,
        },
        financials: {
          costDirect: 714126000,
          revenueTarget: 1500000000,
          revenueActual: 1038163827,
          pnl: 335213746,
        },
        inventory: {
          spot: 25,
          adRate: 6000000,
        },
        status: "Stabil",
      },
    ],
  },
  {
    id: "p17",
    name: "Pr!oritas Indonesia",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "13:30",
    periods: [
      {
        id: "d17",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.3,
          targetShare: 3.5,
          actualTVR: 0.2,
          actualShare: 2.4,
        },
        performanceDigital: {
          views: 400214,
          revenue: 961628,
        },
        financials: {
          costDirect: 229514400,
          revenueTarget: 500000000,
          revenueActual: 321156719,
          pnl: 92603947,
        },
        inventory: {
          spot: 15,
          adRate: 4000000,
        },
        status: "Sesuai Target",
      },
    ],
  },
  {
    id: "p18",
    name: "Newsline",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "14:00",
    periods: [
      {
        id: "d18",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.3,
          targetShare: 3.5,
          actualTVR: 0.1,
          actualShare: 2.1,
        },
        performanceDigital: {
          views: 3396079,
          revenue: 6661443,
        },
        financials: {
          costDirect: 665460000,
          revenueTarget: 1700000000,
          revenueActual: 1908494435,
          pnl: 1249695878,
        },
        inventory: {
          spot: 20,
          adRate: 5500000,
        },
        status: "Overachieve",
      },
    ],
  },
  {
    id: "p19",
    name: "Metro Xin-Wen",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "08:30",
    periods: [
      {
        id: "d19",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.3,
          targetShare: 2.0,
          actualTVR: 0.1,
          actualShare: 1.3,
        },
        performanceDigital: {
          views: 260263,
          revenue: 422181,
        },
        financials: {
          costDirect: 205821000,
          revenueTarget: 400000000,
          revenueActual: 131409636,
          pnl: -73989183,
        },
        inventory: {
          spot: 10,
          adRate: 3000000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p20",
    name: "Journey",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "15:30",
    periods: [
      {
        id: "d20",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.3,
          targetShare: 2.7,
          actualTVR: 0.1,
          actualShare: 1.8,
        },
        performanceDigital: {
          views: 38192,
          revenue: 131517,
        },
        financials: {
          costDirect: 100000000,
          revenueTarget: 150000000,
          revenueActual: 100000000,
          pnl: 131517,
        },
        inventory: {
          spot: 10,
          adRate: 3500000,
        },
        status: "Stabil",
      },
    ],
  },
  {
    id: "p21",
    name: "Sh*wbizz",
    category: "B",
    descriptionCategory: "07.05-16.05 & 22.05-24.05",
    broadcastTime: "09:00",
    periods: [
      {
        id: "d21",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.2,
          targetShare: 2.7,
          actualTVR: 0.1,
          actualShare: 1.9,
        },
        performanceDigital: {
          views: 50166,
          revenue: 95287,
        },
        financials: {
          costDirect: 93526500,
          revenueTarget: 200000000,
          revenueActual: 12919698,
          pnl: -80511515,
        },
        inventory: {
          spot: 10,
          adRate: 3000000,
        },
        status: "Rugi",
      },
    ],
  },
  {
    id: "p22",
    name: "Metro Pagi Primetime",
    category: "C",
    descriptionCategory: "00.05-07.05",
    broadcastTime: "05:00",
    periods: [
      {
        id: "d22",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.1,
          targetShare: 3.5,
          actualTVR: 0.2,
          actualShare: 5.1,
        },
        performanceDigital: {
          views: 2855493,
          revenue: 4766562,
        },
        financials: {
          costDirect: 605767800,
          revenueTarget: 1000000000,
          revenueActual: 1011419639,
          pnl: 410418401,
        },
        inventory: {
          spot: 18,
          adRate: 4000000,
        },
        status: "Overachieve",
      },
    ],
  },
  {
    id: "p23",
    name: "Breaking News",
    category: "Signature",
    descriptionCategory: "Special / Breaking News",
    broadcastTime: "12:00",
    periods: [
      {
        id: "d23",
        month: "2026-04",
        performanceTV: {
          targetTVR: 3.5,
          targetShare: 3.0,
          actualTVR: 3.0,
          actualShare: 2.5,
        },
        performanceDigital: {
          views: 6801756,
          revenue: 21806442,
        },
        financials: {
          costDirect: 361672138,
          revenueTarget: 750000000,
          revenueActual: 500000000,
          pnl: 160134304,
        },
        inventory: {
          spot: 20,
          adRate: 15000000,
        },
        status: "Sesuai Target",
      },
    ],
  },
  {
    id: "p24",
    name: "Go Healthy",
    category: "Blocking Reguler",
    descriptionCategory: "Sponsored Content",
    broadcastTime: "10:30",
    periods: [
      {
        id: "d24",
        month: "2026-04",
        performanceTV: {
          targetTVR: 2.0,
          targetShare: 1.2,
          actualTVR: 1.5,
          actualShare: 1.0,
        },
        performanceDigital: {
          views: 28102,
          revenue: 557031,
        },
        financials: {
          costDirect: 470865506,
          revenueTarget: 3207800000,
          revenueActual: 3207800002,
          pnl: 2737491527,
        },
        inventory: {
          spot: 5,
          adRate: 20000000,
        },
        status: "Overachieve",
      },
    ],
  },
  {
    id: "p25",
    name: "Rumah Parlemen",
    category: "Blocking Reguler",
    descriptionCategory: "Sponsored Content",
    broadcastTime: "13:00",
    periods: [
      {
        id: "d25",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.4,
          targetShare: 2.1,
          actualTVR: 0.3,
          actualShare: 1.5,
        },
        performanceDigital: {
          views: 6394,
          revenue: 29097,
        },
        financials: {
          costDirect: 200000000,
          revenueTarget: 599000000,
          revenueActual: 699710000,
          pnl: 499739097,
        },
        inventory: {
          spot: 5,
          adRate: 10000000,
        },
        status: "Overachieve",
      },
    ],
  },
  {
    id: "p26",
    name: "Info Plus",
    category: "Blocking Reguler",
    descriptionCategory: "Sponsored Content",
    broadcastTime: "14:30",
    periods: [
      {
        id: "d26",
        month: "2026-04",
        performanceTV: {
          targetTVR: 0.1,
          targetShare: 0.7,
          actualTVR: 0.1,
          actualShare: 0.8,
        },
        performanceDigital: {
          views: 8112,
          revenue: 44203,
        },
        financials: {
          costDirect: 20427600,
          revenueTarget: 136000000,
          revenueActual: 136531531,
          pnl: 116148134,
        },
        inventory: {
          spot: 5,
          adRate: 8000000,
        },
        status: "Sesuai Target",
      },
    ],
  },
  {
    id: "p27",
    name: "National Government Awards",
    category: "Others",
    descriptionCategory: "Event / Awards",
    broadcastTime: "20:00",
    periods: [
      {
        id: "d27",
        month: "2026-04",
        performanceTV: {
          targetTVR: 1.0,
          targetShare: 2.0,
          actualTVR: 1.2,
          actualShare: 2.5,
        },
        performanceDigital: {
          views: 19070,
          revenue: 60513,
        },
        financials: {
          costDirect: 648178998,
          revenueTarget: 3700000000,
          revenueActual: 3746268436,
          pnl: 3098149951,
        },
        inventory: {
          spot: 40,
          adRate: 12000000,
        },
        status: "Overachieve",
      },
    ],
  },
];
