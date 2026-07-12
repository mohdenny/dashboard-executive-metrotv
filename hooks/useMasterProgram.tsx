// Import react dan kawan2
import React, {
  // Import hook state buat kelola data
  useState,
  // Import hook memo buat efisiensi hitungan
  useMemo,
  // Import hook ref buat akses elemen dom
  useRef,
} from "react";
// Import hook query dari tanstack query
import {
  // Hook utama buat narik data
  useQuery,
  // Import hook mutation buat eksekusi aksi ubah data
  useMutation,
  // Import client query buat atur cache
  useQueryClient,
} from "@tanstack/react-query";
// Import icon dari lucide
import { Edit2, Trash2 } from "lucide-react";
// Import komponen grid dari ag grid react
import { AgGridReact } from "ag-grid-react";
// Import tipe data dari komunitas ag grid
import {
  // Tipe definisi kolom
  ColDef,
  // Tipe penangkap hasil parse nilai sel
  ValueParserParams,
  // Tipe parameter buat ngerender sel
  ICellRendererParams,
  // Tipe parameter buat fungsi penarik nilai
  ValueGetterParams,
  // Tipe parameter buat fungsi penyimpan nilai
  ValueSetterParams,
  // Tipe parameter buat ngatur class sel
  CellClassParams,
} from "ag-grid-community";
// Import fungsi toast dari sonner buat notifikasi
import { toast } from "sonner";
// Import fungsi api buat olah data program dari service
import {
  // Fungsi penarik list data
  fetchProgramsByRange,
  // Fungsi penyuntik data baru
  createProgram,
  // Fungsi peniban data lama
  updateProgram,
  // Fungsi pembasmi data
  deleteProgram,
} from "@/services/api/programService";
// Import config kolom dan filter dari komponen tabel
import {
  // Tipe data kolom
  ColumnConfig,
  // Tipe data dropdown filter
  FilterSelectConfig,
} from "@/components/shared/SmartTable";
// Import skema validasi program dari folder schemas
import {
  // Tipe cetakan program
  ProgramFormData,
  // Objek validator zod
  programFormSchema,
} from "@/schemas/program";

// Fungsi buat dapetin objek periode aktif atau bikin baru kalo gada
const getActivePeriod = (
  // Data program utuh
  data: ProgramFormData | undefined,
  // Periode terpilih opsional
  selectedPeriod?: string | null,
) => {
  // Kalo data gada langsung balikin null
  if (!data) return null;
  // Kondisional ngecek kalo periods gada atau isinya kosong melompong bakal dibikinin array periode baru, kalo ada biarin
  if (!data.periods || data.periods.length === 0) {
    // Bikin array periode dengan objek default
    data.periods = [
      // Objek periode pertama default
      {
        // Id unik pake timestamp
        id: `d-${Date.now()}`,
        // Bulan sekarang format iso diiris ampe bulan aja
        month: new Date().toISOString().slice(0, 7),
        // Data performa tv default
        performanceTV: {
          // Angka target rating
          targetTVR: 0,
          // Angka target porsi penonton
          targetShare: 0,
          // Angka asli rating
          actualTVR: 0,
          // Angka asli porsi
          actualShare: 0,
        },
        // Data performa digital default
        performanceDigital: {
          // Jumlah penonton digital
          views: 0,
          // Duit masuk digital
          revenue: 0,
        },
        // Data finansial default
        financials: {
          // Pengeluaran operasional
          costDirect: 0,
          // Patokan target omset
          revenueTarget: 0,
          // Omset riil yang masuk
          revenueActual: 0,
          // Untung rugi bersih
          pnl: 0,
        },
        // Data inventori default
        inventory: {
          // Sisa slot iklan
          spot: 0,
          // Harga sewa slot
          adRate: 0,
        },
        // Status awal normal
        status: "Normal",
      },
    ];
  }
  // Kondisional ngecek kalo ada input periode yang dipilih bakal nyari isinya, kalo ga bakal langsung ngurutin
  if (selectedPeriod) {
    // Cari periode yang match sama bulan pake find
    const found = data.periods.find((p) => p.month === selectedPeriod);
    // Kalo ketemu langsung balikin
    if (found) return found;
    // Bikin objek periode baru kalo beneran ga nemu di dalem array
    const newPeriod = {
      // Id unik random dari waktu dicampur fungsi random
      id: `d-${Date.now()}-${Math.random()}`,
      // Bulan diset nyesuaiin pilihan user
      month: selectedPeriod,
      // Data performa tv default nol
      performanceTV: {
        // Tarjet rating
        targetTVR: 0,
        // Target porsi
        targetShare: 0,
        // Rating asli
        actualTVR: 0,
        // Porsi asli
        actualShare: 0,
      },
      // Data performa digital default nol
      performanceDigital: {
        // Penonton sosmed
        views: 0,
        // Omset sosmed
        revenue: 0,
      },
      // Data finansial default nol
      financials: {
        // Modal acara
        costDirect: 0,
        // Target duwit
        revenueTarget: 0,
        // Duwit asli
        revenueActual: 0,
        // Profit bersih
        pnl: 0,
      },
      // Data inventori default nol
      inventory: {
        // Ketersediaan iklan
        spot: 0,
        // Harga iklan
        adRate: 0,
      },
      // Status awal cuma strip
      status: "-",
    };
    // Masukin periode baru ke list array periode yang lama
    data.periods.push(newPeriod);
    // Balikin bentuk periode baru
    return newPeriod;
  }
  // Sortir array periode dari yang paling terbaru ke jadul
  const sorted = [...data.periods].sort((a, b) =>
    // Adu string komparasi mundur
    b.month.localeCompare(a.month),
  );
  // Balikin objek periode urutan pertama yang paling baru
  return sorted[0];
};

