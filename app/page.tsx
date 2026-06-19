import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, ClipboardList, HandHeart, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="font-semibold text-xl text-emerald-900">Qurban MMI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-emerald-700 hover:text-emerald-800 font-medium text-sm transition-colors"
              >
                Login Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative bg-emerald-900 overflow-hidden text-white py-24 sm:py-32 lg:pb-40">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 to-emerald-950"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800/50 border border-emerald-700/50 text-emerald-200 text-sm font-medium mb-8">
              <Calendar className="w-4 h-4" />
              <span>Idul Adha 1447 H / 2026 M</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Sistem Administrasi <br className="hidden sm:block" />
              <span className="text-amber-400">Qurban Masjid Manarul Ilmi</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
              Layanan pendaftaran dan manajemen hewan qurban yang transparan, mudah, dan amanah.
            </p>
            <div className="flex flex-col items-center gap-4 justify-center" data-aos="fade-up" data-aos-delay="200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <Link
                  href="/daftar-qurban"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-emerald-950 bg-amber-400 hover:bg-amber-500 rounded-full transition-all hover:scale-105"
                >
                  Daftar Qurban Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              <Link
                href="/tracking"
                className="text-emerald-200 hover:text-amber-400 font-medium text-sm transition-colors mt-2"
              >
                Sudah mendaftar qurban? Lacak hewan Anda di sini →
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl font-bold text-emerald-950 mb-4">Kenapa Qurban Bersama Kami?</h2>
              <p className="text-zinc-600 max-w-2xl mx-auto">
                Kami berkomitmen memberikan pelayanan terbaik untuk ibadah qurban Anda.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ClipboardList className="w-8 h-8 text-emerald-600" />,
                  title: "Pendaftaran Mudah",
                  desc: "Sistem pendaftaran online yang cepat, kapan saja dan di mana saja tanpa harus datang langsung.",
                },
                {
                  icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
                  title: "Transparan & Akuntabel",
                  desc: "Setiap data shohibul qurban dan hewan tercatat rapi, menghindari kesalahan administrasi.",
                },
                {
                  icon: <HandHeart className="w-8 h-8 text-emerald-600" />,
                  title: "Amanah Penyaluran",
                  desc: "Daging qurban disalurkan kepada yang berhak menerima di lingkungan sekitar secara terstruktur.",
                },
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-shadow"
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-emerald-950 mb-3">{feature.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-24 bg-emerald-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="zoom-in">
            <div className="bg-emerald-900 rounded-[3rem] p-12 sm:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative z-10">
                <Users className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Mari Berqurban Tahun Ini
                </h2>
                <p className="text-emerald-100 mb-10 max-w-xl mx-auto text-lg">
                  Niatkan qurban Anda untuk mendapat ridho Allah SWT. Kami siap membantu mengurus administrasi dan penyalurannya dengan baik.
                </p>
                <Link
                  href="/daftar-qurban"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
            <span className="font-semibold text-emerald-950">Qurban MMI</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Masjid Manarul Ilmi ITS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
