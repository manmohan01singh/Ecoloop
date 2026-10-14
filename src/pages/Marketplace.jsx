import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus, Search, MapPin, Package, X, Heart, Shield, CheckCircle2,
  Tag, Clock, Phone, Mail, MessageSquare, ArrowRight, Filter
} from 'lucide-react';
import { getListings, createListing, requestListing } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, Input, Modal, LoadingState, EmptyState, Badge, Card } from '../components/ui';

const CATEGORIES = [
  { id: '', label: 'All Items' },
  { id: 'electronics', label: 'Electronics & Phones' },
  { id: 'appliances', label: 'Home Appliances' },
  { id: 'plastic', label: 'Plastics & Polymers' },
  { id: 'metal', label: 'Metals & Cables' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'other', label: 'Other Parts' },
];

const ACTIONS = [
  { value: 'give_away', label: 'Give Away', emoji: '🎁', color: 'brand' },
  { value: 'sell', label: 'Sell', emoji: '💰', color: 'warning' },
  { value: 'donate', label: 'Donate', emoji: '❤️', color: 'error' },
  { value: 'repair', label: 'Repair Wanted', emoji: '🔧', color: 'orange' },
  { value: 'reuse', label: 'Reuse / Swap', emoji: '🔄', color: 'info' },
  { value: 'recycle', label: 'Recycle Scrap', emoji: '♻️', color: 'success' },
];

const CONDITIONS = [
  { value: 'like_new', label: 'Like New (Pristine)' },
  { value: 'good', label: 'Good (Minor wear)' },
  { value: 'fair', label: 'Fair (Functional)' },
  { value: 'poor', label: 'Needs Repair' },
  { value: 'for_parts', label: 'For Salvage / Parts Only' },
];

