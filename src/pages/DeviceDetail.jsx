import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, Laptop, Monitor, Cpu, Clock, Calendar, Activity, Sparkles, Loader2, CheckCircle, Info } from 'lucide-react';
import { getDevice, getAIRecommendations } from '../services/deviceService';

const ICONS = { smartphone: Smartphone, laptop: Laptop, tv: Monitor, computer: Cpu, printer: Cpu, tablet: Smartphone, other: Cpu };
const STATUS_CONFIG = {
  excellent: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Excellent' },
  healthy: { bg: 'bg-green-100', text: 'text-green-700', label: 'Healthy' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Warning' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
  dead: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'End of Life' },
};

export default function DeviceDetail() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [dc, setDc] = useState(null);
  const [aiRec, setAiRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    getDevice(id).then((res) => {
      setDevice(res.data.data.device);
      setDc(res.data.data.deathClock);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const fetchAI = async () => {
    setLoadingAI(true);
    try {
      const res = await getAIRecommendations(id);
      setAiRec(res.data.data);
    } catch { setAiRec(null); }
    finally { setLoadingAI(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  if (!device) return <div className="flex items-center justify-center py-20 text-gray-500">Device not found</div>;

  const Icon = ICONS[device.category] || Smartphone;
  const sc = STATUS_CONFIG[dc.status] || STATUS_CONFIG.warning;
  const ringColor = dc.healthScore >= 80 ? '#10b981' : dc.healthScore >= 60 ? '#22c55e' : dc.healthScore >= 40 ? '#f59e0b' : dc.healthScore >= 20 ? '#ef4444' : '#6b7280';

  return (
    <div className="p-6 lg:p-8">
      <Link to="/devices" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Devices
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Icon className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
            <p className="text-gray-500">{device.brand} {device.model} · {device.category}</p>
          </div>
          <div className={`ml-auto px-3 py-1.5 rounded-full text-sm font-medium ${sc.bg} ${sc.text}`}>{sc.label}</div>
        </div>

        {/* Death Clock Ring */}
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative w-44 h-44 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="7" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={ringColor} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(dc.healthScore/100) * 264} 264`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">{dc.healthScore}%</span>
              <span className="text-xs text-gray-500">Health Score</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            <div className="p-4 bg-emerald-50 rounded-lg text-center">
              <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-emerald-700">{dc.remainingDays}</div>
              <div className="text-xs text-gray-500">Days Remaining</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-green-700">{dc.deathDate}</div>
              <div className="text-xs text-gray-500">Predicted Death Date</div>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg text-center">
              <Activity className="w-5 h-5 text-teal-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-teal-700">{dc.ageInYears} yrs</div>
              <div className="text-xs text-gray-500">Device Age</div>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg text-center">
              <Info className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-cyan-700">{dc.adjustedLifespan} yrs</div>
              <div className="text-xs text-gray-500">Adjusted Lifespan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Factors Affecting Lifespan</h2>
        <div className="space-y-3">
          {dc.factors.map((f) => (
            <div key={f.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">{f.name}</div>
                <div className="text-xs text-gray-500">{f.description}</div>
              </div>
              <div className={`text-sm font-bold ${f.impact > 0 ? 'text-emerald-600' : f.impact < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {f.impact > 0 ? '+' : ''}{f.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
        <div className="space-y-2">
          {dc.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-lg font-semibold">AI Recycling Recommendations</h2>
        </div>
        {aiRec ? (
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
            {aiRec.recommendations}
          </div>
        ) : (
          <button onClick={fetchAI} disabled={loadingAI}
            className="px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2 disabled:opacity-50">
            {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loadingAI ? 'Analyzing...' : 'Get AI Recommendations'}
          </button>
        )}
        {aiRec && <p className="text-xs text-emerald-200 mt-2">Powered by Gemini AI ({aiRec.model})</p>}
      </div>
    </div>
  );
}
