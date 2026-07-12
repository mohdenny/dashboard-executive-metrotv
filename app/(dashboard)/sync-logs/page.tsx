"use client";

import React from "react";
// Import icin dari lucide react buat visual error
import { AlertCircle, Database, CheckCircle2, RefreshCcw } from "lucide-react";
import useSyncLogs from "@/hooks/useSyncLogs";

// Fungsi komponen halaman khusus buat mantau log error sinkronisasi sheet
export default function SyncLogsPage() {
  // Bongkar koper data dari hook buat narik array error sama status loading
  const {
    // Ekstrak tumpukan pesan error hasil tarikan api
    syncErrors,
    // Ekstrak status boolean tanda mesin lagi nyedot data
    isLoading,
    // Ekstrak tombol refetch buat fitur refresh manual
    refetch,
  } = useSyncLogs();

  // Buka blok balikan render ui
  return (
    // Buka div pembungkus utama halaman lebar mentok
    <div
      // Kasih jarak padding sekeliling biar lega tampilannya
      className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300"
    >
      {/* Buka kotak header halaman */}
      <div
        // Kasih style flex berjejer sama jarak antar elemen
        className="flex items-center justify-between bg-card p-6 rounded-2xl shadow-sm border border-border"
      >
        {/* Buka wadah teks judul halaman */}
        <div
          // Susun ke bawah
          className="flex flex-col gap-1"
        >
          {/* Buka heading judul utama */}
          <h1
            // Kasih font gede tebel warna utama
            className="text-2xl font-bold text-foreground flex items-center gap-2"
          >
            {/* Tempel icon database di samping judul */}
            <Database
              // Ukuran icon dua puluh empat
              size={24}
              // Warnain icon pake kelir primer
              className="text-primary"
            />
            {/* Teks judul */}
            Log Sinkronisasi Google Sheet
          </h1>
          {/* Buka teks keterangan sub judul */}
          <p
            // Tipisin warna sama ukurannya biar wajar
            className="text-sm text-muted-foreground"
          >
            {/* Teks penjelasan fungsi halaman */}
            Pantau status tarikan data mentah dari spreadsheet dan cek baris
            mana aja yang gagal masuk sistem
          </p>
        </div>

        {/* Tombol sakti pemaksa sinkron ulang data */}
        <button
          // Pasang aksi klik nembak fungsi refetch
          onClick={() => refetch()}
          // Matikan klik pas mesin lagi sibuk loading
          disabled={isLoading}
          // bentuk tombol transisi mulus pointer
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {/* Gambar icon muter */}
          <RefreshCcw
            // Lebar icon enam belas
            size={16}
            // Kondisional bikin muter pas lagi loading
            className={isLoading ? "animate-spin" : ""}
          />
          {/* Teks dalem tombol */}
          Sinkron Ulang
        </button>
      </div>

      {/* Kondisional cek kalo status loading lagi nyala muter nyedot data bakal nampilin layar nunggu, terus kalo palsu lanjut ngecek jumlah error buat nampilin kotak merah, dan terakhir balikin kotak ijo kalo data beneran bersih mulus */}
      {isLoading ? (
        // Buka kotak status loading tengah layar
        <div
          // Tengahin posisi elemen pake flex
          className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border shadow-sm gap-4"
        >
          {/* Gambar icon muter tanda mikir */}
          <RefreshCcw
            // Ukuran empat puluh
            size={40}
            // Bikin iconnya muter terus pake animasi tailwind
            className="animate-spin text-primary"
          />
          {/* Teks penenang nyuruh user sabar nunggu */}
          <span
            // Kasih style huruf tebel tipis
            className="text-lg font-medium text-muted-foreground"
          >
            {/* Teks dalem kotak */}
            Lagi nyedot data dari Google Sheet...
          </span>
        </div>
      ) : syncErrors.length > 0 ? (
        // Buka kotak peringatan merah kalo ada tumpukan error nyata
        <div
          // Kasih warna latar merah pudar tanda awas
          className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 shadow-sm"
        >
          {/* Buka kepala peringatan */}
          <div
            // Jejerin icon sama teks pake flex
            className="flex items-center gap-3 text-destructive font-bold mb-4 border-b border-destructive/20 pb-4"
          >
            {/* Icon tanda seru bahaya */}
            <AlertCircle
              // Ukuran dua puluh delapan
              size={28}
            />
            {/* Teks pemberitahuan jumlah data yang hancur */}
            <span
              // Kasih ukuran gede dikit
              className="text-xl"
            >
              {/* Teks jumlah error */}
              Ditemukan {syncErrors.length} Data Program Gagal Tersinkronisasi
            </span>
          </div>
          {/* Buka laci panjang buat nampung rentetan teks error */}
          <div
            // Kasih warna latar gelap dikit biar kontras sama wujud scroll
            className="bg-background/80 rounded-xl p-4 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-3 border border-border/50"
          >
            {/* Lakukan perulangan bongkar array error putar */}
            {syncErrors.map((err, idx) => (
              // Buka kepingan span teks per error
              <span
                // Kunci identitas elemen
                key={idx}
                // Kasih garis bawah pemisah antar error
                className="border-b border-border/50 pb-3 last:border-0 last:pb-0 text-sm font-medium text-muted-foreground leading-relaxed flex items-start gap-2"
              >
                {/* Tulis teks info nomor urut biar rapi */}
                <strong
                  // Tebelin dan warnain merah teks nomernya
                  className="text-destructive mt-0.5"
                >
                  {/* Teks angka nomer */}#{idx + 1}
                </strong>
                {/* Buka span penampung pesan utuh */}
                <span>
                  {/* Cetak teks pesan error aslinya ke layar */}
                  {err}
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        // Buka kotak ijo kalo data bersih mulus kaga ada error
        <div
          // Tengahin konten
          className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border shadow-sm gap-4"
        >
          {/* Gambar icon ceklis ijo */}
          <CheckCircle2
            // Ukuran gahar empat puluh
            size={40}
            // Warna ijo terang
            className="text-green-500"
          />
          {/* Teks seneng ngabarin sinkronisasi mantap */}
          <span
            // Kasih ukuran gedean
            className="text-lg font-medium text-muted-foreground text-center max-w-md"
          >
            {/* Teks berhasil bersih */}
            Semua data dari Google Sheet berhasil ditarik dan tervalidasi. Tidak
            ada data yang tidak lengkap!
          </span>
        </div>
      )}
    </div>
  );
}
