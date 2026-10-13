import { useState, useEffect, useMemo } from 'react';
import {
  Calendar, MapPin, Users, Clock, CheckCircle, Search, Filter,
  Sparkles, Building2, Target, ArrowRight, Share2, AlertCircle
} from 'lucide-react';
import { getEvents, joinEvent, leaveEvent } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, Badge, Card, StatCard, EmptyState, LoadingState, Modal } from '../components/ui';

const TYPE_EMOJI = {
  cleanup: '🧹', repair_workshop: '🔧', collection_drive: '📦',
  swap_event: '🔄', donation_drive: '❤️', upcycling_workshop: '✨', other: '🎯',
};

const TYPE_LABEL = {
  cleanup: 'Cleanup Drive',
  repair_workshop: 'Repair Workshop',
  collection_drive: 'Collection Drive',
  swap_event: 'Swap Event',
  donation_drive: 'Donation Drive',
  upcycling_workshop: 'Upcycling Workshop',
  other: 'Civic Event',
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchEvents = () => {
    getEvents()
      .then(r => setEvents(r.data.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleJoin = async (id) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to RSVP for events');
      return;
    }
    setActionLoading(true);
    try {
      await joinEvent(id);
      toast.success('RSVP confirmed! See you at the event.');
      setEvents(es => es.map(e => e.id === id ? { ...e, isJoined: true, participantCount: (e.participantCount || 0) + 1 } : e));
      if (selectedEvent?.id === id) {
        setSelectedEvent(e => ({ ...e, isJoined: true, participantCount: (e.participantCount || 0) + 1 }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to RSVP');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async (id) => {
    setActionLoading(true);
    try {
      await leaveEvent(id);
      toast.success('RSVP cancelled');
      setEvents(es => es.map(e => e.id === id ? { ...e, isJoined: false, participantCount: Math.max(0, (e.participantCount || 0) - 1) } : e));
      if (selectedEvent?.id === id) {
        setSelectedEvent(e => ({ ...e, isJoined: false, participantCount: Math.max(0, (e.participantCount || 0) - 1) }));
      }
    } catch {
      toast.error('Failed to cancel RSVP');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchType = activeType === 'all' || e.type === activeType;
      const matchSearch = !searchQuery ||
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.city?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [events, activeType, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter(e => e.status === 'upcoming').length;
    const participants = events.reduce((sum, e) => sum + (e.participantCount || 0), 0);
    const cities = new Set(events.map(e => e.city).filter(Boolean)).size || 12;
    return { total, upcoming, participants, cities };
  }, [events]);

  if (loading) return <LoadingState size="lg" fullPage />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              Circular Events & Workshops
            </h1>
            <Badge variant="brand" size="sm">Community Action</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Join local e-waste collection drives, fixit workshops, and circular equipment swaps.
          </p>
        </div>
      </div>

      {/* ── KPI STATS ROW ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Upcoming Gatherings"
          value={stats.upcoming}
          icon={Calendar}
          color="emerald"
          caption={`${stats.total} total nationwide events scheduled`}
        />
        <StatCard
          label="Community Volunteers"
          value={stats.participants.toLocaleString()}
          icon={Users}
          color="teal"
          caption="Active citizen turnouts registered"
        />
        <StatCard
          label="Cities & Regions"
          value={stats.cities}
          icon={MapPin}
          color="blue"
          caption="Greater Jakarta, Surabaya, Bandung, Bali"
        />
        <StatCard
          label="Hands-on Repair Hubs"
          value="100% Free"
          icon={Target}
          color="amber"
          caption="Open to all registered community members"
        />
      </div>

      {/* ── FILTER & SEARCH BAR ───────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeType === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Events ({events.length})
            </button>
            {Object.entries(TYPE_LABEL).slice(0, 4).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setActiveType(k)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeType === k
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {TYPE_EMOJI[k]} {label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city, workshop, drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── EVENTS GRID ───────────────────────────────────── */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={events.length === 0 ? "No circular events scheduled" : "No events match filters"}
          description={
            events.length === 0
              ? "Certified organizations host weekly electronic drop-offs and fix-it workshops. Check back shortly!"
              : "Try switching category filters or clearing your search term."
          }
          action={events.length > 0 ? {
            label: 'Reset Filters',
            onClick: () => { setActiveType('all'); setSearchQuery(''); },
            variant: 'secondary'
          } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map(ev => {
            const dateStr = new Date(ev.startDate).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            });
            const timeStr = new Date(ev.startDate).toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit'
            });

            return (
              <div
                key={ev.id}
                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Graphic Header */}
                  <div className="h-28 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-between px-6 border-b border-gray-100">
                    <span className="text-4xl filter drop-shadow-sm">{TYPE_EMOJI[ev.type] || '🎯'}</span>
                    <Badge variant={ev.status === 'upcoming' ? 'brand' : 'default'} size="sm">
                      {ev.status === 'upcoming' ? 'Open RSVP' : ev.status}
                    </Badge>
                  </div>

                  <div className="p-5 pb-3">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                      {TYPE_LABEL[ev.type] || 'Event'}
                    </span>

                    <h3 className="font-bold text-gray-900 mb-1.5 text-base font-display leading-snug">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {ev.description}
                    </p>

                    {/* Quick Specs */}
                    <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">{dateStr} · {timeStr}</span>
                      </div>
                      {ev.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span>{ev.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{ev.participantCount || 0}{ev.capacity ? ` / ${ev.capacity}` : ''} RSVPs</span>
                      </div>
                      {ev.creator && (
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60 text-[11px] text-gray-500">
                          <Building2 className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                          <span>Hosted by {ev.creator.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-5 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full text-xs"
                    >
                      Details
                    </Button>

                    {ev.isJoined ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLeave(ev.id)}
                        disabled={actionLoading}
                        icon={CheckCircle}
                        className="w-full bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        Registered
                      </Button>
                    ) : ev.status !== 'cancelled' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleJoin(ev.id)}
                        disabled={actionLoading}
                        className="w-full text-xs font-bold"
                      >
                        RSVP Free
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="w-full text-xs"
                      >
                        Cancelled
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EVENT DETAILS MODAL ────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Event Details'}
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {TYPE_LABEL[selectedEvent.type] || 'Event'}
              </span>
              <span className="text-xs text-gray-500">
                {selectedEvent.participantCount || 0} RSVPs confirmed
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedEvent.description}
            </p>

            {selectedEvent.goalDescription && (
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium border border-emerald-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Goal: {selectedEvent.goalDescription}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200/80">
              <div>
                <span className="text-gray-400 block mb-0.5">Date & Time</span>
                <span className="font-bold text-gray-900">
                  {new Date(selectedEvent.startDate).toLocaleDateString()} at {new Date(selectedEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Location</span>
                <span className="font-bold text-gray-900">
                  {selectedEvent.city || 'Greater Jakarta'}
                </span>
              </div>
              {selectedEvent.creator && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-400 block mb-0.5">Organizing Entity</span>
                  <span className="font-semibold text-gray-900">{selectedEvent.creator.name}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              {selectedEvent.isJoined ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    You are registered for this event. Directions and reminders will be sent to your account email.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLeave(selectedEvent.id)}
                    disabled={actionLoading}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 text-xs"
                  >
                    Cancel My Registration
                  </Button>
                </div>
              ) : selectedEvent.status !== 'cancelled' ? (
                <Button
                  onClick={() => handleJoin(selectedEvent.id)}
                  disabled={actionLoading}
                  loading={actionLoading}
                  size="lg"
                  className="w-full font-bold shadow-md shadow-emerald-600/20"
                >
                  Confirm Free RSVP
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
