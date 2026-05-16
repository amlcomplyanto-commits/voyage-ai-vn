import React, { useState } from 'react';
import { MapPin, Navigation, Compass, X, Home } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useNavigate } from 'react-router-dom';

export function MapContent() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [searchQuery, setSearchQuery] = useState("Restaurants");
  const { t } = useI18n();

  // Use a generic embed if no key.
  const mapUrl = apiKey 
    ? `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(searchQuery + ' in Vietnam')}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery + ' in Vietnam')}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="flex-1 relative w-full h-full min-h-[400px]">
      <iframe
        title="Google Maps"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        className="absolute inset-0"
      />
      
      {/* Quick Search Pills */}
      <div className="absolute top-4 left-0 right-0 z-10 flex justify-center px-4 pointer-events-none">
         <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 max-w-5xl w-full pointer-events-auto items-center">
            <button onClick={() => setSearchQuery("Circle K or Convenience Store")} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold shadow-md transition-colors border ${searchQuery.includes("Circle K") ? "bg-brand-600 text-white border-brand-700" : "bg-white text-slate-700 border-slate-200"}`}>
               🏪 {t('Convenience Stores', 'Cửa hàng tiện lợi', 'Magazine universale')}
            </button>
            <button onClick={() => setSearchQuery("ATMs or Money Exchange")} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold shadow-md transition-colors border ${searchQuery.includes("ATMs") ? "bg-brand-600 text-white border-brand-700" : "bg-white text-slate-700 border-slate-200"}`}>
               💳 {t('ATMs & Exchange', 'ATM & Đổi tiền', 'Bancuri și Schimb Valutar')}
            </button>
            <button onClick={() => setSearchQuery("Pharmacies or Hospitals")} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold shadow-md transition-colors border ${searchQuery.includes("Pharmacies") ? "bg-brand-600 text-white border-brand-700" : "bg-white text-slate-700 border-slate-200"}`}>
               💊 {t('Pharmacies & Hospitals', 'Nhà thuốc & Bệnh viện', 'Farmacii și Spitale')}
            </button>
            <button onClick={() => setSearchQuery("Pho or Street Food or Coffee")} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold shadow-md transition-colors border ${searchQuery.includes("Pho") ? "bg-brand-600 text-white border-brand-700" : "bg-white text-slate-700 border-slate-200"}`}>
               🍜 {t('Phở, Food & Coffee', 'Phở, Đồ ăn & Cà phê', 'Phở, Mâncare și Cafea')}
            </button>
         </div>
      </div>

      {/* Floating Actions overlay */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none z-10">
          <div className="flex justify-between max-w-5xl w-full pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button className="bg-white text-slate-800 p-3 rounded-full shadow-lg border border-slate-100 flex items-center justify-center w-12 h-12 hover:bg-slate-50 transition-colors">
                 <Compass size={20} />
              </button>
              <button className="bg-white text-slate-800 p-3 rounded-full shadow-lg border border-slate-100 flex items-center justify-center w-12 h-12 hover:bg-slate-50 transition-colors">
                 <MapPin size={20} />
              </button>
            </div>
            
             <div className="flex flex-col gap-2 pointer-events-auto items-end">
               {/* Buttons removed and moved to TripPage */}
            </div>
          </div>
        </div>
    </div>
  );
}

export function MapPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen bg-slate-50 pt-safe font-sans relative pb-16">
      <div className="flex items-center justify-center p-4 bg-white border-b border-slate-100 shadow-sm shrink-0 z-10 relative">
        <button onClick={() => navigate('/')} className="absolute left-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" title="Home">
          <Home size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900">{t('Map & Navigation', 'Bản đồ & Điều hướng', 'Hartă și Navigație')}</h1>
      </div>
      <MapContent />
    </div>
  );
}

// Just mocking a message circle locally if not imported
function MessageCircle({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  );
}
