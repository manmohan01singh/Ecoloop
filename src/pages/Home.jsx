import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Smartphone, Laptop, Monitor, Cpu, Shield, TrendingUp, Recycle } from 'lucide-react';
import Header from '../components/layout/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-green-50/30" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-8">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 tracking-wide">SDG 9 • INDUSTRY, INNOVATION & INFRASTRUCTURE</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
            From Digital Waste<br />
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              To Ecological Worth
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            India's first AI-powered e-waste tracking platform. Predict device end-of-life, 
            connect with certified recyclers, and turn your digital waste into environmental value.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
              Start Tracking <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { value: '1.7M+', label: 'Tonnes E-Waste/Year' },
              { value: '750M+', label: 'Smartphone Users' },
              { value: '80%+', label: 'Informal Processing' },
              { value: '#3', label: 'Global Rank' },
            ].map((stat) => (
              <div key={stat.label} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Death Clock Preview */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              The <span className="text-emerald-600">Death Clock</span> for Your Devices
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Our AI predicts when your device will reach end-of-life, so you can act before it's too late.
            </p>
          </div>
          
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">iPhone 12</h3>
                <p className="text-sm text-gray-500">Purchased Mar 2021</p>
              </div>
              <div className="ml-auto px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Warning</div>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${65 * 2.64} ${100 * 2.64}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">65%</span>
                  <span className="text-xs text-gray-500">Health Score</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <div className="text-lg font-bold text-emerald-700">~425</div>
                <div className="text-xs text-gray-500">Days Left</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-center">
                <div className="text-lg font-bold text-amber-700">Warning</div>
                <div className="text-xs text-gray-500">Status</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Nine Innovation Layers
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              A comprehensive ecosystem where each innovation amplifies the others.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Smartphone, title: 'Device Neural Twin', desc: 'AI-powered death clock prediction for every device' },
              { icon: Recycle, title: 'Mycoremediation Pods', desc: 'Bio-based decentralized processing units' },
              { icon: TrendingUp, title: 'E-Waste Credit', desc: 'Turn e-waste value into micro-loans' },
              { icon: Shield, title: 'Strategic Minerals', desc: 'Recover rare-earth metals for national security' },
              { icon: Laptop, title: 'Children\'s E-Waste OS', desc: 'Gamified education for behavior change' },
              { icon: Monitor, title: 'Sacred Infrastructure', desc: 'Religious institutions as collection points' },
            ].map((feature) => (
              <div key={feature.title} className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all">
                <div className="w-11 h-11 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-emerald-600 rounded-2xl">
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to Make an Impact?
            </h2>
            <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
              Join EcoLoop today. Track your devices, predict their end-of-life, and contribute to a sustainable future.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-gray-900">EcoLoop</span>
          </div>
          <p className="text-sm text-gray-500">Team Jai Mahakaal • SDG 9 • 2026</p>
        </div>
      </footer>
    </div>
  );
}
