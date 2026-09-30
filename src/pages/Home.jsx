import { Link } from 'react-router-dom';
import { ArrowRight, Users, Recycle, Wrench, MapPin, Trophy, Zap, Heart, Package, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPlatformImpact } from '../services/communityService';
import { useTranslation } from '../hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();
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
              INDONESIA CIRCULAR ECONOMY PLATFORM
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
              Explore Community <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
              Find Solution <Recycle className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PLATFORM STATS ───────────────────────────────────── */}
      <section className="py-12 px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: impact?.totalUsers ?? '—', label: 'Active Users', icon: Users },
            { value: impact?.totalListingsCompleted ?? '—', label: 'Items Recirculated', icon: Recycle },
            { value: impact?.totalRepairsCompleted ?? '—', label: 'Items Repaired', icon: Wrench },
            { value: impact ? `${impact.totalWasteDepositedKg} kg` : '—', label: 'Waste Managed', icon: Package },
          ].map(s => (
            <div key={s.label}>
              <s.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CIRCULAR ACTION ──────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              One item, many paths
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Every item has potential. Choose the right circular action.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Give Away', icon: '🎁', color: 'bg-blue-50 border-blue-200 text-blue-700', action: 'give_away' },
              { label: 'Sell', icon: '💰', color: 'bg-amber-50 border-amber-200 text-amber-700', action: 'sell' },
              { label: 'Donate', icon: '❤️', color: 'bg-red-50 border-red-200 text-red-700', action: 'donate' },
              { label: 'Repair', icon: '🔧', color: 'bg-orange-50 border-orange-200 text-orange-700', action: 'repair' },
              { label: 'Reuse', icon: '🔄', color: 'bg-green-50 border-green-200 text-green-700', action: 'reuse' },
              { label: 'Recycle', icon: '♻️', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', action: 'recycle' },
            ].map(a => (
              <Link key={a.action} to={`/marketplace?circularAction=${a.action}`}
                className={`flex flex-col items-center p-5 rounded-xl border-2 ${a.color} hover:shadow-md transition-all cursor-pointer`}>
                <span className="text-3xl mb-2">{a.icon}</span>
                <span className="text-sm font-semibold">{a.label}</span>
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
              Complete ecosystem in one platform
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Users, title: 'Reddit-style Community', desc: 'Join zero waste, recycling, repair communities and more.', link: '/community' },
              { icon: Package, title: 'Circular Marketplace', desc: 'Sell, give away, or swap used items. No money required — can be free.', link: '/marketplace' },
              { icon: MapPin, title: 'Resource Map', desc: 'Find waste banks, recycling centers, repair shops, and collection points.', link: '/map' },
              { icon: Wrench, title: 'Repair Community', desc: 'Find trusted repairers or ask community for help fixing items.', link: '/repair' },
              { icon: Trophy, title: 'Challenges & Events', desc: 'Join waste collection challenges and local swap events in your city.', link: '/challenges' },
              { icon: AlertTriangle, title: 'Report Waste Issues', desc: 'Report illegal dumping, full collection points, or hazardous waste in your area.', link: '/reports' },
              { icon: Zap, title: 'EcoKarma', desc: 'Earn points and badges from real actions. Not just posts — actions that count.', link: '/impact' },
              { icon: Heart, title: 'Digital Waste Bank', desc: 'Record your waste bank deposits and track their value.', link: '/marketplace?type=waste_bank' },
              { icon: Package, title: 'Business Material Exchange', desc: 'Businesses can list surplus materials for other businesses to take or reuse.', link: '/business' },
            ].map(f => (
              <Link key={f.title} to={f.link}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all">
                <f.icon className="w-8 h-8 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
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
              Start your circular journey
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Join thousands of people who have transformed waste into value.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="px-8 py-3.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-colors">
                Register Free
              </Link>
              <Link to="/community" className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
                View Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-gray-900">
            EcoLoop — Indonesia Circular Economy
          </p>
          <p className="text-sm text-gray-400">Team Jai Mahakaal · Grand Finale 2026</p>
        </div>
      </footer>
    </div>
  );
}
