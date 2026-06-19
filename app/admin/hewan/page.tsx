import { Suspense } from "react";
import { getHewanQurban } from "@/app/actions/hewan";
import { Loader2 } from "lucide-react";
import SearchBar from "@/components/admin/SearchBar";
import HewanActionButtons from "@/components/admin/HewanActionButtons";
import FormHewanDrawer from "@/components/admin/FormHewanDrawer";

// ==========================================
// KOMPONEN ANAK: TABEL DINAMIS (ASYNC)
// ==========================================
async function HewanTableList({ query, year }: { query: string; year: string }) {
  const response = await getHewanQurban(query, year);
  const hewans = response.data || [];

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">ID Hewan</th>
              <th className="px-6 py-4">Jenis</th>
              <th className="px-6 py-4">Atas Nama (Shohibul)</th>
              <th className="px-6 py-4">Bentuk</th>
              <th className="px-6 py-4">Penyaluran</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {hewans.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                  {query ? `Tidak ada hewan yang cocok dengan pencarian "${query}"` : "Belum ada data hewan qurban."}
                </td>
              </tr>
            ) : (
              hewans.map((item, index) => (
                <tr key={item.id_hewan} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">{index + 1}</td>
                  
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-800">
                        {item.jenis_qurban === "1" || item.jenis_qurban?.toLowerCase() === "kambing" 
                          ? `KAMBING ${item.no_id_lama && !isNaN(parseInt(item.no_id_lama.substring(5))) ? parseInt(item.no_id_lama.substring(5)) : "-"}` 
                          : `KELOMPOK ${item.kel_sapi || "-"}`}
                      </span>
                      <span className="font-mono text-xs text-gray-400 mt-0.5">
                        {item.no_id_lama || "-"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {(() => {
                      let label = item.jenis_qurban;
                      const colorClass = "bg-gray-50 text-gray-600"; 
                      if (item.jenis_qurban === "1" || item.jenis_qurban.toLowerCase() === "kambing") label = "🐐 Kambing";
                      else if (item.jenis_qurban === "2" || item.jenis_qurban.toLowerCase() === "sapi") label = "🐄 Sapi";
                      else if (item.jenis_qurban === "3") label = "🐄 Sapi (Patungan)";
                      return <span className={`px-3 py-1.5 rounded-full font-bold text-xs ${colorClass}`}>{label}</span>;
                    })()}
                  </td>

                  <td className="px-6 py-4 text-admin-text align-middle">
                    {item.isGroup ? (
                      <div className="flex flex-col gap-1.5 py-1">
                        <span 
                          className={`font-bold text-sm px-3 py-1 rounded-md w-fit border ${
                            item.members?.length >= 7 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-orange-50 text-orange-700 border-orange-100'
                          }`}
                        >
                          Sapi Patungan Kelompok {item.kel_sapi}: {item.members?.length >= 7 ? '(Lengkap ✅)' : `(Kurang ${7 - item.members?.length})`}
                        </span>
                        <ul className="text-xs text-gray-600 space-y-1 pl-1 mt-1">
                          {item.members?.map((member: any, i: number) => (
                            <li key={member.id_hewan} className="flex items-start gap-1.5">
                              <span className="font-medium text-gray-400">{i + 1}.</span> 
                              <span className="font-bold truncate max-w-[220px]">{member.pengqurban?.nama_lengkap || "Tanpa Nama"}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : item.jenis_qurban === "2" || item.jenis_qurban?.toLowerCase() === "sapi" ? (
                      <div className="flex flex-col gap-1.5 py-1">
                        {(() => {
                          let names: string[] = [];
                          try {
                            names = JSON.parse(item.nama_shohibul_sapi || "[]");
                          } catch {}
                          const firstName = names.length > 0 ? names[0] : (item.pengqurban?.nama_lengkap || "Tanpa Nama");
                          return (
                            <>
                              <span 
                                className="font-bold text-sm px-3 py-1 rounded-md w-fit border bg-emerald-100 text-emerald-800 border-emerald-200"
                              >
                                Sapi Utuh: Keluarga {firstName} ✨
                              </span>
                              <ul className="text-xs text-gray-600 space-y-1 pl-1 mt-1">
                                {names.length > 0 ? names.map((name: string, i: number) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="font-medium text-gray-400">{i + 1}.</span> 
                                    <span className="font-bold truncate max-w-[220px]">{name}</span>
                                  </li>
                                )) : (
                                  <li className="flex items-start gap-1.5">
                                    <span className="font-medium text-gray-400">1.</span> 
                                    <span className="font-bold truncate max-w-[220px]">{item.pengqurban?.nama_lengkap || "Tanpa Nama"}</span>
                                  </li>
                                )}
                              </ul>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="font-bold truncate max-w-[250px]">
                        {item.pengqurban?.nama_lengkap || "Tanpa Nama"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-500">{item.bentuk || "-"}</td>
                  <td className="px-6 py-4 truncate max-w-[200px]">{item.penyaluran || "INTERNAL MMI"}</td>
                  <td className="px-6 py-4">
                    <HewanActionButtons data={JSON.parse(JSON.stringify(item))} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-5 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 gap-4">
        <p>Menampilkan {hewans.length} data</p>
      </div>
    </>
  );
}

// ==========================================
// KOMPONEN INDUK: UI UTAMA (INSTAN)
// ==========================================
export default async function HewanPage(props: { searchParams: Promise<{ q?: string; year?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const year = searchParams.year || "Semua"; 

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Data Hewan Qurban</h1>
          <p className="text-sm text-gray-500">Pantau detail hewan (Sapi/Kambing) dari shohibul qurban</p>
        </div>
        <FormHewanDrawer />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex gap-4">
          <SearchBar placeholder="Cari No ID, kelompok, atau nama shohibul..." />
        </div>

        {/* BUNGKUSAN SUSPENSE */}
        <Suspense fallback={
          <div className="p-16 flex flex-col items-center justify-center text-emerald-500">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-medium text-gray-500 animate-pulse">Menyiapkan data hewan...</p>
          </div>
        }>
          <HewanTableList query={query} year={year} />
        </Suspense>
      </div>
    </div>
  );
}