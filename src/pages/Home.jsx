import { Link } from 'react-router-dom';
import { Leaf, Clock, Shield, TrendingUp, Recycle, Award, Globe, Zap, ArrowRight, Smartphone, Laptop, Tv } from 'lucide-react';
import Header from '../components/layout/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-8">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">SDG 9 - Industry, Innovation & Infrastructure</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6">
            <span className="text-gray-900">From Digital Waste</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
              To Ecological Worth
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            India's first AI-powered e-waste tracking platform. Predict device end-of-life, 
            connect with certified recyclers, and turn your digital waste into environmental value.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:scale-105 transition-all flex items-center gap-2">
              Start Tracking <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="px-8 py-4 bg-white text-emerald-700 font-semibold rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { value: '1.7M+', label: 'Tonnes E-Waste/Year' },
              { value: '750M+', label: 'Smartphone Users' },
              { value: '80%+', label: 'Informal Processing' },
              { value: '#3', label: 'Global Rank' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Death Clock Preview */}
      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The <span className="text-emerald-600">Death Clock</span> for Your Devices
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Our AI predicts when your device will reach end-of-life, so you can act before it's too late.
            </p>
          </div>
          
          <div className="max-w-lg mx-auto bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-100/50 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">iPhone 12</h3>
                <p className="text-sm text-gray-500">Purchased Mar 2021</p>
              </div>
            </div>
            
            {/* Health Ring */}
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#ecfdf5" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${65 * 2.64} ${100 * 2.64}`} />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">65%</span>
                  <span className="text-xs text-gray-500">Health</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <div className="text-lg font-bold text-emerald-700">~425</div>
                <div className="text-xs text-gray-500">Days Left</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <div className="text-lg font-bold text-amber-700">Warning</div>
                <div className="text-xs text-gray-500">Status</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Nine Innovation Layers
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              A comprehensive ecosystem where each innovation amplifies the others.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Device Neural Twin', desc: 'AI-powered death clock prediction for every device', color: 'emerald' },
              { icon: Recycle, title: 'Mycoremediation Pods', desc: 'Bio-based decentralized processing units', color: 'green' },
              { icon: TrendingUp, title: 'E-Waste Credit', desc: 'Turn e-waste value into micro-loans', color: 'teal' },
              { icon: Award, title: 'Children\'s E-Waste OS', desc: 'Gamified education for behavior change', color: 'emerald' },
              { icon: Shield, title: 'Strategic Minerals', desc: 'Recover rare-earth metals for national security', color: 'green' },
              { icon: Globe, title: 'Sacred Infrastructure', desc: 'Religious institutions as collection points', color: 'teal' },
            ].map((feature) => (
              <div key={feature.title} className="group p-6 bg-white rounded-2xl border border-emerald-100 hover:border-emerald-200 shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="impact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-2xl shadow-emerald-200">
            <Zap className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-lg mx-auto">
              Join EcoLoop today. Track your devices, predict their end-of-life, and contribute to a sustainable future.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-colors">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-emerald-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-gray-900">EcoLoop</span>
          </div>
          <p className="text-sm text-gray-500">Team Jai Mahakaal | SDG 9 | 2026</p>
        </div>
      </footer>
    </div>
  );
}
