// Import tipe data chart dari library chart js
import { ChartData } from "chart.js";
// Import tipe data formulir program dari skema
import { ProgramFormData } from "@/schemas/program";

// Alias tipe buat periode biar ga ngetik panjang panjang
export type ProgramPeriod = ProgramFormData["periods"][number];

// Fungsi buat ngitung total nilai dari array periode
export const sumPeriodValue = (
  // Data program
  prog: ProgramFormData,
  // Callback buat ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
): number => {
  // Reducer buat totalin nilai periode
  return prog.periods.reduce((s, per) => s + valueGetter(per), 0);
};

// Fungsi baru buat ngitung rata-rata nilai dari array periode khusus metrik seperti rating/share
export const avgPeriodValue = (
  // Data program
  prog: ProgramFormData,
  // Callback buat ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
): number => {
  // Hitung total nilai kotor periode
  const total = prog.periods.reduce((s, per) => s + valueGetter(per), 0);
  // Balikin nilai rata-rata, kasih penjaga nol biar ga error pas dibagi array kosong
  return prog.periods.length > 0 ? total / prog.periods.length : 0;
};

// Fungsi buat ngurutin dan motong array program sesuai nilai kalkulasi
export const sortAndSlicePrograms = (
  // Data list program
  programs: ProgramFormData[],
  // Callback buat ambil nilai sortir
  valueGetter: (per: ProgramPeriod) => number,
  // Boolean buat urutan turun
  isDesc: boolean = true,
  // Maksimal data yang diambil
  limit: number = 5,
  // Opsi fungsi agregator buat nentuin di total apa di rata-rata, patokan awal pake sum
  aggregator: (
    prog: ProgramFormData,
    getter: (per: ProgramPeriod) => number,
  ) => number = sumPeriodValue,
): ProgramFormData[] => {
  // Copy array terus sortir berdasar nilai
  return (
    // Array sebaran program utuh
    [...programs]
      // Fungsi sortir
      .sort((a, b) => {
        // Hitung total/rata nilai a pake agregator
        const valA = aggregator(a, valueGetter);
        // Hitung total/rata nilai b pake agregator
        const valB = aggregator(b, valueGetter);
        // Balikin hasil sortir
        // Kondisional nentuin posisi array pas disortir, kurangin valB pake valA kalo bener turun, atau kurangin valA pake valB kalo palsu biar naik
        return isDesc ? valB - valA : valA - valB;
      })
      // Potong array
      .slice(0, limit)
  );
};

// Fungsi buat ngerakit dataset bar chart standar
export const createBarDataset = (
  // Label buat dataset
  label: string,
  // Array data angka
  data: (number | null)[],
  // Warna background bar dibikin opsional biar basechart yang ngatur kalo kosong
  backgroundColor?: string | string[],
  // Minimal panjang bar
  minBarLength: number = 15,
) => {
  // Bikin wadah penyimpan properti dasar dataset batang
  const dataset = {
    // Properti label
    label,
    // Properti data
    data,
    // Properti panjang bar
    minBarLength,
  };
  // Kondisional balikin objek dataset, gabungin atribut warna kalo bener dikirim dari luar, atau balikin wujud aslinya yang polos kalo palsu
  return backgroundColor ? { ...dataset, backgroundColor } : dataset;
};

// Fungsi buat ngerakit dataset doughnut chart standar yang udah dibenerin tipenya
export const createDoughnutDataset = (
  // Label buat dataset
  label: string,
  // Array data angka tanpa null khusus buat donat
  data: number[],
  // Warna background potongan doughnut dibikin opsional biar nyesuaiin basechart
  backgroundColor?: string | string[],
) => {
  // Bikin wadah penyimpan properti dasar dataset donat
  const dataset = {
    // Properti label
    label,
    // Properti data angka
    data,
  };
  // Kondisional balikin objek donat, gabungin warna dalem objek kalo beneran disuplai, atau lepehin objek polosan kalo palsu
  return backgroundColor ? { ...dataset, backgroundColor } : dataset;
};

