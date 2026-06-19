"use client";

import { X, User, Heart, Wallet, Image as ImageIcon } from "lucide-react";

export default function ViewPermohonanDrawer({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) {
  if (!isOpen || !data) return null;

  const daftarHewan = JSON.parse(data.daftar_hewan);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-50 shadow-2xl z-[110] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-50">
          <div>
            <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2"><EyeIcon /> Detail Permohonan Online</h3>
            <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-tight">Tgl Submit: <span className="text-gray-800 font-black">{new Date(data.tanggal_submit).toLocaleString('id-ID')}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-gray-100"><X size={22} /></button>
        </div>

        {/* KONTEN DETAIL */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 pb-32">
          
          {/* IDENTITAS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-black text-emerald-700 text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
              <User size={16}/> Profil Shohibul
            </h4>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</span><span className="font-black text-gray-800 uppercase">{data.nama_lengkap}</span></div>
              <div><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">No. WhatsApp</span><span className="font-bold text-gray-800">{data.telepon}</span></div>
              <div><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asal Wilayah</span><span className="font-bold text-emerald-600 uppercase">{data.asal_wilayah}</span></div>
              <div className="col-span-2"><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Lengkap</span><span className="font-bold text-gray-800 uppercase">{data.alamat}</span></div>
            </div>
          </div>

          {/* DAFTAR HEWAN */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-black text-emerald-700 text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
              <Heart size={16}/> Data Hewan & Teknis Lapangan
            </h4>
            <div className="space-y-4">
              {daftarHewan.map((hwn: any, i: number) => (
                <div key={i} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-sm">
                  <div className="flex justify-between items-center border-b border-emerald-200/50 pb-2 mb-3">
                    <span className="font-black text-emerald-800 uppercase">Hewan {i+1}: {hwn.jenis === '1' ? 'KAMBING' : hwn.jenis === '3' ? 'SAPI PATUNGAN' : 'SAPI UTUH'}</span>
                    <span className="font-black text-emerald-600 bg-white px-3 py-1 rounded-lg border border-emerald-100">Rp {hwn.nominal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <div><span className="block text-[9px] font-bold text-gray-400 uppercase">Bentuk</span><span className="font-bold text-gray-800">{hwn.bentuk}</span></div>
                    <div><span className="block text-[9px] font-bold text-gray-400 uppercase">Hadir & Sembelih?</span><span className="font-bold text-gray-800">{hwn.melihat ? 'YA' : 'TIDAK'} & {hwn.menyembelih ? 'YA' : 'TIDAK'}</span></div>
                    <div><span className="block text-[9px] font-bold text-gray-400 uppercase">Sembelih Luar MMI?</span><span className="font-bold text-gray-800">{hwn.penyaluran === 'LUAR' ? 'YA' : 'TIDAK'}</span></div>
                    <div><span className="block text-[9px] font-bold text-gray-400 uppercase">Jml Bagian</span><span className="font-bold text-gray-800">{hwn.jml_bagian} Bungkus</span></div>
                    <div className="col-span-2">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase">Request Daging</span>
                        <span className="font-bold text-gray-800 uppercase bg-white px-2 py-1 rounded inline-block mt-1 border border-gray-200">
                            {hwn.opsi_pesan === 'PASRAH' ? 'DISERAHKAN KE PANITIA' : `${hwn.pesan} (${hwn.pengambilan_pesan === 'AMBIL' ? 'AMBIL SENDIRI' : 'DIANTAR'})`}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PEMBAYARAN */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-black text-emerald-700 text-xs uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
              <Wallet size={16}/> Informasi Pembayaran
            </h4>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Tagihan</span>
              <span className="text-xl font-black text-emerald-600">Rp {Number(data.total_pembayaran).toLocaleString('id-ID')}</span>
            </div>
            
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bukti Transfer</span>
              {data.bukti_bayar ? (
                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100">
                  <ImageIcon size={24} className="shrink-0" />
                  <span className="font-bold text-sm truncate">{data.bukti_bayar}</span>
                  {/* ✨ Karena kita belum nyimpen file fisik, ini cuma nampilin nama filenya dulu ya */}
                </div>
              ) : (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 font-bold text-sm text-center">
                  Tidak Melampirkan Bukti
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// Komponen ikon kecil buat di atas
function EyeIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}