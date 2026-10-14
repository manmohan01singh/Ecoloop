import { useState } from 'react';
import { Shield, Lock, FileText, Mail, Send, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card, Tabs, Badge } from '../components/ui';
import toast from 'react-hot-toast';

export default function LegalPage({ initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Your message has been received! Our support team will reply within 24 hours.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 600);
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'contact', label: 'Contact Support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <Badge variant="brand" size="md">TRUST & TRANSPARENCY</Badge>
          <h1 className="text-3xl font-black text-gray-900 font-display">
            Policies & Community Support
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Clear guidelines on data security, circular transactions, and user privacy.
          </p>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pill"
          className="mx-auto"
        />

        {activeTab === 'privacy' && (
          <Card variant="elevated" className="p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <Lock className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900 font-display">Privacy & Data Sanitization Policy</h2>
            </div>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                <strong>1. Data Sanitization Commitment:</strong> Before exchanging, donating, or recycling any device through Circuvio, users are provided with NIST 800-88 compliant instructions for permanent data destruction. Circuvio partners never access or harvest personal user files stored on hardware.
              </p>
              <p>
                <strong>2. Information Collection:</strong> We collect only necessary account data (name, email, city) to facilitate circular transactions, track environmental impact, and verify accredited recycling centers.
              </p>
              <p>
                <strong>3. No Sale of User Data:</strong> Circuvio does not sell, license, or monetize your personal profile data with third-party advertisers. Platform metrics are aggregated anonymously for public sustainability reporting.
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'terms' && (
          <Card variant="elevated" className="p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900 font-display">Terms of Service</h2>
            </div>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                <strong>1. Circular Commerce:</strong> Items listed on the Circuvio marketplace must be described accurately in terms of operational condition, battery health, and physical cosmetics. Stolen or disputed hardware is strictly prohibited.
              </p>
              <p>
                <strong>2. Repair Contracts:</strong> Repair quotes provided by technicians on Circuvio represent independent service agreements. Circuvio provides reputation scoring and ticket tracking to ensure accountability.
              </p>
              <p>
                <strong>3. Hazardous Materials:</strong> Hazardous e-waste (swollen lithium-ion batteries, broken CRT glass) must be deposited only at certified waste bank locations displaying the verified compliance badge.
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'contact' && (
          <Card variant="elevated" className="p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <Mail className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900 font-display">Contact Circuvio Team</h2>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. Budi Santoso"
                  required
                />
                <Input
                  label="Your Email *"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="budi@example.com"
                  required
                />
              </div>

              <Input
                label="Subject *"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="Inquiry / Partner Verification / Help"
                required
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Your Message *
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  required
                  placeholder="How can our circular team assist you today?"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" loading={sending} className="font-bold">
                <Send className="w-4 h-4 mr-2" /> Send Message to Team
              </Button>
            </form>
          </Card>
        )}

      </div>
    </div>
  );
}