// Fungsi baru buat ngerakit dataset line chart garis standar
export const createLineDataset = (
  // Teks string penanda nama label metrik garis
  label: string,
  // Array penampung list angka dalem titik garis chart
  data: (number | null)[],
  // Teks string warna pinggiran garis yang dibikin opsional aja
  borderColor?: string,
  // Teks string warna latar area bawah garis yang opsional juga
  backgroundColor?: string,
) => {
  // Bikin wadah dasar buat nampung atribut pokok chart garis
  const dataset = {
    // Properti penamaan label dataset garis
    label,
    // Properti deretan data nilai garis
    data,
  };
  // Kondisional nambahin border color, masukin propertinya ke objek balikan kalo bener ada inputnya, atau tetep pake properti awal kalo palsu
  const withBorder = borderColor ? { ...dataset, borderColor } : dataset;
  // Kondisional balikin pungkasan, gabungin dataset sama background color kalo bener disuplai, atau cukup balikin wujud garis polos kalo palsu
  return backgroundColor ? { ...withBorder, backgroundColor } : withBorder;
};

// Fungsi buat bikin data chart bar satu dataset otomatis biar ga ribet
export const generateBarChartData = (
  // List program
  programs: ProgramFormData[],
  // Fungsi ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
  // Label chart
  label: string,
  // Warna chart opsional
  color?: string | string[],
  // Urutan turun
  isDesc: boolean = true,
  // Limit data
  limit: number = 5,
  // Opsi penyuntik cara kalkulasi nilai, patokan bawaan sumPeriodValue
  aggregator: (
    prog: ProgramFormData,
    getter: (per: ProgramPeriod) => number,
  ) => number = sumPeriodValue,
): ChartData<"bar", (number | null)[], unknown> => {
  // Panggil fungsi sortir sambil bawa fungsi agregatornya
  const sorted = sortAndSlicePrograms(
    programs,
    valueGetter,
    isDesc,
    limit,
    aggregator,
  );

  // Balikin objek data siap pakai
  return {
    // Label buat sumbu x
    labels: sorted.map((p) => p.name),
    // List dataset
    datasets: [
      // Panggil fungsi create dataset
      createBarDataset(
        // Isi properti string nama labelnya
        label,
        // Ekstrak kalkulasi periode pake agregator yang dipilih (bisa sum atau avg)
        sorted.map((p) => aggregator(p, valueGetter)),
        // Tempelin opsi warnanya ke fungsi pembungkus
        color,
      ),
    ],
  };
};

// Fungsi baru buat bikin grafik garis tunggal biar gampang dipanggil
export const generateLineChartData = (
  // Array data master program sasaran tarik nilai
  programs: ProgramFormData[],
  // Fungsi callback andalan penarik metrik spesifik
  valueGetter: (per: ProgramPeriod) => number,
  // Teks string penamaan nama grafik di chart
  label: string,
  // Warna heksadesimal buat cat garis yang opsional dikirim
  color?: string,
  // Status penentu arah urutan array dari gede ke kecil
  isDesc: boolean = true,
  // Batas maksimal seberapa panjang list yang mau ditampilin
  limit: number = 5,
): ChartData<"line", (number | null)[], unknown> => {
  // Panggil helper penyeleksi data buat nyortir sekaligus motong list
  const sorted = sortAndSlicePrograms(programs, valueGetter, isDesc, limit);

  // Balikin struktur json utuh sesuai kebutuhan library
  return {
    // Map deretan objek program hasil filter buat dijadiin tulisan alas
    labels: sorted.map((p) => p.name),
    // Array penampung list dataset grafik garisnya doang
    datasets: [
      // Jalankan fungsi otomatis perakit dataset line
      createLineDataset(
        // Isi properti string nama legend
        label,
        // Bongkar kumpulan program saringan buat ditarik akumulasi angkanya
        sorted.map((p) => sumPeriodValue(p, valueGetter)),
        // Kirim warna bordernya langsung ke dalem helper dataset
        color,
      ),
    ],
  };
};

