import { Link } from 'react-router-dom';
import { Leaf, Shield, Globe, Award, Users, ArrowRight, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="brand" size="md">OUR ENVIRONMENTAL MISSION</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 font-display">
            Pioneering Indonesia's Circular Tech Future
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Circuvio was created to solve Indonesia's growing electronic waste challenge by connecting citizens, certified repair technicians, licensed recyclers, and enterprises into one transparent, verifiable ecosystem.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid sm:grid-cols-3 gap-6">
          <Card variant="elevated" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg font-display">Zero Landfill Goal</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Diverting toxic heavy metals (lead, cadmium, mercury) and lithium batteries away from public municipal landfills through certified recovery streams.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg font-display">Right to Repair</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Empowering local technicians and device owners with diagnostic transparency, parts sourcing, and fair-value repair contracts.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg font-display">Verifiable ESG Impact</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Measuring real carbon emissions saved and issuing certified destruction and reuse receipts compliant with international standards.
            </p>
          </Card>
        </div>

        {/* Story Section */}
        <Card variant="elevated" className="p-8 sm:p-10 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">The Circuvio Architecture</h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              In Indonesia, thousands of metric tons of consumer electronics and industrial hardware reach their perceived end-of-life each year without a coordinated recovery framework. Valued components and rare earth minerals often sit forgotten in household storage or end up incinerated in unsafe informal scrap yards.
            </p>
            <p>
              Circuvio bridges this divide. Through our <strong>AI Death Clock</strong>, citizens receive predictive guidance on when to service or sell their electronics before irreparable damage occurs. Through our <strong>Resource Map</strong>, anyone can find nearby drop-off bins and waste banks across 38 provinces.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Developed by Team Jai Mahakaal · Grand Finale Innovation</span>
            </div>
            <Link to="/register">
              <Button variant="primary" size="md">Join The Platform →</Button>
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}
