// Import hook memo dan state dari react
import {
  // Hook buat optimalisasi hitungan biar ga hitung ulang
  useMemo,
  // Hook buat kelola state lokal komponen
  useState,
} from "react";
// Import data mock program buat dashboard
import { MOCK_PROGRAMS } from "@/constants/programMockData";
// Import tipe data chart
import { ChartData } from "chart.js";
// Import fungsi format angka biar rapi
import { formatBigNumber } from "@/lib/formatters";
// Import helper fungsi buat olah data chart
import {
  // Fungsi buat hitung total nilai dari array periode
  sumPeriodValue,
  // Fungsi buat ngurutin dan motong array program sesuai nilai kalkulasi
  sortAndSlicePrograms,
  // Fungsi buat ngerakit dataset bar chart standar
  createBarDataset,
  // Fungsi buat bikin data chart bar satu dataset otomatis biar ga ribet
  generateBarChartData,
  // Fungsi buat bikin data chart bar dua dataset otomatis biar ga ribet
  generateDoubleBarChartData,
  // Fungsi buat bikin data chart doughnut satu dataset otomatis biar ga ribet
  generateDoughnutChartData,
  generateMultiMetricDoughnutData,
} from "@/lib/chartHelpers";

// Fungsi komponen custom hook buat logic dashboard
export default function useDashboard() {
  // Wadah buat ngeset kategori apa yang lagi dipilih ama user
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Wadah buat nyimpen periode waktu pake pancingan awal all
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>("all");

  // Wadah buat nandain id program mana yang lagi diklik
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  // Wadah boolean buat ngatur buka tutupnya modal detail program
  const [isProgramDetailOpen, setIsProgramDetailOpen] =
    useState<boolean>(false);

  // Wadah buat nyimpen bulan awal pas milih custom tanggal
  const [startMonth, setStartMonth] = useState<string>("");
  // Wadah buat nyimpen bulan akhir pas milih custom tanggal
  const [endMonth, setEndMonth] = useState<string>("");

  // Wadah penanda modal detail chart lagi nongol apa kaga
  const [isChartDetailOpen, setIsChartDetailOpen] = useState<boolean>(false);

  // Wadah buat nyimpen jenis chart pake pancingan awal pnl
  const [chartDetailType, setChartDetailType] = useState<string>("pnl");

  // Wadah teks buat tiban judul modal detail biar dinamis
  const [chartDetailTitle, setChartDetailTitle] = useState<string>("");

  // Wadah buat ngumpulin semua pilihan opsi periode yang ada
  const periodOptions = [
    // Objek pilihan data buat jangka waktu all time
    {
      // Label teks buat nampilin tulisan all time di menu dropdown
      label: "All Time",
      // Nilai string buat penanda saringan semua waktu data
      value: "all",
    },
    // Objek pilihan data buat jangka waktu year to date tahun berjalan
    {
      // Label teks buat nampilin tulisan ytd di menu dropdown
      label: "YTD",
      // Nilai penanda buat saringan waktu mulai awal tahun ini
      value: "ytd",
    },
    // Objek pilihan data buat jangka waktu month to date bulan berjalan
    {
      // Label teks buat nampilin tulisan mtd di menu dropdown
      label: "MTD",
      // Nilai penanda buat saringan waktu di bulan berjalan sekarang
      value: "mtd",
    },
    // Objek pilihan data buat rentang waktu kustom bebas pilih sendiri
    {
      // Label teks buat nampilin tulisan custom di menu dropdown
      label: "Custom",
      // Nilai penanda buat aktifin input rentang tanggal kustom manual
      value: "custom",
    },
  ];

  // Set tanggal paling baru dasar mock data
  const lastUpdated = useMemo(() => {
    // Buat wadah tanggal paling jadul (1 Jan 1970) buat pancingan nilai awal bandingan
    let latest = new Date(0);

    // Cek semua data program satu2 di dalem array
    MOCK_PROGRAMS.forEach((p) => {
      // Kondisi cek kalo properti updatedAt ada di dalem objek program p
      if (p.updatedAt) {
        // Buat wadah baru buat ubah string updatedAt jadi tipe Date
        const d = new Date(String(p.updatedAt));

        // Kondisi cek kalo variabel d nilainya lebih baru ketimbang latest
        if (d > latest)
          // Tiban wadah latest pake objek tanggal d yang lebih baru
          latest = d;
      }

      // Cek semua data periode kalo properti periods emang ada
      p.periods?.forEach((per) => {
        // Bongkar string teks periode terus pisah jadi angka tahun sama bulan pake tanda strip
        const [year, month] = per.month.split("-").map(Number);

        // Buat wadah baru tanggal periode (bulan dikurang 1 soalnya indeks bulan JavaScript mulainya dari angka 0)
        const d = new Date(year, month - 1);

        // Kondisi cek kalo objek tanggal d dari periode lebih baru dari latest
        if (d > latest)
          // Tiban wadah latest pake tanggal periode ini
          latest = d;
      });
    });
    // Kondisional penentu nilai balikan teks berdasarkan isi waktu wadah latest
    return latest.getTime() === 0
      ? "-"
      : latest.toLocaleDateString("id-ID", {
          // Format buat nampilin angka hari
          day: "numeric",
          // Format buat nampilin nama bulan lengkap
          month: "long",
          // Format buat nampilin angka tahun lengkap
          year: "numeric",
        });
  }, []);

  // Wadah buat ngumpulin semua pilihan kategori yang ada
  const programCategories = useMemo(() => {
    // Jalankan reduce buat filter nama kategori dari objek program
    return MOCK_PROGRAMS.reduce((acc, curr) => {
      // Kondisi cek buat mastiin nama kategori belum masuk ke wadah penampung acc
      if (!acc.includes(curr.category))
        // Masukin nama kategori ke wadah array kalo emang belum ada
        acc.push(curr.category);
      // Balikin wadah array biar bisa lanjut dibongkar di putaran berikutnya
      return acc;
    }, [] as string[]);
  }, []);

  // Bongkar data secara dinamis berdasarkan kategori ama periode yang lagi dipilih
  const filteredPrograms = useMemo(() => {
    // Wadah sementara buat nyalin semua data mentah program
    let result = [...MOCK_PROGRAMS];

    // Kondisional cek kalo periode custom dipilih buat filter tanggal secara manual
    if (selectedPeriod === "custom") {
      // Kondisi filter data pas input bulan awal ada isinya
      if (startMonth)
        // Bongkar isi periods terus filter data yang masuk range bulan itu
        result = result.filter((p) =>
          p.periods.some((per) => per.month >= startMonth),
        );
      // Kondisi filter data pas input bulan akhir ada isinya
      if (endMonth)
        // Filter lagi data biar ga kelewat batas bulannya
        result = result.filter((p) =>
          p.periods.some((per) => per.month <= endMonth),
        );
      // Kondisi cabang lain kalo periode diisi selain kata all
    } else if (selectedPeriod && selectedPeriod !== "all") {
      // Wadah pancingan buat ngambil info tanggal hari ini
      const today = new Date();
      // Wadah buat nyimpen angka tahun yang sekarang lagi jalan
      const currentYear = today.getFullYear();
      // Wadah teks format tahun bulan buat tanda bulan sekarang
      const currentMonthStr = `${currentYear}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      // Wadah teks penanda bulan pertama di tahun berjalan
      const firstMonthOfYear = `${currentYear}-01`;

      // Wadah pancingan kosong buat nyimpen batas bawah bulan filteran
      let minMonth = "";
      // Kondisional percabangan buat nentuin isi dari variabel minMonth
      if (selectedPeriod === "ytd")
        // Kalo periodenya ytd berarti batas bawahnya di-set ke januari tahun ini
        minMonth = firstMonthOfYear;
      else if (selectedPeriod === "mtd")
        // Kalo periodenya mtd berarti batas bawahnya langsung tiban pake bulan sekarang
        minMonth = currentMonthStr;

      // Bongkar isi periods terus filter data yang masuk dalem range waktu tadi
      result = result.filter((p) =>
        p.periods.some(
          (per) => per.month >= minMonth && per.month <= currentMonthStr,
        ),
      );
    }

    // Kondisional filter kategori pas variabel selectedCategory ga kosong
    if (!selectedCategory)
      // Kalo kategori kosong kasih semua data
      return result;
    // Filter array berdasar kategori
    return result.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, startMonth, endMonth, selectedPeriod]);

  // Cari rentang waktu dari data filter buat label dashboard
  const displayedPeriodLabel = useMemo(() => {
    // Kondisional cek buat mastiin data hasil filter ga kosong
    if (filteredPrograms.length === 0)
      // Kalo data kosong tampilkan teks data kosong
      return "Data Kosong";
    // Wadah batas bawah
    let min = "9999-99";
    // Wadah batas atas
    let max = "0000-00";

    // Loop buat cari batas range bulan
    filteredPrograms.forEach((p) => {
      // Loop tiap periode
      p.periods.forEach((per) => {
        // Kondisi bandingkan bulan buat cari nilai terkecil min
        if (per.month < min)
          // Set nilai min baru
          min = per.month;
        // Kondisi bandingkan bulan buat cari nilai terbesar max
        if (per.month > max)
          // Set nilai max baru
          max = per.month;
      });
    });

    // Kondisional return format label rentang waktu penentu string tunggal atau jarak range waktu
    return min === max ? min : `${min} s/d ${max}`;
  }, [filteredPrograms]);

  // Hitung nilai kpi buat isi card dashboard
  const totalKPI = useMemo(() => {
    // Pakai reduce buat kumpul total data revenue sama cost pnl
    const totals = filteredPrograms.reduce(
      (acc, curr) => {
        // Tambah revenue
        acc.revenue += sumPeriodValue(
          curr,
          (per) =>
            per.financials.revenueActual +
            (per.performanceDigital.revenue || 0),
        );
        // Tambah cost
        acc.cost += sumPeriodValue(curr, (per) => per.financials.costDirect);
        // Tambah pnl
        acc.pnl += sumPeriodValue(curr, (per) => per.financials.pnl);
        // Balikin akumulator
        return acc;
      },
      // Inisialisasi awal nol
      { revenue: 0, cost: 0, pnl: 0 },
    );

    // Cegah error pas bagi angka biar hasil aman pas penyebut nol
    const safeDiv = (num: number, denom: number) =>
      // Kondisional pengaman pembagian matematika biar ga error pas nol
      denom !== 0 ? num / denom : 0;
    // Format persen biar rapi
    const formatPct = (val: number) =>
      // Ubah angka desimal jadi persen string ganti tanda titik ke koma
      val.toFixed(0).replace(".", ",");
    // Hitung persen profit bersih dari revenue
    const profitMarginPct = safeDiv(totals.pnl, totals.revenue) * 100;

    // Cari program sumbang pnl paling gede
    const topContributor =
      // Kondisional cek buat jalanin sortir program pas datanya tersedia
      filteredPrograms.length > 0
        ? sortAndSlicePrograms(
            filteredPrograms,
            (per) => per.financials.pnl,
            true,
            1,
          )[0]
        : null;

    // Susun objek data kpi
    return {
      // Masukin objek totals
      totals,
      // Array berisi data2 card statistik dashboard
      cards: [
        // Objek data buat card revenue
        {
          // Properti judul card
          title: "Total Revenue",
          // Nilai uang terformat
          value: `Rp ${formatBigNumber(totals.revenue)}`,
          // Status boolean tanda positif
          isPositive: totals.revenue > 0,
          // Keterangan label tren
          label: "Pendapatan",
        },
        // Objek data buat card net profit
        {
          // Properti judul card profit margin
          title: "Net Profit",
          // Nilai profit terformat
          value: `Rp ${formatBigNumber(totals.pnl)}`,
          // Status tanda positif atau negatif
          isPositive: totals.pnl >= 0,
          // Label keterangan kondisional profit atau rugi bersih
          label: totals.pnl >= 0 ? "Profit Bersih" : "Rugi Bersih",
        },
        // Objek data buat card profit margin persen
        {
          // Properti judul card margin persen
          title: "Profit Margin",
          // Nilai persen terformat string
          value: `${formatPct(profitMarginPct)}%`,
          // Status tanda positif margin
          isPositive: profitMarginPct >= 0,
          // Label keterangan kondisional margin sehat atau negatif
          label: profitMarginPct >= 0 ? "Margin Sehat" : "Margin Negatif",
        },
        // Objek data buat card program penyumbang terbesar
        {
          // Properti judul card nama program contributor teratas
          title: "Top Contributor Program",
          // Nilai nama program kondisional teks
          value: topContributor?.name || "-",
          // Status boolean penentu warna positif dari pnl contributor
          isPositive: topContributor
            ? sumPeriodValue(topContributor, (per) => per.financials.pnl) >= 0
            : false,
          // Label nilai kontribusi rupiah dari program contributor teratas
          label: topContributor
            ? `Rp ${formatBigNumber(sumPeriodValue(topContributor, (per) => per.financials.pnl))}`
            : "-",
        },
      ],
    };
  }, [filteredPrograms]);

  // Set id program aktif dasar filter kategori
  const activeProgramId = useMemo(() => {
    // Kondisional pengecekan buat mastiin id program yang dipilih ada di dalem data terfilter
    if (
      selectedProgramId &&
      filteredPrograms.some((p) => p.id === selectedProgramId)
    ) {
      // Balik id program kalo program ada di dalem data saring
      return selectedProgramId;
    }
    // Balik id program awal kalo data filter ada isi
    return filteredPrograms.length > 0 ? filteredPrograms[0].id : "";
  }, [filteredPrograms, selectedProgramId]);

  // Susun data pnl gabung semua program
  const allProgramData = useMemo<ChartData<"bar">>(() => {
    // Gabung nilai pnl dasar grup kategori
    const grouped = MOCK_PROGRAMS.reduce(
      (acc, curr) => {
        // Kondisi cek kalo kategori produk belum ada di objek akumulator
        if (!acc[curr.category])
          // Kalo kategori belum ada bikin dulu isi nilai nol
          acc[curr.category] = 0;
        // Tambah pnl
        acc[curr.category] += sumPeriodValue(curr, (per) => per.financials.pnl);
        // Balik wadah array buat putar looping berikut
        return acc;
      },
      {} as Record<string, number>,
    );

    // List label
    const labels = Object.keys(grouped);
    // List data
    const data = Object.values(grouped);

    // Bikin beda warna latar pas kategori kena klik
    const bgColors = labels.map((label, index) => {
      // Palet warna array string kode heksadesimal
      const colors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
      ];
      // Ambil indeks warna sisa bagi panjang array
      const baseColor = colors[index % colors.length];
      // Kondisional penentu opacity warna pas ada item kategori yang lagi diklik aktif
      return !selectedCategory || label === selectedCategory
        ? baseColor
        : baseColor + "26";
    });

    // Balik struktur data bar
    return {
      // Properti daftar label kategori chart
      labels,
      // Array data list kumpulan dataset bar chart
      datasets: [
        // Buat objek dataset bar chart pnl kategori
        createBarDataset("Total PNL (Rp)", data, bgColors),
      ],
    };
  }, [selectedCategory]);

  // Susun data detail program bentuk donat
  const detailProgramData = useMemo<ChartData<"doughnut">>(() => {
    // Ambil data program pas id cocok
    const prog =
      MOCK_PROGRAMS.find((p) => p.id === activeProgramId) || MOCK_PROGRAMS[0];
    // Kondisional guard clause buat mastiin objek data program p emang beneran ketemu
    if (!prog)
      // Kalo program gada balikin objek kosong
      return { labels: [], datasets: [] };

    // Panggil helper multi metrik donat
    return generateMultiMetricDoughnutData(
      // Masukin data sumber programnya
      prog,
      // Array konfigurasi list metrik apa aja yang mau ditampilin
      [
        // Konfigurasi potongan donat pertama buat revenue capaian
        {
          // Nama label potongan
          label: "Capaian Revenue",
          // Fungsi penarik nilai kalkulasi total pendapatan tv ama digital
          getter: (data) =>
            sumPeriodValue(
              data,
              (per) =>
                per.financials.revenueActual +
                (per.performanceDigital.revenue || 0),
            ),
          // Kode warna biru
          color: "#1f77b4",
        },
        // Konfigurasi potongan donat kedua buat cost direct
        {
          // Nama label potongan
          label: "Cost Direct",
          // Fungsi penarik nilai pengeluaran modal
          getter: (data) =>
            sumPeriodValue(data, (per) => per.financials.costDirect),
          // Kode warna oren
          color: "#ff7f0e",
        },
        // Konfigurasi potongan donat ketiga buat target revenue
        {
          // Nama label potongan
          label: "Target Revenue",
          // Fungsi penarik nilai target omset
          getter: (data) =>
            sumPeriodValue(data, (per) => per.financials.revenueTarget),
          // Kode warna toska
          color: "#4bc0c0",
        },
      ],
    );
    // Array dependensi mantau perubahan id program aktif
  }, [activeProgramId]);

  // generateDoughnutChartData
  const topProgramsDoughnutData = useMemo(() => {
    // Panggil fungsi buat bikin doughnut chart dari list data program disaring
    return generateDoughnutChartData(
      // Masukin data list program saringan
      filteredPrograms,
      // Callback buat ngambil metrik pnl per periode
      (per) => per.financials.pnl,
      // Judul label buat dataset donat
      "Kontribusi PNL Program",
      // Array pilihan warna buat potongan donat dashboard
      undefined,
      // Urutan dibikin dari yang paling gede ke kecil
      true,
      // Ambil maksimal data program
      filteredPrograms.length,
    );
  }, [filteredPrograms]);

  // Susun data top pnl via fungsi dry
  const topPnlData = useMemo<ChartData<"bar">>(() => {
    // Panggil helper generateBarChartData buat ngerakit data bar chart top pnl teratas
    return generateBarChartData(
      // Masukin array data program saringan
      filteredPrograms,
      // Ambil field pnl keuangan program
      (per) => per.financials.pnl,
      // String teks nama label dataset chart
      "Positif (Rp)",
      // Kode warna heksadesimal hijau buat tanda untung
      "#2ca02c",
      // Urutan dibikin dari yang tertinggi ke terendah
      true,
    );
  }, [filteredPrograms]);

  // Susun data bottom pnl pakai custom dataset pisah
  const bottomPnlData = useMemo<ChartData<"bar">>(() => {
    // Urut data program dari nilai minus ke atas
    const sorted = sortAndSlicePrograms(
      filteredPrograms,
      (per) => per.financials.pnl,
      false,
    );
    // Balik struktur data chart
    return {
      // Urai nama program terurut jadi array label x axis chart
      labels: sorted.map((p) => p.name),
      // Array penampung kumpulan dataset grafik bar chart
      datasets: [
        // Dataset minus dengan warna merah tanda rugi keuangan
        createBarDataset(
          "Minus (Rp)",
          sorted.map((p) => {
            const pnl = sumPeriodValue(p, (per) => per.financials.pnl);
            // Kondisional operator penentu apakah pnl di bawah nol atau tidak
            return pnl < 0 ? pnl : null;
          }),
          "#ff0000",
          5,
        ),
        // Dataset terendah dengan warna biru tanda pnl tipis tapi ga minus
        createBarDataset(
          "Terendah (Rp)",
          sorted.map((p) => {
            const pnl = sumPeriodValue(p, (per) => per.financials.pnl);
            // Kondisional operator penentu apakah pnl di atas atau sama dengan nol atau tidak
            return pnl >= 0 ? pnl : null;
          }),
          "#1f77b4",
          5,
        ),
      ],
    };
  }, [filteredPrograms]);

  // Susun data top digital dua baris via fungsi dry
  const topRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    // Panggil helper rakit data chart multi bar dua baris untuk data digital
    return generateDoubleBarChartData(
      // Masukin array data program terfilter
      filteredPrograms,
      // Kolom kunci sorting berdasar besaran revenue sosmed digital
      (per) => per.performanceDigital.revenue,
      // Array konfigurasi list objek penarik data tiap baris grafik batang
      [
        // Objek konfigurasi baris data pertama buat pendapatan digital
        {
          // Callback penarik properti uang revenue digital sosmed
          getter: (per) => per.performanceDigital.revenue,
          // Label teks info tooltip buat baris pertama pendapatan
          label: "Revenue (Rp)",
          // Warna heksadesimal biru tua buat bar pendapatan
          color: "#1f77b4",
        },
        // Objek membuka baris data kedua buat jumlah tontonan sosmed views
        {
          // Callback penarik properti total tontonan digital views
          getter: (per) => per.performanceDigital.views,
          // Label teks keterangan info unit tontonan grafik
          label: "Views",
          // Warna heksadesimal cyan muda buat bar penonton
          color: "#17becf",
        },
      ],
      // Diurutkan dari nilai yang paling tinggi ke bawah
      true,
    );
  }, [filteredPrograms]);

  // Susun data bottom digital dua baris via fungsi dry
  const bottomRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    // Panggil helper rakit data chart bar dobel bawah digital
    return generateDoubleBarChartData(
      // Masukin data list program terfilter
      filteredPrograms,
      // Kolom kunci penarik data sort revenue digital
      (per) => per.performanceDigital.revenue,
      // Array konfigurasi berisi objek2 dataset bar digital terendah
      [
        // Objek konfigurasi bar pendapatan digital bawah
        {
          // Penarik nilai properti uang pendapatan revenue digital
          getter: (per) => per.performanceDigital.revenue,
          // Label judul teks baris revenue
          label: "Revenue (Rp)",
          // Warna heksadesimal merah penanda pendapatan bawah
          color: "#d62728",
        },
        // Objek membuka bar jumlah tayangan tontonan views bawah
        {
          // Penarik nilai properti total views sosmed digital
          getter: (per) => per.performanceDigital.views,
          // Teks keterangan label jumlah penonton views
          label: "Views",
          // Warna oren penanda penonton terbawah
          color: "#ff7f0e",
        },
      ],
      // Diurutkan dari yang performa bawah naik ke atas
      true,
    );
  }, [filteredPrograms]);

  // Susun data top revenue via fungsi dry
  const topRevenueData = useMemo<ChartData<"bar">>(() => {
    // Panggil helper otomatis rakit satu bar chart buat ranking revenue tv teratas
    return generateBarChartData(
      // Masukin list program terfilter
      filteredPrograms,
      // Ambil field revenuecapaian siaran tv
      (per) => per.financials.revenueActual,
      // Judul label teks di chart
      "Capaian Revenue (Rp)",
      // Warna hijau tanda pendapatan sehat siaran
      "#2ca02c",
      // Urutan menurun dari omset gede ke kecil
      true,
    );
  }, [filteredPrograms]);

  // Susun data bottom revenue custom satu dataset
  const bottomRevenueData = useMemo<ChartData<"bar">>(() => {
    // Urut data program nilai rendah
    const sorted = sortAndSlicePrograms(
      filteredPrograms,
      (per) => per.financials.revenueActual,
      false,
    );
    // Balik struktur data
    return {
      // Map daftar nama program jadi label sumbu horizontal chart
      labels: sorted.map((p) => p.name),
      // Array penampung list dataset bar chart omset bawah siaran
      datasets: [
        // Panggil fungsi create penampung dataset bar chart omset siaran tv
        createBarDataset(
          "Capaian Revenue (Rp)",
          sorted.map((p) =>
            sumPeriodValue(p, (per) => per.financials.revenueActual),
          ),
          sorted.map((p) => {
            const actualRev = sumPeriodValue(
              p,
              (per) => per.financials.revenueActual,
            );
            // Kondisional operator penentu warna bar penanda omset positif vs minus
            return actualRev >= 0 ? "#ff7f0e" : "#d62728";
          }),
        ),
      ],
    };
  }, [filteredPrograms]);

  // Susun data top tvr via fungsi dry
  const topTvPerformanceDataTvr = useMemo<ChartData<"bar">>(() => {
    // Panggil helper rakit chart bar buat data rating tv teratas
    return generateBarChartData(
      // Filter daftar program aktif
      filteredPrograms,
      // Ambil nilai target angka rating tvr penonton siaran
      (per) => per.performanceTV.actualTVR,
      // Keterangan judul teks metrik rating penonton
      "Pencapaian TVR",
      // Warna biru buat penanda grafik rating penonton tv
      "#1f77b4",
      // Urutan dibikin menurun dari rating tinggi ke bawah
      true,
    );
  }, [filteredPrograms]);

  // Susun data top share via fungsi dry
  const topTvPerformanceDataShare = useMemo<ChartData<"bar">>(() => {
    // Panggil helper rakit chart bar buat share penonton siaran tertinggi
    return generateBarChartData(
      // Ambil array program aktif
      filteredPrograms,
      // Ambil nilai persentase share pemirsa tv siaran siaran
      (per) => per.performanceTV.actualShare,
      // Keterangan tulisan info share penonton di dashboard
      "Pencapaian Share",
      // Kode heksadesimal warna biru tua buat grafik share penonton tv
      "#1f77b4",
      // Urutan dibikin dari share tertinggi ke bawah
      true,
    );
  }, [filteredPrograms]);

  // Susun data bottom tvr via fungsi dry
  const bottomTvPerformanceDataTvr = useMemo<ChartData<"bar">>(() => {
    // Panggil helper rakit chart bar otomatis rating tv terendah
    return generateBarChartData(
      // Ambil data program aktif
      filteredPrograms,
      // Tarik field angka rating tvr penonton tv
      (per) => per.performanceTV.actualTVR,
      // Keterangan teks info rating penonton tv siaran
      "Pencapaian TVR",
      // Warna merah tua tanda performa rating layar tv di bawah
      "#d62728",
      // Urutan dibikin dari yang terendah naik ke atas
      false,
    );
  }, [filteredPrograms]);

  // Susun data bottom share via fungsi dry
  const bottomTvPerformanceDataShare = useMemo<ChartData<"bar">>(() => {
    // Panggil helper rakit chart bar otomatis share persen penonton tv terendah
    return generateBarChartData(
      // Ambil array program aktif terfilter
      filteredPrograms,
      // Tarik field persentasecapaian share pemirsa tv
      (per) => per.performanceTV.actualShare,
      // Keterangan teks nama label persentase share siaran tv
      "Pencapaian Share",
      // Warna merah tua tanda penonton share tv kurang maksimal
      "#d62728",
      // Urutan dibikin naik dari share paling jeblok ke atas
      false,
    );
  }, [filteredPrograms]);

  // Return semua data dan state buat dipake di ui
  return {
    // State penanda id program yang dipilih di dropdown select program dashboard
    selectedProgramId,
    // Fungsi setter untuk tiban nilai state program yang dipilih user
    setSelectedProgramId,
    // State kategori program yang dipilih buat filter seluruh data diagram chart
    selectedCategory,
    // Fungsi pengubah state kategori program aktif pilihan user
    setSelectedCategory,
    // State buat nampung isian teks bulan awal saringan tanggal manual kustom
    startMonth,
    // Fungsi setter buat isi nilai string bulan awal filter custom
    setStartMonth,
    // State buat nampung teks input bulan akhir saringan kustom
    endMonth,
    // Fungsi setter buat isi nilai batas bulan akhir filter custom
    setEndMonth,
    // Id dari program yang dipilih atau default program pertama hasil filter
    activeProgramId,
    // Objek terformat siap pakai data chart bar akumulasi pnl per kategori
    allProgramData,
    // Objek data chart donat struktur finansial detail internal satu program
    detailProgramData,
    // Objek data grafik bar peringkat lima besar pnl tertinggi program
    topPnlData,
    // Objek data grafik bar peringkat lima besar pnl terendah program
    bottomPnlData,
    // Array data list program yang udah lolos saringan filter dashboard
    filteredPrograms,
    // Objek data grafik bar omset target revenue siaran tv teratas
    topRevenueData,
    // Objek data grafik bar omset realisasi revenue siaran tv terbawah
    bottomRevenueData,
    // Objek data grafik bar rating tvr siaran tv peringkat teratas
    topTvPerformanceDataTvr,
    // Objek data grafik bar persentase share pemirsa siaran tv teratas
    topTvPerformanceDataShare,
    // Objek data grafik bar rating tvr siaran tv peringkat terendah
    bottomTvPerformanceDataTvr,
    // Objek data grafik bar persentase share siaran tv peringkat terendah
    bottomTvPerformanceDataShare,
    // Objek data agregasi kpi total hitungan finansial untuk kartu statistik
    totalKPI,
    // Objek data grafik bar dobel omset revenue sosmed digital tertinggi
    topRevenueDigitalData,
    // Objek data grafik bar dobel omset revenue sosmed digital terendah
    bottomRevenueDigitalData,
    // Array berisi daftar seluruh string nama kategori program unik yang ada
    programCategories,
    // State penanda string pilihan periode filter utama yang lagi aktif
    selectedPeriod,
    // Fungsi pengubah nilai state pilihan jangka waktu periode aktif
    setSelectedPeriod,
    // Array list objek opsi jangka waktu filter periode untuk menu select
    periodOptions,
    // String tanggal terformat penanda update data paling baru dari sistem
    lastUpdated,
    // String teks info label deskripsi jarak rentang waktu data yang nampil
    displayedPeriodLabel,
    // State boolean buat nandain apakah modal detail chart lagi kebuka
    isChartDetailOpen,
    // Fungsi setter buat ngeset buka tutup jendela modal detail chart
    setIsChartDetailOpen,
    // State penanda tipe metrik data chart apa yang nampil di modal detail
    chartDetailType,
    // Fungsi setter penentu string jenis metrik detail chart modal
    setChartDetailType,
    // State string penampung teks judul dinamis buat dipasang di modal detail
    chartDetailTitle,
    // Fungsi setter pengubah isi teks judul jendela modal detail chart
    setChartDetailTitle,
    // State penanda boolean penentu apakah jendela detail program kebuka
    isProgramDetailOpen,
    // Fungsi pengubah status buka tutup modal detail program spesifik
    setIsProgramDetailOpen,
    // Objek data grafik donat pnl
    topProgramsDoughnutData,
  };
}
