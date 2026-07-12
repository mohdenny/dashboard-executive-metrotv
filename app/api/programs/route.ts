// Perintah sakti buat maksa next js ga ngecache route ini selalu narik data baru tiap direfresh
export const dynamic = "force-dynamic";
// Perintah tambahan buat mastiin umur cache beneran nol detik
export const revalidate = 0;

// Import fungsi balasan server dari bawaan next js
import { NextResponse } from "next/server";
// Import sistem otentikasi token dari library resmi google auth
import { JWT } from "google-auth-library";
// Import modul pengelola file sheet dari library google spreadsheet
import { GoogleSpreadsheet } from "google-spreadsheet";
// Import skema validasi ketat dari konfigurasi zod lokal
import { programFormSchema } from "@/schemas/program";
// Import tipe data cetakan program dari skema biar ga kena error
import { ProgramFormData } from "@/schemas/program";

// Fungsi parser pinter buat ngebaca format campur aduk (koma ribuan vs koma desimal) tanpa pake any
const safeParseNumber = (value: unknown): number => {
  // Kalo kosong atau ga terdefinisi langsung balikin nol
  if (value === undefined || value === null || value === "") return 0;

  // Ubah ke string dulu biar aman diproses TypeScript
  let strValue = String(value).trim();

  // Kasus 1: Format bawaan sheet ada titik dan koma (misal: 1.500.000,50 atau 1,500,000.50)
  if (strValue.includes(".") && strValue.includes(",")) {
    const lastDot = strValue.lastIndexOf(".");
    const lastComma = strValue.lastIndexOf(",");
    // Kalo koma letaknya lebih di belakang, berarti koma itu desimal, titik itu ribuan
    if (lastComma > lastDot) {
      strValue = strValue.replace(/\./g, "").replace(/,/g, ".");
    } else {
      // Kalo titik lebih di belakang, berarti koma itu ribuan
      strValue = strValue.replace(/,/g, "");
    }
  }
  // Kasus 2: Cuma ada koma doang (misal: 1,513,593,794 atau 0,4 kayak di sheet mas danny)
  else if (strValue.includes(",")) {
    const lastComma = strValue.lastIndexOf(",");
    const charsAfterComma = strValue.length - lastComma - 1;

    // Kalo setelah koma persis 3 digit, 99% itu pemisah ribuan (contoh: 593,794)
    if (charsAfterComma === 3) {
      // Hapus SEMUA koma dari string
      strValue = strValue.replace(/,/g, "");
    } else {
      // Kalo bukan 3 digit, berarti koma itu desimal (contoh: 0,4 atau 3,5)
      strValue = strValue.replace(/,/g, ".");
    }
  }
  // Kasus 3: Cuma ada titik (misal: 1.513.593.794 atau 0.4)
  else if (strValue.includes(".")) {
    const lastDot = strValue.lastIndexOf(".");
    const charsAfterDot = strValue.length - lastDot - 1;
    // Kalo titiknya lebih dari satu, pasti itu pemisah ribuan
    if (strValue.split(".").length > 2) {
      strValue = strValue.replace(/\./g, "");
      // Kalo 1 titik doang tapi persis 3 digit di belakang, asumsi ribuan (Format ID)
    } else if (charsAfterDot === 3) {
      strValue = strValue.replace(/\./g, "");
    }
    // Sisanya biarin aja, berarti titik emang desimal standar JS
  }

  // Sapu bersih karakter aneh atau spasi yang nyempil (kecuali angka, titik, sama minus)
  strValue = strValue.replace(/[^0-9.-]/g, "");

  // Ubah balik jadi angka
  const num = Number(strValue);
  // Kalo hasilnya bukan angka (NaN), paksa jadi nol, kalo bener balikin angkanya
  return isNaN(num) ? 0 : num;
};

