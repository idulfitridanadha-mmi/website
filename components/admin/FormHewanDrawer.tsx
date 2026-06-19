"use client";

import { useState, useEffect } from "react";
import { Plus, X, Save, Loader2, ChevronDown, Upload, Info, CheckSquare } from "lucide-react";
import { createHewan, getStatistikSapiPatungan } from "@/app/actions/hewan";
import toast from "react-hot-toast";

const CustomSelect = ({ label, value, options, name, openDropdown, setOpenDropdown, onSelect }: any) => {
  const activeLabel = options.find((opt: any) => opt.val === value)?.label || value;
  const isDropdownOpen = openDropdown === name;

  return (
    <div className="space-y-1.5 flex flex-col relative">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div 
        onClick={() => setOpenDropdown(isDropdownOpen ? null : name)}
        className={`w-full px-4 py-3 bg-gray-50 border ${isDropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-gray-200'} rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all`}
      >
        <span className="text-sm font-bold text-gray-700 uppercase">{activeLabel}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
      </div>
      {isDropdownOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((opt: any) => (
              <div 
                key={opt.val}
                onClick={() => { onSelect(opt.val); setOpenDropdown(null); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${value === opt.val ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function FormHewanDrawer({ defaultNkw }: { defaultNkw?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [groupStats, setGroupStats] = useState<Record<string, number>>({});
  const [suggestedGroup, setSuggestedGroup] = useState("1");

  const [hwn, setHwn] = useState({
    nkw_pengqurban: defaultNkw || "",
    jenis_qurban: "1", bentuk: "UANG", uang: "", kel_sapi: "",
    metode_bayar: "TUNAI", status_bayar: "BELUM LUNAS", biaya_operasional: "",
    
    // ✨ STATE TEKNIS & DISTRIBUSI (UDAH DI-UPDATE!)
    melihat: "TIDAK", menyembelih: "TIDAK", penyaluran: "DALAM", jml_bagian: "", 
    opsi_pesan: "PASRAH", pesan_bagian: "", pengambilan_pesan: "AMBIL",
    
    no_uq: "", lokasi: "", keterangan: "", penerima: "", petugas: "", sebab: "", pindah_sapi: "TIDAK",
  });

  const [namaSapiUtuh, setNamaSapiUtuh] = useState(["", "", "", "", "", "", ""]);
  const [fileBukti, setFileBukti] = useState<File | null>(null);

  const handleOpen = () => {
    setHwn({
      nkw_pengqurban: defaultNkw || "",
      jenis_qurban: "1", bentuk: "UANG", uang: "", kel_sapi: "",
      metode_bayar: "TUNAI", status_bayar: "BELUM LUNAS", biaya_operasional: "",
      melihat: "TIDAK", menyembelih: "TIDAK", penyaluran: "DALAM", jml_bagian: "", 
      opsi_pesan: "PASRAH", pesan_bagian: "", pengambilan_pesan: "AMBIL",
      no_uq: "", lokasi: "", keterangan: "", penerima: "", petugas: "", sebab: "", pindah_sapi: "TIDAK",
    });
    setNamaSapiUtuh(["", "", "", "", "", "", ""]);
    setFileBukti(null);
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      getStatistikSapiPatungan().then(res => {
        if (res.success) {
          setGroupStats(res.data);
          setSuggestedGroup(res.suggested);
          
          setHwn(prev => {
            const updated = { ...prev };
            if (prev.jenis_qurban === "3") {
              updated.kel_sapi = res.suggested;
            } else if (prev.jenis_qurban === "2") {
              const maxGroup = Math.max(0, ...Object.keys(res.data).map(Number).filter(n => !isNaN(n)));
              updated.kel_sapi = (maxGroup + 1).toString();
            } else {
              updated.kel_sapi = "";
            }
            return updated;
          });
        }
      });
    }
  }, [isOpen]);

  const handleSelect = (name: string, val: any) => {
    setHwn(prev => {
      const updated = { ...prev, [name]: val };
      if (name === "jenis_qurban") {
        if (val === "3") {
          updated.kel_sapi = suggestedGroup;
        } else if (val === "2") {
          const maxGroup = Math.max(0, ...Object.keys(groupStats).map(Number).filter(n => !isNaN(n)));
          updated.kel_sapi = (maxGroup + 1).toString();
        } else {
          updated.kel_sapi = "";
        }
      }
      return updated;
    });
  };

  const handleChange = (e: any) => setHwn({ ...hwn, [e.target.name]: e.target.value.toUpperCase() });
  const handleNamaSapiChange = (index: number, value: string) => {
    const newNames = [...namaSapiUtuh]; newNames[index] = value; setNamaSapiUtuh(newNames);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFileBukti(e.target.files[0]);
  };

  const executeSubmit = async () => {
    if (!hwn.nkw_pengqurban) { toast.error("NKW Pengqurban wajib diisi!"); return; }
    if (hwn.jenis_qurban === "3") {
      const currentCount = groupStats[hwn.kel_sapi.toUpperCase()] || 0;
      if (currentCount >= 7) {
        toast.error(`Kelompok ${hwn.kel_sapi} sudah penuh!`);
        return;
      }
    }
    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan data...");
    const payload = { ...hwn, nama_shohibul_sapi: hwn.jenis_qurban === "2" ? JSON.stringify(namaSapiUtuh.filter(n => n !== "")) : null, file_nama: fileBukti ? fileBukti.name : null };
    const res = await createHewan(payload); 
    if (res.success) { toast.success(res.message, { id: toastId }); setIsOpen(false); }
    else { toast.error(res.message, { id: toastId }); }
    setIsSubmitting(false);
  };

  const renderInfoKelompok = () => {
    if (hwn.jenis_qurban !== "3" || !hwn.kel_sapi) return null;
    const currentCount = groupStats[hwn.kel_sapi.toUpperCase()] || 0;
    const missing = 7 - currentCount;
    return missing <= 0 
      ? <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">❌ Kelompok Penuh</p>
      : <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">✨ Kurang {missing} Orang Lagi</p>;
  };

  return (
    <>
      {!defaultNkw ? (
        <button onClick={handleOpen} className="bg-mmi hover:bg-mmi-hover text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-mmi/20">
          <Plus size={18} /> Tambah Hewan
        </button>
      ) : (
        <button onClick={handleOpen} className="p-2 text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg transition-colors">
          <Plus size={18} />
        </button>
      )}

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-50 shadow-2xl z-[110] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-50">
              <div>
                <h3 className="text-xl font-bold text-mmi flex items-center gap-2"><Plus size={20}/> Form Pendaftaran Qurban</h3>
                {defaultNkw && <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-tight">NKW: <span className="text-gray-800 font-black">#{defaultNkw}</span></p>}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-gray-100"><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
              
              {!defaultNkw && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                  <h4 className="font-black text-mmi text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-mmi rounded-full"></div> Identitas Kepemilikan
                  </h4>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-red-500 uppercase tracking-wider">NKW Pengqurban (Wajib)</label>
                    <input type="text" name="nkw_pengqurban" value={hwn.nkw_pengqurban} onChange={handleChange} placeholder="MASUKKAN NKW..." className="w-full px-4 py-3 bg-gray-50 border border-red-100 rounded-xl text-sm font-black uppercase focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none" />
                  </div>
                </div>
              )}

              {/* INFORMASI HEWAN */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h4 className="font-black text-mmi text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-mmi rounded-full"></div> Informasi Hewan & Nominal
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <CustomSelect label="Jenis Qurban" name="jenis_qurban" value={hwn.jenis_qurban} options={[{val:"1", label:"KAMBING 🐐"}, {val:"2", label:"SAPI UTUH 🐄"}, {val:"3", label:"SAPI PATUNGAN 🤝"}]} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onSelect={(val: any) => handleSelect("jenis_qurban", val)} />
                  <CustomSelect label="Bentuk Titipan" name="bentuk" value={hwn.bentuk} options={[{val:"UANG", label:"UANG 💵"}, {val:"HEWAN", label:"HEWAN HIDUP 🥩"}]} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onSelect={(val: any) => handleSelect("bentuk", val)} />

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nominal Uang (Rp)</label>
                    <input type="number" name="uang" value={hwn.uang} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none transition-all" />
                  </div>

                  {(hwn.jenis_qurban === "2" || hwn.jenis_qurban === "3") && (
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Kelompok Sapi</label>
                      <input type="text" name="kel_sapi" value={hwn.kel_sapi} onChange={handleChange} className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm font-black text-emerald-700 outline-none focus:border-emerald-500 transition-all" />
                      {renderInfoKelompok()}
                    </div>
                  )}

                  {hwn.jenis_qurban === "1" && (
                     <div className="space-y-1.5 flex flex-col col-span-2">
                       <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 cursor-pointer group" onClick={() => setHwn({...hwn, pindah_sapi: hwn.pindah_sapi === "YA" ? "TIDAK" : "YA"})}>
                         <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${hwn.pindah_sapi === "YA" ? "bg-orange-500 border-orange-500 text-white" : "border-orange-200 bg-white group-hover:border-orange-400"}`}>
                           {hwn.pindah_sapi === "YA" && <CheckSquare size={16} />}
                         </div>
                         <p className="text-xs font-bold text-orange-800 uppercase tracking-tight">Bersedia dipindahkan ke Sapi Patungan</p>
                       </div>
                     </div>
                  )}
                </div>
              </div>

              {hwn.jenis_qurban === "2" && (
                <div className="bg-purple-50/30 p-6 rounded-2xl border border-purple-100 shadow-sm space-y-4 animate-in zoom-in-95">
                  <h4 className="font-black text-purple-800 text-xs uppercase tracking-widest border-b border-purple-100 pb-3 flex items-center gap-2">
                    <Info size={14}/> Daftar 7 Nama Shohibul
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {namaSapiUtuh.map((nama, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                        <input type="text" value={nama} onChange={(e) => handleNamaSapiChange(idx, e.target.value)} placeholder={`NAMA ${idx + 1}...`} className="w-full px-3 py-2 bg-white border border-purple-100 rounded-lg text-xs font-bold uppercase outline-none focus:border-purple-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h4 className="font-black text-mmi text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-mmi rounded-full"></div> Pembayaran & Administrasi
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <CustomSelect label="Metode Bayar" name="metode_bayar" value={hwn.metode_bayar} options={[{val:"TUNAI", label:"TUNAI 💵"}, {val:"TRANSFER", label:"TRANSFER 💳"}]} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onSelect={(val: any) => handleSelect("metode_bayar", val)} />
                  <CustomSelect label="Status Bayar" name="status_bayar" value={hwn.status_bayar} options={[{val:"LUNAS", label:"LUNAS ✅"}, {val:"DP", label:"DP 💰"}, {val:"BELUM LUNAS", label:"BELUM LUNAS ❌"}]} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onSelect={(val: any) => handleSelect("status_bayar", val)} />
                  
                  <div className="col-span-2 space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bukti Transfer (Opsional)</label>
                     <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                        <Upload className="w-6 h-6 text-gray-400 mb-2 group-hover:text-emerald-500" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                          {fileBukti ? <span className="text-emerald-600">{fileBukti.name}</span> : <span>Klik untuk Pilih File</span>}
                        </p>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                     </label>
                  </div>
                </div>
              </div>

              {/* ✨ TEKNIS LAPANGAN (SUDAH DISINKRONKAN DENGAN PUBLIC FORM) ✨ */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h4 className="font-black text-mmi text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-mmi rounded-full"></div> Teknis Lapangan & Distribusi
                </h4>
                <div className="grid grid-cols-2 gap-5 mb-2">
                  <CustomSelect label="Hadir Melihat?" name="melihat" value={hwn.melihat} options={[{val:"YA", label:"YA 👀"}, {val:"TIDAK", label:"TIDAK ❌"}]} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onSelect={(val: any) => handleSelect("melihat", val)} />
                  <CustomSelect label="Ikut Menyembelih?" name="menyembelih" value={hwn.menyembelih} options={[{val:"YA", label:"YA 🔪"}, {val:"TIDAK", label:"TIDAK ❌"}]} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onSelect={(val: any) => handleSelect("menyembelih", val)} />
                  <CustomSelect label="Sembelih di Luar MMI?" name="penyaluran" value={hwn.penyaluran} options={[{val:"LUAR", label:"YA, BERSEDIA 🌍"}, {val:"DALAM", label:"TIDAK (HARUS DI MMI) 🏢"}]} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onSelect={(val: any) => handleSelect("penyaluran", val)} />
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jml Bagian (Bungkus)</label>
                    <input type="number" name="jml_bagian" value={hwn.jml_bagian} onChange={handleChange} placeholder="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                    <CustomSelect 
                        label="Permintaan Bagian Daging" name="opsi_pesan" value={hwn.opsi_pesan} 
                        options={[{val:"PASRAH", label:"DISERAHKAN KE PANITIA"}, {val:"KHUSUS", label:"ADA PERMINTAAN KHUSUS"}]} 
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                        onSelect={(val: any) => handleSelect("opsi_pesan", val)}
                    />
                    
                    {hwn.opsi_pesan === "KHUSUS" && (
                        <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 animate-in zoom-in-95">
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detail Permintaan</label>
                                <textarea name="pesan_bagian" rows={2} value={hwn.pesan_bagian} onChange={handleChange} placeholder="CTH: MINTA KEPALA SAPI..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold uppercase resize-none outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <CustomSelect 
                                label="Pengambilan Bagian" name="pengambilan_pesan" value={hwn.pengambilan_pesan} 
                                options={[{val:"AMBIL", label:"AMBIL SENDIRI KE MMI"}, {val:"DIANTAR", label:"DIANTAR KE ALAMAT"}]} 
                                openDropdown={openDropdown}
                                setOpenDropdown={setOpenDropdown}
                                onSelect={(val: any) => handleSelect("pengambilan_pesan", val)}
                            />
                        </div>
                    )}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] sticky bottom-0 z-50">
              <button onClick={() => setIsOpen(false)} className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all border border-gray-100">Batal</button>
              <button onClick={executeSubmit} disabled={isSubmitting} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all text-white shadow-lg ${isSubmitting ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"}`}>
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sedang Proses...</> : <><Save size={16} /> Simpan Data</>}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}