// ── Detail & Request Modal ──────────────────────────────────────────
function ListingDetailModal({ listing, isOpen, onClose, onRequestSuccess }) {
  const { isAuthenticated } = useAuthStore();
  const [requestMsg, setRequestMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  if (!listing) return null;

  const actionMeta = ACTIONS.find(x => x.value === listing.circularAction) || ACTIONS[0];

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please sign in to send requests');
      return;
    }
    setSending(true);
    try {
      await requestListing(listing.id, requestMsg);
      toast.success('Request sent to seller!');
      setShowRequestForm(false);
      setRequestMsg('');
      if (onRequestSuccess) onRequestSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={listing.title} size="lg">
      <div className="space-y-6">
        {/* Image Display */}
        <div className="h-64 sm:h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200">
          {listing.images?.[0] ? (
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Package className="w-12 h-12" />
              <span className="text-xs font-semibold">No photo uploaded</span>
            </div>
          )}
        </div>

        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={actionMeta.color} size="md">
                {actionMeta.emoji} {actionMeta.label}
              </Badge>
              <Badge variant="neutral" size="md">
                {listing.condition?.replace('_', ' ') || 'Good'}
              </Badge>
            </div>
            <p className="text-2xl font-black text-gray-900 font-display">
              {listing.isFree ? 'FREE OF CHARGE' : `Rp ${Number(listing.price || 0).toLocaleString('id-ID')}`}
            </p>
          </div>

          <div className="text-right text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-gray-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{listing.city || 'Indonesia'}</span>
            </div>
            <span>Quantity: {listing.quantity || 1} {listing.unit || 'pcs'}</span>
          </div>
        </div>

        {/* Seller Info */}
        {listing.user && (
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200 overflow-hidden">
                {listing.user.avatar ? (
                  <img src={listing.user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  (listing.user.name?.[0] || 'U').toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{listing.user.name}</p>
                <p className="text-[11px] text-emerald-700 font-semibold">@{listing.user.username || 'user'}</p>
              </div>
            </div>
            {listing.user.username && (
              <Link
                to={`/u/${listing.user.username}`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs"
              >
                View Profile
              </Link>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Item Condition & Details</h4>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {listing.description || 'No detailed description provided by the seller.'}
          </p>
        </div>

        {/* Request Action Form */}
        {showRequestForm ? (
          <form onSubmit={handleSendRequest} className="space-y-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              Send Message to Owner
            </h4>
            <textarea
              value={requestMsg}
              onChange={(e) => setRequestMsg(e.target.value)}
              placeholder="Hi! I am interested in this item. Is it still available for pickup?"
              rows={3}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="md" loading={sending}>
                Send Message
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setShowRequestForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setShowRequestForm(true)}
              className="font-bold shadow-md shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Request This Item / Contact Owner
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Create Listing Modal ────────────────────────────────────────────
function CreateListingModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'electronics', condition: 'good',
    quantity: 1, unit: 'pcs', city: '', circularAction: 'give_away',
    isFree: true, price: 0
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createListing({ ...form, price: form.isFree ? 0 : form.price });
      toast.success('Circular listing published!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to publish listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Circular Listing" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Headline *"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Dell UltraSharp 27 Monitor - Working Screen"
          required
        />

        {/* Circular Action Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Intended Circular Action *
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ACTIONS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => set('circularAction', a.value)}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  form.circularAction === a.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl mb-1">{a.emoji}</span>
                <span className="text-[11px] leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.filter(c => c.id).map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => set('condition', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CONDITIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Location (City)"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="e.g. Jakarta Selatan"
            required
          />
          <Input
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
            min={1}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Details & Condition Notes</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Specify working condition, included cables/chargers, or pickup instructions..."
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            required
          />
        </div>

        {/* Price / Free Toggle */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => set('isFree', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span className="text-sm font-bold text-gray-800">Mark as Free / Giveaway (Rp 0)</span>
          </label>

          {!form.isFree && (
            <div className="flex items-center gap-2 max-w-xs">
              <span className="text-xs font-bold text-gray-500">Rp</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                min={0}
                placeholder="Amount in IDR"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={saving}>
          Publish to Community
        </Button>
      </form>
    </Modal>
  );
}

// ── Main Marketplace Component ──────────────────────────────────────
export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: searchParams.get('category') || '',
    circularAction: searchParams.get('circularAction') || '',
    city: '',
    isFree: '',
  });

  const { isAuthenticated } = useAuthStore();

  const fetchListings = async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.circularAction) params.circularAction = f.circularAction;
      if (f.city) params.city = f.city;
      if (f.isFree !== '') params.isFree = f.isFree;
      const res = await getListings(params);
      setListings(res.data.data.items || []);
    } catch {
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER & ACTIONS ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
            Circular E-Waste Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Buy, sell, donate, or rescue working gadgets and salvage components.
          </p>
        </div>

        {isAuthenticated() && (
          <Button
            onClick={() => setShowCreate(true)}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            className="font-bold shadow-md shadow-emerald-600/20"
          >
            Create New Listing
          </Button>
        )}
      </div>

      {/* ── FILTER & SEARCH BAR ───────────────────────────── */}
      <Card variant="flat" className="p-4 space-y-3 bg-white">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
              placeholder="Search by keywords (e.g. laptop, iPhone, monitor, copper)..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.circularAction}
              onChange={(e) => {
                const next = { ...filters, circularAction: e.target.value };
                setFilters(next);
                fetchListings(next);
              }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Circular Actions</option>
              {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.emoji} {a.label}</option>)}
            </select>

            <select
              value={filters.category}
              onChange={(e) => {
                const next = { ...filters, category: e.target.value };
                setFilters(next);
                fetchListings(next);
              }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>

            <select
              value={filters.isFree}
              onChange={(e) => {
                const next = { ...filters, isFree: e.target.value };
                setFilters(next);
                fetchListings(next);
              }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Prices</option>
              <option value="true">Free Only</option>
              <option value="false">Paid Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── LISTINGS GRID ─────────────────────────────────── */}
      {loading ? (
        <LoadingState size="lg" />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No circular listings found"
          description="Try broadening your search criteria or publish the first item to seed the marketplace."
          action={isAuthenticated() ? {
            label: 'Publish Listing',
            onClick: () => setShowCreate(true),
            icon: Plus
          } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((l) => {
            const actionMeta = ACTIONS.find(x => x.value === l.circularAction) || ACTIONS[0];

            return (
              <div
                key={l.id}
                onClick={() => setSelectedListing(l)}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                <div>
                  {/* Item Image Thumbnail */}
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
                    {l.images?.[0] ? (
                      <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="w-10 h-10 text-gray-400 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={actionMeta.color} size="sm">
                        {actionMeta.emoji} {actionMeta.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {l.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{l.city || 'Indonesia'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className={`text-sm font-black font-display ${l.isFree ? 'text-emerald-700' : 'text-gray-900'}`}>
                    {l.isFree ? 'FREE' : `Rp ${Number(l.price || 0).toLocaleString('id-ID')}`}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODALS ────────────────────────────────────────── */}
      <CreateListingModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => fetchListings()}
      />

      <ListingDetailModal
        listing={selectedListing}
        isOpen={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        onRequestSuccess={() => fetchListings()}
      />
    </div>
  );
}
