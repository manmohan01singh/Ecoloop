import { useState, useEffect } from 'react';
import { Leaf, Droplets, Zap, Recycle, Award, Loader2, TreePine } from 'lucide-react';
import { getMyImpact, getGlobalImpact } from '../services/deviceService';

export default function Impact() {
  const [myImpact, setMyImpact] = useState(null);
  const [global, setGlobal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyImpact(), getGlobalImpact()])
      .then(([my, gl]) => {
        setMyImpact(my.data.data);
        setGlobal(gl.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  const m = myImpact || { totals: { co2Saved: 0, energySaved: 0, materialsRecovered: 0, waterSaved: 0 }, badges: [], totalDevices: 0 };
  const g = global || { totalDevicesTracked: 0, estimatedCo2Saved: 0 };

  const stats = [
    { icon: Zap, label: 'CO₂ Saved', value: m.totals.co2Saved, unit: 'kg', color: 'emerald' },
    { icon: Leaf, label: 'Energy Saved', value: m.totals.energySaved, unit: 'kWh', color: 'green' },
    { icon: Recycle, label: 'Materials Recovered', value: m.totals.materialsRecovered, unit: 'kg', color: 'teal' },
    { icon: Droplets, label: 'Water Saved', value: m.totals.waterSaved, unit: 'L', color: 'cyan' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Environmental Impact</h1>
        <p className="text-gray-600 mt-1">Track your contribution to a sustainable future</p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 bg-white rounded-xl border border-gray-200 text-center">
            <div className={`w-12 h-12 bg-${s.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <s.icon className={`w-6 h-6 text-${s.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}<span className="text-sm font-normal text-gray-500"> {s.unit}</span></div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Equivalents */}
      <div className="bg-emerald-600 rounded-xl p-8 text-white mb-8">
        <h2 className="text-xl font-semibold mb-6">Your Impact in Perspective</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <TreePine className="w-10 h-10 mx-auto mb-2 text-emerald-200" />
            <div className="text-3xl font-bold">{Math.round(m.totals.co2Saved / 22)}</div>
            <div className="text-emerald-200 text-sm">Trees Equivalent</div>
          </div>
          <div className="text-center">
            <Zap className="w-10 h-10 mx-auto mb-2 text-emerald-200" />
            <div className="text-3xl font-bold">{Math.round(m.totals.energySaved / 0.5)}</div>
            <div className="text-emerald-200 text-sm">Phone Charges Saved</div>
          </div>
          <div className="text-center">
            <Droplets className="w-10 h-10 mx-auto mb-2 text-emerald-200" />
            <div className="text-3xl font-bold">{Math.round(m.totals.waterSaved / 2)}</div>
            <div className="text-emerald-200 text-sm">Showers Saved</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {m.badges.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" /> Badges Earned
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {m.badges.map((b) => (
              <div key={b.name} className="p-4 bg-emerald-50 rounded-lg text-center">
                <div className="text-3xl mb-2">{b.icon}</div>
                <div className="font-semibold text-gray-900 text-sm">{b.name}</div>
                <div className="text-xs text-gray-500">{b.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Impact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Global EcoLoop Impact</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">{g.totalDevicesTracked}</div>
            <div className="text-xs text-gray-500">Devices Tracked</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">{g.estimatedCo2Saved} kg</div>
            <div className="text-xs text-gray-500">CO₂ Saved (Est.)</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">{Math.round(g.estimatedCo2Saved / 22)}</div>
            <div className="text-xs text-gray-500">Trees Equivalent</div>
          </div>
        </div>
      </div>
    </div>
  );
}
