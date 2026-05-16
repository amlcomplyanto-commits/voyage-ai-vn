import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { storage, Trip } from '../lib/storage';
import { TripPage } from './TripPage';
import { MapPin, Calendar, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function SharedTripPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataEncoded = searchParams.get('data');
    if (dataEncoded) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(decodeURIComponent(dataEncoded))));
        setTrip(decoded);
      } catch (err) {
        console.error(err);
        setError('Invalid or corrupted sharing link.');
      }
    } else {
      setError('No trip data found in this link.');
    }
  }, [searchParams]);

  const handleImportTrip = () => {
    if (!trip) return;
    try {
      const existing = storage.getTrips();
      // To avoid ID collisions, we could assign a new ID, but here we just append
      const newTrip = { ...trip, id: Date.now().toString() };
      storage.saveTrips([newTrip, ...existing]);
      navigate('/trip');
    } catch (e) {
      console.error(e);
      alert('Failed to save trip.');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-sm w-full">
          <div className="text-red-500 mb-4 flex justify-center">
            <MapPin size={48} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-500">{error}</p>
          <button 
            onClick={() => navigate('/trip')}
            className="mt-6 bg-brand-600 text-white font-bold py-3 px-6 rounded-xl w-full"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <Loader2 className="animate-spin text-brand-500 mb-4" size={32} />
        <p className="text-slate-500">Loading shared trip...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 pb-24">
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded-b-[32px] shadow-sm overflow-hidden mb-6 relative border-b border-slate-200">
          <div className="h-48 bg-slate-200 relative">
            <img 
              src={trip.coverImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"} 
              alt={trip.destination}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white text-center">
              <span className="bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block shadow-sm">SHARED ITINERARY</span>
              <h1 className="text-2xl font-black">{trip.destination}</h1>
            </div>
          </div>
          
          <div className="p-6 text-center bg-white">
            <p className="text-slate-600 mb-6 flex justify-center items-center gap-2 font-medium">
              <Calendar size={18} className="text-brand-500" />
              {format(new Date(trip.startDate), 'MMM d, yyyy')} — {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </p>

            <button 
              onClick={handleImportTrip}
              className="bg-brand-600 text-white w-full py-4 rounded-2xl font-bold shadow-lg shadow-brand-600/30 active:scale-95 transition-all text-lg flex justify-center items-center gap-3"
            >
              <Check size={24} /> Import to My Trips
            </button>
          </div>
        </div>

        <div className="px-6 space-y-4">
          <h2 className="font-black text-slate-800 text-xl tracking-tight mb-2">Itinerary Preview</h2>
          {trip.itinerary.map((day, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex justify-between items-center">
                <span>Day {i + 1}</span>
                <span className="text-slate-400 text-sm font-medium">{format(new Date(day.date), 'MMM d')}</span>
              </h3>
              <ul className="space-y-3">
                {day.activities.length === 0 && <li className="text-slate-400 text-sm">Free day</li>}
                {day.activities.map((act, j) => (
                  <li key={j} className="flex gap-3 text-sm">
                    <span className="font-mono text-brand-600 font-medium shrink-0 pt-0.5">{act.time || 'xx:xx'}</span>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(act.title + " " + (act.location || trip.destination))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-700 font-medium hover:text-brand-600 transition-colors"
                    >
                      {act.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
