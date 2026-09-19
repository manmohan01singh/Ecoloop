import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Loader2, CheckCircle, Plus } from 'lucide-react';
import { getEvents, joinEvent, leaveEvent } from '../services/communityService';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const TYPE_EMOJI = {
  cleanup: '🧹', repair_workshop: '🔧', collection_drive: '📦',
  swap_event: '🔄', donation_drive: '❤️', upcycling_workshop: '✨', other: '🎯',
};
const TYPE_LABEL = {
  cleanup: 'Bersih-bersih', repair_workshop: 'Workshop Servis',
  collection_drive: 'Pengumpulan', swap_event: 'Swap',
  donation_drive: 'Donasi', upcycling_workshop: 'Upcycling', other: 'Lainnya',
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    getEvents().then(r => setEvents(r.data.data.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id) => {
    if (!isAuthenticated()) { toast.error('Login terlebih dahulu'); return; }
    try {
      await joinEvent(id);
      toast.success('Berhasil bergabung!');
      setEvents(es => es.map(e => e.id === id ? { ...e, isJoined: true, participantCount: e.participantCount + 1 } : e));
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Gagal'); }
  };

  const handleLeave = async (id) => {
    try {
      await leaveEvent(id);
      toast.success('Keluar dari event');
      setEvents(es => es.map(e => e.id === id ? { ...e, isJoined: false, participantCount: Math.max(0, e.participantCount - 1) } : e));
    } catch { toast.error('Gagal keluar'); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event</h1>
          <p className="text-gray-500 text-sm mt-1">Workshop, cleanup, swap, dan event sirkular lainnya</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(ev => (
          <div key={ev.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
            <div className="h-28 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
              <span className="text-5xl">{TYPE_EMOJI[ev.type] || '🎯'}</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  {TYPE_LABEL[ev.type] || 'Event'}
                </span>
                {ev.status === 'upcoming' && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Segera</span>}
              </div>

              <h3 className="font-bold text-gray-900 mb-2 leading-snug">{ev.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ev.description}</p>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {new Date(ev.startDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {new Date(ev.startDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </div>
                {ev.city && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />{ev.city}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  {ev.participantCount}{ev.capacity ? `/${ev.capacity}` : ''} peserta
                </div>
              </div>

              {ev.goalDescription && (
                <div className="mb-4 p-2.5 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                  🎯 {ev.goalDescription}
                </div>
              )}

              {ev.isJoined ? (
                <button onClick={() => handleLeave(ev.id)}
                  className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl text-sm border border-emerald-200 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Sudah Bergabung
                </button>
              ) : ev.status !== 'cancelled' ? (
                <button onClick={() => handleJoin(ev.id)}
                  className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl text-sm hover:bg-emerald-700 transition-colors">
                  Ikut Event
                </button>
              ) : (
                <span className="block w-full py-2.5 bg-gray-100 text-gray-500 text-center font-medium rounded-xl text-sm">
                  Dibatalkan
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada event mendatang</p>
        </div>
      )}
    </div>
  );
}
