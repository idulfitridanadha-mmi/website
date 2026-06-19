"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Save, User, MapPin, Heart, Wallet, Camera, Phone, ChevronDown, Trash2, Plus, Settings, FileText, Edit3, CheckSquare, Info } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react"; // Buat icon loading muter-muter
import { submitPermohonanOnline } from "@/app/actions/permohonan-online"; // Import mesin yang barusan kita bikin

const wilayahCodes = ["ITS", "ITSA", "ITSB", "ITSC", "ITSD", "ITSE", "ITSF", "ITSG", "ITSH", "ITSI", "ITSJ", "ITSK", "ITSL", "ITSM", "ITSN", "ITSO", "ITSP", "ITSQ", "ITSR", "ITSS", "ITST", "ITSU", "ITSV", "ITSW", "ITSX", "LUAR"];
const formatWilayah = (kode: string) => (kode === "ITS" || kode === "LUAR") ? (kode === "ITS" ? "ITS (CIVITAS ACADEMICA)" : "LUAR ITS (UMUM)") : `ITS - BLOK ${kode.replace("ITS", "")}`;

const CustomSelect = ({ label, value, options, onChange, name, disabled = false, error = false, openDropdown, setOpenDropdown }: any) => {
  const activeLabel = options.find((opt: any) => opt.val === value)?.label || "PILIH OPSI...";
  const isDropdownOpen = openDropdown === name;

  const baseBorder = error 
    ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50' 
    : (isDropdownOpen ? 'bg-gray-50 border-emerald-500 ring-2 ring-emerald-500/10' : 'bg-gray-50 border-gray-200');

  return (
    <div className={`space-y-1.5 flex flex-col relative ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">{label}</label>
      <div 
        onClick={() => !disabled && setOpenDropdown(isDropdownOpen ? null : name)}
        className={`w-full px-4 py-3.5 border ${baseBorder} rounded-xl flex items-center justify-between transition-all ${disabled ? 'bg-gray-100' : 'cursor-pointer hover:border-emerald-500/50'}`}
      >
        <span className={`text-xs font-bold uppercase ${!value ? 'text-gray-400' : (error ? 'text-red-700' : 'text-gray-700')}`}>{activeLabel}</span>
        {!disabled && <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />}
      </div>
      {isDropdownOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
            {options.map((opt: any) => (
              <div 
                key={opt.val}
                onClick={() => { onChange(opt.val); setOpenDropdown(null); }}
                className={`w-full text-left px-4 py-3 text-xs font-bold cursor-pointer transition-colors ${value === opt.val ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50 text-gray-700'}`}
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

export default function DaftarQurbanPublic() {
  const [step, setStep] = useState(0); 
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 👤 STATE 1: DATA DIRI
  const [personalData, setPersonalData] = useState({
    nama_lengkap: "", telepon: "", asal_wilayah: "", alamat: "",
  });

  // 🐄 STATE 2 & 3: HEWAN & OPERASIONAL
  const [animals, setAnimals] = useState([
    { 
      id: 1, 
      jenis: "", bentuk: "", nominal: 0,
      pindah_sapi: false, 
      nama_shohibul_sapi: ["", "", "", "", "", "", ""], 
      
      melihat: "", 
      menyembelih: "", 
      penyaluran: "", 
      jml_bagian: 1, 
      
      opsi_pesan: "", 
      pesan: "", 
      pengambilan_pesan: ""
    }
  ]);
  const [showErrors, setShowErrors] = useState(false);

  const [fileBukti, setFileBukti] = useState<File | null>(null);

  const calculatePrice = (jenis: string, bentuk: string) => {
    if (bentuk === "UANG") {
      if (jenis === "1" || jenis === "3") return 4000000; 
      if (jenis === "2") return 28000000; 
    } else {
      return jenis === "1" ? 150000 : 1000000; 
    }
    return 0;
  };

  const addAnimal = () => {
    setAnimals([...animals, { 
      id: Date.now(), jenis: "", bentuk: "", nominal: 0,
      pindah_sapi: false, nama_shohibul_sapi: ["", "", "", "", "", "", ""],
      melihat: "", menyembelih: "", penyaluran: "", jml_bagian: 1, 
      opsi_pesan: "", pesan: "", pengambilan_pesan: ""
    }]);
  };

  const removeAnimal = (id: number) => {
    if (animals.length > 1) setAnimals(animals.filter(a => a.id !== id));
  };

  const updateAnimal = (id: number, field: string, value: any) => {
    setAnimals(animals.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        if (field === "jenis" && value === "3") updated.bentuk = "UANG"; 
        if (field === "jenis" || field === "bentuk") updated.nominal = calculatePrice(updated.jenis, updated.bentuk);
        return updated;
      }
      return a;
    }));
  };

  // ✨ Fungsi khusus buat update 7 nama Sapi Utuh
  const updateNamaSapi = (animalId: number, index: number, value: string) => {
    setAnimals(animals.map(a => {
      if (a.id === animalId) {
        const newNames = [...a.nama_shohibul_sapi];
        newNames[index] = value;
        return { ...a, nama_shohibul_sapi: newNames };
      }
      return a;
    }));
  };

  const totalPrice = animals.reduce((sum, a) => sum + a.nominal, 0);

  const nextStep = () => {
    // Validasi Step 1: Data Diri
    if (step === 1) {
      if (!personalData.nama_lengkap.trim() || !personalData.telepon.trim() || !personalData.asal_wilayah.trim() || !personalData.alamat.trim()) {
        setShowErrors(true);
        if (!personalData.nama_lengkap.trim()) return toast.error("Nama lengkap wajib diisi!");
        if (!personalData.telepon.trim()) return toast.error("No. WhatsApp wajib diisi!");
        if (!personalData.asal_wilayah.trim()) return toast.error("Asal wilayah wajib dipilih!");
        if (!personalData.alamat.trim()) return toast.error("Alamat pengiriman wajib diisi!");
      }
    }

    // Validasi Step 2: Hewan Qurban
    if (step === 2) {
      for (let i = 0; i < animals.length; i++) {
        const a = animals[i];
        if (!a.jenis || !a.bentuk || !a.nominal || a.nominal <= 0 || (a.jenis === "2" && !a.nama_shohibul_sapi[0].trim())) {
          setShowErrors(true);
          if (!a.jenis) return toast.error(`Jenis hewan ke-${i + 1} wajib dipilih!`);
          if (!a.bentuk) return toast.error(`Bentuk titipan hewan ke-${i + 1} wajib dipilih!`);
          if (!a.nominal || a.nominal <= 0) return toast.error(`Nominal biaya hewan ke-${i + 1} wajib lebih dari 0!`);
          if (a.jenis === "2" && !a.nama_shohibul_sapi[0].trim()) return toast.error(`Nama shohibul hewan ke-${i + 1} (Sapi Utuh) wajib diisi minimal 1 nama pertama!`);
        }
      }
    }

    // Validasi Step 3: Operasional
    if (step === 3) {
      for (let i = 0; i < animals.length; i++) {
        const a = animals[i];
        if (!a.melihat || !a.menyembelih || !a.penyaluran || !a.jml_bagian || a.jml_bagian < 1 || !a.opsi_pesan || (a.opsi_pesan === "KHUSUS" && !a.pesan.trim()) || (a.opsi_pesan === "KHUSUS" && !a.pengambilan_pesan)) {
          setShowErrors(true);
          if (!a.melihat) return toast.error(`Kehadiran melihat hewan ke-${i + 1} wajib dipilih!`);
          if (!a.menyembelih) return toast.error(`Partisipasi menyembelih hewan ke-${i + 1} wajib dipilih!`);
          if (!a.penyaluran) return toast.error(`Penyaluran sembelih hewan ke-${i + 1} wajib dipilih!`);
          if (!a.jml_bagian || a.jml_bagian < 1) return toast.error(`Jumlah bagian daging hewan ke-${i + 1} wajib minimal 1!`);
          if (!a.opsi_pesan) return toast.error(`Opsi permintaan daging hewan ke-${i + 1} wajib dipilih!`);
          if (a.opsi_pesan === "KHUSUS" && !a.pesan.trim()) return toast.error(`Detail permintaan khusus hewan ke-${i + 1} wajib diisi!`);
          if (a.opsi_pesan === "KHUSUS" && !a.pengambilan_pesan) return toast.error(`Opsi pengambilan pesan khusus hewan ke-${i + 1} wajib dipilih!`);
        }
      }
    }

    // Validasi Step 4: Pembayaran
    if (step === 4) {
      if (!fileBukti) {
        setShowErrors(true);
        return toast.error("Bukti transfer pembayaran wajib diupload!");
      }
    }

    setShowErrors(false);
    setStep(s => s + 1);
  };
  const prevStep = () => {
    setShowErrors(false);
    setStep(s => s - 1);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ FUNGSI SAKTI BUAT NGIRIM KE DATABASE
  const executeSubmit = async () => {
    if (!personalData.nama_lengkap) {
      toast.error("Nama lengkap wajib diisi ya!");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Sedang mengirim data ke panitia Idul Adha Masjid Manarul Ilmi ITS...");

    const payload = {
      ...personalData,
      animals: animals,
      totalPrice: totalPrice,
      bukti_bayar: fileBukti ? fileBukti.name : null, // (Note: kalau mau beneran upload gambar, logic Supabase Storage taruh sini nanti)
    };

    const res = await submitPermohonanOnline(payload);

    if (res.success) {
      toast.success(res.message, { id: toastId });
      setIsSubmitted(true); // Baru pindah ke halaman "Jazakumullah" kalau database sukses!
    } else {
      toast.error(res.message, { id: toastId });
    }
    
    setIsSubmitting(false);
  };

  const goToStep = (targetStep: number) => setStep(targetStep);

  const renderStepIndicator = (num: number, title: string, icon: any) => {
    const isActive = step === num;
    const isPast = step > num;
    return (
      <div className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'opacity-100 md:translate-x-2' : isPast ? 'opacity-70' : 'opacity-40'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${isActive ? 'bg-white text-[#115E38] shadow-lg rotate-3' : isPast ? 'bg-emerald-400/30 text-white' : 'border-2 border-emerald-400/30 text-emerald-200'}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-emerald-200/80 uppercase tracking-widest">Tahap {num}</span>
          <span className="text-sm font-black text-white">{title}</span>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center p-4 md:p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 md:p-10 text-center shadow-2xl border border-emerald-50 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-emerald-600 animate-bounce">
            <CheckCircle2 size={48} className="md:w-14 md:h-14" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-3 md:mb-4 tracking-tighter uppercase">Jazakumullah!</h2>
          <p className="text-gray-500 leading-relaxed mb-8 md:mb-10 text-xs md:text-sm px-2">
            Data pendaftaran qurban Anda telah kami terima. Panitia akan segera melakukan verifikasi dan menghubungi Anda melalui WhatsApp.
          </p>
          <div className="space-y-3">
            <button onClick={() => window.location.reload()} className="w-full bg-gray-50 text-gray-600 font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl hover:bg-gray-100 transition-all text-xs md:text-sm uppercase tracking-widest">Daftar Lagi</button>
            <a href="https://wa.me/6281350406784" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#115E38] text-white font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 transition-all text-xs md:text-sm uppercase tracking-widest">
              <Phone size={16}/> Konfirmasi ke Mas Hafiz
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f5e9] flex flex-col justify-center p-4 md:p-8 font-sans">
      
      <div className="w-full max-w-5xl mx-auto bg-white rounded-[24px] md:rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px] md:min-h-[700px] relative">
        
        {/* 🟢 LEFT PANEL */}
        <div className="bg-[#115E38] w-full md:w-5/12 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col h-full justify-center md:justify-start">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6 md:mb-8">
              <Image src="/logo-mmi-putih.png" alt="Logo MMI" width={56} height={56} className="drop-shadow-lg md:w-[64px] md:h-[64px]" />
            </div>
            
            {step === 0 ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-700 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tighter leading-tight">
                  Ahlan Wa <br className="hidden md:block"/><span className="text-emerald-300">Sahlan!</span> ✨
                </h1>
                <p className="text-emerald-100/90 text-xs md:text-sm leading-relaxed mb-6 font-medium px-4 md:px-0">
                  Selamat datang di Portal Pendaftaran Qurban Online Masjid Manarul Ilmi ITS.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500 w-full">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-6 hidden md:block">Pendaftaran<br/>Qurban Masjid Manarul Ilmi ITS</h2>
                
                <div className="hidden md:flex flex-col space-y-5">
                  {renderStepIndicator(1, "Data Shohibul", <User size={18}/>)}
                  {renderStepIndicator(2, "Detail Qurban", <Heart size={18}/>)}
                  {renderStepIndicator(3, "Operasional", <Settings size={18}/>)}
                  {renderStepIndicator(4, "Pembayaran", <Wallet size={18}/>)}
                  {renderStepIndicator(5, "Konfirmasi", <FileText size={18}/>)}
                </div>

                <div className="md:hidden flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/10">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">Langkah {step} dari 5</span>
                     <span className="text-white font-black text-sm">
                       {step === 1 ? "Data Diri" : step === 2 ? "Hewan Qurban" : step === 3 ? "Operasional" : step === 4 ? "Pembayaran" : "Konfirmasi"}
                     </span>
                   </div>
                   <div className="w-8 h-8 bg-white text-[#115E38] rounded-lg flex items-center justify-center font-black">
                     {step === 1 ? <User size={16}/> : step === 2 ? <Heart size={16}/> : step === 3 ? <Settings size={16}/> : step === 4 ? <Wallet size={16}/> : <FileText size={16}/>}
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 mt-6 md:mt-0 pt-4 md:pt-8 border-t border-white/10 text-center md:text-left hidden md:block">
            <p className="text-[9px] md:text-[10px] text-emerald-400 font-bold tracking-widest uppercase">© 2026 Masjid Manarul Ilmi ITS</p>
          </div>
        </div>

        {/* ⚪ RIGHT PANEL */}
        <div className="w-full md:w-7/12 bg-white p-6 md:p-10 flex flex-col justify-between h-full overflow-y-auto">
          
          {/* STEP 0: WELCOME */}
          {step === 0 && (
            <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-700 max-w-sm mx-auto w-full py-8 md:py-0 text-center md:text-left">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 md:mb-6 text-[#115E38] mx-auto md:mx-0">
                <Heart size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-2 md:mb-3 tracking-tight">Muliakan Qurban Anda Bersama Kami</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-8 md:mb-10 px-2 md:px-0">
                Sistem pendaftaran ini dirancang untuk memudahkan Bapak/Ibu dalam menyalurkan qurban. Data akan terintegrasi langsung dengan panitia secara real-time.
              </p>
              
              <button onClick={nextStep} className="w-full py-3.5 md:py-4 bg-[#115E38] hover:bg-emerald-800 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group">
                Mulai Mendaftar <ChevronRight size={16}/>
              </button>
            </div>
          )}

          {/* STEP 1: PERSONAL DATA */}
          {step === 1 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 py-4 md:py-0">
              <h3 className="text-lg md:text-xl font-black text-gray-800 uppercase tracking-tight mb-5 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="w-6 h-6 md:w-8 md:h-8 bg-emerald-100 text-[#115E38] rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm hidden md:flex">1</span> Data Diri
              </h3>
              <div className="space-y-4 md:space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Nama Shohibul (Dengan Gelar)</label>
                  <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input value={personalData.nama_lengkap} onChange={(e)=>setPersonalData({...personalData, nama_lengkap: e.target.value})} type="text" placeholder="CONTOH: FULAN BIN FULAN" className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-xs font-bold focus:outline-none transition-all ${showErrors && !personalData.nama_lengkap.trim() ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 placeholder-red-300 text-red-700' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#115E38]/20 focus:border-[#115E38]'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">No. WhatsApp</label>
                      <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input value={personalData.telepon} onChange={(e)=>setPersonalData({...personalData, telepon: e.target.value})} type="text" placeholder="0812xxxx" className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-xs font-bold focus:outline-none transition-all ${showErrors && !personalData.telepon.trim() ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 placeholder-red-300 text-red-700' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#115E38]/20 focus:border-[#115E38]'}`} />
                      </div>
                  </div>
                  {/* ✨ DROPDOWN ASAL WILAYAH (FULL LIST) */}
                  <CustomSelect 
                    label="Asal Wilayah" name="asal_wilayah" value={personalData.asal_wilayah} 
                    onChange={(val:any) => setPersonalData({...personalData, asal_wilayah: val})} 
                    options={wilayahCodes.map(kode => ({ val: kode, label: formatWilayah(kode).toUpperCase() }))} 
                    error={showErrors && !personalData.asal_wilayah}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Alamat Pengiriman Daging</label>
                  <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 text-gray-400" size={16} />
                      <textarea value={personalData.alamat} onChange={(e)=>setPersonalData({...personalData, alamat: e.target.value})} rows={3} placeholder="TULIS ALAMAT LENGKAP..." className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-xs font-bold resize-none focus:outline-none transition-all ${showErrors && !personalData.alamat.trim() ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 placeholder-red-300 text-red-700' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#115E38]/20 focus:border-[#115E38]'}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ANIMAL SELECTION */}
          {step === 2 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 py-4 md:py-0">
              <h3 className="text-lg md:text-xl font-black text-gray-800 uppercase tracking-tight mb-5 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="w-6 h-6 md:w-8 md:h-8 bg-emerald-100 text-[#115E38] rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm hidden md:flex">2</span> Pilihan Hewan
              </h3>
              
              <div className="space-y-5 md:space-y-6">
                {animals.map((ani, index) => (
                  <div key={ani.id} className="p-4 md:p-5 bg-white border border-gray-200 rounded-2xl relative shadow-sm hover:border-[#115E38]/30 transition-all">
                    {animals.length > 1 && (
                      <button onClick={()=>removeAnimal(ani.id)} className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-red-200 text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors z-10">
                          <Trash2 size={12}/>
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
                      <CustomSelect 
                        label={`Jenis Hewan Ke-${index+1}`} name={`jenis_${ani.id}`} value={ani.jenis} 
                        onChange={(val:any)=>updateAnimal(ani.id, 'jenis', val)} 
                        options={[{val:"1", label:"🐐 KAMBING"}, {val:"3", label:"🤝 SAPI PATUNGAN"}, {val:"2", label:"🐄 SAPI UTUH"}]} 
                        error={showErrors && !ani.jenis}
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                      />
                      <CustomSelect 
                        label="Bentuk Titipan" name={`bentuk_${ani.id}`} value={ani.bentuk} 
                        onChange={(val:any)=>updateAnimal(ani.id, 'bentuk', val)} 
                        disabled={ani.jenis === "3"} 
                        options={[{val:"UANG", label:"💵 TITIP UANG"}, {val:"HEWAN", label:"🥩 BAWA HEWAN"}]} 
                        error={showErrors && !ani.bentuk}
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                      />
                    </div>

                    {/* ✨ 7 NAMA KHUSUS SAPI UTUH ✨ */}
                    {ani.jenis === "2" && (
                        <div className="mb-4 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                            <label className="text-[10px] font-black text-purple-600 uppercase tracking-wider mb-3 block"><Info size={12} className="inline mr-1 -mt-0.5"/> Daftar 7 Nama Shohibul</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {ani.nama_shohibul_sapi.map((nama, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                                        <input type="text" value={nama} onChange={(e) => updateNamaSapi(ani.id, i, e.target.value)} placeholder={`NAMA ${i+1}`} className={`w-full px-3 py-2.5 bg-white border rounded-lg text-xs font-bold outline-none transition-all ${showErrors && i === 0 && !nama.trim() ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 placeholder-red-300 text-red-700' : 'border-purple-100 focus:border-purple-400'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-[#115E38] rounded-xl p-3 md:p-4 text-white flex justify-between items-center shadow-inner">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-200">Biaya Qurban</span>
                      <span className="text-sm md:text-base font-black tracking-tight">Rp {ani.nominal.toLocaleString('id-ID')}</span>
                    </div>

                    {ani.jenis === "1" && (
                      <div className="mt-4 flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100 cursor-pointer group" onClick={() => updateAnimal(ani.id, 'pindah_sapi', !ani.pindah_sapi)}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${ani.pindah_sapi ? "bg-orange-500 border-orange-500 text-white" : "border-orange-300 bg-white group-hover:border-orange-400"}`}>
                          {ani.pindah_sapi && <CheckSquare size={12} />}
                        </div>
                        <p className="text-[10px] font-bold text-orange-800 uppercase tracking-tight">Bersedia dipindahkan ke Sapi Patungan (opsional)</p>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={addAnimal} className="w-full py-3.5 border-2 border-dashed border-emerald-300 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                    <Plus size={16}/> Tambah Hewan Lain
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TEKNIS LAPANGAN (THE MISSING PIECE IS BACK!) */}
          {step === 3 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 py-4 md:py-0">
              <h3 className="text-lg md:text-xl font-black text-gray-800 uppercase tracking-tight mb-5 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="w-6 h-6 md:w-8 md:h-8 bg-emerald-100 text-[#115E38] rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm hidden md:flex">3</span> Teknis Lapangan
              </h3>
              
              <div className="space-y-5 md:space-y-6">
                {animals.map((ani, index) => (
                  <div key={ani.id} className="p-4 md:p-5 bg-white border border-gray-200 rounded-2xl relative shadow-sm">
                    <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Hewan Ke-{index+1} ({ani.jenis === '1' ? 'Kambing' : ani.jenis === '3' ? 'Sapi Patungan' : 'Sapi Utuh'})</h4>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                      <CustomSelect label="Hadir Melihat?" name={`melihat_${ani.id}`} value={ani.melihat} onChange={(val:any)=>updateAnimal(ani.id, 'melihat', val)} options={[{val:"YA", label:"YA 👀"}, {val:"TIDAK", label:"TIDAK ❌"}]} error={showErrors && !ani.melihat} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
                      <CustomSelect label="Ikut Menyembelih?" name={`menyembelih_${ani.id}`} value={ani.menyembelih} onChange={(val:any)=>updateAnimal(ani.id, 'menyembelih', val)} options={[{val:"YA", label:"YA 🔪"}, {val:"TIDAK", label:"TIDAK ❌"}]} error={showErrors && !ani.menyembelih} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-5">
                      {/* ✨ REVISI: Pertanyaan Disembelih di Luar */}
                      <CustomSelect 
                        label="Sembelih di Luar MMI?" name={`penyaluran_${ani.id}`} value={ani.penyaluran} 
                        onChange={(val:any)=>updateAnimal(ani.id, 'penyaluran', val)} 
                        options={[{val:"LUAR", label:"YA, BERSEDIA"}, {val:"DALAM", label:"TIDAK (HARUS DI MMI)"}]} 
                        error={showErrors && !ani.penyaluran}
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                      />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Jml Bagian (Bungkus)</label>
                        <input value={ani.jml_bagian} onChange={(e)=>updateAnimal(ani.id, 'jml_bagian', e.target.value)} type="number" placeholder="1" className={`w-full px-4 py-3.5 border rounded-xl text-xs font-bold focus:outline-none transition-all ${showErrors && (!ani.jml_bagian || ani.jml_bagian < 1) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 placeholder-red-300 text-red-700' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#115E38]/20 focus:border-[#115E38]'}`} />
                      </div>
                    </div>

                    {/* ✨ REVISI: SMART DROPDOWN PERMINTAAN KHUSUS */}
                    <div className="border-t border-gray-100 pt-4">
                        <CustomSelect 
                            label="Permintaan Bagian Daging" name={`opsi_pesan_${ani.id}`} value={ani.opsi_pesan} 
                            onChange={(val:any)=>updateAnimal(ani.id, 'opsi_pesan', val)} 
                            options={[{val:"PASRAH", label:"DISERAHKAN SELURUHNYA KE PANITIA"}, {val:"KHUSUS", label:"ADA PERMINTAAN KHUSUS"}]} 
                            error={showErrors && !ani.opsi_pesan}
                            openDropdown={openDropdown}
                            setOpenDropdown={setOpenDropdown}
                        />
                        
                        {ani.opsi_pesan === "KHUSUS" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in zoom-in-95">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Detail Permintaan</label>
                                    <textarea value={ani.pesan} onChange={(e)=>updateAnimal(ani.id, 'pesan', e.target.value)} rows={2} placeholder="CTH: MINTA KEPALA SAPI..." className={`w-full px-4 py-3 border rounded-xl text-xs font-bold resize-none focus:outline-none transition-all ${showErrors && !ani.pesan.trim() ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 placeholder-red-300 text-red-700' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#115E38]/20 focus:border-[#115E38]'}`} />
                                </div>
                                <CustomSelect 
                                    label="Pengambilan Bagian Khusus" name={`pengambilan_pesan_${ani.id}`} value={ani.pengambilan_pesan} 
                                    onChange={(val:any)=>updateAnimal(ani.id, 'pengambilan_pesan', val)} 
                                    options={[{val:"AMBIL", label:"AMBIL SENDIRI KE MMI"}, {val:"DIANTAR", label:"DIANTAR KE ALAMAT"}]} 
                                    error={showErrors && !ani.pengambilan_pesan}
                                    openDropdown={openDropdown}
                                    setOpenDropdown={setOpenDropdown}
                                />
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 4 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 py-4 md:py-0">
              <h3 className="text-lg md:text-xl font-black text-gray-800 uppercase tracking-tight mb-5 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="w-6 h-6 md:w-8 md:h-8 bg-emerald-100 text-[#115E38] rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm hidden md:flex">4</span> Pembayaran
              </h3>
              
              <div className="space-y-4 md:space-y-5">
                <div className="bg-[#F8FAF9] rounded-2xl p-4 md:p-5 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Tagihan</span>
                      <span className="text-lg md:text-xl font-black text-[#115E38] tracking-tighter">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="bg-[#115E38] rounded-2xl p-4 md:p-5 text-white relative overflow-hidden shadow-lg shadow-emerald-900/20">
                  <div className="absolute -right-4 -bottom-4 opacity-10"><Wallet size={80} className="md:w-[100px] md:h-[100px]"/></div>
                  <p className="text-[9px] md:text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Transfer ke Rekening</p>
                  <p className="text-xs md:text-sm font-black mb-1">Bank Syariah Indonesia (BSI)</p>
                  <p className="text-xl md:text-2xl font-black tracking-widest mb-1">7770778977</p>
                  <p className="text-[10px] md:text-xs font-bold text-emerald-300 uppercase">a.n. TAKMIR MASJID MANARUL ILMI</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Upload Bukti Transfer</label>
                  <label className={`flex flex-col items-center justify-center w-full h-24 md:h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${showErrors && !fileBukti ? 'border-red-500 bg-red-50 hover:bg-red-100' : 'border-emerald-200 bg-[#F8FAF9] hover:bg-emerald-50'}`}>
                      <div className="flex flex-col items-center justify-center">
                          <Camera className={`w-6 h-6 md:w-8 md:h-8 mb-2 transition-colors ${showErrors && !fileBukti ? 'text-red-400 group-hover:text-red-500' : 'text-emerald-200 group-hover:text-emerald-500'}`} />
                          <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${showErrors && !fileBukti ? 'text-red-500' : 'text-gray-400'}`}>
                            {fileBukti ? <span className="text-emerald-600">{fileBukti.name}</span> : <span>Pilih File Gambar</span>}
                          </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e)=>setFileBukti(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ✨ STEP 5: KONFIRMASI (REKAP DATA) ✨ */}
          {step === 5 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 py-4 md:py-0">
              <h3 className="text-lg md:text-xl font-black text-gray-800 uppercase tracking-tight mb-5 md:mb-6 flex items-center gap-2 md:gap-3">
                <span className="w-6 h-6 md:w-8 md:h-8 bg-emerald-100 text-[#115E38] rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm hidden md:flex">5</span> Rekapitulasi Data
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative group">
                  <button onClick={() => goToStep(1)} className="absolute top-4 right-4 text-emerald-600 bg-emerald-50 p-2 rounded-lg hover:bg-emerald-100 transition-colors"><Edit3 size={14}/></button>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Profil Shohibul</h4>
                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <div><span className="block text-gray-400 font-bold text-[9px] uppercase">Nama</span><span className="font-bold text-gray-800 uppercase">{personalData.nama_lengkap || "-"}</span></div>
                    <div><span className="block text-gray-400 font-bold text-[9px] uppercase">WhatsApp</span><span className="font-bold text-gray-800 uppercase">{personalData.telepon || "-"}</span></div>
                    <div><span className="block text-gray-400 font-bold text-[9px] uppercase">Asal Wilayah</span><span className="font-bold text-gray-800 uppercase">{formatWilayah(personalData.asal_wilayah)}</span></div>
                    <div className="col-span-2"><span className="block text-gray-400 font-bold text-[9px] uppercase">Alamat</span><span className="font-bold text-gray-800 uppercase">{personalData.alamat || "-"}</span></div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative group">
                  <button onClick={() => goToStep(2)} className="absolute top-4 right-4 text-emerald-600 bg-emerald-50 p-2 rounded-lg hover:bg-emerald-100 transition-colors"><Edit3 size={14}/></button>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Data Hewan & Teknis</h4>
                  <div className="space-y-4">
                    {animals.map((a, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 text-xs">
                        <div className="font-black text-emerald-700 uppercase border-b border-gray-200 pb-1 mb-2">Hewan {i+1}: {a.jenis === '1' ? 'Kambing' : a.jenis === '3' ? 'Sapi Patungan' : 'Sapi Utuh'}</div>
                        <div className="grid grid-cols-2 gap-y-3">
                          <div><span className="text-gray-400 font-bold text-[9px] uppercase block">Bentuk Titipan</span><span className="font-bold text-gray-800">{a.bentuk}</span></div>
                          <div><span className="text-gray-400 font-bold text-[9px] uppercase block">Hadir & Menyembelih?</span><span className="font-bold text-gray-800">{a.melihat === "YA" ? 'Ya' : 'Tidak'}, {a.menyembelih === "YA" ? 'Ya' : 'Tidak'}</span></div>
                          <div><span className="text-gray-400 font-bold text-[9px] uppercase block">Sembelih Luar MMI?</span><span className="font-bold text-gray-800">{a.penyaluran === 'LUAR' ? 'YA' : 'TIDAK'}</span></div>
                          <div><span className="text-gray-400 font-bold text-[9px] uppercase block">Jml Bagian</span><span className="font-bold text-gray-800">{a.jml_bagian} Bungkus</span></div>
                          
                          <div className="col-span-2">
                            <span className="text-gray-400 font-bold text-[9px] uppercase block">Request Daging</span>
                            <span className="font-bold text-gray-800 uppercase">
                                {a.opsi_pesan === "PASRAH" ? "DISERAHKAN KE PANITIA" : `${a.pesan} (${a.pengambilan_pesan === "AMBIL" ? "AMBIL SENDIRI" : "DIANTAR"})`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative group">
                  <button onClick={() => goToStep(4)} className="absolute top-4 right-4 text-emerald-600 bg-emerald-50 p-2 rounded-lg hover:bg-emerald-100 transition-colors"><Edit3 size={14}/></button>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Pembayaran</h4>
                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <div><span className="block text-gray-400 font-bold text-[9px] uppercase">Total Bayar</span><span className="font-black text-emerald-600 text-sm tracking-tight">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
                    <div className="flex flex-col min-w-0"><span className="block text-gray-400 font-bold text-[9px] uppercase mb-0.5">File Struk</span><span className="font-bold text-gray-800 break-all line-clamp-2 leading-tight">{fileBukti ? fileBukti.name : <span className="text-red-500">Belum Upload</span>}</span></div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 🔘 NAVIGATION BUTTONS */}
          {step > 0 && (
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-100 flex items-center justify-between gap-3 md:gap-4 shrink-0">
              <button onClick={prevStep} className="px-4 md:px-6 py-3.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all flex items-center gap-1 md:gap-2">
                <ChevronLeft size={14} className="md:w-4 md:h-4"/> <span className="hidden md:inline">Kembali</span><span className="md:hidden">Back</span>
              </button>
              
              {step < 5 ? (
                  <button 
                    onClick={nextStep} 
                    className="flex-1 md:flex-none px-6 md:px-8 py-3.5 bg-[#115E38] text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  Lanjut <ChevronRight size={14} className="md:w-4 md:h-4"/>
                </button>
              ) : (
                <button 
                  onClick={executeSubmit} 
                  disabled={isSubmitting}
                  className={`flex-1 md:flex-none px-6 md:px-8 py-3.5 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-emerald-300 cursor-not-allowed shadow-none' : 'bg-[#115E38] hover:bg-emerald-800 shadow-lg shadow-emerald-900/20'}`}
                >
                  {isSubmitting ? <><Loader2 size={14} className="animate-spin md:w-4 md:h-4"/> Menyimpan...</> : <>Submit Final <Save size={14} className="md:w-4 md:h-4"/></>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}