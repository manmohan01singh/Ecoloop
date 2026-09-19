import { Link } from 'react-router-dom';
import { ArrowRight, Users, Recycle, Wrench, MapPin, Trophy, Zap, Heart, Package, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPlatformImpact } from '../services/communityService';
import { useTranslation } from '../hooks/useTranslation';

export default function Home() {
  const { t, language } = useTranslation();
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    getPlatformImpact().then(r => setImpact(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 tracking-wide">
              {language === 'id' ? 'PLATFORM EKONOMI SIRKULAR INDONESIA' : 'INDONESIA CIRCULAR ECONOMY PLATFORM'}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] mb-6">
            {t('home.hero.title').split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium">
            {t('home.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/community" className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
              {language === 'id' ? 'Jelajahi Komunitas' : 'Explore Community'} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
              {language === 'id' ? 'Cari Solusi' : 'Find Solution'} <Recycle className="w-4 h-4" />
              {t('language') === 'id' ? 'Cari Solusi' : 'Find Solution'} <Recycle className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PLATFORM STATS ───────────────────────────────────── */}
      <section className="py-12 px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: impact?.totalUsers ?? '—', labelEn: 'Active Users', labelId: 'Pengguna Aktif', icon: Users },
            { value: impact?.totalListingsCompleted ?? '—', labelEn: 'Items Recirculated', labelId: 'Item Beredar Ulang', icon: Recycle },
            { value: impact?.totalRepairsCompleted ?? '—', labelEn: 'Items Repaired', labelId: 'Barang Diperbaiki', icon: Wrench },
            { value: impact ? `${impact.totalWasteDepositedKg} kg` : '—', labelEn: 'Waste Managed', labelId: 'Sampah Terkelola', icon: Package },
          ].map(s => (
            <div key={s.labelEn}>
              <s.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{language === 'id' ? s.labelId : s.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CIRCULAR ACTION ──────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {language === 'id' ? 'Satu barang, banyak jalan' : 'One item, many paths'}
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              {language === 'id' ? 'Setiap item memiliki potensi. Pilih aksi sirkular yang tepat.' : 'Every item has potential. Choose the right circular action.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { labelEn: 'Give Away', labelId: 'Berikan', icon: '🎁', color: 'bg-blue-50 border-blue-200 text-blue-700', action: 'give_away' },
              { labelEn: 'Sell', labelId: 'Jual', icon: '💰', color: 'bg-amber-50 border-amber-200 text-amber-700', action: 'sell' },
              { labelEn: 'Donate', labelId: 'Donasikan', icon: '❤️', color: 'bg-red-50 border-red-200 text-red-700', action: 'donate' },
              { labelEn: 'Repair', labelId: 'Perbaiki', icon: '🔧', color: 'bg-orange-50 border-orange-200 text-orange-700', action: 'repair' },
              { labelEn: 'Reuse', labelId: 'Gunakan Ulang', icon: '🔄', color: 'bg-green-50 border-green-200 text-green-700', action: 'reuse' },
              { labelEn: 'Recycle', labelId: 'Daur Ulang', icon: '♻️', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', action: 'recycle' },
            ].map(a => (
              <Link key={a.action} to={`/marketplace?circularAction=${a.action}`}
                className={`flex flex-col items-center p-5 rounded-xl border-2 ${a.color} hover:shadow-md transition-all cursor-pointer`}>
                <span className="text-3xl mb-2">{a.icon}</span>
                <span className="text-sm font-semibold">{language === 'id' ? a.labelId : a.labelEn}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {language === 'id' ? 'Ekosistem lengkap dalam satu platform' : 'Complete ecosystem in one platform'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Users, titleEn: 'Reddit-style Community', titleId: 'Komunitas Reddit-style', descEn: 'Join zero waste, recycling, repair communities and more.', descId: 'Bergabung dengan komunitas zero waste, daur ulang, perbaikan, dan banyak lagi.', link: '/community' },
              { icon: Package, titleEn: 'Circular Marketplace', titleId: 'Marketplace Sirkular', descEn: 'Sell, give away, or swap used items. No money required — can be free.', descId: 'Jual, berikan, atau tukarkan barang bekas. Tidak ada uang wajib — bisa gratis.', link: '/marketplace' },
              { icon: MapPin, titleEn: 'Resource Map', titleId: 'Peta Sumber Daya', descEn: 'Find waste banks, recycling centers, repair shops, and collection points.', descId: 'Temukan lokasi bank sampah, pusat daur ulang, toko servis, dan titik pengumpulan.', link: '/map' },
              { icon: Wrench, titleEn: 'Repair Community', titleId: 'Komunitas Repair', descEn: 'Find trusted repairers or ask community for help fixing items.', descId: 'Temukan tukang servis terpercaya atau minta bantuan dari komunitas untuk memperbaiki barang.', link: '/repair' },
              { icon: Trophy, titleEn: 'Challenges & Events', titleId: 'Tantangan & Event', descEn: 'Join waste collection challenges and local swap events in your city.', descId: 'Ikuti tantangan pengumpulan sampah dan event swap lokal di kotamu.', link: '/challenges' },
              { icon: AlertTriangle, titleEn: 'Report Waste Issues', titleId: 'Lapor Masalah Sampah', descEn: 'Report illegal dumping, full collection points, or hazardous waste in your area.', descId: 'Laporkan pembuangan ilegal, TPS penuh, atau sampah berbahaya di lingkunganmu.', link: '/reports' },
              { icon: Zap, titleEn: 'EcoKarma', titleId: 'EcoKarma', descEn: 'Earn points and badges from real actions. Not just posts — actions that count.', descId: 'Raih poin dan badge dari aksi nyata. Bukan sekadar posting — aksi yang dihitung.', link: '/impact' },
              { icon: Heart, titleEn: 'Digital Waste Bank', titleId: 'Bank Sampah Digital', descEn: 'Record your waste bank deposits and track their value.', descId: 'Catat setoran sampahmu ke bank sampah dan pantau nilainya.', link: '/marketplace?type=waste_bank' },
              { icon: Package, titleEn: 'Business Material Exchange', titleId: 'Bursa Material Bisnis', descEn: 'Businesses can list surplus materials for other businesses to take or reuse.', descId: 'Bisnis bisa listing surplus material untuk diambil atau digunakan ulang bisnis lain.', link: '/business' },
            ].map(f => (
              <Link key={f.titleEn} to={f.link}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all">
                <f.icon className="w-8 h-8 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900 mb-2">{language === 'id' ? f.titleId : f.titleEn}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{language === 'id' ? f.descId : f.descEn}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gray-900 rounded-2xl">
            <h2 className="text-3xl font-bold text-white mb-3">
              {language === 'id' ? 'Mulai perjalanan sirkularmu' : 'Start your circular journey'}
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {language === 'id' ? 'Bergabung dengan ribuan warga Indonesia yang sudah mengubah sampah menjadi nilai.' : 'Join thousands of Indonesians who have transformed waste into value.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="px-8 py-3.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-colors">
                {language === 'id' ? 'Daftar Gratis' : 'Register Free'}
              </Link>
              <Link to="/community" className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
                {language === 'id' ? 'Lihat Komunitas' : 'View Community'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-gray-900">
            {language === 'id' ? 'EcoLoop — Ekonomi Sirkular Indonesia' : 'EcoLoop — Indonesia Circular Economy'}
          </p>
          <p className="text-sm text-gray-400">Team Jai Mahakaal · Grand Finale 2026</p>
        </div>
      </footer>
    </div>
  );
}
