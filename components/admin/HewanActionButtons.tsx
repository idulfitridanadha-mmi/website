"use client";

import { useState } from "react";
import { Trash2, Edit, AlertTriangle, Loader2, X, Save, Eye, Printer, CheckCircle2, User, ChevronDown, Info } from "lucide-react";
import { deleteHewan, updateHewan } from "@/app/actions/hewan";
import toast from "react-hot-toast";

export default function HewanActionButtons({ data }: { data: any }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // 🎯 State Print PDF
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // 🎯 State 7 Nama Sapi Utuh (Khusus Edit)
  const [namaSapiUtuh, setNamaSapiUtuh] = useState<string[]>([]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // State Form Edit
  const [hwn, setHwn] = useState({
    bentuk: "UANG", uang: "", penyembelihan: "", melihat: "TIDAK", menyembelih: "TIDAK",
    jml_bagian: "", pembagian: "", opsi_pesan: "PASRAH", pesan_bagian: "", kel_sapi: "", no_uq: "",
    penyaluran: "DALAM", lokasi: "", keterangan: "", penerima: "", petugas: "", sebab: "",
    biaya_operasional: "", pindah_sapi: "TIDAK", metode_bayar: "TUNAI", status_bayar: "BELUM LUNAS",
    status_hewan: "MENUNGGU"
  });

  const handleChange = (e: any) => setHwn({ ...hwn, [e.target.name]: e.target.value.toUpperCase() });

  const handleNamaSapiChange = (index: number, value: string) => {
    const newNames = [...namaSapiUtuh];
    newNames[index] = value;
    setNamaSapiUtuh(newNames);
  };

  // 🪄 BUKA MODAL EDIT 
  const handleActionOpenEdit = (item: any) => {
    setSelectedMember(item);
    
    // Parse JSON 7 Nama kalau ada
    let parsedNames = ["", "", "", "", "", "", ""];
    if (item.nama_shohibul_sapi) {
      try {
        const dbNames = JSON.parse(item.nama_shohibul_sapi);
        dbNames.forEach((n: string, i: number) => { if (i < 7) parsedNames[i] = n; });
      } catch (e) {}
    }
    setNamaSapiUtuh(parsedNames);

    setHwn({
      bentuk: item.bentuk || "UANG",
      uang: item.uang?.toString() || "",
      penyembelihan: item.penyembelihan || "",
      melihat: item.melihat ? "YA" : "TIDAK",
      menyembelih: item.menyembelih ? "YA" : "TIDAK",
      jml_bagian: item.jml_bagian?.toString() || "",
      pembagian: item.pembagian || "",
      opsi_pesan: item.pesan_bagian ? "KHUSUS" : "PASRAH",
      pesan_bagian: item.pesan_bagian || "",
      kel_sapi: item.kel_sapi || "",
      no_uq: item.no_uq || "",
      penyaluran: item.penyaluran || "DALAM",
      lokasi: item.lokasi || "",
      keterangan: item.keterangan || "",
      penerima: item.penerima || "",
      petugas: item.petugas || "",
      sebab: item.sebab || "",
      biaya_operasional: item.biaya_operasional?.toString() || "",
      pindah_sapi: item.pindah_sapi ? "YA" : "TIDAK",
      metode_bayar: item.metode_bayar || "TUNAI",
      status_bayar: item.status_bayar || "BELUM LUNAS",
      status_hewan: item.status_hewan || "MENUNGGU"
    });
    setIsEditOpen(true);
  };

  // 🪄 BUKA MODAL DELETE
  const handleActionOpenDelete = (item: any) => {
    setSelectedMember(item);
    setIsDeleteOpen(true);
  };

  const executeUpdate = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Memperbarui data hewan...");
    
    const payload = {
      ...hwn,
      nama_shohibul_sapi: selectedMember.jenis_qurban === "2" ? JSON.stringify(namaSapiUtuh.filter(n => n !== "")) : null
    };

    const res = await updateHewan(selectedMember.id_hewan, payload);
    if (res.success) {
      toast.success(res.message, { id: toastId });
      setIsEditOpen(false);
    } else {
      toast.error(res.message, { id: toastId });
    }
    setIsSubmitting(false);
  };

  const executeDelete = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Menghapus hewan...");
    const res = await deleteHewan(selectedMember.id_hewan);
    if (res.success) {
      toast.success(res.message, { id: toastId });
      setIsDeleteOpen(false);
    } else {
      toast.error(res.message, { id: toastId });
    }
    setIsSubmitting(false);
  };

  // 🪄 FUNGSI PRINT PREVIEW PDF
  const handleOpenPreview = async () => {
    setIsPreviewOpen(true);
    setIsLoadingPdf(true);
    try {
      const payload = {
        nama: data.pengqurban?.nama_lengkap || "Tanpa Nama",
        alamat: data.pengqurban?.alamat || "-", 
        noKuitansi: data.nkw_pengqurban || "-",
        noId: data.no_id_lama || "-",
        jenis: data.jenis_qurban === "1" ? "Kambing" : "Sapi",
        daging: data.bentuk || "UANG",
        keterangan: data.pesan_bagian || "-",
        bagian: data.jml_bagian?.toString() || "1",
        statusLuar: data.penyaluran || "DALAM",
        noKambing: data.no_id_lama ? data.no_id_lama.slice(-2) : "00" 
      };

      const res = await fetch('/api/generate-kambing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Gagal memproses PDF');
      const blob = await res.blob();
      setPdfUrl(URL.createObjectURL(blob));
    } catch (error) {
      toast.error("Waduh, gagal nampilin preview PDF!");
      setIsPreviewOpen(false);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }
  };

  const membersList = data.isGroup ? data.members : [data];

  const CustomSelect = ({ label, value, options, name }: any) => {
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
                  onClick={() => { setHwn({...hwn, [name]: opt.val}); setOpenDropdown(null); }}
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

  return (
    <>
      {/* 🚀 TOMBOL UTAMA DI TABEL (UDAH KEMBALI LENGKAP!) */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setIsDetailOpen(true)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Lihat Detail Rinci">
          <Eye size={16} />
        </button>
        
        {!data.isGroup && (
          <button onClick={() => handleActionOpenEdit(data)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data Lengkap">
            <Edit size={16} />
          </button>
        )}

        {/* INI DIA YANG KANGEN SAMA TOMBOL PRINT WKWKWK */}
        <button onClick={handleOpenPreview} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Preview Nametag (PDF)">
          <Printer size={16} />
        </button>

        {!data.isGroup && (
          <button onClick={() => handleActionOpenDelete(data)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Hewan">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* 📄 MODAL PREVIEW PDF (Dikembalikan!) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClosePreview} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
              <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                <Printer size={20} className="text-purple-600"/> Preview Nametag
              </h3>
              <button onClick={handleClosePreview} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={22} /></button>
            </div>
            <div className="flex-1 bg-gray-200 relative flex items-center justify-center p-4 sm:p-8">
              {isLoadingPdf ? (
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Loader2 size={40} className="animate-spin mb-4 text-purple-600" />
                  <p className="font-bold text-lg animate-pulse">Meracik PDF...</p>
                </div>
              ) : pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full rounded-xl shadow-lg border-0 bg-white" title="PDF Preview" />
              ) : (
                <div className="text-center text-red-500"><AlertTriangle size={48} className="mx-auto mb-2" /><p className="font-bold">Gagal memuat PDF.</p></div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
              <p className="text-sm font-medium text-gray-500">Data: <span className="text-gray-800 font-bold">{data.no_id_lama}</span></p>
              <div className="flex gap-3">
                <button onClick={handleClosePreview} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Tutup</button>
                <a href={pdfUrl || "#"} download={`Nametag_${data.no_id_lama || 'Hewan'}.pdf`} className={`px-6 py-2.5 font-bold rounded-xl flex items-center gap-2 transition-all ${!pdfUrl ? "bg-purple-300 text-white/70 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"}`} onClick={(e) => !pdfUrl && e.preventDefault()}><Save size={18} /> Download</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 MODAL KONFIRMASI DELETE YANG DINAMIS (Dikembalikan!) */}
      {isDeleteOpen && selectedMember && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsDeleteOpen(false)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Hewan?</h3>
            <p className="text-sm text-gray-500 mb-6 px-2 break-words whitespace-normal leading-relaxed">
              Yakin mau hapus pesanan qurban milik <span className="font-bold text-gray-800">{selectedMember.pengqurban?.nama_lengkap}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Batal</button>
              <button onClick={executeDelete} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 flex justify-center items-center">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 DRAWER LIHAT DETAIL (VIEW) */}
      {isDetailOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={() => setIsDetailOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-50 shadow-2xl z-[70] flex flex-col overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Eye size={20} className="text-emerald-600"/> Informasi Rinci</h3>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full bg-gray-100"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Blok Identitas Utama */}
              <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                <h4 className="font-bold text-emerald-100 text-sm uppercase tracking-widest mb-4">Profil Hewan</h4>
                <div className="grid grid-cols-2 gap-y-4 relative z-10">
                  <div><p className="text-emerald-200 text-xs">ID Hewan / Kelompok</p><p className="font-bold text-lg">{data.no_id_lama}</p></div>
                  <div><p className="text-emerald-200 text-xs">Jenis</p><p className="font-bold text-lg">{data.jenis_qurban === "1" ? "Kambing 🐐" : "Sapi 🐄"}</p></div>
                  <div><p className="text-emerald-200 text-xs">Penyaluran</p><p className="font-bold text-md">{data.penyaluran || "INTERNAL"}</p></div>
                  <div><p className="text-emerald-200 text-xs">Status Pemrosesan</p><p className="font-bold text-md uppercase">{data.status_hewan || "MENUNGGU"} ⏳</p></div>
                </div>
              </div>

              {/* Loop Shohibul */}
              {membersList.map((m: any, idx: number) => (
                <div key={m.id_hewan} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                  {/* ✨ INI DIA YANG DITUNGGU: HEADER NAMA + TOMBOL AKSI ✨ */}
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
                    <h5 className="font-bold text-gray-800">
                      <span className="text-emerald-600 mr-1">{idx + 1}.</span> {m.pengqurban?.nama_lengkap || "Tanpa Nama"}
                    </h5>
                    
                    {/* Tombol Khusus Edit & Delete per Anggota Sapi Patungan */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setIsDetailOpen(false); // Tutup drawer detail biar ga numpuk
                          setTimeout(() => handleActionOpenEdit(m), 300); // Buka form edit
                        }} 
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                        title="Edit Data Anggota"
                      >
                        <Edit size={14} />
                      </button>
                      
                      <button 
                        onClick={() => {
                          setIsDetailOpen(false);
                          setTimeout(() => handleActionOpenDelete(m), 300); // Buka modal hapus
                        }} 
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                        title="Hapus Anggota"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-3 mb-4">
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Bentuk</p><p className="font-bold text-sm text-gray-700">{m.bentuk || "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Titipan Uang</p><p className="font-bold text-sm text-gray-700">{m.uang ? `Rp ${m.uang.toLocaleString('id-ID')}` : "-"}</p></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Metode Bayar</p><p className="font-bold text-sm text-gray-700">{m.metode_bayar}</p></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Status Bayar</p>
                      <p className={`font-bold text-sm ${m.status_bayar === 'LUNAS' ? 'text-emerald-600' : 'text-red-500'}`}>{m.status_bayar}</p>
                    </div>
                    <div className="col-span-2"><p className="text-[10px] text-gray-400 font-bold uppercase">Status Pemrosesan</p><p className="font-bold text-sm text-gray-700 uppercase">{m.status_hewan || "MENUNGGU"}</p></div>
                  </div>

                  {/* Tampil 7 Nama kalau Sapi Utuh */}
                  {m.jenis_qurban === "2" && m.nama_shohibul_sapi && (
                    <div className="mt-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
                      <p className="text-[10px] text-purple-600 font-bold uppercase mb-2">Daftar Nama yang Dibacakan (Sapi Utuh):</p>
                      <ul className="text-sm font-medium text-gray-700 space-y-1">
                        {JSON.parse(m.nama_shohibul_sapi).map((nama: string, i: number) => (
                          <li key={i} className="flex gap-2"><span className="text-purple-400">{i+1}.</span> {nama}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Keterangan Tambahan */}
                  {(m.pesan_bagian || m.pindah_sapi) && (
                    <div className="mt-4 bg-orange-50/50 border border-orange-100 p-3 rounded-xl space-y-2">
                      {m.pesan_bagian && (
                        <div><p className="text-[10px] text-orange-600 font-bold uppercase">Pesan Bagian:</p><p className="text-sm font-medium text-gray-800">{m.pesan_bagian}</p></div>
                      )}
                      {m.pindah_sapi && (
                        <div><p className="text-[10px] text-orange-600 font-bold uppercase">Opsi Cadangan:</p><p className="text-sm font-medium text-gray-800">✅ Bersedia dipindah ke Sapi Patungan</p></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 🟠 DRAWER EDIT (UPDATE DATA) */}
      {isEditOpen && selectedMember && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={() => setIsEditOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-50 shadow-2xl z-[110] flex flex-col overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2"><Edit size={20}/> Edit Data Qurban</h3>
                <p className="text-sm text-gray-500 font-medium">Milik: <span className="font-bold text-gray-800">{selectedMember.pengqurban?.nama_lengkap}</span></p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={22} /></button>
            </div>

            <div className="flex-1 p-8 space-y-6">
              
              {/* INFORMASI NOMINAL */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h4 className="font-black text-mmi text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-mmi rounded-full"></div> Informasi Nominal
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <CustomSelect label="Bentuk Titipan" name="bentuk" value={hwn.bentuk} options={[{val:"UANG", label:"UANG 💵"}, {val:"HEWAN", label:"HEWAN HIDUP 🥩"}]} />
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nominal Uang (Rp)</label>
                    <input type="number" name="uang" value={hwn.uang} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* PEMBAYARAN & ADMINISTRASI */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h4 className="font-black text-mmi text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-mmi rounded-full"></div> Pembayaran & Administrasi
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <CustomSelect label="Metode Bayar" name="metode_bayar" value={hwn.metode_bayar} options={[{val:"TUNAI", label:"TUNAI 💵"}, {val:"TRANSFER", label:"TRANSFER 💳"}]} />
                  <CustomSelect label="Status Bayar" name="status_bayar" value={hwn.status_bayar} options={[{val:"LUNAS", label:"LUNAS ✅"}, {val:"DP", label:"DP 💰"}, {val:"BELUM LUNAS", label:"BELUM LUNAS ❌"}]} />
                  <div className="col-span-2">
                    <CustomSelect 
                      label="Status Pemrosesan Hewan" 
                      name="status_hewan" 
                      value={hwn.status_hewan} 
                      options={[
                        {val:"MENUNGGU", label:"WAITING / MENUNGGU ⏳"}, 
                        {val:"DISEMBELIH", label:"SLAUGHTERED / DISEMBELIH 🔪"}, 
                        {val:"DIDISTRIBUSIKAN", label:"DISTRIBUTED / DIDISTRIBUSIKAN 📦"}
                      ]} 
                    />
                  </div>
                </div>
              </div>

              {/* TEKNIS LAPANGAN & DISTRIBUSI */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h4 className="font-black text-mmi text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-mmi rounded-full"></div> Teknis Lapangan & Distribusi
                </h4>
                <div className="grid grid-cols-2 gap-5 mb-2">
                  <CustomSelect label="Hadir Melihat?" name="melihat" value={hwn.melihat} options={[{val:"YA", label:"YA 👀"}, {val:"TIDAK", label:"TIDAK ❌"}]} />
                  <CustomSelect label="Ikut Menyembelih?" name="menyembelih" value={hwn.menyembelih} options={[{val:"YA", label:"YA 🔪"}, {val:"TIDAK", label:"TIDAK ❌"}]} />
                  <CustomSelect label="Sembelih di Luar MMI?" name="penyaluran" value={hwn.penyaluran} options={[{val:"LUAR", label:"YA, BERSEDIA 🌍"}, {val:"DALAM", label:"TIDAK (HARUS DI MMI) 🏢"}]} />
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jml Bagian (Bungkus)</label>
                    <input type="number" name="jml_bagian" value={hwn.jml_bagian} onChange={handleChange} placeholder="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                    <CustomSelect 
                        label="Permintaan Bagian Daging" name="opsi_pesan" value={hwn.opsi_pesan} 
                        options={[{val:"PASRAH", label:"DISERAHKAN KE PANITIA"}, {val:"KHUSUS", label:"ADA PERMINTAAN KHUSUS"}]} 
                    />
                    
                    {hwn.opsi_pesan === "KHUSUS" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 animate-in zoom-in-95">
                            <div className="space-y-1.5 flex flex-col col-span-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detail Permintaan</label>
                                <textarea name="pesan_bagian" rows={2} value={hwn.pesan_bagian} onChange={handleChange} placeholder="CTH: MINTA KEPALA SAPI..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold uppercase resize-none outline-none focus:border-emerald-500 transition-all" />
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* Form 7 Nama (Sapi Utuh Khusus) */}
              {selectedMember.jenis_qurban === "2" && (
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm space-y-4 animate-in zoom-in-95">
                  <h4 className="font-black text-purple-800 text-xs uppercase tracking-widest border-b border-purple-100 pb-3 flex items-center gap-2">
                    <Info size={14}/> Edit 7 Nama Sapi Utuh
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

            </div>

            <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] sticky bottom-0 z-50">
              <button onClick={() => setIsEditOpen(false)} className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all border border-gray-100">Batal</button>
              <button onClick={executeUpdate} disabled={isSubmitting} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all text-white shadow-lg ${isSubmitting ? "bg-mmi/70 cursor-not-allowed" : "bg-mmi hover:bg-mmi-hover shadow-mmi/30"}`}>
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sedang Proses...</> : <><Save size={16} /> Update Data</>}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}