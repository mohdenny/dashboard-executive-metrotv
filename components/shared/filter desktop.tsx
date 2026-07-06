

// // Box Filter Utama

// import { RefreshCcw } from "lucide-react";

//   <div className="bg-card px-6 py-4 rounded-2xl flex lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
//   {/* Kontainer info update terakhir */}
//     <div className="flex shrink-0 items-center gap-2">
//       {/* Teks label update */}
//       <p className="text-sm text-muted-foreground font-medium hidden sm:block">
//         Pembaruan terakhir:
//       </p>
//       {/* Badge waktu update */}
//       <span className="text-sm md:text-base bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold flex items-center gap-1">
//         {/* Ikon refresh */}
//         <RefreshCcw className="md:size-[14px] size-[12px]" /> {lastUpdated}
//       </span>
//     </div>

//     {/* Kontainer label periode */}
//     <div className="w-full text-center hidden md:block">
//       {/* Badge label periode aktif */}
//       <span className="text-sm text-muted-foreground font-medium bg-muted/40 px-4 py-1.5 rounded-full border border-border">
//         {/* Teks data ditampilkan */}
//         Data Ditampilkan: {/* Nilai periode aktif */}
//         <span className="font-bold text-foreground">
//           {displayedPeriodLabel}
//         </span>
//       </span>
//     </div>
  
//           {/* Kontainer label periode mobile */}
//           <div className=" text-center">
//             {/* Badge label periode aktif */}
//             <span className="md:hidden block text-sm text-muted-foreground font-semibold bg-muted/40 px-2 py-1 rounded-full border border-border">
//                 {displayedPeriodLabel}
//               </span>
//           </div>

//         {/* Kontainer filter kategori dan periode */}
//         <div className="md:flex hidden items-center gap-4">
//           {/* Select buat filter kategori */}
//           <CustomSelect
//             // Nilai filter aktif
//             value={selectedCategory ?? ""}
//             // Update state kategori
//             onChange={setSelectedCategory}
//             // List opsi kategori
//             options={programCategories.map((c) => ({ label: c, value: c }))}
//             // Teks placeholder
//             placeholder="Pilih Kategori"
//             // Atur lebar fit
//             width="fit"
//           />

//           {/* Kontainer filter periode */}
//           <div className="flex flex-row items-center gap-4">
//             {/* Select buat filter periode */}
//             <CustomSelect
//               // Nilai periode aktif
//               value={selectedPeriod ?? ""}
//               // Update state periode
//               onChange={setSelectedPeriod}
//               // List opsi periode
//               options={periodOptions.map((opt) => ({
//                 label: opt.label,
//                 value: opt.value,
//               }))}
//               // Style css
//               className="w-full sm:w-auto"
//               // Atur lebar fit
//               width="fit"
//             />

//             {/* Kontainer tanggal custom */}
//             <div className="flex flex-wrap items-center gap-3">
//               {/* Cek kalo periode custom aktif */}
//               {selectedPeriod === "custom" && (
//                 // Kontainer input tanggal
//                 <div className="flex items-center gap-2 w-full sm:w-auto">
//                   {/* Input bulan awal */}
//                   <input
//                     // Tipe input bulan
//                     type="month"
//                     // Nilai state awal
//                     value={startMonth}
//                     // Update state awal
//                     onChange={(e) => setStartMonth(e.target.value)}
//                     // Styling input
//                     className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
//                   />
//                   {/* Teks s/d */}
//                   <span className="text-muted-foreground text-xs">s/d</span>
//                   {/* Input bulan akhir */}
//                   <input
//                     // Tipe input bulan
//                     type="month"
//                     // Nilai state akhir
//                     value={endMonth}
//                     // Update state akhir
//                     onChange={(e) => setEndMonth(e.target.value)}
//                     // Styling input
//                     className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
//                   />
//                 </div>
//               )}
//               {/* Kondisional buat tampilin tombol reset filter */}
//               {(startMonth ||
//                 endMonth ||
//                 selectedCategory ||
//                 (selectedPeriod && selectedPeriod !== "all")) && (
//                 // Tombol reset filter
//                 <button
//                   // Fungsi buat kosongin semua state filter
//                   onClick={() => {
//                     setStartMonth("");
//                     setEndMonth("");
//                     setSelectedCategory(null);
//                     setSelectedPeriod("all");
//                   }}
//                   // Styling tombol reset
//                   className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
//                 >
//                   {/* Ikon filter x */}
//                   <FilterX size={14} /> Reset
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/*mobile */}
//         <div className="flex md:hidden">
//           <>
//           <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card rounded-[24px] border border-border/50 transition-colors duration-200">
//             <div className="flex justify-between items-center w-full sm:w-auto">
//               {startMonth ||
//                 endMonth ||
//                 selectedCategory ||
//                 selectedPeriod ? <button
//                   onClick={() => {
//                     setStartMonth("");
//                     setEndMonth("");
//                     setSelectedCategory(null);
//                     setSelectedPeriod("");
//                   }}
//                   className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
//                 >
//                   <FilterX size={14} /> Reset Filter
//                 </button>
//                 : 
                
