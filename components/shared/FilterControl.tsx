// import { Filter, X } from "lucide-react";
// import { useState } from "react";

// export default function FilterControl({programCategories}: FilterControlProps){
//   type Period = 'all' | 'ytd' | '30d' |'7d' | string;

//   const [isMobileModalOpen, setIsMobileModalOpen]= useState(false);
//   const [PeriodValue, SetPeriodValue] = useState<Period>('');
//   const [CategoryValue, SetCategoryValue] = useState<string|null>(null);
//   const [StartMonthValue, setStartMonthValue] = useState<string>("");
//   const [EndMonthValue, setEndMonthValue] = useState<string>("");
  
  
//   return(
//     <div className="flex md:hidden">
//           <>
//           <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card rounded-[24px] md:border border-border/50 transition-colors duration-200">
//             <div className="flex justify-between items-center w-full sm:w-auto">              
//                 <button
//                 onClick={() => setIsMobileModalOpen(true)}
//                 className="flex items-center justify-center shadow-sm py-[4px] px-4 rounded-xl text-sm font-medium shrink-0 transition-colors"
//               >
//                 <Filter size={18} className="mr-2 stroke-foreground" />
//               </button>
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
//                   value={CategoryValue ?? ""}
//                   onChange={(e) => SetCategoryValue(e.target.value)}
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
//                     ${PeriodValue === 'all' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
//                     onClick={(e) => SetPeriodValue('all')}>

//                       All
//                     </div>
//                     <div className={`flex flex-1 justify-center items-center transition-all  px-2 py-2
//                     ${PeriodValue === 'ytd' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
//                     onClick={(e) => SetPeriodValue('ytd')}>
//                       <span>
//                         Tahun
//                       </span>
//                     </div>
//                     <div className={`flex flex-1 justify-center items-center transition-all  px-2 py-2
//                     ${PeriodValue === '30d' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
//                     onClick={(e) => SetPeriodValue('30d')}>
//                       <span>
//                         Bulan
//                       </span>
//                     </div>
//                     <div className={`flex flex-1 justify-center items-center rounded-e-full transition-all  px-2 py-2
//                     ${PeriodValue === '7d' ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
//                     onClick={(e) => SetPeriodValue('7d')}>
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
//                       value={StartMonthValue}
//                       onChange={(e) => setStartMonthValue(e.target.value)}
//                       className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
//                     />
//                     <span className="text-muted-foreground text-xs">s/d</span>
//                     <input
//                       type="month"
//                       value={EndMonthValue}
//                       onChange={(e) => setEndMonthValue(e.target.value)}
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
//   )
// }