// Fungsi buat bikin data chart doughnut satu dataset otomatis
export const generateDoughnutChartData = (
  // List program
  programs: ProgramFormData[],
  // Fungsi ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
  // Label chart
  label: string,
  // Array warna chart buat tiap potongan opsional
  color?: string[],
  // Urutan turun
  isDesc: boolean = true,
  // Limit data maksimal
  limit: number = 5,
): ChartData<"doughnut", number[], unknown> => {
  // Panggil fungsi sortir
  const sorted = sortAndSlicePrograms(programs, valueGetter, isDesc, limit);

  // Tampung nilai asli biar gampang dihitung proporsinya
  const realValues = sorted.map((p) => sumPeriodValue(p, valueGetter));

  // Totalin semua nilai asli buat nyari patokan persentase buletannya
  const totalValue = realValues.reduce((sum, val) => sum + val, 0);

  // Set minimal irisan dua persen dari total buletan biar yang jutaan tetep keliatan
  const VISUAL_MIN_PERCENT = 0.02;

  // Hitung batas minimum visualnya dengan cara total dikali persen
  const minVisualValue = totalValue * VISUAL_MIN_PERCENT;

  // Kalo kekecilan paksa naik ke batas minimum visual selain itu biarin normal
  const visualValues = realValues.map((val) => {
    // Kalo emang datanya nol langsung balikin nol biar ga ngerusak chart
    // Kondisional nyegat data nol, balikin wujud nol kalo bener tanpa lanjut ngeksekusi logic di bawahnya
    if (val === 0) return 0;
    // Cek kalo lebih kecil dari batas paksa naik ke nilai minimum
    // Kondisional adu besar nilai, lempar angka patokan visual kalo bener kelewat kecil, atau biarin angka aslinya mejeng kalo palsu
    return val < minVisualValue ? minVisualValue : val;
  });

  // Balikin objek data siap pakai
  return {
    // Label buat tiap potongan doughnut
    labels: sorted.map((p) => p.name),
    // List dataset
    datasets: [
      // Panggil fungsi create dataset doughnut pake tipe angka
      createDoughnutDataset(
        // Lempar label chartnya ke pembungkus
        label,
        // Pake data visual biar irisan kecil ga tenggelem
        visualValues,
        // Lempar parameter warna opsionalnya ke dalem fungsi
        color,
      ),
    ],
  };
};

// Fungsi buat bikin data chart bar dua dataset otomatis biar ga ribet
export const generateDoubleBarChartData = (
  // List program
  programs: ProgramFormData[],
  // Fungsi sort
  sortGetter: (per: ProgramPeriod) => number,
  // List getter tiap dataset
  getters: {
    // Fungsi ambil nilai
    getter: (per: ProgramPeriod) => number;
    // Label dataset
    label: string;
    // Warna dataset opsional
    color?: string | string[];
  }[],
  // Urutan turun
  isDesc: boolean = true,
  // Limit data
  limit: number = 5,
): ChartData<"bar", (number | null)[], unknown> => {
  // Sortir program
  const sorted = sortAndSlicePrograms(programs, sortGetter, isDesc, limit);

  // Balikin objek data multi dataset
  return {
    // Label sumbu x
    labels: sorted.map((p) => p.name),
    // Mapping dataset dari list getters
    datasets: getters.map((g) =>
      // Eksekusi helper dataset bar batangan berulang ulang
      createBarDataset(
        // Set label metrik batangnya
        g.label,
        // Ekstrak akumulasi kalkulasi array via getter
        sorted.map((p) => sumPeriodValue(p, g.getter)),
        // Sisipin warna batang
        g.color,
      ),
    ),
  };
};

// Fungsi baru perakit data grafik garis banyak metrik tumpuk
export const generateMultiLineChartData = (
  // Wadah master array list seluruh program siaran
  programs: ProgramFormData[],
  // Kunci andalan buat nyortir urutan ranking performa
  sortGetter: (per: ProgramPeriod) => number,
  // Daftar objek parameter pengupas properti per garis metrik
  getters: {
    // Callback pengeksekusi sedot angka periode chart
    getter: (per: ProgramPeriod) => number;
    // Teks info tulisan nama garis metrik di legendanya
    label: string;
    // Pilihan warna cat garis yang boleh kosong
    color?: string;
  }[],
  // Mode boolean urutan ranking turun atau naik
  isDesc: boolean = true,
  // Kuota panjang seberapa batas wajar angka muncul
  limit: number = 5,
): ChartData<"line", (number | null)[], unknown> => {
  // Lakukan irisan dan sortir data pake helper pusat
  const sorted = sortAndSlicePrograms(programs, sortGetter, isDesc, limit);

  // Lempar bongkahan data yang udah dirakit nyesuaiin tipe json chart
  return {
    // Petakan deretan nama program ke koordinat sumbu alas chart
    labels: sorted.map((p) => p.name),
    // Lakukan mapping merakit seluruh list dataset kumpulan garis
    datasets: getters.map((g) =>
      // Gabungin satu per satu garis via fungsi cetak line
      createLineDataset(
        // Tancepin penamaan legend garis
        g.label,
        // Urai program saringan terus kumpulin angkanya pake fungsi ambil
        sorted.map((p) => sumPeriodValue(p, g.getter)),
        // Tempel properti warna heksadesimal ke garis itu sendiri
        g.color,
      ),
    ),
  };
};

