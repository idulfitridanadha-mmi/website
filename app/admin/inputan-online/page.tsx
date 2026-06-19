"use client";

import { useState, useEffect } from "react";
import { getPermohonanOnline, verifyPermohonan } from "@/app/actions/permohonan-online";
import { CheckCircle, XCircle, Eye, Loader2, Clock, Phone, Calendar, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import ViewPermohonanDrawer from "@/components/admin/ViewPermohonanDrawer";

export default function InputanOnlinePage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✨ STATE BUAT MODAL CUSTOM
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    id: string;
    action: "ACC" | "DITOLAK" | null;
  }>({ isOpen: false, id: "", action: null });

  const [viewData, setViewData] = useState<any>(null);

  const loadData = async () => {
    const res = await getPermohonanOnline();
    if (res.success) setData(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    getPermohonanOnline().then((res) => {
      if (!ignore) {
        if (res.success) setData(res.data);
        setIsLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  // 1. Fungsi buat BUKA Modal
  const confirmAction = (id: string, action: "ACC" | "DITOLAK") => {
    setModalConfig({ isOpen: true, id, action });
  };

  // 2. Fungsi Eksekusi Asli (Dijalankan dari dalam Modal)
  const executeVerify = async () => {
    const { id, action } = modalConfig;
    if (!id || !action) return;

    // Tutup modal dulu biar smooth
    setModalConfig({ isOpen: false, id: "", action: null });

    const toastId = toast.loading("Sedang memproses data...");
    const res = await verifyPermohonan(id, action);
    
    if (res.success) {
      toast.success(res.message, { id: toastId });
      setIsLoading(true);
      loadData(); // Refresh tabel otomatis
    } else {
      toast.error(res.message, { id: toastId });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Verifikasi Pendaftaran Online</h1>
          <p className="text-gray-500 text-sm">Validasi data dari website sebelum dimasukkan ke database utama</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
          <Clock size={16} className="text-emerald-600"/>
          <span className="text-xs font-black text-emerald-700 uppercase">{data.filter(d => d.status === 'BELUM_DICEK').length} Menunggu Verifikasi</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-white rounded-[32px] flex flex-col items-center justify-center text-gray-400 gap-3 border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin" size={32} />
          <p className="font-bold text-xs uppercase tracking-widest">Sedang Memuat Data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 bg-white rounded-[32px] flex flex-col items-center justify-center text-gray-400 gap-3 border border-gray-100 shadow-sm">
          <Calendar size={48} className="opacity-20" />
          <p className="font-bold text-xs uppercase tracking-widest">Belum ada inputan form masuk</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
              <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tgl Submit</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Shohibul</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kontak & Wilayah</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ringkasan Hewan</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item) => {
                const daftarHewan = JSON.parse(item.daftar_hewan);
                return (
                  <tr key={item.id_permohonan} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-gray-700 uppercase">{new Date(item.tanggal_submit).toLocaleDateString('id-ID')}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{new Date(item.tanggal_submit).toLocaleTimeString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-gray-800 uppercase leading-tight">{item.nama_lengkap}</p>
                      <p className="text-[10px] text-emerald-600 font-bold tracking-tighter uppercase">{item.asal_wilayah}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-1">
                        <Phone size={12} className="text-gray-400"/> {item.telepon}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate max-w-[150px] uppercase font-medium">{item.alamat}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {daftarHewan.map((h: any, i: number) => (
                          <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-lg border border-emerald-100 uppercase">
                            {h.jenis === '1' ? 'Kambing' : h.jenis === '3' ? 'Sapi Patungan' : 'Sapi Utuh'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.status === 'BELUM_DICEK' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        item.status === 'ACC' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setViewData(item)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all" 
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                        {item.status === 'BELUM_DICEK' && (
                          <>
                            {/* ✨ Panggil Modal, bukan window.confirm */}
                            <button 
                              onClick={() => confirmAction(item.id_permohonan, "ACC")}
                              className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all" 
                              title="Konfirmasi (ACC)"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => confirmAction(item.id_permohonan, "DITOLAK")}
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all" 
                              title="Tolak"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✨ MODAL CUSTOM ESTETIK ✨ */}
      {modalConfig.isOpen && (
        <>
          {/* Overlay Gelap */}
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] animate-in fade-in"
            onClick={() => setModalConfig({ isOpen: false, id: "", action: null })}
          />
          
          {/* Kotak Pop-up */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl p-8 z-[110] shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalConfig({ isOpen: false, id: "", action: null })}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${modalConfig.action === 'ACC' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {modalConfig.action === 'ACC' ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
              </div>
              
              <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">
                {modalConfig.action === 'ACC' ? 'Konfirmasi Pendaftaran?' : 'Tolak Pendaftaran?'}
              </h3>
              
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                {modalConfig.action === 'ACC' 
                  ? 'Data jamaah ini akan otomatis dimasukkan ke dalam database utama Pengqurban & Hewan. Tindakan ini akan membuat NKW baru secara otomatis.' 
                  : 'Data ini akan ditandai sebagai DITOLAK dan tidak akan dimasukkan ke dalam database utama.'}
              </p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setModalConfig({ isOpen: false, id: "", action: null })}
                  className="flex-1 py-4 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={executeVerify}
                  className={`flex-1 py-4 font-bold text-white rounded-2xl transition-all shadow-lg ${modalConfig.action === 'ACC' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <ViewPermohonanDrawer 
        isOpen={viewData !== null} 
        onClose={() => setViewData(null)} 
        data={viewData} 
      />
    </div>
  );
}