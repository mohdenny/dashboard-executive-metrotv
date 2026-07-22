// Wajib pake installedTrigger, bgiar bisa pake UrlFetchApp buat nembak API backendnnya
// Kalo pake fungsi bawaan onEdit ga bisa nembak API luar pake UrlFetchApp, dibatasin sama gugel, makannya harus installedTrigger

const pushDataToAPI = (e) => {
  Logger.log("Fungsi dipanggil");
  // Bawaan google gembok antrian script biar ga bentrok kalo banyak user yang ngedit barengan
  const lock = LockService.getScriptLock();

  try {
    // Tahan eksekusi maksimal 10 detik nunggu antrian kalo ada user lain lagi ngedit
    // Yang antri disini itu sistem eksekusi appscriptnya di server googlenya, bukan usernya
    // Jadi kalo di sisi user ketikan di sheetnya mah tetep lancar ga ngelag atau macet
    // Cuma proses pas kirim data serencengannya aja ke backend yang digilir goole biar masuknya rapi satu2 ngantri
    lock.waitLock(10000);

    // Pastiin ada objek event yang masuk, kalo ga ada cegat
    if (!e) return;

    // Inisiasi objek sheet yang lagi aktip diedit user
    const sheet = e.source.getActiveSheet();

    // Tarik nama tab sheetnya
    const sheetName = sheet.getName();

    // Tarik row yang lagi diedit
    const editedRow = e.range.getRow();

    // Cegat proses kalo yang diedit ada di baris header atau diatasnya
    if (editedRow <= 5) return;

    // Tarik data mentah header di row 5 dari ujung kiri ke ujung kanan data
    // Ambil data header di baris 5, mulai dari kolom A, ambil 1 baris, sampai ujung kanan
    // Disini sapu bersih bakal ambil semua header di baris ke 5 dari ujung kiri kolom A sampe ke ujung kanan
    const headersRaw = sheet
      .getRange(5, 1, 1, sheet.getLastColumn())
      .getValues();

    // Siapin tampungan kosong buat susunan judul yang udah rapih
    let headers = [];

    // Kalo datanya beneran ada, bersihin spasi, terus kecilin semua huruf
    if (headersRaw.length > 0) {
      Logger.log("Blok if bersihin data dimulai");
      // Masukin yang udah bersih ke tampungan
      headers = headersRaw[0].map((h) => {
        return String(h).trim().toLowerCase();
      });
    }

    Logger.log("Isi tampungan headers");
    Logger.log(headers);

    // Daftarin nama header yang mau diambil datanya, kalo yang ga ad disini ga diambil meskipun di headerRaws nyapu bersih ambil semua
    // Ini fokus sheet yang dari user
    // Kalo yang iklan urusan BMS
    const dataColsName = [
      "nama program",
      "kategori",
      "jam tayang",
      "deskripsi",
      "target tvr",
      "target share",
      "capaian tvr",
      "capaian share",
      "cost direct",
      "target revenue",
      "capaian revenue",
      "digital views",
      "digital revenue",
      "pnl",
      "keterangan",
    ];

    // Fungsi buat nyari index array dari data mentah yang udah bersih dari headers dicocokin sama parameter nama header ysng dlist manual
    const getColIdx = (name) => {
      return headers.indexOf(name);
    };

    // Bikin Array objek, isinya nama progran yang udah bersih  sama tandain pake index, indexnya didapetin dari fungsi getColIdx
    // Soalnya headersRaw yang diambil dari Google Sheet cuma nama aja
    // [
    //   { key: "nama program", colIndex: 1 },
    //   { key: "kategori", colIndex: 2 }
    // ]
    const monitoredColumns = dataColsName
      .map((name) => {
        return {
          // Simpen nama headernya
          key: name,
          // Cari urutan index kolomnya + 1 soalnya mulai dari angka 1, index js mulai dari 0 soalnya
          colIndex: getColIdx(name) + 1,
        };
        // Buang data yang nilainya 0, soalnya headernya ga ketemu pas dicocokin
        // Diawalkan tadi di headerRaws yang null ato kosong kan juga diambil kaya kolom A di sheet ini
      })
      .filter((col) => {
        return col.colIndex !== 0;
      });

    Logger.log("Array objek header yang udah ditandain");
    Logger.log(monitoredColumns);

    // Siapin tampungan objek kosong
    let rowData = {};

    // Loop datanya satu2 daftar kolom yang udah ditandain
    // Pake forEach soalnya buat mutating bject, ga perlu bikin array baru
    // Cara kerjanya dia cuma looping doang berdasarkan baris yang lagi diedit, terus dia ambil serenceng barisan mendatar
    // Jadi dia ambil nilainya ga spesifik tapi serenceng barisan itu, ibarat satu id form kalo di ui frontend
    // Jadi kaya CRUD di POST EDIT kan meskipun yang di edit cuma 1 nilai yang 2 nyatetetep dikirim lagi, bukan PATCH yang dikirim sebagian
    // Dsini cukup 1 baris getRange, SYARATNYA KOLOMNYA HARUS DATAR, JANGAN ADA YANG MERGE
    // Biar otomatis nyapu misal 15 kolom, kebal dari geser tabel
    // Kalo statis nentuin row sama colnya di getRangenya satu2
    // Kalo ada 15 kolom tulis 15 kolom, kalo pindah posisi harus nentuin manual lagi
    // contohnya kaya misal nentuin 3 getRange
    // Kolom B (2)
    // rowDataManual["nama program"]   = sheet.getRange(editedRow, 2).getValue();
    // Kolom C (3)
    // rowDataManual["kategori"]       = sheet.getRange(editedRow, 3).getValue();
    // Kolom D (4)
    // rowDataManual["jam tayang"]     = sheet.getRange(editedRow, 4).getValue();
    monitoredColumns.forEach((col) => {
      // Tarik value dari index sel spesifiknya di row yang lagi diedit
      let val = sheet.getRange(editedRow, col.colIndex).getValue();
      // Tancepin valuenya ke dalem objek, kalo celnya kosong kasih null
      rowData[col.key] = val !== "" ? val : null;

      Logger.log("Row ke:" + editedRow);
      Logger.log("Kolom ke:" + col.key);
      Logger.log("Nilainya:" + rowData[col.key]);
    });

    Logger.log("Hasil akhir datanya");
    Logger.log(rowData);

    // Cegat kalo nama programnya kosong
    // Nama program ini kaya forignkey kalo nanti data BMS ada, pas dikawinin datanya

    // Rakit payloadnya buat dikirim ke backend
    const payload = {
      // Kirim periode bulan dari tab sheetnya
      periodeMonth: sheetName,
      // Kirim nomor rownya yang berubah
      rowNumber: editedRow,
      // Kirim datanya
      data: rowData,
    };

    Logger.log("Bentuk payloadnya yang mau dikirim ke backend");
    Logger.log(payload);

    // KOnfigurasi request buat tembakan apinya
    const options = {
      // Pake metode post buat ngirim data
      method: "post",
      // Format tipe datanya json
      contentType: "application/json",
      // Ubah objek payload jadi string json
      payload: JSON.stringify(payload),
      // Tambahin header token rahasia buat keamanan akses
      // Ini mah opsi aja
      headers: {
        Authorization: "Bearer RAHASIA_BANGET_POKOKNYA_ADA",
      },
    };

    // Bentuk payloadnya
    Logger.log("Bentuk payload jsonnya dari gs yang mau ditembak ke API");
    Logger.log(options);

    // Tembak api pake UrlFetchApp
    // Urlnya belom ada itu urlnya misalnya aja
    // UrlFetchApp.fetch("https://dashboard.metrotvnews.tv/api/sheet", options);

    // Tangkep error kalo proses nyedot data dari sheetnya ato nembak api gagal
  } catch (error) {
    Logger.log("Gagal nembak data: " + error.toString());
  } finally {
    // Lepas gembok antrian biar script user lain bisa jalan
    lock.releaseLock();
  }
};
