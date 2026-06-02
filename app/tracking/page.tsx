"use client";

import { useState } from "react";
import { Search, Loader2, Calendar, CheckCircle2, Award, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PublicTrackingPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch(`/api/track?query=${encodeURIComponent(query.trim())}`);
      const resData = await res.json();

      if (res.ok && resData.success) {
        setResults(resData.data);
      } else {
        setError(resData.message || "Data pelacakan qurban tidak ditemukan.");
      }
    } catch (err) {
      setError("Gagal menghubungi server. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (currentStatus: string, step: string) => {
    const order = ["MENUNGGU", "DISEMBELIH", "DIDISTRIBUSIKAN"];
    const currentIndex = order.indexOf(currentStatus.toUpperCase());
    const stepIndex = order.indexOf(step.toUpperCase());

    if (currentIndex >= stepIndex) return "completed";
    if (currentIndex + 1 === stepIndex) return "active";
    return "upcoming";
  };

  const getFormatJenisQurban = (code: string) => {
    if (code === "1") return "🐐 KAMBING";
    if (code === "2") return "🐄 SAPI UTUH";
    if (code === "3") return "🤝 SAPI PATUNGAN";
    return "HEWAN QURBAN";
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9] flex flex-col font-sans">
      {/* Navbar MMI Consistent */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#115E38] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="font-extrabold text-xl text-[#115E38] tracking-tight">Qurban MMI</span>
            </Link>
            <Link 
              href="/" 
              className="text-emerald-800 hover:text-emerald-950 font-black text-xs uppercase tracking-widest transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow pt-28 pb-16 px-4 max-w-4xl mx-auto w-full">
        
        {/* Banner header logo */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex justify-center mb-4">
            <Image src="/logo-mmi-hijau.png" alt="Logo MMI" width={64} height={64} className="drop-shadow-md" onError={(e) => {
              // Fallback jika logo hijau tidak ada
              (e.target as HTMLElement).style.display = "none";
            }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tighter uppercase mb-2">
            Pelacakan Status Qurban
          </h1>
          <p className="text-[#115E38] font-bold text-xs uppercase tracking-wider max-w-md mx-auto">
            Portal Informasi Real-Time Shohibul Qurban Masjid Manarul Ilmi ITS
          </p>
        </div>

        {/* Search Bar - MMI Style Input */}
        <form onSubmit={handleSearch} className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-emerald-100 p-2 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
            <div className="pl-4 text-emerald-600">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Masukkan NKW, No. HP, Nama Shohibul, atau ID Hewan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-gray-700 placeholder-gray-400 focus:outline-none py-3 px-4 text-xs font-bold uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#115E38] hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3.5 transition-all shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mencari...
                </>
              ) : (
                "Lacak"
              )}
            </button>
          </div>
        </form>

        {/* Alert Error / Not Found */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-3xl p-6 text-center animate-in zoom-in-95 duration-300 mb-8 shadow-sm">
            <p className="font-extrabold text-sm uppercase tracking-wide">{error}</p>
            <p className="text-xs mt-1 text-red-500 font-bold">Pastikan data yang Anda masukkan sesuai dengan yang didaftarkan ke panitia.</p>
          </div>
        )}

        {/* Results Container */}
        {results && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {results.map((hewan) => (
              <div
                key={hewan.id_hewan}
                className="bg-white rounded-[24px] shadow-lg border border-emerald-50 p-6 sm:p-8 hover:shadow-xl transition-all duration-300"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-100 pb-5 mb-6 gap-4">
                  <div>
                    <span className="text-[10px] font-black text-[#115E38] bg-emerald-50 px-3 py-1.5 rounded-lg uppercase tracking-wider border border-emerald-100">
                      ID Hewan: {hewan.no_id_lama}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-800 mt-3 uppercase tracking-tight">{hewan.nama_shohibul}</h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                      NKW: {hewan.nkw} | WhatsApp: {hewan.telepon_masked}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[9px] font-black px-3 py-2 rounded-xl uppercase tracking-wider bg-gray-100 text-gray-700">
                      {getFormatJenisQurban(hewan.jenis_qurban)}
                    </span>
                    <span className={`text-[9px] font-black px-3 py-2 rounded-xl uppercase tracking-wider ${
                      hewan.status_bayar === "LUNAS"
                        ? "bg-emerald-100 text-[#115E38] border border-emerald-200"
                        : hewan.status_bayar === "DP"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}>
                      Pembayaran: {hewan.status_bayar}
                    </span>
                  </div>
                </div>

                {/* Stepper pemrosesan hewan qurban */}
                <div className="mt-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Status Pemrosesan</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Tahap 1: Menunggu */}
                    <div className="flex items-center md:flex-col md:text-center p-4 bg-[#F8FAF9] rounded-2xl border border-gray-100 gap-4 md:gap-3 transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all font-black ${
                        getStepStatus(hewan.status_hewan, "MENUNGGU") === "completed"
                          ? "bg-[#115E38] text-white shadow-md shadow-emerald-900/10"
                          : "bg-amber-500 text-white animate-pulse"
                      }`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col md:items-center">
                        <h4 className="font-extrabold text-gray-800 text-xs uppercase tracking-wide">Hewan Tersedia</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-normal">Hewan terverifikasi dan sehat di kandang penampungan MMI.</p>
                      </div>
                    </div>

                    {/* Tahap 2: Disembelih */}
                    <div className="flex items-center md:flex-col md:text-center p-4 bg-[#F8FAF9] rounded-2xl border border-gray-100 gap-4 md:gap-3 transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all font-black ${
                        getStepStatus(hewan.status_hewan, "DISEMBELIH") === "completed"
                          ? "bg-[#115E38] text-white shadow-md shadow-emerald-900/10"
                          : getStepStatus(hewan.status_hewan, "DISEMBELIH") === "active"
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-gray-200 text-gray-400"
                      }`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col md:items-center">
                        <h4 className="font-extrabold text-gray-800 text-xs uppercase tracking-wide">Penyembelihan</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-normal">Penyembelihan syar'i oleh jagal resmi MMI di area jagal.</p>
                      </div>
                    </div>

                    {/* Tahap 3: Didistribusikan */}
                    <div className="flex items-center md:flex-col md:text-center p-4 bg-[#F8FAF9] rounded-2xl border border-gray-100 gap-4 md:gap-3 transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all font-black ${
                        getStepStatus(hewan.status_hewan, "DIDISTRIBUSIKAN") === "completed"
                          ? "bg-[#115E38] text-white shadow-md shadow-emerald-900/10"
                          : getStepStatus(hewan.status_hewan, "DIDISTRIBUSIKAN") === "active"
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-gray-200 text-gray-400"
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col md:items-center">
                        <h4 className="font-extrabold text-gray-800 text-xs uppercase tracking-wide">Distribusi Daging</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-normal">Daging qurban dikemas higienis dan disalurkan ke penerima manfaat.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer rekap data tipis */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Metode: {hewan.metode_bayar}</span>
                  <span>Opsi Permintaan: {hewan.opsi_pesan}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer MMI */}
      <footer className="bg-white border-t border-emerald-100 py-8 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#115E38] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
            <span className="font-bold text-[#115E38] text-sm tracking-tight">Qurban MMI ITS</span>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Masjid Manarul Ilmi ITS. Kelompok 5 - PSO C.
          </p>
        </div>
      </footer>
    </div>
  );
}