// Fungsi penangkap request get dari browser atau axios
export async function GET(
  // Parameter bawaan request dari next js buat ngebongkar url
  request: Request,
) {
  // Buka blok tangkapan antisipasi error pas eksekusi kode server
  try {
    // Ekstrak properti parameter query dari url request yang masuk
    const { searchParams } = new URL(request.url);
    // Cari parameter tahun dari url atau kasih nilai standar ke tahun sekarang
    const year = searchParams.get("year") || "2026";

    // Tarik id dokumen dari file env berdasar tahun atau balikin string kosong
    const sheetId = process.env[`GOOGLE_SHEET_ID_${year}`] || "";

    // Cegat proses kalo ternyata id dokumen belom didaftarin di env
    if (!sheetId) {
      // Lempar balasan error json ngasih tau dokumen ga ketemu
      return NextResponse.json(
        // Pesan error spesifik ngasih tau konfigurasi kosong
        { message: `Database sheet tahun ${year} belum disetting di env` },
        // Set status kode empat ratus tanda request bermasalah
        { status: 400 },
      );
    }

    // Rakit mesin otentikasi robot pake kredensial rahasia server dari env
    const serviceAccountAuth = new JWT({
      // Masukin alamat email bot yang disimpen di file konfigurasi
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Tarik kunci privat dari env terus benerin format baris barunya
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      // Set area otorisasi robot cuma buat baca dan nulis spreadsheet
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Panggil objek file sheet nembak ke id unik hasil tangkepan
    const doc = new GoogleSpreadsheet(
      // Tancepin id dokumen target
      sheetId,
      // Tancepin sistem otentikasi bot
      serviceAccountAuth,
    );

    // Tunggu proses sedot informasi dasar file sheet kelar
    await doc.loadInfo();

    // Siapin ember map kosong buat ngumpulin dan gabungin data program
    const programsMap = new Map<string, ProgramFormData>();
    // Siapin map baru khusus buat ngelacak posisi baris error biar gampang dicari
    const trackerMap = new Map<string, string[]>();

    // Buka putaran perulangan buat ngecek satu per satu tab di dokumen
    for (let i = 0; i < doc.sheetCount; i++) {
      // Tarik objek tab lembar kerja berdasar urutan index
      const sheet = doc.sheetsByIndex[i];
      // Ambil teks judul nama tab yang dipake sebagai penanda bulan
      const monthName = sheet.title;

      // Lewatin tab log activity sama log session biar ga ikut keparse
      if (monthName.toLowerCase().includes("log")) continue;

      // Kasih tau library kalo posisi judul tabel header ada di baris nomor lima
      await sheet.loadHeaderRow(5);

      // Tarik seluruh deretan baris data khusus di tab bulan ini mulai dari baris enam
      const rows = await sheet.getRows();

      // Putar perulangan ngebongkar tiap baris data dari tab
      rows.forEach((row) => {
        // Ambil teks nama program atau lempar string kosong kalo selnya sepi
        const programName = row.get("Nama Program") || "";

        // Loncat ke baris berikutnya kalo sel nama program beneran kosong melompong
        if (!programName) return;

        // Tarik posisi angka baris asli dari objek row bawaan library
        const rowNumber = row.rowNumber;

        // Kondisional ngecek apakah tracker map udah punya nama program ini belom
        if (!trackerMap.has(programName)) {
          // Bikin laci array kosong baru buat nampung jejak baris program ini
          trackerMap.set(programName, []);
        }
        // Dorong info lokasi spesifik nama tab dan nomor baris ke laci pelacak
        trackerMap
          .get(programName)
          ?.push(`Tab '${monthName}' Baris ${rowNumber}`);

        // Ambil teks kategori dari sel
        const category = row.get("Kategori") || "";
        // Ambil info jam tayang acara
        const broadcastTime = row.get("Jam Tayang") || "";
        // Ambil rincian deskripsi program
        const descriptionCategory = row.get("Deskripsi") || "";

        // Kondisional cek apa ember map belom nyimpen nama program ini
        if (!programsMap.has(programName)) {
          // Tancepin kerangka program utuh baru ke dalem map kalo belom ada
          programsMap.set(programName, {
            // Isi id pake nama program sementara
            id: programName,
            // Masukin nama program hasil tangkepan
            name: programName,
            // Masukin jam tayang
            broadcastTime,
            // Masukin info kategori
            category,
            // Masukin teks deskripsi acara
            descriptionCategory,
            // Siapin laci array kosong buat nimpa rincian data periode bulanan
            periods: [],
          });
        }

        // Tarik kembali objek program utuh yang ada di map buat ditambahin metriknya
        const program = programsMap.get(programName);

        // Kondisional mastiin objek program beneran keciduk dari memori map
        if (program) {
          // Dorong kumpulan data metrik baris ini masuk ke array periode
          program.periods.push({
            // Bikin id periode unik hasil gabungan nama dan bulan
            id: `${programName}-${monthName}`,
            // Tancepin nama bulan langsung dari teks judul tab
            month: monthName,
            // Buka objek khusus penampung metrik performa tv
            performanceTV: {
              // Ubah teks target tvr pake helper pintar
              targetTVR: safeParseNumber(row.get("Target TVR")),
              // Ubah teks target share jadi nomor aman pake helper pintar
              targetShare: safeParseNumber(row.get("Target Share")),
              // Ubah teks actual tvr pake helper pintar
              actualTVR: safeParseNumber(row.get("Capaian TVR")),
              // Ubah teks actual share jadi data angka aman
              actualShare: safeParseNumber(row.get("Capaian Share")),
            },
            // Buka objek kumpulan performa sosmed digital
            performanceDigital: {
              // Tarik info views digital terus ubah jadi angka
              views: safeParseNumber(row.get("Digital Views")),
              // Tarik omset revenue digital rubah formatnya
              revenue: safeParseNumber(row.get("Digital Revenue")),
            },
            // Buka wadah khusus buat laporan finansial
            financials: {
              // Ubah teks pengeluaran operasional jadi angka aman
              costDirect: safeParseNumber(row.get("Cost Direct")),
              // Ubah target omset jadi format angka
              revenueTarget: safeParseNumber(row.get("Target Revenue")),
              // Ubah omset aktual jadi numerik pake helper
              revenueActual: safeParseNumber(row.get("Capaian Revenue")),
              // Ubah keuntungan pnl jadi nomor
              pnl: safeParseNumber(row.get("PNL")),
            },
            // Buka objek sisa ruang iklan
            inventory: {
              // Hitung ketersediaan spot iklan pake parser
              spot: safeParseNumber(row.get("Inventory Spot")),
              // Hitung harga tarif iklan pake helper aman
              adRate: safeParseNumber(row.get("Rate Iklan")),
            },
            // Tarik keterangan status dari sheet
            status: row.get("Keterangan") || "",
          });
        }
      });
    }

    // Siapin array penampung data akhir yang udah terbukti valid ngelewatin zod
    const validPrograms: ProgramFormData[] = [];
    // Siapin wadah array penyimpan teks error yang bakal dilempar ke ui
    const syncErrors: string[] = [];

    // Lakukan putaran periksa satu per satu ke setiap objek di map
    programsMap.forEach((program) => {
      // filter data mentah pake validasi zod biar tipe datanya terjamin aman
      const parsed = programFormSchema.safeParse(program);
      // Kondisional cek tembus status sukses
      if (parsed.success) {
        // Masukin paksa data yang udah lolos ke ember valid programs
        validPrograms.push(parsed.data);
        // Cabang kondisi kalo data meleset dari aturan skema
      } else {
        // Tarik jejak lokasi baris dari tracker map gabungin pake kata hubung
        const locationStr =
          trackerMap.get(program.name)?.join(" dan ") ||
          "Lokasi Tidak Diketahui";

        // Ekstrak rincian masalah zod jadi list string biar gampang dibaca
        const errorDetails = parsed.error.issues
          // Map tiapa isu ke format string jelas
          .map((issue) => `[${issue.path.join(".")}] -> ${issue.message}`)
          // Gabungin isu pake garis tegak
          .join(" | ");

        // Rakit kalimat error seutuhnya bawa nama lokasi sama rincian
        const errorMsg = `Program '${program.name}' (Berada di ${locationStr}) Ditolak: ${errorDetails}`;

        // Cetak log merah ke terminal server tetep jalan
        console.error(`[SKIP DATA] ${errorMsg}`);

        // Dorong teks error masuk ke dalem array biar bisa dikirim balik ke frontend
        syncErrors.push(errorMsg);
      }
    });

    // Balikin objek json bawa data valid sama koper isi pesan error
    return NextResponse.json({
      // Lempar data aslinya
      data: validPrograms,
      // Lempar tumpukan errornya juga
      errors: syncErrors,
    });
    // Tutup blok try dan tangkep semua potensi error
  } catch (error) {
    // Cetak log merah ke terminal server pas gagal konek sheet
    console.error("Gagal sinkronisasi dari Google Sheet:", error);
    // Lempar respon error lima ratus ke browser
    return NextResponse.json(
      // Buka objek pesan rincian masalah
      { message: "Gagal memproses data dari spreadsheet" },
      // Set status internal server error
      { status: 500 },
    );
  }
}
