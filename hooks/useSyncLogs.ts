// Import hook dari react query buat nyedot data
import { useQuery } from "@tanstack/react-query";
// Import service penarik data dari api dan tipe antarmuka balasannya
import {
  fetchProgramsByRange,
  FetchProgramsResponse,
} from "@/services/api/programService";

// Fungsi hook costum khusus buat narik log error sinkronisasi
export default function useSyncLogs() {
  // Eksekusi hook usequery bawa tipe balasan antarmuka biar ga kena any
  const {
    // Tarik properti data terus ganti namanya jadi fetch result
    data: fetchResult,
    // Tarik status loading buat dikasih ke ui
    isLoading,
    // Tarik tuas pemicu sedot ulang data
    refetch,
  } = useQuery<FetchProgramsResponse>({
    // Kasih nama kunci query sama persis kayak dashboard biar bagi2 cache kaga dobel request
    queryKey: ["programsDashboard"],
    // Tancepin fungsi fetch tanpa parameter biar narik semua data
    queryFn: () => fetchProgramsByRange(),
    // Data dianggap masih seger selama 2 menit
    staleTime: 2 * 60 * 1000,
    // Data tetep ada di cache selama 5 menit
    gcTime: 5 * 60 * 1000,
  });

  // Ekstrak array error dari dalem koper result atau set array kosong string kalo gada
  const syncErrors: string[] = fetchResult?.errors || [];

  // Lempar balikan fungsi
  return {
    // Tumpukan teks pesan error sinkronisasi
    syncErrors,
    // Status boolean tanda mesin lagi loading sedot data
    isLoading,
    // Tuas pemicu buat maksa tarik ulang data dari sheet
    refetch,
  };
}