// Hook utama buat manage logic master program di ui
export function useMasterProgram() {
  // Inisialisasi pengelola query client
  const queryClient = useQueryClient();
  // Ref buat akses jembatan api ag grid react
  const gridRef = useRef<AgGridReact>(null);

  // State bool buka tutup jendela modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State id data spesifik yang lagi kena edit
  const [editingId, setEditingId] = useState<string | null>(null);
  // State nampung id target konfirmasi hapus data
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  // State nampung list isi data row yang nongol di modal
  const [rowData, setRowData] = useState<ProgramFormData[]>([]);
  // State string periode waktu yang lagi dipilih user
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Jalankan query buat narik koper balasan dari server
  const {
    // Sedot objek utuh hasil balikan api terus ganti namanya jadi fetch result
    data: fetchResult,
    // Sedot status boolean loading datanya
    isLoading,
  } = useQuery({
    // Nama key label chache biar ga bentrok
    queryKey: ["programs"],
    // Fungsi panggil rute api axios tanpa ngasih filter parameter
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // Ekstrak array program asli dari dalem koper result atau lepehin array kosong
  const programs = fetchResult?.data || [];

  // Memo buat nyusun daftar string periode unik yang ada
  const periodOptions = useMemo(() => {
    // Bongkar semua data bulan periode dari seluruh program jadi array rata satu dimensi
    const all = programs.flatMap(
      // Lempar string bulan kalo nemu, atau balikin array kosong
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    // Hapus duplikat pake set terus urutin naik terus dibalik jadi nurun
    return Array.from(new Set(all)).sort().reverse();
    // Pantau mulu setiap kali data dari api berubah
  }, [programs]);

  // Rakit mutasi sakti buat tambah data baru
  const createMut = useMutation({
    // Kaitin ke fungsi rute api nambahin data
    mutationFn: createProgram,
  });

  // Rakit mutasi buat nembak pembaruan data lama
  const updateMut = useMutation({
    // Fungsi panggil api axios khusus update bawa param id ama body
    mutationFn: ({ id, data }: { id: string; data: ProgramFormData }) =>
      // Eksekusi rute update ke axios
      updateProgram(id, data),
  });

  // Rakit mutasi gahar buat hapus data
  const deleteMut = useMutation({
    // Panggil helper hapus di service
    mutationFn: deleteProgram,
    // Eksekusi rentetan aksi setelah proses server kelar sukses
    onSuccess: () => {
      // Ledakin cache data lama biar maksa nembak api buat refresh
      queryClient.invalidateQueries({
        // Target nama cache yang mau diledakin
        queryKey: ["programs"],
      });
      // Bersihin state id konfirmasi target hapus jadi null
      setDeleteConfirmId(null);
      // Tembak popup notifikasi ijo ngasih kabar sukses
      toast.success("Data program berhasil dihapus!");
    },
  });

  // Susun data baris kosong patokan standar pas nambah program baru
  const defaultEmptyRow: ProgramFormData = {
    // String nama program dikosongin
    name: "",
    // Kategori default dipatok huruf a
    category: "A",
    // Deskripsi kategori standar set general
    descriptionCategory: "General",
    // Jam tayang sengaja dikosongin
    broadcastTime: "",
    // Susun array berisi satu list periode awal
    periods: [
      // Objek periode perdana
      {
        // Id unik dibikin dari kata new dicampur timer sekarang
        id: `new-${Date.now()}`,
        // Setelan bulan milih state atau nyomot waktu komputer diiris
        month: selectedPeriod || new Date().toISOString().slice(0, 7),
        // Data performa standar tv reset bawah
        performanceTV: {
          // Nol buat tarjet rating
          targetTVR: 0,
          // Nol buat target share
          targetShare: 0,
          // Nol buat rating asli
          actualTVR: 0,
          // Nol buat porsi asli
          actualShare: 0,
        },
        // Data performa sosmed digital default kosong
        performanceDigital: {
          // Nol tayangan
          views: 0,
          // Nol pendapatan
          revenue: 0,
        },
        // Data uang finansial default reset abis
        financials: {
          // Nol biaya acara
          costDirect: 0,
          // Nol target duwit
          revenueTarget: 0,
          // Nol duwit asli masuk
          revenueActual: 0,
          // Nol laba rugi
          pnl: 0,
        },
        // Data slot inventori default ludes
        inventory: {
          // Nol titik ketersediaan
          spot: 0,
          // Nol harga patokan
          adRate: 0,
        },
        // Teks status awalan dibikin standar normal
        status: "Normal",
      },
    ],
  };

  // Fungsi buat mancing buka jendela modal mode tambah data massal
  const openAddModal = () => {
    // Sapu bersih id state mode edit
    setEditingId(null);
    // Rakit lima baris data kosong pake teknik map dan json parse
    setRowData(
      // Bikin array sepanjang lima kotak
      Array(5)
        // Isi null dulu semua kotaknya
        .fill(null)
        // Tancepin salinan independen objek default ke dalem kotak
        .map(() => JSON.parse(JSON.stringify(defaultEmptyRow))),
    );
    // Pencet tuas buka jendela modal
    setIsModalOpen(true);
  };

  // Fungsi pemantik buka jendela modal buat mode edit satuan spesifik
  const openEditModal = (
    // Parameter objek data spesifik yang dipilih user
    prog: ProgramFormData,
  ) => {
    // Bongkar properti objek id misah dari kerumunan properti data form lainnya
    const {
      // Tarik id dari bungkusan
      id,
      // Kumpulin semua turahan nilai form pake rest operator
      ...formData
    } = prog as ProgramFormData & {
      // Type tambahan opsional string id
      id?: string;
      // Type tanggal dibuat
      createdAt?: string;
      // Type tanggal perbaruan
      updatedAt?: string;
    };
    // Tancepin id yang ketangkep ke wadah penanda mode edit
    setEditingId(id ?? null);
    // Jejelin baris data khusus objek satu ini ke grid
    setRowData([formData as ProgramFormData]);
    // Tuas pembuka paksa kemunculan jendela modal
    setIsModalOpen(true);
  };

  // Fungsi penembak tutup semua antarmuka modal
  const closeModal = () => {
    // Turunin tuas sembunyiin modal dari pandangan
    setIsModalOpen(false);
    // Sapu wadah id edit
    setEditingId(null);
    // Kosongin abis wadah tampungan baris grid data
    setRowData([]);
  };

  // Fungsi buat nyelipin nambahin baris kosong ke pantat tabel grid
  const addRow = () => {
    // Rakit array tiban bongkahan lama dicampur cetakan objek default di buritannya
    const newData = [...rowData, JSON.parse(JSON.stringify(defaultEmptyRow))];
    // Tiban wujud wadh state pake bungkusan array tiban
    setRowData(newData);
    // Suntik paksa pembaruan data langsung nembus sistem ag grid
    gridRef.current?.api.setGridOption("rowData", newData);
  };

  // Fungsi gahar pemicu perakitan kirim bungkusan bulk data ke server
  const submitBulkData = async () => {
    // Kondisional cegat kalo dom tabel ag grid blom nyangkut ke ref
    if (!gridRef.current) return;

    // Siapin wadah array sementara khusus payload mentah yang masuk
    const rawPayload: ProgramFormData[] = [];

    // Lakukan putaran muter dari baris ke baris langsung di jantung mesin ag grid
    gridRef.current.api.forEachNode((node) => {
      // Kondisional menyaring khusus baris yang ada isinya dan nama program udah diketik
      if (node.data && node.data.name) {
        // Ambil cetakan bulan terbaru buat pondasi hitung kalkulasi otomatis
        const latestPeriod = getActivePeriod(node.data, selectedPeriod);
        // Kondisional jalan pas objek periode beneran nyangkut
        if (latestPeriod) {
          // Suntik kalkulasi pnl gabungan masukin omset tv tambah sosmed kurangin biaya
          latestPeriod.financials.pnl =
            (latestPeriod.financials.revenueActual || 0) +
            (latestPeriod.performanceDigital.revenue || 0) -
            (latestPeriod.financials.costDirect || 0);
        }
        // Serok data hasil polesan ini ke dalem truk payload
        rawPayload.push(node.data);
      }
    });

    // Siapin wadah array penampung payload lolos verifikasi zod
    const validPayload: ProgramFormData[] = [];
    // Siapin wadah ember kumpulan pesan string error yang numpuk
    const errors: string[] = [];

    // Lakukan perulangan bongkar per baris muatan truk raw payload
    rawPayload.forEach((data, index) => {
      // Terjangin tameng filter deteksi anomali skema ketat tipe zod
      const validation = programFormSchema.safeParse(data);
      // Kondisional bercabang ngecek tembus apa mantul hasil hadangan zod
      if (validation.success) {
        // Kalo tembus masukin data suci ke dalem truk payload pengiriman
        validPayload.push(validation.data);
      } else {
        // Ekstrak baris teks error pertama yang kedeteksi library
        const firstErrorMsg = validation.error.issues[0].message;
        // Gabungin posisi rantai objek masalah pake titik separator
        const fieldPath = validation.error.issues[0].path.join(".");
        // Suntik rakitan kalimat info salah spesifik ke ember kumpulan error
        errors.push(
          `Baris ${index + 1} (${data.name || "Tanpa Nama"}) - Kolom '${fieldPath}', ${firstErrorMsg}`,
        );
      }
    });

    // Kondisional penghadang akhir pas jumlah error tembus lebih dari nol
    if (errors.length > 0) {
      // Lempar petasan notifikasi eror gagal save layar
      toast.error("Gagal Menyimpan Data", {
        // Deskripsi rincian error dibungkus elemen jsx
        description: (
          // Buka kontainer pembungkus kepingan error
          <div
            // Kasih deretan class flex nurun
            className="flex flex-col gap-1 mt-1 text-sm"
          >
            {/* Lakukan mapping berjejer mencetak teks string merah */}
            {errors.map((err, i) => (
              // Buka pilar span text unik pake nomer index
              <span
                // Tempelin no key absolut
                key={i}
              >
                {/* Tempelin cetakan info balok string error */}• {err}
              </span>
            ))}
          </div>
        ),
        // Kasih durasi diam melayang lima detik pas
        duration: 5000,
      });
      // Setop fungsi di sini biar data kotor ga jebol
      return;
    }

    // Kondisional cabang aksi ngurusin proses mutasi antara ngedit sama bikin baru, cek kalo id edit nyala
    // Ngubah data pas emang mode update dan isian valid payload beneran ada isi
    if (editingId && validPayload.length > 0) {
      // Tunggu sampe server ngabarin data id berasil ditiban paked data baru index pertama
      await updateMut.mutateAsync({ id: editingId, data: validPayload[0] });
      // Tembak popup bahagia tanda berasil save editan
      toast.success("Perubahan data berhasil disimpan!");
      // Cabang lajur sebelahnya buat aksi serbuan create numpuk data baru sekaligus
    } else {
      // Kunci laju ampe semua barisan janji mutasi tembakan data kelar semua
      await Promise.all(
        // Map tiap data suci payload ngerakit tembakan ke server
        validPayload.map((prog) => createMut.mutateAsync(prog)),
      );
      // Ledakin pop up seneng notif total hasil input yang sukses
      toast.success(
        `${validPayload.length} Data program berhasil ditambahkan!`,
      );
    }

    // Hancurin cache react query dari belakang biar tampilan auto narik filter update
    queryClient.invalidateQueries({
      // Hantam kunci memori data ini
      queryKey: ["programs"],
    });
    // Lempar palu panggil penutupan kerai modal ui
    closeModal();
  };

  // Memo rakitan rumit ngatur pondasi nama sama panggil isi sel kolom smart table read only luar
  const tableColumns = useMemo<ColumnConfig<ProgramFormData>[]>(
    () => [
      // Kolom nama program
      {
        // Teks kepala header
        header: "Nama Program",
        // Kunci id penarik data dari list objek
        accessorKey: "name",
        // Fungsi pemoles bentuk sel
        render: (item) => (
          // Bungkus pake span
          <span
            // Styling tebelin kata
            className="font-semibold text-foreground"
          >
            {/* Munculin nilai asli ke layar */}
            {item.name}
          </span>
        ),
      },
      // Kolom pembagian kategori tayangan
      {
        // Info judul pilar di atas
        header: "Kategori",
        // Alat pancing data kunci kategori
        accessorKey: "category",
        // Fungsi perakit elemen ui
        render: (item) => (
          // Bungkus pake span wujud lencana
          <span
            // Aturan styling warna bentuk kotak kecil lencana
            className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-[11px] font-bold"
          >
            {/* Coretan isi nilai kategori */}
            {item.category}
          </span>
        ),
      },
      // Kolom penunjuk waktu tayang layar tv
      {
        // Tulisan bentuk nama kolom
        header: "Jam Tayang",
        // Pencabut nilai dari kunci jam
        accessorKey: "broadcastTime",
        // Fungsi perias selnya
        render: (item) => (
          // Buka span
          <span
            // Sedikit kasih ketebalan sedang
            className="font-medium text-foreground"
          >
            {/* Tulis waktu di dalem kotaknya */}
            {item.broadcastTime}
          </span>
        ),
      },
      // Kolom komparasi target omset nyamping nyata
      {
        // Nama majemuk judul gabungan
        header: "Target/Cap. Rev",
        // Fungsi render ngegali properti dobel
        render: (item) => {
          // Cari bulan terbaru dari data program baris ini
          const latest = getActivePeriod(item, selectedPeriod);
          // Balik bentuk cetakan div tumpuk dua
          return (
            // Buka div flex baris tumpuk vertical
            <div
              // Kasih class nyusun menurun
              className="flex flex-col"
            >
              {/* Tumpukan atas buat ngasih nilai info target */}
              <span
                // Tipisin warnanya biar keliatan ga mendominasi
                className="text-xs text-muted-foreground"
              >
                {/* Gabung rp sama angka formattan titik lokal */}
                Target: Rp{" "}
                {(latest?.financials?.revenueTarget ?? 0).toLocaleString(
                  "id-ID",
                )}
              </span>
              {/* Tumpukan balok sakti nyatanya bawahnya */}
              <span
                // Kasih warna primer kuat mencolok
                className="font-medium text-primary"
              >
                {/* Gabungin hasil omset duit asli nyata formattan */}
                Actual: Rp{" "}
                {(latest?.financials?.revenueActual ?? 0).toLocaleString(
                  "id-ID",
                )}
              </span>
            </div>
          );
        },
      },
      // Kolom kalkulasi hasil keuntungan
      {
        // Nama header
        header: "PNL",
        // Penarik angka laba dari ujung dalam objek periode
        accessorFn: (item) => {
          // Balikin angka tarikan net pnl
          return getActivePeriod(item, selectedPeriod)?.financials?.pnl;
        },
        // Fungsi bentuk render warna dinamis
        render: (item) => {
          // Cari tau nilai pnl dari baris
          const pnl =
            getActivePeriod(item, selectedPeriod)?.financials?.pnl ?? 0;
          // Balikin cetakan span bentuk warnanya berubah
          return (
            // Span
            <span
              // Kondisional penggabung kelaziman kelas tailwind, cetak merah pas angka rugin, ijo buat profit cuan
              className={`font-bold ${pnl < 0 ? "text-destructive" : "text-green-600"}`}
            >
              {/* Hasil tarikan duit angka rp */}
              Rp {pnl.toLocaleString("id-ID")}
            </span>
          );
        },
      },
      // Kolom tuas aksi tombol hapus edit
      {
        // Teks info panel tombol pilar
        header: "Aksi",
        // Rata pojok biar rapih ui
        className: "text-right",
        // Tukang gambar elemen tuas kontrol
        render: (item) => (
          // Buka blok pembungkus tuas jejer horizontal
          <div
            // Kasih jarak di antara tuas
            className="space-x-2 text-right"
          >
            {/* Tombol sakti picu aksi mode update modal id */}
            <button
              // Hantem fungsi trigger param ke item sasaran
              onClick={() => openEditModal(item)}
              // Styling bentuk bentuk tombol kotak lonjong
              className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors rounded-xl cursor-pointer inline-flex"
            >
              {/* Gambaran icon bolpoin mungil */}
              <Edit2
                // Ukuran enam belas
                size={16}
              />
            </button>
            {/* Tombol pemicu buka jendela pop hapus */}
            <button
              // Panah nimpahin wadah id delete konfirmasi konstan
              onClick={() => setDeleteConfirmId(item.id ?? null)}
              // bentuk celupan bak merah bahaya
              className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors rounded-xl cursor-pointer inline-flex"
            >
              {/* Gambaran bentuk kaleng sampah */}
              <Trash2
                // Lebar ukuran pas
                size={16}
              />
            </button>
          </div>
        ),
      },
    ],
    // Pengawas memori buat kolom pantau bulan
    [selectedPeriod],
  );

  // Memo racikan konfigurasi deret seleksi list kategori dropdown luar
  const selectFilters = useMemo<FilterSelectConfig[]>(
    () => [
      // Konfigurasi laci dropdown kategori
      {
        // Nama field sasaran jaring
        key: "category",
        // Label teks keterangan depan luar dropdwon
        label: "Pilih Kategori",
        // Kumpulan bentuk jajaran nilai dalam menu list pilihan
        options: [
          // Item pertama
          { label: "A", value: "A" },
          // Item kedua
          { label: "B", value: "B" },
          // Item ketiiga
          { label: "C", value: "C" },
          // Item eksklusif khusus
          { label: "Signature", value: "Signature" },
          // Item buangan luar biasa
          { label: "Others", value: "Others" },
        ],
      },
    ],
    // Pengawas mati memori sekali pancang jalan
    [],
  );

  // Fungsi pengubah format ketikan text angka ganti balikan bentuk number js, cegah nan
  const numberParser = (
    // Parameter penangkap wujud bentuk nilai sel inputan user
    params: ValueParserParams<ProgramFormData, number>,
  ) =>
    // Paksa tuang jadi angka beneran dari teks aneh kalo jeblok balik nol
    Number(params.newValue) || 0;

  // Memo panjang rumit definisi kolom ag grid super interaktif mode edit bulk form
  const colDefs = useMemo<ColDef<ProgramFormData>[]>(
    () => [
      // Kolom barisan penghapus hapus tombol buang cell
      {
        // Judul header nama ui
        headerName: "Aksi",
        // Kolom hantu ngikut field name biar ga ngaco sistemnya
        field: "name",
        // Lebar absolut batas pinggir kiri
        width: 65,
        // Set patokan sempit lebar kiri
        minWidth: 65,
        // Maksimal kendor kanan pilar
        maxWidth: 65,
        // Suntik mati paksa pantek diam di tepi kolom
        pinned: "left",
        // Larang ngelentur bebas urusan ukuran
        suppressSizeToFit: true,
        // Style keras ngurusin centering tombol di sel
        cellStyle: {
          // Tata letak wujud flex
          display: "flex",
          // Sumbu x rata tengah
          justifyContent: "center",
          // Sumbu y juga dipaksa presisi
          alignItems: "center",
        },
        // Gambar fungsi ngerakit bentuk elemen tombol trash bin
        cellRenderer: (
          // Parameter tarikan mesin ag grid react
          params: ICellRendererParams<ProgramFormData, string>,
        ) => {
          // Kondisional menyegat bentuk tombol buat musnah ga muncul pas mode update lagi urusin satu data
          if (editingId) return null;
          // Balikin cetakan bentuk ui button
          return (
            // Buka tuas
            <button
              // Aksi nembak hapus baris dari list perulangan input data bulk create
              onClick={() => {
                // filter bungkusan data lama
                const currentData = [...rowData];
                // Penggal turahan satu kotak sesuai indeks nomer barisan
                currentData.splice(params.node!.rowIndex!, 1);
                // Siram penuhin balik state ke wujud buntung
                setRowData(currentData);
                // Perintah darurat sistem tembus ngatur dom jeroan ag grid barisan rownya
                gridRef.current?.api.setGridOption("rowData", currentData);
              }}
              // bentuk kelas polesan pewarnaan pas kesenggol tikus transisi mulus
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded cursor-pointer transition-colors"
            >
              {/* Icon tong sampah */}
              <Trash2 size={16} />
            </button>
          );
        },
        // Gembok saklar tutup larang diketik mode edit
        editable: false,
        // Matikan tombol pengurut kolom mati
        sortable: false,
        // Copot kemampuan nyaring mati abis
        filter: false,
      },
      // Kolom perubah nulis nama bulan tabel input
      {
        // Info nama ujung pilar
        headerName: "Periode",
        // Luasan pinggir sel
        width: 120,
        // Izin gedor ngubah karakter sel
        editable: true,
        // Penarik tali angka bulan dari ujung obyek bertingkat
        valueGetter: (
          // Alat ukur dapetin angka params
          params: ValueGetterParams<ProgramFormData, string>,
        ) =>
          // Balik bentuk hasil ulikan periode atau copot strip kosong
          getActivePeriod(params.data, selectedPeriod)?.month ?? "",
        // Penusuk modifikasi data baru ngeganti wujud asal
        valueSetter: (
          // Penampung kiriman ketikan jarinya user
          params: ValueSetterParams<ProgramFormData, string>,
        ) => {
          // Ekstrak ditarik bentuk bulannya dulu buat siap ditiban
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional nyegat celah buat beneran pastiin objek periode ada dan tulisan ga kopong
          if (period && params.newValue) {
            // Tembak ubah nilai bulan turunan objek
            period.month = params.newValue;
            // Kirim status ok bener berhasil dimodif
            return true;
          }
          // Kembalian gagal total
          return false;
        },
      },
      // Kolom penyimpan input nama judul programnya
      {
        // Alat field jaring
        field: "name",
        // Info teks atas tabel
        headerName: "Nama Program",
        // Lebar bentuk ui
        width: 220,
        // Hidupkan tuas edit buka saklar
        editable: true,
      },
      // Kolom urusan pilih bentuk jenis genrenya tv
      {
        // Alat jaring nama objek form
        field: "category",
        // Teks info kepala
        headerName: "Kategori",
        // Lebar pinggir
        width: 120,
        // Saklar ijin ganti nyala
        editable: true,
        // Gambar dropdown ui celupan select ag grid
        cellEditor: "agSelectCellEditor",
        // Konfigurasi kiriman jajaran bentuk array pilihannya
        cellEditorParams: {
          // Rakitan teks opsi array
          values: ["A", "B", "C", "Signature", "Blocking Reguler", "Others"],
        },
      },
      // Kolom jadwal nongol
      {
        // Jaring alat penarik langsung ke objek jam
        field: "broadcastTime",
        // Info teks atas
        headerName: "Jam Tayang",
        // Ukuran lebar sel
        width: 120,
        // Saklar buka izinin ketikan
        editable: true,
      },
      // Kolom input target pancingan rating poin
      {
        // Judul header
        headerName: "Target TVR",
        // Lebar bentuk sel kolom
        width: 130,
        // Aktifin saklar ubah angka
        editable: true,
        // Penjaga alat paksa rubah nolak bentuk nan ngerusak database
        valueParser: numberParser,
        // Penarik ujung properti data target tvr ngorek jauh ke dalem objek
        valueGetter: (
          // Tangkap param bawaan mesin form
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Ekstrak turun jauh dari pancing periode cari rating, antisipasi jeblok nol
          getActivePeriod(params.data, selectedPeriod)?.performanceTV
            ?.targetTVR ?? 0,
        // Alat tembak nulis nimpa data target baru
        valueSetter: (
          // Bawa bentuk lemparan value params
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Cari kepingan objek bungkusan
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional cegat kalo emang kepingannya nyata ada beneran
          if (period) {
            // Suntik numpuk isi nilai nol kalo gagal baca bentuk lemparan
            period.performanceTV.targetTVR = params.newValue ?? 0;
            // Kirim bendera berhasil save
            return true;
          }
          // Kembalian jelek pertanda gagal
          return false;
        },
      },
      // Kolom nyatet inputan hasil asli nyatanya rating tvr dapet berapa
      {
        // Judul nama
        headerName: "Actual TVR",
        // Lebar jarak
        width: 130,
        // Izin rombak data aktif
        editable: true,
        // Pengubah paksa wujud teks jadi nomor
        valueParser: numberParser,
        // Alat penggali ngorek dapet poin nilai asli pencapaian rating
        valueGetter: (
          // Penangkap bawaan bentuk grid
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Tarik bongkahan performa tv ampe actual tvr dari ulikan periode default nol
          getActivePeriod(params.data, selectedPeriod)?.performanceTV
            ?.actualTVR ?? 0,
        // Pengubah nilai nyimpan nembak data balik
        valueSetter: (
          // Bawa bentuk ketikan input number
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Panggil fungsi gali letak persis objek bulan aktif
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional nyegat celah buat beneran nulis isi pas pancingan kecantol
          if (period) {
            // Suntik nilai paksa nol pas meleset
            period.performanceTV.actualTVR = params.newValue ?? 0;
            // Status lolos nulis
            return true;
          }
          // Tolak nulis gagal
          return false;
        },
      },
      // Kolom patokan persentase kue penonton persenan target
      {
        // Judul header
        headerName: "Target Share (%)",
        // Lebar pinggir sel grid
        width: 140,
        // Buka slot penulisan ijin
        editable: true,
        // Parutan paksa buang teks aneh nyari nomer aslinya
        valueParser: numberParser,
        // Ujung pancingan ngegali data share
        valueGetter: (
          // Bawa bentuk form param
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Korek laci target share nol
          getActivePeriod(params.data, selectedPeriod)?.performanceTV
            ?.targetShare ?? 0,
        // Penusuk nilai
        valueSetter: (
          // Tangkap param masuk
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Serok laci peride
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional kalo ketemu kepingannya bener
          if (period) {
            // Hantam nimpa target bagian form
            period.performanceTV.targetShare = params.newValue ?? 0;
            // Berhasil mutasi cell
            return true;
          }
          // Gagal
          return false;
        },
      },
      // Kolom buat masukin input aslinya hasil porsi layar penonton persenan
      {
        // Judul header atas
        headerName: "Actual Share (%)",
        // Ukuran luasan lebarnya
        width: 140,
        // Saklar tuas pengetikan nyala aktif
        editable: true,
        // Mesin filter jaring paksa bentuk number aman dari kecelakaan nan
        valueParser: numberParser,
        // Penarik penggali tali ke data capai persen nyata
        valueGetter: (
          // Kantong tangkapan bentuk params dari ag
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Tarik bongkahan performa tv ampe actual share dari ulikan bulan lepeh nol
          getActivePeriod(params.data, selectedPeriod)?.performanceTV
            ?.actualShare ?? 0,
        // Penikam data ke ujung letak jeroan sasaran form
        valueSetter: (
          // Bawa muatan bentuk nilai number
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Gali koordinat titik bulan
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional nyegat celah kalo titiknya bener ada
          if (period) {
            // Tancepin gantiin properti actual share ampe beres
            period.performanceTV.actualShare = params.newValue ?? 0;
            // Balikin bendera ijo bener bisa
            return true;
          }
          // Merah buntu
          return false;
        },
      },
      // Kolom khusus catatan info berapa jumlah orang yang mantengin layar hp
      {
        // Judul header
        headerName: "Digital Views",
        // Lebar bentuk tepi
        width: 140,
        // Gembok kebuka
        editable: true,
        // Parut bersih angka doang
        valueParser: numberParser,
        // Gali serok ampe bentuk jumlah views laci digital
        valueGetter: (
          // Tangkep param
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Tarik bongkahan digital
          getActivePeriod(params.data, selectedPeriod)?.performanceDigital
            ?.views ?? 0,
        // Nimpa
        valueSetter: (
          // Bawa param
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Cari wadah
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional isi ada
          if (period) {
            // Lempar nilainya masuk nimpuk
            period.performanceDigital.views = params.newValue ?? 0;
            // Berhasil
            return true;
          }
          // Error diem
          return false;
        },
      },
      // Kolom nulisin inputan duit yang masuk perolehan sosmed ig yt
      {
        // Judul header
        headerName: "Digital Revenue (Rp)",
        // Jarak lebar
        width: 160,
        // Aktifin
        editable: true,
        // filter angka bentuk number
        valueParser: numberParser,
        // Ulik data narik jumlah duit
        valueGetter: (
          // Bawa param
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Bongkar digital omset bentuk
          getActivePeriod(params.data, selectedPeriod)?.performanceDigital
            ?.revenue ?? 0,
        // Set
        valueSetter: (
          // Tarik param
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Wadah
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional bener
          if (period) {
            // Tembak ubah nilai
            period.performanceDigital.revenue = params.newValue ?? 0;
            // Ok
            return true;
          }
          // Nolak
          return false;
        },
      },
      // Kolom ngelist berapa juta ongkos bikin produksinya
      {
        // Judul header
        headerName: "Cost Direct (Rp)",
        // Lebar sel
        width: 160,
        // Ijin nyala
        editable: true,
        // Buang huruf ngaco dari text
        valueParser: numberParser,
        // Gali duit keluar dari objek laci uang finansial
        valueGetter: (
          // Bawa
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Bongkar bentuk duit modal ampe nol sisa
          getActivePeriod(params.data, selectedPeriod)?.financials
            ?.costDirect ?? 0,
        // Lempar
        valueSetter: (
          // Bawa param
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Cari wadah
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional nyangkut bener
          if (period) {
            // Suntik bentuk angka nyatanya
            period.financials.costDirect = params.newValue ?? 0;
            // Joss
            return true;
          }
          // Ngalang
          return false;
        },
      },
      // Kolom patokan maunya jualan tayangan ni harusnya untung berapa masuk duitnya
      {
        // Judul header
        headerName: "Target Rev (Rp)",
        // Lebaran pinggir
        width: 160,
        // Saklar
        editable: true,
        // Jaring paksa angka
        valueParser: numberParser,
        // Serok bentuk target untung di kotak duit
        valueGetter: (
          // Bawa info
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Narik ulik target ampe sisa
          getActivePeriod(params.data, selectedPeriod)?.financials
            ?.revenueTarget ?? 0,
        // Penusuk modif data bentuk target duit
        valueSetter: (
          // Bawa bentuk ketikan user
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Bongkar posisi
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional ijo bentuk beneran tembus nemu koordinat laci periode beneran valid nyata
          if (period) {
            // Hantem ganti nilai target duwit angka
            period.financials.revenueTarget = params.newValue ?? 0;
            // Kirim kabar balik lolos mutasi
            return true;
          }
          // Gagalkan cegat nulis
          return false;
        },
      },
      // Kolom data sebernya ini yang beneran masuk duit aslinya hasil iklan tv tayang
      {
        // Nama info kolom
        headerName: "Actual Rev (Rp)",
        // Lebar batas
        width: 160,
        // Bukain sel gembok
        editable: true,
        // Alat paksa pengubah karakter string nakal jadi nomer suci
        valueParser: numberParser,
        // Kerek katrol narik isi duit capaian bentuk angka
        valueGetter: (
          // Jaring properti bungkusan
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Gali finansial ambil aktualnya duwit
          getActivePeriod(params.data, selectedPeriod)?.financials
            ?.revenueActual ?? 0,
        // Obeng pemutar ngubah ganti nimpah angka lama
        valueSetter: (
          // Bungkus input number
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Cari kotak kepingan waktu
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional percabangan kalo nyangkut nemu titiknya bener
          if (period) {
            // Tembak ngeset wujud propertinya ampe tuntas
            period.financials.revenueActual = params.newValue ?? 0;
            // Kembalian nyatain ok bener mutasi beres
            return true;
          }
          // Kembalian apes tolak mentah2
          return false;
        },
      },
      // Kolom nampilin hitungan laba untung rugin bersih ajaib ngerakit angkanya di tempat auto bentuk
      {
        // Teks header
        headerName: "Auto PNL (Rp)",
        // Lebar celah
        width: 160,
        // Gembok saklar tutup paksa ga bole diotak atik user
        editable: false,
        // Kerek pembuat angka rekayasa otomatis nyomot laci sana sini narik bentuk baru
        valueGetter: (
          // Jaring tangkep row baris program param ag grid
          params: ValueGetterParams<ProgramFormData, number>,
        ) => {
          // Ambil titik kepingan ujung
          const latest = getActivePeriod(params.data, selectedPeriod);
          // Gali pemasukan kotor laci bentuk tv
          const rev = latest?.financials?.revenueActual ?? 0;
          // Gali omset dari laci sosmed yutub ig
          const digRev = latest?.performanceDigital?.revenue ?? 0;
          // Gali besaran tekor modal uang keluar per episode
          const cost = latest?.financials?.costDirect ?? 0;
          // Balikin kalkulasi gabungan dua pemasukan disikat kurangin sama modal
          return rev + digRev - cost;
        },
        // Fungsi pengoles lipen riasan warna angka pas ngedetek kondisi angka di layar nyala ijo ato mera
        cellStyle: (
          // Penarik param cel bentuk baris
          params: CellClassParams<ProgramFormData, number>,
        ) => {
          // Tarik wujud angkanya atao pantek nol amannya
          const val = params.value ?? 0;
          // Lempar bungkusan objek style
          return {
            // Bold tebal nguat
            fontWeight: "bold",
            // Kondisional operator penentu bentuk cat, kelir merah tajem buat nomer jeblok ngutang di mari, ijo buat hasil laba gemuk cuan, selain itu ikut bawaan netral biasa
            color: val < 0 ? "#dc2626" : val > 0 ? "#16a34a" : "inherit",
            // Background cel dikit tipis ngasih wujud abu samar penanda beda sel ini spesial ga bisa diketik
            backgroundColor: "rgba(0,0,0,0.03)",
          };
        },
      },
      // Kolom input urusan cek masih ada berapa lubang kosong muat selipin sponsor produk di slot acara tayangan
      {
        // Info nama ujung
        headerName: "Inventory Spot",
        // Jarak bentangan
        width: 140,
        // Saklar buka izinin ganti wujud sel
        editable: true,
        // Parut bersih angka teks jadi float bulat suci nol
        valueParser: numberParser,
        // Tarik alat pancing panggil angka stok spot tayang dari ujung laci
        valueGetter: (
          // Bawa properti kantongan pancing param
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Korek laci ampe inventor spot nemu nyantol nol
          getActivePeriod(params.data, selectedPeriod)?.inventory?.spot ?? 0,
        // Lempar panah injeksi mutasi sel bentuk baru nyimpen balik database state
        valueSetter: (
          // Tangkep wujud kepingan isi barunya param
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Gali nyari titik bulannya akurat
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional nyegat celah buat beneran masuk kalo kepingan utuh ga bolong
          if (period) {
            // Nimpa wujud sisa sisa properti usang
            period.inventory.spot = params.newValue ?? 0;
            // Kabarin lolos verifikasi save ganti data
            return true;
          }
          // Tolakan balik nihil fungsi nyetop edit
          return false;
        },
      },
      // Kolom nulisin ongkos angka rupiah tarif patokan jualan nyewa durasi di iklan sela bentuk
      {
        // Judul header
        headerName: "Rate Iklan (Rp)",
        // Lebaran sekat pilar sel tabel ag
        width: 150,
        // Buka slot penulisan ijinin ubah nilai wujud sel
        editable: true,
        // Pasang obeng buang ngawur karakter ketik rubah nol mutlak aman
        valueParser: numberParser,
        // Kerek narik nyedot bongkahan harta properti tarif dari laci
        valueGetter: (
          // Penampung jaring bawaan
          params: ValueGetterParams<ProgramFormData, number>,
        ) =>
          // Ekstrak dalam ampe ketemu besaran angka ratenya nol pelindung
          getActivePeriod(params.data, selectedPeriod)?.inventory?.adRate ?? 0,
        // Pisau pembedah modif ganti numpuk ngedit bentuk isi sel rate baru update state
        valueSetter: (
          // Jaring param penangkep bentuk ketikan jari
          params: ValueSetterParams<ProgramFormData, number>,
        ) => {
          // Panggil helper nemuin letak alamat memori bentuk objek periode ini beneran tepat sasaran
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional jebakan penghadang ijo bentuk kalo objeknya nyata exist tanpa halangan
          if (period) {
            // Tusuk langsung nimpahin bongkahan data yang lama ampe bersih ketutup
            period.inventory.adRate = params.newValue ?? 0;
            // Bawa bendera sukses lempar balikan oke nyatain save kelar tanpa cela
            return true;
          }
          // Tolak palang merah mentah operasi dibatalkan ga jelas alasannya
          return false;
        },
      },
      // Kolom pilihan teks penilaian performa kondisi kpi stabil jelek ato cakep
      {
        // Nama info judul atas kolom
        headerName: "Status",
        // Jarak regangannya lebar ag grid
        width: 150,
        // Saklar buka izinin ketikan
        editable: true,
        // Pasang bentuk bungkusan editor menu pilih lungsur turun ag grid luar biasa gampang
        cellEditor: "agSelectCellEditor",
        // Alat pancing ujung narik teks label labelnya status acara tv
        valueGetter: (
          // Kantong tangkapan param
          params: ValueGetterParams<ProgramFormData, string>,
        ) =>
          // Ulik gedor laci nyari nyabut wujud label kalo gada copot sisa kosong aja aman
          getActivePeriod(params.data, selectedPeriod)?.status ?? "",
        // Penusuk modifikasi nyantolin label pilihan baru ngelempar ganti yang lama
        valueSetter: (
          // Jaring kiriman
          params: ValueSetterParams<ProgramFormData, string>,
        ) => {
          // Gali letak alamat kepingan beneran akurat
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kondisional gerbang penjaga mastiin titik bulan kepingan form ada nyata plus lemparan milih juga isinya kaga zonk kopong beneran klik option
          if (period && params.newValue) {
            // Tembak ubah nilai bentuk text string bener save state
            period.status = params.newValue;
            // Kirim pertanda oke bener berhasil save ganti properti
            return true;
          }
          // Nolak gagal mutasi data sel status
          return false;
        },
        // Konfigurasi rakitan isi muatan perut si menu lungsur turun dropdown bentuk option label
        cellEditorParams: {
          // Kumpulan pasukan array jejeran pilihan string bentuk ui dropdown status kpi
          values: [
            // Cemerlang bentuk pecah rekor mantap
            "Overachieve",
            // Aman sejalan rel bentuk pas kpi
            "Sesuai Target",
            // diem doang ga naik turun bentuk
            "Stabil",
            // Buntung bentuk jelek njeblok di luar nalar
            "Underperform",
            // Kacau ampe minus modal ga nutup jualan kaga laku bentuk parah
            "Rugi",
            // bentuk bawaan lahir wujud default sel baru biasa doang aman
            "Normal",
          ],
        },
      },
    ],
    // Pengawas memori mata mata kalo tiga saklar tuas wadah state id sama bongkahan row tabel plus tulisan bulan bentuk ganti kerek ulang racikan panjang lebar ini
    [editingId, rowData, selectedPeriod],
  );

  // Lempar semua senjata balikin bentuk fungsi turunan dan kotak kotak penampung state siap dirakit nempel dimari laci ui kodingan tempel depan komponen luar biasa rapi
  return {
    // Array wadah tumpukan program data suci hasil cidukan server backend
    programs,
    // Status boolean muter nunggu pertanda tarik data kueri nyala
    isLoading,
    // Jarum sakti penusuk jantung mesin ag grid nembus api tabel saklar
    gridRef,
    // Penanda boolean bentuk jendela pop depan muka idup nyala buka form ui
    isModalOpen,
    // Wadah khusus ngunci baris nyimpen ktp id dari program yang lagi operasi ketok mejik edit form
    editingId,
    // Kantong penampung id inceran korban hapus buang sisa abu
    deleteConfirmId,
    // Array penampung tumpukan bentuk baris pengisi slot laci tabel edit ag grid
    rowData,
    // Cetakan racikan kerangka pilar kolom tabel biasa mode baca read
    tableColumns,
    // Rakitan cetak dropdown bentuk jaring penyaring sortir data kategori tayangan list
    selectFilters,
    // Cetakan arsitektur monster mutan pilar baris super komplit edit massal bentuk ui nimpah form
    colDefs,
    // Wadah penampung teks filter angka kombinasi bulan bentuk aktif
    selectedPeriod,
    // Saklar pengubah state fungsi setter tuang lempar filter bentuk bulan
    setSelectedPeriod,
    // Tumpukan jajaran bentuk teks rentetan baris tanggal bulan turun siap jadi select menu ui
    periodOptions,
    // Keranjang kumpulan mutasi senjata penembak obeng merubah database ngerakit form data bener bentuk
    mutations: {
      // Obeng tuas bikin input baru buat seret database kueri react
      createMut,
      // Obeng perubah ketok mejik nimpa data lama jadi cakep form suci beneran nyala update
      updateMut,
      // Senapan penghancur delete ngebom row lenyap ilang bakar
      deleteMut,
    },
    // Kumpulan tombol fungsi perakit wujud bentuk ui buka klik tombol jeroan form hook use mutlak suci rapi
    actions: {
      // Tombol pencet buka laci gerbang modal pas nambah banyak borongan
      openAddModal,
      // Tombol pembuka kotak pandora bentuk modal ngebedah baris milih bener satu ketok
      openEditModal,
      // Tuas saklar tuang banting kerai modal sembunyiin bentuk ngilang hapus bersih sampah edit
      closeModal,
      // Aksi nambah kotak kosong sisa nyantolin baris di ujung pantat form bentuk ui ag tabel
      addRow,
      // Pemicu pendorong gerobak bungkusan paket ngangkut paksa save bentuk baris editan berderet ke server nembus tembakan api massal jitu
      submitBulkData,
      // Tuas ngaitin id sisa inceran target hapus ke wadah tong nunggu di dor
      setDeleteConfirmId,
    },
  };
}