//                 <button
//                 onClick={() => setIsMobileModalOpen(true)}
//                 className="flex items-center justify-center shadow-sm text-primary py-[4px] px-4 rounded-xl text-sm font-medium shrink-0 transition-colors"
//               >
//                 <Filter size={14} className="mr-2 stroke-primary" />
//                 Filter
//               </button>}
//             </div>
//           </div>

//       {isMobileModalOpen && (
//         <div className="fixed inset-0 z-20 flex flex-col justify-end">
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
//             onClick={() => setIsMobileModalOpen(false)}
//           />
//           <div className="relative w-full bg-background rounded-t-[24px] p-5 pb-14 animate-in slide-in-from-bottom-full duration-300 shadow-2xl flex flex-col max-h-[90vh]">
//             <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-5 shrink-0" />

//             <div className="flex justify-between items-center mb-5 shrink-0">
//               <h2 className="text-xl font-semibold text-foreground">
//                 Filter & Urutkan
//               </h2>
//               <button
//                 onClick={() => setIsMobileModalOpen(false)}
//                 className="p-1.5 bg-muted rounded-full shadow-md border--border text-muted-foreground transition-colors"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             {/*Kategori */}
//               <div className="flex flex-col justify-around gap-6 overflow-y-auto p-2 ">
               
//                <div>
//                 <span className="text-lg text-semibold">Kategori</span>
//                 <select
//                   value={selectedCategory ?? ""}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   className="border mt-2 border-border bg-card text-foreground text-md font-medium rounded-lg focus:outline-1 focus:outline-primary truncate block pl-4 pr-10 py-0 h-10 cursor-pointer w-full"
//                 >
//                 <option
//                   value=""
//                   className="bg-muted/40 text-foreground"
//                   disabled
//                   hidden
//                 >
//                   Semua Kategori
//                 </option>
//                 <option
//                     key={"all"}
//                     value= ""
//                     className="bg-muted/40 text-foreground"
//                   >
//                     Semua Kategori 
//                   </option>
//                 {programCategories.map((categoryName, idx) => (
//                   <option
//                     key={idx}
//                     value={categoryName}
//                     className="bg-muted/40 text-foreground"
//                   >
//                     {categoryName}
//                   </option>
//                 ))}
//                 </select>
//                </div>
              

//               {/*Periode */}
//               <div className="flex flex-col">
//                   <span className="text-lg text-semibold">Periode</span>
//                   <div className="bg-card border border-border rounded-full flex flex-row items-stretch mt-2">

//                     <div className={`flex flex-1 justify-center items-center rounded-s-full transition-all  px-1 py-2
//                     ${selectedPeriod === 'all' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
//                     onClick={(e) => setSelectedPeriod('all')}>

//                       All
//                     </div>
//                     <div className={`flex flex-1 justify-center items-center transition-all  px-2 py-2
//                     ${selectedPeriod === 'ytd' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
//                     onClick={(e) => setSelectedPeriod('ytd')}>
//                       <span>
//                         Tahun
//                       </span>
//                     </div>
//                     <div className={`flex flex-1 justify-center items-center transition-all  px-2 py-2
//                     ${selectedPeriod === '30d' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
//                     onClick={(e) => setSelectedPeriod('30d')}>
//                       <span>
//                         Bulan
//                       </span>
//                     </div>
//                     <div className={`flex flex-1 justify-center items-center rounded-e-full transition-all  px-2 py-2
//                     ${selectedPeriod === '7d' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
//                     onClick={(e) => setSelectedPeriod('7d')}>
//                       <span>
//                         Minggu
//                       </span>
//                     </div>
//                 </div>
//               </div>

//               {/*Kalender */}
//                 <div className="flex flex-col">
//                   <label className="text-lg mb-2 text-semibold">Pilih Periode</label>
//                   <div className="flex items-center gap-2 w-full">
//                     <input
//                       type="month"
//                       value={startMonth}
//                       onChange={(e) => setStartMonth(e.target.value)}
//                       className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
//                     />
//                     <span className="text-muted-foreground text-xs">s/d</span>
//                     <input
//                       type="month"
//                       value={endMonth}
//                       onChange={(e) => setEndMonth(e.target.value)}
//                       className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
//                     />
//                   </div>
//                 </div>

//             </div>
            
            

//         </div>
//       </div>
//       )}
//           </>
//         </div>
        
//   </div>