// Fungsi buat bikin chart donat banyak metrik dari satu sumber data
export const generateMultiMetricDoughnutData = <T>(
  // Objek data sumber buat ditarik nilainya
  sourceData: T,
  // Array berisi list konfigurasi metrik
  metrics: {
    // Teks label nama metrik
    label: string;
    // Fungsi callback penarik nilai angka dari data sumber
    getter: (data: T) => number;
    // String kode warna heksadesimal buat potongan donat opsional
    color?: string;
  }[],
  // String label teks buat nama dataset defaultnya kosong
  datasetLabel: string = "",
): ChartData<"doughnut", number[], unknown> => {
  // Tarik semua nilai asli dari data sumber pake fungsi getter map
  const realValues = metrics.map((m) => m.getter(sourceData));

  // Totalin semua nilai asli buat nyari patokan persentase buletannya pake angka absolut
  const totalValue = realValues.reduce((sum, val) => sum + Math.abs(val), 0);

  // Kalo totalnya nol langsung balikin isi kosong biar ga error chartnya
  // Kondisional guard clause mendeteksi total angka nol, henti paksa operasi lalu lepehin objek array kosong melompong kalo bener
  if (totalValue === 0) {
    // Return objek kosong pembungkus chart kosong
    return {
      // Wadah label dibiarin kosong ga ada isi
      labels: [],
      // Wadah dataset juga diset kopong
      datasets: [],
    };
  }

  // Set minimal irisan dua persen dari total buletan biar keliatan
  const VISUAL_MIN_PERCENT = 0.02;

  // Hitung batas minimum visualnya dengan cara total dikali persen
  const minVisualValue = totalValue * VISUAL_MIN_PERCENT;

  // Kalo kekecilan paksa naik ke batas minimum visual selain itu biarin normal
  const visualValues = realValues.map((val) => {
    // Kalo emang datanya nol langsung balikin nol biar ga ngerusak proporsi chart
    // Kondisional ngehalau nol persen di dalem irisan, kelar di sini terus seburin angka nol kalo bener terjadi
    if (val === 0) return 0;
    // Bikin wadah nilai absolut biar ga kacau pas ada angka minus
    const absVal = Math.abs(val);
    // Cek kalo lebih kecil dari batas paksa naik ke nilai minimum
    // Kondisional angkat irisan kecil, dorong pake visual minimum kalo beneran tenggelem nilainya, atau biarin pake angka asli kalo palsu
    return absVal < minVisualValue ? minVisualValue : absVal;
  });

  // Cek ketersediaan warna dari array konfigurasi metrik luar
  const hasColors = metrics.some((m) => m.color !== undefined);
  // Ambil list warna pake pemetaan map kalo emang disediain pengirim
  // Kondisional urai warna, narik kumpulan teks heksadesimal warna kalo beneran disuplai, atau biarin jadi parameter kosong kalo palsu biar basechart yang ngasih warna paten
  const mappedColors = hasColors
    ? metrics.map((m) => m.color as string)
    : undefined;

  // Balikin objek data siap pakai buat chart js
  return {
    // Ambil semua teks label dari array konfigurasi metrik map
    labels: metrics.map((m) => m.label),
    // List dataset chart
    datasets: [
      // Panggil fungsi create dataset doughnut pake tipe angka
      createDoughnutDataset(
        // Masukin nama dataset ke label
        datasetLabel,
        // Pake data visual biar irisan kecil ga tenggelem
        visualValues,
        // Templokin hasil kumpulan warna yang udah lolos kondisional
        mappedColors,
      ),
    ],
  };
};
