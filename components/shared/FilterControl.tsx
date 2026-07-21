import useDashboard from "@/hooks/useDashboard";
import { Filter, FilterX, History, RefreshCcw, X } from "lucide-react";
import { SetStateAction, useState } from "react";
import CustomSelect from "./CustomSelect";
import { Dispatch } from "react";

interface FilterControlProps {
    selectedCategory: string | null;
    setSelectedCategory: Dispatch<SetStateAction<string | null>>;
    selectedPeriod: string | null;
    setSelectedPeriod: Dispatch<SetStateAction<string | null>>,
    startMonth: string ,
    endMonth: string ,
    setStartMonth: Dispatch<SetStateAction<string>> ,
    setEndMonth: Dispatch<SetStateAction<string>> ,
    displayedPeriodLabel: string ,
    lastUpdated: string ,
    periodOptions: {
      label: string,
      value: string,
    }[],
    programCategories: string[],
}

export default function FilterControl({selectedCategory,
    setSelectedCategory,
    selectedPeriod, 
    setSelectedPeriod,
    startMonth,
    endMonth,
    setStartMonth,
    setEndMonth,
    displayedPeriodLabel,
    lastUpdated,
    periodOptions,
    programCategories,}: FilterControlProps){
  type Period = 'all' | 'ytd' | '30d' |'7d' | string;

  const [isMobileModalOpen, setIsMobileModalOpen]= useState(false);
  const [PeriodValue, SetPeriodValue] = useState<Period>('');
  const [CategoryValue, SetCategoryValue] = useState<string|null>(null);
  const [StartMonthValue, setStartMonthValue] = useState<string>("");
  const [EndMonthValue, setEndMonthValue] = useState<string>("");
  
  return(
    
    // Box filter utama 
      <div className="bg-card md:px-6 px-4 md:py-4 py-3 border-border border rounded-xl flex lg:flex-row items-center justify-between shadow-sm">
      {/* Kontainer info update terakhir */}
      
    <div className="shrink-0 hidden md:flex items-center gap-2">
      {/* Teks label update */}
      <p className="text-sm text-muted-foreground font-medium hidden md:flex">
        Pembaruan terakhir:
      </p>
      {/* Badge waktu update */}
      <span className="text-sm md:text-base bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold flex items-center gap-1">
        {/* Ikon refresh */}
        <RefreshCcw className="size-[12px]" /> {lastUpdated}
      </span>
    </div>

    {/* Kontainer label periode */}
    <div className="w-full text-center hidden md:block">
      {/* Badge label periode aktif */}
      <span className="text-sm text-muted-foreground font-medium bg-muted/40 px-4 py-1.5 rounded-full border border-border">
        {/* Teks data ditampilkan */}
        Data Ditampilkan: {/* Nilai periode aktif */}
        <span className="font-bold text-foreground">
          {displayedPeriodLabel}
        </span>
      </span>
    </div>
  
    <div className="flex md:hidden flex-col gap-1 content-center">
      <span className="text-base font-semibold text-muted-foreground">
        {displayedPeriodLabel}
      </span>
      <span className="text-sm text-muted-foreground/60">
        {lastUpdated}
      </span>
      
    </div>
          

       {/* Kontainer filter kategori dan periode */}
        <div className="md:flex items-center gap-4 hidden">
          {/* Select buat filter kategori */}
          <CustomSelect
            // Nilai filter aktif
            value={selectedCategory ?? ""}
            // Update state kategori
            onChange={setSelectedCategory}
            // List opsi kategori
            options={programCategories.map((c) => ({ label: c, value: c }))}
            // Teks placeholder
            placeholder="Pilih Kategori"
            // Atur lebar fit
            width="fit"
          />

          {/* Kontainer filter periode */}
          <div className="hidden md:flex flex-row items-center gap-4">
            {/* Select buat filter periode */}
            <CustomSelect
              // Nilai periode aktif
              value={selectedPeriod ?? ""}
              // Update state periode
              onChange={setSelectedPeriod}
              // List opsi periode
              options={periodOptions.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              // Style css
              className="w-full sm:w-auto"
              // Atur lebar fit
              width="fit"
            />

            {/* Kontainer tanggal custom */}
            <div className="hidden md:flex flex-wrap items-center gap-3">
              {/* Cek kalo periode custom aktif */}
              {selectedPeriod === "custom" && (
                // Kontainer input tanggal
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Input bulan awal */}
                  <input
                    // Tipe input bulan
                    type="month"
                    // Nilai state awal
                    value={startMonth}
                    // Update state awal
                    onChange={(e) => setStartMonth(e.target.value)}
                    // Styling input
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                  {/* Teks s/d */}
                  <span className="text-muted-foreground text-xs">s/d</span>
                  {/* Input bulan akhir */}
                  <input
                    // Tipe input bulan
                    type="month"
                    // Nilai state akhir
                    value={endMonth}
                    // Update state akhir
                    onChange={(e) => setEndMonth(e.target.value)}
                    // Styling input
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                </div>
              )}
              {/* Kondisional buat tampilin tombol reset filter */}
              {(startMonth ||
                endMonth ||
                selectedCategory ||
                (selectedPeriod && selectedPeriod !== "ytd")) && (
                // Tombol reset filter
                <button
                  // Fungsi buat kosongin semua state filter
                  onClick={() => {
                    setStartMonth("");
                    setEndMonth("");
                    setSelectedCategory(null);
                    setSelectedPeriod("ytd");
                  }}
                  // Styling tombol reset
                  className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  {/* Ikon filter x */}
                  <FilterX size={14} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/*mobile filter button*/}
        <div className="flex h-1/2 md:hidden">
          <>
          <div className="w-full flex items-center bg-card rounded-sm border border-border transition-colors duration-200"> 
            <div className="flex justify-between items-center px-2 py-2 w-full h-[50%] sm:w-auto">
              
              <button
                onClick={() => setIsMobileModalOpen(true)}
                className="rounded-xl text-sm font-medium shrink-0 transition-colors"
              >
                <Filter size={18} />
              </button>

            </div>
          </div>

      {isMobileModalOpen && (
        <div className="fixed inset-0 z-10 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileModalOpen(false)}
          />
          <div className="relative w-full bg-background rounded-t-[24px] p-4 animate-in slide-in-from-bottom-full duration-300 shadow-2xl flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center mb-5 shrink-0">
              <h2 className="text-lg text-foreground">
                Filters
              </h2>
              <button
                onClick={() => setIsMobileModalOpen(false)}
                className="p-1.5 bg-muted rounded-full shadow-md border--border text-muted-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/*Kategori */}
            

              <div className="flex flex-col justify-around gap-4 overflow-y-auto p-2 ">
               
               <div>
                <span className="text-md">Kategori</span>
                <select
                  value={CategoryValue ?? ""}
                  onChange={(e) => SetCategoryValue(e.target.value)}
                  className="border mt-2 border-border bg-card text-foreground text-sm rounded-lg focus:outline-1 focus:outline-primary truncate block pl-2 pr-10 h-10 cursor-pointer w-full"
                >
                
                <option
                    key={"all"}
                    value= ""
                    className="bg-muted/40 text-foreground"
                  >
                    Semua Kategori 
                  </option>
                {programCategories.map((categoryName, idx) => (
                  <option
                    key={idx}
                    value={categoryName}
                    className="bg-muted/40 text-foreground"
                  >
                    {categoryName}
                  </option>
                ))}
                </select>
               </div>
              

              {/*Periode */}
              <div className="flex flex-col">
                  <span className="text-md">Periode</span>
                  <div className="bg-card border border-border rounded-lg flex flex-row items-stretch mt-2">

                    <div className={`flex flex-1 justify-center items-center border-border border-right rounded-s-lg transition-all  px-2 py-2
                    ${PeriodValue === 'all' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
                    onClick={(e) => SetPeriodValue('all')}>

                      All
                    </div>
                    <div className={`flex flex-1 justify-center items-center transition-all  px-2 py-2
                    ${PeriodValue === 'ytd' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
                    onClick={(e) => SetPeriodValue('ytd')}>
                      <span>
                        Tahun
                      </span>
                    </div>
                    <div className={`flex flex-1 justify-center items-center transition-all  px-2 py-2
                    ${PeriodValue === '30d' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
                    onClick={(e) => SetPeriodValue('30d')}>
                      <span>
                        Bulan
                      </span>
                    </div>
                    <div className={`flex flex-1 justify-center items-center rounded-e-lg transition-all  px-2 py-2
                    ${PeriodValue === '7d' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
                    onClick={(e) => SetPeriodValue('7d')}>
                      <span>
                        Minggu
                      </span>
                    </div>
                </div>
              </div>

              {/*Kalender */}
                <div className="flex flex-col">
                  <label className="text-md mb-2">Pilih Periode</label>
                  <div className="flex items-center justify-between w-full">
                    <input
                      type="month"
                      value={StartMonthValue}
                      onChange={(e) => setStartMonthValue(e.target.value)}
                      className="bg-muted/40 border border-border text-foreground rounded-lg px-2 py-3 text-xs outline-none cursor-pointer"
                    />
                    <div className="bg-white w-[8px] h-[1px]"></div>
                    {/* <span className="text-muted-foreground text-md">-</span> */}
                    <input
                      type="month"
                      value={EndMonthValue}
                      onChange={(e) => setEndMonthValue(e.target.value)}
                      className="bg-muted/40 border border-border text-foreground rounded-lg px-2 py-3 text-xs outline-none cursor-pointer"
                    />
                  </div>
                </div>

                

                <div className="flex flex-row gap-2 mt-4">
                    <button className="w-full h-10 bg-card border-border border rounded-md"
                    onClick={() => {
                      setEndMonthValue("");
                      setStartMonthValue("");
                      SetPeriodValue("");
                      SetCategoryValue(null);
                      }
                    }><label className="text-bold text-white">Clear All</label>
                    </button>

                    <button className="w-full h-10 bg-white border-border border rounded-md"
                    onClick={() => {
                      setEndMonth(EndMonthValue);
                      setStartMonth(StartMonthValue);
                      setSelectedPeriod(PeriodValue);
                      setSelectedCategory(CategoryValue);
                      setIsMobileModalOpen(false);
                      }
                    }><label className="text-black">Apply Filter</label>
                    </button>
                </div>
            </div>
            
            

        </div>
      </div>
      )}
          </>
        </div>
        
  </div>
  )
}