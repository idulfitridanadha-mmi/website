"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit, AlertTriangle, Loader2, X, Save, User, Phone, MapPin, Hash, Map, BadgeCheck, Search, Users, ChevronDown, Eye } from "lucide-react";
import { deletePengqurban, updatePengqurban } from "@/app/actions/pengqurban";
import { getPetugasJaga } from "@/app/actions/petugas";
import toast from "react-hot-toast";
import FormHewanDrawer from "./FormHewanDrawer"; // ✨ IMPORT SUPER FORM KITA DI SINI

// ==========================================
// 🌟 HELPER DATA & FUNGSI FORMATTING
// ==========================================
const wilayahCodes = ["ITS", "ITSA", "ITSB", "ITSC", "ITSD", "ITSE", "ITSF", "ITSG", "ITSH", "ITSI", "ITSJ", "ITSK", "ITSL", "ITSM", "ITSN", "ITSO", "ITSP", "ITSQ", "ITSR", "ITSS", "ITST", "ITSU", "ITSV", "ITSW", "ITSX", "LUAR"];
const formatWilayah = (kode: string) => (kode === "ITS" || kode === "LUAR") ? kode : `ITS - Blok ${kode.replace("ITS", "")}`;

export default function PengqurbanActionButtons({ data }: { data: any }) {
  const nkwLama = data.nkw; 
  
  // ==========================================
  // 📦 STATE MANAGEMENT (KHUSUS EDIT & DELETE ORANG SAJA)
  // ==========================================
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [noUrut, setNoUrut] = useState(data.no_urut || "");
  const [namaLengkap, setNamaLengkap] = useState(data.nama_lengkap || "");
  const [telepon, setTelepon] = useState(data.telepon || "");
  const [alamat, setAlamat] = useState(data.alamat || "");
  const [selectedGender, setSelectedGender] = useState(data.jenis_kelamin || "");
  const [selectedWilayah, setSelectedWilayah] = useState(data.kd_wilayah || "");
  
  const [dbPetugas, setDbPetugas] = useState<{id_petugas: string, id_lama: string, nama: string}[]>([]);
  const [searchPetugas, setSearchPetugas] = useState(data.petugas?.nama || "");
  const [selectedPetugasId, setSelectedPetugasId] = useState(data.id_petugas || "");
  const [selectedPetugasIdLama, setSelectedPetugasIdLama] = useState(data.petugas?.id_lama || "");

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isWilayahOpen, setIsWilayahOpen] = useState(false);
  const [showPetugasDropdown, setShowPetugasDropdown] = useState(false);

  // ==========================================
  // ⚙️ LOGIKA & FUNGSI-FUNGSI
  // ==========================================
  useEffect(() => {
    if (isEditOpen && dbPetugas.length === 0) {
      getPetugasJaga().then((res) => {
        if (res.success) setDbPetugas(res.data);
      });
    }
  }, [isEditOpen, dbPetugas.length]);

  const filteredPetugas = dbPetugas.filter(p => 
    p.nama.toLowerCase().includes(searchPetugas.toLowerCase())
  );

  const executeUpdate = async () => {
    if (!namaLengkap) {
      toast.error("Nama Lengkap wajib diisi ya!");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Memperbarui data...");

    const res = await updatePengqurban(nkwLama, {
      no_urut: noUrut,
      nama_lengkap: namaLengkap,
      jenis_kelamin: selectedGender,
      telepon,
      kd_wilayah: selectedWilayah,
      alamat,
      id_petugas: selectedPetugasId
    });

    if (res.success) {
      toast.success(res.message, { id: toastId });
      setIsEditOpen(false); 
    } else {
      toast.error(res.message, { id: toastId });
    }
    setIsSubmitting(false);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Menghapus data...");
    
    const res = await deletePengqurban(nkwLama);
    
    if (res.success) {
      toast.success(res.message, { id: toastId });
      setIsModalOpen(false);
    } else {
      toast.error(res.message, { id: toastId });
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* ✨ TOMBOL LIHAT DETAIL (VIEW) */}
        <button onClick={() => setIsDetailOpen(true)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Lihat Detail Rinci">
          <Eye size={18} />
        </button>

        {/* ✨ INI DIA MAGIC-NYA! Panggil Super Form dengan prop defaultNkw */}
        <FormHewanDrawer defaultNkw={nkwLama} />
        
        <button onClick={() => setIsEditOpen(true)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data">
          <Edit size={18} />
        </button>
        <button onClick={() => setIsModalOpen(true)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Data">
          <Trash2 size={18} />
        </button>
      </div>

      {/* MODAL KONFIRMASI DELETE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => !isDeleting && setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-bold text-admin-text mb-2">Hapus Data?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
                {`Yakin mau hapus data shohibul qurban dengan NKW`} <br />
                <span className="font-bold text-gray-800 text-base">#{nkwLama}</span>? <br />
                {`Tindakan ini tidak bisa dibatalkan lho.`}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} disabled={isDeleting} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">Batal</button>
                <button onClick={executeDelete} disabled={isDeleting} className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-md shadow-red-500/20 disabled:opacity-50 disabled:shadow-none">
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER EDIT DATA ORANG */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] animate-in fade-in" onClick={() => setIsEditOpen(false)} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isEditOpen ? "translate-x-0" : "translate-x-full hidden"}`}>
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-admin-text">Edit Shohibul Qurban</h3>
            <p className="text-sm text-gray-500 mt-1">Perbarui data pendaftaran qurban</p>
          </div>
          <button onClick={() => setIsEditOpen(false)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-6">
          {(isGenderOpen || isWilayahOpen || showPetugasDropdown) && (
            <div className="fixed inset-0 z-[75]" onClick={() => { setIsGenderOpen(false); setIsWilayahOpen(false); setTimeout(() => setShowPetugasDropdown(false), 150); }} />
          )}
          
          <div className="grid grid-cols-2 gap-6 w-full">
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Hash size={16} className="text-blue-500" /> Nomor Kwitansi (NKW)</label>
              <input type="text" value={nkwLama} readOnly className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none text-sm font-mono text-gray-500 cursor-not-allowed" />
            </div>
            
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-bold text-gray-700">Nomor Urut</label>
              <input type="number" value={noUrut} onChange={(e) => setNoUrut(e.target.value)} placeholder="Contoh: 1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Nama Lengkap *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} required placeholder="Nama Lengkap" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
              </div>
            </div>
            
            <div className={`space-y-2 relative ${isGenderOpen ? 'z-[80]' : ''}`}>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Users size={16} className="text-gray-400" /> Jenis Kelamin
              </label>
              <div 
                onClick={() => setIsGenderOpen(!isGenderOpen)} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-colors"
              >
                <span className={`text-sm ${selectedGender ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                  {selectedGender === "L" ? "Laki-laki" : selectedGender === "P" ? "Perempuan" : "Pilih Gender..."}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isGenderOpen ? "rotate-180" : ""}`} />
              </div>
              
              {isGenderOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col py-1 animate-in fade-in slide-in-from-top-2">
                  <button type="button" onClick={() => { setSelectedGender("L"); setIsGenderOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex-none hover:bg-blue-50 hover:text-blue-500 font-medium transition-colors">Laki-laki</button>
                  <button type="button" onClick={() => { setSelectedGender("P"); setIsGenderOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex-none hover:bg-blue-50 hover:text-blue-500 font-medium transition-colors">Perempuan</button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nomor Telepon/WA</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="081234567890" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
              </div>
            </div>
            
            <div className={`space-y-2 relative ${isWilayahOpen ? 'z-[80]' : ''}`}>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Map size={16} className="text-blue-500" /> Asal Pengqurban
              </label>
              <div 
                onClick={() => setIsWilayahOpen(!isWilayahOpen)} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-colors"
              >
                <span className={`text-sm ${selectedWilayah ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                  {selectedWilayah ? formatWilayah(selectedWilayah) : "Pilih Asal Wilayah..."}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isWilayahOpen ? "rotate-180" : ""}`} />
              </div>
              
              {isWilayahOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-y-auto flex flex-col py-1 animate-in fade-in slide-in-from-top-2">
                  {wilayahCodes.map((kode) => (
                    <button key={kode} type="button" onClick={() => { setSelectedWilayah(kode); setIsWilayahOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex-none transition-colors ${selectedWilayah === kode ? 'bg-blue-50 text-blue-500 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}>
                      {formatWilayah(kode)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Alamat Lengkap</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <textarea rows={3} value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat lengkap shohibul qurban..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"></textarea>
            </div>
          </div>

          <div className={`space-y-2 pt-4 border-t border-gray-100 relative ${showPetugasDropdown ? 'z-[80]' : ''}`}>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><BadgeCheck size={16} className="text-orange-500" /> Petugas Jaga (Penerima)</label>
            <div className="flex gap-3 relative">
              <input type="text" readOnly value={selectedPetugasIdLama} placeholder="ID Auto" className="w-1/3 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none text-sm font-bold font-mono text-gray-600 cursor-not-allowed" />
              <div className="relative w-2/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  value={searchPetugas}
                  onChange={(e) => { setSearchPetugas(e.target.value); setShowPetugasDropdown(true); }}
                  onFocus={() => setShowPetugasDropdown(true)}
                  placeholder="Ketik nama petugas..." 
                  className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all" 
                />
                
                {showPetugasDropdown && (
                  <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                    {filteredPetugas.length > 0 ? (
                      filteredPetugas.map((p) => (
                        <button key={p.id_petugas} onClick={() => { setSelectedPetugasId(p.id_petugas); setSelectedPetugasIdLama(p.id_lama); setSearchPetugas(p.nama); setShowPetugasDropdown(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-50 last:border-none flex justify-between items-center">
                          <span className="font-bold">{p.nama}</span>
                          <span className="text-[11px] text-gray-500 ml-2 font-mono truncate bg-gray-100 px-2 py-0.5 rounded-md">{p.id_lama}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">Data Petugas tidak ditemukan</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button onClick={() => setIsEditOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors">Batal</button>
          <button onClick={executeUpdate} disabled={isSubmitting} className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"}`}>
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Update Data</>}
          </button>
        </div>
      </div>

      {/* 🔵 DRAWER LIHAT DETAIL (VIEW) */}
      {isDetailOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] animate-in fade-in" onClick={() => setIsDetailOpen(false)} />
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-gray-50 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDetailOpen ? "translate-x-0" : "translate-x-full hidden"
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Eye size={20} className="text-emerald-600"/> Informasi Rinci
          </h3>
          <button onClick={() => setIsDetailOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Blok Identitas Utama */}
          <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <h4 className="font-bold text-emerald-100 text-sm uppercase tracking-widest mb-4">Profil Pengqurban</h4>
            <div className="grid grid-cols-2 gap-y-4 relative z-10">
              <div>
                <p className="text-emerald-200 text-xs">Nomor Kwitansi (NKW)</p>
                <p className="font-bold text-lg">#{data.nkw}</p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Jenis Kelamin</p>
                <p className="font-bold text-lg">{data.jenis_kelamin === "L" ? "Laki-laki ♂" : data.jenis_kelamin === "P" ? "Perempuan ♀" : "-"}</p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Asal Wilayah</p>
                <p className="font-bold text-md uppercase">{data.kd_wilayah ? formatWilayah(data.kd_wilayah) : "-"}</p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Nomor Urut</p>
                <p className="font-bold text-md">{data.no_urut || "-"}</p>
              </div>
            </div>
          </div>

          {/* Rincian Kontak & Alamat */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-4">
            <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <User size={18} className="text-emerald-600"/> Detail Shohibul
            </h5>
            <div className="grid grid-cols-1 gap-y-3 text-sm">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</span>
                <span className="font-black text-gray-800 uppercase">{data.nama_lengkap}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nomor HP / WhatsApp</span>
                <span className="font-bold text-gray-800">{data.telepon || "-"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Lengkap</span>
                <span className="font-bold text-gray-800 uppercase leading-relaxed">{data.alamat || "-"}</span>
              </div>
            </div>
          </div>

          {/* Rincian Hewan Qurban yang Didaftarkan */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-4">
            <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">🐐</span> Hewan Qurban Terdaftar ({data.hewan_qurban?.length || 0})
            </h5>
            {data.hewan_qurban && data.hewan_qurban.length > 0 ? (
              <div className="space-y-3">
                {data.hewan_qurban.map((item: any, idx: number) => (
                  <div key={item.id_hewan} className="bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-gray-800">
                      <span>
                        {idx + 1}. {item.jenis_qurban === "1" || item.jenis_qurban?.toLowerCase() === "kambing" ? "🐐 Kambing" : item.jenis_qurban === "2" || item.jenis_qurban?.toLowerCase() === "sapi" ? "🐄 Sapi" : "🐄 Sapi (Patungan)"}
                      </span>
                      <span className="font-mono text-gray-500">{item.no_id_lama || "-"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 mt-2 text-[11px] text-gray-600">
                      <div>
                        <span className="font-medium">Bentuk:</span> <span className="font-bold text-gray-700">{item.bentuk}</span>
                      </div>
                      <div>
                        <span className="font-medium">Penyaluran:</span> <span className="font-bold text-gray-700">{item.penyaluran || "INTERNAL"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Status Pemrosesan:</span> <span className="font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{item.status_hewan || "MENUNGGU"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center font-medium py-2">Belum mendaftarkan hewan qurban.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}